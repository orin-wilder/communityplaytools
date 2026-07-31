# Ryan Stock · Community Play Tools

Ryan Stock’s candidate-first professional portfolio, with Community Play Tools retained as a secondary consulting practice.

The site uses plain HTML, CSS, and JavaScript. Shared navigation and footer partials remain the authoring source, then a small build step inlines them into the deployable HTML so crawlers, social tools, keyboard users, and readers receive complete markup immediately.

## Primary routes

```text
/                 Candidate-first homepage
/leadership       Canonical leadership portfolio for job applications
/work             Enterprise, civic, and product case studies
/builds           Shipped products and honestly labeled prototypes
/about            Ryan’s integrated career story and credentials
/contact          Hiring and secondary consulting paths
/signal-fire      Signal Fire product case study
/resume           Canonical public résumé PDF
```

Legacy `/tools` and `/approach` URLs redirect to their current destinations.

## Source structure

```text
assets/css/        Civic Play design system
assets/js/         Shared behavior and self-contained tool support
assets/images/     Public site and product imagery
assets/resume/     Public DOCX and PDF résumé artifacts
partials/          Shared navigation and footer authoring partials
scripts/           Local build, audit, résumé, and social-image utilities
_reference/        Internal planning and source notes, never published
```

Specialized prototypes remain self-contained. Their `noindex` metadata controls search discovery, not access or privacy. The legacy poll administrator is excluded from the public build and blocked by Netlify redirects.

## Build and local preview

```powershell
python scripts/build_site.py
python -m http.server 8000 --directory _site
```

Then open `http://127.0.0.1:8000/`.

The generated `_site/` directory is the exact public artifact. It contains inlined shared partials and extensionless primary routes, while excluding internal notes, source scripts, administrative pages, and stale event-sales material.

## Validation

```powershell
python scripts/audit_site.py
```

Browser QA should cover the six primary pages at desktop, tablet, and mobile widths, plus keyboard navigation, hover contrast, reduced motion, form markup, redirects, and the résumé download.

## Deployment

Netlify reads `netlify.toml`, runs the build, and publishes `_site/`. The contact form uses Netlify Forms and must remain present in the built `contact/index.html`.

No external analytics service is included.

## Design system

- Fraunces display typography and Inter body typography
- Warm paper, deep pine, accessible coral, and mint
- Editorial civic authority with restrained playfulness
- Strong focus states and reduced-motion support

Community Play Tools’ product thesis remains: civic engagement should feel like play, not homework.
