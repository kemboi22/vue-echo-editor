import { Extension } from '@tiptap/core'
import type { AnyExtension, Editor } from '@tiptap/core'
import locale from '@/locales'
import type { LocaleMessages } from '@/locales'
import type { ButtonView } from '@/type'
import type { Command, Group } from '@/extensions/SlashCommand/types'

/**
 * Slash-menu contribution of a plugin: extra commands appended to an existing group
 * (`format`, `insert`, `embed`) or to a new group.
 */
export interface PluginSlashGroup {
  /** Group id; an existing preset group is extended, anything else creates a new group */
  name: string
  /** Title (or locale key) used when a new group is created */
  title?: string
  commands: Command[]
}

export interface EchoEditorPluginDefinition<Options = Record<string, unknown>> {
  /** Unique plugin name (also used as the Tiptap extension name) */
  name: string
  /** Default options, overridable through `plugin.configure({...})` */
  defaultOptions?: Options
  /** Tiptap extensions contributed by the plugin */
  extensions?: AnyExtension[] | ((options: Options) => AnyExtension[])
  /** Toolbar button(s), using the same `ButtonView` contract as built-in extensions */
  toolbar?: ButtonView
  /** Slash commands contributed by the plugin */
  slashCommands?: PluginSlashGroup[] | ((ctx: { editor: Editor; options: Options }) => PluginSlashGroup[])
  /** Translations keyed by language code; missing keys fall back to English */
  locales?: Record<string, LocaleMessages>
  /**
   * Runs once the editor is created. Return a function to clean up when the editor is destroyed.
   */
  setup?: (ctx: { editor: Editor; options: Options }) => void | (() => void)
}

interface PluginExtensionOptions<Options> {
  pluginOptions: Options
  button?: ButtonView
  slashCommands?: EchoEditorPluginDefinition<Options>['slashCommands']
  divider?: boolean
  spacer?: boolean
  toolbar?: boolean
}

interface PluginExtensionStorage {
  cleanup: (() => void) | null
}

/**
 * Defines a third-party Echo Editor plugin. The result is a regular Tiptap extension:
 * pass it (or `plugin.configure({ pluginOptions })`) to `<EchoEditor :extensions>`.
 *
 * @example
 * export const WordCount = definePlugin({
 *   name: 'wordCount',
 *   locales: { en: { 'wordCount.tooltip': 'Word count' } },
 *   toolbar: ({ editor, t }) => ({
 *     component: ActionButton,
 *     componentProps: { icon: 'Hash', tooltip: t('wordCount.tooltip'), action: () => alert(editor.getText().split(/\s+/).length) },
 *   }),
 * })
 */
export function definePlugin<Options extends Record<string, unknown> = Record<string, unknown>>(
  definition: EchoEditorPluginDefinition<Options>
) {
  // Register translations eagerly so labels resolve on the first render
  for (const [lang, messages] of Object.entries(definition.locales ?? {})) {
    locale.extendMessage(lang, messages)
  }

  return Extension.create<PluginExtensionOptions<Options>, PluginExtensionStorage>({
    name: definition.name,

    addOptions() {
      return {
        pluginOptions: (definition.defaultOptions ?? {}) as Options,
        button: definition.toolbar,
        slashCommands: definition.slashCommands,
        toolbar: !!definition.toolbar,
        divider: false,
        spacer: false,
      }
    },

    addStorage() {
      return { cleanup: null }
    },

    addExtensions() {
      const { extensions } = definition
      if (!extensions) return []
      return typeof extensions === 'function' ? extensions(this.options.pluginOptions) : extensions
    },

    onCreate() {
      const cleanup = definition.setup?.({ editor: this.editor, options: this.options.pluginOptions })
      this.storage.cleanup = typeof cleanup === 'function' ? cleanup : null
    },

    onDestroy() {
      this.storage.cleanup?.()
      this.storage.cleanup = null
    },
  })
}

/**
 * Merges slash-command contributions from every registered plugin into the preset groups.
 */
export function mergePluginSlashGroups(editor: Editor, groups: Group[], t: (key: string) => string): Group[] {
  const result = groups.map(group => ({ ...group, commands: [...group.commands] }))

  for (const extension of editor.extensionManager.extensions) {
    const contribution = extension.options?.slashCommands as EchoEditorPluginDefinition['slashCommands'] | undefined
    if (!contribution) continue

    const pluginGroups =
      typeof contribution === 'function'
        ? contribution({ editor, options: extension.options.pluginOptions ?? {} })
        : contribution

    for (const pluginGroup of pluginGroups) {
      const existing = result.find(group => group.name === pluginGroup.name)
      if (existing) {
        existing.commands.push(...pluginGroup.commands)
      } else {
        result.push({
          name: pluginGroup.name,
          title: t(pluginGroup.title ?? pluginGroup.name),
          commands: [...pluginGroup.commands],
        })
      }
    }
  }

  return result
}
