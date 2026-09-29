import { PluginKey, Plugin } from '@tiptap/pm/state'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import type { Node } from '@tiptap/pm/model'
import type { Editor } from '@tiptap/core'
import { computePosition, flip, offset, shift } from '@floating-ui/dom'
import type { ComputePositionConfig, VirtualElement } from '@floating-ui/dom'
import { getSelectionRanges, NodeRangeSelection } from './range'
import { cloneElement, getComputedStyles, minMax, removeNode, findElementNextToCoords } from './utils'
import { throttle } from '@/utils/utils'

function getSelectionRangesNearCursor(event: DragEvent, editor: Editor) {
  const { doc } = editor.view.state
  const nearest = findElementNextToCoords({ editor, x: event.clientX, y: event.clientY, direction: 'right' })
  if (!nearest.resultNode || nearest.pos === null) return []

  const dom = editor.view.dom
  const paddingLeft = parseInt(getComputedStyles(dom, 'paddingLeft'), 10)
  const paddingRight = parseInt(getComputedStyles(dom, 'paddingRight'), 10)
  const borderLeft = parseInt(getComputedStyles(dom, 'borderLeftWidth'), 10)
  const borderRight = parseInt(getComputedStyles(dom, 'borderRightWidth'), 10)
  const rect = dom.getBoundingClientRect()

  const coords = {
    left: minMax(event.clientX, rect.left + paddingLeft + borderLeft, rect.right - paddingRight - borderRight),
    top: event.clientY,
  }
  const posAtCoords = editor.view.posAtCoords(coords)
  if (!posAtCoords) return []
  if (!doc.resolve(posAtCoords.pos).parent) return []

  const $from = doc.resolve(nearest.pos)
  const $to = doc.resolve(nearest.pos + 1)
  return getSelectionRanges($from, $to, 0)
}

const getPreviousNodeStartPosition = (doc: Node, position: number) => {
  const $pos = doc.resolve(position)
  if ($pos.depth === 0) return position
  return $pos.pos - $pos.parentOffset - 1
}

const getTopLevelNode = (doc: Node, position: number) => {
  const $pos = doc.resolve(position)
  return $pos.depth > 0 ? $pos.node(1) : doc.nodeAt(position)
}

/** Walks up from `element` to the direct child of the editor root. */
const getTopLevelElement = (view: EditorView, element: globalThis.Node | null) => {
  let current = element
  while (current && current.parentNode && current.parentNode !== view.dom) current = current.parentNode
  return current
}

export const dragHandlePluginDefaultKey = new PluginKey('dragHandle')

export interface DragHandlePluginOptions {
  pluginKey?: PluginKey | string
  element: HTMLElement
  editor: Editor
  /** Floating UI configuration used to position the handle next to the hovered block */
  computePositionConfig?: Partial<ComputePositionConfig>
  onNodeChange?: (data: { editor: Editor; node: Node | null; pos: number }) => void
}

