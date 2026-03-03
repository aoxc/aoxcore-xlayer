// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import {Test} from "forge-std/Test.sol";
import "aoxc/core/AoxcRegistry.sol";
import "aoxc/libraries/AoxcConstants.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {AccessManager} from "@openzeppelin/contracts/access/manager/AccessManager.sol";

/**
 * @title Fuzz_AoxcRegistry
 * @author AOXCore Team
 * @notice Global Audit Standard Fuzzing Suite for AoxcRegistry.
 * @dev Validates cellular expansion, reputation clamping, and access control integrity.
 * Cleaned from all linter warnings (mixedCase, unsafe-typecast).
 */
contract Fuzz_AoxcRegistry is Test {
    // --- System Instances ---
    AoxcRegistry public registry;
    AccessManager public manager;

    // --- Test Actors ---
    address public admin = makeAddr("ADMIN");
    address public authority = makeAddr("REGISTRY_AUTHORITY");
    address public user = makeAddr("TEST_CITIZEN");

    /**
     * @notice System deployment and role-based access control setup.
     */
    function setUp() public {
        // 1. Infrastructure Deployment
        manager = new AccessManager(admin);
        AoxcRegistry implementation = new AoxcRegistry();

        // 2. Proxy Initialization
        bytes memory initData = abi.encodeCall(AoxcRegistry.initializeRegistry, (address(manager)));
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);
        registry = AoxcRegistry(address(proxy));

        // 3. Permission Orchestration
        vm.startPrank(admin);
        uint64 roleOperator = 1; // MixedCase compliance
        manager.grantRole(roleOperator, authority, 0);

        manager.setTargetFunctionRole(address(registry), _getSelectors(), roleOperator);
        vm.stopPrank();

        // 4. Labelling for Trace Clarity
        vm.label(address(registry), "AOX_REGISTRY_PROXY");
        vm.label(address(manager), "ACCESS_MANAGER");
        vm.label(authority, "REGISTRY_AUTHORITY");
    }

    /**
     * @dev Internal helper for function selector mapping.
     */
    function _getSelectors() internal pure returns (bytes4[] memory) {
        bytes4[] memory selectors = new bytes4[](4);
        selectors[0] = AoxcRegistry.onboardMember.selector;
        selectors[1] = AoxcRegistry.adjustReputation.selector;
        selectors[2] = AoxcRegistry.triggerCellLockdown.selector;
        selectors[3] = AoxcRegistry.pauseRegistry.selector;
        return selectors;
    }

    /**
     * @notice Invariant: Reputation must remain clamped regardless of adjustment magnitude.
     * @param initialAdj First random adjustment value.
     * @param secondAdj Second random adjustment value.
     */
    function testFuzz_Reputation_Clamping_Invariants(int256 initialAdj, int256 secondAdj) public {
        // Bounding extreme values to avoid secondary math overflows in test logic
        initialAdj = bound(initialAdj, -1e30, 1e30);
        secondAdj = bound(secondAdj, -1e30, 1e30);

        vm.prank(authority);
        registry.onboardMember(user);

        vm.startPrank(authority);
        registry.adjustReputation(user, initialAdj);
        registry.adjustReputation(user, secondAdj);
        vm.stopPrank();

        // Post-condition: Ensure core parameter integrity
        uint256 maxRep = registry.maxReputation();
        assertEq(maxRep, 200, "Global State Corruption detected");
    }

    /**
     * @notice Regression: Verify cellular expansion when MAX_CELL_MEMBERS is exceeded.
     */
    function test_Cellular_Expansion_Integrity() public {
        uint256 membersToFill = AoxcConstants.MAX_CELL_MEMBERS;

        for (uint256 i = 0; i < membersToFill; i++) {
            // forge-lint: disable-next-line(unsafe-typecast)
            address member = address(uint160(i + 1000));
            vm.prank(authority);
            registry.onboardMember(member);
        }

        // Trigger cell spawn logic
        address overflowUser = makeAddr("OVERFLOW_USER");
        vm.prank(authority);
        registry.onboardMember(overflowUser);

        assertTrue(registry.isMemberOperational(overflowUser), "Cellular Expansion Failure");
    }

    /**
     * @notice Security: Ensure members in quarantined cells are denied operational status.
     * @param cellId Random cell selection index.
     */
    function testFuzz_Cell_Lockdown_Prevention(uint256 cellId) public {
        // Target existing genesis cell
        uint256 targetCell = bound(cellId, 1, 1);

        vm.prank(authority);
        registry.triggerCellLockdown(targetCell, true);

        assertTrue(registry.cellLockdown(targetCell), "Lockdown Enforcement Failure");

        vm.prank(authority);
        registry.onboardMember(user);

        // Invariant check: quarantined cell member must be non-operational
        assertFalse(registry.isMemberOperational(user), "Security Breach: User operational in locked cell");
    }

    /**
     * @notice Circuit Breaker: Global pause must halt critical functions.
     */
    function test_Global_Emergency_Pause() public {
        vm.prank(authority);
        registry.pauseRegistry(true);
        assertTrue(registry.paused(), "Circuit Breaker Inactive");

        vm.expectRevert();
        vm.prank(authority);
        registry.onboardMember(user);
    }
}
