/**
 * build-catalog.mjs
 * ------------------------------------------------------------------
 * Development helper (NOT part of the shipped site).
 *
 * Holds the catalog copy and merges it with the real, measured image
 * dimensions from scripts/images-manifest.json, then writes the shipped
 * catalog file: assets/js/products.js
 *
 * Keeping the dimensions machine-generated guarantees that every <img>
 * gets correct width/height attributes, which prevents layout shift.
 *
 * Usage:  node scripts/build-catalog.mjs
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const { manifest } = JSON.parse(
  fs.readFileSync(path.join(ROOT, "scripts", "images-manifest.json"), "utf8")
);

const imagesBySlug = {};
for (const m of manifest) {
  if (!m.path.includes("/products/")) continue;
  (imagesBySlug[m.slug] ||= []).push(m);
}
for (const slug of Object.keys(imagesBySlug)) {
  imagesBySlug[slug].sort((a, b) => a.path.localeCompare(b.path));
}

/* ------------------------------------------------------------------ *
 * Shared size scales
 * ------------------------------------------------------------------ */
const ALPHA = ["XS", "S", "M", "L", "XL"];
const NUMERIC = ["0", "2", "4", "6", "8", "10", "12", "14", "16"];

/* Color families power the shop filters. */
const C = {
  ivory: { name: "Ivory", hex: "#F3EFE7", family: "Neutral" },
  bone: { name: "Bone", hex: "#E8E1D5", family: "Neutral" },
  oatmeal: { name: "Oatmeal", hex: "#D9CBB6", family: "Neutral" },
  white: { name: "White", hex: "#FFFFFF", family: "White" },
  black: { name: "Black", hex: "#1C1C1C", family: "Black" },
  charcoal: { name: "Charcoal", hex: "#4A4A4A", family: "Black" },
  espresso: { name: "Espresso", hex: "#3B2C24", family: "Brown" },
  chestnut: { name: "Chestnut", hex: "#8A5A34", family: "Brown" },
  camel: { name: "Camel", hex: "#B0875F", family: "Brown" },
  cognac: { name: "Cognac", hex: "#8C4A22", family: "Brown" },
  tan: { name: "Tan", hex: "#C19A6B", family: "Brown" },
  khaki: { name: "Khaki", hex: "#A99372", family: "Brown" },
  tortoise: { name: "Tortoise", hex: "#6B4526", family: "Brown" },
  gray: { name: "Gray", hex: "#8E8E8E", family: "Gray" },
  navy: { name: "Navy", hex: "#22304A", family: "Blue" },
  midnight: { name: "Midnight", hex: "#1B2436", family: "Blue" },
  indigo: { name: "Indigo", hex: "#33475F", family: "Blue" },
  lightwash: { name: "Light Wash", hex: "#9FB6CC", family: "Blue" },
  midwash: { name: "Mid Wash", hex: "#6C8AA8", family: "Blue" },
  chambray: { name: "Chambray", hex: "#8FA6BF", family: "Blue" },
  sage: { name: "Sage", hex: "#A3B09A", family: "Green" },
  gardengreen: { name: "Garden Green", hex: "#5F7052", family: "Green" },
  blush: { name: "Blush", hex: "#EBC9C4", family: "Pink" },
  rose: { name: "Rose", hex: "#D98B9A", family: "Pink" },
  poppy: { name: "Poppy Red", hex: "#B4382F", family: "Red" },
  claret: { name: "Claret", hex: "#6E2233", family: "Red" },
  burgundy: { name: "Burgundy", hex: "#5E2436", family: "Red" },
  marigold: { name: "Marigold", hex: "#E0A52E", family: "Yellow" },
  gold: { name: "Gold", hex: "#C9A96E", family: "Yellow" },
  plum: { name: "Plum", hex: "#6B4A73", family: "Purple" },
  ink: { name: "Ink", hex: "#2C3550", family: "Blue" }
};

/* ------------------------------------------------------------------ *
 * The catalog
 * ------------------------------------------------------------------ */
