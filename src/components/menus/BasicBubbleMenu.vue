<script setup lang="ts">
import { computed, unref } from 'vue'
import type { EditorState } from '@tiptap/pm/state'
import { NodeSelection, TextSelection } from '@tiptap/pm/state'
import { Separator } from '@/components/ui/separator'
import type { Editor, Extension } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import type { BaseKitOptions } from '@/extensions/BaseKit'
import type { BubbleTypeMenu } from './BasicBubble'
import { useLocale } from '@/locales'
import { useTiptapStore, useEditorState } from '@/hooks'
import { createBubbleMenuOptions } from './floating'
import { isTouchDevice } from '@/utils/touch'
import type { BubbleMenuShouldShow } from './floating'
import type { Editor as CoreEditor } from '@tiptap/core'

interface Props {
  editor: Editor
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const store = useTiptapStore(props.editor)

const { t } = useLocale()

// On touch devices the OS shows its own selection menu above the text, so render ours below it
const options = createBubbleMenuOptions(props.editor, {
  placement: isTouchDevice() ? 'bottom' : 'top',
  offset: 8,
  flip: true,
  shift: { padding: 8 },
})

type NodeTypeKey = 'link' | 'video' | 'text'

function getNodeType(editor: CoreEditor, state: EditorState): NodeTypeKey | undefined {
  const { selection } = state
  if (editor.isActive('link')) return 'link'
  if (selection instanceof NodeSelection && selection.node.type.name === 'video') return 'video'
  if (selection instanceof TextSelection) return 'text'
  return undefined
}

const baseKit = props.editor.extensionManager.extensions.find(k => k.name === 'base-kit') as
  | Extension<BaseKitOptions>
  | undefined

function buildMenus(editor: CoreEditor): { type: NodeTypeKey | undefined; menus: BubbleTypeMenu } {
  const button = baseKit?.options?.bubble?.button
  const type = getNodeType(editor, editor.view.state)
  if (!baseKit || !button) return { type, menus: {} }
  return { type, menus: button({ editor: editor as Editor, extension: baseKit, t: unref(t) }) }
}

// Evaluated at most once per frame, outside of Vue's dependency tracking
const bubbleState = useEditorState(props.editor, buildMenus, { sources: [t, () => props.disabled] })

const items = computed(() => {
  const { type, menus } = bubbleState.value
  if (!type) return []
  return menus[type] ?? []
})

const shouldShow: BubbleMenuShouldShow = ({ editor, state, from, to }) => {
  if (!editor.isEditable || store.state.AIMenu) return false

  const { selection, doc } = state
  const type = getNodeType(editor, state)
  if (!type || !bubbleState.value.menus[type]?.length) return false

  // Node selections (e.g. video) show the menu for the selected node
  if (selection instanceof NodeSelection) return true

  // Text selections need actual, non-whitespace text
  if (selection.empty) return false
  return doc.textBetween(from, to).trim().length > 0
}
</script>

<template>
  <BubbleMenu
    :editor="editor"
    plugin-key="echoBasicBubbleMenu"
    :update-delay="100"
    :should-show="shouldShow"
    :options="options"
    class="z-20"
  >
    <div
      class="border px-3 py-2 select-none pointer-events-auto shadow-xs rounded-md bg-popover text-popover-foreground w-auto max-w-[calc(-68px+100vw)] overflow-x-auto"
      role="toolbar"
      :aria-label="t('editor.bubbleMenu.label')"
    >
      <div class="flex items-center flex-nowrap whitespace-nowrap h-[26px] justify-start relative gap-0.5">
        <template v-for="(item, key) in items" :key="key">
          <Separator v-if="item.type === 'divider'" orientation="vertical" class="mx-1 me-1 h-[16px]" />
          <component
            :is="item.component"
            v-else
            v-bind="item.componentProps"
            :editor="editor"
            :disabled="disabled || item.componentProps?.disabled"
          >
            <template v-for="(element, slotName) in item.componentSlots" :key="slotName" #[`${slotName}`]="values">
              <component :is="element" v-bind="values?.props" />
            </template>
          </component>
        </template>
      </div>
    </div>
  </BubbleMenu>
</template>
