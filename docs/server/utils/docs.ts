import { useStorage } from 'nitropack/runtime'

export interface DocPage {
  /** URL path, e.g. `/guide/markdown` */
  path: string
  title: string
  description: string
  /** Section title from the parent folder, e.g. `Guide` */
  section: string
  /** Markdown body without frontmatter */
  body: string
  /** Order for stable sorting */
  order: string
}

const STORAGE = 'assets:docs'

const stripOrder = (segment: string) => segment.replace(/^\d+\./, '')

function parseFrontmatter(source: string): { data: Record<string, string>; body: string } {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return { data: {}, body: source }
  const data: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([\w.-]+):\s*(.*)$/)
    if (pair) data[pair[1]] = pair[2].replace(/^['"]|['"]$/g, '').trim()
  }
  return { data, body: source.slice(match[0].length) }
}

/**
 * Turns MDC components into plain Markdown so LLMs get clean text:
 * `::alert{type="info"}` blocks become blockquotes, other component fences are dropped.
 */
export function toPlainMarkdown(body: string): string {
  return body
    .replace(/:pm-install\{name="([^"]+)"\}/g, (_m, pkg: string) => '```bash\npnpm add ' + pkg + '\n```')
    .replace(/\s:br\s/g, ' ')
    .replace(/^\s*::(alert|callout|tip|note|warning)[^\n]*\n([\s\S]*?)^\s*::\s*$/gm, (_m, _type, inner: string) =>
      inner
        .trim()
        .split('\n')
        .map(line => `> ${line}`)
        .join('\n')
    )
    .replace(/^\s*:{2,}[\w-]*(\{[^}]*\})?\s*$/gm, '')
    .replace(/^\s*#(title|description|default|code|preview)\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

let cache: Promise<DocPage[]> | null = null

export function loadDocs(): Promise<DocPage[]> {
  if (cache && !import.meta.dev) return cache
  cache = (async () => {
    const storage = useStorage(STORAGE)
    const keys = (await storage.getKeys()).filter(key => key.endsWith('.md'))

    // Folder titles come from `_dir.yml`
    const sections = new Map<string, string>()
    for (const key of (await storage.getKeys()).filter(k => k.endsWith('_dir.yml'))) {
      const raw = String((await storage.getItem(key)) ?? '')
      const title = raw.match(/^title:\s*(.+)$/m)?.[1]?.replace(/^['"]|['"]$/g, '')
      sections.set(key.replace(/:?_dir\.yml$/, ''), title ?? '')
    }

    const pages: DocPage[] = []
    for (const key of keys) {
      const raw = await storage.getItem(key)
      const source = typeof raw === 'string' ? raw : new TextDecoder().decode(raw as ArrayBuffer)
      const { data, body } = parseFrontmatter(source)
      if (data.navigation === 'false' && !key.startsWith('index')) continue

      const segments = key.replace(/\.md$/, '').split(':')
      const folder = segments.slice(0, -1).join(':')
      const path =
        '/' +
        segments
          .map(stripOrder)
          .filter(segment => segment !== 'index')
          .join('/')

      pages.push({
        path: path === '/' ? '/' : path,
        title: data.title ?? stripOrder(segments.at(-1)!),
        description: data.description ?? '',
        section: sections.get(folder) || (folder ? stripOrder(folder) : 'Home'),
        body: toPlainMarkdown(body),
        order: key,
      })
    }

    return pages.sort((a, b) => a.order.localeCompare(b.order, 'en', { numeric: true }))
  })()
  return cache
}

export async function findDoc(path: string): Promise<DocPage | undefined> {
  const normalized = '/' + path.replace(/^\/+|\/+$/g, '').replace(/\.md$/, '')
  const docs = await loadDocs()
  return docs.find(doc => doc.path === normalized || (normalized === '/index' && doc.path === '/'))
}

/**
 * Tiny ranked full-text search: title hits weigh more than description hits, which weigh more than body hits.
 */
export async function searchDocs(query: string, limit = 5) {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(term => term.length > 1)
  if (!terms.length) return []

  const docs = await loadDocs()
  return docs
    .map(doc => {
      const title = doc.title.toLowerCase()
      const description = doc.description.toLowerCase()
      const body = doc.body.toLowerCase()
      let score = 0
      for (const term of terms) {
        if (title.includes(term)) score += 10
        if (description.includes(term)) score += 4
        score += Math.min(body.split(term).length - 1, 10)
      }
      const firstHit = terms.map(term => body.indexOf(term)).filter(i => i >= 0).sort((a, b) => a - b)[0] ?? 0
      const excerpt = doc.body.slice(Math.max(0, firstHit - 120), firstHit + 280).replace(/\s+/g, ' ').trim()
      return { doc, score, excerpt }
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
