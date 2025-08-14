// app/evenements/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function EvenementsPage() {
  const [title, setTitle] = useState("");
  const [date, setDate]   = useState<string>("");
  const [msg, setMsg]     = useState("");

  function slugify(s: string) {
    return s.trim().toLowerCase()
      .normalize("NFD").replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  async function createEvent() {
    setMsg("");
    if (!title.trim()) { setMsg("Titre requis."); return; }

    // Nom dossier : famille/Evenements/YYYY-MM_Nom
    const d = date ? new Date(date) : new Date();
    const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const folder = `famille/Evenements/${ym}_${slugify(title)}`;

    const res = await fetch("/api/folders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder }),
    });
    const j = await res.json();
    if (!res.ok) { setMsg(j?.error || "Erreur création dossier."); return; }
    setMsg(`✅ Événement créé : ${folder}`);

    // Lien pratique vers l'upload pré-rempli
    // Tu peux ensuite choisir Sous-dossier = "Evenements/..."
  }

  return (
    <main className="px-6 py-24 text-white">
      <h1 className="text-3xl font-bold mb-2">Événements</h1>
      <p className="mb-6 text-white/80">Crée des dossiers d’événements sous <code>famille/Evenements</code>.</p>

      <div className="max-w-xl space-y-3 rounded-lg border border-white/20 bg-black/30 p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de l’événement (ex: Anniversaire Paul)"
          className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none"
        />
        <label className="text-sm text-white/70">Date (facultatif)</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none"
        />
        <button
          onClick={createEvent}
          className="px-4 py-2 rounded-lg bg-yellow-500 text-black hover:bg-yellow-400"
        >
          Créer le dossier
        </button>

        {msg && <p className="text-sm">{msg}</p>}

        <div className="pt-2 text-sm text-white/70">
          Ensuite, va sur <Link className="underline" href="/admin/upload">/admin/upload</Link> et mets
          <br/>Rubrique = <b>Photos</b> (ou autre) et Sous-dossier = <code>Evenements/…</code>
        </div>
      </div>
    </main>
  );
}
