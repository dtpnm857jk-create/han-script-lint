# Changelog

## 0.1.0

- Initial MVP: lint Markdown and plain text for mixed Simplified and Traditional Chinese
- Commands to scan the current file or the workspace
- Settings for target script, ignored characters, and lint-on-open / change / save
- Character tables derived from OpenCC character dictionaries
- Auto mode uses a majority vote of exclusive characters and only flags the minority script (`zh-Hant` / `zh-Hans` aliases supported)
