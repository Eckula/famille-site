// app/galerie/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ---------- PDF.js v5 ----------
import { GlobalWorkerOptions, getDocument, PDFDocumentProxy } from "pdfjs-dist";
GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.54/build/pdf.worker.min.js";

// ---------- Types ----------
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
};
type Tab = "all" | "images" | "videos" | "documents";

// ---------- Helpers ----------
function extFromItem(it: Item) {
  if (it.format) return it.format.toLowerCase();
  try {
    const p = new URL(it.url).pathname.toLowerCase();
    const m = p.match(/\.([a-z0-9]+)(?:\?|$)/i);
    return m ? m[1] : "";
  } catch { return ""; }
}
const OFFICE_EXTS = new Set(["doc", "docx", "xls", "xlsx", "ppt", "pptx"]);
const AUDIO_EXTS  = new Set(["mp3", "wav", "m4a", "aac", "flac", "ogg", "oga"]);
const TEXT_EXTS   = new Set(["txt", "csv", "json", "log", "md"]);

function withTransformation(url: string, tr: string) {
  const i = url.indexOf("/upload/");
  if (i === -1) return url;
  const head = url.slice(0, i + "/upload/".length);
  const tail = url.slice(i + "/upload/".length);
  return `${head}${tr}/${tail}`;
}
function toDownloadUrl(item: Item) {
  return withTransformation(item.url, "fl_attachment");
}
function officeViewerUrl(url: string) {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
}
function isYouTube(url: string) {
  return /youtu\.be|youtube\.com/.test(url);
}
function isLegacyPdfNeedingRaw(it: Item) {
  return it.kind === "document" && extFromItem(it) === "pdf" && it.url.includes("/image/upload/");
}
const docEmoji = (ext?: string) => {
  const e = (ext || "").toLowerCase();
  if (e === "pdf") return "📄";
  if (["doc","docx"].includes(e)) return "📝";
  if (["xls","xlsx","csv"].includes(e)) return "📊";
  if (["ppt","pptx"].includes(e)) return "📽️";
  if (AUDIO_EXTS.has(e)) return "🎵";
  if (["zip","rar","7z","tar","gz"].includes(e)) return "🗜️";
  return "📎";
};
const folderOf = (it: Item) =>
  (it.folder && it.folder.length > 0)
    ? it.folder.replace(/\/+$/,"")
    : it.public_id.split("/").slice(0, -1).join("/").replace(/\/+$/,"");
function getTabFromUrl(): Tab {
  if (typeof window === "undefined") return "all";
  const sp = new URLSearchParams(window.location.search);
  const t = (sp.get("tab") || "all").toLowerCase();
  return (["all","images","videos","documents"].includes(t) ? (t as Tab) : "all");
}

// ---------- Viewer PDF local (pdf.js) ----------
function PdfInline({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);

  const [numPages, setNumPages] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.15);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const ac = new AbortController();

    (async () => {
      setErr(null); setNumPages(0); setPage(1); pdfRef.current = null;

      // Essai direct puis fallback fl_attachment
      const candidates = [url, withTransformation(url, "fl_attachment")];

      let buf: ArrayBuffer | null = null;
      let lastErr: any = null;
      for (const u of candidates) {
        try {
          const resp = await fetch(u, { signal: ac.signal });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          buf = await resp.arrayBuffer();
          break;
        } catch (e) { lastErr = e; }
      }
      if (!buf) throw lastErr || new Error("fetch failed");

      const pdf = await getDocument({ data: buf }).promise;
      if (cancelled) return;
      pdfRef.current = pdf;
      setNumPages(pdf.numPages);
    })().catch((e) => {
      console.error("pdf.js load error:", e);
      if (!cancelled) setErr("Impossible d'afficher le PDF (pdf.js).");
    });

    return () => { cancelled = true; ac.abort(); };
  }, [url]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdf = pdfRef.current;
        const canvas = canvasRef.current;
        if (!pdf || !canvas) return;
        const p = Math.min(Math.max(1, page), pdf.numPages);
        const pg = await pdf.getPage(p);
        const viewport = pg.getViewport({ scale });
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        // ✅ pdfjs v5: 'canvas' est requis dans RenderParameters
        // @ts-expect-error (types stricts variables selon sous-versions)
        await pg.render({ canvasContext: ctx, viewport, canvas }).promise;
      } catch (e) {
        if (!cancelled) console.warn("pdf.js render warn:", e);
      }
    })();
    return () => { cancelled = true; };
  }, [page, scale]);

  return (
    <div className="w-full h-[80vh] bg-black/20 flex flex-col items-center justify-start">
      <div className="w-full flex items-center justify-center gap-3 p-2 bg-black/40 text-white text-sm">
        <button type="button" onClick={()=>setScale(s=>Math.max(0.5, s-0.1))} className="px-2 py-1 rounded border border-white/30">-</button>
        <div>Zoom {(scale*100).toFixed(0)}%</div>
        <button type="button" onClick={()=>setScale(s=>Math.min(3, s+0.1))} className="px-2 py-1 rounded border border-white/30">+</button>
        <div className="mx-3">|</div>
        <button type="button" onClick={()=>setPage(p=>Math.max(1, p-1))} className="px-2 py-1 rounded border border-white/30">←</button>
        <div>Page {Math.min(page, numPages || 1)} / {numPages || "…"}</div>
        <button type="button" onClick={()=>setPage(p=>Math.min(numPages||1, p+1))} className="px-2 py-1 rounded border border-white/30">→</button>
      </div>

      {err ? (
        <div className="flex-1 grid place-items-center text-white/80 p-6">{err}</div>
      ) : (
        <div className="flex-1 overflow-auto w-full grid place-items-center p-3">
          <canvas ref={canvasRef} style={{ background: "white", maxWidth: "100%", height: "auto" }} />
        </div>
      )}
    </div>
  );
}

