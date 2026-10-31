// src/utils/geocode.ts
// 住所から国土地理院APIを利用して緯度・経度を自動取得するユーティリティ

export interface Coordinates {
	lat: number;
	lng: number;
}

export async function geocodeAddress(address: string): Promise<Coordinates | null> {
	if (!address || typeof address !== 'string') return null;

	// 住所の正規化（建物名や階数、全角空白の除去）
	const cleanAddress = address
		.replace(/\s+/g, '')
		.replace(/([0-9０-９]+階|[0-9０-９]+F|ビル.*|アベニュー.*)/i, '')
		.trim();

	const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(cleanAddress)}`;

	try {
		const res = await fetch(url, {
			headers: { 'User-Agent': 'NicoleGroup-Emdash/1.0' }
		});
		if (!res.ok) return null;

		const data = await res.json();
		if (Array.isArray(data) && data.length > 0) {
			const coords = data[0]?.geometry?.coordinates;
			if (Array.isArray(coords) && coords.length >= 2) {
				return {
					lng: coords[0],
					lat: coords[1]
				};
			}
		}
	} catch (e) {
		console.warn(`[Geocode] Failed to geocode address: "${address}"`, e);
	}

	return null;
}
