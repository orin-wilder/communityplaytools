/* ============================================================
   Community Play Tools — shared site JS
   - Injects shared nav/footer partials (data-include)
   - Sticky-nav shadow, mobile menu toggle, active link
   - Scroll-reveal (IntersectionObserver)
   - Animated stat counters
   Works when served over http(s). For local preview run a
   static server (e.g. `python -m http.server` or `netlify dev`).
   ============================================================ */
(function () {
  'use strict';

  // ---- HTML partial includes -------------------------------
  function loadIncludes() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-include]'));
    return Promise.all(nodes.map(function (el) {
      var url = el.getAttribute('data-include');
      return fetch(url)
        .then(function (r) { return r.ok ? r.text() : ''; })
        .then(function (html) { if (html) el.outerHTML = html; })
        .catch(function () { /* leave placeholder empty if offline/file:// */ });
    }));
  }

  // ---- Navigation ------------------------------------------
  function initNav() {
    var nav = document.querySelector('.site-nav');
    if (!nav) return;

    var onScroll = function () {
      nav.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var toggle = nav.querySelector('.nav-toggle');
    var menu = nav.querySelector('.nav-links');
    var closeMenu = function (returnFocus) {
      document.body.classList.remove('nav-open');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
        if (returnFocus) toggle.focus();
      }
    };
    if (toggle) {
      toggle.addEventListener('click', function () {
        document.body.classList.toggle('nav-open');
        var open = document.body.classList.contains('nav-open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      });
      nav.querySelectorAll('.nav-links a').forEach(function (a) {
        a.addEventListener('click', function () { closeMenu(false); });
      });
      document.addEventListener('click', function (event) {
        if (document.body.classList.contains('nav-open') && !nav.contains(event.target)) {
          closeMenu(false);
        }
      });
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && document.body.classList.contains('nav-open')) {
          closeMenu(true);
          return;
        }
        if (event.key !== 'Tab' || !document.body.classList.contains('nav-open') || !menu) return;
        var focusable = Array.prototype.slice.call(menu.querySelectorAll('a[href]'));
        focusable.push(toggle);
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });
      window.addEventListener('resize', function () {
        if (window.innerWidth > 900) closeMenu(false);
      });
    }

    // Active link based on current page
    var pathParts = location.pathname.replace(/\/+$/, '').split('/');
    var here = pathParts.pop() || 'index';
    here = here.replace(/\.html$/, '');
    if (here === 'tools') here = 'builds';
    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      var hrefUrl = new URL(a.getAttribute('href') || '', location.href);
      var hrefParts = hrefUrl.pathname.replace(/\/+$/, '').split('/');
      var href = (hrefParts.pop() || 'index').replace(/\.html$/, '');
      if (href === here) a.classList.add('active');
    });
  }

  // ---- Scroll reveal ---------------------------------------
  function initReveal() {
    var els = document.querySelectorAll('.reveal, [data-reveal-stagger]');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        // stagger children
        if (el.hasAttribute('data-reveal-stagger')) {
          Array.prototype.forEach.call(el.children, function (child, i) {
            child.style.transitionDelay = (i * 90) + 'ms';
          });
        }
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  // ---- Animated counters -----------------------------------
  function initCounters() {
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var run = function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      if (reduce) { el.textContent = prefix + target.toFixed(decimals) + suffix; return; }
      var dur = 1400, start = performance.now();
      var tick = function (now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { io.observe(el); });
  }

  // ---- Boot ------------------------------------------------
  function boot() {
    loadIncludes().then(function () {
      initNav();
      initReveal();
      initCounters();
      document.dispatchEvent(new CustomEvent('cpt:ready'));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
