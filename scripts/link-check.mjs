/**
 * link-check.mjs
 * ------------------------------------------------------------------
 * Static audit of the shipped site. Run from the project root:
 *
 *     node scripts/link-check.mjs
 *
 * Exits non-zero if any FAIL is reported, so it can gate a deploy.
 *
 * What it checks
 *   1.  Every internal href/src resolves to a file that exists
 *   2.  Every in-page #fragment target exists on the page it points to
 *   3.  Zero external image references (no hotlinking) in src= or url()
 *   4.  Every page has one <h1>, a <title>, a meta description and a canonical
 *   5.  Every <img> has an alt attribute and width/height
 *   6.  No duplicate element ids on a page
 *   7.  No placeholder text (lorem ipsum, TODO, FIXME) in shipped pages
 *   8.  No prohibited superlative or urgency claims in visible copy
 *   9.  Business contact details appear on every page
 *  10.  Policy links are reachable in one click from every page
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const results = { pass: 0, warn: 0, fail: 0 };
const report = [];

function record(level, item, detail) {
  results[level === "FAIL" ? "fail" : level === "WARN" ? "warn" : "pass"]++;
  report.push({ level, item, detail });
  if (level !== "PASS") console.log(`${level}  ${item} — ${detail}`);
}

/* ------------------------------------------------------------------ *
 * Collect pages
 * ------------------------------------------------------------------ */
function listPages() {
  const out = [];
  for (const entry of fs.readdirSync(ROOT)) {
    if (entry.endsWith(".html")) out.push(entry);
  }
  for (const entry of fs.readdirSync(path.join(ROOT, "policies"))) {
    if (entry.endsWith(".html")) out.push("policies/" + entry);
  }
  return out.sort();
}

const pages = listPages();
const sources = new Map();
for (const page of pages) {
  sources.set(page, fs.readFileSync(path.join(ROOT, page), "utf8"));
}

/** Ids declared on a page, used to validate #fragment links. */
const idsByPage = new Map();
for (const [page, html] of sources) {
  const ids = new Set();
  for (const m of html.matchAll(/\sid="([^"]+)"/g)) ids.add(m[1]);
  idsByPage.set(page, ids);
}

/** Strip comments, script and style blocks before reading visible copy. */
function visibleText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

/* ------------------------------------------------------------------ *
 * 1 + 2. Links and fragments
 * ------------------------------------------------------------------ */
let linkCount = 0;
let brokenLinks = 0;
let brokenFragments = 0;

for (const [page, html] of sources) {
  const dir = path.dirname(path.join(ROOT, page));
  const refs = [
    ...[...html.matchAll(/\shref="([^"]+)"/g)].map((m) => m[1]),
    ...[...html.matchAll(/\ssrc="([^"]+)"/g)].map((m) => m[1])
  ];

  for (const ref of refs) {
    if (
      ref.startsWith("http://") ||
      ref.startsWith("https://") ||
      ref.startsWith("mailto:") ||
      ref.startsWith("tel:") ||
      ref.startsWith("data:") ||
      ref === "#"
    ) {
      continue;
    }
    linkCount++;

    const [target, fragment] = ref.split("#");
    const [filePart, query] = (target || "").split("?");

    if (filePart) {
      const resolved = path.resolve(dir, filePart);
      if (!fs.existsSync(resolved)) {
        record("FAIL", `Link target missing (${page})`, `${ref}`);
        brokenLinks++;
        continue;
      }
      /* product.html?id=... must match a real product */
      if (filePart.endsWith("product.html") && query && query.startsWith("id=")) {
        const id = query.slice(3);
        const catalog = fs.readFileSync(path.join(ROOT, "assets/js/products.js"), "utf8");
        if (!catalog.includes(`"id": "${id}"`)) {
          record("FAIL", `Unknown product id (${page})`, id);
          brokenLinks++;
        }
      }
    }

    if (fragment) {
      const targetPage = filePart
        ? path.relative(ROOT, path.resolve(dir, filePart)).split(path.sep).join("/")
        : page;
      const ids = idsByPage.get(targetPage);
      if (ids && !ids.has(fragment)) {
        record("FAIL", `Fragment missing (${page})`, `${ref} -> #${fragment}`);
        brokenFragments++;
      }
    }
  }
}

