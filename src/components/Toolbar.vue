<script setup lang="ts">
import { unref } from 'vue'
import type { Editor } from '@tiptap/core'
import { useLocale } from '@/locales'
import type { ButtonViewReturn } from '@/type'
import { Separator } from '@/components/ui/separator'
import { isFunction } from '@/utils/utils'
import { useTiptapStore } from '@/hooks/useStore'
import { useEditorState } from '@/hooks/useEditorState'
import { useRovingToolbar } from '@/hooks/useRovingToolbar'

interface Menu {
  key: string
  button: ButtonViewReturn
  divider: boolean
  spacer: boolean
}
interface Props {
  editor: Editor
  disabled?: boolean
}
const { t } = useLocale()

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const store = useTiptapStore(props.editor)

// The extension list never changes for the lifetime of an editor, so sort it once.
const toolbarExtensions = [...props.editor.extensionManager.extensions]
  .filter(extension => {
    const { button, toolbar = true } = extension.options ?? {}
    return toolbar && isFunction(button)
  })
  .sort((a, b) => (a.options.sort ?? -1) - (b.options.sort ?? -1))

function buildItems(editor: Editor): Menu[] {
  const menus: Menu[] = []
  const translate = unref(t)

  for (const extension of toolbarExtensions) {
    const { button, divider = false, spacer = false } = extension.options
    const result: ButtonViewReturn | ButtonViewReturn[] = button({ editor, extension, t: translate })

    if (Array.isArray(result)) {
      result.forEach((item, i) => {
        menus.push({
          key: `${extension.name}-${i}`,
          button: item,
          divider: i === result.length - 1 ? divider : false,
          spacer: i === 0 ? spacer : false,
        })
      })
      continue
    }

    menus.push({ key: extension.name, button: result, divider, spacer })
  }
  return menus
}

// Re-evaluated at most once per frame instead of on every reactive editor state change
const items = useEditorState(props.editor, buildItems, {
  sources: [
    t,
    () => props.disabled,
    () => store.state.isFullscreen,
    () => store.state.showPreview,
    () => store.state.sourceCode,
    () => store.state.findAndReplace,
    () => store.state.specialCharacter,
    () => store.state.printer,
    () => store.state.AIMenu,
  ],
})

const { toolbarRef, onKeydown } = useRovingToolbar()
</script>

<template>
  <div class="sticky top-0 h-auto bg-background z-10 overflow-visible rounded-t-lg" v-if="items.length">
    <div
      ref="toolbarRef"
      role="toolbar"
      :aria-label="t('editor.toolbar.label')"
      aria-orientation="horizontal"
      class="flex flex-nowrap overflow-x-auto sm:flex-wrap gap-y-1 gap-x-1 items-center py-0.5 echo-toolbar"
      @keydown="onKeydown"
    >
      <template v-for="item in items" :key="item.key">
        <div class="flex items-center" v-if="item.spacer">
          <Separator orientation="vertical" class="h-[16px] mx-[10px]" />
        </div>
        <component
          :is="item.button.component"
          v-bind="item.button.componentProps"
          :editor="editor"
          :disabled="disabled || item.button.componentProps?.disabled"
        >
          <template v-for="(element, slotName, i) in item.button.componentSlots" :key="i" #[`${slotName}`]="values">
            <component :is="element" v-bind="values?.props" />
          </template>
        </component>
        <Separator v-if="item.divider" orientation="vertical" class="h-auto mx-2" />
      </template>
    </div>
  </div>
</template>
