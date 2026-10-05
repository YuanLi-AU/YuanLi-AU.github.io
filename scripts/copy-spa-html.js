// Runs after `vite build`.
//
// GitHub Pages is a static file host: refreshing /planner asks the server for
// a "planner" file, which doesn't exist. To make deep links work we copy the
// built index.html to:
//   - <route>.html  GitHub Pages serves /planner from planner.html (HTTP 200)
//   - 404.html      fallback for any other path; React Router shows NotFound
//
// Uses only Node built-ins so it works on macOS, Windows and GitHub Actions.

import { copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

// Keep in sync with the top-level routes in src/App.jsx.
const ROUTES = ['planner']

const distDir = join(import.meta.dirname, '..', 'dist')
const indexHtml = join(distDir, 'index.html')

if (!existsSync(indexHtml)) {
  console.error('dist/index.html not found — did `vite build` succeed?')
  process.exit(1)
}

for (const name of [...ROUTES, '404']) {
  copyFileSync(indexHtml, join(distDir, `${name}.html`))
  console.log(`Copied index.html -> dist/${name}.html`)
}
