import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";

const d1Dir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
const files = fs.readdirSync(d1Dir);
const dbFile = files.find(f => f.endsWith(".sqlite") && !f.includes("metadata") && !f.includes("bak"));
const dbPath = path.join(d1Dir, dbFile);

const db = new DatabaseSync(dbPath);
const rows = db.prepare("SELECT slug, content FROM ec_magazine").all();

const types = new Set();
rows.forEach(r => {
  if (!r.content) return;
  try {
    const blocks = JSON.parse(r.content);
    blocks.forEach(b => {
      if (b._type !== "block" && b._type !== "image") {
        types.add(b._type);
      }
    });
  } catch (_) {}
});

console.log("Custom block _types in ec_magazine:", Array.from(types));
