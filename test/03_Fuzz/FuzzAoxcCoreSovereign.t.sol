// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import {Test} from "forge-std/Test.sol";
import "aoxc/core/AoxcCore.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "aoxc/libraries/AoxcConstants.sol";
import {MockSurgicalInfras} from "../mocks/MockSurgicalInfras.sol";

contract Fuzz_AoxcCore_Sovereign is Test {
    AoxcCore public core;
    MockSurgicalInfras public mockInfra;

    address public nexus = makeAddr("NEXUS");
    address public sentinel = makeAddr("SENTINEL");
    address public admin = makeAddr("ADMIN");
    address public userA = makeAddr("USER_A");
    address public userB = makeAddr("USER_B");

    function setUp() public {
        vm.startPrank(admin);
        mockInfra = new MockSurgicalInfras();
        mockInfra.setOperational(true);

        AoxcCore implementation = new AoxcCore();
        bytes memory initData = abi.encodeCall(AoxcCore.initializeV2, (nexus, sentinel, address(mockInfra), admin));
        core = AoxcCore(address(new ERC1967Proxy(address(implementation), initData)));
        vm.stopPrank();

        // ÖNEMLİ: setUp içinde yüklü mint yapmıyoruz ki limitler fuzz'a kalsın.
        vm.prank(nexus);
        core.mint(admin, 100 ether);
    }

    function testFuzz_SimpleMint(uint256 amount) public {
        // En basit kısıtlama: Yıllık limitin (2M ether) çok altında kalalım.
        // 1 ether ile 10.000 ether arası güvenli bölge.
        uint256 safeAmount = bound(amount, 1 ether, 10_000 ether);

        vm.prank(nexus);
        core.mint(userA, safeAmount);

        assertEq(core.balanceOf(userA), safeAmount);
    }

    function testFuzz_SimpleTransfer(uint256 txAmount) public {
        // 1. Önce userA'ya 1000 ether verelim.
        vm.prank(nexus);
        core.mint(userA, 1000 ether);

        // 2. 1000 ether varken %0.5 limit yaklaşık 5 ether civarıdır.
        // Riski sıfırlamak için 1-4 ether arası transfer edelim.
        uint256 safeTx = bound(txAmount, 1, 4 ether);

        vm.mockCall(sentinel, abi.encodeWithSignature("isAllowed(address,address)"), abi.encode(true));

        vm.prank(userA);
        assertTrue(core.transfer(userB, safeTx));
    }

    function test_SimpleTemporal() public {
        vm.prank(nexus);
        core.mint(userA, 100 ether);
        vm.mockCall(sentinel, abi.encodeWithSignature("isAllowed(address,address)"), abi.encode(true));

        vm.prank(userA);
        core.transfer(userB, 1);

        vm.roll(block.number + 1); // Blok ilerle

        vm.prank(userA);
        assertTrue(core.transfer(userB, 1));
    }
}
