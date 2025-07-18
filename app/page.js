export default function Page() {
  return (
    <>
      <main className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden">
        {/* Vidéo de fond responsive */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/video2.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Voile noir pour lisibilité */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Contenu centré */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-6 pt-32">
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg text-center">
            Famille <span className="font-black">MERENGE</span>
          </h1>
          <p className="mt-4 text-lg md:text-2xl drop-shadow-md text-center">
            Suivez nous
          </p>
          <button className="mt-8 px-8 py-3 border border-white hover:bg-white/20 transition rounded text-lg">
            La Victoire
          </button>
        </div>
      </main>

      {/* Section histoire en-dessous */}
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
