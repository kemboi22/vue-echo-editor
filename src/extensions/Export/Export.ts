import { Extension } from '@tiptap/core'
import ActionMoreButton from '@/extensions/MoreMark/components/ActionMoreButton.vue'
import type { Item } from '@/extensions/MoreMark/types'
import type { GeneralOptions } from '@/type'
import { exportDocument, serialize } from './exporters'
import type { ExportFormat } from './exporters'

export interface ExportOptions extends GeneralOptions<ExportOptions> {
  /**
   * Formats offered in the toolbar dropdown, in order.
   * `markdown` is only shown when the `Markdown` extension is registered.
   *
   * @default ['pdf', 'markdown', 'html', 'text', 'rtf', 'json']
   */
  formats: ExportFormat[]
  /**
   * File name (without extension) used for downloads.
   *
   * @default 'document'
   */
  filename: string | (() => string)
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    export: {
      /**
       * Export the document and download it (PDF opens the print dialog).
       */
      exportDocument: (format: ExportFormat, filename?: string) => ReturnType
    }
  }
}

const FORMAT_ICONS: Record<ExportFormat, Item['icon']> = {
  pdf: 'FileDown',
  markdown: 'Hash',
  html: 'FileCode',
  text: 'FileText',
  rtf: 'FileType',
  json: 'FileBraces',
}

export const Export = Extension.create<ExportOptions>({
  name: 'export',

  addOptions() {
    return {
      ...(this.parent?.() as ExportOptions),
      formats: ['pdf', 'markdown', 'html', 'text', 'rtf', 'json'],
      filename: 'document',
      button: ({ editor, extension, t }) => {
        const { formats, filename } = extension.options
        const name = typeof filename === 'function' ? filename() : filename
        const items: Item[] = formats
          .filter(format => format !== 'markdown' || !!editor.markdown)
          .map(format => ({
            title: t(`editor.export.${format}`),
            icon: FORMAT_ICONS[format],
            isActive: () => false,
            action: () => editor.commands.exportDocument(format, name),
          }))

        return {
          component: ActionMoreButton,
          componentProps: {
            icon: 'Download',
            tooltip: t('editor.export.tooltip'),
            disabled: editor.isEmpty,
            items,
          },
        }
      },
    }
  },

  addCommands() {
    return {
      exportDocument:
        (format, filename) =>
        ({ editor }) => {
          const name = filename ?? (typeof this.options.filename === 'function' ? this.options.filename() : this.options.filename)
          exportDocument(editor, format, name).catch(error => console.error('[echo-editor] Export failed', error))
          return true
        },
    }
  },
})

export { exportDocument, serialize }
export type { ExportFormat }
