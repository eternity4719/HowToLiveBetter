// 按新的块大小重切，但已经翻好的条目原样带过去。
//
//   node tools/i18n/resplit.mjs                  # 两种语言所有节
//   node tools/i18n/resplit.mjs en               # 只英文
//   node tools/i18n/resplit.mjs en 01-不要早死,02-不要慢慢死
//
// 为什么要有这个：块大小是会调的（太碎的块费 token，太大的块一次翻不完），
// 改参数重跑 split.mjs 会把翻好的部分盖掉——那是白翻。
// splitSection 的 blocks[i] 是「第 i 块包含哪几条」，每条一整段，所以重排就是
// 按条号查表替换：翻过的搬译文，没翻的搬原文。行级 splice 在这里不行，
// 一条的长度和另一条不一样就会错位（踩过一次：一节报三十多处，看着像译文烂了，
// 其实是搬错了）。
//
// 已翻的条目从两处收：.i18n 里的块（还没合的）和已经合进去的整节
// （<语言>/book/<节>.md）——中文改过之后新加的条目，译者可能已经翻好合过一次，
// 只看 .i18n 会当成没翻。
//
// 跑完 join.mjs 一校就知道有没有搬坏。

import { readFileSync, writeFileSync, readdirSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { splitSection } from './split.mjs';
import { strings, SOURCE } from '../site/locales.mjs';

const ROOT = resolve(import.meta.dirname, '../..');
const read = p => readFileSync(resolve(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
const write = (p, t) => {
  mkdirSync(resolve(ROOT, p).replace(/\/[^/]+$/, ''), { recursive: true });
  writeFileSync(resolve(ROOT, p), t);
};

const argv = process.argv.slice(2);
const locales = argv[0] ? [argv[0]] : ['en', 'vi'];
const only = argv[1] ? argv[1].split(',').filter(Boolean) : null;

const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** 一份正文拆成「头部 + 按条号索引的条目」 */
function pieces(text, S) {
  const lines = text.split('\n');
  const at = lines.map((l, i) => (/^### /.test(l) ? i : -1)).filter(i => i >= 0);
  const head = at.length ? lines.slice(0, at[0]) : lines;
  const fieldRe = new RegExp('^- ' + escRe(S.fields.cost));
  const byN = new Map();
  for (let k = 0; k < at.length; k++){
    const stop = k + 1 < at.length ? at[k + 1] : lines.length;
    const seg = lines.slice(at[k], stop);
    while (seg.length && !seg[seg.length - 1].trim()) seg.pop();   // 段尾空行归下一段
    byN.set(/^### (\d+)\./.exec(seg[0])[1], { lines: seg, translated: seg.some(l => fieldRe.test(l)) });
  }
  return { head, byN };
}

let moved = 0, kept = 0;
for (const locale of locales){
  const S = strings(locale);
  const dir = `.i18n/${locale}`;
  if (!existsSync(resolve(ROOT, dir))) continue;

  for (const sec of readdirSync(resolve(ROOT, dir))){
    if (only && !only.includes(sec)) continue;
    const srcFile = `${SOURCE.contentDir ? SOURCE.contentDir + '/' : ''}book/${sec}.md`;
    if (!existsSync(resolve(ROOT, srcFile))) continue;
    const sd = `${dir}/${sec}`;

    // 已翻的按条号收起来：先整节（合过一次的），再 .i18n 里的块（更晚翻的以它为准）
    const done = new Map();
    const collect = text => {
      for (const [n, e] of pieces(text, S).byN) if (e.translated){ done.set(n, e.lines); moved++; }
    };
    if (existsSync(resolve(ROOT, `${locale}/book/${sec}.md`))) collect(read(`${locale}/book/${sec}.md`));
    for (const f of readdirSync(resolve(ROOT, sd)).filter(x => /^part\d+\.md$/.test(x)).sort())
      collect(read(`${sd}/${f}`));
    if (!done.size) continue;

    const cut = splitSection(read(srcFile));
    rmSync(resolve(ROOT, sd), { recursive: true, force: true });
    let n = 0;
    cut.blocks.forEach((blockEntries, i) => {
      const body = blockEntries.map(entryLines => {
        const num = /^### (\d+)\./.exec(entryLines[0])[1];
        if (!done.has(num)) return entryLines;
        n++; kept++;
        return done.get(num);
      });
      write(`${sd}/part${String(i).padStart(2, '0')}.md`,
        (i === 0 ? cut.head.join('\n') + '\n' : '') + body.flat().join('\n') + '\n');
    });
    if (cut.tailLink) write(`${sd}/tail.txt`, cut.tailLink + '\n');
    console.log(`${locale} ${sec}：重切 ${cut.blocks.length} 块，带过 ${n} 条已翻的`);
  }
}
console.log(`\n共 ${moved} 条已翻，重排后 ${kept} 条落地`);
