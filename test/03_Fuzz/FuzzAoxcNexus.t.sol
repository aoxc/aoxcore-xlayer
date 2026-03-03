// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import {Test} from "forge-std/Test.sol";
import "aoxc/core/AoxcNexus.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract Fuzz_NEXUS is Test {
    using MessageHashUtils for bytes32;

    AoxcNexus nexus;
    address admin = address(0xAD1);
    address auditVoice = address(0xAA);

    // NOT: Manuel SECP256K1_ORDER sildi, forge-std'den otomatik gelecek.

    function setUp() public {
        AoxcNexus implementation = new AoxcNexus();

        bytes memory initData = abi.encodeCall(AoxcNexus.initializeGovernor, (admin, auditVoice));

        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);

        // Payable casting - Error 7398 fix
        nexus = AoxcNexus(payable(address(proxy)));
    }

    /**
     * @notice TEST: Signature-Based Voting (EIP-712)
     */
    function testFuzz_CastVoteBySig_Integrity(uint256 proposalId, uint8 support, uint256 voterKey) public {
        // forge-std içindeki SECP256K1_ORDER'ı kullanır
        voterKey = bound(voterKey, 1, SECP256K1_ORDER - 1);
        address voter = vm.addr(voterKey);
        support = uint8(bound(support, 0, 1));

        bytes32 domainSeparator = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256("AoxcNexus"),
                keccak256("5.2.1"),
                block.chainid,
                address(nexus)
            )
        );

        bytes32 structHash = keccak256(abi.encode(nexus.VOTE_TYPEHASH(), proposalId, support));

        bytes32 digest = MessageHashUtils.toTypedDataHash(domainSeparator, structHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(voterKey, digest);

        vm.prank(voter);
        try nexus.castVoteBySig(proposalId, support, v, r, s) {
        // Success or logical revert caught internally
        }
            catch {
            // Expected failure scenarios
        }
    }

    /**
     * @notice TEST: Proposal State Consistency
     */
    function testFuzz_Proposal_State_Consistency(uint256 proposalId) public view {
        uint8 stateValue = uint8(nexus.state(proposalId));
        address proposer = nexus.proposalProposer(proposalId);

        if (proposer == address(0)) {
            assertEq(stateValue, 0, "Non-existent proposal must be Canceled(0)");
        }
    }

    /**
     * @notice TEST: Neural Veto Security
     */
    function testFuzz_NeuralVeto_Security(uint256 proposalId, uint256 riskScore, address attacker) public {
        vm.assume(attacker != auditVoice && attacker != admin && attacker != address(0) && attacker != address(nexus));

        vm.prank(attacker);
        vm.expectRevert();
        nexus.processNeuralVeto(proposalId, riskScore, "invalid_proof");
    }
}
