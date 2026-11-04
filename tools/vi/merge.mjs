// Gộp các lô đã dịch trong vi/qa/out vào vi/book, theo đúng thứ tự và số mục
// của bản tiếng Trung hiện tại. Chỉ gộp một chương khi đã có đủ mọi mục;
// chương nào còn thiếu thì giữ nguyên và báo lại.
// 用法：node tools/vi/merge.mjs [--check]
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from '../lib/book.mjs';

const ZH = resolve(ROOT, 'book'), VI = resolve(ROOT, 'vi/book'), OUT = resolve(ROOT, 'vi/qa/out');
const check = process.argv.includes('--check');

function splitEntries(text) {
  const parts = text.split(/^### /m);
  return { head: parts.shift() ?? '', entries: parts.map(p => {
    const i = p.indexOf('\n');
    return { head: i < 0 ? p : p.slice(0, i), body: i < 0 ? '' : p.slice(i + 1) };
  }) };
}
const noOf = h => Number(h.match(/^(\d+)\./)?.[1]);
const TAG = { '钱': ['tien', { '0': '0', '少': 'it', '多': 'nhieu' }], '时间': ['thoi-gian', { '少': 'it', '中': 'vua', '多': 'nhieu' }], '毅力': ['y-chi', { '否': 'khong', '些': 'chut', '是': 'co' }], '收益': ['loi-ich', { '大': 'lon', '中': 'vua', '小': 'nho' }], '口径': ['quy-mo', { '死亡率': 'tu-vong', '金钱': 'tien', '时间': 'thoi-gian', '自由': 'tu-do' }] };
const rebuildTag = zhTag => {
  const kv = Object.fromEntries([...zhTag.matchAll(/([^\s=]+)=([^\s]+)/g)].map(m => [m[1], m[2]]));
  const out = [];
  for (const [zhKey, [viKey, map]] of Object.entries(TAG)) if (kv[zhKey] && map[kv[zhKey]]) out.push(`${viKey}=${map[kv[zhKey]]}`);
  if (kv['人群']) out.push(`nhom=${kv['人群']}`);
  return out.join(' ');
};
const sourceLine = zhBody => {
  const m = zhBody.match(/^- 来源：\s*([\s\S]*?)(?=\n- |\n*$)/m);
  return m ? '- Nguồn: ' + m[1].trim() : null;
};

// gom bản dịch theo chương và số mục
const translated = new Map();
for (const f of readdirSync(OUT).filter(f => /^ch\d\d-\d+\.md$/.test(f))) {
  const ch = Number(f.slice(2, 4));
  const text = readFileSync(resolve(OUT, f), 'utf8');
  for (const b of text.split(/^### /m).slice(1)) {
    const i = b.indexOf('\n');
    const head = i < 0 ? b : b.slice(0, i);
    const no = noOf(head);
    if (!no) continue;
    const key = `${ch}-${no}`;
    const prev = translated.get(key);
    if (prev && prev.file !== f) {
      // cùng một mục xuất hiện ở hai lô: giữ bản dài hơn, cảnh báo
      if ((prev.body?.length ?? 0) > b.length) continue;
    }
    translated.set(key, { head, body: i < 0 ? '' : b.slice(i + 1), file: f });
  }
}

const zhFiles = readdirSync(ZH).filter(f => f.endsWith('.md')).sort();
const viFiles = readdirSync(VI).filter(f => f.endsWith('.md')).sort();
const report = { merged: [], skipped: [], entries: 0, missing: [] };

for (const [idx, zf] of zhFiles.entries()) {
  const vf = viFiles[idx];
  const ch = Number(zf.slice(0, 2));
  const zText = readFileSync(resolve(ZH, zf), 'utf8');
  const z = splitEntries(zText);
  const zTitle = zText.match(/^#\s+(\d+)\.\s*(.+)$/m);
  const vText = readFileSync(resolve(VI, vf), 'utf8');
  const v = splitEntries(vText);
  const vByNo = new Map(v.entries.map(e => [noOf(e.head), e]));
  const missing = z.entries.map(e => noOf(e.head)).filter(no => !translated.has(`${ch}-${no}`));
  if (missing.length) {
    report.skipped.push({ chapter: ch, vi: vf, missing: missing.length, list: missing.slice(0, 20) });
    continue;
  }
  const intro = v.head.replace(/^\[[^\]]*\]\([^)]*\)\s*\n/, '').replace(/^#\s+\d+\.[^\n]*\n?/, '').trim();
  const body = z.entries.map(ze => {
    const t = translated.get(`${ch}-${noOf(ze.head)}`);
    const tag = rebuildTag(ze.body.match(/^<!--\s*成本标签:([^>]*?)-->/m)?.[1] ?? '');
    const src = sourceLine(ze.body);
    let b = t.body.trimEnd();
    if (tag) b = b.replace(/^<!--\s*nhan-chi-phi:[^>]*?-->/m, `<!-- nhan-chi-phi: ${tag} -->`);
    if (src) b = b.replace(/^- Nguồn:[\s\S]*?(?=\n- |$)/m, src);
    return `### ${t.head}\n${b}\n`;
  }).join('\n');
  const titleLine = `# ${ch}. ${vText.match(/^#\s+\d+\.\s*(.+)$/m)?.[1]?.trim() ?? zTitle?.[2] ?? ''}`;
  const next = `[← Mục lục](../README.md)\n\n${titleLine}\n\n${intro}\n\n${body}`.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
  if (!check) writeFileSync(resolve(VI, vf), next);
  report.merged.push({ chapter: ch, vi: vf, entries: z.entries.length });
  report.entries += z.entries.length;
}

console.log(`${check ? 'Kiểm' : 'Gộp'}: ${report.merged.length} chương, ${report.entries} mục; ${report.skipped.length} chương còn thiếu`);
for (const s of report.skipped) console.log(`  - ch${s.chapter} ${s.vi}: thiếu ${s.missing} mục (${s.list.join(', ')})`);
