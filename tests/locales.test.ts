import { describe, expect, it } from 'vitest'
import locale, { useLocale, supportedLocales } from '@/locales'
import en from '@/locales/locales/en'

const lazyCodes = supportedLocales.map(l => l.code).filter(code => code !== 'en')

describe('locales', () => {
  it('still loads built-in messages when a plugin registered keys for that language first', async () => {
    locale.extendMessage('de', { 'plugin.key': 'Plugin' })
    await locale.setLang('de')
    const { t } = useLocale()
    expect(t.value('editor.bold.tooltip')).toBe('Fett')
    expect(t.value('plugin.key')).toBe('Plugin')
    await locale.setLang('en')
  })

  it.each(lazyCodes)('%s has exactly the English keys', async code => {
    const messages = await locale.loadLang(code)
    expect(messages).toBeDefined()
    const missing = Object.keys(en).filter(key => !(key in messages!))
    const extra = Object.keys(messages!).filter(key => !(key in en) && !key.startsWith('plugin.'))
    expect({ missing, extra }).toEqual({ missing: [], extra: [] })
  })

  it('falls back to English for missing keys and interpolates params', async () => {
    locale.setMessage('xx', { hello: 'Hallo {name}' })
    await locale.setLang('xx')
    const { t } = useLocale()
    expect(t.value('hello', { name: 'Ada' })).toBe('Hallo Ada')
    expect(t.value('editor.bold.tooltip')).toBe(en['editor.bold.tooltip'])
    expect(t.value('unknown.key')).toBe('unknown.key')
    await locale.setLang('en')
  })

  it('switches direction for RTL languages', async () => {
    const { direction } = useLocale()
    await locale.setLang('ar')
    expect(direction.value).toBe('rtl')
    await locale.setLang('en')
    expect(direction.value).toBe('ltr')
  })

  it('ignores unknown languages', async () => {
    await locale.setLang('does-not-exist')
    expect(locale.lang).toBe('en')
  })
})
