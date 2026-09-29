<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  onBeforeUnmount,
  provide,
  reactive,
  ref,
  unref,
  getCurrentInstance,
  watch,
  watchEffect,
} from 'vue'
import type { AnyExtension, Editor as CoreEditor, JSONContent } from '@tiptap/core'

import { Editor, EditorContent } from '@tiptap/vue-3'
import type { EditorOptions } from '@tiptap/core'
import { EDITOR_UPDATE_THROTTLE_WAIT_TIME } from '@/constants'
import { differenceBy, getCssUnitWithDefault, isEqual, throttle } from '@/utils/utils'
import { useLocale } from '@/locales'
import { createEditorStore, EDITOR_STORE_KEY } from '@/hooks/useStore'
import { useTheme } from '@/hooks/useTheme'
import { useContext } from '@/hooks/useContext'
import BasicBubbleMenu from './menus/BasicBubbleMenu.vue'
import ContentMenu from './menus/ContentMenu.vue'
import Toolbar from './Toolbar.vue'
import type { EchoEditorProps, EchoEditorEmits } from '@/type'
import { useDark } from '@vueuse/core'
import { useEditorFocus } from '@/hooks/useEditorFocus'
import { announce } from '@/utils/announce'
import { Toaster } from './ui/sonner'

// Feature UIs are only downloaded when the matching extension is registered
const LinkBubbleMenu = defineAsyncComponent(() => import('./menus/LinkBubbleMenu.vue'))
const TableBubbleMenu = defineAsyncComponent(() => import('./menus/TableBubbleMenu.vue'))
const ColumnsBubbleMenu = defineAsyncComponent(() => import('./menus/ColumnsBubbleMenu.vue'))
const ImageBubbleMenu = defineAsyncComponent(() => import('./menus/ImageBubbleMenu.vue'))
const AIMenu = defineAsyncComponent(() => import('./menus/AIMenu.vue'))
const Menubars = defineAsyncComponent(() => import('./Menubars.vue'))
const Preview = defineAsyncComponent(() => import('./Preview.vue'))
const Printer = defineAsyncComponent(() => import('./Printer.vue'))
const SpecialCharacter = defineAsyncComponent(() => import('./SpecialCharacter.vue'))
const SourceCode = defineAsyncComponent(() => import('./SourceCode.vue'))
const FindAndReplace = defineAsyncComponent(() => import('./FindAndReplace.vue'))

type KeyDownHandler = NonNullable<NonNullable<EditorOptions['editorProps']>['handleKeyDown']>

const props = withDefaults(defineProps<EchoEditorProps>(), {
  modelValue: '',
  output: 'html',
  dark: undefined,
  theme: undefined,
  radius: undefined,
  disabled: false,
  hideToolbar: false,
  hideMenubar: true,
  hideBubble: false,
  removeDefaultWrapper: false,
  maxWidth: undefined,
  minHeight: undefined,
  maxHeight: undefined,
  extensions: () => [],
  editorClass: undefined,
  contentClass: undefined,
  editorProps: undefined,
  autofocus: false,
  label: undefined,
})

const emit = defineEmits<EchoEditorEmits>()

// Declared emits are stripped from attrs, so detect an `@enter` listener on the vnode instead
const hasEnterListener = !!getCurrentInstance()?.vnode.props?.onEnter
const { t, direction } = useLocale()
const isDark = useDark()
const contentRef = ref<InstanceType<typeof EditorContent> | null>(null)
const { state: context } = useContext()

const { setTheme, setBorderRadius } = useTheme()

const extensions: AnyExtension[] = [
  ...context.extensions,
  ...differenceBy(props.extensions, context.extensions, 'name'),
].map((extension, i) => extension.configure({ sort: i }))

// With collaboration, the Y.js document is the source of truth — never push `modelValue` into it.
const isCollaborative = extensions.some(({ name }) => name === 'collaboration' || name === 'collaborationKit')

/** The last value emitted through `update:modelValue`; lets us skip serialising the doc on echo. */
let lastEmitted: string | JSONContent | undefined

