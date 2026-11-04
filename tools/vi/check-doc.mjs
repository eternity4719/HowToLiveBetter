// 校验一篇长文的翻译：数字、链接、标题层级、长度。
// 用法：node tools/vi/check-doc.mjs doc-01
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from '../lib/book.mjs';

const id = process.argv[2];
const tasks = JSON.parse(readFileSync(resolve(ROOT, 'vi/qa/doc-tasks/tasks.json'), 'utf8'));
const t = tasks.find(x => x.id === id);
if (!t) { console.error('không có nhiệm vụ ' + id); process.exit(2); }
const task = readFileSync(resolve(ROOT, 'vi/qa/doc-tasks', id + '.md'), 'utf8');
const zh = task.split('<<<BẢN GỐC TIẾNG TRUNG>>>')[1].split('<<<BẢN DỊCH CŨ')[0];
const outPath = resolve(ROOT, process.argv.includes('--draft') ? 'vi/qa/docs-out' : 'vi/docs', t.vi);
if (!existsSync(outPath)) { console.error('thiếu ' + outPath); process.exit(2); }
const vi = readFileSync(outPath, 'utf8');

const canonNums = (text) => {
  let s = text.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
  s = s.replace(/https?:\/\/[^\s<>）)」】]+/g, ' ').replace(/\b10\.\d{4,9}\/[^\s<>）)」】]+/g, ' ');
  const unit = (m, n, u) => {
    const v = Number(String(n).replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.'));
    const mul = /万|vạn/i.test(u) ? 1e4 : /亿|ức/i.test(u) ? 1e8 : /nghìn tỷ/i.test(u) ? 1e12
      : /trăm triệu/i.test(u) ? 1e8 : /triệu/i.test(u) ? 1e6 : /nghìn/i.test(u) ? 1e3 : 1;
    return ' ' + (v * mul) + ' ';
  };
  s = s.replace(/(\d+(?:[.,]\d+)?)\s*(nghìn tỷ|trăm triệu|万|亿|vạn|triệu|tỷ|nghìn)/gi, unit);
  s = s.replace(/\b\d{1,3}(?:[.,]\d{3})+(?!\d)/g, m => m.replace(/[.,]/g, ''));
  s = s.replace(/(\d),(\d)/g, '$1.$2');
  return (s.match(/\d+(?:\.\d+)?/g) ?? []).map(x => {
    const n = Number(x);
    return Number.isFinite(n) ? n.toFixed(6).replace(/\.?0+$/, '') : x;
  });
};
const count = (arr) => arr.reduce((m, x) => (m[x] = (m[x] || 0) + 1, m), {});
const nums = canonNums;
const urls = s => (s.match(/https?:\/\/[^\s<>）)」】]+/g) ?? []).map(u => u.replace(/[.,;]+$/, ''));
const heads = s => [...s.matchAll(/^(#{1,4})\s+/gm)].map(m => m[1].length);
const issues = [];
const zhN = count(nums(zh)), viN = count(nums(vi));
const missN = Object.keys(zhN).filter(n => (viN[n] || 0) < zhN[n]);
if (missN.length) issues.push(`thiếu ${missN.length} số: ${missN.slice(0, 15).join(', ')}`);
const missU = [...new Set(urls(zh))].filter(u => !new Set(urls(vi)).has(u));
if (missU.length) issues.push(`thiếu ${missU.length} link`);
const zhH = heads(zh), viH = heads(vi);
if (zhH.length !== viH.length) issues.push(`số tiêu đề khác: gốc ${zhH.length}, dịch ${viH.length}`);
else if (zhH.join() !== viH.join()) issues.push('cấp tiêu đề khác');
if (vi.length < zh.length * 1.1) issues.push(`quá ngắn: gốc ${zh.length}, dịch ${vi.length}`);
const cjk = vi.replace(/https?:\/\/[^\s<>）)」】]+/g, '').match(/[\u3400-\u9fff]/g);
if (cjk) issues.push(`còn ${cjk.length} chữ Hán ngoài URL`);
if (issues.length) { console.log(`✗ ${id}:`); for (const i of issues) console.log('  - ' + i); process.exit(1); }
console.log(`✓ ${id}: ${vi.length} ký tự, ${zhH.length} tiêu đề, đủ số và link`);
