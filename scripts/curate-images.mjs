/**
 * curate-images.mjs
 * ------------------------------------------------------------------
 * Development helper (NOT part of the shipped site).
 *
 * Takes the hand-picked selections below (query + index into
 * scripts/image-candidates.json), downloads each photo into
 * /assets/images/<folder>/<descriptive-name>.jpg, measures it, and emits:
 *
 *   scripts/images-manifest.json   -> path / width / height / alt / credit
 *   scripts/download-images.sh     -> reproducible curl downloader
 *   docs/image-credits.md          -> source URL + photographer per file
 *
 * Every photo comes from Pexels and is free to use under the Pexels
 * License (https://www.pexels.com/license/).
 *
 * Usage:  node scripts/curate-images.mjs
 */

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const CANDIDATES_FILE = path.join(ROOT, "scripts", "image-candidates.json");

if (!fs.existsSync(CANDIDATES_FILE)) {
  console.error(
    "scripts/image-candidates.json is missing.\n" +
      "It is discovery scratch data and is not kept in the project.\n" +
      "Regenerate it first:  node scripts/discover-images.mjs\n\n" +
      "To simply re-download the photography already in use, you do not need it:\n" +
      "  bash scripts/download-images.sh"
  );
  process.exit(1);
}

const CANDIDATES = JSON.parse(fs.readFileSync(CANDIDATES_FILE, "utf8"));

/* ------------------------------------------------------------------ *
 * Selections: [query, indexInQuery, folder, fileName, width, altText]
 * ------------------------------------------------------------------ */

