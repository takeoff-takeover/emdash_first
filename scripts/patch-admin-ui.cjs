const fs = require('fs');
const path = require('path');

const adminAstroPath = path.join(__dirname, '..', 'node_modules', 'emdash', 'src', 'astro', 'routes', 'admin.astro');

if (!fs.existsSync(adminAstroPath)) {
  console.log('[patch-admin-ui] admin.astro not found, skipping.');
} else {
  let content = fs.readFileSync(adminAstroPath, 'utf8');

  // 以前のインライン注入スクリプトがあれば完全除去
  if (content.includes('/* __SECTION_BLOCKS_INJECTED__ */')) {
    const startIdx = content.indexOf('/* __SECTION_BLOCKS_INJECTED__ */');
    const scriptEnd = content.indexOf('</script>', startIdx);
    if (startIdx !== -1 && scriptEnd !== -1) {
      // <script is:inline> から </script> までをきれいに除去
      const scriptStart = content.lastIndexOf('<script is:inline>', startIdx);
      if (scriptStart !== -1) {
        content = content.slice(0, scriptStart) + content.slice(scriptEnd + 9);
      }
    }
  }

  // 外部スクリプト参照タグ（public/admin-enhancements.js）を注入
  const scriptTag = '		<script is:inline src="/admin-enhancements.js"></script>';
  if (!content.includes('/admin-enhancements.js')) {
    const bodyCloseIdx = content.lastIndexOf('</body>');
    if (bodyCloseIdx !== -1) {
      content = content.slice(0, bodyCloseIdx) + scriptTag + '\n' + content.slice(bodyCloseIdx);
      fs.writeFileSync(adminAstroPath, content, 'utf8');
      console.log('[patch-admin-ui] Successfully injected /admin-enhancements.js tag into admin.astro.');
    } else {
      console.error('[patch-admin-ui] Could not find </body> in admin.astro.');
    }
  } else {
    // 既にタグがあれば、余計な重複がないかクリーンアップして保存
    fs.writeFileSync(adminAstroPath, content, 'utf8');
    console.log('[patch-admin-ui] admin.astro already has /admin-enhancements.js script tag.');
  }
}

// @emdash-cms/admin バンドルおよび Vite 事前バンドルキャッシュのパッチ
// 1. PluginBlockNodeView に data-nicole-block-type / data-nicole-block-data 属性を直接出力させる
// 2. BlockKitRepeater の各項目を初期状態で常時展開（手動で閉じた項目のみ折りたたむ）にする
const bundleCandidates = [
  path.join(__dirname, '..', 'node_modules', '@emdash-cms', 'admin', 'dist', 'index.js'),
];
const viteDepsDir = path.join(__dirname, '..', 'node_modules', '.vite', 'deps');
if (fs.existsSync(viteDepsDir)) {
  fs.readdirSync(viteDepsDir).forEach(f => {
    if (f.startsWith('@emdash-cms_admin') && f.endsWith('.js')) {
      bundleCandidates.push(path.join(viteDepsDir, f));
    }
  });
}

