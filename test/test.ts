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
let user3: SignerWithAddress;
let user4: SignerWithAddress;
let user5: SignerWithAddress;
const initialSupply = 7000n;

beforeEach("Describe contract Multilevel Transfer", async function () {
  ERC20Functions = await ethers.getContractFactory("ERC20Functions");
  Tokenplay = await ethers.getContractFactory("Tokenplay");
  signers = await ethers.getSigners();
  owner = signers[0];
  user1 = signers[1];
  user2 = signers[2];
  user3 = signers[3];
  user4 = signers[4];
  user5 = signers[5];
  const initialSupply = 7000n;
  //console.log("owner address", owner);
  hardhatERC20Functions = await ERC20Functions.deploy();
  hardhatTokenplay = await Tokenplay.deploy(hardhatERC20Functions.address);
  await hardhatERC20Functions.deployed();
  await hardhatTokenplay.deployed();
});
describe("contract Tokenplay", function () {
  it("Constructor initialization", async function () {
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
      1000n
    );
    const user1Balance = await hardhatERC20Functions.findBalance(user1.address);
    expect(user1Balance).to.equal(1000n);
    await hardhatERC20Functions.transferToken(
      owner.address,
      user2.address,
      1000n
    );
    const user2Balance = await hardhatERC20Functions.findBalance(user2.address);
    expect(user2Balance).to.equal(1000n);
    await hardhatERC20Functions.transferToken(
      owner.address,
      user3.address,
      1000n
    );
    const user3Balance = await hardhatERC20Functions.findBalance(user3.address);
    expect(user3Balance).to.equal(1000n);
    await hardhatERC20Functions.transferToken(
      owner.address,
      user4.address,
      1000n
    );
    const user4Balance = await hardhatERC20Functions.findBalance(user4.address);
    expect(user4Balance).to.equal(1000n);
    await hardhatERC20Functions.transferToken(
      owner.address,
      user5.address,
      1000n
    );
    const user5Balance = await hardhatERC20Functions.findBalance(user5.address);
    expect(user5Balance).to.equal(1000n);
    //user1 joined by getting key from owner,check transfer balance,parent,active user,owner token1 destroyed
    await hardhatTokenplay.connect(user1).passKey(owner.address);
    expect(await hardhatTokenplay.connect(user1).getactiveUser()).is.equal(
      true
    );
    const newUser1Balance = await hardhatERC20Functions.findBalance(
      user1.address
    );
    expect(newUser1Balance).to.equal(500n); //balance checked
    expect(await hardhatTokenplay.connect(user1).getreferrer()).to.equal(
      owner.address
    ); //parent checked
    expect(await hardhatTokenplay.getkey1()).to.equal(0);
    //user2 joined by getting key from owner,check transfer balance,parent,active user,owner token1 destroyed
    await hardhatTokenplay.connect(user2).passKey(owner.address);
    expect(await hardhatTokenplay.connect(user1).getactiveUser()).is.equal(
      true
    );
    const newUser2Balance = await hardhatERC20Functions.findBalance(
      user2.address
    );
    expect(newUser2Balance).to.equal(500n); //balance checked
    expect(await hardhatTokenplay.connect(user2).getreferrer()).to.equal(
      owner.address
    ); //parent checked
    expect(await hardhatTokenplay.getkey2()).to.equal(0);
    //User 3 joined withe parent as user1
    await hardhatTokenplay.connect(user3).passKey(user1.address);
    const newUser3Balance = await hardhatERC20Functions.findBalance(
      user3.address
    );
    expect(newUser3Balance).to.equal(500n); //balance checked
    const parentUser1Balance = await hardhatERC20Functions.findBalance(
      user1.address
    );
    expect(parentUser1Balance).to.equal(800n); //balance checked
    expect(await hardhatTokenplay.connect(user3).getactiveUser()).to.equal(
      true
    );
    expect(await hardhatTokenplay.connect(user3).getreferrer()).to.equal(
      user1.address
    );
    expect(await hardhatTokenplay.connect(user1).getkey1()).to.equal(0);
    //user4 Joined checked parent,grandparent,balance,activeuser
    await hardhatTokenplay.connect(user4).passKey(user3.address);
    const newuser4Balance = await hardhatERC20Functions.findBalance(
      user4.address
    );
    const parentuser3Balance = await hardhatERC20Functions.findBalance(
      user3.address
    );
    const grandparentuser1Balance = await hardhatERC20Functions.findBalance(
      user1.address
    );
    expect(await hardhatTokenplay.connect(user4).getactiveUser()).to.equal(
      true
    );
    expect(await hardhatTokenplay.connect(user3).getkey1()).to.equal(0);
    expect(newuser4Balance).to.equal(500n);
    expect(parentuser3Balance).to.equal(800n);
    expect(grandparentuser1Balance).to.equal(1000n);
    expect(await hardhatTokenplay.getkeyUsed()).to.equal(2);
    expect(await hardhatTokenplay.connect(user1).getkeyUsed()).to.equal(1);
    await expect(
      hardhatTokenplay.connect(user4).passKey(owner.address)
    ).to.be.revertedWith("user already exist");
    await expect(
      hardhatTokenplay.connect(user5).passKey(owner.address)
    ).to.be.revertedWith("No key to pass");
  });
});
