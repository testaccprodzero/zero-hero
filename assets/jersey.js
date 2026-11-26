/* ═══════════════════════════════════════════════════════════
   ZERO — jersey renderer (shared)
   window.ZeroJersey.svg(kit, side, { hanger })
   kit = { cut: 'tee'|'tank', pattern, base, accent, num, number, back, short }
   ═══════════════════════════════════════════════════════════ */
(() => {
  const SHAPES = {
    tee: {
      body: 'M70 14 Q100 32 130 14 L168 28 L197 70 L171 86 L156 72 L157 212 Q100 220 43 212 L44 72 L29 86 L3 70 L32 28 Z',
      neck: 'M70 14 Q100 32 130 14', neckBack: 'M70 14 Q100 22 130 14',
      bar: 'M100 19 L36 31 Q100 25 164 31 Z', inner: 'M70 14 Q100 32 130 14 Q100 22 70 14 Z',
      trims: ['M197 70 L171 86', 'M3 70 L29 86'], trimW: 8,
      num: 142, crest: [130, 62], brand: [60, 64], folds: ['M70 92 Q82 150 66 206', 'M134 100 Q122 160 138 206', 'M100 180 Q112 196 104 214'],
    },
    tank: {
      body: 'M64 10 Q100 46 136 10 L150 12 Q148 56 168 72 L165 212 Q100 220 35 212 L32 72 Q52 56 50 12 Z',
      neck: 'M64 10 Q100 46 136 10', neckBack: 'M64 10 Q100 30 136 10',
      bar: 'M100 26 L56 30 Q100 30 144 30 Z', inner: 'M64 10 Q100 46 136 10 Q100 30 64 10 Z',
      trims: ['M150 12 Q148 56 168 72', 'M50 12 Q52 56 32 72'], trimW: 6,
      num: 148, crest: [124, 72], brand: [70, 76], folds: ['M66 100 Q78 154 62 206', 'M136 104 Q124 160 140 206'],
    },
  };

  // wavy band: top edge at y, thickness h
  const wave = (y, h) => {
    const bulge = i => (i % 2 ? 9 : -9);
    let d = `M-10 ${y}`;
    for (let x = -10, i = 0; x < 210; x += 30, i++) d += ` Q${x + 15} ${y + bulge(i)} ${x + 30} ${y}`;
    d += ` L230 ${y + h}`;
    for (let x = 230, i = 7; x > -10; x -= 30, i--) d += ` Q${x - 15} ${y + h + bulge(i)} ${x - 30} ${y + h}`;
    return d + ' Z';
  };

  const PATTERNS = {
    stripes: k => [56, 88, 120, 152].map(x => `<rect x="${x - 8}" y="-40" width="16" height="300" fill="${k.accent}"/>`).join(''),
    pinstripes: k => Array.from({ length: 19 }, (_, i) => `<rect x="${i * 11 - 2}" y="-40" width="2.4" height="300" fill="${k.accent}" opacity=".85"/>`).join(''),
    hoops: k => [52, 96, 140, 184].map(y => `<rect x="0" y="${y}" width="200" height="20" fill="${k.accent}"/>`).join(''),
    sash: k => `<path d="M20 10 L64 -10 L200 190 L200 240 L170 240 Z" fill="${k.accent}"/>`,
    halves: k => `<rect x="100" y="-40" width="100" height="300" fill="${k.accent}"/>`,
    split: k => `<path d="M0 -40 L200 -40 L0 230 Z" fill="${k.accent}"/>`,
    chevron: k => `<path d="M0 58 L100 118 L200 58 L200 86 L100 146 L0 86 Z" fill="${k.accent}"/>`,
    fade: (k, id) => `<linearGradient id="fd${id}" x1="0" y1="0" x2="0" y2="1"><stop offset=".35" stop-color="${k.accent}" stop-opacity="0"/><stop offset="1" stop-color="${k.accent}"/></linearGradient><rect x="0" y="-40" width="200" height="300" fill="url(#fd${id})"/>`,
    slashes: k => `<g fill="${k.accent}"><path d="M14 168 L118 56 L134 64 L32 180 Z"/><path d="M96 220 L196 100 L206 120 L118 232 Z"/><path d="M150 40 L190 0 L198 10 L160 52 Z"/></g><path d="M0 120 L80 30 L88 36 L10 130 Z" fill="${k.accent}" opacity=".45"/>`,
    // ── added patterns ──
    checks: k => { let r = ''; for (let x = 0; x < 200; x += 25) for (let y = -40; y < 260; y += 25) if (((x + y + 40) / 25) % 2 === 0) r += `<rect x="${x}" y="${y}" width="25" height="25" fill="${k.accent}"/>`; return r; },
    band: k => `<rect x="0" y="58" width="200" height="34" fill="${k.accent}"/><rect x="0" y="98" width="200" height="4" fill="${k.accent}"/>`,
    centre: k => `<rect x="84" y="-40" width="32" height="300" fill="${k.accent}"/><rect x="76" y="-40" width="3" height="300" fill="${k.accent}"/><rect x="121" y="-40" width="3" height="300" fill="${k.accent}"/>`,
    waves: k => [60, 118, 176].map(y => `<path d="${wave(y, 16)}" fill="${k.accent}"/>`).join(''),
    sleeves: k => `<rect x="-10" y="-40" width="55" height="300" fill="${k.accent}"/><rect x="155" y="-40" width="55" height="300" fill="${k.accent}"/>`,
    yoke: k => `<path d="M-10 -40 L210 -40 L210 64 L100 84 L-10 64 Z" fill="${k.accent}"/>`,
    zigzag: k => `<path d="M-10 100 L20 80 L50 100 L80 80 L110 100 L140 80 L170 100 L200 80 L230 100 L230 124 L200 104 L170 124 L140 104 L110 124 L80 104 L50 124 L20 104 L-10 124 Z" fill="${k.accent}"/>`,
    diamonds: k => { let r = ''; for (let y = 30; y < 260; y += 44) for (let x = (y / 44 % 2 ? 22 : 0); x < 220; x += 44) r += `<path d="M${x} ${y - 18} L${x + 14} ${y} L${x} ${y + 18} L${x - 14} ${y} Z" fill="${k.accent}"/>`; return r; },
    sidepanels: k => `<path d="M-10 -40 L58 -40 L58 260 L-10 260 Z M142 -40 L210 -40 L210 260 L142 260 Z" fill="${k.accent}"/><rect x="62" y="-40" width="3" height="300" fill="${k.accent}"/><rect x="135" y="-40" width="3" height="300" fill="${k.accent}"/>`,
    pinhoops: k => Array.from({ length: 22 }, (_, i) => `<rect x="0" y="${i * 11 - 20}" width="200" height="3" fill="${k.accent}" opacity=".8"/>`).join(''),
    bolt: k => `<path d="M128 -40 L160 -40 L118 92 L150 92 L66 260 L34 260 L92 124 L58 124 Z" fill="${k.accent}"/>`,
    pixels: k => {
      let r = '';
      for (let x = 0; x < 200; x += 10) for (let y = 80; y < 240; y += 10) {
        const t = (y - 80) / 160, n = ((x * 37 + y * 91) % 100) / 100; // fixed pseudo-random, denser towards the hem
        if (n < t * 1.15) r += `<rect x="${x}" y="${y}" width="10" height="10" fill="${k.accent}"/>`;
      }
      return r;
    },
  };
  let uid = 0;
  function svg(k, side = 'front', opts = {}) {
    const s = SHAPES[k.cut], id = 'zj' + (uid++), front = side !== 'back', hanger = opts.hanger !== false;
    const textStroke = 'stroke="rgba(0,0,0,.35)" stroke-width="3" paint-order="stroke"';
    const vb = hanger ? '0 -40 200 260' : '-4 0 208 226';
    // the back of the shirt is cut with the higher back neckline, not the front scoop
    const body = front ? s.body : s.body.replace(s.neck, s.neckBack);
    const pattern = PATTERNS[k.pattern] || PATTERNS.stripes;
    return `<svg viewBox="${vb}" aria-hidden="true">
      <defs>
        <clipPath id="c${id}"><path d="${body}"/></clipPath>
        <linearGradient id="sh${id}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset=".22" stop-color="#000" stop-opacity="0"/>
          <stop offset=".46" stop-color="#fff" stop-opacity=".12"/><stop offset=".62" stop-color="#fff" stop-opacity="0"/>
          <stop offset="1" stop-color="#000" stop-opacity=".55"/>
        </linearGradient>
        <linearGradient id="sv${id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/>
        </linearGradient>
      </defs>
      ${hanger ? `<path d="M100 24 V-18 C100 -36 118 -36 118 -22" fill="none" stroke="#cfd0d6" stroke-width="3.2" stroke-linecap="round"/>
      <path d="${s.bar}" fill="#3b3b42" stroke="#55555e" stroke-width="1.5" stroke-linejoin="round"/>` : ''}
      <g clip-path="url(#c${id})">
        <rect x="0" y="-40" width="200" height="300" fill="${k.base}"/>
        ${k.flip ? `<g transform="translate(200 0) scale(-1 1)">${pattern(k, id)}</g>` : pattern(k, id)}
        ${s.folds.map(d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="4" stroke-linecap="round"/>`).join('')}
        <rect x="0" y="-40" width="200" height="300" fill="url(#sh${id})"/>
        <rect x="0" y="-40" width="200" height="300" fill="url(#sv${id})"/>
      </g>
      ${front ? `<path d="${s.inner}" fill="${k.base}"/><path d="${s.inner}" fill="#000" fill-opacity=".45"/>` : ''}
      <path d="${front ? s.neck : s.neckBack}" fill="none" stroke="${k.trim || (k.accent === k.base ? k.num : k.accent)}" stroke-width="6" stroke-linecap="round"/>
      ${s.trims.map(d => `<path d="${d}" fill="none" stroke="${k.trim || k.accent}" stroke-width="${s.trimW}"/>`).join('')}
      ${front ? `
        <text x="100" y="${s.num}" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="58" fill="${k.num}" ${textStroke}>${k.number}</text>
        <circle cx="${s.crest[0]}" cy="${s.crest[1]}" r="10" fill="${k.accent}" stroke="${k.num}" stroke-width="1.5"/>
        <text x="${s.crest[0]}" y="${s.crest[1] + 3}" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="7.5" fill="${k.num}">${k.short || ''}</text>
        <text x="${s.brand[0]}" y="${s.brand[1]}" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-style="italic" font-weight="800" font-size="10" fill="${k.num}" opacity=".9">ZERO</text>`
      : `
        <text x="100" y="${s.num - 66}" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="19" letter-spacing="2" fill="${k.num}" ${textStroke}>${k.back || ''}</text>
        <text x="100" y="${s.num + 24}" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="88" fill="${k.num}" ${textStroke}>${k.number}</text>`}
    </svg>`;
  }
  window.ZeroJersey = { svg, patterns: Object.keys(PATTERNS) };
})();
