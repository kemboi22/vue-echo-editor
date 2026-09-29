import { z } from 'zod'

export default defineMcpPrompt({
  name: 'integrate_echo_editor',
  title: 'Add Echo Editor to a project',
  description: 'Guides the assistant through adding Echo Editor to a Vue or Nuxt app using the documentation tools.',
  inputSchema: {
    framework: z.enum(['vue', 'nuxt']).default('vue').describe('Target framework'),
    requirements: z.string().default('').describe('What the editor needs to do, e.g. "markdown output, image upload to S3"'),
  },
  handler: async ({ framework, requirements }) => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: [
            `Add the Echo Editor (npm package \`vue-echo-editor\`) rich-text editor to my ${framework === 'nuxt' ? 'Nuxt' : 'Vue 3'} project.`,
            requirements ? `Requirements: ${requirements}` : '',
            'Steps:',
            '1. Call list_extensions and pick only the extensions the requirements need.',
            '2. Call get_setup_code with that selection to get install commands and a component.',
            '3. Use search_docs / get_doc for anything specific (uploads, markdown, collaboration, AI, theming, SSR).',
            '4. Remember: import `vue-echo-editor/style.css`, create the extensions array once (not inside a computed),'
              + ` ${framework === 'nuxt' ? 'wrap the editor in <ClientOnly>,' : ''} and never combine History with CollaborationKit.`,
          ]
            .filter(Boolean)
            .join('\n'),
        },
      },
    ],
  }),
})
