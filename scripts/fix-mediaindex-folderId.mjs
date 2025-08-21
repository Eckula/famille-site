// scripts/fix-mediaindex-folderId.mjs
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOTS = ["app"];               // ajuste si besoin (ex: "src")
const EXTS = new Set([".ts", ".tsx", ".mts", ".cts"]);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = join(dir, d.name);
    if (d.isDirectory()) return walk(p);
    const low = d.name.toLowerCase();
    if ([...EXTS].some((ext) => low.endsWith(ext))) return [p];
    return [];
  });
}

function applyRewrites(src) {
  let s = src;

  // 1) groupBy({ by: ['folderId'] }) => ['appFolderId']
  s = s.replace(
    /(\.mediaIndex\s*\.\s*groupBy\(\s*\{[\s\S]*?by\s*:\s*\[\s*)(["'])folderId\2/gi,
    '$1$2appFolderId$2'
  );

  // 2) where: { folderId: ... }  dans appels mediaIndex.*
  s = s.replace(
    /(\.mediaIndex\s*\.\s*(?:findMany|findFirst|findUnique|updateMany|deleteMany|upsert|update|create)\(\s*\{[\s\S]*?where\s*:\s*\{[\s\S]*?)\bfolderId\b\s*:/gi,
    "$1appFolderId:"
  );

  // 3) data: { folderId: ... } dans create/update/upsert/updateMany
  s = s.replace(
    /(\.mediaIndex\s*\.\s*(?:create|update|upsert|updateMany)\(\s*\{[\s\S]*?data\s*:\s*\{[\s\S]*?)\bfolderId\b\s*:/gi,
    "$1appFolderId:"
  );

  // 4) select: { folderId: true } => appFolderId: true
  s = s.replace(
    /(\.mediaIndex[\s\S]*?select\s*:\s*\{[\s\S]*?)\bfolderId\b(\s*:\s*true)/gi,
    "$1appFolderId$2"
  );

  // 5) create: { publicId, folderId } => { publicId, appFolderId: folderId }
  // (cas courant d'upsert/assign)
  s = s.replace(
    /(\.mediaIndex\s*\.\s*(?:create|upsert)\(\s*\{[\s\S]*?create\s*:\s*\{\s*[^}]*?)\bpublicId\b\s*,\s*\bfolderId\b/gi,
    "$1publicId, appFolderId: folderId"
  );

  return s;
}

let changed = 0;
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const before = readFileSync(file, "utf8");
    const after = applyRewrites(before);
    if (after !== before) {
      writeFileSync(file, after, "utf8");
      changed++;
      console.log("✔ fixed:", file);
    }
  }
}
console.log(`\n✅ Done. Files updated: ${changed}`);
