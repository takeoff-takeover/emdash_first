// scripts/patch-admin-ui.cjs
// EmDash 管理画面に拠点（locations）の「アコーディオンUI」および「取扱サービス機能セレクター」を動的注入するパッチ
const fs = require('fs');
const path = require('path');

const adminAstroPath = path.join(__dirname, '..', 'node_modules', 'emdash', 'src', 'astro', 'routes', 'admin.astro');
if (!fs.existsSync(adminAstroPath)) {
  console.log('[patch-admin-ui] admin.astro not found, skipping.');
  process.exit(0);
}

let content = fs.readFileSync(adminAstroPath, 'utf8');

const MARKER = '/* __SECTION_BLOCKS_INJECTED__ */';

// 既存の注入コードがあれば削除
if (content.includes(MARKER)) {
  const startIdx = content.indexOf('<script is:inline>\n\t\t\t' + MARKER);
  if (startIdx !== -1) {
    const endIdx = content.indexOf('</script>', startIdx) + '</script>'.length;
    content = content.slice(0, startIdx) + content.slice(endIdx);
  } else {
    const simpleIdx = content.indexOf(MARKER);
    const scriptStart = content.lastIndexOf('<script', simpleIdx);
    const scriptEnd = content.indexOf('</script>', simpleIdx) + '</script>'.length;
    if (scriptStart !== -1 && scriptEnd !== -1) {
      content = content.slice(0, scriptStart) + content.slice(scriptEnd);
    }
  }
}

