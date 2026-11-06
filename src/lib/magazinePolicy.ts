// 業務連絡はPostsに保存し、Magazineの一覧・関連記事には掲載しない。
type Article = {
	slug?: string;
	id?: string;
	title?: string;
	category?: string;
	topic?: string;
	data?: { title?: string };
};

export function isNoticeArticle(article: Article): boolean {
	const slug = (article.slug || article.id || "").toLowerCase();
	const title = (article.title || article.data?.title || "").toLowerCase();
	const noticeSlugs = [
		"202512_web_sns_account_change",
		"202512_setagaya_aoyama_closedday",
		"202609_nicole_sns-announcement",
		"202610_nicole_used-car_url-information",
		"gw-holiday-2026",
		"holiday",
		"closedday",
	];
	if (noticeSlugs.some(value => slug.includes(value))) return true;
	return /休業|定休日|営業時間|営業日変更|臨時休館|ドメイン|(?:sns|line|instagram|facebook|インスタグラム|フェイスブック)\s*(?:公式)?アカウント|アカウント(?:名変更|変更|閉鎖|開設|移行)|(?:url|ウェブサイト|webサイト|ホームページ).{0,8}(?:変更|移転)/i.test(title);
}

// 移行時にPeopleが登録されていても、地域・従業員支援の活動はESGに集約する。
export function isESGArticle(article: Article): boolean {
	const slug = (article.slug || article.id || "").toLowerCase();
	const title = (article.title || article.data?.title || "").toLowerCase();
	const activitySlugs = [
		"tamagawa", "shinyurigaoka_cleanup", "japanesenight", "inspire_hub",
		"traffic-safety", "food-for-community", "sustainable-marche",
		"emergency-home-support", "kids-mechanic-event", "haruhinofes",
		"work-experience", "junior_high_shool_experience", "fire-department-award",
		"international-employee-meetup", "mochitsuki", "norimonofes",
		"sdgs_partner", "summerconference", "esg-sdgs-activities",
	];
	if (activitySlugs.some(value => slug.includes(value))) return true;
	if (/美化活動|クリーンアップ|職場体験|餅つき|もちつき|外国人従業員|インター会|感謝状|のりものフェスタ/.test(title)) return true;
	return article.category === "ESG" || /esg|sdgs/i.test(article.topic || "");
}
