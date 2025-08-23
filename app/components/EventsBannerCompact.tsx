// app/components/EventsBannerCompact.tsx
import React from "react";
import { computeBirthdays } from "@/lib/birthdays";

// lecture du mapping nom -> photo depuis l'env (server side)
function getPhotos(): Record<string, string> {
  try {
    return process.env.BIRTHDAYS_PHOTOS_JSON
      ? JSON.parse(process.env.BIRTHDAYS_PHOTOS_JSON)
      : {};
  } catch {
    return {};
  }
}
const photoFor = (name: string) => getPhotos()[name] || "/family/_default.png";

export default async function EventsBannerCompact({
  href = "/evenements",
}: {
  href?: string; // où pointer au clic (par défaut /evenements)
}) {
  const tz = process.env.EVENTS_TZ || "Europe/Paris";
  const d = computeBirthdays(tz);

  const birthdays = (d.birthdaysToday ?? []) as Array<{ name: string; age?: number }>;
  const memorials = (d.memorialsToday ?? []) as Array<{ name: string; years?: number }>;

  if (birthdays.length === 0 && memorials.length === 0) return null;

  // Avatars (max 3) : d'abord anniversaires puis souvenirs
  const heads: string[] = [
    ...birthdays.slice(0, 2).map((x) => x.name),
    ...memorials.slice(0, 2 - Math.min(2, birthdays.length)).map((x) => x.name),
  ].slice(0, 3);

  const bText =
    birthdays.length > 0
      ? `🎉 ${birthdays
          .slice(0, 2)
          .map((x) => (x.age !== undefined ? `${x.name} (${x.age})` : x.name))
          .join(", ")}${birthdays.length > 2 ? ` +${birthdays.length - 2}` : ""}`
      : "";
  const mText =
    memorials.length > 0
      ? `✝️ ${memorials
          .slice(0, 2)
          .map((x) =>
            x.years !== undefined ? `${x.name} (${x.years} an${(x.years ?? 0) > 1 ? "s" : ""})` : x.name
          )
          .join(", ")}${memorials.length > 2 ? ` +${memorials.length - 2}` : ""}`
      : "";

  const line = [bText, mText].filter(Boolean).join(" • ");

  return (
    <a
      href={href}
      className="group flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-sm text-white/90 no-underline hover:bg-black/40"
      aria-label="Aller aux événements"
    >
      <div className="flex -space-x-2">
        {heads.map((n, i) => (
          <img
            key={i}
            src={photoFor(n)}
            alt={n}
            width={28}
            height={28}
            className="h-7 w-7 rounded-full border-2 border-white/30 object-cover"
          />
        ))}
      </div>
      <span className="truncate">{line}</span>
      <span className="ml-auto text-xs opacity-70">Voir les événements</span>
    </a>
  );
}