export const DragHandlePlugin = ({
  pluginKey = dragHandlePluginDefaultKey,
  element: dragHandleElement,
  editor,
  computePositionConfig,
  onNodeChange,
}: DragHandlePluginOptions) => {
  const container = document.createElement('div')
  let locked = false
  let selectedNode: Node | null = null
  let selectedPos = -1
  let referenceElement: HTMLElement | null = null

  const positionConfig: Partial<ComputePositionConfig> = {
    placement: 'left-start',
    strategy: 'absolute',
    middleware: [offset({ mainAxis: 8 }), flip({ fallbackPlacements: ['left'] }), shift({ padding: 4 })],
    ...computePositionConfig,
  }

  const show = () => {
    dragHandleElement.style.visibility = 'visible'
    dragHandleElement.style.pointerEvents = 'auto'
  }

  const hide = () => {
    dragHandleElement.style.visibility = 'hidden'
    dragHandleElement.style.pointerEvents = 'none'
  }

  const reposition = () => {
    if (!referenceElement || !referenceElement.isConnected) return
    const target = referenceElement
    const virtual: VirtualElement = {
      getBoundingClientRect: () => target.getBoundingClientRect(),
      contextElement: target,
    }
    computePosition(virtual, dragHandleElement, positionConfig).then(({ x, y, strategy }) => {
      Object.assign(dragHandleElement.style, {
        position: strategy,
        left: `${x}px`,
        top: `${y}px`,
      })
    })
  }

  let frame = 0
  const scheduleReposition = () => {
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      reposition()
    })
  }

  const setReference = (element: HTMLElement) => {
    referenceElement = element
    reposition()
    show()
  }

  const reset = () => {
    selectedNode = null
    selectedPos = -1
    referenceElement = null
    onNodeChange?.({ editor, node: null, pos: -1 })
  }

  const selectElement = (view: EditorView, target: HTMLElement) => {
    const domPos = view.posAtDOM(target, 0)
    const node = getTopLevelNode(editor.state.doc, domPos)
    if (node === selectedNode) return

    selectedNode = node
    selectedPos = getPreviousNodeStartPosition(editor.state.doc, domPos)
    onNodeChange?.({ editor, node: selectedNode, pos: selectedPos })
    setReference(target)
  }

  const onDragStart = (event: DragEvent) => {
    const { view } = editor
    if (!event.dataTransfer) return

    const { empty, $from, $to } = view.state.selection
    const nearCursorRanges = getSelectionRangesNearCursor(event, editor)
    const currentRanges = getSelectionRanges($from, $to, 0)
    const overlaps = currentRanges.some(range =>
      nearCursorRanges.find(near => near.$from === range.$from && near.$to === range.$to)
    )
    const ranges = empty || !overlaps ? nearCursorRanges : currentRanges
    if (!ranges.length) return

    const { tr } = view.state
    const preview = document.createElement('div')
    const from = ranges[0].$from.pos
    const to = ranges[ranges.length - 1].$to.pos
    const selection = NodeRangeSelection.create(view.state.doc, from, to)
    const slice = selection.content()

    ranges.forEach(range => {
      const dom = view.nodeDOM(range.$from.pos) as HTMLElement | null
      if (dom) preview.append(cloneElement(dom))
    })
    preview.style.position = 'absolute'
    preview.style.top = '-10000px'
    document.body.append(preview)

    event.dataTransfer.clearData()
    event.dataTransfer.setDragImage(preview, 0, 0)
    view.dragging = { slice, move: true }
    tr.setSelection(selection)
    view.dispatch(tr)

    document.addEventListener('drop', () => removeNode(preview), { once: true })
    setTimeout(() => {
      dragHandleElement.style.pointerEvents = 'none'
    }, 0)
  }

  const onDragEnd = () => {
    dragHandleElement.style.pointerEvents = 'auto'
  }

  // Mouse moves fire very often; throttling keeps hover tracking cheap on large documents
  const onMouseMove = throttle((view: EditorView, event: MouseEvent) => {
    if (locked || editor.isDestroyed) return

    const nearest = findElementNextToCoords({ x: event.clientX, y: event.clientY, direction: 'right', editor })
    if (!nearest.resultElement || nearest.resultElement === view.dom) return

    const target = getTopLevelElement(view, nearest.resultElement)
    if (!target || target === view.dom || target.nodeType !== 1) return

    selectElement(view, target as HTMLElement)
  }, 50)

  return new Plugin({
    key: typeof pluginKey === 'string' ? new PluginKey(pluginKey) : pluginKey,
    state: {
      init: () => ({ locked: false }),
      apply(tr: Transaction, value: { locked: boolean }) {
        const lockMeta = tr.getMeta('lockDragHandle')
        const hideMeta = tr.getMeta('hideDragHandle')

        if (lockMeta !== undefined) locked = lockMeta

        if (hideMeta) {
          hide()
          locked = false
          reset()
          return value
        }

        if (tr.docChanged && selectedPos !== -1) {
          selectedPos = tr.mapping.map(selectedPos)
        }

        return value
      },
    },
    view: view => {
      dragHandleElement.draggable = true
      dragHandleElement.addEventListener('dragstart', onDragStart)
      dragHandleElement.addEventListener('dragend', onDragEnd)

      const scrollContainer = view.dom.parentElement
      scrollContainer?.addEventListener('scroll', scheduleReposition, { passive: true })
      window.addEventListener('resize', scheduleReposition, { passive: true })

      scrollContainer?.appendChild(container)
      container.appendChild(dragHandleElement)
      Object.assign(container.style, { position: 'absolute', top: '0', left: '0', pointerEvents: 'none' })
      Object.assign(dragHandleElement.style, { position: 'absolute', top: '0', left: '0', zIndex: '10' })
      hide()

      return {
        update(view: EditorView, oldState: EditorState) {
          dragHandleElement.draggable = !locked
          if (view.state.doc.eq(oldState.doc) || selectedPos === -1) return

          // Keep the handle attached to the same block after document changes
          const dom = getTopLevelElement(view, view.nodeDOM(selectedPos))
          if (!dom || dom === view.dom || dom.nodeType !== 1) return

          const domPos = view.posAtDOM(dom, 0)
          const node = getTopLevelNode(editor.state.doc, domPos)
          if (node !== selectedNode) {
            selectedNode = node
            selectedPos = getPreviousNodeStartPosition(editor.state.doc, domPos)
            onNodeChange?.({ editor, node: selectedNode, pos: selectedPos })
          }
          setReference(dom as HTMLElement)
        },
        destroy() {
          onMouseMove.cancel()
          if (frame) cancelAnimationFrame(frame)
          scrollContainer?.removeEventListener('scroll', scheduleReposition)
          window.removeEventListener('resize', scheduleReposition)
          dragHandleElement.removeEventListener('dragstart', onDragStart)
          dragHandleElement.removeEventListener('dragend', onDragEnd)
          removeNode(container)
        },
      }
    },
    props: {
      handleDOMEvents: {
        mouseleave: (_view, event: MouseEvent) => {
          if (locked) return false
          if (event.target && !container.contains(event.relatedTarget as globalThis.Node | null)) {
            onMouseMove.cancel()
            hide()
            reset()
          }
          return false
        },
        mousemove: (view, event: MouseEvent) => {
          onMouseMove(view, event)
          return false
        },
      },
    },
  })
}
