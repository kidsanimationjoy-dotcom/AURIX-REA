import { z } from "zod";

export const TARGET_TYPES = [
  { value: "website", label: "Website" },
  { value: "android_apk", label: "Android APK" },
  { value: "javascript_electron", label: "JavaScript / Electron" },
  { value: "dotnet", label: ".NET" },
  { value: "firmware", label: "Firmware" },
  { value: "native_binary", label: "Native binary" },
  { value: "database", label: "Database" },
  { value: "network_capture", label: "Network capture" },
  { value: "other", label: "Other" },
] as const;

export type TargetType = (typeof TARGET_TYPES)[number]["value"];
export const targetTypeValues = TARGET_TYPES.map((t) => t.value) as [TargetType, ...TargetType[]];
export const targetTypeLabel = (v: string) => TARGET_TYPES.find((t) => t.value === v)?.label ?? v;

export const AUTH_DECLARATION = "I own this target or have explicit authorization";

/** Returns an error message when a URL is not an ordinary public http(s) URL, else null. Never fetches. */
export function validatePublicUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return "Not a valid URL.";
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return "Only http:// and https:// URLs are accepted.";
  if (url.username || url.password) return "URLs with embedded credentials are not accepted.";
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!host) return "URL has no host.";
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".lan") || host.endsWith(".home.arpa"))
    return "Local / internal hostnames are blocked.";
  // IPv4
  const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    if (
      a === 0 || a === 10 || a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    ) return "Private, loopback, link-local and reserved IP addresses are blocked.";
    return null;
  }
  if (host.includes(":")) {
    if (host === "::" || host === "::1" || /^f[cd]/.test(host) || /^fe[89ab]/.test(host) || host.startsWith("::ffff:"))
      return "Private, loopback and link-local IPv6 addresses are blocked.";
    return null;
  }
  if (!host.includes(".")) return "Single-label hostnames are blocked; use a public domain.";
  return null;
}

const optionalText = (max: number) =>
  z.string().trim().max(max, `Must be ${max} characters or fewer`).optional().transform((v) => (v ? v : null));

export const investigationSchema = z
  .object({
    target_type: z.enum(targetTypeValues),
    label: z.string().trim().min(1, "Label is required").max(120, "Label must be 120 characters or fewer"),
    target_reference: optionalText(2048),
    purpose: z.string().trim().min(1, "Purpose is required").max(1000, "Purpose must be 1000 characters or fewer"),
    notes: optionalText(5000),
    authorized: z.literal(true, { message: "You must confirm you own or are authorized to examine this target" }),
  })
  .superRefine((v, ctx) => {
    const ref = v.target_reference;
    if (ref && /^[a-z][a-z0-9+.-]*:\/\//i.test(ref)) {
      const err = validatePublicUrl(ref);
      if (err) ctx.addIssue({ code: "custom", path: ["target_reference"], message: err });
    } else if (ref && v.target_type === "website") {
      ctx.addIssue({ code: "custom", path: ["target_reference"], message: "Website targets need a full http(s) URL." });
    }
  });

export type InvestigationInput = z.input<typeof investigationSchema>;
export type InvestigationValues = z.output<typeof investigationSchema>;

export const MAX_EVIDENCE_BYTES = 25 * 1024 * 1024;
export const ALLOWED_EXTENSIONS = [
  "apk", "zip", "jar", "dll", "exe", "bin", "img", "so", "elf", "o", "asar", "js", "json", "txt", "log", "csv",
  "pdf", "png", "jpg", "jpeg", "pcap", "pcapng", "har", "sqlite", "db", "gz", "tar", "map", "xml", "md",
];

/** Maps extension to a MIME type accepted by the private bucket. Contents are never executed. */
export function storageMimeFor(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    apk: "application/vnd.android.package-archive", zip: "application/zip", json: "application/json",
    har: "application/json", txt: "text/plain", log: "text/plain", md: "text/plain", js: "text/plain",
    map: "text/plain", xml: "text/plain", csv: "text/csv", pdf: "application/pdf", png: "image/png",
    jpg: "image/jpeg", jpeg: "image/jpeg", pcap: "application/vnd.tcpdump.pcap", pcapng: "application/vnd.tcpdump.pcap",
    sqlite: "application/x-sqlite3", db: "application/x-sqlite3", gz: "application/gzip", tar: "application/x-tar",
  };
  return map[ext] ?? "application/octet-stream";
}

export function validateEvidenceFile(file: { name: string; size: number }): string | null {
  if (!file.name || file.name.length > 255) return "File name must be 1–255 characters.";
  if (file.size <= 0) return "File is empty.";
  if (file.size > MAX_EVIDENCE_BYTES) return "File exceeds the 25 MB limit.";
  const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "";
  if (!ALLOWED_EXTENSIONS.includes(ext)) return `File type “.${ext || "none"}” is not on the allowed list.`;
  return null;
}

export function safeStorageName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
}