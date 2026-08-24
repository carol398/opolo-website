// Generates assets/og-image.png (1200x630) from the real Opolo brand SVGs.
// Flat colors only — no gradients, no effects.
const sharp = require('sharp');
const fs = require('fs');

const W = 1200, H = 630;
const CHARCOAL = '#1E1E1C';   // Warm Charcoal background
const CREAM = '#F5F0E8';      // Warm Cream headline
const HEADLINE =
  'Homework is where capable students get stuck. We think it can be the place they thrive.';

(async () => {
  // Base: flat Warm Charcoal
  const base = sharp({
    create: { width: W, height: H, channels: 4, background: CHARCOAL },
  });

  // Real octopus SVG (Fire Orange #FB4815) — fills the right third vertically
  const octoBuf = await sharp(fs.readFileSync('assets/opolo-octopus.svg'), { density: 400 })
    .resize({ height: 430 })
    .png()
    .toBuffer();
  const octo = await sharp(octoBuf).metadata();
  const octoLeft = W - 30 - octo.width;
  const octoTop = Math.round((H - octo.height) / 2);

  // Real wordmark SVG (Bright Sky #039AFA) — top-left
  const wmBuf = await sharp(fs.readFileSync('assets/opolo-wordmark.svg'), { density: 400 })
    .resize({ width: 210 })
    .png()
    .toBuffer();
  const wm = await sharp(wmBuf).metadata();
  const wmLeft = 64, wmTop = 60;

  // Headline — Poppins Bold (embedded TTF), Warm Cream, wrapped to the left column
  const textBuf = await sharp({
    text: {
      text: `<span foreground="${CREAM}">${HEADLINE}</span>`,
      font: 'Poppins Bold 40',
      fontfile: 'poppins-bold.ttf',
      rgba: true,
      width: 600,
      align: 'left',
      spacing: 8,
    },
  }).png().toBuffer();
  const text = await sharp(textBuf).metadata();
  const textLeft = 66;
  const textTop = Math.round((H - text.height) / 2) + 18;

  const out = await base
    .composite([
      { input: octoBuf, left: octoLeft, top: octoTop },
      { input: wmBuf, left: wmLeft, top: wmTop },
      { input: textBuf, left: textLeft, top: textTop },
    ])
    .png()
    .toBuffer();

  fs.writeFileSync('assets/og-image.png', out);
  console.log('og-image.png written:', out.length, 'bytes');
  console.log('  octopus:', octo.width + 'x' + octo.height, 'at', octoLeft + ',' + octoTop);
  console.log('  wordmark:', wm.width + 'x' + wm.height, 'at', wmLeft + ',' + wmTop);
  console.log('  headline:', text.width + 'x' + text.height, 'at', textLeft + ',' + textTop);
})().catch((e) => { console.error(e); process.exit(1); });
