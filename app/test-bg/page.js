// app/test-bg/page.js
export const metadata = { title: "Test vidéo fond plein écran" };

export default function TestBg() {
  return (
    <html lang="fr">
      <body className="min-h-screen text-white">
        {/* Vidéo de fond */}
        <video
          className="fixed inset-0 -z-10 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src="/videos/video2_vp9.webm" type="video/webm" />
          <source src="/videos/video2_h264.mp4" type="video/mp4" />
          <source src="/videos/video2.mp4" type="video/mp4" />
        </video>

        {/* Overlay pour lisibilité */}
        <div className="fixed inset-0 -z-10 bg-black/40" />

        <main className="p-10">
          <h1 className="text-3xl font-extrabold drop-shadow">Test fond vidéo</h1>
          <p className="mt-2 drop-shadow">
            Si la vidéo est visible ici mais pas sur la page principale, c’est un
            problème de CSS/z-index dans ton layout/page.
          </p>
        </main>
      </body>
    </html>
  );
}