const injectedCode = `
		<script is:inline>
			${MARKER}
			(() => {
				function checkLocalAutoLogin() {
					if (
						(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
						window.location.pathname.startsWith('/_emdash/admin/login')
					) {
						const params = new URLSearchParams(window.location.search);
						const redirect = params.get('redirect') || '/_emdash/admin';
						window.location.replace('/_emdash/api/auth/dev-bypass?redirect=' + encodeURIComponent(redirect));
						return true;
					}
					return false;
				}
				if (checkLocalAutoLogin()) return;

				// エディタ内「注釈」スタイルの動的注入（管理画面のライト/ダーク背景に対応）
				function injectEditorNoteStyles() {
					let style = document.getElementById('emdash-editor-note-style');
					if (!style) {
						style = document.createElement('style');
						style.id = 'emdash-editor-note-style';
						document.head.appendChild(style);
					}
					style.textContent = '.ProseMirror p.is-note, .ProseMirror p[data-pt-style="note"] { font-size: 12.5px !important; line-height: 1.45 !important; color: #555e6d !important; margin-top: 6px !important; margin-bottom: 6px !important; letter-spacing: 0.02em !important; border-left: 2px solid #cbd5e1 !important; padding-left: 8px !important; } :is(.dark, [data-theme="dark"]) .ProseMirror p.is-note, :is(.dark, [data-theme="dark"]) .ProseMirror p[data-pt-style="note"] { color: rgba(255, 255, 255, 0.55) !important; border-left-color: rgba(255, 255, 255, 0.25) !important; }';
				}
				injectEditorNoteStyles();

				const SECTION_CONFIG = [
					{
						id: 'sec-basic',
						prefix: '【基本情報】',
						title: '基本情報',
						desc: '拠点名称、主要ブランド、取扱サービス機能、住所、管理オフィス注記'
					},
					{
						id: 'sec-gallery',
						prefix: '【写真ギャラリー】',
						title: '写真ギャラリー',
						desc: 'メイン外観写真（アイキャッチ）および詳細写真（最大6枚）と説明文'
					},
					{
						id: 'sec-sales',
						prefix: '【新車窓口】',
						title: '新車窓口',
						desc: '店舗名称、直通電話、FAX、営業時間、定休日、展示案内、予約ボタン'
					},
					{
						id: 'sec-used',
						prefix: '【中古車窓口】',
						title: '認定中古車窓口',
						desc: '店舗名称、直通電話、FAX、営業時間、定休日、在庫案内、在庫ボタン'
					},
					{
						id: 'sec-service',
						prefix: '【サービス窓口】',
						title: 'サービス窓口',
						desc: '店舗名称、直通電話、FAX、営業時間、定休日、整備案内、予約ボタン'
					},
					{
						id: 'sec-external-service',
						prefix: '【指定サービス工場】',
						title: '指定サービス工場（※工場非併設店舗のみ）',
						desc: '自社工場がない店舗（大田、MINI港北、MINI都筑など）の指定工場名称、URL、所在地、連絡先、営業時間、案内文'
					},
					{
						id: 'sec-access',
						prefix: '【併設・アクセス】',
						title: '併設・アクセス',
						desc: '同一敷地併設拠点への相互リンク、お車・電車バスでのアクセス方法、GoogleマップURL'
					},
					{
						id: 'sec-google',
						prefix: '【Google連携】',
						title: 'Googleマップ連携・クチコミ設定',
						desc: 'Google Places API用のプレイスID、評価スコア・クチコミ件数（手動設定・フォールバック用）'
					}
				];

				// 各セクションの開閉状態（デフォルトは基本情報のみオープン）
				const openState = {
					'sec-basic': true,
					'sec-gallery': false,
					'sec-sales': false,
					'sec-used': false,
					'sec-service': false,
					'sec-external-service': false,
					'sec-access': false,
					'sec-google': false
				};

				// 取扱サービス・機能の選択肢一覧
				const BADGE_GROUPS = [
					{
						group: 'BMW',
						options: ['BMW 新車', 'BMW 認定中古車', 'BMW（ALPINA）サービス']
					},
					{
						group: 'MINI',
						options: ['MINI 新車', 'MINI 認定中古車', 'MINI サービス']
					},
					{
						group: 'Rolls-Royce',
						options: ['Rolls-Royce 新車', 'Rolls-Royce 認定中古車', 'Rolls-Royce サービス']
					},
					{
						group: 'Ferrari',
						options: ['Ferrari 新車', 'Ferrari 認定中古車', 'Ferrari サービス']
					},
					{
						group: 'ALPINA / 本社',
						options: ['ALPINA 車両', '本社・オフィス']
					}
				];

				// 取扱サービス機能のトグルピルUIを生成
				function applyBadgesSelectorUI() {
					// 既にセレクターが配置済みで正常動作中なら再生成しない
					const existingSelector = document.getElementById('emdash-badges-selector-wrap');

					// 「【基本情報】取扱サービス」ラベル本体だけを対象にする（親要素や他項目の「取扱サービス」を含む文言に誤マッチさせない）
					const allLabels = Array.from(document.querySelectorAll('label, p, span'));
					const badgesLabelEl = allLabels.find(el =>
						el.children.length === 0 && el.textContent &&
						el.textContent.includes('【基本情報】') && el.textContent.includes('取扱サービス')
					);
					if (!badgesLabelEl) return;

					let container = badgesLabelEl.parentElement;
					while (container && container.parentElement) {
						if (container.parentElement.classList.contains('space-y-6') || container.parentElement.tagName === 'FIELDSET') {
							break;
						}
						container = container.parentElement;
					}
					if (!container) return;

					let input = container.querySelector('input, textarea');
					if (!input) {
						input = document.querySelector('input[name="badges"], textarea[name="badges"], input[id*="badges"]');
					}
					if (!input) return;

					let selectorWrap = document.getElementById('emdash-badges-selector-wrap');
					if (!selectorWrap) {
						selectorWrap = document.createElement('div');
						selectorWrap.id = 'emdash-badges-selector-wrap';
						selectorWrap.style.cssText = \`
							margin-top: 10px;
							padding: 14px 16px;
							background: var(--color-kumo-base);
							border: 1px solid var(--color-kumo-line);
							border-radius: 8px;
							display: flex;
							flex-direction: column;
							gap: 12px;
						\`;

						input.style.display = 'none'; // テキストボックスは隠してセレクターで操作

						const guideText = document.createElement('div');
						guideText.style.cssText = 'font-size: 12px; color: var(--text-color-kumo-subtle); margin-bottom: 2px;';
						guideText.textContent = '※該当する項目をクリックしてください（複数選択可）';
						selectorWrap.appendChild(guideText);

						// グループごとにピルを描画
						BADGE_GROUPS.forEach(grp => {
							const groupRow = document.createElement('div');
							groupRow.style.cssText = 'display: flex; flex-direction: column; gap: 6px;';

							const groupTitle = document.createElement('div');
							groupTitle.textContent = grp.group;
							groupTitle.style.cssText = 'font-size: 11px; font-weight: 700; color: var(--text-color-kumo-subtle); letter-spacing: 0.05em; text-transform: uppercase;';
							groupRow.appendChild(groupTitle);

							const pillsWrap = document.createElement('div');
							pillsWrap.style.cssText = 'display: flex; flex-wrap: wrap; gap: 6px;';

							grp.options.forEach(optLabel => {
								const pill = document.createElement('button');
								pill.type = 'button';
								pill.textContent = optLabel;
								pill.setAttribute('data-badge-option', optLabel);
								pill.style.cssText = \`
									padding: 5px 12px;
									font-size: 12px;
									font-weight: 500;
									border-radius: 4px;
									cursor: pointer;
									transition: all 0.15s ease;
									border: 1px solid var(--color-kumo-line);
									background: var(--color-kumo-elevated);
									color: var(--text-color-kumo-subtle);
								\`;

								pill.onclick = (e) => {
									e.preventDefault();
									const curValues = (input.value || '').split(',').map(s => s.trim()).filter(Boolean);
									const exists = curValues.includes(optLabel);
									let newValues;
									if (exists) {
										newValues = curValues.filter(v => v !== optLabel);
									} else {
										newValues = [...curValues, optLabel];
									}
									input.value = newValues.join(', ');
									input.dispatchEvent(new Event('input', { bubbles: true }));
									input.dispatchEvent(new Event('change', { bubbles: true }));
									syncPillStyles(input.value);
								};

								pillsWrap.appendChild(pill);
							});

							groupRow.appendChild(pillsWrap);
							selectorWrap.appendChild(groupRow);
						});

						container.appendChild(selectorWrap);
					}

					syncPillStyles(input.value);
				}

				function syncPillStyles(currentVal) {
					const values = (currentVal || '').split(',').map(s => s.trim()).filter(Boolean);
					document.querySelectorAll('[data-badge-option]').forEach(btn => {
						const label = btn.getAttribute('data-badge-option');
						const isSelected = values.includes(label);
						if (isSelected) {
							btn.style.background = 'var(--color-kumo-contrast)';
							btn.style.borderColor = 'var(--color-kumo-contrast)';
							btn.style.color = 'var(--color-kumo-base)';
							btn.style.fontWeight = '700';
						} else {
							btn.style.background = 'var(--color-kumo-elevated)';
							btn.style.borderColor = 'var(--color-kumo-line)';
							btn.style.color = 'var(--text-color-kumo-subtle)';
							btn.style.fontWeight = '500';
						}
					});
				}

				function applyAccordion() {
					// 専用CSSの注入（ホバーや開閉スタイルをCSSで完結させ、JSのタイマー上書きによるチカチカ・点滅を完全防止）
					if (!document.getElementById('emdash-accordion-styles')) {
						const styleEl = document.createElement('style');
						styleEl.id = 'emdash-accordion-styles';
						styleEl.textContent = \`
							[data-accordion-header] {
								margin-top: 18px;
								margin-bottom: 12px;
								padding: 12px 18px;
								background: var(--color-kumo-elevated);
								border: 1px solid var(--color-kumo-line);
								border-left: 4px solid var(--color-kumo-line);
								border-radius: 6px;
								cursor: pointer;
								display: flex;
								align-items: center;
								justify-content: space-between;
								user-select: none;
								transition: background 0.15s ease, border-color 0.15s ease;
							}
							[data-accordion-header][data-is-open="true"] {
								background: var(--color-kumo-tint);
								border-left-color: var(--color-kumo-contrast);
							}
							[data-accordion-header]:hover {
								background: var(--color-kumo-tint) !important;
								border-color: var(--color-kumo-line) !important;
							}
							.emdash-sec-field-open {
								padding-left: 10px !important;
								border-left: 2px solid var(--color-kumo-tint) !important;
								margin-left: 4px !important;
							}
							#emdash-accordion-toolbar button {
								transition: background 0.15s ease, color 0.15s ease;
							}
							#emdash-accordion-toolbar button:hover {
								background: var(--color-kumo-line) !important;
							}
						\`;
						document.head.appendChild(styleEl);
					}

					// 画面内にプレフィックスが存在するか判定
					const allElements = Array.from(document.querySelectorAll('label, p, span, h3, h4'));
					const hasLocationsField = allElements.some(el =>
						el.textContent && (
							el.textContent.includes('【基本情報】') ||
							el.textContent.includes('【新車窓口】') ||
							el.textContent.includes('【写真ギャラリー】') ||
							el.textContent.includes('【指定サービス工場】')
						)
					);

					if (!hasLocationsField) {
						// 拠点編集画面以外ではアコーディオンヘッダーやツールバーを削除
						document.querySelectorAll('[data-accordion-header]').forEach(el => el.remove());
						const existingToolbar = document.getElementById('emdash-accordion-toolbar');
						if (existingToolbar) existingToolbar.remove();
						const existingSelector = document.getElementById('emdash-badges-selector-wrap');
						if (existingSelector) existingSelector.remove();
						return;
					}

					// 取扱サービスセレクターの生成
					applyBadgesSelectorUI();

					// すでにツールバーと全ヘッダーが正常に挿入済みの場合は重い全走査をスキップして高速化
					const existingToolbar = document.getElementById('emdash-accordion-toolbar');
					const existingHeaders = document.querySelectorAll('[data-accordion-header]');
					if (existingToolbar && existingHeaders.length >= 5 && document.body.contains(existingToolbar)) {
						return;
					}

					// 各プレフィックスに該当するフィールドラッパー要素をグループ化
					const sectionElements = {};
					SECTION_CONFIG.forEach(sec => { sectionElements[sec.id] = []; });

					const searchTargets = [
						...Array.from(document.querySelectorAll('label')),
						...Array.from(document.querySelectorAll('p, span, h3, h4'))
					];

					searchTargets.forEach(el => {
						const text = el.textContent || '';
						if (!text) return;
						for (const sec of SECTION_CONFIG) {
							if (text.includes(sec.prefix)) {
								let container = el.parentElement;
								while (container && container.parentElement) {
									if (container.parentElement.classList.contains('space-y-6') || container.parentElement.tagName === 'FIELDSET') {
										break;
									}
									container = container.parentElement;
								}
								if (container && !sectionElements[sec.id].includes(container)) {
									const alreadyAdded = Object.values(sectionElements).some(arr => arr.includes(container));
									if (!alreadyAdded) {
										sectionElements[sec.id].push(container);
									}
								}
								break;
							}
						}
					});

					const totalFound = Object.values(sectionElements).reduce((acc, arr) => acc + arr.length, 0);
					if (totalFound < 3) return;

					// ターゲットとなる親要素を取得
					const firstField = sectionElements['sec-basic'][0] || Object.values(sectionElements).find(arr => arr.length > 0)?.[0];
					if (!firstField || !firstField.parentElement) return;
					const parentContainer = firstField.parentElement;

					// アコーディオン一括開閉ツールバーの生成または更新
					let toolbar = document.getElementById('emdash-accordion-toolbar');
					if (!toolbar) {
						toolbar = document.createElement('div');
						toolbar.id = 'emdash-accordion-toolbar';
						toolbar.style.cssText = \`
							display: flex;
							align-items: center;
							justify-content: space-between;
							margin-bottom: 20px;
							padding: 10px 16px;
							background: var(--color-kumo-base);
							border: 1px solid var(--color-kumo-line);
							border-radius: 8px;
							gap: 12px;
						\`;

						const infoText = document.createElement('span');
						infoText.style.cssText = 'font-size: 13px; color: var(--text-color-kumo-subtle); font-weight: 500;';
						infoText.innerHTML = '<span style="color: var(--text-color-kumo-default); font-weight: 700;">拠点詳細設定</span>（クリックで各セクションを開閉できます）';

						const btnGroup = document.createElement('div');
						btnGroup.style.cssText = 'display: flex; gap: 8px;';

						const expandAllBtn = document.createElement('button');
						expandAllBtn.type = 'button';
						expandAllBtn.textContent = 'すべて開く';
						expandAllBtn.style.cssText = \`
							padding: 5px 12px;
							font-size: 12px;
							font-weight: 600;
							color: var(--text-color-kumo-default);
							background: var(--color-kumo-tint);
							border: 1px solid var(--color-kumo-line);
							border-radius: 4px;
							cursor: pointer;
						\`;
						expandAllBtn.onclick = (e) => {
							e.preventDefault();
							SECTION_CONFIG.forEach(s => { openState[s.id] = true; });
							updateAccordionVisibility(sectionElements);
						};

						const collapseAllBtn = document.createElement('button');
						collapseAllBtn.type = 'button';
						collapseAllBtn.textContent = 'すべて閉じる';
						collapseAllBtn.style.cssText = \`
							padding: 5px 12px;
							font-size: 12px;
							font-weight: 600;
							color: var(--text-color-kumo-subtle);
							background: transparent;
							border: 1px solid var(--color-kumo-line);
							border-radius: 4px;
							cursor: pointer;
						\`;
						collapseAllBtn.onclick = (e) => {
							e.preventDefault();
							SECTION_CONFIG.forEach(s => { openState[s.id] = false; });
							updateAccordionVisibility(sectionElements);
						};

						btnGroup.appendChild(expandAllBtn);
						btnGroup.appendChild(collapseAllBtn);
						toolbar.appendChild(infoText);
						toolbar.appendChild(btnGroup);

						parentContainer.insertBefore(toolbar, firstField);
					}

					// 各セクションのヘッダーバーを生成
					for (const sec of SECTION_CONFIG) {
						const fields = sectionElements[sec.id];
						if (!fields || fields.length === 0) continue;

						const firstFieldOfSec = fields[0];
						let header = document.querySelector(\`[data-accordion-header="\${sec.id}"]\`);

						if (!header) {
							header = document.createElement('div');
							header.setAttribute('data-accordion-header', sec.id);

							header.onclick = (e) => {
								e.preventDefault();
								openState[sec.id] = !openState[sec.id];
								updateAccordionVisibility(sectionElements);
							};

							const leftDiv = document.createElement('div');
							leftDiv.style.cssText = 'flex: 1;';

							const h3 = document.createElement('div');
							h3.className = 'acc-title-text';
							h3.style.cssText = 'font-size: 15px; font-weight: 700; color: var(--text-color-kumo-default); letter-spacing: 0.02em; display: flex; align-items: center; gap: 8px;';

							const p = document.createElement('div');
							p.className = 'acc-desc-text';
							p.textContent = sec.desc;
							p.style.cssText = 'margin: 4px 0 0 0; font-size: 12px; color: var(--text-color-kumo-subtle); line-height: 1.4;';

							leftDiv.appendChild(h3);
							leftDiv.appendChild(p);

							const rightDiv = document.createElement('div');
							rightDiv.style.cssText = 'display: flex; align-items: center; gap: 10px; margin-left: 14px;';

							const countBadge = document.createElement('span');
							countBadge.className = 'acc-badge';
							countBadge.textContent = \`\${fields.length}項目\`;
							countBadge.style.cssText = 'font-size: 11px; background: var(--color-kumo-tint); color: var(--text-color-kumo-default); padding: 2px 8px; border-radius: 9999px; border: 1px solid var(--color-kumo-line);';

							const arrow = document.createElement('span');
							arrow.className = 'acc-arrow';
							arrow.style.cssText = 'font-size: 12px; font-weight: 600; color: var(--text-color-kumo-default); transition: transform 0.2s ease;';

							rightDiv.appendChild(countBadge);
							rightDiv.appendChild(arrow);

							header.appendChild(leftDiv);
							header.appendChild(rightDiv);

							firstFieldOfSec.parentNode.insertBefore(header, firstFieldOfSec);
						}

						// タイトル更新
						const h3El = header.querySelector('.acc-title-text');
						if (h3El) h3El.textContent = sec.title;
					}

					updateAccordionVisibility(sectionElements);
				}

				function updateAccordionVisibility(sectionElements) {
					SECTION_CONFIG.forEach(sec => {
						const header = document.querySelector(\`[data-accordion-header="\${sec.id}"]\`);
						const fields = sectionElements ? (sectionElements[sec.id] || []) : [];
						const isOpen = !!openState[sec.id];

						if (header) {
							const currentIsOpenAttr = header.getAttribute('data-is-open');
							const targetIsOpenStr = isOpen ? 'true' : 'false';
							if (currentIsOpenAttr !== targetIsOpenStr) {
								header.setAttribute('data-is-open', targetIsOpenStr);
							}
							const arrow = header.querySelector('.acc-arrow');
							if (arrow) {
								const targetArrowText = isOpen ? '▲ 閉じる' : '▼ 開く';
								if (arrow.textContent !== targetArrowText) {
									arrow.textContent = targetArrowText;
								}
							}
						}

						fields.forEach(fieldEl => {
							const targetDisplay = isOpen ? '' : 'none';
							if (fieldEl.style.display !== targetDisplay) {
								fieldEl.style.display = targetDisplay;
							}
							if (isOpen) {
								if (!fieldEl.classList.contains('emdash-sec-field-open')) {
									fieldEl.classList.add('emdash-sec-field-open');
								}
							} else {
								if (fieldEl.classList.contains('emdash-sec-field-open')) {
									fieldEl.classList.remove('emdash-sec-field-open');
								}
							}
						});
					});
				}

				// ─────────────────────────────────────────────────────────────
				// キャンペーン一覧画面でのブランド別フィルタタブUI
				// ─────────────────────────────────────────────────────────────
				let activeCampaignBrand = 'all';

				function applyCampaignBrandFilterTabs() {
					try {
						const rawPath = window.location.pathname || '';
						const path = rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath;

						// エディタ画面・編集画面なら絶対にタブを配置せず、既存のタブがあれば即座に削除する
						const isEditor = Boolean(
							document.querySelector('form') ||
							document.querySelector('.tiptap') ||
							document.querySelector('[data-slate-editor]') ||
							document.querySelector('.emdash-editor') ||
							path.includes('/campaigns/') ||
							path.endsWith('/campaigns/new')
						);

						const isCampaignListPage = !isEditor && (path === '/_emdash/admin/content/campaigns' || path.endsWith('/admin/content/campaigns'));
						if (!isCampaignListPage) {
							const existingTabs = document.getElementById('campaign-brand-filter-bar');
							if (existingTabs) existingTabs.remove();
							return;
						}

						// テーブルまたは一覧コンテナを探す（エディタ内のテーブルやブロックプレビュー内のテーブルは完全に除外）
						const table = document.querySelector('main table, .emdash-table-wrap table, .overflow-x-auto > table');
						if (!table) return;
						if (table.closest('.tiptap') || table.closest('form') || table.closest('.plugin-block') || table.closest('.cms-table-widget') || table.closest('.nicole-block-preview')) {
							return;
						}

						const tableTarget = table.closest('.overflow-x-auto') || table;
						let tabContainer = document.getElementById('campaign-brand-filter-bar');
						if (!tabContainer || !document.body.contains(tabContainer)) {
							if (tabContainer) tabContainer.remove();
							tabContainer = document.createElement('div');
							tabContainer.id = 'campaign-brand-filter-bar';
							tabContainer.style.cssText = \`
								display: flex;
								align-items: center;
								gap: 8px;
								margin-bottom: 16px;
								padding: 12px 16px;
								background: var(--color-kumo-elevated);
								border: 1px solid var(--color-kumo-line);
								border-radius: 8px;
								overflow-x: auto;
								z-index: 10;
							\`;

							const label = document.createElement('span');
							label.textContent = 'ブランド絞り込み:';
							label.style.cssText = 'font-size: 12px; font-weight: 600; color: var(--text-color-kumo-subtle); margin-right: 4px; white-space: nowrap;';
							tabContainer.appendChild(label);

							const brands = [
								{ label: 'すべて', value: 'all' },
								{ label: 'BMW', value: 'BMW' },
								{ label: 'MINI', value: 'MINI' },
								{ label: 'Rolls-Royce', value: 'Rolls-Royce' },
								{ label: 'Ferrari', value: 'Ferrari' },
								{ label: 'ALPINA', value: 'ALPINA' }
							];

							brands.forEach(b => {
								const btn = document.createElement('button');
								btn.type = 'button';
								btn.dataset.brandFilter = b.value;
								btn.textContent = b.label;
								btn.style.cssText = \`
									padding: 6px 14px;
									font-size: 12px;
									font-weight: 600;
									border-radius: 6px;
									cursor: pointer;
									transition: all 0.2s ease;
									white-space: nowrap;
									border: 1px solid \${activeCampaignBrand === b.value ? 'var(--color-kumo-contrast)' : 'var(--color-kumo-line)'};
									background: \${activeCampaignBrand === b.value ? 'var(--color-kumo-contrast)' : 'var(--color-kumo-tint)'};
									color: \${activeCampaignBrand === b.value ? 'var(--color-kumo-base)' : 'var(--text-color-kumo-default)'};
								\`;

								btn.addEventListener('click', (e) => {
									e.preventDefault();
									activeCampaignBrand = b.value;
									updateCampaignTabButtons();
									filterCampaignTableRows();
								});

								tabContainer.appendChild(btn);
							});

							tableTarget.parentNode.insertBefore(tabContainer, tableTarget);
						}

						filterCampaignTableRows();
					} catch (e) {
						console.error('[patch-admin-ui] Error in applyCampaignBrandFilterTabs:', e);
					}
				}

				function updateCampaignTabButtons() {
					const btns = document.querySelectorAll('#campaign-brand-filter-bar button[data-brand-filter]');
					btns.forEach(btn => {
						const isSelected = btn.dataset.brandFilter === activeCampaignBrand;
						btn.style.background = isSelected ? 'var(--color-kumo-contrast)' : 'var(--color-kumo-tint)';
						btn.style.color = isSelected ? 'var(--color-kumo-base)' : 'var(--text-color-kumo-default)';
						btn.style.borderColor = isSelected ? 'var(--color-kumo-contrast)' : 'var(--color-kumo-line)';
					});
				}

				function filterCampaignTableRows() {
					const rows = document.querySelectorAll('main table tbody tr');
					rows.forEach(tr => {
						if (activeCampaignBrand === 'all') {
							tr.style.display = '';
							return;
						}
						const rowText = tr.textContent || '';
						if (rowText.includes(activeCampaignBrand)) {
							tr.style.display = '';
						} else {
							tr.style.display = 'none';
						}
					});
				}

				// ─────────────────────────────────────────────────────────────
				// マガジン一覧画面でのカテゴリ・ブランド別フィルタタブUI
				// ─────────────────────────────────────────────────────────────
				let activeMagazineFilter = 'all';

				function applyMagazineFilterTabs() {
					try {
						const rawPath = window.location.pathname || '';
						const path = rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath;

						// エディタ画面・編集画面なら絶対にタブを配置せず、既存のタブがあれば即座に削除する
						const isEditor = Boolean(
							document.querySelector('form') ||
							document.querySelector('.tiptap') ||
							document.querySelector('[data-slate-editor]') ||
							document.querySelector('.emdash-editor') ||
							path.includes('/magazine/') ||
							path.endsWith('/magazine/new')
						);

						const isMagazineListPage = !isEditor && (path === '/_emdash/admin/content/magazine' || path.endsWith('/admin/content/magazine'));
						if (!isMagazineListPage) {
							const existingTabs = document.getElementById('magazine-filter-bar');
							if (existingTabs) existingTabs.remove();
							return;
						}

						// テーブルまたは一覧コンテナを探す（エディタ内のテーブルやブロックプレビュー内のテーブルは完全に除外）
						const table = document.querySelector('main table, .emdash-table-wrap table, .overflow-x-auto > table');
						if (!table) return;
						if (table.closest('.tiptap') || table.closest('form') || table.closest('.plugin-block') || table.closest('.cms-table-widget') || table.closest('.nicole-block-preview')) {
							return;
						}

						const tableTarget = table.closest('.overflow-x-auto') || table;
						let tabContainer = document.getElementById('magazine-filter-bar');
						if (!tabContainer || !document.body.contains(tabContainer)) {
							if (tabContainer) tabContainer.remove();
							tabContainer = document.createElement('div');
							tabContainer.id = 'magazine-filter-bar';
							tabContainer.style.cssText = \`
								display: flex;
								align-items: center;
								gap: 8px;
								margin-bottom: 16px;
								padding: 12px 16px;
								background: var(--color-kumo-elevated);
								border: 1px solid var(--color-kumo-line);
								border-radius: 8px;
								overflow-x: auto;
								z-index: 10;
							\`;

							const label = document.createElement('span');
							label.textContent = '絞り込み:';
							label.style.cssText = 'font-size: 12px; font-weight: 600; color: var(--text-color-kumo-subtle); margin-right: 4px; white-space: nowrap;';
							tabContainer.appendChild(label);

							const filters = [
								{ label: 'すべて', value: 'all' },
								{ label: 'BMW', value: 'BMW' },
								{ label: 'MINI', value: 'MINI' },
								{ label: 'Rolls-Royce', value: 'Rolls-Royce' },
								{ label: 'Ferrari', value: 'Ferrari' },
								{ label: 'ALPINA', value: 'ALPINA' },
								{ label: 'SDGs・地域活動', value: 'SDGs' },
								{ label: 'イベント', value: 'イベント' }
							];

							filters.forEach(f => {
								const btn = document.createElement('button');
								btn.type = 'button';
								btn.dataset.magFilter = f.value;
								btn.textContent = f.label;
								btn.style.cssText = \`
									padding: 6px 14px;
									font-size: 12px;
									font-weight: 600;
									border-radius: 6px;
									cursor: pointer;
									transition: all 0.2s ease;
									white-space: nowrap;
									border: 1px solid \${activeMagazineFilter === f.value ? 'var(--color-kumo-contrast)' : 'var(--color-kumo-line)'};
									background: \${activeMagazineFilter === f.value ? 'var(--color-kumo-contrast)' : 'var(--color-kumo-tint)'};
									color: \${activeMagazineFilter === f.value ? 'var(--color-kumo-base)' : 'var(--text-color-kumo-default)'};
								\`;

								btn.addEventListener('click', (e) => {
									e.preventDefault();
									activeMagazineFilter = f.value;
									updateMagazineTabButtons();
									filterMagazineTableRows();
								});

								tabContainer.appendChild(btn);
							});

							tableTarget.parentNode.insertBefore(tabContainer, tableTarget);
						}

						filterMagazineTableRows();
					} catch (e) {
						console.error('[patch-admin-ui] Error in applyMagazineFilterTabs:', e);
					}
				}

				function updateMagazineTabButtons() {
					const btns = document.querySelectorAll('#magazine-filter-bar button[data-mag-filter]');
					btns.forEach(btn => {
						const isSelected = btn.dataset.magFilter === activeMagazineFilter;
						btn.style.background = isSelected ? 'var(--color-kumo-contrast)' : 'var(--color-kumo-tint)';
						btn.style.color = isSelected ? 'var(--color-kumo-base)' : 'var(--text-color-kumo-default)';
						btn.style.borderColor = isSelected ? 'var(--color-kumo-contrast)' : 'var(--color-kumo-line)';
					});
				}

				function filterMagazineTableRows() {
					const rows = document.querySelectorAll('table tbody tr');
					rows.forEach(tr => {
						if (activeMagazineFilter === 'all') {
							tr.style.display = '';
							return;
						}
						const rowText = (tr.textContent || '').toLowerCase();
						const target = activeMagazineFilter.toLowerCase();

						if (target === 'sdgs') {
							if (rowText.includes('sdgs') || rowText.includes('美化') || rowText.includes('クリーンアップ') || rowText.includes('交通安全') || rowText.includes('寄付')) {
								tr.style.display = '';
								return;
							}
						}
						if (target === 'イベント') {
							if (rowText.includes('イベント') || rowText.includes('united') || rowText.includes('ミーティング') || rowText.includes('体験')) {
								tr.style.display = '';
								return;
							}
						}

						if (rowText.includes(target)) {
							tr.style.display = '';
						} else {
							tr.style.display = 'none';
						}
					});
				}

				// ─────────────────────────────────────────────────────────────
				// 4. ブロック編集モーダル内の視覚的グループ分け＆エディタ上のブロックプレビュー強化
				// （ReactのDOM管理を壊さないようノード移動は行わず、属性とプレビュー要素追加のみで装飾）
				// ─────────────────────────────────────────────────────────────
				function injectEditorialBlockStyles() {
					if (document.getElementById('nicole-editorial-block-styles')) return;
					const style = document.createElement('style');
					style.id = 'nicole-editorial-block-styles';
					style.textContent = \`
						/* モーダル内のグループ見出しバー（各グループの最上部＝写真の上に配置） */
						[data-nicole-group-start]::before {
							content: attr(data-nicole-group-start);
							display: block;
							font-size: 13px;
							font-weight: 700;
							letter-spacing: 0.04em;
							color: var(--text-color-kumo-default);
							background: var(--color-kumo-tint);
							border: 1px solid var(--color-kumo-line);
							border-left: 4px solid var(--color-kumo-contrast);
							padding: 7px 12px;
							border-radius: 6px;
							margin-top: 20px;
							margin-bottom: 12px;
							margin-left: -14px;
						}
						[data-nicole-group-start]:first-child::before {
							margin-top: 2px;
						}
						[data-nicole-group-member] {
							padding-left: 12px;
							border-left: 2px solid var(--color-kumo-line);
						}
						/* 本文エディタ上のカスタムブロックカードを見やすく強化 */
						.plugin-block > div > div.rounded-lg {
							border-color: var(--color-kumo-line) !important;
							background: var(--color-kumo-elevated) !important;
							transition: border-color 0.15s ease, box-shadow 0.15s ease;
						}
						.plugin-block > div > div.rounded-lg:hover {
							border-color: var(--text-color-kumo-subtle) !important;
						}
						/* 編集・削除ボタンをホバー前でも常時薄く表示して押しやすくする */
						.plugin-block .opacity-0.group-hover\\\\:opacity-100 {
							opacity: 0.85 !important;
						}
						/* プレビュー表示中はReact管理下の元の英語/生のサマリー行をCSS側で非表示にする（DOM直接書き換えによるReact不整合を防止） */
						.plugin-block:has(.nicole-block-preview) .font-mono.truncate {
							display: none !important;
						}
						.nicole-block-preview {
							display: flex;
							flex-direction: column;
							gap: 8px;
							padding: 10px 16px 12px 16px;
							border-top: 1px solid var(--color-kumo-line);
							background: var(--color-kumo-base);
							border-bottom-left-radius: 8px;
							border-bottom-right-radius: 8px;
							cursor: pointer;
						}
						.nicole-block-preview__badges {
							display: flex;
							flex-wrap: wrap;
							gap: 6px;
							align-items: center;
						}
						.nicole-block-preview__badge {
							font-size: 11px;
							font-weight: 600;
							padding: 2px 8px;
							border-radius: 4px;
							background: var(--color-kumo-tint);
							color: var(--text-color-kumo-default);
							border: 1px solid var(--color-kumo-line);
						}
						.nicole-block-preview__thumbs {
							display: flex;
							gap: 8px;
							overflow-x: auto;
							padding-top: 2px;
						}
						.nicole-block-preview__thumb {
							width: 88px;
							height: 56px;
							object-fit: cover;
							border-radius: 6px;
							border: 1px solid var(--color-kumo-line);
							background: var(--color-kumo-tint);
							flex-shrink: 0;
						}
						.nicole-block-preview__texts {
							display: flex;
							flex-direction: column;
							gap: 3px;
							font-size: 12px;
							color: var(--text-color-kumo-subtle);
							line-height: 1.5;
						}
						.nicole-block-preview__heading {
							font-size: 13px;
							font-weight: 700;
							color: var(--text-color-kumo-default);
						}
						.nicole-color-helper {
							margin-top: 8px;
							padding: 10px 12px;
							border-radius: 8px;
							background: var(--color-kumo-tint);
							border: 1px solid var(--color-kumo-line);
							display: flex;
							flex-direction: column;
							gap: 8px;
						}
						.nicole-color-helper__row {
							display: flex;
							align-items: center;
							gap: 8px;
							flex-wrap: wrap;
						}
						.nicole-color-picker-label {
							display: inline-flex;
							align-items: center;
							gap: 8px;
							padding: 5px 12px;
							border-radius: 6px;
							background: var(--color-kumo-base);
							border: 1px solid var(--color-kumo-line);
							font-size: 12px;
							font-weight: 600;
							color: var(--text-color-kumo-default);
							cursor: pointer;
							transition: border-color 0.15s ease;
						}
						.nicole-color-picker-label:hover {
							border-color: var(--text-color-kumo-default);
						}
						.nicole-color-swatch-btn {
							display: inline-flex;
							align-items: center;
							gap: 6px;
							padding: 4px 9px;
							border-radius: 999px;
							font-size: 11px;
							font-weight: 600;
							background: var(--color-kumo-base);
							color: var(--text-color-kumo-default);
							border: 1px solid var(--color-kumo-line);
							cursor: pointer;
							transition: transform 0.12s ease, border-color 0.12s ease;
						}
						.nicole-color-swatch-btn:hover {
							transform: translateY(-1px);
							border-color: var(--text-color-kumo-default);
						}
						.nicole-color-swatch-dot {
							width: 12px;
							height: 12px;
							border-radius: 50%;
							border: 1px solid rgba(128,128,128,0.45);
							flex-shrink: 0;
						}
						.nicole-url-helper {
							display: flex;
							flex-wrap: wrap;
							gap: 6px;
							margin-top: 6px;
						}
						.nicole-url-chip {
							font-size: 11px;
							font-weight: 600;
							padding: 3px 9px;
							border-radius: 999px;
							background: var(--color-kumo-tint);
							color: var(--text-color-kumo-default);
							border: 1px solid var(--color-kumo-line);
							cursor: pointer;
							transition: background 0.15s ease, border-color 0.15s ease;
						}
						.nicole-url-chip:hover {
							border-color: var(--text-color-kumo-default);
							background: var(--color-kumo-elevated);
						}
						.nicole-bg-live-preview {
							margin-top: 12px;
							padding: 14px 16px;
							border-radius: 8px;
							border: 1px solid var(--color-kumo-line);
							display: flex;
							align-items: center;
							justify-content: space-between;
							gap: 12px;
							font-size: 12px;
							font-weight: 700;
							letter-spacing: 0.03em;
						}
						.nicole-bg-range-member {
							position: relative;
							border-left: 4px solid var(--nicole-band-color, #141418) !important;
							padding-left: 12px !important;
							margin-left: -12px !important;
							background: linear-gradient(90deg, rgba(128,128,128,0.06), transparent 85%);
							border-radius: 2px;
						}
						.nicole-move-btn {
							display: inline-flex;
							align-items: center;
							justify-content: center;
							width: 28px;
							height: 28px;
							border-radius: 6px;
							border: 1px solid var(--color-kumo-line);
							background: var(--color-kumo-base);
							color: var(--text-color-kumo-default);
							font-size: 12px;
							font-weight: 700;
							cursor: pointer;
							transition: background 0.15s ease, border-color 0.15s ease;
						}
						.nicole-move-btn:hover {
							background: var(--color-kumo-tint);
							border-color: var(--text-color-kumo-default);
						}
					\`;
					document.head.appendChild(style);
				}

				function setReactInputValue(inputEl, newValue) {
					if (!inputEl) return;
					const proto = inputEl.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
					const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
					if (nativeSetter) {
						nativeSetter.call(inputEl, newValue);
					} else {
						inputEl.value = newValue;
					}
					inputEl.dispatchEvent(new Event('input', { bubbles: true }));
					inputEl.dispatchEvent(new Event('change', { bubbles: true }));
				}

				function isDarkColorHex(hex) {
					const clean = String(hex || '').replace('#', '').trim();
					if (!/^[0-9a-fA-F]{3,6}$/.test(clean)) return true;
					const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
					const r = parseInt(full.slice(0, 2), 16) / 255;
					const g = parseInt(full.slice(2, 4), 16) / 255;
					const b = parseInt(full.slice(4, 6), 16) / 255;
					const toLinear = c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
					const lum = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
					return lum < 0.36;
				}

				function getBandVisual(data) {
					const c1 = String(data?.color || '#141418').trim() || '#141418';
					const c2 = String(data?.end_color || c1).trim();
					const gType = data?.gradient_type || data?.gradient_dir || 'vertical';
					const dirMap = {
						vertical: '縦グラデーション',
						diagonal: '斜めグラデーション',
						spotlight: '中央スポットライト',
						solid: '単色塗りつぶし'
					};
					const isGrad = c2 && c2.toLowerCase() !== c1.toLowerCase() && gType !== 'solid';
					let bgCss = c1;
					if (isGrad) {
						if (gType === 'diagonal') {
							bgCss = \`linear-gradient(135deg, \${c1} 0%, \${c2} 100%)\`;
						} else if (gType === 'spotlight') {
							bgCss = \`radial-gradient(circle at 50% 25%, \${c2} 0%, \${c1} 85%)\`;
						} else {
							bgCss = \`linear-gradient(180deg, \${c1} 0%, \${c2} 100%)\`;
						}
					}
					const summaryLabel = isGrad
						? \`\${c1} → \${c2}（\${dirMap[gType] || 'グラデーション'}）\`
						: \`\${c1}（単色背景）\`;

					const dark1 = isDarkColorHex(c1);
					const dark2 = isDarkColorHex(c2 || c1);
					const isDark = (dark1 && dark2) || dark1;
					const textColor = isDark ? '#ffffff' : '#111114';

					return {
						bgCss,
						summaryLabel,
						textColor,
						isDark,
						isGrad
					};
				}

				const NICOLE_COLOR_PRESETS = [
					{ label: 'ジェットブラック', hex: '#000000' },
					{ label: 'チャコールダーク', hex: '#141418' },
					{ label: 'ライトグレー', hex: '#f4f4f6' },
					{ label: 'ホワイト', hex: '#ffffff' },
					{ label: 'ディープネイビー', hex: '#0f172a' },
					{ label: 'ブリティッシュグリーン', hex: '#0b2922' },
					{ label: 'ディープレッド', hex: '#6b1116' },
				];

				function enhancePluginBlockModal() {
					injectEditorialBlockStyles();
					const modalScroll = document.querySelector('[role="dialog"] form .overflow-y-auto');
					if (!modalScroll) return;

					// 1. グループ見出しバーの付与
					let lastGroup = '';
					Array.from(modalScroll.children).forEach(fieldWrap => {
						const labelEl = fieldWrap.querySelector(':scope > label, :scope > span.font-medium, :scope > div > span.font-medium');
						if (!labelEl) return;

						const currentText = (labelEl.textContent || '').trim();
						const m = currentText.match(/^【([^】]+)】(.*)$/);
						if (m) {
							fieldWrap.dataset.nicoleGroup = m[1].trim();
							fieldWrap.dataset.nicoleCleanLabel = m[2].trim();
						}

						const groupName = fieldWrap.dataset.nicoleGroup;
						const cleanLabel = fieldWrap.dataset.nicoleCleanLabel;
						if (!groupName) return;

						if (cleanLabel && labelEl.childNodes.length > 0 && labelEl.childNodes[0].nodeType === Node.TEXT_NODE) {
							if (labelEl.childNodes[0].nodeValue !== cleanLabel) {
								labelEl.childNodes[0].nodeValue = cleanLabel;
							}
						} else if (cleanLabel && labelEl.textContent !== cleanLabel) {
							labelEl.textContent = cleanLabel;
						}
						labelEl.style.fontSize = '0.875rem';

						fieldWrap.setAttribute('data-nicole-group-member', groupName);
						if (groupName !== lastGroup) {
							fieldWrap.setAttribute('data-nicole-group-start', groupName);
							lastGroup = groupName;
						} else {
							fieldWrap.removeAttribute('data-nicole-group-start');
						}
					});

					// 2. リピーター（＋で追加できる項目）の初期展開とボタン日本語化
					const repeaterGroups = modalScroll.querySelectorAll('[role="group"]');
					repeaterGroups.forEach(group => {
						group.querySelectorAll('button').forEach(btn => {
							const txt = (btn.textContent || '').trim();
							if (txt.startsWith('Add ')) {
								btn.textContent = '＋ ' + txt.slice(4) + 'を追加';
							}
						});
						group.querySelectorAll('p').forEach(p => {
							if ((p.textContent || '').trim() === 'No items yet') {
								p.textContent = 'まだ項目がありません。下の「＋」ボタンから追加してください。';
							}
						});
						group.querySelectorAll('button[aria-expanded]').forEach(btn => {
							if (!btn.dataset.nicoleCollapseBound) {
								btn.dataset.nicoleCollapseBound = 'true';
								btn.addEventListener('click', (e) => {
									if (e.isTrusted) {
										// ユーザーが手動クリックで閉じた場合のみ記録
										const willCollapse = btn.getAttribute('aria-expanded') === 'true';
										btn.dataset.nicoleUserCollapsed = willCollapse ? 'true' : 'false';
									}
								});
							}
						});
					});

					// 3. カラーパレット＆スポイト（開始色・終了色）とURLワンクリック補助チップ
					let startColorInput = null;
					let endColorInput = null;
					const allLabels = modalScroll.querySelectorAll('label');
					allLabels.forEach(label => {
						const lText = (label.textContent || '').trim();
						const wrap = label.parentElement;
						if (!wrap) return;
						const input = wrap.querySelector('input[type="text"]');
						if (!input) return;

						const isStartColor = lText.includes('開始カラー') || lText.includes('開始色');
						const isEndColor = lText.includes('終了カラー') || lText.includes('終了色');
						const isCustomColor = lText.includes('カスタム色') || lText.includes('任意カラー');
						if (isStartColor) startColorInput = input;
						if (isEndColor) endColorInput = input;

						if ((isStartColor || isEndColor || isCustomColor) && !input.dataset.nicoleColorEnhanced) {
							input.dataset.nicoleColorEnhanced = 'true';
							const helper = document.createElement('div');
							helper.className = 'nicole-color-helper';

							const topRow = document.createElement('div');
							topRow.className = 'nicole-color-helper__row';

							const pickerLabel = document.createElement('label');
							pickerLabel.className = 'nicole-color-picker-label';
							const colorPicker = document.createElement('input');
							colorPicker.type = 'color';
							colorPicker.className = 'nicole-native-color-input';
							colorPicker.value = /^#[0-9a-fA-F]{6}$/.test(input.value.trim()) ? input.value.trim() : (isStartColor ? '#141418' : isCustomColor ? '#0066b1' : '#000000');
							colorPicker.style.cssText = 'width: 24px; height: 24px; padding: 0; border: none; background: transparent; cursor: pointer;';
							colorPicker.addEventListener('input', () => {
								setReactInputValue(input, colorPicker.value);
							});

							const pickerText = document.createElement('span');
							pickerText.textContent = '🎨 カラーパレット / スポイトで色を選ぶ';
							pickerLabel.appendChild(colorPicker);
							pickerLabel.appendChild(pickerText);
							topRow.appendChild(pickerLabel);

							if (isEndColor) {
								const clearBtn = document.createElement('button');
								clearBtn.type = 'button';
								clearBtn.className = 'nicole-color-swatch-btn';
								clearBtn.textContent = '開始色と同じにする（単色）';
								clearBtn.addEventListener('click', () => {
									const sv = (startColorInput && startColorInput.value ? startColorInput.value.trim() : '') || '#141418';
									colorPicker.value = /^#[0-9a-fA-F]{6}$/.test(sv) ? sv : '#141418';
									setReactInputValue(input, sv);
								});
								topRow.appendChild(clearBtn);
							}

							const presetRow = document.createElement('div');
							presetRow.className = 'nicole-color-helper__row';
							const presetTitle = document.createElement('span');
							presetTitle.textContent = '推奨カラー:';
							presetTitle.style.cssText = 'font-size: 11px; font-weight: 600; color: var(--text-color-kumo-subtle);';
							presetRow.appendChild(presetTitle);

							NICOLE_COLOR_PRESETS.forEach(preset => {
								const chip = document.createElement('button');
								chip.type = 'button';
								chip.className = 'nicole-color-swatch-btn';
								const dot = document.createElement('span');
								dot.className = 'nicole-color-swatch-dot';
								dot.style.background = preset.hex;
								const name = document.createElement('span');
								name.textContent = preset.label;
								chip.appendChild(dot);
								chip.appendChild(name);
								chip.addEventListener('click', () => {
									colorPicker.value = preset.hex;
									setReactInputValue(input, preset.hex);
								});
								presetRow.appendChild(chip);
							});

							helper.appendChild(topRow);
							helper.appendChild(presetRow);
							wrap.appendChild(helper);
						}

						// リンク先URLの注記・説明書き
						if ((lText.includes('リンクURL') || lText.includes('リンク先URL')) && !input.dataset.nicoleUrlEnhanced) {
							input.dataset.nicoleUrlEnhanced = 'true';
							// 以前のチップがあれば削除
							const oldHelper = wrap.querySelector('.nicole-url-helper');
							if (oldHelper) oldHelper.remove();

							const urlNote = document.createElement('div');
							urlNote.className = 'nicole-url-note';
							urlNote.style.cssText = 'margin-top: 6px; font-size: 11.5px; line-height: 1.5; color: var(--text-color-kumo-subtle, #a1a1aa); letter-spacing: 0.02em;';
							urlNote.textContent = '※他ページへのリンク（例: /locations や /contact）のほか、見出し末尾に [#○○] と入れた場所へ「#○○」で直接ジャンプできます。';
							wrap.appendChild(urlNote);
						}
					});

					// 4. 背景エリア開始モーダル内のリアルタイム・グラデーション＆文字色プレビューバー
					if (startColorInput) {
						let liveBar = modalScroll.querySelector('.nicole-bg-live-preview');
						if (!liveBar) {
							liveBar = document.createElement('div');
							liveBar.className = 'nicole-bg-live-preview';
							modalScroll.appendChild(liveBar);
						}
						const c1 = (startColorInput.value || '#141418').trim() || '#141418';
						const c2 = endColorInput ? (endColorInput.value || '').trim() : '';
						const gradSelect = modalScroll.querySelector('select');
						const gType = gradSelect ? gradSelect.value : 'vertical';
						const visual = getBandVisual({ color: c1, end_color: c2, gradient_type: gType });
						liveBar.style.background = visual.bgCss;
						liveBar.style.color = visual.textColor;
						liveBar.innerHTML = \`
							<span>背景プレビュー（\${visual.summaryLabel}）</span>
							<span style="font-size:11px; padding:3px 8px; border-radius:4px; background:\${visual.isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.08)'};">
								自動文字色：\${visual.isDark ? '白文字で表示' : '黒文字で表示'}
							</span>
						\`;
					}
				}

				function getPluginBlockFiberProps(blockEl) {
					if (!blockEl) return null;
					const rendererEl = blockEl.closest('.react-renderer') || blockEl.parentElement;

					// 1. ProseMirror の pmViewDesc / Tiptap ReactNodeView から直接取得（上下移動や段落追加の影響を一切受けない最優先ルート）
					let descHost = blockEl;
					while (descHost && !descHost.pmViewDesc && !descHost.classList?.contains('ProseMirror')) {
						descHost = descHost.parentElement;
					}
					const viewDesc = descHost?.pmViewDesc || rendererEl?.pmViewDesc || blockEl?.pmViewDesc;
					if (viewDesc) {
						const spec = viewDesc.spec;
						const pmNode = viewDesc.node || spec?.node || spec?.renderer?.props?.node;
						if (pmNode && pmNode.attrs && pmNode.attrs.blockType) {
							const result = {
								node: pmNode,
								editor: spec?.editor || spec?.renderer?.props?.editor,
								getPos: () => {
									try {
										if (typeof viewDesc.posBefore === 'number') return viewDesc.posBefore;
									} catch (_) {}
									return typeof spec?.getPos === 'function' ? spec.getPos() : spec?.renderer?.props?.getPos?.();
								}
							};
							// pmNode の attrs.data が空の場合のみ DOM属性からフォールバック
							if (!pmNode.attrs.data || Object.keys(pmNode.attrs.data).length === 0) {
								if (blockEl.dataset.nicoleBlockType) {
									try {
										result.node = {
											attrs: {
												...pmNode.attrs,
												data: JSON.parse(blockEl.dataset.nicoleBlockData || '{}')
											}
										};
									} catch (_) {}
								}
							}
							blockEl.__nicoleCachedBlock = result;
							if (rendererEl) rendererEl.__nicoleCachedBlock = result;
							return result;
						}
					}

					// 2. NodeViewWrapper の data-nicole-block-type / data-nicole-block-data 属性から直接取得
					if (blockEl.dataset.nicoleBlockType) {
						let parsedData = {};
						try {
							parsedData = JSON.parse(blockEl.dataset.nicoleBlockData || '{}');
						} catch (_) {}
						const fallbackEditor = blockEl.__nicoleCachedBlock?.editor || rendererEl?.__nicoleCachedBlock?.editor;
						const fallbackGetPos = blockEl.__nicoleCachedBlock?.getPos || rendererEl?.__nicoleCachedBlock?.getPos;
						const attrResult = {
							node: {
								attrs: {
									blockType: blockEl.dataset.nicoleBlockType,
									data: parsedData
								}
							},
							editor: fallbackEditor,
							getPos: fallbackGetPos
						};
						blockEl.__nicoleCachedBlock = attrResult;
						return attrResult;
					}

					// 3. React Fiber ツリーから探索（current と alternate の両方を走査）
					const targets = [blockEl, rendererEl].filter(Boolean);
					for (const el of targets) {
						const fiberKey = Object.keys(el).find(k => k.startsWith('__reactFiber$'));
						if (!fiberKey) continue;
						let curr = el[fiberKey];
						for (let i = 0; i < 20 && curr; i++) {
							const candidates = [curr.alternate?.memoizedProps, curr.memoizedProps, curr.pendingProps];
							for (const mp of candidates) {
								if (mp && mp.node && mp.node.attrs && mp.node.attrs.blockType) {
									blockEl.__nicoleCachedBlock = mp;
									if (rendererEl) rendererEl.__nicoleCachedBlock = mp;
									return mp;
								}
							}
							curr = curr.return || curr.alternate?.return;
						}
					}

					// 4. 一時的な再描画中は直前のキャッシュを返す（プレビュー消失を完全防止）
					return blockEl.__nicoleCachedBlock || rendererEl?.__nicoleCachedBlock || null;
				}

				function movePluginBlockInEditor(blockEl, dir) {
					try {
						const fiberProps = getPluginBlockFiberProps(blockEl);
						if (!fiberProps) return;
						const { editor, getPos } = fiberProps;
						if (!editor || typeof getPos !== 'function') return;
						const pos = getPos();
						if (typeof pos !== 'number') return;
						const { doc, tr } = editor.state;
						const $pos = doc.resolve(pos);
						const index = $pos.index(0);
						const targetIndex = index + dir;
						if (targetIndex < 0 || targetIndex >= doc.childCount) return;
						const currentNode = doc.child(index);
						const otherNode = doc.child(targetIndex);
						// 移動対象ブロック自身ではなく隣接ブロックを移動させることで、自身のNodeViewとプレビュー状態を維持する
						if (dir === -1) {
							const prevPos = pos - otherNode.nodeSize;
							tr.delete(prevPos, pos);
							tr.insert(pos + currentNode.nodeSize - otherNode.nodeSize, otherNode);
						} else {
							const nextPos = pos + currentNode.nodeSize;
							tr.delete(nextPos, nextPos + otherNode.nodeSize);
							tr.insert(pos, otherNode);
						}
						editor.view.dispatch(tr.scrollIntoView());
						enhanceEditorPluginBlocks();
						requestAnimationFrame(() => enhanceEditorPluginBlocks());
					} catch (e) {
						console.error('[patch-admin-ui] Failed to move block:', e);
					}
				}

				function enhanceEditorPluginBlocks() {
					injectEditorialBlockStyles();

					// エディタ画面内に迷い込んだ一覧用フィルターバーがあれば無条件で完全消去
					const strayMagFilter = document.getElementById('magazine-filter-bar');
					if (strayMagFilter) strayMagFilter.remove();
					const strayCampFilter = document.getElementById('campaign-brand-filter-bar');
					if (strayCampFilter) strayCampFilter.remove();

					const blocks = document.querySelectorAll('.plugin-block');
					blocks.forEach(blockEl => { try {
						const card = blockEl.querySelector('.rounded-lg.border');
						if (!card) return;

						const fiberProps = getPluginBlockFiberProps(blockEl);
						const attrs = fiberProps?.node?.attrs || {};
						const blockType = String(attrs.blockType || '');
						const data = attrs.data || {};

						// blockType が取得できない場合は既存のプレビューを絶対に消さずにスキップ
						if (!blockType) return;

						// 上下移動ボタン（↑ / ↓）の追加
						const actionBar = card.querySelector('.flex.items-center.gap-1');
						if (actionBar && !actionBar.querySelector('.nicole-move-btn')) {
							const upBtn = document.createElement('button');
							upBtn.type = 'button';
							upBtn.className = 'nicole-move-btn';
							upBtn.title = 'このブロックを1つ上へ移動';
							upBtn.textContent = '↑';
							upBtn.addEventListener('click', (e) => {
								e.preventDefault();
								e.stopPropagation();
								movePluginBlockInEditor(blockEl, -1);
							});

							const downBtn = document.createElement('button');
							downBtn.type = 'button';
							downBtn.className = 'nicole-move-btn';
							downBtn.title = 'このブロックを1つ下へ移動';
							downBtn.textContent = '↓';
							downBtn.addEventListener('click', (e) => {
								e.preventDefault();
								e.stopPropagation();
								movePluginBlockInEditor(blockEl, 1);
							});

							actionBar.insertBefore(downBtn, actionBar.firstChild);
							actionBar.insertBefore(upBtn, actionBar.firstChild);
						}

						let precedingStart = '';
						let precedingStartData = null;
						let ctaPreviewStyles = null;
						if (blockType.endsWith('bg_band_end')) {
							for (const el of blocks) {
								if (el === blockEl) break;
								const fp = getPluginBlockFiberProps(el);
								const t = String(fp?.node?.attrs?.blockType || el.dataset.nicoleBlockType || '');
								if (t.endsWith('bg_band_start')) {
									let d = fp?.node?.attrs?.data;
									if (!d || Object.keys(d).length === 0) {
										try { d = JSON.parse(el.dataset.nicoleBlockData || '{}'); } catch (_) {}
									}
									precedingStartData = d || {};
									precedingStart = JSON.stringify(precedingStartData);
								} else if (t.endsWith('bg_band_end')) {
									precedingStart = '';
									precedingStartData = null;
								}
							}
						}
						const stateFingerprint = JSON.stringify({ blockType, data, precedingStart });
						if (card.dataset.nicoleLastSummary === stateFingerprint && card.querySelector('.nicole-block-preview')) {
							return;
						}

						const images = [];
						const badges = [];
						const texts = [];
						const items = Array.isArray(data.items) ? data.items : [];

						if (blockType.endsWith('bg_band_start')) {
							const visual = getBandVisual(data);
							const oldPreview = card.querySelector('.nicole-block-preview');
							if (oldPreview) oldPreview.remove();
							card.dataset.nicoleLastSummary = stateFingerprint;

							const preview = document.createElement('div');
							preview.className = 'nicole-block-preview';
							preview.style.background = visual.bgCss;
							preview.style.color = visual.textColor;
							preview.innerHTML = \`
								<div style="display:flex;align-items:center;justify-content:space-between;font-size:12px;font-weight:700;">
									<span>▼ ここから下の見出し・文章・ブロックに背景色を適用（\${visual.summaryLabel}）</span>
									<span style="font-size:11px;opacity:0.85;">クリックして色を変更</span>
								</div>
							\`;
							preview.addEventListener('click', () => {
								const editBtn = card.querySelectorAll('button:not(.nicole-move-btn)');
								if (editBtn.length >= 2) editBtn[editBtn.length - 2].click();
							});
							card.appendChild(preview);
							return;
						}

						if (blockType.endsWith('bg_band_end')) {
							const oldPreview = card.querySelector('.nicole-block-preview');
							if (oldPreview) oldPreview.remove();
							card.dataset.nicoleLastSummary = stateFingerprint;

							const preview = document.createElement('div');
							preview.className = 'nicole-block-preview';

							if (precedingStartData && (precedingStartData.color || precedingStartData.end_color)) {
								const visual = getBandVisual(precedingStartData);
								preview.style.background = visual.bgCss;
								preview.style.color = visual.textColor;
								preview.innerHTML = \`
									<div style="display:flex;align-items:center;justify-content:space-between;font-size:12px;font-weight:700;">
										<span>▲ ここまでで背景色エリアを終了（\${visual.summaryLabel}）</span>
										<span style="font-size:11px;opacity:0.85;">クリックして色を変更</span>
									</div>
								\`;
								preview.addEventListener('click', () => {
									const editBtn = card.querySelectorAll('button:not(.nicole-move-btn)');
									if (editBtn.length >= 2) editBtn[editBtn.length - 2].click();
								});
							} else {
								preview.style.background = 'transparent';
								preview.style.color = 'var(--text-color-kumo-subtle)';
								preview.innerHTML = \`
									<div style="display:flex;align-items:center;justify-content:space-between;font-size:12px;color:var(--text-color-kumo-subtle);font-weight:600;">
										<span>▲ ここまでで背景色エリアを終了し、通常の背景に戻します</span>
									</div>
								\`;
							}
							card.appendChild(preview);
							return;
						}

						if (blockType.endsWith('column_cards')) {
							const colLabel = data.columns === '2' ? '2列固定' : data.columns === '3' ? '3列固定' : data.columns === '4' ? '4列固定' : '1〜4列自動レイアウト';
							const styleLabel = data.card_style === 'flat' ? '枠なしフラット' : data.card_style === 'step' ? '番号ステップ（01, 02...）' : 'ボックス枠あり';
							badges.push(colLabel, styleLabel, \`計 \${items.length} 枚\`);
							items.forEach((it, idx) => {
								if (it.image && typeof it.image === 'string') images.push(it.image);
								const title = (it.title || '').trim();
								const body = (it.text || it.body || '').trim();
								if (title || body) texts.push(\`[\${idx + 1}] \${title}\${title && body ? ' — ' : ''}\${body}\`);
							});
						} else if (blockType.endsWith('split_media')) {
							const pos = data.image_position || data.direction || 'zigzag';
							const ratio = data.media_ratio || data.ratio || '50-50';
							const dirLabel = pos === 'left' ? 'すべて左に写真' : pos === 'right' ? 'すべて右に写真' : '左右交互（ジグザグ配置）';
							const ratioLabel = \`比率 \${ratio.replace('-', ':')}\`;
							badges.push(dirLabel, ratioLabel, \`計 \${items.length || 1} 段\`);
							items.forEach((it, idx) => {
								if (it.image && typeof it.image === 'string') images.push(it.image);
								const title = (it.title || '').trim();
								const body = (it.text || it.body || '').trim();
								if (title || body) texts.push(\`[\${idx + 1}] \${title}\${title && body ? ' — ' : ''}\${body}\`);
							});
						} else if (blockType.endsWith('slider')) {
							badges.push(data.gallery_style === 'grid' ? 'グリッド一覧' : 'フィルムストリップ', \`計 \${items.length} 枚\`);
							items.forEach((it, idx) => {
								if (it.image && typeof it.image === 'string') images.push(it.image);
								if (it.caption) texts.push(\`[\${idx + 1}] \${it.caption}\`);
							});
						} else if (blockType.endsWith('faq')) {
							badges.push(data.style === 'simple' ? 'シンプル開閉（スペック等）' : 'Q&A形式', \`計 \${items.length} 項目\`);
							items.forEach((it, idx) => {
								if (it.question) texts.push(\`Q\${idx + 1}. \${it.question}\`);
							});
						} else if (blockType.endsWith('notes')) {
							badges.push('注釈エリア（文字小・免責事項）');
							const noteContent = data.content || data.items || '';
							if (noteContent) texts.push(...String(noteContent).split('\\n').filter(Boolean));
						} else if (blockType.endsWith('cta')) {
							const alignLabel = data.align === 'left' ? '左寄せ' : data.align === 'right' ? '右寄せ' : data.align === 'full' ? '幅いっぱい' : '中央揃え';
							const curStyle = data.style || 'secondary';
							let styleLabel = 'シックブラック';
							let dotColor = '#141418';
							let previewBg = '#141418';
							let previewTextColor = '#ffffff';
							let previewBorder = '1px solid rgba(255,255,255,0.25)';

							if (curStyle === 'primary') {
								styleLabel = 'アクセントレッド';
								dotColor = '#e52d27';
								previewBg = '#e52d27';
								previewBorder = '1px solid #e52d27';
							} else if (curStyle === 'blue') {
								styleLabel = 'ブランドブルー';
								dotColor = '#0066b1';
								previewBg = '#0066b1';
								previewBorder = '1px solid #0066b1';
							} else if (curStyle === 'white') {
								styleLabel = 'ピュアホワイト';
								dotColor = '#ffffff';
								previewBg = '#ffffff';
								previewTextColor = '#111111';
								previewBorder = '1px solid #cccccc';
							} else if (curStyle === 'outline') {
								styleLabel = 'アウトライン';
								dotColor = '#888888';
								previewBg = 'transparent';
								previewBorder = '1px solid rgba(255,255,255,0.4)';
							} else if (curStyle === 'custom') {
								const hex = data.custom_color || '#333333';
								styleLabel = \`任意カラー (\${hex})\`;
								dotColor = hex;
								previewBg = hex;
								previewBorder = \`1px solid \${hex}\`;
							}

							ctaPreviewStyles = {
								bg: previewBg,
								color: previewTextColor,
								border: previewBorder,
								label: data.label || '詳細はこちら',
								shape: data.shape || 'pill',
								align: data.align || 'center'
							};

							badges.push('CTAボタン', alignLabel, \`● \${styleLabel}\`);
							if (data.label) texts.push(\`ボタン文字: \${data.label}\`);
							if (data.url) texts.push(\`リンク先: \${data.url}\`);
							if (data.lead_text) texts.push(\`リード文: \${data.lead_text}\`);
							if (data.subtitle) texts.push(\`注記: \${data.subtitle}\`);
						} else if (blockType.endsWith('table')) {
							const rawCsv = String(data.raw_csv || data.csv || data.tsv || '').trim();
							let headers = Array.isArray(data.headers) ? data.headers : [];
							let rows = Array.isArray(data.rows) ? data.rows : [];

							if (rawCsv) {
								const lines = rawCsv.split(String.fromCharCode(10)).map(l => l.trim()).filter(Boolean);
								if (lines.length > 0) {
									const delim = lines[0].includes(String.fromCharCode(9)) ? String.fromCharCode(9) : ',';
									headers = lines[0].split(delim).map(s => s.trim());
									rows = lines.slice(1).map(l => ({
										cells: l.split(delim).map(s => ({ text: s.trim() }))
									}));
								}
							}

							badges.push('スペック比較表（コピペ対応）', \`全 \${rows.length} 行 / \${headers.length} 列\`);
							if (data.title) texts.push(\`表題: \${data.title}\`);
							if (headers.length > 0) texts.push(\`列: \${headers.join(' ｜ ')}\`);
							rows.slice(0, 4).forEach((r, idx) => {
								const firstCell = r.cells?.[0]?.text || '';
								if (firstCell) texts.push(\`[\${idx + 1}] \${firstCell}\`);
							});
							if (data.caption) texts.push(\`注記: \${data.caption}\`);
						}

						if (images.length === 0 && badges.length === 0 && texts.length === 0) return;

						const oldPreview = card.querySelector('.nicole-block-preview');
						if (oldPreview) oldPreview.remove();
						card.dataset.nicoleLastSummary = stateFingerprint;

						const preview = document.createElement('div');
						preview.className = 'nicole-block-preview';
						preview.title = 'クリックしてこのブロックを編集';

						if (badges.length > 0) {
							const bWrap = document.createElement('div');
							bWrap.className = 'nicole-block-preview__badges';
							badges.forEach(b => {
								const span = document.createElement('span');
								span.className = 'nicole-block-preview__badge';
								span.textContent = b;
								bWrap.appendChild(span);
							});
							preview.appendChild(bWrap);
						}

						if (ctaPreviewStyles) {
							const ctaBtn = document.createElement('div');
							ctaBtn.style.cssText = \`
								display: inline-flex;
								align-items: center;
								gap: 6px;
								padding: 5px 14px;
								font-size: 12px;
								font-weight: 700;
								border-radius: \${ctaPreviewStyles.shape === 'rounded' ? '6px' : '9999px'};
								background: \${ctaPreviewStyles.bg};
								color: \${ctaPreviewStyles.color};
								border: \${ctaPreviewStyles.border};
								box-shadow: 0 2px 6px rgba(0,0,0,0.2);
								margin-top: 6px;
								margin-bottom: 4px;
								width: fit-content;
							\`;
							ctaBtn.innerHTML = \`<span>\${ctaPreviewStyles.label}</span><span style="font-size:11px;">→</span>\`;
							preview.appendChild(ctaBtn);
						}

						if (images.length > 0) {
							const tWrap = document.createElement('div');
							tWrap.className = 'nicole-block-preview__thumbs';
							images.slice(0, 8).forEach(src => {
								const img = document.createElement('img');
								img.className = 'nicole-block-preview__thumb';
								img.src = src;
								img.alt = '';
								img.loading = 'lazy';
								tWrap.appendChild(img);
							});
							preview.appendChild(tWrap);
						}

						if (texts.length > 0) {
							const txWrap = document.createElement('div');
							txWrap.className = 'nicole-block-preview__texts';
							texts.slice(0, 4).forEach(t => {
								const line = document.createElement('div');
								line.textContent = '・' + (t.length > 62 ? t.slice(0, 62) + '…' : t);
								txWrap.appendChild(line);
							});
							preview.appendChild(txWrap);
						}

						preview.addEventListener('click', (e) => {
							e.preventDefault();
							const btns = card.querySelectorAll('button:not(.nicole-move-btn)');
							if (btns.length >= 2) {
								const editBtn = btns[btns.length - 2];
								if (editBtn) editBtn.click();
							} else if (btns.length === 1) {
								btns[0].click();
							}
						});

						card.appendChild(preview);
					} catch (err) { console.error('[patch-admin-ui] block enhance failed:', err); } });

					// エディタキャンバス上で「背景エリア開始」〜「背景エリア終了」に挟まれた全要素を左ラインでハイライト
					// ※ProseMirrorのDOMObserverが段落編集と競合しないよう、実際に変更が必要な時のみ属性を更新する
					const proseMirror = document.querySelector('.ProseMirror');
					if (false && proseMirror) {
						let currentBandColor = null;
						Array.from(proseMirror.children).forEach(child => {
							const pBlock = child.classList.contains('plugin-block') ? child : child.querySelector('.plugin-block');
							if (pBlock) {
								const fp = getPluginBlockFiberProps(pBlock);
								const bType = String(fp?.node?.attrs?.blockType || '');
								if (bType.endsWith('bg_band_start')) {
									currentBandColor = fp?.node?.attrs?.data?.color || '#141418';
									if (child.dataset.nicoleBandColor !== currentBandColor) {
										child.dataset.nicoleBandColor = currentBandColor;
										child.classList.add('nicole-bg-range-member');
										child.style.setProperty('--nicole-band-color', currentBandColor);
									}
									return;
								}
								if (bType.endsWith('bg_band_end')) {
									const endColor = currentBandColor || '#141418';
									if (child.dataset.nicoleBandColor !== endColor) {
										child.dataset.nicoleBandColor = endColor;
										child.classList.add('nicole-bg-range-member');
										child.style.setProperty('--nicole-band-color', endColor);
									}
									currentBandColor = null;
									return;
								}
							}
							if (currentBandColor) {
								if (child.dataset.nicoleBandColor !== currentBandColor) {
									child.dataset.nicoleBandColor = currentBandColor;
									child.classList.add('nicole-bg-range-member');
									child.style.setProperty('--nicole-band-color', currentBandColor);
								}
							} else if (child.dataset.nicoleBandColor) {
								delete child.dataset.nicoleBandColor;
								child.classList.remove('nicole-bg-range-member');
								child.style.removeProperty('--nicole-band-color');
							}
						});
					}
				}

				// 定期実行とイベント監視でSPA遷移に完全追従
				setInterval(() => {
					try { if (checkLocalAutoLogin()) return; } catch(e){}
					try { applyAccordion(); } catch(e){}
					try { applyCampaignBrandFilterTabs(); } catch(e){}
					try { applyMagazineFilterTabs(); } catch(e){}
					try { enhancePluginBlockModal(); } catch(e){}
					try { enhanceEditorPluginBlocks(); } catch(e){}
				}, 350);
				window.addEventListener('popstate', () => {
					setTimeout(() => {
						try { applyAccordion(); } catch(e){}
						try { applyCampaignBrandFilterTabs(); } catch(e){}
						try { applyMagazineFilterTabs(); } catch(e){}
					}, 100);
				});
			})();
		</script>
`;

