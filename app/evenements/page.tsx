// app/evenements/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/* ===================== Types ===================== */
type Folder = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
};

/* ===================== Fetch helpers ===================== */
async function getJSON<T = any>(url: string): Promise<T> {
  const r = await fetch(url, { cache: "no-store" });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || (j as any)?.error) throw new Error((j as any)?.error || `HTTP ${r.status}`);
  return j as T;
}
async function patchFolder(
  id: string,
  data: Partial<{ name: string; parentId: string | null }>
) {
  const r = await fetch("/api/folders", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...data }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j?.error) throw new Error(j?.error || `HTTP ${r.status}`);
  return j;
}
async function deleteFolder(id: string) {
  const r = await fetch("/api/folders", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j?.error) throw new Error(j?.error || `HTTP ${r.status}`);
  return j;
}

/* ===================== Nom d’évènement ===================== */
// Accepte: "YYYY-MM-DD • Titre [EVT]" ou variantes avec / . -  et sans titre.
function parseEventMeta(name: string): { date?: Date; title?: string } {
  const s = name.trim();

  let m = s.match(
    /^(\d{4})[\/\-.](\d{2})[\/\-.](\d{2})(?:\s*[•\-–]\s*(.*?))?(?:\s*\[(?:EVT|EVENT)\])?$/i
  );
  if (m) {
    const y = Number(m[1]),
      mo = Number(m[2]),
      d = Number(m[3]);
    const date = new Date(Date.UTC(y, mo - 1, d));
    const title = (m[4] || "").trim() || undefined;
    return { date, title };
  }

  m = s.match(/^(\d{4})[\/\-.](\d{2})[\/\-.](\d{2})$/);
  if (m) {
    const y = Number(m[1]),
      mo = Number(m[2]),
      d = Number(m[3]);
    return { date: new Date(Date.UTC(y, mo - 1, d)) };
  }

  return {};
}
function formatEventName(date: Date, title: string) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const t = title.trim().replace(/\s+/g, " ");
  return `${y}-${m}-${d} • ${t} [EVT]`;
}

