import { z } from 'zod'
import { searchDocs } from '../../utils/docs'

export default defineMcpTool({
  name: 'search_docs',
  description:
    'Full-text search across the Echo Editor documentation. Returns the best matching pages with a short excerpt. Use get_doc to read a page in full.',
  inputSchema: {
    query: z.string().min(2).describe('What to look for, e.g. "markdown v-model" or "collaboration provider"'),
    limit: z.number().int().min(1).max(20).default(5).describe('Maximum number of results'),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ query, limit }) => {
    const results = await searchDocs(query, limit)
    if (!results.length) {
      return { content: [{ type: 'text', text: `No documentation pages match "${query}". Try list_docs to browse.` }] }
    }
    const text = results
      .map(({ doc, excerpt }, i) => `${i + 1}. ${doc.title} (${doc.path})\n   ${doc.description}\n   …${excerpt}…`)
      .join('\n\n')
    return { content: [{ type: 'text', text }] }
  },
})
