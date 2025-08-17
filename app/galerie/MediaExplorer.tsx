// app/galerie/MediaExplorer.tsx
"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

type Kind = "image" | "video" | "document" | "audio";
type Tab = "all" | "images" | "videos" | "audio" | "documents";
type Item = {
  id: string;
  public_id: string;
  title?: string;
  url: string;
  thumb?: string;
  format?: string;
  resource_type: "image" | "video" | "raw";
  folder?: string;
  createdAt: string;
};

const AUDIO_EXTS = new Set(["mp3","wav","m4a","aac","flac","ogg","oga","wma","aiff"]);
const OFFICE_EXTS = new Set(["doc","docx","xls","xlsx","ppt","pptx"]);
const officeViewer = (src: string) =>
  `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(src)}`;

function kindOf(i: Item): Kind {
  if (i.resource_type === "image") return i.format === "pdf" ? "document" : "image";
  if (i.resource_type === "video") return AUDIO_EXTS.has((i.format || "").toLowerCase()) ? "audio" : "video";
  return "document";
}
function labelOfTab(t: Tab) {
  return t === "all" ? "Tout" : t === "images" ? "Photos" : t === "videos" ? "Vidéos" : t === "audio" ? "Audio" : "Documents";
}

export default function MediaExplorer() {
  const [tab, setTab] = useState<Tab>(() => {
    if (typeof window === "undefined") return "all";
    const s = new URLSearchParams(window.location.search);
    const t = (s.get("tab") || "all").toLowerCase() as Tab;
    return (["all","images","videos","audio","documents"] as const).includes(t) ? t : "all";
  });
  const [items, setItems] = useState<Item[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  // garder l’onglet dans l’URL
  useEffect(() => {
    const u = new URL(window.location.href);
    u.searchParams.set("tab", tab);
    history.replaceState(null, "", u.toString());
  }, [tab]);

  const fetchPage = useCallback(async (next?: string) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const url = new URL("/api/media/list", window.location.origin);
      url.searchParams.set("tab", tab);
      if (next) url.searchParams.set("cursor", next);
      url.searchParams.set("ts", String(Date.now())); // anti-cache
      const r = await fetch(url.toString(), { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
      const list: Item[] = Array.isArray(j?.items) ? j.items : [];
      setItems((prev) => (next ? [...prev, ...list] : list));
      setCursor(j?.nextCursor || null);
    } catch (e: any) {
      setErrorMsg(e?.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { fetchPage(); }, [fetchPage]);

  const visible = useMemo(() => items, [items]);

  function openPreview(item: Item) {
    const ext = (item.format || "").toLowerCase();
    const isOffice = OFFICE_EXTS.has(ext);
    const src = isOffice ? officeViewer(item.url) : item.url; // PDF ⇒ direct
    setPreviewSrc(src);
    setPreviewTitle(item.title || item.public_id);
    setPreviewOpen(true);
  }

  return (
    <section className="px-6 py-6 text-white">
      <h1 className="text-3xl font-bold mb-2">Galerie</h1>
      <p className="mb-4 text-white/80">Photos, vidéos et documents du dossier Cloudinary <code>famille</code>.</p>

      {errorMsg && <p className="mb-3 text-sm text-red-300">⚠️ {errorMsg}</p>}

      <div className="mb-4 inline-flex rounded-full border border-white/20 bg-black/30 p-1 gap-2">
        {(["all","images","videos","audio","documents"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full ${tab === t ? "bg-white/20" : "hover:bg-white/10"}`}>
            {labelOfTab(t)}
          </button>
        ))}
      </div>

      {loading && !visible.length ? (
        <p className="text-white/70">Chargement…</p>
      ) : !visible.length ? (
        <p className="text-white/80">Aucun élément.</p>
      ) : (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          {visible.map((m) => {
            const k = kindOf(m);
            const ext = (m.format || "").toLowerCase();
            const isOffice = OFFICE_EXTS.has(ext);
            return (
              <article key={m.id} className="relative overflow-hidden rounded-lg border border-white/20 bg-white/5">
                <div className="aspect-video bg-black/30">
                  {k === "image" ? (
                    <Image src={m.thumb ?? m.url} alt={m.title || ""} width={800} height={600} className="w-full h-full object-cover" unoptimized />
                  ) : k === "video" ? (
                    <video src={m.url} className="w-full h-full object-cover" preload="metadata" controls />
                  ) : k === "audio" ? (
                    <div className="w-full h-full grid place-items-center p-3">
                      <div className="text-lg">🎵 {m.title || m.public_id}</div>
                      <audio className="mt-2 w-[95%]" src={m.url} controls preload="none" />
                    </div>
                  ) : (
                    <div className="w-full h-full grid place-items-center p-3">
                      <div className="text-base sm:text-lg">📄 {m.title || m.public_id}{ext ? `.${ext}` : ""}</div>
                    </div>
                  )}
                </div>

                <div className="p-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium line-clamp-2">{m.title || m.public_id}</div>
                    <div className="text-xs text-white/70">{new Date(m.createdAt).toLocaleString("fr-FR")}</div>
                  </div>

                  {k === "document" && (
                    <div className="flex gap-2">
                      <button onClick={() => openPreview(m)} className="text-sm underline hover:opacity-80">
                        Aperçu
                      </button>
                      {isOffice && (
                        <a className="text-sm underline hover:opacity-80" href={officeViewer(m.url)} target="_blank" rel="noopener noreferrer">
                          Ouvrir dans Office
                        </a>
                      )}
                      <a className="text-sm underline hover:opacity-80" href={m.url} target="_blank" rel="noopener noreferrer">
                        Télécharger
                      </a>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        {cursor && (
          <button onClick={() => fetchPage(cursor)} disabled={loading}
            className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 hover:bg-white/20">
            {loading ? "Chargement…" : "Charger plus"}
          </button>
        )}
      </div>

      {/* Modale d’aperçu (Office/PDF) */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewOpen(false)}>
          <div className="relative w-full max-w-5xl h-[85vh] bg-black/40 border border-white/20 rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between">
              <div className="px-2 py-1 rounded bg-black/50 text-sm truncate">{previewTitle}</div>
              <button onClick={() => setPreviewOpen(false)} className="px-3 py-1 rounded bg-black/60 hover:bg-black/80 border border-white/30">✕</button>
            </div>
            <iframe src={previewSrc} className="w-full h-full bg-white" title={previewTitle} />
          </div>
        </div>
      )}
    </section>
  );
}
