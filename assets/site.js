/* ═══════════════════════════════════════════════════════════
   ZERO — shared behaviour for every page:
   Products dropdown, full-screen mobile menu, language switcher,
   active-page links. Edit SITE / TEXT below to change them everywhere.
   ═══════════════════════════════════════════════════════════ */
(() => {
  const ASSETS = new URL('.', document.currentScript.src).href; // works from / and from /de/, /bs/
  const LANG = (document.documentElement.lang || 'en').slice(0, 2);
  const LANGS = [['en', 'EN', 'English'], ['de', 'DE', 'Deutsch'], ['bs', 'BS', 'Bosanski']];

  const TEXT = {
    en: {
      football: 'Football', basketball: 'Basketball', handball: 'Handball', volleyball: 'Volleyball', running: 'Running', training: 'Training & Leisure',
      kits: 'Kits by sport', custom: 'Customise every detail', customSub: '38 options — collars, cuffs, fits, fabrics',
      inspo: 'Kit inspiration', size: 'Size guide', ship: 'Shipping & returns',
      home: 'Home', products: 'Products', inspiration: 'Inspiration', work: 'Our Work', about: 'About', sizeG: 'Size Guide', shipping: 'Shipping', faq: 'FAQ', contact: 'Contact',
      quote: 'Get a Team Quote', open: 'Open menu', close: 'Close menu', menu: 'Menu', language: 'Language',
      waLabel: 'WhatsApp · fastest reply', waHello: 'Hi ZERO, I have a question about a team kit.', cookies: 'Cookie settings',
    },
    de: {
      football: 'Fußball', basketball: 'Basketball', handball: 'Handball', volleyball: 'Volleyball', running: 'Laufen', training: 'Training & Freizeit',
      kits: 'Trikots nach Sportart', custom: 'Jedes Detail anpassen', customSub: '38 Optionen — Kragen, Bündchen, Schnitte, Stoffe',
      inspo: 'Trikot-Inspiration', size: 'Größentabelle', ship: 'Versand & Rückgabe',
      home: 'Start', products: 'Produkte', inspiration: 'Inspiration', work: 'Referenzen', about: 'Über uns', sizeG: 'Größen', shipping: 'Versand', faq: 'FAQ', contact: 'Kontakt',
      quote: 'Angebot anfragen', open: 'Menü öffnen', close: 'Menü schließen', menu: 'Menü', language: 'Sprache',
      waLabel: 'WhatsApp · schnellste Antwort', waHello: 'Hallo ZERO, ich habe eine Frage zu Teamtrikots.', cookies: 'Cookie-Einstellungen',
    },
    bs: {
      football: 'Fudbal', basketball: 'Košarka', handball: 'Rukomet', volleyball: 'Odbojka', running: 'Trčanje', training: 'Trening i slobodno vrijeme',
      kits: 'Dresovi po sportu', custom: 'Prilagodite svaki detalj', customSub: '38 opcija — kragne, manžete, krojevi, tkanine',
      inspo: 'Inspiracija za dres', size: 'Tabela veličina', ship: 'Dostava i povrat',
      home: 'Početna', products: 'Proizvodi', inspiration: 'Inspiracija', work: 'Naši radovi', about: 'O nama', sizeG: 'Veličine', shipping: 'Dostava', faq: 'FAQ', contact: 'Kontakt',
      quote: 'Zatražite ponudu', open: 'Otvori meni', close: 'Zatvori meni', menu: 'Meni', language: 'Jezik',
      waLabel: 'WhatsApp · najbrži odgovor', waHello: 'Zdravo ZERO, imam pitanje o dresovima za ekipu.', cookies: 'Postavke kolačića',
    },
  };
  const t = TEXT[LANG] || TEXT.en;

  const SITE = {
    sports: ['football', 'basketball', 'handball', 'volleyball', 'running', 'training'],
    menu: [
      ['index.html', 'home'], ['products.html', 'products'], ['gallery.html', 'inspiration'], ['index.html#work', 'work'],
      ['about.html', 'about'], ['size-guide.html', 'sizeG'], ['shipping.html', 'shipping'], ['index.html#faq', 'faq'], ['index.html#contact', 'contact'],
    ],
    email: 'hello@zero-teamwear.example', // placeholder
    // ── WhatsApp: international format, digits only (e.g. '38761234567'); '' hides every WhatsApp link ──
    whatsapp: '38700000000', // placeholder

    // ══════════ TRACKING & LEADS — paste keys here; empty = off (see TRACKING.md) ══════════
    analytics: {
      ga4: 'G-3PMVCYYWNY', // GA4 Measurement ID, e.g. 'G-ABC123XYZ' — loads GA4 directly (no Tag Manager needed)
      gtm: 'GTM-MX3MW64T', // Google Tag Manager ID, e.g. 'GTM-ABC1234' — for ad pixels later
      clarity: '',        // Microsoft Clarity project ID, e.g. 'abcd1234ef'
      consentPreview: true, // show the cookie banner even while no IDs are set (draft review); set false at launch if you track nothing
    },
    lead: {
      mode: 'demo',       // 'demo' (shows success, sends nothing) · 'hubspot' (free HubSpot form) · 'webhook' (Make / n8n / Formspree)
      hubspotPortalId: '', // HubSpot → Settings → Account defaults (Hub ID)
      hubspotFormId: '',   // HubSpot → Marketing → Forms → your form → share/embed code (formId)
      hubspotGdpr: true,   // send the "consent to process" checkbox to HubSpot
      webhookUrl: '',      // e.g. https://hook.eu1.make.com/… or https://formspree.io/f/…
      value: 100,          // estimated value of one lead (EUR) — refine later (avg order value × close rate)
      currency: 'EUR',
    },
  };
  window.ZERO_CONFIG = SITE; // read by track.js / lead.js

  const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const onHome = file === '' || file === 'index.html';
  // ── WhatsApp (one number for the whole site, greeting in the page language) ──
  const waIcon = '<svg class="wa-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5A9.4 9.4 0 0 0 3.9 16.6L2.6 21.4l4.9-1.3A9.4 9.4 0 1 0 12 2.5Zm0 17.1a7.8 7.8 0 0 1-4-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A7.8 7.8 0 1 1 12 19.6Zm4.3-5.8c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.4 6.4 0 0 1-3.2-2.8c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.7-1.7c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7.5-.1 1.4-.6 1.6-1.2.2-.6.2-1 .1-1.2l-.4-.3Z"/></svg>';
  const waHref = () => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(t.waHello)}`;
  const waPretty = () => '+' + SITE.whatsapp.replace(/^(\d{3})(\d{2})(\d{3})(\d+)$/, '$1 $2 $3 $4');
  const arrow = '<svg class="arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 10h13M11 4.5 16.5 10 11 15.5"/></svg>';

  // ── language switcher links (root = English, /de/ and /bs/ folders) ──
  const langHref = code => {
    const here = LANG === 'en' ? '' : '../';
    return here + (code === 'en' ? '' : code + '/') + (file || 'index.html') + location.hash;
  };
  const switcher = cls => `<div class="${cls}" role="group" aria-label="${t.language}">${LANGS.map(([code, short, name]) =>
    `<a href="${langHref(code)}" hreflang="${code}" lang="${code}" title="${name}"${code === LANG ? ' aria-current="true"' : ''}>${short}</a>`).join('')}</div>`;
  document.querySelectorAll('.nav__right').forEach(r => r.insertAdjacentHTML('afterbegin', switcher('lang')));

  // ── Products dropdown ──
  document.querySelectorAll('.dd').forEach(dd => {
    const panel = document.createElement('div');
    panel.className = 'dd__panel';
    panel.innerHTML =
      `<p class="dd__label">${t.kits}</p>` +
      SITE.sports.map((id, i) => `<a class="dd__sport" href="index.html#sport-${id}"><small>0${i + 1}</small>${t[id]}</a>`).join('') +
      `<a class="dd__feature" href="products.html"><span><b>${t.custom}</b><span>${t.customSub}</span></span>${arrow}</a>` +
      `<p class="dd__minor"><a href="gallery.html">${t.inspo}</a><a href="size-guide.html">${t.size}</a><a href="shipping.html">${t.ship}</a></p>`;
    dd.append(panel);
    dd.addEventListener('keydown', e => { if (e.key === 'Escape') document.activeElement.blur(); });
  });

  // ── Mobile menu ──
  const menu = document.createElement('div');
  menu.className = 'mmenu'; menu.id = 'mmenu';
  menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-modal', 'true'); menu.setAttribute('aria-label', t.menu);
  menu.innerHTML = `
    <div class="mmenu__bg"></div><div class="mmenu__slash" aria-hidden="true"></div>
    <div class="mmenu__inner">
      <div class="mmenu__top">
        <a href="index.html" aria-label="ZERO"><img src="${ASSETS}zero-logo.png" alt="ZERO" /></a>
        <button class="mmenu__close" type="button" aria-label="${t.close}"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l10 10M15 5 5 15"/></svg></button>
      </div>
      <nav aria-label="${t.menu}"><ol class="mmenu__links">${SITE.menu.map(([href, key], i) =>
        `<li><a href="${href}" style="--i:${i}"><small>0${i + 1}</small>${t[key]}</a></li>`).join('')}</ol></nav>
      <div class="mmenu__sports">${SITE.sports.map(id => `<a href="index.html#sport-${id}">${t[id]}</a>`).join('')}</div>
      <div class="mmenu__foot">
        <a class="btn btn--primary" href="index.html#contact">${t.quote} ${arrow}</a>
        ${switcher('lang lang--menu')}
        <small>${SITE.email}</small>
        ${SITE.whatsapp ? `<a class="mmenu__wa" href="${waHref()}" target="_blank" rel="noopener">${waIcon} WhatsApp</a>` : ''}
      </div>
    </div>`;
  document.body.append(menu);

  let lastFocus = null;
  const openers = document.querySelectorAll('.menu-btn');
  function setOpen(open) {
    menu.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('menu-open', open);
    openers.forEach(b => b.setAttribute('aria-expanded', open));
    if (open) { lastFocus = document.activeElement; setTimeout(() => menu.querySelector('.mmenu__close').focus(), 50); }
    else if (lastFocus) lastFocus.focus();
  }
  openers.forEach(b => {
    b.setAttribute('aria-controls', 'mmenu'); b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-label', t.open);
    b.addEventListener('click', () => setOpen(true));
  });
  menu.querySelector('.mmenu__close').addEventListener('click', () => setOpen(false));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', e => {
    if (!menu.classList.contains('is-open')) return;
    if (e.key === 'Escape') setOpen(false);
    if (e.key === 'Tab') { // keep focus inside the menu
      const f = [...menu.querySelectorAll('a, button')];
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  addEventListener('resize', () => { if (innerWidth > 900 && menu.classList.contains('is-open')) setOpen(false); });

  // ── arriving with #section in the URL: jump there reliably (smooth-scroll can swallow it) ──
  if (location.hash.length > 1) {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) addEventListener('load', () => target.scrollIntoView({ behavior: 'instant' }));
  }

  // ── links: same-page anchors on the homepage, and "you are here" marks ──
  document.querySelectorAll('a[href]').forEach(a => {
    if (a.closest('.lang')) return;
    const href = a.getAttribute('href');
    if (onHome && href.startsWith('index.html#')) a.setAttribute('href', href.slice('index.html'.length));
    if (onHome && href === 'index.html') a.setAttribute('href', '#top');
    const path = href.split('#')[0].toLowerCase();
    if (path && path === file && !href.includes('#') && !a.closest('.mmenu__top, .nav__logo, .footer__brand')) a.setAttribute('aria-current', 'page');
  });

  // ── WhatsApp: contact section + footer socials ──
  if (SITE.whatsapp) {
    document.querySelectorAll('.contact__list').forEach(ul => {
      const ref = ul.querySelector('a[href^="tel:"]');
      const li = document.createElement('li');
      li.innerHTML = `<a href="${waHref()}" target="_blank" rel="noopener"><span class="contact__icon" aria-hidden="true">${waIcon}</span><span><small>${t.waLabel}</small><b>${waPretty()}</b></span></a>`;
      if (ref) ref.closest('li').after(li); else ul.append(li);
    });
    document.querySelectorAll('.footer .socials').forEach(s => s.insertAdjacentHTML('beforeend', `<a href="${waHref()}" target="_blank" rel="noopener" aria-label="WhatsApp">${waIcon}</a>`));
  }
  document.head.insertAdjacentHTML('beforeend', '<style>.wa-ico{width:20px;height:20px}.contact__icon .wa-ico{width:22px;height:22px}.mmenu__wa{display:inline-flex;align-items:center;gap:8px;margin-top:6px;color:#fff;font-weight:600}.mmenu__wa .wa-ico{color:#25d366}.footer__cookies{background:none;border:0;padding:0;color:inherit;font:inherit;cursor:pointer}.footer__cookies:hover{color:#fff}</style>');
  // "Cookie settings" in the footer legal links (opens the consent banner from track.js)
  document.querySelectorAll('.footer__bottom nav').forEach(n => n.insertAdjacentHTML('beforeend', `<button type="button" class="footer__cookies" data-consent-open>${t.cookies}</button>`));

  // ── tracking (consent banner, GA4, Clarity, events) and the quote-form sender ──
  const trackJs = document.createElement('script'); trackJs.src = ASSETS + 'track.js?v=4'; document.body.appendChild(trackJs);
  if (document.getElementById('quote-form')) { const leadJs = document.createElement('script'); leadJs.src = ASSETS + 'lead.js?v=1'; document.body.appendChild(leadJs); }

  // ── My Kit: one shared draft order across design, options and sizes (assets/kit.js) ──
  // bump v= after editing kit.js so browsers fetch the new copy
  const kitJs = document.createElement('script'); kitJs.src = ASSETS + 'kit.js?v=5'; document.body.appendChild(kitJs);
})();
