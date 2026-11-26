/* ═══════════════════════════════════════════════════════════
   ZERO — quote requests → Google Sheet (+ sales alert, buyer confirmation, logo to Drive)
   Setup (5 minutes, see TRACKING.md §3):
     1. Create a Google Sheet "ZERO — Quote requests".
     2. Extensions → Apps Script → delete everything → paste this file → Save.
     3. Fill in SETTINGS below (your email at least).
     4. Run "setup" once (▶ with setup selected) → allow the permissions (Sheet, Drive, Gmail).
     5. Deploy → New deployment → type "Web app" → Execute as: Me · Who has access: Anyone → Deploy.
     6. Copy the Web app URL (ends in /exec) → site.js → SITE.lead.sheetUrl, and mode: 'sheet'.
   After editing this script: Deploy → Manage deployments → ✏️ → Version: New version → Deploy (the URL stays the same).
   ═══════════════════════════════════════════════════════════ */

const SETTINGS = {
  salesEmail: 'you@example.com',          // who gets the alert for every new request (comma-separate several)
  fromName: 'ZERO Teamwear',
  sendConfirmation: true,                 // email the buyer a branded "we got your request" email in their language
  logoFolderName: 'ZERO — Club logos',    // Drive folder for uploaded crests (created automatically)
  sheetName: 'Requests',
  // branding for the confirmation email
  siteUrl: 'https://testaccprodzero.github.io/zero-hero/',                                         // your website (change at launch)
  logoUrl: 'https://raw.githubusercontent.com/testaccprodzero/zero-hero/main/assets/zero-logo.png', // white ZERO logo, publicly reachable
  whatsapp: '',                           // digits only, e.g. '38761234567' — adds a WhatsApp button; '' hides it
  address: '',                            // optional footer line, e.g. 'ZERO Teamwear · Street 1 · 88000 Mostar'
};

const COLUMNS = [
  ['received', 'Received'], ['status', 'Status'], ['club', 'Club'], ['name', 'Name'], ['email', 'Email'], ['phone', 'Phone'],
  ['sport', 'Sport'], ['team_size', 'Players'], ['needed_by', 'Needed by'], ['message', 'Message'], ['kit_summary', 'My Kit'],
  ['lead_type', 'Lead type'], ['language', 'Language'], ['logo', 'Logo'],
  ['source', 'Source (last)'], ['first_source', 'Source (first)'], ['landing_page', 'Landing page'], ['page', 'Sent from'],
  ['gclid', 'gclid'], ['fbclid', 'fbclid'], ['msclkid', 'msclkid'], ['ga_client_id', 'GA client ID'], ['notes', 'Notes'],
];
const STATUSES = ['New', 'Contacted', 'Mockup sent', 'Quote sent', 'Won', 'Lost', 'Spam'];

/** Run once: creates the sheet, headers, status dropdown and the logo folder. */
function setup() {
  const sh = sheet_();
  sh.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS.map(c => c[1])]).setFontWeight('bold').setBackground('#111114').setFontColor('#ffffff');
  sh.setFrozenRows(1);
  const statusCol = COLUMNS.findIndex(c => c[0] === 'status') + 1;
  sh.getRange(2, statusCol, sh.getMaxRows() - 1, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build());
  sh.setColumnWidth(COLUMNS.findIndex(c => c[0] === 'kit_summary') + 1, 360);
  sh.setColumnWidth(COLUMNS.findIndex(c => c[0] === 'message') + 1, 280);
  folder_();
  Logger.log('Requests sheet: ' + ss_().getUrl()); // open this link — new requests appear here
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  // spam: hidden trap field filled, or the form was sent too fast to be a person
  if (p.company_website || Number(p.fill_ms || 0) < 3000) return json_({ ok: true });
  if (!p.email || !p.club) return json_({ ok: false, error: 'missing fields' });

  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const d = Object.assign({}, p, {
      received: new Date(), status: 'New',
      source: [p.utm_source, p.utm_medium, p.utm_campaign].filter(String).join(' / ') || '(direct)',
      logo: saveLogo_(p),
    });
    sheet_().appendRow(COLUMNS.map(c => clean_(d[c[0]])));
    alert_(d);
    if (SETTINGS.sendConfirmation) confirm_(d);
    return json_({ ok: true });
  } finally { lock.releaseLock(); }
}

function doGet() { return json_({ ok: true, service: 'ZERO quote requests' }); }

