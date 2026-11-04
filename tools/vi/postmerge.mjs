// Chạy đúng thứ tự sau mỗi đợt dịch: gộp chương → gộp bài dài → chuẩn hóa → audit → manifest.
// 用法：node tools/vi/postmerge.mjs
import { execFileSync } from 'node:child_process';
import { ROOT } from '../lib/book.mjs';

const run = (args) => {
  try { process.stdout.write(execFileSync('node', args, { cwd: ROOT, encoding: 'utf8' })); }
  catch (e) { process.stdout.write((e.stdout ?? '') + (e.stderr ?? '')); }
};
run(['tools/vi/merge.mjs']);
run(['tools/vi/merge-docs.mjs']);
run(['tools/vi/normalize-units.mjs']);
run(['tools/vi/normalize-terms.mjs']);
run(['tools/vi/fixups.mjs']);
run(['tools/vi/audit.mjs']);
run(['tools/vi/manifest.mjs']);
