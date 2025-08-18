// app/components/Nav.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  // ✅ Galerie pointe maintenant vers /galerie?tab=all&view=unassigned
  { href: "/galerie?tab=all&view=unassigned", label: "Galerie" },
  { href: "/photos", label: "Photos" },
  { href: "/videos", label: "Vidéos" },
  { href: "/documents", label: "Documents" },
  { href: "/albums", label: "Albums" },
  { href: "/evenements", label: "Événements" },
  { href: "/jeux", label: "Jeux" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-x-4 md:gap-x-8 rounded-full border border-white/30 bg-black/35 px-4 py-2 text-white backdrop-blur">
          {/* Liens (desktop) */}
          <div className="hidden gap-3 md:flex">
            {LINKS.map((l) => {
              // ✅ Active state robuste même si l.href a des query params
              const targetPath = l.href.split("?")[0];
              const active = pathname === targetPath;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  prefetch={false}
                  className={`rounded-full px-3 py-1.5 hover:bg-white/10 ${active ? "bg-white/10" : ""}`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Titre centré (laisse / ; si tu veux, remplace par /galerie?tab=all&view=unassigned) */}
          <Link href="/" className="text-center text-lg font-semibold">
            Famille Merenge — Accueil
          </Link>

          {/* Droite : Admin + burger */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/admin"
              className="hidden md:inline-block rounded-full border border-white/30 px-3 py-1.5 hover:bg-white/10"
            >
              Admin
            </Link>

            <button
              ref={btnRef}
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-full border border-white/30 px-3 py-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-300/60"
              aria-label="Ouvrir le menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {open && (
          <div className="mt-2 rounded-2xl border border-white/25 bg-black/70 p-2 text-white backdrop-blur md:hidden">
            <div className="grid gap-1">
              {LINKS.map((l) => {
                const targetPath = l.href.split("?")[0];
                const active = pathname === targetPath;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    prefetch={false}
                    className={`rounded-lg px-3 py-2 hover:bg-white/10 ${active ? "bg-white/10" : ""}`}
                  >
                    {l.label}
                  </Link>
                );
              })}
              <Link href="/admin" className="rounded-lg px-3 py-2 hover:bg-white/10">
                Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