const bodyCloseIdx = content.lastIndexOf('</body>');
if (bodyCloseIdx !== -1) {
  content = content.slice(0, bodyCloseIdx) + injectedCode + '\n' + content.slice(bodyCloseIdx);
  fs.writeFileSync(adminAstroPath, content, 'utf8');
  console.log('[patch-admin-ui] Successfully injected clean Accordion UI + Badges Selector into admin.astro.');
} else {
  console.error('[patch-admin-ui] Could not find </body> in admin.astro.');
}

// @emdash-cms/admin バンドルおよび Vite 事前バンドルキャッシュのパッチ
// 1. PluginBlockNodeView に data-nicole-block-type / data-nicole-block-data 属性を直接出力させる
// 2. BlockKitRepeater の各項目を初期状態で常時展開（手動で閉じた項目のみ折りたたむ）にする
const bundleCandidates = [
  path.join(__dirname, '..', 'node_modules', '@emdash-cms', 'admin', 'dist', 'index.js'),
];
const viteDepsDir = path.join(__dirname, '..', 'node_modules', '.vite', 'deps');
if (fs.existsSync(viteDepsDir)) {
  for (const file of fs.readdirSync(viteDepsDir)) {
    if (file.startsWith('dist-') && file.endsWith('.js')) {
      bundleCandidates.push(path.join(viteDepsDir, file));
    }
  }
}

