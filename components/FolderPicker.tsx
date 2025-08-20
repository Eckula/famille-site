"use client";

import { useEffect, useState } from "react";

type Folder = { id: string; name: string; parentId: string | null };

export default function FolderPicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (f: Folder) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [list, setList] = useState<Folder[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setErr("");
        setLoading(true);
        // Mini : on propose les sous-dossiers d’"Albums"
        const res = await fetch(`/api/folders?parentName=Albums&ts=${Date.now()}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Erreur chargement");
        setList(json?.folders || json || []); // selon ta route
      } catch (e: any) {
        setErr(e?.message || "Erreur");
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const filtered = q.trim()
    ? list.filter((f) =>
        `${f.name}`.toLowerCase().includes(q.trim().toLowerCase())
      )
    : list;

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-[min(700px,92vw)] max-h-[80vh] overflow-auto rounded-lg bg-zinc-900 text-zinc-100 shadow-xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-3">
          <strong className="text-lg">Choisir un dossier</strong>
          <div className="grow" />
          <button
            onClick={onClose}
            className="px-2 py-1 rounded bg-zinc-700 hover:bg-zinc-600"
          >
            Fermer
          </button>
        </div>

        <input
          placeholder="Rechercher…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-zinc-800 outline-none"
        />

        {loading && <div className="py-8 text-center opacity-80">Chargement…</div>}
        {err && <div className="py-2 text-red-400">{err}</div>}

        {!loading && !err && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filtered.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between gap-2 rounded bg-zinc-800 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{f.name}</div>
                  <div className="text-xs opacity-60 truncate">{f.id}</div>
                </div>
                <button
                  onClick={() => onPick(f)}
                  className="shrink-0 px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500"
                >
                  Choisir
                </button>
              </li>
            ))}
            {!filtered.length && (
              <li className="opacity-70 py-8 text-center col-span-full">
                Aucun dossier
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
