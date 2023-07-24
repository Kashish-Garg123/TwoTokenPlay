// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Functions is ERC20 {
    address public admins;

    constructor() ERC20("CURRENCY", "MATIC") {
        admins = msg.sender;
    }

    function mint(address owner) external {
        _mint(owner, 7000);
    }

    function findBalance(address user) external view returns (uint) {
        uint balance = balanceOf(user);
        return balance;
    }

    function transferToken(address from, address to, uint amount) external {
        _transfer(from, to, amount);
    }
}
