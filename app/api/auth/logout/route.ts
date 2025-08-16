// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

const COOKIE_NAME = "famille_admin_token";

export async function POST() {
  // 1) Supprime via l'API cookies() (Next)
  await clearAuthCookie();

  // 2) Double-invalidation explicite sur la réponse (fiable sur Edge/Chrome)
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0), // expire le cookie
  });
  return res;
}
