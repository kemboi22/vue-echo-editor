import { Extension } from '@tiptap/core'
import ActionButton from '@/components/ActionButton.vue'
import type { GeneralOptions } from '@/type'
import { useTiptapStore } from '@/hooks'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    sourceCode: {
      toggleSourceCode: () => ReturnType
      insertSourceCode: (char: string) => ReturnType
    }
  }
}
export interface SourceCodeOptions extends GeneralOptions<SourceCodeOptions> {}

export const SourceCode = Extension.create<SourceCodeOptions>({
  name: 'sourceCode',
  addOptions() {
    return {
      ...(this.parent?.() as SourceCodeOptions),
      button: ({ editor, t }) => ({
        component: ActionButton,
        componentProps: {
          icon: 'CodeXml',
          action: () => {
            useTiptapStore(editor).toggleSourceCode()
          },
          tooltip: t('editor.sourceCode.tooltip'),
          isActive: () => useTiptapStore(editor).state.sourceCode,
        },
      }),
    }
  },
  addCommands() {
    return {
      toggleSourceCode:
        () =>
        ({ editor }) => {
          useTiptapStore(editor).toggleSourceCode()
          return true
        },
    }
  },
})
