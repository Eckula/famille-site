// app/components/GalleryFolders.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Folder = { id: string; name: string; parentId: string | null; createdAt: string };

export default function GalleryFolders() {
  const router = useRouter();
  const sp = useSearchParams(); // peut être null selon les types Next 15

  const [folders, setFolders]   = useState<Folder[]>([]);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [name, setName]         = useState("");

  // Renommage inline
  const [renamingId, setRenamingId]   = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // ✅ null-safe sur sp
  const view = (sp?.get("view") ?? "unassigned").toLowerCase();
  const folderId = sp?.get("folderId") ?? "";

  const activeLabel = useMemo(() => {
    if (view === "unassigned") return "Mes fichiers";
    if (view === "assigned")   return "Classés";
    if (view === "all")        return "Tous les médias";
    if (view === "folder") {
      const f = folders.find(x => x.id === folderId);
      return f ? f.name : "Dossier";
    }
    return "Mes fichiers";
  }, [view, folderId, folders]);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/folders", { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      setFolders(Array.isArray(j?.items) ? j.items : []);
    } catch {
      setFolders([]);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  function goUnassigned() {
    const url = new URL(window.location.href);
    url.searchParams.delete("folderId");
    url.searchParams.set("view", "unassigned");
    router.replace(url.toString());
  }
  function goFolder(id: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("view", "folder");
    url.searchParams.set("folderId", id);
    router.replace(url.toString());
  }

  async function createFolder() {
    const n = name.trim();
    if (!n) return;
    setCreating(true);
    try {
      const r = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ name: n }),
      });
      if (!r.ok) {
        const j = await r.json().catch(()=>null);
        alert(j?.error || "Échec création dossier");
        return;
      }
      setName("");
      await refresh();
    } finally {
      setCreating(false);
    }
  }

  async function deleteFolder(id: string) {
    if (!confirm("Supprimer ce dossier ? Les médias restent accessibles (désaffectés).")) return;
    setDeleting(id);
    try {
      const r = await fetch(`/api/folders/${id}`, { method: "DELETE" });
      if (!r.ok) {
        const j = await r.json().catch(()=>null);
        alert(j?.error || "Échec suppression du dossier");
      }
      // si on était dans ce dossier, revenir à Mes fichiers
      const url = new URL(window.location.href);
      if (url.searchParams.get("folderId") === id) {
        url.searchParams.delete("folderId");
        url.searchParams.set("view", "unassigned");
        router.replace(url.toString());
      }
      await refresh();
    } finally {
      setDeleting(null);
    }
  }

  function startRename(f: Folder) {
    setRenamingId(f.id);
    setRenameValue(f.name);
  }
  function cancelRename() {
    setRenamingId(null);
    setRenameValue("");
  }
  async function confirmRename() {
    const id = renamingId;
    const newName = renameValue.trim();
    if (!id) return;
    if (!newName) { alert("Le nom ne peut pas être vide."); return; }

    try {
      const r = await fetch(`/api/folders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const j = await r.json().catch(()=>null);
      if (!r.ok || j?.error) {
        alert(j?.error || "Échec du renommage (réservé admin).");
        return;
      }
      cancelRename();
      await refresh();
      // si on regarde ce dossier, l'intitulé se mettra à jour via la liste
      if (view === "folder" && folderId === id) {
        const url = new URL(window.location.href);
        router.replace(url.toString());
      }
    } catch {
      alert("Erreur de renommage.");
    }
  }

  return (
    <div className="mb-3">
      {/* Intitulé de la vue */}
      <div className="mb-1 flex items-center gap-2 text-white/80">
        <span>Vue : <span className="font-semibold">{activeLabel}</span></span>
        <button
          onClick={() => refresh()}
          className="rounded border border-white/20 px-2 py-0.5 text-sm hover:bg-white/10"
          title="Rafraîchir la liste des dossiers"
        >
          ↻
        </button>
      </div>

      {/* Liste des dossiers / accès rapides */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button onClick={goUnassigned} className="rounded bg-white/10 px-3 py-1 hover:bg-white/20">
          Mes fichiers
        </button>

        {folders.map(f => {
          const isEditing = renamingId === f.id;
          return (
            <div key={f.id} className="group flex items-center gap-2 rounded bg-white/10 px-3 py-1">
              {!isEditing ? (
                <>
                  <button
                    onClick={()=>goFolder(f.id)}
                    className="flex items-center gap-2 hover:underline"
                    title={`Ouvrir le dossier ${f.name}`}
                  >
                    <span role="img" aria-label="folder">📁</span> {f.name}
                  </button>

                  {/* Bouton renommer */}
                  <button
                    onClick={()=>startRename(f)}
                    className="rounded p-1 hover:bg-white/10"
                    title={`Renommer le dossier ${f.name}`}
                    aria-label={`Renommer le dossier ${f.name}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white/80">
                      <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                        d="M4 20h4l10.5-10.5a1.5 1.5 0 0 0 0-2.121l-1.879-1.879a1.5 1.5 0 0 0-2.121 0L4 14v6zM15 6l3 3" />
                    </svg>
                  </button>

                  {/* Bouton supprimer */}
                  <button
                    onClick={()=>deleteFolder(f.id)}
                    disabled={deleting === f.id}
                    className="rounded p-1 hover:bg-red-500/10 disabled:opacity-50"
                    title={`Supprimer le dossier ${f.name}`}
                    aria-label={`Supprimer le dossier ${f.name}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4 text-red-500 group-hover:text-red-400">
                      <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                        d="M6 7h12M9 7V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1m3 0-1 12a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3L4 7m5 4v6m6-6v6"/>
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <span className="text-white/70">📁</span>
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e)=>setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmRename();
                      if (e.key === "Escape") cancelRename();
                    }}
                    className="rounded border border-white/30 bg-black/30 px-2 py-0.5 outline-none"
                  />
                  <button
                    onClick={confirmRename}
                    className="rounded px-2 py-0.5 hover:bg-emerald-500/10"
                    title="Valider"
                  >
                    ✔︎
                  </button>
                  <button
                    onClick={cancelRename}
                    className="rounded px-2 py-0.5 hover:bg-white/10"
                    title="Annuler"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Création de dossier */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={name}
          onChange={e=>setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") createFolder(); }}
          placeholder="Nom du dossier (ex: Anniversaire 2025)"
          className="w-[360px] max-w-full rounded border border-white/20 bg-black/30 px-3 py-1 outline-none"
        />
        <button
          onClick={createFolder}
          disabled={creating}
          className="rounded bg-white/10 px-3 py-1 hover:bg-white/20 disabled:opacity-50"
        >
          Créer
        </button>
      </div>
    </div>
  );
}
