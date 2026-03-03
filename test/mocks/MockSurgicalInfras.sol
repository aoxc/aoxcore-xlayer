// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

/**
 * @title MockSurgicalInfras
 * @notice Simulates Sentinel AI and Repair Engine behavior for high-coverage testing.
 */
contract MockSurgicalInfras {
    bool public operational = true;
    bool public allowed = true;

    function setOperational(bool _status) external {
        operational = _status;
    }

    function setAllowed(bool _status) external {
        allowed = _status;
    }

    function isAllowed(address, address) external view returns (bool) {
        return allowed;
    }

    function isOperational(bytes4) external view returns (bool) {
        return operational;
    }
}
