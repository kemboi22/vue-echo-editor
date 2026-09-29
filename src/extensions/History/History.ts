import type { UndoRedoOptions as TiptapUndoRedoOptions } from '@tiptap/extensions'
import { UndoRedo as TiptapUndoRedo } from '@tiptap/extensions'

import ActionButton from '@/components/ActionButton.vue'

import type { GeneralOptions } from '@/type'

export interface HistoryOptions extends TiptapUndoRedoOptions, GeneralOptions<HistoryOptions> {}

/**
 * Undo / redo support (Tiptap v3 `UndoRedo`), with toolbar buttons.
 *
 * The extension keeps the name `history` for backwards compatibility.
 * Do not combine it with the `Collaboration` extension, which ships its own undo manager.
 */
export const History = TiptapUndoRedo.extend<HistoryOptions>({
  name: 'history',

  addOptions() {
    return {
      ...(this.parent?.() as HistoryOptions),
      depth: 100,
      button: ({ editor, t }) => {
        const actions = ['undo', 'redo'] as const
        return actions.map(item => ({
          component: ActionButton,
          componentProps: {
            action: () => {
              if (item === 'undo') editor?.chain().undo().focus().run()
              if (item === 'redo') editor?.chain().redo().focus().run()
            },
            shortcutKeys: item === 'undo' ? ['mod', 'Z'] : ['shift', 'mod', 'Z'],
            disabled: !editor?.isEditable || !editor.can()[item](),
            icon: item === 'undo' ? 'Undo2' : 'Redo2',
            tooltip: t(`editor.${item}.tooltip`),
          },
        }))
      },
    }
  },
})

/** Alias matching the Tiptap v3 naming. */
export const UndoRedo = History
