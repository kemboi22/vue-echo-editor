import { Extension } from '@tiptap/core'
import ActionButton from '@/components/ActionButton.vue'
import type { GeneralOptions } from '@/type'
import { useTiptapStore } from '@/hooks'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    specialCharacter: {
      toggleSpecialCharacter: () => ReturnType
      insertSpecialCharacter: (char: string) => ReturnType
    }
  }
}
export interface SpecialCharacterOptions extends GeneralOptions<SpecialCharacterOptions> {}

export const SpecialCharacter = Extension.create<SpecialCharacterOptions>({
  name: 'specialCharacter',
  addOptions() {
    return {
      ...(this.parent?.() as SpecialCharacterOptions),
      button: ({ editor, t }) => ({
        component: ActionButton,
        componentProps: {
          icon: 'Omega',
          action: () => {
            useTiptapStore(editor).toggleSpecialCharacter()
          },
          tooltip: t('editor.specialCharacter.tooltip'),
          isActive: () => useTiptapStore(editor).state.specialCharacter,
        },
      }),
    }
  },
  addCommands() {
    return {
      toggleSpecialCharacter:
        () =>
        ({ editor }) => {
          useTiptapStore(editor).toggleSpecialCharacter()
          return true
        },
      insertSpecialCharacter:
        (char: string) =>
        ({ editor }) => {
          try {
            // 直接使用insertContent，这是最安全的方法
            editor.commands.insertContent(char)
            return true
          } catch (error) {
            console.error('Error in insertSpecialCharacter command:', error)
            return false
          }
        },
    }
  },
})
