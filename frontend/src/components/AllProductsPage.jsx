import React from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { CHAIN_NAME, CONTRACT_ADDRESS, shortAddr } from "../lib/trace/config";
import { useProducts } from "../lib/trace/data";

export function AllProductsPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useProducts();
  const count = data?.length ?? 0;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8 space-y-10">
      {/* EDITORIAL HEADER */}
      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="brut-xl border-[4px] border-ink bg-[#1A1A2E] p-6 sm:p-10 text-paper">
          <p className="label-tech mb-4 inline-block bg-yellow px-2 py-1 font-bold text-ink">
            01 / PUBLIC LEDGER
          </p>
          <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.88] tracking-tighter sm:text-7xl xl:text-8xl">
            ALL<br />
            PRO<span className="bg-yellow px-1 text-ink">DUCTS</span>
          </h1>
          <p className="label-tech mt-5 text-base opacity-70">
            TRACKED ON {CHAIN_NAME.toUpperCase()}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="brut border-[3px] border-ink bg-purple px-4 py-2 font-display text-lg font-extrabold uppercase tracking-tight text-paper">
              {isLoading ? "—" : count} PRODUCT{count === 1 ? "" : "S"}
            </span>
            <button
              onClick={() => void refetch()}
              disabled={isFetching}
              className="brut border-[3px] border-ink bg-paper px-4 py-2 font-display text-sm font-extrabold uppercase text-ink flex items-center gap-2 hover:bg-yellow transition-all"
            >
              <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
              {isFetching ? "SYNCING..." : "REFRESH"}
            </button>
          </div>
        </div>

        <aside className="grid gap-4">
          {[
            ["NETWORK", CHAIN_NAME.toUpperCase(), "bg-yellow text-ink"],
            ["SYSTEM", "TRACECHAIN", "bg-[#1A1A2E] text-paper"],
            ["CONTRACT", shortAddr(CONTRACT_ADDRESS, 6), "bg-[#1A1A2E] text-paper"],
            ["STATUS", isError ? "DEGRADED" : "ONLINE", isError ? "bg-red text-paper" : "bg-green text-paper"],
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

      {/* PRODUCT GRID */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b-[4px] border-ink pb-3 text-paper">
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
            GLOBAL REGISTRY
          </h2>
          <span className="label-tech opacity-60">NEWEST FIRST</span>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="brut-md border-[3px] border-ink bg-[#1A1A2E] h-64 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="brut-md border-[3px] border-ink bg-red p-6 text-paper">
            <h3 className="font-display text-xl font-extrabold uppercase">CHAIN READ FAILED</h3>
            <p className="font-mono text-sm mt-2">
              {(error)?.message?.slice(0, 160) || "Could not reach the TraceChain contract."}
            </p>
          </div>
        ) : count === 0 ? (
          <div className="brut-md border-[3px] border-dashed border-ink bg-[#1A1A2E] p-14 text-center text-paper">
            <p className="font-display text-3xl font-extrabold uppercase tracking-tight">
              NO PRODUCTS YET
            </p>
            <p className="label-tech mt-2 opacity-60">
              Register the first product on the TraceChain network.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data?.map((p) => (
              <ProductCard key={p.productId} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AllProductsPage;
