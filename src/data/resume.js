// All Portfolio content lives here. Edit this file to update the site —
// the components in src/components/portfolio only handle layout.
//
// Source of truth: the private resume PDF (never commit it).
// Privacy: no phone, home address, date of birth or referee details.
//
// Presentation fields:
//   accent: 'blue' | 'purple' | 'teal' | 'coral' | 'orange' — category colour
//   icon:   name of an icon in components/portfolio/Icon.jsx
//
// Images: import them below, then reference them in the data. Only add
// images that are confirmed safe to publish (no private or community-
// sensitive content). Folders: src/assets/{branding,work,publications}.

import cduLogo from '../assets/branding/cdu-logo.png'
import ntcmsLogo from '../assets/branding/nt-cleaning-maintenance-logo-400.png'
import pitchBlackCertThumb from '../assets/work/pitch-black/certificate-800.jpg'
import pitchBlackCertFull from '../assets/work/pitch-black/certificate-1600.jpg'
import lpcPublicationsThumb from '../assets/publications/lpc/lpc-publications-800.jpg'
import lpcPublicationsFull from '../assets/publications/lpc/lpc-publications-2400.jpg'
import lpcWorkplaceThumb from '../assets/publications/lpc/lpc-workplace-800.jpg'
import lpcWorkplaceFull from '../assets/publications/lpc/lpc-workplace-1800.jpg'
import tcassTeamThumb from '../assets/projects/tcass/tcass-team-400.jpg'
import tcassTeamFull from '../assets/projects/tcass/tcass-team-1600.jpg'
import whiteCardThumb from '../assets/work/builder-clean/white-card-800.jpg'
import whiteCardFull from '../assets/work/builder-clean/white-card-1600.jpg'
import lpcMaterialsThumb from '../assets/publications/lpc/lpc-materials-800.jpg'
import lpcMaterialsFull from '../assets/publications/lpc/lpc-materials-1600.jpg'
import websiteShowcaseThumb from '../assets/projects/website/website-showcase-800.jpg'
import websiteShowcaseFull from '../assets/projects/website/website-showcase-1600.jpg'

export const profile = {
  name: 'Yuan Li',
  title: 'IT · Software Engineering · Data Analytics · EA-Assessed Engineer',
  subtitle:
    'Master of IT (Software Engineering) student with an engineering and operations background',
  location: 'Darwin, NT',
  intro:
    'I combine hands-on engineering and site operations experience with IT support, Power BI data analytics and content production — and I’m now completing a Master of Information Technology in Software Engineering at Charles Darwin University.',
  email: 'svip.leo@gmail.com',
  linkedin: 'https://www.linkedin.com/in/yuan-li-a982533b5/',
  resumeUrl: '', // e.g. '/Yuan_Li_Resume_Public.pdf' once the public version is in public/
}

export const about = [
  {
    heading: 'Engineering & operations background',
    accent: 'orange',
    text: 'My background is in engineering. I hold a Bachelor of Engineering in Material Forming and Control Engineering, and in the Northern Territory I have worked as a farm site supervisor — maintaining machinery, irrigation and farm infrastructure, supervising work crews and keeping operational records. I have also worked as a subcontractor under my own trading name, NT Cleaning & Maintenance Services.',
  },
  {
    heading: 'Current direction: IT, software & data',
    accent: 'teal',
    text: 'I’m now completing a Master of Information Technology (Software Engineering) at Charles Darwin University, while working part-time in desktop publishing and graphic design at a school in Wadeye, NT, where I also give some staff basic technical help. I build Power BI dashboards on real operational and workforce data, and I have produced training, video and publication content along the way.',
  },
]

