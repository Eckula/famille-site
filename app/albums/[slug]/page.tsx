"use client";

import { useEffect, useMemo, useState } from "react";

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

function docEmoji(ext?: string) {
  const e = (ext || "").toLowerCase();
  if (["pdf"].includes(e)) return "📄";
  if (["doc","docx"].includes(e)) return "📝";
  if (["xls","xlsx","csv"].includes(e)) return "📊";
  if (["ppt","pptx"].includes(e)) return "📽️";
  if (["mp3","wav","aac","m4a","flac","ogg","oga"].includes(e)) return "🎵";
  if (["zip","rar","7z","tar","gz"].includes(e)) return "🗜️";
  return "📎";
}

export default function AlbumMembrePage({ params }: { params: { slug: string } }) {
  const prenom = decodeURIComponent(params.slug || "");
  const folder = `famille/Albums/${prenom}`;

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true); setMsg("");
      try {
        const r = await fetch("/api/media/by-folder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder }),
        });
        const j = await r.json();
        if (!r.ok) { setMsg(j?.error || "Erreur."); }
        setItems(j.items || []);
      } catch (e: any) {
        setMsg(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [folder]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((m) => m.title.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <main className="px-6 py-24 text-white">
      <h1 className="text-3xl font-bold mb-2">Album — {prenom}</h1>
      <p className="mb-4 text-white/80">
        Dossier <code>{folder}</code>
      </p>

      <div className="mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par titre…"
          className="w-full sm:w-80 rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-300/60"
        />
      </div>

      {loading ? (
        <p className="text-white/70">Chargement…</p>
      ) : msg ? (
        <p className="text-red-400">{msg}</p>
      ) : filtered.length === 0 ? (
        <p className="text-white/80">Aucun média.</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((m) => (
            <div key={m.id} className="relative overflow-hidden rounded-lg border border-white/20 group">
              <div className="aspect-video">
                {m.kind === "image" ? (
                  <img
                    src={m.thumb ?? m.url}
                    alt={m.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : m.kind === "video" ? (
                  <video
                    src={m.url}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    muted
                    controls
                  />
                ) : (
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-full grid place-items-center bg-white/5 text-white/90"
                    title="Ouvrir / Télécharger"
                  >
                    <div className="text-base sm:text-lg">
                      {docEmoji(m.format)} {m.title}
                      {m.format ? `.${m.format}` : ""}
                    </div>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
