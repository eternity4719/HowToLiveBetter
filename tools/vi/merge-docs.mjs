// Gộp các bài dài đã dịch lại vào vi/docs sau khi kiểm tra.
// 用法：node tools/vi/merge-docs.mjs [--check]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT } from '../lib/book.mjs';

const tasks = JSON.parse(readFileSync(resolve(ROOT, 'vi/qa/doc-tasks/tasks.json'), 'utf8'));
const check = process.argv.includes('--check');
let ok = 0, skip = 0;
for (const t of tasks) {
  const out = resolve(ROOT, t.out);
  if (!existsSync(out)) { console.log(`chờ ${t.id} (${t.vi})`); skip++; continue; }
  try {
    execFileSync('node', ['tools/vi/check-doc.mjs', t.id], { cwd: ROOT, stdio: 'pipe' });
  } catch {
    console.log(`chưa đạt ${t.id} (${t.vi})`);
    skip++; continue;
  }
  if (!check) writeFileSync(resolve(ROOT, 'vi/docs', t.vi), readFileSync(out, 'utf8'));
  ok++;
}
console.log(`${check ? 'Kiểm' : 'Gộp'} bài dài: ${ok} đạt, ${skip} chưa`);
process.exit(skip ? 1 : 0);
