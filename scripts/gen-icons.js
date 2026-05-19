/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Generates PWA PNG icons from public/icon.svg and public/icon-maskable.svg.
 * Run via `node scripts/gen-icons.js` (also wired into npm prebuild).
 */
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public");
const iconsDir = path.join(publicDir, "icons");

if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

const SIZES = [192, 256, 384, 512];

async function generate(srcName, prefix) {
  const src = path.join(publicDir, srcName);
  if (!fs.existsSync(src)) {
    console.warn(`skip: ${src} missing`);
    return;
  }
  const buffer = fs.readFileSync(src);
  for (const size of SIZES) {
    const out = path.join(iconsDir, `${prefix}-${size}.png`);
    await sharp(buffer, { density: 384 })
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log(`✓ ${path.relative(root, out)}`);
  }
}

async function generateAppleTouch() {
  const src = path.join(publicDir, "icon.svg");
  if (!fs.existsSync(src)) return;
  const buffer = fs.readFileSync(src);
  const out = path.join(publicDir, "apple-touch-icon.png");
  await sharp(buffer, { density: 384 })
    .resize(180, 180)
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`✓ ${path.relative(root, out)}`);
}

async function generateFavicon() {
  const src = path.join(publicDir, "icon.svg");
  if (!fs.existsSync(src)) return;
  const buffer = fs.readFileSync(src);
  for (const size of [16, 32, 48]) {
    const out = path.join(publicDir, `favicon-${size}.png`);
    await sharp(buffer, { density: 384 })
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log(`✓ ${path.relative(root, out)}`);
  }
}

(async () => {
  await generate("icon.svg", "icon");
  await generate("icon-maskable.svg", "icon-maskable");
  await generateAppleTouch();
  await generateFavicon();
  console.log("done");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
