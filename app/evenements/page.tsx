// app/evenements/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EVENTS_ROOT, joinPath, lastSegment } from "@/lib/config";
import { parseEventMeta } from "@/lib/events";

type FolderNode = { path: string; name: string; createdAt?: string };

async function getJSON<T>(url: string): Promise<T> { const r = await fetch(url); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
async function postJSON<T>(url: string, body: any): Promise<T> { const r = await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}); if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
async function patchJSON<T>(url: string, body: any): Promise<T> { const r = await fetch(url,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}); if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
async function delJSON<T>(url: string, body: any): Promise<T> { const r = await fetch(url,{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}); if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }

function formatEventFolderName(dateISO: string, title: string) { return `${dateISO} • ${title} [EVT]`; }

export default function EventsPage() {
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [covers, setCovers] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // create
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  // edit/delete
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  async function refresh() {
    const resp = await getJSON<{ items: FolderNode[] }>(`/api/media/folders?root=${encodeURIComponent(EVENTS_ROOT)}`);
    const items = Array.isArray(resp?.items) ? resp.items : [];
    setFolders(items.filter(f => f.path?.toLowerCase().startsWith(EVENTS_ROOT.toLowerCase() + "/")));
    const cov = await getJSON<{ covers: Record<string, string|null> }>(`/api/media/covers?root=${encodeURIComponent(EVENTS_ROOT)}`);
    setCovers(cov.covers || {});
  }

  useEffect(() => { (async () => { setLoading(true); setErr(""); try { await refresh(); } catch (e:any) { setErr(e?.message || "Erreur chargement événements"); } finally { setLoading(false);} })(); }, []);

  const events = useMemo(() => {
    function pickDate(f: FolderNode) { const meta = parseEventMeta(f.name); return meta.date ? +meta.date : (f.createdAt ? +new Date(f.createdAt) : 0); }
    return [...folders].sort((a,b) => pickDate(b) - pickDate(a));
  }, [folders]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !title.trim()) return;
    setCreating(true);
    try {
      const path = joinPath(EVENTS_ROOT, formatEventFolderName(date, title.trim()));
      await postJSON("/api/media/folders", { path });
      setTitle(""); setDate(new Date().toISOString().slice(0,10));
      await refresh();
    } catch (e:any) { setErr(e?.message || "Création impossible"); }
    finally { setCreating(false); }
  }

  function startRename(path: string, current: string) { setEditingPath(path); setEditingName(current); }
  function cancelRename() { setEditingPath(null); setEditingName(""); }
  async function confirmRename(path: string) {
    const parent = EVENTS_ROOT;
    const name = editingName.trim();
    if (!name) return;
    const to = joinPath(parent, name);
    try { await patchJSON("/api/media/folders", { from: path, to }); cancelRename(); await refresh(); }
    catch (e:any) { alert(e?.message || "Renommage impossible"); }
  }

  async function onDelete(path: string) {
    if (!confirm("Supprimer l’événement et tous ses médias ?")) return;
    try { await delJSON("/api/media/folders", { path, recursive: true }); await refresh(); }
    catch (e:any) { alert(e?.message || "Suppression impossible"); }
  }

  return (
    <main className="px-6 py-24 text-white">
      <h1 className="mb-2 text-3xl font-bold">Événements</h1>
      <p className="text-white/80 mb-6">Sous-dossiers de <code>{EVENTS_ROOT}</code> (format : <code>YYYY-MM-DD • Titre [EVT]</code>).</p>

      {/* Création */}
      <form onSubmit={onCreate} className="mb-10 grid gap-3 max-w-xl">
        <div className="flex gap-3">
          <label className="block">
            <span className="text-sm text-white/70">Date</span>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="mt-1 px-3 py-2 rounded border bg-white/5 text-white" required />
          </label>
          <label className="block flex-1">
            <span className="text-sm text-white/70">Titre</span>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Pique-nique au parc" className="mt-1 w-full px-3 py-2 rounded border bg-white/5 text-white" required />
          </label>
        </div>
        <button disabled={creating} className="justify-self-start px-4 py-2 rounded bg-black text-white disabled:opacity-60">
          {creating ? "Création…" : "Créer l’événement"}
        </button>
      </form>

      {err && <p className="text-red-300 mb-3">⚠️ {err}</p>}

      {loading ? <p className="text-white/70">Chargement…</p> : events.length === 0 ? (
        <p className="text-white/80">Aucun événement pour l’instant.</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {events.map(f => {
            const slug = encodeURIComponent(lastSegment(f.path));
            const cover = covers[f.path] ?? null;
            const isEditing = editingPath === f.path;
            const meta = parseEventMeta(f.name);

            return (
              <div key={f.path} className="group relative overflow-hidden rounded-2xl border border-white/25 bg-white/5 shadow-sm">
                <Link prefetch={false} href={`/evenements/${slug}`} className="block">
                  <div className="aspect-video w-full overflow-hidden bg-black/30">
                    {cover ? (
                      <Image src={cover} alt={f.name} width={800} height={450} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" unoptimized />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-white/80">📅 {f.name}</div>
                    )}
                  </div>
                </Link>
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
                <div className="p-3">
                  <div className="text-sm text-white/80">
                    {meta.date ? meta.date.toLocaleDateString("fr-FR") : f.createdAt ? new Date(f.createdAt).toLocaleDateString("fr-FR") : ""}
                  </div>

                  {!isEditing ? (
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <h2 className="text-lg font-semibold drop-shadow truncate">{meta.title || f.name}</h2>
                      <div className="flex items-center gap-2">
                        <button onClick={() => startRename(f.path, f.name)} className="px-2 py-1 rounded bg-white/10 text-white text-sm hover:bg-white/20">Renommer</button>
                        <button onClick={() => onDelete(f.path)} className="px-2 py-1 rounded bg-red-600/80 text-white text-sm hover:bg-red-600">Supprimer</button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      <input value={editingName} onChange={e=>setEditingName(e.target.value)} className="flex-1 px-2 py-1 rounded border bg-white/5 text-white" />
                      <button onClick={() => confirmRename(f.path)} className="px-2 py-1 rounded bg-black text-white text-sm">OK</button>
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
