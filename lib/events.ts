// lib/events.ts
export function parseEventMeta(name: string) {
  // "YYYY-MM-DD • Titre [EVT]" ou "YYYY/MM/DD - Titre"
  const m = name.match(/^\s*(\d{4})[-_/\.](\d{2})[-_/\.](\d{2})\s*(?:[•\-–]\s*)?(.*?)(?:\s*\[EVT\])?\s*$/);
  if (!m) return { date: null as Date | null, title: name.replace(/\s*\[EVT\]\s*$/i, "").trim() || name };
  const [_, Y, M, D, raw] = m;
  const dt = new Date(Number(Y), Number(M) - 1, Number(D));
  const title = raw?.trim() || name;
  return { date: isNaN(+dt) ? null : dt, title };
}
