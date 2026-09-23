# Second Brain Lab 3D

**English** · [한국어](README.ko.md)

Explore the Markdown notes and resolved internal links in your current Obsidian vault as a 3D map. Click a point or a note title to inspect it, then open the file in Obsidian. The graph maps files and links; it does not represent a human brain or an AI model's reasoning.

This plugin adapts the visual language of the [AI Second Brain Lab practice repo](https://github.com/dante01yoon/ai-second-brain-lab). The practice repo still contains the bilingual sample vault, Codex and Claude Code Hook exercises, and optional local Laya experiment. This plugin is only the read-only 3D vault viewer.

## Features

- Interactive Three.js graph with rotate, zoom, search, and a Markdown detail pane
- Uses the **current vault** and Obsidian's resolved internal links; no Node.js server or Vite process
- Opens the selected Markdown file in Obsidian
- Automatically rebuilds after vault or link changes; manual reload is also available
- English and Korean interface, optional folder filter, and configurable note limit (50–5,000)
- Desktop Obsidian 1.13.7 or newer in the first release

## Install

Once accepted into the community directory, open **Settings → Community plugins → Browse**, search for **Second Brain Lab 3D**, then install and enable it. To install a release manually, copy `main.js`, `manifest.json`, and `styles.css` from the same tagged [GitHub release](https://github.com/dante01yoon/second-brain-lab-3d/releases) into `<vault>/.obsidian/plugins/second-brain-lab/`, restart Obsidian, and enable the plugin.

Use the ribbon icon or **Open 3D view** in the command palette. Select a point or a title to read a note; click **Open note** to open the actual file. Change language, folder, or note limit under **Settings → Second Brain Lab 3D**. The folder path is relative to the vault root. The first 1,000 notes are shown by default; the view reports how many are omitted by the limit.

## Privacy and scope

The plugin reads Markdown files through Obsidian's Vault API and links through its metadata cache. It does not edit files, save AI conversations, run Hooks or Laya, make network requests, or send vault content to any server. It does not require an account or payment and collects no telemetry. Opening a link already present inside a rendered note follows Obsidian's normal behavior.

Node positions are arranged to make folder groups easier to scan. Spatial distance has no semantic or scientific meaning. For very large vaults, narrow the folder filter or lower the note limit to keep the view responsive. Mobile has not been validated and is not included in the first release. The 3D renderer uses [Three.js](https://threejs.org/) under its MIT license; its copyright and license notice is included in the release bundle.

## Develop and verify

Requires Node.js 22+ and npm.

```bash
npm ci
npm run check
```

To try the plugin in a disposable vault, copy `main.js`, `manifest.json`, and `styles.css` into that vault's `.obsidian/plugins/second-brain-lab/` folder and enable it. The GitHub release assets must use a tag exactly matching `manifest.json`'s version. Source code is MIT licensed.
