<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import LinkEditBlock from '@/extensions/Link/components/LinkEditBlock.vue'
import LinkViewBlock from '@/extensions/Link/components/LinkViewBlock.vue'
import { TextSelection } from '@tiptap/pm/state'
import { createBubbleMenuOptions } from './floating'
import type { BubbleMenuShouldShow } from './floating'

interface Props {
  editor: Editor
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const showEdit = ref(false)
const link = computed(() => {
  const { href: link } = props.editor.getAttributes('link')
  return link
})
const shouldShow: BubbleMenuShouldShow = ({ editor }) => editor.isEditable && editor.isActive('link')

const options = createBubbleMenuOptions(props.editor, {
  placement: 'bottom-start',
  offset: 8,
  flip: false,
  shift: { padding: 8 },
  onHide: () => {
    showEdit.value = false
  },
})

function onSetLink(url: string, text?: string, openInNewTab?: boolean) {
  props.editor
    .chain()
    .extendMarkRange('link')
    .insertContent({
      type: 'text',
      text: text,
      marks: [
        {
          type: 'link',
          attrs: {
            href: url,
            target: openInNewTab ? '_blank' : '_self',
          },
        },
      ],
    })
    .setLink({ href: url })
    .focus()
    .run()
  showEdit.value = false
}
function unSetLink() {
  props.editor.chain().extendMarkRange('link').unsetLink().focus().run()
  showEdit.value = false
}
function onClickOutside() {
  const { state, view } = props.editor
  const { tr, selection } = state
  const transaction = tr.setSelection(TextSelection.create(state.doc, selection.from))
  view.dispatch(transaction)
  showEdit.value = false
}
</script>

<template>
  <BubbleMenu
    :editor="editor"
    plugin-key="echoLinkMenu"
    :should-show="shouldShow"
    :update-delay="0"
    :options="options"
    class="z-50"
  >
    <LinkEditBlock @onSetLink="onSetLink" @on-click-outside="onClickOutside" :editor="editor" v-if="showEdit" />
    <LinkViewBlock :editor="editor" @clear="unSetLink" @edit="showEdit = true" :link="link" v-else />
  </BubbleMenu>
</template>
