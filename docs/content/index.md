---
title: Home
navigation: false
description: A fast, AI-ready rich-text editor for Vue 3, built on Tiptap 3 and shadcn-vue.
---

::hero
---
announcement:
  title: 'v1.0 — Tiptap 3, Markdown, collaboration & MCP'
  icon: '🎉'
  to: /getting-started/migration
actions:
  - name: Get started
    to: /getting-started/introduction
  - name: GitHub
    variant: outline
    to: https://github.com/kemboi22/vue-echo-editor
    leftIcon: 'lucide:github'
  - name: llms.txt
    variant: ghost
    to: /llms.txt
    target: _blank
    leftIcon: 'lucide:bot'
---

#title
The rich-text editor for Vue

#description
Echo Editor is a fast, accessible, AI-ready WYSIWYG editor built on Tiptap 3 and shadcn-vue. :br 40+ extensions, Markdown, export, real-time collaboration and 11 languages.
::

::editor-playground{:show-output="true"}
::

::card-group{:cols="3"}
  ::card
  ---
  title: Tiptap 3 powered
  icon: lucide:zap
  to: /guide/performance
  ---
  Built on the latest Tiptap and ProseMirror with Floating UI menus, frame-batched toolbar updates and lazily loaded feature UIs.
  ::

  ::card
  ---
  title: 40+ extensions
  icon: lucide:blocks
  to: /extensions/overview
  ---
  Tables, columns, code blocks, images, video, task lists, find & replace, source code, print and more.
  ::

  ::card
  ---
  title: Markdown & export
  icon: lucide:file-down
  to: /guide/markdown
  ---
  Use Markdown as your `v-model`, and export to PDF, Markdown, HTML, RTF, plain text or JSON.
  ::

  ::card
  ---
  title: Real-time collaboration
  icon: lucide:users
  to: /guide/collaboration
  ---
  Y.js-based collaborative editing with live carets. Works with y-websocket, Hocuspocus, y-webrtc and Tiptap Cloud.
  ::

  ::card
  ---
  title: AI assistant
  icon: lucide:sparkles
  to: /guide/ai
  ---
  Bring any model — OpenAI, Claude or your own backend. Stream completions into a polished inline AI menu.
  ::

  ::card
  ---
  title: Built for AI agents
  icon: lucide:bot
  to: /ai/mcp
  ---
  These docs ship `llms.txt`, `llms-full.txt` and an MCP server so coding assistants can integrate the editor for you.
  ::
::
