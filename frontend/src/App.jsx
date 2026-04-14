import { useState } from "react";
import useWallet from "./hooks/useWallet";
import ProductList from "./components/ProductList";
import ProductDetail from "./components/ProductDetail";
import AddProduct from "./components/AddProduct";

const App = () => {
    const { account, error, connectWallet } = useWallet();
    const [view, setView] = useState("list");
    const [selectedProductId, setSelectedProductId] = useState(null);

    const handleViewProduct = (id) => {
        setSelectedProductId(id);
        setView("detail");
    };

    return (
        <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "0 auto", padding: "20px" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px solid #ccc", paddingBottom: "16px" }}>
                <h1 style={{ margin: 0 }}>TraceChain</h1>
                <div>
                    {account ? (
                        <span style={{ background: "#e8f5e9", padding: "6px 12px", borderRadius: "20px", fontSize: "13px" }}>
                            {account.slice(0, 6)}...{account.slice(-4)}
                        </span>
                    ) : (
                        <button onClick={connectWallet}>Connect Wallet</button>
                    )}
                </div>
            </div>

            {error && (
                <div style={{ color: "red", marginBottom: "16px" }}>
                    {error}
                </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                <button
                    onClick={() => setView("list")}
                    style={{ fontWeight: view === "list" ? "bold" : "normal" }}
                >
                    All Products
                </button>
                <button
                    onClick={() => setView("add")}
                    style={{ fontWeight: view === "add" ? "bold" : "normal" }}
                >
                    Add Product
                </button>
            </div>

            {view === "list" && (
                <ProductList onViewProduct={handleViewProduct} />
            )}

            {view === "detail" && selectedProductId && (
                <div>
                    <button onClick={() => setView("list")} style={{ marginBottom: "16px" }}>
                        ← Back to list
                    </button>
                    <ProductDetail productId={selectedProductId} />
                </div>
            )}

            {view === "add" && (
                <div>
                    <button onClick={() => setView("list")} style={{ marginBottom: "16px" }}>
                        ← Back to list
                    </button>
                    <AddProduct />
                </div>
            )}

        </div>
    );
};

export default App;