"use client";

import { useMemo } from "react";
import Link from "next/link";

const YT_LINKS = [
  "https://youtu.be/E7C0ygg-DbI?si=VWoVmixRp9AnyUuV",
  "https://youtu.be/CMaBEXJk4FY?si=p-735NRRYvyTEKpa",
  "https://youtu.be/VmDYyAL5fSg?si=-yRbixjsCf_L6Oap",
  "https://youtu.be/BhC5ip9ysBI?si=dHExBrIVeTmZc4lz",
  "https://youtu.be/O-mdIAyDhJc?si=Gans7TzwSo22364k",
  "https://youtu.be/Tmv83peLhkw?si=0Tek2ZREvXy898q9",
  "https://youtube.com/shorts/1x66RO7-SCU?si=c4Emff-uzqwlsif1",
  "https://youtube.com/shorts/mUkQBTFF3J4?si=kqnRlnn4uol11Ycn",
  "https://youtube.com/shorts/eg4Z4AGYJP8?si=m32tItJZcSjpYebT"
 
,];

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const parts = u.pathname.split("/").filter(Boolean);
      const i = parts.findIndex((p) => p === "shorts");
      if (i >= 0 && parts[i + 1]) return parts[i + 1];
    }
  } catch {}
  return null;
}

export default function VideosPage() {
  const videos = useMemo(() => {
    return YT_LINKS.map((url) => {
      const id = extractYouTubeId(url);
      return id ? { id, url, embed: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1` } : null;
    }).filter(Boolean) as Array<{ id: string; url: string; embed: string }>;
  }, []);

  return (
    <main className="px-6 py-24 text-white">
      <h1 className="text-3xl font-bold mb-2">Vidéos</h1>
      <p className="mb-6 text-white/80">Regardez nos vidéos en ligne YouTube (non-répertoriées).</p>

      <div className="mb-6">
        <Link href="/galerie?tab=videos" className="inline-block rounded-lg border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20">
          Cliquez Ici pour voir nos autres Vidéos (HORS YOUTUBE)
        </Link>
      </div>

      {videos.length === 0 ? (
        <p className="text-white/70">Aucune vidéo YouTube configurée.</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <article key={v.id} className="rounded-lg overflow-hidden border border-white/20 bg-black/30">
              <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                <iframe
                  src={v.embed}
                  title={`YouTube ${v.id}`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <div className="p-3 text-sm text-white/80 truncate">
                <a href={v.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {v.url}
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
