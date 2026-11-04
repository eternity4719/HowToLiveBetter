// Sinh vi/manifest.json: bản đồ nguồn Trung → bản dịch Việt, số mục, tình trạng.
// 用法：node tools/vi/manifest.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from '../lib/book.mjs';

const ZH = resolve(ROOT, 'book'), VI = resolve(ROOT, 'vi/book');
const SRC = JSON.parse(readFileSync(resolve(ROOT, 'vi/source.json'), 'utf8'));
const audit = JSON.parse(readFileSync(resolve(ROOT, 'vi/qa/audit.json'), 'utf8'));
const byVi = new Map(audit.chapters.map(c => [c.vi, c]));
let mergedLog = {};
try { mergedLog = JSON.parse(readFileSync(resolve(ROOT, 'vi/qa/merged.json'), 'utf8')); } catch {}

const split = t => t.split(/^### /m).slice(1).map(b => {
  const i = b.indexOf('\n');
  return { head: i < 0 ? b : b.slice(0, i), body: i < 0 ? '' : b.slice(i + 1) };
});
const no = h => Number(h.match(/^(\d+)\./)?.[1]);
const zhFiles = readdirSync(ZH).filter(f => f.endsWith('.md')).sort();
const viFiles = readdirSync(VI).filter(f => f.endsWith('.md')).sort();

let totalZh = 0, totalVi = 0, complete = 0, verified = 0;
const chapters = zhFiles.map((zf, i) => {
  const vf = viFiles[i];
  const z = split(readFileSync(resolve(ZH, zf), 'utf8'));
  const v = split(readFileSync(resolve(VI, vf), 'utf8'));
  const zNos = new Set(z.map(e => no(e.head)));
  const vNos = new Set(v.map(e => no(e.head)));
  const missing = [...zNos].filter(n => !vNos.has(n));
  const a = byVi.get(vf) ?? {};
  totalZh += z.length; totalVi += v.length;
  const status = missing.length === 0 && mergedLog[String(Number(zf.slice(0, 2)))] ? 'complete' : 'partial';
  if (status === 'complete') { complete++; verified += v.length; }
  return {
    chapter: Number(zf.slice(0, 2)), zh: zf, vi: vf, title: v.head,
    entriesSource: z.length, entriesTranslated: v.length, missingEntries: missing,
    missingNumbers: (a.numMissing ?? []).length, sourceMismatch: (a.sourceMismatch ?? []).length,
    lowRatio: (a.lowRatio ?? []).length, cjkOutsideSource: (a.cjkOutsideSource ?? []).length,
    status,
  };
});

const manifest = {
  generatedAt: new Date().toISOString(),
  source: SRC,
  totals: {
    chapters: chapters.length, chaptersComplete: complete,
    entriesSource: totalZh, entriesPresent: totalVi, entriesVerified: verified,
    coverage: totalZh ? +(verified / totalZh).toFixed(4) : 0,
  },
  chapters,
};
writeFileSync(resolve(ROOT, 'vi/manifest.json'), JSON.stringify(manifest, null, 1));
console.log(`Manifest: ${complete}/${chapters.length} chương đủ, ${verified}/${totalZh} mục đã dịch lại và gộp (${(100 * verified / totalZh).toFixed(1)}%); hiện có ${totalVi} mục trong sách`);
