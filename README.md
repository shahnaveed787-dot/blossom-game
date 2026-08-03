# Blossom Game — Website

A fast, modern, and playful marketing homepage for **Blossom Game**, an educational
word-puzzle game for children, students, parents, and teachers.

Built with plain **HTML + CSS + vanilla JavaScript** — no frameworks, no build step,
no runtime dependencies — so it loads instantly and scores highly on Core Web Vitals.

## Highlights

- **Performance first**: system/inline SVG graphics, one self-hosted variable font
  (single 29 KB `woff2`), deferred JS, lazy scroll-reveal, and a lightweight DOM.
- **SEO ready**: semantic HTML, a single `<h1>`, proper heading hierarchy, meta +
  Open Graph + Twitter tags, and JSON-LD structured data (Organization,
  EducationalOrganization, WebSite, VideoGame, FAQPage).
- **Accessible**: skip link, keyboard-navigable tabs, ARIA roles, visible focus,
  reduced-motion support, and touch-friendly targets.
- **Responsive**: mobile-first layout with no horizontal scrolling from ~320 px up
  to large desktops.
- **Interactive**: a real mini "petal" word-building demo, animated audience tabs,
  accessible FAQ accordion, and scroll-in animations.

## Project structure

```
blossom game/
├── index.html            # Homepage (all sections + structured data)
├── styles.css            # Mobile-first, tokenized stylesheet
├── app.js                # Menu, tabs, mini game, scroll reveal (vanilla JS)
├── site.webmanifest      # PWA metadata
├── robots.txt            # Crawl rules
├── sitemap.xml           # Sitemap
├── .htaccess             # Apache gzip/brotli + long-cache headers (Laragon)
└── assets/
    ├── favicon.svg       # Flower logo / favicon
    ├── og-image.svg      # Social share image (source)
    ├── og-image.png      # Social share image (rendered 1200×630)
    └── fonts/
        └── fredoka-latin.woff2   # Self-hosted display font
```

## Run locally

The site is fully static. With Laragon running Apache, open:

```
http://blossom-game.test/        (or your Laragon host)
```

Or serve the folder with any static server, e.g.:

```bash
npx serve .
```

## Content sections

Hero → About → How to Play → Features → Learning Benefits → Vocabulary →
Brain Training → Daily Challenge → For Children/Parents/Teachers → Who Can Play →
Tips & Strategies → FAQ → Final CTA → Footer.
