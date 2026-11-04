// 校验一个翻译任务的产出：条数、编号、字段、数字、链接、中文残留、长度。
// 用法：node tools/vi/check-out.mjs ch22-01
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from '../lib/book.mjs';

const id = process.argv[2];
if (!id) { console.error('用法: node tools/vi/check-out.mjs <任务号>'); process.exit(2); }
const taskPath = resolve(ROOT, 'vi/qa/tasks', id + '.md');
const outPath = resolve(ROOT, 'vi/qa/out', id + '.md');
if (!existsSync(outPath)) { console.error(`缺少产出文件 ${outPath}`); process.exit(2); }

const task = readFileSync(taskPath, 'utf8');
const src = new Map();
for (const block of task.split(/^<<<MỤC /m).slice(1)) {
  const head = block.slice(0, block.indexOf('\n'));
  const no = Number(head.match(/^(\d+)>>>/)?.[1]);
  let body = block.slice(block.indexOf('\n') + 1).split(/^<<<BẢN DỊCH CŨ |^<<<MỤC MỚI /m)[0];
  body = body.replace(/^### [^\n]*\n/, '');
  if (no) src.set(no, body);
}
const outText = readFileSync(outPath, 'utf8');
const out = new Map();
for (const block of outText.split(/^### /m).slice(1)) {
  const nl = block.indexOf('\n');
  const head = nl < 0 ? block : block.slice(0, nl);
  const m = head.match(/^(\d+)\.\s*(.*)$/);
  if (m) out.set(Number(m[1]), { title: m[2], body: nl < 0 ? '' : block.slice(nl + 1) });
}

const nums = s => (s.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).match(/\d+(?:[.,]\d+)?/g) ?? []);
const urls = s => (s.match(/https?:\/\/[^\s<>）)」】]+/g) ?? []).map(u => u.replace(/[.,;]+$/, ''));
const labels = ['Chi phí', 'Nói dễ hiểu', 'Lợi ích', 'Mức chứng cứ', 'Nguồn', 'Ghi chú'];
const fields = body => Object.fromEntries(labels.map(l => [l, (body.match(new RegExp('^- ' + l + ':[^\\n]*(?:\\n(?![ -]|$)[^\\n]*)*', 'm')) ?? [''])[0]]));
const issues = [];
if (out.size !== src.size) issues.push(`条数不符：原文 ${src.size}，产出 ${out.size}`);

for (const [no, text] of src) {
  const o = out.get(no);
  if (!o) { issues.push(`第 ${no} 条缺失`); continue; }
  const all = text + '\n' + o.title + '\n' + o.body;
  const f = fields(o.body);
  for (const l of labels.slice(0, 5)) if (!f[l]) issues.push(`第 ${no} 条缺字段 ${l}`);
  if (f['Ghi chú'] === undefined) issues.push(`第 ${no} 条缺字段 Ghi chú`);
  if (!/^<!--\s*nhan-chi-phi:/.test(o.body.trim())) issues.push(`第 ${no} 条缺成本标签`);
  const oNums = new Set(nums(o.body));
  const miss = [...new Set(nums(text))].filter(n => !oNums.has(n));
  if (miss.length) issues.push(`第 ${no} 条缺数字 ${miss.slice(0, 12).join(', ')}${miss.length > 12 ? '…' : ''}`);
  const oUrls = new Set(urls(o.body));
  const missU = [...new Set(urls(text))].filter(u => !oUrls.has(u));
  if (missU.length) issues.push(`第 ${no} 条缺链接 ${missU.length} 个`);
  const nonSrc = o.body.split('\n').filter(l => !l.startsWith('- Nguồn:')).join('\n');
  const cjk = nonSrc.match(/[\u3400-\u9fff]/g);
  if (cjk) issues.push(`第 ${no} 条 Nguồn 栏外有中文 ${cjk.length} 字`);
  const zhLen = text.length, viLen = o.body.length;
  if (viLen < zhLen * 0.9) issues.push(`第 ${no} 条过短：中 ${zhLen} 字，越 ${viLen} 字`);
}

if (issues.length) {
  console.log(`✗ ${id}: ${issues.length} 个问题`);
  for (const i of issues) console.log('  - ' + i);
  process.exit(1);
}
console.log(`✓ ${id}: ${out.size} 条全部通过`);
