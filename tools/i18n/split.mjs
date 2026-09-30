// 把一节正文切成一块块，好让并行翻译一次一块。
//
//   node tools/i18n/split.mjs book/01-不要早死.md            # 切到 .i18n/en/01-*.partNN.md
//   node tools/i18n/split.mjs book/01-不要早死.md --locale vi
//   node tools/i18n/split.mjs --all --locale en             # 整本都切
//
// 为什么切：一次翻一整节（最大的一节 4 万多字）输出太长，中途断了就得从头再来，
// 而且不好并行。一块十来条，一个翻译任务一块，断了只重跑那一块。
//
// 切法：第一节头部（回目录那行 + 「# N. 节名」+ 节首引言）只进第 0 块，其余每块若干条，
// 每块自带文件头和文件尾（回目录那行 / 空行）。条目的边界是「### 」，
// 成本标签注释、六个字段行整条跟着走，不会从中间断开。
//
// 合回来是 join.mjs，它按块号排序拼接，再跑一遍结构检查。

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { LOCALES, SOURCE } from '../site/locales.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = p => readFileSync(resolve(ROOT, p), 'utf8').replace(/\r\n/g, '\n');

const argv = process.argv.slice(2);
const localeArg = argv.indexOf('--locale');
const locale = localeArg < 0 ? 'en' : argv[localeArg + 1];
if (!LOCALES.some(l => l.code === locale)) {
  console.error(`--locale 得是 ${LOCALES.map(l => l.code).join(' / ')} 里的一项`);
  process.exit(2);
}
// 一块的上限：条数和字数都算，哪个先到就切。
// 条数上限防「十几条都很短」时一块太碎；字数上限防「一条特别长」时一块太大——
// 31 节第一块光一个条目就 4 万多字，一次翻不完的。
const ENTRIES = Number(process.env.SPLIT_ENTRIES ?? 8);
const MAX_BYTES = Number(process.env.SPLIT_MAX_BYTES ?? 6000);

/** 把一节正文切成头部 + 若干块条目。切点只在条目边界上，不能从一条中间断开 */
export function splitSection(md, perBlock = ENTRIES) {
  const lines = md.split('\n');
  const at = lines.map((l, i) => (/^### /.test(l) ? i : -1)).filter(i => i >= 0);
  if (!at.length) throw new Error('这一节里没找到条目（### 开头）');
  const head = lines.slice(0, at[0]);

  // 末尾那行回目录（第 1 节没有，别的地方有）不算进最后一条
  let end = lines.length;
  while (end > 0 && !lines[end - 1].trim()) end--;
  if (end > 0 && /^\[.*\]\(/.test(lines[end - 1])) end--;
  const tailLink = lines.slice(end).join('\n').trim() || null;

  // 每个条目是一段：从它的「### 」到下一个条目的「### 」之前
  const entries = at.map((start, i) => {
    const stop = i + 1 < at.length ? at[i + 1] : end;
    return lines.slice(start, stop);
  });

  // blocks[i] 是「第 i 块包含哪几条」，每条一整段（行数组）。
  // 保持条为单位而不是拍平成行：重切时（tools/i18n/resplit.mjs）要按条整段搬，
  // 拍平之后只能按行号 splice，一条的长度和另一条不一样就错位了（踩过一次：
  // 一节报三十多处，看着像译文烂了，其实是搬错了）。
  const blocks = [];
  let cur = [], bytes = 0;
  for (const e of entries){
    const size = e.join('\n').length;
    if (cur.length && (bytes + size > MAX_BYTES || cur.length >= perBlock)){ blocks.push(cur); cur = []; bytes = 0; }
    cur.push(e); bytes += size;
  }
  if (cur.length) blocks.push(cur);
  return { head, blocks, tailLink, count: entries.length };
}

export function outDir(locale, file) {
  return `.i18n/${locale}/${file.replace(/\.md$/, '')}`;
}

// ---------------------------------------------------------------- 主流程
// join.mjs 要 import 这里的 splitSection，所以主流程只在直接跑这个脚本时执行。
// 不加这一层，join 一 import 就把切好的块重切一遍，刚翻好的一块就被原文盖回去。
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();

async function main(){
const files = [];
if (argv.includes('--all')) {
  const dir = (SOURCE.contentDir ? SOURCE.contentDir + '/' : '') + 'book/';
  for (const f of readdirSync(resolve(ROOT, dir))) if (f.endsWith('.md')) files.push(dir + f);
} else {
  for (const a of argv) if (a.endsWith('.md')) files.push(a);
}
if (!files.length) {
  console.error('给一个 book/*.md 的路径，或者加 --all');
  process.exit(2);
}

let made = 0;
for (const f of files){
  const md = read(f);
  let cut;
  try { cut = splitSection(md); }
  catch (err){ console.error(`跳过 ${f}：${err.message}`); continue; }
  const dir = outDir(locale, f.split('/').pop());
  mkdirSync(resolve(ROOT, dir), { recursive: true });
  let wrote = 0, kept = 0;
  cut.blocks.forEach((b, i) => {
    const num = String(i).padStart(2, '0');
    const at = `${dir}/part${num}.md`;
    // 已经翻过的块不覆盖。切块本来就是可重复跑的：改参数重切一次，
    // 顺手把翻好的几块冲掉就白翻一天（2026-09-30 踩过）。
    if (existsSync(resolve(ROOT, at)) && !process.argv.includes('--force')){ kept++; return; }
    // 第 0 块带头部（回目录那行 + 节标题 + 导读），其余块只带条目，合起来才是一节
    const text = (i === 0 ? cut.head.join('\n') + '\n' : '') + b.flat().join('\n') + '\n';
    writeFileSync(resolve(ROOT, at), text);
    wrote++;
  });
  if (cut.tailLink && !existsSync(resolve(ROOT, `${dir}/tail.txt`)))
    writeFileSync(resolve(ROOT, `${dir}/tail.txt`), cut.tailLink + '\n');
  if (kept) console.log(`  （${kept} 块已翻过，没动；--force 可覆盖）`);
  made += cut.blocks.length;
  const kb = s => (s / 1024).toFixed(1) + 'K';
  console.log(`${f} → ${dir}/  ${cut.blocks.length} 块，${cut.count} 条，最大一块 ${kb(Math.max(...cut.blocks.map(b => b.join('\n').length)))}`);
}
console.log(`\n共切出 ${made} 块`);
}
