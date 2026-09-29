import { computed, effectScope, readonly, ref, shallowReactive, watch } from 'vue'

import zhHans from './locales/zh'
import en from './locales/en'

import { DEFAULT_LANG_VALUE } from '@/constants'

export type LocaleMessages = Record<string, string>

export type BuiltInLocaleCode = 'en' | 'zhHans' | 'es' | 'fr' | 'de' | 'pt' | 'ru' | 'ja' | 'ko' | 'ar' | 'hi'

export interface LocaleConfig {
  code: string
  name: string
  nativeName: string
  direction: 'ltr' | 'rtl'
}

export const supportedLocales: LocaleConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
  { code: 'zhHans', name: 'Chinese (Simplified)', nativeName: '简体中文', direction: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', direction: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', direction: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', direction: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr' },
]

// Additional languages are split into their own chunks and fetched on demand
const lazyLocales: Record<string, () => Promise<{ default: LocaleMessages }>> = {
  es: () => import('./locales/es'),
  fr: () => import('./locales/fr'),
  de: () => import('./locales/de'),
  pt: () => import('./locales/pt'),
  ru: () => import('./locales/ru'),
  ja: () => import('./locales/ja'),
  ko: () => import('./locales/ko'),
  ar: () => import('./locales/ar'),
  hi: () => import('./locales/hi'),
}

const FALLBACK_LANG = 'en'

const messages = shallowReactive<Record<string, LocaleMessages>>({ en, zhHans })
// Tracked separately: plugins may register keys for a language before its built-in messages are loaded
const loadedLanguages = new Set<string>(['en', 'zhHans'])
const currentLang = ref<string>(DEFAULT_LANG_VALUE)
const rtlLanguages = new Set(supportedLocales.filter(l => l.direction === 'rtl').map(l => l.code))

function createTranslator(lang: string) {
  const primary = messages[lang] ?? {}
  const fallback = messages[FALLBACK_LANG] ?? {}
  return function t(path: string, params?: Record<string, string | number>): string {
    let value = primary[path] ?? fallback[path] ?? path
    if (params) {
      for (const [key, replacement] of Object.entries(params)) {
        value = value.replaceAll(`{${key}}`, String(replacement))
      }
    }
    return value
  }
}

// One translator shared by every component — no per-component listeners
const translator = computed(() => createTranslator(currentLang.value))
const direction = computed<'ltr' | 'rtl'>(() => (rtlLanguages.has(currentLang.value) ? 'rtl' : 'ltr'))

class Locale {
  get lang(): string {
    return currentLang.value
  }

  set lang(lang: string) {
    this.setLang(lang)
  }

  get message(): Record<string, LocaleMessages> {
    return messages
  }

  get direction(): 'ltr' | 'rtl' {
    return direction.value
  }

  isLangSupported(lang: string): boolean {
    return lang in messages || lang in lazyLocales
  }

  /**
   * Loads (if needed) and activates a language. Built-in languages other than `en` and `zhHans`
   * are fetched on demand.
   */
  async setLang(lang: string): Promise<void> {
    if (!this.isLangSupported(lang)) {
      console.warn(`[echo-editor] Unknown language "${lang}", keeping "${currentLang.value}".`)
      return
    }
    await this.loadLang(lang)
    currentLang.value = lang
  }

  async loadLang(lang: string): Promise<LocaleMessages | undefined> {
    const loader = lazyLocales[lang]
    if (loadedLanguages.has(lang) || !loader) return messages[lang]
    const loaded: LocaleMessages = (await loader()).default
    // Keys registered before loading (e.g. by plugins) win over the built-in translations
    messages[lang] = Object.assign({}, loaded, messages[lang])
    loadedLanguages.add(lang)
    return messages[lang]
  }

  loadLangMessage(lang: string): LocaleMessages {
    return messages[lang]
  }

  /** Replace or add a language. Missing keys fall back to English. */
  setMessage(lang: string, message: LocaleMessages) {
    messages[lang] = message
    loadedLanguages.add(lang)
  }

  /** Merge keys into a language (e.g. plugin translations). */
  extendMessage(lang: string, message: LocaleMessages) {
    messages[lang] = { ...(messages[lang] ?? {}), ...message }
  }

  /** Subscribe to language changes. Prefer `useLocale().lang` inside components. */
  registerWatchLang(hook: (lang: string) => void) {
    const scope = effectScope(true)
    scope.run(() => watch(currentLang, hook))
    return { unsubscribe: () => scope.stop() }
  }

  buildLocalesHandler(lang?: string) {
    return createTranslator(lang ?? currentLang.value)
  }
}

const locale = new Locale()

/**
 * Reactive access to the active language and translator. Cheap to call anywhere:
 * all callers share the same state.
 */
const useLocale = () => ({
  lang: readonly(currentLang),
  t: translator,
  direction,
})

export default locale
export { Locale, useLocale, zhHans, en }
