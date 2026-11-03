import { definePlugin } from "emdash";
import { editorialBlocks } from "./blocks";

export function createPlugin() {
	return definePlugin({
		id: "editorial-tools",
		version: "1.0.0",
		admin: {
			portableTextBlocks: editorialBlocks as any
		}
	});
}

export default createPlugin;
