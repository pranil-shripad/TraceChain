import { useState, useEffect } from "react";
import useSupplyChain from "../hooks/useSupplyChain";

const ProductList = ({ onViewProduct }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { contract } = useSupplyChain();

    useEffect(() => {
        async function fetchProducts() {
            if(!contract) return;
            try {
                setLoading(true);
                const items = [];
                let id = 1;

                while (id <= 100) {
                    try {
                        const product = await contract.products(id);
                        if (!product || Number(product.productId) === 0 || product.manufacturer === "0x0000000000000000000000000000000000000000") {
                            break;
                        }
                        items.push({
                            id: product.productId,
                            manufacturer: product.manufacturer,
                            cid: product.metadataCID
                        });
                        id++;
                    } catch (err) {
                        break;
                    }
                }
                setProducts(items);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, [contract]);

    if (loading) return <p>Loading Products...</p>;
    if (error) return <p style={{ color: "red" }}>Error loading products: {error}</p>;
    if (products.length === 0) return <p>No products found. Add one to get started.</p>;

    return (
        <div>
            {products.map((product) => (
                <div
                    key={product.id.toString()}
                    onClick={() => onViewProduct && onViewProduct(product.id)}
                    style={{
                        border: "1px solid #ccc",
                        padding: "16px",
                        margin: "12px 0",
                        borderRadius: "8px",
                        cursor: onViewProduct ? "pointer" : "default"
                    }}
                >
                    <p><strong>Product ID:</strong> #{product.id.toString()}</p>
                    <p>
                        <strong>Manufacturer:</strong> {product.manufacturer.slice(0, 6)}...{product.manufacturer.slice(-4)}
                    </p>
                    <p>
                        <strong>Metadata CID:</strong> {product.cid.slice(0, 10)}...{product.cid.slice(-6)}
                    </p>
                    {onViewProduct && (
                        <span style={{ color: "#0066cc", fontSize: "14px", textDecoration: "underline" }}>
                            View Product Details →
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ProductList;
