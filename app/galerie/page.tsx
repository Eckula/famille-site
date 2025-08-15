// app/galerie/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ------------------ Types ------------------ */

type Kind = "image" | "video" | "document";

type Item = {
  id: string;
  public_id: string;
  kind: Kind;
  title: string;
  url: string;
  thumb?: string;
  createdAt: string;
  format?: string;
  folder?: string;
  resource_type?: "image" | "video" | "raw";
};

type Tab = "all" | "images" | "videos" | "documents";

/* ------------------ Helpers ------------------ */

const isYouTube = (url: string) => /youtu\.be|youtube\.com/.test(url);

function getTabFromUrl(): Tab {
  if (typeof window === "undefined") return "all";
  const t = (new URLSearchParams(window.location.search).get("tab") || "all").toLowerCase();
  return (["all", "images", "videos", "documents"] as const).includes(t as Tab) ? (t as Tab) : "all";
}

function docEmoji(ext?: string) {
  const e = (ext || "").toLowerCase();
  if (["pdf"].includes(e)) return "📄";
  if (["doc", "docx"].includes(e)) return "📝";
  if (["xls", "xlsx", "csv"].includes(e)) return "📊";
  if (["ppt", "pptx"].includes(e)) return "📽️";
  if (["mp3", "wav", "aac", "m4a", "flac", "ogg", "oga"].includes(e)) return "🎵";
  if (["zip", "rar", "7z", "tar", "gz"].includes(e)) return "🗜️";
  return "📎";
}

function sanitizeName(name: string) {
  return name.replace(/[^\w.\-\sÀ-ÖØ-öø-ÿ]/g, "_");
}

