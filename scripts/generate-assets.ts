/**
 * Asset Generation Script
 * Converts SVG assets to PNG format for various platforms
 *
 * Run with: npm run generate-assets
 * Requires: sharp package (npm install sharp --save-dev)
 */

import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

interface AssetConfig {
  source: string;
  outputs: { name: string; width: number; height: number }[];
}

const assets: AssetConfig[] = [
  {
    source: 'favicon.svg',
    outputs: [
      { name: 'favicon-16x16.png', width: 16, height: 16 },
      { name: 'favicon-32x32.png', width: 32, height: 32 },
      { name: 'favicon-48x48.png', width: 48, height: 48 },
    ],
  },
  {
    source: 'apple-touch-icon.svg',
    outputs: [
      { name: 'apple-touch-icon.png', width: 180, height: 180 },
      { name: 'icon-192.png', width: 192, height: 192 },
      { name: 'icon-512.png', width: 512, height: 512 },
    ],
  },
  {
    source: 'og-image.svg',
    outputs: [
      { name: 'og-image.png', width: 1200, height: 630 },
    ],
  },
];

async function generateAssets() {
  console.log('Starting asset generation...\n');

  for (const asset of assets) {
    const sourcePath = path.join(PUBLIC_DIR, asset.source);

    if (!fs.existsSync(sourcePath)) {
      console.warn(`Warning: Source file not found: ${asset.source}`);
      continue;
    }

    console.log(`Processing: ${asset.source}`);
    const svgBuffer = fs.readFileSync(sourcePath);

    for (const output of asset.outputs) {
      const outputPath = path.join(PUBLIC_DIR, output.name);

      try {
        await sharp(svgBuffer)
          .resize(output.width, output.height, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .png()
          .toFile(outputPath);

        console.log(`  Created: ${output.name} (${output.width}x${output.height})`);
      } catch (error) {
        console.error(`  Error creating ${output.name}:`, error);
      }
    }
  }

  console.log('\nAsset generation complete!');
}

// Optimize existing PNG files
async function optimizePng(filename: string) {
  const filePath = path.join(PUBLIC_DIR, filename);

  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filename}`);
    return;
  }

  const stats = fs.statSync(filePath);
  const originalSize = stats.size;

  try {
    const optimized = await sharp(filePath)
      .png({
        compressionLevel: 9,
        palette: true,
        quality: 80,
      })
      .toBuffer();

    fs.writeFileSync(filePath, optimized);
    const newSize = optimized.length;
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);

    console.log(`Optimized ${filename}: ${(originalSize / 1024).toFixed(1)}KB -> ${(newSize / 1024).toFixed(1)}KB (${savings}% smaller)`);
  } catch (error) {
    console.error(`Error optimizing ${filename}:`, error);
  }
}

async function main() {
  // Generate new assets
  await generateAssets();

  // Optimize existing large PNGs
  console.log('\nOptimizing existing PNG files...');
  await optimizePng('lamma-tree.png');
}

main().catch(console.error);
