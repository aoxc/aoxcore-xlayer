// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

/**
 * @title AoxcVault (Neural V2.2)
 * @author AOXCAN Core Division
 * @notice The Sovereign Treasury: Handles liquidity, settlements, and AI-driven recovery.
 * @dev Optimized for OZ 5.5.0, Slither-hardened, and Rule 12 (Self-Healing) compliant.
 */

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// AOXC INTERNAL INFRASTRUCTURE
import {IAoxcVault} from "aoxc-interfaces/IAoxcVault.sol";
import {IAoxcStorage} from "aoxc-interfaces/IAoxcStorage.sol";
import {AoxcConstants} from "aoxc-libraries/AoxcConstants.sol";
import {AoxcErrors} from "aoxc-libraries/AoxcErrors.sol";
import {AoxcEvents} from "aoxc-libraries/AoxcEvents.sol";

contract AoxcVault is
    Initializable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    IAoxcVault
{
    using SafeERC20 for IERC20;

    /*//////////////////////////////////////////////////////////////
                        NAMESPACED STORAGE (DNA)
    //////////////////////////////////////////////////////////////*/

    struct RepairState {
        address proposedLogic;
        uint256 readyAt;
        bool active;
    }

    /**
     * @custom:storage-location erc7201:aoxc.vault.storage.v2
     */
    struct VaultStorage {
        address coreAsset;
        bool isSealed;
        RepairState repair;
        address[] trackedTokens;
        mapping(address => uint256) lastRefill;
        // @dev Future-proofing: 50 slots for upcoming neural features
        uint256[50] __gap; 
    }

    // ERC-7201 compliance: keccak256(abi.encode(uint256(keccak256("aoxc.vault.storage.v2")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant VAULT_STORAGE_SLOT = 0x56a64487b9f3630f9a2e6840a3597843644f7725845c2794c489b251a3d00100;

    function _getStore() internal pure returns (VaultStorage storage $) {
        assembly { $.slot := VAULT_STORAGE_SLOT }
    }

    /*//////////////////////////////////////////////////////////////
                           INITIALIZATION
    //////////////////////////////////////////////////////////////*/

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initializeVaultV2(address governor, address aoxc) external initializer {
        if (governor == address(0) || aoxc == address(0)) revert AoxcErrors.Aoxc_InvalidAddress();

        __AccessControl_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, governor);
        _grantRole(AoxcConstants.GOVERNANCE_ROLE, governor);

        VaultStorage storage $ = _getStore();
        $.coreAsset = aoxc;
        $.trackedTokens.push(aoxc);
    }

    /*//////////////////////////////////////////////////////////////
                        TREASURY & SETTLEMENT
    //////////////////////////////////////////////////////////////*/

    receive() external payable {
        if (msg.value > 0) emit AoxcEvents.VaultFunded(msg.sender, msg.value);
    }

    /**
     * @notice Handles ERC20 withdrawals authorized by Governance.
     * @dev Implements Rule 12: No withdrawals if vault is SEALED.
     */
    function withdrawErc20(address token, address to, uint256 amount, bytes calldata)
        external
        override
        onlyRole(AoxcConstants.GOVERNANCE_ROLE)
        nonReentrant
    {
        if (to == address(0)) revert AoxcErrors.Aoxc_InvalidAddress();
        VaultStorage storage $ = _getStore();
        if ($.isSealed) revert AoxcErrors.Aoxc_GlobalLockActive();

        IERC20(token).safeTransfer(to, amount);
        emit AoxcEvents.VaultWithdrawal(token, to, amount);
    }

    /**
     * @notice Handles Native ETH withdrawals.
     */
    function withdrawEth(address payable to, uint256 amount, bytes calldata)
        external
        override
        onlyRole(AoxcConstants.GOVERNANCE_ROLE)
        nonReentrant
    {
        if (to == address(0)) revert AoxcErrors.Aoxc_InvalidAddress();
        VaultStorage storage $ = _getStore();
        if ($.isSealed) revert AoxcErrors.Aoxc_GlobalLockActive();

        uint256 balance = address(this).balance;
        if (amount > balance) revert AoxcErrors.Aoxc_InsufficientBalance(balance, amount);

        (bool success,) = to.call{value: amount}("");
        if (!success) revert AoxcErrors.Aoxc_TransferFailed();

        emit AoxcEvents.VaultWithdrawal(address(0), to, amount);
    }

    /*//////////////////////////////////////////////////////////////
                        NEURAL SELF-HEALING (Rule 12)
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Sentinel AI triggers "Self-Healing" during high-risk events.
     * @dev Automatically SEALS the vault to prevent drainage.
     */
    function proposeSelfHealing(address newLogic) external override onlyRole(AoxcConstants.SENTINEL_ROLE) {
        if (newLogic == address(0)) revert AoxcErrors.Aoxc_InvalidAddress();
        VaultStorage storage $ = _getStore();
        
        $.repair = RepairState({
            proposedLogic: newLogic, 
            readyAt: block.timestamp + AoxcConstants.REPAIR_TIMELOCK, 
            active: true
        });
        
        $.isSealed = true; 
        emit AoxcEvents.GlobalLockStateChanged(true, $.repair.readyAt);
    }

    /**
     * @notice Finalizes the otonomous repair process.
     */
    function finalizeSelfHealing() external override onlyRole(AoxcConstants.GOVERNANCE_ROLE) {
        VaultStorage storage $ = _getStore();
        RepairState memory repair = $.repair;

        if (!repair.active) revert AoxcErrors.Aoxc_Repair_ModeNotActive();
        if (block.timestamp < repair.readyAt) {
            revert AoxcErrors.Aoxc_Repair_CooldownActive(repair.readyAt - block.timestamp);
        }

        address target = repair.proposedLogic;

        // CEI Pattern: State changes before upgrade
        delete $.repair;
        $.isSealed = false;

        emit AoxcEvents.NeuralRecoveryExecuted(address(0), target, 0);
        
        _upgradeToAndCallUUPS(target, "", false);
    }

    /*//////////////////////////////////////////////////////////////
                            SYSTEM INTERFACE
    //////////////////////////////////////////////////////////////*/

    function requestSettlement(address token, address to, uint256 amount) external override onlyRole(AoxcConstants.GOVERNANCE_ROLE) {
        if (_getStore().isSealed) revert AoxcErrors.Aoxc_GlobalLockActive();
        IERC20(token).safeTransfer(to, amount);
    }

    function isVaultLocked() external view override returns (bool) {
        return _getStore().isSealed;
    }

    function emergencyUnseal() external override onlyRole(AoxcConstants.GOVERNANCE_ROLE) {
        _getStore().isSealed = false;
        emit AoxcEvents.GlobalLockStateChanged(false, block.timestamp);
    }

    function _authorizeUpgrade(address) internal view override {
        // Upgrade only via internal finalizeSelfHealing or authorized Governance
        if (msg.sender != address(this)) {
            _checkRole(AoxcConstants.GOVERNANCE_ROLE);
        }
    }

    /*//////////////////////////////////////////////////////////////
                         COMPLIANCE STUBS
    //////////////////////////////////////////////////////////////*/
    function deposit() external payable override {}
    function getVaultTvl() external view override returns (uint256) { return address(this).balance; }
    function requestAutomatedRefill(uint256) external override {}
}
