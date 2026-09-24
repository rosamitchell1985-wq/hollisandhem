# Phase 0 — Research Notes

**Project:** Hollis & Hem storefront (static HTML/CSS/JS)
**Researched:** September 2026
**Purpose:** establish the compliance checklist that the rest of the build must satisfy.
Every checkbox in this document is re-verified item by item in
[`compliance-report.md`](./compliance-report.md).

Primary sources consulted:

| Topic | Source |
| --- | --- |
| Misrepresentation | [Google Ads policy — Misrepresentation](https://support.google.com/adspolicy/answer/6020955) |
| Destinations | [Google Ads policy — Destination requirements](https://support.google.com/adspolicy/answer/6368661) |
| Checkout | [Merchant Center — Checkout requirements and best practices](https://support.google.com/merchants/answer/9158778) |
| Editorial | [Merchant Center — Editorial and professional requirements](https://support.google.com/merchants/answer/6150244) |
| Shopping policies | [Merchant Center — Shopping ads policies](https://support.google.com/merchants/answer/6149970) |
| Returns | [Merchant Center — Set up your return policies](https://support.google.com/merchants/answer/14011730) |
| CCPA/CPRA | [California Attorney General — CCPA](https://oag.ca.gov/privacy/ccpa), [CPPA regulations](https://cppa.ca.gov/regulations/) |
| Accessibility | [W3C — WCAG 2.1 (AA)](https://www.w3.org/TR/WCAG21/) |

> Interpretation note: Google publishes policy *principles*, not a page-by-page
> spec. Where a policy states an outcome ("users can easily find refund and
> return policy information"), this checklist turns it into a concrete,
> verifiable site requirement.

---

## 1. Misrepresentation

Google prohibits "misleading statements, obscuring, or omitting material
information about your identity, affiliations, or qualifications", giving an
"inaccurate business name", "scamming users by hiding or misrepresenting info
about your business, products or services", and any "failure to clearly and
conspicuously disclose the payment model or full expense that a user will bear
before and after purchase".

Checklist:

- [ ] **M1** — A single, consistent business name appears on every page (header, footer, policies).
- [ ] **M2** — Contact details (email, phone, business hours) appear in the footer of every page and on a dedicated Contact page, and are byte-identical everywhere (single source of truth).
- [ ] **M3** — The brand story / "who we are" is stated plainly on an About page, with no invented credentials, awards, press mentions or certifications.
- [ ] **M4** — Product prices are shown in USD on listing, detail, cart and checkout, and never increase between those steps.
- [ ] **M5** — Shipping costs and the free-shipping threshold are disclosed before checkout (announcement bar, product page, cart, shipping policy).
- [ ] **M6** — Sales tax handling is disclosed before checkout ("calculated at checkout"), and the estimated tax line is visible in the checkout order summary.
- [ ] **M7** — The return window, who pays return shipping and the refund timeline are stated in full on a dedicated refund page, not just summarized.
- [ ] **M8** — No subscription, auto-renewal, negative-option, or hidden recurring charge is implied anywhere.
- [ ] **M9** — Demo/placeholder status is disclosed rather than concealed: the site states where the owner must insert real legal details before trading.

## 2. Destination requirements

Destinations must "function properly on common browsers and devices", must not
"return an HTTP error code", must not redirect off-domain, must be crawlable,
and must not be "under construction".

- [ ] **D1** — Every internal link resolves to a file that exists (automated link check, zero failures).
- [ ] **D2** — No page is a stub: every page has real, finished content.
- [ ] **D3** — A custom `404.html` exists and offers navigation back into the site.
- [ ] **D4** — No JavaScript-only navigation: every route is a real `.html` file reachable by `<a href>` (crawlable, back button works).
- [ ] **D5** — Page weight stays modest; images are locally hosted, sized, and lazy-loaded below the fold.
- [ ] **D6** — Mobile-friendly: viewport meta tag, responsive layout, no horizontal scrolling at 360px and up.
- [ ] **D7** — No interstitials, pop-ups, or overlays that block content on arrival (the cookie notice is a dismissible bottom banner, not a blocking modal).
- [ ] **D8** — Core content renders without JavaScript (nav, policies, contact details, footer are static HTML).

## 3. Editorial & professional requirements

"Websites must be fully functional with complete business content… avoid broken
links, placeholder text, or templated filler language… remove generic messaging
like 'Add customer reviews here' or 'lorem ipsum'." Spelling and grammar must be
"commonly accepted", and gimmicky text (`FLOWERS`, `f l o w e r s`, `f1owers`)
is prohibited.

- [ ] **E1** — No lorem ipsum, no "TODO", no template filler anywhere in the shipped HTML.
- [ ] **E2** — US English spelling throughout ("color", "favorite", "organize").
- [ ] **E3** — No ALL-CAPS shouting in body copy; capitals only as a styling choice via CSS (`text-transform`), never typed into content.
- [ ] **E4** — No excessive punctuation ("!!!"), no symbol substitution, no keyword stuffing.
- [ ] **E5** — No superlative or unverifiable claims: "#1", "best in the world", "guaranteed results", "doctor recommended".
- [ ] **E6** — No urgency manipulation: no countdown timers, no "only 2 left!", no fake "17 people are viewing this".
- [ ] **E7** — Reviews are presented as illustrative sample content, clearly labeled, with no invented full names attached to stock headshots.
- [ ] **E8** — Every product has its own description, fabric/care detail, and fit note — no duplicated boilerplate.

## 4. Shopping ads / checkout specifics

From the checkout guidance: keep price consistent through checkout, show
mandatory fees separately, exclude tax from the displayed price in the US,
handle shipping separately, secure checkout pages with SSL, collect only
necessary information, support guest checkout, and make refund/return policy,
terms, and contact details reachable during checkout.

- [ ] **S1** — Displayed product price excludes sales tax (US convention); tax appears as its own estimated line at checkout.
- [ ] **S2** — Shipping is a separate, itemized line with named service levels and prices.
- [ ] **S3** — Guest checkout only — no account required, no app download, no device switch.
- [ ] **S4** — Only fields needed to fulfill an order are requested; company name is optional.
- [ ] **S5** — Refund policy, shipping policy, terms and contact are linked from the cart and from every checkout step.
- [ ] **S6** — Payment method options are stated before the user commits.
- [ ] **S7** — HTTPS is required for the live deployment; noted in `SETUP.md` as a launch prerequisite (a static demo served from `file://` or `localhost` cannot prove it).
- [ ] **S8** — Return policy summary is visible on the product page itself, not only in the footer.

## 5. US privacy expectations (CCPA / CPRA)

California's CCPA as amended by the CPRA gives consumers the rights to know,
delete, correct, opt out of sale/sharing, limit use of sensitive personal
information, and to non-discrimination. Businesses that sell or share personal
information must post a clear "Do Not Sell or Share My Personal Information"
link. Other US state laws (VA, CO, CT, UT, TX and others) impose closely
comparable disclosure duties, so the privacy page is written to cover them
generally.

- [ ] **P1** — Privacy policy lists the categories of personal information collected and the purpose of each.
- [ ] **P2** — Third-party categories are named (analytics, payment processor, shipping carriers, email platform).
- [ ] **P3** — Consumer rights are enumerated: know, access, delete, correct, opt out of sale/sharing, limit sensitive-data use, non-discrimination.
- [ ] **P4** — A "Do Not Sell or Share My Personal Information" section exists, is linked in the footer of every page, and explains how to exercise the right.
- [ ] **P5** — Children's privacy (COPPA) statement: the store is not directed to children under 13 and does not knowingly collect their data.
- [ ] **P6** — Data retention periods are described in plain terms.
- [ ] **P7** — A cookie policy explains cookie categories and how to control them, and a dismissible cookie notice links to it.
- [ ] **P8** — The privacy policy carries an effective date and a contact route for privacy requests.

## 6. Accessibility (ADA expectations / WCAG 2.1 level AA)

- [ ] **A1** — Semantic landmarks: `header`, `nav`, `main`, `footer`; exactly one `<h1>` per page; headings nest without skipping levels.
- [ ] **A2** — Every image has an `alt` that describes it; decorative images use `alt=""`.
- [ ] **A3** — Every form control has a programmatically associated `<label>`; errors are announced in text, not by color alone.
- [ ] **A4** — Text contrast is at least 4.5:1 (3:1 for large text and UI boundaries).
- [ ] **A5** — All interactive elements are keyboard reachable and show a visible focus indicator (no `outline: none` without a replacement).
- [ ] **A6** — Mobile menu and accordions use real `<button>` elements with `aria-expanded` / `aria-controls`.
- [ ] **A7** — A "Skip to content" link is the first focusable element on every page.
- [ ] **A8** — Cart count and form status changes are announced via `aria-live` regions.
- [ ] **A9** — `prefers-reduced-motion` is honored; nothing flashes or auto-animates aggressively.
- [ ] **A10** — Page language is declared (`<html lang="en-US">`), and layout reflows without horizontal scroll down to 320px.

## 7. SEO & technical hygiene (supports "professional appearance")

- [ ] **T1** — Unique `<title>` and `<meta name="description">` per page.
- [ ] **T2** — Open Graph and Twitter card tags per page, pointing to a local image.
- [ ] **T3** — Canonical URL per page, built from the configured domain.
- [ ] **T4** — JSON-LD: `Organization` site-wide, `Product` + `Offer` on product pages, `BreadcrumbList`, `FAQPage` on the FAQ.
- [ ] **T5** — Favicon present and locally hosted.
- [ ] **T6** — `robots.txt` and `sitemap.xml` present.
- [ ] **T7** — Zero external image references: every `src=` and `url()` points at a local relative path.

## 8. US commerce conventions

- [ ] **U1** — Currency shown as `$` with two decimals, formatted via `Intl.NumberFormat('en-US')`.
- [ ] **U2** — Dates written MM/DD/YYYY or as "January 15, 2026".
- [ ] **U3** — Sizes in US sizing (XS–XL and numeric 0–16); measurements in inches and pounds.
- [ ] **U4** — Phone numbers in `(555) 010-4827` format; addresses use the US state + 5-digit ZIP pattern.
- [ ] **U5** — Shipping is described as domestic US only, with business-day estimates.