record(
  brokenLinks === 0 ? "PASS" : "FAIL",
  "D1 Internal links resolve",
  `${linkCount} internal references checked, ${brokenLinks} broken`
);
record(
  brokenFragments === 0 ? "PASS" : "FAIL",
  "D1b In-page anchors resolve",
  `${brokenFragments} broken fragments`
);

/* ------------------------------------------------------------------ *
 * 3. No external image references
 * ------------------------------------------------------------------ */
let externalImages = 0;
const cssFiles = ["assets/css/style.css"];
const scanForImages = [...pages, ...cssFiles];

for (const file of scanForImages) {
  const text = fs.readFileSync(path.join(ROOT, file), "utf8");
  for (const m of text.matchAll(/\ssrc="(https?:\/\/[^"]+)"/g)) {
    record("FAIL", `External src (${file})`, m[1]);
    externalImages++;
  }
  for (const m of text.matchAll(/url\(\s*['"]?(https?:\/\/[^)'"]+)/g)) {
    record("FAIL", `External url() (${file})`, m[1]);
    externalImages++;
  }
}
record(
  externalImages === 0 ? "PASS" : "FAIL",
  "T7 Zero external image references",
  `${externalImages} found in src= or url()`
);

/* Report the external resources that DO exist, for transparency. */
const externalHrefs = new Set();
for (const [, html] of sources) {
  for (const m of html.matchAll(/\shref="(https?:\/\/[^"]+)"/g)) {
    externalHrefs.add(new URL(m[1]).host);
  }
}
record(
  "PASS",
  "External hosts referenced",
  [...externalHrefs].join(", ") || "none"
);

/* ------------------------------------------------------------------ *
 * 4. Head requirements
 * ------------------------------------------------------------------ */
const titles = new Map();
let headProblems = 0;

for (const [page, html] of sources) {
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  const description = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  /* Comments can legitimately mention tags, so strip them before counting. */
  const markup = html.replace(/<!--[\s\S]*?-->/g, " ");
  const h1s = [...markup.matchAll(/<h1[\s>]/g)].length;
  const og = /<meta property="og:title"/.test(html);
  const lang = /<html lang="en-US">/.test(html);

  if (!title) {
    record("FAIL", `Missing <title> (${page})`, "-");
    headProblems++;
  } else if (titles.has(title)) {
    record("FAIL", `Duplicate <title> (${page})`, `same as ${titles.get(title)}`);
    headProblems++;
  } else {
    titles.set(title, page);
  }

  if (!description) {
    record("FAIL", `Missing meta description (${page})`, "-");
    headProblems++;
  }
  if (!canonical) {
    record("FAIL", `Missing canonical (${page})`, "-");
    headProblems++;
  }
  if (!og) {
    record("FAIL", `Missing Open Graph tags (${page})`, "-");
    headProblems++;
  }
  if (!lang) {
    record("FAIL", `Missing lang attribute (${page})`, "-");
    headProblems++;
  }
  if (h1s !== 1) {
    record("FAIL", `Expected exactly one <h1> (${page})`, `found ${h1s}`);
    headProblems++;
  }
}
record(
  headProblems === 0 ? "PASS" : "FAIL",
  "T1–T3 / A1 Head and heading structure",
  `${pages.length} pages checked, ${headProblems} problems`
);

/* ------------------------------------------------------------------ *
 * 5. Images: alt + dimensions
 * ------------------------------------------------------------------ */
let imgProblems = 0;
let imgCount = 0;

for (const [page, html] of sources) {
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    imgCount++;
    if (!/\salt=/.test(tag)) {
      record("FAIL", `Image without alt (${page})`, tag.slice(0, 90));
      imgProblems++;
    }
    if (!/\swidth=/.test(tag) || !/\sheight=/.test(tag)) {
      record("WARN", `Image without width/height (${page})`, tag.slice(0, 90));
      imgProblems++;
    }
  }
}
record(
  imgProblems === 0 ? "PASS" : "WARN",
  "A2 / D5 Image alt text and dimensions",
  `${imgCount} static images, ${imgProblems} problems`
);

