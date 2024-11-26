// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ChipsToken is ERC20, AccessControl, Ownable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint public constant INITIAL_SUPPLY = 1000000 ether;

    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setRoleAdmin(MINTER_ROLE, DEFAULT_ADMIN_ROLE);

        _mint(msg.sender, INITIAL_SUPPLY);
    }

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

    // This function allows the caller contract to transfer tokens from one account to another without approval first.abi
    // But only the from account can call this function through authorized caller contract.
    function directTransferFrom(address from, address to, uint256 amount) public{
        require(tx.origin == from, "The from account must be the transaction sender");
        require(hasRole(MINTER_ROLE, msg.sender), "Caller contract MUST be an authorized contract");
        _transfer(from, to, amount);
    }
}
