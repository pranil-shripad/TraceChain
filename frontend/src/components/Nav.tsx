import { Link } from "@tanstack/react-router";
import { Activity, Link2, Menu, PackagePlus, Boxes, ScanLine, Shield, Wallet, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/brutal";
import { CHAIN_NAME, shortAddr } from "@/lib/trace/config";
import { useWallet } from "@/lib/trace/wallet";
import { ThemeToggle } from "@/components/ThemeToggle";

const LINKS = [
  { to: "/", label: "PRODUCTS", icon: Boxes },
  { to: "/add", label: "ADD PRODUCT", icon: PackagePlus },
  { to: "/scanner", label: "SCANNER", icon: ScanLine },
  { to: "/events", label: "EVENTS", icon: Activity },
  { to: "/admin", label: "ADMIN", icon: Shield },
] as const;

function WalletButton() {
  const { account, connect, disconnect, switchAccount, connecting, chainId } = useWallet();

  if (!account) {
    return (
      <Button
        variant="yellow"
        size="sm"
        className="sm:px-5 sm:py-2.5 sm:text-sm"
        onClick={() => void connect()}
        disabled={connecting}
      >
        <Wallet className="size-4" />
        <span className="hidden sm:inline">
          {connecting ? "CONNECTING..." : "CONNECT WALLET"}
        </span>
        <span className="sm:hidden">{connecting ? "..." : "CONNECT"}</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => void switchAccount()}
        title="Click to switch active account in MetaMask"
        className="brut flex items-center gap-2 border-[3px] border-ink bg-surface px-3 py-2 font-mono text-sm font-bold hover:bg-yellow transition-all cursor-pointer"
      >
        <span className="size-2.5 border-2 border-ink bg-green" aria-hidden />
        {shortAddr(account)}
      </button>
      <button
        type="button"
        onClick={() => void disconnect()}
        title="Disconnect current wallet"
        className="brut border-[3px] border-ink bg-red px-2.5 py-1.5 font-display text-xs font-extrabold uppercase text-paper hover:bg-opacity-90 transition-all cursor-pointer"
      >
        DISCONNECT
      </button>
      <span className="brut hidden border-[3px] border-ink bg-purple px-3 py-2 font-display text-xs font-extrabold uppercase tracking-widest sm:block">
        {chainId === 80001 ? "MUMBAI" : `CHAIN ${chainId ?? "?"}`}
      </span>
    </div>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b-[4px] border-ink bg-paper">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2 sm:gap-3" aria-label="TraceChain home">
          <span className="brut flex size-9 items-center justify-center border-[3px] border-ink bg-ink text-paper sm:size-10">
            <Link2 className="size-5" />
          </span>
          <span className="font-display text-base font-extrabold uppercase tracking-tighter sm:text-2xl">
            TRACE<span className="bg-yellow px-1">CHAIN</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex" aria-label="Main">
          {LINKS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="press border-[3px] border-ink bg-surface px-3 py-2 font-display text-xs font-extrabold uppercase tracking-widest"
              activeProps={{ className: "bg-yellow" }}
            >
              <span className="flex items-center gap-2">
                <Icon className="size-4" />
                {label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <WalletButton />
          <Button
            size="sm"
            variant="secondary"
            className="lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav
          className="grid gap-2 border-t-[4px] border-ink bg-surface p-4 lg:hidden"
          aria-label="Mobile"
        >
          {LINKS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              onClick={() => setOpen(false)}
              className="press border-[3px] border-ink bg-paper px-4 py-3 font-display text-sm font-extrabold uppercase tracking-widest"
              activeProps={{ className: "bg-yellow" }}
            >
              <span className="flex items-center gap-2">
                <Icon className="size-4" />
                {label}
              </span>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
