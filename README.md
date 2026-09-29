# Echo Editor

A fast, accessible, AI-ready WYSIWYG rich-text editor for **Vue 3**, built on [Tiptap 3](https://tiptap.dev) and [shadcn-vue](https://www.shadcn-vue.com/).

[![npm](https://img.shields.io/npm/v/vue-echo-editor.svg?label=vue-echo-editor)](https://www.npmjs.com/package/vue-echo-editor)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

English | [中文](./README.zh-CN.md) · [Documentation](https://echo-editor.dev) · [llms.txt](https://echo-editor.dev/llms.txt)

![Echo Editor](./screenshot/screenshot.png)

## Features

- **40+ extensions** — headings, lists, task lists, tables, columns, code blocks with syntax highlighting, images, video, embeds, find & replace, HTML source, print, fullscreen …
- **Toolbar, bubble menus, slash menu and drag handle** out of the box
- **Markdown** — use Markdown as your `v-model`, powered by the official `@tiptap/markdown`
- **Export** to PDF, Markdown, HTML, RTF, plain text and JSON
- **Real-time collaboration** with Y.js and live carets (`vue-echo-editor/collaboration`)
- **AI assistant** that streams from any model or backend
- **Plugins** — package extensions, buttons, slash commands and translations with `definePlugin()`
- **11 languages** with lazy loading and RTL support
- **Accessible** — labelled controls, keyboard-navigable toolbar, screen-reader announcements, touch-friendly
- **Fast** — Tiptap is shared with your app instead of bundled, feature UIs load on demand, and toolbar state updates at most once per frame
- **Isolated styles** — the stylesheet is scoped to the editor and never restyles your app

## Installation

```bash
pnpm add vue-echo-editor
# or: npm install vue-echo-editor / yarn add vue-echo-editor
```

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { EchoEditor, BaseKit, History, Heading, Bold, Italic, Underline, Link, BulletList, OrderedList } from 'vue-echo-editor'
import 'vue-echo-editor/style.css'

const content = ref('<p>Hello <strong>Echo Editor</strong>!</p>')

// Create extensions once — the toolbar follows this order
const extensions = [BaseKit, History, Heading, Bold, Italic, Underline, Link, BulletList, OrderedList]
</script>

<template>
  <EchoEditor v-model="content" :extensions="extensions" :max-height="480" />
</template>
```

Markdown instead of HTML:

```vue
<EchoEditor v-model="markdown" output="markdown" :extensions="[...extensions, Markdown]" />
```

Nuxt? Render the editor on the client (`RichEditor.client.vue` or `<ClientOnly>`) — see the [Nuxt guide](https://echo-editor.dev/getting-started/nuxt).

## Documentation

Full documentation lives at **[echo-editor.dev](https://echo-editor.dev)** (source in [`docs/`](./docs)):

- [Getting started](https://echo-editor.dev/getting-started/introduction) · [Migrating from 0.x](https://echo-editor.dev/getting-started/migration)
- [Configuration](https://echo-editor.dev/guide/configuration) · [Extensions](https://echo-editor.dev/extensions/overview) · [Plugins](https://echo-editor.dev/api/plugins)
- [Markdown](https://echo-editor.dev/guide/markdown) · [Export](https://echo-editor.dev/guide/export) · [Collaboration](https://echo-editor.dev/guide/collaboration) · [AI](https://echo-editor.dev/guide/ai)

### For AI assistants

The docs publish [`/llms.txt`](https://echo-editor.dev/llms.txt), [`/llms-full.txt`](https://echo-editor.dev/llms-full.txt) and an **MCP server** at `https://echo-editor.dev/mcp`:

```bash
claude mcp add --transport http echo-editor https://echo-editor.dev/mcp
```

## Upgrading from 0.x

Version 1.0 moves to Tiptap 3. Most apps only bump the version; see the [migration guide](https://echo-editor.dev/getting-started/migration) for custom extensions, the removed UMD build and the new default language (`en`).

## Development

```bash
pnpm install
pnpm dev            # examples app against the library source (HMR)
pnpm test           # unit + component tests
pnpm type:check
pnpm build:lib      # build lib/
pnpm examples       # build the library, then run the examples against lib/
pnpm docs:dev       # documentation site on http://localhost:3000
```

The repository is a pnpm workspace: the library at the root, [`examples/`](./examples) and [`docs/`](./docs).

## Contributing

Contributions are welcome — please open an issue or pull request. Run `pnpm lint`, `pnpm type:check` and `pnpm test` before submitting.

## Credits

[Tiptap](https://tiptap.dev) · [shadcn-vue](https://www.shadcn-vue.com/) · [reka-ui](https://reka-ui.com) · [Lucide](https://lucide.dev) · [shadcn-docs-nuxt](https://github.com/ZTL-UwU/shadcn-docs-nuxt)

## License

[MIT](./LICENSE)
