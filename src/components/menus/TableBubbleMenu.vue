<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import { isActive } from '@tiptap/core'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import { useLocale } from '@/locales'
import ActionButton from '@/components/ActionButton.vue'
import { createBubbleMenuOptions, createVirtualElementGetter } from './floating'
import type { BubbleMenuShouldShow } from './floating'
import HighlightActionButton from '@/extensions/Highlight/components/HighlightActionButton.vue'
import { Separator } from '@/components/ui/separator'

interface Props {
  editor: Editor
}
const props = withDefaults(defineProps<Props>(), {})

const shouldShow: BubbleMenuShouldShow = ({ editor }) => editor.isEditable && isActive(editor.state, 'table')
const { t } = useLocale()

function onAddColumnBefore() {
  props.editor.chain().focus().addColumnBefore().run()
}

function onAddColumnAfter() {
  props.editor.chain().focus().addColumnAfter().run()
}

function onDeleteColumn() {
  props.editor.chain().focus().deleteColumn().run()
}
function onAddRowAbove() {
  props.editor.chain().focus().addRowBefore().run()
}

function onAddRowBelow() {
  props.editor.chain().focus().addRowAfter().run()
}

function onDeleteRow() {
  props.editor.chain().focus().deleteRow().run()
}

function onMergeCell() {
  props.editor.chain().focus().mergeCells().run()
}
function onSplitCell() {
  props.editor?.chain().focus().splitCell().run()
}
function onDeleteTable() {
  props.editor.chain().focus().deleteTable().run()
}

function onSetCellBackground(color: string) {
  props.editor.chain().focus().setTableCellBackground(color).run()
}
// Anchor the menu to the whole table instead of the text selection
const getReferencedVirtualElement = createVirtualElementGetter(() => {
  const { view, state } = props.editor
  const { node } = view.domAtPos(state.selection.from)
  const element = (node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement) as HTMLElement | null
  return element?.closest('.tableWrapper')
})

const options = createBubbleMenuOptions(props.editor, {
  placement: 'top',
  offset: 8,
  flip: true,
  shift: { padding: 8 },
})
</script>
<template>
  <BubbleMenu
    :editor="editor"
    plugin-key="echoTableMenu"
    :should-show="shouldShow"
    :update-delay="0"
    :options="options"
    :get-referenced-virtual-element="getReferencedVirtualElement"
    class="z-20"
  >
    <div
      class="min-w-32 flex flex-row h-full items-center leading-none gap-0.5 p-2 w-full bg-background rounded-lg shadow-xs border border-border"
      role="toolbar"
      :aria-label="t('editor.table.tooltip')"
    >
      <ActionButton
        icon="BetweenHorizonalEnd"
        :tooltip="t('editor.table.menu.insertColumnBefore')"
        :action="onAddColumnBefore"
        :tooltip-options="{
          sideOffset: 15,
        }"
        :disabled="!editor?.can().addColumnBefore()"
      />
      <ActionButton
        icon="BetweenHorizonalStart"
        :tooltip="t('editor.table.menu.insertColumnAfter')"
        :action="onAddColumnAfter"
        :tooltip-options="{
          sideOffset: 15,
        }"
        :disabled="!editor?.can().addColumnAfter()"
      />
      <ActionButton
        icon="ColumnDelete"
        :action="onDeleteColumn"
        :tooltip="t('editor.table.menu.deleteColumn')"
        :tooltip-options="{
          sideOffset: 15,
        }"
        :disabled="!editor?.can().deleteColumn()"
      />
      <Separator orientation="vertical" class="mx-1 me-2 h-[16px]" />

      <ActionButton
        icon="BetweenVerticalEnd"
        :action="onAddRowAbove"
        :tooltip="t('editor.table.menu.insertRowAbove')"
        :tooltip-options="{
          sideOffset: 15,
        }"
        :disabled="!editor?.can().addRowBefore()"
      />

      <ActionButton
        icon="BetweenVerticalStart"
        :action="onAddRowBelow"
        :tooltip="t('editor.table.menu.insertRowBelow')"
        :tooltip-options="{
          sideOffset: 15,
        }"
        :disabled="!editor?.can().addRowAfter()"
      />
      <ActionButton
        icon="RowDelete"
        :action="onDeleteRow"
        :tooltip="t('editor.table.menu.deleteRow')"
        :tooltip-options="{
          sideOffset: 15,
        }"
        :disabled="!editor?.can().deleteRow()"
      />
      <Separator orientation="vertical" class="mx-1 me-2 h-[16px]" />
      <ActionButton
        icon="TableCellsMerge"
        :action="onMergeCell"
        :tooltip="t('editor.table.menu.mergeCells')"
        :tooltip-options="{
          sideOffset: 15,
        }"
        :disabled="!editor?.can().mergeCells()"
      />
      <ActionButton
        icon="TableCellsSplit"
        :action="onSplitCell"
        :tooltip="t('editor.table.menu.splitCells')"
        :tooltip-options="{
          sideOffset: 15,
        }"
        :disabled="!editor?.can().splitCell()"
      />
      <Separator orientation="vertical" class="mx-1 me-2 h-[16px]" />

      <HighlightActionButton
        :editor="editor"
        :tooltip="t('editor.table.menu.setCellsBgColor')"
        :action="onSetCellBackground"
        :tooltip-options="{
          sideOffset: 15,
        }"
      />
      <ActionButton
        icon="Trash2"
        :tooltip="t('editor.table.menu.deleteTable')"
        :action="onDeleteTable"
        :tooltip-options="{
          sideOffset: 15,
        }"
        :disabled="!editor?.can().deleteTable()"
      />
    </div>
  </BubbleMenu>
</template>
