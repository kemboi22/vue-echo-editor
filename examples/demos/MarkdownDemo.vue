<script setup lang="ts">
import { ref } from 'vue'
import {
  BaseKit,
  Blockquote,
  Bold,
  BulletList,
  Code,
  CodeBlock,
  EchoEditor,
  Export,
  Heading,
  History,
  HorizontalRule,
  Italic,
  Link,
  Markdown,
  OrderedList,
  Strike,
  TaskList,
} from 'vue-echo-editor'

defineProps<{ dark: boolean }>()

const markdown = ref(`# Markdown in, Markdown out

Echo Editor can read and write **Markdown** through \`v-model\` with \`output="markdown"\`.

- Edit on the left
- Or type Markdown directly in the textarea on the right
- Both stay in sync

> Powered by the official \`@tiptap/markdown\` extension.

\`\`\`ts
const editor = useEditor({ extensions: [Markdown] })
editor.getMarkdown()
\`\`\`
`)

const extensions = [
  BaseKit,
  History,
  Heading.configure({ spacer: true }),
  Bold,
  Italic,
  Strike,
  Code,
  Link,
  BulletList,
  OrderedList,
  TaskList,
  Blockquote,
  HorizontalRule,
  CodeBlock,
  Markdown,
  Export.configure({ formats: ['markdown', 'html', 'text'], filename: 'markdown-demo' }),
]
</script>

<template>
  <section class="grid gap-4 lg:grid-cols-2">
    <div class="rounded-xl border bg-card shadow-sm">
      <EchoEditor v-model="markdown" output="markdown" :extensions="extensions" :dark="dark" :max-height="520" label="Markdown editor" />
    </div>
    <label class="flex flex-col gap-2">
      <span class="text-sm font-medium">Markdown source (two-way bound)</span>
      <textarea
        v-model="markdown"
        spellcheck="false"
        class="min-h-[520px] flex-1 rounded-xl border bg-muted/40 p-4 font-mono text-xs leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </label>
  </section>
</template>
