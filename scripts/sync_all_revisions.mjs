import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";

const d1Dir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
const files = fs.readdirSync(d1Dir);
const dbFile = files.find(f => f.endsWith(".sqlite") && !f.includes("metadata") && !f.includes("bak"));
const dbPath = path.join(d1Dir, dbFile);

const db = new DatabaseSync(dbPath);

// 最新のクリーンなブロック
const newBlocks = JSON.parse(fs.readFileSync("seed/new_article_blocks.json", "utf8"));
const newContentJson = JSON.stringify(newBlocks);

// 1. ec_magazine を更新
db.prepare("UPDATE ec_magazine SET content = ? WHERE slug = '202609_mini_select-entry-guide'").run(newContentJson);
console.log("Updated ec_magazine.content");

// 2. ec_magazine から live_revision_id, draft_revision_id を取得
const row = db.prepare("SELECT id, live_revision_id, draft_revision_id FROM ec_magazine WHERE slug = '202609_mini_select-entry-guide'").get();

// 3. draft_revision を更新
if (row.draft_revision_id) {
  const rev = db.prepare("SELECT data FROM revisions WHERE id = ?").get(row.draft_revision_id);
  if (rev) {
    const revData = JSON.parse(rev.data);
    revData.content = newBlocks;
    db.prepare("UPDATE revisions SET data = ? WHERE id = ?").run(JSON.stringify(revData), row.draft_revision_id);
    console.log("Updated revisions for draft_revision_id:", row.draft_revision_id);
  }
}

// 4. live_revision を更新
if (row.live_revision_id) {
  const rev = db.prepare("SELECT data FROM revisions WHERE id = ?").get(row.live_revision_id);
  if (rev) {
    const revData = JSON.parse(rev.data);
    revData.content = newBlocks;
    db.prepare("UPDATE revisions SET data = ? WHERE id = ?").run(JSON.stringify(revData), row.live_revision_id);
    console.log("Updated revisions for live_revision_id:", row.live_revision_id);
  }
}

// 5. entry_id に紐づく全 revisions も更新（念のため）
const allRevs = db.prepare("SELECT id, data FROM revisions WHERE entry_id = ?").all(row.id);
allRevs.forEach(r => {
  try {
    const revData = JSON.parse(r.data);
    revData.content = newBlocks;
    db.prepare("UPDATE revisions SET data = ? WHERE id = ?").run(JSON.stringify(revData), r.id);
  } catch (_) {}
});
console.log(`Updated all ${allRevs.length} revisions for entry_id: ${row.id}`);
