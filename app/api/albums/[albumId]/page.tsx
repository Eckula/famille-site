// app/album/[albumId]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

type Folder = { id: string; name: string; parentId: string | null };
type Photo  = { public_id: string; url: string; thumb?: string };

export default function AlbumPage() {
  const { albumId } = (useParams<{ albumId: string }>() ?? { albumId: "" });
  const [album, setAlbum] = useState<Folder | null>(null);
  const [members, setMembers] = useState<Folder[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [allFolders, setAllFolders] = useState<Folder[]>([]);
  const [search, setSearch] = useState("");
  const [err, setErr] = useState("");

  async function get<T>(url: string) {
    const r = await fetch(url, { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || (j as any)?.error) throw new Error((j as any)?.error || `HTTP ${r.status}`);
    return j as T;
  }

  async function load() {
    setErr("");
    try {
      const a = await get<{ item: Folder | null }>(`/api/folders?id=${encodeURIComponent(albumId)}`);
      setAlbum(a.item ?? null);

      const m = await get<{ items?: Folder[]; folders?: Folder[]; links?: any[] }>(
        `/api/albums/${encodeURIComponent(albumId)}/members`
      );
      const mem = Array.isArray(m.items) ? m.items : Array.isArray(m.folders) ? m.folders : [];
      setMembers(mem);

      const p = await get<{ items: Photo[] }>(
        `/api/albums/${encodeURIComponent(albumId)}/photos?limit=200`
      );
      setPhotos(Array.isArray(p.items) ? p.items : []);
    } catch (e: any) {
      setErr(e.message || "Erreur de chargement");
    }
  }
  useEffect(() => { load(); }, [albumId]);

  async function refreshFolders() {
    try {
      const url = `/api/folders?recent=500&exclude=${encodeURIComponent("Albums,Documents")}&ts=${Date.now()}`;
      const r = await fetch(url, { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j?.error) throw new Error(j?.error || `HTTP ${r.status}`);
      const list: Folder[] =
        Array.isArray(j?.items) ? j.items :
        Array.isArray(j?.folders) ? j.folders :
        Array.isArray(j) ? j : [];
      setAllFolders(list);
    } catch (e: any) {
      alert(e.message || "Impossible de charger les dossiers");
    }
  }
  useEffect(() => { refreshFolders(); }, []);

  async function importFromCloudinary() {
    if (!confirm("Importer/rafraîchir la liste de dossiers depuis Cloudinary ?")) return;
    const r = await fetch(`/api/folders/import-from-cloudinary`, { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j?.error) { alert(j?.error || `HTTP ${r.status}`); return; }
    await refreshFolders();
  }

  async function addFolder(folderId: string) {
    const r = await fetch(`/api/albums/${encodeURIComponent(albumId)}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j?.error) return alert(j?.error || `HTTP ${r.status}`);
    await load();
  }

  async function removeFolder(folderId: string) {
    if (!confirm("Retirer ce dossier de l'album ?")) return;
    // accepte query string OU body côté API
    const r = await fetch(
      `/api/albums/${encodeURIComponent(albumId)}/members?folderId=${encodeURIComponent(folderId)}`,
      { method: "DELETE" }
    );
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j?.error) return alert(j?.error || `HTTP ${r.status}`);
    await load();
  }

  const filtered = allFolders
    .filter((f) => !["Albums", "Événements", "Evenements", "Documents"].includes(f.name))
    .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="px-6 py-20 text-white">
      <Link href="/albums" prefetch={false} className="text-white/80 hover:text-white">
        ← Retour aux albums
      </Link>
      <h1 className="mt-1 text-3xl font-bold">{album?.name ?? "Album"}</h1>
      {err && <p className="text-red-300 mt-2">⚠ {err}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button onClick={refreshFolders} className="rounded border border-white/30 px-3 py-2 hover:bg-white/10">
          ↻ Rafraîchir la liste
        </button>
        <button onClick={importFromCloudinary} className="rounded bg-emerald-400 px-3 py-2 text-black hover:bg-emerald-300">
          Importer depuis Cloudinary
        </button>
        <Link
          href={`/galerie?tab=all&view=folder&folderId=${encodeURIComponent(albumId || "")}`}
          prefetch={false}
          className="rounded border border-white/30 px-3 py-2 hover:bg-white/10"
        >
          Voir dans la galerie
        </Link>
      </div>

      <section className="mt-6">
        <h2 className="mb-2 text-lg font-semibold">Dossiers membres</h2>
        {!members.length ? (
          <p className="text-white/70">Aucun dossier.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {members.map((f) => (
              <li key={f.id} className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-sm">
                <span className="truncate max-w-[24ch]">{f.name}</span>
                <button
                  onClick={() => removeFolder(f.id)}
                  className="rounded-full border border-red-400/40 px-2 py-0.5 text-red-300 hover:bg-red-500/10"
                >
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-lg font-semibold">Ajouter un dossier</h2>
        <div className="mb-2 flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="w-full max-w-xl rounded border border-white/25 bg-black/30 px-3 py-2"
          />
        </div>
        {filtered.length === 0 ? (
          <div className="rounded border border-white/15 bg-white/5 p-4 text-white/70">Aucun dossier.</div>
        ) : (
          <ul className="max-h-[50vh] overflow-auto rounded border border-white/10">
            {filtered.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2 last:border-none">
                <span className="truncate">{f.name}</span>
                <button
                  onClick={() => addFolder(f.id)}
                  className="rounded bg-emerald-400 px-2 py-1 text-sm text-black hover:bg-emerald-300"
                >
                  Ajouter
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-lg font-semibold">Photos</h2>
        {!photos.length ? (
          <div className="rounded border border-white/15 bg-white/5 p-6 text-white/70">Pas de média.</div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((p) => (
              <div key={p.public_id} className="group relative overflow-hidden rounded-lg bg-white/5">
                <Image
                  src={p.thumb || p.url}
                  alt={p.public_id}
                  width={640}
                  height={480}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
