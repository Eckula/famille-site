import type { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* ---------- Cloudinary server creds ---------- */
const CLOUD =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (CLOUD && API_KEY && API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUD,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
  });
} else {
  console.warn("[/api/media/file] Missing CLOUDINARY_* server credentials");
}

/* ---------- helpers ---------- */
function splitPublicId(id: string) {
  const safe = id.split("/").map(s => s.trim()).filter(Boolean).join("/");
  const hasExt = /\.[^/\.]+$/.test(safe);
  const noExt  = hasExt ? safe.replace(/\.[^/\.]+$/, "") : safe;
  const extFromId = hasExt ? safe.split(".").pop()!.toLowerCase() : undefined;
  const fileNameOnly = noExt.split("/").pop() || noExt;
  return { safe, hasExt, noExt, extFromId, fileNameOnly };
}

function sanitizeName(name: string) {
  return name.replace(/[^\w.\-\sÀ-ÖØ-öø-ÿ]/g, "_");
}

function buildPublicUrl(opts: {
  cloud: string;
  resourceType: "raw" | "image" | "video";
  publicId: string;     // with/without ext
  ext?: string;
  download?: boolean;
}) {
  const { cloud, resourceType, publicId, ext, download } = opts;
  const base = `https://res.cloudinary.com/${cloud}/${resourceType}/upload`;
  const encodedPid = publicId.split("/").map(encodeURIComponent).join("/");
  const tail = ext && !encodedPid.endsWith(`.${ext}`) ? `${encodedPid}.${ext}` : encodedPid;
  return `${base}${download ? "/fl_attachment" : ""}/${tail}`;
}

/**
 * Stream Cloudinary -> client en propageant Range/206 et les en-têtes utiles.
 */
async function pipeFrom(url: string, asAttachment: boolean, filename: string, req: NextRequest, forcePdf = false) {
  const range = req.headers.get("range") || undefined;

  const upstream = await fetch(url, {
    cache: "no-store",
    headers: range ? { Range: range } : undefined,
    redirect: "follow",
  });

  if (!upstream.ok && upstream.status !== 206) {
    return { ok: false, status: upstream.status as number };
  }
  if (!upstream.body) return { ok: false, status: 502 };

  const headers = new Headers();

  // Content-Type
  const ct = upstream.headers.get("content-type") || "";
  if (forcePdf) {
    headers.set("Content-Type", "application/pdf");
  } else {
    headers.set("Content-Type", ct || "application/octet-stream");
  }

  // Disposition
  const disp = asAttachment ? "attachment" : "inline";
  headers.set("Content-Disposition", `${disp}; filename="${sanitizeName(filename)}"`);

  // Cache + exposition d’entêtes pour le navigateur
  headers.set("Cache-Control", "private, max-age=0, must-revalidate");
  headers.set("Access-Control-Expose-Headers", "Content-Disposition, Content-Length, Content-Range, Accept-Ranges");

  // Propage quelques entêtes utiles au Range
  const cr = upstream.headers.get("content-range");
  const ar = upstream.headers.get("accept-ranges") || "bytes";
  const cl = upstream.headers.get("content-length");

  if (cr) headers.set("Content-Range", cr);
  if (ar) headers.set("Accept-Ranges", ar);
  if (cl) headers.set("Content-Length", cl);

  const lm = upstream.headers.get("last-modified");
  const etag = upstream.headers.get("etag");
  if (lm) headers.set("Last-Modified", lm);
  if (etag) headers.set("ETag", etag);

  const status = upstream.status === 206 || cr ? 206 : 200;
  return { ok: true, response: new Response(upstream.body, { status, headers }) };
}

async function tryPublicVariants(
  cloud: string,
  publicIdNoExt: string,
  ext: string | undefined,
  asAttachment: boolean,
  filename: string,
  req: NextRequest,
  forcePdf = false
) {
  const rts: Array<"raw"|"image"|"video"> = ["raw","image","video"];
  const urls: string[] = [];
  for (const rt of rts) {
    urls.push(buildPublicUrl({ cloud, resourceType: rt, publicId: publicIdNoExt, download: asAttachment }));
    if (ext) urls.push(buildPublicUrl({ cloud, resourceType: rt, publicId: publicIdNoExt, ext, download: asAttachment }));
  }
  const tried: Array<{ url: string; status?: number }> = [];
  for (const u of urls) {
    try {
      const out = await pipeFrom(u, asAttachment, filename, req, forcePdf);
      if (out.ok) return { response: out.response };
      tried.push({ url: u, status: out.status });
    } catch { tried.push({ url: u, status: undefined }); }
  }
  return { tried };
}

async function tryAdminResource(publicIdNoExt: string) {
  const combos: Array<{resource_type:"raw"|"image"|"video"; type:"upload"|"authenticated"|"private"}> = [
    { resource_type:"raw", type:"upload" }, { resource_type:"raw", type:"authenticated" }, { resource_type:"raw", type:"private" },
    { resource_type:"image", type:"upload" }, { resource_type:"image", type:"authenticated" }, { resource_type:"image", type:"private" },
    { resource_type:"video", type:"upload" }, { resource_type:"video", type:"authenticated" }, { resource_type:"video", type:"private" },
  ];
  for (const c of combos) {
    try {
      // @ts-ignore cloudinary types lax
      const r = await cloudinary.api.resource(publicIdNoExt, c);
      return r as { public_id:string; resource_type:"raw"|"image"|"video"; type:"upload"|"authenticated"|"private"; format?:string; filename?:string };
    } catch (e:any) {
      if (e?.http_code && e.http_code !== 404) throw e;
    }
  }
  return null;
}

