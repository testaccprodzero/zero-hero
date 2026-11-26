/* ═══════════════════════════════════════════════════════════
   ZERO — language + SEO build
   English pages in the project root are the source of truth.

   node i18n/build.mjs extract   → i18n/todo.json: texts that still need translating
   node i18n/build.mjs build     → writes /de/*.html and /bs/*.html, refreshes the SEO
                                   block in every page, sitemap.xml and robots.txt

   Only whole texts are replaced (a text node, an attribute value, or a complete
   JS string / template piece), so code and class names are never touched.
   ═══════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ── site settings ─────────────────────────────────────────────
const SITE_URL = 'https://www.zero-teamwear.example'; // TODO: real domain at launch
const INDEXABLE = false;                               // TODO: true at launch (removes noindex)
const LANGS = { en: 'en_GB', de: 'de_DE', bs: 'bs_BA' };
const TARGETS = ['de', 'bs'];
const PAGES = {
  'index.html':      { title: 'ZERO — Custom Sportswear for Teams & Clubs', desc: 'Custom teamwear for clubs: free 3D kit design in 48 hours, own factory, orders from 10 pieces and delivery in 3–4 weeks.', priority: '1.0' },
  'products.html':   { title: 'Customisation Options — ZERO Teamwear', desc: 'Every collar, sleeve, cuff, hem, panel, fit, branding position and fabric for your club kit — drawn live in an interactive spec sheet.', priority: '0.9' },
  'gallery.html':    { title: 'Kit Inspiration — ZERO Teamwear', desc: 'Browse kit ideas by sport, colour and pattern, save your favourites and send them with your quote.', priority: '0.8' },
  'size-guide.html': { title: 'Size Guide — ZERO Teamwear', desc: 'Find the right size in seconds and plan sizes for your whole squad — youth 116 to adult 5XL, women\'s cuts included.', priority: '0.7' },
  'about.html':      { title: 'About ZERO — Made By Us, Start To Finish', desc: 'Take the factory tour: how every ZERO kit is designed, cut, printed, sewn, checked and shipped under one roof.', priority: '0.7' },
  'shipping.html':   { title: 'Shipping & Returns — ZERO Teamwear', desc: 'Delivery date calculator, shipping rates across Europe, and our returns and free remake policy.', priority: '0.6' },
  'legal.html':      { title: 'Legal — Imprint, Privacy & Terms · ZERO Teamwear', desc: 'Imprint, privacy policy and terms and conditions of ZERO Teamwear.', priority: '0.3' },
};
const OG_IMAGE = `${SITE_URL}/assets/og-image.jpg`;

// ── helpers ───────────────────────────────────────────────────
const decode = s => s.replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const norm = s => decode(s).replace(/\s+/g, ' ').trim();
const encText = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const encAttr = s => encText(s).replace(/"/g, '&quot;');
const hasWords = s => /[A-Za-zÀ-ž]{2,}/.test(s);
const keep = (raw, rep) => raw.match(/^\s*/)[0] + rep + raw.match(/\s*$/)[0];

// all i18n/translations*.json files are merged: { "English text": { "de": "…", "bs": "…" } }
let DICT = {};
for (const f of fs.readdirSync(path.join(ROOT, 'i18n')).filter(f => /^translations.*\.json$/.test(f)).sort()) {
  Object.assign(DICT, JSON.parse(fs.readFileSync(path.join(ROOT, 'i18n', f), 'utf8')));
}
const missing = new Map(); // key → Set(files)
// JS strings that are also code (keyboard keys etc.) — never translate these inside scripts
const JS_STOP = new Set(['Home', 'End', 'Enter', 'Escape', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'cm', 'in']);

function tr(raw, lang, file, kind) {
  const key = norm(raw);
  if (!key || !hasWords(key)) return null;
  if (kind === 'js' && JS_STOP.has(key)) return null;
  const hit = DICT[key];
  if (hit && lang === 'extract') return null; // already translated
  if (hit && hit[lang] != null) return hit[lang];
  if (lang === 'extract' && looksLikeText(key, kind)) { if (!missing.has(key)) missing.set(key, new Set()); missing.get(key).add(file); }
  return null;
}
function looksLikeText(k, kind) {
  if (kind === 'text' || kind === 'attr') return true;
  // JS strings: skip things that look like code
  if (/^[.#\[:@/]|=>|^[a-z0-9_-]+$|^[a-z]+[A-Z]\w*$|^(https?:|mailto:|tel:)|\(|\)|^\$|^--|;/.test(k)) return false;
  return /\s/.test(k) || /^[A-ZÄÖÜ]/.test(k);
}

// ── HTML ──────────────────────────────────────────────────────
function translateHtmlFragment(html, lang, file) {
  return html.replace(/<!--[\s\S]*?-->|<script\b([^>]*)>([\s\S]*?)<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<[^>]+>|[^<]+/g, (m, sAttrs, sBody) => {
    if (m.startsWith('<!--') || m.startsWith('<style')) return m;
    if (m.startsWith('<script')) {
      if (/\bsrc=|application\/ld\+json/.test(sAttrs || '')) return m;
      return `<script${sAttrs}>${translateJs(sBody, lang, file)}</script>`;
    }
    if (m.startsWith('<')) {
      return m.replace(/\b(alt|aria-label|placeholder|title)="([^"]*)"/g, (a, name, val) => {
        const t = tr(val, lang, file, 'attr');
        return t == null ? a : `${name}="${encAttr(t)}"`;
      });
    }
    const t = tr(m, lang, file, 'text');
    return t == null ? m : keep(m, encText(t));
  });
}

