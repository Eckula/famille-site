// app/components/GalleryClient.tsx
"use client";
import { useEffect, useState } from "react";

type Item = {
  id: string; public_id: string; kind: "image"|"video"|"document";
  url: string; thumb: string; title?: string; createdAt: string; format?: string;
};

export default function GalleryClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/media/list")
      .then(r => r.json())
      .then(d => { if (d.error) throw new Error(d.error); setItems(d.items || []); })
      .catch(e => setErr(e.message || String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-white/80">Chargement…</p>;
  if (err)     return <p className="text-red-400">Erreur: {err}</p>;
  if (!items.length) return <p className="text-white/80">Aucun média.</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {items.map(it => (
        <a key={it.id} href={it.url} target="_blank" rel="noreferrer"
           className="block rounded-lg overflow-hidden border border-white/10 bg-white/5">
          {it.kind === "image" && <img src={it.thumb || it.url} alt={it.title || it.public_id} className="w-full h-48 object-cover" />}
          {it.kind === "video" && <video src={it.url} className="w-full h-48 object-cover" muted controls />}
          {it.kind === "document" && (
            <div className="h-48 grid place-items-center text-white/70 text-sm p-4">
              {it.title || it.public_id} ({it.format})
            </div>
          )}
          <div className="p-2 text-xs text-white/80 truncate">{it.title || it.public_id}</div>
        </a>
      ))}
    </div>
  );
}
