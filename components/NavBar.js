// components/NavBar.js
"use client";
import Link from 'next/link';
import { useState } from 'react';

export default function NavBar() {
  const [showEvents, setShowEvents] = useState(false);

  return (
    <nav className="bg-black/60 text-white flex items-center px-6 py-3 fixed top-0 inset-x-0 z-30 backdrop-blur">
      <div className="text-2xl font-bold flex-1">
        <Link href="/">Famille</Link>
      </div>
      <ul className="flex gap-6 text-base font-medium">
        <li><Link href="/">Accueil</Link></li>
        <li
          className="relative"
          onMouseEnter={() => setShowEvents(true)}
          onMouseLeave={() => setShowEvents(false)}
        >
          <span className="cursor-pointer">Événements ▼</span>
          {showEvents && (
            <ul className="absolute left-0 bg-gray-800 text-sm shadow rounded mt-2 w-56 z-20">
              <li className="px-4 py-2 hover:bg-gray-700"><Link href="/evenements/anniversaires">Anniversaires</Link></li>
              <li className="px-4 py-2 hover:bg-gray-700"><Link href="/evenements/naissances">Naissances</Link></li>
              <li className="px-4 py-2 hover:bg-gray-700"><Link href="/evenements/deces">Décès</Link></li>
              <li className="px-4 py-2 hover:bg-gray-700"><Link href="/evenements/bac">Bac</Link></li>
              <li className="px-4 py-2 hover:bg-gray-700"><Link href="/evenements/remise-diplome">Remise diplôme</Link></li>
              <li className="px-4 py-2 hover:bg-gray-700"><Link href="/evenements/collation">Collation</Link></li>
              <li className="px-4 py-2 hover:bg-gray-700"><Link href="/evenements/autres">Autres</Link></li>
            </ul>
          )}
        </li>
        <li><Link href="/sante">Santé</Link></li>
        <li><Link href="/photos">Photos</Link></li>
        <li><Link href="/videos">Vidéos</Link></li>
        <li><Link href="/projets">Projets</Link></li>
        <li><Link href="/contact">Contact</Link></li>
      </ul>
    </nav>
  );
}