// ── JavaScript (string literals + template pieces) ────────────
function translatePiece(piece, lang, file) {
  if (/[<>]/.test(piece)) {
    // HTML inside a JS string: translate the text between tags (and attribute values)
    return piece.split(/(<[^>]*>)/).map(seg => {
      if (seg.startsWith('<')) return seg.replace(/\b(alt|aria-label|placeholder|title)="([^"$]*)"/g, (a, n, v) => { const t = tr(v, lang, file, 'attr'); return t == null ? a : `${n}="${encAttr(t)}"`; });
      const t = tr(seg, lang, file, 'jshtml');
      return t == null ? seg : keep(seg, encText(t));
    }).join('');
  }
  const t = tr(piece, lang, file, 'js');
  return t == null ? piece : keep(piece, t);
}
// translations are written as JS source text (so "\n" in a translation stays a newline escape)
function esc(s, q) { return s.replace(new RegExp(q, 'g'), '\\' + q).replace(q === '`' ? /\$\{/g : /$^/, '\\${'); }

function translateJs(code, lang, file) {
  let out = '', i = 0;
  const n = code.length;
  while (i < n) {
    const c = code[i], d = code[i + 1];
    if (c === '/' && d === '/') { const e = code.indexOf('\n', i); const j = e < 0 ? n : e; out += code.slice(i, j); i = j; continue; }
    if (c === '/' && d === '*') { const e = code.indexOf('*/', i + 2); const j = e < 0 ? n : e + 2; out += code.slice(i, j); i = j; continue; }
    if (c === "'" || c === '"') {
      let j = i + 1, s = '';
      while (j < n && code[j] !== c) { if (code[j] === '\\') { s += code[j] + code[j + 1]; j += 2; } else s += code[j++]; }
      const raw = s.replace(/\\(['"\\])/g, '$1');
      const t = translatePiece(raw, lang, file);
      out += c + (t === raw ? s : esc(t, c)) + c; i = j + 1; continue;
    }
    if (c === '`') { const [txt, j] = readTemplate(code, i + 1, lang, file); out += '`' + txt + '`'; i = j + 1; continue; }
    out += c; i++;
  }
  return out;
}
function readTemplate(code, i, lang, file) {
  let out = '', chunk = '';
  const flush = () => {
    if (chunk) { const raw = chunk; const t = translatePiece(raw, lang, file); out += t === raw ? raw : esc(t, '`'); chunk = ''; }
  };
  while (i < code.length) {
    const c = code[i];
    if (c === '\\') { chunk += c + code[i + 1]; i += 2; continue; }
    if (c === '`') { flush(); return [out, i]; }
    if (c === '$' && code[i + 1] === '{') {
      flush();
      let depth = 1, j = i + 2, expr = '';
      while (j < code.length && depth) {
        const ch = code[j];
        if (ch === "'" || ch === '"') { let k = j + 1; while (k < code.length && code[k] !== ch) k += code[k] === '\\' ? 2 : 1; expr += code.slice(j, k + 1); j = k + 1; continue; }
        if (ch === '`') { const [, k] = readTemplate(code, j + 1, 'none', file); expr += code.slice(j, k + 1); j = k + 1; continue; }
        if (ch === '{') depth++;
        if (ch === '}') { depth--; if (!depth) break; }
        expr += ch; j++;
      }
      out += '${' + translateJs(expr, lang, file) + '}';
      i = j + 1; continue;
    }
    chunk += c; i++;
  }
  flush();
  return [out, i];
}

// ── SEO block ─────────────────────────────────────────────────
function urlFor(lang, file) { return `${SITE_URL}/${lang === 'en' ? '' : lang + '/'}${file === 'index.html' ? '' : file}`; }
function t(lang, s) { return lang === 'en' ? s : (DICT[norm(s)] && DICT[norm(s)][lang]) || s; }
function seoBlock(file, lang) {
  const p = PAGES[file];
  const title = t(lang, p.title), desc = t(lang, p.desc);
  const alts = Object.keys(LANGS).map(l => `  <link rel="alternate" hreflang="${l}" href="${urlFor(l, file)}" />`).join('\n');
  const ld = file === 'index.html' ? `
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Organization', name: 'ZERO Teamwear', url: `${SITE_URL}/`,
    logo: `${SITE_URL}/assets/zero-logo.png`, sameAs: [], // TODO: social profile URLs
  })}</script>` : '';
  // first visit to an English page: send German / Bosnian-Croatian-Serbian browsers to their language,
  // once per session, never against an explicit choice (zeroLang is saved by site.js on the EN/DE/BS switch)
  const langRedirect = lang === 'en' ? `
  <script>(function(){try{var l=localStorage.getItem('zeroLang');if(!l){if(sessionStorage.getItem('zeroLangAuto'))return;sessionStorage.setItem('zeroLangAuto','1');var n=navigator.languages||[navigator.language||''];for(var i=0;i<n.length&&!l;i++){var c=String(n[i]).slice(0,2).toLowerCase();if(c==='en')l='en';else if(c==='de')l='de';else if(c==='bs'||c==='hr'||c==='sr'||c==='sh')l='bs';}}if((l==='de'||l==='bs')&&!/[?&]lang=en/.test(location.search))location.replace(location.pathname.replace(/[^\\/]*$/,function(m){return l+'/'+m;})+location.search+location.hash);}catch(e){}})();</script>` : '';
  return `<!-- seo (generated by i18n/build.mjs — edit PAGES there) -->${langRedirect}
  <meta name="description" content="${encAttr(desc)}" />
  <meta name="robots" content="${INDEXABLE ? 'index, follow' : 'noindex, nofollow'}" />
  <link rel="canonical" href="${urlFor(lang, file)}" />
${alts}
  <link rel="alternate" hreflang="x-default" href="${urlFor('en', file)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="ZERO Teamwear" />
  <meta property="og:title" content="${encAttr(title)}" />
  <meta property="og:description" content="${encAttr(desc)}" />
  <meta property="og:url" content="${urlFor(lang, file)}" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="${LANGS[lang]}" />
${Object.entries(LANGS).filter(([l]) => l !== lang).map(([, loc]) => `  <meta property="og:locale:alternate" content="${loc}" />`).join('\n')}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="theme-color" content="#08080a" />${ld}
  <!-- /seo -->`;
}
function applySeo(html, file, lang) {
  html = html.replace(/\s*<meta name="robots"[^>]*>/, '');
  if (/<!-- seo[\s\S]*?<!-- \/seo -->/.test(html)) return html.replace(/<!-- seo[\s\S]*?<!-- \/seo -->/, seoBlock(file, lang));
  return html.replace(/(<title>[\s\S]*?<\/title>)/, `$1\n  ${seoBlock(file, lang)}`);
}

// ── commands ──────────────────────────────────────────────────
const cmd = process.argv[2] || 'build';
const files = Object.keys(PAGES);

if (cmd === 'extract') {
  for (const f of [...files, '404.html']) translateHtmlFragment(fs.readFileSync(path.join(ROOT, f), 'utf8'), 'extract', f);
  for (const p of Object.values(PAGES)) { [p.title, p.desc].forEach(s => { if (!DICT[norm(s)]) { if (!missing.has(norm(s))) missing.set(norm(s), new Set()); missing.get(norm(s)).add('SEO'); } }); }
  const todo = Object.fromEntries([...missing].map(([k, v]) => [k, [...v].join(', ')]));
  fs.writeFileSync(path.join(ROOT, 'i18n', 'todo.json'), JSON.stringify(todo, null, 1));
  console.log(`${missing.size} texts without translation → i18n/todo.json`);
} else {
  let pages = 0;
  for (const f of files) {
    const src = path.join(ROOT, f);
    let html = fs.readFileSync(src, 'utf8');
    html = applySeo(html, f, 'en');
    fs.writeFileSync(src, html);
    for (const lang of TARGETS) {
      let out = translateHtmlFragment(html, lang, f);
      out = applySeo(out, f, lang)
        .replace(/<html lang="en">/, `<html lang="${lang}">`)
        .replace(/(["'(`])assets\//g, '$1../assets/');
      fs.mkdirSync(path.join(ROOT, lang), { recursive: true });
      fs.writeFileSync(path.join(ROOT, lang, f), out);
      pages++;
    }
  }
  // translated 404 pages (root-absolute paths, links into the same language)
  {
    const src404 = fs.readFileSync(path.join(ROOT, '404.html'), 'utf8');
    for (const lang of TARGETS) {
      const out = translateHtmlFragment(src404, lang, '404.html')
        .replace(/<html lang="en">/, `<html lang="${lang}">`)
        .replace(/href="\/(index|products|size-guide|about)\.html/g, `href="/${lang}/$1.html`)
        .replace(/(["'(`])assets\//g, '$1../assets/'); // relative assets (site.js) resolve from the language folder via <base>
      fs.writeFileSync(path.join(ROOT, lang, '404.html'), out);
      pages++;
    }
  }
  // sitemap with language alternates
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${files.flatMap(f => Object.keys(LANGS).map(l => `  <url>
    <loc>${urlFor(l, f)}</loc>
${Object.keys(LANGS).map(a => `    <xhtml:link rel="alternate" hreflang="${a}" href="${urlFor(a, f)}" />`).join('\n')}
    <priority>${PAGES[f].priority}</priority>
  </url>`)).join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\n${INDEXABLE ? 'Allow: /' : 'Disallow: /'}\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  console.log(`built ${pages} translated pages, SEO for ${files.length} source pages, sitemap.xml, robots.txt`);
}
