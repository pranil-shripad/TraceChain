import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ScanLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Alert, Button, Field, Input, SectionHeader } from "@/components/brutal";

export const Route = createFileRoute("/scanner")({
  head: () => ({
    meta: [
      { title: "Scan Product — TraceChain QR Scanner" },
      {
        name: "description",
        content:
          "Scan a TraceChain QR code to open a product's on-chain supply chain history instantly.",
      },
      { property: "og:title", content: "Scan Product — TraceChain" },
      {
        property: "og:description",
        content: "Point your camera at a TraceChain QR code to trace a product.",
      },
    ],
  }),
  component: ScannerPage,
});

const REGION_ID = "tracechain-qr-region";

function ScannerPage() {
  const navigate = useNavigate();
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const [scanning, setScanning] = useState(false);
  const [found, setFound] = useState<string | null>(null);
  const [manualId, setManualId] = useState("");

  const goTo = (id: string) => {
    const clean = id.replace(/[^0-9]/g, "");
    if (!clean) {
      toast.error("INVALID PRODUCT ID");
      return;
    }
    void navigate({ to: "/products/$id", params: { id: clean } });
  };

  const stop = async () => {
    try {
      await scannerRef.current?.stop();
      scannerRef.current?.clear();
    } catch {
      /* scanner already stopped */
    }
    scannerRef.current = null;
    setScanning(false);
  };

  useEffect(() => () => void stop(), []);

  const start = async () => {
    setFound(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(REGION_ID);
      scannerRef.current = scanner as unknown as {
        stop: () => Promise<void>;
        clear: () => void;
      };
      setScanning(true);
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded: string) => {
          setFound(decoded);
          void stop();
          const match = decoded.match(/(\d+)\s*$/);
          if (match?.[1]) goTo(match[1]);
        },
        () => {},
      );
    } catch (err) {
      setScanning(false);
      toast.error("CAMERA UNAVAILABLE", {
        description: (err as Error)?.message?.slice(0, 140),
      });
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8">
      <header className="brut-xl border-[4px] border-ink bg-purple p-6 sm:p-10">
        <p className="label-tech mb-4 inline-block bg-ink px-2 py-1 text-paper">
          03 / VERIFY
        </p>
        <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tighter sm:text-7xl">
          SCAN PRODUCT
        </h1>
        <p className="label-tech mt-4 text-base opacity-80">
          SCAN A TRACECHAIN QR CODE TO VIEW ITS SUPPLY CHAIN HISTORY.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <section className="brut-lg border-[3px] border-ink bg-surface p-6">
          <SectionHeader number="01" title="CAMERA" subtitle="LIVE QR DECODER" />
          <div className="brut mx-auto w-full max-w-md border-[4px] border-ink bg-paper p-3">
            <div id={REGION_ID} className="min-h-64 w-full" />
            {!scanning && !found && (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 border-[3px] border-dashed border-ink">
                <ScanLine className="size-10" />
                <p className="label-tech opacity-70">SCANNER IDLE</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="green" onClick={() => void start()} disabled={scanning}>
              START SCAN
            </Button>
            <Button variant="red" onClick={() => void stop()} disabled={!scanning}>
              STOP SCAN
            </Button>
          </div>

          {found && (
            <div className="mt-6">
              <Alert
                tone="bg-green"
                title="PRODUCT FOUND"
                icon={<CheckCircle2 className="mt-0.5 size-6" />}
              >
                {found}
              </Alert>
            </div>
          )}
        </section>

        <section className="brut-lg border-[3px] border-ink bg-surface p-6">
          <SectionHeader number="02" title="MANUAL LOOKUP" subtitle="FALLBACK ENTRY" />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              goTo(manualId);
            }}
            className="space-y-4"
          >
            <Field label="ENTER PRODUCT ID" hint="NUMERIC ON-CHAIN IDENTIFIER">
              <Input
                inputMode="numeric"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="001"
              />
            </Field>
            <Button type="submit" variant="yellow" full size="lg">
              GO <ArrowRight className="size-4" />
            </Button>
          </form>
          <p className="label-tech mt-6 border-t-[3px] border-dashed border-ink/40 pt-4 opacity-60">
            CAMERA ACCESS IS HANDLED BY YOUR BROWSER AND NEVER LEAVES THE DEVICE.
          </p>
        </section>
      </div>
    </div>
  );
}
