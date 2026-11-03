// All Portfolio content lives here. Edit this file to update the site —
// the components in src/components/portfolio only handle layout.
//
// Source of truth: the private resume PDF (never commit it).
// Privacy: no phone, home address, date of birth or referee details.
//
// Presentation fields:
//   accent: 'blue' | 'purple' | 'teal' | 'coral' | 'orange' — category colour
//   icon:   name of an icon in components/portfolio/Icon.jsx (project cards
//           without one show the title in the top row instead)
//
// Images: import them below, then reference them in the data. Only add
// images that are confirmed safe to publish (no private or community-
// sensitive content). Folders: src/assets/{branding,work,publications}.

import cduLogo from '../assets/branding/cdu-logo.png'
import nanshanLogo from '../assets/branding/yantai-nanshan-university-logo.jpg' // supplied by Yuan (图片/)
import ntcmsLogo from '../assets/branding/nt-cleaning-maintenance-logo-400.png'
import olshCrest from '../assets/branding/olsh-crest-168.png' // from olshtnt.catholic.edu.au
import ntsLogo from '../assets/branding/nts-logo.png' // from ntsnt.com.au
import treescapeLogo from '../assets/branding/treescape-power-logo.png' // supplied by Yuan (图片/)
import treescapeLogoFull from '../assets/branding/treescape-power-logo-full.jpg'
import gfhLogo from '../assets/branding/gfh-logo.jpg' // supplied by Yuan (图片/), on its own background
import gfhLogoFull from '../assets/branding/gfh-logo-980.jpg'
import quintisLogo from '../assets/branding/quintis-logo.png' // supplied by Yuan (图片/)
import quintisLogoFull from '../assets/branding/quintis-logo-1200.png'
import pitchBlackCertThumb from '../assets/work/pitch-black/certificate-800.jpg'
import pitchBlackCertFull from '../assets/work/pitch-black/certificate-1600.jpg'
import lpcPublicationsThumb from '../assets/publications/lpc/lpc-publications-800.jpg'
import lpcPublicationsFull from '../assets/publications/lpc/lpc-publications-2400.jpg'
import lpcWorkplaceThumb from '../assets/publications/lpc/lpc-workplace-800.jpg'
import lpcWorkplaceFull from '../assets/publications/lpc/lpc-workplace-1800.jpg'
import tcassTeamThumb from '../assets/projects/tcass/tcass-team-400.jpg'
import tcassTeamFull from '../assets/projects/tcass/tcass-team-1600.jpg'
import tcassPresentationThumb from '../assets/projects/tcass/tcass-final-presentation-420.jpg'
import tcassPresentationFull from '../assets/projects/tcass/tcass-final-presentation-1536.jpg'
import tcassLogo from '../assets/branding/tcass-logo-168.png' // supplied by Yuan (图片/)
import tcassLogoFull from '../assets/branding/tcass-logo-full.png'
import tcassOverviewThumb from '../assets/projects/tcass/tcass-overview-800.jpg'
import tcassOverviewFull from '../assets/projects/tcass/tcass-overview-1600.jpg'
import tcassOperationsThumb from '../assets/projects/tcass/tcass-operations-800.jpg'
import tcassOperationsFull from '../assets/projects/tcass/tcass-operations-1600.jpg'
import tcassAppUploadThumb from '../assets/projects/tcass/tcass-app-upload-800.jpg'
import tcassAppUploadFull from '../assets/projects/tcass/tcass-app-upload-1600.jpg'
import tcassAppExplorerThumb from '../assets/projects/tcass/tcass-app-explorer-800.jpg'
import tcassAppExplorerFull from '../assets/projects/tcass/tcass-app-explorer-1600.jpg'
import gfhTractorThumb from '../assets/work/plantation/gfh-tractor-800.jpg'
import gfhTractorFull from '../assets/work/plantation/gfh-tractor-1440.jpg'
import plantationTeamThumb from '../assets/work/plantation/plantation-team-800.jpg'
import plantationTeamFull from '../assets/work/plantation/plantation-team-1600.jpg'
import whiteCardThumb from '../assets/work/builder-clean/white-card-800.jpg'
import whiteCardFull from '../assets/work/builder-clean/white-card-1600.jpg'
import treescapeCertThumb from '../assets/projects/treescape/internship-certificate-600.jpg'
import ss724CourseThumb from '../assets/projects/treescape/ss724-level1-course-1000.jpg'
import ss724CourseFull from '../assets/projects/treescape/ss724-level1-course-1536.jpg'
import treescapeCertFull from '../assets/projects/treescape/internship-certificate-1400.jpg'
import ntsVideo from '../assets/work/nts/nts-site-framing.mp4'
import ntsVideoPoster from '../assets/work/nts/nts-site-framing-poster.jpg'
import youtubeChannelThumb from '../assets/work/youtube/youtube-channel-800.jpg'
import youtubeChannelFull from '../assets/work/youtube/youtube-channel-1338.jpg'
import raafPassThumb from '../assets/work/regina/raaf-pass-800.jpg'
import raafPassFull from '../assets/work/regina/raaf-pass-1600.jpg'
import lpcMaterialsThumb from '../assets/publications/lpc/lpc-materials-800.jpg'
import lpcMaterialsFull from '../assets/publications/lpc/lpc-materials-1600.jpg'
import websiteShowcaseFull from '../assets/projects/website/website-showcase-1600.jpg'
import plannerMidThumb from '../assets/projects/website/planner-mid-tabs-600.jpg'
import plannerMidFull from '../assets/projects/website/planner-mid-1170.jpg'
import plannerLongThumb from '../assets/projects/website/planner-long-tabs-600.jpg'
import plannerLongFull from '../assets/projects/website/planner-long-1170.jpg'

