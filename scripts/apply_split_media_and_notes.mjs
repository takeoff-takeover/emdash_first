import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";

const d1Dir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
const files = fs.readdirSync(d1Dir);
const dbFile = files.find(f => f.endsWith(".sqlite") && !f.includes("metadata") && !f.includes("bak"));
const dbPath = path.join(d1Dir, dbFile);

const db = new DatabaseSync(dbPath);

// 1. 現行ブロック取得
const row = db.prepare("SELECT id, live_revision_id, draft_revision_id, content FROM ec_magazine WHERE slug = '202609_mini_select-entry-guide'").get();
const blocks = JSON.parse(row.content);

console.log("Current block count:", blocks.length);

// 2. ブロック 12（※¹：カントリーマンではアダプティブLEDを標準維持。）を style: "note" に更新
const noteBlock = blocks.find(b => b._type === "block" && b.children?.some(c => c.text?.includes("カントリーマンではアダプティブLED")));
if (noteBlock) {
  noteBlock.style = "note";
  console.log("Updated note block style to note");
}

// 3. 左右分割ブロック（split_media）の構築
const splitMediaBlock = {
  _type: "split_media",
  _key: "split_spec_features",
  image_position: "zigzag",
  media_ratio: "50-50",
  media_fit: "cover",
  items: [
    {
      _key: "split_item_light",
      image: "/uploads/magazine/mini_select_headlight_detail.jpg",
      title: "① ヘッドライト：シンプルな「円形LEDヘッドライト」に変更",
      text: "3ドア／5ドアのMINI SELECTでは、コーナリング等、進路を自動追従して照らす「アダプティブ機能」に代わり、より洗練されたシンプルな円形LEDヘッドライトに変更されています（※カントリーマン SELECTではアダプティブLEDが標準維持されます）。\n\n【判断ポイント】\nシンプルなLEDヘッドライトであっても、夜間ドライブに十分すぎる明るさと視認性が確保されているため、街乗り中心であれば全く問題ありません。愛らしい伝統の丸目デザインもしっかりと受け継がれています。"
    },
    {
      _key: "split_item_display",
      image: "https://www.nicole.co.jp/wp/wp-content/uploads/2026/09/MINI-2.jpg",
      title: "② 先進表示：円形センター・ディスプレイとインテリア演出",
      text: "ダッシュボード中央のディスプレイ演出を切り替える「MINIエクスペリエンスモード」や、フロントガラスにナビ情報を投影する「ヘッドアップディスプレイ」が標準装備から外されています（※カントリーマン SELECTではヘッドアップディスプレイやアダプティブLEDも標準維持されるなど、車種に応じた最適なパッケージが用意されています）。\n\n【判断ポイント】\nダッシュボード中央の先進的な「円形センター・ディスプレイ」の圧倒的な見やすさを誇るため、日常の利便性で困ることはありません。実際の走行映像に案内を重ねる「AR機能付きMINIナビゲーション」やスマホ連携（CarPlay等）も標準装備されています。ぜひ試乗にてご体感ください。"
    },
    {
      _key: "split_item_tlc",
      image: "https://www.nicole.co.jp/wp/wp-content/uploads/2026/09/MINI3.jpg",
      title: "③ メインテナンス：点検プラン（MINI TLC）の無償付帯対象外",
      text: "【最も重要な注意点】\n新車購入から3年間の点検やオイル交換が無償になる「MINI TLC.スタンダードパック」が標準装備から外されています。\n\n【判断ポイント】\nショールームでの商談時に、有償オプションとして「MINI TLC」を個別追加することが可能です。将来のメインテナンス費用をフラットに保ちたい方は、購入時に営業担当へ相談するのがスマートです。"
    }
  ]
};

// 4. splitMediaBlock を適用
const targetIdx = blocks.findIndex(b => b._key === "split_spec_features" || b._key === "spec_accordion" || (b._type === "faq" && b.items?.some(it => it.question?.includes("ヘッドライト"))));
if (targetIdx !== -1) {
  blocks[targetIdx] = splitMediaBlock;
  console.log("Updated split_media block at index", targetIdx);
}

// 5. 単発で置かれていた3枚の画像ブロックを削除
const imagesToRemove = [
  "21MINI.jpg",
  "MINI-2.jpg",
  "MINI3.jpg"
];

const cleanedBlocks = blocks.filter(b => {
  if (b._type === "image") {
    const src = b.src || b.asset?.url || b.asset?._ref || "";
    if (imagesToRemove.some(img => src.includes(img))) {
      console.log("Removed loose image:", src);
      return false;
    }
  }
  return true;
});

console.log("New block count:", cleanedBlocks.length);

// 6. DB更新
const newContentJson = JSON.stringify(cleanedBlocks);
db.prepare("UPDATE ec_magazine SET content = ? WHERE slug = '202609_mini_select-entry-guide'").run(newContentJson);

if (row.draft_revision_id) {
  const rev = db.prepare("SELECT data FROM revisions WHERE id = ?").get(row.draft_revision_id);
  if (rev) {
    const revData = JSON.parse(rev.data);
    revData.content = cleanedBlocks;
    db.prepare("UPDATE revisions SET data = ? WHERE id = ?").run(JSON.stringify(revData), row.draft_revision_id);
    console.log("Updated draft revision:", row.draft_revision_id);
  }
}

if (row.live_revision_id) {
  const rev = db.prepare("SELECT data FROM revisions WHERE id = ?").get(row.live_revision_id);
  if (rev) {
    const revData = JSON.parse(rev.data);
    revData.content = cleanedBlocks;
    db.prepare("UPDATE revisions SET data = ? WHERE id = ?").run(JSON.stringify(revData), row.live_revision_id);
    console.log("Updated live revision:", row.live_revision_id);
  }
}

const allRevs = db.prepare("SELECT id, data FROM revisions WHERE entry_id = ?").all(row.id);
allRevs.forEach(r => {
  try {
    const revData = JSON.parse(r.data);
    revData.content = cleanedBlocks;
    db.prepare("UPDATE revisions SET data = ? WHERE id = ?").run(JSON.stringify(revData), r.id);
  } catch (_) {}
});
console.log(`Updated all ${allRevs.length} revisions for entry_id: ${row.id}`);

fs.writeFileSync("seed/current_article_blocks.json", JSON.stringify(cleanedBlocks, null, 2), "utf8");
console.log("Saved updated blocks to seed/current_article_blocks.json");