for (const bundlePath of bundleCandidates) {
  if (!fs.existsSync(bundlePath)) continue;
  let js = fs.readFileSync(bundlePath, 'utf8');
  let modified = false;

  // 1. PluginBlockNodeView に attributes を注入
  if (!js.includes('data-nicole-block-type')) {
    const target = 'return /* @__PURE__ */ jsx("div", { ref: setNodeRef, children: /* @__PURE__ */ jsx(Card, {';
    const repl = 'return /* @__PURE__ */ jsx("div", { ref: setNodeRef, "data-nicole-block-type": node.attrs?.blockType, "data-nicole-block-data": JSON.stringify(node.attrs?.data || {}), children: /* @__PURE__ */ jsx(Card, {';
    if (js.includes(target)) {
      js = js.replace(target, repl);
      modified = true;
    }
  }

  // 2. BlockKitRepeaterItem を常時展開（手動で閉じた項目のみ collapsed）
  if (js.includes('const isCollapsed = !expanded.has(index);')) {
    js = js.replace('const isCollapsed = !expanded.has(index);', 'const isCollapsed = expanded.has(index);');
    modified = true;
  }

  // 3. 項目追加時（handleAdd）に展開状態を維持
  if (js.includes('setExpanded((prev) => new Set([...prev, items.length]));')) {
    js = js.replace(
      'setExpanded((prev) => new Set([...prev, items.length]));',
      'setExpanded((prev) => { const next = new Set(prev); next.delete(items.length); return next; });'
    );
    modified = true;
  }

  // 4. Note（注釈・補足文）ブロックタイプの追加
  if (js.includes('id: "blockquote",') && !js.includes('id: "note",')) {
    const target = 'id: "blockquote",\n\t\t\t\tlabel: _t({\n\t\t\t\t\tid: "r1Y0aP",\n\t\t\t\t\tmessage: "Quote"\n\t\t\t\t}),\n\t\t\t\ticon: Quote,\n\t\t\t\tshortcut: ">"';
    const repl = target + ',\n\t\t\t\tactive: (state) => {\n\t\t\t\t\tconst { $from } = state.selection;\n\t\t\t\t\treturn $from.parent.type.name === "blockquote";\n\t\t\t\t}\n\t\t\t}, {\n\t\t\t\tid: "note",\n\t\t\t\tlabel: "注釈・補足（Note）",\n\t\t\t\ticon: Info,\n\t\t\t\tshortcut: "!",\n\t\t\t\tactive: (state) => {\n\t\t\t\t\tconst { $from } = state.selection;\n\t\t\t\t\treturn $from.parent.type.name === "paragraph" && $from.parent.attrs?.ptStyle === "note";\n\t\t\t\t}';
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


  // 6. プラグインブロックの名前空間付きtype（editorial-tools:xxx）の完全解決
  // 6-1. registerPluginBlocks でプレフィックス付き（editorial-tools:type）もregistryに登録
  if (js.includes('for (const block of blocks) registry.set(block.type, block);') && !js.includes('if (block.pluginId) registry.set(`${block.pluginId}:${block.type}`, block);')) {
    js = js.replace(
      'for (const block of blocks) registry.set(block.type, block);',
      'for (const block of blocks) { registry.set(block.type, block); if (block.pluginId) registry.set(`${block.pluginId}:${block.type}`, block); }'
    );
    modified = true;
  }

  // 6-2. getEmbedMeta でプレフィックス付き・なし両方のフォールバック
  if (js.includes('function getEmbedMeta(blockType, registry) {\n\tconst def = registry.get(blockType);')) {
    js = js.replace(
      'function getEmbedMeta(blockType, registry) {\n\tconst def = registry.get(blockType);',
      'function getEmbedMeta(blockType, registry) {\n\tconst def = registry.get(blockType) || (blockType.includes(":") ? registry.get(blockType.split(":")[1]) : void 0);'
    );
    modified = true;
  }

  // 6-3. PluginBlockNodeView でプレフィックス付き・なし両方のフォールバック
  if (js.includes('\tconst blockDef = registry.get(blockType);') && !js.includes('\tconst blockDef = registry.get(blockType) || (blockType.includes(":") ? registry.get(blockType.split(":")[1]) : void 0);')) {
    js = js.replace(
      '\tconst blockDef = registry.get(blockType);',
      '\tconst blockDef = registry.get(blockType) || (blockType.includes(":") ? registry.get(blockType.split(":")[1]) : void 0);'
    );
    modified = true;
  }

  // 6-4. PluginBlockNodeView に data-nicole-block-type / data-nicole-block-data を注入
  if (!js.includes('"data-nicole-block-type": blockType')) {
    const cardTarget = 'className: "rounded-lg border bg-kumo-base",\n\t\t\t\tchildren: [/* @__PURE__ */ jsxs("div", {';
    const cardRepl = 'className: "rounded-lg border bg-kumo-base",\n\t\t\t\t"data-nicole-block-type": blockType,\n\t\t\t\t"data-nicole-block-data": JSON.stringify(data),\n\t\t\t\tchildren: [/* @__PURE__ */ jsxs("div", {';
    if (js.includes(cardTarget)) {
      js = js.replace(cardTarget, cardRepl);
      modified = true;
    }
  }

  // 6-5. storage.onEditBlock でブロック定義を検索する際にプレフィックス（editorial-tools:）付きも解決
  if (js.includes('pluginBlocks.find((b) => b.type === attrs.blockType)') && !js.includes('b.type === attrs.blockType.split(\':\').pop()')) {
    js = js.replace(
      'pluginBlocks.find((b) => b.type === attrs.blockType)',
      'pluginBlocks.find((b) => b.type === attrs.blockType || b.type === attrs.blockType.split(\':\').pop())'
    );
    modified = true;
  }

    if (modified) {
    fs.writeFileSync(bundlePath, js, 'utf8');
    console.log('[patch-admin-ui] Patched admin bundle:', path.relative(path.join(__dirname, '..'), bundlePath));
  }
}

// 5. バックエンド検索の「部分一致（LIKE）＋タクソノミー（カテゴリ・タグ）連動」パッチ
try {
  const { execSync } = require('child_process');
  execSync('node ' + path.join(__dirname, 'patch-search.mjs'), { stdio: 'inherit' });
} catch (e) {
  console.error('[patch-admin-ui] Failed to run patch-search.mjs', e);
}

// Also apply repeater blocks accordion patch
try { require("./patch-repeater-blocks.cjs"); } catch (e) { console.error("[patch-admin-ui] Failed to run patch-repeater-blocks.cjs", e); }
