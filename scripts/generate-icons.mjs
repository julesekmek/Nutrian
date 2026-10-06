// Génère les icônes PWA (PNG) sans dépendance : fond couleur de marque + anneau de progression.
// Usage : node scripts/generate-icons.mjs
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const BRAND = [0x34, 0x46, 0xd8];
const ENERGY = [0xff, 0x5a, 0x3c];
const WHITE = [0xff, 0xff, 0xff];

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([length, typeAndData, crc]);
}

function encodePng(size, pixel) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(x + 0.5, y + 0.5);
      const offset = y * (size * 4 + 1) + 1 + x * 4;
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
      raw[offset + 3] = a;
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // profondeur
  header[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const mix = (from, to, t) => from.map((channel, i) => Math.round(channel + (to[i] - channel) * t));

/** Anneau ouvert (3/4 de tour, comme une jauge) centré, épaisseur relative à la taille. */
function drawIcon(size, ringScale) {
  const center = size / 2;
  const radius = size * 0.3 * ringScale;
  const thickness = size * 0.11 * ringScale;
  return (x, y) => {
    const dx = x - center;
    const dy = y - center;
    const distance = Math.hypot(dx, dy);
    // Angle à partir du haut, dans le sens horaire, de 0 à 1.
    const angle = (Math.atan2(dx, -dy) / (2 * Math.PI) + 1) % 1;
    const ringCoverage = clamp01(thickness / 2 - Math.abs(distance - radius) + 0.5);
    let color = BRAND;
    if (ringCoverage > 0) {
      const ringColor = angle <= 0.75 ? WHITE : mix(BRAND, WHITE, 0.25);
      color = mix(BRAND, ringColor, ringCoverage);
    }
    const dotCoverage = clamp01(thickness * 0.55 - distance + 0.5);
    if (dotCoverage > 0) color = mix(color, ENERGY, dotCoverage);
    return [...color, 255];
  };
}

const outputs = [
  ["public/icons/icon-192.png", 192, 1],
  ["public/icons/icon-512.png", 512, 1],
  ["public/icons/icon-maskable-512.png", 512, 0.8],
  ["src/app/apple-icon.png", 180, 1],
  ["src/app/icon.png", 64, 1],
];

for (const [path, size, ringScale] of outputs) {
  writeFileSync(path, encodePng(size, drawIcon(size, ringScale)));
  console.log(`✓ ${path}`);
}
