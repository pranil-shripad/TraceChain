const { ethers } = require("hardhat");
const artifact = require("../artifacts/contracts/SupplyChain.sol/SupplyChain.json");

async function main() {
    const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    const [deployer] = await ethers.getSigners();

    const supplyChain = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, deployer);

    await supplyChain.grantRole(await supplyChain.MANUFACTURER_ROLE(), deployer.address);
    await supplyChain.createProduct("Qm_testCID_123");
    const product = await supplyChain.products(1);

    console.log(product.productId);
    console.log(product.metadataCID);
    console.log(product.manufacturer);
    console.log(product.currentOwner);
    console.log(product.status);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});