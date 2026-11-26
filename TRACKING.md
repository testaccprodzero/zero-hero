# ZERO — tracking, leads & consent (what's built, and how to switch it on)

Everything is built and off until a key is pasted. **All keys go in one place:**
`assets/site.js` → `SITE.analytics`, `SITE.lead`, `SITE.whatsapp`.
After editing, bump the `?v=` numbers where `site.js` loads `track.js` / `lead.js`, so browsers fetch the new copy.

| File | Does |
|---|---|
| `assets/track.js` | Cookie banner (EN/DE/BS) + Google Consent Mode v2, loads GA4 / Tag Manager / Clarity **only after consent**, one `track()` helper, UTM + click-ID capture, every site event below |
| `assets/lead.js` | Sends the quote form (demo / **Google Sheet** / HubSpot / webhook) with My Kit + traffic source; spam trap; fires `generate_lead` **only after a successful send** |
| `integrations/google-sheet-leads.gs` | The Google Apps Script behind the Sheet: one row per request, sales alert email, buyer confirmation (EN/DE/BS), logo saved to Drive |
| `assets/site.js` | The settings, WhatsApp links (contact, menu, footer), "Cookie settings" link in every footer |

---

## 1. Switch-on checklist (the "Now" items)

| # | Item | Where | Steps |
|---|---|---|---|
| 1 | **GA4** | analytics.google.com | Create property → Web data stream → copy **Measurement ID** (`G-…`) → `SITE.analytics.ga4`. Admin → Data retention → **14 months**. Admin → Data streams → Enhanced measurement → turn **off** *Form interactions* and *File downloads* (the site sends richer versions). |
| 1 | **Search Console** | search.google.com/search-console | Add the domain, verify by **DNS** (no code needed). Link it to GA4 (GA4 Admin → Product links). |
| 1 | **BigQuery** | GA4 Admin → Product links → BigQuery | Free sandbox link, **daily export**. Turn on from day one — it never backfills. |
| 1 | Tag Manager | tagmanager.google.com | **Not needed now.** GA4 loads directly. Add `GTM-…` later when ad pixels (Meta, LinkedIn) come — every event is already in `dataLayer`. Don't add a GA4 tag in GTM as well, or events count twice. |
| 2 | **Key events** | GA4 Admin → Events | After the first events arrive, mark as key events: `generate_lead` (primary), `click_whatsapp`, `click_to_call`, `click_email`, `file_download`. |
| 3 | **Lead log: Google Sheet** (recommended start) | sheets.google.com + Apps Script | 1. New Sheet "ZERO — Quote requests". 2. **Extensions → Apps Script** → paste `integrations/google-sheet-leads.gs` → set `salesEmail` → Save. 3. Select **setup** → ▶ Run → allow permissions. 4. **Deploy → New deployment → Web app**, Execute as **Me**, Who has access **Anyone** → copy the URL ending in `/exec` → `SITE.lead.sheetUrl`, `mode: 'sheet'`. Every request = one row with a **Status** dropdown (New → Contacted → Mockup sent → Quote sent → Won / Lost / Spam). |
| 4 | **Sales alert + auto-reply** | built into the Sheet script | Alert email to `salesEmail` (with reply-by-email / WhatsApp links); confirmation email to the buyer in their language (`sendConfirmation: true`). Free Gmail limit ≈ 100 emails/day. |
| 5 | **WhatsApp** | WhatsApp Business app (free) | Put the number (digits only, international, e.g. `38761234567`) in `SITE.whatsapp`. Set a greeting + away message in the app. |
| 6 | **Microsoft Clarity** | clarity.microsoft.com (free) | New project → copy the project ID → `SITE.analytics.clarity`. Settings → link to GA4. |
| 7 | **Consent banner** | built in | Already live (EN/DE/BS). "Only necessary" loads nothing. At launch: update the privacy policy (legal.html) to list GA4, Clarity, HubSpot, and the storage below. |
| 8 | **Trust on product pages** | built in | Products page shows: 10+ pieces minimum · 3–4 weeks · 48h free mockup · partner crests. **Certifications**: send me the real ones (e.g. OEKO-TEX) and I'll add them. |
| 9 | **UTMs** | this file, §4 | Every shared link follows the convention; the site keeps first + last source and sends both with each lead. |

**Later — HubSpot** (`mode: 'hubspot'`): when the team wants pipelines and follow-up sequences. Free form API, portal + form ID; the Sheet history can be imported.

**Webhook** (`mode: 'webhook'`): Make (free 1,000 ops/month), n8n, or Formspree. Receives every field as multipart form data **including the logo file** (HubSpot's form API can't take files). Use it when you later want n8n to route leads to HubSpot + WhatsApp alerts.

---

## 2. Events the site sends

Names follow GA4's recommended events where one exists. **No names, emails, phone numbers or club names are ever sent** — those only go to the CRM.

Every event carries `page_type` (home / configurator / inspiration / size_guide / about / shipping / legal / not_found) and `site_language` (en / de / bs).

### Key events (mark in GA4)
| Event | Fires when | Parameters |
|---|---|---|
| `generate_lead` | Quote form sent successfully | `form_id`, `lead_type` (kit / custom_design / factory_visit / size_set / general), `intent`, `sport`, `team_size`, `needed_by`, `kit_parts_filled` (0–3), `value`, `currency`, `lead_mode` |
| `click_whatsapp` | Any WhatsApp link | `link_location` (contact / menu / footer / …) |
| `click_to_call` | Any `tel:` link | `link_location` |
| `click_email` | Any `mailto:` link | `link_location` |
| `file_download` | Size-guide CSV (and any future download) | `file_name`, `file_type` |
| `save_kit` | Exit-intent "keep your kit" email sent (Sheet logs a **Saved kit** row) | `kit_parts_filled` |

