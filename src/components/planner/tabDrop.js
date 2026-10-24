import { useSyncExternalStore } from 'react'

// Dragging a row onto a tab at the top: another list (Daily / Mid-term /
// Long-term) moves it there; the Recycle Bin deletes it (moves it to the
// bin — rows have no delete button). The tabs are outside each list's drag
// context, so they are not dnd droppables: while a row is held, the list
// checks the pointer against the tabs' own on-screen boxes (the same boxes
// that are highlighted), and the tabs read the result from this small
// store. The list being dragged from is never a target.
// Browser-only state; nothing here is saved.

export const DROP_TABS = ['daily', 'midTerm', 'longTerm', 'bin']

// targets: the tabs that accept the held row; target: the one it would land on
let state = { dragging: false, targets: [], target: null }
const listeners = new Set()

function set(next) {
  if (
    next.dragging === state.dragging &&
    next.target === state.target &&
    next.targets === state.targets
  ) {
    return
  }
  state = next
  listeners.forEach((listener) => listener())
}

export const targetsFor = (listId) => DROP_TABS.filter((id) => id !== listId)

export const startTabDrag = (targets) => set({ dragging: true, targets, target: null })
export const endTabDrag = () => set({ dragging: false, targets: [], target: null })
export const tabDropTarget = () => state.target

// The target tab under the pointer (client coordinates), or null. Pure
// (safe during render, e.g. in collision detection).
export function tabAt(point) {
  if (!point) return null
  for (const id of state.targets) {
    const box = document.getElementById(`pl-tab-${id}`)?.getBoundingClientRect()
    if (box && point.x >= box.left && point.x <= box.right && point.y >= box.top && point.y <= box.bottom) {
      return id
    }
  }
  return null
}

// Pointer moved while a row is held: update the highlight (an event
// handler, never during render).
export function trackTab(point) {
  if (state.dragging) set({ ...state, target: tabAt(point) })
}

// Keyboard drag: ← / → step through the target tabs (in tab order) and
// back to "no tab" (the list itself); ↑ / ↓ return to the list.
export function stepTab(step) {
  if (!state.dragging) return
  const options = [null, ...state.targets]
  const i = options.indexOf(state.target)
  set({ ...state, target: options[(i + step + options.length) % options.length] })
}
export function clearTab() {
  if (state.dragging && state.target) set({ ...state, target: null })
}

const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTabDrop() {
  return useSyncExternalStore(subscribe, () => state)
}
