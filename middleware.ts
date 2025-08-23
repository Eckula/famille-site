// middleware.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

/* ========== 1) ADMIN (existant) ========== */
// ⚠️ doit être identique à lib/auth.ts
const ADMIN_COOKIE = "famille_admin_token";
const ADMIN_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "dev-secret");

// Téléchargements publics s’il n’y a PAS de VIEWER_PASSWORD (ancien comportement)
const PUBLIC_DOWNLOADS = !process.env.VIEWER_PASSWORD;

// APIs protégées (admin)
const ADMIN_API_PREFIXES = [
  "/api/cloudinary/sign-upload",
  "/api/media/delete",
  "/api/media/rename",
];

async function hasValidAdminSession(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, ADMIN_SECRET); // vérifie signature + iat/exp
    return true;
  } catch {
    return false;
  }
}

function redirectToAdminLoginWithNext(req: NextRequest) {
  const next = req.nextUrl.pathname + (req.nextUrl.search || "");
  const url = new URL("/admin", req.url);
  url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

/* ========== 2) GATE (mot de passe global site) ========== */
// 0 = off, 1 = tout le site, 2 = seule la home (/) reste publique
const GATE_MODE = Number(process.env.PROTECT_WHOLE_SITE || 0);
const GATE_COOKIE = process.env.SITE_GATE_COOKIE || "famille_gate";
const GATE_PASSWORD =
  process.env.SITE_GATE_PASSWORD || process.env.SITE_PASSWORD || ""; // à définir !
const GATE_MAX_DAYS = Math.max(1, Number(process.env.SITE_GATE_MAX_DAYS || 7));

// Protections ciblées
const PROTECT_VIDEOS   = process.env.PROTECT_VIDEOS   === "1"; // /videos
const PROTECT_GALLERY  = process.env.PROTECT_GALLERY  === "1"; // /galerie + APIs media/folders

const STATIC_EXT = /\.(?:png|jpg|jpeg|gif|webp|svg|ico|avif|css|js|map|txt|xml|webmanifest|mp4|webm|mp3|wav|ogg|pdf|woff2?)$/i;

function isHtmlNav(req: NextRequest) {
  const accept = req.headers.get("accept") || "";
  return accept.includes("text/html");
}

// allowlist minimale quand GATE_MODE>0
const PUBLIC_ALWAYS = [
  "/gate",
  "/api/auth/gate",
  "/api/cron/daily",     // déjà sécurisé par ?key=…
  "/api/birthdays",      // pilule
  "/api/weather",        // météo
  "/api/whereami",       // météo
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
];

function isGateCookieOk(req: NextRequest) {
  return req.cookies.get(GATE_COOKIE)?.value === "1";
}

function allowedWhenGate(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/_next")) return true;
  if (STATIC_EXT.test(pathname)) return true;
  if (PUBLIC_ALWAYS.some((p) => pathname.startsWith(p))) return true;
  if (GATE_MODE === 2 && pathname === "/") return true; // home publique
  return false;
}

/* ========== 3) zones MEDIA/GALERIE qu’on veut protéger via Gate ========== */
function isGalleryPage(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  if (pathname.startsWith("/galerie")) return true;
  // onglets de la galerie (images/videos/audio/documents)
  const tab = (searchParams.get("tab") || "").toLowerCase();
  if (pathname === "/galerie" && tab) return true;
  return false;
}

function isMediaApi(pathname: string) {
  // toutes les APIs “média / dossiers”
  return (
    pathname.startsWith("/api/media") ||
    pathname.startsWith("/api/folders")
  );
}

/* ========== 4) MIDDLEWARE PRINCIPALE ========== */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /* ---- Gate globale (si activée) ---- */
  if (GATE_MODE > 0) {
    const gateOk = isGateCookieOk(req);
    const allowed = allowedWhenGate(req);

    if (!gateOk && !allowed) {
      if (isHtmlNav(req)) {
        const url = new URL("/gate", req.url);
        url.searchParams.set("next", pathname + (req.nextUrl.search || ""));
        return NextResponse.redirect(url);
      }
      return NextResponse.json({ error: "Site locked. Go to /gate." }, { status: 401 });
    }
  }

  /* ---- Protections ciblées (même si GATE_MODE=0) ---- */

  // 4.1. /videos (page + onglet “Vidéos” de la galerie)
  if (PROTECT_VIDEOS) {
    const isVideos =
      pathname === "/videos" ||
      pathname.startsWith("/legacy/videos") ||
      (pathname === "/galerie" &&
        (req.nextUrl.searchParams.get("tab") || "").toLowerCase() === "videos");
    if (isVideos && !isGateCookieOk(req)) {
      if (isHtmlNav(req)) {
        const url = new URL("/gate", req.url);
        url.searchParams.set("next", pathname + (req.nextUrl.search || ""));
        return NextResponse.redirect(url);
      }
      return NextResponse.json({ error: "Videos locked. Go to /gate." }, { status: 401 });
    }
  }

  // 4.2. Galerie + APIs média/dossiers
  if (PROTECT_GALLERY) {
    if (isGalleryPage(req) || isMediaApi(pathname)) {
      if (!isGateCookieOk(req)) {
        if (isHtmlNav(req)) {
          const url = new URL("/gate", req.url);
          url.searchParams.set("next", pathname + (req.nextUrl.search || ""));
          return NextResponse.redirect(url);
        }
        return NextResponse.json({ error: "Gallery locked. Go to /gate." }, { status: 401 });
      }
    }
  }

  // 4.3. Toujours bloquer /api/media/stream si la Gate n’est pas validée
  // (utile quand PUBLIC_DOWNLOADS = true)
  if (pathname.startsWith("/api/media/stream")) {
    if (!isGateCookieOk(req)) {
      return NextResponse.json({ error: "Locked. Gate required." }, { status: 401 });
    }
  }

  /* ---- Protections ADMIN (existant) ---- */

  // /documents : privé (admin)
  if (pathname.startsWith("/documents")) {
    if (!(await hasValidAdminSession(req))) return redirectToAdminLoginWithNext(req);
    return NextResponse.next();
  }

  // /galerie?tab=documents : privé (admin)
  if (pathname === "/galerie") {
    const tab = req.nextUrl.searchParams.get("tab");
    if (tab && tab.toLowerCase() === "documents") {
      if (!(await hasValidAdminSession(req))) return redirectToAdminLoginWithNext(req);
    }
  }

  // APIs admin (upload/rename/delete)
  if (ADMIN_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!(await hasValidAdminSession(req))) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Headers de debug (pratique Edge/Chrome)
  const res = NextResponse.next();
  res.headers.set("x-gate-mode", String(GATE_MODE));
  res.headers.set("x-gate", isGateCookieOk(req) ? "1" : "0");
  res.headers.set("x-protect-videos", PROTECT_VIDEOS ? "1" : "0");
  res.headers.set("x-protect-gallery", PROTECT_GALLERY ? "1" : "0");
  res.headers.set("x-public-downloads", PUBLIC_DOWNLOADS ? "1" : "0");
  return res;
}

export const config = {
  matcher: ["/:path*"],
};
