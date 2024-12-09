// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ChipsToken is ERC20, AccessControl, Ownable {
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
  //The buy price of Chips is fixed, 1 eth = 1000 chips
  uint public constant CHIPS_PRICE_PER_ETHER = 1000;
  uint public constant INITIAL_SUPPLY = 1000000 ether;
  uint public constant MANAGER_FEE_RATE = 1;
  uint public liquidityPoolEther = 0;
  uint public liquidityPoolChips = 0;

  event BuyChips(address indexed buyer, uint ethAmount, uint chipsAmount, uint liquidityPoolEther, uint liquidityPoolChips, uint managerFee);
  event SellChips(address indexed seller, uint ethAmount, uint chipsAmount, uint liquidityPoolEther, uint liquidityPoolChips, uint managerFee);

  constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) Ownable(msg.sender) {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setRoleAdmin(MINTER_ROLE, DEFAULT_ADMIN_ROLE);

    //Mint 1000000 chips to the manager to support the maintanance of the project
    _mint(msg.sender, INITIAL_SUPPLY);
  }

  function buyChips() external payable {
    require(msg.value > 0, "The msg.value must be greater than 0");
    uint amount = msg.value * CHIPS_PRICE_PER_ETHER;
    _mint(msg.sender, amount);

    //The manager fee is 10% of the ethers sent by the buyer
    uint managerFee = msg.value * MANAGER_FEE_RATE / 100;
    liquidityPoolEther += (msg.value - managerFee);
    liquidityPoolChips += amount;
    payable(owner()).transfer(managerFee);
    emit BuyChips(msg.sender, msg.value, amount, liquidityPoolEther, liquidityPoolChips, managerFee);
  }

  function sellChips(uint chipsAmount) external {
    require(chipsAmount > 0, "Chips amount must be greater than 0");
    require(chipsAmount <= balanceOf(msg.sender), "Not enough chips in the sender account");
    
    (uint ethToTransfer, uint managerFee , uint ethAfter, uint chipsAfter) = calcSellPrice(chipsAmount);
    require(ethToTransfer + managerFee <= liquidityPoolEther, "Not enough ETH in the pool");
    
    liquidityPoolEther = ethAfter;
    liquidityPoolChips = chipsAfter;
    _burn(msg.sender, chipsAmount);
    payable(owner()).transfer(managerFee);
    payable(msg.sender).transfer(ethToTransfer);
    emit SellChips(msg.sender, ethToTransfer, chipsAmount, liquidityPoolEther, liquidityPoolChips, managerFee);
  }

  function calcSellPrice(uint chipsAmount) public view returns(uint, uint, uint, uint) {
    uint ethBefore = liquidityPoolEther;
    uint chipsAfter = liquidityPoolChips + chipsAmount;
    uint ethAfter = (ethBefore * liquidityPoolChips) / chipsAfter;
    uint ethAmount = ethBefore - ethAfter;

    uint managerFee = ethAmount * MANAGER_FEE_RATE / 100;
    uint ethToTransfer = ethAmount - managerFee;

    return (ethToTransfer, managerFee, ethAfter, chipsAfter);
  }

  // The minter can NOT be an EOA (Externally Owned Account) including the owner itself so the owner can't mint tokens casually. 
  // The only tokens that the owner can get are initial tokens.
  function addMinter(address minter) public onlyOwner {
    uint256 size;
    assembly {
      size := extcodesize(minter)
    }
    require(size > 0, "The minter must be a contract");
    grantRole(MINTER_ROLE, minter);
  }

  function removeMinter(address minter) public onlyOwner {
    revokeRole(MINTER_ROLE, minter);
  }

  function mint(address to, uint256 amount) public {
    require(hasRole(MINTER_ROLE, msg.sender), "Caller is not a authorized minter");
    _mint(to, amount);
  }

  // This function allows the caller contract to transfer tokens from one account to another without approval first.
  // But only the "from" account itself can call this function through authorized caller contract.
  function directTransferFrom(address from, address to, uint256 amount) public{
    require(tx.origin == from, "The from account must be the transaction sender");
    require(hasRole(MINTER_ROLE, msg.sender), "Caller contract MUST be an authorized contract");
    _transfer(from, to, amount);
  }
}
