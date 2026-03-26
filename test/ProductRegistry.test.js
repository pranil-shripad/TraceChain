const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Product Registry", function() {
    let registry;
    let owner;
    let otherAccount;
    beforeEach(async function () {
        [owner, otherAccount] = await ethers.getSigners();
        const ProductRegistry = await ethers.getContractFactory("ProductRegistry");
        registry = await ProductRegistry.deploy();
        await registry.waitForDeployment();
    });

    it("should create a product and return correct data", async function () {
        await registry.createProduct("Apple", "Kashmir");
        const product = await registry.getProduct(1);
        expect(product.name).to.equal("Apple");
        expect(product.origin).to.equal("Kashmir");
        expect(product.id).to.equal(1);
        expect(product.manufacturer).to.equal(owner.address);
    })
})