/**
 * Generate PNG icons for PWA/Capacitor.
 * Run: node scripts/generate-icons.js
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { deflateSync } from 'zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');

function generatePNG(size) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData.writeUInt8(8, 8);  // 8-bit
  ihdrData.writeUInt8(2, 9);  // RGB
  const ihdr = createChunk('IHDR', ihdrData);

  // Pixel data: monkey-themed icon with coin
  const rawData = Buffer.alloc((size * 3 + 1) * size);
  let offset = 0;

  for (let y = 0; y < size; y++) {
    rawData[offset++] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const nx = (x / size) * 2 - 1; // -1 to 1
      const ny = (y / size) * 2 - 1;
      const dist = Math.sqrt(nx * nx + ny * ny);

      let r, g, b;

      // Background circle
      if (dist > 0.95) {
        r = 26; g = 26; b = 46; // dark bg
      } else if (dist > 0.9) {
        r = 1; g = 87; b = 155; // border
      } else {
        // Sky gradient
        r = Math.floor(79 + (0.5 - ny) * 40);
        g = Math.floor(195 + (0.5 - ny) * 30);
        b = Math.floor(247);

        // Monkey head (centered, upper area)
        const headDist = Math.sqrt(nx * nx + (ny + 0.15) * (ny + 0.15));
        if (headDist < 0.45) {
          r = 141; g = 110; b = 99; // brown

          // Face area
          const faceDist = Math.sqrt(nx * nx * 1.2 + (ny + 0.08) * (ny + 0.08) * 2);
          if (faceDist < 0.3) {
            r = 255; g = 183; b = 77; // orange face
          }

          // Eyes
          const eyeL = Math.sqrt((nx + 0.12) * (nx + 0.12) + (ny + 0.18) * (ny + 0.18));
          const eyeR = Math.sqrt((nx - 0.12) * (nx - 0.12) + (ny + 0.18) * (ny + 0.18));
          if (eyeL < 0.07 || eyeR < 0.07) {
            r = 255; g = 255; b = 255;
          }
          if (eyeL < 0.04 || eyeR < 0.04) {
            r = 62; g = 39; b = 35;
          }

          // Nose
          const noseDist = Math.sqrt(nx * nx + (ny + 0.05) * (ny + 0.05));
          if (noseDist < 0.04) {
            r = 93; g = 64; b = 55;
          }

          // Ears
          const earL = Math.sqrt((nx + 0.4) * (nx + 0.4) + (ny + 0.18) * (ny + 0.18));
          const earR = Math.sqrt((nx - 0.4) * (nx - 0.4) + (ny + 0.18) * (ny + 0.18));
          if (earL < 0.12 || earR < 0.12) {
            r = 141; g = 110; b = 99;
            if (earL < 0.07 || earR < 0.07) {
              r = 255; g = 171; b = 145;
            }
          }
        }

        // Coin (lower right)
        const coinDist = Math.sqrt((nx - 0.45) * (nx - 0.45) + (ny - 0.45) * (ny - 0.45));
        if (coinDist < 0.25) {
          r = 255; g = 214; b = 0;
          if (coinDist > 0.22) {
            r = 255; g = 143; b = 0; // border
          }
          // B letter
          if (Math.abs(nx - 0.45) < 0.06 && Math.abs(ny - 0.45) < 0.1) {
            r = 255; g = 160; b = 0;
          }
        }
      }

      rawData[offset++] = Math.max(0, Math.min(255, r));
      rawData[offset++] = Math.max(0, Math.min(255, g));
      rawData[offset++] = Math.max(0, Math.min(255, b));
    }
  }

  const compressed = deflateSync(rawData);
  const idat = createChunk('IDAT', compressed);
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

const sizes = [48, 72, 96, 144, 192, 512];

for (const size of sizes) {
  const png = generatePNG(size);
  writeFileSync(join(iconsDir, `icon-${size}.png`), png);
  console.log(`Generated icon-${size}.png (${size}x${size})`);
}

console.log('Done! Icons ready in public/icons/');
