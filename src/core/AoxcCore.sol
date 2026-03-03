// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

/**
 * @title AoxcCore V2 (Akdeniz Edition)
 * @author AOXCAN Security Architecture
 * @notice Sovereign logic engine that deprecates V1 legacy and enforces Neural Handshake.
 * @dev Full Audit-Ready implementation with ERC-7201 Namespaced Storage.
 */

import {IAoxcCore} from "aoxc-interfaces/IAoxcCore.sol";
import {IAoxcSentinel} from "aoxc-interfaces/IAoxcSentinel.sol";
import {IAoxcAutoRepair} from "aoxc-interfaces/IAoxcAutoRepair.sol";
import {IAoxcStorage} from "aoxc-interfaces/IAoxcStorage.sol";
import {AoxcConstants} from "aoxc-libraries/AoxcConstants.sol";
import {AoxcErrors} from "aoxc-libraries/AoxcErrors.sol";
import {AoxcEvents} from "aoxc-libraries/AoxcEvents.sol";

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {ERC20BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import {ERC20PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import {ERC20VotesUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import {NoncesUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/NoncesUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @dev Legacy Interface to control V1 Token from V2 Core
 */
interface IAoxcV1 {
    function mint(address to, uint256 amount) external;
    function addToBlacklist(address account, string calldata reason) external;
    function removeFromBlacklist(address account) external;
    function pause() external;
    function unpause() external;
}

contract AoxcCore is
    Initializable,
    IAoxcCore,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    ERC20PausableUpgradeable,
    AccessControlUpgradeable,
    ERC20PermitUpgradeable,
    ERC20VotesUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;

    /*//////////////////////////////////////////////////////////////
                        NAMESPACED STORAGE (DNA)
    //////////////////////////////////////////////////////////////*/
    
    struct CoreStorage {
        address v1TokenLegacy;     // Legacy AOXC V1 Address
        address sentinelAi;        // AI Security Node
        address repairEngine;      // Autonomous DAO Repair
        address nexusHub;          // Governance Center
        uint256 lastPulse;         // Yearly Mint Tracker
        uint256 anchorSupply;      // Inflation Anchor
        uint256 mintedThisYear;    // Inflation Counter
        uint256 dailyTransferLimit;// Global Velocity Cap
        bool aiFailSafeActive;     // Rule 10: Fail-close on AI silent
        bool globalLock;           // Emergency Kill Switch
        bytes32 protocolHash;      // Rule 9: Codebase Integrity
        mapping(address => bool) blacklisted;
        mapping(address => string) blacklistReason;
        mapping(address => bool) isExcludedFromLimits;
        mapping(address => uint256) dailySpent;
        mapping(address => uint256) lastTransferDay;
        mapping(address => uint256) lastActionBlock; // Rule 4: Anti-Flashloan
        mapping(address => uint256) userNonces;      // Rule 4: Anti-Replay
        mapping(bytes4 => bool) quarantinedSelectors; // Sectional Isolation
    }

    // ERC-7201 compliance slot
    bytes32 private constant CORE_STORAGE_SLOT = 0x27f884a8677c731e8093d6e5a4073f1d8595531d054d5d71c1815e98544e3d00;

    function _getStore() internal pure returns (CoreStorage storage $) {
        bytes32 slot = CORE_STORAGE_SLOT;
        assembly { $.slot := slot }
    }

    /*//////////////////////////////////////////////////////////////
                           INITIALIZATION
    //////////////////////////////////////////////////////////////*/

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initializeV2(
        address v1Token,
        address nexus, 
        address sentinel, 
        address repair, 
        address admin,
        bytes32 integrityHash
    ) external initializer {
        __ERC20_init("AoxcCore", "AOXC");
        __ERC20Permit_init("AoxcCore");
        __ReentrancyGuard_init();
        __ERC20Votes_init();
        __AccessControl_init();
        __ERC20Pausable_init();

        CoreStorage storage $ = _getStore();
        $.v1TokenLegacy = v1Token;
        $.nexusHub = nexus;
        $.sentinelAi = sentinel;
        $.repairEngine = repair;
        $.protocolHash = integrityHash;
        $.lastPulse = block.timestamp;
        $.dailyTransferLimit = 1_000_000 * 1e18; 
        $.anchorSupply = 100_000_000 * 1e18;
        $.aiFailSafeActive = true;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(AoxcConstants.GOVERNANCE_ROLE, nexus);
        _grantRole(AoxcConstants.UPGRADER_ROLE, admin);
        _grantRole(AoxcConstants.SENTINEL_ROLE, sentinel);
        _grantRole(AoxcConstants.REPAIR_ROLE, repair);

        $.isExcludedFromLimits[admin] = true;
        $.isExcludedFromLimits[nexus] = true;
    }

    /*//////////////////////////////////////////////////////////////
                        NEURAL HANDSHAKE ENGINE
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Validates the 10 Rules of Neural Compliance
     * @param packet The security packet containing signatures and risk data.
     */
    function validateNeuralHandshake(IAoxcStorage.NeuralPacket calldata packet) 
        external 
        override 
        returns (bool) 
    {
        CoreStorage storage $ = _getStore();

        // Rule 9: Verify Protocol Integrity
        if (packet.protocolHash != $.protocolHash) revert AoxcErrors.Aoxc_Neural_IntegrityCheckFailed();

        // Rule 4: Nonce & Replay protection
        if (packet.nonce != $.userNonces[packet.origin]++) revert AoxcErrors.Aoxc_Unauthorized("NONCE", packet.origin);

        // Rule 2: Sectional Isolation Check
        bytes4 selector = bytes4(packet.neuralSignature[:4]);
        if ($.quarantinedSelectors[selector] || $.globalLock) revert AoxcErrors.Aoxc_GlobalLockActive();

        // Rule 5: Temporal Validation
        if (block.timestamp > packet.deadline) revert AoxcErrors.Aoxc_TemporalCollision();

        // Rule 7: Risk Scoring
        if (packet.riskScore > AoxcConstants.NEURAL_RISK_CRITICAL) revert AoxcErrors.Aoxc_Neural_BastionSealed(block.timestamp);

        emit AoxcEvents.NeuralSignalProcessed("V2_HANDSHAKE_OK", abi.encode(packet.origin, packet.nonce));
        return true;
    }

    /*//////////////////////////////////////////////////////////////
                        ISOLATION & AUTO-REPAIR
    //////////////////////////////////////////////////////////////*/

    function setSectionalIsolation(bytes4 selector, bool status) external onlyRole(AoxcConstants.SENTINEL_ROLE) {
        _getStore().quarantinedSelectors[selector] = status;
        emit AoxcEvents.CoreLockStateChanged(status, block.timestamp);
    }

    function syncProtocolHash(bytes32 newHash) external onlyRole(AoxcConstants.REPAIR_ROLE) {
        _getStore().protocolHash = newHash;
        emit AoxcEvents.ComponentSynchronized(keccak256("REPAIR_SYNC"), msg.sender);
    }

    /*//////////////////////////////////////////////////////////////
                        V2 CORE LOGIC & V1 HOOKS
    //////////////////////////////////////////////////////////////*/

    function _update(address from, address to, uint256 amount)
        internal
        override(ERC20Upgradeable, ERC20PausableUpgradeable, ERC20VotesUpgradeable)
    {
        CoreStorage storage $ = _getStore();

        // Rule 1: Emergency & Isolation Control
        if ($.globalLock || $.quarantinedSelectors[msg.sig]) {
            if (!hasRole(DEFAULT_ADMIN_ROLE, from)) revert AoxcErrors.Aoxc_GlobalLockActive();
        }

        if (from != address(0) && to != address(0) && !$.isExcludedFromLimits[from]) {
            if ($.blacklisted[from]) revert AoxcErrors.Aoxc_Blacklisted(from, $.blacklistReason[from]);
            
            // Temporal Integrity (Rule 4: Anti-Flashloan)
            if ($.lastActionBlock[from] >= block.number) revert AoxcErrors.Aoxc_TemporalCollision();
            $.lastActionBlock[from] = block.number;

            _checkVelocity($, from, amount);
            _checkNeuralCompliance($, from, to);
        }

        super._update(from, to, amount);
    }

    function _checkVelocity(CoreStorage storage $, address from, uint256 amount) private {
        uint256 day = block.timestamp / 1 days;
        if ($.lastTransferDay[from] != day) {
            $.dailySpent[from] = 0;
            $.lastTransferDay[from] = day;
        }
        if ($.dailySpent[from] + amount > $.dailyTransferLimit) {
            revert AoxcErrors.Aoxc_ExceedsDailyLimit(amount, $.dailyTransferLimit - $.dailySpent[from]);
        }
        $.dailySpent[from] += amount;
    }

    function _checkNeuralCompliance(CoreStorage storage $, address from, address to) private view {
        if ($.sentinelAi != address(0)) {
            try IAoxcSentinel($.sentinelAi).isAllowed(from, to) returns (bool allowed) {
                if (!allowed) revert AoxcErrors.Aoxc_Neural_BastionSealed(block.timestamp);
            } catch {
                if ($.aiFailSafeActive) revert AoxcErrors.Aoxc_Neural_BastionSealed(block.timestamp);
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                        MINTING & COMPLIANCE (LEGACY BRIDGE)
    //////////////////////////////////////////////////////////////*/

    function mintV2(address to, uint256 amount) external onlyRole(AoxcConstants.GOVERNANCE_ROLE) nonReentrant {
        CoreStorage storage $ = _getStore();
        
        if (block.timestamp >= $.lastPulse + 365 days) {
            $.lastPulse = block.timestamp;
            $.mintedThisYear = 0;
            $.anchorSupply = totalSupply();
        }
        
        uint256 cap = ($.anchorSupply * AoxcConstants.MAX_MINT_PER_YEAR_BPS) / AoxcConstants.BPS_DENOMINATOR;
        if ($.mintedThisYear + amount > cap) revert AoxcErrors.Aoxc_InflationHardcapReached();
        
        $.mintedThisYear += amount;
        _mint(to, amount);

        if ($.v1TokenLegacy != address(0)) {
            IAoxcV1($.v1TokenLegacy).mint(to, amount);
        }

        emit AoxcEvents.MintExecuted(to, amount, $.mintedThisYear);
    }

    function setRestrictionV2(address account, bool status, string calldata reason) 
        external 
        onlyRole(AoxcConstants.SENTINEL_ROLE) 
    {
        CoreStorage storage $ = _getStore();
        $.blacklisted[account] = status;
        $.blacklistReason[account] = reason;

        if ($.v1TokenLegacy != address(0)) {
            if (status) IAoxcV1($.v1TokenLegacy).addToBlacklist(account, reason);
            else IAoxcV1($.v1TokenLegacy).removeFromBlacklist(account);
        }

        emit AoxcEvents.BlacklistUpdated(account, status, reason);
    }

    /*//////////////////////////////////////////////////////////////
                           ADMIN & RECOVERY
    //////////////////////////////////////////////////////////////*/

    function lockSystem() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _getStore().globalLock = true;
        if (_getStore().v1TokenLegacy != address(0)) IAoxcV1(_getStore().v1TokenLegacy).pause();
    }

    function unlockSystem() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _getStore().globalLock = false;
        if (_getStore().v1TokenLegacy != address(0)) IAoxcV1(_getStore().v1TokenLegacy).unpause();
    }

    function _authorizeUpgrade(address) internal override onlyRole(AoxcConstants.UPGRADER_ROLE) {}

    // --- View Overrides ---
    function isCoreLocked() external view override returns (bool) { return _getStore().globalLock; }
    function clock() public view override returns (uint48) { return uint48(block.timestamp); }
    function CLOCK_MODE() public view override returns (string memory) { return "mode=timestamp"; }
    function nonces(address owner) public view override(ERC20PermitUpgradeable, NoncesUpgradeable) returns (uint256) {
        return super.nonces(owner);
    }
}
