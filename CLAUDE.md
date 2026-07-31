# CLAUDE.md — CPT Website

Community Play Tools' public site. `README.md` is the source of truth (structure, local preview, deploy) — read it before editing.

Quick facts: plain HTML/CSS/JS, no framework. Shared nav/footer injected at runtime from `partials/` via fetch, so the site must be served over HTTP (`python -m http.server 8000` or `netlify dev`) — never test by opening files directly. Design system lives in `assets/css/styles.css` ("Civic Play"). Deployed on Netlify; contact form is a Netlify form. Repo: `orin-wilder/communityplaytools`.

Rules: keep new pages consistent with the design system and the partials pattern; interactive tool pages (`cmapp.html`, `meeting-stone.html`, etc.) are self-contained apps — don't refactor them into the shared system without asking. This folder moved here from `2026-job-search/` in July 2026; it doubles as portfolio material for the job search.