const PRODUCTS = [
  /* ------------------------------------------------------- Dresses (7) */
  {
    id: "marlowe-wrap-dress",
    name: "Marlowe Wrap Dress",
    category: "Dresses",
    price: 128,
    colors: [C.ivory, C.chestnut],
    sizes: ALPHA,
    numericSizes: NUMERIC,
    released: "2026-08-14",
    tags: ["new", "bestseller"],
    summary:
      "A true wrap dress with a deep V neckline, a tie waist you can set where you want it, and a skirt that falls just below the knee.",
    description:
      "The Marlowe is the dress we reach for when the day has more than one setting in it. The wrap front adjusts to your shape rather than the other way around, the sleeves hit at the elbow, and the skirt has enough sweep to move without feeling formal. Wear it with flats for a workday and swap in a heel and the Mira scarf for dinner.",
    fabric: "100% viscose, woven in a soft crepe with a matte finish. Unlined.",
    care: "Machine wash cold on the gentle cycle, hang to dry, warm iron if needed. Do not bleach.",
    fit: "True to size. Falls 46\" from the shoulder on a size S. Our model is 5'8\" and wears a size S.",
    details: [
      "Adjustable self-tie waist with an interior anchor tie",
      "Elbow-length sleeves with a rolled hem",
      "Falls just below the knee on most heights"
    ]
  },
  {
    id: "juniper-floral-midi-dress",
    name: "Juniper Floral Midi Dress",
    category: "Dresses",
    price: 118,
    colors: [C.poppy, C.gardengreen],
    sizes: ALPHA,
    numericSizes: NUMERIC,
    released: "2026-07-02",
    tags: ["bestseller"],
    summary:
      "A button-front midi in a small-scale floral print, cut with a gathered waist and a skirt that swings.",
    description:
      "Juniper is printed in a small floral that reads as texture from a few feet away, which is why it works as easily at a weekday lunch as it does at a summer wedding. The bodice buttons all the way down, the waist is gathered onto a fixed band, and the skirt is cut full enough to sit comfortably in.",
    fabric: "100% rayon challis. Lightweight with a fluid drape. Skirt is lined to the knee.",
    care: "Machine wash cold, tumble dry low, cool iron on the reverse.",
    fit: "True to size. Falls 48\" from the shoulder on a size S. Our model is 5'7\" and wears a size S.",
    details: [
      "Functional button placket from neckline to hem",
      "Gathered waist seam with a fixed band",
      "Side seam pockets"
    ]
  },
  {
    id: "everly-black-midi-dress",
    name: "Everly Black Midi Dress",
    category: "Dresses",
    price: 98,
    colors: [C.black, C.espresso],
    sizes: ALPHA,
    numericSizes: NUMERIC,
    released: "2026-06-18",
    tags: ["bestseller"],
    summary:
      "A clean-lined black midi in a substantial stretch jersey — the one that quietly does most of the work in a suitcase.",
    description:
      "Everly is cut close without being tight, in a jersey heavy enough to hold its shape through a long day. The neckline sits wide across the collarbone and the hem lands mid-calf. It layers under the Bexley blazer for work and stands on its own with the Lark hoops in the evening.",
    fabric: "92% viscose, 8% elastane ponte jersey. Medium weight with four-way stretch.",
    care: "Machine wash cold with like colors, lay flat to dry. Do not tumble dry.",
    fit: "True to size, with stretch. Falls 50\" from the shoulder on a size S. Our model is 5'9\" and wears a size S.",
    details: [
      "Wide boat neckline",
      "Set-in sleeves ending above the elbow",
      "Discreet back slit for walking ease"
    ]
  },
  {
    id: "soleil-polka-dot-sundress",
    name: "Soleil Polka Dot Sundress",
    category: "Dresses",
    price: 88,
    colors: [C.navy, C.black],
    sizes: ALPHA,
    numericSizes: NUMERIC,
    released: "2026-05-09",
    tags: [],
    summary:
      "A short-sleeve dot-print dress with a smocked back, cut above the knee for warm days.",
    description:
      "Soleil is the lightest dress in the collection. The back panel is smocked so it gives where you need it, the sleeves are short and slightly gathered at the shoulder, and the skirt is cut on a gentle A-line. It takes a sneaker as happily as a sandal.",
    fabric: "100% cotton poplin with a printed dot. Crisp and breathable.",
    care: "Machine wash cold, tumble dry low. Warm iron.",
    fit: "True to size. Falls 38\" from the shoulder on a size S. Our model is 5'6\" and wears a size S.",
    details: [
      "Smocked back panel for an adjustable fit",
      "Gathered short sleeves",
      "Hits above the knee on most heights"
    ]
  },
  {
    id: "wren-linen-midi-dress",
    name: "Wren Linen Midi Dress",
    category: "Dresses",
    price: 112,
    colors: [C.ivory, C.sage],
    sizes: ALPHA,
    numericSizes: NUMERIC,
    released: "2026-08-14",
    tags: ["new"],
    summary:
      "A relaxed linen dress with dropped shoulders and a drawstring waist you can cinch or leave loose.",
    description:
      "Wren is cut generously on purpose. The shoulders drop past the joint, the sleeves are wide to the elbow, and a drawstring at the waist lets you decide how much shape the dress has on a given day. Linen softens noticeably after the first few washes.",
    fabric: "100% washed European linen, mid-weight. Naturally textured; slubs are part of the cloth.",
    care: "Machine wash cold on the gentle cycle, tumble dry low, or line dry for a softer hand.",
    fit: "Relaxed. Size down if you prefer a closer fit. Falls 47\" from the shoulder on a size S. Our model is 5'8\" and wears a size S.",
    details: [
      "Adjustable drawstring waist",
      "Dropped shoulder with a wide three-quarter sleeve",
      "Deep side seam pockets"
    ]
  },
  {
    id: "odette-velvet-dress",
    name: "Odette Velvet Dress",
    category: "Dresses",
    price: 168,
    colors: [C.claret, C.midnight],
    sizes: ALPHA,
    numericSizes: NUMERIC,
    released: "2026-09-01",
    tags: ["new"],
    summary:
      "A stretch velvet dress for the handful of evenings each year that ask for one.",
    description:
      "Odette is our occasion dress, cut long with a soft V neckline and a skirt that skims rather than clings. The velvet has enough stretch to sit and dance in, and the color reads deep and even under low light. It is the dress that makes a December evening easy to dress for.",
    fabric: "90% polyester, 10% elastane stretch velvet. Fully lined in a smooth jersey.",
    care: "Dry clean recommended. If washing at home, use cold water on the delicate cycle and hang to dry.",
    fit: "True to size, with stretch. Falls 54\" from the shoulder on a size S. Our model is 5'9\" and wears a size S.",
    details: [
      "Soft V neckline front and back",
      "Long sleeves with a slight flare at the wrist",
      "Concealed side zip"
    ]
  },
  {
    id: "camille-blush-column-dress",
    name: "Camille Blush Column Dress",
    category: "Dresses",
    price: 142,
    colors: [C.blush, C.bone],
    sizes: ALPHA,
    numericSizes: NUMERIC,
    released: "2026-07-24",
    tags: [],
    summary:
      "A straight column dress with a subtle sheen, built on a structured bodice and a hidden back slit.",
    description:
      "Camille is the most formal shape we make and still comfortable enough for a full day. The bodice is lightly structured through the bust, the waist seam sits at the natural waist, and the skirt runs straight to mid-calf with a back slit so you can take a normal stride.",
    fabric: "68% viscose, 27% polyamide, 5% elastane with a soft satin face. Fully lined.",
    care: "Dry clean, or hand wash cold and hang to dry. Cool iron on the reverse.",
    fit: "Close through the waist and hip. Size up if between sizes. Falls 52\" from the shoulder on a size S.",
    details: [
      "Lightly structured bodice",
      "Natural-waist seam",
      "Back walking slit"
    ]
  },

  /* ---------------------------------------------------------- Tops (7) */
  {
    id: "hollis-silk-blouse",
    name: "Hollis Silk Blouse",
    category: "Tops",
    price: 86,
    colors: [C.ivory, C.black],
    sizes: ALPHA,
    released: "2026-08-14",
    tags: ["new", "bestseller"],
    summary:
      "Our house blouse: a high ruffled neckline, full sleeves, and a body cut to tuck cleanly.",
    description:
      "The Hollis blouse is the piece the store is named for. The neckline stands slightly at the throat with a narrow ruffle, the sleeves are full to a buttoned cuff, and the body is cut long enough to stay tucked. It is the fastest way we know to make trousers or jeans look considered.",
    fabric: "100% sandwashed silk, 16 momme. Matte, opaque, and cool to the touch.",
    care: "Hand wash cold and hang to dry, or dry clean. Cool iron on the reverse.",
    fit: "Relaxed through the body. Our model is 5'8\" and wears a size S.",
    details: [
      "Narrow standing ruffle at the neckline",
      "Full sleeve with a two-button cuff",
      "Curved hem, cut to tuck"
    ]
  },
  {
    id: "poppy-rose-blouse",
    name: "Poppy Rose Blouse",
    category: "Tops",
    price: 72,
    colors: [C.rose, C.white],
    sizes: ALPHA,
    released: "2026-06-04",
    tags: [],
    summary:
      "A button-front blouse in a soft rose, with a collar that sits neatly under a blazer.",
    description:
      "Poppy is a simple button-front shirt made in a fabric with a little more give than a classic poplin, so it moves with you through a full day of meetings. The collar is cut small and stays flat under a jacket, and the sleeves roll and stay put with a button tab.",
    fabric: "72% cotton, 25% polyamide, 3% elastane. Smooth with a slight stretch.",
    care: "Machine wash cold, hang to dry, warm iron.",
    fit: "True to size. Our model is 5'6\" and wears a size S.",
    details: [
      "Small point collar",
      "Roll-up sleeves with a button tab",
      "Straight hem"
    ]
  },
  {
    id: "marin-poplin-shirt",
    name: "Marin Poplin Shirt",
    category: "Tops",
    price: 68,
    colors: [C.white, C.chambray],
    sizes: ALPHA,
    released: "2026-05-22",
    tags: ["bestseller"],
    summary:
      "The white shirt, cut relaxed: dropped shoulders, a longer back hem, and a collar with a little structure.",
    description:
      "Marin is our take on the white shirt, cut looser than a dress shirt and finished with a back hem that covers when you leave it out. The poplin is opaque without feeling heavy, and the collar has enough interfacing to stand on its own but not so much that it looks stiff.",
    fabric: "100% organic cotton poplin, 120 gsm. Opaque and crisp.",
    care: "Machine wash warm, tumble dry low, hot iron.",
    fit: "Relaxed. Size down for a closer fit. Our model is 5'7\" and wears a size S.",
    details: [
      "Dropped shoulder seams",
      "Longer curved back hem",
      "Single chest pocket"
    ]
  },
  {
    id: "field-cable-knit-sweater",
    name: "Field Cable-Knit Sweater",
    category: "Tops",
    price: 108,
    colors: [C.ivory, C.oatmeal],
    sizes: ALPHA,
    released: "2026-09-01",
    tags: ["new"],
    summary:
      "A cable-knit crewneck with a slightly cropped body, knit in a cotton-wool blend that is not itchy.",
    description:
      "Field is the sweater for the weeks between seasons. The cable runs down the front and sleeves, the body is cropped just enough to sit at the top of a high-rise jean, and the blend keeps the warmth of wool without the scratch. Ribbing at the cuff and hem holds its shape after washing.",
    fabric: "55% cotton, 45% merino wool. Mid-weight, 7 gauge.",
    care: "Hand wash cold or machine wash on the wool cycle. Reshape and dry flat.",
    fit: "Relaxed and slightly cropped. Our model is 5'8\" and wears a size S.",
    details: [
      "Cable panel down the center front and sleeves",
      "Ribbed crewneck, cuffs and hem",
      "Cropped body, sits at the high waist"
    ]
  },
  {
    id: "harbor-striped-tee",
    name: "Harbor Striped Tee",
    category: "Tops",
    price: 44,
    colors: [C.navy, C.black],
    sizes: ALPHA,
    released: "2026-04-16",
    tags: ["bestseller"],
    summary:
      "A boatneck striped tee in heavyweight cotton, cut to hold its shape wash after wash.",
    description:
      "Harbor is the striped tee we make in the largest quantity, because it is the one people come back for. The neckline is wide and finished with a flat binding, the sleeves end just below the elbow, and the cotton is heavy enough that the stripe stays crisp rather than blurring after a season.",
    fabric: "100% combed cotton jersey, 220 gsm. Yarn-dyed stripe.",
    care: "Machine wash cold, tumble dry low.",
    fit: "True to size. Our model is 5'7\" and wears a size S.",
    details: [
      "Wide boat neckline with flat binding",
      "Three-quarter sleeves",
      "Yarn-dyed stripe that will not fade unevenly"
    ]
  },
  {
    id: "aspen-wool-knit-sweater",
    name: "Aspen Wool Knit Sweater",
    category: "Tops",
    price: 118,
    colors: [C.oatmeal, C.ivory],
    sizes: ALPHA,
    released: "2026-09-01",
    tags: ["new"],
    summary:
      "A soft, oversized pullover in a wool blend, with a mock neck and dropped shoulders.",
    description:
      "Aspen is deliberately oversized. The shoulders drop, the body is long enough to cover a high-rise waistband, and the mock neck sits close without feeling tight. It is the sweater for working from home in the morning and still looking put together in the afternoon.",
    fabric: "70% wool, 30% recycled polyamide. Brushed for softness.",
    care: "Hand wash cold or dry clean. Dry flat away from direct heat.",
    fit: "Oversized. Take your usual size for the intended fit. Our model is 5'8\" and wears a size S.",
    details: [
      "Mock neck",
      "Dropped shoulder seams",
      "Ribbed cuffs and hem"
    ]
  },
  {
    id: "lena-tie-neck-blouse",
    name: "Lena Tie-Neck Blouse",
    category: "Tops",
    price: 78,
    colors: [C.marigold, C.plum, C.ivory],
    sizes: ALPHA,
    released: "2026-07-02",
    tags: [],
    summary:
      "A tie-neck blouse with a soft shoulder and a long sash you can knot or leave open.",
    description:
      "Lena has a self-fabric sash at the neck that can be tied into a bow, knotted loosely, or left hanging. The shoulder is softly gathered rather than padded, and the body has enough room to move without looking boxy. It is the piece that makes a plain trouser look finished.",
    fabric: "100% Tencel™ Lyocell. Fluid, matte, and breathable.",
    care: "Machine wash cold on the gentle cycle, hang to dry, cool iron.",
    fit: "True to size, softly relaxed. Our model is 5'6\" and wears a size S.",
    details: [
      "Removable-look self sash, stitched at the neckline",
      "Softly gathered shoulders",
      "Buttoned cuffs"
    ]
  },

  /* ------------------------------------------------------- Bottoms (6) */
  {
    id: "reid-high-rise-jeans",
    name: "Reid High-Rise Straight Jeans",
    category: "Bottoms",
    price: 98,
    colors: [C.lightwash, C.indigo],
    sizes: ALPHA,
    numericSizes: NUMERIC,
    released: "2026-06-18",
    tags: ["bestseller"],
    summary:
      "A high-rise straight jean in rigid-feeling denim with just enough stretch to sit down in.",
    description:
      "Reid sits at the natural waist and runs straight from the hip to a 28\" inseam, which lands at the ankle on most heights. The denim is woven to feel rigid but carries a small amount of elastane, so it holds its shape across a day rather than bagging at the knee.",
    fabric: "98% cotton, 2% elastane denim, 12 oz. Non-stretch feel with recovery.",
    care: "Machine wash cold inside out, hang to dry to preserve the color.",
    fit: "True to size. 11\" front rise, 28\" inseam. Our model is 5'8\" and wears a size 27 / S.",
    details: [
      "High rise, sits at the natural waist",
      "Straight leg with a 28\" inseam",
      "Five-pocket construction with a button fly"
    ]
  },
  {
    id: "della-wide-leg-trousers",
    name: "Della Wide-Leg Trousers",
    category: "Bottoms",
    price: 92,
    colors: [C.white, C.gray],
    sizes: ALPHA,
    numericSizes: NUMERIC,
    released: "2026-05-09",
    tags: [],
    summary:
      "A pleated wide-leg trouser with a clean front and a long, fluid line.",
    description:
      "Della has two soft pleats at the front that release into a wide leg, and a back waistband with a hidden elastic section so the fit stays comfortable through a long lunch. The fabric is opaque and holds a press, which keeps the leg looking sharp rather than limp.",
    fabric: "64% polyester, 33% viscose, 3% elastane suiting. Mid-weight with a matte finish.",
    care: "Machine wash cold on the gentle cycle, hang to dry, warm iron.",
    fit: "True to size. 12\" front rise, 31\" inseam. Our model is 5'9\" and wears a size S.",
    details: [
      "Two front pleats",
      "Partially elasticized back waistband",
      "Side seam pockets and a single welt pocket at the back"
    ]
  },
  {
    id: "nova-tailored-ankle-pant",
    name: "Nova Stretch Ankle Pant",
    category: "Bottoms",
    price: 88,
    colors: [C.chestnut, C.black],
    sizes: ALPHA,
    numericSizes: NUMERIC,
    released: "2026-04-16",
    tags: [],
    summary:
      "A slim ankle pant in a stretch twill that behaves like tailoring and feels like a knit.",
    description:
      "Nova is cut close through the leg and finished at the ankle. The twill has real recovery, so the knee does not bag and the seat keeps its shape. It is the trouser for days that start at a desk and end somewhere else.",
    fabric: "71% viscose, 24% polyamide, 5% elastane stretch twill.",
    care: "Machine wash cold, hang to dry. Do not tumble dry.",
    fit: "True to size, close through the leg. 10.5\" front rise, 27\" inseam.",
    details: [
      "Mid rise with a flat front",
      "Slim leg ending at the ankle",
      "Functional front and back pockets"
    ]
  },
  {
    id: "june-pleated-midi-skirt",
    name: "June Pleated Skirt",
    category: "Bottoms",
    price: 84,
    colors: [C.burgundy, C.chestnut],
    sizes: ALPHA,
    numericSizes: NUMERIC,
    released: "2026-08-14",
    tags: ["new"],
    summary:
      "A long pleated skirt with a smooth yoke at the waist, cut to move when you walk.",
    description:
      "June is pleated from a flat yoke so the waist stays clean and the volume starts below the hip. The pleats are pressed but not permanent, which means the skirt softens into a fuller shape over time. It works with a knit in winter and a tee in spring.",
    fabric: "100% recycled polyester crepe. Lightweight with a dry hand. Lined to the knee.",
    care: "Machine wash cold, hang to dry, cool iron on the reverse.",
    fit: "True to size. 32\" length from the waist on a size S.",
    details: [
      "Flat yoke at the waist",
      "Knife pleats released below the hip",
      "Concealed side zip"
    ]
  },
  {
    id: "sutton-denim-skirt",
    name: "Sutton Denim Midi Skirt",
    category: "Bottoms",
    price: 76,
    colors: [C.indigo, C.lightwash],
    sizes: ALPHA,
    numericSizes: NUMERIC,
    released: "2026-07-24",
    tags: ["new"],
    summary:
      "A denim midi with a front slit and a raw hem, cut straight through the hip.",
    description:
      "Sutton is a straight denim skirt that lands mid-calf, with a slit at the front so you can take a full stride. The hem is left raw and will soften with each wash. It reads casual with sneakers and unexpectedly sharp with a heeled boot.",
    fabric: "100% cotton denim, 11 oz. Rigid with no stretch.",
    care: "Machine wash cold inside out, tumble dry low.",
    fit: "True to size, rigid. Size up if you are between sizes. 31\" length on a size S.",
    details: [
      "Front slit with a button tab",
      "Raw, unfinished hem",
      "Five-pocket construction"
    ]
  },
  {
    id: "quinn-coated-straight-pant",
    name: "Quinn Coated Straight Pant",
    category: "Bottoms",
    price: 96,
    colors: [C.black],
    sizes: ALPHA,
    numericSizes: NUMERIC,
    released: "2026-09-01",
    tags: ["new"],
    summary:
      "A coated straight pant with the look of leather and the comfort of a stretch twill.",
    description:
      "Quinn is finished with a matte coating that catches light the way leather does, over a base cloth that stretches and breathes. The leg runs straight from a mid rise and ends just above the ankle. It is the piece that makes a plain sweater look like an outfit.",
    fabric: "61% viscose, 34% polyamide, 5% elastane with a polyurethane face coating.",
    care: "Wipe clean with a damp cloth, or dry clean. Do not machine wash or tumble dry.",
    fit: "True to size, with stretch. 10.5\" front rise, 28\" inseam.",
    details: [
      "Matte coated finish",
      "Straight leg, ends above the ankle",
      "Side seam pockets"
    ]
  },

  /* ----------------------------------------------------- Outerwear (5) */
  {
    id: "ainsley-classic-trench-coat",
    name: "Ainsley Classic Trench Coat",
    category: "Outerwear",
    price: 188,
    colors: [C.khaki, C.bone],
    sizes: ALPHA,
    released: "2026-08-14",
    tags: ["new", "bestseller"],
    summary:
      "A double-breasted trench with a belt, a storm flap, and a length that covers a dress.",
    description:
      "Ainsley is built the way a trench should be: double-breasted front, a storm flap across the shoulder, epaulettes, a wide self belt, and a back vent so it does not pull when you walk. It falls below the knee, which means it covers most of what we make.",
    fabric: "65% cotton, 35% polyester gabardine with a water-resistant finish. Fully lined.",
    care: "Dry clean. Spot clean between wears.",
    fit: "Roomy enough to layer a sweater underneath. 45\" back length on a size S.",
    details: [
      "Double-breasted front with a storm flap",
      "Removable self belt and buckled cuff straps",
      "Back vent and welt pockets"
    ]
  },
  {
    id: "bexley-relaxed-blazer",
    name: "Bexley Relaxed Blazer",
    category: "Outerwear",
    price: 148,
    colors: [C.camel, C.chestnut, C.ivory],
    sizes: ALPHA,
    released: "2026-06-04",
    tags: ["bestseller"],
    summary:
      "A single-breasted blazer cut with a soft shoulder, meant to be worn open.",
    description:
      "Bexley is tailoring without the stiffness. The shoulder is lightly padded so it holds a line, the body is cut with room for a knit underneath, and the length covers the hip. It closes on one button, but it is designed around being worn open.",
    fabric: "70% viscose, 27% polyester, 3% elastane. Fully lined in a smooth twill.",
    care: "Dry clean recommended.",
    fit: "Relaxed. Take your usual size for a layering fit. 29\" back length on a size S.",
    details: [
      "Single-button front",
      "Notch lapel with a lightly padded shoulder",
      "Two flap pockets and a chest welt pocket"
    ]
  },
  {
    id: "piper-denim-jacket",
    name: "Piper Denim Jacket",
    category: "Outerwear",
    price: 118,
    colors: [C.midwash, C.lightwash],
    sizes: ALPHA,
    released: "2026-05-22",
    tags: [],
    summary:
      "A classic trucker jacket in rigid denim, cut slightly oversized.",
    description:
      "Piper is cut a half-size roomier than a traditional trucker so it layers over a sweater without pulling at the shoulder. The denim is rigid and will fade along the seams and cuffs with wear, which is the point.",
    fabric: "100% cotton denim, 12.5 oz. Rigid, unwashed finish.",
    care: "Machine wash cold inside out, hang to dry. Expect some fading.",
    fit: "Slightly oversized. Size down for a classic fit. 23\" back length on a size S.",
    details: [
      "Button front with two chest flap pockets",
      "Adjustable button tabs at the hem",
      "Rigid denim that fades with wear"
    ]
  },
  {
    id: "wilder-longline-cardigan",
    name: "Wilder Longline Cardigan",
    category: "Outerwear",
    price: 104,
    colors: [C.oatmeal, C.charcoal],
    sizes: ALPHA,
    released: "2026-07-02",
    tags: [],
    summary:
      "An open-front cardigan that falls past the hip, knit in a brushed wool blend.",
    description:
      "Wilder is the layer that lives on the back of a chair and gets used every day. It is knit long, has no buttons to fuss with, and has deep patch pockets. The yarn is brushed after knitting, which gives it a soft surface without making it shed.",
    fabric: "60% wool, 40% recycled polyamide. Brushed finish, 5 gauge.",
    care: "Hand wash cold or dry clean. Dry flat.",
    fit: "Relaxed and long. 34\" back length on a size S.",
    details: [
      "Open front with no closure",
      "Deep patch pockets",
      "Ribbed cuffs and front bands"
    ]
  },
  {
    id: "arden-wool-overcoat",
    name: "Arden Wool Overcoat",
    category: "Outerwear",
    price: 218,
    colors: [C.camel, C.gray],
    sizes: ALPHA,
    released: "2026-09-01",
    tags: ["new"],
    summary:
      "A long wool-blend overcoat with a notch lapel and a body cut to carry a sweater.",
    description:
      "Arden is the warmest thing we make. It is cut long, closes on three buttons, and has a back vent so it moves when you do. The wool blend has a firm hand that keeps the front edge straight instead of rolling, which is what separates a coat that looks good in year three from one that does not.",
    fabric: "62% wool, 33% polyester, 5% other fibers. Fully lined with a quilted upper back.",
    care: "Dry clean only. Brush after wear and store on a wide hanger.",
    fit: "Cut to layer over a knit. 46\" back length on a size S.",
    details: [
      "Three-button front with a notch lapel",
      "Welt pockets and an interior chest pocket",
      "Center back vent"
    ]
  },

  /* --------------------------------------------------- Accessories (5) */
  {
    id: "sloane-leather-satchel",
    name: "Sloane Leather Satchel",
    category: "Accessories",
    price: 138,
    colors: [
      { name: "Teal", hex: "#1F6F78", family: "Green" },
      C.tan,
      C.black
    ],
    sizes: ["One Size"],
    released: "2026-08-14",
    tags: ["new", "bestseller"],
    summary:
      "A structured leather satchel that holds a 13\" laptop, with a detachable crossbody strap.",
    description:
      "Sloane is built on a rigid base so it stands up on its own and keeps its shape when it is empty. Inside there is one main compartment, a zip pocket, and a padded sleeve that takes a 13\" laptop. The crossbody strap detaches, which turns it from a commuting bag into a dinner bag.",
    fabric: "Full-grain cowhide leather with a cotton twill lining. Silver-tone hardware.",
    care: "Wipe with a soft dry cloth. Condition with a neutral leather cream twice a year.",
    fit: "11\" wide x 9\" tall x 4.5\" deep. Top handle drop 3\"; detachable strap adjusts 20\"–24\".",
    details: [
      "Fits a 13\" laptop in a padded sleeve",
      "Detachable, adjustable crossbody strap",
      "Structured base that stands on its own"
    ]
  },
  {
    id: "mira-silk-scarf",
    name: "Mira Silk Scarf",
    category: "Accessories",
    price: 48,
    colors: [C.marigold, C.ink],
    sizes: ["One Size"],
    released: "2026-06-18",
    tags: [],
    summary:
      "A 27\" square silk scarf printed with an abstract pattern and finished with a rolled hem.",
    description:
      "Mira is printed in our own pattern and hand-rolled at the edge, which is the finish that keeps a silk square sitting properly when it is knotted. Wear it at the neck, tied to a bag handle, or as a headscarf.",
    fabric: "100% silk twill with a hand-rolled hem.",
    care: "Dry clean, or hand wash cold with a gentle detergent and hang to dry. Cool iron on the reverse.",
    fit: "27\" x 27\" square.",
    details: [
      "Hand-rolled edge",
      "Printed in-house pattern",
      "Arrives folded in a cotton pouch"
    ]
  },
  {
    id: "sable-sunglasses",
    name: "Sable Sunglasses",
    category: "Accessories",
    price: 58,
    colors: [C.tortoise, C.black],
    sizes: ["One Size"],
    released: "2026-05-09",
    tags: [],
    summary:
      "A slim rectangular frame in acetate with polarized lenses and full UV protection.",
    description:
      "Sable is a narrow frame that suits most face shapes because it sits close to the brow rather than above it. The lenses are polarized, which cuts glare off a windshield or water, and they filter 100% of UVA and UVB light.",
    fabric: "Hand-polished acetate frame, polarized CR-39 lenses, stainless steel hinges.",
    care: "Clean with the supplied microfiber cloth. Store in the hard case.",
    fit: "Lens width 52mm, bridge 18mm, temple 145mm.",
    details: [
      "Polarized lenses",
      "100% UVA and UVB protection",
      "Hard case and cleaning cloth included"
    ]
  },
  {
    id: "lark-gold-hoop-earrings",
    name: "Lark Gold Hoop Earrings",
    category: "Accessories",
    price: 42,
    colors: [C.gold],
    sizes: ["One Size"],
    released: "2026-04-16",
    tags: ["bestseller"],
    summary:
      "A pair of lightweight 25mm hoops in 14k gold plate over brass, with hypoallergenic posts.",
    description:
      "Lark is the hoop we wear every day: large enough to see, light enough to forget. The tube is hollow, which keeps the weight off the earlobe, and the posts are surgical steel for people who react to plated findings.",
    fabric: "14k gold plating over brass. Surgical stainless steel posts and backs.",
    care: "Remove before swimming or showering. Wipe with a dry cloth and store in the pouch.",
    fit: "25mm outer diameter, 2mm tube. Weighs 3g per earring.",
    details: [
      "Hollow tube construction for a light weight",
      "Hypoallergenic surgical steel posts",
      "Sold as a pair"
    ]
  },
  {
    id: "rowan-leather-belt",
    name: "Rowan Leather Belt",
    category: "Accessories",
    price: 52,
    colors: [C.cognac, C.black, C.tan],
    sizes: ["One Size"],
    released: "2026-07-24",
    tags: [],
    summary:
      "A 1.25\" leather belt with a solid brass buckle and five holes for adjustment.",
    description:
      "Rowan is cut from a single piece of vegetable-tanned leather rather than bonded strips, so it will soften and take on a patina instead of cracking. The buckle is solid brass and stitched in place with waxed thread.",
    fabric: "Vegetable-tanned full-grain leather with a solid brass buckle.",
    care: "Wipe with a dry cloth. Condition lightly once a year. Keep away from prolonged moisture.",
    fit: "1.25\" wide. Fits waists 26\"–36\" across five holes spaced 1\" apart.",
    details: [
      "Solid brass buckle",
      "Vegetable-tanned full-grain leather",
      "Five adjustment holes"
    ]
  }
];

