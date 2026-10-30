import MediaSlot from './MediaSlot.jsx'

// Optional work photos / certificates for a role (click to enlarge).
// Renders nothing until confirmed images are added to the role's `media`
// list in resume.js, so roles without images show no empty boxes.
export default function ExperienceMedia({ items }) {
  if (!items?.length) return null

  return (
    <ul className="exp-media">
      {items.map((item) => (
        <li key={item.alt}>
          <MediaSlot {...item} />
          {item.caption && <span className="exp-media-caption">{item.caption}</span>}
        </li>
      ))}
    </ul>
  )
}
