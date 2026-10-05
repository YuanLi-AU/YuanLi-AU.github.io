import { useState } from 'react'
import Icon from './Icon.jsx'
import ImageLightbox from './ImageLightbox.jsx'

// One image area: a real image (click to enlarge) or a quiet placeholder
// reserved for a future, confirmed image.
export default function MediaSlot({ image, imageFull, alt, caption, label, icon = 'book', className = '' }) {
  const [open, setOpen] = useState(false)

  if (!image) {
    return (
      <div className={`media media-placeholder ${className}`}>
        <Icon name={icon} size={26} />
        {label && <span>{label}</span>}
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        className={`media media-thumb ${className}`}
        onClick={() => setOpen(true)}
        aria-label={`View larger: ${alt}`}
      >
        <img src={image} alt={alt} loading="lazy" />
        <span className="media-expand" aria-hidden="true">
          <Icon name="expand" size={16} />
        </span>
      </button>
      <ImageLightbox
        open={open}
        src={imageFull ?? image}
        alt={alt}
        caption={caption}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
