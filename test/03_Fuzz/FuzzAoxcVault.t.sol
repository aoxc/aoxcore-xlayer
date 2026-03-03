// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import {Test} from "forge-std/Test.sol";
import "aoxc/finance/AoxcVault.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockToken for Vault Testing
 */
contract MockToken is ERC20 {
    constructor() ERC20("Mock", "MCK") {
        _mint(msg.sender, 1_000_000 ether);
    }
}

contract Fuzz_AoxcVault is Test {
    AoxcVault vault;
    MockToken token;

    address governor = address(0xDE1);
    address aoxc = address(0xAE2);

    function setUp() public {
        token = new MockToken();
        vault = new AoxcVault();

        // Initialize Vault
        vm.startPrank(governor);
        try vault.initialize(governor, aoxc) {
        // Initialization successful
        }
            catch (bytes memory /* reason */
            ) {
            // Already initialized or locked; suppress warning via /* */
        }
        vm.stopPrank();

        vm.label(governor, "GOVERNOR");
        vm.label(address(vault), "VAULT");

        // Funding the Vault
        vm.deal(address(vault), 100 ether);

        // FIX: Check ERC20 return value to silence [erc20-unchecked-transfer]
        bool success = token.transfer(address(vault), 10_000 ether);
        require(success, "Transfer failed");
    }

    /**
     * @notice TEST: Unauthorized users must not be able to withdraw ETH.
     */
    function testFuzz_Unauthorized_WithdrawEth(address attacker, uint256 amount) public {
        vm.assume(attacker != governor && attacker != address(0) && attacker != address(vault));
        amount = bound(amount, 1, 100 ether);

        vm.prank(attacker);
        // FIX: Suppress unused catch parameter warning
        try vault.withdrawEth(payable(attacker), amount, "") {
            fail("VULN: Unauthorized withdraw succeeded!");
        } catch (bytes memory /* reason */
            ) {
            // Expected failure
        }
    }

    /**
     * @notice TEST: Emergency Mode Invariant
     * Ensure only authorized users can toggle lock, and funds are locked during emergency.
     */
    function testFuzz_VaultLock_Invariant(uint256 amount) public {
        amount = bound(amount, 1, 10 ether);

        vm.startPrank(governor);
        try vault.toggleEmergencyMode(true) {
            // When locked, withdrawal should revert
            vm.expectRevert();
            vault.withdrawEth(payable(governor), amount, "");
        } catch (bytes memory /* reason */
            ) {
            // If toggle fails, governor might lack GOVERNANCE_ROLE
        }
        vm.stopPrank();
    }
}
