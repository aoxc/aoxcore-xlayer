// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import "forge-std/Script.sol";
import "../src/AOXC.sol"; // Direkt kök dizinden çekiyoruz

contract DeployV1 is Script {
    function run() external {
        // Anvil Private Keys
        uint256 deployerKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80; // (0)
        
        address owner1 = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266; // (0)
        address owner2 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8; // (1)
        address owner3 = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC; // (2)

        vm.startBroadcast(deployerKey);

        // V1 Dağıtımı
        AOXC v1 = new AOXC();
        
        // Eğer AOXC.sol içinde AccessControl varsa yetkileri tanımlayalım
        // Yoksa bile sahipliği (Ownership) Multi-Sig mantığına göre kurgulayacağız
        console.log(">> V1 Legacy (AOXC.sol) Deployed at:", address(v1));
        
        // Örnek: Owner1'e ilk likiditeyi basalım
        // v1.mint(owner1, 1_000_000 * 1e18); 

        vm.stopBroadcast();
    }
}
