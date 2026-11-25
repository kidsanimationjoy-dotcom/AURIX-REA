import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { BrandMark } from "@/components/aurix/Brand";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: Layout,
});

function Layout() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link to="/overview"><BrandMark /></Link>
        <Button variant="outline" size="sm" onClick={async () => { await supabase.auth.signOut(); window.location.replace("/auth"); }}>Sign out</Button>
      </header>
      <main className="mx-auto max-w-6xl px-5 pb-16"><Outlet /></main>
    </div>
  );
}