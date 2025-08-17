// app/galerie/viewer/page.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Affiche n'importe quel média/doc dans un <iframe> plein écran
 * + barre d'actions (boutons noirs sur fond clair).
 */
export default function ViewerPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const rawUrl = sp.get("url") || "";
  const title = sp.get("title") || "Document";
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  const { viewerSrc, fileName } = useMemo(() => {
    // Récup nom et extension
    let fname = title;
    let ext = "";
    try {
      const u = new URL(rawUrl);
      const last = decodeURIComponent(u.pathname.split("/").pop() || title);
      fname = last;
      const dot = last.lastIndexOf(".");
      if (dot > -1) ext = last.slice(dot + 1).toLowerCase();
    } catch {
      // no-op si rawUrl pas absolue
    }

    // Sélection du viewer selon l'extension
    const office = new Set(["doc", "docx", "ppt", "pptx", "xls", "xlsx"]);
    let src = rawUrl;

    if (office.has(ext)) {
      // Viewer Microsoft Office
      src =
        "https://view.officeapps.live.com/op/embed.aspx?src=" +
        encodeURIComponent(rawUrl) +
        "&wdStartOn=1&wdPrint=1";
    } else if (ext && !["pdf", "png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
      // Fallback Google Viewer pour autres docs (txt, rtf, etc.)
      src =
        "https://docs.google.com/gview?embedded=1&url=" +
        encodeURIComponent(rawUrl);
    }
    return { viewerSrc: src, fileName: fname };
  }, [rawUrl, title]);

  function handlePrint() {
    // PDF ok, sinon on ouvre l’URL brute
    try {
      frameRef.current?.contentWindow?.focus();
      frameRef.current?.contentWindow?.print();
    } catch {
      window.open(rawUrl, "_blank");
    }
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* Barre d’actions (boutons noirs visibles) */}
      <div className="absolute top-2 right-2 z-20 flex gap-2">
        <button
          onClick={() => router.back()}
          title="Fermer"
          className="rounded-full bg-white/90 hover:bg-white text-black px-3 py-2 text-sm shadow"
        >
          ✕
        </button>
        <button
          onClick={handlePrint}
          title="Imprimer"
          className="rounded-full bg-white/90 hover:bg-white text-black px-3 py-2 text-sm shadow"
        >
          🖨️
        </button>
        <a
          href={rawUrl}
          download={fileName}
          title="Télécharger"
          className="rounded-full bg-white/90 hover:bg-white text-black px-3 py-2 text-sm shadow"
        >
          ⤓
        </a>
        <a
          href={rawUrl}
          target="_blank"
          rel="noreferrer"
          title="Ouvrir dans un onglet"
          className="rounded-full bg-white/90 hover:bg-white text-black px-3 py-2 text-sm shadow"
        >
          ↗
        </a>
      </div>

      {/* Titre */}
      <div className="absolute top-2 left-3 z-20 text-white/90 text-sm md:text-base">
        {fileName}
      </div>

      {/* Loader simple */}
      {loading && (
        <div className="absolute inset-0 grid place-items-center text-white/80">
          Chargement…
        </div>
      )}

      {/* Iframe plein écran */}
      <iframe
        ref={frameRef}
        src={viewerSrc}
        title={title}
        className="absolute inset-0 w-full h-full border-0 bg-white"
        allowFu
