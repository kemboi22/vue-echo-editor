# Echo Editor

一个快速、无障碍、支持 AI 的 **Vue 3** 富文本编辑器，基于 [Tiptap 3](https://tiptap.dev) 和 [shadcn-vue](https://www.shadcn-vue.com/) 构建。

[![npm](https://img.shields.io/npm/v/vue-echo-editor.svg?label=vue-echo-editor)](https://www.npmjs.com/package/vue-echo-editor)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

[English](./README.md) | 中文 · [文档](https://echo-editor.dev) · [llms.txt](https://echo-editor.dev/llms.txt)

![Echo Editor](./screenshot/screenshot.png)

## 特性

- **40+ 扩展**：标题、列表、任务列表、表格、分栏、带语法高亮的代码块、图片、视频、嵌入、查找替换、HTML 源码、打印、全屏……
- 开箱即用的**工具栏、气泡菜单、斜杠菜单和拖拽手柄**
- **Markdown**：通过官方 `@tiptap/markdown` 将 Markdown 作为 `v-model`
- **导出**为 PDF、Markdown、HTML、RTF、纯文本和 JSON
- 基于 Y.js 的**实时协作**与远程光标（`vue-echo-editor/collaboration`）
- 支持任意模型或后端流式输出的 **AI 助手**
- **插件系统**：使用 `definePlugin()` 打包扩展、按钮、斜杠命令和翻译
- **11 种语言**，按需加载，支持 RTL
- **无障碍**：带标签的控件、键盘导航工具栏、屏幕阅读器播报、触屏友好
- **高性能**：Tiptap 与应用共享而非打包、功能界面按需加载、工具栏每帧最多更新一次
- **样式隔离**：样式表仅作用于编辑器，不会影响你的应用

## 安装

```bash
pnpm add vue-echo-editor
```

## 使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { EchoEditor, BaseKit, History, Heading, Bold, Italic, Underline, Link, BulletList, OrderedList, locale } from 'vue-echo-editor'
import 'vue-echo-editor/style.css'

// 默认语言为英文，切换为中文：
locale.setLang('zhHans')

const content = ref('<p>你好，<strong>Echo Editor</strong>！</p>')
const extensions = [BaseKit, History, Heading, Bold, Italic, Underline, Link, BulletList, OrderedList]
</script>

<template>
  <EchoEditor v-model="content" :extensions="extensions" :max-height="480" />
</template>
```

## 文档

完整文档见 **[echo-editor.dev](https://echo-editor.dev)**（源码位于 [`docs/`](./docs)），包括[从 0.x 迁移](https://echo-editor.dev/getting-started/migration)、[配置](https://echo-editor.dev/guide/configuration)、[扩展](https://echo-editor.dev/extensions/overview)、[协作](https://echo-editor.dev/guide/collaboration)和 [AI](https://echo-editor.dev/guide/ai)。

文档站点同时提供 `/llms.txt`、`/llms-full.txt` 以及位于 `/mcp` 的 MCP 服务器，供 AI 编程助手使用。

## 开发

```bash
pnpm install
pnpm dev          # 基于源码运行示例（热更新）
pnpm test
pnpm build:lib
pnpm docs:dev
```

## 许可证

[MIT](./LICENSE)
