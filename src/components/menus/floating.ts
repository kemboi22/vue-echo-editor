import type { Editor } from '@tiptap/core'
import type { VirtualElement } from '@floating-ui/dom'
import type { BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'

export type BubbleMenuOptions = NonNullable<BubbleMenuPluginProps['options']>

/** Signature of the `shouldShow` callback accepted by `<BubbleMenu>`. */
export type BubbleMenuShouldShow = Exclude<BubbleMenuPluginProps['shouldShow'], null | undefined>

/**
 * The element that scrolls the editor content (the `<EditorContent>` root), falling back to `window`.
 */
export function getEditorScrollTarget(editor: Editor): HTMLElement | Window {
  if (editor.isDestroyed) return window
  return (editor.view.dom.parentElement as HTMLElement | null) ?? window
}

/**
 * Creates Floating UI options for a `<BubbleMenu>` whose position follows the editor's own
 * scroll container. `scrollTarget` is resolved lazily because the bubble menu plugin reads its
 * options after the editor view has been mounted.
 */
export function createBubbleMenuOptions(editor: Editor, options: BubbleMenuOptions = {}): BubbleMenuOptions {
  const resolved = { ...options }
  Object.defineProperty(resolved, 'scrollTarget', {
    enumerable: true,
    configurable: true,
    get: () => options.scrollTarget ?? getEditorScrollTarget(editor),
  })
  return resolved
}

/**
 * Wraps a DOM lookup into the `getReferencedVirtualElement` callback expected by `<BubbleMenu>`.
 * Returning `null` makes the menu fall back to the current selection.
 */
export function createVirtualElementGetter(
  getElement: () => Element | null | undefined
): () => VirtualElement | null {
  return () => {
    const element = getElement()
    if (!element) return null
    return {
      getBoundingClientRect: () => element.getBoundingClientRect(),
      getClientRects: () => element.getClientRects(),
      contextElement: element,
    }
  }
}
