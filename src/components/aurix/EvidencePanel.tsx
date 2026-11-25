import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileUp, Trash2, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteEvidence, listEvidence, uploadEvidence } from "@/lib/aurix/api";
import { ALLOWED_EXTENSIONS } from "@/lib/aurix/schemas";
import { buildEvidenceManifest, downloadJson, formatBytes, ENGINE_NOTICE, type Investigation } from "@/lib/aurix/export";
import { Empty, ErrorState, Loading } from "./States";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function EvidencePanel({ inv }: { inv: Investigation }) {
  const qc = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<string | null>(null);
  const q = useQuery({ queryKey: ["evidence", inv.id], queryFn: () => listEvidence(inv.id) });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["evidence"] }); qc.invalidateQueries({ queryKey: ["overview"] }); };

  const upload = useMutation({
    mutationFn: async (file: File) => { setStage(`Hashing and uploading ${file.name}…`); return uploadEvidence(inv.id, file); },
    onSuccess: (e) => { toast.success(`Evidence recorded · SHA-256 ${e.sha256.slice(0, 12)}…`); refresh(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Upload failed"),
    onSettled: () => { setStage(null); if (input.current) input.current.value = ""; },
  });
  const remove = useMutation({
    mutationFn: (e: Parameters<typeof deleteEvidence>[0]) => deleteEvidence(e),
    onSuccess: () => { toast.success("Evidence removed"); refresh(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  return (
    <section className="console-panel p-5 sm:p-6" aria-labelledby="ev-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="eyebrow">Evidence intake</p><h2 id="ev-title" className="mt-1 text-xl font-semibold">Evidence</h2></div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled={!q.data?.length} onClick={() => downloadJson(`evidence-manifest-${inv.id}.json`, buildEvidenceManifest(inv, q.data ?? []))}>
            <Download /> Manifest JSON
          </Button>
          <Button size="sm" variant="glow" disabled={upload.isPending} onClick={() => input.current?.click()}>
            {upload.isPending ? <Loader2 className="animate-spin" /> : <FileUp />} Upload file
          </Button>
          <input ref={input} type="file" className="sr-only" aria-label="Upload evidence file" accept={ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(",")}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload.mutate(f); }} />
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{ENGINE_NOTICE} Max 25 MB per file. Files are stored privately and never opened or executed.</p>
      {stage && <p role="status" className="mt-3 font-mono text-xs text-primary">{stage}</p>}
      <div className="mt-5">
        {q.isLoading ? <Loading /> : q.error ? <ErrorState error={q.error} /> : !q.data?.length ? (
          <Empty title="No evidence yet">Upload a file you're authorized to hold. Its SHA-256 is computed in your browser.</Empty>
        ) : (
          <ul className="divide-y rounded-lg border">
            {q.data.map((e) => (
              <li key={e.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium">{e.file_name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(e.size_bytes)} · {e.mime_type} · {new Date(e.uploaded_at).toLocaleString()}</p>
                  <p className="mt-1 break-all font-mono text-[11px] text-accent-foreground">sha256:{e.sha256}</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="ghost" size="icon" aria-label={`Delete ${e.file_name}`}><Trash2 /></Button></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete this evidence?</AlertDialogTitle>
                      <AlertDialogDescription>“{e.file_name}” and its stored file will be permanently removed.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => remove.mutate(e)}>Delete</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}