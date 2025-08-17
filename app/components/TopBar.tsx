// app/components/TopBar.tsx
"use client";

import Link from "next/link";
import WeatherBadge from "@/app/components/WeatherBadge";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/15 bg-black/60 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2 text-white">
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/">Galerie</Link>
          <Link href="/photos">Photos</Link>
          <Link href="/videos">Vidéos</Link>
          <Link href="/documents">Documents</Link>
          <Link href="/albums">Albums</Link>
          <Link href="/evenements">Événements</Link>
          <Link href="/jeux">Jeux</Link>
          <Link href="/admin" className="rounded-full border border-white/20 px-2 py-0.5">
            Admin
          </Link>
        </nav>

        <div className="ml-auto">
          <WeatherBadge />
        </div>
      </div>
    </header>
  );
}
