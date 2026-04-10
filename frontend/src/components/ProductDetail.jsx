import { useState, useEffect } from "react";
import axios from "axios";
import useSupplyChain from "../hooks/useSupplyChain";

const STATUS_LABELS = ["Created", "Shipped", "InTransit", "Delivered", "Cancelled"];

const ProductDetail = ({ productId }) => {
    const [product, setProduct]   = useState(null);
    const [history, setHistory]   = useState([]);
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading]   = useState(true);

    const { contract, getProduct, getHistory } = useSupplyChain();

    useEffect(() => {
        async function fetchData() {
            if (!contract || !productId) {
                setLoading(false);
                return;
            }
            try {
                const productData = await getProduct(productId);
                setProduct(productData);

                const historyData = await getHistory(productId);
                setHistory(historyData);

                const response = await axios.get(
                    `https://gateway.pinata.cloud/ipfs/${productData.metadataCID}`
                );
                setMetadata(response.data);

            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [contract, productId]);

    if (loading) return <p>Loading product...</p>;
    if (!product) return <p>Product not found.</p>;

    return (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>

            <h2>Product #{product.productId.toString()}</h2>

            <div style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
                <h3>On-chain Data</h3>
                <p><strong>Status:</strong> {STATUS_LABELS[Number(product.status)]}</p>
                <p><strong>Current Owner:</strong> {product.currentOwner.slice(0, 6)}...{product.currentOwner.slice(-4)}</p>
                <p><strong>Manufacturer:</strong> {product.manufacturer.slice(0, 6)}...{product.manufacturer.slice(-4)}</p>
                <p><strong>CID:</strong> {product.metadataCID.slice(0, 10)}...{product.metadataCID.slice(-6)}</p>
            </div>

            {metadata && (
                <div style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
                    <h3>Product Metadata (from IPFS)</h3>
                    <p><strong>Name:</strong> {metadata.name}</p>
                    <p><strong>Origin:</strong> {metadata.origin}</p>
                    <p><strong>Batch ID:</strong> {metadata.batchId}</p>
                    <p><strong>Description:</strong> {metadata.description}</p>
                </div>
            )}

            <div>
                <h3>History Timeline</h3>
                {history.map((entry, index) => (
                    <div key={index} style={{ borderLeft: "3px solid #333", paddingLeft: "16px", marginBottom: "16px" }}>
                        <p><strong>Status:</strong> {STATUS_LABELS[Number(entry.newStatus)]}</p>
                        <p><strong>Location:</strong> {entry.location}</p>
                        <p><strong>Updated by:</strong> {entry.updatedBy.slice(0, 6)}...{entry.updatedBy.slice(-4)}</p>
                        <p><strong>Time:</strong> {new Date(Number(entry.timestamp) * 1000).toLocaleString()}</p>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default ProductDetail;