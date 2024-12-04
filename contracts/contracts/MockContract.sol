// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "./RefundableLottery.sol";

contract MockLotteryContract {
    IChipsToken public chipsToken;

    constructor(address _chipsToken) {
        chipsToken = IChipsToken(_chipsToken);
    }

    function invokeMint(address to, uint256 amount) public {
        chipsToken.mint(to, amount);
    }

    function invokeDirectTransferFrom(address from, address to, uint256 amount) public {
        chipsToken.directTransferFrom(from, to, amount);
    }
}

contract RefundableLotteryForTest is RefundableLottery {
  constructor(uint256 _subscriptionId, address _vrf, bytes32 _keyHash, address _chipsToken) 
    RefundableLottery(_subscriptionId, _vrf, _keyHash, _chipsToken) {
    }

  function drawLotteryForTest(uint _jackpotNum)public{
    drawLotteryInternal(_jackpotNum);
  }
}