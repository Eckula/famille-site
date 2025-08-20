// scripts/reindex_media_from_cloudinary.js
// Parcourt Cloudinary sous ROOT et alimente MediaIndex(publicId, folderId)

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

async function listAllUnderRoot() {
  const all = [];
  for (const combo of [
    { resource_type: 'image', type: 'upload' },
    { resource_type: 'video', type: 'upload' },
    { resource_type: 'raw',   type: 'upload'  },
  ]) {
    let nc;
    do {
      const r = await cloudinary.api.resources({ ...combo, prefix: `${ROOT}/`, max_results: 500, next_cursor: nc });
      if (Array.isArray(r?.resources)) all.push(...r.resources);
      nc = r?.next_cursor;
    } while (nc);
  }
  return all;
}

function normalize(s) { return (s || '').toLowerCase(); }

// Essaie de trouver un dossier cible pour un public_id.
// Stratégies (dans l’ordre) :
//  1) préfixe Albums/<Nom> ou Evenements/<Nom>
//  2) préfixe Photos/<Nom>
//  3) n’importe quel segment égal (insensible à la casse) à <Nom>
function resolveTargetFolder(publicId, folders, parents) {
  const parts = publicId.split('/');
  const dirParts = parts.slice(0, -1); // on exclut le nom de fichier
  const lowerDirParts = dirParts.map(normalize);

  // 1) Albums/<Nom> ou Evenements/<Nom>
  for (const f of folders) {
    const parent = parents.get(f.parentId);
    if (!parent) continue;
    const want = [normalize(ROOT), normalize(parent.name), normalize(f.name)].join('/');
    if (normalize(publicId).startsWith(want + '/')) return f;
  }

  // 2) Photos/<Nom>
  for (const f of folders) {
    const want = [normalize(ROOT), 'photos', normalize(f.name)].join('/');
    if (normalize(publicId).startsWith(want + '/')) return f;
  }

  // 3) segment égal au nom du dossier (match exact sur un segment, pas sur le fichier)
  for (const f of folders) {
    const name = normalize(f.name);
    if (lowerDirParts.includes(name)) return f;
  }

  return null;
}

(async function main() {
  console.log('--- Réindexation Cloudinary → MediaIndex (améliorée) ---');
  ensureCloudinary();

  // Récupère tous les dossiers app (parents + enfants)
  const parents = await prisma.folder.findMany({ where: { parentId: null } });
  const parentById = new Map(parents.map(p => [p.id, p]));

  const children = await prisma.folder.findMany({ where: { parentId: { not: null } } });
  if (!children.length) {
    console.log('Aucun sous-dossier applicatif. Lance d’abord import:folders.');
    await prisma.$disconnect();
    return;
  }

  // Liste *toutes* les ressources sous ROOT
  const res = await listAllUnderRoot();
  console.log(`Ressources trouvées sous ${ROOT}/ : ${res.length}`);

  let assigned = 0, unassigned = 0, upserts = 0;

  for (const r of res) {
    const publicId = r.public_id;
    const target = resolveTargetFolder(publicId, children, parentById);

    if (target) {
      await prisma.mediaIndex.upsert({
        where:  { publicId },
        update: { folderId: target.id },
        create: { publicId, folderId: target.id },
      });
      assigned++; upserts++;
    } else {
      // On garantit l’existence de la ligne (non affectée)
      await prisma.mediaIndex.upsert({
        where:  { publicId },
        update: { folderId: null },
        create: { publicId, folderId: null },
      });
      unassigned++; upserts++;
    }
  }

  console.log(`OK. upserts=${upserts}, affectés=${assigned}, non affectés=${unassigned}`);
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
