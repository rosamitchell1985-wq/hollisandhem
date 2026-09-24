/**
 * contrast-check.mjs
 * ------------------------------------------------------------------
 * Development helper. Computes WCAG 2.1 contrast ratios for the color
 * pairs the design actually uses, so the palette can be verified rather
 * than assumed.
 *
 * Usage:  node scripts/contrast-check.mjs
 */

const PAIRS = [
  ["Body text on cream", "#2B2B2B", "#FBF8F4", 4.5],
  ["Body text on white", "#2B2B2B", "#FFFFFF", 4.5],
  ["Body text on blush", "#2B2B2B", "#F6E7E4", 4.5],
  ["Muted text on cream", "#5C5550", "#FBF8F4", 4.5],
  ["Muted text on white", "#5C5550", "#FFFFFF", 4.5],
  ["Link plum on cream", "#7A2E4A", "#FBF8F4", 4.5],
  ["Link plum on white", "#7A2E4A", "#FFFFFF", 4.5],
  ["Link plum on blush", "#7A2E4A", "#F6E7E4", 4.5],
  ["White on plum button", "#FFFFFF", "#7A2E4A", 4.5],
  ["White on plum hover", "#FFFFFF", "#5F2239", 4.5],
  ["Announcement bar text", "#FFFFFF", "#7A2E4A", 4.5],
  ["Footer text on charcoal", "#E9E4DE", "#2B2B2B", 4.5],
  ["Footer muted on charcoal", "#C9C2BB", "#2B2B2B", 4.5],
  ["Footer faint note on charcoal", "#B5AEA7", "#2B2B2B", 4.5],
  ["Gold button text", "#2B2B2B", "#C9A96E", 4.5],
  ["Error text on error bg", "#A3261F", "#FBECEB", 4.5],
  ["Success text on success bg", "#1F6B4A", "#E8F3ED", 4.5],
  ["Badge: white on plum", "#FFFFFF", "#7A2E4A", 4.5],
  ["Badge: charcoal on gold", "#2B2B2B", "#C9A96E", 4.5],
  ["Control border on cream (UI, 3:1)", "#8E8075", "#FBF8F4", 3],
  ["Control border on white (UI, 3:1)", "#8E8075", "#FFFFFF", 3],
  ["Focus ring against cream (3:1)", "#7A2E4A", "#FBF8F4", 3]
];

function channel(value) {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = channel((n >> 16) & 255);
  const g = channel((n >> 8) & 255);
  const b = channel(n & 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

let failures = 0;
for (const [label, fg, bg, required] of PAIRS) {
  const value = ratio(fg, bg);
  const ok = value >= required;
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${value.toFixed(2)}:1  (needs ${required}:1)  ${label}`
  );
}

console.log(`\n${PAIRS.length - failures}/${PAIRS.length} pairs meet WCAG 2.1 AA.`);
process.exit(failures === 0 ? 0 : 1);
