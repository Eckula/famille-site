"use client";

import { useState } from "react";

// Images de démo (à remplacer plus tard par celles de Firebase)
const demoImages = [
  "/images/photos.jpg",
  "/images/videos.jpg",
  "/images/evenements.jpg",
  "/images/albums.jpg",
  "/images/docs.jpg",
  "/images/admin.jpg",
  "https://placehold.co/600x400?text=Photo+7",
  "https://placehold.co/600x400?text=Photo+8",
  "https://placehold.co/600x400?text=Photo+9",
];

export default function GaleriePage() {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <main className="px-6 py-20 text-white">
      <h1 className="text-3xl font-bold mb-6">Galerie</h1>
      <p className="mb-8">Cliquez sur une image pour l’agrandir.</p>

      {/* Grille d’images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {demoImages.map((src, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg border border-white/20 cursor-pointer group"
            onClick={() => setSelectedImage(src)}
          >
            <img
              src={src}
              alt={`Photo ${index + 1}`}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ))}
      </div>

      {/* Lightbox (image agrandie) */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Agrandissement"
            className="max-w-full max-h-full rounded-lg shadow-lg"
          />
        </div>
      )}
    </main>
  );
}
