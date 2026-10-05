import { education } from '../../data/resume.js'
import Section from './Section.jsx'

export default function Education() {
  return (
    <Section id="education" title="Education" accent="blue">
      <div className="edu-grid">
        {education.map((item) => (
          <article key={item.degree} className="edu-card">
            {/* Logo shown only in its education context, on a white tile so
                the original artwork is never recoloured. */}
            {item.logo && (
              <div className="logo-tile">
                <img src={item.logo} alt={item.logoAlt} />
              </div>
            )}
            <p className="edu-period">{item.period}</p>
            <h3>{item.degree}</h3>
            <p className="edu-school">
              {item.school} <span className="muted">· {item.location}</span>
            </p>
            {item.notes && <p className="muted small">{item.notes}</p>}
          </article>
        ))}
      </div>
    </Section>
  )
}
