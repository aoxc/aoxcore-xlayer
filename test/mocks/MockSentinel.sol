// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import {IAoxcCore} from "aoxc-interfaces/IAoxcCore.sol";

contract MockSentinel {
    bool private nextResult = true;

    function setValidationResult(bool result) external {
        nextResult = result;
    }

    // Gateway'in bekledigi fonksiyon ismi
    function validateNeuralPacket(IAoxcCore.NeuralPacket calldata /* packet */) external view returns (bool) {
        return nextResult;
    }
}
