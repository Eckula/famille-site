// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// ⚠️ doit être identique à lib/auth.ts
const COOKIE_NAME = "famille_admin_token";
const SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "dev-secret");

// Téléchargements publics s’il n’y a PAS de VIEWER_PASSWORD
const PUBLIC_DOWNLOADS = !process.env.VIEWER_PASSWORD;

// APIs protégées (et /api/media/stream si non public)
const PROTECTED_API_PREFIXES = [
  ...(!PUBLIC_DOWNLOADS ? ["/api/media/stream"] : []),
  "/api/cloudinary/sign-upload",
  "/api/media/delete",
  "/api/media/rename",
];

async function hasValidSession(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    // Vérifie signature + iat/exp
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

function redirectToLoginWithNext(req: NextRequest) {
  const next = req.nextUrl.pathname + (req.nextUrl.search || "");
  const url = new URL("/admin", req.url);
  url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) /documents : privé (si tu as une page /documents)
  if (pathname.startsWith("/documents")) {
    if (!(await hasValidSession(req))) return redirectToLoginWithNext(req);
    return NextResponse.next();
  }

  // 2) /galerie?tab=documents : privé
  if (pathname === "/galerie") {
    const tab = req.nextUrl.searchParams.get("tab");
    if (tab && tab.toLowerCase() === "documents") {
      if (!(await hasValidSession(req))) return redirectToLoginWithNext(req);
    }
  }

  // 3) APIs protégées (upload, delete, rename… + stream si non public)
  if (PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!(await hasValidSession(req))) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Limite la portée de la middleware aux routes utiles
export const config = {
  matcher: ["/documents/:path*", "/galerie", "/api/:path*"],
};