const PRODUCT_PICKS = [
  // --- Dresses ---------------------------------------------------
  ["marlowe-wrap-dress", [
    ["wrap dress", 1, "Model wearing the Marlowe Wrap Dress in ivory, front view"],
    ["linen dress woman", 16, "Close-up of the Marlowe Wrap Dress tie waist in amber"],
    ["wrap dress", 23, "Marlowe Wrap Dress styled with flat sandals outdoors"],
  ]],
  ["juniper-floral-midi-dress", [
    ["floral dress woman", 3, "Model wearing the Juniper Floral Midi Dress in a garden"],
    ["floral dress woman", 11, "Juniper Floral Midi Dress shown in full length outdoors"],
    ["floral dress woman", 16, "Detail of the Juniper Floral Midi Dress print and sleeve"],
  ]],
  ["everly-black-midi-dress", [
    ["black dress woman", 9, "Model wearing the Everly Black Midi Dress outdoors"],
    ["black dress woman", 16, "Everly Black Midi Dress styled for the city, side view"],
    ["black dress woman", 14, "Everly Black Midi Dress shown walking, full length"],
  ]],
  ["soleil-polka-dot-sundress", [
    ["midi dress woman", 4, "Model wearing the Soleil Polka Dot Sundress with sunglasses"],
    ["midi dress woman", 23, "Soleil Polka Dot Sundress seen seated by a window"],
    ["summer dress woman", 15, "Soleil Polka Dot Sundress photographed in a summer field"],
  ]],
  ["wren-linen-midi-dress", [
    ["linen dress woman", 5, "Model wearing the Wren Linen Midi Dress beside a tree"],
    ["linen dress woman", 18, "Wren Linen Midi Dress in natural light, front view"],
    ["linen dress woman", 17, "Wren Linen Midi Dress shown in profile outdoors"],
  ]],
  ["odette-velvet-dress", [
    ["midi dress woman", 8, "Model wearing the Odette Velvet Dress in claret"],
    ["black dress woman", 20, "Odette Velvet Dress styled for an evening event"],
    ["black dress woman", 11, "Detail of the Odette Velvet Dress neckline"],
  ]],
  ["camille-blush-column-dress", [
    ["midi dress woman", 6, "Model wearing the Camille Blush Column Dress on a city street"],
    ["midi dress woman", 12, "Camille Blush Column Dress layered under a coat"],
    ["midi dress woman", 21, "Camille Blush Column Dress shown in full length indoors"],
  ]],

  // --- Tops ------------------------------------------------------
  ["hollis-silk-blouse", [
    ["blouse woman", 4, "Model wearing the Hollis Silk Blouse in ivory"],
    ["blouse woman", 13, "Hollis Silk Blouse photographed seated, front view"],
    ["blouse woman", 9, "Close-up of the Hollis Silk Blouse cuff and sleeve"],
  ]],
  ["poppy-rose-blouse", [
    ["blouse woman", 0, "Model wearing the Poppy Rose Blouse in rose pink"],
    ["blouse woman", 12, "Poppy Rose Blouse shown outdoors, three-quarter view"],
    ["blouse woman", 14, "Poppy Rose Blouse on a plain studio backdrop"],
  ]],
  ["marin-poplin-shirt", [
    ["white shirt woman", 13, "Model wearing the Marin Poplin Shirt in white"],
    ["white shirt woman", 10, "Marin Poplin Shirt styled with tailored trousers"],
    ["white shirt woman", 7, "Close-up of the Marin Poplin Shirt collar and placket"],
  ]],
  ["field-cable-knit-sweater", [
    ["knit sweater woman", 6, "Close-up of the Field Cable-Knit Sweater texture"],
    ["knit sweater woman", 14, "Field Cable-Knit Sweater shown on the shoulder and sleeve"],
    ["knit sweater woman", 16, "Field Cable-Knit Sweater folded, showing the oatmeal color"],
  ]],
  ["harbor-striped-tee", [
    ["striped top woman", 2, "Model wearing the Harbor Striped Tee outdoors"],
    ["striped top woman", 15, "Harbor Striped Tee in natural light, front view"],
    ["striped top woman", 16, "Harbor Striped Tee styled casually, three-quarter view"],
  ]],
  ["aspen-wool-knit-sweater", [
    ["knit sweater woman", 5, "Model wearing the Aspen Wool Knit Sweater indoors"],
    ["knit sweater woman", 12, "Aspen Wool Knit Sweater in ivory, close-up of the neckline"],
    ["knit sweater woman", 13, "Aspen Wool Knit Sweater shown relaxed, front view"],
  ]],
  ["lena-tie-neck-blouse", [
    ["blouse woman", 16, "Model wearing the Lena Tie-Neck Blouse in marigold"],
    ["blouse woman", 17, "Lena Tie-Neck Blouse in plum, natural light"],
    ["blouse woman", 10, "Lena Tie-Neck Blouse in ivory, styled outdoors"],
  ]],

  // --- Bottoms ---------------------------------------------------
  ["reid-high-rise-jeans", [
    ["jeans woman fashion", 22, "Reid High-Rise Jeans in light wash on a plain backdrop"],
    ["jeans woman fashion", 1, "Model wearing the Reid High-Rise Jeans with a white top"],
    ["jeans woman fashion", 21, "Reid High-Rise Jeans styled with a tank, full length"],
  ]],
  ["della-wide-leg-trousers", [
    ["trousers woman fashion", 3, "Model wearing the Della Wide-Leg Trousers in white"],
    ["trousers woman fashion", 16, "Della Wide-Leg Trousers styled with a matching jacket"],
    ["trousers woman fashion", 19, "Della Wide-Leg Trousers in grey, full length"],
  ]],
  ["nova-tailored-ankle-pant", [
    ["trousers woman fashion", 10, "Nova Tailored Ankle Pant in chestnut, studio shot"],
    ["trousers woman fashion", 6, "Nova Tailored Ankle Pant shown as part of a suit set"],
    ["trousers woman fashion", 17, "Nova Tailored Ankle Pant in brick, styled indoors"],
  ]],
  ["june-pleated-midi-skirt", [
    ["skirt woman fashion", 19, "Model wearing the June Pleated Midi Skirt in burgundy"],
    ["skirt woman fashion", 5, "June Pleated Midi Skirt in chestnut, walking"],
    ["skirt woman fashion", 6, "June Pleated Midi Skirt styled with a dark blouse"],
  ]],
  ["sutton-denim-skirt", [
    ["denim skirt woman", 4, "Model wearing the Sutton Denim Skirt outdoors"],
    ["denim skirt woman", 7, "Close-up of the Sutton Denim Skirt pockets"],
    ["denim skirt woman", 10, "Sutton Denim Skirt styled with a cropped top"],
  ]],
  ["quinn-coated-straight-pant", [
    ["trousers woman fashion", 0, "Model wearing the Quinn Coated Straight Pant in black"],
    ["leather belt accessory", 7, "Detail of the Quinn Coated Straight Pant finish"],
    ["leather belt accessory", 21, "Quinn Coated Straight Pant styled with accessories"],
  ]],

  // --- Outerwear -------------------------------------------------
  ["ainsley-classic-trench-coat", [
    ["trench coat woman", 6, "Model wearing the Ainsley Classic Trench Coat in khaki"],
    ["trench coat woman", 11, "Ainsley Classic Trench Coat on a city street corner"],
    ["trench coat woman", 17, "Ainsley Classic Trench Coat in beige, three-quarter view"],
  ]],
  ["bexley-relaxed-blazer", [
    ["blazer woman", 6, "Model wearing the Bexley Relaxed Blazer"],
    ["blazer woman", 16, "Bexley Relaxed Blazer in chestnut, seated"],
    ["blazer woman", 20, "Bexley Relaxed Blazer in ivory styled with jeans"],
  ]],
  ["piper-denim-jacket", [
    ["denim jacket woman", 10, "Model wearing the Piper Denim Jacket outdoors"],
    ["denim jacket woman", 13, "Piper Denim Jacket styled on a city street"],
    ["denim jacket woman", 5, "Piper Denim Jacket in mid wash, three-quarter view"],
  ]],
  ["wilder-longline-cardigan", [
    ["cardigan woman", 3, "Model wearing the Wilder Longline Cardigan in oatmeal"],
    ["cardigan woman", 23, "Wilder Longline Cardigan layered over a tee"],
    ["cardigan woman", 16, "Wilder Longline Cardigan worn open over a dress"],
  ]],
  ["arden-wool-overcoat", [
    ["wool coat woman", 20, "Model wearing the Arden Wool Overcoat in camel"],
    ["wool coat woman", 9, "Arden Wool Overcoat photographed outdoors in winter"],
    ["wool coat woman", 3, "Arden Wool Overcoat in grey, front view"],
  ]],

  // --- Accessories -----------------------------------------------
  ["sloane-leather-satchel", [
    ["leather handbag", 6, "Sloane Leather Satchel shown upright on a stool"],
    ["leather handbag", 13, "Sloane Leather Satchel carried by hand"],
    ["leather handbag", 7, "Sloane Leather Satchel shown in two colorways"],
  ]],
  ["mira-silk-scarf", [
    ["silk scarf", 2, "Mira Silk Scarf tied over a white shirt"],
    ["silk scarf", 11, "Mira Silk Scarf laid flat showing the full print"],
    ["silk scarf", 8, "Mira Silk Scarf folded beside its gift box"],
  ]],
  ["sable-sunglasses", [
    ["sunglasses woman fashion", 9, "Model wearing the Sable Sunglasses, profile view"],
    ["sunglasses woman fashion", 10, "Sable Sunglasses held in hand"],
    ["sunglasses woman fashion", 13, "Sable Sunglasses worn in a studio portrait"],
  ]],
  ["lark-gold-hoop-earrings", [
    ["gold earrings jewelry", 1, "Lark Gold Hoop Earrings worn, close-up"],
    ["gold earrings jewelry", 19, "Lark Gold Hoop Earrings photographed on satin"],
    ["gold earrings jewelry", 10, "Lark Gold Hoop Earrings styled with flowers"],
  ]],
  ["rowan-leather-belt", [
    ["leather belt accessory", 19, "Rowan Leather Belt with brass buckle"],
    ["leather belt accessory", 3, "Rowan Leather Belt shown in four colorways"],
    ["leather belt accessory", 15, "Rowan Leather Belt colors laid side by side"],
  ]],
];

