<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import {
  AI,
  BaseKit,
  Blockquote,
  Bold,
  BulletList,
  Clear,
  Code,
  CodeBlock,
  Color,
  Columns,
  EchoEditor,
  Export,
  FindAndReplace,
  FontFamily,
  FontSize,
  FormatPainter,
  Fullscreen,
  Heading,
  Highlight,
  History,
  HorizontalRule,
  Iframe,
  Image,
  ImageUpload,
  ImportWord,
  Indent,
  Italic,
  LineHeight,
  Link,
  Markdown,
  MoreMark,
  OrderedList,
  Preview,
  Printer,
  SlashCommand,
  SourceCode,
  SpecialCharacter,
  Strike,
  Table,
  TaskList,
  TextAlign,
  Underline,
  Video,
  VideoUpload,
} from 'vue-echo-editor'
import type { EditorInstance, JSONContent } from 'vue-echo-editor'
import { ExportWord } from '../extensions/ExportWord'
import { DEMO_CONTENT } from '../initContent'
import { createAICompletions } from '../ai'

defineProps<{ dark: boolean }>()

// Starts as JSON; the editor emits HTML (output="html") after the first change
const content = ref<string | JSONContent>(DEMO_CONTENT)
const outputText = computed(() => (typeof content.value === 'string' ? content.value : JSON.stringify(content.value, null, 2)))
const hideToolbar = ref(false)
const hideMenubar = ref(true)
const disabled = ref(false)
const editor = shallowRef<EditorInstance>()

async function uploadFiles(files: File[]) {
  return files.map(file => ({ src: URL.createObjectURL(file), alt: file.name }))
}

// Extensions are created once — never inside a computed that re-runs on render
const extensions = [
  BaseKit.configure({
    placeholder: { showOnlyCurrent: true },
    characterCount: { limit: 50_000 },
  }),
  History,
  Columns,
  FormatPainter,
  Clear,
  Heading.configure({ spacer: true }),
  FontSize,
  FontFamily,
  Bold,
  Italic,
  Underline,
  Strike,
  MoreMark,
  Color.configure({ spacer: true }),
  Highlight,
  BulletList,
  OrderedList,
  TextAlign.configure({ types: ['heading', 'paragraph', 'image'], spacer: true }),
  Indent,
  LineHeight,
  TaskList.configure({ spacer: true, taskItem: { nested: true } }),
  Link,
  Image,
  ImageUpload.configure({
    upload: (file: File) => new Promise<string>(resolve => setTimeout(() => resolve(URL.createObjectURL(file)), 800)),
  }),
  Video,
  VideoUpload.configure({ upload: uploadFiles }),
  Blockquote,
  SlashCommand,
  HorizontalRule,
  CodeBlock,
  Table.configure({ spacer: true }),
  Code,
  Markdown,
  Export,
  ExportWord,
  AI.configure({
    completions: createAICompletions(),
    shortcuts: [
      {
        label: 'Custom Actions',
        children: [
          {
            label: 'Fix grammar and polish',
            prompt:
              'Rewrite this content with no spelling mistakes, proper grammar, and more descriptive language, without losing the original meaning.',
          },
        ],
      },
    ],
  }),
  ImportWord.configure({ upload: uploadFiles }),
  SpecialCharacter,
  Fullscreen.configure({ spacer: true }),
  SourceCode,
  Preview,
  FindAndReplace.configure({ spacer: true }),
  Printer,
  Iframe,
]
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap gap-2" role="group" aria-label="Editor options">
      <button class="demo-btn" :aria-pressed="hideToolbar" @click="hideToolbar = !hideToolbar">
        {{ hideToolbar ? 'Show toolbar' : 'Hide toolbar' }}
      </button>
      <button class="demo-btn" :aria-pressed="!hideMenubar" @click="hideMenubar = !hideMenubar">
        {{ hideMenubar ? 'Show menubar' : 'Hide menubar' }}
      </button>
      <button class="demo-btn" :aria-pressed="disabled" @click="disabled = !disabled">
        {{ disabled ? 'Make editable' : 'Make read-only' }}
      </button>
      <button class="demo-btn" :disabled="!editor" @click="editor?.commands.exportDocument('markdown', 'echo-demo')">
        Download Markdown
      </button>
    </div>

    <div class="rounded-xl border bg-card text-card-foreground shadow-sm">
      <EchoEditor
        v-model="content"
        :extensions="extensions"
        :hide-toolbar="hideToolbar"
        :hide-menubar="hideMenubar"
        :disabled="disabled"
        :max-height="560"
        :dark="dark"
        label="Demo document"
        output="html"
        @create="({ editor: instance }) => (editor = instance)"
      />
    </div>

    <details class="rounded-xl border bg-muted/40 p-4">
      <summary class="cursor-pointer text-sm font-medium">Output ({{ outputText.length.toLocaleString() }} chars)</summary>
      <pre class="mt-3 max-h-[360px] overflow-auto whitespace-pre-wrap break-all text-xs">{{ outputText }}</pre>
    </details>
  </section>
</template>
