// Vérifie qu'aucun secret ne se trouve dans les fichiers suivis ou indexés par Git.
// Compare le contenu à chaque valeur du fichier .env local et cherche des motifs de jetons.
// Usage : npm run check:secrets (bloque avec un code de sortie 1 si une fuite est trouvée).
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const SECRET_PATTERNS = [
  /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, // JWT
  /sb_secret_[A-Za-z0-9_-]{10,}/,
  /sb_publishable_[A-Za-z0-9_-]{10,}/,
];

const envValues = existsSync(".env")
  ? readFileSync(".env", "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => line.slice(line.indexOf("=") + 1).trim())
      .filter((value) => value.length >= 12)
  : [];

const files = execSync("git ls-files --cached --others --exclude-standard", { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((file) => existsSync(file) && !file.startsWith("node_modules/"));

const leaks = [];
for (const file of files) {
  if (file === ".env") {
    leaks.push(`${file} : le fichier .env ne doit jamais être suivi par Git`);
    continue;
  }
  const content = readFileSync(file, "utf8");
  if (envValues.some((value) => content.includes(value))) {
    leaks.push(`${file} : contient une valeur du fichier .env`);
  } else if (SECRET_PATTERNS.some((pattern) => pattern.test(content))) {
    leaks.push(`${file} : contient un motif de jeton/clé`);
  }
}

if (leaks.length > 0) {
  console.error("✗ Secrets détectés :\n" + leaks.map((leak) => `  - ${leak}`).join("\n"));
  process.exit(1);
}
console.log(`✓ Aucun secret dans les ${files.length} fichiers suivis.`);
