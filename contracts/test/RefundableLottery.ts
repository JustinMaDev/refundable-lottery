import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers, toBigInt, parseEther} from "ethers";
import hardhat, { network } from "hardhat";
import { any } from "hardhat/internal/core/params/argumentTypes";

describe("RefundableLottery", function () {
  let chipsToken, refundableLottery, owner, playerA, playerB, playerC;
  const metrix = [];

  async function deployRefundableLottery() {
    const [owner, playerA, playerB, playerC] = await hardhat.ethers.getSigners();
    const ChipsToken = await hardhat.ethers.getContractFactory("ChipsToken");
    const chipsToken = await ChipsToken.deploy("ChipsToken", "CHIPS");

    const RefundableLottery = await hardhat.ethers.getContractFactory("RefundableLotteryForTest");
    const keyHash = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c";
    const fakeVrsCoordinator = playerC;
    const refundableLottery = await RefundableLottery.deploy(0, fakeVrsCoordinator, keyHash, chipsToken.getAddress());

    return { chipsToken, refundableLottery, owner, playerA, playerB, playerC };
  }

  async function timeFlow(blocks) {
    for (let i = 0; i < blocks; i++) {
      await hardhat.network.provider.send("evm_mine");
    }
  }
  async function timeFlowToRoundEnd() {
    const roundPeriod = await refundableLottery.ROUND_PERIOD();
    for (let i = 0; i < roundPeriod; i++) {
      await hardhat.network.provider.send("evm_mine");
    }
  }

  beforeEach(async function () {
    const fixture = await loadFixture(deployRefundableLottery);
    chipsToken = fixture.chipsToken;
    refundableLottery = fixture.refundableLottery;
    owner = fixture.owner;
    playerA = fixture.playerA;
    playerB = fixture.playerB;
    playerC = fixture.playerC;
  });

  after(async function () {
    console.table(metrix);
  });

  describe("Check constructor", function () {
    it("Check chips token address", async function () {
      expect(await refundableLottery.chipsToken()).to.equal(await chipsToken.getAddress());
    });
    it("Check manager", async function () {
      expect(await refundableLottery.manager()).to.equal(owner.address);
    });
  });

  describe("BuyTicket", function () {
    it("Buy a ticket with less ether", async function () {
      let ticketPrice = await refundableLottery.TICKET_PRICE_IN_ETHER();
      ticketPrice = ticketPrice - BigInt(1);

      await expect(refundableLottery.buyTicketWithEther(6550, { value: ticketPrice })).to.be.revertedWith("The price for a ticket is 0.01 ether");
    });

    it("Buy a ticket with more ether", async function () {
      let ticketPrice = await refundableLottery.TICKET_PRICE_IN_ETHER();
      ticketPrice = ticketPrice + BigInt(1);

      await expect(refundableLottery.buyTicketWithEther(6550, { value: ticketPrice })).to.be.revertedWith("The price for a ticket is 0.01 ether");
    });

    it("Buy a ticket with invalid ticket number", async function () {
      let ticketPrice = await refundableLottery.TICKET_PRICE_IN_ETHER();
      await expect(refundableLottery.buyTicketWithEther(65536, { value: ticketPrice })).to.be.revertedWith("Invalid ticket number");
    });

    it("Buy a ticket with correct ether", async function () {
      let ticketPrice = await refundableLottery.TICKET_PRICE_IN_ETHER();

      const tx = await refundableLottery.buyTicketWithEther(6550, { value: ticketPrice });
      const receipt = await tx.wait();
      metrix.push({ Operation : "BuyTicketWithEther", Gas : receipt.gasUsed });

      const contract_balance = await refundableLottery.runner?.provider?.getBalance(refundableLottery.getAddress());
      expect(contract_balance).to.equal(ticketPrice);
    });

    it("Buy a ticket with invalid ticket number", async function () {
      await chipsToken.addMinter(refundableLottery.getAddress());

      let ticketPrice = await refundableLottery.TICKET_PRICE_IN_ETHER();
      await expect(refundableLottery.buyTicketWithChips(65536)).to.be.revertedWith("Invalid ticket number");
    });

    it("Buy a ticket with chips and balance not sufficent", async function () {
      let ticketPriceInEther = await refundableLottery.TICKET_PRICE_IN_ETHER();
      await refundableLottery.buyTicketWithEther(6550, { value: ticketPriceInEther });
      await chipsToken.addMinter(refundableLottery.getAddress());
      await chipsToken.transfer(playerA.address, parseEther("4"));

      await expect(refundableLottery.connect(playerA).buyTicketWithChips(35)).to.be.reverted;
    });

    it("Buy a ticket with enough chips", async function () {
      let ticketPriceinEther = await refundableLottery.TICKET_PRICE_IN_ETHER();
      await refundableLottery.buyTicketWithEther(6550, { value: ticketPriceinEther });
      await chipsToken.addMinter(refundableLottery.getAddress());
      await chipsToken.transfer(playerA.address, parseEther("1000"));
      
      const tx = await refundableLottery.connect(playerA).buyTicketWithChips(6551);
      const receipt = await tx.wait();
      metrix.push({ Operation : "BuyTicketWithChips", Gas : receipt.gasUsed });

      const ticketPrice = await refundableLottery.getDiscountedPriceInChips();
      expect(await chipsToken.balanceOf(playerA.address)).to.equal(parseEther("1000") - ticketPrice);
      expect(await chipsToken.balanceOf(refundableLottery.getAddress())).to.equal(ticketPrice);
    });

    it("But ticket with chips while chips player exceed the limit", async function () {
      let ticketPriceinEther = await refundableLottery.TICKET_PRICE_IN_ETHER();
      await refundableLottery.buyTicketWithEther(6550, { value: ticketPriceinEther });
      await chipsToken.addMinter(refundableLottery.getAddress());
      await chipsToken.transfer(playerA.address, parseEther("1000"));
      
      await refundableLottery.connect(playerA).buyTicketWithChips(6551);

      await expect(refundableLottery.connect(playerA).buyTicketWithChips(6552)).to.be.revertedWith("The number of players using ChipsToken should be less than 50% of the total players");
    });
  });

  describe("Draw Lottery", function () {
    it("playerA buy a ticket using ether and hit the jackpot", async function () {
      let ticketPrice = await refundableLottery.TICKET_PRICE_IN_ETHER();
      const ticketNumber = 6550;
      await refundableLottery.connect(playerA).buyTicketWithEther(ticketNumber, { value: ticketPrice });
      await timeFlowToRoundEnd();

      const roundNumber = await refundableLottery.roundNumber();
      const managementFeeRate = await refundableLottery.MANAGEMENT_FEE_RATE();

      const prizePool = ticketPrice - toBigInt(ticketPrice*managementFeeRate)/toBigInt(100);
      const balanceBefore = await refundableLottery.runner?.provider?.getBalance(playerA.address);

      const tx = await refundableLottery.drawLotteryForTest(ticketNumber);
      const receipt = await tx.wait();
      metrix.push({ Operation : "DrawLottery for Ether Winner", Gas : receipt.gasUsed });
      await expect(tx)
        .to.emit(refundableLottery, "DrawLottery")
        .withArgs(roundNumber, ticketNumber, playerA.address, prizePool, 0)
        .to.emit(refundableLottery, "RoundEnded")
        .withArgs(roundNumber, ticketNumber, 1)
        .to.emit(refundableLottery, "RoundStarted")
        .withArgs(roundNumber + toBigInt(1));

      const balanceAfter = await refundableLottery.runner?.provider?.getBalance(playerA.address);
      expect(balanceAfter - balanceBefore).to.equal(prizePool);

      const contractEhterBalance = await refundableLottery.runner?.provider?.getBalance(refundableLottery.getAddress());
      const contractChipsBalance = await chipsToken.balanceOf(refundableLottery.getAddress());
      expect(contractEhterBalance).to.equal(toBigInt(0));
      expect(contractChipsBalance).to.equal(toBigInt(0));
    });

    it("playerA buy a ticket using chips and hit the jackpot", async function () {
      let ticketPriceInEther = await refundableLottery.TICKET_PRICE_IN_ETHER();
      await refundableLottery.buyTicketWithEther(6550, { value: ticketPriceInEther });
      await chipsToken.addMinter(refundableLottery.getAddress());
      await chipsToken.transfer(playerA.address, parseEther("1000"));
      
      const ticketNumber = 6666;
      await refundableLottery.connect(playerA).buyTicketWithChips(ticketNumber);
      await timeFlowToRoundEnd();

      const roundNumber = await refundableLottery.roundNumber();
      const managementFeeRate = await refundableLottery.MANAGEMENT_FEE_RATE();
      const ticketPriceInChips = await refundableLottery.getDiscountedPriceInChips();
      
      const prizePoolEther = ticketPriceInEther - toBigInt(ticketPriceInEther*managementFeeRate)/toBigInt(100);
      const prizePoolChips = ticketPriceInChips - toBigInt(ticketPriceInChips*managementFeeRate)/toBigInt(100);
      const manageFeeEther = toBigInt(ticketPriceInEther*managementFeeRate)/toBigInt(100);
      const manageFeeChips = toBigInt(ticketPriceInChips*managementFeeRate)/toBigInt(100);

      const winnerEtherBalanceBefore = await refundableLottery.runner?.provider?.getBalance(playerA.address);
      const winnerChipsBalanceBefore = await chipsToken.balanceOf(playerA.address);
      const ownerEtherBalanceBefore = await refundableLottery.runner?.provider?.getBalance(owner.address);
      const ownerChipsBalanceBefore = await chipsToken.balanceOf(owner.address);

      const tx = await refundableLottery.connect(playerB).drawLotteryForTest(ticketNumber);
      const receipt = await tx.wait();
      metrix.push({ Operation : "DrawLottery for Chips Winner", Gas : receipt.gasUsed });

      await expect(tx)
        .to.emit(refundableLottery, "DrawLottery")
        .withArgs(roundNumber, ticketNumber, playerA.address, prizePoolEther, prizePoolChips)
        .to.emit(refundableLottery, "RoundEnded")
        .withArgs(roundNumber, ticketNumber, 1)

      const etherBalanceAfter = await refundableLottery.runner?.provider?.getBalance(playerA.address);
      const chipsBalanceAfter = await chipsToken.balanceOf(playerA.address);
      const ownerEtherBalanceAfter = await refundableLottery.runner?.provider?.getBalance(owner.address);
      const ownerChipsBalanceAfter = await chipsToken.balanceOf(owner.address);

      expect(etherBalanceAfter - winnerEtherBalanceBefore).to.equal(prizePoolEther);
      expect(chipsBalanceAfter - winnerChipsBalanceBefore).to.equal(prizePoolChips);
      expect(ownerEtherBalanceAfter - ownerEtherBalanceBefore).to.equal(manageFeeEther);
      expect(ownerChipsBalanceAfter - ownerChipsBalanceBefore).to.equal(manageFeeChips);

      const contractEhterBalance = await refundableLottery.runner?.provider?.getBalance(refundableLottery.getAddress());
      const contractChipsBalance = await chipsToken.balanceOf(refundableLottery.getAddress());
      expect(contractEhterBalance).to.equal(toBigInt(0));
      expect(contractChipsBalance).to.equal(toBigInt(0));
    });

    it("More than one winners", async function () {
      let ticketPriceInEther = await refundableLottery.TICKET_PRICE_IN_ETHER();
      await refundableLottery.buyTicketWithEther(6550, { value: ticketPriceInEther });
      await chipsToken.addMinter(refundableLottery.getAddress());
      await chipsToken.transfer(playerA.address, parseEther("1000"));
      
      const ticketNumber = 6666;
      await refundableLottery.connect(playerA).buyTicketWithChips(ticketNumber);
      await refundableLottery.connect(playerB).buyTicketWithEther(ticketNumber, { value: ticketPriceInEther });
      await timeFlowToRoundEnd();

      const roundNumber = await refundableLottery.roundNumber();
      const managementFeeRate = await refundableLottery.MANAGEMENT_FEE_RATE();
      const ticketPriceInChips = await refundableLottery.getDiscountedPriceInChips();
      
      const prizePoolEther = toBigInt(2)*(ticketPriceInEther - toBigInt(ticketPriceInEther*managementFeeRate)/toBigInt(100));
      const prizePoolChips = ticketPriceInChips - toBigInt(ticketPriceInChips*managementFeeRate)/toBigInt(100);
      const manageFeeEther = toBigInt(2)*toBigInt(ticketPriceInEther*managementFeeRate)/toBigInt(100);
      const manageFeeChips = toBigInt(ticketPriceInChips*managementFeeRate)/toBigInt(100);
      const prizeEther = prizePoolEther/toBigInt(2);
      const prizeChips = prizePoolChips/toBigInt(2);

      const winnerAEtherBalanceBefore = await refundableLottery.runner?.provider?.getBalance(playerA.address);
      const winnerAChipsBalanceBefore = await chipsToken.balanceOf(playerA.address);
      const winnerBEtherBalanceBefore = await refundableLottery.runner?.provider?.getBalance(playerB.address);
      const winnerBChipsBalanceBefore = await chipsToken.balanceOf(playerB.address);
      const ownerEtherBalanceBefore = await refundableLottery.runner?.provider?.getBalance(owner.address);
      const ownerChipsBalanceBefore = await chipsToken.balanceOf(owner.address);

      const tx = await refundableLottery.connect(playerC).drawLotteryForTest(ticketNumber);
      const receipt = await tx.wait();
      await expect(tx)  
        .to.emit(refundableLottery, "DrawLottery")
        .withArgs(roundNumber, ticketNumber, playerA.address, prizeEther, prizeChips)
        .to.emit(refundableLottery, "DrawLottery")
        .withArgs(roundNumber, ticketNumber, playerB.address, prizeEther, prizeChips)
        .to.emit(refundableLottery, "RoundEnded")
        .withArgs(roundNumber, ticketNumber, 2)

      const winnerAEtherBalanceAfter = await refundableLottery.runner?.provider?.getBalance(playerA.address);
      const winnerAChipsBalanceAfter = await chipsToken.balanceOf(playerA.address);
      const winnerBEtherBalanceAfter = await refundableLottery.runner?.provider?.getBalance(playerB.address);
      const winnerBChipsBalanceAfter = await chipsToken.balanceOf(playerB.address);
      const ownerEtherBalanceAfter = await refundableLottery.runner?.provider?.getBalance(owner.address);
      const ownerChipsBalanceAfter = await chipsToken.balanceOf(owner.address);

      expect(winnerAEtherBalanceAfter - winnerAEtherBalanceBefore).to.equal(prizeEther);
      expect(winnerAChipsBalanceAfter - winnerAChipsBalanceBefore).to.equal(prizeChips);
      expect(winnerBEtherBalanceAfter - winnerBEtherBalanceBefore).to.equal(prizeEther);
      expect(winnerBChipsBalanceAfter - winnerBChipsBalanceBefore).to.equal(prizeChips);
      expect(ownerEtherBalanceAfter - ownerEtherBalanceBefore).to.equal(manageFeeEther);
      expect(ownerChipsBalanceAfter - ownerChipsBalanceBefore).to.equal(manageFeeChips);

      const contractEhterBalance = await refundableLottery.runner?.provider?.getBalance(refundableLottery.getAddress());
      const contractChipsBalance = await chipsToken.balanceOf(refundableLottery.getAddress());
      expect(contractEhterBalance).to.equal(toBigInt(0));
      expect(contractChipsBalance).to.equal(toBigInt(0));
    });
    
    it("PlayerA buy mutiple tickets with same number using ether and hit the jackpot", async function () {
      let ticketPriceInEther = await refundableLottery.TICKET_PRICE_IN_ETHER();
      const ticketCount = 30;
      const ticketNumber = 6550;
      for (let i = 0; i < ticketCount; i++) {
        await refundableLottery.connect(playerA).buyTicketWithEther(ticketNumber, { value: ticketPriceInEther });
      }
      
      const roundNumber = await refundableLottery.roundNumber();
      await timeFlowToRoundEnd();

      const managementFeeRate = await refundableLottery.MANAGEMENT_FEE_RATE();
      const prizePool = toBigInt(ticketCount)*(ticketPriceInEther - toBigInt(ticketPriceInEther*managementFeeRate)/toBigInt(100));
      const balanceBefore = await refundableLottery.runner?.provider?.getBalance(playerA.address);

      const tx = await refundableLottery.drawLotteryForTest(ticketNumber);
      const receipt = await tx.wait();
      metrix.push({ Operation : `DrawLottery for ${ticketCount} Ether Winner`, Gas : receipt.gasUsed });
      await expect(tx)
        .to.emit(refundableLottery, "DrawLottery")
        .withArgs(roundNumber, ticketNumber, playerA.address, prizePool/toBigInt(ticketCount), 0)
        .to.emit(refundableLottery, "RoundEnded")
        .withArgs(roundNumber, ticketNumber, ticketCount)
        .to.emit(refundableLottery, "RoundStarted")
        .withArgs(roundNumber + toBigInt(1));

      const balanceAfter = await refundableLottery.runner?.provider?.getBalance(playerA.address);
      expect(balanceAfter - balanceBefore).to.equal(prizePool);

      const contractEhterBalance = await refundableLottery.runner?.provider?.getBalance(refundableLottery.getAddress());
      expect(contractEhterBalance).to.equal(toBigInt(0));
    });

    it("PlayerA buy mutiple tickets with same number using chips and hit the jackpot", async function () {
      await chipsToken.addMinter(refundableLottery.getAddress());
      let ticketPriceInEther = await refundableLottery.TICKET_PRICE_IN_ETHER();
      const ticketCount = 30;
      for (let i = 0; i < ticketCount; i++) {
        await refundableLottery.connect(playerB).buyTicketWithEther(6550, { value: ticketPriceInEther });
      }
      
      const ticketNumber = 6551;
      await chipsToken.transfer(playerA.address, parseEther("10000"));
      for (let i = 0; i < ticketCount; i++) {        
        await refundableLottery.connect(playerA).buyTicketWithChips(ticketNumber);
      }

      const roundNumber = await refundableLottery.roundNumber();
      await timeFlowToRoundEnd();

      const managementFeeRate = await refundableLottery.MANAGEMENT_FEE_RATE();
      const ticketPriceInChips = await refundableLottery.getDiscountedPriceInChips();
      const prizePoolEther = toBigInt(ticketCount)*(ticketPriceInEther - toBigInt(ticketPriceInEther*managementFeeRate)/toBigInt(100));
      const prizePoolChips = toBigInt(ticketCount)*(ticketPriceInChips - toBigInt(ticketPriceInChips*managementFeeRate)/toBigInt(100));
      const balanceBefore = await refundableLottery.runner?.provider?.getBalance(playerA.address);
      const chipsBalanceBefore = await chipsToken.balanceOf(playerA.address);

      const tx = await refundableLottery.connect(playerB).drawLotteryForTest(ticketNumber);
      const receipt = await tx.wait();
      metrix.push({ Operation : `DrawLottery for ${ticketCount} Chips Winners`, Gas : receipt.gasUsed });
      await expect(tx)
        .to.emit(refundableLottery, "DrawLottery")
        .withArgs(roundNumber, ticketNumber, playerA.address, prizePoolEther/toBigInt(ticketCount), prizePoolChips/toBigInt(ticketCount))
        .to.emit(refundableLottery, "RoundEnded")
        .withArgs(roundNumber, ticketNumber, ticketCount)
        .to.emit(refundableLottery, "RoundStarted")
        .withArgs(roundNumber + toBigInt(1));

      const balanceAfter = await refundableLottery.runner?.provider?.getBalance(playerA.address);
      const chipsBalanceAfter = await chipsToken.balanceOf(playerA.address);

      expect(balanceAfter - balanceBefore).to.equal(prizePoolEther);
      expect(chipsBalanceAfter - chipsBalanceBefore).to.equal(prizePoolChips);

      const contractEhterBalance = await refundableLottery.runner?.provider?.getBalance(refundableLottery.getAddress());
      const contractChipsBalance = await chipsToken.balanceOf(refundableLottery.getAddress());
      expect(contractEhterBalance).to.equal(toBigInt(0));
      expect(contractChipsBalance).to.equal(toBigInt(0));
    });
  });

  describe("Check Refund", function () {
    it("Refund ether when current round is running", async function () {
      let ticketPriceInEther = await refundableLottery.TICKET_PRICE_IN_ETHER();
      await refundableLottery.buyTicketWithEther(6550, { value: ticketPriceInEther });
      
      const roundNumber = await refundableLottery.roundNumber();
      await expect(refundableLottery.refund(roundNumber))
      .to.be.revertedWith("You can not refund a round which is not completed");
    });

    it("Refund chips when current round is running", async function () {
      let ticketPriceInEther = await refundableLottery.TICKET_PRICE_IN_ETHER();
      await refundableLottery.buyTicketWithEther(6550, { value: ticketPriceInEther });
      await chipsToken.addMinter(refundableLottery.getAddress());
      await chipsToken.transfer(playerA.address, parseEther("1000"));
      
      await refundableLottery.connect(playerA).buyTicketWithChips(6551);

      const roundNumber = await refundableLottery.roundNumber();
      await expect(refundableLottery.connect(playerA).refund(roundNumber))
      .to.be.revertedWith("You can not refund a round which is not completed");
    });

    it("Refund ether when current round is ended but not drawn yet", async function () {
      let ticketPriceInEther = await refundableLottery.TICKET_PRICE_IN_ETHER();
      await refundableLottery.buyTicketWithEther(6550, { value: ticketPriceInEther });
      await timeFlowToRoundEnd();

      const roundNumber = await refundableLottery.roundNumber();
      await expect(refundableLottery.refund(roundNumber))
      .to.be.revertedWith("You can not refund a round which is not completed");
    });

    it("Refund chips when current round is ended but not drawn yet", async function () {
      let ticketPriceInEther = await refundableLottery.TICKET_PRICE_IN_ETHER();
      await refundableLottery.buyTicketWithEther(6550, { value: ticketPriceInEther });
      await chipsToken.addMinter(refundableLottery.getAddress());
      await chipsToken.transfer(playerA.address, parseEther("1000"));
      const roundNumber = await refundableLottery.roundNumber();
      await refundableLottery.connect(playerA).buyTicketWithChips(6551);

      await timeFlowToRoundEnd();

      await expect(refundableLottery.connect(playerA).refund(roundNumber))
      .to.be.revertedWith("You can not refund a round which is not completed");
    });

    it("Refund ether when current round is ended with winner(s)", async function () {
      let ticketPriceInEther = await refundableLottery.TICKET_PRICE_IN_ETHER();
      const ticketNumber = 6666;
      await refundableLottery.buyTicketWithEther(ticketNumber, { value: ticketPriceInEther });
      const roundNumber = await refundableLottery.roundNumber();
      
      await timeFlowToRoundEnd();

      await refundableLottery.connect(playerB).drawLotteryForTest(ticketNumber);

      await expect(refundableLottery.refund(roundNumber))
      .to.be.revertedWith("The prize pool of this round has been taken by the winner(s)");
    });
    
    it("Refund chips when current round is ended with winner(s)", async function () {
      let ticketPriceInEther = await refundableLottery.TICKET_PRICE_IN_ETHER();
      await refundableLottery.buyTicketWithEther(6550, { value: ticketPriceInEther });
      await chipsToken.addMinter(refundableLottery.getAddress());
      await chipsToken.transfer(playerA.address, parseEther("1000"));
      
      const ticketNumber = 6666;
      await refundableLottery.connect(playerA).buyTicketWithChips(ticketNumber);
      await timeFlowToRoundEnd();

      const roundNumber = await refundableLottery.roundNumber();
      await refundableLottery.connect(playerB).drawLotteryForTest(ticketNumber);

      await expect(refundableLottery.connect(playerA).refund(roundNumber))
      .to.be.revertedWith("The prize pool of this round has been taken by the winner(s)");
    });

    it("Refund ether", async function () {
      await chipsToken.addMinter(refundableLottery.getAddress());
      let ticketPriceInEther = await refundableLottery.TICKET_PRICE_IN_ETHER();
      await refundableLottery.buyTicketWithEther(6550, { value: ticketPriceInEther });
      const roundNumber = await refundableLottery.roundNumber();
      await timeFlowToRoundEnd();

      await refundableLottery.connect(playerA).drawLotteryForTest(6551);

      const managementFeeRate = await refundableLottery.MANAGEMENT_FEE_RATE();
      const managementFee = toBigInt(ticketPriceInEther*managementFeeRate)/toBigInt(100);
      const refundAmount = ticketPriceInEther - managementFee;
      const balanceBefore = await refundableLottery.runner?.provider?.getBalance(owner.address);
      const chipsBalanceBefore = await chipsToken.balanceOf(owner.address);
      const chipsPricePerEther = await refundableLottery.CHIPS_PRICE_PER_ETHER();

      const tx = await refundableLottery.refund(roundNumber);
      const receipt = await tx.wait();
      const transactionCost = toBigInt(receipt.gasUsed) * toBigInt(tx.gasPrice);
      const chipsReward = managementFee * chipsPricePerEther;
      metrix.push({ Operation : "Refund Ether", Gas : receipt.gasUsed });

      await expect(tx)
        .to.emit(refundableLottery, "Refund")
        .withArgs(roundNumber, owner.address, refundAmount, 0);

      const balanceAfter = await refundableLottery.runner?.provider?.getBalance(owner.address);
      const chipsBalanceAfter = await chipsToken.balanceOf(owner.address);

      expect(balanceAfter - balanceBefore).to.equal(refundAmount - transactionCost);
      expect(chipsBalanceAfter - chipsBalanceBefore).to.equal(chipsReward);
    });

    it("Refund chips", async function () {
      let ticketPriceInEther = await refundableLottery.TICKET_PRICE_IN_ETHER();
      await refundableLottery.buyTicketWithEther(6550, { value: ticketPriceInEther });
      await chipsToken.addMinter(refundableLottery.getAddress());
      await chipsToken.transfer(playerA.address, parseEther("1000"));
      
      await refundableLottery.connect(playerA).buyTicketWithChips(6551);
      const roundNumber = await refundableLottery.roundNumber();
      await timeFlowToRoundEnd();

      await refundableLottery.connect(playerB).drawLotteryForTest(6552);

      const managementFeeRate = await refundableLottery.MANAGEMENT_FEE_RATE();
      const ticketPriceInChips = await refundableLottery.getDiscountedPriceInChips();
      const refundAmount = ticketPriceInChips - toBigInt(ticketPriceInChips*managementFeeRate)/toBigInt(100);
      const balanceBefore = await chipsToken.balanceOf(playerA.address);

      const tx = await refundableLottery.connect(playerA).refund(roundNumber);
      const receipt = await tx.wait();
      metrix.push({ Operation : "Refund Chips", Gas : receipt.gasUsed });

      await expect(tx)
        .to.emit(refundableLottery, "Refund")
        .withArgs(roundNumber, playerA.address, 0, refundAmount);

      const balanceAfter = await chipsToken.balanceOf(playerA.address);
      
      expect(balanceAfter - balanceBefore).to.equal(refundAmount);

      const contractChipsBalance = await chipsToken.balanceOf(refundableLottery.getAddress());
      expect(contractChipsBalance).to.equal(toBigInt(0));
    });
    
    it("Refund ether with mutiple tickets", async function () {
      await chipsToken.addMinter(refundableLottery.getAddress());
      const ticketPriceInEther = await refundableLottery.TICKET_PRICE_IN_ETHER();
      const ticketCount = 30;
      for(let i = 0; i < ticketCount; i++) {
        await refundableLottery.connect(playerA).buyTicketWithEther(655 + i, { value: ticketPriceInEther });
      }
      const roundNumber = await refundableLottery.roundNumber();
      await timeFlowToRoundEnd();
      await refundableLottery.connect(playerB).drawLotteryForTest(100);

      const managementFeeRate = await refundableLottery.MANAGEMENT_FEE_RATE();
      const managementFee = toBigInt(ticketCount)*toBigInt(ticketPriceInEther*managementFeeRate)/toBigInt(100);
      const refundAmount = toBigInt(ticketCount)*(ticketPriceInEther) - managementFee;
      const balanceBefore = await refundableLottery.runner?.provider?.getBalance(playerA.address);
      const chipsPricePerEther = await refundableLottery.CHIPS_PRICE_PER_ETHER();
      const chipsBalanceBefore = await chipsToken.balanceOf(playerA.address);
      const chipsReward = managementFee * chipsPricePerEther;

      const tx = await refundableLottery.connect(playerA).refund(roundNumber);
      const receipt = await tx.wait();
      metrix.push({ Operation : `Refund for ${ticketCount} ether tickets`, Gas : receipt.gasUsed });

      const transactionCost = toBigInt(receipt.gasUsed) * toBigInt(tx.gasPrice);
      const balanceAfter = await refundableLottery.runner?.provider?.getBalance(playerA.address);
      const chipsBalanceAfter = await chipsToken.balanceOf(playerA.address);

      await expect(tx)
        .to.emit(refundableLottery, "Refund")
        .withArgs(roundNumber, playerA.address, refundAmount, 0);

      expect(balanceAfter - balanceBefore).to.equal(refundAmount - transactionCost);  
      expect(chipsBalanceAfter - chipsBalanceBefore).to.equal(chipsReward);

      const contractEhterBalance = await refundableLottery.runner?.provider?.getBalance(refundableLottery.getAddress());
      const contractChipsBalance = await chipsToken.balanceOf(refundableLottery.getAddress());
      expect(contractEhterBalance).to.equal(toBigInt(0));
      expect(contractChipsBalance).to.equal(toBigInt(0));
    });

    it("Refund chips for multiple tickets", async function () {
      let ticketPriceInEther = await refundableLottery.TICKET_PRICE_IN_ETHER();
      const ticketCount = 30;
      for(let i = 0; i < ticketCount; i++) {
        await refundableLottery.buyTicketWithEther(6550 + i, { value: ticketPriceInEther });
      }

      await chipsToken.addMinter(refundableLottery.getAddress());
      await chipsToken.transfer(playerA.address, parseEther("10000"));
      
      for(let i = 0; i < ticketCount; i++) {
        await refundableLottery.connect(playerA).buyTicketWithChips(7551 + i);
      }

      const roundNumber = await refundableLottery.roundNumber();
      await timeFlowToRoundEnd();

      await refundableLottery.connect(playerB).drawLotteryForTest(100);

      const managementFeeRate = await refundableLottery.MANAGEMENT_FEE_RATE();
      const ticketPriceInChips = await refundableLottery.getDiscountedPriceInChips();
      const refundAmount = toBigInt(ticketCount)*(ticketPriceInChips - toBigInt(ticketPriceInChips*managementFeeRate)/toBigInt(100));
      const balanceBefore = await chipsToken.balanceOf(playerA.address);

      const tx = await refundableLottery.connect(playerA).refund(roundNumber);
      const receipt = await tx.wait();
      metrix.push({ Operation : `Refund Chips for ${ticketCount} chips tickets`, Gas : receipt.gasUsed });

      await expect(tx)
        .to.emit(refundableLottery, "Refund")
        .withArgs(roundNumber, playerA.address, 0, refundAmount);

      const balanceAfter = await chipsToken.balanceOf(playerA.address);
      
      expect(balanceAfter - balanceBefore).to.equal(refundAmount);

      const contractChipsBalance = await chipsToken.balanceOf(refundableLottery.getAddress());
      expect(contractChipsBalance).to.equal(toBigInt(0));
    });
  });
});