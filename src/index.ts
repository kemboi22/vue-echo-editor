import type { Plugin } from 'vue'
import EchoEditor from '@/components/EchoEditor.vue'
import ActionButton from '@/components/ActionButton.vue'
import locale, { zhHans, en, supportedLocales, useLocale } from './locales'
import './styles/index.css'

const EchoEditorPlugin: Plugin = {
  install(app) {
    app.component('EchoEditor', EchoEditor)
    app.component('echo-editor', EchoEditor)
  },
}

// Locales
export { en, locale, zhHans, supportedLocales, useLocale }
export type { LocaleConfig, LocaleMessages, BuiltInLocaleCode } from './locales'

// Extensions
export * from '@/extensions'

// Editor & composables
export { useEditor } from '@tiptap/vue-3'
export { useEditorState, useTiptapStore, useRovingToolbar } from './hooks'
export type { UseEditorStateOptions, EditorStore, EditorUIState } from './hooks'
export { useTheme } from './hooks/useTheme'

// Plugin system
export { definePlugin } from './core/plugin'
export type { EchoEditorPluginDefinition, PluginSlashGroup } from './core/plugin'

// Types
export type * from '@/type'
export type { Editor as EditorInstance, JSONContent } from '@tiptap/core'
export type { EchoEditorProps, EchoEditorEmits } from './type'
export type { Theme } from './constants'

// Components
export { default as ThemeToggle } from './components/ThemeToggle.vue'
export { default as ThemePicker } from './components/ThemePicker.vue'

// Utilities
export { hasExtension } from './utils/utils'
export { announce } from './utils/announce'
export { printHTML, createStandaloneHTML } from './utils/print'

export { EchoEditorPlugin, EchoEditor, ActionButton }

export default EchoEditorPlugin
