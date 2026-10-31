// scripts/patch-admin-ui.cjs
// EmDash 管理画面に拠点（locations）の「大見出し付きアコーディオン UI」を動的注入するパッチ
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
						title: '基本情報・概要',
						desc: '拠点名称、主要ブランド、住所、代表電話番号、管理オフィス注記',
						defaultOpen: true
					},
					{
						id: 'sec-gallery',
						prefix: '【写真ギャラリー】',
						title: '写真ギャラリー（最大6点）',
						desc: 'メイン外観写真（アイキャッチ）および詳細写真（最大6枚）と説明文',
						defaultOpen: false
					},
					{
						id: 'sec-sales',
						prefix: '【新車窓口】',
						title: '新車ショールーム窓口',
						desc: '新車ショールーム部門名称、直通電話、営業時間、定休日、展示案内、予約ボタン（※ない場合は空欄可）',
						defaultOpen: false
					},
					{
						id: 'sec-used',
						prefix: '【中古車窓口】',
						title: '認定中古車窓口',
						desc: '認定中古車部門名称、直通電話、営業時間、定休日、在庫案内、在庫ボタン（※ない場合は空欄可）',
						defaultOpen: false
					},
					{
						id: 'sec-service',
						prefix: '【サービス窓口】',
						title: 'サービス・車検点検窓口',
						desc: '整備・点検部門名称、直通電話、営業時間、定休日、整備内容案内、予約ボタン（※ない場合は空欄可）',
						defaultOpen: false
					},
					{
						id: 'sec-access',
						prefix: '【併設・アクセス】',
						title: '併設拠点・アクセス案内',
						desc: '同一敷地併設拠点への相互リンク、お車・電車バスでのアクセス方法、GoogleマップURL',
						defaultOpen: false
					}
				];

				// 開閉状態を記憶
				const openState = {};
				SECTION_CONFIG.forEach(sec => {
					openState[sec.id] = sec.defaultOpen;
				});

				function applyAccordion() {
					// locations の編集画面（/content/locations/...）のみを対象
					const isLocationsEditor = window.location.pathname.includes('/content/locations') || window.location.pathname.includes('/locations');
					if (!isLocationsEditor) return;

					// フォーム内のフィールドセットまたはコンテナを取得
					const allElements = Array.from(document.querySelectorAll('label, p, span'));
					const formContainer = document.querySelector('.emdash-editor-page') || document.querySelector('form fieldset');
					if (!formContainer) return;

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

					// 一括開閉ツールバーの設置
					const parentSpace = sectionElements['sec-basic'][0]?.parentElement;
					if (parentSpace && !document.getElementById('accordion-global-toolbar')) {
						const toolbar = document.createElement('div');
						toolbar.id = 'accordion-global-toolbar';
						toolbar.style.cssText = \`
							display: flex;
							align-items: center;
							justify-content: space-between;
							background: #18181b;
							border: 1px solid #27272a;
							border-radius: 6px;
							padding: 10px 16px;
							margin-bottom: 24px;
						\`;

						const infoText = document.createElement('span');
						infoText.textContent = 'セクション表示切替';
						infoText.style.cssText = 'font-size: 13px; font-weight: 600; color: #d4d4d8;';

						const btnGroup = document.createElement('div');
						btnGroup.style.cssText = 'display: flex; gap: 8px;';

						const expandBtn = document.createElement('button');
						expandBtn.type = 'button';
						expandBtn.textContent = 'すべて展開';
						expandBtn.style.cssText = \`
							background: #27272a;
							color: #ffffff;
							border: 1px solid #3f3f46;
							padding: 5px 12px;
							border-radius: 4px;
							font-size: 12px;
							cursor: pointer;
							font-weight: 500;
						\`;
						expandBtn.onclick = () => {
							SECTION_CONFIG.forEach(s => { openState[s.id] = true; });
							updateAccordionVisibility();
						};

						const collapseBtn = document.createElement('button');
						collapseBtn.type = 'button';
						collapseBtn.textContent = 'すべて折りたたむ';
						collapseBtn.style.cssText = \`
							background: #27272a;
							color: #ffffff;
							border: 1px solid #3f3f46;
							padding: 5px 12px;
							border-radius: 4px;
							font-size: 12px;
							cursor: pointer;
							font-weight: 500;
						\`;
						collapseBtn.onclick = () => {
							SECTION_CONFIG.forEach(s => { openState[s.id] = false; });
							updateAccordionVisibility();
						};

						btnGroup.appendChild(expandBtn);
						btnGroup.appendChild(collapseBtn);
						toolbar.appendChild(infoText);
						toolbar.appendChild(btnGroup);

						parentSpace.insertBefore(toolbar, parentSpace.firstChild);
					}

					// 各セクションのヘッダーバー作成・更新
					for (const sec of SECTION_CONFIG) {
						const fields = sectionElements[sec.id];
						if (fields.length === 0) continue;

						const firstField = fields[0];
						let header = document.querySelector(\`[data-accordion-header="\${sec.id}"]\`);

						if (!header) {
							header = document.createElement('div');
							header.setAttribute('data-accordion-header', sec.id);
							header.style.cssText = \`
								margin-top: 24px;
								margin-bottom: 12px;
								padding: 14px 18px;
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

							header.onmouseenter = () => { header.style.background = '#27272a'; };
							header.onmouseleave = () => { header.style.background = '#18181b'; };

							header.onclick = (e) => {
								e.preventDefault();
								openState[sec.id] = !openState[sec.id];
								updateAccordionVisibility();
							};

							const leftDiv = document.createElement('div');
							leftDiv.style.cssText = 'flex: 1;';

							const h3 = document.createElement('div');
							h3.className = 'accordion-title';
							h3.style.cssText = 'font-size: 14.5px; font-weight: 700; color: #ffffff; letter-spacing: 0.02em;';

							const p = document.createElement('div');
							p.className = 'accordion-desc';
							p.textContent = sec.desc;
							p.style.cssText = 'margin: 4px 0 0 0; font-size: 12px; color: #a1a1aa; line-height: 1.4;';

							leftDiv.appendChild(h3);
							leftDiv.appendChild(p);

							const rightDiv = document.createElement('div');
							rightDiv.style.cssText = 'display: flex; align-items: center; gap: 10px; margin-left: 12px;';

							const countBadge = document.createElement('span');
							countBadge.className = 'accordion-badge';
							countBadge.textContent = \`\${fields.length}項目\`;
							countBadge.style.cssText = 'font-size: 11px; background: #27272a; color: #d4d4d8; padding: 2px 8px; border-radius: 4px; border: 1px solid #3f3f46;';

							const arrow = document.createElement('span');
							arrow.className = 'accordion-arrow';
							arrow.style.cssText = 'font-size: 12px; color: #ffffff;';

							rightDiv.appendChild(countBadge);
							rightDiv.appendChild(arrow);

							header.appendChild(leftDiv);
							header.appendChild(rightDiv);

							firstField.parentNode.insertBefore(header, firstField);
						}

						const h3 = header.querySelector('.accordion-title');
						if (h3) h3.textContent = sec.title;

						const isOpen = openState[sec.id];
						const arrow = header.querySelector('.accordion-arrow');
						if (arrow) {
							arrow.textContent = isOpen ? '▲ 閉じる' : '▼ 開く';
						}

						fields.forEach(fieldEl => {
							fieldEl.style.display = isOpen ? '' : 'none';
							if (isOpen) {
								fieldEl.style.paddingLeft = '8px';
								fieldEl.style.borderLeft = '2px solid #27272a';
								fieldEl.style.marginLeft = '4px';
							}
						});
					}
				}

				function updateAccordionVisibility() {
					SECTION_CONFIG.forEach(sec => {
						const header = document.querySelector(\`[data-accordion-header="\${sec.id}"]\`);
						if (!header) return;

						const isOpen = openState[sec.id];
						const arrow = header.querySelector('.accordion-arrow');
						if (arrow) {
							arrow.textContent = isOpen ? '▲ 閉じる' : '▼ 開く';
						}

						const allElements = Array.from(document.querySelectorAll('label, p, span'));
						allElements.forEach(el => {
							if (el.children.length === 0 && el.textContent && el.textContent.includes(sec.prefix)) {
								let container = el.parentElement;
								while (container && container.parentElement) {
									if (container.parentElement.classList.contains('space-y-6') || container.parentElement.tagName === 'FIELDSET') {
										break;
									}
									container = container.parentElement;
								}
								if (container) {
									container.style.display = isOpen ? '' : 'none';
									if (isOpen) {
										container.style.paddingLeft = '8px';
										container.style.borderLeft = '2px solid #27272a';
										container.style.marginLeft = '4px';
									}
								}
							}
						});
					});
				}

				setInterval(applyAccordion, 400);
				window.addEventListener('popstate', () => setTimeout(applyAccordion, 200));
			})();
		</script>
`;

content = content.replace('</body>', `${injectedCode}\n\t</body>`);
fs.writeFileSync(adminAstroPath, content, 'utf8');
console.log('[patch-admin-ui] Successfully injected clean accordion UI into admin.astro.');
