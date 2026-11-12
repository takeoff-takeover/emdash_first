import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";

const d1Dir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
const files = fs.readdirSync(d1Dir);
const dbFile = files.find(f => f.endsWith(".sqlite") && !f.includes("metadata") && !f.includes("bak"));
const dbPath = path.join(d1Dir, dbFile);

const db = new DatabaseSync(dbPath);
const row = db.prepare("SELECT content FROM ec_magazine WHERE slug = '202609_mini_select-entry-guide'").get();
const blocks = JSON.parse(row.content);

blocks.forEach((b, i) => {
  if (b._type.includes("column_cards")) {
    console.log(`[${i}] ${b._key}: columns = ${b.columns}, card_style = ${b.card_style}`);
  }
});
