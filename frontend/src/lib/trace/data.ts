import { useQuery } from "@tanstack/react-query";

import { getIpfsUrls, ipfsUrl, type StatusCode } from "./config";
import { getReadContract } from "./wallet";

type TraceContract = {
  products: (id: number) => Promise<readonly unknown[]>;
  getHistory: (id: number) => Promise<readonly unknown[][]>;
};

const readContract = () => getReadContract() as unknown as TraceContract;

export type Product = {
  productId: number;
  metadataCID: string;
  manufacturer: string;
  status: StatusCode;
  createdAt: number;
  currentOwner: string;
};

export type HistoryEntry = {
  newStatus: StatusCode;
  updatedBy: string;
  location: string;
  timestamp: number;
};

export type Metadata = {
  name?: string;
  origin?: string;
  batchId?: string;
  description?: string;
  manufacturedDate?: string;
  image?: string;
};

const toProduct = (raw: readonly unknown[]): Product => ({
  productId: Number(raw[0] as bigint),
  metadataCID: String(raw[1]),
  manufacturer: String(raw[2]),
  status: Number(raw[3]) as StatusCode,
  createdAt: Number(raw[4] as bigint),
  currentOwner: String(raw[5]),
});

export async function fetchProducts(): Promise<Product[]> {
  const contract = readContract();
  const items: Product[] = [];
  let id = 1;
  while (id <= 100) {
    try {
      const raw = await contract.products(id);
      if (
        !raw ||
        Number(raw[0]) === 0 ||
        String(raw[2]) === "0x0000000000000000000000000000000000000000"
      ) {
        break;
      }
      items.push(toProduct(raw));
      id++;
    } catch {
      break;
    }
  }
  return items.reverse();
}

export async function fetchProduct(id: number): Promise<Product> {
  const contract = readContract();
  return toProduct(await contract.products(id));
}

export async function fetchHistory(id: number): Promise<HistoryEntry[]> {
  const contract = readContract();
  const rows = await contract.getHistory(id);
  return rows.map((r) => ({
    newStatus: Number(r[0]) as StatusCode,
    updatedBy: String(r[1]),
    location: String(r[2]),
    timestamp: Number(r[3] as bigint),
  }));
}

export async function fetchMetadata(cid: string): Promise<Metadata> {
  if (!cid) throw new Error("NO CID PROVIDED");
  const urls = getIpfsUrls(cid);

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return (await res.json()) as Metadata;
      }
    } catch {
      /* try next IPFS gateway */
    }
  }
  throw new Error("METADATA UNAVAILABLE");
}

export const useProducts = () =>
  useQuery({ queryKey: ["products"], queryFn: fetchProducts, retry: 0 });

export const useProduct = (id: number) =>
  useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
    retry: 0,
    enabled: Number.isFinite(id),
  });

export const useHistory = (id: number) =>
  useQuery({
    queryKey: ["history", id],
    queryFn: () => fetchHistory(id),
    retry: 0,
    enabled: Number.isFinite(id),
  });

export const useMetadata = (cid?: string) =>
  useQuery({
    queryKey: ["metadata", cid],
    queryFn: () => fetchMetadata(cid as string),
    retry: 0,
    enabled: !!cid,
  });
