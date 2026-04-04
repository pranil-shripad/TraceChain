const { expect } = require("chai");
const { ethers } = require("hardhat");
const { isReadable } = require("stream");

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
        await supplyChain.grantRole(await supplyChain.MANUFACTURER_ROLE(), manufacturer.address);
        await supplyChain.connect(manufacturer).createProduct("Qm_testCID_123");
        const product = await supplyChain.products(1);
        expect (product.productId).to.equal(1);
        expect (product.metadataCID).to.equal("Qm_testCID_123");
        expect(product.manufacturer).to.equal(manufacturer.address);
        expect(product.currentOwner).to.equal(manufacturer.address);
        expect(product.status).to.equal(0);
        expect(product.createdAt).to.be.gt(0);
        });

        it("should increment product id on each product creation", async function(){
            await supplyChain.grantRole(await supplyChain.MANUFACTURER_ROLE(), manufacturer.address);
            await supplyChain.connect(manufacturer).createProduct("Qm_testCID_123");
            await supplyChain.connect(manufacturer).createProduct("Qm_testCID_456");
            const product1 = await supplyChain.products(1);
            const product2 = await supplyChain.products(2);
            expect (product1.productId).to.equal(1);
            expect (product2.productId).to.equal(2);
            expect (product2.metadataCID).to.not.equal(product1.metadataCID);
        });


        it("emits ProductCreated event", async function () {
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
            await expect(supplyChain.connect(stranger).updateStatus(1,2,"Pune")).to.be.revertedWith("You are not the owner!");
        });
        
        it("should revert if the product does not exist", async function(){
            await expect(supplyChain.connect(stranger).updateStatus(999, 2,"Pune")).to.be.revertedWith("Product does not exist");
        });
    });

    describe("Transfer Ownership", function(){
        it("should transfer the ownership correctly", async function(){
            await supplyChain.grantRole(await supplyChain.MANUFACTURER_ROLE(), manufacturer.address);
            await supplyChain.connect(manufacturer).createProduct("Qm_testCID_123");
            await expect(supplyChain.connect(manufacturer).transferOwnership(1, stranger.address)).to.emit(supplyChain, "OwnershipTransferred").withArgs(1, manufacturer.address, stranger.address);
            const product = await supplyChain.products(1);
            expect(product.currentOwner).to.equal(stranger.address);
        });
        it("should revert if non-owner tries to transfer", async function(){
            await supplyChain.grantRole(await supplyChain.MANUFACTURER_ROLE(), manufacturer.address);
            await supplyChain.connect(manufacturer).createProduct("Qm_testCID_123");
            await expect(supplyChain.connect(stranger).transferOwnership(1, stranger.address)).to.be.revertedWith("Only the current owner can transfer this item.");
        });
        it("should revert if the new owner is zero address", async function(){
            await supplyChain.grantRole(await supplyChain.MANUFACTURER_ROLE(), manufacturer.address);
            await supplyChain.connect(manufacturer).createProduct("Qm_testCID_123");
            await expect(supplyChain.connect(manufacturer).transferOwnership(1, ethers.ZeroAddress)).to.be.revertedWith("New owner cannot be zero address");
        });
    });

    describe("Get History", function(){
        it("should record history when product is created", async function(){
            await supplyChain.grantRole(await supplyChain.MANUFACTURER_ROLE(), manufacturer.address);
            await supplyChain.connect(manufacturer).createProduct("Qm_testCID_123");
            const history = await supplyChain.getHistory(1);
            expect(history.length).to.equal(1);
            expect(history[0].newStatus).to.equal(0);
            expect(history[0].location).to.equal("Origin");
            expect(history[0].updatedBy).to.equal(manufacturer.address);
        });

        it("should increment the length of history mapping when status is updated", async function(){
            await supplyChain.grantRole(await supplyChain.MANUFACTURER_ROLE(), manufacturer.address);
            await supplyChain.connect(manufacturer).createProduct("Qm_testCID_123");
            await supplyChain.connect(manufacturer).updateStatus(1, 2, "Mumbai");
            const history = await supplyChain.getHistory(1);
            expect(history.length).to.equal(2);
            expect(history[1].newStatus).to.equal(2);
            expect(history[1].location).to.equal("Mumbai");
            expect(history[1].updatedBy).to.equal(manufacturer.address);
        });
    });

    describe("Role Management", function(){
        it("should grant DISTRIBUTOR_ROLE correctly", async function(){
            await supplyChain.grantRole(await supplyChain.DISTRIBUTOR_ROLE(), stranger.address);
            const hasRole = await supplyChain.hasRole(await supplyChain.DISTRIBUTOR_ROLE(), stranger.address);
            expect(hasRole).to.equal(true);
        });

        it("should confirm address without role returns false", async function(){
            const hasRole = await supplyChain.hasRole(await supplyChain.DISTRIBUTOR_ROLE(), stranger.address);
            expect(hasRole).to.equal(false);
        });
    });

    describe("End to End", function(){
        it("should track a complete product journey through the supply chain", async function(){
            await supplyChain.grantRole(await supplyChain.MANUFACTURER_ROLE(), manufacturer.address);
            await supplyChain.connect(manufacturer).createProduct("Qm_testCID_123");

            let product = await supplyChain.products(1);
            expect (product.productId).to.equal(1);
            expect(product.currentOwner).to.equal(manufacturer.address);
            expect(product.status).to.equal(0);
            await supplyChain.connect(manufacturer).updateStatus(1, 2, "Mumbai");

            product = await supplyChain.products(1);
            expect(product.status).to.equal(2);
            await expect(supplyChain.connect(manufacturer).transferOwnership(1, stranger.address)).to.emit(supplyChain, "OwnershipTransferred").withArgs(1, manufacturer.address, stranger.address);

            product = await supplyChain.products(1);
            expect(product.currentOwner).to.equal(stranger.address);
            await supplyChain.connect(stranger).updateStatus(1, 3, "Mumbai");

            product = await supplyChain.products(1);
            expect(product.status).to.equal(3);

            const history = await supplyChain.getHistory(1);
            expect(history.length).to.equal(3);
            expect(history[0].newStatus).to.equal(0);
            expect(history[1].newStatus).to.equal(2);
            expect(history[2].newStatus).to.equal(3);
            expect(history[2].updatedBy).to.equal(stranger.address);
        });
    });

    
})