function getOutput(editor: CoreEditor, output: EchoEditorProps['output']): string | JSONContent {
  if (props.removeDefaultWrapper && editor.isEmpty) {
    return output === 'json' ? {} : ''
  }

  switch (output) {
    case 'html':
      return editor.getHTML()
    case 'json':
      return editor.getJSON()
    case 'text':
      return editor.getText()
    case 'markdown':
      return editor.storage.markdown?.manager ? editor.getMarkdown() : editor.getText()
    default:
      console.warn(`[echo-editor] Invalid output type: ${output}`)
      return ''
  }
}

// Serialising a large document is the most expensive part of an update, so do it at most once per wait window
const emitUpdate = throttle((editor: CoreEditor) => {
  if (editor.isDestroyed) return
  const output = getOutput(editor, props.output)
  lastEmitted = output
  emit('update:modelValue', output)
  emit('change', { editor, output })
}, EDITOR_UPDATE_THROTTLE_WAIT_TIME)

const handleKeyDown: KeyDownHandler = (view, event) => {
  if (event.key === 'Enter' && hasEnterListener && !event.shiftKey && !event.isComposing) {
    emit('enter')
    return true
  }
  return props.editorProps?.handleKeyDown?.(view, event) ?? false
}

const editor = new Editor({
  content: isCollaborative ? undefined : props.modelValue,
  contentType: props.output === 'markdown' && typeof props.modelValue === 'string' ? 'markdown' : undefined,
  autofocus: props.autofocus,
  editorProps: {
    ...props.editorProps,
    handleKeyDown,
    attributes: {
      class: 'EchoContentView',
      role: 'textbox',
      'aria-multiline': 'true',
      'aria-label': props.label ?? t.value('editor.content'),
      ...(props.editorProps?.attributes as Record<string, string> | undefined),
    },
  },
  onCreate: ({ editor }) => emit('create', { editor }),
  onUpdate: ({ editor }) => emitUpdate(editor),
  onFocus: ({ editor, event }) => emit('focus', { editor, event }),
  onBlur: ({ editor, event }) => {
    // Make sure the parent has the latest value as soon as the user leaves the editor
    emitUpdate.flush()
    emit('blur', { editor, event })
  },
  extensions,
  editable: !props.disabled,
})

// Flattened list (includes extensions nested in kits such as BaseKit); fixed for the editor's lifetime
const extensionNames = new Set(editor.extensionManager.extensions.map(extension => extension.name))
const has = (name: string) => extensionNames.has(name)

if (has('collaboration') && has('history')) {
  console.warn('[echo-editor] Remove the `History` extension when using collaboration — Y.js provides its own undo/redo.')
}

const store = createEditorStore(editor)
provide(EDITOR_STORE_KEY, store)
const { state, isFullscreen, setDisabled } = store
setDisabled(props.disabled)

const { isFocused } = useEditorFocus({ editor })

// Dialogs are mounted (and their code downloaded) the first time they are opened, then kept for close animations
const opened = reactive({ preview: false, specialCharacter: false, sourceCode: false })
watchEffect(() => {
  if (state.showPreview) opened.preview = true
  if (state.specialCharacter) opened.specialCharacter = true
  if (state.sourceCode) opened.sourceCode = true
})

watch(
  () => props.dark,
  val => {
    if (val !== undefined) isDark.value = val
  },
  { immediate: true }
)

watch(
  () => props.theme,
  val => {
    if (val !== undefined) setTheme(val)
  },
  { immediate: true }
)

watch(
  () => props.radius,
  val => {
    if (val !== undefined) setBorderRadius(val)
  },
  { immediate: true }
)

const contentDynamicStyles = computed(() => ({
  ...(unref(isFullscreen)
    ? { height: '100%', overflowY: 'auto' as const }
    : {
        minHeight: getCssUnitWithDefault(props.minHeight),
        maxHeight: getCssUnitWithDefault(props.maxHeight),
        overflowY: 'auto' as const,
        scrollBehavior: 'smooth' as const,
        scrollbarWidth: 'thin' as const,
      }),
  maxWidth: getCssUnitWithDefault(props.maxWidth),
  width: props.maxWidth ? '100%' : undefined,
  margin: props.maxWidth ? '8px auto' : undefined,
}))

