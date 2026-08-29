const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generate() {
  const svgPath = path.join(__dirname, 'public', 'logo-app.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  const targets = [
    { name: 'pwa-64x64.png', size: 64 },
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'maskable-icon-512x512.png', size: 512 }
  ];

  for (const t of targets) {
    const outPath = path.join(__dirname, 'public', t.name);
    await sharp(svgBuffer)
      .resize(t.size, t.size)
      .png()
      .toFile(outPath);
    console.log(`Generated: ${t.name} (${t.size}x${t.size})`);
  }
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
