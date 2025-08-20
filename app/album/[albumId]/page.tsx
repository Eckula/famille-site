// app/album/[albumId]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Folder = { id: string; name: string };
type Media  = { public_id: string; url: string; thumb?: string; title?: string };

async function getJSON<T>(url: string, init?: RequestInit) {
  const r = await fetch(url, init);
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
  return j as T;
}

export default function AlbumPage() {
  const { albumId } = useParams<{ albumId: string }>();
  const router = useRouter();

  const [albumName, setAlbumName] = useState<string>("");
  const [members, setMembers] = useState<Folder[]>([]);
  const [photos, setPhotos] = useState<Media[]>([]);
  const [err, setErr] = useState<string>("");

  // picker state
  const [openPicker, setOpenPicker] = useState(false);
  const [recentFolders, setRecentFolders] = useState<Folder[]>([]);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return recentFolders;
    return recentFolders.filter(f => f.name.toLowerCase().includes(s) || f.id.includes(s));
  }, [recentFolders, search]);

  async function refresh() {
    try {
      setErr("");
      const { album, folders } = await getJSON<{ album: Folder; folders: Folder[] }>(`/api/albums/${albumId}/members`);
      setAlbumName(album?.name || "");
      setMembers(folders || []);
      const ph = await getJSON<{ items: Media[] }>(`/api/albums/${albumId}/photos`);
      setPhotos(ph.items || []);
    } catch (e: any) {
      setErr(e?.message || "Erreur chargement");
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumId]);

  async function openFolderPicker() {
    try {
      setOpenPicker(true);
      // 100 derniers dossiers créés (hors racines)
      const { items } = await getJSON<{ items: Folder[] }>("/api/folders?recent=100");
      setRecentFolders(items);
    } catch (e: any) {
      alert(e?.message || "Impossible de charger les dossiers récents");
    }
  }

  async function addFolder(id: string) {
    try {
      await getJSON(`/api/albums/${albumId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: id }),
      });
      setOpenPicker(false);
      setSearch("");
      await refresh();
    } catch (e: any) {
      alert(e?.message || "Erreur d’ajout");
    }
  }

  async function removeFolder(id: string) {
    if (!confirm("Retirer ce dossier de l’album ?")) return;
    try {
      await getJSON(`/api/albums/${albumId}/members?folderId=${encodeURIComponent(id)}`, { method: "DELETE" });
      await refresh();
    } catch (e: any) {
      alert(e?.message || "Erreur de suppression");
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <a href="/albums">← Retour aux albums</a>
      <h2 style={{ marginTop: 8 }}>{albumName || "Album"}</h2>

      <button onClick={openFolderPicker} style={{ background: "#19e1aa", padding: "6px 10px", borderRadius: 6 }}>
        Ajouter un dossier
      </button>

      {err && (
        <div style={{ marginTop: 10, color: "#ff6b6b", background: "#381a1a", padding: 8, borderRadius: 6 }}>
          {JSON.stringify({ error: err })}
        </div>
      )}

      <h3 style={{ marginTop: 16 }}>Dossiers membres</h3>
      {members.length === 0 ? (
        <div>Aucun dossier membre.</div>
      ) : (
        <ul>
          {members.map((f) => (
            <li key={f.id}>
              <code>{f.id}</code> — {f.name}{" "}
              <button onClick={() => removeFolder(f.id)} style={{ marginLeft: 8 }}>Retirer</button>
            </li>
          ))}
        </ul>
      )}

      <h3 style={{ marginTop: 16 }}>Photos</h3>
      {photos.length === 0 ? (
        <div>Pas de média.</div>
      ) : (
        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
          {photos.map((m) => (
            <a key={m.public_id} href={m.url} target="_blank" rel="noreferrer"
               style={{ display: "block", border: "1px solid #333", borderRadius: 6, overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.thumb || m.url} alt={m.title || m.public_id} style={{ width: "100%", display: "block" }} />
            </a>
          ))}
        </div>
      )}

      {/* mini sélecteur */}
      {openPicker && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{ background: "#1c1c1c", border: "1px solid #444", width: 600, maxWidth: "90%", borderRadius: 8, padding: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <h3 style={{ margin: 0, flex: 1 }}>Choisir un dossier</h3>
              <button onClick={() => setOpenPicker(false)}>✕</button>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrer par nom ou ID…"
              style={{ width: "100%", marginTop: 8, marginBottom: 8, padding: 6 }}
            />
            <div style={{ maxHeight: 320, overflow: "auto", border: "1px solid #333", borderRadius: 6 }}>
              <table style={{ width: "100%", fontSize: 14 }}>
                <thead>
                  <tr><th style={{ textAlign: "left", padding: 6 }}>Nom</th><th style={{ textAlign: "left" }}>ID</th><th /></tr>
                </thead>
                <tbody>
                  {filtered.map(f => (
                    <tr key={f.id}>
                      <td style={{ padding: 6 }}>{f.name}</td>
                      <td style={{ padding: 6 }}><code>{f.id}</code></td>
                      <td style={{ padding: 6, textAlign: "right" }}>
                        <button onClick={() => addFolder(f.id)}>Ajouter</button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={3} style={{ padding: 10, opacity: .7 }}>Aucun résultat.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: .7 }}>
              Astuce : tu peux coller un ID directement dans la recherche.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
