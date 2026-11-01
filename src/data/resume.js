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
import tcassOverviewThumb from '../assets/projects/tcass/tcass-overview-800.jpg'
import tcassOverviewFull from '../assets/projects/tcass/tcass-overview-1600.jpg'
import tcassOperationsThumb from '../assets/projects/tcass/tcass-operations-800.jpg'
import tcassOperationsFull from '../assets/projects/tcass/tcass-operations-1600.jpg'
import gfhTractorThumb from '../assets/work/plantation/gfh-tractor-800.jpg'
import gfhTractorFull from '../assets/work/plantation/gfh-tractor-1440.jpg'
import plantationTeamThumb from '../assets/work/plantation/plantation-team-800.jpg'
import plantationTeamFull from '../assets/work/plantation/plantation-team-1600.jpg'
import whiteCardThumb from '../assets/work/builder-clean/white-card-800.jpg'
import whiteCardFull from '../assets/work/builder-clean/white-card-1600.jpg'
import ntsVideo from '../assets/work/nts/nts-site-framing.mp4'
import ntsVideoPoster from '../assets/work/nts/nts-site-framing-poster.jpg'
import youtubeChannelThumb from '../assets/work/youtube/youtube-channel-800.jpg'
import youtubeChannelFull from '../assets/work/youtube/youtube-channel-1338.jpg'
import raafPassThumb from '../assets/work/regina/raaf-pass-800.jpg'
import raafPassFull from '../assets/work/regina/raaf-pass-1600.jpg'
import lpcMaterialsThumb from '../assets/publications/lpc/lpc-materials-800.jpg'
import lpcMaterialsFull from '../assets/publications/lpc/lpc-materials-1600.jpg'
import websiteShowcaseFull from '../assets/projects/website/website-showcase-1600.jpg'
import plannerDailyThumb from '../assets/projects/website/planner-daily-400.jpg'
import plannerDailyFull from '../assets/projects/website/planner-daily-1170.jpg'

export const profile = {
  name: 'Yuan Li',
  title: 'IT · Software Engineering · Data Analytics · EA-Assessed Engineer · Site Supervision',
  subtitle:
    'Engineering, IT and data background — Master of IT (Software Engineering) coursework completed',
  location: 'Darwin, NT',
  intro:
    'My background spans engineering, IT support, Power BI and Power Apps data work, school-based publishing and finance administration, and supervising labour-hire teams in the Northern Territory. I have completed the coursework for a Master of Information Technology (Software Engineering) at Charles Darwin University, with results due in November 2026.',
  email: 'svip.leo@gmail.com',
  linkedin: 'https://www.linkedin.com/in/yuan-li-a982533b5/',
  resumeUrl: '', // e.g. '/Yuan_Li_Resume_Public.pdf' once the public version is in public/
}

export const about = [
  {
    heading: 'Engineering & operations background',
    accent: 'orange',
    text: 'I hold a Bachelor of Engineering in Material Forming and Control Engineering, and my qualifications have been assessed by Engineers Australia. In Australia I have gained hands-on experience across labour-hire team supervision, farm and plantation operations, construction sites and commercial cleaning, including delivering cleaning services as a subcontractor. This work has built my skills in team coordination, site management and problem-solving, and my ability to run work independently.',
  },
  {
    heading: 'Technology, data & business skills',
    accent: 'teal',
    text: 'I have completed all coursework for a Master of Information Technology (Software Engineering) at Charles Darwin University, with results due in November 2026. My skills cover data analysis, Power BI reporting and visualisation, Power Apps development and software development, and I have worked on a real-world business data analytics project. I also bring experience in finance-related work, book editing and publishing, e-commerce operations, digital content production and social media channel management, and I apply technical knowledge to practical business needs.',
  },
]

