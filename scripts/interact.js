const { ethers } = require("hardhat");
const axios  = require("axios");
const artifact = require("../artifacts/contracts/SupplyChain.sol/SupplyChain.json");
const { pinToIPFS } = require("./pinToIPFS.js")

async function main() {
    const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    const [deployer] = await ethers.getSigners();

    const supplyChain = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, deployer);

    await supplyChain.grantRole(await supplyChain.MANUFACTURER_ROLE(), deployer.address);
    // await supplyChain.createProduct("Qm_testCID_123");
    

    const productMetadata = {
    name: "Organic Coffee Beans",
    origin: "Colombia",
    batchId: "BATCH-001",
    manufacturedDate: "2026-04-05",
    description: "Single origin arabica beans"
    };

    // console.log(product.productId);
    // console.log(product.metadataCID);
    // console.log(product.manufacturer);
    // console.log(product.currentOwner);
    // console.log(product.status);

    const cid = await pinToIPFS(productMetadata);
    console.log("Pinned to IPFS, CID:", cid);

    await supplyChain.createProduct(cid);
    const product = await supplyChain.products(1);
    console.log(product.metadataCID);

    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`);
    console.log(response.data);

}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});