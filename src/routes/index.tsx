import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BrandMark, TAGLINE } from "@/components/aurix/Brand";
import { EngineBadge } from "@/components/aurix/EngineStatus";
import { Fingerprint, FolderLock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AURIX REA — Understand. Reverse Engineer. Recreate." },
      { name: "description", content: "Private, single-owner workspace for organizing authorized reverse-engineering investigations and evidence." },
      { property: "og:title", content: "AURIX REA — Understand. Reverse Engineer. Recreate." },
      { property: "og:description", content: "Private workspace for authorized reverse-engineering investigations and evidence preparation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const features = [
    { icon: FolderLock, t: "Private investigations", d: "Owner-only records protected by sign-in and row-level security." },
    { icon: Fingerprint, t: "Hashed evidence", d: "SHA-256 computed in your browser. Files stored privately, never executed." },
    { icon: ShieldCheck, t: "Authorized-only guardrails", d: "Permission declaration and public-URL validation on every intake." },
  ];
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <BrandMark />
        <Button asChild variant="outline" size="sm"><Link to="/auth">Owner sign-in</Link></Button>
      </header>
      <main className="relative mx-auto max-w-6xl px-5 pb-20 pt-10 sm:pt-20">
        <p className="eyebrow animate-rise">Investigation & evidence console</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.05] sm:text-6xl animate-rise">{TAGLINE.split(". ").map((w, i, a) => (
          <span key={w} className={i === 1 ? "text-primary" : ""}>{w}{i < a.length - 1 ? ". " : ""}</span>
        ))}</h1>
        <p className="mt-6 max-w-xl text-muted-foreground">
          A private, single-owner workspace for organizing authorized reverse-engineering investigations and preparing evidence.
        </p>
        <div className="mt-6"><EngineBadge /></div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="glow" size="lg"><Link to="/auth">Enter workspace</Link></Button>
        </div>
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {features.map(({ icon: I, t, d }) => (
            <div key={t} className="console-panel p-5">
              <I className="size-5 text-primary" aria-hidden />
              <h2 className="mt-3 font-semibold">{t}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}