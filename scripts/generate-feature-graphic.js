/**
 * Feature Graphic Generator
 * Generates a 1024x500 PNG feature graphic for Google Play Store.
 * Run: node scripts/generate-feature-graphic.js
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { deflateSync } from 'zlib';

const WIDTH = 1024;
const HEIGHT = 500;

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function createPNG(width, height, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type (RGB)
  ihdrData[10] = 0; ihdrData[11] = 0; ihdrData[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrData);

  // IDAT
  const rawData = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 3)] = 0; // filter none
    for (let x = 0; x < width; x++) {
      const pi = (y * width + x) * 3;
      const ri = y * (1 + width * 3) + 1 + x * 3;
      rawData[ri] = pixels[pi];
      rawData[ri + 1] = pixels[pi + 1];
      rawData[ri + 2] = pixels[pi + 2];
    }
  }
  const compressed = deflateSync(rawData, { level: 9 });
  const idat = makeChunk('IDAT', compressed);

  // IEND
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type);
  const crcInput = Buffer.concat([typeBuffer, data]);
  const crcValue = Buffer.alloc(4);
  crcValue.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([length, typeBuffer, data, crcValue]);
}

function setPixel(pixels, width, x, y, r, g, b) {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || x >= width || y < 0 || y >= HEIGHT) return;
  const i = (y * width + x) * 3;
  pixels[i] = r;
  pixels[i + 1] = g;
  pixels[i + 2] = b;
}

function fillRect(pixels, width, x, y, w, h, r, g, b) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      setPixel(pixels, width, x + dx, y + dy, r, g, b);
    }
  }
}

function fillCircle(pixels, width, cx, cy, radius, r, g, b) {
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy <= radius * radius) {
        setPixel(pixels, width, cx + dx, cy + dy, r, g, b);
      }
    }
  }
}

function drawText(pixels, width, text, startX, startY, scale, r, g, b) {
  // Simple 5x7 bitmap font for uppercase + digits
  const chars = {
    'B': [0x7C,0x42,0x42,0x7C,0x42,0x42,0x7C],
    'A': [0x38,0x44,0x44,0x7C,0x44,0x44,0x44],
    'N': [0x42,0x62,0x52,0x4A,0x46,0x42,0x42],
    'O': [0x38,0x44,0x44,0x44,0x44,0x44,0x38],
    'Q': [0x38,0x44,0x44,0x44,0x4C,0x44,0x3A],
    'U': [0x44,0x44,0x44,0x44,0x44,0x44,0x38],
    'E': [0x7C,0x40,0x40,0x78,0x40,0x40,0x7C],
    'S': [0x3C,0x40,0x40,0x38,0x04,0x04,0x78],
    'T': [0x7C,0x10,0x10,0x10,0x10,0x10,0x10],
    ' ': [0x00,0x00,0x00,0x00,0x00,0x00,0x00],
    '!': [0x10,0x10,0x10,0x10,0x10,0x00,0x10],
  };

  let xOff = 0;
  for (const ch of text) {
    const bitmap = chars[ch.toUpperCase()] || chars[' '];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if (bitmap[row] & (0x80 >> col)) {
          fillRect(pixels, width, startX + xOff + col * scale, startY + row * scale, scale, scale, r, g, b);
        }
      }
    }
    xOff += 8 * scale;
  }
}

function generate() {
  const pixels = new Uint8Array(WIDTH * HEIGHT * 3);

  // Sky gradient background (blue to darker blue)
  for (let y = 0; y < HEIGHT; y++) {
    const t = y / HEIGHT;
    const r = Math.round(30 + t * 10);
    const g = Math.round(144 - t * 60);
    const b = Math.round(235 - t * 40);
    for (let x = 0; x < WIDTH; x++) {
      const i = (y * WIDTH + x) * 3;
      pixels[i] = r;
      pixels[i + 1] = g;
      pixels[i + 2] = b;
    }
  }

  // Green hills at bottom
  for (let x = 0; x < WIDTH; x++) {
    const hillHeight = 80 + Math.sin(x * 0.01) * 30 + Math.sin(x * 0.025) * 20;
    for (let y = HEIGHT - hillHeight; y < HEIGHT; y++) {
      setPixel(pixels, WIDTH, x, y, 76, 175, 80);
    }
  }

  // Ground stripe
  fillRect(pixels, WIDTH, 0, HEIGHT - 50, WIDTH, 50, 60, 140, 60);
  fillRect(pixels, WIDTH, 0, HEIGHT - 52, WIDTH, 4, 100, 200, 100);

  // Platforms
  fillRect(pixels, WIDTH, 150, 300, 180, 24, 139, 90, 43);
  fillRect(pixels, WIDTH, 400, 220, 200, 24, 139, 90, 43);
  fillRect(pixels, WIDTH, 700, 280, 160, 24, 139, 90, 43);

  // Coins (yellow circles)
  const coinPositions = [[240, 270], [480, 190], [520, 190], [560, 190], [780, 250]];
  coinPositions.forEach(([cx, cy]) => {
    fillCircle(pixels, WIDTH, cx, cy, 12, 255, 215, 0);
    fillCircle(pixels, WIDTH, cx, cy, 8, 255, 235, 59);
  });

  // Monkey (center of feature graphic) — large, stylized
  const mx = 512, my = 260;
  // Body
  fillCircle(pixels, WIDTH, mx, my + 40, 28, 139, 69, 19);
  // Head
  fillCircle(pixels, WIDTH, mx, my, 32, 180, 100, 40);
  // Face
  fillCircle(pixels, WIDTH, mx, my + 5, 22, 255, 205, 148);
  // Eyes
  fillCircle(pixels, WIDTH, mx - 10, my - 5, 5, 255, 255, 255);
  fillCircle(pixels, WIDTH, mx + 10, my - 5, 5, 255, 255, 255);
  fillCircle(pixels, WIDTH, mx - 10, my - 5, 3, 40, 26, 13);
  fillCircle(pixels, WIDTH, mx + 10, my - 5, 3, 40, 26, 13);
  // Nose
  fillCircle(pixels, WIDTH, mx, my + 8, 4, 139, 90, 43);
  // Ears
  fillCircle(pixels, WIDTH, mx - 32, my - 5, 12, 180, 100, 40);
  fillCircle(pixels, WIDTH, mx - 32, my - 5, 7, 255, 178, 140);
  fillCircle(pixels, WIDTH, mx + 32, my - 5, 12, 180, 100, 40);
  fillCircle(pixels, WIDTH, mx + 32, my - 5, 7, 255, 178, 140);

  // Title: "BANANO QUEST" — large text
  drawText(pixels, WIDTH, 'BANANO', 270, 60, 6, 255, 235, 59);
  drawText(pixels, WIDTH, 'QUEST', 310, 115, 6, 255, 152, 0);

  // Tagline
  drawText(pixels, WIDTH, 'BANANA', 360, 400, 3, 255, 255, 255);

  // Enemy (red blob on a platform)
  fillCircle(pixels, WIDTH, 200, 285, 14, 220, 50, 50);
  fillCircle(pixels, WIDTH, 195, 280, 4, 255, 255, 255);
  fillCircle(pixels, WIDTH, 205, 280, 4, 255, 255, 255);
  fillCircle(pixels, WIDTH, 195, 280, 2, 0, 0, 0);
  fillCircle(pixels, WIDTH, 205, 280, 2, 0, 0, 0);

  // Clouds
  for (const [cx, cy, cr] of [[100, 80, 30], [140, 70, 25], [180, 80, 28], [750, 60, 35], [790, 50, 28], [830, 60, 32]]) {
    fillCircle(pixels, WIDTH, cx, cy, cr, 255, 255, 255);
  }

  const png = createPNG(WIDTH, HEIGHT, pixels);

  if (!existsSync('store')) mkdirSync('store');
  writeFileSync('store/feature-graphic.png', png);
  console.log(`Generated store/feature-graphic.png (${WIDTH}x${HEIGHT})`);
}

generate();
