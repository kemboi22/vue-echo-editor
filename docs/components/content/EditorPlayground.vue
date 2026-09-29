<script setup lang="ts">
import { ref } from 'vue'
import {
  BaseKit,
  Blockquote,
  Bold,
  BulletList,
  Code,
  CodeBlock,
  Color,
  EchoEditor,
  Export,
  Heading,
  Highlight,
  History,
  HorizontalRule,
  Image,
  Italic,
  Link,
  Markdown,
  OrderedList,
  SlashCommand,
  Strike,
  Table,
  TaskList,
  TextAlign,
  Underline,
} from 'vue-echo-editor'
import 'vue-echo-editor/style.css'

const props = withDefaults(defineProps<{ minHeight?: number; maxHeight?: number; showOutput?: boolean }>(), {
  minHeight: 260,
  maxHeight: 520,
  showOutput: false,
})

const colorMode = useColorMode()

const content = ref(`<h2>Try Echo Editor 👋</h2>
<p>Select text for the <strong>bubble menu</strong>, type <code>/</code> on an empty line for the <em>slash menu</em>, or drag blocks with the handle on the left.</p>
<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>Tiptap 3 under the hood</p></li><li data-type="taskItem" data-checked="false"><p>Markdown in and out</p></li></ul>
<blockquote><p>Everything you see is lazy-loaded on demand.</p></blockquote>`)

const extensions = [
  BaseKit.configure({ characterCount: { limit: 5000 } }),
  History,
  Heading.configure({ spacer: true }),
  Bold,
  Italic,
  Underline,
  Strike,
  Code,
  Color.configure({ spacer: true }),
  Highlight,
  TextAlign.configure({ types: ['heading', 'paragraph', 'image'], spacer: true }),
  BulletList,
  OrderedList,
  TaskList,
  Link,
  Image,
  Blockquote,
  HorizontalRule,
  CodeBlock,
  Table.configure({ spacer: true }),
  SlashCommand,
  Markdown,
  Export,
]
</script>

<template>
  <div class="not-prose my-6 overflow-hidden rounded-lg border bg-background shadow-sm">
    <ClientOnly>
      <EchoEditor
        v-model="content"
        :extensions="extensions"
        :dark="colorMode.value === 'dark'"
        :min-height="props.minHeight"
        :max-height="props.maxHeight"
        label="Echo Editor playground"
      />
      <template #fallback>
        <div class="flex items-center justify-center text-sm text-muted-foreground" :style="{ height: `${props.minHeight}px` }">
          Loading editor…
        </div>
      </template>
    </ClientOnly>
    <details v-if="props.showOutput" class="border-t p-3 text-sm">
      <summary class="cursor-pointer font-medium">HTML output</summary>
      <pre class="mt-2 max-h-60 overflow-auto whitespace-pre-wrap break-all text-xs">{{ content }}</pre>
    </details>
  </div>
</template>
