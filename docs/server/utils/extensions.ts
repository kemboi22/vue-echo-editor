export interface ExtensionInfo {
  name: string
  description: string
  category: 'core' | 'marks' | 'nodes' | 'formatting' | 'media' | 'tools' | 'ai' | 'collaboration'
  /** Short configuration example */
  example?: string
}

/** Machine-readable catalogue of the built-in extensions, served through MCP. */
export const extensions: ExtensionInfo[] = [
  { name: 'BaseKit', category: 'core', description: 'Required. Document, paragraph, text, placeholder, character count, focus, drop/gap cursor, trailing node and the bubble menu.', example: "BaseKit.configure({ placeholder: { placeholder: 'Write…' }, characterCount: { limit: 5000 } })" },
  { name: 'History', category: 'core', description: 'Undo / redo (Tiptap UndoRedo). Do not combine with CollaborationKit.', example: 'History.configure({ depth: 100 })' },
  { name: 'Bold', category: 'marks', description: 'Bold text (Mod-B).' },
  { name: 'Italic', category: 'marks', description: 'Italic text (Mod-I).' },
  { name: 'Underline', category: 'marks', description: 'Underlined text (Mod-U).' },
  { name: 'Strike', category: 'marks', description: 'Strikethrough (Mod-Shift-S).' },
  { name: 'Code', category: 'marks', description: 'Inline code (Mod-E).' },
  { name: 'Link', category: 'marks', description: 'Links with an edit popover and a link bubble menu.' },
  { name: 'Color', category: 'marks', description: 'Text colour with a colour picker.' },
  { name: 'Highlight', category: 'marks', description: 'Background highlight colour.' },
  { name: 'MoreMark', category: 'marks', description: 'Dropdown with subscript, superscript and inline code.' },
  { name: 'SubAndSuperScript', category: 'marks', description: 'Separate subscript and superscript buttons.' },
  { name: 'FontFamily', category: 'formatting', description: 'Font family dropdown.' },
  { name: 'FontSize', category: 'formatting', description: 'Font size dropdown.' },
  { name: 'LineHeight', category: 'formatting', description: 'Line height dropdown.' },
  { name: 'TextAlign', category: 'formatting', description: 'Left / center / right / justify.', example: "TextAlign.configure({ types: ['heading', 'paragraph', 'image'] })" },
  { name: 'Indent', category: 'formatting', description: 'Indent / outdent blocks (Tab / Shift-Tab).' },
  { name: 'Clear', category: 'formatting', description: 'Remove all formatting.' },
  { name: 'FormatPainter', category: 'formatting', description: 'Copy formatting from one selection to another.' },
  { name: 'Heading', category: 'nodes', description: 'Headings H1–H6 with a dropdown.' },
  { name: 'BulletList', category: 'nodes', description: 'Bullet lists with disc / circle / square styles.' },
  { name: 'OrderedList', category: 'nodes', description: 'Ordered lists with decimal, roman, latin and CJK styles.' },
  { name: 'TaskList', category: 'nodes', description: 'Checkbox task lists.', example: 'TaskList.configure({ taskItem: { nested: true } })' },
  { name: 'Blockquote', category: 'nodes', description: 'Block quotes.' },
  { name: 'CodeBlock', category: 'nodes', description: 'Code blocks with syntax highlighting (prism-code-editor, lazily loaded), line numbers and word wrap.' },
  { name: 'HorizontalRule', category: 'nodes', description: 'Horizontal divider.' },
  { name: 'Table', category: 'nodes', description: 'Tables with a table bubble menu, merge/split and cell background colours.' },
  { name: 'Columns', category: 'nodes', description: 'Two, three or four column layouts.' },
  { name: 'Image', category: 'media', description: 'Resizable, alignable, flippable images with an image bubble menu.' },
  { name: 'ImageUpload', category: 'media', description: 'Upload images through your own `upload(file)` function.', example: 'ImageUpload.configure({ upload: async file => (await uploadToS3(file)).url })' },
  { name: 'Video', category: 'media', description: 'Embedded videos.' },
  { name: 'VideoUpload', category: 'media', description: 'Upload videos through your own `upload(files)` function.' },
  { name: 'Iframe', category: 'media', description: 'Embed services (YouTube, Figma, CodePen, …).' },
  { name: 'SlashCommand', category: 'tools', description: 'Notion-style "/" command menu. Customise with `getCommandGroups`.' },
  { name: 'FindAndReplace', category: 'tools', description: 'Find and replace panel (Mod-F).' },
  { name: 'SourceCode', category: 'tools', description: 'Edit the HTML source in a dialog.' },
  { name: 'Preview', category: 'tools', description: 'Read-only preview dialog.' },
  { name: 'Printer', category: 'tools', description: 'Print the document (Mod-P).' },
  { name: 'Fullscreen', category: 'tools', description: 'Fullscreen editing (F11).' },
  { name: 'SpecialCharacter', category: 'tools', description: 'Special character picker.' },
  { name: 'ImportWord', category: 'tools', description: 'Import .docx files through your own conversion endpoint.' },
  { name: 'Markdown', category: 'tools', description: 'Bidirectional Markdown (official @tiptap/markdown). Enables `output="markdown"` and `editor.getMarkdown()`.' },
  { name: 'Export', category: 'tools', description: 'Export to PDF (print), Markdown, HTML, plain text, RTF and JSON.', example: "Export.configure({ formats: ['pdf', 'markdown', 'html'], filename: 'report' })" },
  { name: 'AI', category: 'ai', description: 'AI writing assistant with shortcuts. Provide a `completions(history, signal)` function that returns an async iterable of text chunks.' },
  { name: 'CollaborationKit', category: 'collaboration', description: 'Real-time collaboration with Y.js and remote carets. Import from `vue-echo-editor/collaboration`.', example: "CollaborationKit.configure({ document: ydoc, provider, user: { name: 'Ada', color: '#f97316' } })" },
]
