import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

export function applySearchPatch() {
  const mjsPath = path.join(rootDir, 'node_modules', 'emdash', 'dist', 'content-Dxztag5t.mjs');
  if (!fs.existsSync(mjsPath)) return;

  let content = fs.readFileSync(mjsPath, 'utf8');
  const startIdx = content.indexOf('applySearchFilter(query, where, type) {');
  const endIdx = content.indexOf('applyDateFilter(query, where) {', startIdx);
  if (startIdx === -1 || endIdx === -1) return;

  const fixedMethod = `applySearchFilter(query, where, type) {
		const rawTerm = where?.q?.trim();
		const columns = where?.searchColumns;
		if (!rawTerm) return query;

		let brandSlug = null;
		let catSlug = null;
		let cleanTerm = rawTerm;

		// brand:<slug> または tax_brand:<slug> を抽出（magazineコレクション専用のタクソノミー連動）
		if (type === 'magazine') {
			const brandMatch = cleanTerm.match(/(?:tax_brand|brand):([a-zA-Z0-9_-]+)/i);
			if (brandMatch) {
				brandSlug = brandMatch[1].toLowerCase();
				cleanTerm = cleanTerm.replace(brandMatch[0], ' ').trim();
			}

			// category:<slug> または tax_cat:<slug> または cat:<slug> を抽出
			const catMatch = cleanTerm.match(/(?:tax_cat|cat|category):([a-zA-Z0-9_-]+)/i);
			if (catMatch) {
				catSlug = catMatch[1].toLowerCase();
				cleanTerm = cleanTerm.replace(catMatch[0], ' ').trim();
			}

			// ALL BRANDS 正規化
			if (brandSlug && /^all[\\s\\-_]?brands$/i.test(brandSlug)) {
				brandSlug = 'all-brands';
			}
		}

		return query.where((eb) => {
			const andConditions = [];

			// 1. 純粋なブランドタクソノミーのみでの厳格な絞り込み
			if (brandSlug && brandSlug !== 'all') {
				andConditions.push(sql\`id IN (
					SELECT ct.entry_id FROM content_taxonomies ct 
					JOIN taxonomies t ON (ct.taxonomy_id = t.id OR ct.taxonomy_id = t.translation_group)
					WHERE ct.collection = \${type} 
					  AND t.name = 'brand' 
					  AND lower(t.slug) = lower(\${brandSlug})
				)\`);
			}

			// 2. 純粋なカテゴリータクソノミーのみでの厳格な絞り込み
			if (catSlug && catSlug !== 'all') {
				if (catSlug === 'esg' || catSlug === 'esg-sdgs') {
					andConditions.push(sql\`id IN (
						SELECT ct.entry_id FROM content_taxonomies ct 
						JOIN taxonomies t ON (ct.taxonomy_id = t.id OR ct.taxonomy_id = t.translation_group)
						WHERE ct.collection = \${type} 
						  AND (
						    (t.name = 'category' AND lower(t.slug) = 'esg')
						    OR (t.name = 'tag' AND lower(t.slug) = 'esg-sdgs')
						  )
					)\`);
				} else {
					andConditions.push(sql\`id IN (
						SELECT ct.entry_id FROM content_taxonomies ct 
						JOIN taxonomies t ON (ct.taxonomy_id = t.id OR ct.taxonomy_id = t.translation_group)
						WHERE ct.collection = \${type} 
						  AND (
						    (t.name = 'category' AND lower(t.slug) = lower(\${catSlug}))
						    OR (t.name = 'tag' AND lower(t.slug) = lower(\${catSlug}))
						  )
					)\`);
				}
			}

			// 3. フリーキーワード検索（ブランド・カテゴリー以外の単語が残っている場合のみ実行）
			if (cleanTerm && columns && columns.length > 0) {
				const words = cleanTerm.split(/\\s+/).filter(Boolean);
				words.forEach((word) => {
					const isAllBrands = /^all[\\s\\-_]?brands$/i.test(word) || word === 'all-brands';
					const searchPatterns = isAllBrands 
						? ['%all-brands%', '%all brands%', '%allbrands%']
						: [\`%\${word.replace(LIKE_WILDCARD_RE, (c) => '\\\\' + c)}%\`];

					const orConditions = [];
					for (const pattern of searchPatterns) {
						columns.forEach((col) => {
							validateIdentifier(col, 'search column');
							orConditions.push(sql\`lower(CAST(\${sql.ref(col)} AS TEXT)) LIKE lower(\${pattern}) ESCAPE '\\\\'\`);
						});
						orConditions.push(sql\`id IN (
							SELECT ct.entry_id FROM content_taxonomies ct 
							JOIN taxonomies t ON (ct.taxonomy_id = t.id OR ct.taxonomy_id = t.translation_group) 
							WHERE ct.collection = \${type} 
							  AND (lower(t.name) LIKE lower(\${pattern}) ESCAPE '\\\\' 
							       OR lower(t.label) LIKE lower(\${pattern}) ESCAPE '\\\\' 
							       OR lower(t.slug) LIKE lower(\${pattern}) ESCAPE '\\\\')
						)\`);
					}

					if (where.useFts) {
						const match = buildFtsPrefixMatch(word);
						if (match) {
							validateIdentifier(type, 'collection slug');
							const ftsTable = \`_emdash_fts_\${type}\`;
							const slugPrefix = buildSlugGlobPrefix(word);
							orConditions.push(sql\`id IN (SELECT id FROM \${sql.ref(ftsTable)} WHERE \${sql.ref(ftsTable)} MATCH \${match})\`);
							orConditions.push(sql\`slug GLOB \${slugPrefix}\`);
						}
					}
					andConditions.push(eb.or(orConditions));
				});
			}

			if (andConditions.length === 0) return eb.and([]);
			return eb.and(andConditions);
		});
	}
	/**
	* Apply the optional inclusive date-range filter. The field is mapped
	* through \`DATE_FILTER_COLUMNS\` (a closed whitelist), and bounds compare
	* lexicographically against the stored ISO 8601 timestamps. A \`publishedAt\`
	* range naturally excludes never-published rows (their column is NULL).
	*/
	`;

  content = content.slice(0, startIdx) + fixedMethod + content.slice(endIdx);
  fs.writeFileSync(mjsPath, content, 'utf8');
  console.log('[patch-search] Successfully applied pure taxonomy & multi-word search patch to dist/content-Dxztag5t.mjs');
}

applySearchPatch();
