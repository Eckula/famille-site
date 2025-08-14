import Link from "next/link";
import Image from "next/image";

const cards = [
  { 
    title: "Photos",   
    desc: "Une sélection d’images souvenirs.", 
    href: "/galerie?tab=images",   
    img: "/images/photos.jpg"   
  },
  { 
    title: "Vidéos",   
    desc: "Regardez nos clips et vlogs.", 
    href: "/galerie?tab=videos",   
    img: "/images/videos.jpg"   
  },
  { 
    title: "Événements", 
    desc: "Anniversaires, voyages et sorties.", 
    href: "/evenements", 
    img: "/images/evenements.jpg" 
  },
  { 
    title: "Albums",   
    desc: "Classés par thème ou par date.", 
    href: "/albums",   
    img: "/images/albums.jpg"   
  },
  { 
    title: "Documents", /* correction → filtre direct */
    desc: "PDF et fichiers partagés.", 
    href: "/galerie?tab=documents",     
    img: "/images/docs.jpg"     
  },
  { 
    title: "Admin",    
    desc: "Espace réservé aux membres.", 
    href: "/admin",    
    img: "/images/admin.jpg"    
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen text-white">
      {/* Bandeau d'intro */}
      <section className="flex flex-col items-center justify-center text-center pt-24 pb-8 px-6">
        <h1 className="text-5xl font-extrabold drop-shadow-lg">
          Famille Merenge – Accueil
        </h1>
        <p className="mt-4 text-lg max-w-2xl drop-shadow">
          Bienvenue sur notre espace familial — retrouvez photos, vidéos, souvenirs et événements importants.
        </p>
      </section>

      {/* Grille de cartes */}
      <section className="max-w-6xl mx-auto px-6 pb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group relative overflow-hidden rounded-2xl border border-white/25 bg-white/5 shadow-sm hover:shadow-lg transition"
          >
            {/* Image optimisée */}
            <div className="aspect-video w-full overflow-hidden">
              <Image
                src={c.img}
                alt={c.title}
                width={800}
                height={450}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Dégradé bas */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
            </div>

            {/* Texte */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h2 className="text-xl font-semibold drop-shadow">{c.title}</h2>
              <p className="text-sm text-white/90">{c.desc}</p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
