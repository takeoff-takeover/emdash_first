import fs from "fs";

const blocks = JSON.parse(fs.readFileSync("seed/new_article_blocks.json", "utf8"));

let convertedCount = 0;
blocks.forEach(b => {
  if (b._type && b._type.startsWith("editorial-tools:")) {
    const rawType = b._type.replace("editorial-tools:", "");
    b._type = rawType;
    convertedCount++;
  }
});

console.log(`Converted ${convertedCount} blocks to native plugin block types.`);
fs.writeFileSync("seed/new_article_blocks.json", JSON.stringify(blocks, null, 2), "utf8");
