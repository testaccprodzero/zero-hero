/* ═══════════════════════════════════════════════════════════
   ZERO — tracking: consent banner (Consent Mode v2), GA4 / GTM / Clarity loaders,
   one track() helper, UTM + click-ID capture, and every site event.
   Keys live in site.js → SITE.analytics. Nothing loads before the visitor agrees.
   Full event list and setup steps: TRACKING.md
   ═══════════════════════════════════════════════════════════ */
(() => {
  const CFG = (window.ZERO_CONFIG && window.ZERO_CONFIG.analytics) || {};
  const LANG = (document.documentElement.lang || 'en').slice(0, 2);
  const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase().replace('.html', '') || 'index';
  const PAGE_TYPE = { index: 'home', products: 'configurator', gallery: 'inspiration', 'size-guide': 'size_guide', about: 'about', shipping: 'shipping', legal: 'legal', '404': 'not_found' }[file] || 'other';
  const HAS_TRACKERS = !!(CFG.ga4 || CFG.gtm || CFG.clarity);
  const debug = (() => { try { return /[?&]debug_track/.test(location.search) || localStorage.getItem('zeroTrackDebug') === '1'; } catch (_) { return false; } })();

  // ── consent state ──
  const CKEY = 'zeroConsent', CVER = 1;
  const readConsent = () => { try { const c = JSON.parse(localStorage.getItem(CKEY) || 'null'); return c && c.v === CVER ? c : null; } catch (_) { return null; } };
  let consent = readConsent(); // { v, analytics: bool, marketing: bool, at }

  // Google Consent Mode v2 defaults — everything denied until the visitor chooses
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', wait_for_update: 500 });
  const applyConsent = c => gtag('consent', 'update', {
    analytics_storage: c.analytics ? 'granted' : 'denied',
    ad_storage: c.marketing ? 'granted' : 'denied', ad_user_data: c.marketing ? 'granted' : 'denied', ad_personalization: c.marketing ? 'granted' : 'denied',
  });

  // ── attribution: UTMs + ad click IDs (session first; kept 90 days only with consent) ──
  const AKEY = 'zeroAttr';
  const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'li_fat_id'];
  function readAttr() {
    try { return JSON.parse(sessionStorage.getItem(AKEY) || localStorage.getItem(AKEY) || 'null') || {}; } catch (_) { return {}; }
  }
  function saveAttr(a) {
    try { sessionStorage.setItem(AKEY, JSON.stringify(a)); if (consent && consent.analytics) localStorage.setItem(AKEY, JSON.stringify(a)); } catch (_) {}
  }
  (function captureAttr() {
    const q = new URLSearchParams(location.search), a = readAttr(), now = new Date().toISOString();
    const hit = {}; KEYS.forEach(k => { if (q.get(k)) hit[k] = q.get(k).slice(0, 150); });
    const ref = document.referrer && !document.referrer.includes(location.host) ? new URL(document.referrer).hostname : '';
    const touch = Object.keys(hit).length ? { ...hit, landing: location.pathname, at: now } : ref ? { utm_source: ref, utm_medium: 'referral', landing: location.pathname, at: now } : null;
    if (!a.first) a.first = touch || { utm_source: '(direct)', utm_medium: '(none)', landing: location.pathname, at: now };
    if (touch) a.last = touch;
    if (a.first.at && Date.now() - Date.parse(a.first.at) > 90 * 864e5) { a.first = touch || a.first; }
    saveAttr(a);
  })();

  // ── loaders (only after consent) ──
  let loaded = false;
  const queue = []; // events before analytics consent — replayed once GA4 loads (same page only)
  function loadScript(src) { const s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); }
  function loadTrackers() {
    if (loaded || !consent || !consent.analytics) return;
    loaded = true;
    if (CFG.ga4) {
      loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(CFG.ga4)}`);
      gtag('js', new Date());
      gtag('config', CFG.ga4, { page_type: PAGE_TYPE, site_language: LANG, ...(debug ? { debug_mode: true } : {}) });
      queue.splice(0).forEach(([n, p]) => gtag('event', n, p));
    }
    if (CFG.gtm) { window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' }); loadScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(CFG.gtm)}`); }
    if (CFG.clarity) {
      (function (c, l, a, r, i) { c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); }; const t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i; l.head.appendChild(t); })(window, document, 'clarity', 'script', CFG.clarity);
      window.clarity('consentv2', { ad_Storage: consent.marketing ? 'granted' : 'denied', analytics_Storage: 'granted' });
    }
  }

  // ── the one helper every event goes through (never pass names, emails or phone numbers) ──
  function track(name, params = {}) {
    const p = { page_type: PAGE_TYPE, site_language: LANG, ...params };
    window.dataLayer.push({ event: name, ...p }); // for GTM (if added later)
    if (CFG.ga4) { if (loaded) gtag('event', name, p); else queue.push([name, p]); }
    if (debug) console.log('%c[track]', 'color:#e1141f;font-weight:bold', name, p);
  }
  const once = new Set();
  const trackOnce = (key, name, params) => { if (!once.has(key)) { once.add(key); track(name, params); } };

  // ── consent banner ──
  const T = {
    en: { title: 'Cookies & privacy', text: 'We use analytics to see which pages help clubs find their kit, and — only if you agree — marketing cookies to measure our ads. Your choice, change it any time.',
      accept: 'Accept all', reject: 'Only necessary', settings: 'Settings', save: 'Save choice', necessary: 'Necessary', necessaryD: 'Language, My Kit, shortlist — always on.',
      analytics: 'Analytics', analyticsD: 'Google Analytics, Microsoft Clarity — how the site is used.', marketing: 'Marketing', marketingD: 'Ad measurement (Google, Meta) — which ads bring requests.', policy: 'Privacy policy' },
    de: { title: 'Cookies & Datenschutz', text: 'Wir nutzen Analyse, um zu sehen, welche Seiten Vereinen bei der Trikotwahl helfen, und — nur mit eurer Zustimmung — Marketing-Cookies zur Messung unserer Anzeigen. Ihr könnt das jederzeit ändern.',
      accept: 'Alle akzeptieren', reject: 'Nur notwendige', settings: 'Einstellungen', save: 'Auswahl speichern', necessary: 'Notwendig', necessaryD: 'Sprache, Mein Kit, Merkliste — immer aktiv.',
      analytics: 'Analyse', analyticsD: 'Google Analytics, Microsoft Clarity — wie die Seite genutzt wird.', marketing: 'Marketing', marketingD: 'Anzeigenmessung (Google, Meta) — welche Anzeigen Anfragen bringen.', policy: 'Datenschutzerklärung' },
    bs: { title: 'Kolačići i privatnost', text: 'Koristimo analitiku da vidimo koje stranice pomažu klubovima da pronađu dres, a — samo uz vašu saglasnost — marketinške kolačiće za mjerenje oglasa. Izbor možete promijeniti bilo kada.',
      accept: 'Prihvati sve', reject: 'Samo neophodni', settings: 'Postavke', save: 'Sačuvaj izbor', necessary: 'Neophodni', necessaryD: 'Jezik, moj komplet, lista — uvijek uključeni.',
      analytics: 'Analitika', analyticsD: 'Google Analytics, Microsoft Clarity — kako se stranica koristi.', marketing: 'Marketing', marketingD: 'Mjerenje oglasa (Google, Meta) — koji oglasi donose upite.', policy: 'Politika privatnosti' },
  }[LANG] || null;
  const t = T || {};
  const bannerOn = HAS_TRACKERS || CFG.consentPreview;

  function buildBanner() {
    if (document.getElementById('cb')) return;
    document.head.insertAdjacentHTML('beforeend', `<style id="cb-css">
      .cb { position: fixed; left: 50%; bottom: 16px; z-index: 300; width: min(720px, calc(100vw - 24px)); translate: -50% 140%; transition: translate .5s cubic-bezier(.2,.8,.2,1); color: #fff; }
      .cb.is-in { translate: -50% 0; }
      .cb__in { padding: 20px 22px; background: #111114; border: 1px solid rgba(255,255,255,.14); border-top: 3px solid var(--red, #e1141f); box-shadow: 0 30px 70px rgba(0,0,0,.7); }
      .cb__t { font-family: "Barlow Condensed", sans-serif; font-weight: 800; font-style: italic; font-size: 22px; text-transform: uppercase; }
      .cb__p { margin-top: 6px; font-size: 14px; line-height: 1.5; color: rgba(255,255,255,.72); }
      .cb__p a { color: #fff; text-decoration: underline; text-underline-offset: 3px; }
      .cb__opts { display: none; margin-top: 12px; border-top: 1px solid rgba(255,255,255,.1); }
      .cb.is-settings .cb__opts { display: block; }
      .cb__opt { display: grid; grid-template-columns: 1fr auto; gap: 4px 14px; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,.08); }
      .cb__opt b { font-size: 14px; } .cb__opt small { grid-column: 1; font-size: 12.5px; color: rgba(255,255,255,.55); }
      .cb__opt input { grid-row: 1 / span 2; grid-column: 2; width: 20px; height: 20px; accent-color: var(--red, #e1141f); }
      .cb__btns { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
      .cb__btn { min-height: 42px; padding: 0 18px; border: 1px solid rgba(255,255,255,.3); background: transparent; color: #fff; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 15px; letter-spacing: .06em; text-transform: uppercase; cursor: pointer; }
      .cb__btn:hover { border-color: #fff; }
      .cb__btn--main { background: var(--red, #e1141f); border-color: var(--red, #e1141f); }
      .cb__btn--main:hover { filter: brightness(1.1); }
      @media (max-width: 560px) { .cb { bottom: 0; width: 100vw; } .cb__btn { flex: 1 1 40%; } }
    </style>`);
    const pol = 'legal.html#privacy'; // relative: stays in the visitor's language folder
    document.body.insertAdjacentHTML('beforeend', `
      <div class="cb" id="cb" role="dialog" aria-modal="false" aria-labelledby="cb-t" aria-describedby="cb-p">
        <div class="cb__in">
          <p class="cb__t" id="cb-t">${t.title}</p>
          <p class="cb__p" id="cb-p">${t.text} <a href="${pol}">${t.policy}</a></p>
          <div class="cb__opts">
            <label class="cb__opt"><b>${t.necessary}</b><small>${t.necessaryD}</small><input type="checkbox" checked disabled /></label>
            <label class="cb__opt"><b>${t.analytics}</b><small>${t.analyticsD}</small><input type="checkbox" id="cb-a" /></label>
            <label class="cb__opt"><b>${t.marketing}</b><small>${t.marketingD}</small><input type="checkbox" id="cb-m" /></label>
          </div>
          <div class="cb__btns">
            <button class="cb__btn cb__btn--main" type="button" data-cb="all">${t.accept}</button>
            <button class="cb__btn" type="button" data-cb="none">${t.reject}</button>
            <button class="cb__btn" type="button" data-cb="settings">${t.settings}</button>
          </div>
        </div>
      </div>`);
    const cb = document.getElementById('cb');
    cb.addEventListener('click', e => {
      const b = e.target.closest('[data-cb]'); if (!b) return;
      const k = b.dataset.cb;
      if (k === 'settings') {
        if (!cb.classList.contains('is-settings')) { cb.classList.add('is-settings'); b.textContent = t.save; b.dataset.cb = 'save'; return; }
      }
      if (k === 'all') choose(true, true);
      else if (k === 'none') choose(false, false);
      else if (k === 'save') choose(document.getElementById('cb-a').checked, document.getElementById('cb-m').checked);
    });
  }
  function openBanner(settings) {
    buildBanner();
    const cb = document.getElementById('cb');
    document.getElementById('cb-a').checked = !!(consent && consent.analytics);
    document.getElementById('cb-m').checked = !!(consent && consent.marketing);
    cb.classList.toggle('is-settings', !!settings);
    const sb = cb.querySelector('[data-cb="settings"],[data-cb="save"]');
    sb.textContent = settings ? t.save : t.settings; sb.dataset.cb = settings ? 'save' : 'settings';
    setTimeout(() => cb.classList.add('is-in'), 30); // timer, not rAF: also works in background tabs
  }
  function choose(analytics, marketing) {
    const before = consent;
    consent = { v: CVER, analytics, marketing, at: new Date().toISOString() };
    try { localStorage.setItem(CKEY, JSON.stringify(consent)); } catch (_) {}
    applyConsent(consent);
    saveAttr(readAttr());
    document.getElementById('cb').classList.remove('is-in');
    if (analytics) loadTrackers();
    // switching analytics off after it was on: the scripts are already running, so reload to stop them
    if (before && before.analytics && !analytics && loaded) location.reload();
  }
  document.addEventListener('click', e => { if (e.target.closest('[data-consent-open]')) { e.preventDefault(); openBanner(true); } });

  if (consent) { applyConsent(consent); loadTrackers(); }
  else if (bannerOn && T) setTimeout(() => openBanner(false), 900);

  // ══════════ EVENTS ══════════
  // page_view comes from the GA4 config above and carries page_type + site_language

  const where = el => el.closest('.contact__list, .contact') ? 'contact' : el.closest('.mmenu') ? 'menu' : el.closest('.footer') ? 'footer'
    : el.closest('.nav, header.nav') ? 'header' : el.closest('#mk-drawer, .mk-card') ? 'my_kit' : el.closest('.nudge') ? 'custom_nudge' : (el.closest('section[id]') || {}).id || 'page';
  const label = el => (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);

  // key events: call · email · WhatsApp · downloads (any link, anywhere — including ones added later)
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]'); if (!a) return;
    const href = a.getAttribute('href');
    if (href.startsWith('tel:')) track('click_to_call', { link_location: where(a) });
    else if (href.startsWith('mailto:')) track('click_email', { link_location: where(a) });
    else if (/wa\.me|whatsapp\.com/.test(href)) track('click_whatsapp', { link_location: where(a) });
    else if (a.hasAttribute('download')) {
      const name = a.getAttribute('download') || href.split('/').pop();
      track('file_download', { file_name: name.slice(0, 80), file_type: /size/i.test(name) ? 'size_list' : (name.split('.').pop() || 'file') });
    }
  }, true);

  // main buttons
  document.addEventListener('click', e => {
    const b = e.target.closest('.btn, .mk-fab, .mk-add'); if (!b || b.type === 'submit') return;
    track('cta_click', { cta_text: label(b), cta_location: where(b) });
  });

  // language switch
  document.addEventListener('click', e => { const a = e.target.closest('.lang a[hreflang]'); if (a && a.getAttribute('hreflang') !== LANG) track('site_language_change', { language: a.getAttribute('hreflang') }); });

  // My Kit = the quote cart (kit.js announces each part it saves)
  window.addEventListener('zerokit:add', e => track('add_to_quote', { kit_part: e.detail.part, item_name: (e.detail.name || '').slice(0, 100), kit_parts_filled: e.detail.filled }));

  // kit line on the home page: viewing a partner kit
  const km = document.getElementById('kitmodal');
  if (km) new MutationObserver(() => {
    if (!km.open) return;
    const name = (document.getElementById('km-title') || {}).textContent || '';
    track('view_item', { item_list_name: 'kit_line', items: [{ item_id: 'line_' + name.toLowerCase().replace(/\W+/g, '_').slice(0, 40), item_name: name, item_category: ((km.querySelector('.km__sport') || {}).textContent || '').split('·')[0].trim() }] });
  }).observe(km, { attributes: true, attributeFilter: ['open'] });

  // inspiration gallery: list view, opening an idea, colour edits, the custom-design nudge
  if (PAGE_TYPE === 'inspiration') {
    track('view_item_list', { item_list_name: 'inspiration' });
    const lb = document.getElementById('lb');
    if (lb) new MutationObserver(() => {
      if (!lb.open) return;
      const name = (document.getElementById('lb-title') || {}).textContent || '';
      const kick = ((document.getElementById('lb-kicker') || {}).textContent || '').split('·');
      track('view_item', { item_list_name: 'inspiration', items: [{ item_id: name.toLowerCase().replace(/\W+/g, '_').slice(0, 40), item_name: name, item_category: (kick[0] || '').trim(), item_variant: (kick[1] || '').trim() }] });
    }).observe(lb, { attributes: true, attributeFilter: ['open'] });
    document.addEventListener('click', e => {
      if (e.target.closest('#lb-colours button, #lb-colours input, #lb-swap')) trackOnce('colour_edit_' + ((document.getElementById('lb-title') || {}).textContent || ''), 'configurator_start', { configurator_type: 'colour', item_list_name: 'inspiration' });
      if (e.target.closest('#lb-save') && !(document.getElementById('lb-revert') || {}).disabled) track('configurator_complete', { configurator_type: 'colour' });
      if (e.target.closest('[data-heart]')) track('add_to_wishlist', { item_list_name: 'inspiration' });
      if (e.target.closest('#surprise')) track('surprise_me');
    }, true); // capture: the gallery redraws these buttons on click, so read them before it does
    const nudge = document.getElementById('nudge');
    if (nudge) new MutationObserver(() => { if (nudge.classList.contains('is-in')) trackOnce('nudge', 'custom_nudge_view', {}); }).observe(nudge, { attributes: true, attributeFilter: ['class'] });
  }

  // options builder (products page)
  if (PAGE_TYPE === 'configurator') document.addEventListener('click', e => {
    const o = e.target.closest('.opt'); if (o) trackOnce('cfg', 'configurator_start', { configurator_type: 'options', first_option: `${o.dataset.cat}:${o.dataset.opt}` });
  });

  // size guide: finder + planner use
  if (PAGE_TYPE === 'size_guide') document.addEventListener('click', e => {
    if (e.target.closest('#planner button')) trackOnce('planner', 'configurator_start', { configurator_type: 'sizes' });
  });

  // quote form: started · validation errors (generate_lead is sent by lead.js on a successful send)
  const qf = document.getElementById('quote-form');
  if (qf) {
    qf.addEventListener('focusin', () => trackOnce('qfs', 'quote_form_start', { form_id: 'quote', kit_parts_filled: kitFilled() }));
    let errBatch = null;
    qf.addEventListener('invalid', e => {
      (errBatch = errBatch || new Set()).add(e.target.name || e.target.id); // a Set: browsers fire "invalid" twice per field (check + report)
      clearTimeout(qf._errT); qf._errT = setTimeout(() => { track('form_error', { form_id: 'quote', field_name: [...errBatch].join(',').slice(0, 100), error_type: 'required' }); errBatch = null; }, 50);
    }, true);
  }
  function kitFilled() { try { const k = JSON.parse(localStorage.getItem('zeroKit') || '{}'); return ['design', 'options', 'sizes'].filter(p => k[p]).length; } catch (_) { return 0; } }

  window.ZeroTrack = { track, attribution: readAttr, consent: () => consent, openConsent: () => openBanner(true), pageType: PAGE_TYPE, debug: on => { try { localStorage.setItem('zeroTrackDebug', on === false ? '0' : '1'); } catch (_) {} } };
})();
