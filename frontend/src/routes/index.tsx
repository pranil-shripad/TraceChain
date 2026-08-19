import { createFileRoute } from "@tanstack/react-router";
// @ts-ignore
import App from "../App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TraceChain — Role Dashboards & Supply Chain Ledger" },
      {
        name: "description",
        content:
          "TraceChain role-based dashboards for Manufacturers, Distributors, Retailers, and Admins on Polygon.",
      },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  return <App />;
}

