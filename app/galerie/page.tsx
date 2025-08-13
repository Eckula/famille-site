// app/galerie/page.tsx
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  public_id: string;
  kind: "image" | "video" | "document";
  title: string;
  url: string;
  thumb?: string;
  createdAt: string;
  format?: string;
  folder?: string;
};

type TabKey = "all" | "images" | "videos" | "documents";

const TAB_LABEL: Record<TabKey, string> = {
  all: "Tout",
  images: "Photos",
  videos: "Vidéos",
  documents: "Documents",
};

export default function GaleriePage() {
  const router = useRouter();

  // Données
  const [raw, setRaw] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Item | null>(null);

  // UI
  const [tab, setTab] = useState<TabKey>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  // -------- Paramètre d’URL ?tab=... (robuste, sans useSearchParams) --------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const q = (sp.get("tab") || "all") as TabKey;
    if (q === "all" || q === "images" || q === "videos" || q === "documents") {
      setTab(q);
    } else {
      setTab("all");
    }
  }, []);

  // Aligne l’URL quand on clique un onglet
  const changeTab = (next: TabKey) => {
    setTab(next);
    // on garde la même page mais on met à jour ?tab=...
    router.replace(`/galerie?tab=${next}`);
  };

  // -------- Récupération de la liste --------
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/media/list", { cache: "no-store" });
      const j = await r.json();
      setRaw(j.items ?? []);
    } catch {
      // noop: on laisse la liste vide si échec
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // fermer la lightbox avec Échap
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    if (selected) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  // -------- Filtres + recherche + tri --------
  const items = useMemo(() => {
    let data = [...raw];

    // filtre par onglet
    if (tab === "images") data = data.filter((m) => m.kind === "image");
    if (tab === "videos") data = data.filter((m) => m.kind === "video");
    if (tab === "documents") data = data.filter((m) => m.kind === "document");

    // recherche
    const q = query.trim().toLowerCase();
    if (q) data = data.filter((m) => m.title.toLowerCase().includes(q));

    // tri
    data.sort((a, b) =>
      sort === "newest"
        ? +new Date(b.createdAt) - +new Date(a.createdAt)
        : +new Date(a.createdAt) - +new Date(b.createdAt)
    );

    return data;
  }, [raw, tab, query, sort]);

  // emoji pour documents
  const docEmoji = (ext?: string) => {
    const e = (ext || "").toLowerCase();
    if (["pdf"].includes(e)) return "📄";
    if (["doc", "docx"].includes(e)) return "📝";
    if (["xls", "xlsx", "csv"].includes(e)) return "📊";
    if (["ppt", "pptx"].includes(e)) return "📽️";
    if (["mp3", "wav", "aac", "m4a", "flac", "ogg", "oga"].includes(e)) return "🎵";
    if (["zip", "rar", "7z", "tar", "gz"].includes(e)) return "🗜️";
    return "📎";
  };

  // déduire la rubrique pour l’upload selon l’onglet actif
  const rubricForUpload =
    tab === "images" ? "Photos" : tab === "videos" ? "Vidéos" : tab === "documents" ? "Documents" : "Photos";

  return (
    <main className="px-6 py-20 text-white">
      <h1 className="text-3xl font-bold mb-2">Galerie</h1>
      <p className="mb-6 text-white/80">
        Photos, vidéos et documents du dossier Cloudinary <code>famille</code>.
      </p>

      {/* Barre d’outils */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        {/* Onglets */}
        <div className="inline-flex rounded-full border border-white/20 bg-black/30 p-1">
          {(["all", "images", "videos", "documents"] as const).map((k) => (
            <button
              key={k}
              className={`px-4 py-2 rounded-full ${tab === k ? "bg-white/20" : ""}`}
              onClick={() => changeTab(k)}
            >
              {TAB_LABEL[k]}
            </button>
          ))}
        </div>

        {/* Recherche + tri + refresh + ajouter */}
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

          {/* ➕ Ajouter des médias : on pré-remplit la rubrique via la query */}
          <Link
            href={`/admin/upload?rubric=${encodeURIComponent(rubricForUpload)}`}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-center hover:bg-white/20"
            title="Ajouter des médias"
          >
            ➕ Ajouter des médias
          </Link>
        </div>
      </div>

      {/* Grille */}
      {loading ? (
        <p className="text-white/70">Chargement…</p>
      ) : items.length === 0 ? (
        <div className="text-white/80">
          <p>Aucun élément.</p>
          <Link
            href={`/admin/upload?rubric=${encodeURIComponent(rubricForUpload)}`}
            className="inline-block mt-3 rounded-lg border border-white/20 bg-white/10 px-4 py-2 hover:bg-white/20"
          >
            ➕ Ajouter des médias
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((m) => (
            <button
              key={m.id}
              className="relative overflow-hidden rounded-lg border border-white/20 group"
              onClick={() =>
                m.kind === "document" ? window.open(m.url, "_blank") : setSelected(m)
              }
              title={m.kind === "document" ? "Ouvrir / Télécharger" : "Agrandir"}
            >
              <div className="aspect-video">
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
                    <div className="text-base sm:text-lg">
                      {docEmoji(m.format)} {m.title}
                      {m.format ? `.${m.format}` : ""}
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox images/vidéos */}
      {selected && selected.kind !== "document" && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-w-6xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
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
              {selected.kind === "image" ? (
                <img
                  src={selected.url}
                  alt={selected.title}
                  className="max-h-[80vh] w-full object-contain"
                />
              ) : (
                <video
                  src={selected.url}
                  className="max-h-[80vh] w-full object-contain"
                  controls
                  autoPlay
                />
              )}
            </div>
            <div className="mt-3 text-center text-sm text-white/80">
              {selected.title} •{" "}
              {new Date(selected.createdAt).toLocaleDateString("fr-FR")}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
