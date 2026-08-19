import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useWallet } from "../../hooks/useWallet";
import { useSupplyChain } from "../../hooks/useSupplyChain";
import { getGasOverrides } from "../../lib/trace/wallet";
import { STATUS_LABELS, STATUS_COLORS, getValidNextStatuses, shortAddr } from "../../lib/trace/config";

export function DistributorDashboard() {
  const { account } = useWallet();
  const { contract, getProduct } = useSupplyChain();
  const [activeTab, setActiveTab] = useState("custody");
  const [custodyProducts, setCustodyProducts] = useState([]);
  const [allTransferredProducts, setAllTransferredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  // Form states per product card: { [pid]: { status: string, location: string, newOwner: string } }
  const [forms, setForms] = useState({});

  const loadDistributorData = async () => {
    if (!contract || !account) return;
    setLoading(true);
    try {
      const events = await contract.queryFilter("OwnershipTransferred");
      const distEvents = events.filter((e) => {
        const toAddr = e.args?.newOwner || e.args?.to || e.args?.[2];
        return toAddr && toAddr.toLowerCase() === account.toLowerCase();
      });

      // Extract unique product IDs
      const rawIds = distEvents.map((e) => Number(e.args?.productId || e.args?.[0]));
      const uniqueIds = Array.from(new Set(rawIds));

      const productsData = await Promise.all(
        uniqueIds.map(async (id) => {
          const p = await getProduct(id);
          return p ? { ...p, productId: id } : null;
        })
      );

      const validProducts = productsData.filter(Boolean);

      // In Custody: currentOwner === account
      const currentCustody = validProducts.filter(
        (p) => p.currentOwner && p.currentOwner.toLowerCase() === account.toLowerCase()
      );

      setCustodyProducts(currentCustody);
      setAllTransferredProducts(validProducts);

      // Init forms state for custody items
      const initialForms = {};
      currentCustody.forEach((p) => {
        const nextOpts = getValidNextStatuses(p.status);
        initialForms[p.productId] = {
          status: nextOpts.length > 0 ? nextOpts[0].value : String(p.status),
          location: "",
          newOwner: "",
        };
      });
      setForms(initialForms);

      setLoading(false);
    } catch (err) {
      console.error("Error loading distributor data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDistributorData();
  }, [contract, account]);

  const handleUpdateStatus = async (productId, e) => {
    e.preventDefault();
    const formData = forms[productId];
    if (!formData || !formData.status) return;

    setSubmittingId(productId);
    try {
      const overrides = await getGasOverrides();
      const tx = await contract.updateStatus(
        productId,
        Number(formData.status),
        formData.location || "Logistics Hub",
        overrides
      );
      await tx.wait();
      toast.success(`Status updated for Product #${productId}`);
      await loadDistributorData();
    } catch (err) {
      toast.error("Failed to update status", { description: err?.message?.slice(0, 120) });
    } finally {
      setSubmittingId(null);
    }
  };

  const handleTransferOwnership = async (productId, e) => {
    e.preventDefault();
    const formData = forms[productId];
    if (!formData || !/^0x[a-fA-F0-9]{40}$/.test(formData.newOwner)) {
      toast.error("Invalid Ethereum Address");
      return;
    }

    setSubmittingId(productId);
    try {
      const overrides = await getGasOverrides();
      const tx = await contract.transferOwnership(productId, formData.newOwner, overrides);
      await tx.wait();
      toast.success(`Ownership transferred for Product #${productId}`);
      await loadDistributorData();
    } catch (err) {
      toast.error("Failed to transfer ownership", { description: err?.message?.slice(0, 120) });
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
              DISTRIBUTOR DASHBOARD
            </h1>
            <span className="brut border-[2px] border-ink bg-blue px-3 py-1 font-display text-sm font-extrabold uppercase text-paper">
              DISTRIBUTOR
            </span>
          </div>
          <p className="label-tech mt-2 text-xs opacity-70">
            LOGISTICS CUSTODY CONTROL & IN-TRANSIT STATUS UPDATES
          </p>
        </div>

        {/* TABS */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("custody")}
            className={`brut border-[3px] border-ink px-4 py-2 font-display text-sm font-extrabold uppercase transition-all ${
              activeTab === "custody" ? "bg-yellow text-ink" : "bg-paper text-ink opacity-80"
            }`}
          >
            IN MY CUSTODY ({custodyProducts.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`brut border-[3px] border-ink px-4 py-2 font-display text-sm font-extrabold uppercase transition-all ${
              activeTab === "history" ? "bg-yellow text-ink" : "bg-paper text-ink opacity-80"
            }`}
          >
            LOGISTICS HISTORY ({allTransferredProducts.length})
          </button>
        </div>
      </header>

      {/* TAB 1: IN MY CUSTODY */}
      {activeTab === "custody" && (
        <section className="space-y-6">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2].map((i) => (
                <div key={i} className="brut-md border-[3px] border-ink bg-[#1A1A2E] h-72 animate-pulse" />
              ))}
            </div>
          ) : custodyProducts.length === 0 ? (
            <div className="brut-md border-[3px] border-dashed border-ink bg-[#1A1A2E] p-12 text-center text-paper">
              <h3 className="font-display text-2xl font-extrabold uppercase">NO ITEMS CURRENTLY IN CUSTODY</h3>
              <p className="label-tech mt-2 opacity-60">Products transferred to your wallet for distribution will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {custodyProducts.map((p) => {
                const validNextOpts = getValidNextStatuses(p.status);
                const statusColor = STATUS_COLORS[p.status] || "bg-blue";
                const statusLabel = STATUS_LABELS[p.status] || "UNKNOWN";
                const formData = forms[p.productId] || { status: "", location: "", newOwner: "" };

                return (
                  <div key={p.productId} className="brut-md border-[3px] border-ink bg-[#1A1A2E] p-6 text-paper space-y-5">
                    <div className="flex items-center justify-between border-b-[2px] border-ink pb-3">
                      <span className="font-display text-2xl font-extrabold uppercase text-yellow">
                        PRODUCT #{String(p.productId).padStart(3, "0")}
                      </span>
                      <span className={`brut border-[2px] border-ink ${statusColor} px-2 py-1 text-xs font-bold text-paper`}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* UPDATE STATUS INLINE FORM */}
                    {validNextOpts.length > 0 ? (
                      <form onSubmit={(e) => handleUpdateStatus(p.productId, e)} className="border-[2px] border-ink bg-ink/40 p-3 space-y-3">
                        <label className="label-tech block text-xs font-bold text-yellow">
                          UPDATE SHIPPING STATUS
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) =>
                            setForms({
                              ...forms,
                              [p.productId]: { ...formData, status: e.target.value },
                            })
                          }
                          className="w-full border-[2px] border-ink bg-paper p-2 font-mono text-xs text-ink"
                        >
                          {validNextOpts.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Current Location (e.g. Port of Cartagena)"
                          value={formData.location}
                          onChange={(e) =>
                            setForms({
                              ...forms,
                              [p.productId]: { ...formData, location: e.target.value },
                            })
                          }
                          className="w-full border-[2px] border-ink bg-paper p-2 font-mono text-xs text-ink"
                        />
                        <button
                          type="submit"
                          disabled={submittingId === p.productId}
                          className="w-full brut border-[2px] border-ink bg-green py-2 font-display text-xs font-extrabold uppercase text-paper hover:bg-opacity-90 disabled:opacity-50"
                        >
                          {submittingId === p.productId ? "UPDATING..." : "UPDATE STATUS"}
                        </button>
                      </form>
                    ) : (
                      <div className="border-[2px] border-ink bg-ink/60 p-3 text-center text-xs text-gray-400">
                        TERMINAL STATUS — NO FURTHER UPDATES PERMITTED
                      </div>
                    )}

                    {/* TRANSFER OWNERSHIP INLINE FORM */}
                    <form onSubmit={(e) => handleTransferOwnership(p.productId, e)} className="border-[2px] border-ink bg-ink/40 p-3 space-y-3">
                      <label className="label-tech block text-xs font-bold text-blue">
                        TRANSFER CUSTODY TO NEXT OWNER
                      </label>
                      <input
                        type="text"
                        placeholder="Recipient Address (0x...)"
                        value={formData.newOwner}
                        onChange={(e) =>
                          setForms({
                            ...forms,
                            [p.productId]: { ...formData, newOwner: e.target.value },
                          })
                        }
                        className="w-full border-[2px] border-ink bg-paper p-2 font-mono text-xs text-ink"
                      />
                      <button
                        type="submit"
                        disabled={submittingId === p.productId}
                        className="w-full brut border-[2px] border-ink bg-blue py-2 font-display text-xs font-extrabold uppercase text-paper hover:bg-opacity-90 disabled:opacity-50"
                      >
                        {submittingId === p.productId ? "TRANSFERRING..." : "TRANSFER OWNERSHIP"}
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: HISTORY */}
      {activeTab === "history" && (
        <section className="space-y-6">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2].map((i) => (
                <div key={i} className="brut-md border-[3px] border-ink bg-[#1A1A2E] h-48 animate-pulse" />
              ))}
            </div>
          ) : allTransferredProducts.length === 0 ? (
            <div className="brut-md border-[3px] border-dashed border-ink bg-[#1A1A2E] p-12 text-center text-paper">
              <h3 className="font-display text-2xl font-extrabold uppercase">NO HISTORICAL TRANSFERS FOUND</h3>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {allTransferredProducts.map((p) => {
                const statusColor = STATUS_COLORS[p.status] || "bg-blue";
                const statusLabel = STATUS_LABELS[p.status] || "UNKNOWN";
                const isCurrent = p.currentOwner.toLowerCase() === account?.toLowerCase();

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
                      <div className="mt-3 space-y-1 text-xs font-mono text-gray-300">
                        <div>
                          <span className="opacity-60">CURRENT CUSTODIAN:</span>{" "}
                          {isCurrent ? (
                            <span className="text-green font-bold">YOU</span>
                          ) : (
                            <span>{shortAddr(p.currentOwner, 4)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/products/$id"
                      params={{ id: String(p.productId) }}
                      className="brut border-[2px] border-ink bg-purple block text-center py-2 font-display text-xs font-extrabold uppercase text-paper hover:bg-opacity-90"
                    >
                      VIEW JOURNEY LOGS
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
