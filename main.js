/* Vedang Pandey · main.js
   Plain JavaScript. Lenis only enhances the page: navigation, project cards,
   the contact form and the footer clock all work without it. */

(function () {
  'use strict';

  /* ================================================================ Utils */

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const html = document.documentElement;
  const mqMobile = window.matchMedia('(max-width: 900px)');
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function navHeight() {
    const nav = $('.nav');
    return nav ? nav.getBoundingClientRect().height : 64;
  }

  /* Scroll velocity, used by the footer mark. */
  const Velocity = (function () {
    let v = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();
    window.addEventListener('scroll', () => {
      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) v = lerp(v, ((window.scrollY - lastY) / dt) * 1000, 0.3);
      lastY = window.scrollY;
      lastT = now;
    }, { passive: true });
    return {
      get() {
        const idle = performance.now() - lastT;
        return idle > 80 ? v * Math.exp(-(idle - 80) / 140) : v;
      },
    };
  })();

  /* =============================================================== Loader */

  function initLoader() {
    const loader = $('[data-loader]');
    if (!loader) return;
    if (mqReduce.matches || !html.classList.contains('is-loading')) {
      loader.remove();
      html.classList.remove('is-loading');
      return;
    }
    const count = $('.loader__count', loader);
    const start = performance.now();
    const duration = 1350;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      loader.classList.add('is-done');
      html.classList.remove('is-loading');
      setTimeout(() => loader.remove(), 900);
    };

    const step = (now) => {
      const t = clamp((now - start) / duration, 0, 1);
      if (count) count.textContent = String(Math.round(t * 100)).padStart(3, '0');
      if (t < 1) requestAnimationFrame(step);
      else finish();
    };
    requestAnimationFrame(step);
    setTimeout(finish, 4000);
  }

  /* ================================================================== Nav */

  function initNav() {
    const nav = $('.nav');
    const toggle = $('.nav__toggle');
    const panel = $('.nav__panel');
    if (!nav || !toggle || !panel) return;

    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? toggle.dataset.labelClose : toggle.dataset.labelOpen;
      html.classList.toggle('menu-open', open);
    };
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    $$('a', panel).forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });
    mqMobile.addEventListener('change', (e) => { if (!e.matches) setOpen(false); });
  }

  /* ================================================================= Theme */

  function initTheme() {
    const toggle = $('[data-theme-toggle]');
    if (!toggle) return;
    const meta = $('meta[name="theme-color"]');

    const apply = (dark, persist) => {
      if (dark) html.setAttribute('data-theme', 'dark');
      else html.removeAttribute('data-theme');
      toggle.setAttribute('aria-pressed', String(dark));
      toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      toggle.textContent = dark ? 'Light' : 'Dark';
      if (meta) meta.setAttribute('content', dark ? '#0E0E0E' : '#EFEBE3');
      if (persist) {
        try { localStorage.setItem('vp-theme', dark ? 'dark' : 'light'); } catch (e) {}
      }
    };

    apply(html.getAttribute('data-theme') === 'dark', false);
    toggle.addEventListener('click', () => {
      apply(html.getAttribute('data-theme') !== 'dark', true);
    });
  }

  /* ========================================================= Smooth scroll */

  let lenis = null;

  function initSmoothScroll() {
    if (!mqReduce.matches && typeof window.Lenis === 'function') {
      lenis = new window.Lenis({ duration: 1.05, smoothWheel: true });
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const top = id === '#top'
        ? 0
        : target.getBoundingClientRect().top + window.scrollY - navHeight() + 1;
      if (lenis) lenis.scrollTo(top);
      else window.scrollTo({ top, behavior: mqReduce.matches ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', id);
    });
  }

  /* ================================================================= Hero */

  function initHero() {
    const hero = $('.hero');
    const wm = $('.wm', hero);
    if (!hero || !wm) return;
    const lineEls = $$('.wm__line', wm);
    const allLetters = $$('.wm__l', wm);
    const readout = $('.hero__readout', hero);
    const marker = $('.hero__marker', hero);
    const ruler = $('.hero__ruler', hero);
    const title = $('.hero__title', hero);
    html.classList.add('hero-js');

    const WGHTS = [100, 200, 400, 600, 800, 1000];
    const WDTHS = [25, 40, 60, 80, 100, 125, 151];
    const LO = { wght: 150, wdth: 25 };
    const HI = { wght: 1000, wdth: 151 };
    const REST = 600;
    const FILL = 0.998;
    const CAP = 0.719;

    const fvs = (a) => `"wght" ${a.wght.toFixed(1)}, "wdth" ${a.wdth.toFixed(2)}, "opsz" 144`;
    const axesAt = (s, restW) => {
      if (s <= 0.5) {
        const u = s / 0.5;
        return { wght: lerp(LO.wght, REST, u), wdth: lerp(LO.wdth, restW, u) };
      }
      const u = (s - 0.5) / 0.5;
      return { wght: lerp(REST, HI.wght, u), wdth: lerp(restW, HI.wdth, u) };
    };
    const cell = (arr, v) => {
      let i = 0;
      while (i < arr.length - 2 && v > arr[i + 1]) i++;
      return i;
    };
    const advance = (grid, wght, wdth) => {
      const i = cell(WGHTS, wght);
      const j = cell(WDTHS, wdth);
      const u = clamp((wght - WGHTS[i]) / (WGHTS[i + 1] - WGHTS[i]), 0, 1);
      const v = clamp((wdth - WDTHS[j]) / (WDTHS[j + 1] - WDTHS[j]), 0, 1);
      const n = WDTHS.length;
      return lerp(
        lerp(grid[i * n + j], grid[i * n + j + 1], v),
        lerp(grid[(i + 1) * n + j], grid[(i + 1) * n + j + 1], v),
        u,
      );
    };

    let table = null;
    let lines = [];
    let mode = 'none';
    let raf = 0;
    let started = false;
    let intro = false;
    let introStart = 0;
    let scrolled = false;
    let visible = true;

    const measure = () => {
      const chars = Array.from(new Set(allLetters.map((l) => l.textContent)));
      const box = document.createElement('div');
      box.setAttribute('aria-hidden', 'true');
      box.style.cssText = 'position:absolute;left:-9999px;top:0;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none;white-space:pre;font-family:var(--f-display);font-size:200px;line-height:1;';
      const spans = [];
      chars.forEach((ch) => {
        WGHTS.forEach((wg) => {
          WDTHS.forEach((wd) => {
            const sp = document.createElement('span');
            sp.textContent = ch;
            sp.style.cssText = `display:block;width:max-content;font-variation-settings:"wght" ${wg}, "wdth" ${wd}, "opsz" 144`;
            box.appendChild(sp);
            spans.push(sp);
          });
        });
      });
      document.body.appendChild(box);
      const grid = {};
      let k = 0;
      chars.forEach((ch) => {
        const g = new Float64Array(WGHTS.length * WDTHS.length);
        for (let p = 0; p < g.length; p++) g[p] = spans[k++].getBoundingClientRect().width / 200;
        grid[ch] = g;
      });
      box.remove();
      return grid;
    };

    const widthAxisRenders = () => {
      const s = document.createElement('span');
      s.textContent = 'HHHH';
      s.style.cssText = 'position:absolute;left:-9999px;font-family:var(--f-display);font-size:100px;font-variation-settings:"wght" 600, "wdth" 25;';
      document.body.appendChild(s);
      const a = s.getBoundingClientRect().width;
      s.style.fontVariationSettings = '"wght" 600, "wdth" 151';
      const b = s.getBoundingClientRect().width;
      s.remove();
      return b > a * 1.35;
    };

    const restEm = (letters, wdth) => letters.reduce((sum, l) => sum + advance(l.grid, REST, wdth), 0);

    const clearLetters = () => {
      wm.classList.remove('is-live', 'is-static');
      wm.style.fontSize = '';
      wm.style.height = '';
      lineEls.forEach((l) => {
        l.style.fontSize = '';
        l.style.height = '';
        l.style.position = '';
      });
      allLetters.forEach((l) => {
        l.style.fontVariationSettings = '';
        l.style.transform = '';
      });
      if (title) title.style.height = '';
    };

    const build = () => {
      if (!table) return;
      mode = 'live';
      clearLetters();
      const mobile = mqMobile.matches;
      wm.classList.add('is-live');
      const groups = mobile ? lineEls.map((l) => $$('.wm__l', l)) : [allLetters];

      lines = groups.map((els, index) => {
        const host = mobile ? lineEls[index] : wm;
        const letters = els.map((el) => ({
          el, ch: el.textContent, grid: table[el.textContent],
          e: 0, target: 0, cx: 0, shownF: '', shownX: NaN,
        }));
        const W = Math.max(1, host.getBoundingClientRect().width);
        let fontSize = (W * FILL) / restEm(letters, LO.wdth);
        fontSize = Math.min(fontSize, ((mobile ? 0.24 : 0.45) * window.innerHeight) / CAP);
        const target = (W * FILL) / fontSize;
        let lo = LO.wdth;
        let hi = HI.wdth;
        if (restEm(letters, hi) <= target) lo = hi;
        else {
          for (let k = 0; k < 24; k++) {
            const mid = (lo + hi) / 2;
            if (restEm(letters, mid) > target) hi = mid;
            else lo = mid;
          }
        }
        return { host, letters, W, fontSize, restW: lo };
      });

      lines.forEach((L, i) => {
        L.host.style.fontSize = L.fontSize + 'px';
        if (mobile) lineEls[i].style.height = L.fontSize * 0.74 + 'px';
      });
      const h = mobile
        ? lines.reduce((sum, L) => sum + L.fontSize * 0.74, 0)
        : lines[0].fontSize * 0.74;
      wm.style.height = h + 'px';
      if (title) title.style.height = h + 'px';
      layout();
    };

    const layout = () => {
      lines.forEach((L) => {
        const target = (L.W * FILL) / L.fontSize;
        const total = (offset) => {
          let sum = 0;
          for (let i = 0; i < L.letters.length; i++) {
            const a = axesAt(clamp(offset + L.letters[i].e * 0.5, 0, 1), L.restW);
            sum += advance(L.letters[i].grid, a.wght, a.wdth);
          }
          return sum;
        };
        let lo = -0.5;
        let hi = 1.5;
        for (let k = 0; k < 22; k++) {
          const mid = (lo + hi) / 2;
          if (total(mid) > target) hi = mid;
          else lo = mid;
        }
        let x = 0;
        L.letters.forEach((l) => {
          const a = axesAt(clamp(lo + l.e * 0.5, 0, 1), L.restW);
          const w = advance(l.grid, a.wght, a.wdth) * L.fontSize;
          const f = fvs(a);
          if (f !== l.shownF) { l.el.style.fontVariationSettings = f; l.shownF = f; }
          const px = Math.round(x * 4) / 4;
          if (px !== l.shownX) { l.el.style.transform = `translate3d(${px}px,0,0)`; l.shownX = px; }
          l.cx = x + w / 2;
          x += w;
        });
      });
      updateReadout();
    };

    const updateReadout = () => {
      if (!readout || !lines.length) return;
      let best = null;
      lines.forEach((L) => L.letters.forEach((l) => {
        if (!best || l.e > best.e) best = l;
      }));
      if (best && best.e > 0.28 && best.ch.trim()) {
        const a = axesAt(clamp(0.5 + best.e * 0.5, 0, 1), lines[0].restW);
        readout.textContent = `${best.ch.toUpperCase()} wght ${Math.round(a.wght)} wdth ${Math.round(a.wdth)}`;
      } else {
        readout.textContent = `wght 600 wdth ${Math.round(lines[0] ? lines[0].restW : 25)}`;
      }
    };

    const clearTargets = () => {
      lines.forEach((L) => L.letters.forEach((l) => { l.target = 0; }));
    };

    const run = () => { if (!raf) raf = requestAnimationFrame(tick); };

    const tick = () => {
      raf = 0;
      if (intro) {
        const t = clamp((performance.now() - introStart) / 1100, 0, 1);
        lines.forEach((L) => {
          const n = Math.max(1, L.letters.length - 1);
          L.letters.forEach((l, i) => {
            const phase = i / n;
            l.target = 2 * Math.exp(-Math.pow((phase - t) * 3.4, 2)) - 1;
          });
        });
        if (t >= 1) { intro = false; clearTargets(); }
      }
      let max = 0;
      lines.forEach((L) => L.letters.forEach((l) => {
        const d = l.target - l.e;
        l.e = clamp(l.e + d * 0.22, -1, 1);
        if (Math.abs(d) > max) max = Math.abs(d);
      }));
      layout();
      if (max > 0.002 || intro) raf = requestAnimationFrame(tick);
    };

    const setTargetsFromPointer = (px, py) => {
      const rect = wm.getBoundingClientRect();
      const R = Math.max(90, Math.min(rect.width * 0.24, 380));
      lines.forEach((L) => {
        const hostRect = mqMobile.matches ? L.host.getBoundingClientRect() : rect;
        const cy = hostRect.top + hostRect.height / 2;
        L.letters.forEach((l) => {
          const cx = hostRect.left + l.cx;
          const dx = px - cx;
          const dy = (py - cy) * 0.55;
          l.target = 2 * Math.exp(-(dx * dx + dy * dy) / (R * R)) - 1;
        });
      });
    };

    const moveMarker = (x) => {
      if (!marker || !ruler) return;
      const rr = ruler.getBoundingClientRect();
      marker.style.left = clamp(x, 0, rr.width) + 'px';
      marker.classList.add('is-on');
    };

    const onMobileScroll = () => {
      if (mode !== 'live' || !mqMobile.matches) return;
      const r = hero.getBoundingClientRect();
      if (!scrolled && window.scrollY > 4) scrolled = true;
      if (!scrolled) { clearTargets(); run(); return; }
      const p = clamp(-r.top / Math.max(1, r.height), 0, 1);
      const W = wm.getBoundingClientRect().width;
      const mx = p * W;
      const R = Math.max(80, W * 0.26);
      lines.forEach((L) => L.letters.forEach((l) => {
        const d = l.cx - mx;
        l.target = 2 * Math.exp(-(d * d) / (R * R)) - 1;
      }));
      moveMarker(mx);
      run();
    };

    const staticFit = () => {
      mode = 'static';
      wm.classList.add('is-static', 'is-ready');
      wm.style.fontSize = '100px';
      const mobile = mqMobile.matches;
      const lineWidth = (el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return range.getBoundingClientRect().width || 1;
      };
      if (mobile) {
        lineEls.forEach((l) => {
          const size = Math.min(320, ((wm.getBoundingClientRect().width * 0.98) / lineWidth(l)) * 100);
          l.style.fontSize = size + 'px';
          l.style.display = 'block';
        });
      } else {
        const size = Math.min(320, ((wm.getBoundingClientRect().width * 0.98) / lineWidth(wm)) * 100);
        wm.style.fontSize = size + 'px';
      }
      wm.style.height = 'auto';
      if (title) title.style.height = wm.offsetHeight + 'px';
    };

    const start = () => {
      if (started) return;
      started = true;
      table = measure();
      if (!widthAxisRenders()) { staticFit(); return; }
      build();
      wm.classList.add('is-ready');
      if (!mqReduce.matches) {
        intro = true;
        introStart = performance.now();
        run();
      } else {
        layout();
      }
      if (mqMobile.matches) onMobileScroll();
    };

    hero.addEventListener('pointermove', (e) => {
      if (mode !== 'live' || mqMobile.matches || intro || mqReduce.matches) return;
      scrolled = true;
      setTargetsFromPointer(e.clientX, e.clientY);
      const rr = ruler ? ruler.getBoundingClientRect() : null;
      if (rr) moveMarker(e.clientX - rr.left);
      run();
    });

    hero.addEventListener('pointerleave', () => {
      if (mode !== 'live' || mqMobile.matches) return;
      clearTargets();
      run();
      if (marker) marker.classList.remove('is-on');
    });

    window.addEventListener('scroll', onMobileScroll, { passive: true });

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!started || mode !== 'live') return;
        build();
        if (mqMobile.matches) onMobileScroll();
      }, 180);
    });

    const io = 'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; })
      : null;
    if (io) io.observe(hero);

    const fontReady = () => {
      if (!document.fonts) return true;
      try { return document.fonts.check('600 100px "Roboto Flex"'); } catch (e) { return true; }
    };
    const waitForFont = (tries) => {
      if (started) return;
      if (fontReady() || tries > 45) { start(); return; }
      if (document.fonts && document.fonts.load) {
        document.fonts.load('600 100px "Roboto Flex"').catch(() => {});
      }
      setTimeout(() => waitForFont(tries + 1), 100);
    };
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => waitForFont(0));
    } else {
      setTimeout(start, 300);
    }
    setTimeout(start, 4000);

    window.__hero = { get mode() { return mode; }, get lines() { return lines; }, get visible() { return visible; } };
  }

  /* ============================================================ Manifesto */

  function initManifesto() {
    const body = $('[data-split]');
    if (!body) return;

    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let index = 0;
    nodes.forEach((node) => {
      const parts = node.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((part) => {
        if (!part.trim()) {
          frag.appendChild(document.createTextNode(part));
          return;
        }
        const span = document.createElement('span');
        span.className = 'mw';
        span.textContent = part;
        span.style.setProperty('--i', String(index++));
        frag.appendChild(span);
      });
      node.parentNode.replaceChild(frag, node);
    });
    body.classList.add('is-split');

    if (mqReduce.matches) { body.classList.add('is-in'); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        body.classList.add('is-in');
        io.disconnect();
      }
    }, { threshold: 0.2 });
    io.observe(body);
  }

  /* ========================================================== Experience */

  function initExperience() {
    const xp = $('[data-xp]');
    if (!xp) return;
    const fill = $('[data-xp-fill]', xp);
    const items = $$('[data-xp-item]', xp);
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = xp.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp((vh * 0.5 - rect.top) / Math.max(1, rect.height), 0, 1);
      if (fill) fill.style.transform = `scaleY(${p.toFixed(4)})`;
      let active = -1;
      items.forEach((el, i) => {
        if (el.getBoundingClientRect().top < vh * 0.58) active = i;
      });
      items.forEach((el, i) => el.classList.toggle('is-active', i === active));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* ============================================================= Contact */

  function initContact() {
    const form = $('[data-contact]');
    const status = $('[data-form-status]');
    const copy = $('[data-copy]');
    const email = 'vedangpandeyy@gmail.com';

    if (copy) {
      copy.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(email);
          copy.textContent = 'Copied';
          setTimeout(() => { copy.textContent = 'Copy email'; }, 1600);
        } catch (e) {
          if (status) status.textContent = 'Copy failed. The address is ' + email + '.';
        }
      });
    }

    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) {
        if (status) status.textContent = 'Add your name, email and a message first.';
        return;
      }
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const from = String(data.get('email') || '').trim();
      const message = String(data.get('message') || '').trim();
      const subject = `Hello from ${name}`;
      const body = `${message}\n\n— ${name}\n${from}`;
      if (status) status.textContent = 'Opening your mail app…';
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setTimeout(() => {
        if (status) status.textContent = 'If nothing opened, email me directly at ' + email + '.';
      }, 1400);
    });
  }

  /* ========================================================= Footer mark */

  function initFooterMark() {
    const mark = $('.footer__mark');
    if (!mark || mqReduce.matches) return;
    let visible = false;
    let raf = 0;
    let current = 118;
    let last = performance.now();

    const frame = (now) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      const speed = Math.abs(Velocity.get());
      const target = 118 + clamp(speed / 2200, 0, 1) * 33;
      current += (target - current) * (1 - Math.exp(-dt * (target > current ? 10 : 3)));
      mark.style.setProperty('--vp-w', current.toFixed(1));
      if (visible && (Math.abs(target - current) > 0.05 || speed > 2)) {
        raf = requestAnimationFrame(frame);
      }
    };
    const kick = () => {
      if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        kick();
      });
      io.observe(mark);
    } else {
      visible = true;
    }
    window.addEventListener('scroll', kick, { passive: true });
  }

  /* ================================================================ Clock */

  function initClock() {
    const el = $('[data-clock]');
    if (!el) return;
    let fmt;
    try {
      fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false,
      });
    } catch (e) {
      fmt = null;
    }
    const tick = () => {
      const now = new Date();
      el.textContent = (fmt ? fmt.format(now) : now.toTimeString().slice(0, 5)) + ' IST';
    };
    tick();
    setInterval(tick, 30000);
  }

  /* ================================================================= Boot */

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLoader();
    initNav();
    initHero();
    initManifesto();
    initExperience();
    initContact();
    initFooterMark();
    initClock();
  });

  window.addEventListener('load', () => {
    initSmoothScroll();
  });
})();
