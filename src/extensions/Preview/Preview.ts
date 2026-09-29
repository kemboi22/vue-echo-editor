import { Extension } from '@tiptap/core'
import ActionButton from '@/components/ActionButton.vue'
import type { GeneralOptions } from '@/type'
import { useTiptapStore } from '@/hooks'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    preview: {
      togglePreview: () => ReturnType
    }
  }
}
export interface PreviewOptions extends GeneralOptions<PreviewOptions> {}

export const Preview = Extension.create<PreviewOptions>({
  name: 'preview',
  addOptions() {
    return {
      ...(this.parent?.() as PreviewOptions),
      button: ({ editor, t }) => ({
        component: ActionButton,
        componentProps: {
          icon: 'Eye',
          action: () => {
            useTiptapStore(editor).togglePreview()
          },
          tooltip: t('editor.preview.tooltip'),
          isActive: () => useTiptapStore(editor).state.showPreview,
        },
      }),
    }
  },
  addCommands() {
    return {
      togglePreview:
        () =>
        ({ editor }) => {
          useTiptapStore(editor).togglePreview()
          return true
        },
    }
  },
})
