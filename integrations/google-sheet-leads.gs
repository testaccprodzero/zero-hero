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
  sendConfirmation: true,                 // email the buyer a "we got your request" note in their language
  replyHours: 'one working day',          // used in the confirmation text
  logoFolderName: 'ZERO — Club logos',    // Drive folder for uploaded crests (created automatically)
  sheetName: 'Requests',
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

function confirm_(d) {
  const first = String(d.name || '').split(/\s+/)[0];
  const T = {
    en: { s: 'We received your kit request — ZERO Teamwear', b: `Hi ${first},\n\nthanks for your request for ${d.club}. A kit specialist will get back to you within ${SETTINGS.replyHours}, and your free 3D mockup follows within 48 hours.\n\nJust reply to this email if you'd like to add anything — colours, sponsors or your crest.\n\nZERO Teamwear` },
    de: { s: 'Eure Trikot-Anfrage ist da — ZERO Teamwear', b: `Hallo ${first},\n\ndanke für eure Anfrage für ${d.club}. Ein Trikot-Experte meldet sich innerhalb eines Werktags, euer kostenloses 3D-Mockup folgt innerhalb von 48 Stunden.\n\nAntwortet einfach auf diese E-Mail, wenn ihr noch etwas ergänzen möchtet — Farben, Sponsoren oder euer Wappen.\n\nZERO Teamwear` },
    bs: { s: 'Primili smo vaš upit za dresove — ZERO Teamwear', b: `Zdravo ${first},\n\nhvala na upitu za ${d.club}. Naš stručnjak za dresove javit će vam se u roku od jednog radnog dana, a besplatan 3D mockup stiže u roku od 48 sati.\n\nSamo odgovorite na ovaj e-mail ako želite nešto dodati — boje, sponzore ili grb.\n\nZERO Teamwear` },
  };
  const t = T[d.language] || T.en;
  MailApp.sendEmail({ to: d.email, subject: t.s, body: t.b, name: SETTINGS.fromName, replyTo: String(SETTINGS.salesEmail).split(',')[0].trim() });
}
