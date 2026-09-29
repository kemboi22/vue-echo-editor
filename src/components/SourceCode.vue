<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Icon } from '@/components/icons'
import { useTiptapStore } from '@/hooks'
import { useLocale } from '@/locales'
import { ref, shallowRef, watch, nextTick, onBeforeUnmount } from 'vue'
import { toast } from 'vue-sonner'
import type { Editor } from '@tiptap/core'
import { createCodeEditor, type PrismEditor } from '@/utils/prism'
import 'prism-code-editor/search.css'
import 'prism-code-editor/guides.css'
import 'prism-code-editor/code-folding.css'
import 'prism-code-editor/layout.css'
import '@/extensions/CodeBlock/components/theme.css'

import { useTheme } from '@/hooks/useTheme'

interface Props {
  editor: Editor
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const { isDark } = useTheme()

const containerRef = ref<HTMLElement | null>(null)
const { t } = useLocale()
const store = useTiptapStore(props.editor)
const htmlCode = ref('')
const codeEditor = shallowRef<PrismEditor | null>(null)

// 关闭对话框
function handleClose() {
  store.state.sourceCode = false
}

// 保存编辑
function saveEdit() {
  try {
    // https://github.com/ueberdosis/tiptap/discussions/5675
    props.editor.commands.setContent(htmlCode.value, { emitUpdate: true })
    store.state.sourceCode = false
  } catch (error) {
    console.error('Failed to apply HTML source:', error)
  }
}

// 复制代码
function copyCode() {
  const codeToCopy = htmlCode.value
  if (codeToCopy) {
    navigator.clipboard
      .writeText(codeToCopy)
      .then(() => {
        toast.success(t.value('editor.copied'))
      })
      .catch(err => {
        console.error('Failed to copy HTML:', err)
      })
  }
}

function destroyCodeEditor() {
  codeEditor.value?.remove()
  codeEditor.value = null
}

watch(
  () => store.state.sourceCode,
  async isOpen => {
    if (!isOpen) {
      destroyCodeEditor()
      return
    }
    await nextTick()
    await init()
    codeEditor.value?.textarea.focus()
  },
  { immediate: true }
)

async function init() {
  // Read the HTML only when the dialog opens, never on every transaction
  htmlCode.value = props.editor.getHTML()
  if (!containerRef.value) return
  destroyCodeEditor()
  codeEditor.value = await createCodeEditor(containerRef.value, {
    language: 'html',
    tabSize: 2,
    lineNumbers: true,
    wordWrap: true,
    search: true,
    value: htmlCode.value,
    onUpdate(value) {
      htmlCode.value = value
    },
  })
}

onBeforeUnmount(destroyCodeEditor)
</script>

<template>
  <Dialog :open="store?.state.sourceCode" @update:open="open => (store.state.sourceCode = open)">
    <DialogContent
      @close-auto-focus="e => e.preventDefault()"
      class="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90dvh] h-full"
    >
      <DialogHeader class="p-6 pb-0">
        <DialogTitle>{{ t('editor.sourceCode.title') }}</DialogTitle>
      </DialogHeader>

      <div ref="containerRef" class="flex border mx-1" :class="` ${isDark ? 'atom-one-dark' : 'vs-code-light'}`" />
      <DialogFooter class="p-6 shrink-0 pt-0 sm:justify-between">
        <div class="flex items-center gap-3">
          <Button variant="outline" size="sm" @click="copyCode">
            <Icon name="Copy" class="w-4 h-4 mr-1" />
            {{ t('editor.copy') }}
          </Button>
        </div>
        <div class="flex items-center gap-3">
          <Button size="sm" @click="handleClose" variant="outline">
            {{ t('editor.close') }}
          </Button>
          <Button size="sm" @click="saveEdit">
            <Icon name="Check" class="w-4 h-4 mr-1" />
            {{ t('editor.save') }}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
