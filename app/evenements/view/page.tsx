// app/evenements/view/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

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

export default function EvenementView() {
  const [path, setPath] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search).get("path") || "";
    setPath(p);
  }, []);

  useEffect(() => {
    if (!path) return;
    (async () => {
      setLoading(true);
      try {
        // on réutilise /api/media/list et on filtre côté Cloudinary via folder:
        const r = await fetch("/api/media/list", { cache: "no-store" });
        const j = await r.json();
        const all: Item[] = j.items ?? [];
        setItems(all.filter((it) => (it.public_id || "").startsWith(path + "/")));
      } finally {
        setLoading(false);
      }
    })();
  }, [path]);

  const images = useMemo(() => items.filter(i => i.kind === "image"), [items]);

  return (
    <main className="px-6 py-20 text-white">
      <h1 className="text-3xl font-bold mb-2">Événement</h1>
      <p className="mb-4 text-white/80"><code>{path || "—"}</code></p>

      {loading ? (
        <p>Chargement…</p>
      ) : items.length === 0 ? (
        <p>Aucun média.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((m) => (
            <div key={m.id} className="rounded-lg border border-white/20 overflow-hidden">
              <div className="aspect-[4/3]">
                {m.kind === "image" ? (
                  <img src={m.thumb ?? m.url} alt={m.title} className="w-full h-full object-cover" />
                ) : m.kind === "video" ? (
                  <video src={m.url} className="w-full h-full object-cover" preload="metadata" muted />
                ) : (
                  <div className="w-full h-full grid place-items-center bg-white/5 text-white/90">{m.title}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
