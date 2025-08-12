"use client";

type Item = {
  id: string;
  kind: "image" | "video";
  title: string;
  url: string;
  thumb?: string;
  createdAt: string;
};

export default function MediaCard({ item }: { item: Item }) {
  return (
    <article className="rounded-lg overflow-hidden border border-white/15 bg-white/5">
      <div className="aspect-video bg-black/30">
        {item.kind === "image" ? (
          <img
            src={item.thumb ?? item.url}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <video
            src={item.url}
            className="w-full h-full object-cover"
            controls
            preload="metadata"
          />
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium">{item.title}</h3>
        <p className="text-xs text-white/70">
          {new Date(item.createdAt).toLocaleDateString("fr-FR")}
        </p>
      </div>
    </article>
  );
}
