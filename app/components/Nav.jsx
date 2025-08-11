"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  // Fermer avec Échap
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Fermer si clic hors panneau
  useEffect(() => {
    const onClick = (e) => {
      if (!open) return;
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [open]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40">
      <div className="mx-auto max-w-6xl px-4">
        {/* grille à 3 colonnes pour centrer le titre */}
        <div className="mt-4 grid grid-cols-3 items-center rounded-full border border-white/30 bg-black/35 px-4 py-2 text-white backdrop-blur">
          {/* Colonne gauche : liens desktop */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#galerie" className="hover:text-yellow-300 transition">Galerie</a>
            <a href="#videos" className="hover:text-yellow-300 transition">Vidéos</a>
            <a href="#evenements" className="hover:text-yellow-300 transition">Événements</a>
          </div>

          {/* Colonne centre : titre toujours visible et bien centré */}
          <div className="text-center text-base sm:text-lg font-bold">
            <Link href="/" className="hover:text-yellow-300 transition">
              Famille Merenge
            </Link>
          </div>

          {/* Colonne droite : burger mobile */}
          <div className="flex justify-end md:hidden">
            <button
              ref={btnRef}
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-3 py-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-300/60"
              aria-label="Ouvrir le menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Overlay + panneau mobile */}
      {open && (
        <div className="md:hidden">
          <div className="fixed inset-0 z-30 bg-black/50" aria-hidden="true" />
          <div
            ref={panelRef}
            className="fixed right-3 left-3 top-20 z-40 rounded-2xl border border-white/30 bg-black/85 p-4 text-white backdrop-blur"
            role="menu"
            aria-label="Menu de navigation"
          >
            <div className="grid gap-2">
              <a href="#galerie" className="rounded-lg px-3 py-2 hover:bg-white/10" onClick={() => setOpen(false)}>Galerie</a>
              <a href="#videos" className="rounded-lg px-3 py-2 hover:bg-white/10" onClick={() => setOpen(false)}>Vidéos</a>
              <a href="#evenements" className="rounded-lg px-3 py-2 hover:bg-white/10" onClick={() => setOpen(false)}>Événements</a>
              {/* Si tu crées plus tard de vraies pages /photos ou /videos, tu pourras ajouter des <Link href="/photos">…</Link> ici */}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
