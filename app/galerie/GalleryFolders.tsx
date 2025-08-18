// app/galerie/GalleryFolders.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Folder = {
  id: string;
  name: string;
  parentId: string | null;
  _count?: { media: number; children: number };
};

type ListRes = { folders: Folder[]; parent: { id: string; name: string; parentId: string | null } | null };

export default function GalleryFolders() {
  const sp = useSearchParams();
  const router = useRouter();
  const currentFolder = sp?.get("folder") || null;

  const [data, setData] = useState<ListRes>({ folders: [], parent: null });
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const u = new URL("/api/folders", window.location.origin);
      if (currentFolder) u.searchParams.set("parent", currentFolder);
      u.searchParams.set("ts", String(Date.now()));
      const r = await fetch(u.toString(), { cache: "no-store" });
      const j = (await r.json()) as ListRes;
      setData(j);
    } finally {
      setLoading(false);
    }
  }, [currentFolder]);

  useEffect(() => {
    load();
  }, [load]);

  async function createFolder() {
    const val = name.trim();
    if (!val) return;
    setCreating(true);
    try {
      const r = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: val, parentId: currentFolder }),
      });
      if (!r.ok) throw new Error("Erreur création dossier");
      setName("");
      await load();
    } finally {
      setCreating(false);
    }
  }

  const onDropOnFolder = useCallback(async (folderId: string, ev: React.DragEvent) => {
    ev.preventDefault();
    try {
      const json = ev.dataTransfer.getData("application/json") || ev.dataTransfer.getData("text/plain");
      if (!json) return;
      const payload = JSON.parse(json);
      const media = Array.isArray(payload?.media)
        ? payload.media
        : payload?.public_id
        ? [{ public_id: payload.public_id, format: payload.format, resource_type: payload.resource_type, title: payload.title }]
        : [];
      if (!media.length) return;

      const r = await fetch("/api/folders/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId, media }),
      });
      if (!r.ok) throw new Error("Déplacement impossible");
      // recharge dossiers + (optionnel) rafraîchir la liste de médias si on est dans ce dossier
      await load();
      // Si on est sur la même vue dossier, on peut déclencher un event pour que MediaExplorer recharge
      window.dispatchEvent(new CustomEvent("media-moved"));
    } catch (e) {
      // no-op: tu peux ajouter un toast
    }
  }, [load]);

  const goUpHref = useMemo(() => {
    const parent = data.parent;
    if (!parent) return null;
    const target = parent.parentId; // remonter
    const u = new URL(window.location.href);
    if (target) u.searchParams.set("folder", target);
    else u.searchParams.delete("folder");
    return u.toString();
  }, [data.parent]);

  return (
    <section className="px-6 pt-4 pb-2 text-white">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-2xl font-semibold">Dossiers</h2>
        {data.parent && (
          <a
            href={goUpHref || "#"}
            className="text-sm rounded-full bg-white/10 hover:bg-white/20 px-3 py-1"
          >
            ⬅️ Retour
          </a>
        )}
        <div className="ml-auto flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du dossier"
            className="px-3 py-2 rounded-md bg-white/10 border border-white/20 placeholder-white/60 text-white text-sm"
          />
          <button
            disabled={creating || !name.trim()}
            onClick={createFolder}
            className="px-3 py-2 rounded-md bg-emerald-500/90 hover:bg-emerald-500 text-sm"
          >
            {creating ? "Création…" : "Nouveau dossier"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-white/70">Chargement…</p>
      ) : !data.folders.length ? (
        <p className="text-white/70">Aucun dossier {currentFolder ? "dans ce dossier" : "à la racine"}.</p>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {data.folders.map((f) => {
            const href = (() => {
              const u = new URL(window.location.href);
              u.searchParams.set("folder", f.id);
              return u.toString();
            })();

            return (
              <div
                key={f.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDropOnFolder(f.id, e)}
                className="group rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-colors p-3"
              >
                <a href={href} className="block">
                  <div className="aspect-video grid place-items-center text-5xl">📂</div>
                  <div className="mt-2 font-medium line-clamp-2">{f.name}</div>
                  <div className="text-xs text-white/60">
                    {f._count?.children ?? 0} sous-dossier · {f._count?.media ?? 0} éléments
                  </div>
                </a>
                <div className="mt-2 text-xs text-white/50">Dépose des fichiers ici pour déplacer</div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
