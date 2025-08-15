// app/galerie/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ---------- Types ---------- */

type Kind = "image" | "video" | "document";
type Item = {
  id: string;
  public_id: string; // Cloudinary public_id (avec dossier)
  kind: Kind;
  title: string;
  url: string;
  thumb?: string;
  createdAt: string;
  format?: string; // "pdf", "docx", ...
  folder?: string;
  resource_type?: "image" | "video" | "raw";
};
type Tab = "all" | "images" | "videos" | "documents";

/* ---------- Helpers ---------- */

const isYouTube = (url: string) => /youtu\.be|youtube\.com/.test(url);

function getTabFromUrl(): Tab {
  if (typeof window === "undefined") return "all";
  const t = (new URLSearchParams(window.location.search).get("tab") || "all").toLowerCase();
  return (["all","images","videos","documents"] as const).includes(t as Tab) ? (t as Tab) : "all";
}

const officeExts = ["doc","docx","ppt","pptx","xls","xlsx"];
const imageExts = ["jpg","jpeg","png","gif","webp","heic","heif","avif","bmp","tiff","svg"];
const videoExts = ["mp4","mov","webm","mkv","avi","m4v"];

function docEmoji(ext?: string) {
  const e = (ext || "").toLowerCase();
  if (e === "pdf") return "📄";
  if (["doc","docx"].includes(e)) return "📝";
  if (["xls","xlsx","csv"].includes(e)) return "📊";
  if (["ppt","pptx"].includes(e)) return "📽️";
  if (["mp3","wav","aac","m4a","flac","ogg","oga"].includes(e)) return "🎵";
  if (["zip","rar","7z","tar","gz"].includes(e)) return "🗜️";
  return "📎";
}

function sanitizeName(name: string) {
  return name.replace(/[^\w.\-\sÀ-ÖØ-öø-ÿ]/g, "_");
}

/** URL absolue vers ton proxy /api/media/file */
function apiFile(publicId: string, params: Record<string, string | number | boolean | undefined> = {}) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const u = new URL("/api/media/file", origin);
  u.searchParams.set("public_id", publicId);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, String(v));
  });
  return u.toString();
}

/** URL pour ouvrir inline (lightbox / nouvel onglet) */
function openUrl(it: Item, overrideExt?: string) {
  const ext = (overrideExt || it.format || "").toLowerCase();
  const baseName = it.title?.trim() || it.public_id.split("/").pop() || "document";
  const nice = sanitizeName(ext && !baseName.endsWith("." + ext) ? `${baseName}.${ext}` : baseName);
  return apiFile(it.public_id, { format: ext || "", dl: 0, filename: nice });
}

/** URL pour télécharger avec joli nom */
function downloadUrl(it: Item, overrideExt?: string) {
  const ext = (overrideExt || it.format || "").toLowerCase();
  const baseName = it.title?.trim() || it.public_id.split("/").pop() || "document";
  const nice = sanitizeName(ext && !baseName.endsWith("." + ext) ? `${baseName}.${ext}` : baseName);
  return apiFile(it.public_id, { format: ext || "", dl: 1, filename: nice });
}

function folderOf(it: Item) {
  return (it.folder && it.folder.length > 0)
    ? it.folder.replace(/\/+$/,"")
    : it.public_id.split("/").slice(0, -1).join("/").replace(/\/+$/,"");
}

/* ---------- Component ---------- */

