// Loaded on demand through `loadPrism()` — keep all prism-code-editor imports in this module.
import 'prism-code-editor/prism/languages/bash'
import 'prism-code-editor/prism/languages/css'
import 'prism-code-editor/prism/languages/css-extras'
import 'prism-code-editor/prism/languages/markup'
import 'prism-code-editor/prism/languages/java'
import 'prism-code-editor/prism/languages/sql'
import 'prism-code-editor/prism/languages/cpp'
import 'prism-code-editor/prism/languages/go'
import 'prism-code-editor/prism/languages/javascript'
import 'prism-code-editor/prism/languages/js-templates'
import 'prism-code-editor/prism/languages/jsx'
import 'prism-code-editor/prism/languages/python'
import 'prism-code-editor/prism/languages/rust'
import 'prism-code-editor/prism/languages/clike'
import 'prism-code-editor/prism/languages/json'
import 'prism-code-editor/prism/languages/typescript'
import 'prism-code-editor/prism/languages/tsx'
import 'prism-code-editor/prism/languages/yaml'
import 'prism-code-editor/prism/languages/markdown'
import 'prism-code-editor/prism/languages/php'
import 'prism-code-editor/languages/html'

import { createEditor } from 'prism-code-editor'
import type { PrismEditor } from 'prism-code-editor'
import { defaultCommands, editHistory } from 'prism-code-editor/commands'
import { cursorPosition } from 'prism-code-editor/cursor'
import { indentGuides } from 'prism-code-editor/guides'
import { highlightBracketPairs } from 'prism-code-editor/highlight-brackets'
import { matchBrackets } from 'prism-code-editor/match-brackets'
import { matchTags } from 'prism-code-editor/match-tags'
import { searchWidget } from 'prism-code-editor/search'

import type { CodeEditorOptions } from './prism'

export function createCodeEditor(container: HTMLElement, { search = false, ...options }: CodeEditorOptions): PrismEditor {
  const editor = createEditor(container, options)
  editor.addExtensions(
    matchBrackets(),
    matchTags(),
    indentGuides(),
    highlightBracketPairs(),
    cursorPosition(),
    defaultCommands(),
    editHistory(),
    ...(search ? [searchWidget()] : [])
  )
  return editor
}
