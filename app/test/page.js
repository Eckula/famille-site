// app/test/page.js
export const metadata = { title: "Test vidéo simple" };

export default function TestVideo() {
  return (
    <main className="min-h-screen p-8 space-y-6">
      <h1 className="text-2xl font-bold">Test vidéo simple (sans fond)</h1>

      <p>Si la vidéo se lit ici, les fichiers/encode sont OK.</p>

      <video
        className="w-full max-w-3xl rounded-lg border"
        controls
        autoPlay
        muted
        playsInline
        preload="metadata"
        poster="/videos/video2_h264.mp4"
      >
        <source src="/videos/video2_vp9.webm" type="video/webm" />
        <source src="/videos/video2_h264.mp4" type="video/mp4" />
        <source src="/videos/video2.mp4" type="video/mp4" />
        Votre navigateur ne peut pas lire la vidéo.
      </video>

      <div className="text-sm opacity-70">
        Si rien ne s’affiche, ouvre l’onglet Réseau et teste ces URLs directement :
        <ul className="list-disc ml-6">
          <li>/videos/video2_vp9.webm</li>
          <li>/videos/video2_h264.mp4</li>
          <li>/videos/video2.mp4</li>
        </ul>
      </div>
    </main>
  );
}
