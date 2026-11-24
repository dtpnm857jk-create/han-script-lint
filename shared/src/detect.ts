import { DEFAULT_IGNORED_CHARS, SIMP_ONLY, TRAD_ONLY } from "./charset";

const SIMP_SET = new Set(SIMP_ONLY);
const TRAD_SET = new Set(TRAD_ONLY);
const HAN_RE = /\p{Script=Han}/u;

/** Canonical setting values. `zh-Hant` / `zh-Hans` are accepted aliases. */
export type TargetScript = "traditional" | "simplified" | "auto";
export type TargetScriptInput = TargetScript | "zh-Hant" | "zh-Hans";
export type ScriptKind = "none" | "shared" | "simplified" | "traditional" | "mixed";
export type DominantScript = "none" | "simplified" | "traditional" | "tie";
export type CharClass =
	| "other"
	| "shared-han"
	| "simplified-only"
	| "traditional-only"
	| "ignored";

export interface AnalyzeOptions {
	/** `auto` (default) uses a majority vote of exclusive characters. */
	target?: TargetScriptInput;
	ignoredChars?: string;
	/**
	 * When provided, only offsets whose mask value is true are inspected.
	 * Useful for skipping Markdown code, URLs, and frontmatter.
	 */
	mask?: boolean[];
}

export interface Finding {
	/** UTF-16 offset in the original string (VS Code / JS index). */
	index: number;
	length: number;
	/** 1-based */
	line: number;
	/** 1-based, UTF-16 columns */
	column: number;
	char: string;
	kind: "simplified-only" | "traditional-only";
	message: string;
	messageZh: string;
}

export interface ScanResult {
	script: ScriptKind;
	/** Majority of exclusive characters in the inspected (unmasked) text. */
	dominantScript: DominantScript;
	simplifiedOnlyCount: number;
	traditionalOnlyCount: number;
	sharedHanCount: number;
	ignoredCount: number;
	findings: Finding[];
}

export function normalizeTarget(target?: string | null): TargetScript {
	if (target === "traditional" || target === "zh-Hant") return "traditional";
	if (target === "simplified" || target === "zh-Hans") return "simplified";
	return "auto";
}

export function classifyChar(ch: string, ignored?: Set<string>): CharClass {
	if (ignored && ignored.has(ch)) {
		return HAN_RE.test(ch) ? "ignored" : "other";
	}
	if (SIMP_SET.has(ch)) return "simplified-only";
	if (TRAD_SET.has(ch)) return "traditional-only";
	if (HAN_RE.test(ch)) return "shared-han";
	return "other";
}

export function dominantScriptOf(
	simplifiedOnlyCount: number,
	traditionalOnlyCount: number,
): DominantScript {
	if (simplifiedOnlyCount === 0 && traditionalOnlyCount === 0) return "none";
	if (traditionalOnlyCount > simplifiedOnlyCount) return "traditional";
	if (simplifiedOnlyCount > traditionalOnlyCount) return "simplified";
	return "tie";
}

export function analyzeText(text: string, options: AnalyzeOptions = {}): ScanResult {
	const target = normalizeTarget(options.target);
	const ignored = new Set(options.ignoredChars ?? DEFAULT_IGNORED_CHARS);
	const mask = options.mask;
	const lineStarts = buildLineStarts(text);

	let simplifiedOnlyCount = 0;
	let traditionalOnlyCount = 0;
	let sharedHanCount = 0;
	let ignoredCount = 0;
	const exclusive: {
		index: number;
		length: number;
		char: string;
		kind: "simplified-only" | "traditional-only";
	}[] = [];

	let index = 0;
	for (const ch of text) {
		const length = ch.length;
		const inspect = !mask || mask[index] === true;
		if (inspect) {
			const kind = classifyChar(ch, ignored);
			if (kind === "simplified-only") {
				simplifiedOnlyCount += 1;
				exclusive.push({ index, length, char: ch, kind });
			} else if (kind === "traditional-only") {
				traditionalOnlyCount += 1;
				exclusive.push({ index, length, char: ch, kind });
			} else if (kind === "shared-han") {
				sharedHanCount += 1;
			} else if (kind === "ignored") {
				ignoredCount += 1;
			}
		}
		index += length;
	}

	const script = scriptOf(simplifiedOnlyCount, traditionalOnlyCount, sharedHanCount + ignoredCount);
	const dominantScript = dominantScriptOf(simplifiedOnlyCount, traditionalOnlyCount);
	const findings: Finding[] = [];
	for (const item of exclusive) {
		if (!shouldReport(target, dominantScript, item.kind)) continue;
		const { line, column } = offsetToPos(lineStarts, item.index);
		const { message, messageZh } = messages(target, dominantScript, item.kind, item.char);
		findings.push({
			index: item.index,
			length: item.length,
			line,
			column,
			char: item.char,
			kind: item.kind,
			message,
			messageZh,
		});
	}

	return {
		script,
		dominantScript,
		simplifiedOnlyCount,
		traditionalOnlyCount,
		sharedHanCount,
		ignoredCount,
		findings,
	};
}

