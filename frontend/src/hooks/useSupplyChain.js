import { useState, useEffect, useCallback } from "react";
import { getReadContract, getGasOverrides, useWallet as useWalletTrace } from "../lib/trace/wallet";

export function useSupplyChain() {
  const [contract, setContract] = useState(null);
  const { getWriteContract } = useWalletTrace();

  useEffect(() => {
    try {
      const readContract = getReadContract();
      setContract(readContract);
    } catch (e) {
      console.error("Failed to initialize read contract:", e);
    }
  }, []);

  const getProduct = useCallback(async (id) => {
    if (!contract) return null;
    try {
      const p = await contract.products(id);
      return {
        productId: p.productId,
        metadataCID: p.metadataCID,
        manufacturer: p.manufacturer,
        status: Number(p.status),
        createdAt: Number(p.createdAt),
        currentOwner: p.currentOwner,
      };
    } catch (err) {
      console.error("Error fetching product:", err);
      return null;
    }
  }, [contract]);

  const getHistory = useCallback(async (id) => {
    if (!contract) return [];
    try {
      const h = await contract.getHistory(id);
      return h.map((item) => ({
        newStatus: Number(item.newStatus),
        updatedBy: item.updatedBy,
        location: item.location,
        timestamp: Number(item.timestamp),
      }));
    } catch (err) {
      console.error("Error fetching history:", err);
      return [];
    }
  }, [contract]);

  const createProduct = useCallback(async (metadataCID) => {
    const writeContract = await getWriteContract();
    const overrides = await getGasOverrides();
    const tx = await writeContract.createProduct(metadataCID, overrides);
    const receipt = await tx.wait();
    return receipt;
  }, [getWriteContract]);

  return {
    contract,
    getProduct,
    getHistory,
    createProduct,
    getWriteContract,
  };
}
