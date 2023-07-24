// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./InterfaceERC20.sol";
import "hardhat/console.sol";

contract Tokenplay {
    address public admins;
    uint count = 0;
    bool private sync;
    address public parent;
    uint public random;
    InterfaceERC20 public inter;

    mapping(address => Staker) public staker;
    struct Staker {
        uint tokenid;
        address referrer;
        bool setreferrer;
        bool activeUser;
    }

    constructor(address _ERC20address) {
        inter = InterfaceERC20(_ERC20address);
        admins = msg.sender;
        staker[msg.sender].activeUser = true;
        parent = msg.sender;
        count = 1;
        inter.mint(admins);
    }
    modifier onlyAdmins() {
        require(msg.sender == admins, "not an admin");
        _;
    }

    modifier synchronized() {
        require(!sync, "Sync lock");
        sync = true;
        _;
        sync = false;
        _;
    }
    modifier activeUser() {
        require(staker[msg.sender].activeUser);
        _;
    }
    
    //functon to give random id to user
    function tokenId() public {
        require(!staker[msg.sender].activeUser, "user already exist");
        random = uint(
            keccak256(abi.encodePacked(msg.sender, block.timestamp, random))
        );
        staker[msg.sender].tokenid = random;
    }

    //function to set active user
    function join() public {
        require(!staker[msg.sender].activeUser, "user already exist");
        require(staker[msg.sender].tokenid != 0, "Not a valid TokenID");
        require(
            !(staker[msg.sender].setreferrer),
            "Referrer Already used Only 1 allowed"
        );
        staker[msg.sender].referrer = parent;
        count++;
        bool validUser = isValidTransfer(msg.sender, count);
        require(validUser, "Not a valid user");
        staker[msg.sender].activeUser = true;
        staker[parent].setreferrer = true;
        changingParent();
    }

    function isValidTransfer(
        address user,
        uint number
    ) internal returns (bool) {
        require(inter.findBalance(user) >= 500, "insufficient balance");
        if (number <= 2) {
            inter.transferToken(user, staker[user].referrer, 500);
            console.log("transfer successful",inter.findBalance(user));
        } else {
            address parent1 = staker[user].referrer;
            inter.transferToken(user, staker[user].referrer, 300);
            inter.transferToken(user, staker[parent1].referrer, 200);
            console.log("transfer successful");
        }
        return true;
    }

    function getreferrer() public view activeUser returns (address) {
        return staker[msg.sender].referrer;
    }

    function gettokenId() public view activeUser returns (uint) {
        return staker[msg.sender].tokenid;
    }

    function getsetReferrer() external view returns (bool) {
        return staker[msg.sender].setreferrer;
    }

    function getactiveUser() external view returns (bool) {
        return staker[msg.sender].activeUser;
    }

    //To make coming user parent after joining
    function changingParent() internal activeUser {
        parent = msg.sender;
    }
}