export function summarize(result: ScanResult, target: TargetScriptInput = "auto"): string {
	const scriptLabel: Record<ScriptKind, string> = {
		none: "no Han characters",
		shared: "Han characters shared by both scripts",
		simplified: "Simplified Chinese",
		traditional: "Traditional Chinese",
		mixed: "mixed Simplified and Traditional Chinese",
	};
	const dominantLabel: Record<DominantScript, string> = {
		none: "none",
		simplified: "Simplified",
		traditional: "Traditional",
		tie: "tie",
	};
	const canonical = normalizeTarget(target);
	const head = `Script: ${scriptLabel[result.script]} (target: ${canonical}, majority: ${dominantLabel[result.dominantScript]})`;
	const counts = `Exclusive Simplified: ${result.simplifiedOnlyCount}, exclusive Traditional: ${result.traditionalOnlyCount}, shared: ${result.sharedHanCount}, ignored: ${result.ignoredCount}, reported issues: ${result.findings.length}`;
	return `${head}. ${counts}.`;
}

function scriptOf(simp: number, trad: number, shared: number): ScriptKind {
	if (simp > 0 && trad > 0) return "mixed";
	if (simp > 0) return "simplified";
	if (trad > 0) return "traditional";
	if (shared > 0) return "shared";
	return "none";
}

function shouldReport(
	target: TargetScript,
	dominant: DominantScript,
	kind: "simplified-only" | "traditional-only",
): boolean {
	if (target === "traditional") return kind === "simplified-only";
	if (target === "simplified") return kind === "traditional-only";
	// auto: flag only the minority script. A tie has no majority, so report both.
	if (dominant === "traditional") return kind === "simplified-only";
	if (dominant === "simplified") return kind === "traditional-only";
	if (dominant === "tie") return true;
	return false;
}

function messages(
	target: TargetScript,
	dominant: DominantScript,
	kind: "simplified-only" | "traditional-only",
	char: string,
): { message: string; messageZh: string } {
	if (kind === "simplified-only") {
		return {
			message: `Simplified-only character「${char}」${simpContextEn(target, dominant)}`,
			messageZh: `簡體專用字「${char}」${simpContextZh(target, dominant)}`,
		};
	}
	return {
		message: `Traditional-only character「${char}」${tradContextEn(target, dominant)}`,
		messageZh: `繁體專用字「${char}」${tradContextZh(target, dominant)}`,
	};
}

function simpContextEn(target: TargetScript, dominant: DominantScript): string {
	if (target === "traditional") return " in a Traditional Chinese context";
	if (dominant === "traditional") return " in a Traditional-majority document";
	if (dominant === "tie") return " in a document with no majority script";
	return " mixed into Traditional text";
}

function simpContextZh(target: TargetScript, dominant: DominantScript): string {
	if (target === "traditional") return "出現在預設為繁體的文稿中";
	if (dominant === "traditional") return "出現在以繁體為主的文稿中";
	if (dominant === "tie") return "出現在簡繁專用字數量相同的文稿中";
	return "與繁體字混用";
}

function tradContextEn(target: TargetScript, dominant: DominantScript): string {
	if (target === "simplified") return " in a Simplified Chinese context";
	if (dominant === "simplified") return " in a Simplified-majority document";
	if (dominant === "tie") return " in a document with no majority script";
	return " mixed into Simplified text";
}

function tradContextZh(target: TargetScript, dominant: DominantScript): string {
	if (target === "simplified") return "出現在預設為簡體的文稿中";
	if (dominant === "simplified") return "出現在以簡體為主的文稿中";
	if (dominant === "tie") return "出現在簡繁專用字數量相同的文稿中";
	return "與簡體字混用";
}

function buildLineStarts(text: string): number[] {
	const starts = [0];
	for (let i = 0; i < text.length; i++) {
		if (text.charCodeAt(i) === 10) starts.push(i + 1);
	}
	return starts;
}

function offsetToPos(lineStarts: number[], offset: number): { line: number; column: number } {
	let lo = 0;
	let hi = lineStarts.length - 1;
	while (lo <= hi) {
		const mid = (lo + hi) >> 1;
		const start = lineStarts[mid]!;
		const next = mid + 1 < lineStarts.length ? lineStarts[mid + 1]! : Infinity;
		if (offset < start) hi = mid - 1;
		else if (offset >= next) lo = mid + 1;
		else return { line: mid + 1, column: offset - start + 1 };
	}
	const last = lineStarts[lineStarts.length - 1] ?? 0;
	return { line: lineStarts.length, column: offset - last + 1 };
}
