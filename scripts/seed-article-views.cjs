const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

// 1. 各DBパスの取得
const d1Dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
const files = fs.existsSync(d1Dir) ? fs.readdirSync(d1Dir) : [];
const candidates = files
  .filter(f => f.endsWith('.sqlite') && !f.includes('metadata') && !f.includes('bak'))
  .map(f => ({ name: f, mtime: fs.statSync(path.join(d1Dir, f)).mtimeMs }))
  .sort((a, b) => b.mtime - a.mtime);

const dbs = [
  'seed/backup.sqlite',
  ...candidates.map(c => path.join(d1Dir, c.name))
];

// 2. 人気記事の個別基準ビュー数（トップ記事群）
const PRESET_VIEWS = {
  '202611_ferrari-testarossa': 4380,
  'bmw-alpina-nardo-high-speed-testing': 3920,
  '2027_new_bmw_ix4_neue_klasse': 3540,
  '202609_mini_select-entry-guide': 3120,
  '202603_bornandmadeinbuchloe': 2860,
  '202608_ferrari_approved-guide': 2540,
  '202610_neue_klasse_buyers_guide': 2390,
  '202609_rolls-royce_provenance-worth-it': 2180,
  '202609_bmw_original-entry-guide': 1980,
  '202608_ferrari_first-guide': 1840,
  '2026最新新型bmw-7シリーズ徹底解説比較と失敗しない選び方': 1760,
  '202610_mini_united-japan-2026': 1650,
  '202609_bmw_mini_original-select-guide': 1580,
  '202608_mini_next_guide': 1490,
  '202608_bmw_bps-guide': 1420,
  '202607_mini_electric-yametoke': 1380,
  '202607_nicole_certified-used-cars-guide': 1320,
  '20260714_mini_jcw_track_style_edition': 1280,
  '202608_ferrari_luce': 1240,
  '202606_mini_model-guide': 1190,
  '202606_nicole_protection-film': 1140,
  '202605_mini_ev-subsidy-guide': 1080,
  '202605_nicole_ev-subsidy-guide': 1040,
  '202605_bmw_mini_service_warranty-perfect-guide': 980,
  '202604_bmw_mini_emergency_advice_warning-lamp': 940,
  '202604_mini_countryman_expert-explains': 910,
  '202603_bmw_x3_regret': 880,
  '202603_ferrari_amalfi': 860,
  '202603_alpina-farewell-munich': 840,
  '20260304minipaulsmith': 820,
};

// 単純なハッシュ関数で自然なバラつき（±15%）とリアルな下1桁・2桁を生成
function generateRealisticViews(slug, base) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  const variance = (Math.abs(hash) % 240) - 120; // -120 to +120
  const jitter = Math.abs(hash >> 3) % 20;       // 0 to 19
  return Math.max(base + variance + jitter, 150);
}

for (const dbPath of dbs) {
  if (!fs.existsSync(dbPath)) continue;
  const db = new DatabaseSync(dbPath);

  // ec_magazine の全スラッグを取得
  const magRows = db.prepare('SELECT slug, published_at FROM ec_magazine').all();
  console.log(`Processing ${magRows.length} articles for ${dbPath}...`);

  for (const row of magRows) {
    const slug = row.slug;
    let targetViews = 0;

    if (PRESET_VIEWS[slug]) {
      // プリセット＋微小な自然分散
      targetViews = generateRealisticViews(slug, PRESET_VIEWS[slug]);
    } else {
      // 公開日ベースでの一般的な自然ビュー数（600〜1,400）
      const pubYearMonth = slug.match(/^202\d{3}/)?.[0] || '202605';
      const baseVal = pubYearMonth >= '202610' ? 1200 : (pubYearMonth >= '202607' ? 1050 : 850);
      targetViews = generateRealisticViews(slug, baseVal);
    }

    // 既存レコードがあれば既存viewsを加算、なければ新規作成
    const existing = db.prepare('SELECT views FROM article_views WHERE slug = ?').get(slug);
    if (existing) {
      // 既存のviewsが45以下（開発時の極小テスト値）の場合はリアルな値に置換、十分大きい値なら既存を尊重
      if (existing.views < 500) {
        db.prepare('UPDATE article_views SET views = ?, updated_at = datetime(\x27now\x27) WHERE slug = ?').run(targetViews, slug);
      }
    } else {
      db.prepare(`
        INSERT INTO article_views (slug, collection, views, created_at, updated_at)
        VALUES (?, 'magazine', ?, datetime(\x27now\x27), datetime(\x27now\x27))
      `).run(slug, targetViews);
    }
  }

  console.log(`Successfully seeded article_views in ${dbPath}`);
}
