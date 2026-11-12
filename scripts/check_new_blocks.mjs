import fs from "fs";

const blocks = JSON.parse(fs.readFileSync("seed/new_article_blocks.json", "utf8"));
blocks.forEach((b, i) => {
  if (b._type === "block") {
    const text = (b.children || []).map(c => c.text).join("");
    console.log(`[${i}] ${b.style || "normal"}: ${text.slice(0, 60)}`);
  } else {
    console.log(`[${i}] CustomBlock: ${b._type} (${b.style || b.card_style || b._key})`);
  }
});
