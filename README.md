# Community Play Tools

The website for **Community Play Tools (CPT)** — a civic-tech studio in St. Petersburg, FL. We help cities, nonprofits, and developers turn complex community work into measurable progress, and make taking part feel like *play, not homework*.

Built with plain HTML, CSS, and JavaScript — no framework — with one shared design system and a tiny include for the nav/footer.

## Structure

```
index.html         Home
work.html          Engagement case studies
tools.html         Civic-tech tools showcase
signal-fire.html   Signal Fire — flagship product deep-dive
approach.html      Philosophy, how we work, who we serve
about.html         The firm, Ryan Stock, team, testimonials
contact.html       Request-a-proposal form (Netlify) + FAQ
success.html       Form confirmation
404.html           Not-found page
links.html         Linktree-style share page
assets/css/        styles.css — the "Civic Play" design system
assets/js/         main.js — includes, nav, scroll reveal, counters
partials/          nav.html, footer.html (shared, injected via JS)
```

Interactive tool pages (`cmapp.html`, `meeting-stone.html`, `ga-host.html`, etc.) are self-contained apps and are linked from the Tools page.

## Local preview

The shared nav/footer are injected at runtime via `fetch`, so the site must be served over HTTP (not opened from the filesystem):

```bash
python -m http.server 8000
# then open http://localhost:8000
```

Or with the Netlify CLI: `netlify dev`.

## Deploy

Static site — publish the repository root. The contact form uses Netlify Forms (`data-netlify`), so it works automatically on Netlify with no extra configuration.

## Design system

- **Type:** Fraunces (display) + Inter (body)
- **Color:** warm paper + ink base, deep pine as the civic primary, coral as the energetic "play" accent
- **Motion:** scroll-reveal and animated counters, with `prefers-reduced-motion` support

The Signal Fire page wears its own *Civic Beacon* ember accent, scoped to that page.
