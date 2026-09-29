import type { Editor, JSONContent } from '@tiptap/core'
import { createStandaloneHTML, printHTML } from '@/utils/print'

export type ExportFormat = 'html' | 'json' | 'markdown' | 'text' | 'rtf' | 'pdf'

export interface ExportResult {
  content: string
  mimeType: string
  extension: string
}

// ---------------------------------------------------------------------------
// Plain text
// ---------------------------------------------------------------------------

export function toPlainText(editor: Editor): string {
  return editor.getText({ blockSeparator: '\n\n' }).trim() + '\n'
}

// ---------------------------------------------------------------------------
// RTF
// ---------------------------------------------------------------------------

/** Escapes text for RTF, encoding non-ASCII characters as `\uN?`. */
export function escapeRTF(text: string): string {
  let out = ''
  for (const char of text) {
    const code = char.codePointAt(0)!
    if (char === '\\' || char === '{' || char === '}') out += `\\${char}`
    else if (char === '\n') out += '\\line '
    else if (char === '\t') out += '\\tab '
    else if (code > 127) {
      // RTF uses signed 16-bit code units
      for (const unit of String.fromCodePoint(code).split('')) {
        let value = unit.charCodeAt(0)
        if (value > 32767) value -= 65536
        out += `\\u${value}?`
      }
    } else out += char
  }
  return out
}

const HEADING_SIZES: Record<number, number> = { 1: 48, 2: 40, 3: 32, 4: 28, 5: 26, 6: 24 }

function inlineToRTF(nodes: JSONContent[] = []): string {
  return nodes
    .map(node => {
      if (node.type === 'hardBreak') return '\\line '
      if (node.type !== 'text' || !node.text) return ''

      let open = ''
      let close = ''
      for (const mark of node.marks ?? []) {
        if (mark.type === 'bold') open += '\\b '
        if (mark.type === 'italic') open += '\\i '
        if (mark.type === 'underline') open += '\\ul '
        if (mark.type === 'strike') open += '\\strike '
        if (mark.type === 'superscript') open += '\\super '
        if (mark.type === 'subscript') open += '\\sub '
        if (mark.type === 'code') open += '\\f1 '
      }
      if (open) close = '}'
      return `${open ? `{${open}` : ''}${escapeRTF(node.text)}${close}`
    })
    .join('')
}

function blockToRTF(node: JSONContent, depth = 0): string {
  const indent = depth * 360
  switch (node.type) {
    case 'paragraph':
      return `{\\pard\\li${indent}\\sa120 ${inlineToRTF(node.content)}\\par}\n`
    case 'heading': {
      const size = HEADING_SIZES[node.attrs?.level ?? 1] ?? 28
      return `{\\pard\\sb240\\sa120\\b\\fs${size} ${inlineToRTF(node.content)}\\par}\n`
    }
    case 'blockquote':
      return (node.content ?? []).map(child => blockToRTF(child, depth + 1)).join('')
    case 'codeBlock': {
      const code = node.attrs?.code ?? node.content?.map(c => c.text ?? '').join('') ?? ''
      return `{\\pard\\li${indent + 360}\\f1\\fs20 ${escapeRTF(code)}\\par}\n`
    }
    case 'bulletList':
    case 'orderedList':
    case 'taskList':
      return (node.content ?? [])
        .map((item, index) => {
          const bullet =
            node.type === 'orderedList'
              ? `${(node.attrs?.start ?? 1) + index}.`
              : node.type === 'taskList'
                ? item.attrs?.checked
                  ? '\\u9745?'
                  : '\\u9744?'
                : '\\bullet'
          const [first, ...rest] = item.content ?? []
          const firstLine = first ? inlineToRTF(first.content) : ''
          const head = `{\\pard\\li${indent + 360}\\fi-360\\sa60 ${bullet}\\tab ${firstLine}\\par}\n`
          return head + rest.map(child => blockToRTF(child, depth + 1)).join('')
        })
        .join('')
    case 'horizontalRule':
      return '{\\pard\\brdrb\\brdrs\\brdrw10\\brsp20 \\par}\n'
    case 'table':
      return (node.content ?? [])
        .map(row => {
          const cells = row.content ?? []
          const width = Math.floor(9000 / Math.max(cells.length, 1))
          const defs = cells.map((_, i) => `\\clbrdrt\\brdrs\\clbrdrl\\brdrs\\clbrdrb\\brdrs\\clbrdrr\\brdrs\\cellx${width * (i + 1)}`).join('')
          const body = cells
            .map(cell => `${(cell.content ?? []).map(c => inlineToRTF(c.content)).join('\\line ')}\\cell `)
            .join('')
          return `{\\trowd${defs} ${body}\\row}\n`
        })
        .join('')
    default:
      return node.content ? node.content.map(child => blockToRTF(child, depth)).join('') : ''
  }
}

/** Converts a Tiptap JSON document into a basic RTF document (headings, marks, lists, quotes, code, tables). */
export function jsonToRTF(doc: JSONContent): string {
  const body = (doc.content ?? []).map(node => blockToRTF(node)).join('')
  return `{\\rtf1\\ansi\\ansicpg1252\\deff0{\\fonttbl{\\f0\\fswiss Helvetica;}{\\f1\\fmodern Courier New;}}\\fs24\n${body}}`
}

// ---------------------------------------------------------------------------
// Export manager
// ---------------------------------------------------------------------------

export function serialize(editor: Editor, format: Exclude<ExportFormat, 'pdf'>, title = 'Document'): ExportResult {
  switch (format) {
    case 'html':
      return { content: createStandaloneHTML(editor.getHTML(), { title }), mimeType: 'text/html', extension: 'html' }
    case 'json':
      return { content: JSON.stringify(editor.getJSON(), null, 2), mimeType: 'application/json', extension: 'json' }
    case 'markdown':
      if (!editor.markdown) {
        throw new Error('[echo-editor] Markdown export requires the `Markdown` extension.')
      }
      return { content: editor.getMarkdown(), mimeType: 'text/markdown', extension: 'md' }
    case 'text':
      return { content: toPlainText(editor), mimeType: 'text/plain', extension: 'txt' }
    case 'rtf':
      return { content: jsonToRTF(editor.getJSON()), mimeType: 'application/rtf', extension: 'rtf' }
  }
}

export function downloadFile(content: string | Blob, filename: string, mimeType = 'text/plain') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: `${mimeType};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export async function exportDocument(editor: Editor, format: ExportFormat, filename = 'document'): Promise<void> {
  if (format === 'pdf') {
    await printHTML(editor.getHTML(), { title: filename })
    return
  }
  const { content, mimeType, extension } = serialize(editor, format, filename)
  downloadFile(content, `${filename}.${extension}`, mimeType)
}
