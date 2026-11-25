import { Check, ExternalLink, X } from "lucide-react";

export const REA_LINKS = {
  github: "https://github.com/morluto/rea",
  npm: "https://www.npmjs.com/package/rea-agents",
};

export function EngineBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-warning/40 bg-warning/10 px-3 py-1 font-mono text-xs text-warning">
      <span className="size-2 rounded-full bg-warning animate-pulse-dot" aria-hidden />
      Not connected — requires a supported external Node runtime/worker
    </span>
  );
}

const WORKS = [
  "Private sign-in for the single workspace owner",
  "Investigation records stored in the database (create, edit, archive, delete)",
  "Evidence upload to private storage with size and type limits",
  "SHA-256 hashing in your browser with Web Crypto",
  "JSON export of investigation metadata and evidence manifests",
  "Public-URL guardrail that blocks localhost, private and link-local addresses",
];
const MISSING = [
  "Official REA CLI / MCP runtime (rea-agents 6.10.1)",
  "Node.js ^22.23.4 || ^24.22.1 || >=26.12.1 worker to host it",
  "Any actual reverse-engineering analysis, decompilation or scanning",
  "Analysis results, findings or reports — none are generated here",
];

export function EngineStatusPanel({ compact = false }: { compact?: boolean }) {
  return (
    <section className="console-panel p-5 sm:p-6" aria-labelledby="engine-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">REA engine</p>
          <h2 id="engine-title" className="mt-1 text-xl font-semibold">Engine status</h2>
        </div>
        <EngineBadge />
      </div>
      {!compact && (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-success">Works in this workspace</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {WORKS.map((w) => (
                <li key={w} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />{w}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-warning">Missing / pending</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {MISSING.map((w) => (
                <li key={w} className="flex gap-2"><X className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <p className="mt-5 text-sm text-muted-foreground">
        REA is a Node CLI/MCP runtime and cannot run in the browser or in this app's backend. True REA execution needs a
        separately hosted Node 24+ worker. Until one is connected, AURIX REA prepares and preserves evidence only.
      </p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <a className="inline-flex items-center gap-1 text-primary hover:underline" href={REA_LINKS.github} target="_blank" rel="noreferrer noopener">
          github.com/morluto/rea <ExternalLink className="size-3.5" aria-hidden />
        </a>
        <a className="inline-flex items-center gap-1 text-primary hover:underline" href={REA_LINKS.npm} target="_blank" rel="noreferrer noopener">
          npm: rea-agents <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </div>
    </section>
  );
}