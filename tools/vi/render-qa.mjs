// Chụp ảnh kiểm tra thị giác các trang EPUB đã giải nén, ở nhiều khổ màn hình.
// 用法：node tools/vi/render-qa.mjs [thư mục epub đã giải nén]
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from '../lib/book.mjs';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const dir = resolve(process.argv[2] ?? '/tmp/vi-epub/OEBPS');
const shots = resolve(ROOT, 'vi/qa/shots');
mkdirSync(shots, { recursive: true });

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--allow-file-access-from-files'] });
const targets = [
  { name: 'cover', file: 'cover.xhtml', clip: 'body' },
  { name: 'title', file: 'titlepage.xhtml', clip: 'body' },
  { name: 'colophon', file: 'colophon.xhtml', clip: 'body' },
  { name: 'note', file: 'note.xhtml', clip: '.frontmatter' },
  { name: 'nav', file: 'nav.xhtml', clip: 'nav#toc' },
  { name: 'chapter-open', file: 'ch01.xhtml', clip: '.chapter-head' },
  { name: 'entry', file: 'ch01.xhtml', clip: '#s01e1' },
  { name: 'entry22', file: 'ch22.xhtml', clip: '#s22e1' },
  { name: 'appendix', file: 'doc01.xhtml', clip: 'body' },
  { name: 'back', file: 'back.xhtml', clip: 'body' },
];
for (const [w, h, tag] of [[620, 1000, 'phone'], [820, 1200, 'tablet'], [1100, 1400, 'desktop']]) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
  for (const t of targets) {
    await page.goto(`file://${resolve(dir, t.file)}`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 250));
    const el = await page.$(t.clip);
    if (!el) { console.log(`bỏ qua ${t.name}: không thấy ${t.clip}`); continue; }
    const box = await el.boundingBox();
    if (!box || box.height < 20) { console.log(`bỏ qua ${t.name}: phần tử rỗng`); continue; }
    const height = Math.min(box.height, 5000);
    await page.screenshot({ path: resolve(shots, `${t.name}-${tag}.png`), clip: { x: 0, y: Math.max(0, box.y), width: w, height: Math.min(height + 24, 5000) } });
  }
  await page.close();
}
await browser.close();
console.log(`Đã chụp vào ${shots}`);
