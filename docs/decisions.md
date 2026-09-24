# Decisions

Choices made while building this storefront, with the reasoning behind each.
Anything the brief left open was decided here rather than paused on.

---

## 1. Photography: real stock photos, verified by eye

**Decision.** All 104 images were downloaded from Pexels (free under the
[Pexels License](https://www.pexels.com/license/)), stored locally, and reviewed
visually before being wired into the catalog. No SVG placeholders were needed.

**Why.** The brief allowed generated placeholders only if downloads were
blocked. They were not. Real photography makes the layout honest about how it
behaves with real content — aspect ratios, crops, focal points.

**How it was done.** `scripts/discover-images.mjs` reads the JSON-LD `ItemList`
on Pexels search pages to collect candidate photos with descriptions and
photographer names; `scripts/curate-images.mjs` downloads the hand-picked
selection, measures each file, and writes `docs/image-credits.md` plus
`scripts/download-images.sh`. Contact sheets (`scripts/contact-sheet.ps1`) were
generated and inspected so that every photo actually matches the product it is
attached to — four products were renamed and two photos swapped after that review.

**Consequence.** Product names were chosen to fit the photographs rather than
the other way around, and the site states plainly, on the product page, the
About page and in the image credits, that the photography is licensed stock
imagery to be replaced before selling.

## 2. Catalog is generated from a script, but ships as plain JavaScript

`assets/js/products.js` is written by `scripts/build-catalog.mjs`, which merges
the catalog copy with the real measured pixel dimensions of each image file.

**Why.** Every `<img>` needs accurate `width`/`height` to avoid layout shift, and
hand-copying 90 pairs of numbers is a reliable way to get them wrong. The output
is ordinary, readable, editable JavaScript — the site itself still has no build
step and runs from the filesystem.

## 3. Header and footer come from one source file

`scripts/inject-shell.mjs` writes the header and footer of all 15 pages from
`scripts/shell/header.html` and `scripts/shell/footer.html`.

**Why.** The Google Ads misrepresentation policy requires one consistent
business identity and one set of contact details. Fifteen hand-maintained copies
drift. The injected result is static HTML in each file, and
`node scripts/inject-shell.mjs --check` fails if any page has drifted.

## 4. Business details are written into the HTML *and* injected by JavaScript

Every page contains the real values as plain text, and `site-config.js` rewrites
elements carrying `data-config="KEY"` on load.

**Why.** A JavaScript-only footer is invisible without JS and weaker for
crawlers, which conflicts with the destination requirements. Static text plus a
re-application pass gives both: the page is complete without JS, and there is
still one place to edit a phone number.

## 5. No fake social proof, no invented discounts, no urgency

- Reviews are labeled "Sample customer comment" with no names or headshots.
- There are no star ratings anywhere, because inventing them is misrepresentation.
- There are no compare-at prices, countdown timers, or stock-scarcity messages.

**Why.** These are the exact patterns the misrepresentation and editorial
policies call out. The automated audit in `scripts/link-check.mjs` fails the
build if any of them reappear.

## 6. Demo status is disclosed up front, not buried

The checkout opens with a notice that payment is disabled, the About page has a
dedicated "About this storefront" section, and the footer of every page says the
same thing.

**Why.** A store that looks live but cannot transact is itself a
misrepresentation risk. Disclosing it in advance is the honest version, and it
costs nothing.

## 7. Payment step collects a method only

No card number, expiry, CVV or cardholder-name field exists anywhere in
`checkout.html`. `checkout.js` contains no `fetch`, no `XMLHttpRequest`, and no
form `action`; the audit script fails if any of those appear.

**Why.** The brief requires payment to always fail and no data to be collected.
Not building the fields at all is stronger than building them and discarding the
values — there is nothing to leak, log, or autofill into.

## 8. Estimated tax is shown at checkout, not in the cart

The cart shows "Sales tax — calculated at checkout"; the checkout summary shows a
figure computed at a sample 7.25% rate, labeled as an estimate.

**Why.** US retail convention is tax-exclusive pricing, and Merchant Center
guidance is to exclude tax from the displayed price for US and Canada but show
all mandatory charges before payment. A number with an honest label beats an
empty placeholder.

## 9. Shipping, sizing and policy numbers live in one config object

`FREE_SHIPPING_THRESHOLD`, `SHIPPING_RATES`, `RETURN_WINDOW_DAYS` and
`REFUND_PROCESSING` are defined once in `site-config.js` and used by the cart,
the checkout totals, the product page, the policies and the FAQ.

**Why.** Contradictory numbers between a policy page and a checkout total are a
classic disapproval cause. One source, many readers.

## 10. Google Fonts is the only external request

Everything else — images, CSS, JavaScript, icons, the favicon — is local. The
cookie and privacy policies both name the font request and explain how to block it.

**Why.** The brief asked for Google Fonts with fallbacks. Since it is the only
third-party request on the site, naming it in the privacy documentation is
cheap and makes those policies accurate rather than generic.

## 11. Legal identity: fictional values, labeled as fictional

**First pass.** The registered entity name, mailing address and governing state
were left blank with `OWNER TO COMPLETE` markers, on the reasoning that
inventing a business identity is itself a misrepresentation.

**Revised.** They are now filled with demo values — **Hollis & Hem LLC**,
**412 Foundry Lane, Suite 210, Portland, OR 97209**, incorporated in
**Oregon** — so the storefront reads as a finished site and every identity check
has something to verify.

The domain and mailboxes followed: the site now runs on **hollisandhem.com**
with **support@**, **orders@** and **privacy@** inboxes, replacing the reserved
`.example` placeholders. Email domain and site domain match, which is what
Merchant Center expects of a real store.

**What makes that safe.** The values name an invented company, not a real one;
the phone number stays in the 555-01xx fiction range; `hollisandhem.com` was
verified unregistered before use (Verisign RDAP returned 404, and DNS had no A,
MX or NS records), so the mailto links cannot deliver to a third party; and the
site states plainly, in the footer of every
page, in the About page's demo section and in the Terms, that these are demo
values for a fictional business. The failure mode to avoid is a *plausible
imitation of a real company*, not a clearly labeled fiction.

**How it stays consistent.** Every value lives in `site-config.js` and is
injected through `data-config`, with matching static text in the shell, the
Contact page and the five policies for the no-JavaScript case. Two guards keep
the two copies from drifting apart:

- `link-check.mjs` asserts the registered name and the mailing address on all 15
  pages, so renaming the company halfway fails the audit rather than shipping a
  site with two identities.
- `injectConfig()` rewrites a `mailto:` or `tel:` target alongside the text it
  labels, so editing only `site-config.js` can never leave a link pointing at
  the old address while displaying the new one.

## 12. Product grids are rendered by JavaScript, with a no-JS fallback

`shop.html` includes a `<noscript>` list linking to all 30 product pages, and the
home page links to the shop from every product section.

**Why.** A catalog of 30 items hand-written into HTML would drift from
`products.js` immediately. The `<noscript>` list keeps every product reachable
by a crawler or a JS-disabled visitor, which is what the destination
requirements care about.

## 13. Accessibility choices worth noting

- One `<h1>` per page. On `product.html` the heading sits in a page-header band
  so it stays correct in both the found and not-found states.
- Focus is moved to the relevant heading when a checkout step changes, and the
  ring is suppressed for mouse users only (`:focus:not(:focus-visible)`).
- Layout grids set `min-width: 0` on their children, which is what stops a wide
  data table from forcing horizontal scroll on a 320px screen.
- Cart count changes and checkout step changes are announced through
  `aria-live` regions.

## 14. Tooling that ships with the project

`/scripts` contains development tooling, not site code: the image pipeline, the
shell injector, the catalog builder, the sitemap builder, a static preview
server, and the audit script. The site runs without any of it.
