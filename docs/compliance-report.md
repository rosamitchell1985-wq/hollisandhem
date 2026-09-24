# Phase 9 — Compliance Audit

Every checklist item from [`research-notes.md`](./research-notes.md), verified
against the built site. Each row states how it was checked, not just whether it
passed.

**Audited:** September 2026
**Result:** 64 pass · 0 fail · 1 deferred (HTTPS, which only a live deployment
can supply).

> **Identity values are fictional.** The store trades as **Hollis & Hem LLC**,
> **412 Foundry Lane, Suite 210, Portland, OR 97209**, incorporated in
> **Oregon**, on **hollisandhem.com** with support@, orders@ and privacy@
> inboxes. Those are demo values for an invented company, published so the
> site is structurally complete and testable. They satisfy the *shape* of the
> identity requirements — one name, one address, one governing state, identical
> on all 15 pages — but they are not a real business, and the site says so in
> its footer, on the About page and in the Terms. Replace them before trading
> or advertising; `SETUP.md` §2 lists every location.

## How the checks were run

| Tool | Command | Result |
| --- | --- | --- |
| Link, structure and policy audit | `node scripts/link-check.mjs` | 14 checks pass, 0 fail, 0 warn |
| Shared-shell consistency | `node scripts/inject-shell.mjs --check` | 15 pages, 0 drift |
| Prose mechanics | `node scripts/prose-check.mjs` | No faults found |
| Color contrast | `node scripts/contrast-check.mjs` | 22/22 pairs meet AA |
| Live browser pass | Chromium via Playwright, real page loads | 0 console errors, 0 warnings |
| Responsive sweep | 15 pages × 7 widths (320–1440px) | No horizontal overflow anywhere |

Screenshots taken during the audit are in [`screenshots/`](./screenshots/):
[home, desktop](./screenshots/home-desktop.jpg) ·
[home, mobile](./screenshots/home-mobile.jpg) ·
[product detail](./screenshots/product-detail.jpg) ·
[checkout failure](./screenshots/checkout-payment-failed.jpg) ·
[published business identity](./screenshots/contact-business-details.jpg).

---

## 1. Misrepresentation

| # | Requirement | Result | Evidence |
| --- | --- | --- | --- |
| M1 | One consistent business name on every page | **PASS** | `link-check.mjs` asserts the store name appears on all 15 pages; header and footer come from one source file |
| M2 | Contact details identical everywhere | **PASS** | Script asserts registered name, mailing address, support email, orders email, phone, hours and country on all 15 pages — a half-finished rename fails the audit |
| M3 | Brand story stated, no invented credentials | **PASS** | `about.html` tells the founding story and explicitly declines to claim certifications it does not hold |
| M4 | USD prices consistent across listing, detail, cart, checkout | **PASS** | Single source (`products.js`); browser test: Ainsley trench $188.00 identical on shop tile, product page, cart line and checkout summary |
| M5 | Shipping costs and threshold disclosed before checkout | **PASS** | Announcement bar, product page, shop footer band, cart table, and shipping policy all read from `SHIPPING_RATES` |
| M6 | Sales tax disclosed before checkout | **PASS** | Cart shows "Calculated at checkout"; checkout summary shows an estimated tax line ($12.47 on a $172.00 subtotal in the live test) |
| M7 | Full return terms on a dedicated page | **PASS** | `policies/refund-policy.html`: 11 sections including a who-pays-return-shipping table |
| M8 | No subscription, auto-renewal or hidden recurring charge | **PASS** | Terms section 6 states the store sells one-time purchases only; no recurring language anywhere |
| M9 | Demo status disclosed, not concealed | **PASS** | Checkout banner, `about.html#demo`, footer note on every page, FAQ payments answer. The footer note and the About page both state that the company name, address and phone number are demo values for a fictional business |
| M10 | Business identity published in full | **PASS** (demo values) | Registered name, mailing address and state of incorporation appear in the footer of all 15 pages, on the Contact page, in all five policies, and in the `Organization` / `ContactPage` JSON-LD as a `PostalAddress` |

## 2. Destination requirements

