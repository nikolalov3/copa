/* COPPA · app.js · progresywne ulepszenia, cała treść żyje w HTML */
(() => {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 0. Zdjęcia: łagodne pojawienie po załadowaniu */
  $$('img[data-fade]').forEach(img => {
    const on = () => img.classList.add('ld');
    if (img.complete && img.naturalWidth) on(); else { img.addEventListener('load', on, { once: true }); img.addEventListener('error', on, { once: true }); }
  });

  /* 1. Galerie poziome (tiramisu, jesień, kanapki): scroll-snap + licznik + pasek + strzałki + drag myszą + paralaksa.
     Na telefonie (do 759 px): galeria jesienna lustrzana (data-rev), tiramisu i jesień w nieskończonej pętli (data-loop).
     Na komputerze: zwykłe galerie od lewej, z początkiem i końcem. */
  const mqMob = matchMedia('(max-width: 759px)');
  const initGallery = root => {
    const track = root.querySelector('.gal-track');
    if (!track) return;
    const originals = [...track.querySelectorAll('.slide')];
    const n = originals.length;
    let slides = originals, imgs = slides.map(s => s.querySelector('img'));
    const idxEl = root.querySelector('.gal-idx'), totEl = root.querySelector('.gal-total'), fill = root.querySelector('.gal-fill');
    const prev  = root.querySelector('.gal-prev'), next = root.querySelector('.gal-next');
    const pad2  = k => String(k).padStart(2, '0');
    const wantsLoop = root.hasAttribute('data-loop') && n > 1;
    let loop = false, active = -1;
    if (totEl) totEl.textContent = pad2(n);

    const isRev   = () => root.hasAttribute('data-rev') && mqMob.matches;
    const sg      = () => (isRev() ? -1 : 1);
    const pos     = () => Math.abs(track.scrollLeft);
    const setPos  = x => { track.scrollLeft = sg() * x; };
    const padLeft = () => parseFloat(getComputedStyle(track)[isRev() ? 'paddingRight' : 'paddingLeft']) || 0;
    const edge    = s => (isRev() ? track.clientWidth - s.offsetLeft - s.offsetWidth : s.offsetLeft);
    const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);
    const step    = () => (slides[1] ? Math.abs(edge(slides[1]) - edge(slides[0])) : slides[0].offsetWidth);
    const setW    = () => edge(slides[n]) - edge(slides[0]);
    const endX    = () => Math.min(maxScroll(), edge(slides[slides.length - 1]) - padLeft());
    const current = () => {
      const sl = pos();
      if (!loop && sl >= endX() - 1) return slides.length - 1;
      const x = sl + padLeft();
      let best = 0, bd = Infinity;
      slides.forEach((s, i) => { const d = Math.abs(edge(s) - x); if (d < bd) { bd = d; best = i; } });
      return best;
    };
    const render = () => {
      if (loop) {
        const i = current() % n;
        if (i !== active) { active = i; if (idxEl) idxEl.textContent = pad2(i + 1); }
        if (fill) fill.style.transform = `scaleX(${(i + 1) / n})`;
        prev?.removeAttribute('disabled'); next?.removeAttribute('disabled');
        return;
      }
      const mx = endX(), sl = pos();
      root.classList.toggle('no-scroll', mx <= 4);
      const i = mx <= 4 ? 0 : current();
      if (i !== active) { active = i; if (idxEl) idxEl.textContent = pad2(i + 1); }
      if (fill) fill.style.transform = `scaleX(${mx > 4 ? Math.min(1, sl / mx) : 1})`;
      prev && prev.toggleAttribute('disabled', sl <= 1);
      next && next.toggleAttribute('disabled', sl >= mx - 1);
    };
    const scrollToX = x => track.scrollTo({ left: sg() * Math.max(0, Math.min(maxScroll(), x)), behavior: reduce ? 'auto' : 'smooth' });
    const goTo = i => scrollToX(edge(slides[Math.max(0, Math.min(slides.length - 1, i))]) - padLeft());
    const by   = dir => scrollToX(pos() + dir * step());
    const parallax = () => {
      if (reduce) return;
      const tr = track.getBoundingClientRect();
      slides.forEach((s, i) => {
        if (!imgs[i]) return;
        const r = s.getBoundingClientRect();
        const d = Math.max(-1, Math.min(1, (r.left + r.width / 2 - tr.left - tr.width / 2) / tr.width));
        imgs[i].style.transform = `translateX(${(-d * 5).toFixed(2)}%) scale(1.06)`;
      });
    };

    /* pętla: kopie zestawu przed i za oryginałem (te same pliki z cache), ukryte przed czytnikami i klawiaturą */
    const cloneSet = () => {
      const fr = document.createDocumentFragment();
      originals.forEach(s => {
        const c = s.cloneNode(true);
        c.setAttribute('aria-hidden', 'true'); c.inert = true; c.dataset.clone = '1';
        c.querySelectorAll('img').forEach(im => {
          im.classList.remove('ld');
          const on = () => im.classList.add('ld');
          if (im.complete && im.naturalWidth) on(); else { im.addEventListener('load', on, { once: true }); im.addEventListener('error', on, { once: true }); }
        });
        fr.appendChild(c);
      });
      return fr;
    };
    const toMiddle = i => setPos(edge(slides[n + (((i % n) + n) % n)]) - padLeft());
    const applyMode = () => {
      const keep = ((loop ? current() : current()) % n + n) % n;
      const shouldLoop = wantsLoop && mqMob.matches;
      if (shouldLoop && !loop) {
        track.insertBefore(cloneSet(), originals[0]); track.appendChild(cloneSet());
        slides = [...track.querySelectorAll('.slide')]; loop = true;
      } else if (!shouldLoop && loop) {
        track.querySelectorAll('.slide[data-clone]').forEach(c => c.remove());
        slides = originals; loop = false;
      }
      imgs = slides.map(s => s.querySelector('img'));
      active = -1;
      if (loop) toMiddle(keep); else setPos(0);
      render(); parallax();
    };

    let raf = 0, idle = 0, touching = false, down = false;
    const recenter = () => {
      if (!loop || touching || down) return;
      const i = current();
      if (i < n) setPos(pos() + setW());
      else if (i >= 2 * n) setPos(pos() - setW());
    };
    const settle = () => { clearTimeout(idle); idle = setTimeout(recenter, 180); };
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { render(); parallax(); });
      if (loop) settle();
    }, { passive: true });
    if (wantsLoop) {
      if ('onscrollend' in window) track.addEventListener('scrollend', recenter);
      track.addEventListener('touchstart', () => { touching = true; clearTimeout(idle); }, { passive: true });
      track.addEventListener('touchend', () => { touching = false; settle(); }, { passive: true });
      track.addEventListener('touchcancel', () => { touching = false; settle(); }, { passive: true });
    }
    prev?.addEventListener('click', () => by(-1));
    next?.addEventListener('click', () => by(1));
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); by(sg()); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); by(-sg()); }
    });
    let sx = 0, sl0 = 0, moved = false;
    track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl0 = pos(); track.classList.add('dragging'); });
    window.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; track.scrollLeft = sg() * Math.max(0, sl0 - sg() * dx); });
    window.addEventListener('pointerup', () => { if (!down) return; down = false; track.classList.remove('dragging'); if (moved) goTo(current()); if (loop) settle(); });
    track.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } }, true);

    applyMode();
    addEventListener('resize', () => { if (loop) toMiddle(current()); render(); parallax(); }, { passive: true });
    mqMob.addEventListener?.('change', applyMode);
  };
  $$('[data-gallery]').forEach(initGallery);

  /* 1b. Nagłówek: główne zdjęcie + jedno losowe z alt2-alt5, zmiana co 5 s.
     Ostatnio pokazane alternatywne jest pamiętane w przeglądarce i pomijane w losowaniu,
     więc przy kolejnej wizycie prawie zawsze pojawia się inne. */
  const heroFig = $('.hero-fig[data-alts]');
  if (heroFig) {
    let alts = [];
    try { alts = JSON.parse(heroFig.dataset.alts); } catch (_) {}
    if (alts.length) {
      let last = null;
      try { last = localStorage.getItem('coppaHeroAlt'); } catch (_) {}
      const pool = alts.filter(a => a.src !== last);
      const from = pool.length ? pool : alts;
      const pick = from[Math.floor(Math.random() * from.length)];
      try { localStorage.setItem('coppaHeroAlt', pick.src); } catch (_) {}
      const main = heroFig.querySelector('img');
      let alt = null, ready = null, on = false, timer = 0;
      const build = () => {
        alt = new Image();
        alt.className = 'hero-alt'; alt.alt = pick.alt; alt.decoding = 'async';
        if ('fetchPriority' in alt) alt.fetchPriority = 'low';
        alt.sizes = main?.getAttribute('sizes') || '100vw';
        alt.srcset = `${pick.src}-640.webp 640w, ${pick.src}-1080.webp 1080w`;
        alt.src = `${pick.src}-640.webp`;
        heroFig.appendChild(alt);
        ready = (alt.decode ? alt.decode() : Promise.resolve()).catch(() => {});
      };
      const tick = () => {
        clearTimeout(timer);
        timer = setTimeout(async () => {
          await ready;
          if (!document.hidden) { on = !on; alt.classList.toggle('on', on); }
          tick();
        }, 5000);
      };
      /* drugie zdjęcie pobiera się dopiero po załadowaniu strony, żeby nie spowalniać głównego */
      const startHero = () => { build(); tick(); };
      if (document.readyState === 'complete') startHero(); else addEventListener('load', startHero, { once: true });
      heroFig.addEventListener('mouseenter', () => clearTimeout(timer));
      heroFig.addEventListener('mouseleave', () => { if (alt) tick(); });
      document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(timer); else if (alt) tick(); });
    }
  }

  /* 2. „Otwarte do …” w strefie Europe/Warsaw + dzisiejszy wiersz w tabeli godzin */
  const HOURS = { 0: [9.5, 18], 1: [8, 19], 2: [8, 19], 3: [8, 19], 4: [8, 19], 5: [8, 19], 6: [9.5, 18] };
  const EN = document.documentElement.lang.startsWith('en');
  const T = EN ? { open: 'Open until', opens: 'Opens at', tomorrow: 'Tomorrow from', copied: 'Copied', copy: 'Copy password' } : { open: 'Otwarte do', opens: 'Otwieramy o', tomorrow: 'Jutro od', copied: 'Skopiowane', copy: 'Kopiuj hasło' };
  const openText = $('#openText');
  if (openText) {
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Warsaw', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
      const get = t => parts.find(p => p.type === t)?.value;
      const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(get('weekday'));
      const h = (parseInt(get('hour'), 10) % 24) + parseInt(get('minute'), 10) / 60;
      const fmt = t => `${Math.floor(t)}:${String(Math.round((t % 1) * 60)).padStart(2, '0')}`;
      const [o, c] = HOURS[day];
      let txt, open = false;
      if (h >= o && h < c) { open = true; txt = `${T.open} ${fmt(c)}`; }
      else if (h < o)      { txt = `${T.opens} ${fmt(o)}`; }
      else                 { txt = `${T.tomorrow} ${fmt(HOURS[(day + 1) % 7][0])}`; }
      openText.textContent = txt;
      $('#openPill')?.classList.toggle('is-open', open);
      const rows = $$('.hours tr'); const map = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };
      rows[map[day]]?.classList.add('today');
    } catch (_) {}
  }

  /* 3. WiFi: kopiowanie hasła */
  const pass = $('#wifiPass'), copy = $('#wifiCopy');
  if (pass && copy) {
    if (!pass.dataset.pass) copy.hidden = true;
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(pass.dataset.pass); copy.textContent = T.copied; setTimeout(() => (copy.textContent = T.copy), 1600); } catch (_) {}
    });
  }

  /* 4. Reveal */
  const rv = $$('.rv');
  if (rv.length && 'IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    rv.forEach(el => io.observe(el));
  } else rv.forEach(el => el.classList.add('in'));

  /* 5. Pasek górny + dok */
  const topbar = $('.topbar'), dock = $('#dock');
  const onScroll = () => topbar?.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  /* dok pokazuje się już po lekkim przewinięciu (ok. 120 px), nie dopiero po zjechaniu z całego nagłówka */
  if (dock) {
    const dockToggle = () => dock.classList.toggle('show', scrollY > 120);
    addEventListener('scroll', dockToggle, { passive: true }); dockToggle();
  }
  const dockLinks = $$('#dock a');
  if (dockLinks.length && 'IntersectionObserver' in window) {
    const secIO = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; dockLinks.forEach(a => a.setAttribute('aria-current', a.dataset.sec === e.target.id ? 'true' : 'false')); }), { rootMargin: '-40% 0px -50% 0px' });
    dockLinks.map(a => a.dataset.sec).forEach(id => { const el = document.getElementById(id); el && secIO.observe(el); });
  }
})();
