// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./InterfaceERC20.sol";
import "hardhat/console.sol";

contract Tokenplay {
    event userJoined(address user, string message);
    event success(address from, address to, string message);
    address public admins;
    uint256 count = 0;
    bool private sync;
    address public parent;
    uint256 public random1;
    uint256 public random2;
    InterfaceERC20 public inter;
    mapping(address => keys) public keyHolder;
    struct keys {
        uint256 t1;
        uint256 t2;
    }

    mapping(address => Staker) public staker;
    struct Staker {
        uint256 tokenKey;
        address referrer;
        uint256 keyused;
        bool activeUser;
        bool keystatus;
    }

    constructor(address _ERC20address) {
        inter = InterfaceERC20(_ERC20address);
        admins = msg.sender;
        parent = msg.sender;
        generateKey();
        staker[msg.sender].activeUser = true;
        inter.mint(admins);
    }

    modifier onlyAdmins() {
        require(msg.sender == admins, "not an admin");
        _;
    }
    modifier activeUser() {
        require(staker[msg.sender].activeUser);
        _;
    }

    function generateKey() internal {
        require(!staker[msg.sender].activeUser, "user already exist");
        random1 = uint256(
            keccak256(abi.encodePacked(msg.sender, block.timestamp, random1))
        );
        random2 = uint256(
            keccak256(abi.encodePacked(msg.sender, block.timestamp, random2))
        );
        keyHolder[msg.sender].t1 = random1;
        keyHolder[msg.sender].t2 = random2;
    }

    function passKey(address from) public {
        require(!staker[msg.sender].activeUser, "user already exist");
        require(staker[from].keyused != 2, "No key to pass");
        require(
            inter.findBalance(msg.sender) >= 500,
            "Insufficient Balance to join"
        );
        if (keyHolder[from].t1 != 0) {
            staker[msg.sender].tokenKey = keyHolder[from].t1; //tokenkey passed
            emit success(from, msg.sender, "key passed successfully");
            keyHolder[from].t1 = 0;
            staker[from].keyused += 1;
            staker[msg.sender].referrer = from;
            staker[msg.sender].keystatus = true;
            generateKey();
            emit userJoined(msg.sender, "key generated");
            join();
        } else if (keyHolder[from].t2 != 0) {
            staker[msg.sender].tokenKey = keyHolder[from].t2;
            emit success(from, msg.sender, "key passed successfully");
            keyHolder[from].t2 = 0;
            staker[from].keyused += 1;
            staker[msg.sender].referrer = from;
            staker[msg.sender].keystatus = true;
            generateKey();
            emit userJoined(msg.sender, "key generated");
            join();
        }
    }

    function join() internal {
        require(staker[msg.sender].keystatus, "Key is not appropriate");
        require(staker[msg.sender].tokenKey != 0, "First Get a Token key");
        count++;
        bool validUser = isValidTransfer(msg.sender, count);
        require(validUser, "Not a valid user");
        staker[msg.sender].activeUser = true;
        emit userJoined(msg.sender, "active User set");
    }

    function isValidTransfer(
        address user,
        uint256 number
    ) internal returns (bool) {
        require(!staker[msg.sender].activeUser, "user already exist");
        if (number <= 2 && staker[msg.sender].referrer == admins) {
            inter.transferToken(user, staker[user].referrer, 500);
            emit success(
                user,
                staker[user].referrer,
                "transfer successful 500"
            );
        } else {
            address parent1 = staker[user].referrer;
            inter.transferToken(user, staker[user].referrer, 300);
            inter.transferToken(user, staker[parent1].referrer, 200);
            emit success(
                user,
                staker[user].referrer,
                "transfer successful 300,200"
            );
        }
        return true;
    }

    function getreferrer() public view activeUser returns (address) {
        return staker[msg.sender].referrer;
    }
    function getactiveUser() external view returns (bool){
        return staker[msg.sender].activeUser;
    }
    function gettokenKey() external view returns (uint256){
        return staker[msg.sender].tokenKey;
    }
    function getkeyUsed() external view returns (uint256){
        return staker[msg.sender].keyused;
    }
    function getkey1() external view returns(uint){
        return keyHolder[msg.sender].t1;
    }
    function getkeyStatus() external view returns (bool){
        return staker[msg.sender].keystatus;
    }
     function getkey2() external view returns(uint){
        return keyHolder[msg.sender].t2;
    }
}
