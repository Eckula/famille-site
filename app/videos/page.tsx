// app/videos/page.tsx
import Link from "next/link";

const YT = ["E7C0ygg-DbI","CMaBEXJk4FY"]; // ajoute ici d’autres IDs

export default function VideosPage() {
  return (
    <main className="px-6 py-24 text-white">
      <h1 className="text-3xl font-bold mb-2">Vidéos</h1>
      <p className="mb-4 text-white/80">
        Lectures YouTube (liens non-répertoriés) + accès aux vidéos Cloudinary.
      </p>

      <div className="mb-8">
        <Link href="/galerie?tab=videos" className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 hover:bg-white/20">
          Voir nos autres Vidéos (Hors Youtube)
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {YT.map(id => (
          <div key={id} className="aspect-video rounded-lg overflow-hidden border border-white/20 bg-black/40">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${id}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        ))}
      </div>
    </main>
  );
}
