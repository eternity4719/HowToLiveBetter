// Gộp phần mở đầu đã dịch vào vi/book: thay tiêu đề chương và đoạn dẫn.
// Kiểm tra tập số mục được nhắc trong phần dẫn phải khớp với nguyên tác.
// 用法：node tools/vi/merge-intros.mjs
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from '../lib/book.mjs';

const VI = resolve(ROOT, 'vi/book'), ZH = resolve(ROOT, 'book');
const DIR = resolve(ROOT, 'vi/qa/intros');
const zhFiles = readdirSync(ZH).filter(f => f.endsWith('.md')).sort();
const viFiles = readdirSync(VI).filter(f => f.endsWith('.md')).sort();
const numIn = (s, re) => new Set([...s.matchAll(re)].map(m => Number(m[1])));
let merged = 0, skipped = 0;

for (const f of readdirSync(DIR).filter(f => /^intro-\d+\.out\.md$/.test(f))) {
  const text = readFileSync(resolve(DIR, f), 'utf8');
  for (const block of text.split(/^<<<CHƯƠNG /m).slice(1)) {
    const head = block.slice(0, block.indexOf('>'));
    const no = Number(head.trim());
    let body = block.slice(block.indexOf('\n') + 1).trim();
    const i = no - 1;
    const zText = readFileSync(resolve(ZH, zhFiles[i]), 'utf8');
    const zIntro = zText.slice(0, zText.search(/^### /m));
    const zNums = numIn(zIntro, /第\s*(\d+)\s*条/g);
    const vNums = numIn(body, /mục\s+(\d+)/g);
    const missing = [...zNums].filter(n => !vNums.has(n));
    const extra = [...vNums].filter(n => !zNums.has(n));
    if (missing.length || extra.length) {
      console.log(`bỏ qua chương ${no}: số mục lệch (thiếu ${missing.length}: ${missing.slice(0, 8).join(', ')}; thừa ${extra.slice(0, 5).join(', ')})`);
      skipped++;
      continue;
    }
    const titleLine = body.match(/^#\s+(\d+)\.\s*(.+)$/m);
    if (!titleLine || Number(titleLine[1]) !== no) { console.log(`bỏ qua chương ${no}: thiếu tiêu đề đúng số`); skipped++; continue; }
    const intro = body.slice(body.indexOf('\n', body.indexOf(titleLine[0])) + 1).trim();
    const target = resolve(VI, viFiles[i]);
    const viText = readFileSync(target, 'utf8');
    const next = viText.replace(/^#\s+\d+\.[^\n]*\n\n[\s\S]*?(?=\n### 1\.)/m, `${titleLine[0]}\n\n${intro}`);
    if (next === viText) { console.log(`bỏ qua chương ${no}: không thay được`); skipped++; continue; }
    writeFileSync(target, next);
    merged++;
  }
}
console.log(`Gộp phần mở đầu: ${merged} chương, bỏ qua ${skipped}`);
