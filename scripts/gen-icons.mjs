// Generates PWA app icons: purple rounded square with a white lightning bolt.
// Usage: node scripts/gen-icons.mjs  ->  writes public/icon-192.png, public/icon-512.png
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../public');

const ROUND = 0.21;  // corner radius (fraction of size)
const FEATHER = 2.0; // antialias feather in px
const THICK = 0.052; // bolt half-thickness (fraction of size)

// Lightning bolt polyline (normalized 0..1 inside the icon).
const BOLT = [
  [0.38, 0.13],
  [0.34, 0.30],
  [0.60, 0.38],
  [0.45, 0.56],
  [0.68, 0.64],
  [0.50, 0.88],
];

const BG = [124, 106, 247]; // #7c6af7
const FG = [255, 255, 255]; // white

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 > 0 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

async function deflate(raw) {
  try {
    const zlib = await import('node:zlib'); // Node >= 22.3
    const out = zlib.deflateSync(raw, { level: 9, windowBits: 15 });
    if (out && out.length > 0) return out;
  } catch {
    /* fall back to stored blocks below */
  }
  // Minimal valid zlib stream using DEFLATE "stored" blocks (no compression).
  const MAX = 0xffff;
  const blocks = [];
  let off = 0;
  while (off < raw.length) {
    const len = Math.min(MAX, raw.length - off);
    const last = off + len >= raw.length;
    const head = Buffer.alloc(5);
    head[0] = last ? 1 : 0; // BFINAL + BTYPE=00
    head.writeUInt16LE(len, 1);
    head.writeUInt16LE((~len) & 0xffff, 3);
    blocks.push(head, raw.slice(off, off + len));
    off += len;
  }
  let a = 1, b = 0;
  for (const byte of raw) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }
  const trailer = Buffer.alloc(4);
  trailer.writeUInt32BE(u32((b << 16) | a));
  return Buffer.concat([Buffer.from([0x78, 0x01]), ...blocks, trailer]);
}

// JS bitwise ops are signed 32-bit; normalize to an unsigned 32-bit value.
function u32(n) {
  return n < 0 ? n + 4294967296 : n;
}

const crcTable = (() => {
  const t = new Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >> 1) : c >> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >> 8);
  return c ^ 0xffffffff;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(u32(crc32(Buffer.concat([typeBuf, data]))));
  return Buffer.concat([len, typeBuf, data, crc]);
}

async function encodePng(size, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0; // filter type 0 (none)
    rgba.copy(raw, rowStart + 1, y * size * 4, (y + 1) * size * 4);
  }
  const compressed = await deflate(raw);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

async function render(size) {
  const rgba = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x + 0.5) / size;
      const ny = (y + 0.5) / size;
      // Rounded-rectangle distance.
      const rx = Math.min(Math.max(nx, ROUND), 1 - ROUND);
      const ry = Math.min(Math.max(ny, ROUND), 1 - ROUND);
      const dRect = Math.hypot(nx - rx, ny - ry) - ROUND;
      const borderAlpha = Math.max(0, Math.min(1, 1 - (dRect * size) / FEATHER));
      if (borderAlpha <= 0) continue;
      // Bolt distance.
      let dBolt = Infinity;
      for (let i = 0; i < BOLT.length - 1; i++) {
        dBolt = Math.min(dBolt, distToSegment(nx, ny, BOLT[i][0], BOLT[i][1], BOLT[i + 1][0], BOLT[i + 1][1]));
      }
      const boltAlpha = Math.max(0, Math.min(1, 1 - ((dBolt - THICK) * size) / FEATHER));
      let r = BG[0], g = BG[1], b = BG[2];
      if (boltAlpha > 0) {
        r = FG[0] * boltAlpha + BG[0] * (1 - boltAlpha);
        g = FG[1] * boltAlpha + BG[1] * (1 - boltAlpha);
        b = FG[2] * boltAlpha + BG[2] * (1 - boltAlpha);
      }
      const off = (y * size + x) * 4;
      rgba[off] = Math.round(r);
      rgba[off + 1] = Math.round(g);
      rgba[off + 2] = Math.round(b);
      rgba[off + 3] = Math.round(borderAlpha * 255);
    }
  }
  return encodePng(size, rgba);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const size of [192, 512]) {
  const png = await render(size);
  fs.writeFileSync(path.join(OUT_DIR, `icon-${size}.png`), png);
  console.log(`wrote public/icon-${size}.png (${png.length} bytes)`);
}