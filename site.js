// Mała logika strony: konfiguracja, zakładki widoków, lightbox galerii, menu mobilne.
(() => {
  const cfg = window.SITE || {};
  document.querySelectorAll('[data-app-link]').forEach(a => { if (cfg.appUrl) a.href = cfg.appUrl; });
  document.querySelectorAll('[data-cfg-mail]').forEach(a => { if (cfg.contactEmail) { a.href = 'mailto:' + cfg.contactEmail; if (a.textContent.includes('@')) a.textContent = cfg.contactEmail; } });
  document.querySelectorAll('[data-cfg-author]').forEach(s => { if (cfg.author) s.textContent = cfg.author; });

  // menu mobilne
  const burger = document.querySelector('.burger'), nav = document.getElementById('nav');
  burger?.addEventListener('click', () => { const open = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', String(open)); });
  nav?.addEventListener('click', e => { if (e.target.closest('a')) { nav.classList.remove('open'); burger?.setAttribute('aria-expanded', 'false'); } });

  // zakładki widoków (wzorzec ARIA tabs: strzałki, Home/End)
  const tabs = [...document.querySelectorAll('.tabs [role="tab"]')];
  const select = tab => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      let n = k != null ? (i + k + tabs.length) % tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
      if (n == null) return;
      e.preventDefault(); select(tabs[n]); tabs[n].focus();
    });
  });

  // animacja w hero: szanuje prefers-reduced-motion i ma przycisk pauzy
  const hv = document.getElementById('hero-video'), hp = document.getElementById('hero-pause');
  if (hv && hp) {
    const setPaused = p => { p ? hv.pause() : hv.play().catch(() => {}); hp.setAttribute('aria-pressed', String(p)); hp.textContent = p ? '▶ Wznów' : '❚❚ Pauza'; hp.setAttribute('aria-label', p ? 'Wznów animację' : 'Zatrzymaj animację'); };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { hv.removeAttribute('autoplay'); setPaused(true); }
    hp.addEventListener('click', () => setPaused(!hv.paused));
  }
  // film: duży przycisk Play na plakacie
  const dv = document.getElementById('demo-video'), pb = document.getElementById('play-big');
  if (dv && pb) {
    pb.addEventListener('click', () => { dv.play(); dv.focus(); });
    dv.addEventListener('play', () => { pb.hidden = true; });
    dv.addEventListener('pause', () => { if (dv.currentTime === 0 || dv.ended) pb.hidden = false; });
    dv.addEventListener('ended', () => { pb.hidden = false; });
  }

  // lightbox
  const lb = document.getElementById('lightbox'), lbImg = document.getElementById('lb-img'), lbCap = document.getElementById('lb-cap');
  const items = [...document.querySelectorAll('#gallery button[data-full]')];
  let cur = 0, opener = null;
  const show = i => {
    cur = (i + items.length) % items.length;
    const b = items[cur];
    opener = b; // po zamknięciu fokus wraca do ostatnio oglądanej miniatury
    lbImg.src = b.dataset.full;
    lbImg.alt = b.querySelector('img')?.alt || '';
    lbCap.textContent = b.dataset.cap || '';
  };
  items.forEach((b, i) => b.addEventListener('click', () => { opener = b; show(i); if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', ''); }));
  lb?.addEventListener('click', e => {
    if (e.target === lb || e.target.closest('[data-close]')) lb.close();
    else if (e.target.closest('[data-prev]')) show(cur - 1);
    else if (e.target.closest('[data-next]')) show(cur + 1);
  });
  lb?.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
  lb?.addEventListener('close', () => opener?.focus());
})();
