// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import {Script, console2} from "forge-std/Script.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {AoxcCore} from "../../src/AoxcCore.sol";
import {AoxcSentinel} from "../../src/AoxcSentinel.sol";
import {AoxcRegistry} from "../../src/AoxcRegistry.sol";

contract DeployFleet is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address admin = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        // 1. Deploy Registry (Master Orchestrator)
        AoxcRegistry registryImpl = new AoxcRegistry();
        ERC1967Proxy registryProxy = new ERC1967Proxy(
            address(registryImpl),
            abi.encodeWithSelector(AoxcRegistry.initialize.selector, admin)
        );
        console2.log("Registry Proxy:", address(registryProxy));

        // 2. Deploy Sentinel (Neural Guard)
        AoxcSentinel sentinelImpl = new AoxcSentinel();
        ERC1967Proxy sentinelProxy = new ERC1967Proxy(
            address(sentinelImpl),
            abi.encodeWithSelector(AoxcSentinel.initializeV2.selector, admin, admin, address(0), address(0))
        );
        console2.log("Sentinel Proxy:", address(sentinelProxy));

        // 3. Deploy Core (The Heart)
        AoxcCore coreImpl = new AoxcCore();
        ERC1967Proxy coreProxy = new ERC1967Proxy(
            address(coreImpl),
            abi.encodeWithSelector(AoxcCore.initializeV2.selector, address(0), admin, address(sentinelProxy), address(0), admin, keccak256("AOXC_V2"))
        );
        console2.log("Core Proxy:", address(coreProxy));

        vm.stopBroadcast();
    }
}
