// components/NavBar.js

import Link from 'next/link';
import { useState } from 'react';

export default function NavBar() {
  const [showEvents, setShowEvents] = useState(false);

  return (
    <nav className="bg-gray-900 text-white flex justify-between items-center px-6 py-3">
      <div className="text-2xl font-bold">
        <Link href="/">Famille</Link>
      </div>
      <ul className="flex gap-6">
        <li><Link href="/">Accueil</Link></li>
        <li
          className="relative"
          onMouseEnter={() => setShowEvents(true)}
          onMouseLeave={() => setShowEvents(false)}
        >
          <span className="cursor-pointer">Événements ▼</span>
          {showEvents && (
            <ul className="absolute left-0 bg-gray-800 shadow rounded mt-2 w-52 z-20">
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
