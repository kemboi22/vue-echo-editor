import { loadDocs } from '../utils/docs'

/**
 * Feeds the documentation pages into `nuxt-llms`:
 * - `/llms.txt` lists every page grouped by section (links point at the raw Markdown)
 * - `/llms-full.txt` contains the full Markdown of every page
 */
export default defineNitroPlugin(nitroApp => {
  nitroApp.hooks.hook('llms:generate', async (_event, options) => {
    const docs = await loadDocs()
    const sections = new Map<string, typeof docs>()
    for (const doc of docs) {
      if (doc.path === '/') continue
      const list = sections.get(doc.section) ?? []
      list.push(doc)
      sections.set(doc.section, list)
    }

    options.sections = [
      ...(options.sections ?? []),
      ...[...sections].map(([title, pages]) => ({
        title,
        links: pages.map(page => ({
          title: page.title,
          description: page.description,
          href: `${options.domain}/raw${page.path}.md`,
        })),
      })),
    ]
  })

  nitroApp.hooks.hook('llms:generate:full', async (_event, _options, contents) => {
    const docs = await loadDocs()
    for (const doc of docs) {
      if (doc.path === '/') continue
      contents.push(`# ${doc.title}\n\nSource: ${doc.path}\n\n${doc.description ? `> ${doc.description}\n\n` : ''}${doc.body}`)
    }
  })
})
