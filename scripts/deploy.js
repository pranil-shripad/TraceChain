const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    const SupplyChainFactory = await ethers.getContractFactory("SupplyChain");
    const supplyChain = await SupplyChainFactory.deploy();
    await supplyChain.waitForDeployment();

    console.log("SupplyChain deployed to:", await supplyChain.getAddress());
    console.log("Deploying with:", deployer.address);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});