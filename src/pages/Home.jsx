import Nav from '../components/portfolio/Nav.jsx'
import Hero from '../components/portfolio/Hero.jsx'
import About from '../components/portfolio/About.jsx'
import Projects from '../components/portfolio/Projects.jsx'
import Experience from '../components/portfolio/Experience.jsx'
import Skills from '../components/portfolio/Skills.jsx'
import Education from '../components/portfolio/Education.jsx'
import Recognition from '../components/portfolio/Recognition.jsx'
import Credentials from '../components/portfolio/Credentials.jsx'
import Contact from '../components/portfolio/Contact.jsx'
import { profile } from '../data/resume.js'
import '../components/portfolio/portfolio.css'

const YEAR = new Date().getFullYear()

export default function Home() {
  return (
    <div id="top">
      <Nav />
      <main className="portfolio">
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Education />
        <Recognition />
        <Credentials />
        <Contact />
      </main>
      <footer className="footer">
        © {YEAR} {profile.name}
      </footer>
    </div>
  )
}
