import { useEffect, useRef } from 'react'
import Icon from './Icon.jsx'

// Minimal lightbox built on the native <dialog> element: the browser handles
// Escape-to-close, focus and the backdrop. Clicking outside the image closes it.
export default function ImageLightbox({ open, src, alt, caption, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="lightbox"
      aria-label={alt}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close image">
        <Icon name="close" size={22} />
      </button>
      {/* Only load the large image once the lightbox is opened */}
      {open && (
        <figure className="lightbox-figure" onClick={(e) => e.target === e.currentTarget && onClose()}>
          <img src={src} alt={alt} />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      )}
    </dialog>
  )
}