/** Lien vers le proxy file (permet d’ouvrir / télécharger en prod Cloudinary) */
function fileProxyHref(public_id: string, format?: string, dl = false, filename?: string) {
  const u = new URL("/api/media/file", typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  u.searchParams.set("public_id", public_id);
  if (format) u.searchParams.set("format", format.replace(/^\./, ""));
  if (dl) u.searchParams.set("dl", "1");
  if (filename) u.searchParams.set("filename", filename);
  return u.toString();
}

/* ------------------ Page ------------------ */

export default function GaleriePage() {
  const [raw, setRaw] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  // Lightbox (images + vidéos)
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);
  const swipeStartX = useRef<number | null>(null);

  /* ---------- FETCH & NORMALISATION ROBUSTE ---------- */

  const fetchList = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const r = await fetch("/api/media/list", { cache: "no-store" });
      if (!r.ok) {
        setRaw([]);
        setErrorMsg(`/api/media/list a répondu ${r.status}`);
        return;
      }
      const j = await r.json();

      // On accepte plusieurs formes: {items}, {resources}, array
      const src: any[] = Array.isArray(j?.items)
        ? j.items
        : Array.isArray(j?.resources)
        ? j.resources
        : Array.isArray(j)
        ? j
        : [];

      const list: Item[] = src.map((x: any) => {
        const public_id: string = x.public_id || x?.asset_id || "";
        const title =
          x.title ||
          x.original_filename ||
          (public_id ? public_id.split("/").pop() : "") ||
          "";

        // URL principale (si absente on passe par le proxy pour garantir l’ouverture)
        const primaryUrl: string =
          x.url ||
          x.secure_url ||
          x.path ||
          fileProxyHref(public_id, x.format);

        // Format / extension
        const fmt =
          (x.format || "") ||
          (typeof primaryUrl === "string" && primaryUrl.includes(".")
            ? primaryUrl.split(".").pop()?.toLowerCase()
            : "");

        // Détection kind (resource_type + extension)
        const rt = (x.resource_type || "").toLowerCase();
        const ext = String(fmt || "").toLowerCase();
        const isImgRt = rt === "image";
        const isVidRt = rt === "video";
        const isImgExt = ["jpg", "jpeg", "png", "gif", "webp", "heic", "heif", "avif", "bmp", "tiff", "svg"].includes(ext);
        const isVidExt = ["mp4", "mov", "webm", "mkv", "avi", "m4v"].includes(ext);
        const kind: Kind = isImgRt || isImgExt ? "image" : isVidRt || isVidExt ? "video" : "document";

        const createdAt =
          x.createdAt ||
          x.created_at ||
          x.uploaded_at ||
          new Date().toISOString();

        return {
          id: x.id || x.asset_id || public_id || crypto.randomUUID(),
          public_id,
          kind,
          title,
          url: primaryUrl,
          thumb: x.thumb || x.thumbnail_url || x.secure_url || primaryUrl,
          createdAt,
          format: ext || undefined,
          folder: x.folder || (public_id ? public_id.split("/").slice(0, -1).join("/") : ""),
          resource_type: (x.resource_type || "").toLowerCase(),
        } as Item;
      });

      setRaw(list);

      if (!list.length) {
        const errTxt = j?.error || j?.message || "";
        if (errTxt) setErrorMsg(String(errTxt));
      }
    } catch (e: any) {
      setRaw([]);
      setErrorMsg(e?.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTab(getTabFromUrl());
    fetchList();
  }, [fetchList]);

  /* ---------- Filtres / Tri ---------- */

  const items = useMemo(() => {
    let data = [...raw];
    if (tab === "images") data = data.filter((x) => x.kind === "image");
    if (tab === "videos") data = data.filter((x) => x.kind === "video");
    if (tab === "documents") data = data.filter((x) => x.kind === "document");

    const q = query.trim().toLowerCase();
    if (q) data = data.filter((x) => (x.title || "").toLowerCase().includes(q));

    data.sort((a, b) =>
      sort === "newest"
        ? +new Date(b.createdAt) - +new Date(a.createdAt)
        : +new Date(a.createdAt) - +new Date(b.createdAt)
    );
    return data;
  }, [raw, tab, query, sort]);

  const playable = useMemo(() => items.filter((x) => x.kind !== "document"), [items]);

  /* ---------- Lightbox ---------- */

  const openLightboxFor = (id: string) => {
    const idx = playable.findIndex((x) => x.id === id);
    if (idx >= 0) {
      setLbIndex(idx);
      setLbOpen(true);
    }
  };

  useEffect(() => {
    if (!lbOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLbOpen(false);
      if (e.key === "ArrowLeft") setLbIndex((i) => (i - 1 + playable.length) % playable.length);
      if (e.key === "ArrowRight") setLbIndex((i) => (i + 1) % playable.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lbOpen, playable.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (swipeStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx > 0) setLbIndex((i) => (i - 1 + playable.length) % playable.length);
    else setLbIndex((i) => (i + 1) % playable.length);
  };

  /* ---------- Rendu ---------- */

  return (
    <main className="px-6 py-24 text-white">
      <h1 className="text-3xl font-bold mb-2">Galerie</h1>
      <p className="mb-2 text-white/80">Photos, vidéos et documents.</p>
      {errorMsg && <p className="mt-2 mb-4 text-red-300 text-sm">⚠️ {errorMsg}</p>}

      {/* Filtres haut */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-full border border-white/20 bg-black/30 p-1 gap-2">
          {(["all", "images", "videos", "documents"] as const).map((k) => (
            <Link
              key={k}
              prefetch={false}
              href={`/galerie?tab=${k}`}
              onClick={() => setTab(k)}
              className={`px-4 py-2 rounded-full ${tab === k ? "bg-white/20" : "hover:bg-white/10"}`}
            >
              {k === "all" ? "Tout" : k === "images" ? "Photos" : k === "videos" ? "Vidéos" : "Documents"}
            </Link>
          ))}
        </div>

        {/* Recherche + tri + actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par titre…"
            className="w-full sm:w-72 rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-300/60"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none"
          >
            <option value="newest">Plus récents</option>
            <option value="oldest">Plus anciens</option>
          </select>
          <button onClick={fetchList} disabled={loading} className="rounded-lg border border-white/20 bg-black/30 px-3 py-2">
            {loading ? "Chargement…" : "Rafraîchir"}
          </button>
        </div>
      </div>

      {/* Grille */}
      {loading ? (
        <p className="text-white/70 mt-6">Chargement…</p>
      ) : items.length === 0 ? (
        <div className="text-white/80 mt-6">
          <p>Aucun élément.</p>
          <p className="text-white/50 text-sm">Vérifie aussi /api/media/list directement dans le navigateur.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 mt-4">
          {items.map((m) => {
            const isImg = m.kind === "image";
            const isVid = m.kind === "video";
            const isDoc = m.kind === "document";
            const fileName = sanitizeName(m.title || m.public_id.split("/").pop() || "fichier");

            return (
              <div key={m.id} className="relative overflow-hidden rounded-lg border border-white/20 group">
                <div className="aspect-video bg-black/30">
                  {isImg ? (
                    <Image
                      src={m.thumb ?? m.url}
                      alt={m.title}
                      width={800}
                      height={600}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
                      onClick={() => openLightboxFor(m.id)}
                      unoptimized
                    />
                  ) : isVid ? (
                    isYouTube(m.url) ? (
                      <iframe
                        src={m.url.replace("watch?v=", "embed/")}
                        className="w-full h-full"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={m.url}
                        className="w-full h-full object-cover cursor-zoom-in"
                        preload="metadata"
                        muted
                        playsInline
                        onClick={() => openLightboxFor(m.id)}
                      />
                    )
                  ) : isDoc ? (
                    <a
                      href={fileProxyHref(m.public_id, m.format, false, fileName)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-full grid place-items-center bg-white/5 text-white/90"
                      title="Ouvrir"
                    >
                      <div className="text-base sm:text-lg">
                        {docEmoji(m.format)} {m.title}
                        {m.format ? `.${m.format}` : ""}
                      </div>
                    </a>
                  ) : null}
                </div>
                <div className="px-2 py-1 text-xs text-white/80 truncate">{m.title}</div>
                {isDoc && (
                  <div className="absolute top-2 right-2">
                    <a
                      href={fileProxyHref(m.public_id, m.format, true, fileName)}
                      className="rounded bg-white/80 text-black px-2 py-1 text-xs hover:bg-white"
                      title="Télécharger"
                    >
                      Télécharger
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox simple (images + vidéos fichiers) */}
      {lbOpen && playable.length > 0 && (
        <div
          className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4"
          onClick={() => setLbOpen(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative max-w-6xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              <div className="rounded-full bg-black/60 px-3 py-1 text-sm">
                {lbIndex + 1} / {playable.length}
              </div>
              {/* Télécharger l’élément ouvert via proxy aussi si besoin */}
              <a
                href={fileProxyHref(playable[lbIndex].public_id, playable[lbIndex].format, true, playable[lbIndex].title)}
                className="rounded bg-white/80 text-black px-3 py-1 text-sm hover:bg-white"
              >
                Télécharger
              </a>
            </div>
            <button
              onClick={() => setLbOpen(false)}
              className="absolute top-2 left-2 z-10 rounded-full border border-white/30 px-3 py-1 bg-black/40"
            >
              ✕
            </button>
            <button
              onClick={() => setLbIndex((i) => (i - 1 + playable.length) % playable.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-black/60 hover:bg-black/80 grid place-items-center text-2xl"
            >
              ←
            </button>
            <button
              onClick={() => setLbIndex((i) => (i + 1) % playable.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-black/60 hover:bg-black/80 grid place-items-center text-2xl"
            >
              →
            </button>

            <div className="bg-black/40 rounded-lg overflow-hidden border border-white/20">
              {(() => {
                const cur = playable[lbIndex];
                if (cur.kind === "image") {
                  return (
                    <Image
                      src={cur.url}
                      alt={cur.title}
                      width={1200}
                      height={800}
                      className="max-h-[80vh] w-full object-contain"
                      unoptimized
                    />
                  );
                }
                if (isYouTube(cur.url)) {
                  return (
                    <iframe
                      src={cur.url.replace("watch?v=", "embed/")}
                      className="w-full h-[80vh]"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  );
                }
                return <video src={cur.url} className="max-h-[80vh] w-full object-contain" controls autoPlay playsInline />;
              })()}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
