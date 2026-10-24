import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { getEventCoordinates } from '@dnd-kit/utilities'
import { useEffect, useRef, useState } from 'react'
import {
  clearTab,
  endTabDrag,
  startTabDrag,
  stepTab,
  tabAt,
  tabDropTarget,
  targetsFor,
  trackTab,
} from './tabDrop.js'

// Scroll the page while a row is held within 15% of the top / bottom edge.
const AUTO_SCROLL = { threshold: { x: 0, y: 0.15 } }

const DRAGGING = 'pl-dragging' // on <body> while a row is held

const TAB_LABELS = { daily: 'Daily', midTerm: 'Mid-term', longTerm: 'Long-term' }

// The drag preview sits just below and right of the finger / pointer
// (inside the screen), so the tab being aimed at stays visible.
function besidePointer({ activatorEvent, activeNodeRect, overlayNodeRect, transform }) {
  const start = activatorEvent && getEventCoordinates(activatorEvent)
  if (!start || !activeNodeRect) return transform
  const width = overlayNodeRect?.width ?? 0
  const x = Math.min(start.x + transform.x - 20, window.innerWidth - width - 8)
  return {
    ...transform,
    x: Math.max(8, x) - activeNodeRect.left,
    y: start.y + transform.y + 22 - activeNodeRect.top,
  }
}
const OVERLAY_MODIFIERS = [besidePointer]
const CHIP_SIZE = { width: 'auto', height: 'auto' }

// Keyboard drag: ↑ ↓ move the row in its list; ← → pick another list's tab
// (and back to the list) — see tabDrop.js stepTab.
function keyboardCoordinates(event, args) {
  if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
    event.preventDefault()
    stepTab(event.code === 'ArrowRight' ? 1 : -1)
    return args.currentCoordinates
  }
  if (event.code === 'ArrowUp' || event.code === 'ArrowDown') clearTab()
  return sortableKeyboardCoordinates(event, args)
}

// Pointer position during a mouse / touch drag (keyboard drags have none).
function pointerOf({ activatorEvent, delta }) {
  const start = activatorEvent && getEventCoordinates(activatorEvent)
  return start ? { x: start.x + delta.x, y: start.y + delta.y } : null
}

// Drag & drop for an active list (`listId`: daily / midTerm / longTerm).
// Each TaskRow registers itself (useSortable); only its letter / number
// starts a drag: with the mouse or a finger after moving 4px, or from the
// keyboard (Space / Enter to pick up, ↑ ↓ to move in the list, ← → to pick
// another list's tab, Space / Enter to drop, Esc to cancel). A click
// without moving is not a drag.
//
// Dropped on a row: `onReorder(activeId, overId)` — an edit, saved by the
// list's auto-save. Dropped on another list's tab at the top (Daily /
// Mid-term / Long-term, never this list's own or the Recycle Bin; tabDrop.js
// checks the pointer against the tabs' boxes): `onDropTab(activeId,
// listId)` moves the row there, and nothing is reordered. Cancelled, or
// released anywhere that is neither: nothing changes.
//
// While a row is held, the tab bar stays on screen (CSS: body.pl-dragging),
// the row shows as a small preview (`preview(id)`) beside the pointer, and
// the page doesn't auto-scroll while the pointer is on a tab. All of this
// is local; nothing is read or written while dragging.
//
// `label(index)` is the row label (A/B/C or 1/2/3), used in screen reader
// announcements.
export default function SortableTasks({
  listId,
  items,
  label,
  onReorder,
  onDropTab,
  preview,
  className,
  children,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: keyboardCoordinates }),
  )
  const ids = items.map((item) => item.id)
  const [activeId, setActiveId] = useState(null)
  const onTab = useRef(false) // pointer is on a target tab (no auto-scroll then)

  // Never leave the body class / tab highlight behind (e.g. Lock during a drag).
  useEffect(
    () => () => {
      document.body.classList.remove(DRAGGING)
      endTabDrag()
    },
    [],
  )

  // On a target tab (pointer, or picked with ← →), no row is "over": the
  // list stays as it was. Otherwise the row nearest to the pointer itself
  // (the preview sits beside the pointer, so its box would point at the
  // wrong row); the keyboard uses the row's own box.
  function collisionDetection(args) {
    const p = args.pointerCoordinates
    if (p ? tabAt(p) : tabDropTarget()) return []
    if (!p) return closestCenter(args)
    return closestCenter({
      ...args,
      collisionRect: { left: p.x, right: p.x, top: p.y, bottom: p.y, width: 0, height: 0 },
    })
  }

  const taskOf = (id) => items.find((item) => item.id === id)?.task.trim() || 'Untitled task'
  const at = (over) => label(ids.indexOf(over.id))
  const announcements = {
    onDragStart: ({ active }) =>
      `Picked up “${taskOf(active.id)}”. Up and down to move it in the list, left and right to choose another list.`,
    onDragMove: ({ active }) => {
      const tab = tabDropTarget()
      return tab ? `“${taskOf(active.id)}” over ${TAB_LABELS[tab]}. Drop to move it there.` : undefined
    },
    onDragOver: ({ active, over }) =>
      over ? `“${taskOf(active.id)}” moved to position ${at(over)}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `“${taskOf(active.id)}” dropped at position ${at(over)}.`
        : `“${taskOf(active.id)}” dropped.`,
    onDragCancel: ({ active }) => `Moving “${taskOf(active.id)}” cancelled.`,
  }

  function end() {
    document.body.classList.remove(DRAGGING)
    setActiveId(null)
    onTab.current = false
    endTabDrag()
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      autoScroll={{ ...AUTO_SCROLL, canScroll: () => !onTab.current }}
      accessibility={{ announcements }}
      onDragStart={({ active }) => {
        document.body.classList.add(DRAGGING)
        setActiveId(active.id)
        startTabDrag(targetsFor(listId))
      }}
      onDragMove={(event) => {
        const p = pointerOf(event)
        if (!p) return // keyboard: ← → choose the tab
        onTab.current = tabAt(p) !== null
        trackTab(p)
      }}
      onDragEnd={({ active, over }) => {
        const tab = tabDropTarget()
        end()
        if (tab) onDropTab(active.id, tab)
        else if (over && active.id !== over.id) onReorder(active.id, over.id)
      }}
      onDragCancel={end}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ol className={className}>{children}</ol>
      </SortableContext>
      <DragOverlay
        dropAnimation={null}
        modifiers={OVERLAY_MODIFIERS}
        zIndex={30}
        style={CHIP_SIZE} // the chip's own size, not the row's
      >
        {activeId && ids.includes(activeId) ? preview(activeId) : null}
      </DragOverlay>
    </DndContext>
  )
}
