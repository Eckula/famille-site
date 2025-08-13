// app/galerie/page.tsx
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Kind = "image" | "video" | "document";
type Tab = "all" | "images" | "videos" | "documents";

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

const TABS: Tab[] = ["all", "images", "videos", "documents"];

export default function GaleriePage() {
  const router = useRouter();

  // --- états
  const [raw, setRaw] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Item | null>(null);

  // filtres UI
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  // sélection multiple
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const selectedIds = useMemo(
    () => Object.entries(checked).filter(([, v]) => v).map(([k]) => k),
    [checked]
  );

  // destination pour déplacer
  const [moveTarget, setMoveTarget] = useState("famille/Photos");

  // --- lire ?tab= depuis l'URL (sans useSearchParams)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const usp = new URLSearchParams(window.location.search);
    const t = usp.get("tab") as Tab | null;
    if (t && TABS.includes(t)) setTab(t);
  }, []);
  // synchroniser l’URL quand l’onglet change
  useEffect(() => {
    if (typeof window === "undefined") return;
    const usp = new URLSearchParams(window.location.search);
    usp.set("tab", tab);
    router.replace(`/galerie?${usp.toString()}`);
  }, [tab, router]);

  // --- fetch liste
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/media/list", { cache: "no-store" });
      const j = await r.json();
      setRaw(j.items ?? []);
      setChecked({}); // reset sélection
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { fetchList(); }, [fetchList]);

  // --- filtrage / tri
  const items = useMemo(() => {
    let data = [...raw];

    if (tab === "images") data = data.filter((m) => m.kind === "image");
    if (tab === "videos") data = data.filter((m) => m.kind === "video");
    if (tab === "documents") data = data.filter((m) => m.kind === "document");

    const q = query.trim().toLowerCase();
    if (q) data = data.filter((m) => m.title.toLowerCase().includes(q));

    data.sort((a, b) =>
      sort === "newest"
        ? +new Date(b.createdAt) - +new Date(a.createdAt)
        : +new Date(a.createdAt) - +new Date(b.createdAt)
    );

    return data;
  }, [raw, tab, query, sort]);

  // --- helpers UI
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

  // --- sélection multiple
  function toggleOne(id: string) {
    setChecked((c) => ({ ...c, [id]: !c[id] }));
  }
  function toggleAllOnPage(flag: boolean) {
    const map: Record<string, boolean> = {};
    for (const m of items) map[m.public_id] = flag;
    setChecked(map);
  }

  // --- actions groupées (API)
  async function removeSelected() {
    if (selectedIds.length === 0) return;
    if (!confirm(`Supprimer ${selectedIds.length} élément(s) ?`)) return;
    const r = await fetch("/api/media/delete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids: selectedIds }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      alert(`Erreur suppression: ${j?.error || r.statusText}`);
      return;
    }
    await fetchList();
  }

  async function moveSelected() {
    if (selectedIds.length === 0) return;
    if (!moveTarget.trim()) return alert("Choisis une destination");
    const r = await fetch("/api/media/move", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids: selectedIds, targetFolder: moveTarget }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      alert(`Erreur déplacement: ${j?.error || r.statusText}`);
      return;
    }
    await fetchList();
  }

  // --- lightbox carrousel
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const imagesOnly = useMemo(() => items.filter(i => i.kind === "image"), [items]);
  const lightboxOpen = (item: Item) => {
    const idx = imagesOnly.findIndex(x => x.id === item.id);
    if (idx >= 0) {
      setCurrentIndex(idx);
      setShowLightbox(true);
    }
  };
  const onPrev = () => setCurrentIndex((i) => (i - 1 + imagesOnly.length) % imagesOnly.length);
  const onNext = () => setCurrentIndex((i) => (i + 1) % imagesOnly.length);
  // clavier
  useEffect(() => {
    if (!showLightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowLightbox(false);
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showLightbox, imagesOnly.length]);

  // --- rendu
  return (
    <main className="px-6 py-20 text-white">
      <h1 className="text-3xl font-bold mb-2">Galerie</h1>
      <p className="mb-6 text-white/80">
        Photos, vidéos et documents du dossier Cloudinary <code>famille</code>.
      </p>

      {/* barre outils */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        {/* onglets */}
        <div className="inline-flex rounded-full border border-white/20 bg-black/30 p-1">
          {TABS.map((k) => (
            <button
              key={k}
              className={`px-4 py-2 rounded-full ${tab === k ? "bg-white/20" : ""}`}
              onClick={() => setTab(k)}
              title={k==="all" ? "Tout" : k==="images" ? "Photos" : k==="videos" ? "Vidéos" : "Documents"}
            >
              {k==="all" ? "Tout" : k==="images" ? "Photos" : k==="videos" ? "Vidéos" : "Documents"}
            </button>
          ))}
        </div>

        {/* recherche + tri + refresh + ajouter */}
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
          <button
            onClick={fetchList}
            className="rounded-lg border border-white/20 bg-black/30 px-3 py-2"
            disabled={loading}
          >
            {loading ? "Chargement…" : "Rafraîchir"}
          </button>

          {/* "Ajouter des médias" -> preserve l’onglet en rubrique */}
          <Link
            href={`/admin/upload?rubric=${tab === "images" ? "Photos" : tab === "videos" ? "Vidéos" : tab === "documents" ? "Documents" : "Photos"}`}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-center hover:bg-white/20"
            title="Ajouter des médias"
          >
            ➕ Ajouter des médias
          </Link>
        </div>
      </div>

      {/* barre d’actions groupées si sélection */}
      {selectedIds.length > 0 && (
        <div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-lg border border-white/20 bg-black/30 px-3 py-2">
          <div>{selectedIds.length} sélectionné(s)</div>
          <div className="flex gap-2">
            <button onClick={() => toggleAllOnPage(false)} className="px-3 py-1 rounded border border-white/30">Tout désélectionner</button>
            <button onClick={removeSelected} className="px-3 py-1 rounded bg-red-500 text-black hover:bg-red-400">🗑 Supprimer</button>
            <div className="flex items-center gap-2">
              <input
                value={moveTarget}
                onChange={(e) => setMoveTarget(e.target.value)}
                placeholder="famille/Photos/SousDossier"
                className="rounded border border-white/30 bg-black/30 px-2 py-1 w-64"
              />
              <button onClick={moveSelected} className="px-3 py-1 rounded bg-yellow-500 text-black hover:bg-yellow-400">📂 Déplacer</button>
            </div>
          </div>
        </div>
      )}

      {/* grille — vignettes légèrement plus petites (aspect 4/3, gap réduit) */}
      {loading ? (
        <p className="text-white/70">Chargement…</p>
      ) : items.length === 0 ? (
        <div className="text-white/80">
          <p>Aucun élément.</p>
          <Link
            href="/admin/upload"
            className="inline-block mt-3 rounded-lg border border-white/20 bg-white/10 px-4 py-2 hover:bg-white/20"
          >
            ➕ Ajouter des médias
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((m, idx) => (
            <div key={m.id} className="relative rounded-lg border border-white/20 overflow-hidden group">
              {/* case à cocher */}
              <label className="absolute top-2 left-2 z-10 bg-black/60 p-1 rounded">
                <input
                  type="checkbox"
                  checked={!!checked[m.public_id]}
                  onChange={() => toggleOne(m.public_id)}
                />
              </label>

              <button
                className="w-full text-left"
                onClick={() => (m.kind === "image" ? lightboxOpen(m) : m.kind === "document" ? window.open(m.url, "_blank") : setSelected(m))}
                title={m.kind === "document" ? "Ouvrir / Télécharger" : "Agrandir"}
              >
                {/* vignettes plus petites : aspect-[4/3] */}
                <div className="aspect-[4/3]">
                  {m.kind === "image" ? (
                    <img
                      src={m.thumb ?? m.url}
                      alt={m.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : m.kind === "video" ? (
                    <video
                      src={m.url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                      muted
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center bg-white/5 text-white/90">
                      <div className="text-sm">
                        {docEmoji(m.format)} {m.title}{m.format ? `.${m.format}` : ""}
                      </div>
                    </div>
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* lightbox simple pour images + navigation */}
      {showLightbox && imagesOnly.length > 0 && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          <div className="absolute inset-0" />
          <div className="relative max-w-6xl w-full px-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <button onClick={() => setShowLightbox(false)} className="rounded-md border border-white/30 px-3 py-1">✕ Fermer</button>
              <div className="text-white/70">{currentIndex + 1} / {imagesOnly.length}</div>
            </div>
            <div className="relative">
              <button onClick={onPrev} className="absolute left-0 top-1/2 -translate-y-1/2 px-3 py-2 border border-white/30 rounded-md bg-black/30">←</button>
              <img
                src={imagesOnly[currentIndex].url}
                alt={imagesOnly[currentIndex].title}
                className="max-h-[80vh] w-full object-contain"
              />
              <button onClick={onNext} className="absolute right-0 top-1/2 -translate-y-1/2 px-3 py-2 border border-white/30 rounded-md bg-black/30">→</button>
            </div>
            <div className="mt-3 text-center text-sm text-white/80">{imagesOnly[currentIndex].title}</div>
          </div>
        </div>
      )}

      {/* ancienne lightbox vidéo (on garde pour vidéos) */}
      {selected && selected.kind === "video" && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div className="max-w-6xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setSelected(null)}
                className="rounded-md border border-white/30 px-3 py-1"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <div className="bg-black/40 rounded-lg overflow-hidden border border-white/20">
              <video src={selected.url} className="max-h-[80vh] w-full object-contain" controls autoPlay />
            </div>
            <div className="mt-3 text-center text-sm text-white/80">
              {selected.title} • {new Date(selected.createdAt).toLocaleDateString("fr-FR")}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
