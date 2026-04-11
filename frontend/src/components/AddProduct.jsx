import { useState } from "react";
import axios from "axios";
import useSupplyChain from "../hooks/useSupplyChain";
import useWallet from "../hooks/useWallet";

const PINATA_API_KEY    = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;

const AddProduct = () => {
    const [name, setName]             = useState("");
    const [origin, setOrigin]         = useState("");
    const [batchId, setBatchId]       = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage]           = useState(null);
    const [loading, setLoading]       = useState(false);
    const [txHash, setTxHash]         = useState(null);
    const [error, setError]           = useState(null);

    const { createProduct } = useSupplyChain();
    const { account } = useWallet();

    const uploadImageToIPFS = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await axios.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_API_SECRET,
                },
            }
        );
        return response.data.IpfsHash;
    };

    const uploadMetadataToIPFS = async (metadata) => {
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setTxHash(null);

        try {
            if (!account) {
                setError("Please connect your wallet first");
                return;
            }

            let imageCID = null;
            if (image) {
                imageCID = await uploadImageToIPFS(image);
            }

            const metadata = {
                name,
                origin,
                batchId,
                description,
                manufacturedDate: new Date().toISOString().split("T")[0],
                image: imageCID ? `https://gateway.pinata.cloud/ipfs/${imageCID}` : null,
            };

            const metadataCID = await uploadMetadataToIPFS(metadata);

            const receipt = await createProduct(metadataCID);

            setTxHash(receipt.hash);

            setName("");
            setOrigin("");
            setBatchId("");
            setDescription("");
            setImage(null);

        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
            <h2>Add New Product</h2>

            <form onSubmit={handleSubmit}>

                <div style={{ marginBottom: "12px" }}>
                    <label>Product Name</label><br />
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                    />
                </div>

                <div style={{ marginBottom: "12px" }}>
                    <label>Origin</label><br />
                    <input
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        required
                        style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                    />
                </div>

                <div style={{ marginBottom: "12px" }}>
                    <label>Batch ID</label><br />
                    <input
                        type="text"
                        value={batchId}
                        onChange={(e) => setBatchId(e.target.value)}
                        required
                        style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                    />
                </div>

                <div style={{ marginBottom: "12px" }}>
                    <label>Description</label><br />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        style={{ width: "100%", padding: "8px", marginTop: "4px", height: "80px" }}
                    />
                </div>

                <div style={{ marginBottom: "12px" }}>
                    <label>Product Image</label><br />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                        style={{ marginTop: "4px" }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: "10px 20px", cursor: loading ? "not-allowed" : "pointer" }}
                >
                    {loading ? "Creating product..." : "Create Product"}
                </button>

            </form>

            {error && (
                <div style={{ marginTop: "16px", color: "red", padding: "10px", border: "1px solid red", borderRadius: "6px" }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {txHash && (
                <div style={{ marginTop: "16px", color: "green", padding: "10px", border: "1px solid green", borderRadius: "6px" }}>
                    <strong>Product created successfully!</strong><br />
                    
                        href={`https://mumbai.polygonscan.com/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        View on Polygonscan ↗
                </div>
            )}

        </div>
    );
};

export default AddProduct;