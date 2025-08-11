import GalleryLightbox from "../components/GalleryLightbox";

export const metadata = { title: "Photos — Famille Merenge" };

export default function Photos() {
  const gallery = Array.from({ length: 12 }).map((_, i) => ({
    thumb: `https://picsum.photos/seed/p${i+1}/600/400`,
    full:  `https://picsum.photos/seed/p${i+1}/1600/1000`,
  }));

  return (
    <main className="px-6 py-12 max-w-6xl mx-auto">
      <h1 className="text-4xl font-extrabold text-white drop-shadow">Photos</h1>
      <p className="mt-2 text-white/90">Clique sur une image pour l’agrandir.</p>
      <GalleryLightbox images={gallery} />
    </main>
  );
}
