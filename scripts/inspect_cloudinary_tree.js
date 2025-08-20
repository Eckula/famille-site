// scripts/reindex_media_from_cloudinary.js
// Parcourt Cloudinary sous ROOT et alimente MediaIndex(publicId, folderId)
'use strict';
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const { v2: cloudinary } = require('cloudinary');

function ensureCloudinary() {
  const cn = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const ak = process.env.CLOUDINARY_API_KEY;
  const as = process.env.CLOUDINARY_API_SECRET;
  if (!cn || !ak || !as) throw new Error('Cloudinary: variables manquantes (cloud_name/api_key/api_secret).');
  cloudinary.config({ cloud_name: cn, api_key: ak, api_secret: as, secure: true });
}

async function listAll(prefix) {
  const all = [];
  for (const combo of [
    { resource_type: 'image', type: 'upload' },
    { resource_type: 'video', type: 'upload' },
    { resource_type: 'raw',   type: 'upload'  },
  ]) {
    let nc;
    do {
      const r = await cloudinary.api.resources({ ...combo, prefix, max_results: 500, next_cursor: nc });
      if (Array.isArray(r?.resources)) all.push(...r.resources);
      nc = r?.next_cursor;
    } while (nc);
  }
  return all;
}

(async function main() {
  ensureCloudinary();
  const ROOT = (process.env.CLOUDINARY_ROOT_FOLDER || 'famille').trim();
  const res = await listAll(`${ROOT}/`);
  console.log(`Total ressources sous ${ROOT}/ :`, res.length);

  // Quelques exemples
  console.log('Exemples de public_id:', res.slice(0, 10).map(x => x.public_id));

  // Compter les préfixes 1 ou 2 niveaux
  const bucket = {};
  for (const r of res) {
    const parts = r.public_id.split('/');
    for (let depth = 2; depth <= Math.min(3, parts.length - 1); depth++) {
      const p = parts.slice(0, depth).join('/');
      bucket[p] = (bucket[p] || 0) + 1;
    }
  }
  const top = Object.entries(bucket).sort((a,b) => b[1]-a[1]).slice(0, 30);
  console.log('Top préfixes (jusqu’à 2 niveaux):');
  for (const [k, v] of top) console.log(v.toString().padStart(5), '  ', k);
})();
