import { languages, credentials } from '../../data/resume.js'
import Section from './Section.jsx'

export default function Credentials() {
  return (
    <Section id="credentials" title="Languages & Credentials" accent="blue">
      <div className="two-col">
        <div className="mini-card">
          <h3>Languages</h3>
          <ul className="plain-list">
            {languages.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="mini-card">
          <h3>Licences & Credentials</h3>
          <ul className="plain-list">
            {credentials.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}
