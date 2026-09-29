import { Markdown as TiptapMarkdown } from '@tiptap/markdown'
import type { MarkdownExtensionOptions } from '@tiptap/markdown'

export type MarkdownOptions = MarkdownExtensionOptions

/**
 * Bidirectional Markdown support powered by the official `@tiptap/markdown` extension.
 *
 * - `editor.getMarkdown()` serialises the document
 * - `editor.commands.setContent(md, { contentType: 'markdown' })` parses Markdown
 * - `<EchoEditor output="markdown">` makes `v-model` read and write Markdown
 */
export const Markdown = TiptapMarkdown.configure({
  indentation: { style: 'space', size: 2 },
})

export default Markdown
