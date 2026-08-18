import { STATUS_COLORS, STATUS_LABELS, formatDate, shortAddr, type StatusCode } from "@/lib/trace/config";
import type { HistoryEntry } from "@/lib/trace/data";
import { Badge } from "./index";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  className,
}: {
  status: StatusCode;
  className?: string;
}) {
  return (
    <Badge tone={STATUS_COLORS[status]} className={className}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function Timeline({ entries }: { entries: HistoryEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="border-[3px] border-dashed border-ink p-8 text-center">
        <p className="font-display text-lg font-extrabold uppercase">
          NO CUSTODY RECORDS
        </p>
        <p className="label-tech mt-1 opacity-60">
          Chain of custody appears after the first on-chain update.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative">
      {entries.map((e, i) => (
        <li key={`${e.timestamp}-${i}`} className="relative pb-6 pl-14 last:pb-0">
          {i < entries.length - 1 && (
            <span
              aria-hidden
              className="absolute left-[21px] top-12 h-[calc(100%-2.5rem)] w-[4px] bg-ink"
            />
          )}
          <span className="brut absolute left-0 top-0 flex size-11 items-center justify-center border-[3px] border-ink bg-ink font-mono text-sm font-bold text-paper">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="brut border-[3px] border-ink bg-surface">
            <div
              className={cn(
                "flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-ink px-4 py-2",
                STATUS_COLORS[e.newStatus],
              )}
            >
              <span className="font-display text-lg font-extrabold uppercase tracking-tight">
                {STATUS_LABELS[e.newStatus]}
              </span>
              <span className="label-tech">{formatDate(e.timestamp)}</span>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <div>
                <p className="label-tech opacity-60">LOCATION</p>
                <p className="font-display text-sm font-bold uppercase">
                  {e.location || "—"}
                </p>
              </div>
              <div>
                <p className="label-tech opacity-60">UPDATED BY</p>
                <p className="font-mono text-sm font-bold">{shortAddr(e.updatedBy)}</p>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
