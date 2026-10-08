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

  /* 1. Galeria tiramisu: scroll-snap + licznik + pasek + strzałki + drag myszą + lekka paralaksa */
  const track = $('#galTrack');
  if (track) {
    const slides = $$('.slide', track);
    const imgs   = slides.map(s => s.querySelector('img'));
    const idxEl  = $('#galIdx'), totEl = $('#galTotal'), fill = $('#galFill');
    const prev   = $('#galPrev'), next = $('#galNext');
    const pad2   = n => String(n).padStart(2, '0');
    let active = -1, target = 0;
    if (totEl) totEl.textContent = pad2(slides.length);

    const padLeft = () => parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const setArrows = i => { prev && prev.toggleAttribute('disabled', i === 0); next && next.toggleAttribute('disabled', i === slides.length - 1); };
    const setActive = i => {
      if (i === active) return;
      active = i; target = i;
      if (idxEl) idxEl.textContent = pad2(i + 1);
      if (fill) fill.style.transform = `scaleX(${(i + 1) / slides.length})`;
      setArrows(i);
    };
    const nearest = () => {
      const x = track.scrollLeft + padLeft();
      let best = 0, bd = Infinity;
      slides.forEach((s, i) => { const d = Math.abs(s.offsetLeft - x); if (d < bd) { bd = d; best = i; } });
      return best;
    };
    const go = i => {
      i = Math.max(0, Math.min(slides.length - 1, i));
      target = i; setArrows(i);
      track.scrollTo({ left: slides[i].offsetLeft - padLeft(), behavior: reduce ? 'auto' : 'smooth' });
    };
    const parallax = () => {
      if (reduce) return;
      const vw = track.clientWidth, sl = track.scrollLeft;
      slides.forEach((s, i) => {
        const c = s.offsetLeft + s.offsetWidth / 2 - sl - vw / 2;
        const d = Math.max(-1, Math.min(1, c / vw));
        imgs[i].style.transform = `translateX(${(-d * 5).toFixed(2)}%) scale(1.06)`;
      });
    };
    let raf = 0;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { setActive(nearest()); parallax(); });
    }, { passive: true });
    prev?.addEventListener('click', () => go(target - 1));
    next?.addEventListener('click', () => go(target + 1));
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(target + 1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); go(target - 1); }
    });
    let down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; track.classList.add('dragging'); });
    window.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; track.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', () => { if (!down) return; down = false; track.classList.remove('dragging'); if (moved) go(nearest()); });
    track.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } }, true);
    setActive(0); parallax();
    addEventListener('resize', parallax, { passive: true });
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
  const topbar = $('.topbar'), dock = $('#dock'), hero = $('.hero');
  const onScroll = () => topbar?.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (dock && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => dock.classList.toggle('show', !e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0.05 }).observe(hero);
  }
  const dockLinks = $$('#dock a');
  if (dockLinks.length && 'IntersectionObserver' in window) {
    const secIO = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; dockLinks.forEach(a => a.setAttribute('aria-current', a.dataset.sec === e.target.id ? 'true' : 'false')); }), { rootMargin: '-40% 0px -50% 0px' });
    dockLinks.map(a => a.dataset.sec).forEach(id => { const el = document.getElementById(id); el && secIO.observe(el); });
  }
})();
