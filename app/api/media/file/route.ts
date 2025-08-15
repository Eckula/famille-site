// app/api/media/file/route.ts
import type { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* ---------------- Cloudinary server creds ---------------- */
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

/* ---------------- helpers ---------------- */
function splitPublicId(id: string) {
  const safe = id
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean)
    .join("/");
  const hasExt = /\.[^/\.]+$/.test(safe);
  const noExt = hasExt ? safe.replace(/\.[^/\.]+$/, "") : safe;
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
  publicId: string; // with/without ext
  ext?: string;
  download?: boolean;
}) {
  const { cloud, resourceType, publicId, ext, download } = opts;
  const base = `https://res.cloudinary.com/${cloud}/${resourceType}/upload`;
  const encodedPid = publicId
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  const tail =
    ext && !encodedPid.endsWith(`.${ext}`)
      ? `${encodedPid}.${ext}`
      : encodedPid;
  return `${base}${download ? "/fl_attachment" : ""}/${tail}`;
}

async function streamFrom(
  url: string,
  asAttachment: boolean,
  filename?: string
) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok || !res.body) return { ok: false, status: res.status as number };

  const headers = new Headers();
  headers.set(
    "Content-Type",
    res.headers.get("content-type") || "application/octet-stream"
  );
  headers.set("Cache-Control", "private, max-age=0, must-revalidate");

  if (asAttachment) {
    const fallback = decodeURIComponent(url.split("/").pop() || "file");
    const name = sanitizeName(filename || fallback);
    headers.set("Content-Disposition", `attachment; filename="${name}"`);
  }
  return { ok: true, response: new Response(res.body, { status: 200, headers }) };
}

async function tryPublicVariants(
  cloud: string,
  publicIdNoExt: string,
  ext: string | undefined,
  asAttachment: boolean,
  filename?: string
) {
  const rts: Array<"raw" | "image" | "video"> = ["raw", "image", "video"];
  const urls: string[] = [];
  for (const rt of rts) {
    urls.push(
      buildPublicUrl({
        cloud,
        resourceType: rt,
        publicId: publicIdNoExt,
        download: asAttachment,
      })
    );
    if (ext)
      urls.push(
        buildPublicUrl({
          cloud,
          resourceType: rt,
          publicId: publicIdNoExt,
          ext,
          download: asAttachment,
        })
      );
  }
  const tried: Array<{ url: string; status?: number }> = [];
  for (const u of urls) {
    try {
      const out = await streamFrom(u, asAttachment, filename);
      if (out.ok) return { response: out.response };
      tried.push({ url: u, status: out.status });
    } catch {
      tried.push({ url: u, status: undefined });
    }
  }
  return { tried };
}

async function tryAdminResource(publicIdNoExt: string) {
  const combos: Array<{
    resource_type: "raw" | "image" | "video";
    type: "upload" | "authenticated" | "private";
  }> = [
    { resource_type: "raw", type: "upload" },
    { resource_type: "raw", type: "authenticated" },
    { resource_type: "raw", type: "private" },
    { resource_type: "image", type: "upload" },
    { resource_type: "image", type: "authenticated" },
    { resource_type: "image", type: "private" },
    { resource_type: "video", type: "upload" },
    { resource_type: "video", type: "authenticated" },
    { resource_type: "video", type: "private" },
  ];
  for (const c of combos) {
    try {
      // @ts-ignore admin API
      const r = await cloudinary.api.resource(publicIdNoExt, c);
      return r as {
        public_id: string;
        resource_type: "raw" | "image" | "video";
        type: "upload" | "authenticated" | "private";
        format?: string;
        filename?: string;
      };
    } catch (e: any) {
      if (e?.http_code && e.http_code !== 404) throw e;
    }
  }
  return null;
}

/** Fallback “Admin listing by prefix” – balaye par préfixe (sans dossier) */
async function huntAdminByPrefix(fileNameOnly: string) {
  const combos: Array<{
    resource_type: "raw" | "image" | "video";
    type: "upload" | "authenticated" | "private";
  }> = [
    { resource_type: "raw", type: "upload" },
    { resource_type: "raw", type: "authenticated" },
    { resource_type: "raw", type: "private" },
    { resource_type: "image", type: "upload" },
    { resource_type: "image", type: "authenticated" },
    { resource_type: "image", type: "private" },
    { resource_type: "video", type: "upload" },
    { resource_type: "video", type: "authenticated" },
    { resource_type: "video", type: "private" },
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
        // @ts-ignore admin API
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
            resource_type: first.resource_type as "raw" | "image" | "video",
            type: (first.type || "upload") as
              | "upload"
              | "authenticated"
              | "private",
            format: first.format as string | undefined,
            filename: first.filename as string | undefined,
          };
        }
      } catch (e: any) {
        if (e?.http_code && e.http_code !== 404) throw e;
      }
    }
  }
  return null;
}