| # | Requirement | Result | Evidence |
| --- | --- | --- | --- |
| D1 | No broken internal links | **PASS** | 984 internal references resolved, 0 broken; every `product.html?id=` checked against the catalog |
| D1b | In-page anchors resolve | **PASS** | All `#fragment` targets exist on the page they point to |
| D2 | No stub pages | **PASS** | Every page carries multiple finished sections; the shortest (404) still offers nine destinations |
| D3 | Custom 404 with a route back | **PASS** | `404.html`; the preview server also serves it for unknown paths |
| D4 | Real `.html` routes, crawlable, back button works | **PASS** | No client-side router; all navigation is plain `<a href>` |
| D5 | Modest page weight, sized and lazy-loaded images | **PASS** | HTML 15–28 KB per page; CSS 50 KB; JS 118 KB total. Every image carries width/height; everything below the fold is `loading="lazy"`, hero is `fetchpriority="high"` |
| D6 | Mobile-friendly, no horizontal scroll | **PASS** | Viewport meta on all pages; 105 page/width combinations tested, zero overflow |
| D7 | No blocking interstitials | **PASS** | Cookie notice is a dismissible bottom bar; no modal, no overlay on arrival |
| D8 | Core content renders without JavaScript | **PASS** | Header, nav, footer, contact details and all policy text are static HTML; `shop.html` carries a `<noscript>` list linking to all 30 products |

## 3. Editorial and professional requirements

| # | Requirement | Result | Evidence |
| --- | --- | --- | --- |
| E1 | No lorem ipsum, TODO or filler | **PASS** | `link-check.mjs` scans visible copy for five placeholder patterns; zero matches |
| E2 | US English throughout | **PASS** | `prose-check.mjs` scans for 15 non-US spellings; three were found during the audit ("grey" ×5, "enquiries") and fixed |
| E3 | No typed ALL-CAPS in copy | **PASS** | Capitals come from `text-transform` in CSS; the one uppercase placeholder in the Terms was rewritten during this audit |
| E4 | No excessive punctuation or symbol substitution | **PASS** | `!{2,}` pattern in the audit script; zero matches |
| E5 | No superlative or unverifiable claims | **PASS** | Audit scans for "#1", "world's best", "guaranteed results", "miracle"; zero matches |
| E6 | No fake urgency | **PASS** | Audit scans for "only N left", "N people are viewing", "hurry", "act now", "selling fast", deadline timers; zero matches |
| E7 | Reviews labeled as samples, no fabricated identities | **PASS** | Home page reviews are captioned "Sample customer comment"; no names, no headshots, and an explanatory note under the block |
| E8 | Unique description, fabric and fit per product | **PASS** | All 30 products carry individually written summary, description, fabric, care, fit and a three-item detail list |

## 4. Shopping ads / checkout specifics

| # | Requirement | Result | Evidence |
| --- | --- | --- | --- |
| S1 | Displayed price excludes tax; tax shown separately | **PASS** | Product page states it; checkout shows its own estimated-tax line |
| S2 | Shipping itemized with named service levels | **PASS** | Standard / Expedited / Overnight with prices and estimates in cart, checkout, product page and policy |
| S3 | Guest checkout, no account or app | **PASS** | No login exists anywhere; FAQ item 17 confirms it |
| S4 | Only necessary fields; company optional | **PASS** | Checkout asks for email, name, address, city, state, ZIP. Phone, company and address line 2 are labeled optional |
| S5 | Policies and contact reachable during checkout | **PASS** | Step 3 links Terms, Refund, Shipping, Privacy; summary sidebar links all four plus contact |
| S6 | Payment options stated before committing | **PASS** | Four methods presented as radio cards on step 3 |
| S7 | HTTPS on the live deployment | **DEFERRED** | Cannot be demonstrated from a local static preview. Listed as a launch prerequisite in `SETUP.md` §4 |
| S8 | Return summary on the product page itself | **PASS** | "Shipping & returns" accordion on every product page, plus the always-visible shipping summary box |

## 5. US privacy expectations

