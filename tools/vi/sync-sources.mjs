// 把越南语条目的「Nguồn / 来源」栏逐字同步成中文原文的「来源」栏。
// 引文里的文号、URL、DOI、页码、年份必须原样保留，旧译文里这一栏被截断过（133 条少链接）。
// 只改这一栏，其他字段不动。用法：node tools/vi/sync-sources.mjs [--check]
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from '../lib/book.mjs';

const ZH = resolve(ROOT, 'book'), VI = resolve(ROOT, 'vi/book');
const check = process.argv.includes('--check');

function splitEntries(text) {
  const parts = text.split(/^### /m);
  return { intro: parts.shift(), entries: parts.map(p => {
    const i = p.indexOf('\n');
    return { head: i < 0 ? p : p.slice(0, i), body: i < 0 ? '' : p.slice(i + 1) };
  }) };
}

const FIELD_ZH = /^- 来源：/m;

const files = readdirSync(ZH).filter(f => f.endsWith('.md')).sort();
const viFiles = readdirSync(VI).filter(f => f.endsWith('.md')).sort();
let changed = 0, skipped = 0;

for (const [i, zf] of files.entries()) {
  const vf = viFiles[i];
  const zText = readFileSync(resolve(ZH, zf), 'utf8');
  const vText = readFileSync(resolve(VI, vf), 'utf8');
  const z = splitEntries(zText), v = splitEntries(vText);
  const zByNo = new Map(z.entries.map(e => [e.head.match(/^(\d+)\./)?.[1], e]));
  const out = v.entries.map(ve => {
    const no = ve.head.match(/^(\d+)\./)?.[1];
    const ze = zByNo.get(no);
    if (!ze) { skipped++; return ve; }
    const zm = ze.body.match(/^- 来源：.*(?:\n(?![-\s]|$).*)*/m);
    if (!zm) { skipped++; return ve; }
    const src = '- Nguồn: ' + zm[0].replace(/^- 来源：\s*/, '').trimEnd();
    const vm = ve.body.match(/^- Nguồn:.*(?:\n(?![-\s]|$).*)*/m);
    if (!vm) return ve;
    if (vm[0].trimEnd() === src) return ve;
    changed++;
    return { head: ve.head, body: ve.body.replace(vm[0], src) };
  });
  const rebuilt = out.map(e => `### ${e.head}\n${e.body}`).join('');
  const next = v.intro + rebuilt;
  if (!check && next !== vText) writeFileSync(resolve(VI, vf), next);
}
console.log(`${check ? '检查' : '同步'}完成：改动 ${changed} 条，跳过 ${skipped} 条`);
