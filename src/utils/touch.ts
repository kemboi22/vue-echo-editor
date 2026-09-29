/**
 * `true` on devices whose primary pointer is coarse (phones, tablets).
 * Evaluated lazily so it is safe during SSR.
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(pointer: coarse)').matches
}
