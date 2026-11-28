# Han Script Lint

Catch mixed Simplified and Traditional Chinese in Markdown and text files — locally, in the Problems panel, with no network calls.

Han Script Lint is a **local, offline** linter by **Lanternbay Studio**. It does not convert between the two written standards, and it does not expand search so that 软 and 軟 hit the same note. It does a narrower job: it finds **exclusive characters** (for example 软 vs 軟, 这 vs 這) and reports them as warnings in the editor and the Problems panel. Use it to keep a Markdown vault, manuscript, subtitle file, or plain-text draft consistent.

The extension does not send your text anywhere. Character classification is derived from [OpenCC](https://github.com/BYVoid/OpenCC) character dictionaries and runs entirely on your machine.

<!-- Screenshot placeholder: add media/screenshot-problems.png showing the editor and Problems panel flagging a mixed-script sentence (for example 这 vs 這). Do not publish this README with a broken image link; the PNG is not part of this draft. -->
<!-- ![Han Script Lint flagging mixed-script characters in the Problems panel](media/screenshot-problems.png) -->

## Install

The current published version is **0.1.0**, by **Lanternbay Studio** (`lanternbay.han-script-lint`). It is listed on [Open VSX](https://open-vsx.org/extension/lanternbay/han-script-lint). It is **not** listed on the Visual Studio Marketplace.

### Editors that use Open VSX (VSCodium and compatible editors)

1. Open the Extensions view.
2. Search for **Han Script Lint** (publisher: Lanternbay Studio).
3. Install from Open VSX.

You can also open the listing directly: [open-vsx.org/extension/lanternbay/han-script-lint](https://open-vsx.org/extension/lanternbay/han-script-lint).

### Visual Studio Code 1.85 or later

VS Code's built-in Extensions view searches the Visual Studio Marketplace, which does not carry this extension. Install the VSIX instead:

1. Download the `.vsix` from the [Open VSX listing](https://open-vsx.org/extension/lanternbay/han-script-lint) (Download) or from this repository's [Releases](https://github.com/dtpnm857jk-create/han-script-lint/releases). The published file name is `han-script-lint-0.1.0.vsix`.
2. Open the Extensions view, open the `…` menu, and choose **Install from VSIX…**.
3. Select the downloaded file.

Or from a terminal:

```bash
code --install-extension han-script-lint-0.1.0.vsix
```

A `.vsix` is also available on [itch.io](https://csvclinic.itch.io/han-script-lint-simplifiedtraditional-chinese-mix-checker-for-vs-code). Compatible editors such as VSCodium or Cursor can install the same VSIX with `codium --install-extension` or `cursor --install-extension`.

## Usage

1. Open a Markdown (`.md`) or plain-text (`.txt`) file.
2. With the default settings, the extension lints on open, while you type (debounced), and on save. Exclusive off-script characters are underlined and listed in the Problems panel.
3. Or run these commands from the Command Palette (`Han Script Lint`):
   - **Scan Current File** — lint the open file and show a summary
   - **Scan Workspace** — lint Markdown and `.txt` files in the workspace (up to `hanScriptLint.maxWorkspaceFiles`, default 2000)
   - **Clear Diagnostics** — clear the extension's warnings

### Example

In a Traditional-Chinese document (or with `hanScriptLint.targetScript` set to `traditional`):

```text
这是一份繁體文稿，裡面混入了简化字。
```

The exclusive Simplified characters `这` and `简` are reported. Characters shared by both standards are not. The extension does not rewrite the sentence for you, and it does not flag regional word choices that use only shared characters.

A workspace settings example:

```json
{
  "hanScriptLint.targetScript": "traditional",
  "hanScriptLint.ignoredCharacters": "台里后面只于并才云谷松范余涂姜冲准系板斗丑占干了"
}
```

## Features

- Warns on exclusive Simplified or Traditional Han characters in the active editor
- **Han Script Lint: Scan Current File** — lint the open file and show a summary
- **Han Script Lint: Scan Workspace** — lint Markdown and `.txt` files in the workspace
- **Han Script Lint: Clear Diagnostics** — clear warnings from this extension
- Skips YAML frontmatter, fenced and inline code, HTML comments, URLs, Markdown link destinations, and wikilink paths
- Settings for a target script and an ignore list for one-to-many characters such as 台/臺 and 里/裏

## Configuration

| Setting | Default | What it does |
| --- | --- | --- |
| `hanScriptLint.targetScript` | `auto` | Target written standard. `auto` counts exclusive characters, treats the larger side as the document majority, and only reports the minority script. A tie reports both. `traditional` (alias `zh-Hant`) reports exclusive Simplified characters. `simplified` (alias `zh-Hans`) reports exclusive Traditional characters. |
| `hanScriptLint.ignoredCharacters` | `台里后面只于并才云谷松范余涂姜冲准系板斗丑占干了` | Characters that are never used as exclusive-script evidence. The default covers common one-to-many mappings such as 台/臺 and 里/裏. |
| `hanScriptLint.lintOnOpen` | `true` | Lint Markdown and plain text files when they are opened. |
| `hanScriptLint.lintOnChange` | `true` | Re-lint the active editor while you type (debounced). |
| `hanScriptLint.lintOnSave` | `true` | Re-lint a file when it is saved. |
| `hanScriptLint.maxWorkspaceFiles` | `2000` | Maximum number of text files to scan in a workspace scan. |

## Known limitations

- Detection is character-based. It does not by itself convert regional vocabulary (for example 軟體 vs 软件). Mixed wording that uses only shared characters may be missed.
- Some characters are valid in both standards in particular words (皇后, 公里, 台灣). Those are ignored by default; you can change the ignore list in settings.
- Code, frontmatter, and URLs are skipped on purpose.

## Character data license

Exclusive-character tables are derived from OpenCC (`STCharacters.txt`, `TSCharacters.txt`), licensed under the Apache License 2.0. See `NOTICE` in the extension package.

---

## 中文說明

在 Markdown 與純文字檔裡找出簡繁混用，於問題面板列出——全程本機、離線，不把文稿送到任何伺服器。

Han Script Lint（簡繁混用檢查）是 **Lanternbay Studio** 發布的 linter。現有工具多半是把簡體轉成繁體（或相反），或讓搜尋同時命中「软」與「軟」。這個擴充做的比較窄：它會找出**簡體專用字或繁體專用字**（例如 软／軟、这／這），在編輯器裡標成警告，並列在問題面板。適合用來維持 Markdown 筆記庫、文稿、字幕或純文字草稿的用字一致。

字元判斷來自 OpenCC 字表，全部在本機執行。

<!-- 截圖占位：請於發布前放入 media/screenshot-problems.png（編輯器＋問題面板標出混用字的畫面）。本草稿不含圖檔，請勿帶著失效圖片連結上線。 -->

## 安裝

目前已發布的版本是 **0.1.0**，發布者為 **Lanternbay Studio**，列在 [Open VSX](https://open-vsx.org/extension/lanternbay/han-script-lint)。**尚未**上架 Visual Studio Marketplace。

**若編輯器使用 Open VSX**（例如 VSCodium）：在擴充功能檢視搜尋 **Han Script Lint**（發布者 Lanternbay Studio）並安裝。

**Visual Studio Code 1.85 或更新版本：** 內建擴充檢視搜尋的是 Marketplace，找不到本擴充。請改從 [Open VSX 頁面](https://open-vsx.org/extension/lanternbay/han-script-lint) 或本儲存庫 [Releases](https://github.com/dtpnm857jk-create/han-script-lint/releases) 下載 `han-script-lint-0.1.0.vsix`，再選 **Install from VSIX…**（從 VSIX 安裝）。也可以在終端機執行：

```bash
code --install-extension han-script-lint-0.1.0.vsix
```

itch.io 也提供同一個 [VSIX 下載頁](https://csvclinic.itch.io/han-script-lint-simplifiedtraditional-chinese-mix-checker-for-vs-code)。

## 使用方式

1. 開啟 Markdown（`.md`）或純文字（`.txt`）檔。
2. 預設會在開啟、輸入（有防抖）與儲存時檢查；專用字會在編輯器標出，並出現在問題面板。
3. 或從命令選擇區執行 **Han Script Lint: Scan Current File**、**Scan Workspace**、**Clear Diagnostics**。

**例子**（繁體文稿，或將 `hanScriptLint.targetScript` 設為 `traditional`）：

```text
这是一份繁體文稿，裡面混入了简化字。
```

這裡的簡體專用字 `这`、`简` 會被標出。兩種標準共用的字不會。擴充不會幫你整句轉換，也不會只憑地區詞彙（且用字都是共用字）就判定混用。

**功能重點：** 檢查目前檔案或工作區中的 Markdown 與 `.txt`；自動略過 YAML frontmatter、程式碼區塊與行內程式碼、HTML 註解、URL、Markdown 連結網址，以及 wikilink 路徑。可設定目標文字，以及不宜當成混用證據的忽略字（例如 台／臺、里／裏）。

**目標文字**（`hanScriptLint.targetScript`）

- **auto**（預設）：以專用字出現次數做多數決，只標出少數文字系的字。數量相同時兩邊都標。可用 `zh-Hant`／`zh-Hans` 作為繁體／簡體的別名。
- **traditional**：報告所有簡體專用字（適合繁體文稿）
- **simplified**：報告所有繁體專用字（適合簡體文稿）

忽略清單中的字不會被當成證據。預設為 `台里后面只于并才云谷松范余涂姜冲准系板斗丑占干了`。其他設定：`hanScriptLint.lintOnOpen`、`lintOnChange`、`lintOnSave`（預設皆為 true），以及 `hanScriptLint.maxWorkspaceFiles`（預設 2000）。

**系統需求：** Visual Studio Code 1.85 或更新版本，或可安裝 VSIX、或使用 Open VSX 的兼容編輯器。

**已知限制：** 偵測以字元為準，不會自動轉換地區詞彙（例如「軟體」與「软件」）。皇后、公里、台灣等預設忽略。程式碼、frontmatter 與 URL 會被略過。

---

This documentation was written with AI assistance. The linter itself does not call an AI service; it classifies characters locally from OpenCC tables.

本說明文件以 AI 輔助撰寫。擴充本身不會呼叫任何 AI 服務，字元判斷都在本機以 OpenCC 字表完成。