// status: optional label such as 'In progress'
// image: optional screenshot path in public/, e.g. '/projects/tcass.png'
// teamPhoto: optional small photo shown in the card header (opens the lightbox)
// showcase: optional screenshot shown at the top of the card (opens the lightbox)
// links: optional [{ label, url }]
export const projects = [
  {
    title: 'TCASS Manual Handling Data Analytics',
    accent: 'coral',
    icon: 'chart',
    summary:
      'Power BI analysis of manual handling and operational data from a real business setting.',
    points: [
      'Report pages: Overview, Operations & Risk Analysis, and Data Table',
      'Analyses task volume, difficulty rate, pain rate, equipment usage, transfer paths, staff performance and trends',
    ],
    tags: ['Power BI', 'Data analysis', 'Operational analysis'],
    teamPhoto: {
      label: 'Project team',
      image: tcassTeamThumb,
      imageFull: tcassTeamFull,
      alt: 'Yuan Li with team members during the TCASS data analytics project',
      caption: 'TCASS Project Team',
    },
  },
  {
    title: 'Workforce Attendance Analytics Dashboard',
    accent: 'teal',
    icon: 'users',
    summary:
      'Power BI dashboard for workforce attendance analysis and management reporting in a real workplace setting.',
    points: [
      'Data preparation',
      'Power BI data modelling, DAX measures, and separate attendance logic for Full-Time and Casual staff',
      'Management reporting on workforce attendance',
    ],
    tags: ['Power BI', 'DAX', 'Data modelling', 'Data preparation'],
  },
  {
    title: 'Personal Portfolio & Planner Website',
    accent: 'purple',
    icon: 'laptop',
    summary:
      'Designed and developed this responsive personal portfolio and private planning web app with React and Vite, deployed to GitHub Pages through automated GitHub Actions.',
    points: [
      'Public portfolio plus a password-protected Planner (daily, mid-term and long-term plans) using Firebase Authentication and real-time Cloud Firestore sync',
      'Installable PWA with responsive desktop and mobile layouts',
    ],
    tags: [
      'React',
      'Vite',
      'React Router',
      'Firebase Authentication',
      'Cloud Firestore',
      'PWA',
      'GitHub Pages',
      'GitHub Actions',
    ],
    showcase: {
      label: 'Live site',
      image: websiteShowcaseThumb,
      imageFull: websiteShowcaseFull,
      alt: 'Screenshots of this website: the portfolio home page on desktop and the Planner unlock screen on mobile',
      caption: 'Personal Portfolio & Planner Website — yuanli-au.github.io',
    },
  },
]

// area: short label showing which part of the background this role covers
// featured: true shows the role as a larger card with optional extras:
//   logo / logoAlt  — organisation logo (shown on a white tile)
//   summary         — one-line description
//   highlights      — numbered work highlights, each with an optional image
//   gallery         — { title, items: [{ image, imageFull, alt, caption }] }
// For any image: image = thumbnail, imageFull = larger version for the lightbox.
// Order: current roles first, then by end date (overlapping dates are expected).
export const experience = [
  {
    role: 'Subcontractor — Cleaning & Maintenance Services',
    org: 'NT Cleaning & Maintenance Services',
    location: 'Northern Territory',
    period: 'Feb 2024 – Present',
    area: 'Business · Operations',
    accent: 'orange',
    featured: true,
    logo: ntcmsLogo,
    logoAlt: 'NT Cleaning & Maintenance Services logo',
    summary:
      'Cleaning and maintenance work delivered as a subcontractor under my own trading name, across a range of sites in the Northern Territory.',
    highlights: [
      {
        title: 'Pitch Black 2024 · Darwin',
        text: 'Cleaning and support work associated with Pitch Black 2024. Received a Certificate of Appreciation for contribution.',
        image: pitchBlackCertThumb,
        imageFull: pitchBlackCertFull,
        alt: 'Pitch Black 2024 Certificate of Appreciation presented to Yuan Li',
        caption: 'Certificate of Appreciation',
      },
      {
        title: 'Builder Cleans · Northern Territory',
        text: 'Builder and post-construction cleaning on sites across the NT.',
        image: whiteCardThumb,
        imageFull: whiteCardFull,
        alt: 'Western Australia Construction Induction (White Card) issued to Yuan Li',
        caption: 'Construction Induction (White Card) — Western Australia',
      },
      {
        title: 'Remote School Cleaning · Northern Territory',
        text: 'Cleaning work at school sites in remote areas of the NT.',
        icon: 'school',
      },
      {
        title: 'Darwin Port / Marine Cleaning',
        text: 'Cleaning work involving vessels and marine environments around Darwin Port.',
        icon: 'anchor',
      },
    ],
  },
  {
    role: 'LPC IT Support',
    org: 'Literature Production Centre (LPC), OLSH Thamarrurr Catholic College',
    location: 'Wadeye, NT',
    period: '2023 – Present (part-time)',
    area: 'Design · Publishing · IT',
    accent: 'blue',
    featured: true,
    points: [
      'Desktop publishing and graphic design in Adobe InDesign for educational materials, including local Indigenous cultural and literature works; contributed to a lift in the Centre’s production rate',
      'Provided basic technical guidance and assistance to some staff with routine hardware, software and connectivity issues',
      'Joined as a volunteer in 2023 before moving to a paid part-time role',
    ],
    // Add only publication images confirmed suitable to publish
    // (cultural material, students, community members). Save them in
    // src/assets/publications/lpc/ and import them at the top of this file.
    gallery: {
      title: 'Selected Publication Work',
      items: [
        {
          image: lpcMaterialsThumb,
          imageFull: lpcMaterialsFull,
          alt: 'Printed educational materials produced at the Literature Production Centre in Wadeye',
          caption: 'Educational materials produced through the Literature Production Centre',
        },
        {
          image: lpcWorkplaceThumb,
          imageFull: lpcWorkplaceFull,
          alt: 'Yuan Li with colleagues at the Literature Production Centre in Wadeye',
          caption: 'Workplace · Literature Production Centre, Wadeye',
        },
        {
          image: lpcPublicationsThumb,
          imageFull: lpcPublicationsFull,
          alt: 'Selected publication work produced at the Literature Production Centre in Wadeye',
          caption: 'Selected publication work',
        },
      ],
    },
  },
  {
    role: 'Intern — Content Development & LMS',
    org: 'Treescape Power Pte Ltd',
    location: 'Singapore (remote)',
    period: 'Jan 2026 – Apr 2026',
    area: 'Content · LMS',
    accent: 'purple',
    points: [
      'Developed English and Chinese training content for all 8 modules of Singapore Standard SS 724',
      'Produced training videos and built quizzes in WP Courseware',
    ],
  },
  {
    role: 'Supervisor — Plant & Infrastructure',
    org: 'GFH Enterprises Pty Ltd',
    location: 'NT',
    period: 'Apr 2023 – Nov 2023',
    area: 'Engineering · Operations',
    accent: 'orange',
    points: [
      'Supervised work crews to prescribed procedures; liaised with the investor on staffing and work programs',
      'Maintained and repaired plant, vehicles and heavy machinery',
      'Maintained site infrastructure including roads, fire breaks, irrigation and fencing',
      'Managed operational and property records',
    ],
  },
  {
    role: 'Founder / Content Creator',
    org: 'Self-employed',
    location: 'China',
    period: '2020 – 2023',
    area: 'Content · Media',
    accent: 'coral',
    points: [
      'Built a YouTube channel to 27,000 subscribers and published across Douyin',
      'Ran content planning, filming, editing and audience engagement end to end',
    ],
  },
  {
    role: 'Supervisor — Plant & Irrigation',
    org: 'Big Plantation Pty Ltd',
    location: 'NT',
    period: 'Jul 2019 – Feb 2020',
    area: 'Engineering · Operations',
    accent: 'orange',
    points: [
      'Supervised site work and reported to the investor',
      'Maintained plant, heavy machinery, irrigation infrastructure and access roads',
    ],
  },
]

