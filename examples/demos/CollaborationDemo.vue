<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import * as Y from 'yjs'
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate } from 'y-protocols/awareness'
import { BaseKit, Bold, BulletList, EchoEditor, Heading, Italic, Link, TaskList, Underline } from 'vue-echo-editor'
import { CollaborationKit, CollaborationUsers, getUserColor } from 'vue-echo-editor/collaboration'

defineProps<{ dark: boolean }>()

/**
 * Two in-memory "clients" connected to each other. In a real app each client would use a network
 * provider instead (y-websocket, Hocuspocus, y-webrtc, Tiptap Cloud, ...), e.g.
 *
 *   const provider = new WebsocketProvider('wss://your-server', 'room-id', doc)
 */
function createPeer(name: string) {
  const doc = new Y.Doc()
  const awareness = new Awareness(doc)
  return { name, doc, provider: { awareness }, user: { name, color: getUserColor(name) } }
}

const alice = createPeer('Alice')
const bob = createPeer('Bob')

function link(a: ReturnType<typeof createPeer>, b: ReturnType<typeof createPeer>) {
  const onDocUpdate = (update: Uint8Array, origin: unknown) => {
    if (origin !== b) Y.applyUpdate(b.doc, update, a)
  }
  const onAwareness = ({ added, updated, removed }: { added: number[]; updated: number[]; removed: number[] }, origin: unknown) => {
    if (origin === b) return
    const changed = [...added, ...updated, ...removed]
    applyAwarenessUpdate(b.provider.awareness, encodeAwarenessUpdate(a.provider.awareness, changed), a)
  }
  a.doc.on('update', onDocUpdate)
  a.provider.awareness.on('update', onAwareness)
  return () => {
    a.doc.off('update', onDocUpdate)
    a.provider.awareness.off('update', onAwareness)
  }
}

const unlinks = [link(alice, bob), link(bob, alice)]

// Seed the shared document once
Y.applyUpdate(bob.doc, Y.encodeStateAsUpdate(alice.doc))

function extensionsFor(peer: ReturnType<typeof createPeer>) {
  return [
    // No `History` here — Y.js provides collaborative undo/redo through CollaborationKit
    BaseKit.configure({ placeholder: { placeholder: `${peer.name} is typing…` } }),
    CollaborationKit.configure({ document: peer.doc, provider: peer.provider, user: peer.user }),
    Heading.configure({ spacer: true }),
    Bold,
    Italic,
    Underline,
    Link,
    BulletList,
    TaskList,
  ]
}

const aliceExtensions = extensionsFor(alice)
const bobExtensions = extensionsFor(bob)

onBeforeUnmount(() => {
  unlinks.forEach(unlink => unlink())
  alice.provider.awareness.destroy()
  bob.provider.awareness.destroy()
  alice.doc.destroy()
  bob.doc.destroy()
})
</script>

<template>
  <section class="space-y-4">
    <p class="text-sm text-muted-foreground">
      Two editors sharing one Y.js document. Type in either one and watch the other update with a live caret.
    </p>
    <div class="grid gap-4 lg:grid-cols-2">
      <div v-for="peer in [
        { ...alice, extensions: aliceExtensions },
        { ...bob, extensions: bobExtensions },
      ]" :key="peer.name" class="rounded-xl border bg-card shadow-sm">
        <div class="flex items-center justify-between border-b px-3 py-2">
          <span class="flex items-center gap-2 text-sm font-medium">
            <span class="size-2.5 rounded-full" :style="{ backgroundColor: peer.user.color }" aria-hidden="true" />
            {{ peer.name }}
          </span>
          <CollaborationUsers :provider="peer.provider" />
        </div>
        <EchoEditor :extensions="peer.extensions" :dark="dark" :min-height="260" :label="`${peer.name}'s editor`" />
      </div>
    </div>
  </section>
</template>
