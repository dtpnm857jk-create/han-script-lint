import esbuild from "esbuild";
import process from "process";

const prod = process.argv.includes("production") || process.argv.includes("--production");

await esbuild.build({
	entryPoints: ["src/extension.ts"],
	bundle: true,
	platform: "node",
	external: ["vscode"],
	format: "cjs",
	target: "es2021",
	outfile: "extension.js",
	sourcemap: prod ? false : "linked",
	minify: prod,
	treeShaking: true,
	logLevel: "info",
	banner: {
		js: "/* Bundled by esbuild from src/ plus shared. Source is in the repository. */",
	},
});
