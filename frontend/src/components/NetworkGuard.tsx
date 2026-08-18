import { TriangleAlert } from "lucide-react";

import { Alert, Button } from "@/components/brutal";
import { CHAIN_NAME } from "@/lib/trace/config";
import { useWallet } from "@/lib/trace/wallet";

export function NetworkGuard() {
  const { wrongNetwork, switchNetwork } = useWallet();
  if (!wrongNetwork) return null;

  return (
    <div className="mx-auto max-w-[1400px] px-4 pt-4 sm:px-8">
      <Alert
        tone="bg-orange"
        title="WRONG NETWORK"
        icon={<TriangleAlert className="mt-0.5 size-6" />}
        action={
          <Button variant="primary" onClick={() => void switchNetwork()}>
            SWITCH NETWORK
          </Button>
        }
      >
        TRACECHAIN RUNS ON {CHAIN_NAME.toUpperCase()} — CHAIN ID 80001.
      </Alert>
    </div>
  );
}
