// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import {Test} from "forge-std/Test.sol";
import "aoxc/core/AoxcRegistry.sol";
import "aoxc/abstract/AoxcStorage.sol";
import "aoxc/libraries/AoxcConstants.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {AccessManager} from "@openzeppelin/contracts/access/manager/AccessManager.sol";

/**
 * @title Unit_AoxcRegistry
 * @notice Global Audit Standard Unit Test Suite.
 * @dev High-coverage tests focusing on access control, edge cases, and cellular logic.
 */
contract Unit_AoxcRegistry is Test, AoxcStorage {
    AoxcRegistry public registry;
    AccessManager public manager;

    address public admin = makeAddr("ADMIN");
    address public operator = makeAddr("OPERATOR");
    address public user1 = makeAddr("USER_1");
    address public user2 = makeAddr("USER_2");

    // Fixed: Constant naming convention followed (SCREAMING_SNAKE_CASE)
    uint64 public constant ROLE_OPERATOR = 1;

    function setUp() public {
        manager = new AccessManager(admin);
        AoxcRegistry implementation = new AoxcRegistry();

        bytes memory initData = abi.encodeCall(AoxcRegistry.initializeRegistry, (address(manager)));
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);
        registry = AoxcRegistry(address(proxy));

        vm.startPrank(admin);
        manager.grantRole(ROLE_OPERATOR, operator, 0);

        // Defined 4 selectors authorized for the operator role
        bytes4[] memory selectors = new bytes4[](4);
        selectors[0] = AoxcRegistry.onboardMember.selector;
        selectors[1] = AoxcRegistry.adjustReputation.selector;
        selectors[2] = AoxcRegistry.triggerCellLockdown.selector;
        selectors[3] = AoxcRegistry.pauseRegistry.selector;

        manager.setTargetFunctionRole(address(registry), selectors, ROLE_OPERATOR);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                        ACCESS CONTROL TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Audit_AccessControl_RestrictedFunctions() public {
        vm.startPrank(user2);

        vm.expectRevert();
        registry.onboardMember(user1);

        vm.expectRevert();
        registry.triggerCellLockdown(1, true);

        vm.expectRevert();
        registry.pauseRegistry(true);

        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                        REPUTATION EDGE CASES
    //////////////////////////////////////////////////////////////*/

    function test_Audit_Reputation_Clamping_MinMax() public {
        vm.prank(operator);
        registry.onboardMember(user1);

        // Test Max Clamping: Massive reputation should stay at 200
        vm.prank(operator);
        registry.adjustReputation(user1, 1_000_000);
        assertEq(registry.getCitizenRecord(user1).reputation, 200, "Should clamp at 200");

        // Test Min Clamping: Negative subtraction should stay at 0
        vm.prank(operator);
        registry.adjustReputation(user1, -500);
        assertEq(registry.getCitizenRecord(user1).reputation, 0, "Should clamp at 0");
    }

    function test_Audit_Reputation_Quarantine_Triggers() public {
        vm.prank(operator);
        registry.onboardMember(user1);

        // Drop below quarantine threshold (20)
        vm.prank(operator);
        registry.adjustReputation(user1, -81);

        AoxcStorage.CitizenRecord memory record = registry.getCitizenRecord(user1);
        assertEq(record.reputation, 19);
        assertTrue(record.isBlacklisted, "Quarantine expected");
        assertFalse(registry.isMemberOperational(user1), "Non-operational expected");

        // Recover: Rise above recovery threshold (50)
        vm.prank(operator);
        registry.adjustReputation(user1, 40); // 19 + 40 = 59

        record = registry.getCitizenRecord(user1);
        assertFalse(record.isBlacklisted, "Recovery expected");
        assertTrue(registry.isMemberOperational(user1), "Operational expected");
    }

    /*//////////////////////////////////////////////////////////////
                        CELLULAR ARCHITECTURE
    //////////////////////////////////////////////////////////////*/

    function test_Audit_Cell_Expansion_And_Isolation() public {
        uint256 maxMembers = AoxcConstants.MAX_CELL_MEMBERS;

        vm.startPrank(operator);
        for (uint256 i = 0; i < maxMembers; i++) {
            // forge-lint: disable-next-line(unsafe-typecast)
            registry.onboardMember(address(uint160(i + 1000)));
        }

        registry.onboardMember(user1);
        vm.stopPrank();

        assertEq(registry.isMemberOperational(user1), true);

        // Lockdown Cell 2, Cell 1 stays free
        vm.prank(operator);
        registry.triggerCellLockdown(2, true);

        assertFalse(registry.isMemberOperational(user1), "Cell 2 must be locked");

        // forge-lint: disable-next-line(unsafe-typecast)
        address cell1Member = address(uint160(1000));
        assertTrue(registry.isMemberOperational(cell1Member), "Cell 1 must be free");
    }

    /*//////////////////////////////////////////////////////////////
                        EMERGENCY CIRCUIT BREAKER
    //////////////////////////////////////////////////////////////*/

    function test_Audit_Emergency_Pause_Behavior() public {
        vm.prank(operator);
        registry.onboardMember(user1);

        vm.prank(operator);
        registry.pauseRegistry(true);

        assertTrue(registry.paused());
        assertFalse(registry.isMemberOperational(user1), "Should be false when paused");

        vm.expectRevert();
        vm.prank(operator);
        registry.onboardMember(user2);

        vm.prank(operator);
        registry.pauseRegistry(false);
        assertTrue(registry.isMemberOperational(user1), "Should recover after unpause");
    }

    /*//////////////////////////////////////////////////////////////
                        UPGRADEABILITY & STORAGE
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Validates Namespace Storage parameters.
     */
    function test_Audit_Storage_Namespace_Integrity() public view {
        (uint256 max, uint256 q, uint256 r) = registry.getReputationParams();
        assertEq(max, 200);
        assertEq(q, 20);
        assertEq(r, 50);
    }
}
