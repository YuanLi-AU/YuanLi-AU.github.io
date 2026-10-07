import {
  closestCenter,
  DndContext,
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
import { useEffect } from 'react'

// Rows only move up and down.
const verticalOnly = ({ transform }) => ({ ...transform, x: 0 })

// Scroll the page while a row is held within 15% of the top / bottom edge.
const AUTO_SCROLL = { threshold: { x: 0, y: 0.15 } }

const DRAGGING = 'pl-dragging' // on <body> while a row is held

// Drag & drop reordering for an active list (Daily / Mid-term / Long-term).
// Each TaskRow registers itself (useSortable); only its ⠿ handle starts a
// drag: with the mouse or a finger after moving 4px, or from the keyboard
// (Space / Enter to pick up, ↑ ↓ to move, Space / Enter to drop, Esc to
// cancel). Nothing changes until the drop; then `onReorder(activeId,
// overId)` updates the list, which the list's auto-save writes. A cancelled
// drag changes nothing.
//
// `label(index)` is the row label (A/B/C or 1/2/3), used in screen reader
// announcements.
export default function SortableTasks({ items, label, onReorder, className, children }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const ids = items.map((item) => item.id)

  // Never leave the body class behind (e.g. Lock during a drag).
  useEffect(() => () => document.body.classList.remove(DRAGGING), [])

  const taskOf = (id) => items.find((item) => item.id === id)?.task.trim() || 'Untitled task'
  const at = (over) => label(ids.indexOf(over.id))
  const announcements = {
    onDragStart: ({ active }) => `Picked up “${taskOf(active.id)}”.`,
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
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[verticalOnly]}
      autoScroll={AUTO_SCROLL}
      accessibility={{ announcements }}
      onDragStart={() => document.body.classList.add(DRAGGING)}
      onDragEnd={({ active, over }) => {
        end()
        if (over && active.id !== over.id) onReorder(active.id, over.id)
      }}
      onDragCancel={end}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ol className={className}>{children}</ol>
      </SortableContext>
    </DndContext>
  )
}
