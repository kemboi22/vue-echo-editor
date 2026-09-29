<script setup lang="ts">
import { computed } from 'vue'
import type { CollaborationProvider } from '../Collaboration'
import { useCollaborationUsers } from '../useCollaborationUsers'

interface Props {
  provider: CollaborationProvider | null | undefined
  /** Maximum number of avatars before collapsing into a "+N" badge */
  max?: number
}

const props = withDefaults(defineProps<Props>(), { max: 5 })

const { users } = useCollaborationUsers(() => props.provider)

const visible = computed(() => users.value.slice(0, props.max))
const overflow = computed(() => Math.max(0, users.value.length - props.max))

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
</script>

<template>
  <div class="flex items-center -space-x-2" role="list" :aria-label="`${users.length} connected users`">
    <div
      v-for="user in visible"
      :key="user.clientId"
      role="listitem"
      class="relative inline-flex size-7 items-center justify-center rounded-full border-2 border-background text-[11px] font-medium text-white shadow-xs"
      :style="{ backgroundColor: user.color }"
      :title="user.isSelf ? `${user.name} (you)` : user.name"
    >
      <img v-if="user.avatar" :src="user.avatar" :alt="user.name" class="size-full rounded-full object-cover" />
      <span v-else aria-hidden="true">{{ initials(user.name) }}</span>
      <span class="sr-only">{{ user.name }}</span>
    </div>
    <div
      v-if="overflow"
      role="listitem"
      class="relative inline-flex size-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[11px] font-medium text-muted-foreground"
    >
      +{{ overflow }}
    </div>
  </div>
</template>
