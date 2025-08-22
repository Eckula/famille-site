// app/api/media/upload-local/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files: File[] = [];
    for (const v of form.values()) if (v instanceof File) files.push(v);
    if (!files.length) return NextResponse.json({ error: 'Aucun fichier.' }, { status: 400 });

    const dir = path.join(process.cwd(), 'public', 'fichiers');
    await mkdir(dir, { recursive: true });

    const items: { url: string; name: string }[] = [];
    for (const f of files) {
      const buf = Buffer.from(await f.arrayBuffer());
      const safe = (f.name || 'media').replace(/[^\w.\-]+/g, '_');
      const name = `${Date.now()}_${safe}`;
      await writeFile(path.join(dir, name), buf);
      items.push({ url: `/fichiers/${name}`, name });
    }

    return NextResponse.json({ ok: true, storage: 'local', items }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 });
  }
}
