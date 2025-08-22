// app/evenements/view/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";

/**
 * Redirige toute visite de /evenements/view vers /evenements/view/view,
 * en conservant les query params (ex: ?folderId=...).
 * Corrige le 405 observé après redirection depuis la Galerie.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const qp = url.search || "";
  const location = new URL(`/evenements/view/view${qp}`, url.origin);
  // 307: redirection temporaire qui préserve la méthode
  return NextResponse.redirect(location, 307);
}

// Méthodes non supportées : renvoie un 405 propre
function methodNotAllowed(allow = "GET") {
  return NextResponse.json(
    { error: "Method Not Allowed" },
    { status: 405, headers: { Allow: allow } }
  );
}
export const HEAD = GET;     // autorise HEAD comme GET (redirection)
export const OPTIONS = () => methodNotAllowed("GET, HEAD");
export const POST = () => methodNotAllowed();
export const PUT = () => methodNotAllowed();
export const PATCH = () => methodNotAllowed();
export const DELETE = () => methodNotAllowed();
