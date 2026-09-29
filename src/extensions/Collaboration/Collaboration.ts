import { Extension } from '@tiptap/core'
import type { AnyExtension } from '@tiptap/core'
import { Collaboration as TiptapCollaboration } from '@tiptap/extension-collaboration'
import type { CollaborationOptions } from '@tiptap/extension-collaboration'
import { CollaborationCaret } from '@tiptap/extension-collaboration-caret'
import type { CollaborationCaretOptions } from '@tiptap/extension-collaboration-caret'
import type { Doc } from 'yjs'
import ActionButton from '@/components/ActionButton.vue'
import type { GeneralOptions } from '@/type'

/**
 * A user shown next to their caret and in `<CollaborationUsers>`.
 */
export interface CollaborationUser {
  name: string
  color: string
  avatar?: string
  [key: string]: unknown
}

/**
 * Minimal provider contract. Works with `y-websocket`, `y-webrtc`, `@hocuspocus/provider`,
 * `@tiptap-pro/provider` or any provider exposing a Y.js `awareness` instance.
 */
export interface CollaborationProvider {
  awareness?: {
    clientID: number
    getStates: () => Map<number, Record<string, any>>
    setLocalStateField: (field: string, value: unknown) => void
    on: (event: 'change' | 'update', cb: (...args: any[]) => void) => void
    off: (event: 'change' | 'update', cb: (...args: any[]) => void) => void
  } | null
  [key: string]: any
}

export interface CollaborationKitOptions extends GeneralOptions<CollaborationKitOptions> {
  /** The shared Y.js document */
  document: Doc | null
  /** Name of the Y.XmlFragment inside the document @default 'default' */
  field: string
  /** Connection provider; enables remote carets when combined with `user` */
  provider: CollaborationProvider | null
  /** Local user; set to `false` to disable caret rendering */
  user: CollaborationUser | false
  /** Show undo / redo buttons (backed by the Y.js undo manager) in the toolbar @default true */
  undoRedo: boolean
  /** Extra options for the underlying `Collaboration` extension */
  collaboration: Partial<CollaborationOptions>
  /** Extra options for the underlying `CollaborationCaret` extension */
  caret: Partial<CollaborationCaretOptions>
}

/**
 * Real-time collaboration for Echo Editor (Tiptap `Collaboration` + `CollaborationCaret`).
 *
 * Remove the `History` extension when using it — Y.js ships its own undo manager.
 *
 * @example
 * const doc = new Y.Doc()
 * const provider = new WebsocketProvider('wss://example.com', 'room-1', doc)
 * CollaborationKit.configure({ document: doc, provider, user: { name: 'Ada', color: '#f97316' } })
 */
export const CollaborationKit = Extension.create<CollaborationKitOptions>({
  name: 'collaborationKit',

  addOptions() {
    return {
      ...(this.parent?.() as CollaborationKitOptions),
      document: null,
      field: 'default',
      provider: null,
      user: false,
      undoRedo: true,
      collaboration: {},
      caret: {},
      button: ({ editor, extension, t }) => {
        if (!extension.options.undoRedo) return []
        const actions = ['undo', 'redo'] as const
        return actions.map(item => ({
          component: ActionButton,
          componentProps: {
            action: () => (item === 'undo' ? editor.chain().undo().focus().run() : editor.chain().redo().focus().run()),
            shortcutKeys: item === 'undo' ? ['mod', 'Z'] : ['shift', 'mod', 'Z'],
            disabled: !editor.isEditable || !editor.can()[item](),
            icon: item === 'undo' ? 'Undo2' : 'Redo2',
            tooltip: t(`editor.${item}.tooltip`),
          },
        }))
      },
    }
  },

  addExtensions() {
    const { document, field, provider, user, collaboration, caret } = this.options
    if (!document) {
      console.warn('[echo-editor] CollaborationKit requires a Y.js `document`.')
      return []
    }

    const extensions: AnyExtension[] = [
      TiptapCollaboration.configure({ document, field, provider, ...collaboration }),
    ]

    if (provider?.awareness && user) {
      extensions.push(CollaborationCaret.configure({ provider, user, ...caret }))
    }

    return extensions
  },
})

/** Pick a stable, readable caret colour for a user name. */
export function getUserColor(name: string): string {
  const palette = ['#f97316', '#0ea5e9', '#a855f7', '#22c55e', '#ef4444', '#eab308', '#ec4899', '#14b8a6']
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return palette[Math.abs(hash) % palette.length]
}
