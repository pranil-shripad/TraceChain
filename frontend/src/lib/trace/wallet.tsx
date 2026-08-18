import {
  BrowserProvider,
  Contract,
  JsonRpcProvider,
  type Eip1193Provider,
} from "ethers";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import {
  CHAIN_ID,
  CHAIN_ID_HEX,
  CONTRACT_ADDRESS,
  NETWORK_PARAMS,
  RPC_URL,
  TRACECHAIN_ABI,
} from "./config";

type Eth = Eip1193Provider & {
  on?: (e: string, cb: (...args: unknown[]) => void) => void;
  removeListener?: (e: string, cb: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
};

export const getEthereum = (): Eth | null =>
  typeof window === "undefined"
    ? null
    : ((window as unknown as { ethereum?: Eth }).ethereum ?? null);

type WalletState = {
  account: string | null;
  chainId: number | null;
  connecting: boolean;
  hasWallet: boolean;
  wrongNetwork: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
  /** Signer-backed contract — requires a connected wallet. */
  getWriteContract: () => Promise<Contract>;
};

const WalletContext = createContext<WalletState | null>(null);

/** Read-only contract: works with or without an injected wallet. */
export function getReadContract(): Contract {
  const eth = getEthereum();
  const provider = eth
    ? new BrowserProvider(eth)
    : new JsonRpcProvider(RPC_URL, CHAIN_ID);
  return new Contract(CONTRACT_ADDRESS, TRACECHAIN_ABI as unknown as string[], provider);
}

/** Helper to calculate EIP-1559 gas fee overrides for Polygon Amoy network (min priority fee 30 Gwei). */
export async function getGasOverrides() {
  const eth = getEthereum();
  if (!eth) return {};
  try {
    const provider = new BrowserProvider(eth);
    const feeData = await provider.getFeeData();
    const minTip = 30_000_000_000n; // 30 Gwei minimum tip required on Polygon Amoy
    const maxPriorityFeePerGas =
      feeData.maxPriorityFeePerGas && feeData.maxPriorityFeePerGas > minTip
        ? feeData.maxPriorityFeePerGas
        : minTip;

    const maxFeePerGas =
      feeData.maxFeePerGas && feeData.maxFeePerGas > maxPriorityFeePerGas * 2n
        ? feeData.maxFeePerGas
        : maxPriorityFeePerGas * 2n + 10_000_000_000n;

    return { maxPriorityFeePerGas, maxFeePerGas };
  } catch {
    return {
      maxPriorityFeePerGas: 30_000_000_000n, // 30 Gwei
      maxFeePerGas: 60_000_000_000n, // 60 Gwei
    };
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);

  useEffect(() => {
    const eth = getEthereum();
    if (!eth) return;
    setHasWallet(true);

    const sync = async () => {
      try {
        const accounts = (await eth.request({
          method: "eth_accounts",
        })) as string[];
        setAccount(accounts?.[0] ?? null);
        const cid = (await eth.request({ method: "eth_chainId" })) as string;
        setChainId(parseInt(cid, 16));
      } catch {
        /* wallet locked or unavailable */
      }
    };
    void sync();

    const onAccounts = (...args: unknown[]) => {
      const accounts = (args[0] as string[]) ?? [];
      setAccount(accounts[0] ?? null);
    };
    const onChain = (...args: unknown[]) =>
      setChainId(parseInt(args[0] as string, 16));

    eth.on?.("accountsChanged", onAccounts);
    eth.on?.("chainChanged", onChain);
    return () => {
      eth.removeListener?.("accountsChanged", onAccounts);
      eth.removeListener?.("chainChanged", onChain);
    };
  }, []);

  const connect = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) {
      toast.error("NO WALLET DETECTED", {
        description: "Install MetaMask to use TraceChain.",
      });
      return;
    }
    setConnecting(true);
    try {
      const accounts = (await eth.request({
        method: "eth_requestAccounts",
      })) as string[];
      setAccount(accounts?.[0] ?? null);
      const cid = (await eth.request({ method: "eth_chainId" })) as string;
      setChainId(parseInt(cid, 16));
      toast.success("WALLET CONNECTED");
    } catch (err) {
      toast.error("CONNECTION REJECTED", {
        description: (err as Error)?.message?.slice(0, 120),
      });
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => setAccount(null), []);

  const switchNetwork = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) return;
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CHAIN_ID_HEX }],
      });
    } catch (err) {
      if ((err as { code?: number }).code === 4902) {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [NETWORK_PARAMS],
        });
      } else {
        toast.error("NETWORK SWITCH FAILED");
      }
    }
  }, []);

  const getWriteContract = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) throw new Error("No wallet detected");
    const provider = new BrowserProvider(eth);
    const signer = await provider.getSigner();
    return new Contract(
      CONTRACT_ADDRESS,
      TRACECHAIN_ABI as unknown as string[],
      signer,
    );
  }, []);

  const value = useMemo<WalletState>(
    () => ({
      account,
      chainId,
      connecting,
      hasWallet,
      wrongNetwork: !!account && chainId !== null && chainId !== CHAIN_ID,
      connect,
      disconnect,
      switchNetwork,
      getWriteContract,
    }),
    [
      account,
      chainId,
      connecting,
      hasWallet,
      connect,
      disconnect,
      switchNetwork,
      getWriteContract,
    ],
  );

  return <WalletContext value={value}>{children}</WalletContext>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
