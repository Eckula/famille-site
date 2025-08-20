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

// --- COVER: on essaie d'abord MediaIndex (si liaison faite), sinon on cherche
// directement dans Cloudinary via le préfixe du dossier.
export async function coverUrlFor(appFolderId: string, albumName?: string) {
  // 1) via MediaIndex
  const m = await prisma.mediaIndex.findFirst({
    where: {
      appFolderId,
      resourceType: 'image',
      NOT: { format: 'pdf' },
    },
    orderBy: { createdAt: 'desc' },
  });

  let publicId: string | null = m?.publicId ?? null;

  // 2) fallback Cloudinary par préfixe si pas trouvé
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

  // URL optimisée (crop 16:9)
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

// --- actions
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
