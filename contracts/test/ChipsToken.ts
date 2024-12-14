import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers, toBigInt} from "ethers";
import { ChipsToken } from "../typechain-types/contracts/ChipsToken";
import hardhat, { network } from "hardhat";


describe("ChipsToken", function () {
  let chipsToken, owner, otherAccount, MINTER_ROLE;
  const metrix = [];

  async function deployChipsToken() {
    const [owner, otherAccount] = await hardhat.ethers.getSigners();
    const ChipsToken = await hardhat.ethers.getContractFactory("ChipsToken");
    const chipsToken = await ChipsToken.deploy("ChipsToken", "CHIPS");
    await chipsToken.waitForDeployment();

    return { chipsToken, owner, otherAccount };
  }

  async function deployMockLotteryContract() {
    const MockLotteryContract = await hardhat.ethers.getContractFactory("MockLotteryContract");
    return await MockLotteryContract.deploy(chipsToken.getAddress());
  }

  beforeEach(async function () {
    const fixture = await loadFixture(deployChipsToken);
    chipsToken = fixture.chipsToken;
    owner = fixture.owner;
    otherAccount = fixture.otherAccount;
    MINTER_ROLE = await chipsToken.MINTER_ROLE();
  });

  after(async function () {
    console.table(metrix);
  });

  describe("Check constructor", function () {
    it("Check owner", async function () {
      expect(await chipsToken.owner()).to.equal(owner);
    });

    it("Check name", async function () {
      expect(await chipsToken.name()).to.equal("ChipsToken");
    });

    it("Check symbol", async function () {
      expect(await chipsToken.symbol()).to.equal("CHIPS");
    });

    it("Check decimals", async function () {
      expect(await chipsToken.decimals()).to.equal(18);
    });

    it("Check initial supply", async function () {
      const initialSupply = await chipsToken.INITIAL_SUPPLY();
      expect(await chipsToken.balanceOf(owner.address)).to.equal(initialSupply);
      expect(await chipsToken.totalSupply()).to.equal(initialSupply);
    });
    
    it("Check admin role", async function () {
      const ADMIN_ROLE = await chipsToken.DEFAULT_ADMIN_ROLE();
      expect(await chipsToken.hasRole(ADMIN_ROLE, owner.address)).to.equal(true);
    });

    it("Check minter role admin", async function () {
      const ADMIN_ROLE = await chipsToken.DEFAULT_ADMIN_ROLE();
      expect(await chipsToken.getRoleAdmin(MINTER_ROLE)).to.equal(ADMIN_ROLE);
    });

    it("Check minter role", async function () {
      expect(await chipsToken.hasRole(MINTER_ROLE, owner.address)).to.equal(false);
    });
  });

  describe("Check minter logic", function () {
    let mockContract;
    beforeEach(async function () {
      mockContract = await loadFixture(deployMockLotteryContract);
    });

    it("Add minter by non-owner", async function () {
      await expect(chipsToken.connect(otherAccount).addMinter(otherAccount.address)).to.be.reverted;
    });

    it("Add an EOA as minter", async function () {
      await expect(chipsToken.addMinter(otherAccount.address)).to.be.revertedWith("The minter must be a contract");
    });

    it("Add contract minter", async function () {
      const tx = await chipsToken.addMinter(mockContract.getAddress());
      const receipt = await tx.wait();
      metrix.push({Operation: "addMinter", GasUsed: receipt.gasUsed});
      expect(await chipsToken.hasRole(MINTER_ROLE, mockContract.getAddress())).to.equal(true);
    });

    it("Remove minter", async function () {
      await chipsToken.addMinter(mockContract.getAddress());
      
      const tx = await chipsToken.removeMinter(mockContract.getAddress());
      const receipt = await tx.wait();
      metrix.push({Operation: "removeMinter", GasUsed: receipt.gasUsed});
      
      expect(await chipsToken.hasRole(MINTER_ROLE, mockContract.getAddress())).to.equal(false);
    });

    it("Remove minter by non-owner", async function () {
      await chipsToken.addMinter(mockContract.getAddress());
      expect(await chipsToken.hasRole(MINTER_ROLE, mockContract.getAddress())).to.equal(true);

      await expect(chipsToken.connect(otherAccount).removeMinter(mockContract.getAddress())).to.be.reverted;
    });

    it("Owner is not a minter", async function () {
      const amount = ethers.parseEther("100");
      await expect(chipsToken.connect(owner).mint(owner.address, amount)).to.be.revertedWith("Caller is not a authorized minter");
    });

    it("Mint by a non-minter", async function () {
      const amount = ethers.parseEther("100");
      await expect(chipsToken.connect(otherAccount).mint(otherAccount.address, amount)).to.be.revertedWith("Caller is not a authorized minter");
    });

    it("Mint by minter", async function () {
      await chipsToken.addMinter(mockContract.getAddress());
      const amount = ethers.parseEther("100");
      await mockContract.invokeMint(otherAccount.address, amount);
      expect(await chipsToken.balanceOf(otherAccount.address)).to.equal(amount);

      let totalSupply = await chipsToken.INITIAL_SUPPLY();
      totalSupply = totalSupply + amount;
      
      expect(await chipsToken.totalSupply()).to.equal(totalSupply);
    });

    it("Mint by a former minter", async function () {
      await chipsToken.addMinter(mockContract.getAddress());
      const amount = ethers.parseEther("100");
      await mockContract.invokeMint(otherAccount.address, amount);
      expect(await chipsToken.balanceOf(otherAccount.address)).to.equal(amount);

      await chipsToken.removeMinter(mockContract.getAddress());
      await expect(mockContract.invokeMint(otherAccount.address, amount)).to.be.revertedWith("Caller is not a authorized minter");
    });
  });

  describe("Check direct transfer logic", function () {
    let mockLotteryContract;
    beforeEach(async function () {
      mockLotteryContract = await loadFixture(deployMockLotteryContract);
    });

    it("Invoke directTransferFrom from a invalid EOA", async function () {
      const amount = ethers.parseEther("100");
      await expect(chipsToken.directTransferFrom(otherAccount.address, owner.address, amount)).to.be.revertedWith("The from account must be the transaction sender");
    });

    it("Invoke directTransferFrom from a non-minter contract", async function () {
      const amount = ethers.parseEther("100");
      await expect(mockLotteryContract.invokeDirectTransferFrom(owner.address, otherAccount.address, amount)).to.be.revertedWith("Caller contract MUST be an authorized contract");
    });

    it("Invoke directTransferFrom from a minter contract", async function () {
      await chipsToken.addMinter(mockLotteryContract.getAddress());
      expect(await chipsToken.hasRole(MINTER_ROLE, mockLotteryContract.getAddress())).to.equal(true);

      const amount = ethers.parseEther("100");
      const tx = await mockLotteryContract.invokeDirectTransferFrom(owner.address, otherAccount.address, amount);
      const receipt = await tx.wait();
      metrix.push({Operation: "invokeDirectTransferFrom", GasUsed: receipt.gasUsed});

      expect(await chipsToken.balanceOf(otherAccount.address)).to.equal(amount);

      const restAmount = (await chipsToken.INITIAL_SUPPLY()) - amount;
      expect(await chipsToken.balanceOf(owner.address)).to.equal(restAmount);
    });

    it("Invoke directTransferFrom revert if balance not sufficent ", async function () {
      await chipsToken.addMinter(mockLotteryContract.getAddress());
      expect(await chipsToken.hasRole(MINTER_ROLE, mockLotteryContract.getAddress())).to.equal(true);

      await chipsToken.transfer(otherAccount.address, ethers.parseEther("100"));

      await expect(mockLotteryContract.connect(otherAccount).invokeDirectTransferFrom(otherAccount.address, owner.address, ethers.parseEther("200"))).to.be.reverted;
    });
  });

  describe("Check buyChips logic", function () {
    it("Buy chips by non-owner", async function () {
      const amount = ethers.parseEther("1");
      const buyPrice = await chipsToken.CHIPS_PRICE_PER_ETHER();
      const beforeBalance = await chipsToken.balanceOf(otherAccount.address);

      const tx = await chipsToken.connect(otherAccount).buyChips({value:amount});
      const receipt = await tx.wait();
      metrix.push({Operation: "buyChips", GasUsed: receipt.gasUsed});

      const afterBalance = await chipsToken.balanceOf(otherAccount.address);
      expect(afterBalance).to.equal(beforeBalance + (amount * buyPrice));
    });

    it("Buy chips by owner", async function () {
      const amount = ethers.parseEther("1");
      const buyPrice = await chipsToken.CHIPS_PRICE_PER_ETHER();
      const beforeBalance = await chipsToken.balanceOf(owner.address);
      await chipsToken.buyChips({value:amount});
      const afterBalance = await chipsToken.balanceOf(owner.address);
      expect(afterBalance).to.equal(beforeBalance + (amount * buyPrice));
    });

    it("Buy chips and check liquidity pool state", async function () {
      const amount = ethers.parseEther("1");
      const buyPrice = await chipsToken.CHIPS_PRICE_PER_ETHER();
      const liquidityPoolEtherBefore = await chipsToken.liquidityPoolEther();
      const liquidityPoolChipsBefore = await chipsToken.liquidityPoolChips();
      const managerBalanceBefore = await chipsToken.runner?.provider?.getBalance(owner.address);
      await chipsToken.connect(otherAccount).buyChips({value:amount});
      
      const managementFeeRate = await chipsToken.MANAGER_FEE_RATE();
      const managementFee = amount * managementFeeRate / BigInt(100);
      const liquidityPoolEtherAfter = await chipsToken.liquidityPoolEther();
      const liquidityPoolChipsAfter = await chipsToken.liquidityPoolChips();
      const managerBalanceAfter = await chipsToken.runner?.provider?.getBalance(owner.address);

      expect(liquidityPoolEtherAfter).to.equal(liquidityPoolEtherBefore + amount - managementFee);
      expect(liquidityPoolChipsAfter).to.equal(liquidityPoolChipsBefore + (amount * buyPrice));
      expect(managerBalanceAfter).to.equal(managerBalanceBefore + managementFee);
    });

    it("Buy chips with zero amount", async function () {
      await expect(chipsToken.connect(otherAccount).buyChips({value:0}))
      .to.be.revertedWith("The msg.value must be greater than 0");
    });
  });

  describe("Check sellChips logic", function () {
    this.beforeEach(async function () {
      await chipsToken.transfer(otherAccount.address, ethers.parseEther("1000"));
      // Set the liquidity pool state as (90eth, 100000chips)
      await chipsToken.buyChips({value:ethers.parseEther("100")});
    });

    it("Sell chips by non-owner", async function () {
      const amount = ethers.parseEther("1");
      const [ethToTransfer, managementFee] = await chipsToken.calcSellPrice(amount);
      
      const ethBalanceBefore = await chipsToken.runner?.provider?.getBalance(otherAccount.address);
      const chipsBalanceBefore = await chipsToken.balanceOf(otherAccount.address);
      const managementFeeRate = await chipsToken.MANAGER_FEE_RATE();
      
      const tx = await chipsToken.connect(otherAccount).sellChips(amount);
      const receipt = await tx.wait();
      metrix.push({Operation: "sellChips", GasUsed: receipt.gasUsed});
      const transactionCost = toBigInt(receipt.gasUsed) * toBigInt(tx.gasPrice);
      
      const ethBalanceAfter = await chipsToken.runner?.provider?.getBalance(otherAccount.address);
      const chipsBalanceAfter = await chipsToken.balanceOf(otherAccount.address);
      expect(chipsBalanceAfter).to.equal(chipsBalanceBefore - amount);
      expect(ethBalanceAfter).to.equal(ethBalanceBefore + ethToTransfer - transactionCost);
    });

    it("Sell chips and check liquidity pool state", async function () {
      const amount = ethers.parseEther("1");
      const [ethToTransfer, managementFee] = await chipsToken.calcSellPrice(amount);
      
      const managementFeeRate = await chipsToken.MANAGER_FEE_RATE();
      
      const liquidityPoolEtherBefore = await chipsToken.liquidityPoolEther();
      const liquidityPoolChipsBefore = await chipsToken.liquidityPoolChips();
      const contractBalanceBefore = await chipsToken.runner?.provider?.getBalance(chipsToken.getAddress());

      const tx = await chipsToken.connect(otherAccount).sellChips(amount);
      const receipt = await tx.wait();

      const liquidityPoolEtherAfter = await chipsToken.liquidityPoolEther();
      const liquidityPoolChipsAfter = await chipsToken.liquidityPoolChips();
      const contractBalanceAfter = await chipsToken.runner?.provider?.getBalance(chipsToken.getAddress());

      expect(liquidityPoolEtherAfter).to.equal(liquidityPoolEtherBefore - ethToTransfer - managementFee);
      expect(liquidityPoolChipsAfter).to.equal(liquidityPoolChipsBefore + amount);
      expect(contractBalanceAfter).to.equal(contractBalanceBefore - ethToTransfer - managementFee);
      expect(liquidityPoolEtherAfter).to.equal(contractBalanceAfter);
    });

    it("Sell chips with insufficent balance", async function () {
      const amount = await chipsToken.balanceOf(otherAccount.address) + ethers.parseEther("1");
      
      await expect(chipsToken.connect(otherAccount).sellChips(amount))
      .to.be.revertedWith("Not enough chips in the sender account");
    });

    it("Sell chips as much as liquidityPoolChips", async function () {
      const liquidityPoolChips = await chipsToken.liquidityPoolChips();

      const [ethToTransfer, managementFee] = await chipsToken.calcSellPrice(liquidityPoolChips);
      const liquidityPoolEtherBefore = await chipsToken.liquidityPoolEther();
      const liquidityPoolChipsBefore = await chipsToken.liquidityPoolChips();

      await chipsToken.sellChips(liquidityPoolChips);

      const liquidityPoolEtherAfter = await chipsToken.liquidityPoolEther();
      const liquidityPoolChipsAfter = await chipsToken.liquidityPoolChips();

      expect(liquidityPoolEtherAfter).to.equal(liquidityPoolEtherBefore - ethToTransfer - managementFee);
      expect(liquidityPoolChipsAfter).to.equal(liquidityPoolChipsBefore + liquidityPoolChips);
    });
  });
});