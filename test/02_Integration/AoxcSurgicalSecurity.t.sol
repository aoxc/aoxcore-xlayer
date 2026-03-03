// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import {Test} from "forge-std/Test.sol";
import "aoxc/core/AoxcRegistry.sol";
import "aoxc/access/AoxcSentinel.sol";
import "aoxc-interfaces/IAoxcRegistry.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {AccessManager} from "@openzeppelin/contracts/access/manager/AccessManager.sol";

/**
 * @title Integration_AOX_Surgical_Security
 * @author AOXCore Security Architecture
 * @notice Global Audit Standard: Atomic verification of Registry-Sentinel security synchronization.
 */
contract Integration_AOX_Surgical_Security is Test {
    AoxcRegistry public registry;
    AoxcSentinel public sentinel;
    AccessManager public manager;

    address public admin = makeAddr("PROTOCOL_ADMIN");
    address public aiNode = makeAddr("NEURAL_AI_NODE");
    address public userA = makeAddr("CITIZEN_ALPHA");
    address public userB = makeAddr("CITIZEN_BETA");

    uint64 public constant ROLE_ADMIN = 1;
    uint64 public constant ROLE_SENTINEL_SELF = 2;

    function setUp() public {
        // Set realistic timestamp for heartbeat logic
        vm.warp(1740945600);

        vm.startPrank(admin);
        manager = new AccessManager(admin);

        // 1. Deploy Modules via UUPS Proxy
        AoxcRegistry regImpl = new AoxcRegistry();
        registry = AoxcRegistry(
            address(
                new ERC1967Proxy(address(regImpl), abi.encodeCall(AoxcRegistry.initializeRegistry, (address(manager))))
            )
        );

        AoxcSentinel sentImpl = new AoxcSentinel();
        sentinel = AoxcSentinel(
            address(
                new ERC1967Proxy(
                    address(sentImpl),
                    abi.encodeCall(AoxcSentinel.initialize, (address(manager), aiNode, address(0), address(registry)))
                )
            )
        );

        // 2. Surgical RBAC Mapping
        manager.grantRole(ROLE_ADMIN, admin, 0);
        manager.grantRole(ROLE_SENTINEL_SELF, address(sentinel), 0);

        // Map IAoxcRegistry functions to ROLE_ADMIN
        bytes4[] memory regSelectors = new bytes4[](3);
        regSelectors[0] = IAoxcRegistry.onboardMember.selector;
        regSelectors[1] = IAoxcRegistry.adjustReputation.selector;
        regSelectors[2] = IAoxcRegistry.triggerCellLockdown.selector;
        manager.setTargetFunctionRole(address(registry), regSelectors, ROLE_ADMIN);

        // Map Sentinel internal pause to itself
        bytes4[] memory sentSelectors = new bytes4[](1);
        sentSelectors[0] = 0x8456d592; // pause() selector
        manager.setTargetFunctionRole(address(sentinel), sentSelectors, ROLE_SENTINEL_SELF);

        vm.label(address(registry), "BRAIN_REGISTRY");
        vm.label(address(sentinel), "POLICE_SENTINEL");
        vm.label(address(manager), "ACCESS_MANAGER");

        vm.stopPrank();
    }

    /**
     * @notice [INT-01] Reputation propagation to Sentinel permissions.
     */
    function test_Integration_Reputation_Revocation() public {
        vm.startPrank(admin);
        registry.onboardMember(userA);
        registry.onboardMember(userB);

        assertTrue(sentinel.isAllowed(userA, userB), "Initial check failed");

        registry.adjustReputation(userA, -85);
        vm.stopPrank();

        assertFalse(sentinel.isAllowed(userA, userB), "Sentinel failed to block low reputation");
    }

    /**
     * @notice [INT-02] Cellular Lockdown verification.
     * @dev Ensures the Admin can isolate cells and Sentinel respects the state.
     */
    function test_Integration_Cellular_Lockdown_Propagation() public {
        vm.startPrank(admin);
        registry.onboardMember(userA);
        registry.onboardMember(userB);

        // Fetch User A's cell ID through the explicit Interface
        uint256 cellId = IAoxcRegistry(address(registry)).userToCellMap(userA);
        require(cellId != 0, "Member must belong to a valid cell");

        // Action: Lock the specific neural cell
        registry.triggerCellLockdown(cellId, true);
        vm.stopPrank();

        // Sentinel should now block userA as they belong to a locked cell
        assertFalse(sentinel.isAllowed(userA, userB), "Sentinel failed to enforce cellular lockdown");
    }

    /**
     * @notice [INT-03] Autonomous Neural Pulse Fail-Safe.
     */
    function test_Integration_Autonomous_Pulse_Timeout() public {
        vm.startPrank(admin);
        registry.onboardMember(userA);
        registry.onboardMember(userB);
        vm.stopPrank();

        // Warp 2 hours forward (Heartbeat limit is 1 hour)
        vm.warp(block.timestamp + 2 hours);

        assertFalse(sentinel.isAllowed(userA, userB), "Sentinel failed to block after pulse timeout");
    }
}
