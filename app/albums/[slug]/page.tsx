// app/albums/[slug]/page.tsx
"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ALBUMS_ROOT, joinPath } from "@/lib/config";
import UploadToCloudinary from "@/components/UploadToCloudinary";

type Kind = "image" | "video" | "audio" | "document";
type Item = { id?: string; public_id: string; title?: string; url: string; thumb?: string; format?: string; kind?: Kind; createdAt?: string };

async function getJSON<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
async function patchJSON<T>(url: string, body: any): Promise<T> {
  const r = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
async function delJSON<T>(url: string, body: any): Promise<T> {
  const r = await fetch(url, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export default function AlbumDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // ✅ Next 15: params est un Promise
  const { slug } = React.use(params);
  const router = useRouter();

  const folderPath = joinPath(ALBUMS_ROOT, decodeURIComponent(slug));

  const [items, setItems] = useState<Item[]>([]);
  const [err, setErr] = useState("");

  // rename UI
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(decodeURIComponent(slug));

  async function refresh() {
    const u = new URL("/api/media/list", window.location.origin);
    u.searchParams.set("folder", folderPath);
    u.searchParams.set("tab", "all");
    const mj = await getJSON<any>(u.toString());
    setItems(Array.isArray(mj?.items) ? mj.items : []);
  }

  useEffect(() => {
    (async () => {
      setErr("");
      try { await refresh(); } catch (e: any) { setErr(e?.message || "Erreur chargement de l’album"); }
    })();
  }, [folderPath]);

  const title = useMemo(() => decodeURIComponent(slug).replace(/[-_]/g, " "), [slug]);

  async function onDeleteAlbum() {
    if (!confirm("Supprimer l’album et tous ses médias ?")) return;
    try {
      await delJSON("/api/media/folders", { path: folderPath, recursive: true });
      router.push("/albums");
    } catch (e: any) {
      alert(e?.message || "Suppression impossible");
    }
  }

  async function onRenameAlbum() {
    const name = newName.trim();
    if (!name) return;
    const from = folderPath;
    const to = joinPath(ALBUMS_ROOT, name);
    try {
      await patchJSON("/api/media/folders", { from, to });
      setEditing(false);
      // navigue vers le nouveau slug
      router.replace(`/albums/${encodeURIComponent(name)}`);
      router.refresh();
    } catch (e: any) {
      alert(e?.message || "Renommage impossible");
    }
  }

  return (
    <main className="px-6 py-24 text-white">
      <div className="mb-4">
        <Link prefetch={false} href="/albums" className="text-white/70 hover:underline">← Retour aux albums</Link>
      </div>

      <div className="mb-3 flex items-center gap-3">
        {!editing ? (
          <>
            <h1 className="text-3xl font-bold">{title}</h1>
            <button onClick={() => setEditing(true)} className="px-3 py-1 rounded bg-white/10 text-white text-sm hover:bg-white/20">Renommer</button>
            <button onClick={onDeleteAlbum} className="px-3 py-1 rounded bg-red-600/80 text-white text-sm hover:bg-red-600">Supprimer</button>
          </>
        ) : (
          <>
            <input value={newName} onChange={e=>setNewName(e.target.value)} className="px-2 py-1 rounded border bg-white/5 text-white" />
            <button onClick={onRenameAlbum} className="px-3 py-1 rounded bg-black text-white text-sm">OK</button>
            <button onClick={()=>setEditing(false)} className="px-3 py-1 rounded bg-white/10 text-white text-sm">Annuler</button>
          </>
        )}
      </div>

      {/* Upload */}
      <div className="mb-6">
        <UploadToCloudinary folder={folderPath} onDone={refresh} />
      </div>

      {err && <p className="text-red-300 mb-3">⚠️ {err}</p>}

      {!items.length ? (
        <p className="text-white/80">Aucun média dans cet album.</p>
      ) : (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          {items.map((m, i) => {
            const k = (m.kind || "image") as Kind;
            const ext = (m.format || "").toLowerCase();
            return (
              <article key={m.id || m.public_id || i} className="relative overflow-hidden rounded-lg border border-white/20 bg-white/5">
                <div className="aspect-video bg-black/30">
                  {k === "image" ? (
                    <Image src={m.thumb ?? m.url} alt={m.title || ""} width={800} height={600} className="w-full h-full object-cover" unoptimized />
                  ) : k === "video" ? (
                    <video src={m.url} className="w-full h-full object-cover" preload="metadata" controls />
                  ) : k === "audio" ? (
                    <div className="w-full h-full grid place-items-center p-3">
                      <div className="text-lg">🎵 {m.title || m.public_id}</div>
                      <audio className="mt-2 w-[95%]" src={m.url} controls preload="none" />
                    </div>
                  ) : (
                    <div className="w-full h-full grid place-items-center p-3">
                      <div className="text-base sm:text-lg">📄 {m.title || m.public_id}{ext ? `.${ext}` : ""}</div>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-medium line-clamp-2">{m.title || m.public_id}</div>
                  {!!m.createdAt && <div className="text-xs text-white/70">{new Date(m.createdAt).toLocaleString("fr-FR")}</div>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
