import MediaSlot from './MediaSlot.jsx'

// Larger presentation for roles with real work evidence: logo, publication
// gallery and/or numbered work highlights. Content comes from resume.js.
export default function FeaturedExperience({ job }) {
  return (
    <article className="featured">
      <header className="featured-head">
        <div>
          <div className="timeline-meta">
            <span className="timeline-area">{job.area}</span>
            {job.period && <span className="timeline-period">{job.period}</span>}
          </div>
          <h3>{job.role}</h3>
          <p className="timeline-org">
            {job.org} <span className="muted">· {job.location}</span>
          </p>
        </div>
        {job.logo && (
          <div className="logo-tile logo-tile-lg">
            <img src={job.logo} alt={job.logoAlt} />
          </div>
        )}
      </header>

      <div className={job.gallery ? 'featured-body has-gallery' : 'featured-body'}>
        <div>
          {job.summary && <p className="featured-summary">{job.summary}</p>}
          {job.points && (
            <ul className="points">
              {job.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          )}
        </div>

        {job.gallery && (
          <div>
            <h4 className="mini-heading">{job.gallery.title}</h4>
            <div className="pub-grid">
              {job.gallery.items.map((item) => (
                <figure key={item.alt} className="pub-item">
                  <MediaSlot {...item} />
                  {item.caption && <figcaption>{item.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        )}
      </div>

      {job.highlights && (
        <div className="highlights">
          <h4 className="mini-heading">Selected Work</h4>
          <ol className="highlight-grid">
            {job.highlights.map((item, i) => (
              <li key={item.title} className="highlight">
                <MediaSlot {...item} label={item.image ? undefined : 'Selected work'} />
                <span className="highlight-num">{String(i + 1).padStart(2, '0')}</span>
                <h5>{item.title}</h5>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </article>
  )
}
