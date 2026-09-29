import { ref } from 'vue'

const FOCUSABLE = 'button:not([disabled]), [role="button"]:not([aria-disabled="true"]), input:not([disabled])'

/**
 * Keyboard navigation for toolbars, following the WAI-ARIA toolbar pattern:
 * ←/→ move between controls, Home/End jump to the first/last control.
 */
export function useRovingToolbar() {
  const toolbarRef = ref<HTMLElement | null>(null)

  function getItems(): HTMLElement[] {
    const root = toolbarRef.value
    if (!root) return []
    return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      el => el.offsetParent !== null && !el.closest('[role="menu"], [role="dialog"], [data-reka-popper-content-wrapper]')
    )
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']
    if (!keys.includes(event.key)) return

    const items = getItems()
    const current = items.findIndex(el => el === document.activeElement || el.contains(document.activeElement))
    if (current === -1) return

    let next = current
    if (event.key === 'ArrowRight') next = (current + 1) % items.length
    if (event.key === 'ArrowLeft') next = (current - 1 + items.length) % items.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = items.length - 1

    event.preventDefault()
    items[next]?.focus()
  }

  return { toolbarRef, onKeydown }
}
