/**
 * 拠点情報向けのテキスト整形・フレーズ保護ヘルパー関数
 */

// 改行したくない固有名詞・複合フレーズの定義（長い順）
export const PROTECTED_PHRASES: string[] = [
	'Nicole BMW Service Centre',
	'Rolls-Royce Motor Cars',
	'BMW Premium Selection',
	'Service Centre',
	'Nicole BMW',
	'Nicole MINI',
	'MINI NEXT',
	'BPS 横浜港北',
	'認定中古車センター',
	'認定中古車',
	'サービス・センター',
	'サービスセンター',
	'サービス工場',
	'新百合ヶ丘支店',
	'横浜港北支店',
	'大田支店',
	'青葉支店',
	'川崎支店',
	'本社（川崎）',
	'新車ショールーム',
	'ショールーム',
];

/**
 * 固有名詞の途中改行を防ぐため、ノーブレークスペース（\u00A0）やspanで保護し、冗長なカッコ書きを除去
 */
export function protectPhrases(str: string): string {
	if (!str) return '';
	return str
		.replace(/[\(（](?:BMW|MINI)?\s*認定中古車[\)）]/g, '')
		.replace(/BMW Premium Selection/g, 'BMW\u00A0Premium\u00A0Selection')
		.replace(/MINI NEXT/g, 'MINI\u00A0NEXT')
		.replace(/Rolls-Royce Motor Cars/g, 'Rolls-Royce\u00A0Motor\u00A0Cars')
		.replace(/Nicole BMW/g, 'Nicole\u00A0BMW')
		.replace(/Service Centre/g, 'Service\u00A0Centre')
		.replace(/サービス・センター/g, 'サービス・センター')
		.replace(/新百合ヶ丘支店/g, '新百合ヶ丘支店')
		.replace(/横浜港北支店/g, '横浜港北支店')
		.trim();
}

/**
 * 拠点タイトルのハイフンやスペースによる単語境界を保持しながら改行保護
 */
export function formatTitleHtml(str: string): string {
	const cleaned = protectPhrases(str);
	return cleaned.replace(/(プレオウンド|ショールーム|サービスセンター|サービスファクトリー)/g, '<span class="u-nowrap">$1</span>');
}

export function formatLocationNameHtml(title: string): string {
	return formatTitleHtml(title);
}

/**
 * 郵便番号フォーマット
 */
export function formatPostal(postal: string | null | undefined): string {
	if (!postal) return '';
	let clean = postal.trim();
	if (!clean.startsWith('〒')) {
		clean = `〒${clean}`;
	}
	return clean;
}
