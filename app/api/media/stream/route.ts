// app/api/media/stream/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth"; // alias de getMe
import { hasPermission } from "@/lib/rbac";
import type { Role } from "@/lib/rbac";

/**
 * Paramètres acceptés:
 * - public_id (obligatoire) : ex. "famille/Documents/monfichier"
 * - format (optionnel)      : ex. "pdf", "jpg", ...
 * - type   (optionnel)      : "image" | "video" | "raw" (défaut: auto -> image)
 * - dl     (optionnel)      : "1" pour forcer téléchargement, sinon inline
 * - filename (optionnel)    : nom joli pour Content-Disposition
 */

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME || "";
const PUBLIC_DOWNLOADS =
  (process.env.PUBLIC_DOWNLOADS ?? "true").toLowerCase() === "true" ||
  process.env.PUBLIC_DOWNLOADS === "1";

if (!CLOUD) {
  console.warn("[/api/media/stream] CLOUDINARY_CLOUD_NAME manquant.");
}

function encodeRFC5987(s: string) {
  return encodeURIComponent(s).replace(/['()]/g, escape).replace(/\*/g, "%2A");
}

function safePublicId(pid: string) {
  // encode chaque segment sans casser les '/'
  return pid
    .replace(/^\/+/, "")
    .split("/")
    .map(encodeURIComponent)
    .join("/");
}

function buildCloudinaryUrl(params: {
  public_id: string;
  format?: string;
  type?: string;
}) {
  const { public_id, format, type } = params;
  const safeId = safePublicId(public_id);
  const rt =
    (type || "").toLowerCase() === "video"
      ? "video"
      : (type || "").toLowerCase() === "raw"
      ? "raw"
      : "image";
  const suffix = format ? `.${format.toLowerCase()}` : "";
  return `https://res.cloudinary.com/${CLOUD}/${rt}/upload/${safeId}${suffix}`;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sp = url.searchParams;

  const public_id = sp.get("public_id") || "";
  const format = sp.get("format") || undefined;
  const type = sp.get("type") || undefined;
  const dl = sp.get("dl") === "1";
  const filenameParam = sp.get("filename") || "";

  if (!public_id) {
    return NextResponse.json(
      { error: "Paramètre 'public_id' manquant" },
      { status: 400 }
    );
  }

  // --- Contrôle d'accès (download)
  if (!PUBLIC_DOWNLOADS) {
    const s = await getSession(); // peut renvoyer { role: "guest" }
    if (!s || s.role === "guest" || !hasPermission(s.role as Role, "download")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }
  }

  const target = buildCloudinaryUrl({ public_id, format, type });

  // On relaie la requête Range éventuelle (PDF/vidéos, etc.)
  const range = req.headers.get("range") || undefined;
  const upstream = await fetch(target, {
    headers: range ? { Range: range } : undefined,
  });

  if (!upstream.ok && upstream.status !== 206) {
    // 206 = Partial Content pour Range
    const msg = await upstream.text().catch(() => "");
    return NextResponse.json(
      { error: `Cloudinary ${upstream.status}`, detail: msg.slice(0, 400) },
      { status: upstream.status }
    );
  }

  // En-têtes à propager
  const ct = upstream.headers.get("content-type") || "application/octet-stream";
  const cl = upstream.headers.get("content-length") || undefined;
  const cr = upstream.headers.get("content-range") || undefined;
  const dispBase = dl ? "attachment" : "inline";

  const baseName =
    filenameParam ||
    public_id.split("/").pop() ||
    `fichier${format ? "." + format : ""}`;
  const disposition = `${dispBase}; filename*=UTF-8''${encodeRFC5987(
    baseName
  )}`;

  const headers = new Headers();
  headers.set("Content-Type", ct);
  if (cl) headers.set("Content-Length", cl);
  if (cr) headers.set("Content-Range", cr);
  headers.set("Content-Disposition", disposition);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("X-Accel-Buffering", "no"); // évite le buffering sur certains proxies

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers,
  });
}