| # | Requirement | Result | Evidence |
| --- | --- | --- | --- |
| P1 | Categories of personal information and purposes listed | **PASS** | Privacy policy §2, as a six-row table |
| P2 | Third-party categories named | **PASS** | §5 names payment processor, carriers, email platform, analytics, advisers |
| P3 | Consumer rights enumerated | **PASS** | §7 lists know, access, delete, correct, opt out, limit sensitive use, non-discrimination |
| P4 | "Do Not Sell or Share" section, linked from every page | **PASS** | §6 with three request routes and GPC honored; linked twice in every page footer |
| P5 | COPPA statement | **PASS** | §11 |
| P6 | Retention periods described | **PASS** | §9, as a table with the reason for each period |
| P7 | Cookie policy plus a notice that links to it | **PASS** | `cookie-policy.html` lists the two storage items this site actually writes; the bottom bar links to it |
| P8 | Effective date and a privacy contact route | **PASS** | Effective date on every policy; privacy contact block at the foot of the policy |

## 6. Accessibility (WCAG 2.1 AA)

| # | Requirement | Result | Evidence |
| --- | --- | --- | --- |
| A1 | Landmarks, one `<h1>`, ordered headings | **PASS** | Audit asserts exactly one `<h1>` per page; `header`/`nav`/`main`/`footer` on every page |
| A2 | Every image has alt text | **PASS** | 16 static images in the HTML and 90 catalog images rendered from `products.js`, all with descriptive alt; decorative gallery thumbnails use `alt=""` |
| A3 | Labeled form controls, text error messages, unique ids | **PASS** | Every input has a `<label>`; errors render as text in `role="alert"`; audit found zero duplicate ids |
| A4 | Contrast ≥ 4.5:1 text, ≥ 3:1 UI | **PASS** | 22/22 pairs verified by `contrast-check.mjs`. The control border failed at 1.70:1 during this audit and was darkened to 3.61:1 |
| A5 | Keyboard reachable with a visible focus ring | **PASS** | `:focus-visible` ring sitewide at 8.56:1; no `outline: none` without a replacement |
| A6 | Menus and accordions are real buttons with ARIA | **PASS** | Live test: nav toggle and search panel flip `aria-expanded`, Escape closes them and returns focus; accordions toggle `aria-expanded` and `hidden` |
| A7 | Skip link first in tab order | **PASS** | Present on all 15 pages, visible on focus |
| A8 | Live regions for dynamic changes | **PASS** | Cart count (`data-cart-label`), toast (`role="status"`), checkout step announcer, form status |
| A9 | `prefers-reduced-motion` honored | **PASS** | Media query disables transitions, hover transforms and smooth scrolling |
| A10 | `lang` declared, reflows to 320px | **PASS** | `<html lang="en-US">` on all pages; no overflow at 320px |

## 7. SEO and technical hygiene

| # | Requirement | Result | Evidence |
| --- | --- | --- | --- |
| T1 | Unique title and description per page | **PASS** | Audit checks both, and fails on duplicate titles |
| T2 | Open Graph and Twitter tags with a local image | **PASS** | On all 15 pages |
| T3 | Canonical per page | **PASS** | On all 15 pages |
| T4 | JSON-LD | **PASS** | Organization (home), BreadcrumbList (shop), ContactPage (contact), FAQPage (FAQ), Product + Offer + MerchantReturnPolicy (product, generated at runtime from the catalog) |
| T5 | Local favicon | **PASS** | `assets/images/favicon.svg` and `favicon-180.png`, both generated for this project |
| T6 | robots.txt and sitemap.xml | **PASS** | Sitemap lists 12 pages and 30 product URLs; robots excludes only cart and checkout |
| T7 | Zero external image references | **PASS** | Audit scans every `src=` and `url()` in HTML and CSS: **0 external image references**. The only external host referenced anywhere is `fonts.googleapis.com` / `fonts.gstatic.com` for the two web fonts, disclosed in the privacy and cookie policies |

## 8. US commerce conventions