watch(
  () => props.modelValue,
  val => {
    if (isCollaborative || editor.isDestroyed) return
    // Fast path: the parent is echoing back what we just emitted
    if (val === lastEmitted) return
    if (typeof val === 'object' && isEqual(val, lastEmitted)) return
    if (isEqual(getOutput(editor, props.output), val)) return

    const { from, to } = editor.state.selection
    editor.commands.setContent(val, {
      emitUpdate: false,
      contentType: props.output === 'markdown' && typeof val === 'string' ? 'markdown' : undefined,
    })
    const size = editor.state.doc.content.size
    editor.commands.setTextSelection({ from: Math.min(from, size), to: Math.min(to, size) })
  }
)

watch(
  () => props.disabled,
  val => {
    editor.setEditable(!val)
    setDisabled(val)
  }
)

watch(
  () => props.label,
  label => {
    if (editor.isDestroyed) return
    editor.view.dom.setAttribute('aria-label', label ?? t.value('editor.content'))
  }
)

onBeforeUnmount(() => {
  emitUpdate.flush()
  editor.destroy()
})

const characters = computed(() => (has('characterCount') ? editor.storage.characterCount.characters() : 0))
const characterLimit = computed<number | null | undefined>(
  () => editor.extensionManager.extensions.find(e => e.name === 'characterCount')?.options?.limit
)

watch(
  () => !!characterLimit.value && characters.value >= characterLimit.value,
  reached => {
    if (reached) announce(t.value('editor.characterLimitReached'), 'assertive')
  }
)

defineExpose({ editor })
</script>

<template>
  <div
    class="echo-editor echo-editor-ui"
    :dir="direction"
    :class="[
      editorClass,
      {
        'echo-editor-focus': isFocused,
      },
    ]"
  >
    <Preview v-if="has('preview') && opened.preview" :editor="editor" />
    <SpecialCharacter v-if="has('specialCharacter') && opened.specialCharacter" :editor="editor" />
    <SourceCode v-if="has('sourceCode') && opened.sourceCode" :editor="editor" />
    <Printer v-if="has('printer')" :editor="editor" />
    <div
      class="relative flex flex-col overflow-hidden"
      :class="{
        'fixed! bg-background inset-0 z-50 w-full h-full m-0 rounded-lg': isFullscreen,
      }"
    >
      <Menubars v-if="!hideMenubar" :editor="editor" :disabled="disabled" />
      <Toolbar v-if="!hideToolbar" :editor="editor" :disabled="disabled" class="border-b py-1 px-1 overflow-hidden" />
      <div class="overflow-hidden relative flex-1">
        <FindAndReplace v-if="has('findAndReplace')" :container-ref="contentRef?.$el ?? null" :editor="editor" />
        <editor-content
          ref="contentRef"
          :editor="editor"
          :class="contentClass"
          :style="contentDynamicStyles"
          :spellcheck="state.spellCheck"
        />
        <template v-if="!hideBubble && !disabled">
          <ContentMenu :editor="editor" class="hidden sm:block" />
          <LinkBubbleMenu v-if="has('link')" :editor="editor" />
          <ColumnsBubbleMenu v-if="has('columns')" :editor="editor" />
          <TableBubbleMenu v-if="has('table')" :editor="editor" />
          <AIMenu v-if="has('AI')" :editor="editor" />
          <ImageBubbleMenu v-if="has('image')" :editor="editor" />
          <BasicBubbleMenu :editor="editor" />
        </template>
      </div>
      <div v-if="has('characterCount')" class="flex justify-between border-t p-3 items-center">
        <div class="flex flex-col">
          <div class="flex justify-end gap-3 text-sm" aria-live="polite">
            <span>
              {{ characters }}<template v-if="characterLimit"> / {{ characterLimit }}</template>
              {{ t('editor.characters') }}
            </span>
          </div>
        </div>
        <slot name="footer" :editor="editor" />
      </div>
    </div>
    <Toaster />
  </div>
</template>
