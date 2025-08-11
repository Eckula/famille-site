// app/components/GalleryLightbox.jsx
"use client";
import { useEffect, useRef, useState } from "react";

export default function GalleryLightbox({ images = [] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const startX = useRef(null);

  const openAt = (i) => { setIndex(i); setOpen(true); document.body.style.overflow = "hidden"; };
  const close = () => { setOpen(false); document.body.style.overflow = ""; };
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  useEffect(() => {
    const onKey = (e) => {
      if (!open) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {images.map((src, i) => (
          <button key={i} onClick={() => openAt(i)} className="group rounded-xl overflow-hidden">
            <img src={src.thumb ?? src} alt="" className="w-full h-40 object-cover group-hover:scale-[1.03] transition" />
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
             onClick={(e)=>{ if(e.target===e.currentTarget) close(); }}>
          <div className="relative w-full max-w-6xl">
            <button onClick={close} className="absolute -top-12 right-0 text-white text-2xl" aria-label="Fermer">✕</button>
            <img
              src={images[index].full ?? images[index]}
              alt=""
              className="w-full max-h-[80vh] object-contain rounded-lg select-none"
              draggable="false"
              onTouchStart={(e)=>{ startX.current = e.changedTouches[0].clientX; }}
              onTouchEnd={(e)=>{ 
                if(startX.current==null) return;
                const dx = e.changedTouches[0].clientX - startX.current;
                if (Math.abs(dx) > 40) { dx > 0 ? prev() : next(); }
                startX.current = null;
              }}
            />
            <div className="mt-4 flex items-center justify-between">
              <button onClick={prev} className="px-4 py-2 rounded bg-white/90 hover:bg-white text-slate-900">← Précédent</button>
              <div className="text-white/80 text-sm">{index+1} / {images.length}</div>
              <button onClick={next} className="px-4 py-2 rounded bg-white/90 hover:bg-white text-slate-900">Suivant →</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
