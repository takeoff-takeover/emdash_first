import Database from "better-sqlite3";

const db = new Database("seed/backup.sqlite");
const rows = db.prepare("SELECT id, slug, title, length(content) as content_len FROM ec_posts").all();
console.log(JSON.stringify(rows, null, 2));

const series3 = db.prepare("SELECT * FROM ec_posts WHERE slug LIKE '%3series%'").get();
if (series3) {
  console.log("3series title:", series3.title);
  const content = JSON.parse(series3.content);
  console.log("3series blocks count:", content.length);
  console.log("3series first 3 blocks:", JSON.stringify(content.slice(0, 5), null, 2));
} else {
  console.log("3series not found in ec_posts");
}
