// app/album/[albumId]/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Role = "guest" | "viewer" | "editor" | "admin";
type Album = { id: string; name: string; parentId: string | null; createdAt?: string | null };
type Folder = { id: string; name: string; parentId?: string | null; createdAt?: string | null };
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
async function delJSON<T>(url: string, body?: any): Promise<T> {
  const r = await fetch(url, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || (j as any)?.error) throw new Error((j as any)?.error || `HTTP ${r.status}`);
  return j;
}

export default function AlbumPage(props: { params: Promise<{ albumId: string }> }) {
  const { albumId } = use(props.params);

  const [role, setRole] = useState<Role>("guest");
  const [album, setAlbum] = useState<Album | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [photos, setPhotos] = useState<Media[]>([]);
  const [limit, setLimit] = useState<number>(120);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // drawer add-folder
  const [pickerOpen, setPickerOpen] = useState(false);
  const [allFolders, setAllFolders] = useState<Folder[]>([]);
  const [q, setQ] = useState("");
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // cover
  const [coverPublicId, setCoverPublicId] = useState<string | null>(null);

  const isAdmin = role === "admin";

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

      const m = await getJSON<{ album: Album; folders: Folder[] }>(
        `/api/albums/${encodeURIComponent(albumId)}/members`
      );
      setAlbum(m?.album ?? null);
      setFolders(Array.isArray(m?.folders) ? m.folders : []);

      const ph = await getJSON<{ items: Media[] }>(
        `/api/albums/${encodeURIComponent(albumId)}/photos?limit=${limit}`
      );
      setPhotos(Array.isArray(ph?.items) ? ph.items : []);

      // cover actuelle
      try {
        const c = await getJSON<{ publicId: string | null }>(`/api/albums/${encodeURIComponent(albumId)}/cover`);
        setCoverPublicId(c?.publicId ?? null);
      } catch { setCoverPublicId(null); }

    } catch (e: any) {
      setErr(e?.message || "Erreur chargement");
      setAlbum(null);
      setFolders([]);
      setPhotos([]);
      setCoverPublicId(null);
    } finally {
      setLoading(false);
    }
  }, [albumId, limit]);

  useEffect(() => { refresh(); }, [refresh]);

  // picker data
  const refreshPickerList = useCallback(async () => {
    try {
      const recent = await getJSON<{ items: Folder[] }>("/api/folders?recent=300");
      const roots = await getJSON<{ folders?: Folder[]; items?: Folder[] }>("/api/folders?root=gallery");
      const list: Folder[] = [
        ...(Array.isArray(recent?.items) ? recent.items : []),
        ...(Array.isArray((roots as any)?.folders) ? (roots as any).folders : []),
        ...(Array.isArray((roots as any)?.items) ? (roots as any).items : []),
      ];
      const map = new Map<string, Folder>();
      for (const f of list) map.set(f.id, f);
      setAllFolders(Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "fr")));
    } catch {}
  }, []);

  const openPicker = async () => { await refreshPickerList(); setPickerOpen(true); };
  const closePicker = () => setPickerOpen(false);

  useEffect(() => {
    if (!pickerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closePicker(); };
    const onClick = (e: MouseEvent) => {
      if (!drawerRef.current) return;
      if (!drawerRef.current.contains(e.target as Node)) closePicker();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, [pickerOpen]);

  async function onAddFolder(folderId: string) {
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

  // cover actions
  async function setAsCover(publicId: string) {
    try {
      await postJSON(`/api/albums/${encodeURIComponent(albumId)}/cover`, { publicId });
      setCoverPublicId(publicId);
    } catch (e: any) {
      alert(e?.message || "Impossible de définir la couverture");
    }
  }
  async function clearCover() {
    try {
      await delJSON(`/api/albums/${encodeURIComponent(albumId)}/cover`);
      setCoverPublicId(null);
    } catch (e: any) {
      alert(e?.message || "Impossible de retirer la couverture");
    }
  }

  const title = album?.name || "Album";
  const sortedFolders = useMemo(() => [...folders].sort((a, b) => a.name.localeCompare(b.name, "fr")), [folders]);

  const filteredPicker = useMemo(() => {
    const s = q.trim().toLowerCase();
    const current = new Set(folders.map((f) => f.id));
    return allFolders
      .filter((f) => !current.has(f.id))
      .filter((f) => !s || f.name.toLowerCase().includes(s));
  }, [q, allFolders, folders]);

  return (
    <main className="px-4 py-20 text-white">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/albums" className="text-white/80 hover:underline">← Retour aux albums</Link>
        {coverPublicId && (
          <button onClick={clearCover} className="rounded bg-white/10 px-3 py-1 text-sm hover:bg-white/20">
            Retirer la couverture
          </button>
        )}
      </div>

      <header className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <button onClick={openPicker} className="rounded bg-emerald-400 px-3 py-1.5 text-sm text-black hover:bg-emerald-300">
          Ajouter un dossier de la galerie
        </button>
      </header>

      {err && <p className="mb-3 text-red-300">⚠️ {err}</p>}
      {loading && <p className="mb-6 text-white/70">Chargement…</p>}

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">Dossiers de cet album</h2>
        {!sortedFolders.length ? (
          <p className="text-white/70">Aucun dossier.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {sortedFolders.map((f) => (
              <li key={f.id} className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-sm">
                <span className="truncate max-w-[30ch]">{f.name}</span>
                <Link
                  prefetch={false}
                  href={`/galerie?tab=all&view=folder&folderId=${encodeURIComponent(f.id)}`}
                  className="rounded-full border border-white/20 px-2 py-0.5 hover:bg-white/10"
                >
                  Ouvrir
                </Link>
                <button
                  onClick={() => onRemoveFolder(f.id)}
                  className="rounded-full border border-red-400/40 px-2 py-0.5 text-red-300 hover:bg-red-500/10"
                >
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mb-3 flex items-center gap-3">
        <button onClick={() => refresh()} className="rounded border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10">
          Rafraîchir
        </button>
        <label className="text-sm text-white/80">
          Limite photos&nbsp;
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}
                  className="rounded bg-black/30 border border-white/20 px-2 py-1">
            <option value={60}>60</option>
            <option value={120}>120</option>
            <option value={240}>240</option>
            <option value={500}>500</option>
          </select>
        </label>
      </div>

      {/* Mur de médias (cliquables + bouton couverture) */}
      <section>
        {!photos.length ? (
          <p className="text-white/70">Pas de média.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {photos.map((m) => {
              const src = m.thumb || m.url || "";
              const isCover = coverPublicId && m.public_id === coverPublicId;
              return (
                <figure key={m.public_id} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-black/30">
                  {src ? (
                    <Image src={src} alt={m.public_id} width={800} height={600} className="h-full w-full object-cover" unoptimized />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-white/70">📄</div>
                  )}

                  {/* ruban "Couverture" */}
                  {isCover && (
                    <span className="absolute left-2 top-2 rounded bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-black">
                      Couverture
                    </span>
                  )}

                  {/* actions */}
                  <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-2
                                  bg-gradient-to-t from-black/60 via-black/30 to-transparent">
                    <a href={m.url || src} target="_blank" rel="noopener noreferrer"
                       className="rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20">Ouvrir</a>

                    {!isCover ? (
                      <button onClick={() => setAsCover(m.public_id)}
                              className="rounded bg-emerald-400 px-2 py-1 text-xs text-black hover:bg-emerald-300">
                        Définir comme couverture
                      </button>
                    ) : (
                      <button onClick={clearCover}
                              className="rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20">
                        Retirer la couverture
                      </button>
                    )}
                  </div>
                </figure>
              );
            })}
          </div>
        )}
      </section>

      {/* Drawer d’ajout de dossier */}
      {pickerOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/60" />
          <div ref={drawerRef} className="absolute right-0 top-0 h-full w-[92vw] max-w-[560px] bg-neutral-900 shadow-xl border-l border-white/10 flex flex-col">
            <div className="flex items-center gap-2 border-b border-white/10 px-3 py-3">
              <div className="font-semibold">Ajouter un dossier de la galerie</div>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={refreshPickerList} className="rounded border border-white/20 px-2 py-1 text-sm hover:bg-white/10">
                  Rafraîchir
                </button>
                <button onClick={closePicker} className="rounded bg-white/90 px-2 py-1 text-sm text-black hover:bg-white">
                  Fermer
                </button>
              </div>
            </div>

            <div className="p-3">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un dossier (ex: Papa/2025 …)"
                     className="w-full rounded border border-white/20 bg-black/40 px-3 py-2 text-white"/>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
              {!filteredPicker.length ? (
                <div className="rounded border border-white/10 bg-white/5 p-3 text-white/70">Aucun dossier correspondant.</div>
              ) : (
                filteredPicker.map((f) => (
                  <div key={f.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <div className="truncate">{f.name}</div>
                    <button onClick={() => onAddFolder(f.id)}
                            className="rounded bg-emerald-400 px-2 py-1 text-sm text-black hover:bg-emerald-300">
                      Ajouter
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
