import { Extension } from '@tiptap/core'
import type { GeneralOptions } from '@/type'
import ActionButton from '@/components/ActionButton.vue'
import { useTiptapStore } from '@/hooks'
export interface FullscreenOptions extends GeneralOptions<FullscreenOptions> {}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fullscreen: {
      setFullscreen: () => ReturnType
    }
  }
}
export const Fullscreen = Extension.create<FullscreenOptions>({
  name: 'fullscreen',
  addOptions() {
    return {
      ...(this.parent?.() as FullscreenOptions),
      button: ({ editor, t }) => {
        const { isFullscreen } = useTiptapStore(editor)
        return {
          component: ActionButton,
          componentProps: {
            tooltip: isFullscreen.value ? t('editor.fullscreen.tooltip.exit') : t('editor.fullscreen.tooltip.fullscreen'),
            action: () => editor?.chain().setFullscreen().focus().run(),
            icon: isFullscreen.value ? 'Minimize' : 'Maximize',
            isActive: () => isFullscreen.value,
          },
        }
      },
    }
  },
  addCommands() {
    return {
      setFullscreen:
        () =>
        ({ editor }) => {
          useTiptapStore(editor).toggleFullscreen()
          return true
        },
    }
  },
  addKeyboardShortcuts() {
    return {
      F11: () => {
        useTiptapStore(this.editor).toggleFullscreen()
        return true
      },
      'Mod-F11': () => {
        useTiptapStore(this.editor).toggleFullscreen()
        return true
      },
    }
  },
})
