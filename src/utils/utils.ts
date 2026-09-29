import type { Editor } from '@tiptap/core'

export const getCssUnitWithDefault = (value?: string | number, defaultUnit: string = 'px') => {
  if (!value) return value

  const stringValue = isNumber(value) ? String(value) : value

  const num = parseFloat(stringValue)
  const unitMatch = stringValue.match(/[a-zA-Z%]+$/)
  const unit = unitMatch ? unitMatch[0] : defaultUnit

  return isNaN(num) ? value : num + unit
}

export const isNumber = (value: unknown): value is number => typeof value === 'number'

export const isString = (value: unknown): value is string => typeof value === 'string'

export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'

export const isFunction = (value: unknown): value is Function => typeof value === 'function'

/**
 * Checks if the editor has a specific extension with the given name.
 *
 * @param {Editor} editor - An instance of the editor.
 * @param {string} name - The name of the extension.
 * @returns {boolean} - Returns true if the specified extension is registered, otherwise returns false.
 */
export function hasExtension(editor: Editor | null | undefined, name: string): boolean {
  const { extensions = [] } = editor?.extensionManager ?? {}
  return extensions.some(i => i.name === name)
}

/**
 * Returns the items of `list` whose `key` value is not present in `values`.
 */
export function differenceBy<T, K extends keyof T>(list: T[], values: T[], key: K): T[] {
  const seen = new Set(values.map(v => v[key]))
  return list.filter(item => !seen.has(item[key]))
}

/**
 * Structural equality for JSON-like values (strings, numbers, arrays, plain objects).
 */
export function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false

  return keysA.every(key =>
    isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
  )
}

type AnyFn = (...args: any[]) => any

export interface Cancelable {
  cancel: () => void
  flush: () => void
}

/**
 * Creates a throttled function that invokes `fn` at most once per `wait` ms,
 * on both the leading and trailing edge. The trailing call uses the latest arguments.
 */
export function throttle<T extends AnyFn>(fn: T, wait = 0): T & Cancelable {
  let last = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  let pendingArgs: Parameters<T> | null = null
  let result: ReturnType<T>

  const invoke = () => {
    last = Date.now()
    timer = null
    if (pendingArgs) {
      const args = pendingArgs
      pendingArgs = null
      result = fn(...args)
    }
  }

  const throttled = function (this: unknown, ...args: Parameters<T>) {
    const remaining = wait - (Date.now() - last)
    pendingArgs = args
    if (remaining <= 0 || remaining > wait) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      invoke()
    } else if (!timer) {
      timer = setTimeout(invoke, remaining)
    }
    return result
  } as T & Cancelable

  throttled.cancel = () => {
    if (timer) clearTimeout(timer)
    timer = null
    pendingArgs = null
  }
  throttled.flush = () => {
    if (timer) {
      clearTimeout(timer)
      invoke()
    }
  }

  return throttled
}

/**
 * Creates a debounced function that delays invoking `fn` until `wait` ms have
 * elapsed since the last call.
 */
export function debounce<T extends AnyFn>(fn: T, wait = 0): T & Cancelable {
  let timer: ReturnType<typeof setTimeout> | null = null
  let pendingArgs: Parameters<T> | null = null

  const debounced = function (this: unknown, ...args: Parameters<T>) {
    pendingArgs = args
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      const callArgs = pendingArgs!
      pendingArgs = null
      fn(...callArgs)
    }, wait)
  } as T & Cancelable

  debounced.cancel = () => {
    if (timer) clearTimeout(timer)
    timer = null
    pendingArgs = null
  }
  debounced.flush = () => {
    if (timer && pendingArgs) {
      clearTimeout(timer)
      timer = null
      const callArgs = pendingArgs
      pendingArgs = null
      fn(...callArgs)
    }
  }

  return debounced
}

/**
 * Truncates `str` to `length` characters, appending `omission` when truncated.
 */
export function truncate(str: string, options: { length?: number; omission?: string } = {}): string {
  const { length = 30, omission = '...' } = options
  if (str.length <= length) return str
  return str.slice(0, Math.max(0, length - omission.length)) + omission
}
