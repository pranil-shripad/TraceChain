import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const fileSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  dataBase64: z.string().min(1),
});

const jsonSchema = z.object({ metadata: z.record(z.string(), z.any()) });

const getHeaders = (contentType?: string) => {
  const jwt =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_PINATA_JWT) ||
    (typeof process !== "undefined" ? process.env["PINATA_JWT"] : "");

  const headers: Record<string, string> = {};
  if (contentType) headers["Content-Type"] = contentType;

  if (jwt && jwt !== "your_pinata_jwt_token_here") {
    headers["Authorization"] = `Bearer ${jwt}`;
    return headers;
  }

  const apiKey =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_PINATA_API_KEY) ||
    (typeof process !== "undefined" ? process.env["PINATA_API_KEY"] : "");
  const apiSecret =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_PINATA_API_SECRET) ||
    (typeof process !== "undefined" ? process.env["PINATA_API_SECRET"] : "");

  if (apiKey && apiSecret) {
    headers["pinata_api_key"] = apiKey;
    headers["pinata_secret_api_key"] = apiSecret;
    return headers;
  }

  throw new Error("Pinata IPFS credentials missing in environment variables.");
};

/** Pin a binary file to IPFS via Pinata. Returns the CID. */
export const pinFile = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => fileSchema.parse(d))
  .handler(async ({ data }) => {
    const bytes = Uint8Array.from(atob(data.dataBase64), (c) => c.charCodeAt(0));
    const form = new FormData();
    form.append("file", new Blob([bytes], { type: data.type }), data.name);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: getHeaders(),
      body: form,
    });
    if (!res.ok) throw new Error(`Pinata image upload failed (${res.status})`);
    const json = (await res.json()) as { IpfsHash: string };
    return { cid: json.IpfsHash };
  });

/** Pin a metadata JSON document to IPFS via Pinata. Returns the CID. */
export const pinJson = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => jsonSchema.parse(d))
  .handler(async ({ data }) => {
    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: getHeaders("application/json"),
      body: JSON.stringify({ pinataContent: data.metadata }),
    });
    if (!res.ok) throw new Error(`Pinata metadata upload failed (${res.status})`);
    const json = (await res.json()) as { IpfsHash: string };
    return { cid: json.IpfsHash };
  });
