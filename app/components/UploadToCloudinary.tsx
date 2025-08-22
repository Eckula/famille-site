// app/components/UploadToCloudinary.tsx
"use client";

import { useRef, useState } from "react";

export default function UploadToCloudinary({
  folder,
  assignFolderId,
  afterUpload,
  className,
}: {
  folder: string;                  // ex: "famille/Galerie" ou un sous-dossier d'évènement
  assignFolderId?: string | null;  // undefined => Mes fichiers (null)
  afterUpload?: () => void | Promise<void>;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function getSignature(target: string) {
    for (const ep of ["/api/cloudinary/sign-upload", "/api/media/sign"]) {
      try {
        const r = await fetch(ep, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: target }),
        });
        const j = await r.json();
        if (!r.ok || j?.error) throw new Error(j?.error || `HTTP ${r.status}`);
        return j as { timestamp: number; signature: string; cloudName: string; apiKey: string };
      } catch {
        /* essaie endpoint suivant */
      }
    }
    throw new Error("Signature Cloudinary indisponible");
  }

  async function uploadOne(file: File, target: string) {
    const sig = await getSignature(target);
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", String(sig.timestamp));
    form.append("signature", sig.signature);
    form.append("folder", target);
    const url = `https://api.cloudinary.com/v1_1/${encodeURIComponent(sig.cloudName)}/auto/upload`;
    const r = await fetch(url, { method: "POST", body: form });
    const j = await r.json();
    if (!r.ok || j?.error) throw new Error(j?.error?.message || `HTTP ${r.status}`);
    return j as { public_id: string };
  }

  async function indexNow(publicIds: string[], folderId: string | null) {
    // Route existante chez toi: accepte folderId = null -> "Mes fichiers"
    const r = await fetch("/api/folders/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId, public_ids: publicIds }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j?.error) throw new Error(j?.error || `HTTP ${r.status}`);
  }

  async function onChange() {
    const files = inputRef.current?.files;
    if (!files?.length || busy) return;
    setBusy(true);
    setErr("");
    try {
      const ids: string[] = [];
      for (const f of Array.from(files)) {
        const res = await uploadOne(f, folder);
        ids.push(res.public_id);
      }
      // Indexation immédiate → Mes fichiers si assignFolderId non fourni
      await indexNow(ids, assignFolderId === undefined ? null : assignFolderId);
      window.dispatchEvent(new CustomEvent("media-uploaded", { detail: ids }));
      afterUpload && (await afterUpload());
    } catch (e: any) {
      setErr(e?.message || "Upload impossible");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={className}>
      <input ref={inputRef} className="hidden" type="file" multiple onChange={onChange} disabled={busy} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="rounded bg-emerald-400 px-3 py-2 text-black hover:bg-emerald-300 disabled:opacity-60"
      >
        {busy ? "Envoi…" : "Ajouter des médias"}
      </button>
      {err && <span className="ml-2 text-sm text-red-300">⚠ {err}</span>}
    </div>
  );
}
