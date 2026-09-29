import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { Editor } from '@tiptap/core'
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { Bold } from '@tiptap/extension-bold'
import { Markdown } from '@tiptap/markdown'
import { useEditorState } from '@/hooks/useEditorState'
import { definePlugin, mergePluginSlashGroups } from '@/core/plugin'
import { serialize, toPlainText } from '@/extensions/Export/exporters'
import { createApp } from 'vue'

function createEditor(extra: any[] = [], content = '<p>Hello <strong>world</strong></p>') {
  return new Editor({ extensions: [Document, Paragraph, Text, Bold, ...extra], content })
}

describe('exporters with a real editor', () => {
  it('serialises to text, json and markdown', () => {
    const editor = createEditor([Markdown])
    expect(toPlainText(editor)).toBe('Hello world\n')
    expect(JSON.parse(serialize(editor, 'json').content).type).toBe('doc')
    expect(serialize(editor, 'markdown').content.trim()).toBe('Hello **world**')
    editor.destroy()
  })

  it('throws a helpful error when markdown is not registered', () => {
    const editor = createEditor()
    expect(() => serialize(editor, 'markdown')).toThrow(/Markdown/)
    editor.destroy()
  })
})

describe('definePlugin', () => {
  it('registers extensions, runs setup/cleanup and contributes slash commands', async () => {
    const cleanup = vi.fn()
    const setup = vi.fn(() => cleanup)
    const plugin = definePlugin({
      name: 'testPlugin',
      locales: { en: { 'testPlugin.group': 'Test group' } },
      slashCommands: [{ name: 'test', title: 'testPlugin.group', commands: [{ name: 'x', label: 'X', action: () => {} }] }],
      setup,
    })

    const editor = createEditor([plugin])
    // Tiptap v3 emits `create` asynchronously
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(setup).toHaveBeenCalledOnce()

    const groups = mergePluginSlashGroups(editor, [{ name: 'format', title: 'Format', commands: [] }], key => key)
    expect(groups.map(g => g.name)).toEqual(['format', 'test'])
    expect(groups[1].commands[0].name).toBe('x')

    editor.destroy()
    expect(cleanup).toHaveBeenCalledOnce()
  })
})

describe('useEditorState', () => {
  it('re-evaluates at most once per frame for relevant transactions', async () => {
    const editor = createEditor()
    const selector = vi.fn((e: Editor) => e.isActive('bold'))
    let state!: ReturnType<typeof useEditorState<boolean>>

    const app = createApp(
      defineComponent({
        setup() {
          state = useEditorState(editor, selector)
          return () => h('div')
        },
      })
    )
    app.mount(document.createElement('div'))
    expect(selector).toHaveBeenCalledTimes(1)
    expect(state.value).toBe(false)

    // Several transactions in the same frame -> one evaluation
    editor.commands.setTextSelection({ from: 8, to: 12 })
    editor.commands.setTextSelection({ from: 9, to: 11 })
    editor.commands.setTextSelection({ from: 8, to: 13 })
    await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
    await nextTick()

    expect(selector).toHaveBeenCalledTimes(2)
    expect(state.value).toBe(true)

    app.unmount()
    editor.destroy()
  })
})
