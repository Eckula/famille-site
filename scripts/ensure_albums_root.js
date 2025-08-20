// scripts/ensure_albums_root.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.appFolder.findFirst({ where: { name: 'Albums', parentId: null } });
  if (existing) {
    console.log('Racine "Albums" déjà présente :', existing.id);
    return;
  }
  const created = await prisma.appFolder.create({ data: { name: 'Albums', parentId: null } });
  console.log('Racine "Albums" créée :', created.id);
}

main().then(()=>prisma.$disconnect()).catch(async (e)=>{
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
