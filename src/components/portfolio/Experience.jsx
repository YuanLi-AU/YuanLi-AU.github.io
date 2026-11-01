import { experience } from '../../data/resume.js'
import ExperienceMedia from './ExperienceMedia.jsx'
import FeaturedExperience from './FeaturedExperience.jsx'
import Section from './Section.jsx'

export default function Experience() {
  return (
    <Section id="experience" title="Experience" accent="blue">
      <ol className="timeline">
        {experience.map((job) => (
          <li
            key={`${job.role}-${job.org}`}
            className={`timeline-item accent-${job.accent}${job.featured ? ' is-featured' : ''}`}
          >
            {job.featured ? (
              <FeaturedExperience job={job} />
            ) : (
              <>
                <div className="timeline-meta">
                  <span className="timeline-area">{job.area}</span>
                  <span className="timeline-period">{job.period}</span>
                </div>
                <h3>{job.role}</h3>
                <p className="timeline-org">
                  {job.org} <span className="muted">· {job.location}</span>
                </p>
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
            )}
          </li>
        ))}
      </ol>
    </Section>
  )
}
