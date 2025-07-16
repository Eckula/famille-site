// src/app/page.js
export default function Page() {
  return (
    <>
      <main className="relative h-screen overflow-hidden">
-       <video
+       <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/video2.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

+       {/* superpose un léger voile noir pour mieux lire le texte */}
+       <div className="absolute inset-0 bg-black/30 pointer-events-none" />

        {/* Menu fixe */}
-       <nav className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur py-4 z-10">
+       <nav className="fixed inset-x-0 top-0 bg-black/60 backdrop-blur-md py-6 z-20">
          <ul className="container mx-auto flex justify-center gap-8 text-white">
            <li><a href="#story">Notre Histoire</a></li>
            <li><a href="#gallery">Galerie</a></li>
            <li><a href="#programme">Programme</a></li>
            <li><a href="#message">Laisser un message</a></li>
          </ul>
        </nav>

        {/* Contenu centré */}
-       <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
+       <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-6 pt-16">
          <h1 className="text-5xl font-serif drop-shadow-lg">Famille MERENGE</h1>
          <p className="mt-2 text-lg drop-shadow-md">Suivez nous</p>
          <button className="mt-8 px-6 py-3 border border-white hover:bg-white/20 transition rounded">
            La Victoire
          </button>
        </div>
      </main>

      {/* pour que la section suivante ne soit pas sous le menu */}
      <section id="story" className="pt-24 pb-20 bg-white text-center">
        {/* …ton contenu Histoire… */}
      </section>
      {/* … etc. … */}
    </>
  )
}