export const earlierExperience =
  'Casual and seasonal roles before commencing study in 2024, including Builder Labourer (Northern Trade Solutions, 2023–24) and Station Hand (YK Australia Brother, 2023).'

// studied: true marks skills from Master's study rather than work experience
export const skills = [
  {
    group: 'Software / Development',
    accent: 'purple',
    items: ['Python', 'Git', 'Agile', 'Unit testing', 'Secure development', 'WordPress'],
  },
  {
    group: 'Data / BI',
    accent: 'teal',
    items: [
      'SQL',
      'Relational databases',
      'Power BI',
      'Data modelling',
      'DAX',
      'Dashboards',
      'Excel',
      'VBA',
      'Data analysis',
    ],
  },
  {
    group: 'IT / Systems',
    accent: 'blue',
    items: ['Troubleshooting', 'Windows', 'Microsoft 365', 'Operating systems', 'Networking'],
  },
  {
    group: 'Engineering / Operations',
    accent: 'orange',
    items: [
      'Machinery & equipment maintenance',
      'Fault diagnosis',
      'Basic vehicle servicing',
      'Routine mechanical maintenance',
      'Hand & power tools',
      'Site supervision',
      'Safety compliance',
      'Materials forming & control',
    ],
  },
  {
    group: 'Design / Content',
    accent: 'coral',
    items: ['Adobe InDesign', 'Video production', 'Content creation'],
  },
  {
    group: 'Through Master’s study',
    studied: true,
    items: ['Machine learning & AI', 'Cyber security'],
  },
]

export const education = [
  {
    degree: 'Master of Information Technology (Software Engineering)',
    school: 'Charles Darwin University',
    logo: cduLogo,
    logoAlt: 'Charles Darwin University logo',
    location: 'Darwin, NT',
    period: 'Mar 2025 – Nov 2026 (Expected)',
    notes: 'Key areas: software engineering, security, machine learning & AI, IT service management',
  },
  {
    degree: 'Bachelor of Engineering — Material Forming and Control Engineering',
    school: 'Yantai Nanshan University',
    location: 'China',
    period: '2011 – 2015',
    notes: 'Core areas: engineering mechanics, mechanical design, materials science, CAD/CAM',
  },
]

export const recognition = [
  {
    title: 'Engineers Australia Skills Assessment',
    accent: 'teal',
    detail: 'Engineering Professionals (nec) · ANZSCO 233999',
    date: 'July 2024',
  },
]

export const languages = ['Mandarin — Native', 'English']

export const credentials = [
  'Full Australian driver licence',
  'White Card (construction)',
  'Working with Children Clearance',
]

export const referees = 'Available upon request'
