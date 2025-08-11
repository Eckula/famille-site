export const metadata = { title: "Événements — Famille Merenge" };

export default function Evenements() {
  const timeline = [
    { date: "15 sept. 2025", title: "Anniversaire de Léa", location: "À la maison",
      desc: "Gâteau, jeux et photos.", image: "https://picsum.photos/seed/event1/1200/600" },
    { date: "3–5 oct. 2025", title: "Weekend à la mer", location: "Côte Atlantique",
      desc: "Balades et coucher de soleil.", image: "https://picsum.photos/seed/event2/1200/600" },
  ];

  return (
    <main className="px-6 py-12 max-w-5xl mx-auto">
      <h1 className="text-4xl font-extrabold text-white drop-shadow">Événements</h1>
      <ol className="relative pl-10 mt-6 before:absolute before:inset-y-0 before:left-4 before:w-px before:bg-white/40">
        {timeline.map((it, i) => (
          <li key={i} className="mb-8 last:mb-0 relative">
            <span className="absolute left-3.5 top-1.5 inline-flex h-3 w-3 rounded-full bg-indigo-400 ring-4 ring-white/60" />
            <div className="rounded-xl border border-white/40 bg-white/85 dark:bg-slate-900/80 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <time className="text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300">{it.date}</time>
                <span className="text-xs text-slate-700 dark:text-slate-300">• {it.location}</span>
              </div>
              <h3 className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{it.title}</h3>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{it.desc}</p>
              <img src={it.image} alt="" className="mt-3 w-full max-h-60 object-cover rounded-lg" />
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
