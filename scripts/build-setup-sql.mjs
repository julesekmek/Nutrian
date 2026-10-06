// Concatène toutes les migrations dans supabase/setup.sql, à coller en une fois
// dans le SQL Editor de Supabase. Usage : npm run db:setup-sql
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = "supabase/migrations";
const OUTPUT = "supabase/setup.sql";

const files = readdirSync(MIGRATIONS_DIR)
  .filter((file) => file.endsWith(".sql"))
  .sort();

const header = `-- Nutrian — script d'installation complet de la base (généré, ne pas modifier à la main).
-- Source : ${MIGRATIONS_DIR}/*.sql, concaténés dans l'ordre. Régénérer avec : npm run db:setup-sql
-- À exécuter une seule fois sur un projet Supabase vide (SQL Editor > New query > Run).
`;

const body = files
  .map((file) => `\n-- ===== ${file} =====\n${readFileSync(join(MIGRATIONS_DIR, file), "utf8").trim()}\n`)
  .join("");

writeFileSync(OUTPUT, `${header}\nbegin;\n${body}\ncommit;\n`);
console.log(`✓ ${OUTPUT} (${files.length} migrations)`);
