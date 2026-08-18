import { cva, type VariantProps } from "class-variance-authority";
import { Check, Copy, ExternalLink, X } from "lucide-react";
import {
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

/* ------------------------------- BUTTON ------------------------------- */

export const buttonVariants = cva(
  "press inline-flex items-center justify-center gap-2 border-[3px] border-ink font-display font-extrabold uppercase tracking-wider select-none",
  {
    variants: {
      variant: {
        primary: "bg-ink text-paper",
        secondary: "bg-surface text-ink",
        yellow: "bg-yellow text-ink",
        purple: "bg-purple text-ink",
        green: "bg-green text-ink",
        red: "bg-red text-ink",
        blue: "bg-blue text-ink",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-7 py-4 text-base",
      },
      full: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", full: false },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  full,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, full }), className)}
      {...props}
    />
  );
}

/* -------------------------------- CARD -------------------------------- */

export function Card({
  className,
  children,
  interactive,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "border-[3px] border-ink bg-surface",
        interactive ? "press-card" : "brut-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ------------------------------- BADGE -------------------------------- */

export function Badge({
  children,
  className,
  tone = "bg-surface",
}: {
  children: ReactNode;
  className?: string | undefined;
  tone?: string | undefined;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border-[3px] border-ink px-2.5 py-1 font-display text-xs font-extrabold uppercase tracking-widest text-ink",
        tone,
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------- INPUTS ------------------------------- */

const fieldCls =
  "w-full border-[3px] border-ink bg-surface px-4 py-3 font-mono text-sm text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-purple focus:brut";

export function Field({
  label,
  hint,
  children,
  number,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  number?: string;
}) {
  return (
    <label className="block">
      <span className="label-tech mb-2 flex items-center gap-2 text-ink">
        {number && (
          <span className="bg-ink px-1.5 py-0.5 text-paper">{number}</span>
        )}
        {label}
      </span>
      {children}
      {hint && <span className="label-tech mt-1 block opacity-60">{hint}</span>}
    </label>
  );
}

export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={cn(fieldCls, props.className)} />
);

export const Textarea = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className={cn(fieldCls, "min-h-28", props.className)} />
);

export const Select = (props: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={cn(fieldCls, "font-display font-bold uppercase", props.className)}
  />
);

/* ----------------------------- COPY BUTTON ---------------------------- */

export function CopyButton({ value, label = "COPY" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <Button
      type="button"
      size="sm"
      variant={copied ? "green" : "secondary"}
      aria-label={`Copy ${value}`}
      onClick={() => {
        void navigator.clipboard?.writeText(value);
        setCopied(true);
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "COPIED" : label}
    </Button>
  );
}

/* -------------------------------- ALERT ------------------------------- */

export function Alert({
  tone = "bg-yellow",
  title,
  children,
  icon,
  action,
}: {
  tone?: string;
  title: string;
  children?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "brut-md flex flex-col gap-3 border-[4px] border-ink p-4 sm:flex-row sm:items-center sm:justify-between",
        tone,
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {icon}
        <div>
          <p className="font-display text-lg font-extrabold uppercase tracking-tight text-ink">
            {title}
          </p>
          {children && (
            <div className="label-tech mt-1 text-ink opacity-80">{children}</div>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ------------------------------ SKELETON ------------------------------ */

export function Skeleton({ className }: { className?: string | undefined }) {
  return (
    <div
      className={cn(
        "skeleton-brut border-[3px] border-ink bg-muted",
        className,
      )}
      aria-hidden
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="brut-md border-[3px] border-ink bg-surface p-5">
      <div className="flex justify-between">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="mt-5 h-8 w-3/4" />
      <Skeleton className="mt-4 h-4 w-1/2" />
      <Skeleton className="mt-2 h-4 w-2/3" />
      <Skeleton className="mt-6 h-11 w-full" />
    </div>
  );
}

/* -------------------------------- MODAL ------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="brut-xl w-full max-w-lg border-[4px] border-ink bg-paper"
      >
        <div className="flex items-center justify-between border-b-[4px] border-ink bg-yellow px-5 py-3">
          <h2 className="font-display text-xl font-extrabold uppercase tracking-tight">
            {title}
          </h2>
          <Button size="sm" variant="secondary" onClick={onClose} aria-label="Close dialog">
            <X className="size-4" />
          </Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* --------------------------- SECTION HEADER --------------------------- */

export function SectionHeader({
  number,
  title,
  subtitle,
  right,
}: {
  number?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b-[4px] border-ink pb-3">
      <div className="flex items-end gap-3">
        {number && (
          <span className="font-display text-4xl font-extrabold leading-none text-ink/25">
            {number}
          </span>
        )}
        <div>
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
            {title}
          </h2>
          {subtitle && <p className="label-tech mt-1 opacity-70">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

/* ------------------------------ DATA ROW ------------------------------ */

export function DataRow({
  label,
  value,
  mono = true,
  copy,
  href,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copy?: boolean;
  href?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-dashed border-ink/40 py-3 last:border-0">
      <div className="min-w-0">
        <p className="label-tech opacity-60">{label}</p>
        <p
          className={cn(
            "mt-1 break-all text-sm font-bold",
            mono ? "font-mono" : "font-display uppercase",
          )}
        >
          {value}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "blue", size: "sm" })}
          >
            OPEN <ExternalLink className="size-3.5" />
          </a>
        )}
        {copy && <CopyButton value={value} />}
      </div>
    </div>
  );
}
