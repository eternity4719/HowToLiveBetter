// Sinh nhiệm vụ dịch phần mở đầu từng chương (tiêu đề chương + đoạn dẫn + bảng nhóm mục).
// 用法：node tools/vi/make-intro-tasks.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from '../lib/book.mjs';

const ZH = resolve(ROOT, 'book'), VI = resolve(ROOT, 'vi/book');
const DIR = resolve(ROOT, 'vi/qa/intros');
rmSync(DIR, { recursive: true, force: true }); mkdirSync(DIR, { recursive: true });

const zhFiles = readdirSync(ZH).filter(f => f.endsWith('.md')).sort();
const viFiles = readdirSync(VI).filter(f => f.endsWith('.md')).sort();
const chapters = zhFiles.map((zf, i) => {
  const z = readFileSync(resolve(ZH, zf), 'utf8');
  const v = readFileSync(resolve(VI, viFiles[i]), 'utf8');
  const zHead = z.slice(0, z.search(/^### /m));
  const vHead = v.slice(0, v.search(/^### /m));
  return { no: Number(zf.slice(0, 2)), zh: zHead.trim(), vi: vHead.replace(/^\[[^\]]*\]\([^)]*\)\s*\n/, '').trim() };
});

const groups = [];
for (let i = 0; i < chapters.length; i += 6) groups.push(chapters.slice(i, i + 6));
groups.forEach((g, gi) => {
  const id = `intro-${String(gi + 1).padStart(2, '0')}`;
  const parts = [`# NHIỆM VỤ DỊCH — phần mở đầu ${g.length} chương`, '',
    'Dịch tiêu đề chương và toàn bộ đoạn dẫn (kể cả các đoạn **nhóm mục** liệt kê số mục) sang tiếng Việt.',
    'Giữ nguyên mọi số mục trong ngoặc; không thêm bớt nhóm hay mục.', ''];
  for (const c of g) {
    parts.push(`<<<CHƯƠNG ${c.no}>>>`, c.zh, '', `<<<BẢN DỊCH CŨ CHƯƠNG ${c.no} (tham khảo, có thể đã lỗi thời)>>>`, c.vi, '');
  }
  writeFileSync(resolve(DIR, id + '.md'), parts.join('\n'));
  groups[gi] = { id, chapters: g.map(c => c.no), out: `vi/qa/intros/${id}.out.md` };
});
writeFileSync(resolve(DIR, 'tasks.json'), JSON.stringify(groups, null, 1));
console.log(`Sinh ${groups.length} nhiệm vụ phần mở đầu: ${groups.map(g => g.id).join(', ')}`);
