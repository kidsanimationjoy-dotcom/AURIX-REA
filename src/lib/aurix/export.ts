import type { Tables } from "@/integrations/supabase/types";

export type Investigation = Tables<"investigations">;
export type EvidenceItem = Tables<"evidence_items">;

export const ENGINE_NOTICE =
  "Metadata and SHA-256 hashes only. No REA analysis has been performed: official REA execution is not connected and requires a supported external Node runtime/worker.";

export function buildEvidenceManifest(inv: Investigation, evidence: EvidenceItem[], now = new Date()) {
  return {
    format: "aurix-rea.evidence-manifest/v1",
    generated_at: now.toISOString(),
    analysis_status: "not_performed",
    notice: ENGINE_NOTICE,
    investigation: { id: inv.id, label: inv.label, target_type: inv.target_type },
    evidence: evidence.map((e) => ({
      id: e.id,
      file_name: e.file_name,
      size_bytes: e.size_bytes,
      mime_type: e.mime_type,
      sha256: e.sha256,
      uploaded_at: e.uploaded_at,
    })),
  };
}

export function buildInvestigationExport(inv: Investigation, evidence: EvidenceItem[], now = new Date()) {
  return {
    format: "aurix-rea.investigation/v1",
    generated_at: now.toISOString(),
    analysis_status: "not_performed",
    notice: ENGINE_NOTICE,
    investigation: {
      id: inv.id,
      label: inv.label,
      target_type: inv.target_type,
      target_reference: inv.target_reference,
      purpose: inv.purpose,
      notes: inv.notes,
      authorization_declared: inv.authorized,
      archived: inv.archived,
      created_at: inv.created_at,
      updated_at: inv.updated_at,
    },
    evidence_manifest: buildEvidenceManifest(inv, evidence, now).evidence,
  };
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 ** 2).toFixed(2)} MB`;
}