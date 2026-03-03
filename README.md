# 🏛️ AOXC-Core: The Sovereign Fleet (V2.0.0)

[![Network: X Layer](https://img.shields.io/badge/Network-X_Layer_Testnet-blueviolet?style=for-the-badge)](https://xlayer.okx.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Audit: Ready](https://img.shields.io/badge/Audit-Ready-gold?style=for-the-badge)](#)

## 🌌 Overview
**AOXC-Core** is a next-generation, modular liquidity and governance engine deployed on the **X Layer**. Architected under the "Sovereign Fleet" philosophy, the ecosystem orchestrates seven autonomous, high-integrity modules to ensure hyper-scalable security, AI-validated risk management, and decentralized sovereignty.

---

## 📡 Network Intelligence
| Parameter | Specification |
| :--- | :--- |
| **Network** | X Layer Testnet (Chain ID: 1952) |
| **Asset Class** | Native ETH / AOXC Governance Token |
| **Framework** | OpenZeppelin UUPS Upgradeable (ERC-1967) |
| **State Management** | ERC-7201 Namespaced Storage |
| **Development** | Foundry / Solidity 0.8.33 |

---

## 🔑 Administrative Sovereignty
The ecosystem is governed by a dual-layer authority structure to ensure maximum security:

* **Deployer/Operator:** `0xf1770ED6EDa59EAb4d0066847EfE2B1790a4749a`
* **AOXC DAO Council (Multisig):** `0x20c0DD8B6559912acfAC2ce061B8d5b19Db8CA84`
* **Native Token (AOXC):** `0xeb76789d889a9f4c68051e7D5B990666014E5946`

---

## 📍 Fleet Registry (Immutable Entry Points)
*These Proxy addresses serve as the perpetual gateway to the AOXC Ecosystem. The underlying Logic (Implementation) is hot-swappable via DAO consensus.*

| Module | Proxy Gateway (L3) | Implementation (L1) | Tier | Mission Profile |
| :--- | :--- | :--- | :---: | :--- |
| **REGISTRY** | `0xD3Baa55...C076` | `0xF3F1e29...e2a` | **MASTER** | Root Access & ACL Orchestrator |
| **NEXUS** | `0x3dA95dB...10d0` | `0xD0C5763...51a` | High | Governance & Monetary Policy |
| **VAULT** | `0xAFc060F...710d` | `0x21c5788...b69` | Ultra | Non-Custodial Asset Protection |
| **GATEWAY** | `0x052F0d2...6FB1` | `0x9c53f85...efb` | Mid | Cross-Chain Interoperability |
| **SENTINEL** | `0x59A85fb...aA3D` | `0xe4ecE3C...AED` | High | Neural Risk Enforcement (EIP-712) |
| **CORE** | `0x74c7423...9EA5` | `0x48F129d...D5f` | Core | Tokenomics & Velocity Control |

---

## 🔬 Security & Architectural Rigor

### 🛡️ Atomic Initialization Pattern
To eliminate the "Uninitialized Implementation" attack vector, all modules employ `_disableInitializers()`. Deployment is strictly handled via an atomic transaction through the **ERC1967Proxy**, ensuring no third-party can hijack the logic layer during onboarding.

### 🧬 "Citizen" Onboarding (Rule 2.0.0)
The system has transitioned from passive registration to an **Active Onboarding (onboardMember)** model. Every module is treated as a "Citizen" with specific ACL permissions, allowing the **Sentinel** to surgically isolate compromised modules without affecting the entire fleet.

### 📦 ERC-7201 Namespaced Storage
Storage layout is protected against collision during upgrades. By utilizing the `keccak256(abi.encode(uint256(keccak256("aoxc.storage.Module")) - 1)) & ~0xff` formula, the ecosystem guarantees a collision-free upgrade path for the next century of operations.

---

## ⚙️ Orchestration Script
The following verified script synchronizes the Sovereign Fleet within the Registry.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import {Script, console2} from "forge-std/Script.sol";
import {AOXCREGISTRY} from "../src/AOXCREGISTRY.sol";

/**
 * @title FleetSynchronization
 * @dev Status: VERIFIED & EXECUTED
 */
contract FleetSync is Script {
    AOXCREGISTRY registry = AOXCREGISTRY(0xD3Baa551eed9A3e7C856A5F87A0EA0361a24C076);

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        // Atomic Onboarding of Sovereign Modules
        registry.onboardMember(0x3dA95dB23aa88e5Aa0c5F5Cf9a765D56395b10d0); // NEXUS
        registry.onboardMember(0xAFc060Fd5Eb8249A99Fb135f73456eD7708A710D); // VAULT
        registry.onboardMember(0x052F0d2435913Bb6a2E7292000d17F75fdAc6FB1); // GATEWAY
        registry.onboardMember(0x59A85fb33e122B96086721388B3B0E909ab1aA3D); // SENTINEL
        registry.onboardMember(0x74c7423D5ad0A3780c235000607e19f46d7D9EA5); // CORE

        vm.stopBroadcast();
        console2.log(">>> Fleet Status: Synchronized & Sovereign.");
    }
}