// ── helpers ──
// Works both ways: script opened from a Sheet (Extensions → Apps Script) uses that Sheet;
// a standalone script (script.google.com) creates "ZERO — Quote requests" in your Drive once and remembers it.
function ss_() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('SHEET_ID');
  if (id) { try { return SpreadsheetApp.openById(id); } catch (err) { /* deleted — make a new one */ } }
  const ss = SpreadsheetApp.create('ZERO — Quote requests');
  props.setProperty('SHEET_ID', ss.getId());
  return ss;
}
function sheet_() {
  const ss = ss_();
  const sh = ss.getSheetByName(SETTINGS.sheetName);
  if (sh) return sh;
  // a brand-new spreadsheet has an empty "Sheet1" — rename it instead of adding a second tab
  const first = ss.getSheets()[0];
  if (ss.getSheets().length === 1 && first.getLastRow() === 0) return first.setName(SETTINGS.sheetName);
  return ss.insertSheet(SETTINGS.sheetName, 0);
}
function folder_() {
  const it = DriveApp.getFoldersByName(SETTINGS.logoFolderName);
  return it.hasNext() ? it.next() : DriveApp.createFolder(SETTINGS.logoFolderName);
}
function saveLogo_(p) {
  if (!p.logo_data) return p.logo_file || '';
  try {
    const m = String(p.logo_data).match(/^data:([^;]+);base64,(.+)$/);
    if (!m) return p.logo_file || '';
    const name = `${(p.club || 'club').replace(/[^\w\- ]+/g, '').slice(0, 40)} — ${p.logo_file || 'logo'}`;
    const file = folder_().createFile(Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], name));
    return file.getUrl();
  } catch (err) { return (p.logo_file || '') + ' (upload failed)'; }
}
// cells starting with = + - @ would run as formulas — prefix them (formula-injection guard)
function clean_(v) {
  if (v instanceof Date) return v;
  const s = String(v == null ? '' : v).slice(0, 45000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function esc_(s) { return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function alert_(d) {
  const sheetUrl = ss_().getUrl();
  const wa = d.phone ? `https://wa.me/${String(d.phone).replace(/\D/g, '')}` : '';
  const row = (k, v) => v ? `<tr><td style="padding:4px 12px 4px 0;color:#777">${k}</td><td style="padding:4px 0"><b>${esc_(v)}</b></td></tr>` : '';
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px">
    <h2 style="margin:0 0 10px">New quote request — ${esc_(d.club)}</h2>
    <table>${row('Name', d.name)}${row('Email', d.email)}${row('Phone', d.phone)}${row('Sport', d.sport)}${row('Players', d.team_size)}${row('Needed by', d.needed_by)}${row('Language', d.language)}${row('Source', d.source)}</table>
    ${d.message ? `<p style="white-space:pre-wrap;border-left:3px solid #e1141f;padding-left:10px">${esc_(d.message)}</p>` : ''}
    ${d.kit_summary ? `<p style="white-space:pre-wrap;background:#f4f4f4;padding:10px"><b>My Kit</b><br>${esc_(d.kit_summary)}</p>` : ''}
    ${d.logo && /^https?:/.test(d.logo) ? `<p><a href="${d.logo}">Open the uploaded logo</a></p>` : ''}
    <p><a href="mailto:${esc_(d.email)}">Reply by email</a>${wa ? ` · <a href="${wa}">Reply on WhatsApp</a>` : ''} · <a href="${sheetUrl}">Open the requests sheet</a></p></div>`;
  MailApp.sendEmail({ to: SETTINGS.salesEmail, subject: `New quote request — ${d.club} (${d.sport || 'kit'})`, htmlBody: html, replyTo: d.email, name: SETTINGS.fromName });
}

// ── buyer confirmation: branded HTML (+ plain-text fallback), in the buyer's language ──
const MAIL_TEXT = {
  en: { subject: 'We received your kit request — ZERO Teamwear', pre: 'Your free 3D mockup is on its way.', kicker: 'Request received', title: 'Thanks, {first}!',
    intro: 'We’ve got your request for <b>{club}</b>. Here’s what happens next:',
    steps: [['Within 1 working day', 'A kit specialist gets in touch to go through colours, crest and sponsors.'], ['Within 48 hours', 'You receive your free 3D mockup — we change anything until it’s right.'], ['3–4 weeks', 'Once you approve, we produce and deliver your kit.']],
    summary: 'Your request', club: 'Club', sport: 'Sport', players: 'Players', when: 'Needed by', kit: 'My Kit',
    reply: 'Reply with crest & colours', wa: 'Chat on WhatsApp', note: 'Just reply to this email to add anything — your crest, sponsor logos or colour ideas.', site: 'Visit our website', sign: 'The ZERO Teamwear team' },
  de: { subject: 'Eure Trikot-Anfrage ist da — ZERO Teamwear', pre: 'Euer kostenloses 3D-Mockup ist unterwegs.', kicker: 'Anfrage erhalten', title: 'Danke, {first}!',
    intro: 'Wir haben eure Anfrage für <b>{club}</b> erhalten. So geht es weiter:',
    steps: [['Innerhalb eines Werktags', 'Ein Trikot-Experte meldet sich, um Farben, Wappen und Sponsoren zu besprechen.'], ['Innerhalb von 48 Stunden', 'Ihr bekommt euer kostenloses 3D-Mockup — wir ändern alles, bis es passt.'], ['3–4 Wochen', 'Nach eurer Freigabe produzieren und liefern wir eure Trikots.']],
    summary: 'Eure Anfrage', club: 'Verein', sport: 'Sportart', players: 'Spieler', when: 'Benötigt bis', kit: 'Mein Kit',
    reply: 'Wappen & Farben senden', wa: 'Per WhatsApp schreiben', note: 'Antwortet einfach auf diese E-Mail, um etwas zu ergänzen — Wappen, Sponsorenlogos oder Farbideen.', site: 'Zur Website', sign: 'Euer ZERO Teamwear Team' },
  bs: { subject: 'Primili smo vaš upit za dresove — ZERO Teamwear', pre: 'Vaš besplatni 3D mockup je na putu.', kicker: 'Upit primljen', title: 'Hvala, {first}!',
    intro: 'Primili smo vaš upit za <b>{club}</b>. Evo šta slijedi:',
    steps: [['U roku od 1 radnog dana', 'Naš stručnjak za dresove javit će se da prođete boje, grb i sponzore.'], ['U roku od 48 sati', 'Dobijate besplatan 3D mockup — mijenjamo sve dok ne bude kako treba.'], ['3–4 sedmice', 'Nakon vašeg odobrenja proizvodimo i isporučujemo vaše dresove.']],
    summary: 'Vaš upit', club: 'Klub', sport: 'Sport', players: 'Igrači', when: 'Potrebno do', kit: 'Moj komplet',
    reply: 'Pošaljite grb i boje', wa: 'Pišite nam na WhatsApp', note: 'Samo odgovorite na ovaj e-mail da nešto dodate — grb, logotipe sponzora ili ideje za boje.', site: 'Posjetite našu stranicu', sign: 'Vaš ZERO Teamwear tim' },
};

/** Builds the confirmation email (pure function — also used for the preview). */
function confirmEmail_(d) {
  const t = MAIL_TEXT[d.language] || MAIL_TEXT.en;
  const first = esc_(String(d.name || '').split(/\s+/)[0] || '');
  const fill = s => s.replace('{first}', first).replace('{club}', esc_(d.club));
  const red = '#e1141f', ink = '#0b0b0d';
  const font = "font-family:'Barlow',Arial,Helvetica,sans-serif;";
  const cond = "font-family:'Barlow Condensed','Arial Narrow',Arial,sans-serif;";
  const row = (k, v) => v ? `<tr><td style="${font}padding:6px 16px 6px 0;color:#6b6b73;font-size:13px;vertical-align:top;white-space:nowrap">${k}</td><td style="${font}padding:6px 0;color:${ink};font-size:14px;font-weight:600">${esc_(v)}</td></tr>` : '';
  const kitLines = String(d.kit_summary || '').split('\n').filter(Boolean)
    .filter(l => !/^(Sizes: To follow|Größen: Folgt|Veličine: Naknadno)/.test(l))
    .map(l => `<div style="${font}font-size:13px;line-height:1.5;color:#2b2b30;padding:2px 0">${esc_(l)}</div>`).join('');
  const btn = (href, label, bg, color) => `<a href="${href}" style="${cond}display:inline-block;padding:13px 22px;margin:0 8px 8px 0;background:${bg};color:${color};font-size:16px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;text-decoration:none">${label} &rarr;</a>`;
  const replyTo = String(SETTINGS.salesEmail).split(',')[0].trim();
  const waBtn = SETTINGS.whatsapp ? btn(`https://wa.me/${SETTINGS.whatsapp}`, t.wa, '#25d366', ink) : '';
  const steps = t.steps.map((st, i) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px"><tr>
      <td style="width:46px;vertical-align:top"><div style="${cond}width:34px;height:34px;line-height:34px;text-align:center;background:${i === 0 ? red : ink};color:#ffffff;font-size:17px;font-weight:800;font-style:italic">0${i + 1}</div></td>
      <td style="vertical-align:top"><div style="${cond}font-size:17px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:${ink}">${st[0]}</div>
      <div style="${font}font-size:14px;line-height:1.5;color:#55555c;margin-top:2px">${st[1]}</div></td></tr></table>`).join('');

  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only">
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;1,800&family=Barlow:wght@400;600&display=swap" rel="stylesheet"></head>
<body style="margin:0;padding:0;background:#ececef">
<div style="display:none;max-height:0;overflow:hidden">${t.pre}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ececef"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff">
  <tr><td style="background:${ink};padding:28px 32px 22px">
    <img src="${SETTINGS.logoUrl}" width="150" alt="ZERO" style="display:block;width:150px;max-width:150px;height:auto;border:0;${cond}font-size:28px;font-weight:800;font-style:italic;color:#ffffff">
  </td></tr>
  <tr><td style="background:${ink};padding:0 32px"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="width:22px;height:5px;background:${red};font-size:0;line-height:0">&nbsp;</td><td style="width:6px;font-size:0">&nbsp;</td>
    <td style="width:22px;height:5px;background:${red};font-size:0;line-height:0">&nbsp;</td><td style="width:6px;font-size:0">&nbsp;</td>
    <td style="width:22px;height:5px;background:${red};font-size:0;line-height:0">&nbsp;</td></tr></table></td></tr>
  <tr><td style="background:${ink};padding:20px 32px 34px">
    <div style="${cond}font-size:13px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:${red}">${t.kicker}</div>
    <div style="${cond}font-size:42px;line-height:1;font-weight:800;font-style:italic;text-transform:uppercase;color:#ffffff;margin-top:8px">${fill(t.title)}</div>
  </td></tr>
  <tr><td style="padding:30px 32px 6px">
    <p style="${font}margin:0 0 20px;font-size:16px;line-height:1.55;color:#2b2b30">${fill(t.intro)}</p>
    ${steps}
  </td></tr>
  <tr><td style="padding:10px 32px 8px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f6;border-left:4px solid ${red}"><tr><td style="padding:18px 20px">
      <div style="${cond}font-size:15px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:${ink};margin-bottom:6px">${t.summary}</div>
      <table role="presentation" cellpadding="0" cellspacing="0">${row(t.club, d.club)}${row(t.sport, d.sport)}${row(t.players, d.team_size)}${row(t.when, d.needed_by)}</table>
      ${kitLines ? `<div style="${cond}font-size:13px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#6b6b73;margin:12px 0 4px">${t.kit}</div>${kitLines}` : ''}
    </td></tr></table>
  </td></tr>
  <tr><td style="padding:22px 32px 4px">
    ${btn(`mailto:${replyTo}?subject=${encodeURIComponent('Re: ' + (d.club || 'Kit request'))}`, t.reply, red, '#ffffff')}${waBtn}
    <p style="${font}margin:8px 0 0;font-size:13px;line-height:1.5;color:#6b6b73">${t.note}</p>
  </td></tr>
  <tr><td style="padding:22px 32px 30px"><p style="${font}margin:0;font-size:14px;color:#2b2b30">${t.sign}</p></td></tr>
  <tr><td style="background:${ink};padding:20px 32px">
    <a href="${SETTINGS.siteUrl}" style="${cond}color:#ffffff;font-size:14px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;text-decoration:none">${t.site} &rarr;</a>
    ${SETTINGS.address ? `<div style="${font}font-size:12px;color:#8a8a92;margin-top:8px">${esc_(SETTINGS.address)}</div>` : ''}
  </td></tr>
</table></td></tr></table></body></html>`;

  const strip = s => s.replace(/<[^>]+>/g, '');
  const text = [strip(fill(t.title)), '', strip(fill(t.intro)), '',
    ...t.steps.map((st, i) => `${i + 1}. ${st[0]} — ${st[1]}`), '',
    `${t.summary}: ${d.club || ''} · ${d.sport || ''} · ${d.team_size || ''} · ${d.needed_by || ''}`,
    d.kit_summary ? `${t.kit}:\n${d.kit_summary}` : '', '', t.note, '', t.sign, SETTINGS.siteUrl].join('\n');
  return { subject: t.subject, html, text };
}

function confirm_(d) {
  const m = confirmEmail_(d);
  MailApp.sendEmail({ to: d.email, subject: m.subject, body: m.text, htmlBody: m.html, name: SETTINGS.fromName, replyTo: String(SETTINGS.salesEmail).split(',')[0].trim() });
}

/** Optional: select this in the editor and ▶ Run to email yourself the confirmation in all three languages. */
function testConfirmation() {
  ['en', 'de', 'bs'].forEach(lang => confirm_({ language: lang, name: 'Kenan Test', club: 'FK Test Club', email: String(SETTINGS.salesEmail).split(',')[0].trim(),
    sport: 'Football', team_size: '20–50', needed_by: 'Within 1–2 months',
    kit_summary: 'Design: Inferno Checks [#c8102e / #141416 / #ffffff]\nOptions: Collar: V-Neck; Logo Application: Stitched Logo; Number Application: Flex Numbers\nSizes: Men M × 12, Men L × 8 — 20 pieces' }));
}
