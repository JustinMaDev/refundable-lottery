// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IChipsToken {
    function mint(address to, uint256 amount) external;
    function directTransferFrom(address from, address to, uint256 amount) external;
}

interface IFakeVRFCoordinator {
  function requestRandomWords(
    bytes32 keyHash,
    uint64 subId,
    uint16 minimumRequestConfirmations,
    uint32 callbackGasLimit,
    uint32 numWords
  ) external returns (uint256 requestId);
}

interface IConsumer {
  function invokeFulfillRandomWords(uint requestId, uint256[] memory randomWords) external;
}
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

contract MockVRFCoordinator is IFakeVRFCoordinator {
  IConsumer public consumer;
  uint public requestId = 1000;

  function requestRandomWords(
    bytes32 keyHash,
    uint64 subId,
    uint16 minimumRequestConfirmations,
    uint32 callbackGasLimit,
    uint32 numWords
  ) external override returns (uint256) {
    keyHash;
    subId;
    minimumRequestConfirmations;
    callbackGasLimit;
    numWords;
    requestId += 1;
    consumer = IConsumer(msg.sender);
    return requestId;
  }


  function testDrawLottert(uint jackpotNum) public {
    uint256[] memory randomWords = new uint256[](1);
    randomWords[0] = jackpotNum;
    consumer.invokeFulfillRandomWords(requestId, randomWords);
  }
}