for (const bundlePath of bundleCandidates) {
  if (!fs.existsSync(bundlePath)) continue;
  let js = fs.readFileSync(bundlePath, 'utf8');
  let modified = false;

  // 1. PluginBlockNodeView: data-nicole-block-type / data-nicole-block-data の付与
  const nodeViewTarget = 'className: "plugin-block relative my-4",\n\t\tcontentEditable: false,\n\t\t"data-drag-handle": true,';
  const nodeViewReplacement = 'className: "plugin-block relative my-4",\n\t\tcontentEditable: false,\n\t\t"data-drag-handle": true,\n\t\t"data-nicole-block-type": blockType,\n\t\t"data-nicole-block-data": JSON.stringify(data),';
  if (!js.includes('"data-nicole-block-type": blockType') && js.includes(nodeViewTarget)) {
    js = js.replace(nodeViewTarget, nodeViewReplacement);
    modified = true;
  }

  // 2. BlockKitRepeater: すべての項目をデフォルトで展開状態に保つ（expanded Set を「手動で閉じたキー」として扱う）
  const repeaterAddTarget = 'setExpanded((prev) => {\n\t\t\tconst next = new Set(prev);\n\t\t\tnext.add(newItem._key);\n\t\t\treturn next;\n\t\t});';
  const repeaterAddReplacement = 'setExpanded((prev) => {\n\t\t\tconst next = new Set(prev);\n\t\t\tnext.delete(newItem._key);\n\t\t\treturn next;\n\t\t});';
  if (js.includes(repeaterAddTarget)) {
    js = js.replace(repeaterAddTarget, repeaterAddReplacement);
    modified = true;
  }

  const repeaterCollapseTarget = 'isCollapsed: !expanded.has(item._key),';
  const repeaterCollapseReplacement = 'isCollapsed: expanded.has(item._key),';
  if (js.includes(repeaterCollapseTarget)) {
    js = js.replace(repeaterCollapseTarget, repeaterCollapseReplacement);
    modified = true;
  }

  // 3. portableTextToProsemirror: table がプラグインブロックまたはカスタムデータ（raw_csv/headers）を持つ場合、convertCustomBlock にルーティングする
  const tableTarget = 'case "table": {\n\t\t\tconst result = portableTextTableToProseMirror(block, {';
  const tableReplacement = 'case "table": {\n\t\t\tif (pluginTypes.has("table") || pluginTypes.has("editorial-tools:table") || block.raw_csv || Array.isArray(block.headers)) return convertCustomBlock(block);\n\t\t\tconst result = portableTextTableToProseMirror(block, {';
  if (!js.includes('pluginTypes.has("table")') && js.includes(tableTarget)) {
    js = js.replace(tableTarget, tableReplacement);
    modified = true;
  }

  // 4. 段落変換メニューへの「注釈」追加パッチ
  // 4-1. textBlockTypes に "note" を追加
  if (!js.includes('id: "note"')) {
    const target = '{\n\t\tid: "codeBlock",\n\t\tlabel: {\n\t\t\tid: "N2eHWq",\n\t\t\tmessage: "Code Block"\n\t\t},\n\t\ticon: CodeBlock,\n\t\tmarkdown: "```",\n\t\tisActive: (editor) => editor.isActive("codeBlock"),\n\t\ttransform: (editor) => turnInto(editor, "codeBlock")\n\t}\n];';
    const repl = '{\n\t\tid: "codeBlock",\n\t\tlabel: {\n\t\t\tid: "N2eHWq",\n\t\t\tmessage: "Code Block"\n\t\t},\n\t\ticon: CodeBlock,\n\t\tmarkdown: "```",\n\t\tisActive: (editor) => editor.isActive("codeBlock"),\n\t\ttransform: (editor) => turnInto(editor, "codeBlock")\n\t},\n\t{\n\t\tid: "note",\n\t\tlabel: {\n\t\t\tid: "custom_note_item",\n\t\t\tmessage: "注釈"\n\t\t},\n\t\ticon: TextT,\n\t\tisActive: (editor) => editor.isActive("paragraph", { ptStyle: "note" }),\n\t\ttransform: (editor) => turnInto(editor, "note")\n\t}\n];';
    if (js.includes(target)) {
      js = js.replace(target, repl);
      modified = true;
    }
  }

  // 4-2. ACTIVE_ORDER に "note" を追加
  if (js.includes('"paragraph"\n];') && !js.includes('"note",\n\t"paragraph"\n];')) {
    js = js.replace('"paragraph"\n];', '"note",\n\t"paragraph"\n];');
    modified = true;
  }

  // 4-3. convertTextBlocks に "note" ハンドリングを追加
  if (!js.includes('else if (id === "note") setTextBlockType')) {
    const target = 'else if (id === "paragraph") setTextBlockType(tr, from, to, schema.nodes.paragraph);';
    const repl = 'else if (id === "note") setTextBlockType(tr, from, to, schema.nodes.paragraph, { ptStyle: "note" });\n\t\telse if (id === "paragraph") setTextBlockType(tr, from, to, schema.nodes.paragraph, { ptStyle: null });';
    if (js.includes(target)) {
      js = js.replace(target, repl);
      modified = true;
    }
  }

  // 4-4. PortableTextIdentityExtension に ptStyle 属性を追加
  if (!js.includes('ptStyle: {')) {
    const target = 'attributes: { [PORTABLE_TEXT_KEY_ATTR]: hiddenAttribute }';
    const repl = 'attributes: {\n\t\t\t\t[PORTABLE_TEXT_KEY_ATTR]: hiddenAttribute,\n\t\t\t\tptStyle: {\n\t\t\t\t\tdefault: null,\n\t\t\t\t\tparseHTML: (el) => el.getAttribute("data-pt-style") || (el.classList?.contains("is-note") ? "note" : null),\n\t\t\t\t\trenderHTML: (attrs) => attrs.ptStyle ? { "data-pt-style": attrs.ptStyle, class: attrs.ptStyle === "note" ? "is-note" : void 0 } : {}\n\t\t\t\t}\n\t\t\t}';
    if (js.includes(target)) {
      js = js.replace(target, repl);
      modified = true;
    }
  }

  // 4-5. convertPMNode で ptStyle を style: "note" として出力
  if (!js.includes('const pStyle = node.attrs?.ptStyle === "note" ? "note" : "normal";')) {
    const target = '\t\t\treturn {\n\t\t\t\t_type: "block",\n\t\t\t\t_key: portableTextKeyFromAttrs(node.attrs) ?? generateKey(),\n\t\t\t\tstyle: "normal",';
    const repl = '\t\t\tconst pStyle = node.attrs?.ptStyle === "note" ? "note" : "normal";\n\t\t\treturn {\n\t\t\t\t_type: "block",\n\t\t\t\t_key: portableTextKeyFromAttrs(node.attrs) ?? generateKey(),\n\t\t\t\tstyle: pStyle,';
    if (js.includes(target)) {
      js = js.replace(target, repl);
      modified = true;
    }
  }

  // 4-6. convertPTBlock で style === "note" を ptStyle: "note" として読込
  if (!js.includes('case "note": return {')) {
    const target = '\t\t\t\tcase "blockquote": return {\n\t\t\t\t\ttype: "blockquote",';
    const repl = '\t\t\t\tcase "note": return {\n\t\t\t\t\ttype: "paragraph",\n\t\t\t\t\tattrs: attrsWithPortableTextKey({\n\t\t\t\t\t\tptStyle: "note",\n\t\t\t\t\t\t...textAlign ? { textAlign } : {}\n\t\t\t\t\t}, block._key),\n\t\t\t\t\tcontent: pmContent.length > 0 ? pmContent : void 0\n\t\t\t\t};\n\t\t\t\tcase "blockquote": return {\n\t\t\t\t\ttype: "blockquote",';
    if (js.includes(target)) {
      js = js.replace(target, repl);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(bundlePath, js, 'utf8');
    console.log('[patch-admin-ui] Patched admin bundle:', path.relative(path.join(__dirname, '..'), bundlePath));
  }
}

// Also apply repeater blocks accordion patch
try { require("./patch-repeater-blocks.cjs"); } catch (e) { console.error("[patch-admin-ui] Failed to run patch-repeater-blocks.cjs", e); }
