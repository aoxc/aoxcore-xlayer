// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

/**
 * @title AoxcNexus (Neural V2.2)
 * @author AOXCAN Security Division
 * @notice Sovereign Governance Layer with Neural Veto & EIP-712 Meta-Voting.
 * @dev Optimized for OpenZeppelin 5.5.0. Implements Rules 9 & 10.
 */

import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

// AOXC INTERNAL INFRASTRUCTURE
import {IAoxcNexus} from "aoxc-interfaces/IAoxcNexus.sol";
import {IAoxcStorage} from "aoxc-interfaces/IAoxcStorage.sol";
import {AoxcConstants} from "aoxc-libraries/AoxcConstants.sol";
import {AoxcErrors} from "aoxc-libraries/AoxcErrors.sol";
import {AoxcEvents} from "aoxc-libraries/AoxcEvents.sol";

contract AoxcNexus is
    IAoxcNexus,
    Initializable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    using MessageHashUtils for bytes32;
    using ECDSA for bytes32;
    using Address for address;

    /*//////////////////////////////////////////////////////////////
                        NAMESPACED STORAGE (DNA)
    //////////////////////////////////////////////////////////////*/

    struct NexusStorage {
        address aoxcToken;
        uint256 votingPeriod;
        uint256 votingDelay;
        uint256 quorumNumerator;
        bytes32 domainSeparator;
        mapping(uint256 => IAoxcNexus.ProposalCore) proposals;
        mapping(uint256 => mapping(address => bool)) hasVoted;
        uint256[50] __gap; // V2.2 UPGRADE SAFETY
    }

    bytes32 private constant NEXUS_STORAGE_SLOT = 0x56a64487b9f3630f9a2e6840a3597843644f7725845c2794c489b251a3d00900;

    function _getStore() internal pure returns (NexusStorage storage $) {
        assembly { $.slot := NEXUS_STORAGE_SLOT }
    }

    /*//////////////////////////////////////////////////////////////
                           INITIALIZATION
    //////////////////////////////////////////////////////////////*/

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initializeNexusV2(
        address admin, 
        address auditVoice, 
        address token
    ) external initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(AoxcConstants.AUDIT_VOICE_ROLE, auditVoice);

        NexusStorage storage $ = _getStore();
        $.aoxcToken = token;
        $.votingPeriod = 3 days;
        $.votingDelay = 1 hours;
        $.quorumNumerator = AoxcConstants.GOVERNANCE_QUORUM_BPS;

        $.domainSeparator = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainid,address verifyingContract)"),
                keccak256("AoxcNexus"),
                keccak256("V2.2.0"),
                block.chainid,
                address(this)
            )
        );
    }

    /*//////////////////////////////////////////////////////////////
                           PROPOSAL FLOW
    //////////////////////////////////////////////////////////////*/

    function propose(
        address[] calldata targets, 
        uint256[] calldata values, 
        bytes[] calldata calldatas, 
        string calldata description
    ) external override returns (uint256 id) {
        id = hashProposal(targets, values, calldatas, keccak256(bytes(description)));
        NexusStorage storage $ = _getStore();
        
        if ($.proposals[id].exists) revert AoxcErrors.Aoxc_CustomRevert("NEXUS: DUP_PROPOSAL");

        $.proposals[id] = IAoxcNexus.ProposalCore({
            proposer: msg.sender,
            exists: true,
            executed: false,
            vetoed: false,
            startTime: uint64(block.timestamp + $.votingDelay),
            endTime: uint64(block.timestamp + $.votingDelay + $.votingPeriod),
            snapshot: uint64(block.number),
            forVotes: 0,
            againstVotes: 0,
            aiRiskScore: 0
        });

        emit AoxcEvents.ProposalCreated(id, msg.sender, targets, values, calldatas, $.proposals[id].startTime, $.proposals[id].endTime, description);
    }

    function execute(
        address[] calldata targets, 
        uint256[] calldata values, 
        bytes[] calldata calldatas, 
        bytes32 descriptionHash
    ) external payable override nonReentrant returns (uint256 id) {
        id = hashProposal(targets, values, calldatas, descriptionHash);
        ProposalState s = state(id);
        
        if (s != ProposalState.Succeeded) revert AoxcErrors.Aoxc_CustomRevert("NEXUS: STATE_NOT_READY");

        NexusStorage storage $ = _getStore();
        $.proposals[id].executed = true;

        for (uint256 i = 0; i < targets.length; ++i) {
            targets[i].functionCallWithValue(calldatas[i], values[i]);
        }

        emit AoxcEvents.ProposalExecuted(id);
    }

    /*//////////////////////////////////////////////////////////////
                           NEURAL VETO
    //////////////////////////////////////////////////////////////*/

    function processNeuralVeto(uint256 id, uint256 riskScore, bytes calldata /* aiProof */) 
        external 
        override 
        onlyRole(AoxcConstants.AUDIT_VOICE_ROLE) 
    {
        NexusStorage storage $ = _getStore();
        if (!$.proposals[id].exists) revert AoxcErrors.Aoxc_CustomRevert("NEXUS: NOT_FOUND");
        
        $.proposals[id].vetoed = true;
        $.proposals[id].aiRiskScore = riskScore;

        emit AoxcEvents.KarujanNeuralVeto(id, riskScore);
    }

    /*//////////////////////////////////////////////////////////////
                           VOTING ENGINE
    //////////////////////////////////////////////////////////////*/

    function castVote(uint256 id, uint8 support) external override returns (uint256) {
        return _executeVote(msg.sender, id, support, "");
    }

    /**
     * @notice EIP-712 Meta-Voting: Gasless participation.
     */
    function castVoteBySig(
        uint256 id, 
        uint8 support, 
        uint8 v, 
        bytes32 r, 
        bytes32 s
    ) external returns (uint256) {
        NexusStorage storage $ = _getStore();
        bytes32 structHash = keccak256(abi.encode(
            keccak256("Ballot(uint256 id,uint8 support)"),
            id,
            support
        ));
        bytes32 hash = _getStore().domainSeparator.toTypedDataHash(structHash);
        address voter = hash.recover(v, r, s);
        return _executeVote(voter, id, support, "GASLESS_VOTE");
    }

    function _executeVote(address voter, uint256 id, uint8 support, string memory reason) internal returns (uint256 weight) {
        NexusStorage storage $ = _getStore();
        if (state(id) != ProposalState.Active) revert AoxcErrors.Aoxc_CustomRevert("NEXUS: INACTIVE");
        if ($.hasVoted[id][voter]) revert AoxcErrors.Aoxc_CustomRevert("NEXUS: ALREADY_VOTED");

        weight = IVotes($.aoxcToken).getPastVotes(voter, $.proposals[id].snapshot);
        if (weight == 0) revert AoxcErrors.Aoxc_CustomRevert("NEXUS: NO_WEIGHT");

        $.hasVoted[id][voter] = true;

        if (support == 1) $.proposals[id].forVotes += weight;
        else $.proposals[id].againstVotes += weight;

        emit AoxcEvents.VoteCast(voter, id, support, weight, reason);
    }

    /*//////////////////////////////////////////////////////////////
                                VIEWS
    //////////////////////////////////////////////////////////////*/

    function state(uint256 id) public view override returns (ProposalState) {
        NexusStorage storage $ = _getStore();
        IAoxcNexus.ProposalCore storage p = $.proposals[id];

        if (!p.exists) return ProposalState.Canceled;
        if (p.vetoed) return ProposalState.NeuralVetoed;
        if (p.executed) return ProposalState.Executed;
        if (block.timestamp < p.startTime) return ProposalState.Pending;
        if (block.timestamp <= p.endTime) return ProposalState.Active;

        bool quorumMet = (p.forVotes + p.againstVotes) >= $.quorumNumerator;
        return (p.forVotes > p.againstVotes && quorumMet) ? ProposalState.Succeeded : ProposalState.Defeated;
    }

    function hashProposal(address[] calldata t, uint256[] calldata v, bytes[] calldata c, bytes32 d) public pure returns (uint256) {
        return uint256(keccak256(abi.encode(t, v, c, d)));
    }

    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
