<script setup lang="ts">
import { ActionButton } from 'vue-echo-editor'
import type { EditorInstance } from 'vue-echo-editor'
import exportWordIcon from '../../../icons/exportWord.svg?url'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    tooltip?: string
    editor?: EditorInstance
  }>(),
  { disabled: false, tooltip: 'Export to Word', editor: undefined }
)

function handleExport() {
  props.editor?.commands.exportToWord()
}
</script>

<template>
  <ActionButton :tooltip="tooltip" :disabled="disabled" :action="handleExport">
    <template #icon>
      <img :src="exportWordIcon" alt="" width="16" height="16" class="dark:invert" />
    </template>
  </ActionButton>
</template>
