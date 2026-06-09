# HoneyVectors — marketing site (Vite + React)

Production-ready Vite build of the HoneyVectors redesign, converted from the
design-system UI-kit export so it can run on **Lovable** (via GitHub) or anywhere.

## Run locally
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Structure
```
index.html              Vite entry
src/main.jsx            mounts <Site/> (page composition + asset paths)
src/site-kit.jsx        all components in one module (anim + nav + hero +
                        manifesto→1·2·3 + diagnosis + proof + footer)
src/styles.css          design-system entry (tokens/* + components.css)
src/site.css            marketing-site layout + scroll animations
src/tokens/*.css        colors, fonts (Barlow Condensed / Outfit / JetBrains Mono),
                        typography, spacing, effects (hex clip-paths, glows, easings)
public/assets/          images, video, logos, brand marks, textures
```

## Notes
- JSX uses the classic transform with `React` auto-injected per file
  (see `vite.config.js`). Components are shared via `window` — kept from the
  original global build, which is why they live in one concatenated module.
- Fonts load from the Google Fonts CDN (see `src/tokens/fonts.css`).

## Deploy to Lovable
1. Push this folder to a GitHub repo.
2. In your Lovable project → connect / import the GitHub repo.
3. Lovable installs deps and runs the Vite app.
