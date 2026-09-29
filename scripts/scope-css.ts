import postcss from 'postcss'
import type { Plugin as PostcssPlugin, Rule } from 'postcss'
import selectorParser from 'postcss-selector-parser'
import type { Plugin as VitePlugin } from 'vite'

/**
 * Every element that owns editor UI carries `.echo-editor-ui`: the editor root, the slash menu
 * popup, and the popovers, menus, dialogs and toasts that are portalled to `<body>`.
 */
export const SCOPE_ROOTS = ['.echo-editor-ui']

const SCOPE_SELF_OR_DESCENDANT = SCOPE_ROOTS.flatMap(root => [root, `${root} *`]).join(',')
const GLOBAL_ROOTS = new Set([':root', ':host', 'html', 'body'])

function scopeSelector(selector: string): string {
  const root = selectorParser().astSync(selector)
  const output: string[] = []

  root.each(sel => {
    const first = sel.nodes[0]
    const firstCompound: selectorParser.Node[] = []
    for (const node of sel.nodes) {
      if (node.type === 'combinator') break
      firstCompound.push(node)
    }

    // `:root`, `:host`, `html`, `body` → the editor roots (design tokens live there)
    if (firstCompound.length === 1 && (first.type === 'pseudo' || first.type === 'tag') && GLOBAL_ROOTS.has(first.value)) {
      const rest = sel.toString().trim().slice(first.toString().trim().length)
      for (const scopeRoot of SCOPE_ROOTS) output.push(`${scopeRoot}${rest}`)
      return
    }

    // `.dark` (the dark-mode token block) → dark editor roots
    if (sel.nodes.length === 1 && first.type === 'class' && first.value === 'dark') {
      for (const scopeRoot of SCOPE_ROOTS) output.push(`.dark ${scopeRoot}`, `.dark${scopeRoot}`)
      return
    }

    // Everything else: guard the first compound with a zero-specificity `:where(...)`.
    // A type or universal selector has to stay first in its compound.
    const guard = `:where(${SCOPE_SELF_OR_DESCENDANT})`
    const text = sel.toString().trim()
    if (first.type === 'tag' || first.type === 'universal') {
      const head = first.toString().trim()
      output.push(`${head}${guard}${text.slice(head.length)}`)
    } else {
      output.push(`${guard}${text}`)
    }
  })

  return [...new Set(output)].join(',\n')
}

function isInsideKeyframes(rule: Rule) {
  let parent = rule.parent
  while (parent) {
    if (parent.type === 'atrule' && /keyframes$/i.test((parent as any).name)) return true
    parent = parent.parent as any
  }
  return false
}

/** PostCSS plugin that confines every rule to the editor's own elements. */
export function scopeEditorCss(): PostcssPlugin {
  return {
    postcssPlugin: 'echo-editor-scope',
    Rule(rule) {
      if (isInsideKeyframes(rule) || (rule as any)[Symbol.for('echo-scoped')]) return
      ;(rule as any)[Symbol.for('echo-scoped')] = true
      rule.selector = scopeSelector(rule.selector)
    },
  }
}

/**
 * Vite plugin: post-processes the emitted library stylesheet so it cannot leak into host apps —
 * no global preflight, no global utilities, no overridden `:root` tokens.
 */
export function scopeCssPlugin(fileName = 'style.css'): VitePlugin {
  return {
    name: 'echo-editor:scope-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const asset = bundle[fileName]
      if (!asset || asset.type !== 'asset') return
      const source = typeof asset.source === 'string' ? asset.source : new TextDecoder().decode(asset.source)
      asset.source = postcss([scopeEditorCss()]).process(source, { from: fileName }).css
    },
  }
}
