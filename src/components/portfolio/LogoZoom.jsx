import { useState } from 'react'
import ImageLightbox from './ImageLightbox.jsx'

// A logo tile that opens the logo larger in the shared lightbox (on a white
// panel, so dark or transparent logos stay visible). className carries the
// tile's own look; full: a larger copy of the logo, when one exists.
export default function LogoZoom({ src, full, alt, className = '' }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className={`${className} logo-zoom`}
        onClick={() => setOpen(true)}
        aria-label={`View larger: ${alt}`}
      >
        <img src={src} alt={alt} />
      </button>
      <ImageLightbox
        open={open}
        src={full ?? src}
        alt={alt}
        caption={alt}
        logo
        onClose={() => setOpen(false)}
      />
    </>
  )
}
