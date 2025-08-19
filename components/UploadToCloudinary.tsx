// components/UploadToCloudinary.tsx
"use client";

import { useRef, useState } from "react";

type Props = {
  folder: string;      // ex: "famille/Evenements/2024-04_anniversaire-..."
  onDone?: () => void; // callback après upload
  className?: string;  // optionnel
};

export default function UploadToCloudinary({ folder, onDone, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function getSignature() {
    const r = await fetch("/api/media/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder }),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status} (sign)`);
    return r.json() as Promise<{
      timestamp: number; signature: string; apiKey: string; cloudName: string;
    }>;
  }

  async function handleFiles(files: File[]) {
    if (!files.length) return;
    setBusy(true);
    setErr("");
    try {
      const sig = await getSignature();
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        form.append("folder", folder);
        form.append("timestamp", String(sig.timestamp));
        form.append("api_key", sig.apiKey);
        form.append("signature", sig.signature);
        const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`;
        const resp = await fetch(url, { method: "POST", body: form });
        if (!resp.ok) {
          const txt = await resp.text().catch(() => "");
          throw new Error(`Upload failed ${resp.status} ${txt}`);
        }
      }
      onDone?.();
    } catch (e: any) {
      console.error("Upload error:", e);
      setErr(e?.message || "Erreur upload");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={`relative z-10 inline-flex items-center gap-3 ${className || ""}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(Array.from(e.target.files || []))}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
      >
        {busy ? "Transfert…" : "Ajouter des médias"}
      </button>
      {err && <span className="text-red-300 text-sm">⚠️ {err}</span>}
    </div>
  );
}