export default function GaleriePage() {
  const [raw, setRaw] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest"|"oldest">("newest");

  // Sélection multiple
  const [selectedPublicIds, setSelectedPublicIds] = useState<Set<string>>(new Set());
  const toggleSel = (publicId: string) =>
    setSelectedPublicIds(s => (s.has(publicId) ? new Set([...s].filter(x=>x!==publicId)) : new Set(s).add(publicId)));
  const clearSel = () => setSelectedPublicIds(new Set());
  const [moveFolder, setMoveFolder] = useState("famille/Photos");

  // Lightbox
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);
  const swipeStartX = useRef<number|null>(null);

  /* ---------- Chargement & normalisation ---------- */
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

      const src: any[] = Array.isArray(j?.items) ? j.items
                     : Array.isArray(j?.resources) ? j.resources
                     : Array.isArray(j) ? j : [];

      const list: Item[] = src.map((x: any) => {
        const public_id: string = x.public_id || x?.asset_id || "";
        const title = x.title || x.original_filename || (public_id ? public_id.split("/").pop() : "") || "";
        const primaryUrl: string = x.url || x.secure_url || x.path || "";
        const fmt = (x.format || "") || (primaryUrl.includes(".") ? primaryUrl.split(".").pop()?.toLowerCase() : "");

        const rt = (x.resource_type || "").toLowerCase();
        const ext = String(fmt || "").toLowerCase();
        const isImg = rt === "image" || imageExts.includes(ext);
        const isVid = rt === "video" || videoExts.includes(ext);
        const kind: Kind = isImg ? "image" : isVid ? "video" : "document";

        const createdAt = x.createdAt || x.created_at || x.uploaded_at || new Date().toISOString();

        return {
          id: x.id || x.asset_id || public_id || crypto.randomUUID(),
          public_id,
          kind,
          title,
          url: primaryUrl, // on ne s’en sert que pour les miniatures/vidéos publiques
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

  useEffect(() => { setTab(getTabFromUrl()); fetchList(); }, [fetchList]);

  /* ---------- Filtres / Tri ---------- */
  const items = useMemo(() => {
    let data = [...raw];
    if (tab==="images") data = data.filter(x=>x.kind==="image");
    if (tab==="videos") data = data.filter(x=>x.kind==="video");
    if (tab==="documents") data = data.filter(x=>x.kind==="document");
    const q = query.trim().toLowerCase();
    if (q) data = data.filter(x => (x.title || "").toLowerCase().includes(q));
    data.sort((a,b)=>
      sort==="newest"
        ? +new Date(b.createdAt) - +new Date(a.createdAt)
        : +new Date(a.createdAt) - +new Date(b.createdAt)
    );
    return data;
  }, [raw, tab, query, sort]);

  const viewable = items; // tout est “ouvrable” (doc via iframe)

  /* ---------- Actions API ---------- */

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

  /* ---------- Téléchargements (via proxy pour jolis noms) ---------- */

  function openMany(list: Item[], dl: boolean) {
    list.forEach((it, idx) => {
      const u = dl ? downloadUrl(it) : openUrl(it);
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = u;
        a.target = "_blank";
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }, idx * 150); // cadence (évite les bloqueurs popup agressifs)
    });
  }

  function downloadSelected() {
    if (selectedPublicIds.size === 0) return;
    const list = items.filter(i => selectedPublicIds.has(i.public_id));
    openMany(list, true);
  }
  function downloadVisible() {
    if (items.length === 0) return;
    openMany(items, true);
  }

  /* ---------- Sélection globale ---------- */

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

  /* ---------- Lightbox ---------- */

  const openLightboxFor = (id: string) => {
    const idx = viewable.findIndex(x=>x.id===id);
    if (idx>=0) { setLbIndex(idx); setLbOpen(true); }
  };

  useEffect(() => {
    if (!lbOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key==="Escape") setLbOpen(false);
      if (e.key==="ArrowLeft") setLbIndex(i => (i-1+viewable.length)%viewable.length);
      if (e.key==="ArrowRight") setLbIndex(i => (i+1)%viewable.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lbOpen, viewable.length]);

  const onTouchStart = (e: React.TouchEvent) => { swipeStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (swipeStartX.current==null) return;
    const dx = e.changedTouches[0].clientX - swipeStartX.current; swipeStartX.current = null;
    if (Math.abs(dx)<40) return;
    if (dx>0) setLbIndex(i=>(i-1+viewable.length)%viewable.length);
    else setLbIndex(i=>(i+1)%viewable.length);
  };

  /* ---------- Rendu ---------- */

  return (
    <main className="px-6 py-24 text-white">
      <h1 className="text-3xl font-bold mb-2">Galerie</h1>
      <p className="mb-2 text-white/80">Photos, vidéos et documents du dossier Cloudinary <code>famille</code>.</p>
      {errorMsg && <p className="mt-2 mb-4 text-red-300 text-sm">⚠️ {errorMsg}</p>}

      {/* Filtres haut */}
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

        {/* Recherche + tri + actions globales */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher par titre…"
            className="w-full sm:w-72 rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-300/60"/>
          <select value={sort} onChange={e=>setSort(e.target.value as any)}
            className="rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none">
            <option value="newest">Plus récents</option>
            <option value="oldest">Plus anciens</option>
          </select>
          <button onClick={fetchList} disabled={loading}
            className="rounded-lg border border-white/20 bg-black/30 px-3 py-2">
            {loading ? "Chargement…" : "Rafraîchir"}
          </button>
          <button
            onClick={toggleSelectAllVisible}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20"
            title="Sélectionner ou désélectionner tous les éléments visibles"
          >
            {allVisibleSelected ? "Tout désélectionner (vue)" : "Tout sélectionner (vue)"}
          </button>
          <button
            onClick={downloadVisible}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20"
            title="Télécharger tous les éléments visibles"
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

      {/* Barre d'actions sélection */}
      {selectedPublicIds.size > 0 && (
        <div className="mt-3 mb-4 rounded-xl bg-black/80 border border-white/20 p-3 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="text-sm text-white/90">
              {selectedPublicIds.size} élément{selectedPublicIds.size > 1 ? "s" : ""} sélectionné{selectedPublicIds.size > 1 ? "s" : ""}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={downloadSelected} className="px-3 py-2 rounded bg-blue-500 text-black hover:bg-blue-400">
                Télécharger sélection
              </button>
              <button onClick={doDelete} className="px-3 py-2 rounded bg-red-500 text-black hover:bg-red-400">
                Supprimer
              </button>
              <input value={moveFolder} onChange={e=>setMoveFolder(e.target.value)}
                placeholder="Dossier cible (ex: famille/Photos/2025)"
                className="rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none" />
              <button onClick={doMove} className="px-3 py-2 rounded bg-yellow-500 text-black hover:bg-yellow-400">
                Déplacer
              </button>
              <button onClick={clearSel} className="px-3 py-2 rounded border border-white/30 hover:bg-white/10">
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
            const ext = (m.format || "").toLowerCase();
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
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
                      onClick={()=>openLightboxFor(m.id)}
                      unoptimized
                    />
                  ) : isVid ? (
                    isYouTube(m.url) ? (
                      <iframe src={m.url.replace("watch?v=", "embed/")} className="w-full h-full"
                              allow="autoplay; encrypted-media" allowFullScreen />
                    ) : (
                      <video src={m.url} className="w-full h-full object-cover cursor-zoom-in" preload="metadata" muted playsInline
                             onClick={()=>openLightboxFor(m.id)} />
                    )
                  ) : isDoc ? (
                    <button
                      onClick={()=>openLightboxFor(m.id)}
                      className="w-full h-full grid place-items-center bg-white/5 text-white/90"
                      title="Ouvrir"
                    >
                      <div className="text-base sm:text-lg">
                        {docEmoji(ext)} {m.title}{ext?`.${ext}`:""}
                      </div>
                    </button>
                  ) : null}
                </div>
                {/* action rapide DL doc */}
                {isDoc && (
                  <div className="absolute top-2 right-2 z-10">
                    <a
                      href={downloadUrl(m)}
                      className="rounded bg-white/80 text-black px-2 py-1 text-xs hover:bg-white"
                      title="Télécharger"
                      target="_blank" rel="noopener noreferrer"
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

      {/* Lightbox (images/vidéos/documents) */}
      {lbOpen && viewable.length>0 && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4"
             onClick={()=>setLbOpen(false)} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="relative max-w-6xl w-full max-h-[90vh]" onClick={(e)=>e.stopPropagation()}>
            <div className="absolute top-2 right-2 z-10 flex gap-2 items-center">
              <div className="rounded-full bg-black/60 px-3 py-1 text-sm">{lbIndex+1} / {viewable.length}</div>
              <a
                href={downloadUrl(viewable[lbIndex])}
                target="_blank" rel="noopener noreferrer"
                className="rounded bg-white/80 text-black px-3 py-1 text-sm hover:bg-white"
              >
                Télécharger
              </a>
              <a
                href={openUrl(viewable[lbIndex])}
                target="_blank" rel="noopener noreferrer"
                className="rounded bg-white/80 text-black px-3 py-1 text-sm hover:bg-white"
              >
                Ouvrir
              </a>
            </div>
            <button onClick={()=>setLbOpen(false)}
                    className="absolute top-2 left-2 z-10 rounded-full border border-white/30 px-3 py-1 bg-black/40">✕</button>
            <button onClick={()=>setLbIndex(i=>(i-1+viewable.length)%viewable.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-black/60 hover:bg-black/80 grid place-items-center text-2xl">←</button>
            <button onClick={()=>setLbIndex(i=>(i+1)%viewable.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-black/60 hover:bg-black/80 grid place-items-center text-2xl">→</button>

            <div className="bg-black/40 rounded-lg overflow-hidden border border-white/20">
              {(() => {
                const cur = viewable[lbIndex];
                const ext = (cur.format || "").toLowerCase();

                if (cur.kind === "image") {
                  return <Image src={cur.url} alt={cur.title} width={1200} height={800} className="max-h-[80vh] w-full object-contain" unoptimized />;
                }
                if (isYouTube(cur.url)) {
                  return <iframe src={cur.url.replace("watch?v=", "embed/")} className="w-full h-[80vh]" allow="autoplay; encrypted-media" allowFullScreen />;
                }
                if (cur.kind === "video") {
                  return <video src={cur.url} className="max-h-[80vh] w-full object-contain" controls autoPlay playsInline />;
                }

                // Documents :
                if (ext === "pdf") {
                  // viewer natif via ton proxy (compatible Range en prod)
                  const pdfUrl = apiFile(cur.public_id, { format: "pdf", dl: 0, filename: sanitizeName((cur.title || "document") + ".pdf") });
                  return <iframe src={pdfUrl} className="w-full h-[80vh] bg-white" title={cur.title || "PDF"} />;
                }
                if (officeExts.includes(ext)) {
                  // Office Web Viewer en lui donnant l’URL publique de ton API (inline)
                  const fileUrl = openUrl(cur, ext);
                  const officeEmbed = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
                  return <iframe src={officeEmbed} className="w-full h-[80vh] bg-white" title={cur.title || "Document"} />;
                }
                // Autres (txt/csv/zip...) : on tente iframe direct
                const genericUrl = openUrl(cur, ext);
                return <iframe src={genericUrl} className="w-full h-[80vh] bg-white" title={cur.title || "Fichier"} />;
              })()}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
