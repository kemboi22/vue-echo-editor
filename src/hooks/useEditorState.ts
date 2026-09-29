import { getCurrentScope, onScopeDispose, shallowRef, watch } from 'vue'
import type { ShallowRef, WatchSource } from 'vue'
import type { Editor, EditorEvents } from '@tiptap/core'

export interface UseEditorStateOptions<T> {
  /**
   * Extra reactive sources that should also trigger a re-evaluation (e.g. locale, disabled flag).
   */
  sources?: WatchSource[]
  /**
   * Custom equality check. When it returns `true` the previous value is kept and nothing re-renders.
   */
  equalityFn?: (a: T, b: T) => boolean
}

/**
 * Derives UI state from an editor at most once per animation frame.
 *
 * Unlike reading `editor.state` inside a `computed`, the selector runs outside of Vue's dependency
 * tracking and is only re-evaluated for transactions that change the document, the selection or
 * the stored marks. Toolbars and menus with dozens of `editor.can()` / `editor.isActive()` checks stay
 * cheap while typing.
 *
 * @example
 * const isBold = useEditorState(editor, e => e.isActive('bold'))
 */
export function useEditorState<T>(
  editor: Editor,
  selector: (editor: Editor) => T,
  options: UseEditorStateOptions<T> = {}
): Readonly<ShallowRef<T>> {
  const { sources = [], equalityFn = Object.is } = options
  const state = shallowRef<T>(selector(editor))

  let frame = 0

  const evaluate = () => {
    frame = 0
    if (editor.isDestroyed) return
    const next = selector(editor)
    if (!equalityFn(state.value, next)) state.value = next
  }

  const schedule = () => {
    if (frame) return
    frame = typeof requestAnimationFrame === 'function' ? requestAnimationFrame(evaluate) : (evaluate(), 0)
  }

  const onTransaction = ({ transaction }: EditorEvents['transaction']) => {
    if (transaction.docChanged || transaction.selectionSet || transaction.storedMarksSet) schedule()
  }

  editor.on('transaction', onTransaction)
  // Editability and focus change without a document transaction
  editor.on('update', schedule)
  editor.on('focus', schedule)
  editor.on('blur', schedule)

  if (sources.length) {
    watch(sources, schedule)
  }

  if (getCurrentScope()) {
    onScopeDispose(() => {
      if (frame && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame)
      editor.off('transaction', onTransaction)
      editor.off('update', schedule)
      editor.off('focus', schedule)
      editor.off('blur', schedule)
    })
  }

  return state
}
