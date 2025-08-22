// app/admin/upload/page.tsx
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UploadItem = {
  file: File;
  status: "idle" | "uploading" | "done" | "error";
  progress: number;
  url?: string;
  public_id?: string;
  error?: string;
};

const MAX_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || 100);
const ROOT = process.env.NEXT_PUBLIC_DEFAULT_UPLOAD_ROOT || "famille";

type Rubrique = "Photos" | "Vidéos" | "Documents" | "Audio";
const RUBRIQUES: Rubrique[] = ["Photos", "Vidéos", "Documents", "Audio"];

async function indexInDb(publicIds: string[], folderId: string | null) {
  const r = await fetch("/api/folders/assign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folderId, public_ids: publicIds }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j?.error) throw new Error(j?.error || `HTTP ${r.status}`);
  return j;
}

export default function UploadPage() {
  const router = useRouter();
  const [rubrique, setRubrique] = useState<Rubrique>("Photos");
  const [subFolder, setSubFolder] = useState("");
  const [items, setItems] = useState<UploadItem[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const finalFolder = useMemo(() => {
    const cleaned = (subFolder || "")
      .split("/")
      .map((s) => s.trim().replace(/[^A-Za-z0-9._-]+/g, "-"))
      .filter(Boolean)
      .join("/");
    return `${ROOT}/${rubrique}${cleaned ? `/${cleaned}` : ""}`;
  }, [rubrique, subFolder]);

  const total = items.length;
  const uploaded = items.filter((i) => i.status === "done").length;

  const pickFiles = () => inputRef.current?.click();

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const nextItems: UploadItem[] = files.map((f) => ({
      file: f,
      status: "idle",
      progress: 0,
    }));
    setItems((prev) => [...prev, ...nextItems]);

    e.target.value = ""; // reset
  }

  const uploadOne = useCallback(
    async (idx: number): Promise<string | null> => {
      const it = items[idx];
      if (!it || it.status === "uploading" || it.status === "done") return null;

      if (it.file.size > MAX_MB * 1024 * 1024) {
        setItems((prev) => {
          const copy = [...prev];
          copy[idx] = { ...it, status: "error", error: `Fichier trop volumineux (> ${MAX_MB} Mo)` };
          return copy;
        });
        return null;
      }

      // 1) Signature
      const sRes = await fetch("/api/cloudinary/sign-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: finalFolder, size: it.file.size }),
      });

      if (!sRes.ok) {
        const j = await sRes.json().catch(() => null);
        setItems((prev) => {
          const copy = [...prev];
          copy[idx] = { ...it, status: "error", error: j?.error || "Erreur signature" };
          return copy;
        });
        return null;
      }
      const sign = await sRes.json();

      // 2) Upload direct Cloudinary
      const endpoint = `https://api.cloudinary.com/v1_1/${sign.cloud_name}/auto/upload`;
      const form = new FormData();
      form.append("file", it.file);
      form.append("api_key", sign.api_key);
      form.append("timestamp", String(sign.timestamp));
      form.append("signature", sign.signature);
      form.append("folder", sign.folder);
      form.append("use_filename", "true");
      form.append("unique_filename", "false");
      form.append("overwrite", String(!!sign.overwrite));

      setItems((prev) => {
        const copy = [...prev];
        copy[idx] = { ...it, status: "uploading", progress: 0 };
        return copy;
      });

      const publicId = await new Promise<string | null>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", endpoint);
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
              const pid: string = r.public_id;
              setItems((prev) => {
                const copy = [...prev];
                copy[idx] = { ...copy[idx], status: "done", progress: 100, url: r.secure_url, public_id: pid };
                return copy;
              });
              resolve(pid || null);
            } catch {
              setItems((prev) => {
                const copy = [...prev];
                copy[idx] = { ...copy[idx], status: "error", error: "Réponse invalide Cloudinary" };
                return copy;
              });
              resolve(null);
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
            resolve(null);
          }
        };
        xhr.onerror = () => {
          setItems((prev) => {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], status: "error", error: "Erreur réseau" };
            return copy;
          });
          resolve(null);
        };
        xhr.send(form);
      });

      return publicId;
    },
    [items, finalFolder]
  );

  async function startAll() {
    const batchIds: string[] = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.status === "idle" || it.status === "error") {
        // eslint-disable-next-line no-await-in-loop
        const pid = await uploadOne(i);
        if (pid) batchIds.push(pid);
      }
    }
    // ⬇⬇⬇ INDEXATION IMMÉDIATE DANS “MES FICHIERS”
    if (batchIds.length) {
      await indexInDb(batchIds, null);
      // notifie la galerie + redirige sur Mes fichiers
      try { window.dispatchEvent(new CustomEvent("media-uploaded", { detail: batchIds })); } catch {}
      const ts = Date.now();
      router.push(`/galerie?view=unassigned&ts=${ts}`);
    }
  }

  function resetAll() {
    setItems([]);
  }

  return (
    <main className="px-6 py-10 text-white">
      <h1 className="text-3xl font-bold mb-1">Uploader des médias</h1>
      <p className="text-white/80 mb-2">
        Sélectionne plusieurs fichiers (images, vidéos, PDF, Word, audio, etc.). Ils seront rangés selon la rubrique choisie.
      </p>

      {/* Rubrique + Sous-dossier */}
      <div className="flex flex-wrap gap-2 mb-2">
        <select
          value={rubrique}
          onChange={(e) => setRubrique(e.target.value as Rubrique)}
          className="rounded border border-white/30 bg-black/40 px-3 py-2"
        >
          {RUBRIQUES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <input
          value={subFolder}
          onChange={(e) => setSubFolder(e.target.value)}
          placeholder="Sous-dossier (ex: Anniversaires/Paul-2025)"
          className="min-w-[280px] flex-1 rounded border border-white/30 bg-black/40 px-3 py-2"
        />
      </div>

      {/* Dropzone */}
      <div
        className="rounded-lg border-2 border-dashed border-white/40 bg-black/30 p-6 mb-2 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const files = Array.from(e.dataTransfer.files || []);
          if (!files.length) return;
          const nextItems: UploadItem[] = files.map((f) => ({
            file: f,
            status: "idle",
            progress: 0,
          }));
          setItems((prev) => [...prev, ...nextItems]);
        }}
      >
        <div className="mb-1">Glisse les fichiers ici</div>
        <button
          className="rounded px-3 py-1 border border-white/40 bg-white/10 hover:bg-white/20"
          onClick={pickFiles}
        >
          Choisir des fichiers
        </button>
        <div className="text-xs text-white/70 mt-2">Max {MAX_MB} Mo par fichier</div>
        <div className="text-xs text-white/60">Dossier final : <code>{finalFolder}</code></div>

        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={onInputChange}
          className="hidden"
          accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,.txt,.csv,.rtf"
        />
      </div>

      {/* Boutons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={startAll} disabled={!items.length}
          className="rounded border border-yellow-300/60 bg-yellow-300/20 hover:bg-yellow-300/30 px-4 py-2 disabled:opacity-50">
          Envoyer
        </button>
        <button onClick={resetAll}
          className="rounded border border-white/30 bg-white/10 hover:bg-white/20 px-4 py-2">
          Réinitialiser
        </button>
        <Link prefetch={false} href="/galerie?tab=all"
          className="rounded border border-white/30 bg-white/10 hover:bg-white/20 px-4 py-2">
          Retour à la galerie
        </Link>
      </div>

      {/* Liste + progression */}
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={`${it.file.name}-${i}`} className="rounded border border-white/20 bg-black/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="truncate">
                <div className="font-medium truncate">{it.file.name}</div>
                <div className="text-xs text-white/70">{(it.file.size / (1024 * 1024)).toFixed(2)} Mo</div>
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
                <div className="h-2 bg-white/70 rounded" style={{ width: `${it.progress}%` }} />
              </div>
            )}

            {it.error && <div className="mt-1 text-sm text-red-300">⚠️ {it.error}</div>}
            {it.url && (
              <div className="mt-1 text-xs break-all text-white/70">
                URL : <a className="underline" href={it.url} target="_blank" rel="noopener noreferrer">{it.url}</a>
              </div>
            )}

            {it.status !== "done" && (
              <div className="mt-2">
                <button onClick={() => uploadOne(i)} className="rounded border border-white/30 px-3 py-1 hover:bg-white/10">
                  Envoyer ce fichier
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {!!total && (
        <div className="mt-3 text-sm text-white/80">
          {uploaded}/{total} terminé(s)
        </div>
      )}
    </main>
  );
}
