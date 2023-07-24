 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
 interface InterfaceERC20{
    function mint(address user) external;
    function transferToken(address owner,address referrer,uint tokens) external;
    function findBalance(address tokenUser) external returns(uint);
}