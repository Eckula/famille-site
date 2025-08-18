// scripts/fixPrismaImports.mjs
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_DIR = path.join(ROOT, "app", "api");
const LIB_PRISMA = path.join(ROOT, "lib", "prisma"); // sans extension dans l'import

const exts = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs"]);

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function relImport(fromFile) {
  let rel = path.relative(path.dirname(fromFile), LIB_PRISMA).replace(/\\/g, "/");
  if (!rel.startsWith(".")) rel = "./" + rel;
  return rel;
}

function transform(code, fromFile) {
  const alreadyUsingLib = /import\s+prisma\s+from\s+["'][^"']*lib\/prisma["']\s*;?/.test(code);
  const hasPrismaClientImport = /import\s*\{\s*PrismaClient\s*\}\s*from\s*["']@prisma\/client["']\s*;?/.test(code);
  const hasRequirePrisma = /require\(["']@prisma\/client["']\)/.test(code);
  const hasNewPrisma = /\bnew\s+PrismaClient\s*\(/.test(code);

  if (alreadyUsingLib) return code; // idempotent

  let changed = false;
  let out = code;

  // 1) ESM import -> remove it
  if (hasPrismaClientImport) {
    out = out.replace(
      /import\s*\{\s*PrismaClient\s*\}\s*from\s*["']@prisma\/client["']\s*;?\s*/g,
      () => {
        changed = true;
        // insertion of our lib import deferred below to keep order sane
        return "";
      }
    );
  }

  // 2) CommonJS require -> remove it
  if (hasRequirePrisma) {
    out = out.replace(
      /const\s*\{\s*PrismaClient\s*\}\s*=\s*require\(["']@prisma\/client["']\)\s*;?\s*/g,
      () => {
        changed = true;
        return "";
      }
    );
  }

  // 3) Remove "const prisma = new PrismaClient(...)"
  if (hasNewPrisma) {
    out = out.replace(
      /(?:export\s+)?(?:const|let|var)\s+prisma\s*=\s*new\s+PrismaClient\s*\([^;]*\)\s*;?\s*/g,
      () => {
        changed = true;
        return "";
      }
    );
  }

  // 4) If we saw anything Prisma-related, inject our lib import at top
  if (changed) {
    const importLine = `import prisma from "${relImport(fromFile)}";\n`;
    // Place after "use server"/"use client" directives if present
    if (/^["']use\s+(server|client)["'];?/.test(out)) {
      out = out.replace(
        /^(["']use\s+(?:server|client)["'];?\s*)/,
        `$1${importLine}`
      );
    } else {
      out = importLine + out;
    }
  }

  return out;
}

async function run() {
  // Ensure lib/prisma.ts exists
  try {
    await fs.access(LIB_PRISMA + ".ts");
  } catch {
    // fallback to .js check
    try {
      await fs.access(LIB_PRISMA + ".js");
    } catch {
      console.error(
        "❌ lib/prisma.ts (ou .js) introuvable. Crée-le d'abord (voir instructions)."
      );
      process.exit(1);
    }
  }

  let touched = 0;
  try {
    for await (const file of walk(TARGET_DIR)) {
      const ext = path.extname(file);
      if (!exts.has(ext)) continue;

      const src = await fs.readFile(file, "utf8");
      const out = transform(src, file);
      if (out !== src) {
        await fs.writeFile(file, out, "utf8");
        touched++;
      }
    }
  } catch (e) {
    // si app/api n'existe pas encore, on ne casse pas la build
    if (e && e.code === "ENOENT") {
      console.log("ℹ️  Dossier app/api non trouvé, rien à transformer.");
      return;
    }
    throw e;
  }
  console.log(`✅ fixPrismaImports: ${touched} fichier(s) mis à jour`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
