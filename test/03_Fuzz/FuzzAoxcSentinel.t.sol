// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import {Test} from "forge-std/Test.sol";
import "aoxc/access/AoxcSentinel.sol";
import "aoxc-interfaces/IAoxcRegistry.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {AccessManager} from "@openzeppelin/contracts/access/manager/AccessManager.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title Fuzz_AoxcSentinel_Audit_Suite
 * @author AOXCore Security Team
 * @notice Global Audit Standard Fuzzing Suite for Neural Sentinel Logic.
 * @dev This suite targets: Cryptographic Identity, Temporal Validation (Block Windows),
 * and Autonomous State Transitions (Emergency Halts).
 */
contract Fuzz_AoxcSentinel is Test {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // --- Core Contracts ---
    AoxcSentinel public sentinel;
    AccessManager public manager;

    // --- Mocking Infrastructure ---
    address public mockRegistry = makeAddr("MOCK_REGISTRY");
    address public admin = makeAddr("ADMIN");

    // --- Neural Actor Specs ---
    uint256 public aiNodePrivKey = 0xA1;
    address public aiNode = vm.addr(aiNodePrivKey);

    address public repairEngine = makeAddr("REPAIR_ENGINE");
    address public targetUser = makeAddr("TARGET_USER");

    // --- Roles ---
    uint64 public constant ROLE_SENTINEL_OPERATOR = 1;

    /**
     * @notice System Orchestration Setup.
     * @dev Sets up Proxy-Implementation pattern, AccessManager roles, and mock environments.
     */
    function setUp() public {
        // 1. Deploy Access Infrastructure
        manager = new AccessManager(admin);
        AoxcSentinel implementation = new AoxcSentinel();

        // 2. Deploy via UUPS Proxy
        bytes memory initData =
            abi.encodeCall(AoxcSentinel.initialize, (address(manager), aiNode, repairEngine, mockRegistry));
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);
        sentinel = AoxcSentinel(address(proxy));

        // 3. Orchestrate Permissions (Audit Point: Self-Regulation Authority)
        vm.startPrank(admin);
        manager.grantRole(ROLE_SENTINEL_OPERATOR, address(sentinel), 0);

        bytes4[] memory selectors = new bytes4[](1);
        selectors[0] = 0x8456d592; // pause() selector
        manager.setTargetFunctionRole(address(sentinel), selectors, ROLE_SENTINEL_OPERATOR);
        vm.stopPrank();

        // 4. Labelling for Forge Traces
        vm.label(address(sentinel), "AOX_SENTINEL_PROXY");
        vm.label(address(manager), "ACCESS_MANAGER");
        vm.label(aiNode, "AUTHORIZED_AI_NODE");
        vm.label(repairEngine, "REPAIR_ENGINE_MOCK");

        // 5. Environment Simulation
        vm.etch(repairEngine, hex"6001600155"); // Bytecode injection for call safety

        vm.mockCall(mockRegistry, abi.encodeWithSelector(IAoxcRegistry.isMemberOperational.selector), abi.encode(true));
    }

    /*//////////////////////////////////////////////////////////////
                        NEURAL SIGNAL VALIDATION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz: Validates state transitions between Operational and Halted states.
     * @dev Boundary analysis for riskScore [0-100] and temporal offset [0-49].
     * @param riskScore Random AI risk assessment.
     * @param nonce Cryptographic nonce for sequence protection.
     * @param blockOffset Simulated delay between signal generation and execution.
     */
    function testFuzz_NeuralSignal_StateTransitions(uint256 riskScore, uint256 nonce, uint256 blockOffset) public {
        // --- Pre-Conditions ---
        riskScore = bound(riskScore, 0, 100);
        nonce = bound(nonce, 1, type(uint64).max);
        blockOffset = bound(blockOffset, 0, 49);

        uint256 signalBlock = block.number;
        vm.roll(block.number + blockOffset);

        // --- Action: Neural Pulse Generation ---
        bytes32 structHash = keccak256(
            abi.encode(riskScore, nonce, signalBlock, targetUser, bytes4(0x12345678), address(sentinel), block.chainid)
        );
        bytes32 digest = structHash.toEthSignedMessageHash();
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(aiNodePrivKey, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        sentinel.processNeuralSignal(riskScore, nonce, signalBlock, targetUser, 0x12345678, signature);

        // --- Post-Condition: Invariant Verification ---
        if (riskScore >= 75) {
            // High Risk -> Autonomous Isolation
            assertTrue(sentinel.paused(), "FAIL: System failed to enter Emergency Pause at Risk >= 75");
        } else {
            // Low Risk -> Continuity
            assertFalse(sentinel.paused(), "FAIL: False positive Emergency Pause at Risk < 75");
        }
    }

    /*//////////////////////////////////////////////////////////////
                        IDENTITY & REPLAY SECURITY
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Invariant: Only cryptographically authorized nodes can pulse the system.
     * @dev Prevents Identity Forgery and Malicious Neural Spoofing.
     * @param attackerKey Random private key attempting to forge a signal.
     */
    function testFuzz_Security_Identity_Enforcement(uint256 attackerKey) public {
        // Bound to valid Secp256k1 range to avoid vm.sign crashes
        attackerKey = bound(attackerKey, 1, 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140);
        vm.assume(attackerKey != aiNodePrivKey);

        bytes32 digest = keccak256("MALICIOUS_FORGERY").toEthSignedMessageHash();
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(attackerKey, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Action & Assertion: Should revert with Identity Forgery error
        vm.expectRevert();
        sentinel.processNeuralSignal(10, 1, block.number, targetUser, 0x0, signature);
    }

    /**
     * @notice Invariant: Stale signals exceeding blockWindow MUST be rejected.
     * @dev Prevents Temporal Replay Attacks.
     * @param expiredOffset Offset > blockWindow (50).
     */
    function testFuzz_Security_Temporal_StaleSignals(uint256 expiredOffset) public {
        expiredOffset = bound(expiredOffset, 51, 1_000_000);

        uint256 signalBlock = block.number;
        vm.roll(block.number + expiredOffset);

        bytes32 structHash =
            keccak256(abi.encode(10, 1, signalBlock, targetUser, 0x12345678, address(sentinel), block.chainid));
        bytes32 digest = structHash.toEthSignedMessageHash();
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(aiNodePrivKey, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Action & Assertion
        vm.expectRevert();
        sentinel.processNeuralSignal(10, 1, signalBlock, targetUser, 0x12345678, signature);
    }
}
