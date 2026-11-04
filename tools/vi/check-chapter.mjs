// In tình trạng một chương sau khi biên tập: số mục, số thiếu, nguồn, chữ Hán, câu quá dài.
// 用法：node tools/vi/check-chapter.mjs 22
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from '../lib/book.mjs';

const no = Number(process.argv[2]);
if (!no) { console.error('用法: node tools/vi/check-chapter.mjs <số chương>'); process.exit(2); }
const audit = JSON.parse(readFileSync(resolve(ROOT, 'vi/qa/audit.json'), 'utf8'));
const c = audit.chapters.find(x => x.chapter === no || x.zh.startsWith(String(no).padStart(2, '0')));
if (!c) { console.error('không thấy chương trong audit'); process.exit(2); }
const vi = readFileSync(resolve(ROOT, 'vi/book', c.vi), 'utf8');
const entries = vi.split(/^### /m).slice(1);
let long = 0, veryLong = 0;
for (const b of entries) {
  const body = b.slice(b.indexOf('\n') + 1);
  for (const line of body.split('\n')) {
    if (!line.startsWith('- ') || line.startsWith('- Nguồn:')) continue;
    for (const s of line.split(/(?<=[.!?])\s+/)) {
      if (s.length > 90) long++;
      if (s.length > 140) veryLong++;
    }
  }
}
console.log(`Chương ${no}: ${c.vi}`);
console.log(`  mục: ${c.viEntries}/${c.zhEntries}${c.missing.length ? ' — thiếu ' + c.missing.join(', ') : ''}`);
console.log(`  thiếu số: ${c.numMissing.length}${c.numMissing.length ? ' — ' + JSON.stringify(c.numMissing.slice(0, 6)) : ''}`);
console.log(`  nguồn lệch: ${c.sourceMismatch.length}; chữ Hán ngoài Nguồn: ${c.cjkOutsideSource.length}; chữ Hán trong tiêu đề: ${c.titleCjk}`);
console.log(`  trường quá ngắn: ${c.lowRatio.length}; câu >90 ký tự: ${long}; >140: ${veryLong}`);
