import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";

const d1Dir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
const files = fs.readdirSync(d1Dir);
const dbFile = files.find(f => f.endsWith(".sqlite") && !f.includes("metadata") && !f.includes("bak"));
const dbPath = path.join(d1Dir, dbFile);

const db = new DatabaseSync(dbPath);
const row = db.prepare("SELECT id, slug, live_revision_id, draft_revision_id FROM ec_magazine WHERE slug = '202609_mini_select-entry-guide'").get();

const liveRev = db.prepare("SELECT id, entry_id, data FROM revisions WHERE id = ?").get(row.live_revision_id);
if (liveRev) {
  const data = JSON.parse(liveRev.data);
  const blocks = data.content || [];
  console.log("Live blocks count:", blocks.length);
  blocks.slice(-5).forEach((b, i) => {
    console.log(`[${blocks.length - 5 + i}] ${b._type} - ${b.style || ''}`);
  });
}
