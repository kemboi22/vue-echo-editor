import { loadDocs } from '../../utils/docs'

export default defineMcpTool({
  name: 'list_docs',
  description: 'List every Echo Editor documentation page (path, title, description), grouped by section.',
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async () => {
    const docs = (await loadDocs()).filter(doc => doc.path !== '/')
    const bySection = new Map<string, string[]>()
    for (const doc of docs) {
      const lines = bySection.get(doc.section) ?? []
      lines.push(`- ${doc.path} — ${doc.title}${doc.description ? `: ${doc.description}` : ''}`)
      bySection.set(doc.section, lines)
    }
    const text = [...bySection].map(([section, lines]) => `## ${section}\n${lines.join('\n')}`).join('\n\n')
    return { content: [{ type: 'text', text }] }
  },
})
