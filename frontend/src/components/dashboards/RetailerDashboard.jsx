import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useWallet } from "../../hooks/useWallet";
import { useSupplyChain } from "../../hooks/useSupplyChain";
import { getGasOverrides } from "../../lib/trace/wallet";
import { STATUS_LABELS, STATUS_COLORS, shortAddr } from "../../lib/trace/config";

export function RetailerDashboard() {
  const { account } = useWallet();
  const { contract, getProduct, getWriteContract } = useSupplyChain();
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingProducts, setPendingProducts] = useState([]);
  const [deliveredProducts, setDeliveredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [locations, setLocations] = useState({});

  const loadRetailerData = async () => {
    if (!contract || !account) return;
    setLoading(true);
    try {
      const events = await contract.queryFilter("OwnershipTransferred");
      const retEvents = events.filter((e) => {
        const toAddr = e.args?.newOwner || e.args?.to || e.args?.[2];
        return toAddr && toAddr.toLowerCase() === account.toLowerCase();
      });

      const rawIds = retEvents.map((e) => Number(e.args?.productId || e.args?.[0]));
      const uniqueIds = Array.from(new Set(rawIds));

      const productsData = await Promise.all(
        uniqueIds.map(async (id) => {
          const p = await getProduct(id);
          return p ? { ...p, productId: id } : null;
        })
      );

      const inCustody = productsData
        .filter(Boolean)
        .filter((p) => p.currentOwner && p.currentOwner.toLowerCase() === account.toLowerCase());

      const pending = inCustody.filter((p) => Number(p.status) < 3);
      const delivered = inCustody.filter((p) => Number(p.status) === 3);

      setPendingProducts(pending);
      setDeliveredProducts(delivered);

      const initialLocs = {};
      pending.forEach((p) => {
        initialLocs[p.productId] = "";
      });
      setLocations(initialLocs);

      setLoading(false);
    } catch (err) {
      console.error("Error loading retailer data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRetailerData();
  }, [contract, account]);

  const handleMarkAsDelivered = async (productId, e) => {
    e.preventDefault();
    const location = locations[productId] || "Retail Store Location";

    setSubmittingId(productId);
    try {
      const writeContract = await getWriteContract();
      const overrides = await getGasOverrides();
      // Status 3 = Delivered
      const tx = await writeContract.updateStatus(productId, 3, location, overrides);
      await tx.wait();
      toast.success(`Product #${productId} marked as DELIVERED!`);
      await loadRetailerData();
    } catch (err) {
      toast.error("Failed to update status to Delivered", { description: err?.message?.slice(0, 120) });
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8 space-y-8">
      {/* HEADER */}
      <header className="brut-xl border-[4px] border-ink bg-[#1A1A2E] p-6 sm:p-8 text-paper flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
              RETAILER DASHBOARD
            </h1>
            <span className="brut border-[2px] border-ink bg-purple px-3 py-1 font-display text-sm font-extrabold uppercase text-paper">
              RETAILER
            </span>
          </div>
          <p className="label-tech mt-2 text-xs opacity-70">
            FINAL STORE CUSTODY RECEIPT & DELIVERED STATUS VERIFICATION
          </p>
        </div>

        {/* TABS */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("pending")}
            className={`brut border-[3px] border-ink px-4 py-2 font-display text-sm font-extrabold uppercase transition-all ${
              activeTab === "pending" ? "bg-yellow text-ink" : "bg-paper text-ink opacity-80"
            }`}
          >
            PENDING DELIVERY ({pendingProducts.length})
          </button>
          <button
            onClick={() => setActiveTab("delivered")}
            className={`brut border-[3px] border-ink px-4 py-2 font-display text-sm font-extrabold uppercase transition-all ${
              activeTab === "delivered" ? "bg-yellow text-ink" : "bg-paper text-ink opacity-80"
            }`}
          >
            DELIVERED ({deliveredProducts.length})
          </button>
        </div>
      </header>

      {/* TAB 1: PENDING DELIVERY */}
      {activeTab === "pending" && (
        <section className="space-y-6">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2].map((i) => (
                <div key={i} className="brut-md border-[3px] border-ink bg-[#1A1A2E] h-64 animate-pulse" />
              ))}
            </div>
          ) : pendingProducts.length === 0 ? (
            <div className="brut-md border-[3px] border-dashed border-ink bg-[#1A1A2E] p-12 text-center text-paper">
              <h3 className="font-display text-2xl font-extrabold uppercase">NO PENDING SHIPMENTS</h3>
              <p className="label-tech mt-2 opacity-60">Products transferred to your store address will appear here prior to delivery confirmation.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pendingProducts.map((p) => {
                const statusColor = STATUS_COLORS[p.status] || "bg-blue";
                const statusLabel = STATUS_LABELS[p.status] || "UNKNOWN";

                return (
                  <div key={p.productId} className="brut-md border-[3px] border-ink bg-[#1A1A2E] p-6 text-paper space-y-4">
                    <div className="flex items-center justify-between border-b-[2px] border-ink pb-3">
                      <span className="font-display text-2xl font-extrabold uppercase text-yellow">
                        PRODUCT #{String(p.productId).padStart(3, "0")}
                      </span>
                      <span className={`brut border-[2px] border-ink ${statusColor} px-2 py-1 text-xs font-bold text-paper`}>
                        {statusLabel}
                      </span>
                    </div>

                    <form onSubmit={(e) => handleMarkAsDelivered(p.productId, e)} className="space-y-3 pt-2">
                      <div>
                        <label className="label-tech block text-xs opacity-70 mb-1">
                          RECEIVING STORE LOCATION
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Store #42, Manhattan NYC"
                          value={locations[p.productId] || ""}
                          onChange={(e) =>
                            setLocations({ ...locations, [p.productId]: e.target.value })
                          }
                          className="w-full border-[2px] border-ink bg-paper p-2 font-mono text-xs text-ink"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submittingId === p.productId}
                        className="w-full brut border-[2px] border-ink bg-green py-3 font-display text-sm font-extrabold uppercase text-paper hover:bg-opacity-90 disabled:opacity-50"
                      >
                        {submittingId === p.productId ? "CONFIRMING..." : "MARK AS DELIVERED"}
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: DELIVERED */}
      {activeTab === "delivered" && (
        <section className="space-y-6">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2].map((i) => (
                <div key={i} className="brut-md border-[3px] border-ink bg-[#1A1A2E] h-48 animate-pulse" />
              ))}
            </div>
          ) : deliveredProducts.length === 0 ? (
            <div className="brut-md border-[3px] border-dashed border-ink bg-[#1A1A2E] p-12 text-center text-paper">
              <h3 className="font-display text-2xl font-extrabold uppercase">NO DELIVERED PRODUCTS RECORDED</h3>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {deliveredProducts.map((p) => (
                <div key={p.productId} className="brut-md border-[3px] border-ink bg-[#1A1A2E] p-6 text-paper space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b-[2px] border-ink pb-3">
                      <span className="font-display text-2xl font-extrabold uppercase text-yellow">
                        PRODUCT #{String(p.productId).padStart(3, "0")}
                      </span>
                      <span className="brut border-[2px] border-ink bg-green px-2 py-1 text-xs font-bold text-paper">
                        DELIVERED
                      </span>
                    </div>
                    <p className="mt-3 label-tech text-xs opacity-70">
                      STATUS COMPLETED & LOCKED ON POLYGON
                    </p>
                  </div>
                  <Link
                    to="/products/$id"
                    params={{ id: String(p.productId) }}
                    className="brut border-[2px] border-ink bg-purple block text-center py-2 font-display text-xs font-extrabold uppercase text-paper hover:bg-opacity-90"
                  >
                    VIEW FULL HISTORY
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
