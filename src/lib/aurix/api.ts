import { supabase } from "@/integrations/supabase/client";
import type { InvestigationValues } from "./schemas";
import { safeStorageName, storageMimeFor, validateEvidenceFile } from "./schemas";
import { hashFile } from "./hash";
import type { EvidenceItem, Investigation } from "./export";

type Client = typeof supabase;

function fail(error: { message: string } | null, fallback: string): never {
  throw new Error(error?.message || fallback);
}

export async function logActivity(action: string, investigation_id: string | null, client: Client = supabase) {
  await client.from("activity_log").insert({ action, investigation_id });
}

export async function listInvestigations(client: Client = supabase): Promise<Investigation[]> {
  const { data, error } = await client.from("investigations").select("*").order("updated_at", { ascending: false });
  if (error) fail(error, "Could not load investigations");
  return data ?? [];
}

export async function getInvestigation(id: string, client: Client = supabase): Promise<Investigation | null> {
  const { data, error } = await client.from("investigations").select("*").eq("id", id).maybeSingle();
  if (error) fail(error, "Could not load investigation");
  return data;
}

export async function createInvestigation(values: InvestigationValues, client: Client = supabase): Promise<Investigation> {
  const { data, error } = await client.from("investigations").insert(values).select("*").single();
  if (error || !data) fail(error, "Could not create investigation");
  await logActivity(`Created investigation “${data.label}”`, data.id, client);
  return data;
}

export async function updateInvestigation(id: string, patch: Partial<InvestigationValues> & { archived?: boolean }, client: Client = supabase) {
  const { data, error } = await client.from("investigations").update(patch).eq("id", id).select("*").single();
  if (error || !data) fail(error, "Could not update investigation");
  const verb = patch.archived === true ? "Archived" : patch.archived === false ? "Restored" : "Updated";
  await logActivity(`${verb} investigation “${data.label}”`, id, client);
  return data;
}

export async function deleteInvestigation(inv: Investigation, client: Client = supabase) {
  const evidence = await listEvidence(inv.id, client);
  if (evidence.length) await client.storage.from("evidence").remove(evidence.map((e) => e.storage_path));
  const { error } = await client.from("investigations").delete().eq("id", inv.id);
  if (error) fail(error, "Could not delete investigation");
  await logActivity(`Deleted investigation “${inv.label}”`, null, client);
}

export async function listEvidence(investigationId?: string, client: Client = supabase): Promise<EvidenceItem[]> {
  let q = client.from("evidence_items").select("*").order("uploaded_at", { ascending: false });
  if (investigationId) q = q.eq("investigation_id", investigationId);
  const { data, error } = await q;
  if (error) fail(error, "Could not load evidence");
  return data ?? [];
}

export async function uploadEvidence(investigationId: string, file: File, client: Client = supabase): Promise<EvidenceItem> {
  const problem = validateEvidenceFile(file);
  if (problem) throw new Error(problem);
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) throw new Error("Not signed in");
  const sha256 = await hashFile(file);
  const path = `${auth.user.id}/${investigationId}/${sha256.slice(0, 16)}-${safeStorageName(file.name)}`;
  const storageMime = storageMimeFor(file.name);
  const up = await client.storage.from("evidence").upload(path, file, { contentType: storageMime, upsert: false });
  if (up.error) fail(up.error, "Upload failed");
  const { data, error } = await client
    .from("evidence_items")
    .insert({
      investigation_id: investigationId,
      file_name: file.name,
      size_bytes: file.size,
      mime_type: file.type || storageMime,
      sha256,
      storage_path: path,
    })
    .select("*")
    .single();
  if (error || !data) {
    await client.storage.from("evidence").remove([path]);
    fail(error, "Could not record evidence");
  }
  await logActivity(`Added evidence “${file.name}”`, investigationId, client);
  return data;
}

export async function deleteEvidence(item: EvidenceItem, client: Client = supabase) {
  await client.storage.from("evidence").remove([item.storage_path]);
  const { error } = await client.from("evidence_items").delete().eq("id", item.id);
  if (error) fail(error, "Could not delete evidence");
  await logActivity(`Removed evidence “${item.file_name}”`, item.investigation_id, client);
}

export async function recentActivity(client: Client = supabase) {
  const { data, error } = await client.from("activity_log").select("*").order("created_at", { ascending: false }).limit(8);
  if (error) fail(error, "Could not load activity");
  return data ?? [];
}

export async function counts(client: Client = supabase) {
  const [i, e] = await Promise.all([
    client.from("investigations").select("id", { count: "exact", head: true }),
    client.from("evidence_items").select("id", { count: "exact", head: true }),
  ]);
  if (i.error) fail(i.error, "Count failed");
  if (e.error) fail(e.error, "Count failed");
  return { investigations: i.count ?? 0, evidence: e.count ?? 0 };
}