/* ------------------------------------------------------------------ *
 * Merge in the measured images and emit assets/js/products.js
 * ------------------------------------------------------------------ */

let missing = 0;
const withImages = PRODUCTS.map((p) => {
  const imgs = imagesBySlug[p.id];
  if (!imgs || imgs.length < 3) {
    missing++;
    console.warn(`!! ${p.id}: expected 3 images, found ${imgs ? imgs.length : 0}`);
  }
  return {
    ...p,
    colorFamilies: [...new Set(p.colors.map((c) => c.family))],
    images: (imgs || []).map((m) => ({
      src: "assets/images/" + m.path.split("assets/images/")[1],
      alt: m.alt,
      width: m.width,
      height: m.height
    }))
  };
});

const body = `/* ============================================================================
 * products.js — Hollis & Hem catalog
 * ----------------------------------------------------------------------------
 * The full product catalog as a plain array. No build step, no framework: the
 * shop, product, cart and checkout pages all read from window.PRODUCTS.
 *
 * Image width/height are the real pixel dimensions of the local files, so the
 * browser can reserve space before they load and the page does not shift.
 *
 * This file is generated by scripts/build-catalog.mjs, but it is plain
 * JavaScript and can be edited by hand.
 *
 * <!-- OWNER TO COMPLETE -->
 * Replace this demo catalog with your real products, photography and copy
 * before you sell or advertise. Every description, fabric note and measurement
 * below is sample content written for this template.
 * ==========================================================================*/

(function (global) {
  "use strict";

  var PRODUCTS = ${JSON.stringify(withImages, null, 2)
    .split("\n")
    .map((line, i) => (i === 0 ? line : "  " + line))
    .join("\n")};

  /* ------------------------------------------------------------ Helpers */

  /** Look a product up by its id (used by product.html via ?id=). */
  function getProductById(id) {
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].id === id) return PRODUCTS[i];
    }
    return null;
  }

  /** All categories, in display order. */
  var CATEGORIES = ["Dresses", "Tops", "Bottoms", "Outerwear", "Accessories"];

  /** Products in a category. */
  function getByCategory(category) {
    return PRODUCTS.filter(function (p) {
      return p.category === category;
    });
  }

  /** Products carrying a merchandising tag, e.g. "new" or "bestseller". */
  function getByTag(tag) {
    return PRODUCTS.filter(function (p) {
      return p.tags.indexOf(tag) !== -1;
    });
  }

  /** Up to \`limit\` other products from the same category. */
  function getRelated(product, limit) {
    return PRODUCTS.filter(function (p) {
      return p.category === product.category && p.id !== product.id;
    }).slice(0, limit || 4);
  }

  /** Every distinct size across the catalog, ordered for the filter UI. */
  var SIZE_ORDER = ["XS", "S", "M", "L", "XL", "One Size"];

  /** Every distinct color family across the catalog. */
  var COLOR_FAMILIES = (function () {
    var seen = {};
    var out = [];
    PRODUCTS.forEach(function (p) {
      p.colorFamilies.forEach(function (f) {
        if (!seen[f]) {
          seen[f] = true;
          out.push(f);
        }
      });
    });
    return out.sort();
  })();

  /** Price buckets used by the shop filters. */
  var PRICE_RANGES = [
    { id: "under-50", label: "Under $50", min: 0, max: 49.99 },
    { id: "50-99", label: "$50 – $99", min: 50, max: 99.99 },
    { id: "100-149", label: "$100 – $149", min: 100, max: 149.99 },
    { id: "150-plus", label: "$150 and up", min: 150, max: Infinity }
  ];

  global.PRODUCTS = PRODUCTS;
  global.CATALOG = {
    products: PRODUCTS,
    categories: CATEGORIES,
    sizeOrder: SIZE_ORDER,
    colorFamilies: COLOR_FAMILIES,
    priceRanges: PRICE_RANGES,
    getProductById: getProductById,
    getByCategory: getByCategory,
    getByTag: getByTag,
    getRelated: getRelated
  };
})(window);
`;

fs.writeFileSync(path.join(ROOT, "assets", "js", "products.js"), body, "utf8");
console.log(
  `Wrote assets/js/products.js — ${withImages.length} products, ` +
    `${withImages.reduce((n, p) => n + p.images.length, 0)} images, ${missing} incomplete.`
);
