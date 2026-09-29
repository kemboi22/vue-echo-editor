import { z } from 'zod'
import { extensions } from '../../utils/extensions'

export default defineMcpTool({
  name: 'list_extensions',
  description: 'List the built-in Echo Editor extensions with a description and configuration example, optionally filtered by category.',
  inputSchema: {
    category: z
      .enum(['core', 'marks', 'nodes', 'formatting', 'media', 'tools', 'ai', 'collaboration'])
      .optional()
      .describe('Only return extensions of this category'),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ category }) => {
    const list = category ? extensions.filter(ext => ext.category === category) : extensions
    return {
      content: [
        {
          type: 'text',
          text: list
            .map(ext => `- **${ext.name}** (${ext.category}): ${ext.description}${ext.example ? `\n  \`${ext.example}\`` : ''}`)
            .join('\n'),
        },
      ],
      structuredContent: { extensions: list },
    }
  },
})
