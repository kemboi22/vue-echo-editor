import type { EditorOptions, PrismEditor } from 'prism-code-editor'

export type { PrismEditor }

export interface CodeEditorOptions extends Partial<EditorOptions> {
  /** Enable the search / replace widget (used by the HTML source dialog). */
  search?: boolean
}

let prismModule: Promise<typeof import('./prism-editor')> | null = null

/**
 * Lazily loads prism-code-editor, its grammars and extensions.
 * The first code block (or the source dialog) pays the cost once; editors that never show code
 * never download it.
 */
export function loadPrism() {
  prismModule ??= import('./prism-editor')
  return prismModule
}

export async function createCodeEditor(container: HTMLElement, options: CodeEditorOptions): Promise<PrismEditor> {
  const { createCodeEditor: create } = await loadPrism()
  return create(container, options)
}
