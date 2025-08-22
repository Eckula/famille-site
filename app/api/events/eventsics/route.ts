// app/api/events/ics/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function icsEscape(s: string) {
  return s.replace(/[,;]/g, (m) => (m === "," ? "\\," : "\\;")).replace(/\n/g, "\\n");
}

// Parse "YYYY-MM-DD • Titre [EVT]" (souple sur séparateurs)
function parseEventName(name: string): { date?: Date; title?: string } {
  const s = name.trim();
  let m = s.match(/^(\d{4})[\/\-.](\d{2})[\/\-.](\d{2})(?:\s*[•\-–]\s*(.*?))?(?:\s*\[(?:EVT|EVENT)\])?$/i);
  if (m) {
    const y = +m[1], mo = +m[2], d = +m[3];
    const title = (m[4] || "").trim() || undefined;
    return { date: new Date(Date.UTC(y, mo - 1, d)), title };
  }
  return {};
}

// 👉 Tu peux remplir cette liste pour les anniversaires sans modifier Prisma :
const BIRTHDAYS: Array<{ name: string; month: number; day: number }> = [
  // { name: "Eunice-Miya", month: 1, day: 12 },
  // { name: "Anthony", month: 4, day: 20 },
];

function dtUTC(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${dd}`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const calName = searchParams.get("name") || "Famille — Événements";

    // 1) Tous les dossiers enfants de "Evenements"
    const evenementsRoot = await prisma.appFolder.findFirst({
      where: { name: { in: ["Evenements", "Événements"] }, parentId: null },
      select: { id: true },
    });

    const events = evenementsRoot
      ? await prisma.appFolder.findMany({
          where: { parentId: evenementsRoot.id },
          select: { id: true, name: true, createdAt: true },
          orderBy: [{ createdAt: "desc" }, { name: "asc" }],
        })
      : [];

    // 2) Construire le .ics
    const lines: string[] = [];
    lines.push("BEGIN:VCALENDAR");
    lines.push("VERSION:2.0");
    lines.push("PRODID:-//Famille//Evenements//FR");
    lines.push(`X-WR-CALNAME:${icsEscape(calName)}`);
    lines.push("CALSCALE:GREGORIAN");
    lines.push("METHOD:PUBLISH");

    // a) Événements datés (journée entière)
    for (const f of events) {
      const meta = parseEventName(f.name);
      if (!meta.date) continue;
      const title = meta.title || f.name;
      const dt = dtUTC(meta.date);
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:evt-${f.id}@famille`);
      lines.push(`DTSTAMP:${dt}T090000Z`);
      lines.push(`DTSTART;VALUE=DATE:${dt}`);
      // DTSTART (journée entière) → on met DTEND=lendemain
      const end = new Date(meta.date.getTime() + 24 * 3600 * 1000);
      lines.push(`DTEND;VALUE=DATE:${dtUTC(end)}`);
      lines.push(`SUMMARY:${icsEscape(title)}`);
      // 2 rappels : J-7 & J-1 (certains calendriers ignorent les VALARM sur ICS abonnés, mais ça ne coûte rien)
      lines.push("BEGIN:VALARM");
      lines.push("TRIGGER:-P7D");
      lines.push("ACTION:DISPLAY");
      lines.push(`DESCRIPTION:Rappel ${icsEscape(title)}`);
      lines.push("END:VALARM");
      lines.push("BEGIN:VALARM");
      lines.push("TRIGGER:-P1D");
      lines.push("ACTION:DISPLAY");
      lines.push(`DESCRIPTION:Rappel ${icsEscape(title)}`);
      lines.push("END:VALARM");
      lines.push("END:VEVENT");
    }

    // b) Anniversaires (récurrence annuelle)
    for (const b of BIRTHDAYS) {
      const start = new Date(Date.UTC(2000, b.month - 1, b.day)); // ancre
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:bday-${b.name.replace(/\s+/g, "_")}@famille`);
      lines.push(`DTSTAMP:${dtUTC(new Date())}T000000Z`);
      lines.push(`DTSTART;VALUE=DATE:${dtUTC(start)}`);
      lines.push("RRULE:FREQ=YEARLY");
      lines.push(`SUMMARY:🎂 Anniversaire ${icsEscape(b.name)}`);
      lines.push("BEGIN:VALARM");
      lines.push("TRIGGER:-P1D");
      lines.push("ACTION:DISPLAY");
      lines.push(`DESCRIPTION:Rappel anniversaire ${icsEscape(b.name)}`);
      lines.push("END:VALARM");
      lines.push("END:VEVENT");
    }

    lines.push("END:VCALENDAR");
    const body = lines.join("\r\n");

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `inline; filename="evenements.ics"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erreur ICS" }, { status: 500 });
  }
}