export const profile = {
  name: 'Yuan Li',
  title: 'IT · Software Engineering · Data Analytics · EA-Assessed Engineer · Site Supervision',
  subtitle:
    'Engineering, IT and data background — Master of IT (Software Engineering) coursework completed',
  location: 'Darwin, NT',
  intro:
    'My background spans engineering, IT support, Power BI and Power Apps data work, school-based publishing and finance administration, and supervising labour-hire teams in the Northern Territory. I have completed the coursework for a Master of Information Technology (Software Engineering) at Charles Darwin University, with results due in November 2026. I independently design, develop and deploy websites and software applications.',
  email: 'svip.leo@gmail.com',
  linkedin: 'https://www.linkedin.com/in/yuan-li-a982533b5/',
  // Public resume (phone number removed from the header)
  resumeUrl: `${import.meta.env.BASE_URL}resume/Yuan_Li_Resume.pdf`,
}

export const about = [
  {
    heading: 'Engineering & Operations Background',
    accent: 'orange',
    text: 'I hold a Bachelor of Engineering in Material Forming and Control Engineering, and my qualifications have been assessed by Engineers Australia. I first came to Australia on a Working Holiday visa, and since then I have gained hands-on experience across labour-hire team supervision, farm and plantation operations, construction sites and commercial cleaning, including delivering cleaning services as a subcontractor. This work has built my skills in team coordination, site management and problem-solving, and my ability to run work independently.',
  },
  {
    heading: 'Technology, Data & Business Skills',
    accent: 'teal',
    text: 'I have completed all coursework for a Master of Information Technology (Software Engineering) at Charles Darwin University, with results due in November 2026. My skills cover data analysis, Power BI reporting and visualisation, Power Apps development and software development, and I have worked on a real-world business data analytics project. I also bring experience in finance-related work, book editing and publishing, e-commerce operations, digital content production and social media channel management, and I apply technical knowledge to practical business needs.',
  },
]

