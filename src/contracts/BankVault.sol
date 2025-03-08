// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BankVault is Ownable {
    IERC20 public token;
    mapping(address => uint256) public balances;
    mapping(string => address) public accountToAddress;
    
    event AccountLinked(string accountNumber, address userAddress);
    event TokensDeposited(address indexed user, uint256 amount);
    event TokensWithdrawn(address indexed user, uint256 amount);

    constructor(address _token) Ownable(msg.sender) {
        token = IERC20(_token);
    }

    function linkAccount(string memory accountNumber) public {
        require(accountToAddress[accountNumber] == address(0), "Account already linked");
        accountToAddress[accountNumber] = msg.sender;
        emit AccountLinked(accountNumber, msg.sender);
    }

    function deposit(uint256 amount) public {
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        balances[msg.sender] += amount;
        emit TokensDeposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        require(token.transfer(msg.sender, amount), "Transfer failed");
        emit TokensWithdrawn(msg.sender, amount);
    }

    function getBalance(address user) public view returns (uint256) {
        return balances[user];
    }

    function getAccountAddress(string memory accountNumber) public view returns (address) {
        return accountToAddress[accountNumber];
    }
}