import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ExternalLink, Upload, Wallet } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import {
  Alert,
  Button,
  Field,
  Input,
  SectionHeader,
  Textarea,
  buttonVariants,
} from "@/components/brutal";
import { EXPLORER } from "@/lib/trace/config";
import { pinFile, pinJson } from "@/lib/trace/pinata.functions";
import { getGasOverrides, useWallet } from "@/lib/trace/wallet";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/add")({
  head: () => ({
    meta: [
      { title: "Add Product — Register on TraceChain" },
      {
        name: "description",
        content:
          "Register a new product on the TraceChain network: pin metadata to IPFS and create it on-chain.",
      },
      { property: "og:title", content: "Add Product — TraceChain" },
      {
        property: "og:description",
        content: "Pin product metadata to IPFS and mint the on-chain record.",
      },
    ],
  }),
  component: AddProductPage,
});

const STEPS = [
  "UPLOADING IMAGE TO IPFS",
  "UPLOADING METADATA TO IPFS",
  "CREATING PRODUCT ON BLOCKCHAIN",
];

type Result = { productId: string; txHash: string };

function AddProductPage() {
  const { account, connect, getWriteContract } = useWallet();
  const fileInput = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    origin: "",
    batchId: "",
    description: "",
    manufacturedDate: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [step, setStep] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const acceptFile = (f: File | undefined) => {
    if (!f) return;
    if (!/image\/(jpeg|png|webp)/.test(f.type)) {
      toast.error("UNSUPPORTED FILE", { description: "Use JPG, PNG or WEBP." });
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("FILE TOO LARGE", { description: "Maximum size is 5MB." });
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const toBase64 = (f: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.readAsDataURL(f);
    });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      toast.error("WALLET REQUIRED");
      return;
    }
    if (!form.name.trim()) {
      toast.error("PRODUCT NAME REQUIRED");
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      let imageCid: string | undefined;
      if (file) {
        setStep(0);
        const res = await pinFile({
          data: { name: file.name, type: file.type, dataBase64: await toBase64(file) },
        });
        imageCid = res.cid;
      }

      setStep(1);
      const { cid } = await pinJson({
        data: {
          metadata: {
            ...form,
            image: imageCid ? `ipfs://${imageCid}` : "",
          },
        },
      });

      setStep(2);
      const contract = await getWriteContract();
      const overrides = await getGasOverrides();
      const tx = await contract["createProduct"]!(cid, overrides);
      const receipt = await tx.wait();

      setStep(3);
      setResult({
        productId: String(receipt?.logs?.length ?? ""),
        txHash: tx.hash as string,
      });
      toast.success("PRODUCT CREATED");
    } catch (err) {
      setStep(-1);
      toast.error("CREATION FAILED", {
        description: (err as Error)?.message?.slice(0, 160),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8">
      <header className="brut-xl border-[4px] border-ink bg-yellow p-6 sm:p-10">
        <p className="label-tech mb-4 inline-block bg-ink px-2 py-1 text-paper">
          02 / REGISTER
        </p>
        <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tighter sm:text-7xl">
          ADD NEW PRODUCT
        </h1>
        <p className="label-tech mt-4 text-base opacity-80">
          REGISTER A PRODUCT ON THE TRACECHAIN NETWORK
        </p>
      </header>

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
            Connect MetaMask to sign the product creation transaction.
          </Alert>
        </div>
      )}

      {result ? (
        <section className="brut-xl mt-10 border-[4px] border-ink bg-green p-6 sm:p-10">
          <p className="flex items-center gap-3 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
            <CheckCircle2 className="size-9" /> PRODUCT CREATED SUCCESSFULLY
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="border-[3px] border-ink bg-surface p-4">
              <p className="label-tech opacity-60">TRANSACTION</p>
              <p className="mt-1 break-all font-mono text-sm font-bold">{result.txHash}</p>
            </div>
            <div className="flex flex-col justify-center gap-3">
              <a
                href={`${EXPLORER}/tx/${result.txHash}`}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "secondary", full: true })}
              >
                VIEW TRANSACTION <ExternalLink className="size-4" />
              </a>
              <Link to="/" className={buttonVariants({ variant: "primary", full: true })}>
                VIEW PRODUCTS <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-10">
            <section className="brut-lg border-[3px] border-ink bg-surface p-6">
              <SectionHeader number="01" title="PRODUCT INFORMATION" subtitle="ON-CHAIN METADATA PAYLOAD" />
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="PRODUCT NAME">
                    <Input value={form.name} onChange={set("name")} placeholder="Arabica Coffee Batch" required />
                  </Field>
                </div>
                <Field label="ORIGIN / SOURCE LOCATION">
                  <Input value={form.origin} onChange={set("origin")} placeholder="Mumbai, India" />
                </Field>
                <Field label="BATCH ID">
                  <Input value={form.batchId} onChange={set("batchId")} placeholder="BATCH-0042" />
                </Field>
                <Field label="MANUFACTURED DATE">
                  <Input type="date" value={form.manufacturedDate} onChange={set("manufacturedDate")} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="DESCRIPTION">
                    <Textarea value={form.description} onChange={set("description")} placeholder="Describe the product, packaging and handling requirements." />
                  </Field>
                </div>
              </div>
            </section>

            <section className="brut-lg border-[3px] border-ink bg-surface p-6">
              <SectionHeader number="02" title="PRODUCT IMAGE" subtitle="PINNED TO IPFS" />
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  acceptFile(e.dataTransfer.files[0]);
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-4 border-[4px] border-dashed border-ink p-10 text-center",
                  dragging ? "bg-yellow" : "bg-paper",
                )}
              >
                <Upload className="size-9" />
                <p className="font-display text-xl font-extrabold uppercase tracking-tight">
                  DROP IMAGE HERE
                </p>
                <Button type="button" variant="secondary" onClick={() => fileInput.current?.click()}>
                  BROWSE FILES
                </Button>
                <p className="label-tech opacity-60">JPG / PNG / WEBP — MAX 5MB</p>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  aria-label="Product image"
                  onChange={(e) => acceptFile(e.target.files?.[0])}
                />
              </div>

              {file && preview && (
                <div className="mt-6 flex flex-col gap-4 border-[3px] border-ink p-4 sm:flex-row">
                  <img
                    src={preview}
                    alt={`Preview of ${file.name}`}
                    className="brut h-40 w-40 border-[3px] border-ink object-cover"
                  />
                  <div className="flex-1">
                    <p className="label-tech opacity-60">FILE</p>
                    <p className="break-all font-mono text-sm font-bold">{file.name}</p>
                    <p className="label-tech mt-3 opacity-60">SIZE</p>
                    <p className="font-mono text-sm font-bold">
                      {(file.size / 1024).toFixed(0)} KB
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="red"
                      className="mt-4"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                      }}
                    >
                      REMOVE
                    </Button>
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <section className="brut-lg border-[3px] border-ink bg-surface p-6">
              <SectionHeader number="03" title="PROGRESS" subtitle="THREE-STEP PUBLICATION" />
              <ol className="space-y-3">
                {STEPS.map((label, i) => {
                  const done = step > i;
                  const active = step === i;
                  return (
                    <li
                      key={label}
                      className={cn(
                        "flex items-center gap-3 border-[3px] border-ink p-3",
                        done ? "bg-green" : active ? "bg-yellow" : "bg-paper",
                      )}
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center border-[3px] border-ink bg-ink font-mono text-sm font-bold text-paper">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-xs font-extrabold uppercase tracking-widest">
                        {label}
                      </span>
                    </li>
                  );
                })}
              </ol>
              <Button
                type="submit"
                variant="purple"
                size="lg"
                full
                className="mt-6"
                disabled={busy || !account}
              >
                {busy ? "PUBLISHING..." : "CREATE PRODUCT"}
              </Button>
              <p className="label-tech mt-3 opacity-60">
                REQUIRES A SIGNED TRANSACTION ON POLYGON MUMBAI
              </p>
            </section>
          </aside>
        </form>
      )}
    </div>
  );
}
