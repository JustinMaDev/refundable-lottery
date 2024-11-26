// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IChipsToken {
    function mint(address to, uint256 amount) external;
    function directTransferFrom(address from, address to, uint256 amount) external;
}

contract MockContract {
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