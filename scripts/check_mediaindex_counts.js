// scripts/check_mediaindex_counts.js
#!/usr/bin/env node
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const rows = await prisma.mediaIndex.findMany({ select: { folderId: true } });
  const folders = await prisma.folder.findMany({ select: { id: true, name: true } });
  const nameById = Object.fromEntries(folders.map(f => [f.id, f.name]));
  const counts = new Map();
  for (const r of rows) counts.set(r.folderId || '(non affecté)', (counts.get(r.folderId || '(non affecté)') || 0) + 1);
  console.log('--- Comptage par dossier ---');
  for (const [id, n] of [...counts.entries()].sort((a,b)=>b[1]-a[1])) {
    const label = id === '(non affecté)' ? id : (nameById[id] || id);
    console.log(`${String(label).padEnd(28)}  ${n}`);
  }
  await prisma.$disconnect();
})();

