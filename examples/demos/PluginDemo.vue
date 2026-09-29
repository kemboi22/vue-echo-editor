<script setup lang="ts">
import { ref } from 'vue'
import { ActionButton, BaseKit, Bold, EchoEditor, Heading, History, Italic, SlashCommand, definePlugin, useEditorState } from 'vue-echo-editor'
import { defineComponent, h } from 'vue'
import type { EditorInstance } from 'vue-echo-editor'
import { ExportWord } from '../extensions/ExportWord'

defineProps<{ dark: boolean }>()

/** A live word counter rendered in the toolbar, driven by `useEditorState`. */
const WordCountBadge = defineComponent({
  props: { editor: { type: Object as () => EditorInstance, required: true } },
  setup(props) {
    const words = useEditorState(props.editor, editor => editor.getText().split(/\s+/).filter(Boolean).length)
    return () => h('span', { class: 'px-2 text-xs tabular-nums text-muted-foreground', 'aria-live': 'polite' }, `${words.value} words`)
  },
})

const WordCount = definePlugin({
  name: 'wordCount',
  toolbar: () => ({ component: WordCountBadge, componentProps: {} }),
})

const Timestamp = definePlugin({
  name: 'timestamp',
  locales: {
    en: { 'timestamp.insert': 'Insert timestamp', 'timestamp.group': 'Custom' },
    fr: { 'timestamp.insert': "Insérer l'horodatage", 'timestamp.group': 'Personnalisé' },
  },
  toolbar: ({ editor, t }) => ({
    component: ActionButton,
    componentProps: {
      icon: 'Hash',
      tooltip: t('timestamp.insert'),
      action: () => editor.chain().focus().insertContent(new Date().toLocaleString()).run(),
    },
  }),
  slashCommands: [
    {
      name: 'custom',
      title: 'timestamp.group',
      commands: [
        {
          name: 'timestamp',
          label: 'Timestamp',
          aliases: ['date', 'time', 'now'],
          iconName: 'Hash',
          action: ({ editor, range }) => editor.chain().focus().deleteRange(range).insertContent(new Date().toLocaleString()).run(),
        },
      ],
    },
  ],
  setup: ({ editor }) => {
    const onFocus = () => console.info('[timestamp plugin] editor focused')
    editor.on('focus', onFocus)
    return () => editor.off('focus', onFocus)
  },
})

const content = ref('<p>Type <code>/time</code> or use the toolbar buttons contributed by plugins.</p>')

const extensions = [BaseKit, History, Heading, Bold, Italic, SlashCommand, Timestamp, ExportWord, WordCount]
</script>

<template>
  <section class="space-y-4">
    <p class="text-sm text-muted-foreground">
      Three plugins built with <code>definePlugin()</code>: a timestamp inserter (toolbar + slash command + translations), the
      Word exporter, and a live word counter.
    </p>
    <div class="rounded-xl border bg-card shadow-sm">
      <EchoEditor v-model="content" :extensions="extensions" :dark="dark" :min-height="220" label="Plugin demo" />
    </div>
  </section>
</template>
