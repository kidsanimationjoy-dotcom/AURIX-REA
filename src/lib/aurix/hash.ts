/** SHA-256 via Web Crypto. Reads bytes only; never executes content. */
export async function sha256Hex(data: ArrayBuffer | Uint8Array): Promise<string> {
  const buf = data instanceof Uint8Array ? data : new Uint8Array(data);
  const digest = await crypto.subtle.digest("SHA-256", buf as BufferSource);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashFile(file: Blob): Promise<string> {
  return sha256Hex(await file.arrayBuffer());
}