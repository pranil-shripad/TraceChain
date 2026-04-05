const axios  = require("axios");

require('dotenv').config();

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;


    async function pinToIPFS(metadata) {
    try {
        const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadata,
        {
            headers: {
            "Content-Type": "application/json",
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_API_SECRET,
            },
        }
        );

        return response.data.IpfsHash;

    } catch (error) {
        console.error(
        "Pinata upload failed:",
        error.response?.data || error.message
        );
        throw error;
    }
    }

    const productMetadata = {
        name: "Organic Coffee Beans",
        origin: "Colombia",
        batchId: "BATCH-001",
        manufacturedDate: "2026-04-05",
        description: "Single origin arabica beans"
    };

async function main(){
    const returnedCID = await pinToIPFS(productMetadata);
    console.log("CID: ",returnedCID);
    console.log("IPFS gateway URL: ");
    console.log(`https://ipfs.io/ipfs/${returnedCID}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});