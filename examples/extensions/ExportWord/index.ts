import { Extension } from '@tiptap/core'
import { saveAs } from 'file-saver'
import { DocxSerializer, defaultNodes, defaultMarks } from 'prosemirror-docx'
import { Packer } from 'docx'
import { definePlugin } from 'vue-echo-editor'
import ActionButton from './components/ActionButton.vue'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    exportWord: {
      exportToWord: (filename?: string) => ReturnType
    }
  }
}

const nodeSerializer = {
  ...defaultNodes,
  hardBreak: defaultNodes.hard_break,
  codeBlock: defaultNodes.code_block,
  orderedList: defaultNodes.ordered_list,
  listItem: defaultNodes.list_item,
  bulletList: defaultNodes.bullet_list,
  horizontalRule: defaultNodes.horizontal_rule,
  image(state: any, node: any) {
    // Images are skipped in this simple example
    state.renderInline(node)
    state.closeBlock(node)
  },
}

const docxSerializer = new DocxSerializer(nodeSerializer, defaultMarks)

const ExportWordCommands = Extension.create({
  name: 'exportWordCommands',
  addCommands() {
    return {
      exportToWord:
        (filename = 'document.docx') =>
        ({ editor }) => {
          const wordDocument = docxSerializer.serialize(editor.state.doc, {
            getImageBuffer: async (src: string) => new Uint8Array(await (await fetch(src)).arrayBuffer()),
          } as any)
          Packer.toBlob(wordDocument).then(blob => saveAs(blob, filename))
          return true
        },
    }
  },
})

/**
 * Example third-party plugin built with `definePlugin`: a command, a toolbar button and translations.
 */
export const ExportWord = definePlugin({
  name: 'exportWord',
  extensions: [ExportWordCommands],
  locales: {
    en: { 'exportWord.tooltip': 'Export to Word' },
    zhHans: { 'exportWord.tooltip': '导出为 Word' },
    fr: { 'exportWord.tooltip': 'Exporter vers Word' },
    es: { 'exportWord.tooltip': 'Exportar a Word' },
  },
  toolbar: ({ t }) => ({
    component: ActionButton,
    componentProps: {
      tooltip: t('exportWord.tooltip'),
    },
  }),
})
