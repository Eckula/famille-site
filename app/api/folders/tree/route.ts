// app/api/folders/tree/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const ok = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
const bad = (msg: string, status = 400) => ok({ error: msg }, status);

type Node = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt?: string | null;
  children?: Node[];
  childrenCount?: number;
  mediaCount?: number;
  path?: string; // "Papa/2025/Noël"
};

export async function GET(req: Request) {
  try {
    const sp = new URL(req.url).searchParams;
    const includeSystem = sp.get("includeSystem") === "1"; // inclure {Albums, Événements/Evenements, Documents}
    const flatOnly = sp.get("flat") === "1";               // renvoyer aussi une liste à plat (utile recherche)
    const q = (sp.get("q") || "").trim().toLowerCase();

    // 1) on récupère tout (id, name, parent) + petits compteurs
    const rows = await prisma.appFolder.findMany({
      select: {
        id: true, name: true, parentId: true, createdAt: true,
        _count: { select: { children: true, media: true } },
      },
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
    });

    // 2) construit des nœuds
    const map = new Map<string, Node>();
    rows.forEach(r => {
      map.set(r.id, {
        id: r.id,
        name: r.name,
        parentId: r.parentId,
        createdAt: r.createdAt?.toISOString?.() ?? (r.createdAt as any),
        children: [],
        childrenCount: r._count?.children ?? 0,
        mediaCount: r._count?.media ?? 0,
      });
    });

    // 3) rattache enfants → parents
    const roots: Node[] = [];
    for (const n of map.values()) {
      if (n.parentId && map.has(n.parentId)) {
        map.get(n.parentId)!.children!.push(n);
      } else {
        roots.push(n);
      }
    }

    // 4) filtre racines si includeSystem=0 (par défaut : on exclut Albums/Événements/Documents)
    let filteredRoots = roots;
    if (!includeSystem) {
      filteredRoots = roots.filter(
        r => !["Albums", "Événements", "Evenements", "Documents"].includes(r.name)
      );
    }

    // 5) calcule `path` et aplatissement (utile côté client pour recherche)
    const flat: Node[] = [];
    const visit = (n: Node, base: string[]) => {
      n.path = [...base, n.name].join("/");
      flat.push({ ...n, children: undefined }); // version à plat
      for (const c of n.children || []) visit(c, [...base, n.name]);
    };
    for (const r of filteredRoots) visit(r, []);

    // 6) filtre par q si demandé (sur le flat)
    const payload = {
      roots: filteredRoots,     // arborescence complète (filtrée)
      flat: q ? flat.filter(n => n.path!.toLowerCase().includes(q)) : flat,
      count: rows.length,
    };

    // NB : "Mes fichiers" n’est pas un dossier en base (c’est la vue "non affectés"),
    // il est donc normal qu’il n’apparaisse pas ici.
    return ok(payload);
  } catch (e: any) {
    return bad(e?.message || "Erreur /api/folders/tree", 500);
  }
}
