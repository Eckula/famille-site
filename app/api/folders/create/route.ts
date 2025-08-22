// app/api/folders/create/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

function ensureCloudinary() {
  const cloud_name =
    process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error('Cloudinary: variables manquantes (CLOUDINARY_*).');
  }
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
}

function sanitizeSegment(s: string) {
  // autorise lettres/chiffres/ - _ et / (pour sous-dossiers), enlève espaces & caractères spéciaux
  return s.replace(/[^\w\-\/]+/g, '_').replace(/\/{2,}/g, '/').replace(/^\/|\/$/g, '');
}

export async function POST(req: NextRequest) {
  try {
    ensureCloudinary();

    const ROOT = (process.env.CLOUDINARY_ROOT_FOLDER || 'famille').trim();
    const body = await req.json().catch(() => ({}));
    const parent = typeof body?.parent === 'string' ? body.parent : '';
    const child = typeof body?.child === 'string' ? body.child : '';

    if (!child) {
      return NextResponse.json({ error: 'Paramètre "child" requis.' }, { status: 400 });
    }

    const parentSan = parent ? sanitizeSegment(parent) : '';
    const childSan = sanitizeSegment(child);
    const clPath = [sanitizeSegment(ROOT), parentSan, childSan].filter(Boolean).join('/');

    // Types Cloudinary peuvent ne pas déclarer create_folder dans tous les env → cast en any
    const createFolder = (cloudinary as any).api.create_folder as (p: string) => Promise<any>;

    const res = await createFolder(clPath);

    return NextResponse.json({
      ok: true,
      path: clPath,
      result: { ...res },
    });
  } catch (e: any) {
    const msg = e?.error?.message || e?.message || 'Erreur inconnue';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
