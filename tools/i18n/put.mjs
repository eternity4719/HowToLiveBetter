// 把一条译文写进它该在的块。
//
//   node tools/i18n/put.mjs <语言> <节名> <条号> <译文文件>
//
// 译文文件是完整的条目，含 `### N. ` 那一行和下面六栏。
//
// 为什么要有这个脚本：条目散在 .i18n/<语言>/<节名>/partNN.md 里，哪一条在第几块
// 靠数行号很容易数错（2026-10-02 数错了一次，把第 19 条的译文写进了第 13 条那块，
// 脚本直接抛错才没写坏）。这个脚本按条号去找，找不到就退出码 1，一个字都不写。
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = p => readFileSync(resolve(ROOT, p), 'utf8');
const write = (p, t) => writeFileSync(resolve(ROOT, p), t);

const [locale, sec, numStr, ...rest] = process.argv.slice(2);
const file = rest[0];
if (!locale || !sec || !numStr || !file) {
  console.error('用法：node tools/i18n/put.mjs <语言> <节名> <条号> <译文文件>');
  process.exit(2);
}
if (!existsSync(resolve(ROOT, file))) { console.error(`译文文件不存在：${file}`); process.exit(2); }

const body = read(file).replace(/\n+$/, '\n');
const dir = `.i18n/${locale}/${sec}`;
// 先确认译文那一行的条号跟参数一致，写错节号要当场拦住
const head = /^### (\d+)\. /.exec(body);
if (!head) { console.error(`${file} 开头不是「### N. …」`); process.exit(2); }
if (head[1] !== numStr) {
  console.error(`译文文件写的是第 ${head[1]} 条，参数写的是第 ${numStr} 条`);
  process.exit(2);
}

let hit = null;
for (const f of readdirSync(resolve(ROOT, dir)).filter(x => /^part\d+\.md$/.test(x)).sort()){
  const p = `${dir}/${f}`;
  const t = read(p);
  if (!new RegExp(`^### ${numStr}\\. `, 'm').test(t)) continue;
  if (hit) { console.error(`第 ${numStr} 条同时出现在 ${hit} 和 ${p}，先去查块是怎么分的`); process.exit(1); }
  hit = { p, t };
}
if (!hit) { console.error(`${dir} 里没有第 ${numStr} 条`); process.exit(1); }

const lines = hit.t.split('\n');
const at = lines.findIndex(l => l.startsWith(`### ${numStr}. `));
let stop = lines.length;
for (let i = at + 1; i < lines.length; i++) if (/^### \d+\. /.test(lines[i])) { stop = i; break; }
write(hit.p, lines.slice(0, at).concat(body.replace(/\n$/, ''), lines.slice(stop)).join('\n'));
console.log(`${locale} ${sec} 第 ${numStr} 条 → ${hit.p}`);
