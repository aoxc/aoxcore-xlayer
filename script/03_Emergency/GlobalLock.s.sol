// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import {Script} from "forge-std/Script.sol";
import {IAoxcCore} from "../../src/interfaces/IAoxcCore.sol";

contract GlobalLock is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address coreProxy = 0x74c7423D5ad0A3780c235000607e19f46d7D9EA5;

        vm.startBroadcast(pk);
        IAoxcCore(coreProxy).setCoreLock(true); // Rule 10 Enforcement
        vm.stopBroadcast();
    }
}