async function searchAnywhere(noExt: string, fileNameOnly: string) {
  try {
    // @ts-ignore search API
    const q = cloudinary.search
      .expression(
        [
          `public_id="${noExt}"`,
          `public_id="${noExt}.*"`,
          `filename="${fileNameOnly}"`,
          `filename="${fileNameOnly}.*"`,
          `public_id:*${fileNameOnly}*`,
        ].join(" OR ")
      )
      .with_field("public_id")
      .with_field("resource_type")
      .with_field("type")
      .with_field("format")
      .with_field("filename")
      .max_results(10);
    const res = await q.execute();
    const first = res?.resources?.[0];
    if (!first) return null;
    return {
      public_id: first.public_id as string,
      resource_type: first.resource_type as "raw" | "image" | "video",
      type: (first.type || "upload") as "upload" | "authenticated" | "private",
      format: first.format as string | undefined,
      filename: first.filename as string | undefined,
    };
  } catch {
    return null;
  }
}

/** Construit une URL signée (typages TS trop stricts => opts en any) */
function buildSignedDownloadURL(
  r: {
    public_id: string;
    resource_type: "raw" | "image" | "video";
    type: "upload" | "authenticated" | "private";
    format?: string;
    filename?: string;
  },
  asAttachment: boolean,
  wantedFormat?: string,
  filename?: string
) {
  const expires_at = Math.floor(Date.now() / 1000) + 60 * 3; // 3 minutes
  const name =
    filename || r.filename || r.public_id.split("/").pop() || "file";

  // cloudinary typings n’autorisent pas string sur "attachment"
  // -> on met attachment: true + filename séparé (opts typé any)
  const opts: any = {
    resource_type: r.resource_type,
    type: r.type,
    expires_at,
  };
  if (asAttachment) {
    opts.attachment = true;
    opts.filename = sanitizeName(name);
  }

  // @ts-ignore typings cloudinary
  return cloudinary.utils.private_download_url(
    r.public_id,
    wantedFormat || r.format || "",
    opts
  );
}

/* ---------------- handler ---------------- */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const public_id_param = url.searchParams.get("public_id");
    const formatQuery =
      (url.searchParams.get("format") || "").replace(/^\./, "").toLowerCase() ||
      undefined;
    const dl = url.searchParams.get("dl") === "1";
    const customFilenameParam = url.searchParams.get("filename") || undefined;

    if (!CLOUD) return new Response("Cloud name missing", { status: 500 });
    if (!public_id_param) return new Response("Missing public_id", { status: 400 });

    const given = decodeURIComponent(public_id_param);
    const { noExt, extFromId, fileNameOnly } = splitPublicId(given);
    const effectiveFormat = formatQuery || extFromId;
    const defaultName = `${fileNameOnly}.${effectiveFormat || "bin"}`;
    const downloadName = sanitizeName(customFilenameParam || defaultName);

    // 1) Essais publics (raw/image/video, avec/sans extension)
    const pub = await tryPublicVariants(
      CLOUD,
      noExt,
      effectiveFormat,
      dl,
      downloadName
    );
    if ("response" in pub && pub.response) return pub.response;

    // 2) Fallback signé via Admin/Search
    if (!(API_KEY && API_SECRET)) {
      const triedList = (pub.tried || [])
        .map((t) => `- ${t.url} -> ${t.status ?? "error"}`)
        .join("\n");
      return new Response(
        "Proxy error: Cloudinary fetch failed and no server credentials set for signed fallback.\n" +
          triedList,
        { status: 404 }
      );
    }

    let res =
      (await tryAdminResource(noExt)) ||
      (await searchAnywhere(noExt, fileNameOnly)) ||
      (await huntAdminByPrefix(fileNameOnly));

    if (!res) {
      const triedList = (pub.tried || [])
        .map((t) => `- ${t.url} -> ${t.status ?? "error"}`)
        .join("\n");
      return new Response(
        "Proxy error: Resource not found via Admin API nor Search.\n" +
          triedList,
        { status: 404 }
      );
    }

    const signed = buildSignedDownloadURL(
      res,
      dl,
      effectiveFormat,
      downloadName
    );
    const out = await streamFrom(signed, dl, downloadName);
    if (out.ok) return out.response;

    return new Response(
      `Proxy error: Signed delivery failed (${out.status}).`,
      { status: 404 }
    );
  } catch (e: any) {
    return new Response(`Proxy error: ${e?.message || "unknown"}`, {
      status: 500,
    });
  }
}
