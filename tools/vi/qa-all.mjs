// Chạy toàn bộ kiểm tra và ghi vi/qa/report.md: audit nội dung, manifest, dựng EPUB,
// giải nén, đối chiếu nội dung, liên kết, EPUBCheck (nếu có).
// 用法：EPUBCHECK=/path/to/epubcheck.jar node tools/vi/qa-all.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { ROOT } from '../lib/book.mjs';

const qa = resolve(ROOT, 'vi/qa');
const run = (cmd, args, opts = {}) => {
  try { return { ok: true, out: execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts }) }; }
  catch (e) { return { ok: false, out: (e.stdout ?? '') + (e.stderr ?? ''), code: e.status }; }
};

const steps = [];
const step = (name, cmd, args) => {
  const r = run(cmd, args);
  steps.push({ name, ok: r.ok, out: r.out.trim().split('\n').slice(-6).join('\n') });
  return r;
};

step('audit', 'node', ['tools/vi/audit.mjs']);
step('manifest', 'node', ['tools/vi/manifest.mjs']);
step('build', 'node', ['tools/vi/build-epub.mjs']);

const tmp = mkdtempSync(resolve(tmpdir(), 'vi-epub-'));
try {
  run('unzip', ['-q', 'dist/HowToLiveBetter-vi.epub', '-d', tmp]);
  step('content', 'node', ['tools/vi/check-content.mjs', resolve(tmp, 'OEBPS')]);
  step('links', 'node', ['tools/vi/check-links.mjs', resolve(tmp, 'OEBPS')]);
} finally {
  // giữ lại thư mục giải nén cho lần chụp ảnh; chỉ dọn khi biến CLEAN=1
  if (process.env.CLEAN === '1') rmSync(tmp, { recursive: true, force: true });
}

const jar = process.env.EPUBCHECK;
if (jar && existsSync(jar)) step('epubcheck', 'java', ['-jar', jar, 'dist/HowToLiveBetter-vi.epub']);

const manifest = JSON.parse(readFileSync(resolve(ROOT, 'vi/manifest.json'), 'utf8'));
const audit = JSON.parse(readFileSync(resolve(qa, 'audit.json'), 'utf8'));
const failed = steps.filter(s => !s.ok);
const md = `# Báo cáo kiểm tra bản tiếng Việt

- Thời điểm: ${new Date().toISOString()}
- Nguồn: \`${manifest.source.sourceCommit}\`
- Chương đủ mục: ${manifest.totals.chaptersComplete}/${manifest.totals.chapters}
- Mục đã dịch lại và gộp: ${manifest.totals.entriesVerified}/${manifest.totals.entriesSource} (${(100 * manifest.totals.coverage).toFixed(1)}%); hiện có ${manifest.totals.entriesPresent} mục trong sách
- Mục thiếu số: ${audit.totals.numMissing}; nguồn lệch: ${audit.totals.sourceMismatch}; chữ Hán ngoài Nguồn: ${audit.totals.cjkOutsideSource}; tiêu đề còn chữ Hán: ${audit.totals.titleCjk}
- Kết quả: ${failed.length ? 'CÓ LỖI' : 'đạt các bước đã chạy'}

${steps.map(s => `## ${s.name}: ${s.ok ? 'đạt' : 'lỗi'}\n\n\`\`\`\n${s.out}\n\`\`\``).join('\n\n')}
`;
writeFileSync(resolve(qa, 'report.md'), md);
console.log(`Báo cáo: ${resolve(qa, 'report.md')}`);
for (const s of steps) console.log(`${s.ok ? '✓' : '✗'} ${s.name}`);
process.exit(failed.length ? 1 : 0);
