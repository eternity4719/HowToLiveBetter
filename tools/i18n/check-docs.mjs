// 校长文（docs/*.md）里的条目指路：译文引的条号节号跟中文原文还对不对得上。
//
//   node tools/i18n/check-docs.mjs            # 两种语言都查
//   node tools/i18n/check-docs.mjs en
//
// 为什么单独一个：check.mjs 逐条比 book/ 里的条目，不看 docs/。长文全是条目引用，
// 而且是按时间排的动作清单——引用指错条目，读者照着做的那一步就错了，比正文里
// 指错更难受。上游删条并条之后条号顺延，正文这边有 rebase.mjs 搬，长文这边没人搬：
// 2026-10-02 合成后 docs/生物钟和夜班.md 的「第 2 节第 39 条」在英越两语还写着
// item 40，而 2.40 已经是「买预包装食用油」，夜班那条落到 2.39 上去了。
//
// 判据是「两边引的 (节, 条) 集合相同」，不是逐字比锚点：
//   · 锚点是给人看的，长文里本来就允许截断（中文原文自己就在截，「药按医嘱吃满」
//     是「药按医嘱吃满，别感觉好了就停」的截断），译文截断的地方和截断的长度
//     都不一样，逐字比只会报出一堆假警报。
//   · 真正要拦的是条号顺延：译文那一份还在引旧号，读者点进去落在隔壁那条上。
//     集合一比就露馅，而且不依赖译文的措辞。
// 所以这里只收「译文引了原文没引的」和「原文引了译文没引的」两种。
// 括号里的锚点对不对得上，得人看，见 check-refs 对正文的同一套办法。

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALES, SOURCE, strings } from '../site/locales.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = p => readFileSync(resolve(ROOT, p), 'utf8').replace(/\r\n/g, '\n');

const argv = process.argv.slice(2);
const locales = argv.length ? argv : LOCALES.map(l => l.code).filter(c => c !== SOURCE.code);

/** 一门语言的长文里，引用到的 (节, 条) 集合。只认带节号的那一支：长文里裸的
    「第 N 条」是法条，不是条目引用（CLAUDE.md 记的规矩）。 */
function refsOfDoc(text, xref) {
  const out = new Set();
  for (const m of String(text).matchAll(new RegExp(xref.pattern, 'g'))){
    const g = m.groups ?? {};
    if (g.sec === undefined || !g.nums) continue;
    for (const part of String(g.nums).split(new RegExp(xref.listSep))){
      const n = part.trim();
      if (/^\d+$/.test(n)) out.add(g.sec + ':' + n);
    }
  }
  return out;
}

const zhDir = (SOURCE.contentDir ? SOURCE.contentDir + '/' : '') + 'docs/';
let bad = 0, files = 0, pairs = 0;

for (const locale of locales) {
  const L = LOCALES.find(l => l.code === locale);
  const S = strings(locale);
  if (!S.xref) continue;
  const docsDir = (L.contentDir ? L.contentDir + '/' : '') + 'docs/';
  if (!existsSync(resolve(ROOT, docsDir))) continue;

  for (const f of readdirSync(resolve(ROOT, docsDir)).filter(x => x.endsWith('.md')).sort()) {
    if (!existsSync(resolve(ROOT, zhDir + f))) continue;      // 原文还没有这篇，不比
    const want = refsOfDoc(read(zhDir + f), strings(SOURCE.code).xref);
    if (!want.size) continue;                                   // 原文没引条目
    const got = refsOfDoc(read(docsDir + f), S.xref);
    files++;
    pairs += want.size;
    const extra = [...got].filter(x => !want.has(x));
    const missing = [...want].filter(x => !got.has(x));
    if (!extra.length && !missing.length) continue;
    bad++;
    console.log(`${locale} docs/${f}`);
    if (extra.length) console.log(`  译文多引了（原文没有）：${extra.join(' ')}`);
    if (missing.length) console.log(`  译文漏引了（原文有）：${missing.join(' ')}`);
  }
}
console.log(`\n长文指路：${files} 篇共 ${pairs} 处引用，对不上 ${bad} 篇`);
process.exit(bad ? 1 : 0);