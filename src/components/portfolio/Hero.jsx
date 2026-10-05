import { profile } from '../../data/resume.js'
import Icon from './Icon.jsx'
import ProfilePhoto from './ProfilePhoto.jsx'
import ResumeButton from './ResumeButton.jsx'

export default function Hero() {
  return (
    <section className="hero">
      {/* Decorative background shapes (pure CSS) */}
      <div className="hero-bg" aria-hidden="true">
        <span className="shape shape-1" />
        <span className="shape shape-2" />
        <span className="shape shape-3" />
        <span className="dots dots-1" />
        <span className="dots dots-2" />
        <span className="spot" />
      </div>

      <div className="container hero-grid">
        <div className="hero-text">
          <p className="hero-title">{profile.title}</p>
          <h1 className="hero-name">{profile.name}</h1>
          <p className="hero-subtitle">
            {profile.subtitle}
            <span className="hero-location">
              <Icon name="pin" size={16} /> {profile.location}
            </span>
          </p>
          <p className="hero-intro">{profile.intro}</p>

          <div className="hero-actions">
            <a href="#projects" className="btn btn-primary">
              View Projects <Icon name="arrowRight" size={18} />
            </a>
            <ResumeButton />
            <a href="#contact" className="btn btn-outline">
              <Icon name="mail" size={18} /> Contact
            </a>
          </div>
        </div>

        <div className="hero-photo">
          <ProfilePhoto />
        </div>
      </div>
    </section>
  )
}
