/**
 * prose-check.mjs
 * ------------------------------------------------------------------
 * Development helper. Scans the visible copy of every page for the
 * mechanical writing faults that are easy to miss by eye and that the
 * editorial requirements care about:
 *
 *   - doubled words ("the the")
 *   - unresolved HTML entities left in the text
 *   - stray spacing before punctuation
 *   - non-US spellings
 *   - ALL-CAPS words typed into the copy (styling should use CSS)
 *
 * Usage:  node scripts/prose-check.mjs
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const files = [];
for (const f of fs.readdirSync(ROOT)) if (f.endsWith(".html")) files.push(f);
for (const f of fs.readdirSync(path.join(ROOT, "policies"))) files.push("policies/" + f);
files.sort();

const UK_SPELLINGS = [
  /\bcolour/i, /\bfavourite/i, /\borganis/i, /\bcentre\b/i, /\bcatalogue/i,
  /\bjewellery/i, /\banalyse/i, /\benquir/i, /\bgrey\b/i, /\blicence\b/i,
  /\bprogramme\b/i, /\btravelling\b/i, /\bcheque\b/i, /\bwhilst\b/i, /\bamongst\b/i
];

let problems = 0;

for (const file of files) {
  const raw = fs.readFileSync(path.join(ROOT, file), "utf8");
  /* Inline tags are removed in place; block tags become line breaks, so that
     two neighboring elements never look like one run-on sentence. */
  const INLINE = "a|strong|em|span|b|i|small|code|abbr|sup|sub";
  const text = raw
    .replace(/<!--[\s\S]*?-->/g, "\n")
    .replace(/<script[\s\S]*?<\/script>/g, "\n")
    .replace(/<style[\s\S]*?<\/style>/g, "\n")
    .replace(new RegExp(`</?(?:${INLINE})(?:\\s[^>]*)?>`, "gi"), "")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n");

  const report = (label, hits) => {
    if (!hits || !hits.length) return;
    problems += hits.length;
    console.log(`${file}: ${label} -> ${[...new Set(hits)].join(", ")}`);
  };

  report("doubled words", text.match(/\b(\w+)[ \t]+\1\b/gi));
  report("unresolved entity", text.match(/&[a-z]+;/g));
  report("space before punctuation", text.match(/[ \t][,.;:](?=[ \t])/g));
  report(
    "non-US spelling",
    UK_SPELLINGS.map((r) => (text.match(r) || [])[0]).filter(Boolean)
  );
  report(
    "ALL-CAPS in copy",
    (text.match(/\b[A-Z]{4,}\b/g) || []).filter(
      (w) => !["FAQ", "USPS", "APO", "FPO", "DPO", "CCPA", "CPRA", "COPPA", "HTTPS", "PCI", "USD", "GPC", "PAYPAL"].includes(w)
    )
  );
}

console.log(
  problems === 0
    ? "\nNo mechanical writing faults found."
    : `\n${problems} item(s) to review.`
);
