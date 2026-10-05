import { projects } from '../../data/resume.js'
import Icon from './Icon.jsx'
import MediaSlot from './MediaSlot.jsx'
import Section from './Section.jsx'
import Tags from './Tags.jsx'

export default function Projects() {
  return (
    <Section id="projects" title="Projects" accent="purple">
      <div className="cards">
        {projects.map((project) => (
          <article key={project.title} className={`card accent-${project.accent}`}>
            {project.image && (
              <img src={project.image} alt={`${project.title} screenshot`} className="card-image" />
            )}
            <div className="card-header">
              <span className="icon-badge">
                <Icon name={project.icon} size={24} />
              </span>
              {project.status && <span className="status">{project.status}</span>}
              {project.teamPhoto && (
                <div className="card-photo">
                  <span>{project.teamPhoto.label}</span>
                  <MediaSlot {...project.teamPhoto} className="media-mini" />
                </div>
              )}
            </div>
            <h3>{project.title}</h3>
            <p className="card-summary">{project.summary}</p>
            <ul className="points">
              {project.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <Tags items={project.tags} />
            {project.links?.length > 0 && (
              <p className="card-links">
                {project.links.map((link) => (
                  <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
                    {link.label} ↗
                  </a>
                ))}
              </p>
            )}
          </article>
        ))}
      </div>
    </Section>
  )
}
