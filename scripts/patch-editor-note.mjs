import fs from 'fs';
import path from 'path';

const targetFile = path.resolve('node_modules/@emdash-cms/admin/dist/index.js');
if (!fs.existsSync(targetFile)) {
  console.error('Target file not found:', targetFile);
  process.exit(1);
}

let code = fs.readFileSync(targetFile, 'utf8');

// バックアップ作成
if (!fs.existsSync(targetFile + '.bak_note')) {
  fs.writeFileSync(targetFile + '.bak_note', code, 'utf8');
  console.log('Created backup:', targetFile + '.bak_note');
}

let modified = false;

// 1. textBlockTypes に「注釈」を追加
if (!code.includes('id: "note"')) {
  const target = `	{\n\t\tid: "codeBlock",\n\t\tlabel: {\n\t\t\tid: "N2eHWq",\n\t\t\tmessage: "Code Block"\n\t\t},\n\t\ticon: CodeBlock,\n\t\tmarkdown: "\`\`\`",\n\t\tisActive: (editor) => editor.isActive("codeBlock"),\n\t\ttransform: (editor) => turnInto(editor, "codeBlock")\n\t}\n];`;
  const replacement = `	{\n\t\tid: "codeBlock",\n\t\tlabel: {\n\t\t\tid: "N2eHWq",\n\t\t\tmessage: "Code Block"\n\t\t},\n\t\ticon: CodeBlock,\n\t\tmarkdown: "\`\`\`",\n\t\tisActive: (editor) => editor.isActive("codeBlock"),\n\t\ttransform: (editor) => turnInto(editor, "codeBlock")\n\t},\n\t{\n\t\tid: "note",\n\t\tlabel: {\n\t\t\tid: "custom_note_item",\n\t\t\tmessage: "注釈"\n\t\t},\n\t\ticon: TextT,\n\t\tisActive: (editor) => editor.isActive("paragraph", { ptStyle: "note" }),\n\t\ttransform: (editor) => turnInto(editor, "note")\n\t}\n];`;
  if (code.includes(target)) {
    code = code.replace(target, replacement);
    console.log('✓ Injected "note" into textBlockTypes');
    modified = true;
  } else {
    console.error('✗ Failed to find target for textBlockTypes');
  }
} else {
  console.log('• "note" already in textBlockTypes');
}

// 2. ACTIVE_ORDER に "note" を追加
if (code.includes('"paragraph"\n];') && !code.includes('"note",\n\t"paragraph"\n];')) {
  const target = `"paragraph"\n];`;
  const replacement = `"note",\n\t"paragraph"\n];`;
  code = code.replace(target, replacement);
  console.log('✓ Injected "note" into ACTIVE_ORDER');
  modified = true;
} else {
  console.log('• ACTIVE_ORDER already has "note" or target not matched');
}

// 3. convertTextBlocks で id === "note" のハンドリング
if (!code.includes('else if (id === "note") setTextBlockType(tr, from, to, schema.nodes.paragraph, { ptStyle: "note" });')) {
  const target = `else if (id === "paragraph") setTextBlockType(tr, from, to, schema.nodes.paragraph);`;
  const replacement = `else if (id === "note") setTextBlockType(tr, from, to, schema.nodes.paragraph, { ptStyle: "note" });\n\t\telse if (id === "paragraph") setTextBlockType(tr, from, to, schema.nodes.paragraph, { ptStyle: null });`;
  if (code.includes(target)) {
    code = code.replace(target, replacement);
    console.log('✓ Injected "note" handler into convertTextBlocks');
    modified = true;
  } else {
    console.error('✗ Failed to find target for convertTextBlocks');
  }
} else {
  console.log('• convertTextBlocks already handled "note"');
}

// 4. PortableTextIdentityExtension で ptStyle 属性を登録
if (!code.includes('ptStyle: {')) {
  const target = `attributes: { [PORTABLE_TEXT_KEY_ATTR]: hiddenAttribute }`;
  const replacement = `attributes: {\n\t\t\t\t[PORTABLE_TEXT_KEY_ATTR]: hiddenAttribute,\n\t\t\t\tptStyle: {\n\t\t\t\t\tdefault: null,\n\t\t\t\t\tparseHTML: (el) => el.getAttribute("data-pt-style") || (el.classList?.contains("is-note") ? "note" : null),\n\t\t\t\t\trenderHTML: (attrs) => attrs.ptStyle ? { "data-pt-style": attrs.ptStyle, class: attrs.ptStyle === "note" ? "is-note" : void 0 } : {}\n\t\t\t\t}\n\t\t\t}`;
  if (code.includes(target)) {
    code = code.replace(target, replacement);
    console.log('✓ Injected ptStyle attribute into PortableTextIdentityExtension');
    modified = true;
  } else {
    console.error('✗ Failed to find target for PortableTextIdentityExtension');
  }
} else {
  console.log('• ptStyle attribute already present in PortableTextIdentityExtension');
}

// 5. convertPMNode で paragraph の ptStyle を style: "note" として保存
if (!code.includes('const pStyle = node.attrs?.ptStyle === "note" ? "note" : "normal";')) {
  const target = `\t\t\treturn {\n\t\t\t\t_type: "block",\n\t\t\t\t_key: portableTextKeyFromAttrs(node.attrs) ?? generateKey(),\n\t\t\t\tstyle: "normal",`;
  const replacement = `\t\t\tconst pStyle = node.attrs?.ptStyle === "note" ? "note" : "normal";\n\t\t\treturn {\n\t\t\t\t_type: "block",\n\t\t\t\t_key: portableTextKeyFromAttrs(node.attrs) ?? generateKey(),\n\t\t\t\tstyle: pStyle,`;
  if (code.includes(target)) {
    code = code.replace(target, replacement);
    console.log('✓ Injected pStyle export into convertPMNode');
    modified = true;
  } else {
    console.error('✗ Failed to find target for convertPMNode');
  }
} else {
  console.log('• convertPMNode already exports pStyle');
}

// 6. convertPTBlock で style === "note" を ptStyle: "note" として読み込み
if (!code.includes('case "note": return {')) {
  const target = `\t\t\t\tcase "blockquote": return {\n\t\t\t\t\ttype: "blockquote",`;
  const replacement = `\t\t\t\tcase "note": return {\n\t\t\t\t\ttype: "paragraph",\n\t\t\t\t\tattrs: attrsWithPortableTextKey({\n\t\t\t\t\t\tptStyle: "note",\n\t\t\t\t\t\t...textAlign ? { textAlign } : {}\n\t\t\t\t\t}, block._key),\n\t\t\t\t\tcontent: pmContent.length > 0 ? pmContent : void 0\n\t\t\t\t};\n\t\t\t\tcase "blockquote": return {\n\t\t\t\t\ttype: "blockquote",`;
  if (code.includes(target)) {
    code = code.replace(target, replacement);
    console.log('✓ Injected "note" case into convertPTBlock');
    modified = true;
  } else {
    console.error('✗ Failed to find target for convertPTBlock');
  }
} else {
  console.log('• convertPTBlock already handles "note"');
}

if (modified) {
  fs.writeFileSync(targetFile, code, 'utf8');
  console.log('==> Successfully applied all note patches to index.js');
} else {
  console.log('==> No modifications needed');
}
