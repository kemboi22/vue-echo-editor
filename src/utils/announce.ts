let region: HTMLElement | null = null

function getRegion(politeness: 'polite' | 'assertive'): HTMLElement | null {
  if (typeof document === 'undefined') return null
  if (!region || !region.isConnected) {
    region = document.createElement('div')
    region.setAttribute('role', 'status')
    region.className = 'sr-only echo-editor-announcer'
    Object.assign(region.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0 0 0 0)',
      whiteSpace: 'nowrap',
      border: '0',
    })
    document.body.appendChild(region)
  }
  region.setAttribute('aria-live', politeness)
  return region
}

/**
 * Announces a message to screen readers through a shared, visually hidden live region.
 */
export function announce(message: string, politeness: 'polite' | 'assertive' = 'polite') {
  const el = getRegion(politeness)
  if (!el) return
  // Clearing first makes repeated identical messages announce again
  el.textContent = ''
  requestAnimationFrame(() => {
    el.textContent = message
  })
}
