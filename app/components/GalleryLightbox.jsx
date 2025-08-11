// app/components/GalleryLightbox.jsx
"use client";
import { useEffect, useRef, useState } from "react";

/**
 * props:
 *  - images: Array<string | { thumb: string, full?: string, alt?: string }>
 *    exemple:
 *      [
 *        { thumb: "/photos/ete-1_600.jpg", full: "/photos/ete-1_1600.jpg", alt: "Plage" },
 *        "/photos/ete-2_1200.jpg" // thumb=full si string simple
 *      ]
 */
export default function GalleryLightbox({ images = [] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);

  const len = images.length;
  const srcAt = (i) => {
    const item = images[i];
    if (typeof item === "string") return item;
    return item.full || item.thumb;
  };
  const altAt = (i) => {
    const item = images[i];
    if (typeof item === "string") return "";
    return item.alt || "";
  };
  const thumbAt = (i) => {
    const item = images[i];
    if (typeof item === "string") return item;
    return item.thumb || item.full || "";
  };

  function openAt(i) {
    setIndex(i);
    setOpen(true);
    document.body.style.overflow = "hidden"; // bloque le scroll derrière
  }
  function close() {
    setOpen(false);
    document.body.style.overflow = "";
  }
  function prev() {
    setIndex((i) => (i - 1 + len) % len);
  }
  function next() {
    setIndex((i) => (i + 1) % len);
  }

  // Raccourcis clavier
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") return close();
      if (e.key === "ArrowLeft") return prev();
      if (e.key === "ArrowRight") return next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!len) {
    return <p className="mt-6 text-sm text-white/80">Aucune image dans la galerie.</p>;
  }

  return (
    <>
      {/* Grille de vignettes */}
      <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => openAt(i)}
            className="group rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-white/70"
            aria-label={`Ouvrir l'image ${i + 1}`}
          >
            <img
              src={thumbAt(i)}
              alt={altAt(i)}
              className="w-full h-40 object-cover group-hover:scale-[1.03] transition"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-6xl">
            {/* Bouton fermer */}
            <button
              onClick={close}
              className="absolute -top-12 right-0 text-white text-2xl px-2 py-1 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/70"
              aria-label="Fermer la visionneuse"
            >
              ✕
            </button>

            {/* Image principale */}
            <img
              src={srcAt(index)}
              alt={altAt(index)}
              className="w-full max-h-[80vh] object-contain rounded-lg select-none"
              draggable="false"
              onTouchStart={(e) => { touchStartX.current = e.changedTouches[0].clientX; }}
              onTouchEnd={(e) => {
                if (touchStartX.current == null) return;
                const dx = e.changedTouches[0].clientX - touchStartX.current;
                if (Math.abs(dx) > 40) { dx > 0 ? prev() : next(); }
                touchStartX.current = null;
              }}
            />

            {/* Barre d’actions */}
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={prev}
                className="px-4 py-2 rounded bg-white/90 hover:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-white/70"
              >
                ← Précédent
              </button>
              <div className="text-white/80 text-sm">
                {index + 1} / {len}
              </div>
              <button
                onClick={next}
                className="px-4 py-2 rounded bg-white/90 hover:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-white/70"
              >
                Suivant →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
