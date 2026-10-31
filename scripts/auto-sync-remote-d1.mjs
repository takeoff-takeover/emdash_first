import { DatabaseSync } from "node:sqlite";
import { execSync } from "child_process";
import fs from "fs";

const localDbPath = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/c5f74f54de1b54dfe248af0cae042e755774e9e90fc1e7dc6e84e3d6d7130474.sqlite";
const db = new DatabaseSync(localDbPath);

// ローカルのカラム一覧を取得
const localCols = db.prepare("PRAGMA table_info(ec_locations)").all();

// リモートのカラム一覧を取得
const remoteColsRaw = execSync("npx wrangler d1 execute my-emdash-site --remote --command='PRAGMA table_info(ec_locations);' --json", { encoding: "utf8" });
const remoteJson = JSON.parse(remoteColsRaw);
const remoteColNames = new Set(remoteJson[0].results.map(c => c.name));

const missingCols = localCols.filter(c => !remoteColNames.has(c.name));
console.log(`Missing columns on remote: ${missingCols.map(c => c.name).join(", ")}`);

if (missingCols.length > 0) {
  const alterStatements = missingCols.map(c => {
    return `ALTER TABLE ec_locations ADD COLUMN "${c.name}" ${c.type || "TEXT"};`;
  }).join("\n");
  fs.writeFileSync("scripts/add-missing-cols.sql", alterStatements, "utf8");
  console.log("Adding missing columns to remote D1...");
  execSync("npx wrangler d1 execute my-emdash-site --remote --file=scripts/add-missing-cols.sql -y", { stdio: "inherit" });
}

// データ同期
const rows = db.prepare("SELECT * FROM ec_locations").all();
console.log(`Found ${rows.length} rows in local ec_locations`);

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

console.log("Uploading data to remote D1...");
execSync(`npx wrangler d1 execute my-emdash-site --remote --file=${sqlFile} -y`, { stdio: "inherit" });
console.log("Sync complete!");
