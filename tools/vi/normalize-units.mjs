// Chuẩn hóa đơn vị Trung Quốc trong bản dịch: «10 vạn» → «100.000», «3,4 亿» → «340.000.000».
// Không đụng vào dòng Nguồn (thư mục giữ nguyên văn). Chạy sau merge, trước audit.
// 用法：node tools/vi/normalize-units.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from '../lib/book.mjs';

const fmt = n => {
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n * 100) / 100;
  const [int, dec] = String(rounded).split('.');
  const withDots = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return dec ? `${withDots},${dec}` : withDots;
};
const conv = s => s
  .replace(/(\d+(?:[.,]\d+)?)\s*(?:万|vạn)/g, (m, n) => fmt(Number(n.replace(',', '.')) * 1e4) ?? m)
  .replace(/(\d+(?:[.,]\d+)?)\s*(?:亿|ức)/g, (m, n) => fmt(Number(n.replace(',', '.')) * 1e8) ?? m)
  .replace(/(\d+(?:[.,]\d+)?)\s*trăm triệu/gi, (m, n) => fmt(Number(n.replace(',', '.')) * 100) + ' triệu')
  .replace(/(\d+(?:[.,]\d+)?)\s*trăm nghìn/gi, (m, n) => fmt(Number(n.replace(',', '.')) * 100) + ' nghìn')
  .replace(/(\d+(?:[.,]\d+)?)\s*nghìn tỷ/gi, (m, n) => fmt(Number(n.replace(',', '.')) * 1000) + ' tỷ')
  // dấu thập phân kiểu Việt Nam: 0.65 → 0,65; giữ nguyên nhóm nghìn 3.400.000
  .replace(/\b\d{1,3}(?:\.\d{3})+\b/g, m => m.split('.').join('\u0000'))
  .replace(/(\d)\.(\d)/g, '$1,$2')
  .replace(/\u0000/g, '.');

const protect = (line) => {
  const store = [];
  const put = (m) => { store.push(m); return `\u0001${store.length - 1}\u0001`; };
  const masked = line
    .replace(/https?:\/\/[^\s<>()]+/g, put)
    .replace(/\b10\.\d{4,9}\/[^\s<>()]+/g, put)
    .replace(/\bGB(?:\s*\/?\s*T)?\s*\d+(?:\.\d+)*/g, put)
    .replace(/\b[A-Z]{2,}\s*\d+(?:\.\d+)+/g, put)
    .replace(/\b\d+\.\d+\.\d+\b/g, put)
    .replace(/(?<=(?:mục|điều|chương|phần|section)\s)\d+\.\d+/gi, put);
  return { masked, store };
};
const restore = (line, store) => line.replace(/\u0001(\d+)\u0001/g, (m, i) => store[Number(i)] ?? m);

const dirs = [resolve(ROOT, 'vi/book'), resolve(ROOT, 'vi/docs')];
let changed = 0;
for (const dir of dirs) for (const f of readdirSync(dir).filter(f => f.endsWith('.md'))) {
  const p = resolve(dir, f);
  const text = readFileSync(p, 'utf8');
  const lines = text.split('\n').map(line => {
    if (line.startsWith('- Nguồn:')) return line;
    const { masked, store } = protect(line);
    const next = restore(conv(masked), store);
    if (next !== line) changed++;
    return next;
  });
  const out = lines.join('\n');
  if (out !== text) writeFileSync(p, out);
}
console.log(`Chuẩn hóa đơn vị: ${changed} dòng đã đổi`);
