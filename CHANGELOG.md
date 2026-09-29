# Changelog

## 1.0.0

Echo Editor 1.0 moves to **Tiptap 3** and rebuilds the internals for performance, accessibility and extensibility. See the [migration guide](https://echo-editor.dev/getting-started/migration).

### Breaking changes

- Upgraded to Tiptap 3 (`@tiptap/*@^3`), Vue 3.5, Vite 8 and TypeScript 6.
- `tippy.js` replaced by Floating UI; the internal `DragHandlePlugin` option `tippyOptions` is now `computePositionConfig`.
- UMD build removed; the package ships ESM (`lib/echo-editor.js`) and CommonJS (`lib/echo-editor.cjs`). Dependencies are no longer bundled.
- Default language is now `en` (was `zhHans`); `locale.setLang()` is async.
- UI state (fullscreen, preview, AI menu …) is per editor; `useTiptapStore(editor)` takes the editor outside components.
- `History` is based on Tiptap's `UndoRedo` (default depth 100).
- Icons moved from `lucide-vue-next` to `@lucide/vue`.
- The stylesheet is scoped to editor elements (`.echo-editor-ui`); content rendered outside the editor needs `class="echo-editor echo-editor-ui"`.

### Features

- `Markdown` extension (official `@tiptap/markdown`) and `output="markdown"` v-model.
- `Export` extension: PDF (print), Markdown, HTML, RTF, plain text and JSON.
- Real-time collaboration: `CollaborationKit`, `CollaborationUsers` and `useCollaborationUsers` from `vue-echo-editor/collaboration`.
- Plugin system: `definePlugin()` with toolbar buttons, slash commands, translations and setup hooks.
- 9 new languages (es, fr, de, pt, ru, ja, ko, ar, hi), lazy-loaded, RTL support, English fallback and `{param}` interpolation.
- `useEditorState()` composable, `useRovingToolbar()`, `announce()`, `printHTML()`.
- New props `label`, `autofocus`, `editorProps`; new events `create`, `focus`, `blur`.
- AI completions accept any async iterable (plain text, OpenAI-style or `{ text }` chunks).
- Documentation site with `llms.txt`, `llms-full.txt` and an MCP server.

### Performance

- Main entry ~49 KB gzipped (was ~437 KB) — Tiptap/ProseMirror are shared with the app.
- Feature UIs (menus, dialogs, AI, menubar), prism-code-editor and languages are lazy-loaded.
- Toolbar and bubble menu recompute at most once per animation frame instead of on every transaction.
- Cheaper `v-model` syncing, batched AI streaming and code-block updates, no redundant image resize transactions.
- Shared theme and locale state (no per-component listeners).

### Accessibility

- Every control has an accessible name; toolbars follow the WAI-ARIA toolbar pattern (arrow keys, Home/End).
- No more nested `<button>` elements in popover triggers.
- Labelled editing area, `aria-keyshortcuts`, live-region announcements, reduced-motion support.
- Touch devices: 40 px targets, scrollable toolbar, bubble menu below the native selection menu.

### Fixes

- `@enter` never fired.
- Ordered-list styles were lost when parsing HTML.
- Two editors on one page shared fullscreen / preview / AI state.
- The slash menu popup was global and leaked scroll listeners.
- The AI prompt form reloaded the page on submit.
- The source-code dialog leaked an editor instance on every open.
- `useLocale()` leaked a listener on every call.
- Theme colours were invalid under Tailwind 4 (transparent menus).
- Theme and editor styles leaked into host apps.