const OTHER_PICKS = [
  // [query, index, folder, fileName, requestWidth, alt]
  ["skirt woman fashion", 10, "hero", "hero-autumn-collection", 1600,
    "A woman in a coat and midi skirt walking along a sunlit city street"],
  ["clothing rack boutique", 4, "hero", "hero-newsletter-boutique", 1600,
    "Interior of a bright boutique with garments on racks and indoor plants"],

  ["floral dress woman", 1, "categories", "category-dresses", 900,
    "A woman in a floral midi dress and hat walking on a sunny street"],
  ["blouse woman", 5, "categories", "category-tops", 900,
    "A woman in a white blouse seated at an outdoor cafe table"],
  ["jeans woman fashion", 0, "categories", "category-bottoms", 900,
    "A woman in denim walking down a city street"],
  ["trench coat woman", 10, "categories", "category-outerwear", 900,
    "A woman in a trench coat walking through a sunlit corridor"],
  ["leather handbag", 0, "categories", "category-accessories", 900,
    "Leather handbags arranged on a white wooden shelf"],

  ["jeans woman fashion", 14, "lifestyle", "lookbook-weekend-denim", 1200,
    "A woman in a casual denim outfit on a city street"],
  ["trousers woman fashion", 11, "lifestyle", "lookbook-workday-tailoring", 1200,
    "A woman in tailored trousers standing in a bright office hallway"],
  ["cardigan woman", 18, "lifestyle", "lookbook-slow-sunday", 1200,
    "A woman in a long cardigan standing in a sunlit grass field"],
  ["midi dress woman", 17, "lifestyle", "lookbook-occasion-dressing", 1200,
    "A woman in a blue dress seated indoors surrounded by plants"],

  ["fashion designer studio", 16, "about", "about-atelier-measuring", 1200,
    "A person measuring fabric on a dress form in a sewing studio"],
  ["fashion designer studio", 2, "about", "about-fabric-selection", 1200,
    "A designer holding folded fabric swatches"],
  ["women shopping clothes store", 6, "about", "about-boutique-floor", 1200,
    "A calm womenswear shop floor with garments on display"],
];

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

