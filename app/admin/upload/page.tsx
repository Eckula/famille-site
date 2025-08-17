// app/admin/upload/page.tsx
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";

const MAX_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || 100);
const ROOT = process.env.NEXT_PUBLIC_CLOUDINARY_ROOT || "famille";

type UploadItem = {
  file: File;
  status: "idle" | "uploading" | "done" | "error";
  progress: number;
  url?: string;
  public_id?: string;
  error?: string;
};

const RUBRIQUES = ["Photos", "Vidéos", "Documents", "Audio"] as const;
type Rubrique = typeof RUBRIQUES[number];

export default function UploadPage() {
  const [rubrique, setRubrique] = useState<Rubrique>("Photos");
  const [sub, setSub] = useState("");
  const [items, setItems] = useState<UploadItem[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const pickFiles = () => inputRef.current?.click();

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setItems((prev) => [
      ...prev,
      ...files.map((f) => ({ file: f, status: "idle", progress: 0 })),
    ]);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    if (!files.length) return;
    setItems((prev) => [
      ...prev,
      ...files.map((f) => ({ file: f, status: "idle", progress: 0 })),
    ]);
  };
  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  function sanitizeSegment(s: string) {
    return s.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-_/\.]/g, "");
  }
  const folderFinal = useMemo(() => {
    const parts = [ROOT, rubrique].filter(Boolean);
    if (sub.trim()) parts.push(sanitizeSegment(sub));
    return parts.join("/");
  }, [rubrique, sub]);

  const viewItems = useMemo(
    () =>
      items.map((it) =>
        it.file.size > MAX_MB * 1024 * 1024
          ? { ...it, status: "error", error: `Fichier trop volumineux (> ${MAX_MB} Mo)` }
          : it
      ),
    [items]
  );

  const uploadOne = useCallback(
    async (idx: number) => {
      const it = viewItems[idx];
      if (!it || it.status === "uploading" || it.status === "done") return;
      if (it.file.size > MAX_MB * 1024 * 1024) {
        setItems((prev) => {
          const copy = [...prev];
          copy[idx] = { ...it, status: "error", error: `Fichier trop volumineux (> ${MAX_MB} Mo)` };
          return copy;
        });
        return;
      }

      // 1) Signature
      const signRes = await fetch("/api/cloudinary/sign-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder: folderFinal,
          size: it.file.size,
        }),
      });
      if (!signRes.ok) {
        const j = await signRes.json().catch(() => null);
        setItems((prev) => {
          const copy = [...prev];
          copy[idx] = { ...it, status: "error", error: j?.error || "Erreur signature" };
          return copy;
        });
        return;
      }
      const sign = await signRes.json();

      // 2) Upload direct → Cloudinary
      const url = `https://api.cloudinary.com/v1_1/${sign.cloud_name}/auto/upload`;
      const form = new FormData();
      form.append("file", it.file);
      form.append("api_key", sign.api_key);
      form.append("timestamp", String(sign.timestamp));
      form.append("signature", sign.signature);
      if (sign.folder) form.append("folder", sign.folder);
      form.append("use_filename", "true");
      form.append("unique_filename", "false");
      if (typeof sign.overwrite === "boolean") form.append("overwrite", String(sign.overwrite));

      setItems((prev) => {
        const copy = [...prev];
        copy[idx] = { ...it, status: "uploading", progress: 0 };
        return copy;
      });

      await new Promise<void>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            const p = Math.round((ev.loaded / ev.total) * 100);
            setItems((prev) => {
              const copy = [...prev];
              copy[idx] = { ...copy[idx], progress: p };
              return copy;
            });
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const r = JSON.parse(xhr.responseText);
              setItems((prev) => {
                const copy = [...prev];
                copy[idx] = {
                  ...copy[idx],
                  status: "done",
                  progress: 100,
                  url: r.secure_url,
                  public_id: r.public_id,
                };
                return copy;
              });
            } catch {
              setItems((prev) => {
                const copy = [...prev];
                copy[idx] = { ...copy[idx], status: "error", error: "Réponse invalide Cloudinary" };
                return copy;
              });
            }
          } else {
            let msg = "Échec de l’upload";
            try {
              const j = JSON.parse(xhr.responseText);
              msg = j?.error?.message || msg;
            } catch {}
            setItems((prev) => {
              const copy = [...prev];
              copy[idx] = { ...copy[idx], status: "error", error: msg };
              return copy;
            });
          }
          resolve();
        };
        xhr.onerror = () => {
          setItems((prev) => {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], status: "error", error: "Erreur réseau" };
            return copy;
          });
          resolve();
        };
        xhr.send(form);
      });
    },
    [viewItems, folderFinal]
  );

  const startAll = async () => {
    for (let i = 0; i < viewItems.length; i++) {
      if (viewItems[i].status !== "done") await uploadOne(i);
    }
  };
  const resetAll = () => setItems([]);

  const total = viewItems.length;
  const done = viewItems.filter((i) => i.status === "done").length;

  // ── UI style "ancien formulaire"
  return (
    <main className="px-6 py-10 text-white">
      <h1 className="text-3xl font-bold mb-1">Uploader des médias</h1>
      <p className="mb-3 text-white/80">
        Sélectionne plusieurs fichiers (images, vidéos, PDF, Word, audio, etc.). Ils seront rangés selon la rubrique choisie.
      </p>

      <div className="flex flex-wrap gap-2 items-center mb-2">
        <select
          value={rubrique}
          onChange={(e) => setRubrique(e.target.value as Rubrique)}
          className="rounded border border-white/30 bg-white/10 px-3 py-1.5"
        >
          {RUBRIQUES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <input
          value={sub}
          onChange={(e) => setSub(e.target.value)}
          placeholder="Sous-dossier (ex: Anniversaires/Paul-2025)"
          className="rounded border border-white/30 bg-white/10 px-3 py-1.5 min-w-[22rem]"
        />
      </div>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="rounded-md border-2 border-dashed border-white/40 bg-black/30 p-4 text-center"
      >
        <div className="mb-2 text-white/80">Glisse les fichiers ici</div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={onPick}
          accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        />
        <button
          onClick={pickFiles}
          className="rounded-md border border-white/40 bg-white/10 px-4 py-2 hover:bg-white/20"
        >
          Choisir des fichiers
        </button>
        <div className="mt-2 text-xs text-white/60">Max {MAX_MB} Mo par fichier</div>
        <div className="mt-1 text-xs text-white/50">Dossier final : <code>{folderFinal}</code></div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={startAll}
          disabled={!total}
          className="rounded-md border border-white/40 bg-yellow-800/40 px-3 py-1.5 hover:bg-yellow-800/60 disabled:opacity-50"
        >
          Envoyer
        </button>
        <button
          onClick={resetAll}
          disabled={!total}
          className="rounded-md border border-white/40 bg-white/10 px-3 py-1.5 hover:bg-white/20 disabled:opacity-50"
        >
          Réinitialiser
        </button>
        <Link prefetch={false} href="/galerie?tab=all" className="rounded-md border border-white/40 bg-white/10 px-3 py-1.5 hover:bg-white/20">
          Retour à la galerie
        </Link>
      </div>

      {!!total && (
        <>
          <div className="mt-3 text-sm text-white/80">{done}/{total} terminé(s)</div>
          <div className="mt-2 space-y-2">
            {viewItems.map((it, i) => (
              <div key={i} className="rounded-md border border-white/20 bg-black/40 p-3">
                <div className="flex justify-between items-center gap-3">
                  <div className="truncate">
                    <div className="font-medium truncate">{it.file.name}</div>
                    <div className="text-xs text-white/60">{(it.file.size / (1024 * 1024)).toFixed(2)} Mo</div>
                    <div className="text-xs text-white/50">→ {folderFinal}</div>
                  </div>
                  <div className="text-sm">
                    {it.status === "idle" && <span className="text-white/70">En attente</span>}
                    {it.status === "uploading" && <span className="text-yellow-300">Envoi… {it.progress}%</span>}
                    {it.status === "done" && <span className="text-green-300">Terminé</span>}
                    {it.status === "error" && <span className="text-red-300">Erreur</span>}
                  </div>
                </div>

                {it.status !== "idle" && (
                  <div className="mt-2 h-2 w-full bg-white/10 rounded">
                    <div className="h-2 bg-white/70 rounded" style={{ width: `${it.progress}%`, transition: "width .2s" }} />
                  </div>
                )}

                {it.error && <div className="mt-2 text-sm text-red-300">⚠️ {it.error}</div>}

                {it.status !== "done" && (
                  <div className="mt-2">
                    <button
                      onClick={() => uploadOne(i)}
                      className="rounded border border-white/30 px-3 py-1 hover:bg-white/10"
                    >
                      Envoyer ce fichier
                    </button>
                  </div>
                )}

                {it.url && (
                  <div className="mt-2 text-xs break-all text-white/70">
                    URL : <a className="underline" href={it.url} target="_blank" rel="noopener noreferrer">{it.url}</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
