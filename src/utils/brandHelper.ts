/**
 * ブランド情報の定義およびヘルパー関数
 */

export interface BrandMeta {
	name: string;
	label: string;
	color: string;
	bgLight: string;
	svgPath?: string;
	svgViewBox?: string;
}

export const BRAND_CONFIG: Record<string, BrandMeta> = {
	BMW: {
		name: 'BMW',
		label: 'BMW',
		color: '#0066B1',
		bgLight: 'rgba(0, 102, 177, 0.1)',
	},
	MINI: {
		name: 'MINI',
		label: 'MINI',
		color: '#ffffff',
		bgLight: 'rgba(255, 255, 255, 0.1)',
	},
	'Rolls-Royce': {
		name: 'Rolls-Royce',
		label: 'Rolls-Royce',
		color: '#6c5b7b',
		bgLight: 'rgba(108, 91, 123, 0.15)',
	},
	Ferrari: {
		name: 'Ferrari',
		label: 'Ferrari',
		color: '#d40000',
		bgLight: 'rgba(212, 0, 0, 0.12)',
	},
	ALPINA: {
		name: 'ALPINA',
		label: 'ALPINA',
		color: '#002b49',
		bgLight: 'rgba(0, 43, 73, 0.15)',
	},
	Nicole: {
		name: 'Nicole',
		label: 'Nicole Group',
		color: '#888888',
		bgLight: 'rgba(255, 255, 255, 0.05)',
	},
};

/**
 * 文字列からブランドメタ情報を取得
 */
export function getBrandMeta(brand: string | undefined | null): BrandMeta {
	if (!brand) return BRAND_CONFIG['Nicole'];
	const key = Object.keys(BRAND_CONFIG).find(k => k.toLowerCase() === brand.toLowerCase());
	return key ? BRAND_CONFIG[key] : BRAND_CONFIG['Nicole'];
}
