// app/albums/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { PrismaClient } from '@prisma/client';
import cloudinary from '@/lib/cloudinary';

const prisma = new PrismaClient();

const ROOT_CLOUD = process.env.CLD_ROOT || 'famille';
const ALBUMS_FOLDER_NAME = 'Albums';               // le dossier applicatif ET Cloudinary
const ALBUMS_ROOT_PATH   = `${ROOT_CLOUD}/${ALBUMS_FOLDER_NAME}`;

// --- util commun
async function getAlbumsRoot() {
  const root = await prisma.appFolder.findFirst({ where: { name: ALBUMS_FOLDER_NAME } });
  if (!root) throw new Error(`Racine "${ALBUMS_FOLDER_NAME}" introuvable. Lance "npm run import:folders".`);
  return root;
}

/* ---------------- Cloudinary helpers ---------------- */

type CloudItem = {
  public_id: string;
  resource_type?: 'image' | 'video' | 'raw';
  format?: string;
  secure_url?: string;
  url?: string;
  thumbnail_url?: string;
  created_at?: string;
};

function mapItem(r: CloudItem) {
  const url = r.secure_url || r.url || '';
  // image + format=pdf => document
  const kind =
    r.resource_type === 'video' ? 'video' :
    r.resource_type === 'raw'   ? (r.format === 'pdf' ? 'document' : 'raw') :
    (r.format === 'pdf' ? 'document' : 'image');
  const thumb = kind === 'image' ? url : kind === 'video' ? (r.thumbnail_url || url) : undefined;
  return { publicId: r.public_id, url, thumb, kind, createdAt: r.created_at };
}

/** Résout des publicId par paquets, en essayant d'abord images puis vidéo puis raw. */
async function resolveCloudinary(publicIds: string[], types: Array<'image'|'video'|'raw'> = ['image','video','raw']) {
  if (!publicIds.length) return [];
  const found: CloudItem[] = [];
  const left = new Set(publicIds);
  const chunk = 100;

  async function byType(rt: 'image'|'video'|'raw') {
    const arr = Array.from(left);
    for (let i = 0; i < arr.length; i += chunk) {
      const slice = arr.slice(i, i + chunk);
      if (!slice.length) break;
      try {
        const res: any = await cloudinary.api.resources_by_ids(slice, { resource_type: rt, type: 'upload' } as any);
        const list: CloudItem[] = Array.isArray(res?.resources) ? res.resources : (Array.isArray(res) ? res : []);
        for (const r of list) {
          found.push(r);
          left.delete(r.public_id);
        }
      } catch {
        // on ignore les erreurs ponctuelles (rate-limit/transient)
      }
    }
  }

  for (const t of types) await byType(t);
  return found.map(mapItem);
}

/* ---------------- COVER ---------------- */

/**
 * Tente d'abord via MediaIndex (IDs en base) + filtre côté Cloudinary pour obtenir une image non-PDF,
 * sinon fallback: recherche Cloudinary par préfixe du dossier d'album.
 */
export async function coverUrlFor(appFolderId: string, albumName?: string) {
  // 1) IDs DB les plus récents
  const rows = await prisma.mediaIndex.findMany({
    where: { appFolderId },
    select: { publicId: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 120, // marge
  });
  const ids = rows.map(r => r.publicId);

  // 2) Essaie de trouver une image (non-PDF) parmi ces IDs
  let publicId: string | null = null;
  if (ids.length) {
    const resolved = await resolveCloudinary(ids, ['image','video','raw']);
    const img = resolved.find(x => x.kind === 'image'); // pdf est classé 'document', donc exclu
    if (img) publicId = img.publicId;
  }

  // 3) Fallback Cloudinary par préfixe si rien trouvé et qu'on a le nom de l'album
  if (!publicId && albumName) {
    const prefix = `${ALBUMS_ROOT_PATH}/${albumName}`;
    const res = await cloudinary.search
      .expression(`folder="${prefix}" AND resource_type:image`)
      .sort_by('created_at','desc')
      .max_results(1)
      .execute()
      .catch(() => null);
    publicId = res?.resources?.[0]?.public_id ?? null;
  }

  if (!publicId) return null;

  // URL optimisée (crop 16:9) — on force resource_type:image car on a choisi une image
  return cloudinary.url(publicId, {
    transformation: [
      { width: 800, height: 450, crop: 'fill', gravity: 'auto' },
      { fetch_format: 'auto', quality: 'auto' },
    ],
    secure: true,
    sign_url: false,
    resource_type: 'image',
  });
}

/* ---------------- Actions CRUD ---------------- */

export async function createAlbum(formData: FormData) {
  const name = String(formData.get('name') || '').trim();
  if (!name) return;

  const root = await getAlbumsRoot();

  // Cloudinary : crée le dossier (ignore si existe)
  const path = `${ALBUMS_ROOT_PATH}/${name}`;
  await cloudinary.api.create_folder(path).catch((e: any) => {
    if (!String(e?.message || '').includes('already exists')) throw e;
  });

  // Prisma : crée le dossier applicatif
  await prisma.appFolder.create({ data: { name, parentId: root.id } });

  revalidatePath('/albums');
}

export async function renameAlbum(formData: FormData) {
  const id = String(formData.get('id') || '');
  const newName = String(formData.get('newName') || '').trim();
  if (!id || !newName) return;

  const root = await getAlbumsRoot();
  const album = await prisma.appFolder.findUnique({ where: { id } });
  if (!album) throw new Error('Album introuvable');

  // Tente de renommer le dossier Cloudinary (si indisponible, on ignore proprement)
  const from = `${ALBUMS_ROOT_PATH}/${album.name}`;
  const to   = `${ALBUMS_ROOT_PATH}/${newName}`;
  try {
    // Certains comptes n’ont pas la méthode "rename_folder" — on ignore si non supporté.
    // @ts-ignore
    if (cloudinary.api.rename_folder) {
      // @ts-ignore
      await cloudinary.api.rename_folder(from, to);
    }
  } catch (_) {}

  // Prisma
  await prisma.appFolder.update({ where: { id }, data: { name: newName } });

  revalidatePath('/albums');
}

export async function deleteAlbum(formData: FormData) {
  const id = String(formData.get('id') || '');
  if (!id) return;

  const album = await prisma.appFolder.findUnique({ where: { id } });
  if (!album) return;

  const path = `${ALBUMS_ROOT_PATH}/${album.name}`;
  // supprime les médias sous le préfixe (on ignore les erreurs résiduelles)
  await cloudinary.api.delete_resources_by_prefix(path).catch(()=>{});
  await cloudinary.api.delete_folder(path).catch(()=>{});

  await prisma.appFolder.delete({ where: { id } });

  revalidatePath('/albums');
}
