# Project Overview

This project is built with Hardhat and provides the blockchain infrastructure for the Refundable Lottery game. The core implementation consists of two smart contracts: ChipsToken.sol and RefundableLottery.sol.

## ChipsToken.sol

ChipsToken.sol is a standard ERC20 token with unique features. In addition to the standard ERC20 functionality, it introduces a custom directTransferFrom method. This method allows authorized smart contracts (specifically the RefundableLottery contract) to directly transfer ChipsToken from a user’s account without requiring prior approval. However, only the token holder themselves can perform this operation, ensuring security.

## DEX Functionality

ChipsToken.sol also functions as a decentralized exchange (DEX), enabling users to buy and sell Chips tokens.

Buying Chips: The price is fixed at 1 ETH = 1000 Chips.
Selling Chips: The price is dynamic and determined by the depth of the liquidity pool within the ChipsToken contract. It utilizes the same price discovery mechanism as Uniswap, based on the x * y = k formula.
This dual functionality makes ChipsToken.sol both a versatile token and a built-in exchange, seamlessly integrated with the Refundable Lottery system.

## RefundableLottery.sol
This contract serves as the backbone of the lottery game, defining the game's rules and facilitating key operations. Players interact with this contract to purchase tickets, request refunds, roll the dice, and draw the lottery.

### Key Features

**1.Fair Randomness with Chainlink VRF**

The lottery's core mechanic, the drawing process, relies on generating random numbers. To ensure fairness, transparency, and impartiality, the contract leverages Chainlink VRF (Verifiable Random Function) for randomness generation.
Players can trigger the dice-rolling process during the READYTOROLL game state by calling the rollTheDice function. 

**2.Open-access Rolling and Drawing Process**

Rolling Phase: ANY player can trigger the dice-rolling process, after rollTheDice is called, the game state transitions to ROLLING.
Chainlink VRF then takes a few blocks to callback the generated random number to the RefundableLottery contract.

Drawing Phase: Once the random number is received, the game state changes to READYTODRAW.
ANY player can invoke the drawLottery function to distribute the prizes.
After the prize distribution, the current round ends, and the game seamlessly transitions to the next round.

**3.Reward Mechanism** 

The contract allows any player to participate in key phases of the game, ensuring decentralization and inclusivity.Players who trigger critical actions like rolling the dice are incentivized with small rewards, enhancing engagement and active participation.

**4.Immutable Rules**
This contract is designed to ensure a secure, fair, and transparent lottery experience for all participants. All rules are programmed into the blockchain contract, making them immutable—even the contract owner cannot modify them. The only benefit the owner receives is a 1% management fee; no additional privileges or advantages are granted.

Furthermore, the source code for both ChipsToken.sol and RefundableLottery.sol has been uploaded to the blockchain explorer and successfully verified, allowing anyone to review the code directly on the blockchain.

Try running some of the following tasks:
```shell
npx hardhat test
```
