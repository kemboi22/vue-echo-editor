// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'

const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL || 'https://echo-editor.dev'

export default defineNuxtConfig({
  extends: ['shadcn-docs-nuxt'],

  modules: ['nuxt-llms', '@nuxtjs/mcp-toolkit'],

  devtools: { enabled: true },

  i18n: {
    defaultLocale: 'en',
    locales: [{ code: 'en', name: 'English', language: 'en-US' }],
  },

  // The markdown sources are bundled with the server so `/llms*.txt` and the MCP server can read them
  nitro: {
    // Nitro resolves relative asset dirs from `server/`, so use an absolute path
    serverAssets: [{ baseName: 'docs', dir: fileURLToPath(new URL('./content', import.meta.url)) }],
    prerender: {
      routes: ['/llms.txt', '/llms-full.txt'],
    },
  },

  llms: {
    domain: SITE_URL,
    title: 'Echo Editor',
    description:
      'Echo Editor is a fast, AI-ready WYSIWYG rich-text editor for Vue 3, built on Tiptap 3 and shadcn-vue. It ships 40+ extensions, bubble menus, a slash menu, Markdown, export, real-time collaboration, i18n and a plugin system.',
    notes: [
      'Package name on npm: `vue-echo-editor`. Import styles with `import \'vue-echo-editor/style.css\'`.',
      'Collaboration lives in a separate entry point: `vue-echo-editor/collaboration`.',
      'Every page is also available as raw Markdown at `/raw/<path>.md`.',
    ],
    full: {
      title: 'Echo Editor — full documentation',
      description: 'The complete Echo Editor documentation in a single Markdown file.',
    },
  },

  mcp: {
    name: 'Echo Editor Docs',
    version: '1.0.0',
    description: 'Search and read the Echo Editor documentation, list extensions and get setup code for Vue and Nuxt.',
    browserRedirect: '/ai/mcp',
  },

  vite: {
    optimizeDeps: {
      include: ['vue-echo-editor'],
    },
  },

  compatibilityDate: '2025-07-15',
})
