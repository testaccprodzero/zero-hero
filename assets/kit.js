/* ═══════════════════════════════════════════════════════════
   ZERO — "My Kit": one draft order shared by every page.
   Collects the parts people already send from the existing pages
     · Design  — gallery "Start My Kit From This Idea" / shortlist, kit line "Start a Kit Like This"
     · Options — products page "Send spec"
     · Sizes   — size guide "Send size list"
   and shows them in a floating My Kit drawer + a summary card on the quote form.
   Loaded by site.js; adds no markup to the pages themselves.
   ═══════════════════════════════════════════════════════════ */
(() => {
  const LANG = (document.documentElement.lang || 'en').slice(0, 2);
  const T = {
    en: {
      kit: 'My Kit', design: 'Design', options: 'Options', sizes: 'Sizes',
      addDesign: 'Pick a design', addOptions: 'Choose options', addSizes: 'Add sizes',
      optional: 'optional', toFollow: 'To follow — you can send sizes later',
      edit: 'Change', remove: 'Remove', quote: 'Get My Quote', clear: 'Start over', close: 'Close',
      empty: 'Your kit is empty. Pick a design, choose options and add sizes — in any order.',
      added: 'Added to My Kit', next: 'Next', ready: 'Ready for your quote',
      pieces: 'pieces', more: 'more', summaryTitle: 'Your kit', summaryNote: 'This is sent with your request.',
      openKit: 'Open My Kit', ideas: 'Shortlisted ideas',
    },
    de: {
      kit: 'Mein Kit', design: 'Design', options: 'Optionen', sizes: 'Größen',
      addDesign: 'Design wählen', addOptions: 'Optionen wählen', addSizes: 'Größen hinzufügen',
      optional: 'optional', toFollow: 'Folgt — Größen könnt ihr später schicken',
      edit: 'Ändern', remove: 'Entfernen', quote: 'Angebot anfordern', clear: 'Neu beginnen', close: 'Schließen',
      empty: 'Euer Kit ist leer. Wählt ein Design, Optionen und Größen — in beliebiger Reihenfolge.',
      added: 'Zum Kit hinzugefügt', next: 'Weiter', ready: 'Bereit für euer Angebot',
      pieces: 'Teile', more: 'weitere', summaryTitle: 'Euer Kit', summaryNote: 'Wird mit eurer Anfrage gesendet.',
      openKit: 'Mein Kit öffnen', ideas: 'Gemerkte Ideen',
    },
    bs: {
      kit: 'Moj komplet', design: 'Dizajn', options: 'Opcije', sizes: 'Veličine',
      addDesign: 'Odaberite dizajn', addOptions: 'Odaberite opcije', addSizes: 'Dodajte veličine',
      optional: 'opcionalno', toFollow: 'Naknadno — veličine možete poslati kasnije',
      edit: 'Promijeni', remove: 'Ukloni', quote: 'Zatražite ponudu', clear: 'Počni ispočetka', close: 'Zatvori',
      empty: 'Vaš komplet je prazan. Odaberite dizajn, opcije i veličine — bilo kojim redom.',
      added: 'Dodano u komplet', next: 'Dalje', ready: 'Spremno za ponudu',
      pieces: 'kom.', more: 'još', summaryTitle: 'Vaš komplet', summaryNote: 'Šalje se uz vaš upit.',
      openKit: 'Otvori moj komplet', ideas: 'Sačuvane ideje',
    },
  };
  const t = T[LANG] || T.en;
  // links land where the work starts on each page, not at the top
  const PAGES = { design: 'gallery.html#grid', options: 'products.html#cat-collar', sizes: 'size-guide.html#planner' };
  const PARTS = ['design', 'options', 'sizes'];
  const STORE = 'zeroKit', FLASH = 'zeroKitAdded';
  const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const onHome = file === 'index.html' || file === '';

  // ── storage ──
  const load = () => { try { return JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (_) { return {}; } };
  const save = kit => { try { localStorage.setItem(STORE, JSON.stringify(kit)); } catch (_) {} render(); };
  const setPart = (part, data) => {
    const kit = load(); kit[part] = { ...data, at: Date.now() }; save(kit);
    try { sessionStorage.setItem(FLASH, part); } catch (_) {}
    // tell tracking (track.js) a part was added — the site's "add to quote"
    window.dispatchEvent(new CustomEvent('zerokit:add', { detail: { part, name: data.name || '', filled: PARTS.filter(p => kit[p]).length } }));
  };
  const filled = kit => PARTS.filter(p => kit[p]);
  // the old per-page hand-offs pasted text into the message box; My Kit replaces them
  const dropLegacy = () => { try { ['zeroSpec', 'zeroShortlistText', 'zeroSizeList'].forEach(k => localStorage.removeItem(k)); } catch (_) {} };

  // ── helpers ──
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let n = 0;
  const uniq = svg => { const k = 'mk' + (n++); return svg.replace(/(id="|url\(#|href="#)([A-Za-z][\w-]*)/g, `$1$2${k}`); };
  const txt = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

  // ── capture from the existing buttons (runs after each page's own click handler) ──
  document.addEventListener('click', e => {
    const el = e.target.closest('#lb-start, #sl-send, [data-km-cta], #spec-send, #p-send');
    if (!el || e.defaultPrevented) return;
    if (el.id === 'lb-start') { // gallery idea (with the visitor's colours)
      const svg = document.querySelector('#lb-art figure svg');
      setPart('design', {
        name: txt(document.getElementById('lb-title')), sub: txt(document.getElementById('lb-kicker')),
        colours: [...document.querySelectorAll('#lb-rows .lb__pal i')].map(i => i.getAttribute('title') || i.textContent.trim()).filter(Boolean),
        svg: svg ? svg.outerHTML : '', from: 'gallery',
      });
    } else if (el.id === 'sl-send') { // whole shortlist
      const names = [...document.querySelectorAll('#sl-list li b')].map(b => b.textContent.trim());
      if (!names.length) return;
      const svg = document.querySelector('#sl-list .mini svg');
      setPart('design', { name: names[0], sub: names.length > 1 ? `${t.ideas}: ${names.length}` : '', list: names, svg: svg ? svg.outerHTML : '', from: 'gallery' });
    } else if (el.matches('[data-km-cta]')) { // partner kit from the kit line
      const svg = document.querySelector('#kitmodal .km__face--front svg');
      setPart('design', { name: txt(document.getElementById('km-title')), sub: txt(document.querySelector('#kitmodal .km__sport')), svg: svg ? svg.outerHTML : '', from: 'line' });
    } else if (el.id === 'spec-send') { // products spec
      const rows = [...document.querySelectorAll('#spec-list li')].map(li => [txt(li.querySelector('span')), txt(li.querySelector('b'))]);
      setPart('options', { rows });
    } else if (el.id === 'p-send') { // size guide squad list
      let text = ''; try { text = localStorage.getItem('zeroSizeList') || ''; } catch (_) {}
      const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
      if (lines.length < 2) return;
      const total = (lines[lines.length - 1].match(/\d+/) || [''])[0];
      setPart('sizes', { rows: lines.slice(1, -1), total });
    }
    dropLegacy();
  });

  // ── styles (only for the new elements) ──
  const css = `
  .mk-fab { position: fixed; left: clamp(16px, 2vw, 28px); bottom: clamp(16px, 2vw, 28px); z-index: 61; display: inline-flex; align-items: center; gap: 10px; height: 52px; padding: 0 18px 0 12px; isolation: isolate; color: #fff; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 17px; letter-spacing: .06em; text-transform: uppercase; transition: transform .25s; }
  .mk-fab::before { content: ""; position: absolute; inset: 0; z-index: -1; background: #0f0f12; border: 1px solid rgba(255,255,255,.22); transform: skewX(var(--skew, -12deg)); box-shadow: 0 14px 34px rgba(0,0,0,.55); transition: border-color .2s; }
  .mk-fab:hover::before { border-color: var(--red, #e1141f); }
  .mk-fab[hidden] { display: none; }
  .mk-fab__art { width: 30px; height: 30px; display: grid; place-items: center; }
  .mk-fab__art svg { width: 100%; height: 100%; }
  .mk-fab b { min-width: 34px; padding: 2px 6px; background: var(--red, #e1141f); font-size: 14px; text-align: center; }
  .mk-fab.bump { animation: mkBump .5s cubic-bezier(.2,.8,.2,1); }
  @keyframes mkBump { 40% { transform: scale(1.12); } }
  .mk-scrim { position: fixed; inset: 0; z-index: 95; background: rgba(0,0,0,.55); opacity: 0; pointer-events: none; transition: opacity .3s; }
  .mk-scrim.is-open { opacity: 1; pointer-events: auto; }
  .mk-drawer { position: fixed; top: 0; left: 0; bottom: 0; z-index: 96; width: min(430px, 100vw); display: flex; flex-direction: column; background: #0f0f12; color: #fff; border-right: 3px solid var(--red, #e1141f); box-shadow: 30px 0 60px rgba(0,0,0,.6); transform: translateX(-105%); transition: transform .45s cubic-bezier(.2,.8,.2,1); }
  .mk-drawer.is-open { transform: none; }
  .mk-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 20px 22px; border-bottom: 1px solid rgba(255,255,255,.1); }
  .mk-head p { font-family: "Barlow Condensed", sans-serif; font-weight: 800; font-style: italic; font-size: 26px; text-transform: uppercase; }
  .mk-x { width: 42px; height: 40px; display: grid; place-items: center; border: 1px solid rgba(255,255,255,.25); color: #fff; }
  .mk-x:hover { background: var(--red, #e1141f); border-color: var(--red, #e1141f); }
  .mk-x svg { width: 18px; height: 18px; }
  .mk-body { flex: 1; overflow: auto; padding: 8px 22px 22px; }
  .mk-empty { margin: 18px 0; color: rgba(255,255,255,.6); line-height: 1.55; }
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
  .mk-part__act a, .mk-part__act button { color: rgba(255,255,255,.65); text-decoration: underline; text-underline-offset: 3px; }
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
  .mk-foot .mk-clear { justify-self: center; font-size: 13px; color: rgba(255,255,255,.5); text-decoration: underline; text-underline-offset: 3px; }
  .mk-foot .mk-clear:hover { color: #fff; }
  .mk-toast { position: fixed; left: 50%; bottom: 90px; z-index: 97; translate: -50% 20px; opacity: 0; display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #fff; color: #0b0b0d; font-weight: 600; font-size: 15px; box-shadow: 0 18px 40px rgba(0,0,0,.5); transition: opacity .3s, translate .4s cubic-bezier(.2,.8,.2,1); pointer-events: none; }
  .mk-toast.show { opacity: 1; translate: -50% 0; pointer-events: auto; }
  .mk-toast a { color: var(--red, #e1141f); font-weight: 700; white-space: nowrap; }
  /* summary card on the quote form */
  .mk-card { margin: 4px 0 22px; padding: 16px; border: 1px solid rgba(255,255,255,.14); background: rgba(255,255,255,.03); }
  .mk-card__head { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; margin-bottom: 12px; }
  .mk-card__head p { font-family: "Barlow Condensed", sans-serif; font-weight: 800; font-style: italic; font-size: 20px; text-transform: uppercase; }
  .mk-card__head button { font-size: 13px; color: rgba(255,255,255,.65); text-decoration: underline; text-underline-offset: 3px; }
  .mk-card__grid { display: grid; grid-template-columns: 74px 1fr; gap: 14px; align-items: start; }
  .mk-card__list { display: grid; gap: 6px; font-size: 14px; }
  .mk-card__list div { display: grid; grid-template-columns: 76px 1fr; gap: 8px; }
  .mk-card__list span { font-family: "Barlow Condensed", sans-serif; font-weight: 600; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: rgba(255,255,255,.5); padding-top: 2px; }
  .mk-card__list b { font-weight: 600; }
  .mk-card__list a { color: var(--red, #e1141f); font-weight: 600; }
  .mk-card__note { margin-top: 10px; font-size: 12.5px; color: rgba(255,255,255,.45); }
  @media (max-width: 560px) { .mk-fab { height: 46px; font-size: 15px; } .mk-card__grid { grid-template-columns: 1fr; } .mk-design__art { display: none; } }
  `;
  document.head.insertAdjacentHTML('beforeend', `<style id="mk-css">${css}</style>`);

  // ── floating button + drawer ──
  const jerseyIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M8.5 3.5 4 5.8 2.5 10l3 1.3V20h13v-8.7l3-1.3L20 5.8l-4.5-2.3c-.6 1.4-2 2.3-3.5 2.3s-2.9-.9-3.5-2.3Z"/></svg>';
  const xIcon = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l10 10M15 5 5 15"/></svg>';
  document.body.insertAdjacentHTML('beforeend', `
    <button class="mk-fab" type="button" id="mk-fab" aria-haspopup="dialog" hidden><span class="mk-fab__art" id="mk-fab-art">${jerseyIcon}</span>${t.kit} <b id="mk-fab-n">0/3</b></button>
    <div class="mk-scrim" id="mk-scrim"></div>
    <aside class="mk-drawer" id="mk-drawer" role="dialog" aria-modal="true" aria-label="${t.kit}" aria-hidden="true">
      <div class="mk-head"><p>${t.kit}</p><button class="mk-x" type="button" id="mk-close" aria-label="${t.close}">${xIcon}</button></div>
      <div class="mk-body" id="mk-body"></div>
      <div class="mk-foot"><a class="btn btn--primary btn--block" href="${onHome ? '#contact' : 'index.html#contact'}" id="mk-quote">${t.quote}</a><button class="mk-clear" type="button" id="mk-clear">${t.clear}</button></div>
    </aside>
    <div class="mk-toast" id="mk-toast" role="status"></div>`);
  const $ = id => document.getElementById(id);
  const drawer = $('mk-drawer'), scrim = $('mk-scrim');
  const setOpen = open => { drawer.classList.toggle('is-open', open); scrim.classList.toggle('is-open', open); drawer.setAttribute('aria-hidden', !open); if (open) $('mk-close').focus(); };
  $('mk-fab').addEventListener('click', () => setOpen(true));
  $('mk-close').addEventListener('click', () => setOpen(false));
  scrim.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) setOpen(false); });
  $('mk-quote').addEventListener('click', () => setOpen(false));
  $('mk-clear').addEventListener('click', () => { try { localStorage.removeItem(STORE); } catch (_) {} render(); setOpen(false); });
  $('mk-body').addEventListener('click', e => { const r = e.target.closest('[data-mk-remove]'); if (r) { const kit = load(); delete kit[r.dataset.mkRemove]; save(kit); } });

  const dots = cs => (cs && cs.length ? `<span class="mk-dots">${cs.map(c => `<i style="background:${esc(c)}"></i>`).join('')}</span>` : '');
  function partBody(p, d) {
    if (p === 'design') return `<div class="mk-design">${d.svg ? `<span class="mk-design__art">${uniq(d.svg)}</span>` : '<span></span>'}<div><b>${esc(d.name)}</b>${d.sub ? `<br>${esc(d.sub)}` : ''}${dots(d.colours)}</div></div>`;
    if (p === 'options') return `<div class="mk-rows">${d.rows.map(([k, v]) => `<span>${esc(k)}</span><b>${esc(v)}</b>`).join('')}</div>`;
    const shown = d.rows.slice(0, 6);
    return `${shown.map(esc).join('<br>')}${d.rows.length > 6 ? `<br>+ ${d.rows.length - 6} ${t.more}` : ''}${d.total ? `<br><b>${esc(d.total)} ${t.pieces}</b>` : ''}`;
  }
  function render() {
    const kit = load(), done = filled(kit);
    // button
    $('mk-fab').hidden = !done.length;
    $('mk-fab-n').textContent = `${done.length}/3`;
    $('mk-fab-art').innerHTML = kit.design && kit.design.svg ? uniq(kit.design.svg) : jerseyIcon;
    // drawer
    $('mk-body').innerHTML = (done.length ? '' : `<p class="mk-empty">${t.empty}</p>`) +
      `<div class="mk-steps">${PARTS.map(p => `<i class="${kit[p] ? 'on' : ''}"></i>`).join('')}</div>` +
      PARTS.map((p, i) => {
        const d = kit[p];
        return `<div class="mk-part${d ? ' is-done' : ''}">
          <div class="mk-part__top"><span class="mk-part__n">${d ? '✓' : i + 1}</span><span class="mk-part__t">${t[p]}${p === 'sizes' ? `<small>(${t.optional})</small>` : ''}</span>
            ${d ? `<span class="mk-part__act"><a href="${PAGES[p]}">${t.edit}</a><button type="button" data-mk-remove="${p}">${t.remove}</button></span>` : ''}</div>
          ${d ? `<div class="mk-part__body">${partBody(p, d)}</div>` : `<a class="mk-add" href="${PAGES[p]}">+ ${t['add' + p[0].toUpperCase() + p.slice(1)]}</a>`}
        </div>`;
      }).join('');
    renderCard(kit, done);
  }

  // ── summary card on the quote form (home page only) ──
  function renderCard(kit, done) {
    const form = document.getElementById('quote-form');
    if (!form) return;
    let card = document.getElementById('mk-card');
    if (!done.length) { if (card) card.remove(); const h = document.getElementById('mk-kit-field'); if (h) h.remove(); return; }
    if (!card) {
      const anchor = form.querySelector('.form__note') || form.querySelector('.form__title');
      anchor.insertAdjacentHTML('afterend', '<div class="mk-card" id="mk-card"></div>');
      card = document.getElementById('mk-card');
      card.addEventListener('click', e => { if (e.target.closest('[data-mk-open]')) setOpen(true); });
    }
    const d = kit.design, o = kit.options, s = kit.sizes;
    // headline options: collar, sleeve, logo + number application, fabric (rows follow the products page order)
    const KEY_ROWS = [0, 1, 7, 8, 9];
    const optLine = o ? (o.rows.length >= 10 ? KEY_ROWS.map(i => o.rows[i][1]) : o.rows.slice(0, 4).map(r => r[1])).join(' · ') : '';
    // pre-select the form's sport to match the chosen design (once per design)
    if (d && d.sub && form.dataset.mkSport !== String(d.at)) {
      form.dataset.mkSport = String(d.at);
      const radio = [...form.querySelectorAll('input[name="sport"]')].find(r => { const l = r.closest('label'); return l && d.sub.toLowerCase().includes(txt(l).toLowerCase()); });
      if (radio) radio.checked = true;
    }
    card.innerHTML = `<div class="mk-card__head"><p>${t.summaryTitle}</p><button type="button" data-mk-open>${t.openKit}</button></div>
      <div class="mk-card__grid">
        ${d && d.svg ? `<span class="mk-design__art">${uniq(d.svg)}</span>` : ''}
        <div class="mk-card__list" style="${d && d.svg ? '' : 'grid-column:1 / -1'}">
          <div><span>${t.design}</span>${d ? `<b>${esc(d.name)}${d.sub ? ` — ${esc(d.sub)}` : ''}</b>` : `<a href="${PAGES.design}">+ ${t.addDesign}</a>`}</div>
          <div><span>${t.options}</span>${o ? `<b>${esc(optLine)}</b>` : `<a href="${PAGES.options}">+ ${t.addOptions}</a>`}</div>
          <div><span>${t.sizes}</span>${s ? `<b>${esc(s.total)} ${t.pieces}</b>` : `<b style="font-weight:400;color:rgba(255,255,255,.6)">${t.toFollow}</b>`}</div>
        </div>
      </div>
      <p class="mk-card__note">${t.summaryNote}</p>`;
    // full kit travels with the form as one field
    let hidden = document.getElementById('mk-kit-field');
    if (!hidden) { form.insertAdjacentHTML('beforeend', '<input type="hidden" name="kit" id="mk-kit-field" />'); hidden = document.getElementById('mk-kit-field'); }
    hidden.value = [
      d ? `${t.design}: ${d.name}${d.list && d.list.length > 1 ? ` (+ ${d.list.slice(1).join(', ')})` : ''}${d.colours ? ` [${d.colours.join(' / ')}]` : ''}` : '',
      o ? `${t.options}: ${o.rows.map(r => `${r[0]}: ${r[1]}`).join('; ')}` : '',
      s ? `${t.sizes}: ${s.rows.join(', ')} — ${s.total} ${t.pieces}` : `${t.sizes}: ${t.toFollow}`,
    ].filter(Boolean).join('\n');
  }

  // ── "added" toast after arriving from a page that just added a part ──
  function flash(part) {
    const kit = load(), missing = PARTS.find(p => !kit[p] && p !== part);
    const nextLink = missing ? `<a href="${PAGES[missing]}">${t.next}: ${t[missing]} →</a>` : `<a href="${onHome ? '#contact' : 'index.html#contact'}">${t.ready} →</a>`;
    const el = $('mk-toast');
    el.innerHTML = `<span>✓ ${t.added}: <b>${t[part]}</b></span>${nextLink}`;
    el.classList.add('show');
    const fab = $('mk-fab'); fab.classList.remove('bump'); void fab.offsetWidth; fab.classList.add('bump');
    clearTimeout(el._h); el._h = setTimeout(() => el.classList.remove('show'), 5000);
  }

  // small API for page features that add to the kit (e.g. the gallery's custom-design panel)
  window.ZeroKit = { setPart: (part, data) => { if (PARTS.includes(part)) setPart(part, data); }, has: part => !!load()[part] };

  render();
  try { const p = sessionStorage.getItem(FLASH); if (p) { sessionStorage.removeItem(FLASH); setTimeout(() => flash(p), 600); } } catch (_) {}
  // the kit line's CTA stays on the home page — show the toast right away
  document.addEventListener('click', e => { if (e.target.closest('[data-km-cta]')) setTimeout(() => { try { const p = sessionStorage.getItem(FLASH); if (p) { sessionStorage.removeItem(FLASH); flash(p); } } catch (_) {} }, 50); });
  window.addEventListener('storage', e => { if (e.key === STORE) render(); });
})();
