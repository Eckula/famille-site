export const metadata = { title: "Vidéos — Famille Merenge" };

export default function Videos() {
  return (
    <main className="px-6 py-12 max-w-4xl mx-auto">
      <h1 className="text-4xl font-extrabold text-white drop-shadow">Vidéos</h1>
      <p className="mt-2 text-white/90">Exemples d’intégration.</p>

      {/* YouTube */}
      <div className="mt-6 aspect-video overflow-hidden rounded-2xl border border-white/40 bg-black/80">
        <iframe
          className="w-full h-full"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title="Exemple YouTube"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {/* Fichier local (démo) */}
      <div className="mt-6 rounded-2xl border border-white/40 overflow-hidden bg-black/80">
        <video className="w-full h-full" controls playsInline muted preload="metadata">
          <source src="/videos/video2_h264.mp4" type="video/mp4" />
          <source src="/videos/video2_vp9.webm" type="video/webm" />
          Votre navigateur ne peut pas lire cette vidéo.
        </video>
      </div>
    </main>
  );
}
