import { findDoc } from '../../utils/docs'

/**
 * Raw Markdown for any page: `/raw/guide/markdown.md`. Linked from `/llms.txt`.
 */
export default defineEventHandler(async event => {
  const path = getRouterParam(event, 'path') ?? ''
  const doc = await findDoc(path)
  if (!doc) throw createError({ statusCode: 404, statusMessage: `No documentation page at /${path}` })

  setHeader(event, 'content-type', 'text/markdown; charset=utf-8')
  return `# ${doc.title}\n\n${doc.description ? `> ${doc.description}\n\n` : ''}${doc.body}\n`
})
