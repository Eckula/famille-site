// app/components/MediaCard.tsx
"use client";
/* eslint-disable @next/next/no-img-element */

import DownloadLink from "./DownloadLink";

type Item = {
  id: string;
  kind: "image" | "video";
  title: string;
  url: string;      // URL Cloudinary complète du média
  thumb?: string;   // URL de miniature (optionnelle)
  createdAt: string;
};

/** Récupère l'extension du fichier depuis l'URL (jpg, png, mp4, …) */
function getExtFromUrl(url: string): string | undefined {
  try {
    const u = new URL(url, typeof window !== "undefined" ? window.location.href : "http://localhost");
    const pathname = u.pathname || "";
    const last = pathname.split("/").pop() || "";
    const dot = last.lastIndexOf(".");
    if (dot > 0 && dot < last.length - 1) {
      return last.slice(dot + 1).toLowerCase();
    }
  } catch {/* ignore */}
  return undefined;
}

/**
 * Essaie d'extraire le public_id Cloudinary depuis une URL de type:
 * https://res.cloudinary.com/<cloud>/image/upload/v123456/folder/file.jpg
 * → retourne "folder/file"
 */
function getCloudinaryPublicId(fullUrl: string): string | null {
  try {
    const u = new URL(fullUrl, typeof window !== "undefined" ? window.location.href : "http://localhost");
    // On ne tente l’extraction que pour Cloudinary
    if (!/\.cloudinary\.com$/i.test(u.hostname)) return null;

    const path = u.pathname; // ex: /<cloud>/image/upload/v123/folder/file.jpg
    const parts = path.split("/upload/");
    if (parts.length < 2) return null;

    // tout ce qui vient après "upload/"
    let afterUpload = parts[1]; // ex: v123/folder/file.jpg  ou  folder/file.jpg
    // enlever un éventuel prefix de version "v123/"
    afterUpload = afterUpload.replace(/^v\d+\//, "");
    // enlever les éventuels segments de transformation (rare sur l'URL "url", plus fréquent sur "thumb")
    // (si tu utilises des transformations dans "url", préfère passer le public_id directement)
    // enlever l'extension finale
    const last = afterUpload.split("/").pop() || "";
    const dot = last.lastIndexOf(".");
    if (dot < 1) {
      // pas d'extension détectée → on garde tout
      return afterUpload;
    }
    const withoutExt = afterUpload.slice(0, afterUpload.length - (last.length - dot));
    return withoutExt;
  } catch {
    return null;
  }
}

export default function MediaCard({ item }: { item: Item }) {
  const isVideo = item.kind === "video";
  const publicId = getCloudinaryPublicId(item.url);
  const format = getExtFromUrl(item.url); // ex: "jpg" | "png" | "mp4"

  return (
    <article className="overflow-hidden rounded-lg border border-white/15 bg-white/5">
      <div className="aspect-video bg-black/30">
        {item.kind === "image" ? (
          <img
            src={item.thumb ?? item.url}
            alt={item.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <video
            src={item.url}
            className="h-full w-full object-cover"
            controls
            preload="metadata"
            playsInline
          />
        )}
      </div>

      <div className="p-3">
        <h3 className="font-medium">{item.title}</h3>
        <p className="text-xs text-white/70">
          {new Date(item.createdAt).toLocaleDateString("fr-FR")}
        </p>

        {/* Actions */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {publicId ? (
            // ✅ Cas idéal : on a réussi à extraire le public_id → on passe par /api/media/stream
            <DownloadLink
              publicId={publicId}
              type={isVideo ? "video" : "image"}
              // on peut passer le format si tu veux conserver l'extension d'origine
              // (optionnel; la route marche sans)
              format={format}
              className="rounded-full border border-white/30 px-3 py-1.5 hover:bg-white/10"
            >
              Télécharger
            </DownloadLink>
          ) : (
            // 🔁 Fallback : si l'URL n'est pas Cloudinary (ou parsing impossible), lien direct
            <a
              href={item.url}
              download
              className="rounded-full border border-white/30 px-3 py-1.5 hover:bg-white/10"
              title="Télécharger le fichier"
            >
              Télécharger
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
