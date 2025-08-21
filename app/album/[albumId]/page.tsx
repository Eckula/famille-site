// app/album/[albumId]/page.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

type Folder = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
};
type Member = { folderId: string; createdAt?: string };
type Photo = {
  public_id: string;
  title?: string;
  url: string;
  thumb?: string;
  kind?: "image" | "video" | "audio" | "document";
  createdAt?: string;
};

async function getJSON<T>(url: string): Promise<T> {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export default function AlbumPage() {
  // ✅ Next 15 client side: read dynamic segment with useParams()
  const { albumId } = useParams<{ albumId: string }>() ?? { albumId: "" };

  const [album, setAlbum] = useState<Folder | null>(null);
  const [members, setMembers] = useState<Folder[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ---- Folder Picker (modal) ----
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerErr, setPickerErr] = useState("");
  const [allFolders, setAllFolders] = useState<Folder[]>([]);
  const [search, setSearch] = useState("");

  const filteredFolders = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = allFolders;
    if (q) list = list.filter((f) => f.name.toLowerCase().includes(q));
    // évite de proposer les dossiers système
    return list.filter(
      (f) =>
        !["Albums", "Événements", "Evenements", "Documents"].includes(
          f.name.trim()
        )
    );
  }, [allFolders, search]);

  const loadAlbum = useCallback(async () => {
    if (!albumId) return;
    setLoading(true);
    setErr("");
    try {
      // 1) métadonnées de l'album
      const a = await getJSON<{ item: Folder | null }>(
        `/api/folders?id=${encodeURIComponent(albumId)}`
      );
      setAlbum(a.item ?? null);

      // 2) membres
      const m = await getJSON<{ items: Folder[] }>(
        `/api/albums/${encodeURIComponent(albumId)}/members`
      );
      setMembers(Array.isArray(m.items) ? m.items : []);

      // 3) photos (une petite sélection pour la page)
      const p = await getJSON<{ items: Photo[] }>(
        `/api/albums/${encodeURIComponent(albumId)}/photos?limit=60`
      );
      setPhotos(Array.isArray(p.items) ? p.items : []);
    } catch (e: any) {
      setErr(e?.message || "Erreur chargement album");
    } finally {
      setLoading(false);
    }
  }, [albumId]);

  useEffect(() => {
    loadAlbum();
  }, [loadAlbum]);

  // ---- Picker helpers ----
  const openPicker = async () => {
    setPickerOpen(true);
    if (allFolders.length) return; // déjà chargé
    setPickerLoading(true);
    setPickerErr("");
    try {
      // Liste 300 derniers dossiers (suffisant et rapide)
      const j = await getJSON<{ items: Folder[] }>(`/api/folders?recent=300`);
      setAllFolders(Array.isArray(j.items) ? j.items : []);
    } catch (e: any) {
      setPickerErr(e?.message || "Impossible de charger les dossiers.");
    } finally {
      setPickerLoading(false);
    }
  };

  const addFolderToAlbum = async (folderId: string) => {
    try {
      const r = await fetch(`/api/albums/${albumId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });
      const j = await r.json();
      if (!r.ok || j?.error) throw new Error(j?.error || `HTTP ${r.status}`);
      setPickerOpen(false);
      await loadAlbum();
    } catch (e: any) {
      alert(e?.message || "Ajout impossible.");
    }
  };

  const removeFolderFromAlbum = async (folderId: string) => {
    if (!confirm("Retirer ce dossier de l’album ?")) return;
    try {
      const r = await fetch(
        `/api/albums/${albumId}/members?folderId=${encodeURIComponent(folderId)}`,
        { method: "DELETE" }
      );
      const j = await r.json();
      if (!r.ok || j?.error) throw new Error(j?.error || `HTTP ${r.status}`);
      await loadAlbum();
    } catch (e: any) {
      alert(e?.message || "Suppression impossible.");
    }
  };

  const title = album?.name || "Album";

  return (
    <main className="px-6 py-20 text-white">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/albums"
            prefetch={false}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white"
          >
            ← Retour aux albums
          </Link>
          <h1 className="mt-2 text-3xl font-bold">{title}</h1>
          <p className="text-white/70">
            {members.length} dossier{members.length > 1 ? "s" : ""} •{" "}
            {photos.length} média{photos.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openPicker}
            className="rounded bg-emerald-400 px-3 py-2 text-black hover:bg-emerald-300"
          >
            + Ajouter un dossier
          </button>
          <Link
            prefetch={false}
            href={`/galerie?tab=all&view=folder&folderId=${encodeURIComponent(
              albumId || ""
            )}`}
            className="rounded border border-white/30 px-3 py-2 hover:bg-white/10"
          >
            Voir dans la galerie
          </Link>
        </div>
      </div>

      {/* Erreurs / états */}
      {err && <p className="mb-3 text-red-300">⚠️ {err}</p>}
      {loading && <p className="text-white/70">Chargement…</p>}

      {/* Photos */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold">Photos</h2>
        {photos.length === 0 ? (
          <div className="rounded-lg border border-white/20 p-6 text-white/70">
            Pas de média.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {photos.map((p) => (
              <div
                key={p.public_id}
                className="group relative overflow-hidden rounded-lg bg-white/5"
                title={p.title || p.public_id}
              >
                {p.thumb ? (
                  <Image
                    src={p.thumb}
                    alt={p.title || p.public_id}
                    width={600}
                    height={400}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <div className="grid h-32 place-items-center text-white/60">
                    {p.title || p.public_id}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Dossiers membres */}
      <section>
        <h2 className="mb-3 text-xl font-semibold">Dossiers dans l’album</h2>
        {members.length === 0 ? (
          <div className="rounded-lg border border-white/20 p-6 text-white/70">
            Aucun dossier membre.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-lg border border-white/20 bg-white/5 p-3"
              >
                <div className="min-w-0 pr-3">
                  <div className="truncate font-medium">{f.name}</div>
                  <div className="text-xs text-white/60">
                    {new Date(f.createdAt).toLocaleDateString("fr-FR")}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/galerie?tab=all&view=folder&folderId=${encodeURIComponent(
                      f.id
                    )}`}
                    prefetch={false}
                    className="rounded border border-white/30 px-2 py-1 text-sm hover:bg-white/10"
                  >
                    Ouvrir
                  </Link>
                  <button
                    onClick={() => removeFolderFromAlbum(f.id)}
                    className="rounded border border-red-300/60 px-2 py-1 text-sm text-red-200 hover:bg-red-400/10"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal: sélecteur de dossier */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/20 bg-neutral-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Ajouter un dossier</h3>
              <button
                onClick={() => setPickerOpen(false)}
                className="rounded px-2 py-1 text-white/70 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="mb-3 flex items-center gap-2">
              <input
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded border border-white/25 bg-black/30 px-3 py-2"
              />
              <button
                onClick={() => {
                  setAllFolders([]);
                  setSearch("");
                  openPicker();
                }}
                className="rounded border border-white/30 px-3 py-2 hover:bg-white/10"
                title="Rafraîchir"
              >
                ↻
              </button>
            </div>

            {pickerErr && (
              <p className="mb-3 text-sm text-red-300">⚠️ {pickerErr}</p>
            )}
            {pickerLoading ? (
              <div className="p-6 text-white/70">Chargement…</div>
            ) : filteredFolders.length === 0 ? (
              <div className="p-6 text-white/70">Aucun dossier.</div>
            ) : (
              <div className="max-h-[50vh] overflow-auto rounded border border-white/10">
                <ul className="divide-y divide-white/10">
                  {filteredFolders.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center justify-between p-3 hover:bg-white/5"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="truncate">{f.name}</div>
                        <div className="text-xs text-white/50">
                          {new Date(f.createdAt).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                      <button
                        onClick={() => addFolderToAlbum(f.id)}
                        className="shrink-0 rounded bg-emerald-400 px-3 py-1 text-sm text-black hover:bg-emerald-300"
                      >
                        Ajouter
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setPickerOpen(false)}
                className="rounded border border-white/30 px-3 py-2 hover:bg-white/10"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
