/* ═══════════════════════════════════════════════════════════
   ZERO — quote form sender. Settings: site.js → SITE.lead
     mode 'demo'    → shows success, sends nothing (draft)
     mode 'sheet'   → Google Sheet via Apps Script (integrations/google-sheet-leads.gs): row + sales alert + buyer confirmation + logo to Drive
     mode 'hubspot' → HubSpot free Forms API (no server, no key needed — portal + form ID)
     mode 'webhook' → multipart POST to Make / n8n / Formspree (includes the logo file)
   Sends club, contact, sport, team size, timing, message, the full My Kit,
   and where the visitor came from (UTMs, ad click IDs, landing page).
   generate_lead is tracked only after a successful send.
   ═══════════════════════════════════════════════════════════ */
(() => {
  const CFG = (window.ZERO_CONFIG && window.ZERO_CONFIG.lead) || { mode: 'demo' };
  const LANG = (document.documentElement.lang || 'en').slice(0, 2);
  const T = {
    en: { sending: 'Sending…', fail: 'Sorry — your request didn’t go through. Please try again, or email or WhatsApp us directly.' },
    de: { sending: 'Wird gesendet…', fail: 'Entschuldigung — eure Anfrage wurde nicht gesendet. Bitte erneut versuchen oder uns direkt per E-Mail oder WhatsApp schreiben.' },
    bs: { sending: 'Šalje se…', fail: 'Žao nam je — vaš upit nije poslan. Pokušajte ponovo ili nam pišite direktno e-mailom ili na WhatsApp.' },
  }[LANG] || {};
  const val = (form, name) => { const el = form.elements[name]; if (!el) return ''; if (el.length && !el.tagName) { const c = [...el].find(x => x.checked); return c ? c.value : ''; } return (el.value || '').trim(); };
  const cookie = n => (document.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)')) || [])[1] || '';
  const gaClientId = () => { const c = cookie('_ga'); return c ? c.split('.').slice(-2).join('.') : ''; };
  const kitOf = () => { try { return JSON.parse(localStorage.getItem('zeroKit') || '{}'); } catch (_) { return {}; } };

  function collect(form) {
    const name = val(form, 'name'), parts = name.split(/\s+/);
    const attr = window.ZeroTrack ? window.ZeroTrack.attribution() : {};
    const first = attr.first || {}, last = attr.last || first;
    const kit = kitOf();
    return {
      club: val(form, 'club'), name, firstname: parts[0] || '', lastname: parts.slice(1).join(' '),
      email: val(form, 'email'), phone: val(form, 'phone'), sport: val(form, 'sport'), team_size: val(form, 'size'), needed_by: val(form, 'when'),
      message: val(form, 'message'), kit_summary: val(form, 'kit'),
      lead_type: kit.design && kit.design.from === 'custom' ? 'custom_design' : (kit.design || kit.options) ? 'kit' : 'general',
      language: LANG, page: location.href.split('?')[0],
      utm_source: last.utm_source || '', utm_medium: last.utm_medium || '', utm_campaign: last.utm_campaign || '', utm_content: last.utm_content || '', utm_term: last.utm_term || '',
      first_source: [first.utm_source, first.utm_medium, first.utm_campaign].filter(Boolean).join(' / '), landing_page: first.landing || '',
      gclid: last.gclid || first.gclid || '', fbclid: last.fbclid || first.fbclid || '', msclkid: last.msclkid || first.msclkid || '',
      ga_client_id: gaClientId(), logo_file: form.elements.logo && form.elements.logo.files[0] ? form.elements.logo.files[0].name : '',
    };
  }

  // one readable note for the CRM, so nothing is lost even if a field has no matching CRM property
  const note = d => [
    `Sport: ${d.sport} · Players: ${d.team_size} · Needed by: ${d.needed_by} · Language: ${d.language}`,
    d.message && `\n${d.message}`,
    d.kit_summary && `\n— My Kit —\n${d.kit_summary}`,
    d.logo_file && `\nLogo file: ${d.logo_file}${CFG.mode === 'hubspot' ? ' (ask the club to email it — HubSpot forms can’t receive files)' : ''}`,
    `\n— Source —\nLast: ${[d.utm_source, d.utm_medium, d.utm_campaign].filter(Boolean).join(' / ') || '(direct)'} · First: ${d.first_source || '(direct)'} · Landing: ${d.landing_page}`,
    (d.gclid || d.fbclid || d.msclkid) && `Click IDs: ${[d.gclid && 'gclid=' + d.gclid, d.fbclid && 'fbclid=' + d.fbclid, d.msclkid && 'msclkid=' + d.msclkid].filter(Boolean).join(' ')}`,
  ].filter(Boolean).join('\n');

  async function sendHubspot(d, form) {
    if (!CFG.hubspotPortalId || !CFG.hubspotFormId) throw new Error('HubSpot IDs missing');
    // standard HubSpot contact properties only — add custom ones (sport, utm_*) in HubSpot first, then map them here
    const fields = [['firstname', d.firstname], ['lastname', d.lastname], ['email', d.email], ['phone', d.phone], ['company', d.club], ['message', note(d)]]
      .filter(([, v]) => v).map(([name, value]) => ({ objectTypeId: '0-1', name, value: String(value).slice(0, 65000) }));
    const body = { fields, context: { pageUri: d.page, pageName: document.title, ...(cookie('hubspotutk') ? { hutk: cookie('hubspotutk') } : {}) } };
    if (CFG.hubspotGdpr) body.legalConsentOptions = { consent: { consentToProcess: !!(form.elements.consent && form.elements.consent.checked), text: 'I agree that ZERO may contact me about my request.' } };
    const r = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${encodeURIComponent(CFG.hubspotPortalId)}/${encodeURIComponent(CFG.hubspotFormId)}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error('HubSpot ' + r.status);
  }
  // Google Sheet (Apps Script web app): url-encoded so it's a "simple" request; the reply is opaque, so a
  // network failure is the only error we can see — the script itself logs every row it receives
  const fileToDataUrl = file => new Promise(res => { if (!file || file.size > 8e6) return res(''); const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => res(''); r.readAsDataURL(file); });
  async function sendSheet(d, form) {
    if (!CFG.sheetUrl) throw new Error('Sheet URL missing');
    const body = new URLSearchParams();
    Object.entries(d).forEach(([k, v]) => body.append(k, v));
    body.append('fill_ms', String(Math.round(performance.now() - startedAt)));
    body.append('company_website', trap(form).value);
    const logo = form.elements.logo && form.elements.logo.files[0];
    if (logo) body.append('logo_data', await fileToDataUrl(logo));
    await fetch(CFG.sheetUrl, { method: 'POST', mode: 'no-cors', body });
  }
  async function sendWebhook(d, form) {
    if (!CFG.webhookUrl) throw new Error('Webhook URL missing');
    const fd = new FormData();
    Object.entries(d).forEach(([k, v]) => fd.append(k, v));
    fd.append('crm_note', note(d));
    if (form.elements.logo && form.elements.logo.files[0]) fd.append('logo', form.elements.logo.files[0]);
    const r = await fetch(CFG.webhookUrl, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error('Webhook ' + r.status);
  }

  async function submit(form) {
    const btn = form.querySelector('button[type="submit"]'), label = btn ? btn.innerHTML : '';
    const err = form.querySelector('.form__error') || (() => { const p = document.createElement('p'); p.className = 'form__error'; p.setAttribute('role', 'alert'); p.style.cssText = 'margin-top:12px;color:#ff6b6b;font-size:14px;line-height:1.45'; form.querySelector('.form__submit').after(p); return p; })();
    err.textContent = '';
    if (btn) { btn.disabled = true; btn.textContent = T.sending; }
    const d = collect(form);
    try {
      if (trap(form).value) return true; // a bot filled the hidden field — pretend success, send nothing
      if (CFG.mode === 'sheet') await sendSheet(d, form);
      else if (CFG.mode === 'hubspot') await sendHubspot(d, form);
      else if (CFG.mode === 'webhook') await sendWebhook(d, form);
      else await new Promise(r => setTimeout(r, 500)); // demo
      if (window.ZeroTrack) window.ZeroTrack.track('generate_lead', {
        form_id: 'quote', lead_type: d.lead_type, sport: d.sport, team_size: d.team_size, needed_by: d.needed_by,
        kit_parts_filled: ['design', 'options', 'sizes'].filter(p => kitOf()[p]).length, value: CFG.value || 0, currency: CFG.currency || 'EUR', lead_mode: CFG.mode,
      });
      try { localStorage.setItem('zeroLeadSent', new Date().toISOString()); } catch (_) {}
      return true;
    } catch (e) {
      if (window.ZeroTrack) window.ZeroTrack.track('form_error', { form_id: 'quote', error_type: 'server', field_name: String(e.message).slice(0, 60) });
      err.textContent = T.fail;
      return false;
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = label; }
    }
  }
  // spam protection: a hidden field people never see (bots fill it in) + time on page before sending
  const startedAt = performance.now();
  function trap(form) {
    let t = form.querySelector('input[name="company_website"]');
    if (!t) {
      form.insertAdjacentHTML('beforeend', '<div aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden"><label>Website<input type="text" name="company_website" tabindex="-1" autocomplete="off" /></label></div>');
      t = form.querySelector('input[name="company_website"]');
    }
    return t;
  }
  const qf = document.getElementById('quote-form'); if (qf) trap(qf);

  window.ZeroLead = { submit, mode: CFG.mode };
})();
