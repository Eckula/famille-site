// app/albums/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";

type Folder = { id: string; name: string; parentId: string | null; createdAt?: string | null };
type CoverMap = Record<string, string | null>;
type FoldersRes = { items?: Folder[]; folders?: Folder[] } | Folder[];

async function getJSON<T>(url: string): Promise<T> {
  const r = await fetch(url, { cache: "no-store" });
  const txt = await r.text();
  if (!r.ok) throw new Error(txt || `HTTP ${r.status}`);
  return txt ? JSON.parse(txt) : ({} as any);
}
async function postJSON<T>(url: string, body: any): Promise<T> {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || (j as any)?.error) throw new Error((j as any)?.error || `HTTP ${r.status}`);
  return j;
}
async function patchJSON<T>(url: string, body: any): Promise<T> {
  const r = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || (j as any)?.error) throw new Error((j as any)?.error || `HTTP ${r.status}`);
  return j;
}
async function delJSON<T>(url: string, body: any): Promise<T> {
  const r = await fetch(url, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || (j as any)?.error) throw new Error((j as any)?.error || `HTTP ${r.status}`);
  return j;
}

export default function AlbumsPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [covers, setCovers] = useState<CoverMap>({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [name, setName] = useState("");

  // --- charge les sous-dossiers du parent "Albums"
  const refresh = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      let u = new URL("/api/folders", window.location.origin);
      u.searchParams.set("parentName", "Albums");
      u.searchParams.set("ts", String(Date.now()));
      let j = (await getJSON<FoldersRes>(u.toString())) as any;

      let list: Folder[] =
        Array.isArray(j?.items) ? j.items :
        Array.isArray(j?.folders) ? j.folders :
        Array.isArray(j) ? j : [];

      // fallback si besoin : on récupère l'id du parent "Albums" puis ses enfants
      if (!list.length) {
        const roots = (await getJSON<FoldersRes>("/api/folders")) as any;
        const arr =
          Array.isArray(roots?.items) ? roots.items :
          Array.isArray(roots?.folders) ? roots.folders :
          Array.isArray(roots) ? roots : [];
        const albumsRoot = arr.find((f: Folder) => f.name === "Albums");
        if (albumsRoot?.id) {
          u = new URL("/api/folders", window.location.origin);
          u.searchParams.set("parent", albumsRoot.id);
          j = (await getJSON<FoldersRes>(u.toString())) as any;
          list =
            Array.isArray(j?.items) ? j.items :
            Array.isArray(j?.folders) ? j.folders :
            Array.isArray(j) ? j : [];
        }
      }

      setFolders(list);
    } catch (e: any) {
      setErr(e?.message || "Erreur chargement des albums");
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const albums = useMemo(() => {
    const list = [...folders];
    return list.sort((a, b) => {
      const ad = a.createdAt ? +new Date(a.createdAt) : 0;
      const bd = b.createdAt ? +new Date(b.createdAt) : 0;
      return bd - ad || a.name.localeCompare(b.name, "fr");
    });
  }, [folders]);

  // --- récupérer la cover (première photo de l'album)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        albums.map(async (f) => {
          try {
            const u = new URL(`/api/albums/${encodeURIComponent(f.id)}/photos`, window.location.origin);
            u.searchParams.set("limit", "1");
            const j: any = await getJSON(u.toString());
            const first = Array.isArray(j?.items) ? j.items[0] : null;
            return [f.id, first?.thumb || first?.url || null] as const;
          } catch {
            return [f.id, null] as const;
          }
        })
      );
      if (!cancelled) setCovers(Object.fromEntries(entries));
    })();
    return () => { cancelled = true; };
  }, [albums]);

  // --- créer (BD uniquement, sous "Albums")
  async function onCreate() {
    const val = name.trim();
    if (!val) return;
    try {
      // 1er essai : POST /api/folders { name, parentName: "Albums" }
      try {
        await postJSON("/api/folders", { name: val, parentName: "Albums" });
      } catch {
        // Repli : /api/folders/create (hérité)
        await postJSON("/api/folders/create", { name: val, parentName: "Albums" });
      }
      setName("");
      await refresh();
    } catch (e: any) {
      alert(e?.message || "Création impossible");
    }
  }

  // --- renommer (BD uniquement)
  async function onRename(f: Folder) {
    const newName = prompt("Nouveau nom de l’album :", f.name)?.trim();
    if (!newName || newName === f.name) return;
    try {
      try {
        await patchJSON("/api/folders", { id: f.id, name: newName });
      } catch {
        await postJSON("/api/folders/rename", { id: f.id, name: newName });
      }
      await refresh();
    } catch (e: any) {
      alert(e?.message || "Renommage impossible");
    }
  }

  // --- supprimer (BD uniquement — les média/dossiers galerie restent)
  async function onDelete(f: Folder) {
    if (!confirm(`Supprimer l’album « ${f.name} » ? (les dossiers & médias restent en galerie)`)) return;
    try {
      try {
        await delJSON("/api/folders", { id: f.id });
      } catch {
        await postJSON("/api/folders/delete", { id: f.id });
      }
      await refresh();
    } catch (e: any) {
      alert(e?.message || "Suppression impossible");
    }
  }

  return (
    <main className="px-6 py-24 text-white">
      <h1 className="mb-2 text-3xl font-bold">Albums</h1>
      <p className="text-white/80 mb-4">Regroupements de dossiers de la galerie (BD uniquement).</p>

      {/* Formulaire créer */}
      <div className="mb-6 flex gap-2 max-w-lg">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de l’album"
          className="flex-1 rounded border border-white/25 bg-black/30 px-3 py-2"
        />
        <button onClick={onCreate} className="rounded bg-emerald-400 px-3 py-2 text-black hover:bg-emerald-300">
          Créer
        </button>
      </div>

      {err && <p className="mb-3 text-red-300">⚠️ {err}</p>}
      {loading ? (
        <p className="text-white/70">Chargement…</p>
      ) : !albums.length ? (
        <p className="text-white/80">Aucun album.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((a) => {
            const cover = covers[a.id];
            const href = `/album/${encodeURIComponent(a.id)}`;
            return (
              <article
                key={a.id}
                className="relative overflow-hidden rounded-2xl border border-white/25 bg-white/5 shadow-sm"
              >
                {/* COVER cliquable (uniquement la zone image) */}
                <div className="relative aspect-video w-full overflow-hidden bg-black/30">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={a.name}
                      width={800}
                      height={450}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-white/80">📚 {a.name}</div>
                  )}
                  <Link href={href} prefetch={false} aria-label={`Ouvrir ${a.name}`} className="absolute inset-0" />
                </div>

                {/* dégradés visuels */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

                {/* Barre infos + actions */}
                <div className="relative z-10 flex items-center justify-between gap-2 px-3 py-2 text-sm border-t border-white/10">
                  <div className="min-w-0">
                    {a.createdAt && (
                      <div className="text-xs text-white/70">{new Date(a.createdAt).toLocaleDateString("fr-FR")}</div>
                    )}
                    <div className="truncate font-semibold">{a.name}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <button onClick={() => onRename(a)}
                            className="rounded px-2 py-1 border border-white/20 hover:bg-white/10">
                      Renommer
                    </button>
                    <button onClick={() => onDelete(a)}
                            className="rounded px-2 py-1 border border-red-400/40 text-red-300 hover:bg-red-500/10">
                      Supprimer
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