### Journey events (the funnel)
| Event | Fires when | Parameters |
|---|---|---|
| `view_item_list` | Inspiration gallery opens | `item_list_name` |
| `view_item` | A partner kit (kit line) or a gallery idea is opened | `item_list_name` (kit_line / inspiration), `items[]` (name, sport, cut) |
| `configurator_start` | First option picked on the products page · first colour change in the gallery · first use of the size planner | `configurator_type` (options / colour / sizes) |
| `configurator_complete` | A recoloured gallery idea is saved | `configurator_type` |
| `add_to_quote` | A part is added to **My Kit** (design / options / sizes / timing) | `kit_part`, `item_name`, `kit_parts_filled` |
| `add_to_wishlist` | Heart on a gallery idea | `item_list_name` |
| `quote_form_start` | First field of the quote form touched (once) | `form_id`, `kit_parts_filled` |
| `form_error` | Required fields missing, or the send failed | `form_id`, `field_name`, `error_type` (required / server) |
| `cta_click` | Any main button | `cta_text`, `cta_location` |
| `custom_nudge_view` | The "Want something one-of-a-kind?" panel appears | — |
| `surprise_me` | Gallery "Surprise me" | — |
| `site_language_change` | EN / DE / BS switch | `language` |
| `form_prefilled` | Quote form opens with answers taken from My Kit (once per page) | `kit_parts_filled` |
| `share_kit` | "Share with your board" in My Kit | `kit_parts_filled` |
| `shared_kit_open` | Someone opens a shared kit link | `kit_parts_filled` |
| `season_banner_click` | Season order-by banner button | — |
| `exit_intent_view` | Exit-intent "keep your kit" panel shown (desktop) | `kit_parts_filled` |

Automatic from GA4 (no work): `page_view`, `session_start`, `first_visit`, `user_engagement`, `scroll`, outbound clicks.

### Register as custom dimensions (GA4 Admin → Custom definitions, scope Event)
`page_type`, `site_language`, `lead_type`, `sport`, `team_size`, `kit_part`, `kit_parts_filled`, `configurator_type`, `link_location`, `cta_location`, `form_id`, `field_name`, `error_type`, `file_type`, `item_list_name` — 15 of the 50 allowed.

### The funnel to build (GA4 → Explore → Funnel exploration, open funnel)
1. `session_start` → 2. `view_item` → 3. `add_to_quote` → 4. `quote_form_start` → 5. `generate_lead`
Break down by **session source / medium** and **device**. Second funnel for the form: `quote_form_start` → `form_error` → `generate_lead`.

---

## 3. What the lead carries into the CRM
Club, name (split into first/last), email, phone, sport, team size, needed by, message, **the full My Kit** (design + colours, every option, the size list), language, page — plus **where they came from**: last and first source/medium/campaign, landing page, `gclid` / `fbclid` / `msclkid`, GA4 client ID.
With the Google Sheet each item gets its own column (and "My Kit" one readable cell). With HubSpot it all lands in the contact's **Message** as one readable note. Later, create HubSpot properties (`sport`, `utm_source`, …) and map them in `lead.js` → `sendHubspot` for filtering and reports.

---

## 4. UTM convention (use on every link you share)
| Parameter | Rule | Examples |
|---|---|---|
| `utm_source` | the platform | `instagram`, `facebook`, `google`, `whatsapp`, `newsletter`, `club_partner` |
| `utm_medium` | the type | `organic_social`, `paid_social`, `cpc`, `email`, `referral`, `qr` |
| `utm_campaign` | `{market}_{sport-or-line}_{goal}` | `ba_football_leads`, `de_volleyball_season26`, `ba_youth_preseason` |
| `utm_content` | which post / ad / QR | `reel_factory_tour`, `story_link`, `kit_line_qr` |

Lowercase, underscores, no spaces. Example: `…/?utm_source=instagram&utm_medium=organic_social&utm_campaign=ba_football_leads&utm_content=bio_link`

---

## 5. Storage & privacy (for the privacy policy)
| Key | Kind | Purpose | Kept |
|---|---|---|---|
| `zeroConsent` | localStorage | the visitor's cookie choice | until changed |
| `zeroKit`, `zeroBuilder`, `zeroShortlist`, `zeroCustomKits` | localStorage | My Kit, builder choices, shortlist (functional) | until cleared |
| `zeroAttr` | sessionStorage; localStorage **only with analytics consent** | traffic source for the lead | 90 days |
| `_ga`, `_ga_*` | cookies (Google) | GA4 — **only after consent** | 14 months |
| `_clck`, `_clsk` | cookies (Microsoft) | Clarity — **only after consent** | up to 1 year |

Consent Mode v2: all four signals start **denied**; Google tags don't even load until "Analytics" is allowed ("basic" mode — the safe choice for Germany/EU).

---

## 6. Testing
- Add `?debug_track` to any URL (or run `ZeroTrack.debug()` in the console) → every event prints in the console, and GA4 shows them in **Admin → DebugView**.
- Test lead without a CRM: keep `mode: 'demo'` — the success screen shows and `generate_lead` fires with `lead_mode: 'demo'` (filter those out in GA4 later).
- Re-open the cookie banner: footer → **Cookie settings**.

## 7. Next ("Soon" in the plan)
Looker Studio dashboard (Overview + Lead sources) · Google Ads + Enhanced Conversions · Meta Pixel / Conversions API via Tag Manager (events already in `dataLayer`) · HubSpot follow-up sequence · quote PDF automation.
