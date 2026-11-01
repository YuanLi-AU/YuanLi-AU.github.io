import { useState } from 'react'
import { experience } from '../../data/resume.js'
import ExperienceMedia from './ExperienceMedia.jsx'
import FeaturedExperience from './FeaturedExperience.jsx'
import Icon from './Icon.jsx'
import Section from './Section.jsx'
import useReveal from './useReveal.js'

// Full details of a regular role (shown when its card is expanded)
function JobDetails({ job }) {
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
      <ExperienceMedia items={job.media} />
    </>
  )
}

// Picture on the collapsed card. It is part of the toggle button (decorative,
// no zoom); the same images stay zoomable inside the expanded details.
function Cover({ cover }) {
  if (cover.image) {
    return (
      <span className="xp-cover">
        <img
          src={cover.image}
          alt=""
          loading="lazy"
          decoding="async"
          style={cover.position ? { objectPosition: cover.position } : undefined}
        />
        {cover.video && <span className="xp-cover-video">Video</span>}
      </span>
    )
  }
  return (
    <span className="xp-cover xp-cover-graphic">
      <span className="xp-cover-icon">
        <Icon name={cover.icon} size={30} />
      </span>
      {cover.lines.map((line) => (
        <span key={line} className="xp-cover-line">
          {line}
        </span>
      ))}
    </span>
  )
}

export default function Experience() {
  const listRef = useReveal('.timeline-item')
  // All roles open at first; each can be collapsed / reopened
  const [open, setOpen] = useState(() => new Set(experience.map((job) => `${job.role}-${job.org}`)))

  const toggle = (key, bodyId) => {
    const closing = open.has(key)
    if (closing) document.getElementById(bodyId)?.querySelectorAll('video').forEach((v) => v.pause())
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
            return (
              // The li's class must stay constant: useReveal adds is-visible to it
              <li key={key} className={`timeline-item accent-${job.accent}`}>
                {/* Desktop: date in the left column (the card shows it on phones) */}
                <span className="xp-date" aria-hidden="true">
                  {job.period}
                </span>
                <span className="xp-node" aria-hidden="true" />
                <div className={isOpen ? 'xp-card is-open' : 'xp-card'}>
                  <h3 className="xp-head">
                    <button
                      type="button"
                      className="xp-toggle"
                      id={`${id}-toggle`}
                      aria-expanded={isOpen}
                      aria-controls={`${id}-body`}
                      onClick={() => toggle(key, `${id}-body`)}
                    >
                      {job.cover && <Cover cover={job.cover} />}
                      <span className="xp-summary">
                        <span className="xp-meta">
                          <span className="timeline-area">{job.area}</span>
                          <span className="timeline-period">{job.period}</span>
                        </span>
                        <span className="xp-role">{job.role}</span>
                        <span className="xp-org">
                          {job.org} · {job.location}
                        </span>
                        <span className="xp-brief">{job.brief}</span>
                      </span>
                      <span className="xp-chevron" aria-hidden="true" />
                    </button>
                  </h3>
                  {/* Collapsed details stay in the page but are inert (no focus) */}
                  <div className="xp-body" id={`${id}-body`} inert={!isOpen}>
                    <div className="xp-body-inner">
                      <div className="xp-details">
                        {job.featured ? <FeaturedExperience job={job} headless /> : <JobDetails job={job} />}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </Section>
  )
}
