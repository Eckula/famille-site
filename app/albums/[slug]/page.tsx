// app/albums/[slug]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";

type PageProps = {
  params: { slug: string };
};

export default async function AlbumPage({ params }: PageProps) {
  const { slug } = params;

  // Exemple : récupération des images depuis ton API
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/media/list?folder=albums/${slug}`,
    { cache: "no-store" }
  );
  if (!res.ok) return notFound();

  const data = await res.json();
  const items = data.items || [];

  return (
    <main className="px-6 py-20 text-white">
      <h1 className="text-3xl font-bold mb-6">Album : {slug}</h1>
      {items.length === 0 ? (
        <p>Aucun média trouvé dans cet album.</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m: any) => (
            <div
              key={m.id}
              className="relative overflow-hidden rounded-lg border border-white/20"
            >
              <Image
                src={m.thumb || m.url}
                alt={m.title || "Média"}
                width={800}
                height={600}
                className="object-cover w-full h-auto"
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
