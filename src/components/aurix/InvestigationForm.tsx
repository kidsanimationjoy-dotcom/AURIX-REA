import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AUTH_DECLARATION, TARGET_TYPES, investigationSchema, validateEvidenceFile, type InvestigationValues, type TargetType } from "@/lib/aurix/schemas";
import { AuthReminder } from "./AuthReminder";
import { Loader2 } from "lucide-react";

export interface FormInitial {
  target_type: TargetType; label: string; target_reference: string; purpose: string; notes: string; authorized: boolean;
}

export function InvestigationForm({
  initial, submitLabel, onSubmit, allowFile = false,
}: {
  initial?: Partial<FormInitial>;
  submitLabel: string;
  allowFile?: boolean;
  onSubmit: (values: InvestigationValues, file: File | null) => Promise<void>;
}) {
  const [v, setV] = useState<FormInitial>({
    target_type: "website", label: "", target_reference: "", purpose: "", notes: "", authorized: false, ...initial,
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof FormInitial>(k: K, val: FormInitial[K]) => setV((p) => ({ ...p, [k]: val }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = investigationSchema.safeParse(v);
    const errs: Record<string, string> = {};
    if (!parsed.success) for (const i of parsed.error.issues) errs[String(i.path[0])] ??= i.message;
    if (file) { const fe = validateEvidenceFile(file); if (fe) errs["file"] = fe; }
    setErrors(errs);
    if (!parsed.success || Object.keys(errs).length) return;
    setBusy(true);
    try { await onSubmit(parsed.data, file); } finally { setBusy(false); }
  }

  const err = (k: string) => errors[k] && <p id={`${k}-err`} className="text-xs text-destructive">{errors[k]}</p>;

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <AuthReminder />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="target_type">Target type</Label>
          <Select value={v.target_type} onValueChange={(x) => set("target_type", x as TargetType)}>
            <SelectTrigger id="target_type"><SelectValue /></SelectTrigger>
            <SelectContent>{TARGET_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="label">Label</Label>
          <Input id="label" value={v.label} maxLength={120} onChange={(e) => set("label", e.target.value)} aria-invalid={!!errors["label"]} placeholder="e.g. Company billing portal audit" />
          {err("label")}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="target_reference">Target reference <span className="text-muted-foreground">(public URL, package id, version, or description)</span></Label>
        <Input id="target_reference" value={v.target_reference} maxLength={2048} onChange={(e) => set("target_reference", e.target.value)} aria-invalid={!!errors["target_reference"]} placeholder="https://app.example.com" />
        <p className="text-xs text-muted-foreground">URLs are validated only — never fetched. Localhost, private and link-local addresses are blocked.</p>
        {err("target_reference")}
      </div>
      {allowFile && (
        <div className="space-y-2">
          <Label htmlFor="file">Or attach a target file <span className="text-muted-foreground">(optional, max 25 MB, stored privately, never executed)</span></Label>
          <Input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          {err("file")}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="purpose">Purpose</Label>
        <Textarea id="purpose" value={v.purpose} maxLength={1000} onChange={(e) => set("purpose", e.target.value)} aria-invalid={!!errors["purpose"]} placeholder="Why this investigation is being performed and what you are authorized to do." />
        {err("purpose")}
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={v.notes} maxLength={5000} onChange={(e) => set("notes", e.target.value)} rows={4} />
        {err("notes")}
      </div>
      <div className="space-y-1">
        <label className="flex items-start gap-3 rounded-lg border p-4 text-sm">
          <Checkbox checked={v.authorized} onCheckedChange={(c) => set("authorized", c === true)} aria-label={AUTH_DECLARATION} />
          <span>{AUTH_DECLARATION}</span>
        </label>
        {err("authorized")}
      </div>
      <Button type="submit" variant="glow" disabled={busy}>{busy && <Loader2 className="animate-spin" />}{submitLabel}</Button>
    </form>
  );
}