import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

interface ContactPayload {
	inquiry_type: string;
	brand: string;
	brand_slug: string;
	form_type: string;
	series: string;
	last_name: string;
	first_name: string;
	last_kana: string;
	first_kana: string;
	email: string;
	tel: string;
	preferred_contact: string;
	message: string;
	privacy_agreed: boolean;
	source_url: string;
	company_website: string; // スパム対策ハニーポット
}

function cleanText(value: unknown, maxLen = 2000): string {
	return String(value ?? "").trim().slice(0, maxLen);
}

function generateReferenceId(): string {
	const now = new Date();
	const yyyy = now.getFullYear();
	const mm = String(now.getMonth() + 1).padStart(2, "0");
	const dd = String(now.getDate()).padStart(2, "0");
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let rand = "";
	for (let i = 0; i < 4; i++) {
		rand += chars[Math.floor(Math.random() * chars.length)];
	}
	return `NC-${yyyy}${mm}${dd}-${rand}`;
}

function resolveFormrunEndpoint(runtimeEnv: Record<string, any>, brandSlug: string): string {
	const map: Record<string, string | undefined> = {
		bmw: runtimeEnv?.FORMRUN_ENDPOINT_BMW,
		mini: runtimeEnv?.FORMRUN_ENDPOINT_MINI,
		"rolls-royce": runtimeEnv?.FORMRUN_ENDPOINT_ROLLSROYCE,
		alpina: runtimeEnv?.FORMRUN_ENDPOINT_ALPINA,
		ferrari: runtimeEnv?.FORMRUN_ENDPOINT_FERRARI,
		nicole: runtimeEnv?.FORMRUN_ENDPOINT_NICOLE,
	};
	return cleanText(
		map[brandSlug] || runtimeEnv?.FORMRUN_ENDPOINT_NICOLE || runtimeEnv?.FORMRUN_ENDPOINT || "",
		500
	);
}

async function parsePayload(request: Request): Promise<ContactPayload> {
	const contentType = request.headers.get("content-type") || "";
	let raw: Record<string, unknown> = {};

	if (contentType.includes("application/json")) {
		raw = ((await request.json().catch(() => ({}))) as Record<string, unknown>) || {};
	} else {
		const fd = await request.formData();
		for (const [k, v] of fd.entries()) {
			raw[k] = typeof v === "string" ? v : "";
		}
	}

	const agreedRaw = raw.privacy_agreed;
	const privacyAgreed =
		agreedRaw === true ||
		agreedRaw === "true" ||
		agreedRaw === "on" ||
		agreedRaw === "同意する" ||
		agreedRaw === "1";

	return {
		inquiry_type: cleanText(raw.inquiry_type, 100),
		brand: cleanText(raw.brand || raw._field_19 || "Nicole Group", 100),
		brand_slug: cleanText(raw.brand_slug || "nicole", 50).toLowerCase(),
		form_type: cleanText(raw.form_type || "inquiry", 50),
		series: cleanText(raw.series, 200),
		last_name: cleanText(raw.last_name, 100),
		first_name: cleanText(raw.first_name, 100),
		last_kana: cleanText(raw.last_kana, 100),
		first_kana: cleanText(raw.first_kana, 100),
		email: cleanText(raw.email, 254),
		tel: cleanText(raw.tel, 40),
		preferred_contact: cleanText(raw.preferred_contact || "どちらでも可", 40),
		message: cleanText(raw.message, 4000),
		privacy_agreed: privacyAgreed,
		source_url: cleanText(raw.source_url, 1000),
		company_website: cleanText(raw.company_website, 200),
	};
}

// D1非保存・ステートレス中継専用API
// 環境変数に formrun コード型フォームのエンドポイントを設定するだけで
// 個人情報を自社DBに残さず formrun 管理画面へ転送する
export const POST: APIRoute = async ({ request, locals }) => {
	try {
		const data = await parsePayload(request);

		// スパム対策ハニーポット（ボット入力時は転送せず静かに正常終了を返す）
		if (data.company_website) {
			return new Response(
				JSON.stringify({ ok: true, referenceId: generateReferenceId(), status: "ignored" }),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		}

		// サーバーサイドバリデーション
		const errors: string[] = [];
		if (!data.inquiry_type) errors.push("お問い合わせ種別を選択してください。");
		if (!data.brand) errors.push("対象ブランドを選択してください。");
		if (!data.last_name || !data.first_name) errors.push("お名前（姓・名）をご入力ください。");
		if (!data.last_kana || !data.first_kana) errors.push("フリガナ（セイ・メイ）をご入力ください。");
		if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
			errors.push("正しいメールアドレスをご入力ください。");
		}
		if (!data.tel) errors.push("電話番号をご入力ください。");
		if (!data.message) errors.push("お問い合わせ内容をご入力ください。");
		if (!data.privacy_agreed) errors.push("プライバシー・ポリシーへの同意が必要です。");

		if (errors.length > 0) {
			return new Response(JSON.stringify({ ok: false, error: errors[0], errors }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const referenceId = generateReferenceId();
		const runtimeEnv = ((locals as any)?.runtime?.env || env || {}) as Record<string, any>;
		const formrunEndpoint = resolveFormrunEndpoint(runtimeEnv, data.brand_slug);

		// formrun コード型フォームへ直接転送（D1には一切保存しない）
		if (formrunEndpoint) {
			const formrunBody = new URLSearchParams();
			formrunBody.set("受付番号", referenceId);
			formrunBody.set("お問い合わせ種別", data.inquiry_type);
			formrunBody.set("対象ブランド", data.brand);
			formrunBody.set("ご検討モデル", data.series);
			formrunBody.set("お名前", `${data.last_name} ${data.first_name}`);
			formrunBody.set("フリガナ", `${data.last_kana} ${data.first_kana}`);
			formrunBody.set("メールアドレス", data.email);
			formrunBody.set("電話番号", data.tel);
			formrunBody.set("ご希望の連絡方法", data.preferred_contact);
			formrunBody.set("お問い合わせ内容", data.message);
			formrunBody.set("遷移元URL", data.source_url);

			const forwardRes = await fetch(formrunEndpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Accept: "application/json",
				},
				body: formrunBody.toString(),
			});

			if (!forwardRes.ok) {
				console.error("[contact] formrun forward error:", forwardRes.status);
				return new Response(
					JSON.stringify({
						ok: false,
						error: "送信先との通信に失敗しました。時間をおいて再度お試しください。",
					}),
					{ status: 502, headers: { "Content-Type": "application/json" } }
				);
			}

			return new Response(
				JSON.stringify({ ok: true, referenceId, status: "forwarded" }),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		}

		// エンドポイント未設定時（ローカル検証・連携前）：DBには保存せず受付番号のみ返却
		return new Response(
			JSON.stringify({ ok: true, referenceId, status: "accepted_no_storage" }),
			{ status: 200, headers: { "Content-Type": "application/json" } }
		);
	} catch (error) {
		console.error("[contact] API error:", error);
		return new Response(
			JSON.stringify({
				ok: false,
				error: "送信処理中にエラーが発生しました。時間をおいて再度お試しください。",
			}),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
};
