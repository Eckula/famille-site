// app/components/GalleryClient.tsx
"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type GalleryItem = {
  id: string;
  title: string;
  url: string;
  thumb?: string;
  kind?: "image" | "video" | "raw" | "audio";
  format?: string;
  createdAt?: string | number;
};

const AUDIO_EXT = /\.(mp3|wav|m4a|aac|ogg|flac)$/i;
const DOC_EXT   = /\.(pdf|docx?|pptx?|xlsx?|txt|zip|rar|7z)$/i;

function inferKind(it: GalleryItem): "image" | "video" | "audio" | "document" {
  const url = it.url || "";
  const fmt = (it.format || "").toLowerCase();
  const k   = it.kind;

  if (k === "audio") return "audio";
  if (AUDIO_EXT.test(url) || ["mp3","wav","m4a","aac","ogg","flac"].includes(fmt)) return "audio";

  if (k === "video") return "video";
  if (k === "image") return "image";

  if (k === "raw" || DOC_EXT.test(url)) return "document";
  return "image";
}

export default function GalleryClient({ items = [] as GalleryItem[] }) {
  const router   = useRouter();
  const pathname = usePathname();
  const sp       = useSearchParams();

  const tab = (sp.get("tab") || "tout").toLowerCase();
  const q   = (sp.get("q") || "").trim();

  // Sécurité UX: /galerie?tab=documents → si pas connecté, redirige vers /admin
  useEffect(() => {
    if (tab !== "documents") return;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!j?.role) {
          const next = `${pathname}?${sp.toString()}`;
          router.replace(`/admin?next=${encodeURIComponent(next)}`);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const tabs: Array<{ key: string; label: string }> = [
    { key: "tout",      label: "Tout" },
    { key: "photos",    label: "Photos" },
    { key: "videos",    label: "Vidéos" },
    { key: "audio",     label: "Audio" },      // 👈 NOUVEL ONGLET
    { key: "documents", label: "Documents" },
  ];

  const filtered = useMemo(() => {
    const byTab = items.filter((it) => {
      const k = inferKind(it);
      if (tab === "photos")    return k === "image";
      if (tab === "videos")    return k === "video";
      if (tab === "audio")     return k === "audio";      // 👈 mp3 & co ici
      if (tab === "documents") return k === "document";
      return true;
    });
    if (!q) return byTab;
    const ql = q.toLowerCase();
    return byTab.filter((it) => (it.title || "").toLowerCase().includes(ql));
  }, [items, tab, q]);

  function setTab(next: string) {
    const p = new URLSearchParams(sp.toString());
    p.set("tab", next);
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  }
  function setQuery(next: string) {
    const p = new URLSearchParams(sp.toString());
    if (next) p.set("q", next); else p.delete("q");
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  }

  return (
    <section>
      {/* Onglets + recherche */}
      <div className="mb-2 flex flex-wrap items-center gap-3 text-white">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full border border-white/25 px-3 py-1.5 hover:bg-white/10 ${
              tab === t.key ? "bg-white/10" : ""
            }`}
          >
            {t.label}
          </button>
        ))}
        <input
          defaultValue={q}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par titre..."
          className="ml-auto rounded-full border border-white/25 bg-black/30 px-3 py-1.5 text-sm text-white outline-none placeholder-white/60"
        />
      </div>

      {/* Grille */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((it) => {
          const kind = inferKind(it);
          return (
            <article key={it.id} className="overflow-hidden rounded-lg border border-white/15 bg-white/5">
              <div className="aspect-video bg-black/30">
                {kind === "image" ? (
                  <img src={it.thumb ?? it.url} alt={it.title} className="h-full w-full object-cover" loading="lazy" />
                ) : kind === "video" ? (
                  <video src={it.url} className="h-full w-full object-cover" controls preload="metadata" />
                ) : kind === "audio" ? (
                  <div className="flex h-full items-center justify-center p-4 text-white/90">🎵 {it.title || "Audio"}</div>
                ) : (
                  <div className="flex h-full items-center justify-center p-4 text-white/90">📄 {it.title || "Document"}</div>
                )}
              </div>
              <div className="p-3">
                <div className="truncate font-medium">{it.title}</div>
                {it.createdAt && (
                  <div className="text-xs text-white/70">{new Date(it.createdAt).toLocaleDateString("fr-FR")}</div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && <div className="mt-6 text-center text-white/70">Aucun élément.</div>}
    </section>
  );
}
