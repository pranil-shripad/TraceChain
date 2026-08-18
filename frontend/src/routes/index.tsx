import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw, TriangleAlert } from "lucide-react";

import { Alert, Button, CardSkeleton } from "@/components/brutal";
import { ProductCard } from "@/components/ProductCard";
import { CHAIN_NAME, CONTRACT_ADDRESS, shortAddr } from "@/lib/trace/config";
import { useProducts } from "@/lib/trace/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "All Products — TraceChain Supply Chain Ledger" },
      {
        name: "description",
        content:
          "Browse every product tracked on TraceChain, a decentralized supply-chain ledger running on Polygon Mumbai.",
      },
      { property: "og:title", content: "All Products — TraceChain" },
      {
        property: "og:description",
        content: "Products tracked from creation to delivery, recorded on-chain.",
      },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useProducts();
  const count = data?.length ?? 0;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8">
      {/* EDITORIAL HEADER */}
      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="brut-xl border-[4px] border-ink bg-surface p-6 sm:p-10">
          <p className="label-tech mb-4 inline-block bg-ink px-2 py-1 text-paper">
            01 / PRODUCTS
          </p>
          <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.88] tracking-tighter sm:text-7xl xl:text-8xl">
            ALL
            <br />
            PRO<span className="bg-yellow px-1">DUCTS</span>
          </h1>
          <p className="label-tech mt-5 text-base opacity-70">
            TRACKED ON {CHAIN_NAME.toUpperCase()}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="brut border-[3px] border-ink bg-purple px-4 py-2 font-display text-lg font-extrabold uppercase tracking-tight">
              {isLoading ? "—" : count} PRODUCT{count === 1 ? "" : "S"}
            </span>
            <Button
              variant="secondary"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              <RefreshCw className="size-4" />
              {isFetching ? "SYNCING" : "REFRESH"}
            </Button>
          </div>
        </div>

        <aside className="grid gap-4">
          {[
            ["NETWORK", CHAIN_NAME.toUpperCase(), "bg-yellow"],
            ["SYSTEM", "TRACECHAIN", "bg-surface"],
            ["CONTRACT", shortAddr(CONTRACT_ADDRESS, 6), "bg-surface"],
            ["STATUS", isError ? "DEGRADED" : "ONLINE", isError ? "bg-red" : "bg-green"],
          ].map(([k, v, tone]) => (
            <div
              key={k}
              className={`brut-md flex items-center justify-between border-[3px] border-ink px-4 py-4 ${tone}`}
            >
              <span className="label-tech opacity-70">{k} //</span>
              <span className="font-mono text-sm font-bold">{v}</span>
            </div>
          ))}
        </aside>
      </section>

      {/* GRID */}
      <section className="mt-12">
        <div className="mb-6 flex items-end justify-between border-b-[4px] border-ink pb-3">
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
            REGISTRY
          </h2>
          <span className="label-tech opacity-60">NEWEST FIRST</span>
        </div>

        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {isError && (
          <Alert
            tone="bg-red"
            title="CHAIN READ FAILED"
            icon={<TriangleAlert className="mt-0.5 size-6" />}
            action={
              <Button variant="primary" onClick={() => void refetch()}>
                RETRY
              </Button>
            }
          >
            {(error as Error)?.message?.slice(0, 160) ??
              "Could not reach the TraceChain contract."}
          </Alert>
        )}

        {!isLoading && !isError && count === 0 && (
          <div className="border-[4px] border-dashed border-ink bg-surface p-14 text-center">
            <p className="font-display text-3xl font-extrabold uppercase tracking-tight">
              NO PRODUCTS YET
            </p>
            <p className="label-tech mt-2 opacity-60">
              Register the first product on the TraceChain network.
            </p>
          </div>
        )}

        {!isLoading && !isError && count > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {data?.map((p) => <ProductCard key={p.productId} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
