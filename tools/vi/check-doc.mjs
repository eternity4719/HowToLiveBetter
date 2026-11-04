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
const outPath = resolve(ROOT, 'vi/qa/docs-out', t.vi);
if (!existsSync(outPath)) { console.error('thiếu ' + outPath); process.exit(2); }
const vi = readFileSync(outPath, 'utf8');

const nums = s => (s.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).match(/\d+(?:[.,]\d+)?/g) ?? []);
const urls = s => (s.match(/https?:\/\/[^\s<>）)」】]+/g) ?? []).map(u => u.replace(/[.,;]+$/, ''));
const heads = s => [...s.matchAll(/^(#{1,4})\s+/gm)].map(m => m[1].length);
const issues = [];
const missN = [...new Set(nums(zh))].filter(n => !new Set(nums(vi)).has(n));
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
