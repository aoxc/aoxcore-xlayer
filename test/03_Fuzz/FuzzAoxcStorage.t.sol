// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import {Test} from "forge-std/Test.sol";
import {AoxcConstants} from "aoxc-libraries/AoxcConstants.sol";

/**
 * @title FuzzAoxcStorage
 * @notice Collision resistance testing for ERC-7201 namespaces.
 */
contract FuzzAoxcStorage is Test {
    // Sabitleri kütüphaneden çekerek yerel scope'a alıyoruz
    bytes32 internal constant MAIN_STORAGE_SLOT = AoxcConstants.MAIN_STORAGE_SLOT;
    bytes32 internal constant REGISTRY_V2_SLOT = AoxcConstants.REGISTRY_V2_SLOT;
    bytes32 internal constant NEXUS_V2_SLOT = AoxcConstants.NEXUS_V2_SLOT;
    bytes32 internal constant STAKING_STORAGE_SLOT = AoxcConstants.STAKING_STORAGE_SLOT;

    /**
     * @notice Brute-force collision check against fixed system slots.
     */
    function testFuzz_Storage_Collision_Resistance(bytes32 randomSlot) public pure {
        // Rastgele üretilen bir slot, sistemin kritik alanlarıyla çakışmamalı
        if (randomSlot == MAIN_STORAGE_SLOT) revert("Collision: Main");
        if (randomSlot == REGISTRY_V2_SLOT) revert("Collision: Registry");
        if (randomSlot == NEXUS_V2_SLOT) revert("Collision: Nexus");
        if (randomSlot == STAKING_STORAGE_SLOT) revert("Collision: Staking");
    }
}
