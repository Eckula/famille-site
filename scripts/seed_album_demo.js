// scripts/seed_album_demo.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const GALLERY_CANDIDATES = ["Mes fichiers","Maman","Papa","Eunice-Miya"];

async function ensureAlbumsRoot() {
  let root = await prisma.appFolder.findFirst({ where: { name: 'Albums', parentId: null } });
  if (!root) root = await prisma.appFolder.create({ data: { name: 'Albums', parentId: null } });
  return root;
}

async function main() {
  const albumsRoot = await ensureAlbumsRoot();

  // 1) Album "Démo"
  let album = await prisma.appFolder.findFirst({
    where: { name: 'Démo', parentId: albumsRoot.id }
  });
  if (!album) {
    album = await prisma.appFolder.create({ data: { name: 'Démo', parentId: albumsRoot.id } });
    console.log('Album créé :', album.id, album.name);
  } else {
    console.log('Album existant :', album.id, album.name);
  }

  // 2) Dossiers de galerie à la racine (hors dossiers systèmes)
  const roots = await prisma.appFolder.findMany({
    where: {
      parentId: null,
      NOT: { name: { in: ['Albums','Événements','Evenements','Documents'] } }
    }
  });

  // Filtrer par candidats si présents
  const toLink = roots.filter(r => GALLERY_CANDIDATES.includes(r.name));
  if (!toLink.length) {
    console.log('Aucun des dossiers candidats trouvés en galerie. Liage ignoré.');
    return;
  }

  for (const f of toLink) {
    await prisma.albumFolderLink.upsert({
      where: { albumId_folderId: { albumId: album.id, folderId: f.id } },
      update: {},
      create: { albumId: album.id, folderId: f.id }
    });
    console.log(`Lié: album=${album.name} ⇄ dossier=${f.name}`);
  }
}

main().then(()=>prisma.$disconnect()).catch(async (e)=>{
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
