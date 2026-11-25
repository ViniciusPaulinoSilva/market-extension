// Gera os ícones PNG (16, 32, 48, 128) sem dependências: quadrado escuro com uma linha de alta.
import { writeFileSync, mkdirSync } from 'node:fs';
import zlib from 'node:zlib';

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, pixels) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
function draw(size) {
  const px = Buffer.alloc(size * size * 4);
  const r = size * 0.22;
  const pts = [[0.16, 0.7], [0.38, 0.46], [0.54, 0.62], [0.84, 0.28]].map(([x, y]) => [x * size, y * size]);
  const w = Math.max(1.6, size * 0.09);
  const SS = 4;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let a = 0, g = 0, bg = 0;
    for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
      const fx = x + (sx + 0.5) / SS, fy = y + (sy + 0.5) / SS;
      const cx = Math.min(Math.max(fx, r), size - r), cy = Math.min(Math.max(fy, r), size - r);
      if (Math.hypot(fx - cx, fy - cy) <= r) {
        a++;
        let d = Infinity;
        for (let i = 0; i < pts.length - 1; i++) d = Math.min(d, distSeg(fx, fy, ...pts[i], ...pts[i + 1]));
        if (d <= w / 2) g++; else bg++;
      }
    }
    const i = (y * size + x) * 4;
    const tot = SS * SS;
    const cov = a / tot;
    // mistura de fundo #0B0E13 com verde #34D399
    const gm = g / Math.max(a, 1);
    px[i] = Math.round(11 + (52 - 11) * gm);
    px[i + 1] = Math.round(14 + (211 - 14) * gm);
    px[i + 2] = Math.round(19 + (153 - 19) * gm);
    px[i + 3] = Math.round(255 * cov);
  }
  return png(size, px);
}
mkdirSync(new URL('../public/icons/', import.meta.url), { recursive: true });
for (const s of [16, 32, 48, 128]) writeFileSync(new URL(`../public/icons/icon${s}.png`, import.meta.url), draw(s));
console.log('ícones gerados em public/icons');
