// app/components/DownloadLink.tsx
"use client";

import Link from "next/link";

type Props = {
  publicId: string;
  type?: "image" | "video";
  format?: string;
  className?: string;
  children?: React.ReactNode;
};

// flag côté client pour ne PAS forcer la connexion
const PUBLIC_DOWNLOADS =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_PUBLIC_DOWNLOADS === "true";

export default function DownloadLink({
  publicId,
  type = "image",
  format,
  className = "",
  children,
}: Props) {
  const streamUrl =
    `/api/media/stream?public_id=${encodeURIComponent(publicId)}` +
    `&type=${type}` +
    (format ? `&format=${encodeURIComponent(format)}` : "");

  if (PUBLIC_DOWNLOADS) {
    // téléchargement direct
    return (
      <a href={streamUrl} className={className}>
        {children ?? "Télécharger"}
      </a>
    );
  }

  // sinon : protection → redirection login si non connecté
  // (ancienne logique : /admin?next=...)
  return (
    <Link href={`/admin?next=${encodeURIComponent(streamUrl)}`} className={className}>
      {children ?? "Télécharger (connexion requise)"}
    </Link>
  );
}
