/**
 * build-sitemap.mjs
 * ------------------------------------------------------------------
 * Development helper (NOT part of the shipped site).
 * Writes sitemap.xml from the pages on disk plus every product id in
 * assets/js/products.js.
 *
 * Usage:  node scripts/build-sitemap.mjs
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SITE = "https://hollisandhem.com";
const LASTMOD = "2026-01-15"; // Keep in step with POLICY_EFFECTIVE_DATE.

const EXCLUDE = new Set(["404.html", "cart.html", "checkout.html"]);

const pages = [];
for (const entry of fs.readdirSync(ROOT)) {
  if (entry.endsWith(".html") && !EXCLUDE.has(entry)) pages.push(entry);
}
for (const entry of fs.readdirSync(path.join(ROOT, "policies"))) {
  if (entry.endsWith(".html")) pages.push("policies/" + entry);
}
pages.sort();

const productsSrc = fs.readFileSync(path.join(ROOT, "assets/js/products.js"), "utf8");
const ids = [...productsSrc.matchAll(/"id":\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);
const uniqueIds = [...new Set(ids)];

function priority(page) {
  if (page === "index.html") return "1.0";
  if (page === "shop.html") return "0.9";
  if (page.startsWith("policies/")) return "0.4";
  return "0.7";
}

const urls = [
  ...pages.map(
    (page) =>
      `  <url>\n    <loc>${SITE}/${page}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${priority(page)}</priority>\n  </url>`
  ),
  ...uniqueIds.map(
    (id) =>
      `  <url>\n    <loc>${SITE}/product.html?id=${id}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
  )
];

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.join("\n") +
  "\n</urlset>\n";

fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml, "utf8");
console.log(`Wrote sitemap.xml — ${pages.length} pages + ${uniqueIds.length} products.`);
