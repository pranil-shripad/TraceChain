const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Counter Contract", function () {

  let counter;

  beforeEach(async function () {
    const Counter = await ethers.getContractFactory("Counter");
    counter = await Counter.deploy();
    await counter.waitForDeployment();
  });

  it("should start with count = 0", async function () {
    expect(await counter.getCount()).to.equal(0);
  });

  it("should increment the counter", async function () {
    await counter.increment();
    expect(await counter.getCount()).to.equal(1);
  });

  it("should decrement the counter", async function () {
    await counter.increment();
    await counter.decrement();
    expect(await counter.getCount()).to.equal(0);
  });

});