import { createFileRoute } from "@tanstack/react-router";
import { useWallet } from "@/lib/trace/wallet";
import { useRole } from "@/hooks/useRole";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { Alert, Button } from "@/components/brutal";
import { ShieldAlert, Wallet } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Role Management — TraceChain Admin" },
      {
        name: "description",
        content:
          "Grant and revoke manufacturer, distributor and retailer roles on the TraceChain contract.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { account, connect } = useWallet();
  const { isAdmin, isLoading } = useRole();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-16 text-center text-paper">
        <div className="brut border-[3px] border-ink bg-yellow p-6 text-ink inline-block">
          <h2 className="font-display text-2xl font-extrabold uppercase">
            VERIFYING ADMIN PERMISSIONS...
          </h2>
        </div>
      </div>
    );
  }

  if (!account || !isAdmin) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-16 text-paper space-y-6">
        <Alert
          tone="bg-red"
          title="ACCESS DENIED — ADMIN ONLY"
          icon={<ShieldAlert className="mt-0.5 size-6" />}
        >
          THIS SECTION IS STRICTLY RESERVED FOR THE CONTRACT DEFAULT_ADMIN_ROLE. YOUR CONNECTED WALLET DOES NOT HAVE ADMIN PERMISSIONS.
        </Alert>

        {!account && (
          <div className="text-center pt-4">
            <Button variant="purple" onClick={() => void connect()}>
              <Wallet className="size-4" /> CONNECT ADMIN WALLET
            </Button>
          </div>
        )}
      </div>
    );
  }

  return <AdminDashboard />;
}

export default AdminPage;
