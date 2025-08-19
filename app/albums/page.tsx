// app/albums/page.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ALBUMS_ROOT, lastSegment, joinPath } from "@/lib/config";

type FolderNode = { path: string; name: string; createdAt?: string };

async function getJSON<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
async function postJSON<T>(url: string, body: any): Promise<T> {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
async function patchJSON<T>(url: string, body: any): Promise<T> {
  const r = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
async function delJSON<T>(url: string, body: any): Promise<T> {
  const r = await fetch(url, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export default function AlbumsListPage() {
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [covers, setCovers] = useState<Record<string, string | null>>({});
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // create
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  // edit/delete
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  async function refresh() {
    const resp = await getJSON<{ items: FolderNode[] }>(`/api/media/folders?root=${encodeURIComponent(ALBUMS_ROOT)}`);
    const items = Array.isArray(resp?.items) ? resp.items : [];
    setFolders(items.filter(f => f.path?.toLowerCase().startsWith(ALBUMS_ROOT.toLowerCase() + "/")));
    const cov = await getJSON<{ covers: Record<string, string|null> }>(`/api/media/covers?root=${encodeURIComponent(ALBUMS_ROOT)}`);
    setCovers(cov.covers || {});
  }

  useEffect(() => {
    (async () => {
      setLoading(true); setErr("");
      try { await refresh(); } catch (e: any) { setErr(e?.message || "Erreur chargement albums"); }
      finally { setLoading(false); }
    })();
  }, []);

  const albums = useMemo(() => [...folders], [folders]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true); setErr("");
    try {
      await postJSON("/api/media/folders", { path: joinPath(ALBUMS_ROOT, newName.trim()) });
      setNewName("");
      await refresh();
    } catch (e: any) { setErr(e?.message || "Création impossible"); }
    finally { setCreating(false); }
  }

  async function onDelete(path: string) {
    if (!confirm("Supprimer l’album et tous ses médias ?")) return;
    try { await delJSON("/api/media/folders", { path, recursive: true }); await refresh(); }
    catch (e: any) { alert(e?.message || "Suppression impossible"); }
  }

  function startRename(path: string, current: string) { setEditingPath(path); setEditingName(current); }
  function cancelRename() { setEditingPath(null); setEditingName(""); }
  async function confirmRename() {
    const from = editingPath!, name = editingName.trim();
    if (!from || !name) return;
    const to = joinPath(ALBUMS_ROOT, name);
    try { await patchJSON("/api/media/folders", { from, to }); cancelRename(); await refresh(); }
    catch (e: any) { alert(e?.message || "Renommage impossible"); }
  }

  return (
    <main className="px-6 py-24 text-white">
      <h1 className="mb-2 text-3xl font-bold">Albums</h1>
      <p className="text-white/80 mb-6">Sous-dossiers de <code>{ALBUMS_ROOT}</code>.</p>

      {/* création */}
      <form onSubmit={onCreate} className="mb-10 flex gap-3 max-w-xl">
        <input value={newName} onChange={(e)=>setNewName(e.target.value)} placeholder="Nom de l’album"
               className="flex-1 px-3 py-2 rounded border bg-white/5 text-white" />
        <button disabled={creating} className="px-4 py-2 rounded bg-black text-white disabled:opacity-60">
          {creating ? "Création…" : "Créer"}
        </button>
      </form>

      {err && <p className="text-red-300 mb-3">⚠️ {err}</p>}

      {loading ? <p className="text-white/70">Chargement…</p> : albums.length === 0 ? (
        <p className="text-white/80">Aucun album.</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map(f => {
            const slug = lastSegment(f.path);
            const cover = covers[f.path] ?? null;
            const isEditing = editingPath === f.path;
            return (
              <div key={f.path} className="group relative overflow-hidden rounded-2xl border border-white/25 bg-white/5 shadow-sm">
                <Link prefetch={false} href={`/albums/${encodeURIComponent(slug)}`} className="block">
                  <div className="aspect-video w-full overflow-hidden bg-black/30">
                    {cover ? (
                      <Image src={cover} alt={f.name} width={800} height={450} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" unoptimized />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-white/80">📚 {f.name}</div>
                    )}
                  </div>
                </Link>
                <div className="p-3">
                  {!isEditing ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium truncate">{f.name}</div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => startRename(f.path, f.name)} className="px-2 py-1 rounded bg-white/10 text-white text-sm hover:bg-white/20">Renommer</button>
                        <button onClick={() => onDelete(f.path)} className="px-2 py-1 rounded bg-red-600/80 text-white text-sm hover:bg-red-600">Supprimer</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input value={editingName} onChange={e=>setEditingName(e.target.value)} className="flex-1 px-2 py-1 rounded border bg-white/5 text-white" />
                      <button onClick={confirmRename} className="px-2 py-1 rounded bg-black text-white text-sm">OK</button>
                      <button onClick={cancelRename} className="px-2 py-1 rounded bg-white/10 text-white text-sm">Annuler</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
