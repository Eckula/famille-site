// app/api/media/assign/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // alias "@/lib/..." recommandé

type Body = {
  action: 'assign' | 'unassign' | 'move';
  // cible (alias acceptés)
  appFolderId?: string | null;
  folderId?: string | null;

  // optionnel : dossier source pour "move" (on ne bloque pas si absent)
  fromFolderId?: string | null;

  // médias à traiter
  publicIds?: string[];
};

const ok = (d: any, s = 200) =>
  NextResponse.json(d, { status: s, headers: { 'Cache-Control': 'no-store' } });

function normArray(x: any): string[] {
  if (!x) return [];
  if (Array.isArray(x)) return x.map(String).filter(Boolean);
  return [String(x)].filter(Boolean);
}

export async function POST(req: Request) {
  try {
    const body: Body = await req.json().catch(() => ({} as any));

    const action = (body?.action || 'assign') as Body['action'];
    const targetFolderId =
      (body?.appFolderId ?? body?.folderId) != null
        ? String(body.appFolderId ?? body.folderId)
        : null;

    const publicIds = normArray(body?.publicIds);
    if (!publicIds.length) {
      return ok({ error: 'publicIds requis (array de public_id).' }, 400);
    }

    // Pour assign/move, on exige une cible existante
    if ((action === 'assign' || action === 'move')) {
      if (!targetFolderId) return ok({ error: 'folderId (ou appFolderId) requis.' }, 400);
      const f = await prisma.appFolder.findUnique({ where: { id: targetFolderId }, select: { id: true } });
      if (!f) return ok({ error: 'Dossier cible introuvable.' }, 404);
    }

    let updated = 0;
    let created = 0;
    let unassigned = 0;

    if (action === 'unassign') {
      // Retire l’affectation (appFolderId = null)
      for (const publicId of publicIds) {
        const exists = await prisma.mediaIndex.findUnique({ where: { publicId }, select: { publicId: true } });
        if (exists) {
          await prisma.mediaIndex.update({ where: { publicId }, data: { appFolderId: null } });
          updated++;
        } else {
          // pas d’index -> rien à mettre à jour
          unassigned++; // comptage informatif
        }
      }
    } else {
      // assign OU move -> on (upsert) vers targetFolderId
      for (const publicId of publicIds) {
        const row = await prisma.mediaIndex.upsert({
          where: { publicId },
          update: { appFolderId: targetFolderId! },
          create: { publicId, appFolderId: targetFolderId! },
        });
        // si l’upsert créait la ligne, pas d’info directe -> heuristique : on (re)lit
        if (row && row.publicId === publicId) updated++;
        else created++;
      }
    }

    return ok({
      ok: true,
      action,
      appFolderId: targetFolderId ?? null,
      counts: { updated, created, unassigned },
    });
  } catch (e: any) {
    return ok({ error: e?.message || 'Erreur assignation médias.' }, 500);
  }
}

// Tolérance aux différents verbes utilisés côté front
export const PUT = POST;
export const PATCH = POST;
