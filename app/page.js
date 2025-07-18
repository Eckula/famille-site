export default function Page() {
  return (
    <>
      <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Vidéo responsive */}
        <video
          className="fixed inset-0 w-full h-full object-cover object-center"
          src="/video2.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{ zIndex: 0 }}
        />

        {/* Voile noir */}
        <div className="fixed inset-0 bg-black/40" style={{ zIndex: 1 }} />

        {/* Contenu centré */}
        <div className="relative z-10 flex flex-col items-center justify-center h-screen text-white px-6 pt-32">
          <h1 className="text-5xl md:text-7xl font-extrabold drop-shadow-lg text-center">Famille MERENGE</h1>
          <p className="mt-4 text-xl md:text-2xl drop-shadow-md text-center">Suivez nous</p>
          <button className="mt-8 px-8 py-3 border border-white hover:bg-yellow-300 hover:text-black transition rounded text-lg">
            La Victoire
          </button>
        </div>
      </main>
      <section id="story" className="pt-24 pb-20 bg-white text-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Notre Histoire</h2>
        <p className="max-w-2xl mx-auto text-gray-700">
          Ici, vous pouvez raconter l’histoire de votre famille, vos valeurs, vos origines, etc. <br />
          Personnalisez cette section comme vous le souhaitez !
        </p>
      </section>
    </>
  );
}