// status: optional label such as 'In progress'
// image: optional screenshot path in public/, e.g. '/projects/tcass.png'
// teamPhoto: optional small photo shown in the card header (opens the lightbox)
// showcase: optional preview at the bottom of the card: { label, note, image,
//   imageFull, alt, caption, icon }. With an image it opens the lightbox and
//   the card spans the full row; without one it shows a small placeholder.
// previews: optional pair of main images shown side by side, each with a
//   label: [{ label, image, imageFull, alt, caption, tall }]; the card spans
//   the full row.
// media: optional screenshots (same format as Experience media below)
// links: optional [{ label, url }]
export const projects = [
  {
    title: 'TCASS Manual Handling Analytics & Power Apps Application',
    accent: 'coral',
    icon: 'chart',
    summary:
      'Team client project during my Master of IT for Territory Care & Support Services (TCASS), an NDIS service provider in Darwin.',
    points: [
      'My contribution: the manual-handling data analysis in Power BI and the build of the overall Power Apps application',
      'Team outcome: the solution has been put into use, making manual-handling information easier for managers and staff to access and understand',
      'Report pages: Overview, Operations & Risk Analysis, and Data Table',
      'Analyses task volume, difficulty rate, pain rate, equipment usage, transfer paths, staff performance and trends',
    ],
    tags: ['Power BI', 'Power Apps', 'Data analysis', 'Client project', 'Teamwork'],
    teamPhoto: {
      label: 'Project team',
      image: tcassTeamThumb,
      imageFull: tcassTeamFull,
      alt: 'Yuan Li with team members during the TCASS client project',
      caption: 'TCASS Project Team',
    },
    // Staff names obscured in the screenshots
    media: [
      {
        image: tcassOverviewThumb,
        imageFull: tcassOverviewFull,
        alt: 'Power BI Overview page of the TCASS manual handling report, showing task totals, difficulty and pain rates, equipment usage, task trends and common transfer paths, with staff names obscured',
        caption: 'Overview dashboard (staff names obscured)',
      },
      {
        image: tcassOperationsThumb,
        imageFull: tcassOperationsFull,
        alt: 'Power BI Operations & Risk Analysis page showing task frequency by hour, tasks by day, difficulty by task type and patient movement flow',
        caption: 'Operations & Risk Analysis dashboard',
      },
    ],
  },
  // Only confirmed facts so far. To add once Yuan confirms: project outcomes,
  // other tools used, and real photos (set showcase.image / imageFull / alt).
  {
    title: 'Singapore Internship Project — SS 724 Bilingual Training Content',
    accent: 'teal',
    icon: 'book',
    summary:
      'Remote internship with Treescape Power Pte Ltd, Singapore (Jan – Apr 2026), as Intern — Content Development & LMS.',
    points: [
      'Developed English and Chinese training content for all 8 modules of Singapore Standard SS 724',
      'Produced training videos and built quizzes in WP Courseware',
    ],
    tags: ['WP Courseware', 'WordPress', 'Training content', 'Video production', 'English / Chinese'],
    showcase: {
      label: 'Project photos',
      note: 'Coming soon',
      icon: 'book',
    },
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
    links: [{ label: 'Visit Website', url: 'https://yuanli-au.github.io/' }],
    // Planner screenshot is from an isolated demo build with sample data.
    // tall: the lightbox shows the long screenshot at phone width and scrolls.
    previews: [
      {
        label: 'Desktop Website',
        image: websiteShowcaseFull,
        imageFull: websiteShowcaseFull,
        alt: 'Screenshots of this website: the portfolio home page on desktop and the unlocked Planner (sample data) on mobile',
        caption: 'Personal Portfolio & Planner Website — yuanli-au.github.io',
      },
      {
        label: 'Mobile Planner',
        image: plannerDailyThumb,
        imageFull: plannerDailyFull,
        alt: 'Full-page mobile screenshot of the unlocked Planner showing the Daily plan with sample data',
        caption: 'Daily Planner · sample data',
        tall: true,
      },
    ],
  },
]

