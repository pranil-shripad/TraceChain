import React from "react";
import { useWallet } from "../../hooks/useWallet";
import { RoleRequestForm } from "../RoleRequestForm";
import { ProductCard } from "../ProductCard";
import { useProducts } from "../../lib/trace/data";
import { shortAddr, CONTRACT_ADDRESS } from "../../lib/trace/config";

const DEPLOYER_ADMIN_ADDRESS = "0x71C84074c77579122393F421C0074218C8384A1";

export function NoRoleDashboard() {
  const { account, connectWallet } = useWallet();
  const { data: products, isLoading } = useProducts();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8 space-y-10">
      {!account ? (
        /* HERO FOR DISCONNECTED USER */
        <section className="brut-xl border-[4px] border-ink bg-[#1A1A2E] p-8 sm:p-12 text-center text-paper">
          <span className="label-tech mb-4 inline-block bg-yellow px-3 py-1 font-bold text-ink">
            WEB3 SUPPLY CHAIN LEDGER
          </span>
          <h1 className="font-display text-5xl font-extrabold uppercase leading-tight tracking-tighter sm:text-7xl">
            TRACE<span className="text-yellow">CHAIN</span>
          </h1>
          <p className="mt-4 font-display text-lg sm:text-xl font-bold opacity-90 text-gray-300">
            Immutable supply chain tracking on Polygon
          </p>
          <div className="mt-8">
            <button
              onClick={() => void connectWallet()}
              className="brut border-[3px] border-ink bg-purple px-8 py-4 font-display text-xl font-extrabold uppercase text-paper hover:bg-opacity-90 transition-all shadow-[6px_6px_0_#000]"
            >
              CONNECT WALLET TO START
            </button>
          </div>
        </section>
      ) : (
        /* CARD FOR CONNECTED USER WITHOUT A ROLE */
        <section className="brut-xl border-[4px] border-ink bg-[#1A1A2E] p-6 sm:p-10 text-paper space-y-6">
          <div className="border-[3px] border-ink bg-yellow p-4 text-ink">
            <h2 className="font-display text-2xl font-extrabold uppercase">
              YOUR WALLET HAS NO ROLE ASSIGNED
            </h2>
            <p className="label-tech mt-1 text-sm opacity-90 font-bold">
              CONNECTED ACCOUNT: {account}
            </p>
          </div>

          <div className="space-y-3 text-gray-300 font-mono text-sm">
            <p>
              To create products, transfer ownership, or update shipping status, your wallet must be assigned a role on the smart contract.
            </p>
            <p>
              <span className="font-bold text-paper">Contact the Admin:</span>{" "}
              <span className="bg-ink px-2 py-1 font-bold text-yellow">
                {shortAddr(DEPLOYER_ADMIN_ADDRESS, 6)} ({DEPLOYER_ADMIN_ADDRESS})
              </span>
            </p>
          </div>

          {/* ROLE REQUEST FORM */}
          <div className="pt-2">
            <RoleRequestForm />
          </div>
        </section>
      )}

      {/* READ-ONLY PRODUCT LIST */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b-[4px] border-ink pb-3">
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-paper">
            ALL TRACKED PRODUCTS
          </h2>
          <span className="label-tech opacity-70 text-gray-300">READ-ONLY EXPLORER</span>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="brut-md border-[3px] border-ink bg-[#1A1A2E] h-64 animate-pulse" />
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <div className="brut-md border-[3px] border-dashed border-ink bg-[#1A1A2E] p-10 text-center text-paper">
            <p className="font-display text-2xl font-extrabold uppercase">NO PRODUCTS FOUND</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.productId} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
