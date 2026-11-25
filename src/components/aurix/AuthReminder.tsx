import { ShieldAlert } from "lucide-react";
export function AuthReminder() {
  return (
    <div role="note" className="flex gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm">
      <ShieldAlert className="size-5 shrink-0 text-warning" aria-hidden />
      <p>
        <strong className="text-warning">Authorized targets only.</strong> Only record targets you own or have explicit,
        documented permission to examine. AURIX REA never fetches, crawls or executes targets or uploaded files.
      </p>
    </div>
  );
}