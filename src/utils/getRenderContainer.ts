import type { Editor } from '@tiptap/core'

const matchesNodeType = (element: Element | null | undefined, nodeType: string) =>
  !!element && (element.getAttribute('data-type') === nodeType || element.classList.contains(nodeType))

/**
 * Finds the DOM element rendering the closest `nodeType` node around the current selection.
 * The lookup is scoped to this editor, so multiple editors on a page never pick each other's nodes.
 */
export const getRenderContainer = (editor: Editor, nodeType: string): HTMLElement | null => {
  if (editor.isDestroyed) return null

  const {
    view,
    state: {
      selection: { from },
    },
  } = editor

  const focused = view.dom.querySelectorAll('.focus')
  const innermost = focused[focused.length - 1]
  if (matchesNodeType(innermost, nodeType)) {
    return innermost as HTMLElement
  }

  const node = view.domAtPos(from).node as HTMLElement
  let container: HTMLElement | null = node.tagName ? node : node.parentElement

  while (container && container !== view.dom && !matchesNodeType(container, nodeType)) {
    container = container.parentElement
  }

  return container === view.dom ? null : container
}

export default getRenderContainer
