import MediaSlot from './MediaSlot.jsx'

// Optional work photos / certificates for a role (click to enlarge).
// Renders nothing until confirmed images are added to the role's `media`
// list in resume.js, so roles without images show no empty boxes.
export default function ExperienceMedia({ items, className = '' }) {
  if (!items?.length) return null

  return (
    <ul className={`exp-media ${className}`}>
      {items.map((item) => (
        <li key={item.alt}>
          <MediaSlot {...item} />
          {item.caption && (
            <span className="exp-media-caption">
              {item.shortCaption ? (
                // Short label on phones; the lightbox keeps the full caption
                <>
                  <span className="caption-full">{item.caption}</span>
                  <span className="caption-short">{item.shortCaption}</span>
                </>
              ) : (
                item.caption
              )}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
