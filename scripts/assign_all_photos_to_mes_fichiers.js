// assign_all_photos_to_mes_fichiers.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1) Assure le dossier "Mes fichiers" (racine)
  let root = await prisma.folder.findFirst({ where: { parentId: null, name: 'Mes fichiers' } });
  if (!root) {
    root = await prisma.folder.create({ data: { name: 'Mes fichiers', parentId: null } });
    console.log('Créé:', root);
  } else {
    console.log('Dossier existant:', root.id, root.name);
  }

  // 2) Affecte en masse tout ce qui est sous famille/Photos/
  const u = await prisma.mediaIndex.updateMany({
    where: {
      folderId: null,
      publicId: { startsWith: 'famille/Photos/' },
    },
    data: { folderId: root.id },
  });

  console.log('Affectés à "Mes fichiers":', u.count);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
