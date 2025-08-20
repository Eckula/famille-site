// scripts/assign_by_tokens.js
'use strict';
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const { v2: cloudinary } = require('cloudinary');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ROOT = (process.env.CLOUDINARY_ROOT_FOLDER || 'famille').trim();
// Mets DRY_RUN=1 pour une simulation (n’écrit pas en base)
const DRY_RUN = process.env.DRY_RUN === '1';

// (optionnel) ajoute des alias/synonymes par nom de dossier pour mieux matcher
// Exemple: "Anthony-spencer": ["anthony","spencer","tony"]
const ALIASES = {
  // "Anthony-spencer": ["anthony","spencer"],
  // "Ethan-Joy": ["ethan","joy"],
  // "Maman": ["maman","mere","mummy"],
  // "Papa": ["papa","pere","daddy"],
};

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

function tokenize(name) {
  return (name || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // enlève accents
    .split(/[^a-z0-9]+/i)
    .filter(t => t.length >= 3);
}

(async function main () {
  console.log('--- Affectation par mots-clés (sans déplacement Cloudinary) ---');
  ensureCloudinary();

  // Dossiers app (enfants = albums/événements)
  const parents = await prisma.folder.findMany({ where: { parentId: null } });
  const parentById = new Map(parents.map(p => [p.id, p]));
  const children = await prisma.folder.findMany({ where: { parentId: { not: null } } });

  if (!children.length) {
    console.log('Pas de sous-dossier en base. Lance d’abord: npm run import:folders');
    await prisma.$disconnect();
    return;
  }

  const folders = children.map(f => {
    const baseTokens = tokenize(f.name);
    const aliasTokens = Array.isArray(ALIASES[f.name]) ? ALIASES[f.name].map(s => s.toLowerCase()) : [];
    return {
      ...f,
      parent: parentById.get(f.parentId),
      tokens: Array.from(new Set([...baseTokens, ...aliasTokens])),
    };
  });

  const resources = await listAllUnderRoot();
  console.log(`Ressources scannées: ${resources.length}`);

  let affected = 0, unassigned = 0, updates = 0;

  for (const r of resources) {
    const id = r.public_id.toLowerCase();

    // score = nb de tokens du dossier trouvés dans le chemin
    const matches = folders
      .map(f => ({ f, score: f.tokens.reduce((n, t) => n + (t && id.includes(t) ? 1 : 0), 0) }))
      .filter(x => x.score > 0)
      .sort((a,b) => b.score - a.score || b.f.name.length - a.f.name.length);

    const best = matches[0]?.f || null;

    if (best) {
      if (!DRY_RUN) {
        await prisma.mediaIndex.upsert({
          where:  { publicId: r.public_id },
          update: { folderId: best.id },
          create: { publicId: r.public_id, folderId: best.id },
        });
      }
      affected++; updates++;
    } else {
      if (!DRY_RUN) {
        await prisma.mediaIndex.upsert({
          where:  { publicId: r.public_id },
          update: { folderId: null },
          create: { publicId: r.public_id, folderId: null },
        });
      }
      unassigned++; updates++;
    }
  }

  console.log(`OK. updates=${updates}, affectés=${affected}, non_affectés=${unassigned}${DRY_RUN ? ' (DRY_RUN)' : ''}`);
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
