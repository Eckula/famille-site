export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const GATE_COOKIE = process.env.SITE_GATE_COOKIE || "famille_gate";
const GATE_PASSWORD = process.env.SITE_GATE_PASSWORD || process.env.SITE_PASSWORD || "";
const GATE_MAX_DAYS = Math.max(1, Number(process.env.SITE_GATE_MAX_DAYS || 7));

function setGateCookie(res: NextResponse, value: "1" | "", maxDays = GATE_MAX_DAYS) {
  const maxAge = value ? maxDays * 24 * 3600 : 0;
  res.cookies.set({
    name: GATE_COOKIE,
    value,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge,
  });
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  // ?status=1 → savoir si cookie présent
  if (url.searchParams.get("status")) {
    const ok = req.cookies.get(GATE_COOKIE)?.value === "1";
    return NextResponse.json({ ok, gate: ok });
  }
  // ?clear=1 → effacer le cookie (reverrouiller)
  if (url.searchParams.get("clear")) {
    const res = NextResponse.json({ ok: true, cleared: true });
    setGateCookie(res, "");
    return res;
  }
  return NextResponse.json({ ok: false, message: "Use POST {password} to unlock, GET ?status=1, or GET ?clear=1" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  if (!GATE_PASSWORD) {
    return NextResponse.json({ ok: false, message: "SITE_GATE_PASSWORD manquant" }, { status: 500 });
  }
  const body = await req.json().catch(() => ({}));
  const { password, maxAgeDays } = body || {};
  if (password !== GATE_PASSWORD) {
    return NextResponse.json({ ok: false, message: "Mot de passe invalide" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  setGateCookie(res, "1", typeof maxAgeDays === "number" ? maxAgeDays : GATE_MAX_DAYS);
  return res;
}
