import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";

let ERC20Functions: any;
let Tokenplay: any;
let hardhatERC20Functions: any; //tokenFunction contract address
let hardhatTokenplay: any; //Tokenplay contract address
let signers: SignerWithAddress[];
let owner: SignerWithAddress;
let user1: SignerWithAddress;
let user2: SignerWithAddress;
// let ownerBalance: BigInt;
// let user1Balance: BigInt;
// let user2Balance: BigInt;

const initialSupply = 7000n;

beforeEach("Describe contract Multilevel Transfer", async function () {
  ERC20Functions = await ethers.getContractFactory("ERC20Functions");
  Tokenplay = await ethers.getContractFactory("Tokenplay");
  signers = await ethers.getSigners();
  owner = signers[0];
  user1 = signers[1];
  user2 = signers[2];
  const initialSupply = 7000n;
  //console.log("owner address", owner);
  hardhatERC20Functions = await ERC20Functions.deploy();
  hardhatTokenplay = await Tokenplay.deploy(hardhatERC20Functions.address);
  await hardhatERC20Functions.deployed();
  await hardhatTokenplay.deployed();
//   ownerBalance = await hardhatERC20Functions.findBalance(owner.address);
//   user1Balance = await hardhatERC20Functions.findBalance(user1.address);
//   user2Balance = await hardhatERC20Functions.findBalance(user2.address);
});
describe("contract Tokenplay", function () {
  it("Constructor initialization", async function () {
    //await hardhatTokenplay.inter.mint(owner.address);
    expect(await hardhatTokenplay.admins()).to.equal(owner.address);
    expect(await hardhatTokenplay.parent()).to.equal(owner.address);
  });
});
//Transfer of tokens from minter address to two other users
describe("Transfer of tokens and joining", function () {
  it("should transfer tokens to user1,user2 from owner", async function () {
    expect(await hardhatERC20Functions.name()).to.equal("CURRENCY");
    expect(await hardhatERC20Functions.symbol()).to.equal("MATIC");
    expect(await hardhatERC20Functions.admins()).to.equal(owner.address);
    const ownerBalance = await hardhatERC20Functions.balanceOf(owner.address);
    console.log(ownerBalance, "balance credited to owner not bankrupt anymore");
    expect(ownerBalance).to.equal(initialSupply);
    await expect(
      hardhatERC20Functions.connect(user1).transfer(owner.address, 1)
    ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    await expect(
      hardhatERC20Functions.connect(user2).transfer(owner.address, 1)
    ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    await hardhatERC20Functions.transferToken(
      owner.address,
      user1.address,
      600n
    );
    const user1Balance = await hardhatERC20Functions.findBalance(user1.address);
    expect(user1Balance).to.equal(600n);
    await hardhatERC20Functions.transferToken(
      owner.address,
      user2.address,
      600n
    );
    const user2Balance = await hardhatERC20Functions.findBalance(user2.address);
    expect(user2Balance).to.equal(600n);
    //User1 Joined checked parent,balance,active user
    await hardhatTokenplay.connect(user1).tokenId();

    await hardhatTokenplay.connect(user1).join();
    const newUser1Balance = await hardhatERC20Functions.findBalance(
      user1.address
    );
    console.log(newUser1Balance, "Balance of user1 after joining");
    expect(await hardhatTokenplay.connect(user1).getactiveUser()).to.equal(
      true
    );
    expect(newUser1Balance).to.equal(100n);
    expect(await hardhatTokenplay.connect(user1).getreferrer()).to.equal(
      owner.address
    );
    // User2 Joining Checked parent balance active user 
    await hardhatTokenplay.connect(user2).tokenId();
    await hardhatTokenplay.connect(user2).join();
    const newUser2Balance = await hardhatERC20Functions.findBalance(
      user2.address
    );
    const newOwnerBalance = await hardhatERC20Functions.findBalance(
      owner.address
    );
    const parentUser1Balance=await hardhatERC20Functions.findBalance(user1.address);
    expect(await hardhatTokenplay.connect(user2).getactiveUser()).to.equal(
      true
    );
    expect(newUser2Balance).to.equal(100n);
    expect(newOwnerBalance).to.equal(7000n - 600n - 600n + 500n + 200n);
    expect(parentUser1Balance).to.equal(600n - 500n + 300n);
    expect(await hardhatTokenplay.connect(user2).getreferrer()).to.equal(
      user1.address
    );
    expect (await hardhatTokenplay.connect(user1).getsetReferrer()).to.equal(true);
    expect (await hardhatTokenplay.getsetReferrer()).to.equal(true);
  });
});
