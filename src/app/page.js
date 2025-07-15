// src/app/page.js
export default function Page() {
  return (
    <>
      <main className="relative h-screen overflow-hidden">
        {/* Vidéo de fond */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/video.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Menu fixe */}
        <nav className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur py-4 z-10">
          <ul className="container mx-auto flex justify-center gap-8 text-white">
            <li><a href="#story">Notre Histoire</a></li>
            <li><a href="#gallery">Galerie</a></li>
            <li><a href="#programme">Programme</a></li>
            <li><a href="#message">Laisser un message</a></li>
          </ul>
        </nav>

        {/* Contenu centré */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
          <h1 className="text-5xl font-serif">Grace &amp; Stone</h1>
          <p className="mt-4 text-lg">Samedi 09 Août 2025</p>
          <button className="mt-8 px-6 py-3 border border-white hover:bg-white/20 transition rounded">
            Réservez la date
          </button>
        </div>
      </main>

      {/* Sections sous la vidéo */}
      <section id="story" className="py-20 bg-white text-center">
        {/* ...ton contenu Histoire... */}
      </section>

      <section id="gallery" className="py-20 bg-gray-100">
        {/* ...galerie... */}
      </section>

      <section id="programme" className="py-20 bg-white">
        {/* ...programme... */}
      </section>

      <section id="message" className="py-20 bg-gray-100">
        {/* ...formulaire de message... */}
      </section>
    </>
  )
}
