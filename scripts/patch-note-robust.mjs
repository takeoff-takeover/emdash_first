import fs from 'fs';
import path from 'path';

// 対象ファイル
const targets = [
  'node_modules/@emdash-cms/admin/dist/index.js',
];
const viteDepsDir = 'node_modules/.vite/deps';
if (fs.existsSync(viteDepsDir)) {
  for (const f of fs.readdirSync(viteDepsDir)) {
    if (f.startsWith('dist-') && f.endsWith('.js')) {
      targets.push(path.join(viteDepsDir, f));
    }
  }
}

for (const filePath of targets) {
  if (!fs.existsSync(filePath)) continue;
  let code = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. turnIntoMenuTypes を拡張（「注釈」を確実に含める）
  const menuTarget = 'function turnIntoMenuTypes(activeId) {\n\treturn textBlockTypes.filter((type) => !MENU_HIDDEN_TYPES.has(type.id) || type.id === activeId);\n}';
  const menuRepl = `function turnIntoMenuTypes(activeId) {
	const res = textBlockTypes.filter((type) => !MENU_HIDDEN_TYPES.has(type.id) || type.id === activeId);
	if (!res.some((t) => t.id === "note")) {
		const pType = textBlockTypes.find((t) => t.id === "paragraph") || textBlockTypes[0];
		res.push({
			id: "note",
			label: { id: "custom_note_item", message: "注釈" },
			icon: pType?.icon,
			isActive: (editor) => editor.isActive("paragraph", { ptStyle: "note" }),
			transform: (editor) => turnInto(editor, "note")
		});
	}
	return res;
}`;
  if (!code.includes('if (!res.some((t) => t.id === "note"))') && code.includes(menuTarget)) {
    code = code.replace(menuTarget, menuRepl);
    console.log(`✓ Patched turnIntoMenuTypes in ${filePath}`);
    modified = true;
  }

  // 2. textBlockTypes の定義直後に note を push
  const tbtDef = 'const textBlockTypes = [\n';
  const tbtVarDef = 'var textBlockTypes = [\n';
  const tbtEndTarget = '\n];\n/** Headings 4 to 6 stay out of menus';
  const tbtEndRepl = `\n];
if (!textBlockTypes.some((t) => t.id === "note")) {
	const pType = textBlockTypes.find((t) => t.id === "paragraph") || textBlockTypes[0];
	textBlockTypes.push({
		id: "note",
		label: { id: "custom_note_item", message: "注釈" },
		icon: pType?.icon,
		isActive: (editor) => editor.isActive("paragraph", { ptStyle: "note" }),
		transform: (editor) => turnInto(editor, "note")
	});
}
/** Headings 4 to 6 stay out of menus`;

  if (!code.includes('textBlockTypes.some((t) => t.id === "note")') && code.includes(tbtEndTarget)) {
    code = code.replace(tbtEndTarget, tbtEndRepl);
    console.log(`✓ Injected note push to textBlockTypes in ${filePath}`);
    modified = true;
  }

  // 3. ACTIVE_ORDER に "note" を追加
  if (code.includes('"paragraph"\n];') && !code.includes('"note",\n\t"paragraph"\n];')) {
    code = code.replace('"paragraph"\n];', '"note",\n\t"paragraph"\n];');
    console.log(`✓ Added "note" to ACTIVE_ORDER in ${filePath}`);
    modified = true;
  }

  // 4. convertTextBlocks に note ハンドリングを追加
  if (!code.includes('else if (id === "note") setTextBlockType')) {
    const ctbTarget = 'else if (id === "paragraph") setTextBlockType(tr, from, to, schema.nodes.paragraph);';
    const ctbRepl = 'else if (id === "note") setTextBlockType(tr, from, to, schema.nodes.paragraph, { ptStyle: "note" });\n\t\telse if (id === "paragraph") setTextBlockType(tr, from, to, schema.nodes.paragraph, { ptStyle: null });';
    if (code.includes(ctbTarget)) {
      code = code.replace(ctbTarget, ctbRepl);
      console.log(`✓ Injected note into convertTextBlocks in ${filePath}`);
      modified = true;
    }
  }

  // 5. PortableTextIdentityExtension に ptStyle 属性を追加
  if (!code.includes('ptStyle: {')) {
    const ptiTarget = 'attributes: { [PORTABLE_TEXT_KEY_ATTR]: hiddenAttribute }';
    const ptiRepl = 'attributes: {\n\t\t\t\t[PORTABLE_TEXT_KEY_ATTR]: hiddenAttribute,\n\t\t\t\tptStyle: {\n\t\t\t\t\tdefault: null,\n\t\t\t\t\tparseHTML: (el) => el.getAttribute("data-pt-style") || (el.classList?.contains("is-note") ? "note" : null),\n\t\t\t\t\trenderHTML: (attrs) => attrs.ptStyle ? { "data-pt-style": attrs.ptStyle, class: attrs.ptStyle === "note" ? "is-note" : void 0 } : {}\n\t\t\t\t}\n\t\t\t}';
    if (code.includes(ptiTarget)) {
      code = code.replace(ptiTarget, ptiRepl);
      console.log(`✓ Added ptStyle to PortableTextIdentityExtension in ${filePath}`);
      modified = true;
    }
  }

  // 6. convertPMNode で ptStyle を style: "note" として出力
  if (!code.includes('const pStyle = node.attrs?.ptStyle === "note" ? "note" : "normal";')) {
    const cpmnTarget = '\t\t\treturn {\n\t\t\t\t_type: "block",\n\t\t\t\t_key: portableTextKeyFromAttrs(node.attrs) ?? generateKey(),\n\t\t\t\tstyle: "normal",';
    const cpmnRepl = '\t\t\tconst pStyle = node.attrs?.ptStyle === "note" ? "note" : "normal";\n\t\t\treturn {\n\t\t\t\t_type: "block",\n\t\t\t\t_key: portableTextKeyFromAttrs(node.attrs) ?? generateKey(),\n\t\t\t\tstyle: pStyle,';
    if (code.includes(cpmnTarget)) {
      code = code.replace(cpmnTarget, cpmnRepl);
      console.log(`✓ Added pStyle to convertPMNode in ${filePath}`);
      modified = true;
    }
  }

  // 7. convertPTBlock で style === "note" を読込
  if (!code.includes('case "note": return {')) {
    const cptbTarget = '\t\t\t\tcase "blockquote": return {\n\t\t\t\t\ttype: "blockquote",';
    const cptbRepl = '\t\t\t\tcase "note": return {\n\t\t\t\t\ttype: "paragraph",\n\t\t\t\t\tattrs: attrsWithPortableTextKey({\n\t\t\t\t\t\tptStyle: "note",\n\t\t\t\t\t\t...textAlign ? { textAlign } : {}\n\t\t\t\t\t}, block._key),\n\t\t\t\t\tcontent: pmContent.length > 0 ? pmContent : void 0\n\t\t\t\t};\n\t\t\t\tcase "blockquote": return {\n\t\t\t\t\ttype: "blockquote",';
    if (code.includes(cptbTarget)) {
      code = code.replace(cptbTarget, cptbRepl);
      console.log(`✓ Added note case to convertPTBlock in ${filePath}`);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, code, 'utf8');
    console.log(`==> Finished writing ${filePath}`);
  }
}
