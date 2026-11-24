import { analyzeText, type AnalyzeOptions, type ScanResult } from "./detect";

/**
 * Build a mask that is false inside YAML frontmatter, fenced / inline code,
 * HTML comments, Obsidian %%comments%%, URLs, Markdown link destinations,
 * and wikilink paths (the alias, if any, is still checked).
 */
export function maskMarkdown(text: string): boolean[] {
	const mask = new Array<boolean>(text.length).fill(true);
	const skipRange = (start: number, end: number) => {
		const from = Math.max(0, start);
		const to = Math.min(text.length, end);
		for (let i = from; i < to; i++) mask[i] = false;
	};

	if (text.startsWith("---")) {
		const nl = text.indexOf("\n");
		if (nl !== -1) {
			const close = text.indexOf("\n---", nl);
			if (close !== -1) {
				let end = close + 4;
				if (text[end] === "\n") end += 1;
				else if (text.startsWith("\r\n", end)) end += 2;
				skipRange(0, end);
			}
		}
	}

	applyGlobal(text, /```[\s\S]*?```/g, skipRange);
	applyGlobal(text, /~~~[\s\S]*?~~~/g, skipRange);
	applyGlobal(text, /`[^`\n]+`/g, skipRange);
	applyGlobal(text, /<!--[\s\S]*?-->/g, skipRange);
	applyGlobal(text, /%%[\s\S]*?%%/g, skipRange);
	applyGlobal(text, /https?:\/\/[^\s)>\]]+/gi, skipRange);
	applyGlobal(text, /\]\([^)]*\)/g, skipRange);

	const wiki = /\[\[([^\]|#]+)(#[^\]|]*)?(\|[^\]]*)?\]\]/g;
	let m: RegExpExecArray | null;
	while ((m = wiki.exec(text)) !== null) {
		const fullStart = m.index;
		const fullEnd = m.index + m[0].length;
		const alias = m[3];
		if (alias) {
			// Keep the alias (including the leading |) checkable: skip [[path#hash
			const pathLen = m[1]?.length ?? 0;
		const hashLen = m[2]?.length ?? 0;
		const aliasStart = fullStart + 2 + pathLen + hashLen;
			skipRange(fullStart, aliasStart);
			skipRange(fullEnd - 2, fullEnd);
		} else {
			skipRange(fullStart, fullEnd);
		}
	}

	return mask;
}

export function analyzeMarkdown(text: string, options: AnalyzeOptions = {}): ScanResult {
	return analyzeText(text, { ...options, mask: options.mask ?? maskMarkdown(text) });
}

function applyGlobal(
	text: string,
	re: RegExp,
	skipRange: (start: number, end: number) => void,
): void {
	const flags = re.flags.includes("g") ? re.flags : re.flags + "g";
	const global = new RegExp(re.source, flags);
	let m: RegExpExecArray | null;
	while ((m = global.exec(text)) !== null) {
		skipRange(m.index, m.index + m[0].length);
		if (m[0].length === 0) global.lastIndex += 1;
	}
}
