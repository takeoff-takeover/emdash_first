import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";

const d1Dir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
const files = fs.readdirSync(d1Dir);
const dbFile = files.find(f => f.endsWith(".sqlite") && !f.includes("metadata") && !f.includes("bak"));
const dbPath = path.join(d1Dir, dbFile);

const db = new DatabaseSync(dbPath);
const blockTypes = db.prepare("SELECT * FROM _emdash_block_types").all();
console.log("Block types in DB:", blockTypes);
