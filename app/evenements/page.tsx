"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Folder = { name: string; path: string };

export default function EvenementsRoot() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch("/api/media/folders?prefix=famille/Evenements", { cache: "no-store" });
        const j = await r.json();
        setFolders(j.folders ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="px-6 py-20 text-white">
      <h1 className="text-3xl font-bold mb-2">Événements</h1>
      <p className="mb-6 text-white/80">Choisis un dossier d’événement.</p>

      {loading ? (
        <p>Chargement…</p>
      ) : folders.length === 0 ? (
        <p>Aucun sous-dossier dans <code>famille/Evenements</code>.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {folders.map((f) => (
            <li key={f.path} className="rounded-lg border border-white/20 bg-black/30 p-4">
              <div className="mb-2 font-semibold">{f.name}</div>
              <Link
                href={`/evenements/view?path=${encodeURIComponent(f.path)}`}
                className="inline-block rounded-lg border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20"
              >
                Ouvrir
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
