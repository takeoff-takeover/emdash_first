import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";

const d1Dir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
const files = fs.readdirSync(d1Dir);
const dbFile = files.find(f => f.endsWith(".sqlite") && !f.includes("metadata") && !f.includes("bak"));
const dbPath = path.join(d1Dir, dbFile);

const db = new DatabaseSync(dbPath);
const row = db.prepare("SELECT id, slug, live_revision_id, draft_revision_id FROM ec_magazine WHERE slug = '202609_mini_select-entry-guide'").get();
console.log("ec_magazine row:", row);

const revCols = db.prepare("PRAGMA table_info(revisions)").all();
console.log("revisions cols:", revCols.map(c => c.name));

if (row.draft_revision_id) {
  const draftRev = db.prepare("SELECT id, entry_id, document FROM revisions WHERE id = ?").get(row.draft_revision_id);
  console.log("draftRev found:", !!draftRev);
  if (draftRev) {
    const doc = JSON.parse(draftRev.document);
    console.log("draftRev document content blocks count:", (doc.content || []).length);
    console.log("draftRev content sample:", (doc.content || []).slice(0, 3));
  }
}

if (row.live_revision_id) {
  const liveRev = db.prepare("SELECT id, entry_id, document FROM revisions WHERE id = ?").get(row.live_revision_id);
  console.log("liveRev found:", !!liveRev);
  if (liveRev) {
    const doc = JSON.parse(liveRev.document);
    console.log("liveRev document content blocks count:", (doc.content || []).length);
  }
}
