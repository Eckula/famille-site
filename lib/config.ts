// lib/config.ts
export const ALBUMS_ROOT = "famille/Albums";
export const EVENTS_ROOT = "famille/Evenements";

// Slug simple pour affichage / URLs (Phase 1)
export function slugify(input: string) {
  return (input || "")
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "untitled";
}

// "famille/Evenements/2025-08-15 • Titre [EVT]" -> "2025-08-15 • Titre [EVT]"
export function lastSegment(path: string) {
  const s = (path || "").split("/").filter(Boolean);
  return s[s.length - 1] || "";
}

// Concatène des segments sans // ni slash de tête/fin
export function joinPath(...parts: string[]) {
  return parts
    .join("/")
    .replace(/\/{2,}/g, "/")
    .replace(/(^\/|\/$)/g, "");
}
