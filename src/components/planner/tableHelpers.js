import { useEffect, useState } from 'react'

// Status message under a table ({ text, undo? }); hides after 6 seconds.
export function useMessage() {
  const [message, setMessage] = useState(null)
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), 6000)
    return () => clearTimeout(t)
  }, [message])
  return [message, setMessage]
}

// Delete a row with a 6-second Undo (deleted rows never go to history).
// `list` is the object returned by useSyncedItems.
export function deleteWithUndo(list, id, setMessage) {
  const index = list.items.findIndex((item) => item.id === id)
  const removed = list.items[index]
  list.update(list.items.filter((item) => item.id !== id))
  setMessage({
    text: 'Row deleted.',
    undo: () => {
      const restored = [...list.latest.current.items]
      restored.splice(index, 0, removed)
      list.update(restored)
      setMessage(null)
    },
  })
}
