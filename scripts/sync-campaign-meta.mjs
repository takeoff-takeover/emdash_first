import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';

const isRemote = process.argv.includes('--remote');
const targetFlag = isRemote ? '--remote' : '--local';
console.log(`--- Syncing Campaigns Metadata to EmDash (${targetFlag}) ---`);

const collectionSql = `
INSERT OR REPLACE INTO _emdash_collections (
  id, slug, label, label_singular, description, icon, supports, url_pattern, sort_order, title_field
) VALUES (
  '01M5WCAMPAIGN000000000001',
  'campaigns',
  'キャンペーン',
  'キャンペーン記事',
  'BMW・MINI・Ferrari等の正規ディーラー限定キャンペーン・フェア管理コレクション',
  'sparkles',
  '["drafts","revisions","preview","scheduling","search","seo"]',
  '/campaigns/{slug}',
  3,
  'title'
);
`;

const fields = [
  { slug: 'title', label: 'キャンペーンタイトル', type: 'string', required: 1, sort_order: 1 },
  { slug: 'brand', label: '対象ブランド', type: 'select', required: 1, sort_order: 2, options: JSON.stringify([
    { label: 'BMW', value: 'BMW' },
    { label: 'MINI', value: 'MINI' },
    { label: 'Rolls-Royce', value: 'Rolls-Royce' },
    { label: 'Ferrari', value: 'Ferrari' },
    { label: 'ALPINA', value: 'ALPINA' },
    { label: 'Nicole Group 全体', value: 'Nicole Group' }
  ])},
  { slug: 'category', label: 'キャンペーン種別', type: 'select', required: 1, sort_order: 3, options: JSON.stringify([
    { label: '新車フェア・試乗会', value: '新車' },
    { label: '認定中古車特選フェア', value: '認定中古車' },
    { label: 'サービス・点検・車検キャンペーン', value: 'サービス' },
    { label: 'イベント・オーナーズ企画', value: 'イベント' }
  ])},
  { slug: 'period_text', label: '開催期間表記 (例: 2026年11月1日(日) 〜 11月30日(月))', type: 'string', sort_order: 4 },
  { slug: 'period_start', label: '開催開始日 (ソート・自動制御用)', type: 'date', sort_order: 5 },
  { slug: 'period_end', label: '開催終了日 (ソート・自動制御用)', type: 'date', sort_order: 6 },
  { slug: 'featured_image', label: 'アイキャッチ写真 (PC用)', type: 'image', sort_order: 7 },
  { slug: 'featured_image_sp', label: 'アイキャッチ写真 (スマホ用)', type: 'image', sort_order: 8 },
  { slug: 'excerpt', label: '概要・リード文', type: 'text', sort_order: 9 },
  { slug: 'target_locations', label: '対象拠点 (例: Nicole BMW 全支店 / 新百百合ヶ丘支店限定)', type: 'string', sort_order: 10 },
  { slug: 'cta_label', label: 'ボタン表記 (例: 試乗予約はこちら / お問い合わせ)', type: 'string', sort_order: 11 },
  { slug: 'cta_url', label: 'ボタン遷移先URL', type: 'string', sort_order: 12 },
  { slug: 'content', label: 'キャンペーン詳細・特典内容', type: 'portableText', sort_order: 13 }
];

let fieldSql = '';
fields.forEach((f, idx) => {
  const fieldId = `01M5WCAMPFLD000000000000${(idx + 1).toString().padStart(2, '0')}`;
  const opts = f.options ? `'${f.options.replace(/'/g, "''")}'` : 'NULL';
  const columnType = f.type === 'portableText' ? 'JSON' : 'TEXT';
  fieldSql += `INSERT OR REPLACE INTO _emdash_fields (
    id, collection_id, slug, label, type, column_type, required, sort_order, options
  ) VALUES (
    '${fieldId}', '01M5WCAMPAIGN000000000001', '${f.slug}', '${f.label}', '${f.type}', '${columnType}', ${f.required || 0}, ${f.sort_order}, ${opts}
  );\n`;
});

const fullSql = collectionSql + '\n' + fieldSql;
const tempFilePath = path.join(os.tmpdir(), 'sync_campaigns_meta.sql');
fs.writeFileSync(tempFilePath, fullSql, 'utf8');

try {
  execSync(`npx wrangler d1 execute my-emdash-site ${targetFlag} --file="${tempFilePath}" -y`, { stdio: 'inherit' });
  console.log(`✅ Campaigns metadata successfully synced to ${targetFlag}!`);
} finally {
  if (fs.existsSync(tempFilePath)) {
    fs.unlinkSync(tempFilePath);
  }
}
