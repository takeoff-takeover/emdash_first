// src/utils/google-places.ts
// Google Places API 連携 & クチコミ取得ユーティリティ（安全フィルター・キャッシュ・モックフォールバック機能付き）

export interface GoogleReviewItem {
	author_name: string;
	author_avatar?: string;
	relative_time_description: string;
	rating: number;
	text: string;
	category_tag?: string;
}

export interface GooglePlaceReviewsData {
	rating: number;
	user_ratings_total: number;
	reviews: GoogleReviewItem[];
	is_live_api: boolean;
	place_id?: string;
}

// 簡易インメモリキャッシュ（サーバーサイドで1時間保持）
interface CacheEntry {
	timestamp: number;
	data: GooglePlaceReviewsData;
}
const cacheMap = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1時間

/**
 * デフォルトの高品質フォールバックモック
 */
function getDefaultMockReviews(locationTitle: string = '店舗'): GoogleReviewItem[] {
	return [
		{
			author_name: 'K.T 様',
			author_avatar: 'K',
			relative_time_description: '2週間前',
			rating: 5,
			category_tag: '新車 試乗・ご商談',
			text: `${locationTitle}にて新車の試乗で伺いました。担当の方が車の特徴や運転支援機能について非常に詳しく丁寧に説明してくださり、安心して検討できました。ショールームも綺麗で落ち着いた空間です。`
		},
		{
			author_name: 'S.M 様',
			author_avatar: 'S',
			relative_time_description: '1ヶ月前',
			rating: 5,
			category_tag: '認定中古車 ご成約',
			text: '認定中古車（BPS）の購入で利用しました。車両の状態やこれまでの整備履歴、保証内容まで包み隠さずオープンに教えていただき、納得して購入できました。納車までの連絡もとても迅速でした。'
		},
		{
			author_name: 'H.Y 様',
			author_avatar: 'H',
			relative_time_description: '3ヶ月前',
			rating: 5,
			category_tag: '定期点検・車検',
			text: '定期点検でサービス工場にお世話になりました。受付から作業完了までの案内が非常にスムーズで、気になっていた箇所の調整も快く引き受けていただきました。信頼できるディーラーです。'
		}
	];
}

/**
 * Google Place Details API またはフォールバックモックからレビュー情報を取得
 */
export async function getGooglePlaceReviews(options: {
	placeId?: string | null;
	apiKey?: string | null;
	locationTitle?: string;
	ratingOverride?: string | number | null;
	countOverride?: string | number | null;
}): Promise<GooglePlaceReviewsData> {
	const {
		placeId,
		apiKey = process.env.GOOGLE_PLACES_API_KEY || import.meta.env.GOOGLE_PLACES_API_KEY || null,
		locationTitle = 'ショールーム',
		ratingOverride,
		countOverride
	} = options;

	// 手動上書き値のパース
	const parsedRating = ratingOverride ? parseFloat(String(ratingOverride)) : 4.2;
	const parsedCount = countOverride ? parseInt(String(countOverride), 10) : 142;

	// 1. APIキーまたはPlace IDがない場合はモックを返却
	if (!apiKey || !placeId) {
		return {
			rating: parsedRating,
			user_ratings_total: parsedCount,
			reviews: getDefaultMockReviews(locationTitle),
			is_live_api: false,
			place_id: placeId || undefined
		};
	}

	// 2. キャッシュチェック
	const cacheKey = `${placeId}_${apiKey.slice(-6)}`;
	const cached = cacheMap.get(cacheKey);
	if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
		return cached.data;
	}

	// 3. Google Places API (Place Details) をリクエスト
	try {
		const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
			placeId
		)}&fields=name,rating,user_ratings_total,reviews&language=ja&key=${encodeURIComponent(apiKey)}`;

		const res = await fetch(url);
		if (!res.ok) {
			console.warn(`[GooglePlaces] API request failed with status: ${res.status}`);
			return {
				rating: parsedRating,
				user_ratings_total: parsedCount,
				reviews: getDefaultMockReviews(locationTitle),
				is_live_api: false,
				place_id: placeId
			};
		}

		const data = await res.json();
		if (data.status !== 'OK' || !data.result) {
			console.warn(`[GooglePlaces] API returned status: ${data.status}`);
			return {
				rating: parsedRating,
				user_ratings_total: parsedCount,
				reviews: getDefaultMockReviews(locationTitle),
				is_live_api: false,
				place_id: placeId
			};
		}

		const result = data.result;
		const rawReviews = (result.reviews || []) as Array<{
			author_name: string;
			profile_photo_url?: string;
			rating: number;
			relative_time_description: string;
			text: string;
		}>;

		// ★4以上の高評価レビューを優先抽出（ネガティブ対策）
		const filteredReviews = rawReviews
			.filter(r => r.rating >= 4 && r.text && r.text.trim().length > 10)
			.slice(0, 3)
			.map(r => ({
				author_name: r.author_name ? `${r.author_name.slice(0, 1)}.. 様` : 'Googleユーザー 様',
				author_avatar: r.author_name ? r.author_name.slice(0, 1) : 'G',
				relative_time_description: r.relative_time_description || '最近',
				rating: r.rating,
				text: r.text
			}));

		// フィルタ後に件数が足りない場合はモックで補完
		const finalReviews = filteredReviews.length > 0 ? filteredReviews : getDefaultMockReviews(locationTitle);

		const resultData: GooglePlaceReviewsData = {
			rating: ratingOverride ? parsedRating : result.rating || 4.2,
			user_ratings_total: countOverride ? parsedCount : result.user_ratings_total || 142,
			reviews: finalReviews,
			is_live_api: true,
			place_id: placeId
		};

		// キャッシュ保存
		cacheMap.set(cacheKey, { timestamp: Date.now(), data: resultData });
		return resultData;
	} catch (err: any) {
		console.error('[GooglePlaces] Fetch error:', err.message);
		return {
			rating: parsedRating,
			user_ratings_total: parsedCount,
			reviews: getDefaultMockReviews(locationTitle),
			is_live_api: false,
			place_id: placeId
		};
	}
}
