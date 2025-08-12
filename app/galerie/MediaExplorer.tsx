"use client";
import { useEffect, useMemo, useState } from "react";
import MediaCard from "../components/MediaCard";


type Item = {
  id: string;
  kind: "image" | "video";
  title: string;
  url: string;
  thumb?: string;
  createdAt: string;
};

export default function MediaExplorer() {
  const [raw, setRaw] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "images" | "videos">("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const go = async () => {
      setLoading(true);
      const r = await fetch("/api/media/list");
      const j = await r.json();
      setRaw(j.items ?? []);
      setLoading(false);
    };
    go();
  }, []);

  const items = useMemo(() => {
    let data = [...raw];
    if (tab === "images") data = data.filter((m) => m.kind === "image");
    if (tab === "videos") data = data.filter((m) => m.kind === "video");
    const q = query.trim().toLowerCase();
    if (q) data = data.filter((m) => m.title.toLowerCase().includes(q));
    data.sort((a, b) =>
      sort === "newest"
        ? +new Date(b.createdAt) - +new Date(a.createdAt)
        : +new Date(a.createdAt) - +new Date(b.createdAt)
    );
    return data;
  }, [raw, tab, sort, query]);

  return (
    <section>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-6">
        <div className="inline-flex rounded-full border border-white/20 bg-black/30 p-1">
          {(["all", "images", "videos"] as const).map((k) => (
            <button
              key={k}
              className={`px-4 py-2 rounded-full ${
                tab === k ? "bg-white/20" : ""
              }`}
              onClick={() => setTab(k)}
            >
              {k === "all" ? "Tout" : k === "images" ? "Photos" : "Vidéos"}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
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
            onClick={() => location.reload()}
            className="rounded-lg border border-white/20 bg-black/30 px-3 py-2"
          >
            Rafraîchir
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-white/70">Chargement…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((m) => (
            <MediaCard key={m.id} item={m} />
          ))}
          {items.length === 0 && <p className="text-white/70">Aucun élément.</p>}
        </div>
      )}
    </section>
  );
}
