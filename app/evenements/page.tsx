// app/evenements/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Folder = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
};

type CoverMap = Record<string, string | null>;

const EVENTS_PARENT_NAME = "Evenements";         // nom du dossier parent en DB (sans accent)
const CLOUD_ROOT = "famille/Evenements";         // chemin Cloudinary

function parseEventMeta(name: string) {
  // 2025-08-20 • Titre [EVT]  |  2025_08_20 - Titre
  const m = name.match(
    /^\s*(\d{4})[-_/\.](\d{2})[-_/\.](\d{2})\s*[•\-–]?\s*(.*?)(?:\s*\[EVT\])?\s*$/i
  );
  if (!m) {
    return {
      date: null as Date | null,
      title: name.replace(/\s*\[EVT\]\s*$/i, "").trim() || name,
    };
  }
  const [, Y, M, D, rest] = m;
  const dt = new Date(Number(Y), Number(M) - 1, Number(D));
  return { date: isNaN(+dt) ? null : dt, title: (rest || "").trim() || name };
}

function isEventFolder(f: Folder) {
  return /\[EVT\]/i.test(f.name) || /^\s*\d{4}[-_/\.]\d{2}[-_/\.]\d{2}/.test(f.name);
}

async function getJSON<T = any>(url: string): Promise<T> {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export default function EventsPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [covers, setCovers] = useState<CoverMap>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // formulaire
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState("");

  // ---- Chargement des dossiers enfants d'Evenements ----
  async function refresh() {
    setLoading(true);
    setErr("");
    try {
      const j = await getJSON<{ items: Folder[] }>(
        `/api/folders?parentName=${encodeURIComponent(EVENTS_PARENT_NAME)}`
      );
      setFolders(Array.isArray(j?.items) ? j.items : []);
    } catch (e: any) {
      setErr(e?.message || "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  // ---- Tri + parsing métadonnées ----
  const events = useMemo(() => {
    const list = folders.filter(isEventFolder).map((f) => ({ f, meta: parseEventMeta(f.name) }));
    return list.sort((a, b) => {
      const da = a.meta.date?.getTime() ?? new Date(a.f.createdAt).getTime();
      const db = b.meta.date?.getTime() ?? new Date(b.f.createdAt).getTime();
      return db - da;
    });
  }, [folders]);

  // ---- Couvertures (1re image par dossier via /api/media/list) ----
  useEffect(() => {
    let stop = false;
    (async () => {
      const queue = [...events];
      const concurrency = 4;
      const worker = async () => {
        const it = queue.shift();
        if (!it || stop) return;
        try {
          const u = new URL("/api/media/list", window.location.origin);
          u.searchParams.set("folderId", it.f.id); // la route sait mapper sur appFolderId
          u.searchParams.set("tab", "images");
          const j: any = await getJSON(u.toString());
          const first = Array.isArray(j?.items) ? j.items[0] : null;
          setCovers((m) => ({ ...m, [it.f.id]: first?.thumb || first?.url || null }));
        } catch {
          setCovers((m) => ({ ...m, [it.f.id]: null }));
        }
        await worker();
      };
      await Promise.all(Array.from({ length: concurrency }, worker));
    })();
    return () => {
      stop = true;
    };
  }, [events]);

  // ---- Création d'un événement ----
  async function createEvent() {
    const niceName = `${date} • ${title || "Événement"} [EVT]`;
    try {
      // 1) dossier Cloudinary
      let r = await fetch("/api/media/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: `${CLOUD_ROOT}/${niceName}` }),
      });
      let j = await r.json();
      if (!r.ok || j?.error) throw new Error(j?.error || `HTTP ${r.status}`);

      // 2) dossier DB sous "Evenements"
      r = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: niceName, parentName: EVENTS_PARENT_NAME }),
      });
      j = await r.json();
      if (!r.ok || j?.error) throw new Error(j?.error || `HTTP ${r.status}`);

      setTitle("");
      await refresh();
    } catch (e: any) {
      alert(e?.message || "Création impossible.");
    }
  }

  // ---- UI ----
  return (
    <main className="px-6 py-24 text-white">
      <h1 className="mb-2 text-3xl font-bold">Événements</h1>
      <p className="text-white/80 mb-4">
        Sous-dossiers de <code>{CLOUD_ROOT}</code> (format :{" "}
        <code>YYYY-MM-DD • Titre [EVT]</code>).
      </p>

      {/* Formulaire création */}
      <div className="mb-6 flex gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded border border-white/25 bg-black/30 px-3 py-2"
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre"
          className="flex-1 rounded border border-white/25 bg-black/30 px-3 py-2"
        />
        <button
          onClick={createEvent}
          className="rounded bg-emerald-400 px-3 py-2 text-black hover:bg-emerald-300"
        >
          Créer l’événement
        </button>
      </div>

      {err && <p className="mb-3 text-red-300">⚠️ {err}</p>}

      {loading ? (
        <p className="text-white/70">Chargement…</p>
      ) : events.length === 0 ? (
        <p className="text-white/80">Aucun événement.</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {events.map(({ f, meta }) => {
            const cover = covers[f.id];
            const when =
              meta.date?.toLocaleDateString("fr-FR") ??
              new Date(f.createdAt).toLocaleDateString("fr-FR");
            return (
              <Link
                key={f.id}
                prefetch={false}
                href={`/galerie?tab=all&view=folder&folderId=${encodeURIComponent(f.id)}`}
                className="group relative overflow-hidden rounded-2xl border border-white/25 bg-white/5 shadow-sm hover:shadow-lg transition"
              >
                <div className="aspect-video w-full overflow-hidden bg-black/30">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={meta.title}
                      width={800}
                      height={450}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-white/80">
                      📁 {meta.title}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="text-sm text-white/80">{when}</div>
                  <h2 className="text-lg font-semibold drop-shadow">{meta.title}</h2>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
