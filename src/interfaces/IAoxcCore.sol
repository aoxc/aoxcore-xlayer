// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

/**
 * @title IAoxcCore
 * @author Aoxcore Security Architecture
 * @notice Global Interface for the Autonomous AI-DAO Core Logic.
 * @dev Version 3.0: Implements the 10-Point Neural Handshake Protocol for X Layer.
 */
interface IAoxcCore {
    
    /**
     * @dev The 10-Point Neural Handshake Struct.
     * This packet is the universal 'passport' for every major action in the system.
     */
    struct NeuralPacket {
        address origin;          // 1. The original EOA triggering the action
        address target;          // 2. The recipient or contract being interacted with
        uint256 value;           // 3. Amount of assets (ERC20/Native)
        uint256 nonce;           // 4. Sequential ID to prevent Replay Attacks
        uint48 deadline;         // 5. Expiration timestamp (Security against stale TXs)
        uint16 reasonCode;       // 6. Categorized reason (Audit/Registry Sync)
        uint8 riskScore;         // 7. AI-generated risk score (0-255)
        bool autoRepairMode;     // 8. If true, allows the system to auto-adjust on failure
        bytes32 protocolHash;    // 9. Hash of the specific protocol version used
        bytes neuralSignature;   // 10. AI Sentinel's cryptographic seal (EIP-712)
    }

    /*//////////////////////////////////////////////////////////////
                        ASSET & CORE OPERATIONS
    //////////////////////////////////////////////////////////////*/

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    
    /**
     * @notice The NEW standard for autonomous execution.
     * @dev Every critical movement must pass through this 10-point handshake.
     */
    function executeNeuralAction(NeuralPacket calldata packet) external returns (bool);

    /*//////////////////////////////////////////////////////////////
                        GOVERNANCE & VOTING
    //////////////////////////////////////////////////////////////*/

    function clock() external view returns (uint48);
    function CLOCK_MODE() external view returns (string memory);
    function getVotes(address account) external view returns (uint256);
    function delegates(address account) external view returns (address);
    function delegate(address delegatee) external;

    /*//////////////////////////////////////////////////////////////
                        AI-DAO DEFENSE & REPAIR
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Allows the Auto-Repair module to intervene in case of system failure.
     */
    function triggerEmergencyRepair(bytes4 selector, address target, string calldata reason) external;

    /**
     * @notice Returns the status of the Autonomous AI Sentinel.
     */
    function getAiStatus() external view returns (bool isActive, uint256 currentNeuralThreshold);

    /**
     * @notice Advanced account restriction with full audit reasoning.
     */
    function setRestrictionStatus(address account, bool status, string calldata reason) external;

    function isRestricted(address account) external view returns (bool);

    /*//////////////////////////////////////////////////////////////
                        MONETARY CONTROL (DAO)
    //////////////////////////////////////////////////////////////*/

    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;

    /**
     * @notice Returns the reputation matrix linked to the Registry.
     */
    function getReputationMatrix(address account) external view returns (uint256);
}
