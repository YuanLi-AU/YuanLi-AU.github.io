// Shared wrapper: full-width band, centred container, heading with a short
// accent line, and an anchor id for the navigation.
export default function Section({ id, title, accent = 'teal', children }) {
  return (
    <section id={id} className="section" aria-labelledby={`${id}-title`}>
      <div className="container">
        <h2 id={`${id}-title`} className={`section-title accent-${accent}`}>
          {title}
        </h2>
        {children}
      </div>
    </section>
  )
}
