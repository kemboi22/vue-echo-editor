<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import { useDark, useStorage } from '@vueuse/core'
import { ThemeToggle, locale, supportedLocales, useLocale } from 'vue-echo-editor'

import './style.css'
import 'vue-echo-editor/style.css'

const demos = {
  full: { label: 'Full featured', component: defineAsyncComponent(() => import('./demos/FullDemo.vue')) },
  minimal: { label: 'Minimal', component: defineAsyncComponent(() => import('./demos/MinimalDemo.vue')) },
  markdown: { label: 'Markdown', component: defineAsyncComponent(() => import('./demos/MarkdownDemo.vue')) },
  collaboration: {
    label: 'Collaboration',
    component: defineAsyncComponent(() => import('./demos/CollaborationDemo.vue')),
  },
  plugins: { label: 'Plugins', component: defineAsyncComponent(() => import('./demos/PluginDemo.vue')) },
} as const

type DemoKey = keyof typeof demos

const active = useStorage<DemoKey>('echo-demo-tab', 'full')
const isDark = useDark()
const { lang } = useLocale()
const switching = ref(false)

const current = computed(() => demos[active.value] ?? demos.full)

async function changeLanguage(event: Event) {
  switching.value = true
  await locale.setLang((event.target as HTMLSelectElement).value)
  switching.value = false
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <header class="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div class="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <a href="https://github.com/kemboi22/vue-echo-editor" class="flex items-center gap-2 whitespace-nowrap font-semibold" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M12 7v10" />
            <path d="M8 9v6" opacity="0.7" />
            <path d="M4 11v2" opacity="0.4" />
            <path d="M16 9v6" opacity="0.7" />
            <path d="M20 11v2" opacity="0.4" />
          </svg>
          Echo Editor
          <span class="hidden whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">v1 · Tiptap 3</span>
        </a>
        <div class="ml-auto flex items-center gap-2">
          <label class="sr-only" for="lang">Language</label>
          <select
            id="lang"
            :value="lang"
            :disabled="switching"
            class="h-8 rounded-md border bg-background px-2 text-sm"
            @change="changeLanguage"
          >
            <option v-for="item in supportedLocales" :key="item.code" :value="item.code">{{ item.nativeName }}</option>
          </select>
          <a
            href="https://github.com/kemboi22/vue-echo-editor"
            target="_blank"
            rel="noopener"
            class="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent"
            aria-label="GitHub repository"
          >
            <svg viewBox="0 0 15 15" class="size-4" aria-hidden="true">
              <path
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M7.5.25a7.25 7.25 0 0 0-2.292 14.13c.363.066.495-.158.495-.35c0-.172-.006-.628-.01-1.233c-2.016.438-2.442-.972-2.442-.972c-.33-.838-.805-1.06-.805-1.06c-.658-.45.05-.441.05-.441c.728.051 1.11.747 1.11.747c.647 1.108 1.697.788 2.11.602c.066-.468.254-.788.46-.969c-1.61-.183-3.302-.805-3.302-3.583a2.8 2.8 0 0 1 .747-1.945c-.075-.184-.324-.92.07-1.92c0 0 .61-.194 1.994.744A7 7 0 0 1 7.5 3.756A7 7 0 0 1 9.315 4c1.384-.938 1.992-.743 1.992-.743c.396.998.147 1.735.072 1.919c.465.507.745 1.153.745 1.945c0 2.785-1.695 3.398-3.31 3.577c.26.224.492.667.492 1.343c0 .97-.009 1.751-.009 1.989c0 .194.131.42.499.349A7.25 7.25 0 0 0 7.499.25"
              />
            </svg>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">A fast, AI-ready rich-text editor for Vue</h1>
        <p class="max-w-2xl text-muted-foreground">
          Built on Tiptap 3 and shadcn-vue. Pick a demo below — every demo is lazily loaded, just like the editor's own feature
          UIs.
        </p>
      </div>

      <nav class="flex flex-wrap gap-1 rounded-lg border bg-muted/40 p-1" role="tablist" aria-label="Demos">
        <button
          v-for="(demo, key) in demos"
          :key="key"
          role="tab"
          :aria-selected="active === key"
          class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          :class="active === key ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'"
          @click="active = key"
        >
          {{ demo.label }}
        </button>
      </nav>

      <KeepAlive>
        <component :is="current.component" :key="active" :dark="isDark" role="tabpanel" />
      </KeepAlive>
    </main>
  </div>
</template>

<style>
.demo-btn {
  display: inline-flex;
  align-items: center;
  border-radius: calc(var(--radius) - 2px);
  border: 1px solid var(--border);
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  transition: background-color 150ms;
}
.demo-btn:hover {
  background: var(--accent);
}
.demo-btn:disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
