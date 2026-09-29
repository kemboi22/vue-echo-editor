/**
 * Real-time collaboration entry point: `import { CollaborationKit } from 'vue-echo-editor/collaboration'`.
 *
 * Kept separate from the main entry so apps that don't collaborate never need `yjs` installed.
 * Requires the optional peer dependencies `yjs`, `@tiptap/y-tiptap`,
 * `@tiptap/extension-collaboration` and `@tiptap/extension-collaboration-caret`.
 */
export { CollaborationKit, getUserColor } from './extensions/Collaboration/Collaboration'
export type {
  CollaborationKitOptions,
  CollaborationProvider,
  CollaborationUser,
} from './extensions/Collaboration/Collaboration'
export { useCollaborationUsers } from './extensions/Collaboration/useCollaborationUsers'
export type { ConnectedUser } from './extensions/Collaboration/useCollaborationUsers'
export { default as CollaborationUsers } from './extensions/Collaboration/components/CollaborationUsers.vue'
