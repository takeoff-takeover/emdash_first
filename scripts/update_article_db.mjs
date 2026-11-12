import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";

const d1Dir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
const files = fs.readdirSync(d1Dir);
const dbFile = files.find(f => f.endsWith(".sqlite") && !f.includes("metadata") && !f.includes("bak"));
const dbPath = path.join(d1Dir, dbFile);

const db = new DatabaseSync(dbPath);

const newBlocks = JSON.parse(fs.readFileSync("seed/new_article_blocks.json", "utf8"));
const newContentJson = JSON.stringify(newBlocks);

const res = db.prepare("UPDATE ec_magazine SET content = ? WHERE slug = '202609_mini_select-entry-guide'").run(newContentJson);
console.log("Updated ec_magazine successfully. Changes:", res.changes);