async function huntAdminByPrefix(fileNameOnly: string) {
  const combos: Array<{resource_type:"raw"|"image"|"video"; type:"upload"|"authenticated"|"private"}> = [
    { resource_type:"raw", type:"upload" }, { resource_type:"raw", type:"authenticated" }, { resource_type:"raw", type:"private" },
    { resource_type:"image", type:"upload" }, { resource_type:"image", type:"authenticated" }, { resource_type:"image", type:"private" },
    { resource_type:"video", type:"upload" }, { resource_type:"video", type:"authenticated" }, { resource_type:"video", type:"private" },
  ];

  const prefixes = [
    fileNameOnly,
    `famille/${fileNameOnly}`,
    `famille/Photos/${fileNameOnly}`,
    `famille/Documents/${fileNameOnly}`,
    `famille/Autres/${fileNameOnly}`,
  ];

  for (const pref of prefixes) {
    for (const c of combos) {
      try {
        // @ts-ignore cloudinary types lax
        const res = await cloudinary.api.resources({
          ...c,
          prefix: pref,
          max_results: 200,
          direction: "desc",
        });
        const first = res?.resources?.[0];
        if (first) {
          return {
            public_id: first.public_id as string,
            resource_type: first.resource_type as "raw"|"image"|"video",
            type: (first.type || "upload") as "upload"|"authenticated"|"private",
            format: first.format as string|undefined,
            filename: first.filename as string|undefined,
          };
        }
      } catch (e:any) {
        if (e?.http_code && e.http_code !== 404) throw e;
      }
    }
  }
  return null;
}

async function searchAnywhere(noExt: string, fileNameOnly: string) {
  try {
    // @ts-ignore
    const q = cloudinary.search
      .expression([
        `public_id="${noExt}"`,
        `public_id="${noExt}.*"`,
        `filename="${fileNameOnly}"`,
        `filename="${fileNameOnly}.*"`,
        `public_id:*${fileNameOnly}*`,
      ].join(" OR "))
      .with_field("public_id").with_field("resource_type").with_field("type").with_field("format").with_field("filename")
      .max_results(10);
    const res = await q.execute();
    const first = res?.resources?.[0];
    if (!first) return null;
    return {
      public_id: first.public_id as string,
      resource_type: first.resource_type as "raw"|"image"|"video",
      type: (first.type || "upload") as "upload"|"authenticated"|"private",
      format: first.format as string|undefined,
      filename: first.filename as string|undefined,
    };
  } catch { return null; }
}

/** URL signée Cloudinary (private_download_url) */
function buildSignedDownloadURL(
  r: { public_id:string; resource_type:"raw"|"image"|"video"; type:"upload"|"authenticated"|"private"; format?:string; filename?:string },
  asAttachment: boolean,
  wantedFormat?: string,
  filename?: string
) {
  const expires_at = Math.floor(Date.now()/1000) + 60*3; // 3 minutes
  const attachment: boolean | string = asAttachment
    ? sanitizeName(filename || r.filename || r.public_id.split("/").pop() || "file")
    : false;
  // @ts-ignore
  return cloudinary.utils.private_download_url(
    r.public_id,
    wantedFormat || r.format || "",
    { resource_type: r.resource_type, type: r.type, expires_at, attachment }
  );
}

/* ---------- handler ---------- */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const public_id_param = url.searchParams.get("public_id");
    const formatQuery = (url.searchParams.get("format") || "").replace(/^\./,"").toLowerCase() || undefined;
    const dl = url.searchParams.get("dl") === "1";
    const customFilenameParam = url.searchParams.get("filename") || undefined;

    if (!CLOUD) return new Response("Cloud name missing", { status: 500 });
    if (!public_id_param) return new Response("Missing public_id", { status: 400 });

    const given = decodeURIComponent(public_id_param);
    const { noExt, extFromId, fileNameOnly } = splitPublicId(given);
    const effectiveFormat = formatQuery || extFromId;
    const defaultName = `${fileNameOnly}.${(effectiveFormat || "bin")}`;
    const downloadName = sanitizeName(customFilenameParam || defaultName);
    const isPdf = (effectiveFormat || "").toLowerCase() === "pdf";

    // 1) URLs publiques (raw/image/video, avec/sans ext) — Range-friendly
    const pub = await tryPublicVariants(CLOUD, noExt, effectiveFormat, dl, downloadName, req, isPdf);
    if ("response" in pub && pub.response) return pub.response;

    // 2) fallback signé (Admin/Search)
    if (!(API_KEY && API_SECRET)) {
      const triedList = (pub.tried || []).map(t => `- ${t.url} -> ${t.status ?? "error"}`).join("\n");
      return new Response(
        "Proxy error: Cloudinary fetch failed and no server credentials set for signed fallback.\n"+triedList,
        { status: 404 }
      );
    }

    let res =
      (await tryAdminResource(noExt)) ||
      (await searchAnywhere(noExt, fileNameOnly)) ||
      (await huntAdminByPrefix(fileNameOnly));

    if (!res) {
      const triedList = (pub.tried || []).map(t => `- ${t.url} -> ${t.status ?? "error"}`).join("\n");
      return new Response(
        "Proxy error: Resource not found via Admin API nor Search.\n"+triedList,
        { status: 404 }
      );
    }

    const signed = buildSignedDownloadURL(res, dl, effectiveFormat, downloadName);
    const out = await pipeFrom(signed, dl, downloadName, req, isPdf);
    if (out.ok) return out.response;

    return new Response(`Proxy error: Signed delivery failed (${out.status}).`, { status: 404 });
  } catch (e:any) {
    return new Response(`Proxy error: ${e?.message || "unknown"}`, { status: 500 });
  }
}
