import { experience, earlierExperience } from '../../data/resume.js'
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
                <ul className="points">
                  {job.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </>
            )}
          </li>
        ))}
      </ol>
      {earlierExperience && <p className="muted small">Earlier: {earlierExperience}</p>}
    </Section>
  )
}
