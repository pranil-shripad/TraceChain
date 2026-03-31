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
    });

    describe("Create Product", function () {
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


        it("emits ProductCreated event", async function () {
        // grant role
        await supplyChain.grantRole(await supplyChain.MANUFACTURER_ROLE(), manufacturer.address);
        await expect(
            supplyChain.connect(manufacturer).createProduct("Qm_testCID_123")
        ).to.emit(supplyChain, "ProductCreated")
        .withArgs(1, manufacturer.address, "Qm_testCID_123");
        });

    
        it("reverts if caller is not manufacturer", async function(){
            await expect(supplyChain.connect(stranger).createProduct("Qm_testCID_123")).to.be.reverted;
        });
    });

    describe("Update Status", function(){
        it("should update the product status correctly", async function () {
            await supplyChain.grantRole(await supplyChain.MANUFACTURER_ROLE(), manufacturer.address);
            await supplyChain.connect(manufacturer).createProduct("Qm_testCID_123");
            await supplyChain.connect(manufacturer).updateStatus(1, 2, "Mumbai");

            const product = await supplyChain.products(1);

            expect(product.status).to.equal(2);
        });

        it("should revert if caller is not the owner", async function () {
            await supplyChain.grantRole(await supplyChain.MANUFACTURER_ROLE(), manufacturer.address);
            await supplyChain.connect(manufacturer).createProduct("Qm_testCID_123");
            await expect(supplyChain.connect(stranger).updateStatus(1,2,"Pune")).to.be.revertedWith("You are not the owner!");;
        });
    });

    
})