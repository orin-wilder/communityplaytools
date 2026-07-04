/* ============================================================
   The St. Pete Overlay — a clickable, hand-drawn map of the
   places Community Play Tools has shipped in, is watching, or
   plain loves. Vanilla JS + inline SVG, no libraries.

   Usage: <div data-stpete-overlay></div>
          <script src="assets/js/stpete-overlay.js" defer></script>

   The geography is deliberately simplified (a diagram of the
   city, not a survey of it) — but every place is real, every
   claim is checkable, and the whole thing is view-source-able.
   ============================================================ */
(function () {
  'use strict';

  var mount = document.querySelector('[data-stpete-overlay]');
  if (!mount) return;

  // ---- The places ------------------------------------------
  // status: shipped (coral) | pilot (ember) | idea/watching (pine) | rising (mint)
  var PLACES = [
    {
      id: 'williams-park',
      name: 'Williams Park',
      x: 742, y: 342, label: { x: 722, y: 351, anchor: 'end' },
      status: { type: 'shipped', text: 'CPT shipped here' },
      body: [
        'Downtown’s original town square, mid-renovation, right next to the library and the Sunday market.',
        'CPT built the St. Petersburg Downtown Partnership’s engagement suite for this park: a 30-second sentiment check-in and a live activity counter, so the redesign decisions ride on data the community actually enjoyed giving.'
      ],
      links: [
        { href: 'williams-park.html', label: 'Try the counter' },
        { href: 'did-sentiment.html', label: 'Take the check-in' }
      ]
    },
    {
      id: 'north-shore',
      name: 'North Shore Park',
      x: 783, y: 202, label: { x: 767, y: 196, anchor: 'end' },
      status: { type: 'pilot', text: 'Signal Fire territory' },
      body: [
        'The bay-front strip of courts, pools, and picnic shelters where a dozen pickup games happen every week that nobody outside them ever hears about.',
        'This is the exact problem Signal Fire’s totems exist for. The beach court here is the model for its founding boards: scan, see what’s on, walk in welcome.'
      ],
      links: [{ href: 'signal-fire.html', label: 'How Signal Fire works' }]
    },
    {
      id: 'straub-pier',
      name: 'Straub Park & the Pier',
      x: 796, y: 316, label: { x: 780, y: 303, anchor: 'end' },
      status: { type: 'idea', text: 'A sketch, free to steal' },
      body: [
        'The postcard shot: green lawn, waterfront, the Pier District behind it. Packed on a Saturday, nearly empty on a Tuesday morning.',
        'The gap between those two states is a discovery problem, not a demand problem, which is exactly the kind of signal a place-based board is built to carry.'
      ],
      links: [{ href: 'idea-mashup.html#place=straub-pier&mechanic=totem', label: 'Remix this idea' }]
    },
    {
      id: 'edge-district',
      name: 'The EDGE District',
      x: 655, y: 362, label: { x: 655, y: 388, anchor: 'middle' },
      status: { type: 'idea', text: 'A sketch, free to steal' },
      body: [
        'Central Ave’s arts-and-nightlife stretch (murals, small venues), busy at 9pm and dead at 9am. A neighborhood living in one time zone.',
        'A host-follow network fits here: follow the venue and the organizer, not the algorithm, and find out what the district is like in its other twelve hours.'
      ],
      links: [{ href: 'idea-mashup.html#place=edge-district&mechanic=followhost', label: 'Remix this idea' }]
    },
    {
      id: 'grand-central',
      name: 'Grand Central District',
      x: 490, y: 362, label: { x: 490, y: 388, anchor: 'middle' },
      status: { type: 'idea', text: 'A sketch, free to steal' },
      body: [
        'The walkable stretch of Central west of downtown: vintage shops and restaurants with a strong small-business identity and no shared civic voice yet.',
        'The same quiz mechanic CPT built for a local gelato counter points naturally at a whole district of storefronts, and “which shop should I wander into?” is a solvable problem.'
      ],
      links: [{ href: 'idea-mashup.html#place=grand-central&mechanic=quiz', label: 'Remix this idea' }]
    },
    {
      id: 'deuces',
      name: 'The Deuces (22nd St S)',
      x: 560, y: 468, label: { x: 560, y: 494, anchor: 'middle' },
      status: { type: 'idea', text: 'Listening first' },
      body: [
        'St. Pete’s historic Black business corridor, rebuilding its identity block by block, where the history is a living asset, not a plaque.',
        'Any tool here has to put the corridor’s own voices first. Merit-style check-ins that reward showing up for it could help, but only curated by the people who keep its story.'
      ],
      links: [{ href: 'idea-mashup.html#place=deuces&mechanic=merit', label: 'Remix this idea' }]
    },
    {
      id: 'gas-plant',
      name: 'Historic Gas Plant District',
      x: 692, y: 418, label: { x: 692, y: 444, anchor: 'middle' },
      status: { type: 'watching', text: 'Following closely' },
      body: [
        'Ground zero for the biggest redevelopment decision St. Pete will make this decade: a former Black neighborhood, a stadium deal, and a lot of residents who want a real say in what gets built.',
        'CPT has been following it closely. It’s the civic-engagement test case of the next five years, and the strongest argument in town for tools that widen who gets heard.'
      ],
      links: [{ href: 'idea-mashup.html#place=gas-plant&mechanic=checkin', label: 'Remix this idea' }]
    },
    {
      id: 'science-center',
      name: 'The Science Center site',
      x: 150, y: 180, label: { x: 150, y: 214, anchor: 'middle' },
      status: { type: 'rising', text: 'Rising now' },
      body: [
        'The reimagined St. Petersburg Science Center on 22nd Ave N: 50,000 square feet aimed at AI learning, with the AI Center of Excellence, the AI Village, and the Cityverse Hybritorium under one roof.',
        'Not a CPT project (yet). But it might be the most important civic-tech address in the city by the time it opens, and it’s the pin the rest of this map keeps glancing at.'
      ],
      links: [{ href: 'https://sciencecenter.ai', label: 'sciencecenter.ai', external: true }]
    }
  ];

  // ---- The map (a diagram, not a survey) -------------------
  function svgMarkup() {
    var pins = PLACES.map(function (p) {
      return (
        '<g class="ovl-pin ovl-pin--' + p.status.type + '" data-place="' + p.id + '" tabindex="0" role="button" ' +
          'aria-label="' + p.name + ', ' + p.status.text + '" aria-pressed="false">' +
          '<circle class="hit" cx="' + p.x + '" cy="' + p.y + '" r="26"></circle>' +
          '<circle class="halo" cx="' + p.x + '" cy="' + p.y + '" r="14"></circle>' +
          '<circle class="dot" cx="' + p.x + '" cy="' + p.y + '" r="6.5"></circle>' +
          '<text class="lbl" x="' + p.label.x + '" y="' + p.label.y + '" text-anchor="' + p.label.anchor + '">' + p.name + '</text>' +
        '</g>'
      );
    }).join('');

    return (
      '<svg viewBox="0 0 1000 620" role="img" aria-label="A simplified map of St. Petersburg, Florida with pins on eight real places" xmlns="http://www.w3.org/2000/svg">' +
        // Tampa Bay
        '<path class="water" d="M795,0 C780,60 758,102 775,140 C790,174 800,182 800,222 L800,300 C800,318 798,332 792,352 C786,392 778,420 742,466 C700,520 668,556 658,620 L1000,620 L1000,0 Z"></path>' +
        '<text class="water-lbl" x="905" y="240" transform="rotate(90 905,240)">T A M P A&#160;&#160;B A Y</text>' +
        // The Pier
        '<line class="pier" x1="798" y1="325" x2="868" y2="321"></line>' +
        '<circle class="pier-tip" cx="872" cy="321" r="5"></circle>' +
        // street grid
        '<line class="st" x1="60"  y1="360" x2="788" y2="360"></line>' + // Central Ave
        '<line class="st" x1="60"  y1="180" x2="770" y2="180"></line>' + // 22nd Ave N
        '<line class="st" x1="730" y1="40"  x2="730" y2="500"></line>' + // 4th St
        '<line class="st" x1="620" y1="80"  x2="620" y2="540"></line>' + // 16th St
        '<line class="st" x1="460" y1="40"  x2="460" y2="580"></line>' + // 34th St
        '<line class="st" x1="350" y1="60"  x2="350" y2="560"></line>' + // 49th St
        '<line class="st" x1="200" y1="60"  x2="200" y2="560"></line>' + // 66th St
        '<line class="st st-strong" x1="560" y1="375" x2="560" y2="540"></line>' + // 22nd St S
        '<path class="hwy" d="M545,0 C560,80 622,142 660,200 C690,248 686,300 680,330 C674,382 640,420 620,470 C604,506 600,560 598,620"></path>' +
        '<text class="st-lbl" x="86" y="351">Central Ave</text>' +
        '<text class="st-lbl" x="86" y="171">22nd Ave N</text>' +
        '<text class="st-lbl" x="572" y="46">I-275</text>' +
        // compass
        '<g class="compass" aria-hidden="true"><circle cx="62" cy="62" r="17"></circle><text x="62" y="68" text-anchor="middle">N</text><line x1="62" y1="41" x2="62" y2="49"></line></g>' +
        pins +
      '</svg>'
    );
  }

  // ---- Render ----------------------------------------------
  mount.className = 'ovl';
  mount.innerHTML =
    '<div class="ovl-map">' + svgMarkup() +
      '<p class="ovl-fine">A diagram, not a survey (Tampa Bay is considerably wetter in person). Hand-drawn SVG, vanilla JS, zero libraries. View source; that’s the point.</p>' +
    '</div>' +
    '<aside class="ovl-side" aria-live="polite"></aside>' +
    '<div class="ovl-chips" role="group" aria-label="Pick a place"></div>';

  var side = mount.querySelector('.ovl-side');
  var chipRow = mount.querySelector('.ovl-chips');
  var svg = mount.querySelector('svg');

  PLACES.forEach(function (p) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip-btn';
    b.textContent = p.name;
    b.setAttribute('data-place', p.id);
    b.setAttribute('aria-pressed', 'false');
    chipRow.appendChild(b);
  });

  function renderCard(p) {
    var links = p.links.map(function (l) {
      return '<a class="text-link" href="' + l.href + '"' + (l.external ? ' target="_blank" rel="noopener"' : '') + '>' +
        l.label + ' <span class="arrow" aria-hidden="true">→</span></a>';
    }).join('');
    side.innerHTML =
      '<div class="ovl-card ovl-card--' + p.status.type + '">' +
        '<span class="ovl-status">' + p.status.text + '</span>' +
        '<h3>' + p.name + '</h3>' +
        p.body.map(function (t) { return '<p>' + t + '</p>'; }).join('') +
        '<div class="ovl-links">' + links + '</div>' +
      '</div>';
  }

  function select(id) {
    var place = null;
    PLACES.forEach(function (p) { if (p.id === id) place = p; });
    if (!place) return;
    svg.querySelectorAll('.ovl-pin').forEach(function (g) {
      var on = g.getAttribute('data-place') === id;
      g.classList.toggle('sel', on);
      g.setAttribute('aria-pressed', String(on));
    });
    chipRow.querySelectorAll('.chip-btn').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-place') === id));
    });
    renderCard(place);
  }

  svg.addEventListener('click', function (e) {
    var g = e.target.closest ? e.target.closest('.ovl-pin') : null;
    if (g) select(g.getAttribute('data-place'));
  });
  svg.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var g = e.target.closest ? e.target.closest('.ovl-pin') : null;
    if (g) { e.preventDefault(); select(g.getAttribute('data-place')); }
  });
  chipRow.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.chip-btn') : null;
    if (b) select(b.getAttribute('data-place'));
  });

  // Deep link (#spot=deuces), else start where we shipped.
  var m = location.hash.match(/spot=([a-z-]+)/);
  select(m && PLACES.some(function (p) { return p.id === m[1]; }) ? m[1] : 'williams-park');
})();