// status: optional label such as 'In progress'
// image: optional screenshot path in public/, e.g. '/projects/tcass.png'
// photos: optional small square photos beside the tags (click to enlarge,
//   whole photo in the lightbox): [{ image, imageFull, alt, caption,
//   objectPosition }] — objectPosition: which part the square thumbnail shows
// showcase: optional preview at the bottom of the card: { label, note, image,
//   imageFull, alt, caption, icon }. With an image it opens the lightbox and
//   the card spans the full row; without one it shows a small placeholder.
// previews: optional main image (first) with the others stacked beside it,
//   each with a label: [{ label, image, imageFull, alt, caption, tall }]; the
//   card spans the full row.
// meta: optional organisation / place / dates under the title, one entry per line
// logo / logoAlt: optional organisation logo beside the title (click to
//   enlarge; logoFull: a larger copy for the lightbox, when one exists)
// cover: optional main visual under the points, shown whole at its own ratio:
//   { image, imageFull, alt, caption }
// media: optional screenshots (same format as Experience media below)
// certificate: optional proof document { title, image, imageFull, alt, caption,
//   issuer, issued, pdf }, shown as a small thumbnail with its details
// links: optional [{ label, url }]
export const projects = [
  {
    title: 'TCASS Manual Handling Analytics & Power Apps Application',
    accent: 'coral',
    logo: tcassLogo,
    logoFull: tcassLogoFull,
    logoAlt: 'TCASS (Territory Care & Support Services) logo',
    summary:
      'Team client project during my Master of IT for Territory Care & Support Services (TCASS), an NDIS service provider in Darwin.',
    points: [
      'My contribution: the manual-handling data analysis in Power BI and the build of the overall Power Apps application',
      'Team outcome: the solution has been put into use, making manual-handling information easier for managers and staff to access and understand',
      'Power BI report with Overview, Operations & Risk Analysis and Data Table pages, analysing task volume, difficulty and pain rates, equipment use, transfer paths, staff performance and trends',
      'Power Apps application with an Upload Data screen for submitting manual-handling data files and a Data Explorer screen for browsing and managing uploaded files',
    ],
    tags: ['Power BI', 'Power Apps', 'Data analysis', 'Client project', 'Teamwork'],
    photos: [
      {
        image: tcassTeamThumb,
        imageFull: tcassTeamFull,
        alt: 'Yuan Li with team members during the TCASS client project',
        caption: 'Project team',
        objectPosition: 'center 30%',
      },
      {
        image: tcassPresentationThumb,
        imageFull: tcassPresentationFull,
        alt: 'The project team presenting the Manual Handling report to the client at the end of the TCASS project',
        caption: 'Final client presentation',
        objectPosition: '31% center',
      },
    ],
    // Staff names (Power BI) and the student ID (Power Apps) obscured
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
      {
        image: tcassAppUploadThumb,
        imageFull: tcassAppUploadFull,
        alt: 'Upload Data screen of the TCASS Visualizer Power Apps application, with file drop area and data type choice (incident, manual handling or sleep data)',
        caption: 'Power Apps — Upload Data screen',
      },
      {
        image: tcassAppExplorerThumb,
        imageFull: tcassAppExplorerFull,
        alt: 'Data Explorer screen of the TCASS Visualizer Power Apps application, listing uploaded data files with their status',
        caption: 'Power Apps — Data Explorer screen',
      },
    ],
  },
  {
    // Facts from the internship certificate (12 Jan – 3 Apr 2026, Development
    // Content & LMS). SS 724 is the Singapore standard; the Digital Academy is
    // Treescape's own training programme, not something Yuan built.
    title: 'SS 724 Digital Training & E-Learning',
    meta: ['Treescape Power Pte Ltd · Singapore', 'Remote Internship · Jan–Apr 2026'],
    logo: treescapeLogo,
    logoFull: treescapeLogoFull,
    logoAlt: 'Treescape Power logo',
    accent: 'teal',
    summary:
      'Contributed to the development and delivery of bilingual digital training content covering all eight modules of Singapore Standard SS 724, focused on tree pruning and management.',
    points: [
      'Produced 10+ English training videos and 6 short-form videos, managing scripting, recording, editing and final delivery',
      'Developed a complete Chinese-language course version, including narrated videos and refined presentation slides',
      'Designed and implemented module-aligned online quizzes using WP Courseware',
      'Contributed to early-stage research on AI-enhanced personalised learning',
    ],
    tags: ['WP Courseware', 'WordPress', 'E-Learning', 'Video Production', 'Bilingual Localisation', 'Assessment Design'],
    // Re-made high-resolution promotional visual for the course (supplied by
    // Yuan) — not a system screenshot and not Yuan's own interface design
    cover: {
      image: ss724CourseThumb,
      imageFull: ss724CourseFull,
      alt: 'Treescape Digital Academy promotional graphic for the SS 724 Level 1: Awareness e-learning course',
      caption: 'SS 724 Level 1: Awareness — E-Learning Training',
    },
    // Issued by Treescape; shown in full with Yuan's permission
    certificate: {
      title: 'Internship Certificate',
      image: treescapeCertThumb,
      imageFull: treescapeCertFull,
      alt: 'Treescape Power Pte Ltd Internship Certificate issued to Yuan Li, 21 April 2026',
      caption: 'Internship Certificate — Treescape Power Pte Ltd, 21 April 2026',
      issuer: 'Treescape Power Pte Ltd',
      issued: 'Issued 21 April 2026',
      pdf: `${import.meta.env.BASE_URL}certificates/treescape-internship-certificate.pdf`,
    },
  },
  {
    title: 'Personal Portfolio & Planner Website',
    accent: 'purple',
    // The site's own app icon (PWA icon in public/icons)
    logo: `${import.meta.env.BASE_URL}icons/icon-512.png`,
    logoAlt: 'Yuan Li website app icon (YL)',
    summary:
      'A personal portfolio website with a private planner for managing daily, mid-term and long-term goals. Demonstrates my ability to independently design and develop websites and applications tailored to client requirements.',
    points: [
      'Responsive React portfolio with a private planner, secured by Firebase Authentication and owner-only Firestore security rules',
      'Daily, mid-term and long-term plans with drag-and-drop prioritisation, due dates and live countdowns; tasks move to the daily list automatically when due',
      'Real-time sync across devices, using Firestore transactions and a three-way merge so changes from different devices are combined safely',
      'Installable PWA with automated build and deployment to GitHub Pages via GitHub Actions',
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
    // Planner screenshots are from an isolated demo build with sample data
    // (no real plans). The mid- and long-term thumbnails show the tabs and
    // the list; tall: the lightbox shows the whole screen at phone width.
    previews: [
      {
        label: 'Portfolio Homepage + Mobile Daily Planner',
        image: websiteShowcaseFull,
        imageFull: websiteShowcaseFull,
        alt: 'Screenshots of this website: the portfolio home page on desktop and the unlocked Planner (sample data) on mobile',
        caption: 'Personal Portfolio & Planner Website — yuanli-au.github.io',
      },
      {
        label: 'Mid-term Plans',
        image: plannerMidThumb,
        imageFull: plannerMidFull,
        alt: 'Mobile screenshot of the Planner Mid-term Plans page with sample goals',
        caption: 'Planner — Mid-term Plans · sample data',
        tall: true,
      },
      {
        label: 'Long-term Plans',
        image: plannerLongThumb,
        imageFull: plannerLongFull,
        alt: 'Mobile screenshot of the Planner Long-term Plans page with sample goals',
        caption: 'Planner — Long-term Plans · sample data',
        tall: true,
      },
    ],
  },
]

