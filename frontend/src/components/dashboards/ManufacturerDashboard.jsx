import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useWallet } from "../../hooks/useWallet";
import { useSupplyChain } from "../../hooks/useSupplyChain";
import AddProductPage from "../../routes/add";
import { STATUS_LABELS, STATUS_COLORS, shortAddr } from "../../lib/trace/config";

export function ManufacturerDashboard() {
  const { account } = useWallet();
  const { contract, getProduct } = useSupplyChain();
  const [activeTab, setActiveTab] = useState("my-products");
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadManufacturerProducts() {
      if (!contract || !account) return;
      setLoading(true);
      try {
        const events = await contract.queryFilter("ProductCreated");
        const mfgEvents = events.filter((e) => {
          const mfgAddr = e.args?.manufacturer || e.args?.[1];
          return mfgAddr && mfgAddr.toLowerCase() === account.toLowerCase();
        });

        const productsData = await Promise.all(
          mfgEvents.map(async (e) => {
            const pid = e.args?.productId || e.args?.[0];
            const numericId = Number(pid);
            const pDetails = await getProduct(numericId);
            return {
              productId: numericId,
              metadataCID: e.args?.metadataCID || e.args?.[2] || pDetails?.metadataCID || "",
              currentOwner: pDetails?.currentOwner || account,
              status: pDetails ? Number(pDetails.status) : 0,
            };
          })
        );

        if (isMounted) {
          setMyProducts(productsData.reverse());
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading manufacturer products:", err);
        if (isMounted) setLoading(false);
      }
    }

    loadManufacturerProducts();
    return () => {
      isMounted = false;
    };
  }, [contract, account, getProduct]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8 space-y-8">
      {/* HEADER */}
      <header className="brut-xl border-[4px] border-ink bg-[#1A1A2E] p-6 sm:p-8 text-paper flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
              MANUFACTURER DASHBOARD
            </h1>
            <span className="brut border-[2px] border-ink bg-green px-3 py-1 font-display text-sm font-extrabold uppercase text-paper">
              MANUFACTURER
            </span>
          </div>
          <p className="label-tech mt-2 text-xs opacity-70">
            REGISTER NEW GOODS & MONITOR ON-CHAIN ORIGIN RECORDS
          </p>
        </div>

        {/* TABS */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("my-products")}
            className={`brut border-[3px] border-ink px-4 py-2 font-display text-sm font-extrabold uppercase transition-all ${
              activeTab === "my-products" ? "bg-yellow text-ink" : "bg-paper text-ink opacity-80"
            }`}
          >
            MY PRODUCTS ({myProducts.length})
          </button>
          <button
            onClick={() => setActiveTab("create-product")}
            className={`brut border-[3px] border-ink px-4 py-2 font-display text-sm font-extrabold uppercase transition-all ${
              activeTab === "create-product" ? "bg-yellow text-ink" : "bg-paper text-ink opacity-80"
            }`}
          >
            + CREATE PRODUCT
          </button>
        </div>
      </header>

      {/* TAB CONTENT */}
      {activeTab === "my-products" && (
        <section className="space-y-6">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="brut-md border-[3px] border-ink bg-[#1A1A2E] h-56 animate-pulse" />
              ))}
            </div>
          ) : myProducts.length === 0 ? (
            <div className="brut-md border-[3px] border-dashed border-ink bg-[#1A1A2E] p-12 text-center text-paper">
              <h3 className="font-display text-2xl font-extrabold uppercase">NO CREATED PRODUCTS YET</h3>
              <p className="label-tech mt-2 opacity-60">Click "Create Product" to register your first product on-chain.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myProducts.map((p) => {
                const isTransferred = p.currentOwner.toLowerCase() !== account?.toLowerCase();
                const statusColor = STATUS_COLORS[p.status] || "bg-blue";
                const statusLabel = STATUS_LABELS[p.status] || "UNKNOWN";

                return (
                  <div key={p.productId} className="brut-md border-[3px] border-ink bg-[#1A1A2E] p-6 text-paper space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b-[2px] border-ink pb-3">
                        <span className="font-display text-2xl font-extrabold uppercase text-yellow">
                          PRODUCT #{String(p.productId).padStart(3, "0")}
                        </span>
                        <span className={`brut border-[2px] border-ink ${statusColor} px-2 py-1 text-xs font-bold text-paper`}>
                          {statusLabel}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-xs font-mono">
                        <div>
                          <span className="opacity-60 block">CURRENT CUSTODIAN:</span>
                          {isTransferred ? (
                            <span className="brut inline-block bg-orange px-2 py-0.5 font-bold text-ink">
                              TRANSFERRED ({shortAddr(p.currentOwner, 4)})
                            </span>
                          ) : (
                            <span className="text-green font-bold">YOU (ORIGINAL MANUFACTURER)</span>
                          )}
                        </div>
                        {p.metadataCID && (
                          <div>
                            <span className="opacity-60 block">IPFS CID:</span>
                            <span className="break-all font-mono text-[11px] text-gray-300">
                              {p.metadataCID.slice(0, 24)}...
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link
                        to="/products/$id"
                        params={{ id: String(p.productId) }}
                        className="brut border-[2px] border-ink bg-purple block text-center py-2 font-display text-xs font-extrabold uppercase text-paper hover:bg-opacity-90"
                      >
                        VIEW DETAILS & TRACK
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {activeTab === "create-product" && (
        <section className="brut-md border-[3px] border-ink bg-[#1A1A2E] p-6 text-paper">
          <Link to="/add" className="brut border-[3px] border-ink bg-purple px-6 py-3 font-display font-extrabold uppercase text-paper inline-block mb-4">
            GO TO FULL PRODUCT REGISTRATION FORM ➔
          </Link>
        </section>
      )}
    </div>
  );
}
