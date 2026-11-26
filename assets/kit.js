/* ═══════════════════════════════════════════════════════════
   ZERO — "My Kit": the one draft order every page adds to.
     parts : design (gallery idea · kit-line kit · custom request) · options (builder) · sizes (planner)
     extras: timing (shipping date) · intent (visit / size set) · sentAt
   Shows: floating My Kit button + drawer, "added" toasts with undo, the adaptive quote form,
   a live club preview next to the form, a shareable kit link (+ shared-kit view) and an
   exit-intent "save your kit" panel. Loaded by site.js. Designs are stored as DATA and drawn
   with assets/jersey.js, so they look the same everywhere and in every language.
   ═══════════════════════════════════════════════════════════ */
(() => {
  const LANG = (document.documentElement.lang || 'en').slice(0, 2);
  const T = {
    en: {
      kit: 'My Kit', design: 'Design', options: 'Options', sizes: 'Sizes', timing: 'Delivery', sport: 'Sport',
      addDesign: 'Pick a design', addOptions: 'Choose options', addSizes: 'Add sizes', addTiming: 'Pick a date',
      optional: 'optional', toFollow: 'To follow — you can send sizes later',
      edit: 'Change', remove: 'Remove', quote: 'Get a Free Mockup', send: 'Send My Kit Request', clear: 'Start a new kit', close: 'Close',
      empty: 'Collect your design, options and sizes here — in any order — then send everything in one request.',
      added: 'Saved to My Kit', next: 'Next', ready: 'Ready to send', attached: 'Your kit is attached to the form below',
      replaced: 'Replaced', undo: 'Undo', pieces: 'pieces', more: 'more',
      summaryTitle: 'Your kit', summaryNote: 'Sent together with your request.', openKit: 'Open My Kit', ideas: 'Shortlisted ideas',
      share: 'Share with your board', copied: 'Link copied — send it to your board or committee', shareText: 'Our kit idea from ZERO Teamwear:',
      sentOn: 'Sent on', sentBadge: 'Sent', newKit: 'Start a new kit', resend: 'You already sent this kit on {d}. Send it again?',
      formKitTitle: 'Send Your Kit Request', formKitNote: 'Your kit is attached — just add your contact details.',
      formCustomTitle: 'Request Your Custom Design', formCustomNote: 'Tell us about your club — a designer starts on your idea.',
      formVisitTitle: 'Book a Factory Visit', formVisitNote: 'Tell us when suits you — we confirm by email within 1 working day.', visitMsg: 'We would like to visit the factory. Preferred dates: ',
      formSizeTitle: 'Request a Size Set', formSizeNote: 'We send a fitting set so your players can try sizes first.', sizeMsg: 'Please send us a size set for fitting. Groups (men / women / youth): ',
      msgKit: 'Anything else? Sponsors, player names, deadline…', fromSizes: 'from your size list', by: 'By', around: 'Arrives around',
      shared: 'Shared kit', sharedNote: 'Someone shared this kit with you.', useKit: 'Use this kit', getMockup: 'Get a free mockup',
      exitTitle: 'Leaving? Keep your kit.', exitText: 'We email you your kit — pick it up any time or forward it to your board.', exitEmail: 'Your email', exitSend: 'Email me my kit',
      exitNote: 'We only use your email to send this kit and one follow-up. No newsletter.', exitDone: 'Sent! Check your inbox in a minute.', exitFail: 'That didn’t work — try again or use the quote form.',
      stripTitle: 'Your kit', stripSend: 'Send request', stripHere: 'you are here',
      previewTitle: 'Your kit, your name', previewHint: 'Type your club name in the form — it appears on the back.', number: 'Number', front: 'Front', back: 'Back',
    },
    de: {
      kit: 'Mein Kit', design: 'Design', options: 'Optionen', sizes: 'Größen', timing: 'Lieferung', sport: 'Sportart',
      addDesign: 'Design wählen', addOptions: 'Optionen wählen', addSizes: 'Größen hinzufügen', addTiming: 'Datum wählen',
      optional: 'optional', toFollow: 'Folgt — Größen könnt ihr später schicken',
      edit: 'Ändern', remove: 'Entfernen', quote: 'Gratis-Mockup anfordern', send: 'Kit-Anfrage senden', clear: 'Neues Kit starten', close: 'Schließen',
      empty: 'Sammelt hier Design, Optionen und Größen — in beliebiger Reihenfolge — und sendet alles in einer Anfrage.',
      added: 'Im Kit gespeichert', next: 'Weiter', ready: 'Bereit zum Senden', attached: 'Euer Kit hängt am Formular unten',
      replaced: 'Ersetzt', undo: 'Rückgängig', pieces: 'Teile', more: 'weitere',
      summaryTitle: 'Euer Kit', summaryNote: 'Wird mit eurer Anfrage gesendet.', openKit: 'Mein Kit öffnen', ideas: 'Gemerkte Ideen',
      share: 'Mit dem Vorstand teilen', copied: 'Link kopiert — schickt ihn an Vorstand oder Komitee', shareText: 'Unsere Trikot-Idee von ZERO Teamwear:',
      sentOn: 'Gesendet am', sentBadge: 'Gesendet', newKit: 'Neues Kit starten', resend: 'Ihr habt dieses Kit am {d} schon gesendet. Erneut senden?',
      formKitTitle: 'Kit-Anfrage senden', formKitNote: 'Euer Kit ist angehängt — nur noch eure Kontaktdaten.',
      formCustomTitle: 'Individuelles Design anfragen', formCustomNote: 'Erzählt uns von eurem Verein — ein Designer startet mit eurer Idee.',
      formVisitTitle: 'Werksbesuch buchen', formVisitNote: 'Sagt uns, wann es passt — wir bestätigen per E-Mail innerhalb eines Werktags.', visitMsg: 'Wir möchten das Werk besuchen. Wunschtermine: ',
      formSizeTitle: 'Größenset anfordern', formSizeNote: 'Wir schicken ein Anprobe-Set, damit eure Spieler die Größen testen können.', sizeMsg: 'Bitte schickt uns ein Größenset zur Anprobe. Gruppen (Herren / Damen / Jugend): ',
      msgKit: 'Noch etwas? Sponsoren, Spielernamen, Termin…', fromSizes: 'aus eurer Größenliste', by: 'Bis', around: 'Ankunft ca.',
      shared: 'Geteiltes Kit', sharedNote: 'Jemand hat dieses Kit mit euch geteilt.', useKit: 'Dieses Kit verwenden', getMockup: 'Gratis-Mockup anfordern',
      exitTitle: 'Schon weg? Behaltet euer Kit.', exitText: 'Wir schicken euch euer Kit per E-Mail — jederzeit weitermachen oder an den Vorstand weiterleiten.', exitEmail: 'Eure E-Mail', exitSend: 'Kit per E-Mail senden',
      exitNote: 'Wir nutzen eure E-Mail nur für dieses Kit und eine Nachfrage. Kein Newsletter.', exitDone: 'Gesendet! Schaut gleich in euer Postfach.', exitFail: 'Das hat nicht geklappt — bitte erneut versuchen oder das Anfrageformular nutzen.',
      stripTitle: 'Euer Kit', stripSend: 'Anfrage senden', stripHere: 'ihr seid hier',
      previewTitle: 'Euer Kit, euer Name', previewHint: 'Tippt euren Vereinsnamen ins Formular — er erscheint auf dem Rücken.', number: 'Nummer', front: 'Vorne', back: 'Hinten',
    },
    bs: {
      kit: 'Moj komplet', design: 'Dizajn', options: 'Opcije', sizes: 'Veličine', timing: 'Isporuka', sport: 'Sport',
      addDesign: 'Odaberite dizajn', addOptions: 'Odaberite opcije', addSizes: 'Dodajte veličine', addTiming: 'Odaberite datum',
      optional: 'opcionalno', toFollow: 'Naknadno — veličine možete poslati kasnije',
      edit: 'Promijeni', remove: 'Ukloni', quote: 'Besplatna maketa', send: 'Pošalji upit za komplet', clear: 'Novi komplet', close: 'Zatvori',
      empty: 'Ovdje skupite dizajn, opcije i veličine — bilo kojim redom — i pošaljite sve u jednom upitu.',
      added: 'Sačuvano u komplet', next: 'Dalje', ready: 'Spremno za slanje', attached: 'Vaš komplet je priložen uz obrazac ispod',
      replaced: 'Zamijenjeno', undo: 'Poništi', pieces: 'kom.', more: 'još',
      summaryTitle: 'Vaš komplet', summaryNote: 'Šalje se uz vaš upit.', openKit: 'Otvori moj komplet', ideas: 'Sačuvane ideje',
      share: 'Podijeli s upravom', copied: 'Link kopiran — pošaljite ga upravi ili odboru', shareText: 'Naša ideja za dres od ZERO Teamwear:',
      sentOn: 'Poslano', sentBadge: 'Poslano', newKit: 'Novi komplet', resend: 'Ovaj komplet ste već poslali {d}. Poslati ponovo?',
      formKitTitle: 'Pošaljite upit za komplet', formKitNote: 'Vaš komplet je priložen — dodajte samo kontakt podatke.',
      formCustomTitle: 'Zatražite unikatni dizajn', formCustomNote: 'Recite nam o svom klubu — dizajner kreće s vašom idejom.',
      formVisitTitle: 'Zakažite posjetu fabrici', formVisitNote: 'Recite nam kada vam odgovara — potvrđujemo e-mailom u roku od 1 radnog dana.', visitMsg: 'Željeli bismo posjetiti fabriku. Željeni termini: ',
      formSizeTitle: 'Zatražite set veličina', formSizeNote: 'Šaljemo set za probu da igrači isprobaju veličine.', sizeMsg: 'Molimo pošaljite set veličina za probu. Grupe (muški / ženski / juniori): ',
      msgKit: 'Još nešto? Sponzori, imena igrača, rok…', fromSizes: 'iz vaše liste veličina', by: 'Do', around: 'Stiže oko',
      shared: 'Podijeljeni komplet', sharedNote: 'Neko je s vama podijelio ovaj komplet.', useKit: 'Koristi ovaj komplet', getMockup: 'Besplatna maketa',
      exitTitle: 'Odlazite? Sačuvajte komplet.', exitText: 'Pošaljemo vam komplet e-mailom — nastavite bilo kada ili ga proslijedite upravi.', exitEmail: 'Vaš e-mail', exitSend: 'Pošalji mi komplet',
      exitNote: 'E-mail koristimo samo za ovaj komplet i jedno javljanje. Bez newslettera.', exitDone: 'Poslano! Provjerite inbox za minut.', exitFail: 'Nije uspjelo — pokušajte ponovo ili koristite obrazac.',
      stripTitle: 'Vaš komplet', stripSend: 'Pošalji upit', stripHere: 'ovdje ste',
      previewTitle: 'Vaš komplet, vaše ime', previewHint: 'Upišite ime kluba u obrazac — pojavit će se na leđima.', number: 'Broj', front: 'Naprijed', back: 'Leđa',
    },
  };
  const t = T[LANG] || T.en;
  const PAGES = { design: 'gallery.html#grid', options: 'products.html#cat-collar', sizes: 'size-guide.html#planner', timing: 'shipping.html' };
  const PARTS = ['design', 'options', 'sizes'];
  const STORE = 'zeroKit', FLASH = 'zeroKitAdded';
  const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const onHome = file === 'index.html' || file === '';
  const SELF = document.currentScript ? document.currentScript.src : '';
  const ASSETS = SELF ? new URL('.', SELF).href : 'assets/';            // …/assets/
  const ROOT = new URL('../', ASSETS).href;                              // site root (assets paths are relative to it)
  const track = (n, p) => window.ZeroTrack && window.ZeroTrack.track(n, p || {});
  const toastBase = () => (window.ZeroUI ? window.ZeroUI.bottom() : 0);

  // ── storage ──
  const load = () => { try { return JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (_) { return {}; } };
  const save = (kit, quiet) => { try { localStorage.setItem(STORE, JSON.stringify(kit)); } catch (_) {} if (!quiet) render(); };
  const filled = kit => PARTS.filter(p => kit[p]);
  function setPart(part, data, opts = {}) {
    const kit = load(), before = kit[part];
    kit[part] = { ...data, at: Date.now() };
    delete kit.sentAt; // a changed kit is a new request
    save(kit);
    try { sessionStorage.setItem(FLASH, part); } catch (_) {}
    window.dispatchEvent(new CustomEvent('zerokit:add', { detail: { part, name: data.name || '', filled: filled(kit).length } }));
    // replacing a different design: offer undo right away
    if (part === 'design' && before && before.name !== data.name && !opts.noUndo) {
      showToast(`${t.replaced}: <b>${esc(before.name)}</b>`, `<button type="button" data-mk-undo>${t.undo}</button>`, () => { const k = load(); k.design = before; save(k); });
    }
  }
  // asset paths are stored relative to the site root so a kit saved on /de/ renders on / and vice versa
  const rootPath = p => (p ? String(p).replace(/^(\.\.\/)+/, '').replace(/^\//, '') : p);
  const abs = p => (p && !/^(https?:|data:)/.test(p) ? new URL(rootPath(p), ROOT).href : p);
  const RENDER_KEYS = ['cut', 'pattern', 'base', 'accent', 'num', 'trim', 'flip', 'number', 'back', 'short', 'fabric', 'fabricBack', 'fabricBox', 'crestImg', 'logoColor'];
  const pick = d => { const o = {}; RENDER_KEYS.forEach(k => { if (d && d[k] != null && d[k] !== '') o[k] = /^(fabric|fabricBack|crestImg)$/.test(k) ? rootPath(d[k]) : d[k]; }); return o; };

  // ── helpers ──
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const txt = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const DEFAULT_KIT = { cut: 'tee', pattern: 'slashes', base: '#141416', accent: '#e1141f', num: '#ffffff', number: '10', back: 'ZERO FC', short: 'ZR' };
  let rendererReady = null;
  function needRenderer() {
    if (window.ZeroJersey && window.ZeroLogo) return Promise.resolve();
    if (!rendererReady) rendererReady = Promise.all(['logo.js', 'jersey.js'].filter(f => (f === 'logo.js' ? !window.ZeroLogo : !window.ZeroJersey)).map(f => new Promise(res => {
      const s = document.createElement('script'); s.src = ASSETS + f; s.onload = s.onerror = res; document.head.appendChild(s);
    })));
    return rendererReady;
  }
  function jersey(data, side, extra) {
    if (!window.ZeroJersey) return '';
    const k = { ...DEFAULT_KIT, ...(data || {}), ...(extra || {}) };
    ['fabric', 'fabricBack', 'crestImg'].forEach(f => { if (k[f]) k[f] = abs(k[f]); });
    return window.ZeroJersey.svg(k, side || 'front', { hanger: false });
  }
  const fmtDate = ts => new Date(ts).toLocaleDateString(LANG === 'de' ? 'de-DE' : LANG === 'bs' ? 'bs-BA' : 'en-GB', { day: 'numeric', month: 'short' });

  // ═════════ CAPTURE: the existing buttons add parts (runs after each page's own handler) ═════════
  document.addEventListener('click', e => {
    const el = e.target.closest('#lb-start, #sl-send, [data-km-cta], #spec-send, #p-send, #lock-date, [data-intent]');
    if (!el || e.defaultPrevented) return;
    if (el.id === 'lb-start') { // gallery idea, with the visitor's colours (gallery exposes the open idea)
      const d = window.ZeroCurrentDesign || {};
      setPart('design', { name: txt(document.getElementById('lb-title')), sub: txt(document.getElementById('lb-kicker')), sport: d.sport || '',
        colours: [d.base, d.accent, d.trim, d.num].filter(Boolean), data: pick(d), from: 'gallery' });
    } else if (el.id === 'sl-send') { // whole shortlist: the first idea leads, the rest travel along by name
      const list = window.ZeroShortlistData ? window.ZeroShortlistData() : [];
      if (!list.length) return;
      const d = list[0];
      setPart('design', { name: d.name, sub: list.length > 1 ? `${t.ideas}: ${list.length}` : '', sport: d.sport || '', list: list.map(x => x.name),
        colours: [d.base, d.accent, d.trim, d.num].filter(Boolean), data: pick(d), from: 'gallery' });
    } else if (el.matches('[data-km-cta]')) { // partner kit from the kit line
      const d = window.ZeroCurrentDesign || {};
      setPart('design', { name: txt(document.getElementById('km-title')), sub: txt(document.querySelector('#kitmodal .km__sport')), sport: d.photo || '', data: pick(d), from: 'line' });
    } else if (el.id === 'spec-send') {
      setPart('options', { rows: specRows() });
    } else if (el.id === 'p-send') {
      const s = sizeRows(); if (!s) return;
      setPart('sizes', s);
    } else if (el.id === 'lock-date') { // shipping calculator: keep the planned delivery
      const need = document.getElementById('c-need'), sel = document.getElementById('c-country');
      const kit = load();
      kit.timing = { arrive: txt(document.getElementById('c-arrive')), needBy: need && need.value ? need.value : '', country: sel ? txt(sel.options[sel.selectedIndex]) : '',
        express: !!(document.getElementById('c-express') || {}).checked, at: Date.now() };
      delete kit.sentAt; save(kit);
      try { sessionStorage.setItem(FLASH, 'timing'); } catch (_) {}
      track('add_to_quote', { kit_part: 'timing' });
    } else if (el.dataset.intent) { // "Book a factory visit", "Request a size set"…
      const kit = load(); kit.intent = el.dataset.intent; save(kit, true);
    }
  });
  const specRows = () => [...document.querySelectorAll('#spec-list li')].map(li => [txt(li.querySelector('span')), txt(li.querySelector('b'))]);
  function sizeRows() {
    const rows = window.ZeroSizeList ? window.ZeroSizeList() : [];
    if (!rows.length) return null;
    return { rows: rows.map(r => `${r[0]} ${r[1]} × ${r[2]}`), total: String(rows.reduce((a, r) => a + r[2], 0)) };
  }
  // once a part is in the kit, later edits on its page keep it up to date (no extra click needed)
  const specList = document.getElementById('spec-list');
  if (specList) new MutationObserver(() => { const k = load(); if (k.options) { k.options.rows = specRows(); save(k, true); render(); } }).observe(specList, { childList: true });
  window.addEventListener('zero:sizes', () => { const k = load(); if (k.sizes) { const s = sizeRows(); if (s) { k.sizes = { ...k.sizes, ...s }; save(k); } } });
  // intent from a link (?intent=visit / sizeset)
  const qIntent = new URLSearchParams(location.search).get('intent');
  if (qIntent) { const k = load(); k.intent = qIntent; save(k, true); }

  // ═════════ STYLES ═════════
  const css = `
  .mk-fab { position: fixed; left: clamp(16px, 2vw, 28px); bottom: clamp(16px, 2vw, 28px); z-index: 61; display: inline-flex; align-items: center; gap: 10px; height: 52px; padding: 0 18px 0 12px; isolation: isolate; color: #fff; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 17px; letter-spacing: .06em; text-transform: uppercase; transition: transform .25s, opacity .3s; }
  .mk-fab::before { content: ""; position: absolute; inset: 0; z-index: -1; background: #0f0f12; border: 1px solid rgba(255,255,255,.22); transform: skewX(var(--skew, -12deg)); box-shadow: 0 14px 34px rgba(0,0,0,.55); transition: border-color .2s; }
  .mk-fab:hover::before { border-color: var(--red, #e1141f); }
  .mk-fab[hidden], .mk-fab.is-away { display: none; }
  .mk-fab__art { width: 30px; height: 30px; display: grid; place-items: center; }
  .mk-fab__art svg { width: 100%; height: 100%; }
  .mk-fab b { min-width: 34px; padding: 2px 6px; background: var(--red, #e1141f); font-size: 14px; text-align: center; }
  .mk-fab.is-sent b { background: #1f9d55; }
  .mk-fab.bump { animation: mkBump .5s cubic-bezier(.2,.8,.2,1); }
  @keyframes mkBump { 40% { transform: scale(1.12); } }
  .mk-scrim { position: fixed; inset: 0; z-index: 95; background: rgba(0,0,0,.55); opacity: 0; pointer-events: none; transition: opacity .3s; }
  .mk-scrim.is-open { opacity: 1; pointer-events: auto; }
  .mk-drawer { position: fixed; top: 0; left: 0; bottom: 0; z-index: 96; width: min(430px, 100vw); display: flex; flex-direction: column; background: #0f0f12; color: #fff; border-right: 3px solid var(--red, #e1141f); box-shadow: 30px 0 60px rgba(0,0,0,.6); transform: translateX(-105%); transition: transform .45s cubic-bezier(.2,.8,.2,1); }
  .mk-drawer.is-open { transform: none; }
  .mk-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 20px 22px; border-bottom: 1px solid rgba(255,255,255,.1); }
  .mk-head p { font-family: "Barlow Condensed", sans-serif; font-weight: 800; font-style: italic; font-size: 26px; text-transform: uppercase; }
  .mk-x { width: 42px; height: 40px; display: grid; place-items: center; border: 1px solid rgba(255,255,255,.25); color: #fff; background: none; cursor: pointer; }
  .mk-x:hover { background: var(--red, #e1141f); border-color: var(--red, #e1141f); }
  .mk-x svg { width: 18px; height: 18px; }
  .mk-body { flex: 1; overflow: auto; padding: 8px 22px 22px; }
  .mk-empty { margin: 18px 0; color: rgba(255,255,255,.6); line-height: 1.55; }
  .mk-sent { margin: 14px 0 0; padding: 10px 12px; background: rgba(31,157,85,.14); border-left: 3px solid #1f9d55; font-size: 14px; }
  .mk-steps { display: flex; gap: 6px; margin: 14px 0 6px; }
  .mk-steps i { flex: 1; height: 4px; background: rgba(255,255,255,.12); }
  .mk-steps i.on { background: var(--red, #e1141f); }
  .mk-part { padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,.1); }
  .mk-part__top { display: flex; align-items: center; gap: 10px; }
  .mk-part__n { width: 26px; height: 26px; display: grid; place-items: center; flex: none; border: 1px solid rgba(255,255,255,.3); font-family: "Barlow Condensed", sans-serif; font-weight: 800; font-size: 14px; }
  .mk-part.is-done .mk-part__n { background: var(--red, #e1141f); border-color: var(--red, #e1141f); }
  .mk-part__t { flex: 1; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 15px; letter-spacing: .14em; text-transform: uppercase; }
  .mk-part__t small { margin-left: 6px; font-weight: 600; letter-spacing: .06em; text-transform: none; color: rgba(255,255,255,.45); }
  .mk-part__act { display: flex; gap: 12px; font-size: 13px; }
  .mk-part__act a, .mk-part__act button { color: rgba(255,255,255,.65); text-decoration: underline; text-underline-offset: 3px; background: none; border: 0; cursor: pointer; font: inherit; }
  .mk-part__act a:hover, .mk-part__act button:hover { color: #fff; }
  .mk-part__body { margin: 10px 0 0 36px; font-size: 14px; color: rgba(255,255,255,.75); line-height: 1.5; }
  .mk-part__body b { color: #fff; }
  .mk-add { display: inline-flex; margin: 10px 0 0 36px; padding: 7px 12px; border: 1px dashed rgba(255,255,255,.35); color: #fff; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 14px; letter-spacing: .08em; text-transform: uppercase; }
  .mk-add:hover { border-color: var(--red, #e1141f); background: rgba(225,20,31,.12); }
  .mk-design { display: grid; grid-template-columns: 74px 1fr; gap: 12px; align-items: center; }
  .mk-design__art { width: 74px; height: 80px; display: grid; place-items: center; background: #0b0b0e; border: 1px solid rgba(255,255,255,.08); }
  .mk-design__art svg { width: 64px; height: auto; max-height: 76px; }
  .mk-dots { display: flex; gap: 4px; margin-top: 6px; }
  .mk-dots i { width: 13px; height: 13px; border: 1px solid rgba(255,255,255,.3); transform: skewX(-12deg); }
  .mk-rows { display: grid; grid-template-columns: auto 1fr; gap: 3px 12px; font-size: 13px; }
  .mk-rows span { color: rgba(255,255,255,.5); }
  .mk-foot { display: grid; gap: 10px; padding: 18px 22px 22px; border-top: 1px solid rgba(255,255,255,.1); }
  .mk-sharebtn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 42px; border: 1px solid rgba(255,255,255,.3); background: none; color: #fff; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 15px; letter-spacing: .08em; text-transform: uppercase; cursor: pointer; }
  .mk-sharebtn:hover { border-color: #fff; }
  .mk-sharebtn svg { width: 16px; height: 16px; }
  .mk-foot .mk-clear { justify-self: center; font-size: 13px; color: rgba(255,255,255,.5); text-decoration: underline; text-underline-offset: 3px; background: none; border: 0; cursor: pointer; }
  .mk-foot .mk-clear:hover { color: #fff; }
  .mk-toast { position: fixed; left: 50%; bottom: calc(var(--zero-bottom, 0px) + 90px); z-index: 97; translate: -50% 20px; opacity: 0; display: flex; align-items: center; gap: 12px; max-width: calc(100vw - 24px); padding: 12px 16px; background: #fff; color: #0b0b0d; font-weight: 600; font-size: 15px; box-shadow: 0 18px 40px rgba(0,0,0,.5); transition: opacity .3s, translate .4s cubic-bezier(.2,.8,.2,1), bottom .3s; pointer-events: none; }
  .mk-toast.show { opacity: 1; translate: -50% 0; pointer-events: auto; }
  .mk-toast a, .mk-toast button { color: var(--red, #e1141f); font-weight: 700; white-space: nowrap; background: none; border: 0; cursor: pointer; font: inherit; font-weight: 700; padding: 0; }
  /* summary card on the quote form */
  .mk-card { margin: 4px 0 22px; padding: 16px; border: 1px solid rgba(255,255,255,.14); background: rgba(255,255,255,.03); }
  .mk-card__head { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
  .mk-card__head p { font-family: "Barlow Condensed", sans-serif; font-weight: 800; font-style: italic; font-size: 20px; text-transform: uppercase; }
  .mk-card__head span { display: flex; gap: 14px; }
  .mk-card__head button { font-size: 13px; color: rgba(255,255,255,.65); text-decoration: underline; text-underline-offset: 3px; background: none; border: 0; cursor: pointer; }
  .mk-card__grid { display: grid; grid-template-columns: 74px 1fr; gap: 14px; align-items: start; }
  .mk-card__list { display: grid; gap: 6px; font-size: 14px; }
  .mk-card__list div { display: grid; grid-template-columns: 76px 1fr; gap: 8px; }
  .mk-card__list span { font-family: "Barlow Condensed", sans-serif; font-weight: 600; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: rgba(255,255,255,.5); padding-top: 2px; }
  .mk-card__list b { font-weight: 600; }
  .mk-card__list a, .mk-card__list button { color: var(--red, #e1141f); font-weight: 600; background: none; border: 0; padding: 0; cursor: pointer; font-size: 13px; text-decoration: underline; text-underline-offset: 3px; }
  .mk-card__note { margin-top: 10px; font-size: 12.5px; color: rgba(255,255,255,.45); }
  .mk-card.is-sent { border-color: rgba(31,157,85,.6); }
  .mk-hidden-field { display: none !important; }
  /* progress strip above the footer (gallery, options, sizes, shipping, about) */
  .mk-strip { max-width: var(--max, 1240px); margin: clamp(40px, 6vw, 80px) auto 0; padding: 0 var(--gutter, 20px); }
  .mk-strip__in { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; padding: 18px 22px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.025); }
  .mk-strip__t { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-style: italic; font-size: 20px; text-transform: uppercase; margin-right: 6px; }
  .mk-strip a.step { display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid rgba(255,255,255,.18); color: #fff; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 15px; letter-spacing: .08em; text-transform: uppercase; }
  .mk-strip a.step i { width: 22px; height: 22px; display: grid; place-items: center; font-style: normal; font-size: 13px; border: 1px solid rgba(255,255,255,.35); }
  .mk-strip a.step.is-done i { background: var(--red, #e1141f); border-color: var(--red, #e1141f); }
  .mk-strip a.step.is-here { border-color: #fff; box-shadow: inset 0 -3px 0 var(--red, #e1141f); }
  .mk-strip a.step small { font-weight: 600; font-size: 11px; letter-spacing: .1em; color: rgba(255,255,255,.5); }
  .mk-strip .arr { color: rgba(255,255,255,.35); }
  .mk-strip a.send { margin-left: auto; }
  @media (max-width: 760px) { .mk-strip .arr { display: none; } .mk-strip a.send { margin-left: 0; width: 100%; justify-content: center; } }
  /* live preview next to the form */
  .mk-preview { margin: 26px 0 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: center; max-width: 520px; }
  .mk-preview__art { position: relative; aspect-ratio: 208 / 226; background: radial-gradient(60% 60% at 50% 45%, rgba(225,20,31,.18), transparent 70%); cursor: pointer; }
  .mk-preview__art svg { width: 100%; height: 100%; filter: drop-shadow(0 18px 24px rgba(0,0,0,.55)); transition: opacity .25s; }
  .mk-preview__art small { position: absolute; left: 0; right: 0; bottom: -18px; text-align: center; font-family: "Barlow Condensed", sans-serif; font-weight: 600; font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: rgba(255,255,255,.45); }
  .mk-preview__side p { font-family: "Barlow Condensed", sans-serif; font-weight: 800; font-style: italic; font-size: 20px; text-transform: uppercase; }
  .mk-preview__side small { display: block; margin-top: 6px; font-size: 13px; line-height: 1.45; color: rgba(255,255,255,.6); }
  .mk-preview__side label { display: flex; align-items: center; gap: 8px; margin-top: 12px; font-family: "Barlow Condensed", sans-serif; font-weight: 600; font-size: 13px; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.6); }
  .mk-preview__side input { width: 64px; padding: 6px 8px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.2); color: #fff; font: inherit; font-size: 16px; letter-spacing: 0; text-align: center; }
  /* dialogs: shared kit + exit intent */
  .mk-dlg { width: min(560px, calc(100vw - 24px)); padding: 0; margin: auto; max-height: calc(100dvh - 24px); overflow: auto; /* the site's reset zeroes the dialog's own centring margin */ border: 0; color: #fff; background: #111114; box-shadow: 0 40px 90px rgba(0,0,0,.7); border-top: 3px solid var(--red, #e1141f); }
  .mk-dlg::backdrop { background: rgba(5,5,6,.75); backdrop-filter: blur(4px); }
  .mk-dlg__in { position: relative; padding: 26px; }
  .mk-dlg__in .mk-x { position: absolute; top: 14px; right: 14px; }
  .mk-dlg h3 { font-family: "Barlow Condensed", sans-serif; font-weight: 800; font-style: italic; font-size: 30px; line-height: 1; text-transform: uppercase; padding-right: 50px; }
  .mk-dlg p { margin-top: 10px; font-size: 15px; line-height: 1.5; color: rgba(255,255,255,.72); }
  .mk-dlg__grid { display: grid; grid-template-columns: 150px 1fr; gap: 18px; margin-top: 18px; align-items: center; }
  .mk-dlg__grid svg { width: 100%; height: auto; }
  .mk-dlg__btns { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
  .mk-dlg form { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
  .mk-dlg input[type=email] { flex: 1 1 220px; min-height: 46px; padding: 0 14px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.22); color: #fff; font: inherit; font-size: 16px; }
  .mk-dlg small { display: block; margin-top: 10px; font-size: 12.5px; color: rgba(255,255,255,.5); }
  @media (max-width: 560px) { .mk-fab { height: 46px; font-size: 15px; padding: 0 12px 0 10px; } .mk-fab__label { display: none; } .mk-card__grid { grid-template-columns: 1fr; } .mk-design__art.in-card { display: none; } .mk-dlg__grid { grid-template-columns: 1fr; } .mk-dlg__grid svg { max-width: 160px; } }
  `;
  document.head.insertAdjacentHTML('beforeend', `<style id="mk-css">${css}</style>`);

  // ═════════ FLOATING BUTTON + DRAWER + TOAST ═════════
  const jerseyIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M8.5 3.5 4 5.8 2.5 10l3 1.3V20h13v-8.7l3-1.3L20 5.8l-4.5-2.3c-.6 1.4-2 2.3-3.5 2.3s-2.9-.9-3.5-2.3Z"/></svg>';
  const xIcon = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l10 10M15 5 5 15"/></svg>';
  const shareIcon = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="15" cy="4.5" r="2.5"/><circle cx="5" cy="10" r="2.5"/><circle cx="15" cy="15.5" r="2.5"/><path d="m7.2 8.8 5.6-3.1M7.2 11.2l5.6 3.1"/></svg>';
  const contactHref = onHome ? '#contact' : 'index.html#contact';
  document.body.insertAdjacentHTML('beforeend', `
    <button class="mk-fab" type="button" id="mk-fab" aria-haspopup="dialog" hidden><span class="mk-fab__art" id="mk-fab-art">${jerseyIcon}</span><span class="mk-fab__label">${t.kit}</span> <b id="mk-fab-n">0/3</b></button>
    <div class="mk-scrim" id="mk-scrim"></div>
    <aside class="mk-drawer" id="mk-drawer" role="dialog" aria-modal="true" aria-label="${t.kit}" aria-hidden="true">
      <div class="mk-head"><p>${t.kit}</p><button class="mk-x" type="button" id="mk-close" aria-label="${t.close}">${xIcon}</button></div>
      <div class="mk-body" id="mk-body"></div>
      <div class="mk-foot">
        <a class="btn btn--primary btn--block" href="${contactHref}" id="mk-quote">${t.send}</a>
        <button class="mk-sharebtn" type="button" data-mk-share>${shareIcon} ${t.share}</button>
        <button class="mk-clear" type="button" id="mk-clear">${t.clear}</button>
      </div>
    </aside>
    <div class="mk-toast" id="mk-toast" role="status"></div>`);
  const $ = id => document.getElementById(id);
  const drawer = $('mk-drawer'), scrim = $('mk-scrim');
  const setOpen = open => { drawer.classList.toggle('is-open', open); scrim.classList.toggle('is-open', open); drawer.setAttribute('aria-hidden', !open); if (open) { $('mk-close').focus(); renderDrawerArt(); } };
  $('mk-fab').addEventListener('click', () => setOpen(true));
  $('mk-close').addEventListener('click', () => setOpen(false));
  scrim.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) setOpen(false); });
  $('mk-quote').addEventListener('click', () => setOpen(false));
  $('mk-clear').addEventListener('click', () => { const keep = load(); try { localStorage.removeItem(STORE); } catch (_) {} render(); setOpen(false);
    showToast(t.clear + ' ✓', `<button type="button" data-mk-undo>${t.undo}</button>`, () => save(keep)); });
  document.addEventListener('click', e => {
    const r = e.target.closest('[data-mk-remove]'); if (r) { const kit = load(); delete kit[r.dataset.mkRemove]; save(kit); }
    if (e.target.closest('[data-mk-share]')) share();
    if (e.target.closest('[data-mk-open]')) setOpen(true);
    if (e.target.closest('[data-mk-new]')) { try { localStorage.removeItem(STORE); } catch (_) {} render(); }
  });

  let toastUndo = null;
  function showToast(html, action, undo) {
    const el = $('mk-toast');
    el.innerHTML = `<span>${html}</span>${action || ''}`;
    toastUndo = undo || null;
    el.classList.add('show');
    clearTimeout(el._h); el._h = setTimeout(() => el.classList.remove('show'), 6000);
  }
  $('mk-toast').addEventListener('click', e => { if (e.target.closest('[data-mk-undo]') && toastUndo) { toastUndo(); toastUndo = null; $('mk-toast').classList.remove('show'); } });

  const dots = cs => (cs && cs.length ? `<span class="mk-dots">${cs.map(c => `<i style="background:${esc(c)}"></i>`).join('')}</span>` : '');
  const timingLabel = tm => (tm.needBy ? `${t.by} ${fmtDate(tm.needBy)}` : `${t.around} ${tm.arrive}`) + (tm.country ? ` · ${tm.country}` : '');
  function partBody(p, d) {
    if (p === 'design') return `<div class="mk-design"><span class="mk-design__art" data-art="design"></span><div><b>${esc(d.name)}</b>${d.sub ? `<br>${esc(d.sub)}` : ''}${dots(d.colours)}</div></div>`;
    if (p === 'options') return `<div class="mk-rows">${d.rows.map(([k, v]) => `<span>${esc(k)}</span><b>${esc(v)}</b>`).join('')}</div>`;
    const shown = d.rows.slice(0, 6);
    return `${shown.map(esc).join('<br>')}${d.rows.length > 6 ? `<br>+ ${d.rows.length - 6} ${t.more}` : ''}${d.total ? `<br><b>${esc(d.total)} ${t.pieces}</b>` : ''}`;
  }
  function renderDrawerArt() {
    const kit = load(); if (!kit.design) return;
    needRenderer().then(() => document.querySelectorAll('[data-art="design"]').forEach(el => { el.innerHTML = jersey(kit.design.data, 'front'); }));
  }

  function render() {
    const kit = load(), done = filled(kit);
    const fab = $('mk-fab');
    fab.hidden = !done.length;
    fab.classList.toggle('is-sent', !!kit.sentAt);
    $('mk-fab-n').textContent = kit.sentAt ? `${t.sentBadge} ✓` : `${done.length}/3`;
    if (kit.design) needRenderer().then(() => { $('mk-fab-art').innerHTML = jersey(kit.design.data, 'front') || jerseyIcon; });
    else $('mk-fab-art').innerHTML = jerseyIcon;
    $('mk-quote').textContent = done.length ? t.send : t.quote;
    $('mk-body').innerHTML = (done.length ? '' : `<p class="mk-empty">${t.empty}</p>`) +
      (kit.sentAt ? `<p class="mk-sent">✓ ${t.sentOn} ${fmtDate(kit.sentAt)}</p>` : '') +
      `<div class="mk-steps">${PARTS.map(p => `<i class="${kit[p] ? 'on' : ''}"></i>`).join('')}</div>` +
      PARTS.map((p, i) => {
        const d = kit[p];
        return `<div class="mk-part${d ? ' is-done' : ''}">
          <div class="mk-part__top"><span class="mk-part__n">${d ? '✓' : i + 1}</span><span class="mk-part__t">${t[p]}${p === 'sizes' ? `<small>(${t.optional})</small>` : ''}</span>
            ${d ? `<span class="mk-part__act"><a href="${PAGES[p]}">${t.edit}</a><button type="button" data-mk-remove="${p}">${t.remove}</button></span>` : ''}</div>
          ${d ? `<div class="mk-part__body">${partBody(p, d)}</div>` : `<a class="mk-add" href="${PAGES[p]}">+ ${t['add' + p[0].toUpperCase() + p.slice(1)]}</a>`}
        </div>`;
      }).join('') +
      (kit.timing ? `<div class="mk-part is-done"><div class="mk-part__top"><span class="mk-part__n">✓</span><span class="mk-part__t">${t.timing}</span><span class="mk-part__act"><a href="${PAGES.timing}">${t.edit}</a><button type="button" data-mk-remove="timing">${t.remove}</button></span></div><div class="mk-part__body">${esc(timingLabel(kit.timing))}</div></div>` : '');
    if (drawer.classList.contains('is-open')) renderDrawerArt();
    adaptForm(kit, done);
    renderPreview();
    renderStrip(kit);
  }

  // ═════════ PROGRESS STRIP: every add-a-part page ends with the next step ═════════
  const HERE = { 'gallery.html': 'design', 'products.html': 'options', 'size-guide.html': 'sizes' }[file] || '';
  const STRIP_PAGES = ['gallery.html', 'products.html', 'size-guide.html', 'shipping.html', 'about.html'];
  function renderStrip(kit) {
    if (!STRIP_PAGES.includes(file)) return;
    let strip = document.getElementById('mk-strip');
    if (!strip) { const foot = document.querySelector('footer.footer'); if (!foot) return; foot.insertAdjacentHTML('beforebegin', '<section class="mk-strip" id="mk-strip" aria-label="' + t.stripTitle + '"></section>'); strip = document.getElementById('mk-strip'); }
    const steps = PARTS.map((p, i) => '<a class="step' + (kit[p] ? ' is-done' : '') + (p === HERE ? ' is-here' : '') + '" href="' + PAGES[p] + '"><i>' + (kit[p] ? '✓' : i + 1) + '</i>' + t[p] + (p === HERE ? ' <small>· ' + t.stripHere + '</small>' : '') + '</a>').join('<span class="arr" aria-hidden="true">→</span>');
    strip.innerHTML = '<div class="mk-strip__in"><span class="mk-strip__t">' + t.stripTitle + '</span>' + steps + '<a class="btn btn--primary btn--sm send" href="' + contactHref + '">' + (filled(kit).length ? t.send : t.quote) + '</a></div>';
  }

  // ═════════ ADAPTIVE QUOTE FORM (home page) ═════════
  const form = document.getElementById('quote-form');
  const orig = {};
  if (form) {
    const q = s => form.querySelector(s);
    orig.title = txt(q('.form__title')); orig.note = txt(q('.form__note'));
    orig.submit = q('button[type="submit"]') ? q('button[type="submit"]').innerHTML : '';
    orig.msgPh = q('#f-msg') ? q('#f-msg').getAttribute('placeholder') : '';
  }
  const SIZE_STEPS = [[20, 0], [50, 1], [100, 2], [Infinity, 3]]; // index into the "Number of players" options
  function adaptForm(kit, done) {
    if (!form) return;
    const q = s => form.querySelector(s);
    const titleEl = q('.form__title'), noteEl = q('.form__note'), submit = q('button[type="submit"]'), msg = q('#f-msg');
    const sportSet = q('#f-sport') ? q('#f-sport').closest('fieldset') : null, sizeField = q('#f-size') ? q('#f-size').closest('.field') : null, whenField = q('#f-when') ? q('#f-when').closest('.field') : null;
    const live = done.length && !kit.sentAt;
    const intent = kit.intent || (kit.design && kit.design.from === 'custom' ? 'custom' : '');
    // title + note follow what the visitor is doing
    const head = intent === 'visit' ? [t.formVisitTitle, t.formVisitNote] : intent === 'sizeset' ? [t.formSizeTitle, t.formSizeNote]
      : intent === 'custom' && live ? [t.formCustomTitle, t.formCustomNote] : live ? [t.formKitTitle, t.formKitNote] : [orig.title, orig.note];
    if (titleEl) titleEl.textContent = head[0];
    if (noteEl) noteEl.textContent = head[1];
    if (submit) { const arrow = submit.querySelector('svg.arrow'); submit.innerHTML = live ? `<span class="shine" aria-hidden="true"></span>${t.send} ${arrow ? arrow.outerHTML : ''}` : orig.submit; }
    if (msg) {
      msg.setAttribute('placeholder', live ? t.msgKit : orig.msgPh);
      if (!msg.value && (intent === 'visit' || intent === 'sizeset')) msg.value = intent === 'visit' ? t.visitMsg : t.sizeMsg;
    }
    // answers My Kit already has: fill them in and fold them into the card
    const radio = id => form.querySelector(`input[name="sport"][data-id="${id}"]`);
    const sport = live && kit.design && kit.design.sport && radio(kit.design.sport) ? kit.design.sport : '';
    if (sport) radio(sport).checked = true;
    if (sportSet) sportSet.classList.toggle('mk-hidden-field', !!sport && !form.dataset.mkShowSport);
    const total = live && kit.sizes ? parseInt(kit.sizes.total, 10) : 0;
    if (total && q('#f-size')) { const idx = SIZE_STEPS.find(([max]) => total <= max)[1]; q('#f-size').selectedIndex = idx; }
    if (sizeField) sizeField.classList.toggle('mk-hidden-field', !!total && !form.dataset.mkShowSize);
    const tm = live && kit.timing ? kit.timing : null, when = q('#f-when');
    if (when) {
      let opt = when.querySelector('option[data-mk]');
      if (tm) { if (!opt) { opt = document.createElement('option'); opt.dataset.mk = '1'; when.prepend(opt); } opt.textContent = timingLabel(tm); opt.selected = true; }
      else if (opt) { opt.remove(); when.selectedIndex = 1; }
    }
    if (whenField) whenField.classList.toggle('mk-hidden-field', !!tm && !form.dataset.mkShowWhen);
    renderCard(kit, done, { sport, total, tm });
    if (live && !adaptForm.tracked) { adaptForm.tracked = true; track('form_prefilled', { fields: [sport && 'sport', total && 'team_size', tm && 'needed_by'].filter(Boolean).join(',') || 'none' }); }
  }

  function renderCard(kit, done, known) {
    let card = document.getElementById('mk-card');
    if (!done.length && !kit.timing) { if (card) card.remove(); const h = document.getElementById('mk-kit-field'); if (h) h.remove(); return; }
    if (!card) {
      const anchor = form.querySelector('.form__note') || form.querySelector('.form__title');
      anchor.insertAdjacentHTML('afterend', '<div class="mk-card" id="mk-card"></div>');
      card = document.getElementById('mk-card');
      card.addEventListener('click', e => {
        const show = e.target.closest('[data-mk-show]'); if (!show) return;
        form.dataset['mkShow' + show.dataset.mkShow] = '1'; render();
      });
    }
    const d = kit.design, o = kit.options, s = kit.sizes, tm = kit.timing;
    card.classList.toggle('is-sent', !!kit.sentAt);
    const KEY_ROWS = [0, 1, 7, 8, 9]; // collar · sleeve · logo application · number application · fabric
    const optLine = o ? (o.rows.length >= 10 ? KEY_ROWS.map(i => o.rows[i][1]) : o.rows.slice(0, 4).map(r => r[1])).join(' · ') : '';
    const sportName = known.sport ? txt(form.querySelector(`input[name="sport"][data-id="${known.sport}"]`).closest('label')) : '';
    const change = key => `<button type="button" data-mk-show="${key}">${t.edit}</button>`;
    card.innerHTML = kit.sentAt
      ? `<div class="mk-card__head"><p>✓ ${t.sentOn} ${fmtDate(kit.sentAt)}</p><span><button type="button" data-mk-open>${t.openKit}</button><button type="button" data-mk-new>${t.newKit}</button></span></div>`
      : `<div class="mk-card__head"><p>${t.summaryTitle}</p><span><button type="button" data-mk-share>${t.share}</button><button type="button" data-mk-open>${t.openKit}</button></span></div>
      <div class="mk-card__grid">
        ${d ? '<span class="mk-design__art in-card" data-art="design"></span>' : ''}
        <div class="mk-card__list" style="${d ? '' : 'grid-column:1 / -1'}">
          <div><span>${t.design}</span>${d ? `<b>${esc(d.name)}${d.sub ? ` — ${esc(d.sub)}` : ''}</b>` : `<a href="${PAGES.design}">+ ${t.addDesign}</a>`}</div>
          ${known.sport ? `<div><span>${t.sport}</span><b>${esc(sportName)} ${change('Sport')}</b></div>` : ''}
          <div><span>${t.options}</span>${o ? `<b>${esc(optLine)}</b>` : `<a href="${PAGES.options}">+ ${t.addOptions}</a>`}</div>
          <div><span>${t.sizes}</span>${s ? `<b>${esc(s.total)} ${t.pieces} <small style="font-weight:400;color:rgba(255,255,255,.55)">${t.fromSizes}</small> ${change('Size')}</b>` : `<b style="font-weight:400;color:rgba(255,255,255,.6)">${t.toFollow}</b>`}</div>
          ${tm ? `<div><span>${t.timing}</span><b>${esc(timingLabel(tm))} ${change('When')}</b></div>` : ''}
        </div>
      </div>
      <p class="mk-card__note">${t.summaryNote}</p>`;
    if (d && !kit.sentAt) needRenderer().then(() => { const a = card.querySelector('[data-art="design"]'); if (a) a.innerHTML = jersey(d.data, 'front'); });
    // the whole kit travels with the form as one field
    let hidden = document.getElementById('mk-kit-field');
    if (!hidden) { form.insertAdjacentHTML('beforeend', '<input type="hidden" name="kit" id="mk-kit-field" />'); hidden = document.getElementById('mk-kit-field'); }
    hidden.value = kit.sentAt ? '' : kitText(kit);
  }
  function kitText(kit) {
    const d = kit.design, o = kit.options, s = kit.sizes, tm = kit.timing;
    return [
      d ? `${t.design}: ${d.name}${d.list && d.list.length > 1 ? ` (+ ${d.list.slice(1).join(', ')})` : ''}${d.colours ? ` [${d.colours.join(' / ')}]` : ''}` : '',
      o ? `${t.options}: ${o.rows.map(r => `${r[0]}: ${r[1]}`).join('; ')}` : '',
      s ? `${t.sizes}: ${s.rows.join(', ')} — ${s.total} ${t.pieces}` : `${t.sizes}: ${t.toFollow}`,
      tm ? `${t.timing}: ${timingLabel(tm)}${tm.express ? ' (express)' : ''}` : '',
      kit.intent ? `Request: ${kit.intent}` : '',
    ].filter(Boolean).join('\n');
  }

  // ═════════ LIVE CLUB PREVIEW (next to the form) ═════════
  const info = document.querySelector('.contact__info');
  let prevSide = 'front', prevNum = '10';
  if (form && info) {
    const p = info.querySelector('p:not(.eyebrow)');
    (p || info.firstElementChild).insertAdjacentHTML('afterend', `<div class="mk-preview" id="mk-preview">
      <div class="mk-preview__art" id="mk-preview-art" role="button" tabindex="0" aria-label="${t.front} / ${t.back}"></div>
      <div class="mk-preview__side"><p>${t.previewTitle}</p><small>${t.previewHint}</small>
        <label>${t.number}<input type="text" inputmode="numeric" maxlength="2" id="mk-preview-num" value="10" /></label></div></div>`);
    const flip = () => { prevSide = prevSide === 'front' ? 'back' : 'front'; renderPreview(); };
    $('mk-preview-art').addEventListener('click', flip);
    $('mk-preview-art').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
    $('mk-preview-num').addEventListener('input', e => { prevNum = e.target.value.replace(/\D/g, '').slice(0, 2) || '10'; renderPreview(); });
    const club = form.querySelector('#f-club');
    if (club) club.addEventListener('input', () => { prevSide = 'back'; renderPreview(); });
  }
  function renderPreview() {
    const art = document.getElementById('mk-preview-art'); if (!art) return;
    const kit = load(), club = ((form && form.querySelector('#f-club')) || {}).value || '';
    const initials = club.trim().split(/\s+/).filter(w => /[A-Za-zÀ-ž]/.test(w)).map(w => w[0]).join('').slice(0, 3).toUpperCase();
    needRenderer().then(() => {
      const base = kit.design && !kit.sentAt ? kit.design.data : null;
      art.innerHTML = jersey(base, prevSide, { number: prevNum, ...(club ? { back: club.toUpperCase().slice(0, 22) } : {}), ...(initials && !(base && base.crestImg) ? { short: initials } : {}) }) +
        `<small>${prevSide === 'front' ? t.front : t.back}</small>`;
    });
  }

  // ═════════ SHAREABLE KIT LINK ═════════
  const b64e = s => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const b64d = s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)));
  function shareUrl(kit) {
    const payload = { v: 1, d: kit.design ? { n: kit.design.name, s: kit.design.sub, sp: kit.design.sport, c: kit.design.colours, x: kit.design.data, f: kit.design.from } : null,
      o: kit.options ? kit.options.rows : null, z: kit.sizes ? { r: kit.sizes.rows, t: kit.sizes.total } : null, tm: kit.timing || null };
    return new URL('index.html', location.href).href.split('#')[0] + '#kit=' + b64e(JSON.stringify(payload));
  }
  async function share() {
    const kit = load(); if (!filled(kit).length) return;
    const url = shareUrl(kit);
    track('share_kit', { kit_parts_filled: filled(kit).length });
    if (navigator.share && matchMedia('(pointer: coarse)').matches) { try { await navigator.share({ title: 'ZERO Teamwear', text: t.shareText, url }); return; } catch (_) { /* cancelled → copy instead */ } }
    try { await navigator.clipboard.writeText(url); showToast(t.copied, `<a href="https://wa.me/?text=${encodeURIComponent(t.shareText + ' ' + url)}" target="_blank" rel="noopener">WhatsApp</a>`); }
    catch (_) { window.prompt(t.copied, url); }
  }
  function decodeShared() {
    const m = location.hash.match(/^#kit=([\w-]+)/); if (!m) return null;
    try { const p = JSON.parse(b64d(m[1])); return p && p.v === 1 ? p : null; } catch (_) { return null; }
  }
  function sharedToKit(p) {
    const kit = {};
    if (p.d) kit.design = { name: p.d.n, sub: p.d.s, sport: p.d.sp, colours: p.d.c, data: p.d.x, from: p.d.f || 'shared', at: Date.now() };
    if (p.o) kit.options = { rows: p.o, at: Date.now() };
    if (p.z) kit.sizes = { rows: p.z.r, total: p.z.t, at: Date.now() };
    if (p.tm) kit.timing = p.tm;
    return kit;
  }
  function openShared(p) {
    const k = sharedToKit(p);
    track('shared_kit_open', { kit_parts_filled: filled(k).length });
    document.body.insertAdjacentHTML('beforeend', `<dialog class="mk-dlg" id="mk-shared" aria-labelledby="mk-shared-t"><div class="mk-dlg__in">
      <button class="mk-x" type="button" data-mk-close aria-label="${t.close}">${xIcon}</button>
      <h3 id="mk-shared-t">${t.shared}</h3><p>${t.sharedNote}</p>
      <div class="mk-dlg__grid"><div id="mk-shared-art"></div><div class="mk-card__list">
        ${k.design ? `<div><span>${t.design}</span><b>${esc(k.design.name)}</b></div>` : ''}
        ${k.options ? `<div><span>${t.options}</span><b>${esc(k.options.rows.slice(0, 3).map(r => r[1]).join(' · '))}</b></div>` : ''}
        ${k.sizes ? `<div><span>${t.sizes}</span><b>${esc(k.sizes.total)} ${t.pieces}</b></div>` : ''}
        ${k.timing ? `<div><span>${t.timing}</span><b>${esc(timingLabel(k.timing))}</b></div>` : ''}
      </div></div>
      <div class="mk-dlg__btns"><button class="btn btn--primary btn--sm" type="button" data-mk-use>${t.useKit}</button></div></div></dialog>`);
    const dlg = $('mk-shared');
    needRenderer().then(() => { $('mk-shared-art').innerHTML = jersey(k.design ? k.design.data : null, 'front'); });
    dlg.addEventListener('click', e => {
      if (e.target === dlg || e.target.closest('[data-mk-close]')) dlg.close();
      if (e.target.closest('[data-mk-use]')) { save(k); dlg.close(); history.replaceState(null, '', location.pathname + location.search + '#contact'); const c = document.getElementById('contact'); if (c) c.scrollIntoView({ behavior: 'smooth' }); }
    });
    dlg.addEventListener('close', () => { if (/^#kit=/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search); dlg.remove(); });
    dlg.showModal();
  }

  // ═════════ EXIT INTENT: "save your kit" (desktop, started & unsent kit, once a week) ═════════
  const EXIT_KEY = 'zeroExitShown';
  function exitAllowed() {
    const kit = load();
    if (!filled(kit).length || kit.sentAt) return false;
    if (!matchMedia('(pointer: fine)').matches || innerWidth < 900) return false;
    if (window.ZeroUI && !window.ZeroUI.consentDone()) return false;
    if (document.querySelector('dialog[open]') || drawer.classList.contains('is-open')) return false;
    try { if (Date.now() - Number(localStorage.getItem(EXIT_KEY) || 0) < 7 * 864e5) return false; } catch (_) { return false; }
    return !!(window.ZeroLead && window.ZeroLead.saveKit);
  }
  document.addEventListener('mouseout', e => {
    if (e.relatedTarget || e.clientY > 8 || !exitAllowed()) return;
    try { localStorage.setItem(EXIT_KEY, String(Date.now())); } catch (_) {}
    openExit();
  });
  function openExit() {
    track('exit_intent_view', { kit_parts_filled: filled(load()).length });
    document.body.insertAdjacentHTML('beforeend', `<dialog class="mk-dlg" id="mk-exit" aria-labelledby="mk-exit-t"><div class="mk-dlg__in">
      <button class="mk-x" type="button" data-mk-close aria-label="${t.close}">${xIcon}</button>
      <h3 id="mk-exit-t">${t.exitTitle}</h3><p>${t.exitText}</p>
      <form id="mk-exit-form"><input type="email" required placeholder="${t.exitEmail}" aria-label="${t.exitEmail}" autocomplete="email" /><button class="btn btn--primary btn--sm" type="submit">${t.exitSend}</button></form>
      <small id="mk-exit-msg">${t.exitNote}</small></div></dialog>`);
    const dlg = $('mk-exit');
    dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('[data-mk-close]')) dlg.close(); });
    dlg.addEventListener('close', () => dlg.remove());
    $('mk-exit-form').addEventListener('submit', async e => {
      e.preventDefault();
      const input = e.target.querySelector('input'), btn = e.target.querySelector('button'), msg = $('mk-exit-msg');
      btn.disabled = true;
      const kit = load();
      const ok = await window.ZeroLead.saveKit({ email: input.value.trim(), kit_summary: kitText(kit), share_url: shareUrl(kit), design: kit.design ? kit.design.name : '' });
      btn.disabled = false;
      msg.textContent = ok ? t.exitDone : t.exitFail;
      if (ok) { track('save_kit', { kit_parts_filled: filled(kit).length }); e.target.remove(); setTimeout(() => dlg.close(), 2200); }
    });
    dlg.showModal();
  }

  // ═════════ FLOATING BUTTON STAYS OUT OF THE WAY ON THE FORM ═════════
  if (form && 'IntersectionObserver' in window) new IntersectionObserver(([en]) => { $('mk-fab').classList.toggle('is-away', en.isIntersecting); }, { threshold: 0.15 }).observe(form);

  // ═════════ "SAVED" TOAST after arriving from a page that added a part ═════════
  function flash(part) {
    const kit = load();
    if (onHome && location.hash === '#contact') { showToast(`✓ ${t.attached}`); return; }
    const missing = PARTS.find(p => !kit[p] && p !== part);
    const nextLink = missing ? `<a href="${PAGES[missing]}">${t.next}: ${t[missing]} →</a>` : `<a href="${contactHref}">${t.ready} →</a>`;
    showToast(`✓ ${t.added}: <b>${t[part] || part}</b>`, nextLink);
    const fab = $('mk-fab'); fab.classList.remove('bump'); void fab.offsetWidth; fab.classList.add('bump');
  }

  // API for page features and the quote form
  window.ZeroKit = {
    setPart: (part, data) => { if (PARTS.includes(part)) setPart(part, data); },
    has: part => !!load()[part],
    confirmResend() { const k = load(); return !k.sentAt || window.confirm(t.resend.replace('{d}', fmtDate(k.sentAt))); },
    markSent() { const k = load(); if (filled(k).length || k.timing) { k.sentAt = Date.now(); delete k.intent; save(k); } },
    text: () => kitText(load()), shareUrl: () => shareUrl(load()), intent: () => load().intent || '',
  };

  render();
  const sharedPayload = decodeShared();
  if (sharedPayload) setTimeout(() => openShared(sharedPayload), 300);
  // a shared link opened while already on the page (same tab, only the #kit= part changes)
  window.addEventListener('hashchange', () => { const p = decodeShared(); if (p && !document.getElementById('mk-shared')) openShared(p); });
  try { const p = sessionStorage.getItem(FLASH); if (p) { sessionStorage.removeItem(FLASH); setTimeout(() => flash(p), 650); } } catch (_) {}
  // the kit line's CTA stays on the home page — show its toast right away
  document.addEventListener('click', e => { if (e.target.closest('[data-km-cta], #lock-date')) setTimeout(() => { try { const p = sessionStorage.getItem(FLASH); if (p && !e.target.closest('#lock-date')) { sessionStorage.removeItem(FLASH); flash(p); } } catch (_) {} }, 50); });
  window.addEventListener('storage', e => { if (e.key === STORE) render(); });
})();
