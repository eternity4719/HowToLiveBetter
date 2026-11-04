// 生成越南语重译任务：按「节 + 条号」切分中文原文，附上旧译文作参考，
// 每 8000 个中文字符左右一个任务文件，交给子代理翻译后写回 vi/qa/out/。
// 用法：node tools/vi/make-tasks.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from '../lib/book.mjs';

const ZH = resolve(ROOT, 'book'), VI = resolve(ROOT, 'vi/book');
const Q = resolve(ROOT, 'vi/qa'), TASKS = resolve(Q, 'tasks'), OUT = resolve(Q, 'out');
rmSync(TASKS, { recursive: true, force: true }); rmSync(OUT, { recursive: true, force: true });
mkdirSync(TASKS, { recursive: true }); mkdirSync(OUT, { recursive: true });

function parse(text) {
  const parts = text.split(/^### /m);
  const intro = parts.shift() ?? '';
  return { intro, entries: parts.map(p => {
    const i = p.indexOf('\n');
    return { head: i < 0 ? p : p.slice(0, i), body: i < 0 ? '' : p.slice(i + 1) };
  }) };
}

const zhFiles = readdirSync(ZH).filter(f => f.endsWith('.md')).sort();
const viFiles = readdirSync(VI).filter(f => f.endsWith('.md')).sort();
const manifest = { sourceCommit: 'e2605d3', generatedAt: new Date().toISOString(), chapters: [] };
const allTasks = [];
const CHUNK = 9000;

for (const [ci, zf] of zhFiles.entries()) {
  const z = parse(readFileSync(resolve(ZH, zf), 'utf8'));
  const v = parse(readFileSync(resolve(VI, viFiles[ci]), 'utf8'));
  const vByNo = new Map(v.entries.map(e => [e.head.match(/^(\d+)\./)?.[1], e]));
  const chNo = zf.slice(0, 2);
  const chTitle = z.intro.match(/^# (\d+)\.\s*(.+)$/m)?.[2] ?? '';
  let batch = [], size = 0, bi = 0;
  const flush = () => {
    if (!batch.length) return;
    bi++;
    const id = `ch${chNo}-${String(bi).padStart(2, '0')}`;
    const lines = [`# NHIỆM VỤ DỊCH — Việt hóa mục ${chNo}「${chTitle}」 (lô ${bi})`, '',
      'Bạn dịch các mục dưới đây từ tiếng Trung sang tiếng Việt cho một cuốn sách phi hư cấu xuất bản.',
      'Mỗi mục là một đơn vị độc lập. Chỉ xuất ra các mục, đúng thứ tự, không thêm lời dẫn, không thêm ghi chú của người dịch ngoài nội dung.', ''];
    for (const e of batch) {
      lines.push(`<<<MỤC ${e.no}>>>`, `### ${e.head}`, e.body.trimEnd(), '');
      const old = vByNo.get(String(e.no));
      if (old) {
        lines.push(`<<<BẢN DỊCH CŨ ${e.no} (chỉ để tham khảo cách dùng từ; nếu thiếu ý hoặc sai thì sửa)>>>`, `### ${old.head}`, old.body.trimEnd(), '');
      } else {
        lines.push(`<<<MỤC MỚI ${e.no}: chưa có bản dịch cũ>>>`, '');
      }
    }
    writeFileSync(resolve(TASKS, id + '.md'), lines.join('\n'));
    allTasks.push({ id, chapter: chNo, entries: batch.map(e => e.no), out: `vi/qa/out/${id}.md` });
    batch = []; size = 0;
  };
  for (const e of z.entries) {
    const no = Number(e.head.match(/^(\d+)\./)?.[1]);
    batch.push({ no, head: e.head, body: e.body });
    size += e.body.length + 80;
    if (size >= CHUNK) flush();
  }
  flush();
  manifest.chapters.push({ chapter: chNo, zh: zf, vi: viFiles[ci], entries: z.entries.length, batches: bi,
    title: chTitle, status: 'pending' });
}
writeFileSync(resolve(Q, 'tasks.json'), JSON.stringify({ tasks: allTasks, manifest }, null, 1));
writeFileSync(resolve(Q, 'manifest.json'), JSON.stringify(manifest, null, 1));
console.log(`生成 ${allTasks.length} 个任务，覆盖 ${zhFiles.length} 节 ${manifest.chapters.reduce((n, c) => n + c.entries, 0)} 条`);