// ---------- Page ----------
export default function GaleriePage() {
  const [raw, setRaw] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest"|"oldest">("newest");

  const [selectedPublicIds, setSelectedPublicIds] = useState<Set<string>>(new Set());
  const toggleSel = (publicId: string) =>
    setSelectedPublicIds(s => (s.has(publicId) ? new Set([...s].filter(x=>x!==publicId)) : new Set(s).add(publicId)));
  const clearSel = () => setSelectedPublicIds(new Set());
  const [moveFolder, setMoveFolder] = useState("famille/Photos");

  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);
  const [migrating, setMigrating] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/media/list", { cache: "no-store" });
      const j = await r.json();
      setRaw(j.items ?? []);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { setTab(getTabFromUrl()); fetchList(); }, [fetchList]);

  const items = useMemo(() => {
    let data = [...raw];
    if (tab==="images") data = data.filter(x=>x.kind==="image");
    if (tab==="videos") data = data.filter(x=>x.kind==="video");
    if (tab==="documents") data = data.filter(x=>x.kind==="document");
    const q = query.trim().toLowerCase();
    if (q) data = data.filter(x => x.title.toLowerCase().includes(q));
    data.sort((a,b)=>
      sort==="newest"
        ? +new Date(b.createdAt) - +new Date(a.createdAt)
        : +new Date(a.createdAt) - +new Date(b.createdAt)
    );
    return data;
  }, [raw, tab, query, sort]);

  const viewList = items;

  const openLightboxFor = (id: string) => {
    const idx = viewList.findIndex(x=>x.id===id);
    if (idx>=0) { setLbIndex(idx); setLbOpen(true); }
  };

  async function doDelete() {
    if (selectedPublicIds.size===0) return;
    if (!confirm(`Supprimer ${selectedPublicIds.size} élément(s) ?`)) return;
    const payload = { ids: Array.from(selectedPublicIds), public_ids: Array.from(selectedPublicIds) };
    const res = await fetch("/api/media/delete", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });
    const j = await res.json();
    if (!res.ok) alert(j?.error || "Erreur suppression.");
    clearSel(); fetchList();
  }

  async function doMove() {
    if (selectedPublicIds.size===0) return;
    const target = moveFolder.trim().replace(/\/+$/,"");
    if (!target) { alert("Renseigne un dossier cible"); return; }

    const selectedItems = items.filter(i => selectedPublicIds.has(i.public_id));
    const already = selectedItems.filter(i => folderOf(i) === target);
    const toMovePublicIds = selectedItems.filter(i => folderOf(i) !== target).map(i => i.public_id);

    if (already.length && !toMovePublicIds.length) {
      alert("Les éléments sélectionnés sont déjà dans ce dossier.");
      return;
    }
    if (!toMovePublicIds.length) return;

    const payload = { ids: toMovePublicIds, public_ids: toMovePublicIds, toFolder: target };
    const res = await fetch("/api/media/move", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });
    const j = await res.json();
    if (!res.ok) { alert(j?.error || "Erreur déplacement."); return; }

    if (already.length) {
      alert(`Déplacement effectué. ${already.length} élément(s) étaient déjà dans « ${target} » et ont été ignorés.`);
    }
    clearSel(); fetchList();
  }

  // Téléchargement fiable (geste utilisateur)
  function triggerDownload(url: string, filename?: string) {
    const a = document.createElement("a");
    a.href = url;
    if (filename) a.download = filename;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  function downloadMany(list: Item[]) {
    list.forEach((it, idx) => {
      const u = toDownloadUrl(it);
      setTimeout(() => triggerDownload(u, it.title || it.public_id), idx * 150);
    });
  }
  function downloadSelected() {
    if (selectedPublicIds.size === 0) return;
    const list = items.filter(i => selectedPublicIds.has(i.public_id));
    downloadMany(list);
  }
  function downloadVisible() {
    if (items.length === 0) return;
    downloadMany(items);
  }

  const allVisibleSelected = useMemo(
    () => items.length > 0 && items.every(i => selectedPublicIds.has(i.public_id)),
    [items, selectedPublicIds]
  );
  const toggleSelectAllVisible = () => {
    setSelectedPublicIds(prev => {
      const next = new Set(prev);
      if (allVisibleSelected) items.forEach(i => next.delete(i.public_id));
      else items.forEach(i => next.add(i.public_id));
      return next;
    });
  };

  return (
    <main className="px-6 py-24 text-white">
      <h1 className="text-3xl font-bold mb-2">Galerie</h1>
      <p className="mb-6 text-white/80">Photos, vidéos et documents du dossier Cloudinary <code>famille</code>.</p>

      {/* Filtres / barre haute */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-full border border-white/20 bg-black/30 p-1 gap-2">
          {(["all","images","videos","documents"] as const).map(k => (
            <Link
              key={k} prefetch={false}
              href={`/galerie?tab=${k}`}
              onClick={()=>setTab(k)}
              className={`px-4 py-2 rounded-full ${tab===k ? "bg-white/20" : "hover:bg-white/10"}`}
            >
              {k==="all" ? "Tout" : k==="images" ? "Photos" : k==="videos" ? "Vidéos" : "Documents"}
            </Link>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher par titre…"
                 className="w-full sm:w-72 rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-300/60"/>
          <select value={sort} onChange={e=>setSort(e.target.value as any)}
                  className="rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none">
            <option value="newest">Plus récents</option>
            <option value="oldest">Plus anciens</option>
          </select>
          <button type="button" onClick={fetchList} disabled={loading}
                  className="rounded-lg border border-white/20 bg-black/30 px-3 py-2">
            {loading ? "Chargement…" : "Rafraîchir"}
          </button>
          <button type="button"
            onClick={toggleSelectAllVisible}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20"
          >
            {allVisibleSelected ? "Tout désélectionner (vue)" : "Tout sélectionner (vue)"}
          </button>
          <button type="button"
            onClick={downloadVisible}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20"
          >
            Télécharger (vue)
          </button>
          <Link
            href={`/admin/upload?rubric=${tab==="images"?"Photos":tab==="videos"?"Vidéos":tab==="documents"?"Documents":"Photos"}`}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-center hover:bg-white/20">
            ➕ Ajouter des médias
          </Link>
        </div>
      </div>

      {/* Barre d’actions sélection */}
      {selectedPublicIds.size > 0 && (
        <div className="mt-3 mb-4 rounded-xl bg-black/80 border border-white/20 p-3 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="text-sm text-white/90">
              {selectedPublicIds.size} élément{selectedPublicIds.size > 1 ? "s" : ""} sélectionné{selectedPublicIds.size > 1 ? "s" : ""}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={downloadSelected} className="px-3 py-2 rounded bg-blue-500 text-black hover:bg-blue-400">
                Télécharger sélection
              </button>
              <button type="button" onClick={doDelete} className="px-3 py-2 rounded bg-red-500 text-black hover:bg-red-400">
                Supprimer
              </button>
              <input value={moveFolder} onChange={e=>setMoveFolder(e.target.value)}
                     placeholder="Dossier cible (ex: famille/Photos/2025)"
                     className="rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none" />
              <button type="button" onClick={doMove} className="px-3 py-2 rounded bg-yellow-500 text-black hover:bg-yellow-400">
                Déplacer
              </button>
              <button type="button" onClick={clearSel} className="px-3 py-2 rounded border border-white/30 hover:bg-white/10">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grille */}
      {loading ? (
        <p className="text-white/70 mt-6">Chargement…</p>
      ) : items.length === 0 ? (
        <div className="text-white/80 mt-6"><p>Aucun élément.</p></div>
      ) : (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 mt-4">
          {items.map(m => {
            const isImg = m.kind==="image";
            const isVid = m.kind==="video";
            const isDoc = m.kind==="document";
            return (
              <div key={m.id} className="relative overflow-hidden rounded-lg border border-white/20 group">
                <label className="absolute top-2 left-2 z-10 inline-flex items-center gap-2 bg-black/50 rounded px-2 py-1 text-xs">
                  <input
                    type="checkbox"
                    checked={selectedPublicIds.has(m.public_id)}
                    onChange={()=>toggleSel(m.public_id)}
                  />
                  Sélection
                </label>
                <div className="aspect-video">
                  {isImg ? (
                    <Image
                      src={m.thumb ?? m.url}
                      alt={m.title}
                      width={800} height={600}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onClick={()=>openLightboxFor(m.id)}
                    />
                  ) : isVid ? (
                    isYouTube(m.url) ? (
                      <iframe src={m.url.replace("watch?v=", "embed/")} className="w-full h-full"
                              allow="autoplay; encrypted-media" allowFullScreen />
                    ) : (
                      <video src={m.url} className="w-full h-full object-cover" preload="metadata" muted playsInline
                             onClick={()=>openLightboxFor(m.id)} />
                    )
                  ) : isDoc ? (
                    <button
                      type="button"
                      onClick={()=>openLightboxFor(m.id)}
                      className="w-full h-full grid place-items-center bg-white/5 text-white/90"
                      title="Aperçu"
                    >
                      <div className="text-base sm:text-lg">
                        {docEmoji(extFromItem(m))} {m.title}{m.format?`.${m.format}`:""}
                      </div>
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lbOpen && viewList.length>0 && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4"
             onClick={()=>setLbOpen(false)}>
          <div className="relative max-w-6xl w-full max-h-[90vh]" onClick={(e)=>e.stopPropagation()}>
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              <div className="rounded-full bg-black/60 px-3 py-1 text-sm">{lbIndex+1} / {viewList.length}</div>
              <button
                type="button"
                onClick={() => {
                  const cur = viewList[lbIndex];
                  triggerDownload(toDownloadUrl(cur), cur.title || cur.public_id);
                }}
                className="rounded bg-white/80 text-black px-3 py-1 text-sm hover:bg-white"
              >
                Télécharger
              </button>
              <a
                href={viewList[lbIndex].url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-white/20 text-white px-3 py-1 text-sm hover:bg-white/30"
              >
                Ouvrir
              </a>

              {/* Migration RAW si ancien PDF en image/upload */}
              {isLegacyPdfNeedingRaw(viewList[lbIndex]) && (
                <button
                  type="button"
                  disabled={migrating}
                  onClick={async () => {
                    try {
                      setMigrating(true);
                      const cur = viewList[lbIndex];
                      const res = await fetch("/api/media/migrate-pdf", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ public_id: cur.public_id, url: cur.url }),
                      });
                      const j = await res.json();
                      if (!res.ok) { alert(j?.error || "Migration échouée"); return; }
                      alert("✅ PDF migré en RAW. Rafraîchissement…");
                      await fetchList();
                      setLbOpen(false);
                    } catch (e: any) {
                      alert(e?.message || "Erreur réseau");
                    } finally {
                      setMigrating(false);
                    }
                  }}
                  className={`rounded ${migrating ? "bg-orange-300" : "bg-orange-400 hover:bg-orange-300"} text-black px-3 py-1 text-sm`}
                  title="Ré-uploader ce PDF en RAW (corrige les 401 & aperçus)"
                >
                  {migrating ? "Migration…" : "Corriger PDF (RAW)"}
                </button>
              )}
            </div>

            <button type="button" onClick={()=>setLbOpen(false)}
                    className="absolute top-2 left-2 z-10 rounded-full border border-white/30 px-3 py-1 bg-black/40">✕</button>
            <button type="button" onClick={()=>setLbIndex(i=>(i-1+viewList.length)%viewList.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-black/60 hover:bg-black/80 grid place-items-center text-2xl">←</button>
            <button type="button" onClick={()=>setLbIndex(i=>(i+1)%viewList.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-black/60 hover:bg-black/80 grid place-items-center text-2xl">→</button>

            <div className="bg-black/40 rounded-lg overflow-hidden border border-white/20">
              {(() => {
                const cur = viewList[lbIndex];
                const ext = extFromItem(cur);

                if (cur.kind === "image") {
                  return <Image src={cur.url} alt={cur.title} width={1200} height={800} className="max-h-[80vh] w-full object-contain" />;
                }
                if (isYouTube(cur.url)) {
                  return <iframe src={cur.url.replace("watch?v=", "embed/")} className="w-full h-[80vh]" allow="autoplay; encrypted-media" allowFullScreen />;
                }
                if (cur.kind === "video") {
                  return <video src={cur.url} className="max-h-[80vh] w-full object-contain" controls autoPlay playsInline />;
                }

                // ---- Documents ----
                if (ext === "pdf") {
                  return <PdfInline url={cur.url} />; // pdf.js
                }
                if (AUDIO_EXTS.has(ext)) {
                  return (
                    <div className="w-full h-[80vh] grid place-items-center">
                      <audio src={cur.url} controls autoPlay />
                    </div>
                  );
                }
                if (OFFICE_EXTS.has(ext)) {
                  return <iframe src={officeViewerUrl(cur.url)} className="w-full h-[80vh]" />;
                }
                if (TEXT_EXTS.has(ext)) {
                  return <iframe src={cur.url} className="w-full h-[80vh]" />;
                }
                return <iframe src={cur.url} className="w-full h-[80vh]" />;
              })()}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
