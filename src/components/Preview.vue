<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Editor } from '@tiptap/core'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Icon } from '@/components/icons'
import { useTiptapStore } from '@/hooks'
import { useLocale } from '@/locales'
import { ScrollArea } from '@/components/ui/scroll-area'
interface Props {
  editor: Editor
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})
const { t } = useLocale()
const store = useTiptapStore()
const currentSize = ref('100')

function openChange(e: boolean) {
  store!.state.showPreview = e
}
function handleClose() {
  store!.state.showPreview = false
}
const currentEditorContent = computed(() => {
  return props.editor.getHTML()
})

function handleSizeChange(value: any) {
  if (typeof value === 'string') {
    currentSize.value = value
  }
}
</script>

<template>
  <Dialog :open="store?.state.showPreview" @update:open="openChange">
    <DialogContent
      class="sm:max-w-[425px] md:max-w-[825px] lg:max-w-[1200px] grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90dvh]"
    >
      <DialogHeader class="p-6 pb-0">
        <DialogTitle>{{ t('editor.preview.tooltip') }}</DialogTitle>
        <div class="flex justify-center">
          <div class="hidden items-center gap-1.5 rounded-md border p-[2px] shadow-xs md:flex">
            <ToggleGroup type="single" :model-value="currentSize" @update:model-value="handleSizeChange">
              <ToggleGroupItem value="100" class="h-[32px] w-[32px] rounded-xs p-0">
                <Icon name="Monitor" class="w-5 h-5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="60" class="h-[32px] w-[32px] rounded-xs p-0">
                <Icon name="Tablet" class="w-5 h-5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="30" class="h-[32px] w-[32px] rounded-xs p-0">
                <Icon name="Phone" class="w-5 h-5" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </DialogHeader>
      <div
        class="relative overflow-y-auto after:absolute after:inset-0 after:right-3 after:z-0 after:rounded-lg h-(--container-height) px-4"
      >
        <div class="relative z-10 overflow-auto flex justify-center">
          <div
            class="relative rounded-lg border bg-background transition-all mx-auto"
            :style="{ width: currentSize + '%' }"
          >
            <ScrollArea class="h-full w-full rounded-md border p-3 border-none">
              <div v-html="currentEditorContent" class="EchoContentView echo-editor" />
            </ScrollArea>
          </div>
        </div>
      </div>
      <DialogFooter class="p-2 pt-0">
        <Button @click="handleClose"> {{ t('editor.close') }} </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style></style>
