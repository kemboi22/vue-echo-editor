<script setup lang="ts">
import { ref } from 'vue'
import {
  BaseKit,
  Blockquote,
  Bold,
  BulletList,
  Code,
  EchoEditor,
  Heading,
  History,
  Italic,
  Link,
  OrderedList,
  Underline,
} from 'vue-echo-editor'

defineProps<{ dark: boolean }>()

const content = ref('<h2>A lightweight editor</h2><p>Only the extensions you register are loaded — try the bubble menu by selecting text.</p>')

const extensions = [
  BaseKit.configure({ placeholder: { placeholder: 'Write something…' } }),
  History,
  Heading.configure({ spacer: true }),
  Bold,
  Italic,
  Underline,
  Code,
  Link,
  Blockquote.configure({ spacer: true }),
  BulletList,
  OrderedList,
]
</script>

<template>
  <section class="space-y-4">
    <p class="text-sm text-muted-foreground">
      A small set of extensions. Feature UIs such as tables, AI and the source-code dialog are never downloaded because their
      extensions are not registered.
    </p>
    <div class="rounded-xl border bg-card shadow-sm">
      <EchoEditor v-model="content" :extensions="extensions" :dark="dark" :min-height="220" label="Minimal editor" />
    </div>
  </section>
</template>
