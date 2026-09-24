// Generates public/install/qr-app.png — a scannable QR code for the live app.
// Usage: node scripts/gen-qr.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.resolve(__dirname, '..', 'public', 'install', 'qr-app.png');

const url = 'https://hiteshkumar-khatri.github.io/disciplineai/';
const buffer = await QRCode.toBuffer(url, {
  type: 'png',
  width: 512,
  margin: 2,
  errorCorrectionLevel: 'M',
  dark: '#7c6af7', // brand purple
  light: '#ffffff',
});

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, buffer);
console.log(`wrote ${outFile} (${buffer.length} bytes)`);