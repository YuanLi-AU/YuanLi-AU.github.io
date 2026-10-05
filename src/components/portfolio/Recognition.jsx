import { recognition } from '../../data/resume.js'
import Icon from './Icon.jsx'
import Section from './Section.jsx'

export default function Recognition() {
  return (
    <Section id="recognition" title="Professional Recognition" accent="teal">
      <div className="stack">
        {recognition.map((item) => (
          <article key={item.title} className={`credential accent-${item.accent}`}>
            <span className="icon-badge">
              <Icon name="award" size={24} />
            </span>
            <div className="credential-body">
              <div className="entry-header">
                <h3>{item.title}</h3>
                <span className="entry-period">{item.date}</span>
              </div>
              <p className="entry-org">{item.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}