/* ===================== Page ===================== */
export default function EvenementsPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [events, setEvents] = useState<Folder[]>([]);
  const [q, setQ] = useState("");

  // Compteurs de médias par dossier (facultatif si /api/folders/map existe)
  const [countMap, setCountMap] = useState<Record<string, number>>({});

  // Formulaire de création
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState("");

  async function refresh() {
    setLoading(true);
    setErr("");
    try {
      const res = await getJSON<{ items: Folder[] }>("/api/folders?parentName=Evenements");
      setEvents(Array.isArray(res?.items) ? res.items : []);

      try {
        const m = await getJSON<{
          counts?: Record<string, number>;
          mediaCount?: Record<string, number>;
          mediaCountByFolderId?: Record<string, number>;
          byFolderId?: Record<string, number>;
        }>("/api/folders/map");
        const map =
          m.counts || m.mediaCount || m.mediaCountByFolderId || m.byFolderId || {};
        setCountMap(map);
      } catch {
        setCountMap({});
      }
    } catch (e: any) {
      setErr(e?.message || "Erreur chargement évènements");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return events;
    return events.filter((f) => f.name.toLowerCase().includes(s) || f.id.toLowerCase().includes(s));
  }, [events, q]);

  /* ---------- Renommer ---------- */
  async function onRename(f: Folder) {
    const meta = parseEventMeta(f.name);
    const baseDate = meta.date || new Date(f.createdAt);
    const currentTitle = meta.title || "";

    const newTitle = prompt("Nouveau titre de l’évènement :", currentTitle)?.trim();
    if (!newTitle) return;

    try {
      const newName = formatEventName(baseDate, newTitle);
      await patchFolder(f.id, { name: newName });
      await refresh();
    } catch (e: any) {
      alert(e?.message || "Renommage impossible.");
    }
  }

  /* ---------- Supprimer ---------- */
  async function onDelete(f: Folder) {
    if (!confirm(`Supprimer l’évènement "${f.name}" ?`)) return;
    try {
      await deleteFolder(f.id);
      await refresh();
    } catch (e: any) {
      alert(e?.message || "Suppression impossible.");
    }
  }

  /* ---------- Créer ---------- */
  async function onCreate() {
    try {
      // 1) Nom propre
      const safeDate = new Date(`${dateStr}T00:00:00Z`);
      const nice = formatEventName(safeDate, title || "Événement");

      // 2) Dossier Cloudinary (soft-fail si l’API n’existe pas)
      try {
        const path = `famille/Evenements/${nice}`; // adapte si ton root diffère
        const r = await fetch("/api/media/folders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path }),
        });
        const j = await r.json().catch(() => ({}));
        // pas bloquant si 404 sur cette route — on continue
        if (!r.ok && !j?.ok && !j?.created) {
          // eslint-disable-next-line no-console
          console.warn("Création Cloudinary: warning", j);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Création Cloudinary: ignorée", e);
      }

      // 3) Dossier DB sous "Evenements"
      const r2 = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nice, parentName: "Evenements" }),
      });
      const j2 = await r2.json().catch(() => ({}));
      if (!r2.ok || j2?.error) throw new Error(j2?.error || `HTTP ${r2.status}`);

      // reset + refresh
      setTitle("");
      await refresh();
    } catch (e: any) {
      alert(e?.message || "Création impossible.");
    }
  }

  return (
    <main className="px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-3xl font-bold">Événements</h1>

        {/* Recherche */}
        <div className="flex w-full max-w-xl items-center gap-2 sm:w-auto">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher par nom ou ID…"
            className="w-full rounded border border-white/20 bg-black/40 px-3 py-2 text-white placeholder-white/50 sm:w-72"
          />
          <button
            onClick={() => setQ("")}
            className="rounded border border-white/20 px-3 py-2 text-white/80 hover:bg-white/10"
          >
            Effacer
          </button>
        </div>
      </div>

      {/* Formulaire de création */}
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="text-sm text-white/70">Date</label>
        <input
          type="date"
          value={dateStr}
          onChange={(e) => setDateStr(e.target.value)}
          className="w-[180px] rounded border border-white/20 bg-black/40 px-3 py-2 text-white"
        />
        <label className="text-sm text-white/70 sm:ml-4">Titre</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de l’évènement"
          className="flex-1 rounded border border-white/20 bg-black/40 px-3 py-2 text-white"
        />
        <button
          onClick={onCreate}
          className="rounded bg-emerald-400 px-3 py-2 font-medium text-black hover:bg-emerald-300 sm:ml-2"
        >
          Créer l’évènement
        </button>
      </div>

      {err && <p className="mb-3 text-red-300">⚠️ {err}</p>}

      {loading ? (
        <p className="text-white/70">Chargement…</p>
      ) : list.length === 0 ? (
        <p className="text-white/70">Aucun évènement.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((f) => {
            const c = countMap[f.id] ?? 0;
            const meta = parseEventMeta(f.name);
            const display =
              meta?.title || f.name; // si tu veux n’afficher que le titre épuré
            return (
              <div
                key={f.id}
                className="group relative overflow-hidden rounded-xl border border-white/15 bg-white/5"
              >
                <div className="p-4">
                  <div className="mb-1 truncate text-lg font-semibold">{display}</div>
                  <div className="truncate text-xs text-white/60">{f.id}</div>
                </div>

                {/* Actions */}
                <div className="absolute right-2 top-2 flex gap-2">
                  <button
                    onClick={() => onRename(f)}
                    className="rounded bg-white/90 px-2 py-1 text-black hover:bg-white"
                    title="Renommer l’évènement"
                  >
                    Renommer
                  </button>
                  <button
                    onClick={() => onDelete(f)}
                    className="rounded bg-rose-500 px-2 py-1 text-black hover:bg-rose-400"
                    title="Supprimer l’évènement"
                  >
                    Supprimer
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-white/10 p-3">
                  <div className="text-sm text-white/70">{c} média{c > 1 ? "s" : ""}</div>
                  <Link
                    href={`/galerie?tab=all&view=folder&folderId=${encodeURIComponent(f.id)}`}
                    className="rounded bg-white/15 px-3 py-1.5 text-white hover:bg-white/25"
                    prefetch={false}
                  >
                    Ouvrir
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
