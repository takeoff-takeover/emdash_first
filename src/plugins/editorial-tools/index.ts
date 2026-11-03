import { fileURLToPath } from "node:url";
import { editorialBlocks } from "./blocks";

const runtimePath = fileURLToPath(new URL("./runtime.ts", import.meta.url));

export function editorialToolsPlugin() {
	return {
		id: "editorial-tools",
		version: "1.0.0",
		entrypoint: runtimePath,
		format: "native" as const,
		adminPages: [],
		portableTextBlocks: editorialBlocks,
		admin: {
			portableTextBlocks: editorialBlocks,
		}
	};
}

export default editorialToolsPlugin;
