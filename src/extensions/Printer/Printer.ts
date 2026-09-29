import ActionButton from '@/components/ActionButton.vue'
import { useTiptapStore } from '@/hooks'
import type { GeneralOptions } from '@/type'
import { Extension } from '@tiptap/core'
export interface PrinterOptions extends GeneralOptions<PrinterOptions> {}

export const Printer = Extension.create<PrinterOptions>({
  name: 'printer',
  addOptions() {
    return {
      ...(this.parent?.() as PrinterOptions),
      button: ({ editor, extension, t }) => ({
        component: ActionButton,
        componentProps: {
          tooltip: t('editor.printer.tooltip'),
          action: () => useTiptapStore(editor).togglePrinter(),
          icon: 'Printer',
          shortcutKeys: ['mod', 'P'],
          isActive: () => useTiptapStore(editor).state.printer,
        },
      }),
    }
  },
})
