import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, PackagePlus, RefreshCw, RotateCw, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";

import { Alert, Badge, Button, Skeleton, buttonVariants } from "@/components/brutal";
import { EXPLORER, relativeTime, shortAddr, STATUS_LABELS, type StatusCode } from "@/lib/trace/config";
import { getReadContract } from "@/lib/trace/wallet";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Live Events — TraceChain On-Chain Activity" },
      {
        name: "description",
        content:
          "Real-time feed of TraceChain contract events: product creations, status updates and ownership transfers.",
      },
      { property: "og:title", content: "Live Events — TraceChain" },
      {
        property: "og:description",
        content: "Watch supply-chain activity land on Polygon Mumbai in real time.",
      },
    ],
  }),
  component: EventsPage,
});

type FeedEvent = {
  key: string;
  kind: "ProductCreated" | "StatusUpdated" | "OwnershipTransferred";
  productId: string;
  detail: string;
  txHash: string;
  at: number;
};

const KIND_META = {
  ProductCreated: { label: "PRODUCT CREATED", tone: "bg-green", Icon: PackagePlus },
  StatusUpdated: { label: "STATUS UPDATED", tone: "bg-yellow", Icon: RotateCw },
  OwnershipTransferred: { label: "OWNERSHIP TRANSFERRED", tone: "bg-purple", Icon: ArrowRight },
} as const;

function EventsPage() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const contract = getReadContract();

    const push = (e: FeedEvent) =>
      setEvents((prev) => [e, ...prev.filter((p) => p.key !== e.key)].slice(0, 60));

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const provider = contract.runner?.provider;
        const latest = (await provider?.getBlockNumber()) ?? 0;
        const from = Math.max(0, latest - 4000);
        const logs = await contract.queryFilter("*", from, latest);
        if (cancelled) return;
        const mapped = logs
          .map((log) => {
            const parsed = log as unknown as {
              fragment?: { name: string };
              args?: readonly unknown[];
              transactionHash: string;
              index: number;
            };
            const name = parsed.fragment?.name;
            if (!name || !(name in KIND_META)) return null;
            const args = parsed.args ?? [];
            const productId = String(args[0] ?? "");
            let detail = "";
            if (name === "ProductCreated") detail = `MANUFACTURER ${shortAddr(String(args[1]))}`;
            if (name === "StatusUpdated")
              detail = `${STATUS_LABELS[Number(args[1]) as StatusCode]} @ ${String(args[3] ?? "—")}`;
            if (name === "OwnershipTransferred")
              detail = `${shortAddr(String(args[1]))} → ${shortAddr(String(args[2]))}`;
            return {
              key: `${parsed.transactionHash}-${parsed.index}`,
              kind: name as FeedEvent["kind"],
              productId,
              detail,
              txHash: parsed.transactionHash,
              at: Date.now(),
            } satisfies FeedEvent;
          })
          .filter((e): e is FeedEvent => e !== null)
          .reverse();
        setEvents(mapped);
      } catch (err) {
        if (!cancelled) setError((err as Error)?.message ?? "Could not read events");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    const onCreated = (id: bigint, manufacturer: string, _cid: string, ev: { log?: { transactionHash: string; index: number } }) =>
      push({
        key: `${ev?.log?.transactionHash}-${ev?.log?.index}`,
        kind: "ProductCreated",
        productId: String(id),
        detail: `MANUFACTURER ${shortAddr(manufacturer)}`,
        txHash: ev?.log?.transactionHash ?? "",
        at: Date.now(),
      });

    void contract.on?.("ProductCreated", onCreated as never).catch(() => {});

    return () => {
      cancelled = true;
      void contract.removeAllListeners?.();
    };
  }, [nonce]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8">
      <header className="brut-xl flex flex-wrap items-end justify-between gap-6 border-[4px] border-ink bg-surface p-6 sm:p-10">
        <div>
          <p className="label-tech mb-4 inline-block bg-ink px-2 py-1 text-paper">
            04 / ACTIVITY
          </p>
          <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tighter sm:text-7xl">
            LIVE EVENTS
          </h1>
          <p className="label-tech mt-4 text-base opacity-70">
            REAL-TIME ON-CHAIN ACTIVITY
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone="bg-green">
            <span className="size-2.5 border-2 border-ink bg-ink" aria-hidden /> LIVE
          </Badge>
          <Button variant="secondary" onClick={() => setNonce((n) => n + 1)}>
            <RefreshCw className="size-4" /> RELOAD
          </Button>
        </div>
      </header>

      <section className="mt-10">
        {loading && (
          <div className="space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        )}

        {!loading && error && (
          <Alert
            tone="bg-red"
            title="EVENT STREAM UNAVAILABLE"
            icon={<TriangleAlert className="mt-0.5 size-6" />}
            action={
              <Button variant="primary" onClick={() => setNonce((n) => n + 1)}>
                RETRY
              </Button>
            }
          >
            {error.slice(0, 160)}
          </Alert>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="border-[4px] border-dashed border-ink bg-surface p-14 text-center">
            <p className="font-display text-3xl font-extrabold uppercase tracking-tight">
              NO EVENTS YET
            </p>
            <p className="label-tech mt-2 opacity-60">
              New contract activity will appear here as soon as it is mined.
            </p>
          </div>
        )}

        <ul className="space-y-4">
          {events.map((e) => {
            const meta = KIND_META[e.kind];
            return (
              <li
                key={e.key}
                className="brut-md flex flex-col gap-4 border-[3px] border-ink bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center border-[3px] border-ink ${meta.tone}`}
                  >
                    <meta.Icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-display text-lg font-extrabold uppercase tracking-tight">
                      {meta.label}
                    </p>
                    <p className="font-mono text-sm font-bold">
                      #{String(e.productId).padStart(3, "0")} — {e.detail}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="label-tech opacity-60">{relativeTime(e.at)}</span>
                  <Link
                    to="/products/$id"
                    params={{ id: e.productId }}
                    className={buttonVariants({ variant: "secondary", size: "sm" })}
                  >
                    TRACE
                  </Link>
                  <a
                    href={`${EXPLORER}/tx/${e.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({ variant: "blue", size: "sm" })}
                  >
                    POLYGONSCAN <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
