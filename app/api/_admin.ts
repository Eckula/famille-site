// app/api/_admin.ts
import { NextRequest, NextResponse } from "next/server";

/** Interroge /api/me en réutilisant les cookies de la requête. */
export async function checkAdminFromRequest(req: NextRequest): Promise<{ isAdmin: boolean }> {
  const meUrl = new URL("/api/me", req.url);
  const cookie = req.headers.get("cookie") || "";
  try {
    const res = await fetch(meUrl, { headers: { cookie }, cache: "no-store" });
    if (!res.ok) return { isAdmin: false };
    const j = await res.json();
    const isAdmin =
      Boolean(j?.isAdmin) ||
      Boolean(j?.user?.isAdmin) ||
      (String(j?.role || j?.user?.role || "").toLowerCase() === "admin") ||
      (Array.isArray(j?.permissions) && j.permissions.includes("admin"));
    return { isAdmin };
  } catch {
    return { isAdmin: false };
  }
}

/** À placer tout en haut des routes protégées. */
export async function requireAdmin(req: NextRequest) {
  const { isAdmin } = await checkAdminFromRequest(req);
  if (!isAdmin) {
    return NextResponse.json(
      { error: "Accès réservé aux administrateurs." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }
  return null;
}
