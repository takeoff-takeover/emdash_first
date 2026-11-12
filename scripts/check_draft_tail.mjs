import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";

const d1Dir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
const files = fs.readdirSync(d1Dir);
const dbFile = files.find(f => f.endsWith(".sqlite") && !f.includes("metadata") && !f.includes("bak"));
const dbPath = path.join(d1Dir, dbFile);

const db = new DatabaseSync(dbPath);
const row = db.prepare("SELECT id, slug, live_revision_id, draft_revision_id FROM ec_magazine WHERE slug = '202609_mini_select-entry-guide'").get();

const draftRev = db.prepare("SELECT id, entry_id, data FROM revisions WHERE id = ?").get(row.draft_revision_id);
if (draftRev) {
  const data = JSON.parse(draftRev.data);
  const blocks = data.content || [];
  blocks.slice(-10).forEach((b, i) => {
    console.log(`[${blocks.length - 10 + i}] ${b._type} - ${b.style || ''}`);
  });
}
