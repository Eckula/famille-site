// app/api/folders/all-gallery/route.ts

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const ok = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Renvoie *tous* les dossiers de la galerie (tous niveaux), en excluant les sous-arbres
 * "Albums", "Événements/Evenements", et "Documents".
 *
 * GET /api/folders/all-gallery
 *   - q?           : filtre texte (contient, insensible à la casse)
 *   - exclude?     : noms racines séparés par des virgules (par défaut: Albums,Événements,Evenements,Documents)
 *   - order?       : created_desc | created_asc (défaut: created_desc)
 */
export async function GET(req: Request) {
  try {
    const u = new URL(req.url);
    const q = (u.searchParams.get("q") || "").trim().toLowerCase();
    const order =
      (u.searchParams.get("order") || "created_desc").toLowerCase() ===
      "created_asc"
        ? "asc"
        : "desc";

    const excludeRaw =
      u.searchParams.get("exclude") ||
      "Albums,Événements,Evenements,Documents";
    const EXCLUDE = excludeRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // 1) on charge *tous* les dossiers
    const rows = await prisma.appFolder.findMany({
      select: { id: true, name: true, parentId: true, createdAt: true },
    });

    // 2) on construit une map id -> node
    const map = new Map(rows.map((r) => [r.id, r]));

    // 3) helper: retrouve le nom de la racine (ancêtre top-level)
    function rootNameOf(id: string | null): string | null {
      let cur = id ? map.get(id) || null : null;
      if (!cur) return null;
      // remonte jusqu'à parentId=null
      while (cur?.parentId) cur = map.get(cur.parentId) || null;
      return cur?.name || null;
    }

    // 4) filtre: on prend uniquement les dossiers qui ne sont pas dans les sous-arbres exclus
    //    et qui ne sont pas des racines (parentId != null)
    let items = rows.filter((r) => {
      if (!r.parentId) return false; // on ne renvoie pas les racines
      const rn = rootNameOf(r.id);
      if (rn && EXCLUDE.includes(rn)) return false;
      return true;
    });

    // 5) filtre texte éventuel
    if (q) {
      items = items.filter(
        (r) => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
      );
    }

    // 6) tri
    items.sort((a, b) => {
      const d =
        (order === "asc" ? 1 : -1) *
        (+new Date(a.createdAt) - +new Date(b.createdAt));
      if (d !== 0) return d;
      return a.name.localeCompare(b.name, "fr");
    });

    return ok({ items });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur /api/folders/all-gallery" }, 500);
  }
}
