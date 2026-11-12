import fs from "fs";

const blocks = JSON.parse(fs.readFileSync("seed/new_article_blocks.json", "utf8"));

const tableIndex = blocks.findIndex(b => b._type === "table" || b._type?.endsWith("table"));
if (tableIndex === -1) {
  console.error("Table block not found");
  process.exit(1);
}

const rawCsvLines = [
  "モデル名\tボディタイプ\tサイズ（全長×全幅×全高）\t税込車両価格\t従来モデルとの差額",
  "MINI COOPER C SELECT（3-DOOR）\t3ドアハッチバック\t全長 3,875 mm × 全幅 1,745 mm × 全高 1,455 mm\t3,650,000円〜\tMINI COOPER C（402万円）より 37万円安",
  "MINI COOPER 5-DOOR C SELECT\t5ドアハッチバック\t全長 4,035 mm × 全幅 1,745 mm × 全高 1,470 mm\t3,770,000円〜\tMINI COOPER 5-DOOR C（414万円）より 37万円安",
  "MINI COUNTRYMAN C SELECT\tFF駆動SUV\t全長 4,445 mm × 全幅 1,845 mm × 全高 1,660 mm\t4,800,000円〜\tMINI COUNTRYMAN C（518万円）より 38万円安",
  "MINI COUNTRYMAN S ALL4 SELECT\t4輪駆動SUV\t全長 4,445 mm × 全幅 1,845 mm × 全高 1,660 mm\t5,530,000円〜\tMINI COUNTRYMAN S ALL4（592万円）より 39万円安"
];

const headers = [
  "モデル名",
  "ボディタイプ",
  "サイズ（全長×全幅×全高）",
  "税込車両価格",
  "従来モデルとの差額"
];

const modelRows = [
  [
    "MINI COOPER C SELECT（3-DOOR）",
    "3ドアハッチバック",
    "全長 3,875 mm × 全幅 1,745 mm × 全高 1,455 mm",
    "3,650,000円〜",
    "MINI COOPER C（402万円）より 37万円安"
  ],
  [
    "MINI COOPER 5-DOOR C SELECT",
    "5ドアハッチバック",
    "全長 4,035 mm × 全幅 1,745 mm × 全高 1,470 mm",
    "3,770,000円〜",
    "MINI COOPER 5-DOOR C（414万円）より 37万円安"
  ],
  [
    "MINI COUNTRYMAN C SELECT",
    "FF駆動SUV",
    "全長 4,445 mm × 全幅 1,845 mm × 全高 1,660 mm",
    "4,800,000円〜",
    "MINI COUNTRYMAN C（518万円）より 38万円安"
  ],
  [
    "MINI COUNTRYMAN S ALL4 SELECT",
    "4輪駆動SUV",
    "全長 4,445 mm × 全幅 1,845 mm × 全高 1,660 mm",
    "5,530,000円〜",
    "MINI COUNTRYMAN S ALL4（592万円）より 39万円安"
  ]
];

// 組み込みテーブル形式の rows（ヘッダー行＋各データ行）
const rows = [];

// ヘッダー行
rows.push({
  _type: "tableRow",
  _key: "row_header_0",
  isHeader: true,
  cells: headers.map((h, cIdx) => ({
    _type: "tableCell",
    _key: `cell_h_${cIdx}`,
    isHeader: true,
    text: h,
    content: [
      {
        _type: "span",
        _key: `span_h_${cIdx}`,
        text: h
      }
    ]
  }))
});

// データ行
modelRows.forEach((row, rIdx) => {
  rows.push({
    _type: "tableRow",
    _key: `row_data_${rIdx}`,
    cells: row.map((val, cIdx) => ({
      _type: "tableCell",
      _key: `cell_${rIdx}_${cIdx}`,
      isHeader: cIdx === 0,
      text: val,
      content: [
        {
          _type: "span",
          _key: `span_${rIdx}_${cIdx}`,
          text: val
        }
      ]
    }))
  });
});

blocks[tableIndex] = {
  _type: "table",
  _key: "mini_select_specs_table",
  title: "MINI「SELECT」シリーズ 全ラインアップ（サイズ・価格一覧）",
  raw_csv: rawCsvLines.join("\n"),
  caption: "※従来モデルとの差額については、オプション等を含めない記事投稿時点の標準価格（メーカー希望小売価格）より算出しています。詳細はショールームにてご相談承っています。",
  headers: headers,
  hasHeaderRow: true,
  rows: rows
};

fs.writeFileSync("seed/new_article_blocks.json", JSON.stringify(blocks, null, 2), "utf8");
console.log("Updated table block in seed/new_article_blocks.json with full hybrid structure.");
