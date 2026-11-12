import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";

const d1Dir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
const files = fs.readdirSync(d1Dir);
const dbFile = files.find(f => f.endsWith(".sqlite") && !f.includes("metadata") && !f.includes("bak"));
const dbPath = path.join(d1Dir, dbFile);

const db = new DatabaseSync(dbPath);
const row = db.prepare("SELECT content FROM ec_magazine WHERE slug = '202609_mini_select-entry-guide'").get();
const content = JSON.parse(row.content);

fs.writeFileSync("seed/current_article_blocks.json", JSON.stringify(content, null, 2), "utf8");
console.log("Exported", content.length, "blocks to seed/current_article_blocks.json");
