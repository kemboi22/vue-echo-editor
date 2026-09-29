<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import { isActive } from '@tiptap/core'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import { createBubbleMenuOptions, createVirtualElementGetter } from './floating'
import type { BubbleMenuShouldShow } from './floating'
import ActionButton from '@/components/ActionButton.vue'
import { ColumnLayout } from '@/extensions/MultiColumn'
import { getRenderContainer } from '@/utils/getRenderContainer'
import { useLocale } from '@/locales'

interface Props {
  editor: Editor
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})
const { t } = useLocale()

const shouldShow: BubbleMenuShouldShow = ({ editor }) => editor.isEditable && isActive(editor.state, 'columns')

// Anchor the menu to the columns block instead of the text selection
const getReferencedVirtualElement = createVirtualElementGetter(() => getRenderContainer(props.editor, 'columns'))

const options = createBubbleMenuOptions(props.editor, {
  placement: 'top',
  offset: 8,
  flip: true,
  shift: { padding: 8 },
})

const onDelete = () => {
  props.editor.chain().focus().deleteNode('columns').run()
}
</script>

<template>
  <BubbleMenu
    :editor="editor"
    plugin-key="echoColumnsMenu"
    :should-show="shouldShow"
    :update-delay="0"
    :options="options"
    :get-referenced-virtual-element="getReferencedVirtualElement"
    class="z-20"
  >
    <div class="p-2 bg-background rounded-lg shadow-xs border">
      <div class="flex gap-1 items-center">
        <ActionButton
          icon="Trash"
          :tooltip="t('editor.remove')"
          :action="onDelete"
          :isActive="() => editor.isActive('columns', { layout: ColumnLayout.SidebarLeft })"
          :tooltip-options="{ sideOffset: 15 }"
        />
      </div>
    </div>
  </BubbleMenu>
</template>
