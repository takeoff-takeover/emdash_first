import fs from 'fs';

// Helper to escape for template literal in JS
function toEscapedJsString(str) {
  return JSON.stringify(str);
}

// 1. Process BMW
function processBmw() {
  const raw = fs.readFileSync('src/pages/bmw.astro', 'utf8');
  const startQuote = raw.indexOf('const elementorHtml = "') + 'const elementorHtml = "'.length;
  const endQuote = raw.lastIndexOf('";\n---');
  const html = raw.slice(startQuote, endQuote).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t');

  const firstVehicleIdx = 7854;
  const lastVehicleEnd = 60844;
  const firstLocIdx = 77523;
  const lastLocEnd = 167585;

  const part1 = html.slice(0, firstVehicleIdx);
  const part2 = html.slice(lastVehicleEnd, firstLocIdx);
  const part3 = html.slice(lastLocEnd);

  // Extract CSS imports & styles from the bottom of bmw.astro
  const bottomPart = raw.slice(endQuote + '";\n---'.length);

  const newBmwAstro = `---
// src/pages/bmw.astro
// ニコル・グループ 公式固定ページ（WordPress/Elementor デザインレイアウト完全継承 + データベース動的連携）
import NicoleLayout from "../layouts/NicoleLayout.astro";
import modelsData from "../data/models.json";
import locationsData from "../data/locations.json";
import { renderModelLoopGrid, renderLocationLoopGrid } from "../lib/renderElementorLoops";

const pageTitle = "Nicole BMW | 7年連続全国最優秀ディーラー";
const pageDescription = "BMW正規ディーラー Nicole BMW。7度の最優秀ディーラー受賞実績、モデルラインナップ、ショールーム情報。";

// データベースからカスタムフィールド・タクソノミー条件で動的取得
// 1. 車種モデル（ブランド=BMW）
const bmwModels = modelsData.filter((m) => m.brand === "BMW");

// 2. 拠点・ショールーム（ブランド=BMW）
const bmwLocations = locationsData.filter((l) => l.brand === "BMW");

// 動的ループアイテム生成（ACFフィールド & タクソノミークラスを完全反映）
const dynamicModelsHtml = renderModelLoopGrid(bmwModels);
const dynamicLocationsHtml = renderLocationLoopGrid(bmwLocations);

// Elementor 静的テンプレートシェル
const htmlPart1 = ${toEscapedJsString(part1)};
const htmlPart2 = ${toEscapedJsString(part2)};
const htmlPart3 = ${toEscapedJsString(part3)};

// 完全なElementor HTMLを合成
const elementorHtml = htmlPart1 + dynamicModelsHtml + htmlPart2 + dynamicLocationsHtml + htmlPart3;
---
${bottomPart}
`;

  fs.writeFileSync('src/pages/bmw.astro', newBmwAstro, 'utf8');
  console.log('Successfully updated src/pages/bmw.astro with dynamic database queries!');
}

// 2. Process MINI
function processMini() {
  const raw = fs.readFileSync('src/pages/mini.astro', 'utf8');
  const startQuote = raw.indexOf('const elementorHtml = "') + 'const elementorHtml = "'.length;
  const endQuote = raw.lastIndexOf('";\n---');
  const html = raw.slice(startQuote, endQuote).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t');

  const firstVehicleIdx = 7793;
  const lastVehicleEnd = 30264;
  const firstLocIdx = 62454;
  const lastLocEnd = 100443;

  const part1 = html.slice(0, firstVehicleIdx);
  const part2 = html.slice(lastVehicleEnd, firstLocIdx);
  const part3 = html.slice(lastLocEnd);

  // Extract CSS imports & styles from the bottom of mini.astro
  const bottomPart = raw.slice(endQuote + '";\n---'.length);

  const newMiniAstro = `---
// src/pages/mini.astro
// ニコル・グループ 公式固定ページ（WordPress/Elementor デザインレイアウト完全継承 + データベース動的連携）
import NicoleLayout from "../layouts/NicoleLayout.astro";
import modelsData from "../data/models.json";
import locationsData from "../data/locations.json";
import { renderModelLoopGrid, renderLocationLoopGrid } from "../lib/renderElementorLoops";

const pageTitle = "Nicole MINI | MINI正規ディーラー";
const pageDescription = "MINI正規ディーラー Nicole MINI。最新モデルラインナップ、ショールーム、認定中古車情報。";

// データベースからカスタムフィールド・タクソノミー条件で動的取得
// 1. 車種モデル（ブランド=MINI）
const miniModels = modelsData.filter((m) => m.brand === "MINI");

// 2. 拠点・ショールーム（ブランド=MINI）
const miniLocations = locationsData.filter((l) => l.brand === "MINI");

// 動的ループアイテム生成（ACFフィールド & タクソノミークラスを完全反映）
const dynamicModelsHtml = renderModelLoopGrid(miniModels);
const dynamicLocationsHtml = renderLocationLoopGrid(miniLocations);

// Elementor 静的テンプレートシェル
const htmlPart1 = ${toEscapedJsString(part1)};
const htmlPart2 = ${toEscapedJsString(part2)};
const htmlPart3 = ${toEscapedJsString(part3)};

// 完全なElementor HTMLを合成
const elementorHtml = htmlPart1 + dynamicModelsHtml + htmlPart2 + dynamicLocationsHtml + htmlPart3;
---
${bottomPart}
`;

  fs.writeFileSync('src/pages/mini.astro', newMiniAstro, 'utf8');
  console.log('Successfully updated src/pages/mini.astro with dynamic database queries!');
}

processBmw();
processMini();
