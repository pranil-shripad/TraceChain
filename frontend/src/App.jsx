import React from "react";
import { useRole } from "./hooks/useRole";
import { useWallet } from "./hooks/useWallet";
import { NoRoleDashboard } from "./components/dashboards/NoRoleDashboard";
import { ManufacturerDashboard } from "./components/dashboards/ManufacturerDashboard";
import { DistributorDashboard } from "./components/dashboards/DistributorDashboard";
import { RetailerDashboard } from "./components/dashboards/RetailerDashboard";
import { AllProductsPage } from "./components/AllProductsPage";

export function App() {
  const { account } = useWallet();
  const { role, isLoading } = useRole();

  if (!account) {
    return <NoRoleDashboard />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center text-paper">
        <div className="brut border-[3px] border-ink bg-yellow p-6 text-ink">
          <div className="inline-block size-8 rounded-full border-4 border-ink border-t-transparent animate-spin mb-3" />
          <h2 className="font-display text-2xl font-extrabold uppercase">
            DETECTING YOUR ROLE...
          </h2>
          <p className="label-tech mt-1 text-xs opacity-80">
            Querying smart contract permissions on Polygon
          </p>
        </div>
      </div>
    );
  }

  // Admin on "/" (PRODUCTS tab) sees the public All Products Ledger.
  // Dedicated Admin Governance is accessible via the "/admin" navbar tab.
  if (role === "admin") {
    return <AllProductsPage />;
  }

  if (role === "manufacturer") {
    return <ManufacturerDashboard />;
  }

  if (role === "distributor") {
    return <DistributorDashboard />;
  }

  if (role === "retailer") {
    return <RetailerDashboard />;
  }

  return <NoRoleDashboard />;
}

export default App;