// area: short label showing which part of the background this role covers
// links: optional [{ label, url }] shown under the points (opens in a new tab)
// layout: 'side' puts the role's media beside the text on desktop;
//   'side-compact': title and text in a narrow column, the media right beside it
// logo / logoAlt: organisation logo, shown in the same 56px tile for every role
//   (click to enlarge; logoFull: a larger copy for the lightbox, when one exists)
// logos: several logos side by side instead: [{ src, full, alt, fill }] — fill:
//   the image keeps its own background and fills the tile
// positions: optional, in place of points — separate roles grouped under one
//   entry, each kept with its own details: [{ title, org, location, period,
//   relations, points }] — relations: optional lines under the organisation.
//   One title shared by several employments: { title, records: [{ org,
//   location, period }], relations, points } in place of org/location/period
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
    logo: olshCrest,
    logoAlt: 'Our Lady of the Sacred Heart Thamarrurr Catholic College crest',
    location: 'Wadeye, NT · Remote since Feb 2026',
    period: 'Oct 2025 – Present (part-time)',
    area: 'Finance · Administration',
    accent: 'teal',
    points: [
      'Verify handwritten timesheets, leave records and balances, checking leave categories, overtime and back pay against the applicable rules',
      'Prepare weekly Excel summaries and enter verified timesheets into TechnologyOne CiAnywhere, with two final checks to help ensure staff are paid accurately',
      'Follow up discrepancies, and missing, inactive or incorrectly numbered staff records, with staff and the Finance Officer',
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
    points: [
      'In Darwin, led a cleaning team of 4–5 people and trained new cleaners on site routines, cleaning construction sites, some RAAF facilities and Darwin Port (including vessel interiors)',
      'Provided after-school cleaning services at the OLSH campus in Wadeye and prepared cleaning supply order lists for the school’s facilities team',
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
    ],
    media: [],
  },
  {
    role: 'LPC Assistant — Publishing & Design',
    org: 'Literature Production Centre (LPC), OLSH Thamarrurr Catholic College',
    logo: olshCrest,
    logoAlt: 'Our Lady of the Sacred Heart Thamarrurr Catholic College crest',
    location: 'Wadeye, NT',
    period: 'Jun 2024 – Feb 2026',
    area: 'Design · Publishing',
    accent: 'blue',
    featured: true,
    points: [
      'Main desktop publisher, with local Aboriginal colleagues, for 3 newly published primary-school reading books; updated and corrected nearly 20 existing titles',
      'Laid out language text and scanned children’s drawings in Adobe InDesign and Photoshop, through to print production and binding',
      'Gave colleagues day-to-day help with basic hardware, software and connectivity issues',
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
    logo: ntsLogo,
    logoAlt: 'Northern Trade Solutions logo',
    layout: 'side-compact', // desktop: narrow text column, the video right beside it
    org: 'Northern Trade Solutions',
    location: 'Berrimah Farm & Defence Accommodation Precinct, Darwin, NT',
    period: 'Late 2023 – Early 2024',
    area: 'Construction',
    accent: 'orange',
    points: [
      'Assisted with external wall framing at Berrimah Farm',
      'Assisted on a 138-room refurbishment at a Defence accommodation precinct: removing adhesive and residue, and laying ceiling acoustic insulation',
    ],
    media: [
      {
        video: ntsVideo,
        image: ntsVideoPoster,
        alt: 'Short site video of external wall framing work from an elevated work platform on a Darwin construction site',
        caption: 'External wall framing at Berrimah Farm',
      },
    ],
  },
  // One labour-hire supervisor role held with two separate employers
  {
    role: 'Farm & Plantation Operations — Katherine & Douglas Daly',
    // GFH = labour-hire employer; Quintis = GFH's host plantation client (not an employer)
    logos: [
      { src: gfhLogo, full: gfhLogoFull, alt: 'GFH Enterprises (Green Farm Hands) logo', fill: true },
      { src: quintisLogo, full: quintisLogoFull, alt: 'Quintis Sandalwood logo' },
    ],
    org: 'GFH Enterprises Pty Ltd · Big Plantation Pty Ltd',
    location: 'Northern Territory',
    period: 'Apr 2023 – Oct 2023 · Jun 2019 – Feb 2020',
    area: 'Site Supervision · Agriculture',
    accent: 'orange',
    positions: [
      {
        title: 'Labour-hire Supervisor',
        records: [
          {
            org: 'GFH Enterprises Pty Ltd',
            location: 'Katherine, NT',
            period: 'Apr 2023 – Oct 2023',
          },
          {
            org: 'Big Plantation Pty Ltd',
            location: 'Douglas Daly, NT',
            period: 'Jun 2019 – Feb 2020',
          },
        ],
        relations: ['GFH: Labour-hire employer · Quintis: Host plantation company (client)'],
        points: [
          'Supervised labour-hire teams of 6–20 workers across sandalwood plantation operations, allocating tasks according to the host farms’ work plans',
          'Coordinated daily field activities, including drip-irrigation repairs, tree pruning, weeding, vine removal, pesticide spraying, tree planting and removal of unwanted trees',
          'Performed basic vehicle maintenance, routine oil changes and replacement of faulty parts, and sourced necessary parts and supplies',
          'Managed water and rest breaks during high-temperature work, and promptly reported injuries and workplace safety hazards',
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
    layout: 'side', // desktop: text left, the screenshot right
    org: 'Self-employed',
    location: 'China',
    period: 'Jun 2022 – Sep 2022 (main activity)',
    area: 'Content · Media',
    accent: 'coral',
    points: [
      'Ran content planning, filming, editing and audience engagement end to end',
      'Reached approximately 27,000 subscribers at its peak; about 22.4K today, with no new content for about four years',
    ],
    links: [{ label: 'YouTube channel', url: 'https://www.youtube.com/@qingganrexian' }],
    media: [
      {
        image: youtubeChannelThumb,
        imageFull: youtubeChannelFull,
        alt: 'Header of the YouTube channel 情感热线 (@qingganrexian), showing the channel banner, about 22.4K subscribers and 30 videos',
        caption: 'YouTube channel home page',
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
          'Ran my own online store: compared suppliers, purchased products, fulfilled orders and handled customer communication',
          'Completed approximately 12,000 transactions in total',
        ],
      },
      {
        title: 'Tmall Store Operations',
        org: 'Hengmei Oil Painting (Tmall store)',
        location: 'China',
        period: 'Aug 2015 – Mar 2016',
        points: [
          'Ran day-to-day operations of a Tmall store selling oil paintings, including product images, customer service and order processing',
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

// Six equal cards (3 × 2 on desktop)
export const skills = [
  {
    group: 'Software & Development',
    accent: 'purple',
    items: [
      'React',
      'JavaScript',
      'HTML & CSS',
      'Firebase',
      'Python',
      'Git',
      'Power Apps',
      'WordPress',
      'AI-Assisted Development',
    ],
  },
  {
    group: 'Data & Business Intelligence',
    accent: 'teal',
    items: ['SQL', 'Relational Databases', 'Power BI', 'Data Modelling', 'DAX', 'Excel', 'VBA', 'Data Analytics'],
  },
  {
    group: 'IT & Systems',
    accent: 'blue',
    items: [
      'IT Support',
      'Hardware & Software Troubleshooting',
      'Microsoft 365',
      'TechnologyOne CiAnywhere',
      'Operating Systems',
      'Networking',
    ],
  },
  {
    group: 'Engineering & Operations',
    accent: 'orange',
    items: [
      'Site Supervision',
      'Team Coordination',
      'Workplace Safety',
      'Construction Support',
      'Parts & Supplies Sourcing',
      'Tools & Basic Vehicle Maintenance',
    ],
  },
  {
    group: 'Design & Content',
    accent: 'coral',
    items: [
      'Adobe InDesign',
      'Adobe Photoshop',
      'Desktop Publishing',
      'Print Production',
      'Video Production',
      'Content Creation',
    ],
  },
  {
    group: 'Business & E-commerce',
    accent: 'coral',
    items: [
      'E-commerce Operations',
      'Customer Service',
      'Order Fulfilment',
      'Product Listings',
      'Store Management',
      'Sourcing & Purchasing',
      'Product Imagery',
      'After-sales Support',
    ],
  },
]

export const education = [
  {
    degree: 'Master of Information Technology',
    field: 'Software Engineering',
    school: 'Charles Darwin University',
    logo: cduLogo,
    logoAlt: 'Charles Darwin University logo',
    location: 'Darwin, NT',
    period: 'Mar 2025 – Nov 2026 · Coursework completed; results pending (Nov 2026)',
    notes:
      'Key areas: software engineering, security, machine learning & AI, IT service management, project management, risk and reliability',  },
  {
    degree: 'Bachelor of Engineering',
    field: 'Material Forming and Control Engineering',
    school: 'Yantai Nanshan University',
    logo: nanshanLogo,
    logoAlt: 'Yantai Nanshan University logo',
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

export const languages = ['Mandarin — Native', 'English — PTE Academic: Overall Score 62 (2023)']

export const credentials = [
  'Full NT Class C driver licence — approx. 100,000 km driven in Australia with no traffic accidents',
  'Working With Children Clearance (Ochre Card) — valid to Apr 2028',
  'White Card (construction induction)',
  'National Police Check',
]

export const referees = 'Available upon request'