function pick(query, index) {
  const list = CANDIDATES[query];
  if (!list) throw new Error(`No candidates for query "${query}"`);
  const item = list[index];
  if (!item) throw new Error(`No candidate at ${query}[${index}]`);
  return item;
}

/** Build the resized delivery URL used for the local copy. */
function deliveryUrl(contentUrl, width) {
  const base = contentUrl.split("?")[0];
  return `${base}?auto=compress&cs=tinysrgb&dpr=1&w=${width}`;
}

/** Minimal JPEG SOFn parser -> {width, height}. */
function jpegSize(file) {
  const buf = fs.readFileSync(file);
  let offset = 2;
  while (offset < buf.length) {
    if (buf[offset] !== 0xff) {
      offset++;
      continue;
    }
    const marker = buf[offset + 1];
    const length = buf.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  throw new Error(`Could not read dimensions from ${file}`);
}

/**
 * Some candidates were recovered from <img> tags, where the delivery URL has to
 * be reconstructed and occasionally misses a path segment. Resolve the real one
 * from the photo page's og:image tag.
 */
function resolveFromPage(pageUrl) {
  const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";
  const html = execFileSync(
    "curl",
    ["-s", "-L", "--max-time", "45", "-A", UA, pageUrl],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
  );
  const m = html.match(
    /property="og:image"\s+content="(https:\/\/images\.pexels\.com\/photos\/[^"]+?)(\?[^"]*)?"/
  );
  if (!m) throw new Error(`Could not resolve image URL from ${pageUrl}`);
  return m[1].replace(/&amp;/g, "&");
}

function download(url, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  execFileSync("curl", ["-s", "-L", "--fail", "--max-time", "60", "-o", dest, url], {
    stdio: "inherit",
  });
  const stat = fs.statSync(dest);
  if (stat.size < 2000) throw new Error(`Suspiciously small download: ${dest}`);
}

/* ------------------------------------------------------------------ *
 * Build the job list
 * ------------------------------------------------------------------ */

const jobs = [];

for (const [slug, shots] of PRODUCT_PICKS) {
  shots.forEach(([query, index, alt], i) => {
    const src = pick(query, index);
    jobs.push({
      slug,
      role: i === 0 ? "primary" : "gallery",
      folder: "products",
      file: `${slug}-${i + 1}.jpg`,
      width: 900,
      alt,
      src,
    });
  });
}

for (const [query, index, folder, file, width, alt] of OTHER_PICKS) {
  jobs.push({
    slug: file,
    role: folder,
    folder,
    file: `${file}.jpg`,
    width,
    alt,
    src: pick(query, index),
  });
}

/* ------------------------------------------------------------------ *
 * Download + measure
 * ------------------------------------------------------------------ */

const manifest = [];
const failures = [];

for (const job of jobs) {
  const rel = `assets/images/${job.folder}/${job.file}`;
  const dest = path.join(ROOT, rel);
  let url = deliveryUrl(job.src.contentUrl, job.width);
  try {
    if (!fs.existsSync(dest)) {
      try {
        download(url, dest);
      } catch {
        // Reconstructed URL was wrong - ask the photo page for the real one.
        url = deliveryUrl(resolveFromPage(job.src.page), job.width);
        download(url, dest);
      }
    }
    const { width, height } = jpegSize(dest);
    manifest.push({
      slug: job.slug,
      role: job.role,
      path: rel,
      width,
      height,
      bytes: fs.statSync(dest).size,
      alt: job.alt,
      url,
      sourcePage: job.src.page,
      photographer: job.src.photographer,
      photographerUrl: job.src.photographerUrl,
      title: job.src.title,
    });
    console.log(`ok   ${rel}  ${width}x${height}`);
  } catch (err) {
    failures.push({ rel, url, message: err.message });
    console.log(`FAIL ${rel}  ${err.message}`);
  }
}

await fsp.writeFile(
  path.join(ROOT, "scripts", "images-manifest.json"),
  JSON.stringify({ manifest, failures }, null, 2),
  "utf8"
);

/* ------------------------------------------------------------------ *
 * Emit the reproducible downloader
 * ------------------------------------------------------------------ */

const shLines = [
  "#!/usr/bin/env bash",
  "#",
  "# download-images.sh",
  "# ---------------------------------------------------------------",
  "# Downloads every photo used by the Hollis & Hem storefront into",
  "# /assets/images/. Run from the project root:",
  "#",
  "#     bash scripts/download-images.sh",
  "#",
  "# All photos come from Pexels and are free to use under the Pexels",
  "# License (https://www.pexels.com/license/). Credits, including the",
  "# source page for each file, are listed in /docs/image-credits.md.",
  "#",
  "# The site never hotlinks: these files are served from local paths.",
  "",
  "set -euo pipefail",
  "",
  'ROOT="$(cd "$(dirname "$0")/.." && pwd)"',
  'cd "$ROOT"',
  "",
  "mkdir -p assets/images/hero assets/images/products assets/images/categories \\",
  "         assets/images/lifestyle assets/images/about",
  "",
  "download() {",
  '  local url="$1" dest="$2"',
  '  if [ -f "$dest" ]; then',
  '    echo "skip   $dest (already present)"',
  "    return 0",
  "  fi",
  '  echo "fetch  $dest"',
  '  curl -sSL --fail --max-time 60 -o "$dest" "$url"',
  "}",
  "",
];

for (const m of manifest) {
  shLines.push(`download "${m.url}" "${m.path}"`);
}
shLines.push("", 'echo "Done. All images are stored locally under assets/images/."', "");

await fsp.writeFile(
  path.join(ROOT, "scripts", "download-images.sh"),
  shLines.join("\n"),
  "utf8"
);

/* ------------------------------------------------------------------ *
 * Emit image credits
 * ------------------------------------------------------------------ */

const byFolder = {};
for (const m of manifest) (byFolder[m.path.split("/")[2]] ||= []).push(m);

const credits = [
  "# Image Credits",
  "",
  "Every image on this site is stored locally in `/assets/images/` and is served",
  "from a relative path. Nothing is hotlinked from an external host.",
  "",
  "All photographs come from **Pexels** and are used under the",
  "[Pexels License](https://www.pexels.com/license/), which permits free commercial",
  "and non-commercial use without attribution. Credit is given below anyway.",
  "",
  "> **Note for the store owner:** these are stock photographs used to build out the",
  "> storefront. Replace them with photographs of your own products before you run",
  "> ads or list items for sale, so that every image matches the item being sold.",
  "",
  `Files: ${manifest.length}. Re-download them at any time with \`bash scripts/download-images.sh\`.`,
  "",
];

for (const folder of ["hero", "products", "categories", "lifestyle", "about"]) {
  const rows = byFolder[folder] || [];
  if (!rows.length) continue;
  credits.push(`## /assets/images/${folder}/`, "");
  credits.push("| File | Dimensions | Photographer | Source |");
  credits.push("| --- | --- | --- | --- |");
  for (const r of rows) {
    credits.push(
      `| \`${r.path.split("/").pop()}\` | ${r.width}x${r.height} | ${r.photographer} | [Pexels](${r.sourcePage}) |`
    );
  }
  credits.push("");
}

if (failures.length) {
  credits.push("## Downloads that failed", "");
  for (const f of failures) credits.push(`- \`${f.rel}\` - ${f.message}`);
  credits.push("");
}

await fsp.writeFile(path.join(ROOT, "docs", "image-credits.md"), credits.join("\n"), "utf8");

console.log(`\n${manifest.length} images, ${failures.length} failures.`);
