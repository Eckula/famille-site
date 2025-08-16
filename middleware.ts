// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "dev-secret");

// téléchargement public si pas de VIEWER_PASSWORD
const PUBLIC_DOWNLOADS = !process.env.VIEWER_PASSWORD;

const PROTECTED_API_PREFIXES = [
  ...(!PUBLIC_DOWNLOADS ? ["/api/media/stream"] : []),
  "/api/cloudinary/sign-upload",
  "/api/media/delete",
  "/api/media/rename",
];

async function hasValidSession(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // 1) /documents : privé → redirige vers /admin si pas connecté
  if (pathname.startsWith("/documents")) {
    if (!(await hasValidSession(req))) {
      const url = new URL("/admin", req.url);
      url.searchParams.set("next", pathname + (req.nextUrl.search || ""));
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 2) /galerie?tab=documents : également privé
  if (pathname.startsWith("/galerie")) {
    const tab = searchParams.get("tab");
    if (tab && tab.toLowerCase() === "documents") {
      if (!(await hasValidSession(req))) {
        const url = new URL("/admin", req.url);
        url.searchParams.set("next", pathname + (req.nextUrl.search || ""));
        return NextResponse.redirect(url);
      }
    }
  }

  // 3) APIs protégées (upload, delete, rename… et stream si non public)
  if (PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!(await hasValidSession(req))) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/documents/:path*", "/galerie/:path*", "/api/:path*"],
};
