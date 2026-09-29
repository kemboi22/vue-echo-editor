import { computed, effectScope, getCurrentInstance, inject, reactive, watchEffect } from 'vue'
import type { ComputedRef, InjectionKey } from 'vue'

import type { AnyExtension, Editor } from '@tiptap/core'
import { useContext } from './useContext'

import { DEFAULT_LANG_VALUE } from '@/constants'

/**
 * UI state of a single editor instance.
 */
export interface EditorUIState {
  /**
   * List of extensions
   *
   * @default []
   */
  extensions: AnyExtension[]

  /**
   * Default language setting
   *
   * @default DEFAULT_LANG_VALUE
   */
  defaultLang?: string

  /**
   * Whether it is in fullscreen mode
   *
   * @default false
   */
  isFullscreen: boolean

  /** Text color */
  color?: string

  /** Highlight color */
  highlight?: string

  /** AI Menu visibility */
  AIMenu: boolean

  /** Preview visibility */
  showPreview: boolean

  /** SpecialCharacter */
  specialCharacter: boolean

  /** SpellCheck */
  spellCheck: boolean

  /** SourceCode */
  sourceCode: boolean

  /** FindAndReplace */
  findAndReplace: boolean
  /** Printer */
  printer: boolean
  /** Disabled */
  disabled: boolean
}

export interface EditorStore {
  state: EditorUIState
  isFullscreen: ComputedRef<boolean>
  toggleFullscreen: () => void
  togglePreview: () => void
  toggleSpecialCharacter: () => void
  toggleSpellCheck: () => void
  toggleFindAndReplace: () => void
  togglePrinter: () => void
  toggleSourceCode: () => void
  setDisabled: (disabled: boolean) => void
}

export const EDITOR_STORE_KEY: InjectionKey<EditorStore> = Symbol('echo-editor-store')

function createStore(): EditorStore {
  const { state: context } = useContext()

  const state: EditorUIState = reactive({
    extensions: context.extensions ?? [],
    defaultLang: DEFAULT_LANG_VALUE,
    isFullscreen: false,
    color: undefined,
    highlight: undefined,
    AIMenu: false,
    sourceCode: false,
    showPreview: false,
    specialCharacter: false,
    spellCheck: false,
    findAndReplace: false,
    printer: false,
    disabled: false,
  })

  watchEffect(() => {
    state.extensions = context.extensions
    state.defaultLang = context.defaultLang
  })

  return {
    state,
    isFullscreen: computed(() => state.isFullscreen),
    toggleFullscreen: () => (state.isFullscreen = !state.isFullscreen),
    togglePreview: () => (state.showPreview = !state.showPreview),
    toggleSpecialCharacter: () => (state.specialCharacter = !state.specialCharacter),
    toggleSourceCode: () => (state.sourceCode = !state.sourceCode),
    toggleSpellCheck: () => (state.spellCheck = !state.spellCheck),
    toggleFindAndReplace: () => (state.findAndReplace = !state.findAndReplace),
    togglePrinter: () => (state.printer = !state.printer),
    setDisabled: (disabled: boolean) => (state.disabled = disabled),
  }
}

/** Stores are created in a detached scope so they outlive the component that created them. */
function createDetachedStore(): EditorStore {
  return effectScope(true).run(createStore)!
}

const stores = new WeakMap<Editor, EditorStore>()
let fallbackStore: EditorStore | undefined

/**
 * Creates (or returns) the UI store bound to a given editor instance.
 * Every `<EchoEditor>` gets its own store, so multiple editors on one page no longer share
 * fullscreen, preview or AI-menu state.
 */
export function createEditorStore(editor: Editor): EditorStore {
  let store = stores.get(editor)
  if (!store) {
    store = createDetachedStore()
    stores.set(editor, store)
  }
  return store
}

/**
 * Returns the UI store for an editor.
 *
 * Resolution order: explicit `editor` argument → injected store of the nearest `<EchoEditor>` →
 * a shared fallback store (for usage outside of an editor, e.g. standalone components).
 */
export function useTiptapStore(editor?: Editor | null): EditorStore {
  if (editor) {
    const store = stores.get(editor)
    if (store) return store
  }

  if (getCurrentInstance()) {
    const injected = inject(EDITOR_STORE_KEY, null)
    if (injected) return injected
  }

  if (editor) return createEditorStore(editor)

  fallbackStore ??= createDetachedStore()
  return fallbackStore
}
