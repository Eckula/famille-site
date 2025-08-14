// app/components/Nav.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const onClick = (e) => {
      if (!open) return;
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        !btnRef.current.contains(e.target)
      ) setOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [open]);

  const Item = ({ href, children }) => (
    <Link href={href} prefetch={false} className="hover:text-yellow-300 transition whitespace-nowrap">
      {children}
    </Link>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-40">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mt-4 grid grid-cols-3 items-center rounded-full border border-white/30 bg-black/35 px-4 py-2 text-white backdrop-blur">
          {/* Liens desktop */}
          <div className="hidden md:flex items-center gap-5 text-sm">
            <Item href="/galerie?tab=all">Galerie</Item>
            <Item href="/galerie?tab=images">Photos</Item>
            <Item href="/galerie?tab=videos">Vidéos</Item>
            <Item href="/galerie?tab=documents">Documents</Item>
            <Item href="/albums">Albums</Item>
            <Item href="/evenements">Événements</Item>
            <Item href="/jeux/snake">Jeux</Item>
          </div>

          {/* Titre centré — on masque “– Accueil” sur mobile */}
          <div className="text-center text-base sm:text-lg font-bold truncate">
            <Link href="/" className="hover:text-yellow-300 transition whitespace-nowrap">
              Famille Merenge<span className="hidden sm:inline"> – Accueil</span>
            </Link>
          </div>

          {/* Admin + burger mobile */}
          <div className="flex items-center justify-end gap-3">
            <Link href="/admin" className="hidden md:inline-block rounded-full border border-white/30 px-3 py-1.5 hover:bg-white/10">
              Admin
            </Link>
            <button
              ref={btnRef}
              type="button"
              aria-label="Ouvrir le menu"
              aria-expanded={open}
              onClick={() => setOpen(v => !v)}
              className="md:hidden inline-flex items-center justify-center rounded-full border border-white/30 px-3 py-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-300/60"
            >
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <div className="md:hidden">
          <div className="fixed inset-0 z-30 bg-black/50" aria-hidden="true" />
          <div
            ref={panelRef}
            className="fixed right-3 left-3 top-20 z-40 rounded-2xl border border-white/30 bg-black/85 p-4 text-white backdrop-blur"
            role="menu" aria-label="Menu"
          >
            <div className="grid gap-2">
              <Link href="/galerie?tab=all" className="rounded-lg px-3 py-2 hover:bg-white/10" onClick={() => setOpen(false)}>Galerie</Link>
              <Link href="/galerie?tab=images" className="rounded-lg px-3 py-2 hover:bg-white/10" onClick={() => setOpen(false)}>Photos</Link>
              <Link href="/galerie?tab=videos" className="rounded-lg px-3 py-2 hover:bg-white/10" onClick={() => setOpen(false)}>Vidéos</Link>
              <Link href="/galerie?tab=documents" className="rounded-lg px-3 py-2 hover:bg-white/10" onClick={() => setOpen(false)}>Documents</Link>
              <Link href="/albums" className="rounded-lg px-3 py-2 hover:bg-white/10" onClick={() => setOpen(false)}>Albums</Link>
              <Link href="/evenements" className="rounded-lg px-3 py-2 hover:bg-white/10" onClick={() => setOpen(false)}>Événements</Link>
              <Link href="/jeux/snake" className="rounded-lg px-3 py-2 hover:bg-white/10" onClick={() => setOpen(false)}>Jeux</Link>
              <Link href="/admin" className="rounded-lg px-3 py-2 hover:bg-white/10" onClick={() => setOpen(false)}>Admin</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
