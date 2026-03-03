// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

/**
 * @title AoxcRegistry (V2.0 Foundation)
 * @author AOXCAN Security Architecture
 * @notice Centralized Member Registry and Cellular Manager.
 * @dev Implements Rule 3 (Isolation) with ERC-7201 compliance.
 */

import {AccessManagedUpgradeable} from "@openzeppelin/contracts-upgradeable/access/manager/AccessManagedUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

// INTERNAL INFRASTRUCTURE
import {IAoxcStorage} from "aoxc-interfaces/IAoxcStorage.sol";
import {AoxcConstants} from "aoxc-libraries/AoxcConstants.sol";
import {AoxcErrors} from "aoxc-libraries/AoxcErrors.sol";
import {AoxcEvents} from "aoxc-libraries/AoxcEvents.sol";

contract AoxcRegistry is
    Initializable,
    AccessManagedUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    /*//////////////////////////////////////////////////////////////
                        NAMESPACED STORAGE (V2 DNA)
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Slot calculation based on ERC-7201:
     * keccak256(abi.encode(uint256(keccak256("aoxc.registry.storage.v2")) - 1)) & ~bytes32(uint256(0xff))
     */
    bytes32 private constant REGISTRY_STORAGE_SLOT = 0x56a64487b9f3630f9a2e6840a3597843644f7725845c2794c489b251a3d00800;

    struct RegistryStorageV2 {
        uint256 totalCells;
        uint256 activeCellPointer;
        uint256 maxReputation;
        uint256 quarantineThreshold;
        uint256 recoveryThreshold;
        bytes32 lastCellHash;
        mapping(address => IAoxcStorage.CitizenRecord) citizenRecords;
        mapping(uint256 => IAoxcStorage.NeuralCellV2) cells;
        mapping(address => uint256) userToCellMap;
        mapping(uint256 => bool) cellLockdown;
        mapping(uint256 => uint256) cellLockExpiry;
    }

    function _getStore() internal pure returns (RegistryStorageV2 storage $) {
        assembly { $.slot := REGISTRY_STORAGE_SLOT }
    }

    /*//////////////////////////////////////////////////////////////
                             INITIALIZATION
    //////////////////////////////////////////////////////////////*/

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initializeRegistryV2(address initialAuthority) external initializer {
        __AccessManaged_init(initialAuthority);
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        RegistryStorageV2 storage $ = _getStore();
        $.maxReputation = 1000;
        $.quarantineThreshold = 200;
        $.recoveryThreshold = 500;
        
        _spawnNewCell($);
    }

    /*//////////////////////////////////////////////////////////////
                         V2 CORE OPERATIONS
    //////////////////////////////////////////////////////////////*/

    function onboardMember(address member) external restricted whenNotPaused nonReentrant {
        if (member == address(0)) revert AoxcErrors.Aoxc_InvalidAddress();
        
        RegistryStorageV2 storage $ = _getStore();
        if ($.userToCellMap[member] != 0) revert AoxcErrors.Aoxc_Registry_UserAlreadyRegistered();

        uint256 targetCell = $.activeCellPointer;
        
        // V2 Auto-Scaling: Move to next cell if current is full
        if ($.cells[targetCell].memberCount >= AoxcConstants.MAX_CELL_MEMBERS) {
            targetCell = _spawnNewCell($);
        }

        $.userToCellMap[member] = targetCell;
        $.cells[targetCell].memberCount++;

        // Initial Record Creation
        $.citizenRecords[member] = IAoxcStorage.CitizenRecord({
            citizenId: uint256(keccak256(abi.encodePacked(member, block.timestamp))),
            reputation: 500, // Neutral start per Rule 7
            totalVoted: 0,
            joinedAt: uint64(block.timestamp),
            lastPulse: uint64(block.timestamp),
            tier: 1,
            isBlacklisted: false,
            blacklistReason: ""
        });

        emit AoxcEvents.MemberOnboarded(member, targetCell, 0); // Risk 0 for fresh onboard
    }

    function adjustReputation(address member, int256 adjustment, uint16 reasonCode) external restricted whenNotPaused {
        RegistryStorageV2 storage $ = _getStore();
        IAoxcStorage.CitizenRecord storage citizen = $.citizenRecords[member];
        
        if (citizen.joinedAt == 0) revert AoxcErrors.Aoxc_Registry_CitizenNotFound();

        uint256 oldRep = citizen.reputation;
        int256 newRep = int256(oldRep) + adjustment;
        
        if (newRep < 0) newRep = 0;
        if (newRep > int256($.maxReputation)) newRep = int256($.maxReputation);

        citizen.reputation = uint256(newRep);
        citizen.lastPulse = uint64(block.timestamp);

        _checkStatus($, member, citizen);

        emit AoxcEvents.ReputationUpdated(member, oldRep, uint256(newRep), reasonCode);
    }

    /*//////////////////////////////////////////////////////////////
                         SECURITY & LOCKDOWN
    //////////////////////////////////////////////////////////////*/

    function triggerCellLockdown(uint256 cellId, bool status, uint256 duration) external restricted {
        RegistryStorageV2 storage $ = _getStore();
        if (cellId == 0 || cellId > $.totalCells) revert AoxcErrors.Aoxc_Module_Error(8, 404);

        $.cellLockdown[cellId] = status;
        $.cellLockExpiry[cellId] = status ? block.timestamp + duration : 0;
        $.cells[cellId].isQuarantined = status;

        // ReasonCode 500: Defense Trigger (Constants)
        emit AoxcEvents.GlobalLockStateChanged(status, AoxcConstants.REASON_DEFENSE_TRIGGER);
    }

    function isMemberOperational(address member) public view returns (bool) {
        RegistryStorageV2 storage $ = _getStore();
        uint256 cellId = $.userToCellMap[member];
        IAoxcStorage.CitizenRecord memory citizen = $.citizenRecords[member];

        return (
            citizen.joinedAt != 0 &&
            !citizen.isBlacklisted &&
            !_isCellLocked($, cellId) &&
            !paused()
        );
    }

    /*//////////////////////////////////////////////////////////////
                         INTERNAL HELPERS
    //////////////////////////////////////////////////////////////*/

    function _checkStatus(RegistryStorageV2 storage $, address member, IAoxcStorage.CitizenRecord storage citizen) internal {
        if (citizen.reputation < $.quarantineThreshold && !citizen.isBlacklisted) {
            citizen.isBlacklisted = true;
            citizen.blacklistReason = "LOW_REPUTATION";
            emit AoxcEvents.BlacklistUpdated(member, true, 500);
        } else if (citizen.isBlacklisted && citizen.reputation >= $.recoveryThreshold) {
            citizen.isBlacklisted = false;
            citizen.blacklistReason = "";
            emit AoxcEvents.BlacklistUpdated(member, false, 100);
        }
    }

    function _spawnNewCell(RegistryStorageV2 storage $) internal returns (uint256) {
        uint256 newId = ++$.totalCells;
        bytes32 prevHash = $.lastCellHash;
        bytes32 newHash = keccak256(abi.encode(prevHash, block.timestamp, newId));

        $.cells[newId] = IAoxcStorage.NeuralCellV2({
            cellId: newId,
            cellHash: newHash,
            memberCount: 0,
            isQuarantined: false,
            lockExpiry: 0
        });

        $.lastCellHash = newHash;
        $.activeCellPointer = newId;

        emit AoxcEvents.CellSpawned(newId, newHash, prevHash);
        return newId;
    }

    function _isCellLocked(RegistryStorageV2 storage $, uint256 cellId) internal view returns (bool) {
        return $.cellLockdown[cellId] && block.timestamp < $.cellLockExpiry[cellId];
    }

    function _authorizeUpgrade(address) internal override restricted {}
}
