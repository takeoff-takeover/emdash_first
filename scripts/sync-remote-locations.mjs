import { DatabaseSync } from "node:sqlite";
import { execSync } from "child_process";
import fs from "fs";

const localDbPath = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/c5f74f54de1b54dfe248af0cae042e755774e9e90fc1e7dc6e84e3d6d7130474.sqlite";
const db = new DatabaseSync(localDbPath);

const rows = db.prepare("SELECT * FROM ec_locations").all();
console.log(`Found ${rows.length} rows in local ec_locations`);

// SQLファイルを作成
let sqlStatements = ["DELETE FROM ec_locations;"];

for (const row of rows) {
  const keys = Object.keys(row);
  const cols = keys.map(k => `"${k}"`).join(", ");
  const vals = keys.map(k => {
    const v = row[k];
    if (v === null || v === undefined) return "NULL";
    if (typeof v === "number") return v;
    return `'${String(v).replace(/'/g, "''")}'`;
  }).join(", ");
  sqlStatements.push(`INSERT INTO ec_locations (${cols}) VALUES (${vals});`);
}

const sqlFile = "scripts/sync-locations-remote.sql";
fs.writeFileSync(sqlFile, sqlStatements.join("\n"), "utf8");
console.log(`Wrote ${sqlStatements.length} statements to ${sqlFile}`);

try {
  console.log("Executing on remote D1...");
  execSync(`npx wrangler d1 execute my-emdash-site --remote --file=${sqlFile}`, { stdio: "inherit" });
  console.log("Successfully synced ec_locations to remote D1!");
} catch (e) {
  console.error("Failed to execute remote D1:", e);
}
