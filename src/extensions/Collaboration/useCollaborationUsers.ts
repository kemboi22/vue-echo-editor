import { onScopeDispose, getCurrentScope, shallowRef, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { CollaborationProvider, CollaborationUser } from './Collaboration'

export interface ConnectedUser extends CollaborationUser {
  clientId: number
  isSelf: boolean
}

/**
 * Reactive list of users connected to a Y.js awareness instance.
 */
export function useCollaborationUsers(provider: MaybeRefOrGetter<CollaborationProvider | null | undefined>) {
  const users = shallowRef<ConnectedUser[]>([])
  let stop: (() => void) | null = null

  const bind = (current: CollaborationProvider | null | undefined) => {
    stop?.()
    stop = null
    const awareness = current?.awareness
    if (!awareness) {
      users.value = []
      return
    }

    const update = () => {
      const list: ConnectedUser[] = []
      awareness.getStates().forEach((state, clientId) => {
        if (state?.user?.name) {
          list.push({ ...(state.user as CollaborationUser), clientId, isSelf: clientId === awareness.clientID })
        }
      })
      users.value = list
    }

    awareness.on('change', update)
    update()
    stop = () => awareness.off('change', update)
  }

  watch(() => toValue(provider), bind, { immediate: true })

  if (getCurrentScope()) onScopeDispose(() => stop?.())

  return { users }
}
