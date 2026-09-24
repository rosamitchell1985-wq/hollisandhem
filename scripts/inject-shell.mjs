/**
 * inject-shell.mjs
 * ------------------------------------------------------------------
 * Development helper (NOT part of the shipped site).
 *
 * The header and footer must be byte-identical on every page — that is a hard
 * requirement of the Google Ads misrepresentation policy (one consistent
 * business identity and one set of contact details). Rather than trusting hand
 * editing across 16 files, this script writes both blocks from one source:
 *
 *   scripts/shell/header.html
 *   scripts/shell/footer.html
 *
 * The output is still plain static HTML — the site itself needs no build step.
 *
 * Placeholders in the shell files:
 *   {{BASE}}        relative prefix to the site root ("" or "../")
 *   {{CUR:page}}    expands to ` aria-current="page"` when body[data-page] matches
 *
 * Usage:
 *   node scripts/inject-shell.mjs          rewrite the shell in every page
 *   node scripts/inject-shell.mjs --check  verify only, exit 1 on drift
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_ONLY = process.argv.includes("--check");

const HEADER_SRC = fs.readFileSync(path.join(ROOT, "scripts/shell/header.html"), "utf8").trimEnd();
const FOOTER_SRC = fs.readFileSync(path.join(ROOT, "scripts/shell/footer.html"), "utf8").trimEnd();

/** Every page in the site, with its root-relative prefix. */
function htmlFiles() {
  const out = [];
  for (const entry of fs.readdirSync(ROOT)) {
    if (entry.endsWith(".html")) out.push({ file: entry, base: "" });
  }
  const policies = path.join(ROOT, "policies");
  if (fs.existsSync(policies)) {
    for (const entry of fs.readdirSync(policies)) {
      if (entry.endsWith(".html")) out.push({ file: path.join("policies", entry), base: "../" });
    }
  }
  return out.sort((a, b) => a.file.localeCompare(b.file));
}

function render(template, base, page) {
  return template
    .replace(/\{\{BASE\}\}/g, base)
    .replace(/\{\{CUR:([a-z-]+)\}\}/g, (_, name) =>
      name === page ? ' aria-current="page"' : ""
    );
}

const HEADER_REGION = /<a class="skip-link"[\s\S]*?<\/header>/;
const FOOTER_REGION = /<footer class="site-footer">[\s\S]*?<div class="toast"[^>]*><\/div>/;

let changed = 0;
let drift = 0;

for (const { file, base } of htmlFiles()) {
  const full = path.join(ROOT, file);
  const original = fs.readFileSync(full, "utf8");
  const pageMatch = original.match(/<body[^>]*data-page="([^"]+)"/);
  const page = pageMatch ? pageMatch[1] : "";

  const header = render(HEADER_SRC, base, page);
  const footer = render(FOOTER_SRC, base, page);

  let next = original;

  if (next.includes("<!--SHELL:HEADER-->")) {
    next = next.replace("<!--SHELL:HEADER-->", header);
  } else if (HEADER_REGION.test(next)) {
    next = next.replace(HEADER_REGION, header);
  } else {
    console.warn(`!! ${file}: no header region found`);
  }

  if (next.includes("<!--SHELL:FOOTER-->")) {
    next = next.replace("<!--SHELL:FOOTER-->", footer);
  } else if (FOOTER_REGION.test(next)) {
    next = next.replace(FOOTER_REGION, footer);
  } else {
    console.warn(`!! ${file}: no footer region found`);
  }

  if (next !== original) {
    if (CHECK_ONLY) {
      drift++;
      console.log(`DRIFT  ${file}`);
    } else {
      fs.writeFileSync(full, next, "utf8");
      changed++;
      console.log(`update ${file}`);
    }
  } else {
    console.log(`ok     ${file}`);
  }
}

if (CHECK_ONLY) {
  console.log(`\n${drift} page(s) differ from the shared shell.`);
  process.exit(drift === 0 ? 0 : 1);
} else {
  console.log(`\n${changed} page(s) updated.`);
}
