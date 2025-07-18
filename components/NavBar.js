// components/NavBar.js
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function NavBar() {
  const pathname = usePathname();
  const [showEvents, setShowEvents] = useState(false);

  // Rubriques et leurs liens
  const navLinks = [
    { name: "Accueil", href: "/" },
    { name: "Santé", href: "/sante" },
    { name: "Photos", href: "/photos" },
    { name: "Vidéos", href: "/videos" },
    { name: "Projets", href: "/projets" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="bg-black/70 text-white px-8 py-4 flex items-center gap-6 fixed top-0 inset-x-0 z-40 shadow backdrop-blur">
      <div className="text-2xl font-bold mr-10">
        <Link href="/">Famille</Link>
      </div>
      <ul className="flex items-center gap-6 text-lg font-semibold">
        {navLinks.map((link) => (
          <li key={link.name}>
            <Link
              href={link.href}
              className={`px-2 py-1 rounded transition
                ${pathname === link.href ? "bg-white text-black" : "hover:bg-white/20 hover:text-yellow-300"}
              `}
            >
              {link.name}
            </Link>
          </li>
        ))}
        {/* Événements menu déroulant */}
        <li
          className="relative"
          onMouseEnter={() => setShowEvents(true)}
          onMouseLeave={() => setShowEvents(false)}
        >
          <span className={`cursor-pointer px-2 py-1 rounded transition ${pathname.startsWith("/evenements") ? "bg-white text-black" : "hover:bg-white/20 hover:text-yellow-300"}`}>
            Événements ▼
          </span>
          {showEvents && (
            <ul className="absolute left-0 mt-2 w-56 bg-black/95 rounded shadow-lg text-base">
              <li>
                <Link href="/evenements/anniversaires" className="block px-4 py-2 hover:bg-yellow-300 hover:text-black transition">Anniversaires</Link>
              </li>
              <li>
                <Link href="/evenements/naissances" className="block px-4 py-2 hover:bg-yellow-300 hover:text-black transition">Naissances</Link>
              </li>
              <li>
                <Link href="/evenements/deces" className="block px-4 py-2 hover:bg-yellow-300 hover:text-black transition">Décès</Link>
              </li>
              <li>
                <Link href="/evenements/bac" className="block px-4 py-2 hover:bg-yellow-300 hover:text-black transition">Bac</Link>
              </li>
              <li>
                <Link href="/evenements/remise-diplome" className="block px-4 py-2 hover:bg-yellow-300 hover:text-black transition">Remise diplôme</Link>
              </li>
              <li>
                <Link href="/evenements/collation" className="block px-4 py-2 hover:bg-yellow-300 hover:text-black transition">Collation</Link>
              </li>
              <li>
                <Link href="/evenements/autres" className="block px-4 py-2 hover:bg-yellow-300 hover:text-black transition">Autres</Link>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
}
