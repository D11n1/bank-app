// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BankToken is ERC20, Ownable {
    constructor() ERC20("BankToken", "BANK") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        _transfer(from, to, amount);
        return true;
    }
}