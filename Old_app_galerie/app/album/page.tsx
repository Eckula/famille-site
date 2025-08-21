// app/album/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Folder = { id: string; name: string; parentId: string | null };

async function getJSON<T>(url: string) {
  const r = await fetch(url, { cache: "no-store" });
  const t = await r.text();
  if (!r.ok) throw new Error(t || `HTTP ${r.status}`);
  return t ? JSON.parse(t) : {};
}
async function json<T>(url: string, method: string, body?: any) {
  const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(()=> ({}));
  if (!r.ok || j?.error) throw new Error(j?.error || `HTTP ${r.status}`);
  return j;
}

export default function AlbumPage({ params }: { params: Promise<{ albumId: string }> }) {
  // Next 15: params est un Promise
  const { albumId } = React.use(params) as { albumId: string };

  const [album, setAlbum] = useState<Folder | null>(null);
  const [members, setMembers] = useState<Folder[]>([]);
  const [galleryRoot, setGalleryRoot] = useState<Folder[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const memberIds = useMemo(()=> new Set(members.map(m=>m.id)), [members]);

  async function loadMeta() {
    const { item } = await getJSON<{ item: Folder }>(`/api/folders?id=${albumId}`);
    const { members: m } = await getJSON<{ members: Folder[] }>(`/api/albums/${albumId}/members`);
    const g = await getJSON<any>(`/api/folders?root=gallery`);
    const list: Folder[] = Array.isArray(g?.folders) ? g.folders : (Array.isArray(g?.items) ? g.items : []);
    setAlbum(item ?? null);
    setMembers(m ?? []);
    setGalleryRoot(list);
  }
  async function loadPhotos(reset=true) {
    const p = reset ? 1 : page + 1;
    const res: any = await getJSON(`/api/albums/${albumId}/photos?page=${p}&pageSize=60`);
    setPage(p);
    setTotal(res?.total || 0);
    setPhotos(prev => reset ? (res?.items || []) : [...prev, ...(res?.items || [])]);
  }

  useEffect(()=> { loadMeta().catch(console.error); }, []);
  useEffect(()=> { loadPhotos(true).catch(console.error); }, [albumId, members.length]);

  async function add(folderId: string) {
    try { await json(`/api/albums/${albumId}/members`, "POST", { folderId }); await loadMeta(); await loadPhotos(true); }
    catch (e: any) { alert(e?.message || "Ajout impossible (Admin requis ?)"); }
  }
  async function remove(folderId: string) {
    try { await json(`/api/albums/${albumId}/members`, "DELETE", { folderId }); await loadMeta(); await loadPhotos(true); }
    catch (e: any) { alert(e?.message || "Retrait impossible (Admin requis ?)"); }
  }

  if (!album) return <main className="px-6 py-24 text-white">Chargement…</main>;

  return (
    <main className="px-6 py-24 text-white">
      <div className="mb-4"><Link href="/albums" className="opacity-80 hover:underline">← Retour aux albums</Link></div>
      <h1 className="text-3xl font-bold mb-2">{album.name}</h1>
      <p className="opacity-80 mb-6">Ajouter/retirer des dossiers de la galerie et afficher le mur de photos agrégé.</p>

      {/* Gestion des membres */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Dossiers de la galerie</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {galleryRoot.map((f) => {
            const inAlbum = memberIds.has(f.id);
            return (
              <div key={f.id} className="rounded-xl border border-white/20 bg-white/5 p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{f.name}</div>
                  <Link className="text-sm opacity-80 hover:underline"
                        href={`/galerie?view=folder&folderId=${encodeURIComponent(f.id)}`} prefetch={false}>
                    Ouvrir en galerie
                  </Link>
                </div>
                {inAlbum ? (
                  <button onClick={() => remove(f.id)}
                          className="rounded px-3 py-1 border border-red-400/40 text-red-300 hover:bg-red-500/10">
                    Retirer
                  </button>
                ) : (
                  <button onClick={() => add(f.id)}
                          className="rounded px-3 py-1 border border-white/20 hover:bg-white/10">
                    Ajouter
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Mur agrégé */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Photos</h2>
        {!photos.length ? (
          <p className="opacity-80">Aucune photo dans les dossiers membres.</p>
        ) : (
          <>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {photos.map(p => (
                <a key={p.id} href={p.url} target="_blank" rel="noreferrer"
                   className="block overflow-hidden rounded-lg border border-white/10">
                  <Image src={p.thumb || p.url} alt={p.publicId} width={600} height={600}
                         className="h-full w-full object-cover" unoptimized />
                </a>
              ))}
            </div>
            {photos.length < total && (
              <div className="mt-4">
                <button onClick={()=>loadPhotos(false)}
                        className="rounded px-4 py-2 border border-white/20 hover:bg-white/10">
                  Charger plus
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
