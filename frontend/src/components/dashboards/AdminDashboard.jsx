import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { keccak256, toUtf8Bytes } from "ethers";
import { useWallet } from "../../hooks/useWallet";
import { useSupplyChain } from "../../hooks/useSupplyChain";
import { getGasOverrides } from "../../lib/trace/wallet";
import { getRequests, updateRequest } from "../../utils/jsonbin";
import { STATUS_LABELS, STATUS_COLORS, shortAddr } from "../../lib/trace/config";

const roleHash = (roleName) => keccak256(toUtf8Bytes(`${roleName.toUpperCase()}_ROLE`));

export function AdminDashboard() {
  const { account } = useWallet();
  const { contract, getProduct, getWriteContract } = useSupplyChain();
  const [activeTab, setActiveTab] = useState("roles");

  // Tab 1: Role Management states
  const [roleHolders, setRoleHolders] = useState([]);
  const [grantAddress, setGrantAddress] = useState("");
  const [grantRole, setGrantRole] = useState("MANUFACTURER");
  const [roleLoading, setRoleLoading] = useState(true);

  // Tab 2: All Products states
  const [allProducts, setAllProducts] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [productsLoading, setProductsLoading] = useState(true);

  // Tab 3: Role Requests states
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [pastOpen, setPastOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);

  // Load Role Management Holders
  const loadRoles = async () => {
    if (!contract) return;
    setRoleLoading(true);
    try {
      const events = await contract.queryFilter("RoleGranted");
      const holdersMap = new Map();

      for (const e of events) {
        const r = e.args?.role || e.args?.[0];
        const a = e.args?.account || e.args?.[1];
        if (!r || !a) continue;

        let roleName = "UNKNOWN";
        const mfgHash = await contract.MANUFACTURER_ROLE();
        const distHash = await contract.DISTRIBUTOR_ROLE();
        const retHash = await contract.RETAILER_ROLE();

        if (r === mfgHash) roleName = "MANUFACTURER";
        else if (r === distHash) roleName = "DISTRIBUTOR";
        else if (r === retHash) roleName = "RETAILER";

        if (roleName !== "UNKNOWN") {
          const key = `${a.toLowerCase()}_${roleName}`;
          holdersMap.set(key, {
            address: a,
            role: roleName,
            roleBytes: r,
            blockNumber: e.blockNumber,
          });
        }
      }

      setRoleHolders(Array.from(holdersMap.values()));
      setRoleLoading(false);
    } catch (err) {
      console.error("Error loading role holders:", err);
      setRoleLoading(false);
    }
  };

  // Load All Products
  const loadProducts = async () => {
    if (!contract) return;
    setProductsLoading(true);
    try {
      const events = await contract.queryFilter("ProductCreated");
      const productsData = await Promise.all(
        events.map(async (e) => {
          const id = Number(e.args?.productId || e.args?.[0]);
          const p = await getProduct(id);
          return p ? { ...p, productId: id } : null;
        })
      );
      setAllProducts(productsData.filter(Boolean).reverse());
      setProductsLoading(false);
    } catch (err) {
      console.error("Error loading all products:", err);
      setProductsLoading(false);
    }
  };

  // Load Role Requests
  const loadRequestsData = async () => {
    setRequestsLoading(true);
    try {
      const reqs = await getRequests();
      setRequests(reqs);
      setRequestsLoading(false);
    } catch (err) {
      console.error("Error loading requests:", err);
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
    loadProducts();
    loadRequestsData();
  }, [contract]);

  // Grant Role
  const handleGrantRole = async (e) => {
    e.preventDefault();
    if (!/^0x[a-fA-F0-9]{40}$/.test(grantAddress)) {
      toast.error("Invalid Ethereum Address");
      return;
    }
    try {
      let rHash;
      if (grantRole === "MANUFACTURER") rHash = await contract.MANUFACTURER_ROLE();
      else if (grantRole === "DISTRIBUTOR") rHash = await contract.DISTRIBUTOR_ROLE();
      else if (grantRole === "RETAILER") rHash = await contract.RETAILER_ROLE();
      else rHash = roleHash(grantRole);

      const writeContract = await getWriteContract();
      const overrides = await getGasOverrides();
      const tx = await writeContract.grantRole(rHash, grantAddress, overrides);
      await tx.wait();
      toast.success(`${grantRole} role granted to ${shortAddr(grantAddress, 4)}`);
      setGrantAddress("");
      await loadRoles();
    } catch (err) {
      toast.error("Failed to grant role", { description: err?.message?.slice(0, 120) });
    }
  };

  // Revoke Role
  const handleRevokeRole = async (holder) => {
    try {
      const writeContract = await getWriteContract();
      const overrides = await getGasOverrides();
      const tx = await writeContract.revokeRole(holder.roleBytes, holder.address, overrides);
      await tx.wait();
      toast.success(`${holder.role} role revoked from ${shortAddr(holder.address, 4)}`);
      await loadRoles();
    } catch (err) {
      toast.error("Failed to revoke role", { description: err?.message?.slice(0, 120) });
    }
  };

  // Approve Request
  const handleApproveRequest = async (req) => {
    setBusyId(req.id);
    try {
      let rHash;
      const roleUpper = req.requestedRole.toUpperCase();
      if (roleUpper.includes("MANUFACTURER")) rHash = await contract.MANUFACTURER_ROLE();
      else if (roleUpper.includes("DISTRIBUTOR")) rHash = await contract.DISTRIBUTOR_ROLE();
      else if (roleUpper.includes("RETAILER")) rHash = await contract.RETAILER_ROLE();
      else rHash = roleHash(req.requestedRole);

      const writeContract = await getWriteContract();
      const overrides = await getGasOverrides();
      const tx = await writeContract.grantRole(rHash, req.walletAddress, overrides);
      await tx.wait();

      await updateRequest(req.id, { status: "approved" });
      toast.success(`Role granted to ${req.companyName} and request approved!`);
      await loadRequestsData();
      await loadRoles();
    } catch (err) {
      toast.error("Approval failed", { description: err?.message?.slice(0, 120) });
    } finally {
      setBusyId(null);
    }
  };

  // Reject Request
  const handleRejectRequest = async (req) => {
    setBusyId(req.id);
    try {
      await updateRequest(req.id, { status: "rejected" });
      toast.success("Request rejected.");
      await loadRequestsData();
    } catch (err) {
      toast.error("Rejection failed", { description: err?.message?.slice(0, 120) });
    } finally {
      setBusyId(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const pastRequests = requests.filter((r) => r.status !== "pending");

  const filteredProducts = allProducts.filter((p) => {
    if (filterStatus === "ALL") return true;
    return String(p.status) === filterStatus;
  });

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8 space-y-8">
      {/* HEADER */}
      <header className="brut-xl border-[4px] border-ink bg-[#1A1A2E] p-6 sm:p-8 text-paper flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
              ADMIN DASHBOARD
            </h1>
            <span className="brut border-[2px] border-ink bg-red px-3 py-1 font-display text-sm font-extrabold uppercase text-paper">
              ADMIN
            </span>
          </div>
          <p className="label-tech mt-2 text-xs opacity-70">
            SYSTEM GOVERNANCE, ROLE ASSIGNMENTS & PLATFORM AUDIT
          </p>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("roles")}
            className={`brut border-[3px] border-ink px-4 py-2 font-display text-sm font-extrabold uppercase transition-all ${
              activeTab === "roles" ? "bg-yellow text-ink" : "bg-paper text-ink opacity-80"
            }`}
          >
            ROLE MANAGEMENT ({roleHolders.length})
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`brut border-[3px] border-ink px-4 py-2 font-display text-sm font-extrabold uppercase transition-all ${
              activeTab === "products" ? "bg-yellow text-ink" : "bg-paper text-ink opacity-80"
            }`}
          >
            ALL PRODUCTS ({allProducts.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`brut border-[3px] border-ink px-4 py-2 font-display text-sm font-extrabold uppercase transition-all flex items-center gap-2 ${
              activeTab === "requests" ? "bg-yellow text-ink" : "bg-paper text-ink opacity-80"
            }`}
          >
            ROLE REQUESTS
            {pendingRequests.length > 0 && (
              <span className="rounded-full bg-red px-2 py-0.5 text-xs text-paper font-mono">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* TAB 1: ROLE MANAGEMENT */}
      {activeTab === "roles" && (
        <section className="space-y-8">
          <div className="brut-md border-[3px] border-ink bg-[#1A1A2E] p-6 text-paper space-y-6">
            <h2 className="font-display text-2xl font-extrabold uppercase text-yellow">
              CURRENT ROLE HOLDERS ON-CHAIN
            </h2>

            {roleLoading ? (
              <div className="h-32 animate-pulse bg-ink/50" />
            ) : roleHolders.length === 0 ? (
              <p className="label-tech opacity-60">No custom roles granted yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b-[2px] border-ink bg-ink/60 text-yellow uppercase">
                      <th className="p-3">ETHEREUM ADDRESS</th>
                      <th className="p-3">ROLE</th>
                      <th className="p-3">BLOCK NO</th>
                      <th className="p-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roleHolders.map((h, i) => (
                      <tr key={i} className="border-b border-ink/40 hover:bg-ink/30">
                        <td className="p-3 font-bold">{h.address}</td>
                        <td className="p-3">
                          <span className="brut border-[1px] border-ink bg-purple px-2 py-0.5 text-[10px] text-paper font-bold">
                            {h.role}
                          </span>
                        </td>
                        <td className="p-3 opacity-70">#{h.blockNumber}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRevokeRole(h)}
                            className="brut border-[2px] border-ink bg-red px-3 py-1 text-xs font-bold text-paper hover:bg-opacity-90"
                          >
                            REVOKE
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* GRANT ROLE FORM */}
          <div className="brut-md border-[3px] border-ink bg-[#1A1A2E] p-6 text-paper">
            <h3 className="font-display text-xl font-extrabold uppercase text-yellow mb-4">
              GRANT NEW ROLE
            </h3>
            <form onSubmit={handleGrantRole} className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
              <input
                type="text"
                placeholder="Ethereum Address (0x...)"
                required
                value={grantAddress}
                onChange={(e) => setGrantAddress(e.target.value)}
                className="border-[2px] border-ink bg-paper p-3 font-mono text-sm text-ink"
              />
              <select
                value={grantRole}
                onChange={(e) => setGrantRole(e.target.value)}
                className="border-[2px] border-ink bg-paper p-3 font-mono text-sm text-ink"
              >
                <option value="MANUFACTURER">MANUFACTURER</option>
                <option value="DISTRIBUTOR">DISTRIBUTOR</option>
                <option value="RETAILER">RETAILER</option>
              </select>
              <button
                type="submit"
                className="brut border-[3px] border-ink bg-green px-4 py-3 font-display font-extrabold uppercase text-paper hover:bg-opacity-90"
              >
                GRANT ROLE
              </button>
            </form>
          </div>
        </section>
      )}

      {/* TAB 2: ALL PRODUCTS */}
      {activeTab === "products" && (
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-[4px] border-ink pb-3 text-paper">
            <h2 className="font-display text-2xl font-extrabold uppercase">GLOBAL PRODUCT LEDGER</h2>
            <div className="flex items-center gap-2">
              <label className="label-tech text-xs opacity-70">FILTER BY STATUS:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="brut border-[2px] border-ink bg-paper px-3 py-1 font-mono text-xs text-ink"
              >
                <option value="ALL">ALL ({allProducts.length})</option>
                <option value="0">0: CREATED</option>
                <option value="1">1: SHIPPED</option>
                <option value="2">2: IN TRANSIT</option>
                <option value="3">3: DELIVERED</option>
                <option value="4">4: CANCELLED</option>
              </select>
            </div>
          </div>

          {productsLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="brut-md border-[3px] border-ink bg-[#1A1A2E] h-52 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="brut-md border-[3px] border-dashed border-ink bg-[#1A1A2E] p-12 text-center text-paper">
              <h3 className="font-display text-2xl font-extrabold uppercase">NO PRODUCTS MATCH FILTER</h3>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((p) => {
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
                      <div className="mt-3 space-y-1 text-xs font-mono text-gray-300">
                        <div><span className="opacity-60">MANUFACTURER:</span> {shortAddr(p.manufacturer, 4)}</div>
                        <div><span className="opacity-60">CUSTODIAN:</span> {shortAddr(p.currentOwner, 4)}</div>
                      </div>
                    </div>
                    <Link
                      to="/products/$id"
                      params={{ id: String(p.productId) }}
                      className="brut border-[2px] border-ink bg-purple block text-center py-2 font-display text-xs font-extrabold uppercase text-paper hover:bg-opacity-90"
                    >
                      INSPECT RECORD
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: ROLE REQUESTS */}
      {activeTab === "requests" && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b-[4px] border-ink pb-3 text-paper">
            <h2 className="font-display text-2xl font-extrabold uppercase">
              PENDING ROLE REQUESTS ({pendingRequests.length})
            </h2>
            <button
              onClick={() => loadRequestsData()}
              className="brut border-[2px] border-ink bg-paper px-3 py-1 font-mono text-xs text-ink"
            >
              REFRESH
            </button>
          </div>

          {requestsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="brut-md border-[3px] border-ink bg-[#1A1A2E] h-40 animate-pulse" />
              ))}
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="brut-md border-[3px] border-dashed border-ink bg-[#1A1A2E] p-10 text-center text-paper">
              <h3 className="font-display text-xl font-extrabold uppercase">NO PENDING ACCESS REQUESTS</h3>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((req) => (
                <div key={req.id} className="brut-md border-[3px] border-ink bg-[#1A1A2E] p-6 text-paper flex flex-wrap items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-2xl font-extrabold uppercase text-yellow">
                        {req.companyName}
                      </h3>
                      <span className="brut border-[1px] border-ink bg-purple px-2 py-0.5 font-display text-xs font-bold uppercase text-paper">
                        REQUESTED: {req.requestedRole}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-gray-300">
                      <span className="opacity-60">ADDRESS:</span> {req.walletAddress}
                    </p>
                    {req.reason && (
                      <p className="font-mono text-xs text-gray-400 italic">
                        "{req.reason}"
                      </p>
                    )}
                    <p className="label-tech text-[10px] opacity-60">
                      SUBMITTED: {new Date(req.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproveRequest(req)}
                      disabled={busyId === req.id}
                      className="brut border-[2px] border-ink bg-green px-6 py-3 font-display font-extrabold uppercase text-paper hover:bg-opacity-90 disabled:opacity-50"
                    >
                      {busyId === req.id ? "APPROVING..." : "APPROVE"}
                    </button>
                    <button
                      onClick={() => handleRejectRequest(req)}
                      disabled={busyId === req.id}
                      className="brut border-[2px] border-ink bg-red px-6 py-3 font-display font-extrabold uppercase text-paper hover:bg-opacity-90 disabled:opacity-50"
                    >
                      {busyId === req.id ? "REJECTING..." : "REJECT"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PAST REQUESTS COLLAPSIBLE */}
          <div className="pt-6 border-t-[3px] border-ink">
            <button
              onClick={() => setPastOpen(!pastOpen)}
              className="brut border-[2px] border-ink bg-paper px-4 py-2 font-display text-xs font-extrabold uppercase text-ink flex items-center gap-2"
            >
              {pastOpen ? "HIDE PAST REQUESTS" : `SHOW PAST REQUESTS (${pastRequests.length})`}
            </button>

            {pastOpen && (
              <div className="mt-4 space-y-3">
                {pastRequests.length === 0 ? (
                  <p className="label-tech text-xs opacity-60 text-paper">No past requests recorded.</p>
                ) : (
                  pastRequests.map((req) => (
                    <div key={req.id} className="brut-sm border-[2px] border-ink bg-ink/40 p-4 text-paper flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="font-bold text-yellow">{req.companyName}</span> ({shortAddr(req.walletAddress, 4)}) — {req.requestedRole}
                      </div>
                      <span className={`brut px-2 py-0.5 text-[10px] font-bold ${req.status === "approved" ? "bg-green text-paper" : "bg-red text-paper"}`}>
                        {req.status.toUpperCase()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
