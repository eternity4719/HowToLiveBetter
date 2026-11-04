// Chuẩn hóa thuật ngữ và cách gọi thống nhất trong bản dịch.
// 用法：node tools/vi/normalize-terms.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from '../lib/book.mjs';

const dirs = [resolve(ROOT, 'vi/book'), resolve(ROOT, 'vi/docs')];
const fixes = [
  // «tiết» (节) chỉ dùng cho chương/mục lớn; đổi sang «phần» như toàn sách.
  [/(?<!chi )(?<!tình )tiết (\d+)/g, 'phần $1'],
  [/(?<!chi )(?<!tình )tiết này/g, 'phần này'],
  [/(?<!chi )(?<!tình )tiết của/g, 'phần của'],
  [/(?<!chi )(?<!tình )tiết trong/g, 'phần trong'],
  // nhãn cảnh báo thống nhất
  [/Chỉ tham khảo TQ:/g, 'Chỉ áp dụng ở Trung Quốc:'],
  // khoảng tin cậy: giữ nguyên trong Nguồn, ngoài Nguồn dùng KTC
];
const fixLine = (line) => {
  if (line.startsWith('- Nguồn:')) return line.replace(/Chỉ tham khảo TQ:/g, 'Chỉ áp dụng ở Trung Quốc:');
  let out = line;
  for (const [re, to] of fixes) out = out.replace(re, to);
  out = out.replace(/\b95% CI\b/g, 'KTC 95%').replace(/\b95%CI\b/g, 'KTC 95%');
  return out;
};
let changed = 0;
for (const dir of dirs) {
  let files = [];
  try { files = readdirSync(dir).filter(f => f.endsWith('.md')); } catch { continue; }
  for (const f of files) {
    const p = resolve(dir, f);
    const text = readFileSync(p, 'utf8');
    const next = text.split('\n').map(l => { const n = fixLine(l); if (n !== l) changed++; return n; }).join('\n');
    if (next !== text) writeFileSync(p, next);
  }
}
console.log(`Chuẩn hóa thuật ngữ: ${changed} dòng đã đổi`);
