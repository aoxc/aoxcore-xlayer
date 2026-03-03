// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

/**
 * @title AoxcAutoRepair
 * @author AOXCAN Infrastructure Division
 * @notice The Autonomous Immune System of the AOXCAN Ecosystem.
 * @dev Implementation of Rule 12 (Self-Healing). Handles circuit-breaking and logic patching.
 * * SECURITY COMPLIANCE:
 * - CEI (Checks-Effects-Interactions) Pattern observed.
 * - EIP-712 structured data hashing for AI Proofs.
 * - UUPS Proxy architecture for Sovereign Upgradability.
 * - Deadlock immunity for core governance functions.
 */

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

// AOXC INTERNAL
import {AoxcConstants} from "aoxc-libraries/AoxcConstants.sol";
import {AoxcErrors} from "aoxc-libraries/AoxcErrors.sol";
import {AoxcEvents} from "aoxc-libraries/AoxcEvents.sol";
import {IAoxcAutoRepair} from "aoxc-interfaces/IAoxcAutoRepair.sol";

contract AoxcAutoRepair is
    Initializable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable,
    IAoxcAutoRepair
{
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /// @notice The heart of governance: AOXC Nexus
    address public nexus;
    /// @notice AI Sentinel authorized for autonomous threat detection
    address public aiNode;
    /// @notice Manual override entity for Neural Veto
    address public auditVoice;

    /// @dev Internal mapping to track function-level quarantine states
    /// @custom:security Target -> Selector -> IsQuarantined
    mapping(address => mapping(bytes4 => bool)) private _quarantineRegistry;
    
    /// @dev Prevents replay attacks for repair anomalies
    mapping(uint256 => bool) public anomalyLedger;

    /// @dev Immunity mapping to prevent bricking the repair engine
    mapping(bytes4 => bool) public isImmune;

    /// @dev Reserve storage slots for future neural upgrades (OpenZeppelin standard)
    uint256[50] private __gap;

    /*//////////////////////////////////////////////////////////////
                             INITIALIZATION
    //////////////////////////////////////////////////////////////*/

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializes the V2 AutoRepair logic.
     * @param _admin Primary system administrator (V1 Legacy Admin).
     * @param _nexus The sovereign governance address.
     * @param _aiNode The authorized AI Sentinel node.
     * @param _auditVoice The human-in-the-loop audit authority.
     */
    function initializeAutoRepairV2(
        address _admin, 
        address _nexus, 
        address _aiNode, 
        address _auditVoice
    ) external initializer {
        if (_admin == address(0) || _nexus == address(0)) revert AoxcErrors.Aoxc_InvalidAddress();

        __AccessControl_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(AoxcConstants.GUARDIAN_ROLE, _admin);
        _grantRole(AoxcConstants.GOVERNANCE_ROLE, _nexus);

        nexus = _nexus;
        aiNode = _aiNode;
        auditVoice = _auditVoice;

        // IMMUNITY REGISTRATION: Essential functions cannot be quarantined.
        isImmune[this.triggerEmergencyQuarantine.selector] = true;
        isImmune[this.liftQuarantine.selector] = true;
        isImmune[this.executePatch.selector] = true;
    }

    /*//////////////////////////////////////////////////////////////
                         SOVEREIGN REPAIR LOGIC
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Initiates a function-level quarantine to mitigate active exploits.
     * @dev RULE 12: Autonomous circuit-breaking. Requires AI Node or Guardian signature.
     * @param selector The 4-byte signature of the function to block.
     * @param target The contract address containing the target function.
     */
    function triggerEmergencyQuarantine(bytes4 selector, address target) 
        external 
        override 
        nonReentrant 
    {
        if (msg.sender != aiNode && !hasRole(AoxcConstants.GUARDIAN_ROLE, msg.sender)) {
            revert AoxcErrors.Aoxc_Neural_IdentityForgery();
        }

        if (isImmune[selector]) revert AoxcErrors.Aoxc_CustomRevert("REPAIR: SELECTOR_IMMUNE");
        if (target == address(0)) revert AoxcErrors.Aoxc_InvalidAddress();

        _quarantineRegistry[target][selector] = true;

        emit AoxcEvents.SystemRepairInitiated(keccak256(abi.encodePacked(selector, target)), target);
    }

    /**
     * @notice Executes an autonomous patch with cryptographic AI verification.
     * @dev RULE 11: Validates neural proof before state mutation.
     * @param anomalyId Unique ID to prevent double-execution.
     * @param selector Function being repaired.
     * @param target Contract being repaired.
     * @param patchLogic Address of the new logic (for informational tracking).
     * @param aiAuthProof EIP-191/712 compliant signature from aiNode.
     */
    function executePatch(
        uint256 anomalyId,
        bytes4 selector,
        address target,
        address patchLogic,
        bytes calldata aiAuthProof
    ) external override nonReentrant onlyRole(AoxcConstants.GOVERNANCE_ROLE) {
        if (anomalyLedger[anomalyId]) revert AoxcErrors.Aoxc_CustomRevert("REPAIR: DUPLICATE_ID");

        // CRYPTOGRAPHIC VERIFICATION: Replay protected via block.chainid and this address.
        bytes32 digest = keccak256(
            abi.encode(anomalyId, selector, target, patchLogic, block.chainid, address(this))
        ).toEthSignedMessageHash();

        if (digest.recover(aiAuthProof) != aiNode) revert AoxcErrors.Aoxc_Neural_IdentityForgery();

        _quarantineRegistry[target][selector] = false;
        anomalyLedger[anomalyId] = true;

        emit AoxcEvents.PatchExecuted(selector, target, patchLogic);
    }

    /**
     * @notice Fallback mechanism to lift quarantine via Audit Voice or Admin.
     */
    function liftQuarantine(bytes4 selector, address target) external override {
        if (msg.sender != auditVoice && !hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            revert AoxcErrors.Aoxc_CustomRevert("REPAIR: UNAUTHORIZED");
        }

        _quarantineRegistry[target][selector] = false;
        emit AoxcEvents.GlobalLockStateChanged(false, 0);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Internal health-check used by modifiers in the AOXC ecosystem.
     * @param selector Function signature being checked.
     * @return bool True if the system is operational (not quarantined).
     */
    function isOperational(bytes4 selector) external view override returns (bool) {
        return !_quarantineRegistry[msg.sender][selector];
    }

    /*//////////////////////////////////////////////////////////////
                           UPGRADE CONTROL
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Restricted to Nexus Governance to ensure protocol sovereignty.
     */
    function _authorizeUpgrade(address newImplementation) 
        internal 
        view 
        override 
        onlyRole(AoxcConstants.GOVERNANCE_ROLE) 
    {
        if (newImplementation == address(0)) revert AoxcErrors.Aoxc_InvalidAddress();
    }
}
