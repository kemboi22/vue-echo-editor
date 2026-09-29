import { z } from 'zod'
import { extensions } from '../../utils/extensions'

const PRESETS = {
  minimal: ['BaseKit', 'History', 'Heading', 'Bold', 'Italic', 'Underline', 'Link', 'BulletList', 'OrderedList'],
  blog: [
    'BaseKit', 'History', 'Heading', 'Bold', 'Italic', 'Underline', 'Strike', 'Link', 'Color', 'Highlight', 'TextAlign',
    'BulletList', 'OrderedList', 'TaskList', 'Blockquote', 'CodeBlock', 'HorizontalRule', 'Image', 'Table', 'SlashCommand',
  ],
  full: extensions.filter(ext => ext.category !== 'collaboration').map(ext => ext.name),
} as const

export default defineMcpTool({
  name: 'get_setup_code',
  description:
    'Generate ready-to-paste installation commands and a Vue (or Nuxt) component that renders Echo Editor with the requested extensions.',
  inputSchema: {
    framework: z.enum(['vue', 'nuxt']).default('vue').describe('Target framework'),
    preset: z.enum(['minimal', 'blog', 'full']).default('blog').describe('Starting set of extensions'),
    extra: z.array(z.string()).default([]).describe('Additional extension names, e.g. ["Markdown", "Export"]'),
    output: z.enum(['html', 'json', 'markdown', 'text']).default('html').describe('v-model format'),
    collaboration: z.boolean().default(false).describe('Include CollaborationKit with a y-websocket provider'),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ framework, preset, extra, output, collaboration }) => {
    const known = new Set(extensions.map(ext => ext.name))
    const unknown = extra.filter(name => !known.has(name))
    let names = [...new Set([...PRESETS[preset], ...extra.filter(name => known.has(name))])]
    if (output === 'markdown' && !names.includes('Markdown')) names.push('Markdown')
    if (collaboration) names = names.filter(name => name !== 'History')
    const configured = names.map(name => (name === 'AI' ? "AI.configure({ completions: myCompletions })" : name))

    const install = collaboration
      ? 'pnpm add vue-echo-editor yjs y-websocket @tiptap/y-tiptap @tiptap/extension-collaboration @tiptap/extension-collaboration-caret'
      : 'pnpm add vue-echo-editor'

    const collabImports = collaboration
      ? `import * as Y from 'yjs'\nimport { WebsocketProvider } from 'y-websocket'\nimport { CollaborationKit } from 'vue-echo-editor/collaboration'\n`
      : ''
    const collabSetup = collaboration
      ? `\nconst doc = new Y.Doc()\nconst provider = new WebsocketProvider('wss://your-server.example', 'room-1', doc)\n`
      : ''
    const collabExt = collaboration ? `\n  CollaborationKit.configure({ document: doc, provider, user: { name: 'Ada', color: '#f97316' } }),` : ''

    const component = `<script setup lang="ts">
${collaboration ? '' : "import { ref } from 'vue'\n"}import { EchoEditor, ${names.join(', ')} } from 'vue-echo-editor'
import 'vue-echo-editor/style.css'
${collabImports}${collabSetup}${collaboration ? '' : `\nconst content = ref(${output === 'json' ? '{}' : "''"})\n`}
// Create extensions once, outside of reactive state
const extensions = [
  ${configured.join(',\n  ')},${collabExt}
]
</script>

<template>
  ${framework === 'nuxt' ? '<ClientOnly>\n    ' : ''}<EchoEditor${collaboration ? '' : ' v-model="content"'} output="${output}" :extensions="extensions" :max-height="600" />${framework === 'nuxt' ? '\n  </ClientOnly>' : ''}
</template>`

    const text = [
      `## Install\n\n\`\`\`bash\n${install}\n\`\`\``,
      `## ${framework === 'nuxt' ? 'components/RichEditor.vue' : 'RichEditor.vue'}\n\n\`\`\`vue\n${component}\n\`\`\``,
      unknown.length ? `> Unknown extensions ignored: ${unknown.join(', ')}. Use list_extensions to see valid names.` : '',
    ]
      .filter(Boolean)
      .join('\n\n')

    return { content: [{ type: 'text', text }] }
  },
})
