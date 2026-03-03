// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import {Script, console2} from "forge-std/Script.sol";
import {IAoxcRegistry} from "../../src/interfaces/IAoxcRegistry.sol";

contract SyncFleet is Script {
    // Registry Address from README
    address constant REGISTRY_PROXY = 0xD3Baa551eed9A3e7C856A5F87A0EA0361a24C076;

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);

        IAoxcRegistry registry = IAoxcRegistry(REGISTRY_PROXY);

        // Onboarding Modules
        registry.onboardMember(0x3dA95dB23aa88e5Aa0c5F5Cf9a765D56395b10d0); // NEXUS
        registry.onboardMember(0xAFc060Fd5Eb8249A99Fb135f73456eD7708A710D); // VAULT
        registry.onboardMember(0x59A85fb33e122B96086721388B3B0E909ab1aA3D); // SENTINEL
        registry.onboardMember(0x74c7423D5ad0A3780c235000607e19f46d7D9EA5); // CORE

        vm.stopBroadcast();
        console2.log(">>> Fleet Status: Synchronized & Sovereign.");
    }
}
