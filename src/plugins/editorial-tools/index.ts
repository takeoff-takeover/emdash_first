import { fileURLToPath } from "node:url";

const runtimePath = fileURLToPath(new URL("./runtime.ts", import.meta.url));

export function editorialToolsPlugin() {
	return {
		id: "editorial-tools",
		version: "1.0.0",
		entrypoint: runtimePath,
		format: "native" as const,
		adminPages: [],
		portableTextBlocks: [
			{
				type: "slider",
				label: "ギャラリー（フィルムストリップ）",
				icon: "photo",
				description: "角型サムネイル一覧付きの標準ギャラリー（写真をクリックや左右矢印で切り替え）",
				category: "メディア",
				fields: [
					{
						type: "text_input",
						action_id: "caption",
						label: "キャプション / 写真説明文（任意）",
						placeholder: "例：流麗なルーフラインと力強いショルダーライン"
					},
					{
						type: "media_picker",
						action_id: "id",
						label: "【写真 1】 メイン写真（写真表示・ドラッグ＆ドロップ対応）",
						placeholder: "ここに写真をドラッグ＆ドロップ、またはクリックしてメディア選択",
						mime_type_filter: "image/"
					},
					{
						type: "media_picker",
						action_id: "image_2",
						label: "【写真 2】（写真表示・ドラッグ＆ドロップ対応）",
						placeholder: "ここに写真をドラッグ＆ドロップ、またはクリックしてメディア選択",
						mime_type_filter: "image/"
					},
					{
						type: "media_picker",
						action_id: "image_3",
						label: "【写真 3】（写真表示・ドラッグ＆ドロップ対応）",
						placeholder: "ここに写真をドラッグ＆ドロップ、またはクリックしてメディア選択",
						mime_type_filter: "image/"
					},
					{
						type: "media_picker",
						action_id: "image_4",
						label: "【写真 4】（写真表示・ドラッグ＆ドロップ対応）",
						placeholder: "ここに写真をドラッグ＆ドロップ、またはクリックしてメディア選択",
						mime_type_filter: "image/"
					},
					{
						type: "media_picker",
						action_id: "image_5",
						label: "【写真 5】（写真表示・ドラッグ＆ドロップ対応）",
						placeholder: "ここに写真をドラッグ＆ドロップ、またはクリックしてメディア選択",
						mime_type_filter: "image/"
					},
					{
						type: "media_picker",
						action_id: "image_6",
						label: "【写真 6】（写真表示・ドラッグ＆ドロップ対応）",
						placeholder: "ここに写真をドラッグ＆ドロップ、またはクリックしてメディア選択",
						mime_type_filter: "image/"
					},
					{
						type: "media_picker",
						action_id: "image_7",
						label: "【写真 7】（写真表示・ドラッグ＆ドロップ対応）",
						placeholder: "ここに写真をドラッグ＆ドロップ、またはクリックしてメディア選択",
						mime_type_filter: "image/"
					},
					{
						type: "media_picker",
						action_id: "image_8",
						label: "【写真 8】（写真表示・ドラッグ＆ドロップ対応）",
						placeholder: "ここに写真をドラッグ＆ドロップ、またはクリックしてメディア選択",
						mime_type_filter: "image/"
					},
					{
						type: "text_input",
						action_id: "images",
						label: "その他・追加の写真URL（URLでの一括指定や9枚目以降の追加がある場合）",
						placeholder: "https://...\nhttps://..."
					}
				]
			},
			{
				type: "faq",
				label: "アコーディオン（FAQ）",
				icon: "list",
				description: "「よくある質問」大見出しの下に、質問(Q)を常時一覧表示し回答(A)をクリックで開閉するFAQ専用ウィジェット",
				category: "レイアウト",
				placeholder: "よくある質問の見出し（空欄時は「よくある質問」）",
				fields: [
					{
						type: "text_input",
						action_id: "title",
						label: "FAQ大見出し（空欄の場合は「よくある質問」）",
						placeholder: "よくある質問"
					},
					{
						type: "text_input",
						action_id: "content",
						label: "Q&A内容（手書きで複数行入力可能：Q: 質問 / A: 回答）",
						placeholder: "Q1: 航続距離828kmは日本の路上でも達成可能ですか？\nA1: WLTPモードによる公式測定値です...\n\nQ2: 日本仕様の充電規格は何に対応していますか？\nA2: CHAdeMO規格の急速充電に対応します..."
					}
				]
			},
			{
				type: "accordion",
				label: "アコーディオン（詳細情報・スペック）",
				icon: "link",
				description: "クリック（タップ）で開閉する詳細情報・スペック表ツール",
				category: "レイアウト",
				placeholder: "アコーディオンの見出しを入力...",
				fields: [
					{
						type: "text_input",
						action_id: "id",
						label: "アコーディオン見出し（タイトル）",
						placeholder: "例：主要諸元・技術スペック"
					},
					{
						type: "text_input",
						action_id: "content",
						label: "詳細内容・スペック本文（複数行入力可能）",
						placeholder: "開いたときに表示するスペックや説明文を入力..."
					}
				]
			}
		]
	};
}

export default editorialToolsPlugin;
