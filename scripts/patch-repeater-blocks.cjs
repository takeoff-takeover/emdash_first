// scripts/patch-repeater-blocks.cjs
// マガジン等のエディタ内リピーター（カード一覧、横並びセクション一覧、開閉項目一覧など）のアコーディオンを初期状態で折りたたみ、タイトルを目立たせるパッチ
const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'node_modules', '@emdash-cms', 'admin', 'dist', 'index.js');
if (!fs.existsSync(targetFile)) {
	console.error('[patch-repeater-blocks] Target file not found:', targetFile);
	process.exit(1);
}

let content = fs.readFileSync(targetFile, 'utf8');

// 1. isCollapsed: !expanded.has(item._key) への置換（初期状態で閉じる）
if (content.includes('isCollapsed: expanded.has(item._key)')) {
	content = content.replace(
		'isCollapsed: expanded.has(item._key)',
		'isCollapsed: !expanded.has(item._key)'
	);
	console.log('[patch-repeater-blocks] Patched isCollapsed to initial collapsed state (!expanded.has).');
} else if (content.includes('isCollapsed: !expanded.has(item._key)')) {
	console.log('[patch-repeater-blocks] isCollapsed is already patched.');
} else {
	console.warn('[patch-repeater-blocks] Warning: target pattern for isCollapsed not found.');
}

// 2. handleAdd での追加時動作（追加時は開く）
if (content.includes('const handleAdd = () => {')) {
	const handleAddMarker = 'next.delete(newItem._key);\n\t\t\treturn next;\n\t\t});';
	if (content.includes(handleAddMarker)) {
		content = content.replace(
			handleAddMarker,
			'next.add(newItem._key);\n\t\t\treturn next;\n\t\t});'
		);
		console.log('[patch-repeater-blocks] Patched handleAdd to expand newly added item.');
	}
}

// 3. BlockKitRepeaterItem のタイトル・ヘッダーを目立たせる修正
const oldItemRender = `\treturn /* @__PURE__ */ jsxs("div", {
		ref: setNodeRef,
		style,
		className: cn("border border-kumo-line rounded-lg bg-kumo-base", isDragging && "opacity-50 ring-2 ring-kumo-brand"),
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-2 px-3 py-2 border-b border-kumo-line",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "inline-flex h-4 w-4 text-kumo-subtle cursor-grab shrink-0",
					"aria-label": _t4({
						id: "KGi3u9",
						message: "Drag to reorder"
					}),
					...attributes,
					...listeners,
					children: /* @__PURE__ */ jsx(DotsSixVertical, { className: "h-4 w-4" })
				}),
				/* @__PURE__ */ jsxs("button", {
					type: "button",
					className: "flex items-center gap-2 flex-1 min-w-0 text-start cursor-pointer",
					onClick: onToggleCollapse,
					"aria-expanded": !isCollapsed,
					children: [isCollapsed ? /* @__PURE__ */ jsx(CaretNext, { className: "h-4 w-4 text-kumo-subtle shrink-0" }) : /* @__PURE__ */ jsx(CaretDown, { className: "h-4 w-4 text-kumo-subtle shrink-0" }), /* @__PURE__ */ jsx("span", {
						className: "text-sm font-medium flex-1 truncate",
						children: summaryLabel
					})]
				}),`;

const newItemRender = `\treturn /* @__PURE__ */ jsxs("div", {
		ref: setNodeRef,
		style,
		className: cn("border border-kumo-line rounded-lg bg-kumo-base overflow-hidden transition-all shadow-sm", isDragging && "opacity-50 ring-2 ring-kumo-brand"),
		children: [/* @__PURE__ */ jsxs("div", {
			className: cn("flex items-center gap-2.5 px-3.5 py-2.5 transition-colors select-none", !isCollapsed ? "bg-kumo-tint border-b border-kumo-line" : "hover:bg-kumo-tint/50"),
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "inline-flex h-4 w-4 text-kumo-subtle cursor-grab shrink-0",
					"aria-label": _t4({
						id: "KGi3u9",
						message: "Drag to reorder"
					}),
					...attributes,
					...listeners,
					children: /* @__PURE__ */ jsx(DotsSixVertical, { className: "h-4 w-4" })
				}),
				/* @__PURE__ */ jsxs("button", {
					type: "button",
					className: "flex items-center gap-2 flex-1 min-w-0 text-start cursor-pointer",
					onClick: onToggleCollapse,
					"aria-expanded": !isCollapsed,
					children: [
						isCollapsed ? /* @__PURE__ */ jsx(CaretNext, { className: "h-4 w-4 text-kumo-contrast shrink-0" }) : /* @__PURE__ */ jsx(CaretDown, { className: "h-4 w-4 text-kumo-contrast shrink-0" }),
						/* @__PURE__ */ jsx("span", {
							className: "inline-flex items-center justify-center font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-kumo-line text-kumo-contrast shrink-0",
							children: \`#\${index + 1}\`
						}),
						/* @__PURE__ */ jsx("span", {
							className: "text-[14.5px] font-bold text-kumo-contrast flex-1 truncate tracking-tight",
							children: summaryLabel
						})
					]
				}),`;

if (content.includes(oldItemRender)) {
	content = content.replace(oldItemRender, newItemRender);
	console.log('[patch-repeater-blocks] Patched BlockKitRepeaterItem styling (prominent bold title + index badge).');
} else if (content.includes('text-[14.5px] font-bold text-kumo-contrast')) {
	console.log('[patch-repeater-blocks] BlockKitRepeaterItem styling is already patched.');
} else {
	console.warn('[patch-repeater-blocks] Warning: target pattern for BlockKitRepeaterItem not found.');
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('[patch-repeater-blocks] Successfully updated index.js.');
