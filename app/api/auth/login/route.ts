// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { signInWithPassword } from "@/lib/auth";
import type { Role } from "@/lib/rbac";

export const runtime = "nodejs";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  const { password, maxAgeDays = 7 } = await req.json().catch(() => ({}));

  if (!password) {
    return NextResponse.json({ ok: false, message: "Mot de passe requis" }, { status: 400 });
  }
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { ok: false, message: "ADMIN_PASSWORD non configuré côté serveur." },
      { status: 500 }
    );
  }
  if (!process.env.ADMIN_JWT_SECRET) {
    return NextResponse.json(
      { ok: false, message: "ADMIN_JWT_SECRET non configuré côté serveur." },
      { status: 500 }
    );
  }

  const r = await signInWithPassword(password, maxAgeDays);
  if (!r.ok) return NextResponse.json({ ok: false, message: r.message || "Mot de passe invalide" }, { status: 401 });
  return NextResponse.json({ ok: true, role: r.role as Role });
}
