// scripts/refactor_all.sh
#!/usr/bin/env bash
set -euo pipefail
shopt -s globstar

# 0) branche de travail
git checkout -b chore/refactor-names-$(date +%s) || true

# 1) tsconfig: alias @admin -> app/api/_admin
node - <<'NODE'
const fs=require('fs'); const path='tsconfig.json';
const j=JSON.parse(fs.readFileSync(path,'utf8'));
j.compilerOptions ||= {}; j.compilerOptions.baseUrl ||= ".";
j.compilerOptions.paths ||= {}; j.compilerOptions.paths["@admin"]= ["app/api/_admin"];
fs.writeFileSync(path, JSON.stringify(j,null,2));
console.log('✅ tsconfig.json : alias @admin ajouté/mis à jour');
NODE

# 2) Remplacer tous les imports relatifs _admin -> @admin (TS/TSX sous app/)
git grep -l -E "from ['\"][\\.\/]+_admin['\"]" -- app \
| xargs -r sed -i -E "s~from ['\"][\\.\/]+_admin['\"]~from \"@admin\"~g"

# 3) Prisma: prisma.folder -> prisma.appFolder (partout)
git grep -l -E '\bprisma\.folder\b' \
| xargs -r sed -i -E 's/\bprisma\.folder\b/prisma.appFolder/g'

# 4) Types Prisma importés: Folder -> AppFolder (uniquement dans les imports depuis @prisma/client)
git grep -l -E 'from "@prisma/client"' -- '**/*.ts' '**/*.tsx' \
| xargs -r sed -i -E 's/\bFolder\b/AppFolder/g'

# 5) MediaIndex: folderId -> appFolderId (ciblé)
# On ne touche qu'aux fichiers qui contiennent "mediaIndex" ET "folderId"
git grep -l -E '\bmediaIndex\b.*\bfolderId\b' -- '**/*.ts' '**/*.tsx' \
| xargs -r sed -i -E 's/\bfolderId\b/appFolderId/g'

echo
echo "🔎 Vérifie le diff :"
git status -s
git diff --stat
