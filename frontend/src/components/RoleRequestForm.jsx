import React, { useState } from "react";
import { toast } from "sonner";
import { useWallet } from "../hooks/useWallet";
import { addRequest } from "../utils/jsonbin";

export function RoleRequestForm({ onRequestSubmitted }) {
  const { account } = useWallet();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    requestedRole: "Manufacturer",
    reason: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account) {
      toast.error("Wallet not connected");
      return;
    }
    if (!form.companyName.trim()) {
      toast.error("Company Name is required");
      return;
    }

    setSubmitting(true);
    try {
      const requestObj = {
        id: Date.now().toString(),
        walletAddress: account,
        companyName: form.companyName.trim(),
        requestedRole: form.requestedRole,
        reason: form.reason.trim(),
        timestamp: new Date().toISOString(),
        status: "pending",
      };

      await addRequest(requestObj);
      setSubmitted(true);
      toast.success("Access request submitted successfully!");
      if (onRequestSubmitted) onRequestSubmitted(requestObj);
    } catch (err) {
      toast.error("Failed to submit request", {
        description: err?.message || "Check your JSONBin credentials.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="brut-md border-[3px] border-ink bg-[#1A1A2E] p-6 text-paper">
        <div className="flex items-center gap-3">
          <span className="flex size-3 rounded-full bg-yellow animate-pulse" />
          <h3 className="font-display text-xl font-extrabold uppercase text-yellow">
            ACCESS REQUEST PENDING
          </h3>
        </div>
        <p className="mt-3 text-sm text-gray-300 leading-relaxed">
          Access request submitted! The admin will review your request and grant your role. Once approved, reconnect your wallet to see your dashboard.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="brut border-[3px] border-ink bg-purple px-6 py-3 font-display font-extrabold uppercase text-paper hover:bg-opacity-90 transition-all"
        >
          REQUEST ACCESS & ROLE
        </button>
      </div>
    );
  }

  return (
    <div className="brut-md border-[3px] border-ink bg-[#1A1A2E] p-6 text-paper">
      <h3 className="mb-4 font-display text-xl font-extrabold uppercase tracking-tight text-yellow">
        REQUEST ROLE ACCESS
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-tech mb-1 block text-xs opacity-80">
            WALLET ADDRESS (AUTO-FILLED)
          </label>
          <input
            type="text"
            readOnly
            value={account || ""}
            className="w-full border-[2px] border-ink bg-ink/50 p-3 font-mono text-xs text-gray-300 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="label-tech mb-1 block text-xs opacity-80">
            COMPANY / ENTITY NAME *
          </label>
          <input
            type="text"
            required
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            placeholder="e.g. Paraíso Coffee Farms Ltd."
            className="w-full border-[2px] border-ink bg-paper p-3 font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-yellow"
          />
        </div>

        <div>
          <label className="label-tech mb-1 block text-xs opacity-80">
            ROLE IN SUPPLY CHAIN *
          </label>
          <select
            value={form.requestedRole}
            onChange={(e) => setForm({ ...form, requestedRole: e.target.value })}
            className="w-full border-[2px] border-ink bg-paper p-3 font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-yellow"
          >
            <option value="Manufacturer">Manufacturer — I produce and register goods</option>
            <option value="Distributor">Distributor — I handle shipping and logistics</option>
            <option value="Retailer">Retailer — I receive and sell goods</option>
          </select>
        </div>

        <div>
          <label className="label-tech mb-1 block text-xs opacity-80">
            BUSINESS DESCRIPTION / REASON
          </label>
          <textarea
            rows={3}
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Briefly describe your products or supply chain operations..."
            className="w-full border-[2px] border-ink bg-paper p-3 font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-yellow"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 brut border-[3px] border-ink bg-green px-4 py-3 font-display font-extrabold uppercase text-paper hover:bg-opacity-90 disabled:opacity-50"
          >
            {submitting ? "SUBMITTING..." : "SUBMIT REQUEST"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="brut border-[3px] border-ink bg-gray-600 px-4 py-3 font-display font-extrabold uppercase text-paper hover:bg-opacity-90"
          >
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );
}
