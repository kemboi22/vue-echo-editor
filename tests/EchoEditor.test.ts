import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import EchoEditor from '@/components/EchoEditor.vue'
import * as ext from '@/extensions'
import type { Editor } from '@tiptap/core'

const frame = () => new Promise(resolve => requestAnimationFrame(() => resolve(null)))
const tick = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms))

const allExtensions = () => [
  ext.BaseKit.configure({ characterCount: { limit: 100 } }),
  ext.History,
  ext.Columns,
  ext.FormatPainter,
  ext.Clear,
  ext.Heading,
  ext.FontSize,
  ext.FontFamily,
  ext.Bold,
  ext.Italic,
  ext.Underline,
  ext.Strike,
  ext.MoreMark,
  ext.Color,
  ext.Highlight,
  ext.BulletList,
  ext.OrderedList,
  ext.TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
  ext.Indent,
  ext.LineHeight,
  ext.TaskList,
  ext.Link,
  ext.Image,
  ext.Video,
  ext.Blockquote,
  ext.SlashCommand,
  ext.HorizontalRule,
  ext.CodeBlock,
  ext.Table,
  ext.Code,
  ext.Markdown,
  ext.Export,
  ext.SpecialCharacter,
  ext.Fullscreen,
  ext.SourceCode,
  ext.Preview,
  ext.FindAndReplace,
  ext.Printer,
  ext.Iframe,
]

function mount(props: Record<string, unknown>, listeners: Record<string, (...args: any[]) => void> = {}) {
  const el = document.createElement('div')
  document.body.appendChild(el)
  const model = ref(props.modelValue ?? '')
  let editor!: Editor
  const app = createApp(
    defineComponent({
      setup() {
        return () =>
          h(EchoEditor as any, {
            ...props,
            modelValue: model.value,
            'onUpdate:modelValue': (v: any) => (model.value = v),
            onCreate: ({ editor: e }: { editor: Editor }) => (editor = e),
            ...listeners,
          })
      },
    })
  )
  app.config.warnHandler = msg => {
    throw new Error(`Vue warning: ${msg}`)
  }
  app.mount(el)
  return {
    el,
    model,
    get editor() {
      return editor
    },
    unmount: () => {
      app.unmount()
      el.remove()
    },
  }
}

describe('<EchoEditor>', () => {
  afterEach(() => vi.restoreAllMocks())

  it('mounts with every extension, renders the toolbar and syncs v-model', async () => {
    const errors = vi.spyOn(console, 'error')
    const wrapper = mount({ modelValue: '<p>Hello</p>', extensions: allExtensions() })
    await tick()
    await frame()
    await nextTick()

    expect(wrapper.editor).toBeDefined()
    const toolbar = wrapper.el.querySelector('[role="toolbar"]')
    expect(toolbar).not.toBeNull()
    expect(toolbar!.querySelectorAll('button').length).toBeGreaterThan(20)

    // Every toolbar button has an accessible name
    const unnamed = [...toolbar!.querySelectorAll('button')].filter(
      b => !b.getAttribute('aria-label') && !b.textContent?.trim()
    )
    expect(unnamed.map(b => b.outerHTML.slice(0, 160))).toEqual([])

    // Editable area is labelled
    const content = wrapper.el.querySelector('.ProseMirror')!
    expect(content.getAttribute('role')).toBe('textbox')
    expect(content.getAttribute('aria-label')).toBeTruthy()

    // Editor -> v-model (throttled, flushed on blur)
    wrapper.editor.commands.insertContentAt(wrapper.editor.state.doc.content.size - 1, ' world')
    wrapper.editor.commands.blur()
    await tick(400)
    expect(wrapper.model.value).toContain('Hello world')

    // v-model -> editor
    wrapper.model.value = '<h2>Replaced</h2>'
    await nextTick()
    expect(wrapper.editor.getHTML()).toContain('Replaced')

    expect(errors).not.toHaveBeenCalled()
    wrapper.unmount()
    expect(wrapper.editor.isDestroyed).toBe(true)
  })

  it.each([
    ['editor.table.tooltip', 'Table'],
    ['editor.link.tooltip', 'Link'],
    ['editor.export.tooltip', 'Export'],
  ])('opens the %s popover from the toolbar', async (_key, label) => {
    const wrapper = mount({ modelValue: '<p>Hello</p>', extensions: [ext.BaseKit, ext.Table, ext.Link, ext.Export] })
    await tick()
    await frame()
    await nextTick()
    const trigger = wrapper.el.querySelector<HTMLButtonElement>(`[role="toolbar"] button[aria-label="${label}"]`)
    expect(trigger, `toolbar button "${label}"`).not.toBeNull()
    // No nested interactive elements
    expect(trigger!.querySelector('button')).toBeNull()
    trigger!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse' }))
    trigger!.click()
    await tick(50)
    await nextTick()
    expect(trigger!.getAttribute('aria-expanded') ?? trigger!.getAttribute('data-state')).toMatch(/true|open/)
    wrapper.unmount()
  })

  it('keeps UI state isolated between multiple editors', async () => {
    const a = mount({ extensions: [ext.BaseKit, ext.Fullscreen] })
    const b = mount({ extensions: [ext.BaseKit, ext.Fullscreen] })
    await tick()

    a.editor.commands.setFullscreen()
    await nextTick()

    expect(a.el.querySelector('.fixed\\!')).not.toBeNull()
    expect(b.el.querySelector('.fixed\\!')).toBeNull()
    a.unmount()
    b.unmount()
  })

  it('reads and writes markdown through v-model', async () => {
    const wrapper = mount({ modelValue: '# Title\n\nSome **bold** text', output: 'markdown', extensions: [ext.BaseKit, ext.Heading, ext.Bold, ext.Markdown] })
    await tick()
    expect(wrapper.editor.getHTML()).toContain('<h1>Title</h1>')
    expect(wrapper.editor.getHTML()).toContain('<strong>bold</strong>')
    wrapper.editor.commands.blur()
    wrapper.editor.chain().setTextSelection(1).insertContent('My ').run()
    wrapper.editor.commands.blur()
    await tick(400)
    expect(wrapper.model.value).toMatch(/^# My Title/)
    wrapper.unmount()
  })

  it('emits enter when an @enter listener is attached', async () => {
    const onEnter = vi.fn()
    const wrapper = mount({ extensions: [ext.BaseKit] }, { onEnter })
    await tick()
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    wrapper.editor.view.someProp('handleKeyDown', f => f(wrapper.editor.view, event))
    expect(onEnter).toHaveBeenCalledOnce()
    wrapper.unmount()
  })
})
