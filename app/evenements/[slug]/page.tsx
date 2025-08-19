// app/evenements/[slug]/page.tsx
"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EVENTS_ROOT, joinPath } from "@/lib/config";
import { parseEventMeta } from "@/lib/events";
import UploadToCloudinary from "@/components/UploadToCloudinary";

// ===== Types =====
type Kind = "image" | "video" | "audio" | "document";
type Item = {
  public_id: string;
  title?: string;
  url: string;
  thumb?: string;
  format?: string;
  kind?: Kind;
  createdAt?: string;
};
type FolderNode = { path: string; name: string; createdAt?: string };

// ===== Fetch utils =====
async function getJSON<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
async function postJSON<T>(url: string, body: any): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
async function patchJSON<T>(url: string, body: any): Promise<T> {
  const r = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
async function delJSON<T>(url: string, body: any): Promise<T> {
  const r = await fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export default function EventDetailPage({
  params,
}: {
  // ✅ Next 15: params est un Promise — on l’extrait avec React.use()
  params: Promise<{ slug: string }>;
}) {
  const { slug } = React.use(params);
  const router = useRouter();

  const folderName = decodeURIComponent(slug);         // nom du dossier évènement
  const eventPath = joinPath(EVENTS_ROOT, folderName); // "famille/Evenements/<nom>"

  // Médias du dossier racine
  const [rootItems, setRootItems] = useState<Item[]>([]);
  // Sous-dossiers (albums internes)
  const [subfolders, setSubfolders] = useState<FolderNode[]>([]);
  // Covers (chargées en batch)
  const [covers, setCovers] = useState<Record<string, string | null>>({});
  const [err, setErr] = useState("");

  // Form: créer sous-dossier
  const [newSub, setNewSub] = useState("");
  const [creating, setCreating] = useState(false);

  // Renommer / supprimer SOUS-DOSSIER
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Renommer / supprimer ÉVÉNEMENT
  const [editingEvent, setEditingEvent] = useState(false);
  const [newEventName, setNewEventName] = useState(folderName);

  const meta = useMemo(() => parseEventMeta(folderName), [folderName]);
  const galleryAllUrl = useMemo(
    () => `/galerie?tab=images&folder=${encodeURIComponent(eventPath)}`,
    [eventPath]
  );

  // ===== Data loaders =====
  async function refreshRoot() {
    const u = new URL("/api/media/list", window.location.origin);
    u.searchParams.set("folder", eventPath);
    u.searchParams.set("tab", "all");
    const mj = await getJSON<any>(u.toString());
    setRootItems(Array.isArray(mj?.items) ? mj.items : []);
  }
  async function refreshSubfolders() {
    const resp = await getJSON<{ items: FolderNode[] }>(
      `/api/media/folders?root=${encodeURIComponent(eventPath)}`
    );
    const items = Array.isArray(resp?.items) ? resp.items : [];
    setSubfolders(items.filter((f) => f.path !== eventPath));
  }
  async function refreshCovers() {
    const cov = await getJSON<{ covers: Record<string, string | null> }>(
      `/api/media/covers?root=${encodeURIComponent(eventPath)}`
    );
    setCovers(cov.covers || {});
  }

  useEffect(() => {
    (async () => {
      setErr("");
      try {
        await Promise.all([refreshRoot(), refreshSubfolders()]);
        await refreshCovers();
      } catch (e: any) {
        setErr(e?.message || "Erreur chargement de l’événement");
      }
    })();
  }, [eventPath]);

  // ===== Actions : sous-dossier =====
  async function onCreateSub(e: React.FormEvent) {
    e.preventDefault();
    if (!newSub.trim()) return;
    setCreating(true);
    try {
      const subPath = joinPath(eventPath, newSub.trim());
      await postJSON("/api/media/folders", { path: subPath });
      setNewSub("");
      await refreshSubfolders();
      await refreshCovers();
    } catch (e: any) {
      alert(e?.message || "Création impossible");
    } finally {
      setCreating(false);
    }
  }

  async function onDeleteSub(path: string) {
    if (!confirm("Supprimer le sous-dossier et tous ses médias ?")) return;
    try {
      await delJSON("/api/media/folders", { path, recursive: true });
      await refreshSubfolders();
      await refreshCovers();
    } catch (e: any) {
      alert(e?.message || "Suppression impossible");
    }
  }

  function onStartRenameSub(path: string, currentName: string) {
    setEditingPath(path);
    setEditingName(currentName);
  }
  function onCancelRenameSub() {
    setEditingPath(null);
    setEditingName("");
  }
  async function onConfirmRenameSub() {
    const from = editingPath!;
    const name = editingName.trim();
    if (!from || !name) return;
    const to = joinPath(eventPath, name);
    try {
      await patchJSON("/api/media/folders", { from, to });
      onCancelRenameSub();
      await refreshSubfolders();
      await refreshCovers();
    } catch (e: any) {
      alert(e?.message || "Renommage impossible");
    }
  }

  // ===== Actions : évènement =====
  async function onDeleteEvent() {
    if (!confirm("Supprimer l’événement et tous ses médias ?")) return;
    try {
      await delJSON("/api/media/folders", { path: eventPath, recursive: true });
      router.push("/evenements");
    } catch (e: any) {
      alert(e?.message || "Suppression impossible");
    }
  }

  async function onRenameEvent() {
    const name = newEventName.trim();
    if (!name) return;
    const from = eventPath;
    const to = joinPath(EVENTS_ROOT, name);
    try {
      await patchJSON("/api/media/folders", { from, to });
      setEditingEvent(false);
      // redirige vers le nouveau slug
      router.replace(`/evenements/${encodeURIComponent(name)}`);
      router.refresh();
    } catch (e: any) {
      alert(e?.message || "Renommage impossible");
    }
  }

  return (
    <main className="px-6 py-24 text-white">
      <div className="mb-4">
        <Link prefetch={false} href="/evenements" className="text-white/70 hover:underline">
          ← Retour aux événements
        </Link>
      </div>

      <header className="mb-6">
        {!editingEvent ? (
          <>
            <h1 className="text-3xl font-bold mb-1">{meta.title || folderName}</h1>
            <p className="text-white/80">
              {meta.date ? meta.date.toLocaleDateString("fr-FR") : ""}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={galleryAllUrl}
                className="px-4 py-2 rounded bg-black text-white hover:bg-black/80"
              >
                Voir tout le dossier
              </a>
              <UploadToCloudinary folder={eventPath} onDone={refreshRoot} />
              <button
                onClick={() => {
                  setEditingEvent(true);
                  setNewEventName(folderName);
                }}
                className="px-3 py-2 rounded bg-white/10 text-white text-sm hover:bg-white/20"
              >
                Renommer l’événement
              </button>
              <button
                onClick={onDeleteEvent}
                className="px-3 py-2 rounded bg-red-600/80 text-white text-sm hover:bg-red-600"
              >
                Supprimer l’événement
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
              className="px-2 py-1 rounded border bg-white/5 text-white"
              placeholder="Nouveau nom d’événement"
            />
            <button
              onClick={onRenameEvent}
              className="px-3 py-1 rounded bg-black text-white text-sm"
            >
              OK
            </button>
            <button
              onClick={() => setEditingEvent(false)}
              className="px-3 py-1 rounded bg-white/10 text-white text-sm"
            >
              Annuler
            </button>
          </div>
        )}
      </header>

      {/* Créer un sous-dossier */}
      <form onSubmit={onCreateSub} className="mb-8 flex gap-3 max-w-xl">
        <input
          value={newSub}
          onChange={(e) => setNewSub(e.target.value)}
          placeholder="Nom du sous-dossier"
          className="flex-1 px-3 py-2 rounded border bg-white/5 text-white"
        />
        <button
          disabled={creating}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
        >
          {creating ? "Création…" : "Ajouter un sous-dossier"}
        </button>
      </form>

      {err && <p className="text-red-300 mb-4">⚠️ {err}</p>}

      {/* Sous-dossiers */}
      {subfolders.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Sous-dossiers</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {subfolders.map((sf) => {
              const cover = covers[sf.path] ?? null;
              const openUrl = `/galerie?tab=images&folder=${encodeURIComponent(sf.path)}`;
              const isEditing = editingPath === sf.path;

              return (
                <div
                  key={sf.path}
                  className="group relative overflow-hidden rounded-2xl border border-white/25 bg-white/5 hover:shadow-lg transition"
                >
                  <a href={openUrl} className="block">
                    <div className="aspect-video w-full overflow-hidden bg-black/30">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={sf.name}
                          width={800}
                          height={450}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-white/80">
                          📁 {sf.name}
                        </div>
                      )}
                    </div>
                  </a>

                  <div className="p-3">
                    {!isEditing ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium truncate">{sf.name}</div>
                        <div className="flex items-center gap-2">
                          <a
                            href={openUrl}
                            className="px-2 py-1 rounded bg-white/10 text-white text-sm hover:bg-white/20"
                          >
                            Ouvrir
                          </a>
                          <UploadToCloudinary
                            folder={sf.path}
                            onDone={async () => {
                              await refreshCovers();
                            }}
                          />
                          <button
                            onClick={() => onStartRenameSub(sf.path, sf.name)}
                            className="px-2 py-1 rounded bg-white/10 text-white text-sm hover:bg-white/20"
                          >
                            Renommer
                          </button>
                          <button
                            onClick={() => onDeleteSub(sf.path)}
                            className="px-2 py-1 rounded bg-red-600/80 text-white text-sm hover:bg-red-600"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 px-2 py-1 rounded border bg-white/5 text-white"
                          placeholder="Nouveau nom"
                        />
                        <button
                          onClick={onConfirmRenameSub}
                          className="px-2 py-1 rounded bg-black text-white text-sm"
                        >
                          OK
                        </button>
                        <button
                          onClick={onCancelRenameSub}
                          className="px-2 py-1 rounded bg-white/10 text-white text-sm"
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Médias du dossier racine */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Médias (dossier racine)</h2>
        {!rootItems.length ? (
          <p className="text-white/80">Aucun média dans le dossier racine.</p>
        ) : (
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
            {rootItems.map((m, i) => {
              const k = (m.kind || "image") as Kind;
              const ext = (m.format || "").toLowerCase();
              return (
                <article
                  key={m.public_id || i}
                  className="relative overflow-hidden rounded-lg border border-white/20 bg-white/5"
                >
                  <div className="aspect-video bg-black/30">
                    {k === "image" ? (
                      <Image
                        src={m.thumb ?? m.url}
                        alt={m.title || ""}
                        width={800}
                        height={600}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : k === "video" ? (
                      <video
                        src={m.url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        controls
                      />
                    ) : k === "audio" ? (
                      <div className="w-full h-full grid place-items-center p-3">
                        <div className="text-lg">🎵 {m.title || m.public_id}</div>
                        <audio
                          className="mt-2 w-[95%]"
                          src={m.url}
                          controls
                          preload="none"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full grid place-items-center p-3">
                        <div className="text-base sm:text-lg">
                          📄 {m.title || m.public_id}
                          {ext ? `.${ext}` : ""}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