// Shared by both plantation roles (team work led on the host farm's instructions)
const plantationTeamWork =
  'Led the team in drip-irrigation pipe repairs, tree pruning, weeding and vine removal, pesticide spraying of trees, planting new trees, and manual removal of unwanted trees as directed by the farm'

// area: short label showing which part of the background this role covers
// links: optional [{ label, url }] shown under the points (opens in a new tab)
// positions: optional, in place of points — separate roles grouped under one
//   entry, each kept with its own details: [{ title, org, location, period, points }]
// media: work photos or certificates for any role, shown as small click-to-
//   enlarge thumbnails: [{ image, imageFull, alt, caption }]. An empty list
//   shows nothing. Obscure card numbers, signatures and internal data first.
// featured: true shows the role as a larger card with optional extras:
//   logo / logoAlt  — organisation logo (shown on a white tile)
//   summary         — one-line description
//   highlights      — numbered work highlights, each with an optional image
//   gallery         — { title, items: [{ image, imageFull, alt, caption }] }
// For any image: image = thumbnail, imageFull = larger version for the lightbox.
// Order: current roles first, then by end date (overlapping dates are expected).
export const experience = [
  {
    role: 'Finance Assistant — Timesheet Verification',
    org: 'OLSH Thamarrurr Catholic College',
    location: 'Wadeye, NT · Remote since Feb 2026',
    period: 'Oct 2025 – Present (part-time)',
    area: 'Finance · Administration',
    accent: 'teal',
    points: [
      'Check staff handwritten timesheets and leave records',
      'Prepare weekly Excel summaries of verified hours',
      'Check leave balances and follow up discrepancies with staff and the Finance Officer',
      'Check leave categories against the applicable leave rules, and review overtime and back-pay records',
      'Report missing, inactive or incorrectly numbered staff records to the Finance Officer',
      'Enter verified timesheets into TechnologyOne CiAnywhere',
      'Complete two final checks after data entry to help ensure staff are paid accurately',
    ],
    media: [],
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
    media: [],
  },
  {
    role: 'Cleaning Subcontractor — Regina Cleaning Service',
    org: 'NT Cleaning & Maintenance Services (own business)',
    location: 'Wadeye & Darwin, NT',
    period: '2024 – 2026',
    area: 'Operations · Team Leadership',
    accent: 'orange',
    featured: true,
    logo: ntcmsLogo,
    logoAlt: 'NT Cleaning & Maintenance Services logo',
    summary:
      'Worked as a subcontractor to Regina Cleaning Service, trading under my own business name, NT Cleaning & Maintenance Services.',
    points: [
      'Led a cleaning team of 4–5 people in Darwin',
      'Trained new cleaners on site routines and workflows',
      'Prepared cleaning-supply order lists for the school facilities team in Wadeye',
      'Work locations included multiple construction sites, some RAAF facilities and Darwin Port',
    ],
    highlights: [
      // Full pass shown with Yuan's confirmed permission from the relevant parties
      {
        title: 'Defence Pass · RAAF Darwin',
        text: 'Site access pass issued for subcontracted cleaning work at RAAF Darwin.',
        image: raafPassThumb,
        imageFull: raafPassFull,
        alt: 'RAAF Darwin site access pass issued to Yuan Li for subcontracted work',
        caption: 'RAAF Darwin site access pass — issued for subcontracted work',
      },
      {
        title: 'Pitch Black 2024 · Darwin',
        text: 'Cleaning work during Exercise Pitch Black 2024 as part of the Regina subcontract. Received a Certificate of Appreciation.',
        image: pitchBlackCertThumb,
        imageFull: pitchBlackCertFull,
        alt: 'Pitch Black 2024 Certificate of Appreciation presented to Yuan Li, with signatures and third-party names obscured',
        caption: 'Certificate of Appreciation (signatures obscured)',
      },
      {
        title: 'Builder Cleans · Construction Sites',
        text: 'Builder and post-construction cleaning on construction sites.',
        image: whiteCardThumb,
        imageFull: whiteCardFull,
        alt: 'Western Australia Construction Induction (White Card) issued to Yuan Li, with the card number obscured',
        caption: 'Construction Induction (White Card) — card number obscured',
      },
      {
        title: 'After-school Campus Cleaning · Wadeye',
        text: 'After-school campus cleaning at OLSH Thamarrurr Catholic College.',
        icon: 'school',
      },
      {
        title: 'Darwin Port & Vessel Cleaning',
        text: 'Site cleaning at Darwin Port, including interior cleaning of vessels.',
        icon: 'anchor',
      },
    ],
    media: [],
  },
  {
    role: 'LPC Assistant — Publishing & Design',
    org: 'Literature Production Centre (LPC), OLSH Thamarrurr Catholic College',
    location: 'Wadeye, NT',
    period: 'Jun 2024 – Feb 2026',
    area: 'Design · Publishing',
    accent: 'blue',
    featured: true,
    points: [
      'Worked with local Aboriginal colleagues to produce reading books for primary school students',
      'Page design and desktop publishing in Adobe InDesign and Photoshop',
      'Laid out language text supplied by colleagues together with scanned children’s drawings',
      'Handled typesetting, print production and binding',
      'Main desktop publisher for 3 newly published books; updated and corrected nearly 20 existing titles',
      'Built good rapport with local children during book production, and good, respectful working relationships with colleagues Cecil and Francella',
      'Also gave colleagues day-to-day help with basic hardware, software and connectivity issues',
      'Contributed as a volunteer before taking up the paid role',
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
    media: [],
  },
  {
    role: 'Construction Labourer',
    org: 'Northern Trade Solutions',
    location: 'Berrimah Farm & Defence Accommodation Precinct, Darwin, NT',
    period: 'Late 2023 – Early 2024',
    area: 'Construction',
    accent: 'orange',
    points: [
      'Assisted with external wall framing at Berrimah Farm',
      'Assisted on a 138-room refurbishment at a Defence accommodation precinct: removing adhesive and residue, and laying ceiling acoustic insulation',
      'On site for approximately two to three months',
    ],
    media: [
      {
        video: ntsVideo,
        image: ntsVideoPoster,
        alt: 'Short site video of external wall framing work from an elevated work platform on a Darwin construction site',
        caption: 'On-site construction work · External wall framing at Berrimah Farm',
      },
    ],
  },
  // Two separate labour-hire roles, each with its own employer, place and dates
  {
    role: 'Farm & Plantation Operations — Katherine & Douglas Daly',
    org: 'GFH Enterprises Pty Ltd · Big Plantation Pty Ltd',
    location: 'Northern Territory',
    period: 'Apr 2023 – Oct 2023 · Jun 2019 – Feb 2020',
    area: 'Site Supervision · Agriculture',
    accent: 'orange',
    positions: [
      {
        title: 'Labour-hire Supervisor',
        org: 'GFH Enterprises Pty Ltd',
        location: 'Katherine, NT',
        period: 'Apr 2023 – Oct 2023',
        points: [
          'Supervised a labour-hire team on a sandalwood plantation, allocating tasks according to the host farm’s work plans',
          plantationTeamWork,
        ],
      },
      {
        title: 'Labour-hire Supervisor',
        org: 'Big Plantation Pty Ltd',
        location: 'Douglas Daly, NT',
        period: 'Jun 2019 – Feb 2020',
        points: [
          'Supervised a labour-hire team of up to 20 workers on a sandalwood plantation, allocating tasks according to the host farm’s instructions',
          plantationTeamWork,
          'Carried out simple repairs and routine oil changes on team vehicles; sourced and purchased parts and replaced faulty components',
          'Organised drinking water and rest breaks for work in high heat, and promptly reported injuries and safety hazards',
        ],
      },
    ],
    media: [
      {
        image: gfhTractorThumb,
        imageFull: gfhTractorFull,
        alt: 'Yuan Li with two co-workers in front of a tractor on a GFH sandalwood plantation',
        caption: 'On site at a GFH sandalwood plantation',
      },
      {
        image: plantationTeamThumb,
        imageFull: plantationTeamFull,
        alt: 'Yuan Li with members of the plantation work team in high-visibility workwear, Douglas Daly',
        caption: 'Plantation work team · Douglas Daly',
      },
    ],
  },
  {
    role: 'YouTube Content Creator',
    org: 'Self-employed',
    location: 'China',
    period: 'Jun 2022 – Sep 2022 (main activity)',
    area: 'Content · Media',
    accent: 'coral',
    points: [
      'Ran content planning, filming, editing and audience engagement end to end',
      'Reached approximately 27,000 subscribers at its peak; approximately 22.4K subscribers currently, with no new content for approximately four years',
    ],
    links: [{ label: 'YouTube channel', url: 'https://www.youtube.com/@qingganrexian' }],
    media: [
      {
        image: youtubeChannelThumb,
        imageFull: youtubeChannelFull,
        alt: 'Header of the YouTube channel 情感热线 (@qingganrexian), showing the channel banner, about 22.4K subscribers and 30 videos',
        caption: 'YouTube channel home page · approx. 22.4K subscribers, 30 videos',
        objectPosition: '12% center',
      },
    ],
  },
  // Two stages: own Taobao store (2012 – 2016) and a Tmall store role (2015 – 2016)
  {
    role: 'E-commerce Operations — Taobao & Tmall',
    org: 'Own Taobao store · Hengmei Oil Painting (Tmall store)',
    location: 'China',
    period: '2012 – 2016',
    area: 'Business · E-commerce',
    accent: 'coral',
    positions: [
      {
        title: 'Taobao Store Owner',
        org: 'Self-employed',
        location: 'China',
        period: '2012 – 2016',
        points: [
          'Ran my own online store independently',
          'Compared suppliers, purchased products, fulfilled customer orders and handled customer communication',
          'Completed approximately 12,000 transactions in total',
        ],
      },
      {
        title: 'Tmall Store Operations',
        org: 'Hengmei Oil Painting (Tmall store)',
        location: 'China',
        period: 'Aug 2015 – Mar 2016',
        points: [
          'Ran the day-to-day operations of a Tmall online store selling oil paintings, managing them independently',
          'Designed product images and visual content, and handled customer service and order processing',
          'The store averaged approximately RMB 300,000 in monthly sales',
        ],
      },
    ],
    media: [],
  },
]

// Earlier and shorter roles. Not shown on the page (kept for reference).
export const earlierExperience = [
  {
    role: 'Shed Machine Operator',
    org: 'Australian Ilmenite Resources',
    location: 'Darwin, NT',
    period: 'Dec 2023 – Feb 2024',
    points: [
      'Worked in a mineral products shed associated with Darwin Port',
      'Helped with forklift container loading and on-site materials handling',
    ],
    media: [],
  },
  {
    role: 'Station Hand',
    org: 'YK Australia Brother · Florina Station',
    location: 'Katherine region, NT',
    period: 'Oct 2023 – Dec 2023',
    points: [
      'Livestock care and general station duties',
      'Supported fencing and equipment maintenance',
      'Kept livestock records and basic operational documentation',
    ],
    media: [],
  },
  {
    role: 'General Factory Hand',
    org: 'Arcadia Architectural Pty Ltd',
    location: 'Welshpool, WA',
    period: 'Aug 2018 – Oct 2018',
    points: [
      'General factory work at a manufacturer of architectural building products',
      'Took part in day-to-day production floor work in line with workplace safety requirements',
    ],
    media: [],
  },
  {
    role: 'Farm Hand',
    org: 'Hanwood Service · Sandalwood plantation',
    location: 'Katherine, NT',
    period: 'Dec 2017 – Apr 2018',
    points: ['General plantation work, including spraying, fencing and irrigation repairs'],
    media: [],
  },
  {
    role: 'Online Customer Service Representative',
    org: 'Taobao Cloud Customer Service',
    location: 'China',
    period: 'Apr 2013 – Nov 2013',
    points: [
      'Handled after-sales issues and transaction disputes between Taobao buyers and sellers through the online customer service system',
      'Responded to approximately 12–20 customer enquiries per hour',
    ],
    media: [],
  },
]

// Not shown on the page (kept for reference)
export const careerBackground = {
  heading: 'Career Background',
  text: 'During my early years working in Australia on a Working Holiday visa, I gained hands-on experience across agriculture, construction, production and site operations. Some roles were short-term or undertaken concurrently, including a mix of full-time and part-time work.',
}

// studied: true marks skills from Master's study rather than work experience
export const skills = [
  {
    group: 'Software / Development',
    accent: 'purple',
    items: [
      'Python',
      'Git',
      'Agile',
      'Unit testing',
      'Secure development',
      'Power Apps',
      'WordPress',
    ],
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
      'Data verification & record reconciliation',
    ],
  },
  {
    group: 'IT / Systems',
    accent: 'blue',
    items: [
      'Hardware, software & network troubleshooting',
      'Windows',
      'Microsoft 365',
      'TechnologyOne CiAnywhere',
      'Operating systems',
      'Networking',
    ],
  },
  {
    group: 'Engineering / Operations',
    accent: 'orange',
    items: [
      'Site supervision, task allocation & safe work practices',
      'Basic vehicle maintenance, minor repairs & routine oil changes',
      'Parts sourcing & purchasing',
      'Construction support: external wall framing & interior refurbishment',
      'Basic drip-irrigation pipe repairs',
      'Hand & power tools',
      'Workplace safety awareness',
      'General manufacturing & site operations',
      'Basic inventory & materials handling',
      'Materials Forming & Control Engineering',
    ],
  },
  {
    group: 'Design / Content',
    accent: 'coral',
    items: [
      'Adobe InDesign',
      'Adobe Photoshop',
      'Desktop publishing',
      'Print production',
      'Video production',
      'Content creation',
    ],
  },
  {
    group: 'Business / E-commerce',
    accent: 'coral',
    items: [
      'E-commerce operations',
      'Online customer service',
      'Order fulfilment',
      'Product listing & visual content',
    ],
  },
  {
    group: 'Through Master’s study',
    studied: true,
    items: ['Machine learning & AI', 'Cyber security', 'Project management', 'Risk & reliability'],
  },
]

