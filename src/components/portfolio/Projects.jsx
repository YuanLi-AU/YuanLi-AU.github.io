import { projects } from '../../data/resume.js'
import ExperienceMedia from './ExperienceMedia.jsx'
import Icon from './Icon.jsx'
import LogoZoom from './LogoZoom.jsx'
import MediaSlot from './MediaSlot.jsx'
import Section from './Section.jsx'
import Tags from './Tags.jsx'

// One labelled preview image (click to enlarge)
function Preview({ item }) {
  return (
    <figure>
      <MediaSlot {...item} />
      <figcaption>{item.label}</figcaption>
    </figure>
  )
}

export default function Projects() {
  return (
    <Section id="projects" title="Projects" accent="purple">
      <div className="cards">
        {projects.map((project) => (
          <article
            key={project.title}
            className={`card accent-${project.accent}${
              project.showcase?.image || project.previews ? ' card-wide' : ''
            }${project.certificate ? ' has-cert' : ''}`}
          >
            {project.image && (
              <img src={project.image} alt={`${project.title} screenshot`} className="card-image" />
            )}
            {/* No icon: the organisation logo leads the top row, title beside it */}
            <div className={`card-header${project.icon ? '' : ' card-header-title'}`}>
              {project.icon ? (
                <span className="icon-badge">
                  <Icon name={project.icon} size={24} />
                </span>
              ) : (
                <>
                  {project.logo && (
                    <LogoZoom
                      src={project.logo}
                      full={project.logoFull}
                      alt={project.logoAlt}
                      className="card-logo card-lead"
                    />
                  )}
                  <h3>{project.title}</h3>
                </>
              )}
              {project.status && <span className="status">{project.status}</span>}
            </div>
            {project.icon && <h3>{project.title}</h3>}
            {project.meta && (
              <p className="card-meta">
                {project.meta.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
            )}
            <p className="card-summary">{project.summary}</p>
            <ul className="points">
              {project.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            {project.previews && (
              // Main image on the left, the other previews stacked beside it
              <div className="card-previews">
                <Preview item={project.previews[0]} />
                <div className="card-previews-side">
                  {project.previews.slice(1).map((item) => (
                    <Preview key={item.label} item={item} />
                  ))}
                </div>
              </div>
            )}
            <ExperienceMedia items={project.media} className="exp-media-screens" />
            {(project.cover || project.certificate) && (
              // Main visual with the certificate as a smaller column beside it
              // (below it on phones); both open larger on click
              <div className="card-visuals">
                {project.cover && (
                  <figure className="card-cover">
                    <MediaSlot {...project.cover} />
                    <figcaption>{project.cover.caption}</figcaption>
                  </figure>
                )}
                {project.certificate && (
                  // Supporting proof: small A4 thumbnail with the issuer, date
                  // and the original PDF
                  <figure className="card-cert">
                    <MediaSlot {...project.certificate} className="card-cert-img" />
                    <figcaption>
                      <span className="card-cert-title">{project.certificate.issuer}</span>
                      <span className="muted">{project.certificate.issued}</span>
                      <a href={project.certificate.pdf} target="_blank" rel="noreferrer">
                        View PDF ↗
                      </a>
                    </figcaption>
                  </figure>
                )}
              </div>
            )}
            {project.photos ? (
              // Tags with small photos beside them (wrapping below on narrow cards)
              <div className="card-foot">
                <Tags items={project.tags} />
                <div className="card-foot-photos">
                  {project.photos.map((photo) => (
                    <MediaSlot key={photo.caption} {...photo} className="media-mini card-foot-photo" />
                  ))}
                </div>
              </div>
            ) : (
              <Tags items={project.tags} />
            )}
            {project.links?.length > 0 && (
              <p className="card-links">
                {project.links.map((link) => (
                  <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
                    {link.label} ↗
                  </a>
                ))}
              </p>
            )}
            {project.showcase && (
              // Compact preview at the bottom of the card (opens the lightbox);
              // without an image it shows a quiet placeholder for a future photo
              <div className="card-preview">
                <MediaSlot {...project.showcase} label={undefined} className="card-preview-img" />
                <p>
                  <span className="card-preview-label">{project.showcase.label}</span>
                  <span className="muted">{project.showcase.note}</span>
                </p>
              </div>
            )}
          </article>
        ))}
      </div>
    </Section>
  )
}
