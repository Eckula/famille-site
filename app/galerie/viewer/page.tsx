// app/galerie/viewer/page.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Affiche un média/doc dans un <iframe> plein écran
 * avec barre d'actions (boutons noirs sur fond clair).
 */
export default function ViewerPage() {
  const sp = useSearchParams(); // peut être null selon les types
  const router = useRouter();

  const rawUrl = sp?.get("url") ?? "";
  const title = sp?.get("title") ?? "Document";
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  // Si pas d'URL, on affiche un message et un bouton retour (évite tout crash)
  if (!rawUrl) {
    return (
      <div className="fixed inset-0 bg-black text-white grid place-items-center p-6">
        <div className="text-center space-y-4">
          <div className="text-lg">Aucune URL de document fournie.</div>
          <button
            onClick={() => router.back()}
            className="rounded-full bg-white/90 hover:bg-white text-black px-4 py-2 text-sm shadow"
          >
            ⬅️ Retour
          </button>
        </div>
      </div>
    );
  }

  const { viewerSrc, fileName } = useMemo(() => {
    // Récup nom et extension
    let fname = title;
    let ext = "";
    try {
      const u = new URL(rawUrl);
      const last = decodeURIComponent(u.pathname.split("/").pop() || title);
      fname = last || title;
      const dot = last.lastIndexOf(".");
      if (dot > -1) ext = last.slice(dot + 1).toLowerCase();
    } catch {
      // no-op si rawUrl n'est pas une URL absolue (peu probable ici)
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
      // Fallback Google Viewer (txt, rtf, etc.)
      src =
        "https://docs.google.com/gview?embedded=1&url=" +
        encodeURIComponent(rawUrl);
    }
    return { viewerSrc: src, fileName: fname };
  }, [rawUrl, title]);

  function handlePrint() {
    try {
      frameRef.current?.contentWindow?.focus();
      frameRef.current?.contentWindow?.print();
    } catch {
      window.open(rawUrl, "_blank");
    }
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* Barre d’actions */}
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

      {/* Loader */}
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
        allowFullScreen
        referrerPolicy="no-referrer"
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}