| # | Requirement | Result | Evidence |
| --- | --- | --- | --- |
| U1 | `$` with two decimals via `Intl.NumberFormat('en-US')` | **PASS** | `site-config.js` `formatMoney` is the only money formatter used |
| U2 | US date format | **PASS** | "January 15, 2026" on every policy |
| U3 | US sizing, imperial measurements | **PASS** | XS–XL and 0–16; size guide in inches |
| U4 | US phone and address formats | **PASS** | `(555) 010-4827`; checkout has a 50-state + DC dropdown and a 5-digit ZIP check |
| U5 | Domestic US shipping described | **PASS** | Shipping policy §1 and §7, including PO boxes and APO/FPO |

---

## Issues found during the audit and fixed

| Issue | Where | Fix |
| --- | --- | --- |
| Two `<h1>` elements on the product page (found and not-found states) | `product.html` | Moved the single `<h1>` into a page-header band; JavaScript rewrites it for the not-found case |
| Control borders measured 1.70:1 against the page background, below the 3:1 required by WCAG 1.4.11 | `style.css` | Added `--border-input: #8e8075` (3.61:1) and applied it to inputs, selects, size and color chips, the quantity stepper and the payment method cards |
| Wide policy tables forced horizontal scroll at 320–480px | `style.css` | Set `min-width: 0` on layout grid children so a wide child can no longer blow out its column |
| Checkout fields only validated when the step advanced | `checkout.js` | Added blur and input validation so errors appear and clear as you type |
| Toast overlapped the cookie notice | `style.css` | Toast lifts above the notice while it is showing |
| Programmatic focus drew a focus ring for mouse users, and step 1 took focus on page load | `style.css`, `checkout.js`, `checkout.html` | `[tabindex="-1"]:focus:not(:focus-visible)` removes the ring; step focus moves only when the customer changes step; the payment result is announced through `role="alert"` and the live region instead of stealing focus |
| Non-US spellings ("grey", "enquiries") | `shop.html`, `contact.html`, catalog | Changed to "gray" and "inquiries"; `prose-check.mjs` now guards against regressions |
| Size hint read "One size." for garments that have no numeric sizing | `main.js` | Now distinguishes numeric sizing, alpha sizing and genuine one-size items |
| Uppercase placeholder text in the Terms | `policies/terms-of-service.html` | Rewritten as sentence-case prose with a marked owner note |
| Sample review block could read as real testimonials | `index.html` | Captioned as sample content with an explanatory note |

## Filled with demo values

These were blank in the first pass. They are now populated with fictional
values so the site is structurally complete and every identity check can run.
They still have to be swapped for real details — `SETUP.md` §2.3 lists every
location, and the audit script enforces that the swap is done everywhere.

| # | Item | Demo value |
| --- | --- | --- |
| F-1 | Registered legal entity name | Hollis & Hem LLC |
| F-2 | Business mailing address | 412 Foundry Lane, Suite 210, Portland, OR 97209 |
| F-3 | Governing state / state of incorporation | Oregon |

| F-4 | Domain and email addresses | hollisandhem.com · support@ / orders@ / privacy@ |

Why fictional values are safe here: the company does not exist, the phone number
is in the 555-01xx range reserved for fiction, and `hollisandhem.com` was
**unregistered** when the site was built — verified against Verisign RDAP (404,
no such domain) and DNS (no A, MX or NS records), so no mail sent to those
addresses reaches a third party. Three separate places on the site say in plain
words that these are demo values. Nothing impersonates a real party.

> Registration status is a point-in-time fact, not a permanent guarantee. If
> this brand is kept, register the domain before launch; if not, swap in the
> owner's own domain. `SETUP.md` §2.1 says so directly.

## Deferred — requires a live deployment

| # | Item | Why it is deferred |
| --- | --- | --- |
| D-1 | HTTPS with a valid certificate | Cannot be demonstrated from a local static preview; listed as a launch prerequisite in `SETUP.md` §4 |

## Verification commands

```bash
node scripts/link-check.mjs          # full static audit, exits non-zero on failure
node scripts/inject-shell.mjs --check # header/footer identical on every page
node scripts/prose-check.mjs          # spelling and prose mechanics
node scripts/contrast-check.mjs       # WCAG contrast ratios
```

Final run of all four: **0 failures.**