/* ------------------------------------------------------------------ *
 * 6. Duplicate ids
 * ------------------------------------------------------------------ */
let duplicateIds = 0;
for (const [page, html] of sources) {
  const seen = new Set();
  for (const m of html.matchAll(/\sid="([^"]+)"/g)) {
    if (seen.has(m[1])) {
      record("FAIL", `Duplicate id (${page})`, m[1]);
      duplicateIds++;
    }
    seen.add(m[1]);
  }
}
record(
  duplicateIds === 0 ? "PASS" : "FAIL",
  "A3 Unique element ids",
  `${duplicateIds} duplicates`
);

/* ------------------------------------------------------------------ *
 * 7. Placeholder text
 * ------------------------------------------------------------------ */
const PLACEHOLDERS = [/lorem ipsum/i, /\bTODO\b/, /\bFIXME\b/, /\bXXX\b/, /\[insert /i];
let placeholders = 0;
for (const [page, html] of sources) {
  const text = visibleText(html);
  for (const pattern of PLACEHOLDERS) {
    if (pattern.test(text)) {
      record("FAIL", `Placeholder text (${page})`, String(pattern));
      placeholders++;
    }
  }
}
record(
  placeholders === 0 ? "PASS" : "FAIL",
  "E1 No placeholder or filler text",
  `${placeholders} occurrences`
);

/* ------------------------------------------------------------------ *
 * 8. Prohibited claims and urgency patterns
 * ------------------------------------------------------------------ */
const CLAIMS = [
  /\bworld['’]?s best\b/i,
  /\bnumber one\b/i,
  /#1\b/,
  /\bguaranteed results\b/i,
  /\b100% guaranteed\b/i,
  /\bmiracle\b/i,
  /\bonly \d+ left\b/i,
  /\d+ people are (?:viewing|looking)/i,
  /\bhurry[, ]/i,
  /\bact now\b/i,
  /\bcountdown\b/i,
  /\bselling fast\b/i,
  /!{2,}/
];
let claims = 0;
for (const [page, html] of sources) {
  const text = visibleText(html);
  for (const pattern of CLAIMS) {
    const found = text.match(pattern);
    if (found) {
      record("FAIL", `Prohibited claim or urgency pattern (${page})`, found[0]);
      claims++;
    }
  }
}
record(
  claims === 0 ? "PASS" : "FAIL",
  "E5 / E6 No exaggerated claims or fake urgency",
  `${claims} matches`
);

/* ------------------------------------------------------------------ *
 * 9. Business details present on every page
 * ------------------------------------------------------------------ */
const REQUIRED_ON_EVERY_PAGE = [
  ["Store name", /Hollis &amp; Hem/],
  ["Registered business name", /Hollis &amp; Hem LLC/],
  ["Mailing address", /412 Foundry Lane, Suite 210, Portland, OR 97209/],
  ["Support email", /support@hollisandhem\.com/],
  ["Orders email", /orders@hollisandhem\.com/],
  ["Phone", /\(555\) 010-4827/],
  ["Business hours", /Monday–Friday, 9:00 AM – 6:00 PM ET/],
  ["Country", />United States</]
];
let identityProblems = 0;
for (const [page, html] of sources) {
  for (const [label, pattern] of REQUIRED_ON_EVERY_PAGE) {
    if (!pattern.test(html)) {
      record("FAIL", `${label} missing (${page})`, String(pattern));
      identityProblems++;
    }
  }
}
record(
  identityProblems === 0 ? "PASS" : "FAIL",
  "M1 / M2 Identical business details sitewide",
  `${identityProblems} problems across ${pages.length} pages`
);

/* ------------------------------------------------------------------ *
 * 10. Policies reachable in one click from every page
 * ------------------------------------------------------------------ */
const POLICY_TARGETS = [
  "refund-policy.html",
  "shipping-policy.html",
  "privacy-policy.html",
  "terms-of-service.html",
  "cookie-policy.html",
  "privacy-policy.html#do-not-sell"
];
let policyProblems = 0;
for (const [page, html] of sources) {
  for (const target of POLICY_TARGETS) {
    if (!html.includes(target)) {
      record("FAIL", `Policy link missing (${page})`, target);
      policyProblems++;
    }
  }
}
record(
  policyProblems === 0 ? "PASS" : "FAIL",
  "S5 / P4 Policies one click away everywhere",
  `${policyProblems} problems`
);

/* ------------------------------------------------------------------ *
 * 11. No card-data fields anywhere in checkout
 * ------------------------------------------------------------------ */
const checkout = sources.get("checkout.html") || "";
const CARD_FIELD_PATTERNS = [
  /name="card[-_]?number"/i,
  /id="card[-_]?number"/i,
  /autocomplete="cc-/i,
  /\bcvv\b/i,
  /\bcvc\b/i,
  /name="exp/i
];
const cardHits = CARD_FIELD_PATTERNS.filter((p) => p.test(checkout));
record(
  cardHits.length === 0 ? "PASS" : "FAIL",
  "Checkout collects no card data",
  cardHits.length ? cardHits.map(String).join(", ") : "no card fields present"
);

/* No network calls anywhere in the shipped JavaScript. */
const jsFiles = fs
  .readdirSync(path.join(ROOT, "assets/js"))
  .filter((f) => f.endsWith(".js"));
let networkCalls = 0;
for (const file of jsFiles) {
  const js = fs.readFileSync(path.join(ROOT, "assets/js", file), "utf8");
  const stripped = js.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  for (const pattern of [/\bfetch\s*\(/, /XMLHttpRequest/, /navigator\.sendBeacon/, /new WebSocket/]) {
    if (pattern.test(stripped)) {
      record("FAIL", `Network call in ${file}`, String(pattern));
      networkCalls++;
    }
  }
}
record(
  networkCalls === 0 ? "PASS" : "FAIL",
  "No data transmission from shipped JavaScript",
  `${jsFiles.length} files scanned, ${networkCalls} network calls`
);

/* Forms must not have an action attribute. */
let formActions = 0;
for (const [page, html] of sources) {
  for (const m of html.matchAll(/<form\b[^>]*>/g)) {
    if (/\saction=/.test(m[0])) {
      record("FAIL", `Form with action attribute (${page})`, m[0].slice(0, 80));
      formActions++;
    }
  }
}
record(
  formActions === 0 ? "PASS" : "FAIL",
  "No form posts to a server",
  `${formActions} forms with an action`
);

/* ------------------------------------------------------------------ *
 * Summary
 * ------------------------------------------------------------------ */
console.log("\n----------------------------------------");
console.log(`Pages checked : ${pages.length}`);
console.log(`PASS          : ${results.pass}`);
console.log(`WARN          : ${results.warn}`);
console.log(`FAIL          : ${results.fail}`);
console.log("----------------------------------------");

/* The machine-readable report is opt-in, so a routine audit leaves no file
   behind: node scripts/link-check.mjs --json */
if (process.argv.includes("--json")) {
  const out = path.join(ROOT, "scripts", "link-check-report.json");
  fs.writeFileSync(out, JSON.stringify({ results, report }, null, 2), "utf8");
  console.log(`Wrote ${path.relative(ROOT, out)}`);
}

process.exit(results.fail === 0 ? 0 : 1);
