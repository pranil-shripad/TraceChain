import { useWallet as useWalletTrace } from "../lib/trace/wallet";

export function useWallet() {
  const wallet = useWalletTrace();
  return {
    account: wallet.account,
    error: null,
    connecting: wallet.connecting,
    hasWallet: wallet.hasWallet,
    wrongNetwork: wallet.wrongNetwork,
    connectWallet: wallet.connect,
    connect: wallet.connect,
    disconnect: wallet.disconnect,
    switchNetwork: wallet.switchNetwork,
    getWriteContract: wallet.getWriteContract,
  };
}
