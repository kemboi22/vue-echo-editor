import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { Variables } from '@modelcontextprotocol/sdk/shared/uriTemplate.js'
import { findDoc, loadDocs } from '../../utils/docs'

export default defineMcpResource({
  name: 'docs',
  title: 'Echo Editor documentation',
  description: 'Every documentation page as Markdown, addressed as docs://<path>.',
  uri: new ResourceTemplate('docs://{+path}', {
    list: async () => ({
      resources: (await loadDocs())
        .filter(doc => doc.path !== '/')
        .map(doc => ({
          uri: `docs:/${doc.path}`,
          name: doc.title,
          description: doc.description,
          mimeType: 'text/markdown',
        })),
    }),
  }),
  handler: async (uri: URL, variables: Variables) => {
    const path = String(variables.path ?? '')
    const doc = await findDoc(path)
    if (!doc) throw createError({ statusCode: 404, statusMessage: `No page at ${path}` })
    return {
      contents: [{ uri: uri.toString(), mimeType: 'text/markdown', text: `# ${doc.title}\n\n${doc.body}` }],
    }
  },
})
