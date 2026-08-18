import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const fileSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  dataBase64: z.string().min(1),
});

const jsonSchema = z.object({ metadata: z.record(z.string(), z.any()) });

const getJwt = (): string => {
  return (
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_PINATA_JWT"]) ||
    (typeof import.meta !== "undefined" && import.meta.env?.["PINATA_JWT"]) ||
    (typeof process !== "undefined" && process.env?.["VITE_PINATA_JWT"]) ||
    (typeof process !== "undefined" && process.env?.["PINATA_JWT"]) ||
    ""
  );
};

const getApiKey = (): string => {
  return (
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_PINATA_API_KEY"]) ||
    (typeof import.meta !== "undefined" && import.meta.env?.["PINATA_API_KEY"]) ||
    (typeof process !== "undefined" && process.env?.["VITE_PINATA_API_KEY"]) ||
    (typeof process !== "undefined" && process.env?.["PINATA_API_KEY"]) ||
    ""
  );
};

const getApiSecret = (): string => {
  return (
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_PINATA_API_SECRET"]) ||
    (typeof import.meta !== "undefined" && import.meta.env?.["PINATA_API_SECRET"]) ||
    (typeof process !== "undefined" && process.env?.["VITE_PINATA_API_SECRET"]) ||
    (typeof process !== "undefined" && process.env?.["PINATA_API_SECRET"]) ||
    ""
  );
};

const getHeaders = (contentType?: string) => {
  const jwt = getJwt();

  const headers: Record<string, string> = {};
  if (contentType) headers["Content-Type"] = contentType;

  if (jwt && jwt.trim() !== "" && jwt !== "your_pinata_jwt_token_here") {
    headers["Authorization"] = `Bearer ${jwt.trim()}`;
    return headers;
  }

  const apiKey = getApiKey();
  const apiSecret = getApiSecret();

  if (apiKey && apiSecret && apiKey !== "your_pinata_api_key_here") {
    headers["pinata_api_key"] = apiKey.trim();
    headers["pinata_secret_api_key"] = apiSecret.trim();
    return headers;
  }

  console.error("Pinata credentials lookup failed. Debug values:", {
    hasJwt: Boolean(jwt),
    hasApiKey: Boolean(apiKey),
    hasApiSecret: Boolean(apiSecret),
  });
  throw new Error("Pinata IPFS credentials missing in environment variables.");
};

/** Pin a binary file to IPFS via Pinata. Returns the CID. */
export const pinFile = createServerFn({ method: "POST" })
  .validator((d: unknown) => fileSchema.parse(d))
  .handler(async ({ data }) => {
    const bytes = Uint8Array.from(atob(data.dataBase64), (c) => c.charCodeAt(0));
    const form = new FormData();
    form.append("file", new Blob([bytes], { type: data.type }), data.name);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: getHeaders(),
      body: form,
    });
    if (!res.ok) {
      const errDetail = await res.text().catch(() => "");
      console.error("Pinata image upload error details:", errDetail);
      throw new Error(`Pinata image upload failed (${res.status}): ${errDetail || res.statusText}`);
    }
    const json = (await res.json()) as { IpfsHash: string };
    return { cid: json.IpfsHash };
  });

/** Pin a metadata JSON document to IPFS via Pinata. Returns the CID. */
export const pinJson = createServerFn({ method: "POST" })
  .validator((d: unknown) => jsonSchema.parse(d))
  .handler(async ({ data }) => {
    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: getHeaders("application/json"),
      body: JSON.stringify({ pinataContent: data.metadata }),
    });
    if (!res.ok) {
      const errDetail = await res.text().catch(() => "");
      console.error("Pinata metadata upload error details:", errDetail);
      throw new Error(`Pinata metadata upload failed (${res.status}): ${errDetail || res.statusText}`);
    }
    const json = (await res.json()) as { IpfsHash: string };
    return { cid: json.IpfsHash };
  });
