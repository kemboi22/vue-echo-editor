import { z } from 'zod'
import { findDoc } from '../../utils/docs'

export default defineMcpTool({
  name: 'get_doc',
  description: 'Read a full Echo Editor documentation page as Markdown by its path (e.g. "/guide/markdown").',
  inputSchema: {
    path: z.string().describe('Page path as returned by search_docs or list_docs, e.g. "/getting-started/installation"'),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ path }) => {
    const doc = await findDoc(path)
    if (!doc) {
      throw createError({ statusCode: 404, statusMessage: `No page at "${path}". Use list_docs to see available paths.` })
    }
    return {
      content: [{ type: 'text', text: `# ${doc.title}\n\n${doc.description ? `> ${doc.description}\n\n` : ''}${doc.body}` }],
    }
  },
})
