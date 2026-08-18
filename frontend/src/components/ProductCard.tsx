import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/brutal";
import { StatusBadge } from "@/components/brutal/status";
import { formatDate, shortAddr } from "@/lib/trace/config";
import type { Product } from "@/lib/trace/data";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="press-card flex flex-col border-[3px] border-ink bg-surface">
      <div className="flex items-center justify-between border-b-[3px] border-ink px-4 py-2">
        <span className="font-mono text-sm font-bold">
          #{String(product.productId).padStart(3, "0")}
        </span>
        <StatusBadge status={product.status} />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <h3 className="font-display text-2xl font-extrabold uppercase leading-tight tracking-tight">
          PRODUCT {String(product.productId).padStart(3, "0")}
        </h3>

        <div>
          <p className="label-tech opacity-60">MANUFACTURER</p>
          <p className="font-mono text-sm font-bold">{shortAddr(product.manufacturer)}</p>
        </div>

        <div>
          <p className="label-tech opacity-60">CURRENT OWNER</p>
          <p className="font-mono text-sm font-bold">{shortAddr(product.currentOwner)}</p>
        </div>

        <div>
          <p className="label-tech opacity-60">CID</p>
          <p className="truncate font-mono text-sm font-bold">{product.metadataCID || "—"}</p>
        </div>

        <p className="label-tech mt-auto opacity-60">
          CREATED // {formatDate(product.createdAt)}
        </p>

        <Link
          to="/products/$id"
          params={{ id: String(product.productId) }}
          className={buttonVariants({ variant: "primary", size: "md", full: true })}
        >
          VIEW DETAILS <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}
