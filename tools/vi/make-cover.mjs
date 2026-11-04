// Dựng bìa EPUB tiếng Việt bằng Chrome headless, xuất vi/cover.png (1600×2400).
// 用法：node tools/vi/make-cover.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync, copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from '../lib/book.mjs';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const html = resolve(ROOT, 'tools/vi/cover.html');
const out = resolve(ROOT, 'vi/cover.png');
mkdirSync(resolve(ROOT, 'vi'), { recursive: true });
execFileSync(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
  '--allow-file-access-from-files', '--window-size=1600,2400',
  `--screenshot=${out}`, `file://${html}`,
], { stdio: 'ignore' });

const buf = readFileSync(out);
if (buf.toString('ascii', 1, 4) !== 'PNG') throw new Error('Chrome không xuất được PNG');
const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
if (w !== 1600 || h !== 2400) throw new Error(`Kích thước bìa sai: ${w}×${h}`);
console.log(`Đã dựng ${out} (${w}×${h}, ${(buf.length / 1024) | 0} KB)`);
