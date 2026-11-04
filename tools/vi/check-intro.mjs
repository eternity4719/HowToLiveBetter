// Kiểm tra bản dịch phần mở đầu chương: đúng số chương, đủ số mục được nhắc, không sót câu,
// không còn chữ Hán, độ dài hợp lý.
// 用法：node tools/vi/check-intro.mjs intro-01
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from '../lib/book.mjs';

const id = process.argv[2];
const task = readFileSync(resolve(ROOT, 'vi/qa/intros', id + '.md'), 'utf8');
const outPath = resolve(ROOT, 'vi/qa/intros', id + '.out.md');
if (!existsSync(outPath)) { console.error('thiếu ' + outPath); process.exit(2); }
const out = readFileSync(outPath, 'utf8');
const sections = new Map();
for (const b of out.split(/^<<<CHƯƠNG /m).slice(1)) {
  const no = Number(b.slice(0, b.indexOf('>')));
  sections.set(no, b.slice(b.indexOf('\n') + 1).trim());
}
const issues = [];
const zhSections = new Map();
for (const b of task.split(/^<<<CHƯƠNG /m).slice(1)) {
  const no = Number(b.slice(0, b.indexOf('>')));
  zhSections.set(no, b.slice(b.indexOf('\n') + 1).split(/^<<<BẢN DỊCH CŨ/m)[0].trim());
}
for (const [no, zh] of zhSections) {
  const vi = sections.get(no);
  if (!vi) { issues.push(`thiếu chương ${no}`); continue; }
  const zNums = new Set([...zh.matchAll(/第\s*(\d+)\s*条/g)].map(m => Number(m[1])));
  const vNums = new Set([...vi.matchAll(/mục\s+(\d+)/g)].map(m => Number(m[1])));
  const miss = [...zNums].filter(n => !vNums.has(n));
  const extra = [...vNums].filter(n => !zNums.has(n));
  if (miss.length) issues.push(`ch${no}: thiếu mục ${miss.join(', ')}`);
  if (extra.length) issues.push(`ch${no}: thừa mục ${extra.join(', ')}`);
  if (!new RegExp('^#\\s+' + no + '\\.').test(vi)) issues.push(`ch${no}: thiếu tiêu đề «# ${no}. …»`);
  const cjk = vi.replace(/https?:\/\/\S+/g, '').match(/[\u3400-\u9fff]/g);
  if (cjk) issues.push(`ch${no}: còn ${cjk.length} chữ Hán`);
  if (vi.length < zh.length * 0.9) issues.push(`ch${no}: quá ngắn (${vi.length} so với ${zh.length})`);
}
if (issues.length) { console.log(`✗ ${id}:`); for (const i of issues) console.log('  - ' + i); process.exit(1); }
console.log(`✓ ${id}: ${sections.size} chương`);
