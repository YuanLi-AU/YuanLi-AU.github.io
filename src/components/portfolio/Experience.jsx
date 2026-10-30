import { experience, earlierExperience, careerBackground } from '../../data/resume.js'
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
                <ul className="points">
                  {job.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <ExperienceMedia items={job.media} />
              </>
            )}
          </li>
        ))}
      </ol>
      {earlierExperience.length > 0 && (
        <div className="earlier">
          <h4 className="mini-heading">Earlier Experience</h4>
          <ul className="earlier-list">
            {earlierExperience.map((job) => (
              <li key={`${job.role}-${job.period}`} className="earlier-item">
                <div className="earlier-head">
                  <h3>{job.role}</h3>
                  <span className="timeline-period">{job.period}</span>
                </div>
                {(job.org || job.location) && (
                  <p className="earlier-org">{[job.org, job.location].filter(Boolean).join(' · ')}</p>
                )}
                <ul className="points">
                  {job.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <ExperienceMedia items={job.media} />
              </li>
            ))}
          </ul>
          {careerBackground && (
            <div className="career-note">
              <h4 className="mini-heading">{careerBackground.heading}</h4>
              <p>{careerBackground.text}</p>
            </div>
          )}
        </div>
      )}
    </Section>
  )
}
