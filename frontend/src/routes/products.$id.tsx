import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, QrCode, Send, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Alert,
  Button,
  Card,
  DataRow,
  Field,
  Input,
  Modal,
  SectionHeader,
  Select,
  Skeleton,
} from "@/components/brutal";
import { StatusBadge, Timeline } from "@/components/brutal/status";
import {
  EXPLORER,
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_OPTIONS,
  formatDate,
  getIpfsUrls,
  getValidNextStatuses,
  ipfsUrl,
  sameAddress,
  type StatusCode,
} from "@/lib/trace/config";
import { useHistory, useMetadata, useProduct } from "@/lib/trace/data";
import { getGasOverrides, useWallet } from "@/lib/trace/wallet";

import { useRole } from "@/hooks/useRole";

export const Route = createFileRoute("/products/$id")({
  head: ({ params }) => {
    const title = `Product #${String(params.id).padStart(3, "0")} — TraceChain`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `On-chain record, IPFS metadata and full chain of custody for TraceChain product #${params.id}.`,
        },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: "Trace this product from creation to delivery on Polygon Mumbai.",
        },
      ],
    };
  },
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { id } = Route.useParams();
  const productId = Number(id);
  const { account, getWriteContract } = useWallet();
  const { isManufacturer, isDistributor, isRetailer, isAdmin } = useRole();

  const product = useProduct(productId);
  const history = useHistory(productId);
  const metadata = useMetadata(product.data?.metadataCID);

  const [qrOpen, setQrOpen] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [status, setStatus] = useState("1");
  const [location, setLocation] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [busy, setBusy] = useState(false);
  const [imgSrcIndex, setImgSrcIndex] = useState(0);

  const isOwner = sameAddress(account, product.data?.currentOwner);
  const padded = String(productId).padStart(3, "0");

  const validOptions = product.data
    ? getValidNextStatuses(product.data.status as StatusCode)
    : [];

  useEffect(() => {
    if (!qrOpen) return;
    void (async () => {
      const QR = (await import("qrcode")).default;
      const url = `${window.location.origin}/products/${productId}`;
      setQrData(await QR.toDataURL(url, { width: 640, margin: 2 }));
    })();
  }, [qrOpen, productId]);

  useEffect(() => {
    if (validOptions.length > 0 && validOptions[0] && (!status || !validOptions.some((o) => o.value === status))) {
      setStatus(validOptions[0].value);
    }
  }, [validOptions, status]);

  const updateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const contract = await getWriteContract();
      const overrides = await getGasOverrides();
      const tx = await contract["updateStatus"]!(productId, Number(status), location, overrides);
      await tx.wait();
      toast.success("STATUS UPDATED");
      void product.refetch();
      void history.refetch();
      setLocation("");
    } catch (err) {
      toast.error("UPDATE FAILED", { description: (err as Error)?.message?.slice(0, 140) });
    } finally {
      setBusy(false);
    }
  };

  const transfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^0x[a-fA-F0-9]{40}$/.test(newOwner)) {
      toast.error("INVALID ADDRESS");
      return;
    }
    setBusy(true);
    try {
      const contract = await getWriteContract();
      const overrides = await getGasOverrides();
      const tx = await contract["transferOwnership"]!(productId, newOwner, overrides);
      await tx.wait();
      toast.success("OWNERSHIP TRANSFERRED");
      setNewOwner("");
      void product.refetch();
    } catch (err) {
      toast.error("TRANSFER FAILED", { description: (err as Error)?.message?.slice(0, 140) });
    } finally {
      setBusy(false);
    }
  };

  if (product.isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-10 sm:px-8">
        <Skeleton className="h-40 w-full" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  if (product.isError || !product.data) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8">
        <Alert
          tone="bg-red"
          title="PRODUCT NOT FOUND"
          icon={<TriangleAlert className="mt-0.5 size-6" />}
          action={
            <Link to="/" className="press border-[3px] border-ink bg-surface px-5 py-2.5 font-display text-sm font-extrabold uppercase tracking-wider">
              BACK TO PRODUCTS
            </Link>
          }
        >
          NO ON-CHAIN RECORD FOR PRODUCT #{padded}.
        </Alert>
      </div>
    );
  }

  const p = product.data;
  const meta = metadata.data;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8">
      <Link
        to="/"
        className="press inline-flex items-center gap-2 border-[3px] border-ink bg-surface px-4 py-2 font-display text-xs font-extrabold uppercase tracking-widest"
      >
        <ArrowLeft className="size-4" /> BACK TO PRODUCTS
      </Link>

      <header className="brut-xl mt-6 grid gap-0 border-[4px] border-ink bg-surface lg:grid-cols-[1.4fr_1fr]">
        <div className="p-6 sm:p-10">
          <p className="label-tech mb-3 inline-block bg-ink px-2 py-1 text-paper">
            TRACE // {STATUS_LABELS[p.status]}
          </p>
          <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tighter sm:text-7xl">
            PRODUCT #{padded}
          </h1>
          <p className="label-tech mt-4 opacity-70">
            {meta?.name ? meta.name.toUpperCase() : "ON-CHAIN SUPPLY CHAIN RECORD"}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="yellow" onClick={() => setQrOpen(true)}>
              <QrCode className="size-4" /> GENERATE QR
            </Button>
            <a
              href={`${EXPLORER}/address/${p.currentOwner}`}
              target="_blank"
              rel="noreferrer"
              className="press border-[3px] border-ink bg-surface px-5 py-2.5 font-display text-sm font-extrabold uppercase tracking-wider"
            >
              OWNER ON POLYGONSCAN
            </a>
          </div>
        </div>
        <div
          className={`flex flex-col items-center justify-center border-t-[4px] border-ink p-8 lg:border-l-[4px] lg:border-t-0 ${STATUS_COLORS[p.status]}`}
        >
          <p className="label-tech opacity-70">CURRENT STATUS</p>
          <p className="mt-2 text-center font-display text-4xl font-extrabold uppercase leading-none tracking-tighter sm:text-5xl">
            {STATUS_LABELS[p.status]}
          </p>
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        {/* LEFT */}
        <div className="space-y-10">
          <section>
            <SectionHeader number="01" title="ON-CHAIN DATA" subtitle="POLYGON MUMBAI" />
            <Card className="p-5">
              <DataRow label="PRODUCT ID" value={`#${padded}`} />
              <DataRow label="CURRENT STATUS" value={STATUS_LABELS[p.status]} mono={false} />
              <DataRow label="CURRENT OWNER" value={p.currentOwner} copy />
              <DataRow label="MANUFACTURER" value={p.manufacturer} copy />
              <DataRow label="CREATED" value={formatDate(p.createdAt)} mono={false} />
              <DataRow
                label="METADATA CID"
                value={p.metadataCID || "—"}
                copy={!!p.metadataCID}
                {...(p.metadataCID ? { href: ipfsUrl(p.metadataCID) } : {})}
              />
            </Card>
          </section>

          <section>
            <SectionHeader number="02" title="IPFS METADATA" subtitle="PINATA GATEWAY" />
            {metadata.isLoading && <Skeleton className="h-64 w-full" />}
            {(metadata.isError || (!metadata.isLoading && !meta)) && (
              <Alert
                tone="bg-orange"
                title="METADATA UNAVAILABLE"
                icon={<TriangleAlert className="mt-0.5 size-6" />}
              >
                THE PINNED DOCUMENT COULD NOT BE RETRIEVED FROM THE IPFS GATEWAY.
              </Alert>
            )}
            {meta && (
              <Card className="p-5">
                {meta.image && (
                  <div className="brut mb-5 border-[4px] border-ink bg-paper p-2">
                    <img
                      src={getIpfsUrls(meta.image)[imgSrcIndex] || ipfsUrl(meta.image)}
                      alt={meta.name ? `${meta.name} product photo` : "Product photo"}
                      className="h-64 w-full border-[3px] border-ink object-cover"
                      onError={() => {
                        const urls = getIpfsUrls(meta.image);
                        if (imgSrcIndex + 1 < urls.length) {
                          setImgSrcIndex((prev) => prev + 1);
                        }
                      }}
                      loading="lazy"
                    />
                  </div>
                )}
                <DataRow label="NAME" value={meta.name || "—"} mono={false} />
                <DataRow label="ORIGIN" value={meta.origin || "—"} mono={false} />
                <DataRow label="BATCH ID" value={meta.batchId || "—"} />
                <DataRow label="MANUFACTURED" value={meta.manufacturedDate || "—"} />
                <div className="pt-3">
                  <p className="label-tech opacity-60">DESCRIPTION</p>
                  <p className="mt-1 text-sm font-medium">{meta.description || "—"}</p>
                </div>
              </Card>
            )}
          </section>
        </div>

        {/* RIGHT */}
        <div className="space-y-10">
          <section>
            <SectionHeader number="03" title="CHAIN OF CUSTODY" subtitle="IMMUTABLE EVENT LOG" />
            {history.isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
              </div>
            ) : history.isError ? (
              <Alert tone="bg-red" title="HISTORY UNAVAILABLE">
                COULD NOT READ THE CUSTODY LOG FROM THE CONTRACT.
              </Alert>
            ) : (
              <Timeline entries={history.data ?? []} />
            )}
          </section>

          <section>
            <SectionHeader number="04" title="ACTIONS" subtitle="OWNER-ONLY OPERATIONS" />
            {!isOwner ? (
              <div className="border-[3px] border-dashed border-ink p-8 text-center">
                <p className="font-display text-xl font-extrabold uppercase">
                  ACTIONS LOCKED
                </p>
                <p className="label-tech mt-2 opacity-60">
                  Connect the current owner wallet to update status or transfer ownership.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* UPDATE STATUS — Restricted to DISTRIBUTOR, RETAILER, or ADMIN */}
                {isManufacturer && !isDistributor && !isRetailer && !isAdmin ? (
                  <div className="border-[3px] border-ink bg-blue p-5 text-paper">
                    <h3 className="font-display text-lg font-extrabold uppercase tracking-tight">
                      MANUFACTURER CUSTODY ACTIVE
                    </h3>
                    <p className="label-tech mt-2 text-xs opacity-90 leading-relaxed">
                      As a Manufacturer, your next step is to <b>TRANSFER OWNERSHIP</b> of this item to a permissioned Distributor. Logistics status updates (In Transit / Delivered) are managed on-chain by Distributors and Retailers.
                    </p>
                  </div>
                ) : (
                  <Card className="p-5">
                    <h3 className="mb-4 font-display text-lg font-extrabold uppercase tracking-tight">
                      UPDATE STATUS
                    </h3>
                    {validOptions.length === 0 ? (
                      <div className="border-[3px] border-ink bg-paper p-4 text-center">
                        <p className="font-display text-sm font-extrabold uppercase text-ink">
                          {p.status === 3
                            ? "DELIVERED — TERMINAL STATE"
                            : "CANCELLED — TERMINAL STATE"}
                        </p>
                        <p className="label-tech mt-1 text-xs opacity-70 text-ink">
                          Product status is complete and can no longer be updated.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={updateStatus} className="space-y-4">
                        <Field label="NEW STATUS">
                          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                            {validOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </Select>
                        </Field>
                        <Field label="LOCATION">
                          <Input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Pune, India"
                          />
                        </Field>
                        <Button type="submit" variant="green" full disabled={busy}>
                          {busy ? "SUBMITTING..." : "UPDATE STATUS"}
                        </Button>
                      </form>
                    )}
                  </Card>
                )}

                <Card className="p-5">
                  <h3 className="mb-4 font-display text-lg font-extrabold uppercase tracking-tight">
                    TRANSFER OWNERSHIP
                  </h3>
                  <form onSubmit={transfer} className="space-y-4">
                    <Field label="NEW OWNER ADDRESS">
                      <Input
                        value={newOwner}
                        onChange={(e) => setNewOwner(e.target.value)}
                        placeholder="0x0000000000000000000000000000000000000000"
                      />
                    </Field>
                    <Button type="submit" variant="purple" full disabled={busy}>
                      <Send className="size-4" />
                      {busy ? "SUBMITTING..." : "TRANSFER OWNERSHIP"}
                    </Button>
                  </form>
                </Card>
              </div>
            )}
          </section>
        </div>
      </div>

      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="GENERATE PRODUCT QR">
        <div className="flex flex-col items-center gap-5">
          <div className="brut-lg border-[4px] border-ink bg-surface p-3">
            {qrData ? (
              <img src={qrData} alt={`QR code for product ${padded}`} className="size-56" />
            ) : (
              <Skeleton className="size-56" />
            )}
          </div>
          <p className="font-display text-2xl font-extrabold uppercase tracking-tight">
            PRODUCT #{padded}
          </p>
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <a
              href={qrData ?? "#"}
              download={`tracechain-${padded}.png`}
              className="press flex-1 border-[3px] border-ink bg-green px-5 py-2.5 text-center font-display text-sm font-extrabold uppercase tracking-wider"
            >
              <span className="inline-flex items-center gap-2">
                <Download className="size-4" /> DOWNLOAD QR
              </span>
            </a>
            <Button variant="secondary" full onClick={() => setQrOpen(false)}>
              CLOSE
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export type { StatusCode };
