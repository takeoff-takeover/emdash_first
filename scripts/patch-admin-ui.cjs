// scripts/patch-admin-ui.cjs
// EmDash 管理画面に拠点（locations）の「タブUI（Tabbed Interface）」を動的注入するパッチ
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
    // 別のフォーマットで注入されている場合
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
						name: '基本情報',
						desc: '拠点名称、主要ブランド、住所、代表電話番号、FAX番号、管理オフィス注記'
					},
					{
						id: 'sec-gallery',
						prefix: '【写真ギャラリー】',
						name: '写真ギャラリー',
						desc: 'メイン外観写真（アイキャッチ）および詳細写真（最大6枚）と説明文'
					},
					{
						id: 'sec-sales',
						prefix: '【新車窓口】',
						name: '新車窓口',
						desc: '新車窓口見出し、店舗名称、直通電話、営業時間、定休日、展示案内、予約ボタン'
					},
					{
						id: 'sec-used',
						prefix: '【中古車窓口】',
						name: '認定中古車窓口',
						desc: '中古車窓口見出し、店舗名称、直通電話、営業時間、定休日、在庫案内、在庫ボタン'
					},
					{
						id: 'sec-service',
						prefix: '【サービス窓口】',
						name: 'サービス窓口',
						desc: 'サービス窓口見出し、店舗名称、直通電話、営業時間、定休日、整備案内、予約ボタン'
					},
					{
						id: 'sec-access',
						prefix: '【併設・アクセス】',
						name: '併設・アクセス',
						desc: '同一敷地併設拠点への相互リンク、お車・電車バスでのアクセス方法、GoogleマップURL'
					},
					{
						id: 'sec-all',
						prefix: '',
						name: 'すべて表示',
						desc: '全セクションのフィールドを一覧表示'
					}
				];

				let currentActiveTab = 'sec-basic';

				function applyTabs() {
					// 画面内にプレフィックスが存在するか判定（URLに依存せず確実に検出）
					const allElements = Array.from(document.querySelectorAll('label, p, span, h3, h4'));
					const hasLocationsField = allElements.some(el =>
						el.textContent && (
							el.textContent.includes('【基本情報】') ||
							el.textContent.includes('【新車窓口】') ||
							el.textContent.includes('【写真ギャラリー】')
						)
					);

					if (!hasLocationsField) {
						// 拠点編集画面以外ではタブコンテナを削除
						const existingNav = document.getElementById('emdash-tabs-nav-bar');
						if (existingNav) existingNav.remove();
						return;
					}

					// 各プレフィックスに該当するフィールドラッパー要素をグループ化
					const sectionElements = {};
					SECTION_CONFIG.forEach(sec => { sectionElements[sec.id] = []; });

					allElements.forEach(el => {
						if (el.children.length > 0 || !el.textContent) return;
						const text = el.textContent;
						for (const sec of SECTION_CONFIG) {
							if (sec.prefix && text.includes(sec.prefix)) {
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

					const totalFound = Object.entries(sectionElements).reduce((acc, [k, arr]) => k === 'sec-all' ? acc : acc + arr.length, 0);
					if (totalFound < 3) return;

					// ターゲットとなる親要素を取得
					const firstField = sectionElements['sec-basic'][0] || Object.values(sectionElements).find(arr => arr.length > 0)?.[0];
					if (!firstField || !firstField.parentElement) return;
					const parentContainer = firstField.parentElement;

					// タブナビゲーションバーの作成または更新
					let navBar = document.getElementById('emdash-tabs-nav-bar');
					if (!navBar) {
						navBar = document.createElement('div');
						navBar.id = 'emdash-tabs-nav-bar';
						navBar.style.cssText = \`
							margin-bottom: 24px;
							padding: 6px;
							background: #141517;
							border: 1px solid #27272a;
							border-radius: 8px;
							display: flex;
							flex-wrap: wrap;
							gap: 6px;
							position: sticky;
							top: 12px;
							z-index: 50;
							box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
						\`;
						parentContainer.insertBefore(navBar, parentContainer.firstChild);
					}

					// タブボタンの生成・更新
					navBar.innerHTML = '';
					SECTION_CONFIG.forEach(sec => {
						const count = sec.id === 'sec-all' ? totalFound : (sectionElements[sec.id]?.length || 0);
						if (count === 0 && sec.id !== 'sec-all') return;

						const tabBtn = document.createElement('button');
						tabBtn.type = 'button';
						tabBtn.className = 'emdash-tab-btn';
						tabBtn.setAttribute('data-tab-id', sec.id);

						const isActive = currentActiveTab === sec.id;
						tabBtn.style.cssText = \`
							display: inline-flex;
							align-items: center;
							gap: 8px;
							padding: 8px 14px;
							font-size: 13px;
							font-weight: \${isActive ? '700' : '500'};
							color: \${isActive ? '#ffffff' : '#a1a1aa'};
							background: \${isActive ? '#27272a' : 'transparent'};
							border: 1px solid \${isActive ? '#3f3f46' : 'transparent'};
							border-radius: 6px;
							cursor: pointer;
							transition: all 0.15s ease;
						\`;

						tabBtn.innerHTML = \`
							<span>\${sec.name}</span>
							<span style="
								font-size: 11px;
								padding: 1px 6px;
								border-radius: 4px;
								background: \${isActive ? '#3f3f46' : '#1f2023'};
								color: \${isActive ? '#ffffff' : '#71717a'};
							">\${count}</span>
						\`;

						tabBtn.onmouseenter = () => {
							if (currentActiveTab !== sec.id) {
								tabBtn.style.background = '#1c1d20';
								tabBtn.style.color = '#e4e4e7';
							}
						};
						tabBtn.onmouseleave = () => {
							if (currentActiveTab !== sec.id) {
								tabBtn.style.background = 'transparent';
								tabBtn.style.color = '#a1a1aa';
							}
						};

						tabBtn.onclick = (e) => {
							e.preventDefault();
							currentActiveTab = sec.id;
							applyTabs();
						};

						navBar.appendChild(tabBtn);
					});

					// セクションフィールドの表示・非表示切り替え
					SECTION_CONFIG.forEach(sec => {
						if (sec.id === 'sec-all') return;
						const fields = sectionElements[sec.id] || [];
						const shouldShow = currentActiveTab === 'sec-all' || currentActiveTab === sec.id;

						fields.forEach(f => {
							f.style.display = shouldShow ? '' : 'none';
							if (shouldShow && currentActiveTab !== 'sec-all') {
								f.style.animation = 'emdashFadeIn 0.2s ease';
							}
						});
					});

					// セクション説明バナーの作成・更新
					let descBanner = document.getElementById('emdash-tab-desc-banner');
					const activeSecObj = SECTION_CONFIG.find(s => s.id === currentActiveTab);
					if (activeSecObj && activeSecObj.desc) {
						if (!descBanner) {
							descBanner = document.createElement('div');
							descBanner.id = 'emdash-tab-desc-banner';
							descBanner.style.cssText = \`
								padding: 10px 14px;
								margin-bottom: 20px;
								background: rgba(255, 255, 255, 0.03);
								border-left: 3px solid #ffffff;
								border-radius: 4px;
								font-size: 12px;
								color: #9ca3af;
							\`;
							navBar.parentNode.insertBefore(descBanner, navBar.nextSibling);
						}
						descBanner.textContent = activeSecObj.desc;
						descBanner.style.display = '';
					} else if (descBanner) {
						descBanner.style.display = 'none';
					}
				}

				// スタイルアニメーション注入
				if (!document.getElementById('emdash-tab-keyframes')) {
					const style = document.createElement('style');
					style.id = 'emdash-tab-keyframes';
					style.textContent = \`
						@keyframes emdashFadeIn {
							from { opacity: 0; transform: translateY(4px); }
							to { opacity: 1; transform: translateY(0); }
						}
					\`;
					document.head.appendChild(style);
				}

				// 定期実行とイベント監視
				setInterval(applyTabs, 350);
				window.addEventListener('popstate', () => setTimeout(applyTabs, 100));
			})();
		</script>
`;

const bodyCloseIdx = content.lastIndexOf('</body>');
if (bodyCloseIdx !== -1) {
  content = content.slice(0, bodyCloseIdx) + injectedCode + '\n' + content.slice(bodyCloseIdx);
  fs.writeFileSync(adminAstroPath, content, 'utf8');
  console.log('[patch-admin-ui] Successfully injected clean Tabbed UI into admin.astro.');
} else {
  console.error('[patch-admin-ui] Could not find </body> in admin.astro.');
}