export const education = [
  {
    degree: 'Master of Information Technology (Software Engineering)',
    school: 'Charles Darwin University',
    logo: cduLogo,
    logoAlt: 'Charles Darwin University logo',
    location: 'Darwin, NT',
    period: 'Mar 2025 – Nov 2026 · Coursework completed; results pending (Nov 2026)',
    notes:
      'Key areas: software engineering, security, machine learning & AI, IT service management, project management, risk and reliability',  },
  {
    degree: 'Bachelor of Engineering — Material Forming and Control Engineering',
    school: 'Yantai Nanshan University',
    location: 'China',
    period: 'Sep 2011 – Jun 2015',
    notes:
      'Core areas: engineering mechanics, mechanical design, materials science, CAD/CAM, stamping & die design, hydraulics & pneumatics',
    // Award year not shown until confirmed from the certificate
    awards: ['Second Prize — Shandong Provincial Electromechanical Product Design Competition'],
  },
]

export const recognition = [
  {
    title: 'Engineers Australia Migration Skills Assessment',
    accent: 'teal',
    detail:
      'Engineering Professionals nec · ANZSCO 233999 — a migration skills assessment, not a professional registration or licence',
    date: 'July 2024',
  },
]

export const languages = ['Mandarin — Native', 'English']

export const credentials = [
  'Full NT Class C driver licence — approx. 100,000 km driven in Australia with no traffic accidents',
  'Working With Children Clearance (Ochre Card) — valid to Apr 2028',
  'White Card (construction induction)',
  'National Police Check',
]

export const referees = 'Available upon request'
