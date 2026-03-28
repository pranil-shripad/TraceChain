const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Supply Chain", function(){

    let supplyChain;
    let owner, manufacturer, stranger;
    beforeEach(async function() {
        [owner, manufacturer, stranger] = await ethers.getSigners();
        const SupplyChain = await ethers.getContractFactory("SupplyChain");
        supplyChain = await SupplyChain.deploy();
        await supplyChain.waitForDeployment();
    })
    it("creates a product and stores correct data", async function () {
        // grant role
        await supplyChain.grantRole(await supplyChain.MANUFACTURER_ROLE(), manufacturer.address);
        // call function
        await supplyChain.connect(manufacturer).createProduct("Qm_testCID_123");
        // check values
        const product = await supplyChain.products(1);
        expect (product.productId).to.equal(1);
        expect (product.metadataCID).to.equal("Qm_testCID_123");
        expect(product.manufacturer).to.equal(manufacturer.address);
        expect(product.currentOwner).to.equal(manufacturer.address);
        expect(product.status).to.equal(0);
        expect(product.createdAt).to.be.gt(0);
    });

})