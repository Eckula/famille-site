// app/galerie/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image"; // ✅ remplacement <img>
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

function getTabFromUrl(): Tab {
  if (typeof window === "undefined") return "all";
  const sp = new URLSearchParams(window.location.search);
  const t = (sp.get("tab") || "all").toLowerCase();
  return (["all","images","videos","documents"].includes(t) ? (t as Tab) : "all");
}
const docEmoji = (ext?: string) => {
  const e = (ext || "").toLowerCase();
  if (["pdf"].includes(e)) return "📄";
  if (["doc","docx"].includes(e)) return "📝";
  if (["xls","xlsx","csv"].includes(e)) return "📊";
  if (["ppt","pptx"].includes(e)) return "📽️";
  if (["mp3","wav","aac","m4a","flac","ogg","oga"].includes(e)) return "🎵";
  if (["zip","rar","7z","tar","gz"].includes(e)) return "🗜️";
  return "📎";
};

// ✅ Fonction pour détecter si c’est un lien YouTube
function isYouTube(url: string) {
  return /youtu\.be|youtube\.com/.test(url);
}

export default function GaleriePage() {
  const [raw, setRaw] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest"|"oldest">("newest");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const toggleSel = (id: string) => setSelectedIds(s => (s.has(id) ? new Set([...s].filter(x=>x!==id)) : new Set(s).add(id)));
  const clearSel = () => setSelectedIds(new Set());
  const [moveFolder, setMoveFolder] = useState("famille/Photos");

  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);
  const swipeStartX = useRef<number|null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/media/list", { cache: "no-store" });
      const j = await r.json();
      setRaw(j.items ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    setTab(getTabFromUrl());
    fetchList();
  }, [fetchList]);

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

  const playable = useMemo(()=> items.filter(x=>x.kind!=="document"), [items]);

  const openLightboxFor = (id: string) => {
    const idx = playable.findIndex(x=>x.id===id);
    if (idx>=0) { setLbIndex(idx); setLbOpen(true); }
  };

  useEffect(() => {
    if (!lbOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key==="Escape") setLbOpen(false);
      if (e.key==="ArrowLeft") setLbIndex(i => (i-1+playable.length)%playable.length);
      if (e.key==="ArrowRight") setLbIndex(i => (i+1)%playable.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lbOpen, playable.length]);

  async function doDelete() {
    if (selectedIds.size===0) return;
    if (!confirm(`Supprimer ${selectedIds.size} élément(s) ?`)) return;
    const res = await fetch("/api/media/delete", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ ids: Array.from(selectedIds) })
    });
    const j = await res.json();
    if (!res.ok) alert(j?.error || "Erreur suppression.");
    clearSel(); fetchList();
  }

  async function doMove() {
    if (selectedIds.size===0) return;
    if (!moveFolder.trim()) { alert("Renseigne un dossier cible (ex: famille/Photos/Anniversaires)"); return; }
    const res = await fetch("/api/media/move", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ ids: Array.from(selectedIds), toFolder: moveFolder.trim() })
    });
    const j = await res.json();
    if (!res.ok) { alert(j?.error || "Erreur déplacement."); return; }
    clearSel(); fetchList();
  }

  const onTouchStart = (e: React.TouchEvent) => { swipeStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (swipeStartX.current==null) return;
    const dx = e.changedTouches[0].clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(dx)<40) return;
    if (dx>0) setLbIndex(i=>(i-1+playable.length)%playable.length);
    else setLbIndex(i=>(i+1)%playable.length);
  };

  return (
    <main className="px-6 py-24 text-white">
      <h1 className="text-3xl font-bold mb-2">Galerie</h1>
      <p className="mb-6 text-white/80">Photos, vidéos et documents du dossier Cloudinary <code>famille</code>.</p>

      {/* Filtres */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
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

        {/* Recherche + tri */}
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
          <Link
            href={`/admin/upload?rubric=${tab==="images"?"Photos":tab==="videos"?"Vidéos":tab==="documents"?"Documents":"Photos"}`}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-center hover:bg-white/20">
            ➕ Ajouter des médias
          </Link>
        </div>
      </div>

      {/* Grille réduite sur PC */}
      {loading ? (
        <p className="text-white/70">Chargement…</p>
      ) : items.length === 0 ? (
        <div className="text-white/80">
          <p>Aucun élément.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          {items.map(m => {
            const isImg = m.kind==="image";
            const isVid = m.kind==="video";
            return (
              <div key={m.id} className="relative overflow-hidden rounded-lg border border-white/20 group">
                <label className="absolute top-2 left-2 z-10 inline-flex items-center gap-2 bg-black/50 rounded px-2 py-1 text-xs">
                  <input type="checkbox" checked={selectedIds.has(m.id)} onChange={()=>toggleSel(m.id)} />
                  Sélection
                </label>

                <div className="aspect-video">
                  {isImg ? (
                    <Image
                      src={m.thumb ?? m.url}
                      alt={m.title}
                      width={800}
                      height={600}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onClick={()=>openLightboxFor(m.id)}
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
                      <video src={m.url} className="w-full h-full object-cover" preload="metadata" muted playsInline
                             onClick={()=>openLightboxFor(m.id)} />
                    )
                  ) : (
                    <a href={m.url} target="_blank" rel="noopener noreferrer"
                       className="w-full h-full grid place-items-center bg-white/5 text-white/90" title="Ouvrir / Télécharger">
                      <div className="text-base sm:text-lg">{docEmoji(m.format)} {m.title}{m.format?`.${m.format}`:""}</div>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lbOpen && playable.length>0 && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4"
             onClick={()=>setLbOpen(false)} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="relative max-w-6xl w-full max-h-[90vh]" onClick={(e)=>e.stopPropagation()}>
            <div className="absolute top-2 right-2 z-10 rounded-full bg-black/60 px-3 py-1 text-sm">
              {lbIndex+1} / {playable.length}
            </div>
            <button onClick={()=>setLbOpen(false)}
                    className="absolute top-2 left-2 z-10 rounded-full border border-white/30 px-3 py-1 bg-black/40" aria-label="Fermer">✕</button>
            <button onClick={()=>setLbIndex(i=>(i-1+playable.length)%playable.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-black/60 hover:bg-black/80 grid place-items-center text-2xl" aria-label="Précédent">←</button>
            <button onClick={()=>setLbIndex(i=>(i+1)%playable.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-black/60 hover:bg-black/80 grid place-items-center text-2xl" aria-label="Suivant">→</button>

            <div className="bg-black/40 rounded-lg overflow-hidden border border-white/20">
              {(() => {
                const cur = playable[lbIndex];
                if (cur.kind === "image") {
                  return <Image src={cur.url} alt={cur.title} width={1200} height={800} className="max-h-[80vh] w-full object-contain" />;
                }
                if (isYouTube(cur.url)) {
                  return <iframe src={cur.url.replace("watch?v=", "embed/")} className="w-full h-[80vh]" allow="autoplay; encrypted-media" allowFullScreen />;
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
