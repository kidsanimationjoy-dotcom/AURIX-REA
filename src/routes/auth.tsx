import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark, TAGLINE } from "@/components/aurix/Brand";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Owner sign-in — AURIX REA" },
      { name: "description", content: "Sign in to your private AURIX REA investigation workspace." },
      { property: "og:title", content: "Owner sign-in — AURIX REA" },
      { property: "og:description", content: "Sign in to your private AURIX REA workspace." },
    ],
  }),
  component: AuthPage,
});

const creds = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

function AuthPage() {
  const navigate = useNavigate();
  const [hasOwner, setHasOwner] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/overview", replace: true }); });
    supabase.rpc("workspace_has_owner").then(({ data, error }) => setHasOwner(error ? true : !!data));
  }, [navigate]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const p = creds.safeParse({ email, password });
    if (!p.success) { toast.error(p.error.issues[0]?.message ?? "Invalid input"); return; }
    setBusy(true);
    try {
      if (hasOwner) {
        const { error } = await supabase.auth.signInWithPassword(p.data);
        if (error) throw error;
        navigate({ to: "/overview", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({ ...p.data, options: { emailRedirectTo: window.location.origin + "/overview" } });
        if (error) throw error;
        if (data.session) navigate({ to: "/overview", replace: true }); else setSent(true);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally { setBusy(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="console-panel w-full max-w-md p-7 glow-ring animate-rise">
        <Link to="/"><BrandMark /></Link>
        <p className="mt-2 font-mono text-xs text-muted-foreground">{TAGLINE}</p>
        {hasOwner === null ? (
          <div role="status" className="mt-8 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Checking workspace…</div>
        ) : sent ? (
          <div className="mt-8 space-y-2">
            <h1 className="text-xl font-semibold">Check your email</h1>
            <p className="text-sm text-muted-foreground">Confirm the link sent to {email} to activate your owner account, then return here to sign in.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            <h1 className="text-xl font-semibold">{hasOwner ? "Owner sign-in" : "Claim this workspace"}</h1>
            <p className="text-sm text-muted-foreground">
              {hasOwner ? "This is a private, single-owner workspace. Registration is closed." : "No owner exists yet. The first account becomes the only owner; registration closes afterwards."}
            </p>
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete={hasOwner ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <Button type="submit" variant="glow" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}{hasOwner ? "Sign in" : "Create owner account"}</Button>
          </form>
        )}
      </div>
    </main>
  );
}