import { createFileRoute } from "@tanstack/react-router";
import { keccak256, toUtf8Bytes } from "ethers";
import { ShieldAlert, Trash2, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  Alert,
  Badge,
  Button,
  Field,
  Input,
  SectionHeader,
  Select,
} from "@/components/brutal";
import { ROLES, ROLE_COLORS, shortAddr, type RoleName } from "@/lib/trace/config";
import { getGasOverrides, useWallet } from "@/lib/trace/wallet";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Role Management — TraceChain Admin" },
      {
        name: "description",
        content:
          "Grant and revoke manufacturer, distributor and retailer roles on the TraceChain contract.",
      },
      { property: "og:title", content: "Role Management — TraceChain" },
      {
        property: "og:description",
        content: "Admin-only controls for on-chain supply-chain roles.",
      },
    ],
  }),
  component: AdminPage,
});

const roleHash = (role: RoleName) => keccak256(toUtf8Bytes(`${role}_ROLE`));

type Holder = { address: string; role: RoleName };

function AdminPage() {
  const { account, connect, getWriteContract } = useWallet();
  const [address, setAddress] = useState("");
  const [role, setRole] = useState<RoleName>("MANUFACTURER");
  const [busy, setBusy] = useState(false);
  const [holders, setHolders] = useState<Holder[]>([]);

  const grant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      toast.error("INVALID ADDRESS");
      return;
    }
    setBusy(true);
    try {
      const contract = await getWriteContract();
      const overrides = await getGasOverrides();
      const tx = await contract["grantRole"]!(roleHash(role), address, overrides);
      await tx.wait();
      setHolders((h) => [
        { address, role },
        ...h.filter((x) => x.address.toLowerCase() !== address.toLowerCase() || x.role !== role),
      ]);
      setAddress("");
      toast.success("ROLE GRANTED");
    } catch (err) {
      toast.error("GRANT FAILED", { description: (err as Error)?.message?.slice(0, 140) });
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (holder: Holder) => {
    setBusy(true);
    try {
      const contract = await getWriteContract();
      const overrides = await getGasOverrides();
      const tx = await contract["revokeRole"]!(roleHash(holder.role), holder.address, overrides);
      await tx.wait();
      setHolders((h) =>
        h.filter(
          (x) =>
            !(x.address.toLowerCase() === holder.address.toLowerCase() && x.role === holder.role),
        ),
      );
      toast.success("ROLE REVOKED");
    } catch (err) {
      toast.error("REVOKE FAILED", { description: (err as Error)?.message?.slice(0, 140) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8">
      <header className="brut-xl border-[4px] border-ink bg-surface p-6 sm:p-10">
        <p className="label-tech mb-4 inline-block bg-ink px-2 py-1 text-paper">
          05 / GOVERNANCE
        </p>
        <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tighter sm:text-7xl">
          ROLE MANAGEMENT
        </h1>
        <div className="mt-6 flex flex-wrap gap-3">
          <Badge tone="bg-red">ADMIN ONLY</Badge>
          <Badge tone="bg-yellow">CHANGES ARE PERMANENT</Badge>
        </div>
      </header>

      <div className="mt-6">
        <Alert
          tone="bg-red"
          title="PERMISSIONED ACTIONS"
          icon={<ShieldAlert className="mt-0.5 size-6" />}
        >
          ROLE CHANGES ARE WRITTEN TO THE CONTRACT AND CANNOT BE UNDONE WITHOUT ANOTHER TRANSACTION.
        </Alert>
      </div>

      {!account && (
        <div className="mt-6">
          <Alert
            tone="bg-surface"
            title="WALLET NOT CONNECTED"
            icon={<Wallet className="mt-0.5 size-6" />}
            action={
              <Button variant="purple" onClick={() => void connect()}>
                CONNECT WALLET
              </Button>
            }
          >
            Only the contract admin can grant or revoke roles.
          </Alert>
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <section className="brut-lg border-[3px] border-ink bg-surface p-6">
          <SectionHeader number="01" title="GRANT ROLE" subtitle="ASSIGN ON-CHAIN PERMISSIONS" />
          <form onSubmit={grant} className="space-y-5">
            <Field label="WALLET ADDRESS">
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x0000000000000000000000000000000000000000"
              />
            </Field>
            <Field label="ROLE">
              <Select value={role} onChange={(e) => setRole(e.target.value as RoleName)}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </Field>
            <Button type="submit" variant="purple" size="lg" full disabled={busy || !account}>
              {busy ? "SUBMITTING..." : "GRANT ROLE"}
            </Button>
          </form>
        </section>

        <section className="brut-lg border-[3px] border-ink bg-surface p-6">
          <SectionHeader number="02" title="ROLE HOLDERS" subtitle="GRANTED IN THIS SESSION" />
          {holders.length === 0 ? (
            <div className="border-[3px] border-dashed border-ink p-10 text-center">
              <p className="font-display text-xl font-extrabold uppercase">NO RECORDS</p>
              <p className="label-tech mt-2 opacity-60">
                Role holders granted from this device appear here. The contract remains the source of truth.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {holders.map((h) => (
                <li
                  key={`${h.address}-${h.role}`}
                  className="flex flex-wrap items-center justify-between gap-3 border-[3px] border-ink p-3"
                >
                  <span className="font-mono text-sm font-bold">{shortAddr(h.address, 6)}</span>
                  <Badge tone={ROLE_COLORS[h.role]}>{h.role}</Badge>
                  <Button
                    size="sm"
                    variant="red"
                    disabled={busy}
                    onClick={() => void revoke(h)}
                    aria-label={`Revoke ${h.role} from ${h.address}`}
                  >
                    <Trash2 className="size-3.5" /> REVOKE
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
