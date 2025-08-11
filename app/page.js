// app/page.js
import GalleryLightbox from "./components/GalleryLightbox";

export default function Home() {
  // Remplace ces URLs par tes fichiers locaux si tu veux (ex: /photos/1.jpg)
  const gallery = Array.from({ length: 12 }).map((_, i) => ({
    thumb: `https://picsum.photos/seed/f${i + 1}/600/400`,
    full:  `https://picsum.photos/seed/f${i + 1}/1600/1000`,
  }));

  const timeline = [
    {
      date: "15 septembre 2025",
      title: "Anniversaire de Léa",
      location: "À la maison",
      desc: "Gâteau, jeux et photos en famille.",
      image: "https://picsum.photos/seed/event1/1200/600",
    },
    {
      date: "3–5 octobre 2025",
      title: "Weekend à la mer",
      location: "Côte Atlantique",
      desc: "Balades sur la plage et coucher de soleil.",
      image: "https://picsum.photos/seed/event2/1200/600",
    },
  ];

  return (
    <main className="">
      {/* Header */}
      <header className="px-6 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-md text-white">
          La Famille Dupont
        </h1>
        <p className="mt-4 text-lg md:text-xl text-white/90 drop-shadow">
          Moments partagés • Souvenirs • Projets
        </p>
      </header>

      {/* 3 cartes */}
      <section className="px-6 max-w-6xl mx-auto -mt-2">
        <div className="grid gap-6 md:grid-cols-3">
          <a href="#galerie" className="rounded-2xl border border-white/40 bg-white/85 dark:bg-slate-900/80 p-6 shadow-sm hover:shadow-md transition">
            <div className="aspect-video overflow-hidden rounded-lg">
              <img src="https://picsum.photos/seed/famille-photos/800/450" alt="Photos" className="w-full h-full object-cover" />
            </div>
            <h3 className="mt-4 text-xl font-semibold">Photos</h3>
            <p className="mt-1 text-slate-700 dark:text-slate-300">Une sélection d’images souvenirs.</p>
          </a>

          <a href="#videos" className="rounded-2xl border border-white/40 bg-white/85 dark:bg-slate-900/80 p-6 shadow-sm hover:shadow-md transition">
            <div className="aspect-video overflow-hidden rounded-lg">
              <img src="https://picsum.photos/seed/famille-videos/800/450" alt="Vidéos" className="w-full h-full object-cover" />
            </div>
            <h3 className="mt-4 text-xl font-semibold">Vidéos</h3>
            <p className="mt-1 text-slate-700 dark:text-slate-300">Regardez nos clips et vlogs.</p>
          </a>

          <a href="#evenements" className="rounded-2xl border border-white/40 bg-white/85 dark:bg-slate-900/80 p-6 shadow-sm hover:shadow-md transition">
            <div className="aspect-video overflow-hidden rounded-lg">
              <img src="https://picsum.photos/seed/famille-events/800/450" alt="Événements" className="w-full h-full object-cover" />
            </div>
            <h3 className="mt-4 text-xl font-semibold">Événements</h3>
            <p className="mt-1 text-slate-700 dark:text-slate-300">Anniversaires, voyages et sorties.</p>
          </a>
        </div>
      </section>

      {/* Galerie interactive */}
      <section id="galerie" className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white drop-shadow">Galerie</h2>
        <p className="mt-2 text-white/90">Clique sur une image pour l’agrandir.</p>
        <GalleryLightbox images={gallery} />
      </section>

      {/* Vidéos */}
      <section id="videos" className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white drop-shadow">Vidéos</h2>
        <p className="mt-2 text-white/90">Exemple d’intégration YouTube.</p>
        <div className="mt-6 aspect-video overflow-hidden rounded-2xl border border-white/40 bg-black/80">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="Exemple YouTube"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>

      {/* Timeline */}
      <section id="evenements" className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-white drop-shadow">Événements</h2>
        <p className="mt-2 text-white/90">Nos moments marquants.</p>
        <ol className="relative pl-10 mt-6 before:absolute before:inset-y-0 before:left-4 before:w-px before:bg-white/40">
          {timeline.map((it, i) => (
            <li key={i} className="mb-8 last:mb-0 relative">
              <span className="absolute left-3.5 top-1.5 inline-flex h-3 w-3 rounded-full bg-indigo-400 ring-4 ring-white/60"></span>
              <div className="rounded-xl border border-white/40 bg-white/85 dark:bg-slate-900/80 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <time className="text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300">{it.date}</time>
                  {it.location && <span className="text-xs text-slate-700 dark:text-slate-300">• {it.location}</span>}
                </div>
                <h3 className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{it.title}</h3>
                {it.desc && <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{it.desc}</p>}
                {it.image && <img src={it.image} alt="" className="mt-3 w-full max-h-60 object-cover rounded-lg" />}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 text-center text-sm text-white/80">
        © {new Date().getFullYear()} Famille Dupont. Tous droits réservés.
      </footer>
    </main>
  );
}
