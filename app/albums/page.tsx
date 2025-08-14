// app/albums/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Folder = { name: string; path: string };

export default function AlbumsPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch("/api/media/folders/albums", { cache: "no-store" });
        const j = await r.json();
        setFolders(j.folders ?? []);
      } finally { setLoading(false); }
    })();
  }, []);

  async function createAlbum() {
    const n = name.trim();
    if (!n) return;
    const path = `famille/Albums/${n}`;
    const r = await fetch("/api/media/folder/create", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ path })
    });
    const j = await r.json();
    if (!r.ok) { alert(j?.error || "Erreur création dossier"); return; }
    setName("");
    // refresh
    const rr = await fetch("/api/media/folders/albums", { cache: "no-store" });
    const jj = await rr.json();
    setFolders(jj.folders ?? []);
  }

  return (
    <main className="px-6 py-24 text-white">
      <h1 className="text-3xl font-bold mb-2">Albums</h1>
      <p className="mb-4 text-white/80">
        Albums classés par membre sous <code>famille/Albums/&lt;Prénom&gt;</code>.
      </p>

      {/* Création rapide */}
      <div className="flex gap-2 mb-6">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Prénom (ex: Paul)"
               className="rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none"/>
        <button onClick={createAlbum} className="px-3 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black">
          Créer le dossier
        </button>
      </div>

      {loading ? <p>Chargement…</p> : folders.length===0 ? (
        <p>Aucun sous-dossier pour l’instant. Créez un album ci-dessus.</p>
      ) : (
        <ul className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {folders.map(f => (
            <li key={f.path}>
              <Link href={`/galerie?tab=images`} prefetch={false}
                    className="block rounded-lg border border-white/20 bg-black/30 p-4 hover:bg-white/10">
                {f.name}
                <div className="text-xs text-white/60">{f.path}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
