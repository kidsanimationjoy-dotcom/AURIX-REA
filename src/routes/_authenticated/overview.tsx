import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { counts, recentActivity } from "@/lib/aurix/api";
import { EngineStatusPanel } from "@/components/aurix/EngineStatus";
import { Empty, ErrorState, Loading, PageHeader } from "@/components/aurix/States";

export const Route = createFileRoute("/_authenticated/overview")({
  head: () => ({ meta: [{ title: "Overview — AURIX REA" }, { name: "description", content: "Investigation and evidence overview." }, { property: "og:title", content: "Overview — AURIX REA" }, { property: "og:description", content: "Workspace overview." }] }),
  component: Overview,
});

function Overview() {
  const c = useQuery({ queryKey: ["overview", "counts"], queryFn: () => counts() });
  const a = useQuery({ queryKey: ["overview", "activity"], queryFn: () => recentActivity() });
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Workspace" title="Overview" />
      {c.isLoading ? <Loading /> : c.error ? <ErrorState error={c.error} /> : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="console-panel p-5"><p className="eyebrow">Investigations</p><p className="mt-2 font-display text-4xl">{c.data?.investigations}</p></div>
          <div className="console-panel p-5"><p className="eyebrow">Evidence items</p><p className="mt-2 font-display text-4xl">{c.data?.evidence}</p></div>
        </div>
      )}
      <section className="console-panel p-5">
        <h2 className="text-lg font-semibold">Recent activity</h2>
        <div className="mt-3">{a.isLoading ? <Loading /> : a.error ? <ErrorState error={a.error} /> : !a.data?.length ? <Empty title="No activity yet" /> : (
          <ul className="space-y-2 text-sm">{a.data.map((x) => <li key={x.id}>{x.action} <span className="text-muted-foreground">· {new Date(x.created_at).toLocaleString()}</span></li>)}</ul>
        )}</div>
      </section>
      <EngineStatusPanel />
    </div>
  );
}