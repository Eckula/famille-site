// app/galerie/viewer/page.tsx
"use client";

import { useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Affiche n'importe quel média/doc dans un <iframe> plein écran
 * avec notre barre d'actions (boutons noirs visibles sur fond clair).
 */
export default function ViewerPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const rawUrl = sp.get("url") || "";
  const title = sp.get("title") || "Document";
  const frameRef = useRef<HTMLIFrameElement>(null);

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
      // no-op
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
      // Fallback générique Google Viewer pour autres docs (txt, rtf, etc.)
      src =
        "https://docs.google.com/gview?embedded=1&url=" +
        encodeURIComponent(rawUrl);
    }
    return { viewerSrc: src, fileName: fname };
  }, [rawUrl, title]);

  function handlePrint() {
    // Impression possible pour PDF; pour les viewers externes, on ouvre dans un onglet.
    try {
      frameRef.current?.contentWindow?.focus();
      frameRef.current?.contentWindow?.print();
    } catch {
      window.open(rawUrl, "_blank");
    }
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* Barre d’actions (noire sur fond blanc) */}
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

      {/* Titre (optionnel) */}
      <div className="absolute top-2 left-3 z-20 text-white/90 text-sm md:text-base">
        {fileName}
      </div>

      {/* Iframe plein écran */}
      <iframe
        ref={frameRef}
        src={viewerSrc}
        title={title}
        className="absolute inset-0 w-full h-full border-0 bg-white"
        allow="fullscreen"
      />
    </div>
  );
}
