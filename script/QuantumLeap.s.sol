// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import "forge-std/Script.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "../src/core/AoxcCore.sol";
import "../src/access/AoxcSentinel.sol";
import "../src/finance/AoxcVault.sol";

contract QuantumLeap is Script {
    // AZ ÖNCE DAĞITTIĞIMIZ V1 ADRESİ
    address constant V1_AOXC = 0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82;

    function run() external {
        uint256 deployerKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        address admin = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        // 1. V2 Core (Implementation)
        AoxcCore coreImpl = new AoxcCore();
        // 2. V2 Core (Proxy)
        AoxcCore core = AoxcCore(address(new ERC1967Proxy(address(coreImpl), "")));
        
        // 3. Sentinel (AI Gözü)
        AoxcSentinel sentinelImpl = new AoxcSentinel();
        AoxcSentinel sentinel = AoxcSentinel(address(new ERC1967Proxy(address(sentinelImpl), "")));

        // 4. SİSTEMİ BAŞLAT (Initialize)
        // V1'i V2'ye miras bırakıyoruz
        core.initializeV2(
            V1_AOXC,       // Legacy V1 Bağlantısı
            admin,         // Governance Hub (Şimdilik admin)
            address(sentinel),
            admin,         // Repair Engine
            admin,         // Admin
            keccak256("AOXC_V2_LOCAL_READY")
        );

        console.log(">> V2 Core (Proxy) Deployed at:", address(core));
        console.log(">> Sentinel Deployed at:", address(sentinel));
        console.log(">> V1 Legacy Linked:", V1_AOXC);

        vm.stopBroadcast();
    }
}
