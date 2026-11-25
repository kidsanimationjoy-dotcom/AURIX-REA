import type { ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
export function Loading({ label = "Loading…" }: { label?: string }) {
  return <div role="status" className="flex items-center gap-2 py-10 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />{label}</div>;
}
export function ErrorState({ error }: { error: unknown }) {
  return (
    <div role="alert" className="flex gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
      <AlertTriangle className="size-4 text-destructive" />{error instanceof Error ? error.message : "Something went wrong."}
    </div>
  );
}
export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed p-10 text-center">
      <p className="font-display font-semibold">{title}</p>
      {children && <div className="mt-2 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}
export function PageHeader({ eyebrow, title, actions }: { eyebrow: string; title: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 animate-rise">
      <div><p className="eyebrow">{eyebrow}</p><h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{title}</h1></div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}