"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

// --------- types ---------
type Folder = { id: string; name: string; parentId: string | null; createdAt: string };
type Member = Folder;
type Photo = { public_id: string; url: string; thumb?: string };
type AlbumInfo = { id: string; name: string; parentId: string | null; createdAt: string };

// --------- utils fetch ---------
async function getJSON<T = any>(url: string): Promise<T> {
  const r = await fetch(url, { cache: "no-store" });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || (j as any)?.error) {
    throw new Error((j as any)?.error || `HTTP ${r.status}`);
  }
  return j as T;
}
async function postJSON<T = any>(url: string, body: any): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || (j as any)?.error) throw new Error((j as any)?.error || `HTTP ${r.status}`);
  return j as T;
}
async function delJSON<T = any>(url: string, body: any): Promise<T> {
  const r = await fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || (j as any)?.error) throw new Error((j as any)?.error || `HTTP ${r.status}`);
  return j as T;
}

// --------- modal ajout dossier ---------
function AddFolderModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (folderId: string) => Promise<void>;
}) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    setErr("");
    (async () => {
      setLoading(true);
      try {
        // 1) try "recent" (présent chez toi, vu dans les logs)
        try {
          const j = await getJSON<{ items: Folder[] }>("/api/folders?recent=300");
          setFolders(Array.isArray(j?.items) ? j.items : []);
          return;
        } catch {
          // 2) fallback : enfants de "Evenements" + racine galerie
          const a = await getJSON<{ items: Folder[] }>("/api/folders?parentName=Evenements");
          const b = await getJSON<{ folders: Folder[] }>("/api/folders?root=gallery");
          const merged = [...(a?.items || []), ...(b?.folders || [])];
          setFolders(merged);
        }
      } catch (e: any) {
        setErr(e?.message || "Erreur chargement dossiers");
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return folders;
    return folders.filter(
      (f) => f.name.toLowerCase().includes(s) || f.id.toLowerCase().includes(s)
    );
  }, [folders, q]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-xl border border-white/15 bg-neutral-900">
        <div className="flex items-center justify-between border-b border-white/10 p-3">
          <h3 className="text-lg font-semibold text-white">Choisir un dossier</h3>
          <button onClick={onClose} className="rounded px-2 py-1 text-white/80 hover:bg-white/10">
            Fermer
          </button>
        </div>

        <div className="border-b border-white/10 p-3">
          <input
            placeholder="Filtrer par nom ou ID…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded border border-white/20 bg-black/40 px-3 py-2 text-white placeholder-white/50"
          />
          <p className="mt-1 text-xs text-white/60">
            Astuce : tu peux coller un ID directement dans la recherche.
          </p>
        </div>

        {err && <div className="p-3 text-red-300">⚠️ {err}</div>}

        <div className="max-h-[60vh] overflow-auto text-sm">
          <table className="w-full">
            <thead className="sticky top-0 bg-neutral-950/70 backdrop-blur">
              <tr className="text-left text-white/70">
                <th className="px-3 py-2">Nom</th>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-3 py-3 text-white/70" colSpan={3}>
                    Chargement…
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-white/70" colSpan={3}>
                    Aucun dossier.
                  </td>
                </tr>
              ) : (
                list.map((f) => (
                  <tr key={f.id} className="border-t border-white/10">
                    <td className="px-3 py-2 text-white">{f.name}</td>
                    <td className="px-3 py-2 text-white/70">{f.id}</td>
                    <td className="px-3 py-2">
                      <button
                        className="rounded bg-emerald-400/90 px-2 py-1 text-black hover:bg-emerald-300"
                        onClick={async () => {
                          try {
                            await onAdd(f.id);
                          } catch (e: any) {
                            alert(e?.message || "Ajout impossible.");
                          }
                        }}
                      >
                        Ajouter
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/10 p-3">
          <button
            onClick={onClose}
            className="rounded px-3 py-2 text-white/80 hover:bg-white/10"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------- Page -----------------------
export default function AlbumPage() {
  const params = useParams<{ albumId?: string | string[] }>();
  const albumId = useMemo(() => {
    const v = params?.albumId;
    return Array.isArray(v) ? v[0] : v || "";
  }, [params]);

  const [album, setAlbum] = useState<AlbumInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [pickerOpen, setPickerOpen] = useState(false);

  async function refresh() {
    if (!albumId) return;
    setLoading(true);
    setErr("");
    try {
      // nom de l’album
      const info = await getJSON<{ item: AlbumInfo | null }>(`/api/folders?id=${encodeURIComponent(albumId)}`);
      setAlbum(info?.item || null);

      // membres
      const m = await getJSON<{ items: Member[] }>(`/api/albums/${encodeURIComponent(albumId)}/members`);
      setMembers(Array.isArray(m?.items) ? m.items : []);

      // photos (petit aperçu)
      const p = await getJSON<{ items: Photo[] }>(`/api/albums/${encodeURIComponent(albumId)}/photos?limit=24`);
      setPhotos(Array.isArray(p?.items) ? p.items : []);
    } catch (e: any) {
      setErr(e?.message || "Erreur chargement album");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumId]);

  async function addMember(folderId: string) {
    if (!albumId) return;
    await postJSON(`/api/albums/${encodeURIComponent(albumId)}/members`, { folderId });
    setPickerOpen(false);
    await refresh();
  }

  async function removeMember(folderId: string) {
    if (!albumId) return;
    if (!confirm("Retirer ce dossier de l’album ?")) return;
    await delJSON(`/api/albums/${encodeURIComponent(albumId)}/members`, { folderId });
    await refresh();
  }

  return (
    <main className="px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link href="/albums" className="text-white/80 hover:underline">
          ← Retour aux albums
        </Link>
        <button
          onClick={() => setPickerOpen(true)}
          className="rounded bg-emerald-400 px-3 py-2 text-black hover:bg-emerald-300"
        >
          Ajouter un dossier
        </button>
      </div>

      <h1 className="mb-4 text-3xl font-bold">
        {album?.name || "Album"}
      </h1>

      {err && <p className="mb-3 text-red-300">⚠️ {err}</p>}

      {/* Membres */}
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Dossiers membres</h2>
        {members.length === 0 ? (
          <p className="text-white/70">Aucun dossier membre.</p>
        ) : (
          <ul className="divide-y divide-white/10 rounded-lg border border-white/15 bg-white/5">
            {members.map((f) => (
              <li
                key={f.id}
                className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{f.name}</div>
                  <div className="truncate text-xs text-white/60">{f.id}</div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    prefetch={false}
                    href={`/galerie?tab=all&view=folder&folderId=${encodeURIComponent(f.id)}`}
                    className="rounded bg-white/15 px-2 py-1 text-white hover:bg-white/25"
                  >
                    Ouvrir
                  </Link>
                  <button
                    onClick={() => removeMember(f.id)}
                    className="rounded bg-rose-500/90 px-2 py-1 text-black hover:bg-rose-400"
                  >
                    Retirer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Photos */}
      <section className="mb-10">
        <h2 className="mb-2 text-xl font-semibold">Photos</h2>
        {photos.length === 0 ? (
          <p className="text-white/70">Pas de média.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {photos.map((p) => {
              const src = p.thumb || p.url;
              return (
                <a
                  key={p.public_id}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group block overflow-hidden rounded-lg border border-white/10 bg-black/30"
                >
                  <Image
                    src={src}
                    alt={p.public_id}
                    width={400}
                    height={300}
                    className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                </a>
              );
            })}
          </div>
        )}
      </section>

      <AddFolderModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onAdd={addMember}
      />
    </main>
  );
}
