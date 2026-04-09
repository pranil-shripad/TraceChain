import { useState, useEffect } from "react";
import useSupplyChain from "../hooks/useSupplyChain";

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { contract } = useSupplyChain();

    useEffect(() => {
        async function fetchProducts() {
            if(!contract) return;
            const events = await contract.queryFilter("ProductCreated");

            const products = events.map(event => {
                return {
                    id: event.args.productId,
                    manufacturer: event.args.manufacturer,
                    cid: event.args.metadataCID
                };
            });
            setProducts(products);
            setLoading(false);
        }
        fetchProducts();
    }, [contract]);

    if (loading) return <p>Loading Products....</p>
    if(products.length === 0) return <p>No products found. Add one to get started.</p>
    return(
        <div>
        {products.map((product) => (
        <div key={product.id.toString()} style={{ border: "1px solid black", padding: "10px", margin: "10px" }}>
            
            <p>Product ID: {product.id}</p>

            <p>
            Manufacturer: {product.manufacturer.slice(0, 6)}...
            {product.manufacturer.slice(-4)}
            </p>

            <p>
            CID: {product.cid.slice(0, 6)}...
            {product.cid.slice(-4)}
            </p>

        </div>
        ))}
    </div>
    )
}

export default ProductList
