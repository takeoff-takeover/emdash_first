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
						desc: '新車窓口見出し、店舗名称、直通電話、FAX、営業時間、定休日、展示案内、予約ボタン'
					},
					{
						id: 'sec-used',
						prefix: '【中古車窓口】',
						title: '認定中古車窓口',
						desc: '中古車窓口見出し、店舗名称、直通電話、FAX、営業時間、定休日、在庫案内、在庫ボタン'
					},
					{
						id: 'sec-service',
						prefix: '【サービス窓口】',
						title: 'サービス窓口',
						desc: 'サービス窓口見出し、店舗名称、直通電話、FAX、営業時間、定休日、整備案内、予約ボタン'
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

					const allLabels = Array.from(document.querySelectorAll('label, p, span, div'));
					const badgesLabelEl = allLabels.find(el =>
						el.textContent && (
							el.textContent.includes('取扱サービス') ||
							el.textContent.includes('badges')
						)
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
							background: #141517;
							border: 1px solid #27272a;
							border-radius: 8px;
							display: flex;
							flex-direction: column;
							gap: 12px;
						\`;

						input.style.display = 'none'; // テキストボックスは隠してセレクターで操作

						const guideText = document.createElement('div');
						guideText.style.cssText = 'font-size: 12px; color: #a1a1aa; margin-bottom: 2px;';
						guideText.textContent = '※該当する項目をクリックしてください（複数選択可。白背景が選択中）';
						selectorWrap.appendChild(guideText);

						// グループごとにピルを描画
						BADGE_GROUPS.forEach(grp => {
							const groupRow = document.createElement('div');
							groupRow.style.cssText = 'display: flex; flex-direction: column; gap: 6px;';

							const groupTitle = document.createElement('div');
							groupTitle.textContent = grp.group;
							groupTitle.style.cssText = 'font-size: 11px; font-weight: 700; color: #71717a; letter-spacing: 0.05em; text-transform: uppercase;';
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
									border: 1px solid #3f3f46;
									background: #18181b;
									color: #a1a1aa;
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
							btn.style.background = '#ffffff';
							btn.style.borderColor = '#ffffff';
							btn.style.color = '#000000';
							btn.style.fontWeight = '700';
						} else {
							btn.style.background = '#18181b';
							btn.style.borderColor = '#3f3f46';
							btn.style.color = '#a1a1aa';
							btn.style.fontWeight = '500';
						}
					});
				}

				function applyAccordion() {
					// 画面内にプレフィックスが存在するか判定
					const allElements = Array.from(document.querySelectorAll('label, p, span, h3, h4'));
					const hasLocationsField = allElements.some(el =>
						el.textContent && (
							el.textContent.includes('【基本情報】') ||
							el.textContent.includes('【新車窓口】') ||
							el.textContent.includes('【写真ギャラリー】')
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

					// 各プレフィックスに該当するフィールドラッパー要素をグループ化
					const sectionElements = {};
					SECTION_CONFIG.forEach(sec => { sectionElements[sec.id] = []; });

					allElements.forEach(el => {
						if (el.children.length > 0 || !el.textContent) return;
						const text = el.textContent;
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
									sectionElements[sec.id].push(container);
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
							background: #141517;
							border: 1px solid #27272a;
							border-radius: 8px;
							gap: 12px;
						\`;

						const infoText = document.createElement('span');
						infoText.style.cssText = 'font-size: 13px; color: #a1a1aa; font-weight: 500;';
						infoText.innerHTML = '<span style="color: #ffffff; font-weight: 700;">拠点詳細設定</span>（クリックで各セクションを開閉できます）';

						const btnGroup = document.createElement('div');
						btnGroup.style.cssText = 'display: flex; gap: 8px;';

						const expandAllBtn = document.createElement('button');
						expandAllBtn.type = 'button';
						expandAllBtn.textContent = 'すべて開く';
						expandAllBtn.style.cssText = \`
							padding: 5px 12px;
							font-size: 12px;
							font-weight: 600;
							color: #ffffff;
							background: #27272a;
							border: 1px solid #3f3f46;
							border-radius: 4px;
							cursor: pointer;
							transition: background 0.15s ease;
						\`;
						expandAllBtn.onmouseenter = () => { expandAllBtn.style.background = '#3f3f46'; };
						expandAllBtn.onmouseleave = () => { expandAllBtn.style.background = '#27272a'; };
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
							color: #a1a1aa;
							background: transparent;
							border: 1px solid #3f3f46;
							border-radius: 4px;
							cursor: pointer;
							transition: all 0.15s ease;
						\`;
						collapseAllBtn.onmouseenter = () => {
							collapseAllBtn.style.background = '#27272a';
							collapseAllBtn.style.color = '#ffffff';
						};
						collapseAllBtn.onmouseleave = () => {
							collapseAllBtn.style.background = 'transparent';
							collapseAllBtn.style.color = '#a1a1aa';
						};
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
							header.style.cssText = \`
								margin-top: 18px;
								margin-bottom: 12px;
								padding: 12px 18px;
								background: #18181b;
								border: 1px solid #27272a;
								border-left: 4px solid #ffffff;
								border-radius: 6px;
								cursor: pointer;
								display: flex;
								align-items: center;
								justify-content: space-between;
								user-select: none;
								transition: background 0.15s ease, border-color 0.15s ease;
							\`;

							header.onmouseenter = () => { header.style.background = '#222327'; };
							header.onmouseleave = () => { header.style.background = '#18181b'; };

							header.onclick = (e) => {
								e.preventDefault();
								openState[sec.id] = !openState[sec.id];
								updateAccordionVisibility(sectionElements);
							};

							const leftDiv = document.createElement('div');
							leftDiv.style.cssText = 'flex: 1;';

							const h3 = document.createElement('div');
							h3.className = 'acc-title-text';
							h3.style.cssText = 'font-size: 15px; font-weight: 700; color: #ffffff; letter-spacing: 0.02em; display: flex; align-items: center; gap: 8px;';

							const p = document.createElement('div');
							p.className = 'acc-desc-text';
							p.textContent = sec.desc;
							p.style.cssText = 'margin: 4px 0 0 0; font-size: 12px; color: #a1a1aa; line-height: 1.4;';

							leftDiv.appendChild(h3);
							leftDiv.appendChild(p);

							const rightDiv = document.createElement('div');
							rightDiv.style.cssText = 'display: flex; align-items: center; gap: 10px; margin-left: 14px;';

							const countBadge = document.createElement('span');
							countBadge.className = 'acc-badge';
							countBadge.textContent = \`\${fields.length}項目\`;
							countBadge.style.cssText = 'font-size: 11px; background: #27272a; color: #d4d4d8; padding: 2px 8px; border-radius: 9999px; border: 1px solid #3f3f46;';

							const arrow = document.createElement('span');
							arrow.className = 'acc-arrow';
							arrow.style.cssText = 'font-size: 12px; font-weight: 600; color: #ffffff; transition: transform 0.2s ease;';

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
							const arrow = header.querySelector('.acc-arrow');
							if (arrow) {
								arrow.textContent = isOpen ? '▲ 閉じる' : '▼ 開く';
							}
							header.style.borderLeftColor = isOpen ? '#ffffff' : '#52525b';
							header.style.background = isOpen ? '#1c1d21' : '#18181b';
						}

						fields.forEach(fieldEl => {
							fieldEl.style.display = isOpen ? '' : 'none';
							if (isOpen) {
								fieldEl.style.paddingLeft = '10px';
								fieldEl.style.borderLeft = '2px solid #27272a';
								fieldEl.style.marginLeft = '4px';
							}
						});
					});
				}

				// 定期実行とイベント監視でSPA遷移に完全追従
				setInterval(applyAccordion, 350);
				window.addEventListener('popstate', () => setTimeout(applyAccordion, 100));
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
