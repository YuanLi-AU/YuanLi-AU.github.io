import { useState } from 'react'
import { experience } from '../../data/resume.js'
import ExperienceMedia from './ExperienceMedia.jsx'
import FeaturedExperience from './FeaturedExperience.jsx'
import Section from './Section.jsx'
import useReveal from './useReveal.js'

// Full details of a regular role (shown when its card is expanded).
// withMedia=false: the media is shown beside the text instead (layout 'side').
function JobDetails({ job, withMedia = true }) {
  return (
    <>
      {job.points && (
        <ul className="points">
          {job.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      )}
      {job.positions && (
        // Separate roles grouped under one entry, each with its own details
        <div className="positions">
          {job.positions.map((position) => (
            <div key={`${position.org}-${position.period}`} className="position">
              <div className="position-head">
                <h4>{position.title}</h4>
                <span className="timeline-period">{position.period}</span>
              </div>
              <p className="position-org">
                {position.org} · {position.location}
              </p>
              <ul className="points">
                {position.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {job.links?.length > 0 && (
        <p className="card-links">
          {job.links.map((link) => (
            <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
              {link.label} ↗
            </a>
          ))}
        </p>
      )}
      {withMedia && <ExperienceMedia items={job.media} />}
    </>
  )
}

export default function Experience() {
  const listRef = useReveal('.timeline-item')
  // All roles open at first; each can be collapsed / reopened
  const [open, setOpen] = useState(() => new Set(experience.map((job) => `${job.role}-${job.org}`)))

  const toggle = (key, card) => {
    const closing = open.has(key)
    if (closing) card.querySelectorAll('video').forEach((v) => v.pause())
    setOpen((prev) => {
      const next = new Set(prev)
      if (closing) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <Section id="experience" title="Experience" accent="blue">
      <div className="xp-timeline" ref={listRef}>
        <ol className="timeline">
          {experience.map((job, i) => {
            const key = `${job.role}-${job.org}`
            const isOpen = open.has(key)
            const id = `xp-${i}`
            const side = job.layout === 'side'
            return (
              // The li's class must stay constant: useReveal adds is-visible to it
              <li key={key} className={`timeline-item accent-${job.accent}`}>
                {/* Desktop: date in the left column (the card shows it on phones) */}
                <span className="xp-date" aria-hidden="true">
                  {job.period}
                </span>
                <span className="xp-node" aria-hidden="true" />
                <div className={`xp-card${isOpen ? ' is-open' : ''}${side ? ' xp-side' : ''}${job.logo ? ' has-logo' : ''}`}>
                  <h3 className="xp-head">
                    <button
                      type="button"
                      className="xp-toggle"
                      id={`${id}-toggle`}
                      aria-expanded={isOpen}
                      aria-controls={side ? `${id}-body ${id}-media` : `${id}-body`}
                      onClick={(e) => toggle(key, e.currentTarget.closest('.xp-card'))}
                    >
                      {/* Phones: date on top of the card (desktop: left column) */}
                      <span className="xp-period">{job.period}</span>
                      <span className="xp-role">{job.role}</span>
                      <span className="xp-org">
                        {job.org} · {job.location}
                      </span>
                      <span className="xp-chevron" aria-hidden="true" />
                    </button>
                  </h3>
                  {job.logo && (
                    <span className="logo-tile xp-logo">
                      <img src={job.logo} alt={job.logoAlt} />
                    </span>
                  )}
                  {/* Collapsed details stay in the page but are inert (no focus) */}
                  <div className="xp-body" id={`${id}-body`} inert={!isOpen}>
                    <div className="xp-body-inner">
                      <div className="xp-details">
                        {job.featured ? (
                          <FeaturedExperience job={job} headless />
                        ) : (
                          <JobDetails job={job} withMedia={!side} />
                        )}
                      </div>
                    </div>
                  </div>
                  {side && (
                    // Desktop: beside the text; phones: below it
                    <div className="xp-side-media" id={`${id}-media`} inert={!isOpen}>
                      <ExperienceMedia items={job.media} />
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </Section>
  )
}
