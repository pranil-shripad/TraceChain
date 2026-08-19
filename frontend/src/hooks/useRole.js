import { useState, useEffect } from "react";
import { useWallet } from "./useWallet";
import { useSupplyChain } from "./useSupplyChain";

export function useRole() {
  const { account } = useWallet();
  const { contract } = useSupplyChain();
  const [role, setRole] = useState("none");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function detectRole() {
      if (!contract || !account) {
        if (isMounted) {
          setRole("none");
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setIsLoading(true);
        setRole("none");
      }

      try {
        const cleanAccount = account.toLowerCase();

        // 1. Check DEFAULT_ADMIN_ROLE
        const adminRole = await contract.DEFAULT_ADMIN_ROLE();
        const isAdmin = await contract.hasRole(adminRole, cleanAccount);
        if (isAdmin && isMounted) {
          setRole("admin");
          setIsLoading(false);
          return;
        }

        // 2. Check MANUFACTURER_ROLE
        const mfgRole = await contract.MANUFACTURER_ROLE();
        const isMfg = await contract.hasRole(mfgRole, cleanAccount);
        if (isMfg && isMounted) {
          setRole("manufacturer");
          setIsLoading(false);
          return;
        }

        // 3. Check DISTRIBUTOR_ROLE
        const distRole = await contract.DISTRIBUTOR_ROLE();
        const isDist = await contract.hasRole(distRole, cleanAccount);
        if (isDist && isMounted) {
          setRole("distributor");
          setIsLoading(false);
          return;
        }

        // 4. Check RETAILER_ROLE
        const retRole = await contract.RETAILER_ROLE();
        const isRet = await contract.hasRole(retRole, cleanAccount);
        if (isRet && isMounted) {
          setRole("retailer");
          setIsLoading(false);
          return;
        }

        if (isMounted) {
          setRole("none");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error in useRole detection:", err);
        if (isMounted) {
          setRole("none");
          setIsLoading(false);
        }
      }
    }

    detectRole();

    return () => {
      isMounted = false;
    };
  }, [account, contract]);

  return {
    role,
    isAdmin: role === "admin",
    isManufacturer: role === "manufacturer",
    isDistributor: role === "distributor",
    isRetailer: role === "retailer",
    isLoading,
  };
}
