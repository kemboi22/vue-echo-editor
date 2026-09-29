import { describe, expect, it, vi } from 'vitest'
import { debounce, differenceBy, isEqual, throttle, truncate, getCssUnitWithDefault } from '@/utils/utils'

describe('utils', () => {
  it('isEqual compares JSON-like values structurally', () => {
    expect(isEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true)
    expect(isEqual({ a: 1 }, { a: 2 })).toBe(false)
    expect(isEqual([1], { 0: 1 })).toBe(false)
    expect(isEqual('<p></p>', '<p></p>')).toBe(true)
  })

  it('differenceBy removes items whose key exists in the second list', () => {
    expect(differenceBy([{ name: 'a' }, { name: 'b' }], [{ name: 'a' }], 'name')).toEqual([{ name: 'b' }])
  })

  it('throttle runs on the leading and trailing edge with the latest args', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 100)
    throttled(1)
    throttled(2)
    throttled(3)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenLastCalledWith(1)
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith(3)
    vi.useRealTimers()
  })

  it('throttle.flush runs a pending trailing call immediately', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 100)
    throttled('a')
    throttled('b')
    throttled.flush()
    expect(fn).toHaveBeenLastCalledWith('b')
    vi.useRealTimers()
  })

  it('debounce only runs after the wait and can be cancelled', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 50)
    debounced()
    debounced()
    vi.advanceTimersByTime(49)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
    debounced()
    debounced.cancel()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('truncate appends the omission', () => {
    expect(truncate('hello world', { length: 8, omission: '…' })).toBe('hello w…')
    expect(truncate('short', { length: 8 })).toBe('short')
  })

  it('getCssUnitWithDefault adds px to numbers', () => {
    expect(getCssUnitWithDefault(12)).toBe('12px')
    expect(getCssUnitWithDefault('50%')).toBe('50%')
    expect(getCssUnitWithDefault(undefined)).toBeUndefined()
  })
})
