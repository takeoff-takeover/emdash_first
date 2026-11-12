import fs from "fs";

const blocks = JSON.parse(fs.readFileSync("seed/new_article_blocks.json", "utf8"));

// 1. merit_step_cards を columns: "1"（縦並び大判ステップカード）に変更
const merit = blocks.find(b => b._key === "merit_step_cards");
if (merit) {
  merit.columns = "1";
  console.log("Updated merit_step_cards to columns: 1");
}

// 2. summary_cards も columns: "1"（縦並びサマリーリスト）にして比較
const summary = blocks.find(b => b._key === "summary_cards");
if (summary) {
  summary.columns = "1";
  console.log("Updated summary_cards to columns: 1");
}

fs.writeFileSync("seed/new_article_blocks.json", JSON.stringify(blocks, null, 2), "utf8");
console.log("Saved updated blocks to seed/new_article_blocks.json");
