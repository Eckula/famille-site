// scripts/ensure_album_link_table.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Postgres: vérifie l'existence par information_schema
  const exists = await prisma.$queryRawUnsafe(`
    SELECT to_regclass('public."AlbumFolderLink"') IS NOT NULL AS exists;
  `);
  const ok = Array.isArray(exists) ? exists[0].exists : exists?.exists;

  if (ok) {
    console.log('AlbumFolderLink déjà présent.');
    return;
  }

  console.log('Création de AlbumFolderLink ...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "AlbumFolderLink" (
      "albumId"   text    NOT NULL,
      "folderId"  text    NOT NULL,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      CONSTRAINT "AlbumFolderLink_pkey" PRIMARY KEY ("albumId","folderId"),
      CONSTRAINT "AlbumFolderLink_album_fkey"
        FOREIGN KEY ("albumId") REFERENCES "Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "AlbumFolderLink_folder_fkey"
        FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );
  `);
  console.log('OK.');
}

main().then(()=>prisma.$disconnect()).catch(async (e)=>{
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
