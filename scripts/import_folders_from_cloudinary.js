// scripts/import_folders_from_cloudinary.js
// Crée/alimente la table Folder à partir des sous-dossiers directs de CLOUDINARY_ROOT_FOLDER

'use strict';
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const { v2: cloudinary } = require('cloudinary');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ROOT = (process.env.CLOUDINARY_ROOT_FOLDER || 'famille').trim();

function ensureCloudinary() {
  const cn = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const ak = process.env.CLOUDINARY_API_KEY;
  const as = process.env.CLOUDINARY_API_SECRET;
  if (!cn || !ak || !as) throw new Error('Cloudinary: variables manquantes (cloud_name/api_key/api_secret).');
  cloudinary.config({ cloud_name: cn, api_key: ak, api_secret: as, secure: true });
}

async function ensureFolderPrisma(name, parentId = null) {
  let f = await prisma.folder.findFirst({ where: { name, parentId } });
  if (!f) f = await prisma.folder.create({ data: { name, parentId } });
  return f;
}

async function listAllSubfolders(prefix) {
  const out = [];
  let nc;
  do {
    const res = await cloudinary.api.sub_folders(prefix, { max_results: 500, next_cursor: nc });
    if (Array.isArray(res?.folders)) out.push(...res.folders.map(f => f.name.split('/').pop()));
    nc = res?.next_cursor;
  } while (nc);
  return out;
}

(async function main() {
  console.log('--- Import des dossiers Cloudinary → Prisma ---');
  ensureCloudinary();
  console.log('ROOT =', ROOT);

  const parentAlbums = await ensureFolderPrisma('Albums', null);
  const parentEvts   = await ensureFolderPrisma('Evenements', null);

  const albums = await listAllSubfolders(`${ROOT}/Albums`);
  const events = await listAllSubfolders(`${ROOT}/Evenements`);
  console.log(`Trouvé ${albums.length} album(s), ${events.length} événement(s).`);

  for (const n of albums)   await ensureFolderPrisma(n, parentAlbums.id);
  for (const n of events)   await ensureFolderPrisma(n, parentEvts.id);

  console.log('OK. Dossiers assurés en base.');
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
