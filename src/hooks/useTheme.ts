import { computed, effectScope, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { useDark, useLocalStorage } from '@vueuse/core'
import { THEMES, DEFAULT_THEME, DEFAULT_BORDER_RADIUS, BORDER_RADIUS } from '@/constants/index'
import type { Theme, BorderRadius } from '@/constants/index'

export interface UseThemeReturn {
  theme: Ref<Theme>
  borderRadius: Ref<BorderRadius>
  isDark: Ref<boolean>
  themes: typeof THEMES
  borderRadiusOptions: typeof BORDER_RADIUS
  currentTheme: ComputedRef<(typeof THEMES)[number]>
  currentBorderRadius: ComputedRef<BorderRadius>
  toggleTheme: () => void
  setTheme: (color: Theme) => void
  setBorderRadius: (radius: BorderRadius) => void
}

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

function createTheme(): UseThemeReturn {
  const storedTheme = useLocalStorage<Theme>('echo-editor-theme-color', DEFAULT_THEME)
  const storedBorderRadius = useLocalStorage<BorderRadius>('echo-editor-border-radius', DEFAULT_BORDER_RADIUS)

  const theme = ref<Theme>(storedTheme.value)
  const borderRadius = ref<BorderRadius>(storedBorderRadius.value)
  const isDark = useDark()

  const currentTheme = computed(() => THEMES.find(color => color.name === theme.value) || THEMES[0])
  const currentBorderRadius = computed(
    () => BORDER_RADIUS.find(radius => radius === borderRadius.value) || DEFAULT_BORDER_RADIUS
  )

  // Theme colours are scoped to `.echo-editor` so they never leak into the host app
  const applyTheme = () => {
    if (!isBrowser) return
    const scheme = isDark.value ? currentTheme.value.cssVars.dark : currentTheme.value.cssVars.light

    let styleElement = document.getElementById('echo-editor-theme-styles')
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = 'echo-editor-theme-styles'
      document.head.appendChild(styleElement)
    }
    // Theme presets store shadcn-style HSL triplets ("240 5.9% 10%"); Tailwind 4 tokens use the
    // variables as complete colours, so wrap them in hsl()
    const declarations = Object.entries(scheme)
      .map(([key, value]) => {
        const name = key === 'ring-3' ? 'ring' : key
        const color = /^[\d.]+\s+[\d.]+%\s+[\d.]+%$/.test(String(value).trim()) ? `hsl(${value})` : value
        return `--${name}: ${color};`
      })
      .join(' ')
    // Popups portalled to <body> (menus, dialogs, slash menu) get the theme too
    styleElement.textContent = `.echo-editor-ui, .echo-editor-ui * { ${declarations} }`

    const root = document.documentElement
    root.classList.remove(...THEMES.map(c => `theme-${c.name}`))
    root.classList.add(`theme-${theme.value}`)
  }

  const applyBorderRadius = () => {
    if (!isBrowser) return
    document.documentElement.style.setProperty('--radius', `${currentBorderRadius.value}rem`)
  }

  watch(storedTheme, value => (theme.value = value))
  watch(storedBorderRadius, value => (borderRadius.value = value))
  watch(theme, value => {
    storedTheme.value = value
    applyTheme()
  })
  watch(borderRadius, value => {
    storedBorderRadius.value = value
    applyBorderRadius()
  })
  watch(isDark, applyTheme)

  applyTheme()
  applyBorderRadius()

  return {
    theme,
    borderRadius,
    isDark,
    themes: THEMES,
    borderRadiusOptions: BORDER_RADIUS,
    currentTheme,
    currentBorderRadius,
    toggleTheme: () => {
      isDark.value = !isDark.value
    },
    setTheme: (color: Theme) => {
      theme.value = color
    },
    setBorderRadius: (radius: BorderRadius) => {
      borderRadius.value = radius
    },
  }
}

let shared: UseThemeReturn | undefined

/**
 * Theme colour, border radius and dark mode for Echo Editor.
 *
 * State is shared by every caller (one set of listeners for the whole page) and the composable is
 * safe to call during SSR — DOM work only happens in the browser.
 */
export function useTheme(): UseThemeReturn {
  // A detached scope keeps the shared watchers alive independently of the first caller's component
  shared ??= effectScope(true).run(createTheme)!
  return shared
}
