# Han Script Lint

**[Download on itch.io](https://csvclinic.itch.io/han-script-lint-simplifiedtraditional-chinese-mix-checker-for-vs-code)**

Han Script Lint is a local, offline linter for **mixed Simplified and Traditional Chinese**, by **Lanternbay Studio**.

Many tools convert between the two written standards, or expand search so that 软 and 軟 hit the same note. This extension does a narrower job: it finds **exclusive characters** (for example 软 vs 軟, 这 vs 這) and reports them as warnings in the editor and the Problems panel. Use it to keep a Markdown vault, manuscript, subtitle file, or plain-text draft consistent.

The extension does not send your text anywhere. Character classification is derived from [OpenCC](https://github.com/BYVoid/OpenCC) character dictionaries and runs entirely on your machine.

## Features

- Warns on exclusive Simplified or Traditional Han characters in the active editor
- **Han Script Lint: Scan Current File** — lint the open file and show a summary
- **Han Script Lint: Scan Workspace** — lint Markdown and `.txt` files in the workspace
- Skips YAML frontmatter, fenced and inline code, HTML comments, URLs, Markdown link destinations, and wikilink paths
- Settings for a target script and an ignore list for one-to-many characters such as 台/臺 and 里/裏

## Target script

Setting: `hanScriptLint.targetScript`

- **auto** (default): count exclusive characters, treat the larger side as the document majority, and only report the minority script. A tie reports both. Aliases: `zh-Hant` = traditional, `zh-Hans` = simplified.
- **traditional**: report exclusive Simplified characters (for Traditional Chinese writing)
- **simplified**: report exclusive Traditional characters (for Simplified Chinese writing)

Characters in the ignore list are never used as evidence. The default list is `台里后面只于并才云谷松范余涂姜冲准系板斗丑占干了`.

## Requirements

Visual Studio Code 1.85 or later, or a compatible editor that can install a VSIX (for example VSCodium).

## Install

Han Script Lint is published by **Lanternbay Studio**.

Download the `.vsix` from this repository's [GitHub Release v0.1.0](https://github.com/dtpnm857jk-create/han-script-lint/releases/tag/v0.1.0) or from [itch.io](https://csvclinic.itch.io/han-script-lint-simplifiedtraditional-chinese-mix-checker-for-vs-code), then install it in Visual Studio Code:

1. Open the Extensions view.
2. Click the `…` menu at the top of the view and choose **Install from VSIX…**.
3. Select the downloaded `han-script-lint-0.1.0.vsix`.

Or from a terminal:

```bash
code --install-extension han-script-lint-0.1.0.vsix
```

Compatible editors such as VSCodium or Cursor can install the same VSIX with their equivalent command (`codium --install-extension` or `cursor --install-extension`).

## Extension settings

- `hanScriptLint.targetScript`
- `hanScriptLint.ignoredCharacters`
- `hanScriptLint.lintOnOpen`
- `hanScriptLint.lintOnChange`
- `hanScriptLint.lintOnSave`
- `hanScriptLint.maxWorkspaceFiles`

## Known limitations

- Detection is character-based. It does not by itself convert regional vocabulary (for example 軟體 vs 软件). Mixed wording that uses only shared characters may be missed.
- Some characters are valid in both standards in particular words (皇后, 公里, 台灣). Those are ignored by default; you can change the ignore list in settings.
- Code, frontmatter, and URLs are skipped on purpose.

## Character data license

Exclusive-character tables are derived from OpenCC (`STCharacters.txt`, `TSCharacters.txt`), licensed under the Apache License 2.0. See `NOTICE` in the extension package.

---

## 中文說明

**[在 itch.io 下載](https://csvclinic.itch.io/han-script-lint-simplifiedtraditional-chinese-mix-checker-for-vs-code)**

Han Script Lint（簡繁混用檢查）是一個**本機、離線**的 linter，用來找出文稿裡的簡繁混用，由 **Lanternbay Studio** 發布。

現有工具多半是把簡體轉成繁體（或相反），或讓搜尋同時命中「软」與「軟」。這個擴充做的比較窄：它會找出**簡體專用字或繁體專用字**（例如 软／軟、这／這），在編輯器裡標成警告，並列在問題面板。適合用來維持 Markdown 筆記庫、文稿、字幕或純文字草稿的用字一致。

擴充不會把文件內容傳送到任何伺服器。字元判斷來自 OpenCC 字表，全部在本機執行。

**功能**

- 在目前編輯器標出簡體專用字或繁體專用字
- 命令 **Han Script Lint: Scan Current File** — 檢查目前檔案並顯示摘要
- 命令 **Han Script Lint: Scan Workspace** — 檢查工作區中的 Markdown 與 `.txt`
- 自動略過 YAML frontmatter、程式碼區塊與行內程式碼、HTML 註解、URL、Markdown 連結網址，以及 wikilink 路徑
- 可設定目標文字，以及「兩岸都常見、不宜當成混用證據」的忽略字（例如 台／臺、里／裏）

**目標文字**（`hanScriptLint.targetScript`）

- **auto**（預設）：以專用字出現次數做多數決，只標出少數文字系的字。數量相同時兩邊都標。可用 `zh-Hant`／`zh-Hans` 作為繁體／簡體的別名。
- **traditional**：報告所有簡體專用字（適合繁體文稿）
- **simplified**：報告所有繁體專用字（適合簡體文稿）

忽略清單中的字不會被當成證據。預設為 `台里后面只于并才云谷松范余涂姜冲准系板斗丑占干了`。

**系統需求：** Visual Studio Code 1.85 或更新版本，或可安裝 VSIX 的兼容編輯器。

## 安裝

請先從本儲存庫的 [GitHub Release v0.1.0](https://github.com/dtpnm857jk-create/han-script-lint/releases/tag/v0.1.0) 或 [itch.io](https://csvclinic.itch.io/han-script-lint-simplifiedtraditional-chinese-mix-checker-for-vs-code) 下載 `.vsix`，再在 VS Code 中安裝：

1. 開啟擴充功能檢視。
2. 點檢視上方的 `…` 選單，選擇 **Install from VSIX…**（從 VSIX 安裝）。
3. 選取下載的 `han-script-lint-0.1.0.vsix`。

或在終端機執行：

```bash
code --install-extension han-script-lint-0.1.0.vsix
```

**已知限制：** 偵測以字元為準，不會自動轉換地區詞彙（例如「軟體」與「软件」）。皇后、公里、台灣等預設忽略。程式碼、frontmatter 與 URL 會被略過。
