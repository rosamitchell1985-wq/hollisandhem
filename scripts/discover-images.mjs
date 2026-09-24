/**
 * discover-images.mjs
 * ------------------------------------------------------------------
 * Development helper (NOT part of the shipped site).
 *
 * Reads the JSON-LD `ItemList` embedded in Pexels public search pages
 * and records, for every candidate photo: page URL, image URL, title,
 * description and photographer. The output feeds scripts/curate-images.mjs.
 *
 * All photos on Pexels are free to use under the Pexels License
 * (https://www.pexels.com/license/). Attribution is not required but is
 * recorded anyway in /docs/image-credits.md.
 *
 * Usage:  node scripts/discover-images.mjs
 */

import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

const QUERIES = [
  // Dresses
  "midi dress woman",
  "floral dress woman",
  "black dress woman",
  "summer dress woman",
  "wrap dress",
  "linen dress woman",
  // Tops
  "blouse woman",
  "white shirt woman",
  "knit sweater woman",
  "striped top woman",
  // Bottoms
  "jeans woman fashion",
  "trousers woman fashion",
  "skirt woman fashion",
  "denim skirt woman",
  // Outerwear
  "trench coat woman",
  "blazer woman",
  "denim jacket woman",
  "cardigan woman",
  "wool coat woman",
  // Accessories
  "leather handbag",
  "silk scarf",
  "sunglasses woman fashion",
  "gold earrings jewelry",
  "leather belt accessory",
  // Editorial / lifestyle / about
  "fashion boutique interior",
  "clothing rack boutique",
  "women shopping clothes store",
  "fashion designer studio",
];

/** curl is used instead of fetch(): the source rejects bare fetch() headers. */
function fetchText(url) {
  return execFileSync("curl", ["-s", "-L", "--max-time", "45", "-A", UA, url], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

/** Pull the JSON-LD ItemList out of a Pexels search results page. */
function extract(html) {
  const blocks = [...html.matchAll(
    /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  )].map((m) => m[1]);

  for (const raw of blocks) {
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      continue;
    }
    const list = data?.mainEntity;
    if (!list || list["@type"] !== "ItemList") continue;

    return (list.itemListElement || [])
      .map((entry) => entry.item)
      .filter((item) => item && item["@type"] === "ImageObject")
      .map((item) => {
        const idMatch = String(item.url || "").match(/-(\d+)\/?$/);
        return {
          id: idMatch ? idMatch[1] : null,
          page: item.url || "",
          contentUrl: item.contentUrl || "",
          title: item.name || "",
          description: item.description || item.caption || "",
          photographer: item.creator?.name || "Pexels contributor",
          photographerUrl: item.creator?.url || "",
        };
      })
      .filter((item) => item.id);
  }
  return [];
}

/** Fallback: some responses omit the JSON-LD block, so read the <img> tags. */
function extractFallback(html) {
  const out = new Map();
  for (const tag of html.match(/<img[^>]+>/g) || []) {
    const idMatch = tag.match(/images\.pexels\.com\/photos\/(\d+)\//);
    if (!idMatch) continue;
    const alt = (tag.match(/alt="([^"]*)"/) || [, ""])[1]
      .replace(/^Free\s+/, "")
      .replace(/\s*Stock Photo.*$/, "")
      .trim();
    if (!/^[A-Z]/.test(alt)) continue; // skip short tag-style alts
    const id = idMatch[1];
    if (out.has(id)) continue;
    out.set(id, {
      id,
      page: `https://www.pexels.com/photo/${id}/`,
      contentUrl: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg`,
      title: alt,
      description: alt,
      photographer: "Pexels contributor",
      photographerUrl: "",
    });
  }
  return [...out.values()];
}

// Merge with any previous run so intermittent empty responses don't lose data.
let results = {};
try {
  results = JSON.parse(
    await fs.readFile(path.join(process.cwd(), "scripts", "image-candidates.json"), "utf8")
  );
} catch {
  results = {};
}

for (const q of QUERIES) {
  if (Array.isArray(results[q]) && results[q].length >= 20 && results[q][0].photographerUrl) {
    console.log(`${q.padEnd(32)} -> cached (${results[q].length})`);
    continue;
  }
  const url = `https://www.pexels.com/search/${encodeURIComponent(q)}/`;
  let items = [];
  for (let attempt = 1; attempt <= 3 && items.length === 0; attempt++) {
    try {
      const html = fetchText(url);
      items = extract(html);
      if (items.length === 0) items = extractFallback(html);
    } catch (err) {
      console.log(`  attempt ${attempt} failed: ${err.message}`);
    }
    if (items.length === 0) await new Promise((r) => setTimeout(r, 3000));
  }
  results[q] = items;
  console.log(`${q.padEnd(32)} -> ${items.length}`);
  await new Promise((r) => setTimeout(r, 1500)); // be polite to the source
}

const outFile = path.join(process.cwd(), "scripts", "image-candidates.json");
await fs.writeFile(outFile, JSON.stringify(results, null, 2), "utf8");
console.log(`\nWrote ${outFile}`);
