import * as vscode from "vscode";
import {
	analyzeMarkdown,
	analyzeText,
	summarize,
	type Finding,
	normalizeTarget,
	type TargetScript,
} from "../shared/src/index";

const MARKDOWN_LANGS = new Set(["markdown", "mdx"]);

export function activate(context: vscode.ExtensionContext): void {
	const diagnostics = vscode.languages.createDiagnosticCollection("han-script-lint");
	const output = vscode.window.createOutputChannel("Han Script Lint");
	const debounce = new Map<string, NodeJS.Timeout>();

	context.subscriptions.push(diagnostics, output);

	const lintEditor = (editor: vscode.TextEditor | undefined) => {
		if (!editor) return;
		if (!isSupported(editor.document)) return;
		applyDocument(diagnostics, editor.document);
	};

	context.subscriptions.push(
		vscode.commands.registerCommand("hanScriptLint.scanCurrentFile", async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				void vscode.window.showWarningMessage("Han Script Lint: no active editor.");
				return;
			}
			const result = applyDocument(diagnostics, editor.document);
			const target = getTarget();
			const summary = summarize(result, target);
			output.appendLine(`${editor.document.uri.fsPath}: ${summary}`);
			void vscode.window.showInformationMessage(`Han Script Lint: ${summary}`);
		}),
		vscode.commands.registerCommand("hanScriptLint.scanWorkspace", async () => {
			await scanWorkspace(diagnostics, output);
		}),
		vscode.commands.registerCommand("hanScriptLint.clearDiagnostics", () => {
			diagnostics.clear();
		}),
		vscode.workspace.onDidOpenTextDocument((doc) => {
			if (getConfig().get<boolean>("lintOnOpen", true) && isSupported(doc)) {
				applyDocument(diagnostics, doc);
			}
		}),
		vscode.workspace.onDidSaveTextDocument((doc) => {
			if (getConfig().get<boolean>("lintOnSave", true) && isSupported(doc)) {
				applyDocument(diagnostics, doc);
			}
		}),
		vscode.workspace.onDidChangeTextDocument((event) => {
			if (!getConfig().get<boolean>("lintOnChange", true)) return;
			if (!isSupported(event.document)) return;
			const key = event.document.uri.toString();
			const prev = debounce.get(key);
			if (prev) clearTimeout(prev);
			debounce.set(
				key,
				setTimeout(() => {
					debounce.delete(key);
					applyDocument(diagnostics, event.document);
				}, 300),
			);
		}),
		vscode.workspace.onDidCloseTextDocument((doc) => {
			diagnostics.delete(doc.uri);
		}),
		vscode.workspace.onDidChangeConfiguration((event) => {
			if (!event.affectsConfiguration("hanScriptLint")) return;
			for (const editor of vscode.window.visibleTextEditors) {
				if (isSupported(editor.document)) applyDocument(diagnostics, editor.document);
			}
		}),
	);

	if (getConfig().get<boolean>("lintOnOpen", true)) {
		for (const editor of vscode.window.visibleTextEditors) lintEditor(editor);
	}
}

export function deactivate(): void {}

function getConfig() {
	return vscode.workspace.getConfiguration("hanScriptLint");
}

function getTarget(): TargetScript {
	return normalizeTarget(getConfig().get<string>("targetScript", "auto"));
}

function getIgnored(): string {
	return getConfig().get<string>("ignoredCharacters", "台里后面只于并才云谷松范余涂姜冲准系板斗丑占干了");
}

function isSupported(document: vscode.TextDocument): boolean {
	if (document.uri.scheme !== "file" && document.uri.scheme !== "untitled") return false;
	return MARKDOWN_LANGS.has(document.languageId) || document.languageId === "plaintext";
}

function analyzeDocument(document: vscode.TextDocument) {
	const options = { target: getTarget(), ignoredChars: getIgnored() };
	const text = document.getText();
	if (MARKDOWN_LANGS.has(document.languageId)) return analyzeMarkdown(text, options);
	return analyzeText(text, options);
}

function applyDocument(
	diagnostics: vscode.DiagnosticCollection,
	document: vscode.TextDocument,
) {
	const result = analyzeDocument(document);
	const items = result.findings.map((finding) => toDiagnostic(document, finding));
	diagnostics.set(document.uri, items);
	return result;
}

function toDiagnostic(document: vscode.TextDocument, finding: Finding): vscode.Diagnostic {
	const start = document.positionAt(finding.index);
	const end = document.positionAt(finding.index + finding.length);
	const diagnostic = new vscode.Diagnostic(
		new vscode.Range(start, end),
		`${finding.message} / ${finding.messageZh}`,
		vscode.DiagnosticSeverity.Warning,
	);
	diagnostic.source = "Han Script Lint";
	diagnostic.code = finding.kind;
	return diagnostic;
}

async function scanWorkspace(
	diagnostics: vscode.DiagnosticCollection,
	output: vscode.OutputChannel,
): Promise<void> {
	const maxFiles = getConfig().get<number>("maxWorkspaceFiles", 2000);
	const pattern = "**/*.{md,mdx,txt,markdown}";
	const exclude = "**/{node_modules,.git,.vscode,package-proof,screenshots-proof}/**";
	const files = await vscode.workspace.findFiles(pattern, exclude, maxFiles);
	let issueFiles = 0;
	let issueCount = 0;

	await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: "Han Script Lint: scanning workspace",
			cancellable: true,
		},
		async (progress, token) => {
			let done = 0;
			for (const uri of files) {
				if (token.isCancellationRequested) break;
				const document = await vscode.workspace.openTextDocument(uri);
				if (!isSupported(document) && document.languageId !== "plaintext") {
					// still analyze markdown-like files even if language id is unexpected
				}
				const result = applyDocument(diagnostics, document);
				if (result.findings.length > 0) {
					issueFiles += 1;
					issueCount += result.findings.length;
					output.appendLine(
						`${uri.fsPath}: ${summarize(result, getTarget())}`,
					);
				}
				done += 1;
				if (done % 20 === 0) {
					progress.report({ message: `${done} / ${files.length}` });
				}
			}
		},
	);

	const summary = `Scanned ${files.length} files. ${issueFiles} files have ${issueCount} issue(s).`;
	output.appendLine(summary);
	output.show(true);
	void vscode.window.showInformationMessage(`Han Script Lint: ${summary}`);
}
