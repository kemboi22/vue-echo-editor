import { Extension } from '@tiptap/core'
import type { Editor, Range } from '@tiptap/core'
import { VueRenderer } from '@tiptap/vue-3'
import Suggestion from '@tiptap/suggestion'
import type { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion'
import { PluginKey } from '@tiptap/pm/state'
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'
import type { VirtualElement } from '@floating-ui/dom'
import { renderGroups } from './groups'
import MenuList from './CommandsList.vue'
import type { Group, Command } from './types'
import { useLocale } from '@/locales'
import { mergePluginSlashGroups } from '@/core/plugin'

export interface SlashCommandOptions {
  getCommandGroups?: (options: { editor: Editor; presetGroups: Group[]; lang: string }) => Group[]
}

const extensionName = 'slashCommand'

function matchesQuery(command: Command, query: string) {
  if (!query) return true
  const label = command.label.toLowerCase().trim()
  if (label.includes(query)) return true
  return command.aliases?.some(alias => alias.toLowerCase().trim().includes(query)) ?? false
}

/**
 * Floating popup for the suggestion list. One instance is created per suggestion session,
 * so multiple editors on a page never share (or leak) a popup.
 */
function createPopup(content: HTMLElement) {
  const popup = document.createElement('div')
  popup.className = 'echo-slash-command echo-editor-ui'
  popup.setAttribute('role', 'presentation')
  Object.assign(popup.style, { position: 'fixed', top: '0', left: '0', zIndex: '50', maxWidth: '16rem' })
  popup.appendChild(content)
  document.body.appendChild(popup)

  let reference: VirtualElement | null = null
  let cleanup: (() => void) | null = null

  const update = () => {
    if (!reference) return
    computePosition(reference, popup, {
      strategy: 'fixed',
      placement: 'bottom-start',
      middleware: [
        offset(8),
        flip({ fallbackPlacements: ['top-start'] }),
        shift({ padding: 8 }),
      ],
    }).then(({ x, y }) => {
      Object.assign(popup.style, { left: `${x}px`, top: `${y}px` })
    })
  }

  return {
    element: popup,
    setReference(getRect: () => DOMRect | null) {
      reference = {
        getBoundingClientRect: () => getRect() ?? new DOMRect(-1000, -1000, 0, 0),
      }
      cleanup?.()
      // autoUpdate handles scrolling containers, resizes and layout shifts
      cleanup = autoUpdate(reference, popup, update, { animationFrame: false })
    },
    show() {
      popup.style.display = ''
      update()
    },
    hide() {
      popup.style.display = 'none'
    },
    get isShown() {
      return popup.style.display !== 'none'
    },
    destroy() {
      cleanup?.()
      cleanup = null
      popup.remove()
    },
  }
}

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: extensionName,
  priority: 200,

  addOptions() {
    return {
      getCommandGroups: undefined,
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        allowSpaces: true,
        startOfLine: true,
        pluginKey: new PluginKey(extensionName),
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from)
          const isRootDepth = $from.depth === 1
          const isParagraph = $from.parent.type.name === 'paragraph'
          const isStartOfNode = $from.parent.textContent?.charAt(0) === '/'
          const isInColumn = this.editor.isActive('column')
          const afterContent = $from.parent.textContent?.substring($from.parent.textContent?.indexOf('/'))
          const isValidAfterContent = !afterContent?.endsWith('  ')

          return (
            ((isRootDepth && isParagraph && isStartOfNode) || (isInColumn && isParagraph && isStartOfNode)) &&
            isValidAfterContent
          )
        },
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: any }) => {
          props.action({ editor, range })
          editor.view.focus()
        },
        items: ({ query, editor }: { query: string; editor: Editor }) => {
          const { lang, t } = useLocale()
          const presetGroups = mergePluginSlashGroups(editor, renderGroups(editor), t.value)
          const groups = this.options.getCommandGroups?.({ editor, presetGroups, lang: lang.value }) || presetGroups
          const normalizedQuery = query.toLowerCase().trim()

          return groups
            .map(group => ({
              ...group,
              commands: group.commands
                .filter(command => matchesQuery(command, normalizedQuery))
                .filter(command => !command.shouldBeHidden?.(editor))
                .map(command => ({ ...command, isEnabled: true })),
            }))
            .filter(group => group.commands.length > 0)
        },
        render: () => {
          let component: VueRenderer | null = null
          let popup: ReturnType<typeof createPopup> | null = null

          return {
            onStart: (props: SuggestionProps) => {
              component = new VueRenderer(MenuList, {
                props,
                editor: props.editor,
              })
              popup = createPopup(component.element as HTMLElement)
              popup.setReference(() => props.clientRect?.() ?? null)
              popup.show()
            },

            onUpdate(props: SuggestionProps) {
              component?.updateProps(props)
              popup?.setReference(() => props.clientRect?.() ?? null)
            },

            onKeyDown(props: SuggestionKeyDownProps) {
              if (props.event.key === 'Escape') {
                popup?.hide()
                return true
              }

              if (popup && !popup.isShown) popup.show()

              return component?.ref?.onKeyDown(props) ?? false
            },

            onExit() {
              popup?.destroy()
              popup = null
              component?.destroy()
              component = null
            },
          }
        },
      }),
    ]
  },
})

export default SlashCommand
