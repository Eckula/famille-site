// app/album/[albumId]/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useState } from "react";

type Role = "guest" | "viewer" | "editor" | "admin";

type Album = { id: string; name: string; parentId: string | null; createdAt?: string | null };
type Folder = { id: string; name: string };
type Media = {
  public_id: string;
  url?: string;
  thumb?: string;
  kind?: "image" | "video" | "audio" | "document";
  createdAt?: string;
};

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
async function delJSON<T>(url: string, body: any): Promise<T> {
  const r = await fetch(url, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || (j as any)?.error) throw new Error((j as any)?.error || `HTTP ${r.status}`);
  return j;
}

export default function AlbumPage(props: { params: Promise<{ albumId: string }> }) {
  // ✅ Next 15: params est une Promise → on l’« unwrap » avec React.use()
  const { albumId } = use(props.params);

  const [role, setRole] = useState<Role>("guest");
  const [album, setAlbum] = useState<Album | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [photos, setPhotos] = useState<Media[]>([]);
  const [limit, setLimit] = useState<number>(120);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const isAdmin = role === "admin";

  // charge le rôle (via /api/me déjà présent chez toi)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const j: any = await getJSON("/api/me");
        if (!cancelled) setRole((j?.role as Role) || "guest");
      } catch {
        if (!cancelled) setRole("guest");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setErr("");

      // 1) album + dossiers membres
      const members = await getJSON<{ album: Album; folders: Folder[] }>(
        `/api/albums/${encodeURIComponent(albumId)}/members`
      );
      setAlbum(members?.album ?? null);
      setFolders(Array.isArray(members?.folders) ? members.folders : []);

      // 2) mur de photos agrégées
      const ph = await getJSON<{ items: Media[] }>(
        `/api/albums/${encodeURIComponent(albumId)}/photos?limit=${limit}`
      );
      setPhotos(Array.isArray(ph?.items) ? ph.items : []);
    } catch (e: any) {
      setErr(e?.message || "Erreur chargement");
      setAlbum(null);
      setFolders([]);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, [albumId, limit]);

  useEffect(() => { refresh(); }, [refresh]);

  async function onAddFolder() {
    const folderId = prompt("ID du dossier de galerie à ajouter (depuis Galerie) :")?.trim();
    if (!folderId) return;
    try {
      await postJSON(`/api/albums/${encodeURIComponent(albumId)}/members`, { folderId });
      await refresh();
    } catch (e: any) {
      alert(e?.message || "Ajout impossible");
    }
  }

  async function onRemoveFolder(fid: string) {
    if (!confirm("Retirer ce dossier de l’album ? (les médias restent en galerie)")) return;
    try {
      await delJSON(`/api/albums/${encodeURIComponent(albumId)}/members`, { folderId: fid });
      await refresh();
    } catch (e: any) {
      alert(e?.message || "Suppression impossible");
    }
  }

  const title = album?.name || "Album";
  const sortedFolders = useMemo(
    () => [...folders].sort((a, b) => a.name.localeCompare(b.name, "fr")),
    [folders]
  );

  return (
    <main className="px-6 py-20 text-white">
      <div className="mb-4">
        <Link href="/albums" className="text-white/80 hover:underline">← Retour aux albums</Link>
      </div>

      <header className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {isAdmin && (
          <button
            onClick={onAddFolder}
            className="rounded bg-emerald-400 px-3 py-1.5 text-sm text-black hover:bg-emerald-300"
          >
            Ajouter un dossier
          </button>
        )}
      </header>

      {err && <p className="mb-3 text-red-300">⚠️ {err}</p>}
      {loading && <p className="mb-6 text-white/70">Chargement…</p>}

      {/* Dossiers membres */}
      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">Dossiers membres</h2>
        {!sortedFolders.length ? (
          <p className="text-white/70">Aucun dossier membre.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {sortedFolders.map((f) => (
              <li key={f.id} className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-sm">
                <span className="truncate max-w-[30ch]">{f.name}</span>
                {isAdmin && (
                  <button
                    onClick={() => onRemoveFolder(f.id)}
                    className="rounded-full border border-red-400/40 px-2 py-0.5 text-red-300 hover:bg-red-500/10"
                    title="Retirer du regroupement"
                  >
                    Retirer
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Actions mur */}
      <div className="mb-3 flex items-center gap-3">
        <button
          onClick={() => refresh()}
          className="rounded border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10"
        >
          Rafraîchir
        </button>
        <label className="text-sm text-white/80">
          Limite photos&nbsp;
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="rounded bg-black/30 border border-white/20 px-2 py-1"
          >
            <option value={60}>60</option>
            <option value={120}>120</option>
            <option value={240}>240</option>
            <option value={500}>500</option>
          </select>
        </label>
      </div>

      {/* Mur de photos */}
      <section>
        <h2 className="sr-only">Mur de photos</h2>
        {!photos.length ? (
          <p className="text-white/70">Pas de média.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {photos.map((m) => {
              const src = m.thumb || m.url || "";
              return (
                <figure key={m.public_id} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-black/30">
                  {src ? (
                    <Image
                      src={src}
                      alt={m.public_id}
                      width={800}
                      height={600}
                      className="h-full w-full object-cover"
                      title={m.public_id}
                      unoptimized
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-white/70">
                      {m.kind === "video" ? "🎬 Vidéo" : "📄 Média"}
                    </div>
                  )}
                </figure>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
