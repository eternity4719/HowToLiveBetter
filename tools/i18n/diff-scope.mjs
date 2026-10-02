// 报告中文原文改了什么，好知道哪些译文要重翻：拿旧原文和现原文逐条配对。
//
//   node tools/i18n/diff-scope.mjs <旧 book 目录>            # 两种语言
//   node tools/i18n/diff-scope.mjs <旧 book 目录> en
//
// 配对不按条号（上游删条并条，条号会整体顺延，按号配会把译文挂到别的条目上），
// 按条目标题配：标题是作者写的动作句，删条并条之外的改动一般不动它。标题没命中的
// 再按整段正文的前 60 字配。全书没有两条标题相同，所以标题是可靠的键。
//
// 三类结果：删掉的（译文整条去掉，条号顺延）、标题变了的（同一件事被改写，要重翻）、
// 新增的（要翻）。标题和正文都没变的，译文原样留着，只需改条号和交叉引用。

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALES, SOURCE } from '../site/locales.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = p => readFileSync(resolve(ROOT, p), 'utf8').replace(/\r\n/g, '\n');

const argv = process.argv.slice(2);
const baseDir = argv[0];
const locales = argv[1] ? [argv[1]] : LOCALES.map(l => l.code).filter(c => c !== SOURCE.code);
if (!baseDir || !existsSync(resolve(ROOT, baseDir))) {
  console.error('用法：node tools/i18n/diff-scope.mjs <旧 book 目录> [en|vi]');
  process.exit(2);
}

/** 一份正文拆成按条号索引的条目 */
function pieces(text) {
  const lines = text.split('\n');
  const at = lines.map((l, i) => (/^### /.test(l) ? i : -1)).filter(i => i >= 0);
  const byN = new Map();
  for (let k = 0; k < at.length; k++) {
    const stop = k + 1 < at.length ? at[k + 1] : lines.length;
    const seg = lines.slice(at[k], stop);
    while (seg.length && !seg[seg.length - 1].trim()) seg.pop();
    byN.set(/^### (\d+)\./.exec(seg[0])[1], { head: seg[0], body: seg.slice(1).join('\n') });
  }
  return byN;
}

const titleOf = h => h.replace(/^### \d+\.\s*/, '').trim();
const keyOf = e => e.body.replace(/\s+/g, '').slice(0, 60);

const totals = { same: 0, reword: 0, fresh: 0, gone: 0 };
const perSection = [];

for (const code of locales) {
  const locale = LOCALES.find(l => l.code === code);
  const tgtDir = `${locale.contentDir ? locale.contentDir + '/' : ''}book/`;
  const srcDir = (SOURCE.contentDir ? SOURCE.contentDir + '/' : '') + 'book/';
  for (const f of readdirSync(resolve(ROOT, srcDir)).filter(x => x.endsWith('.md')).sort()) {
    const baseFile = `${baseDir}/${f}`;
    if (!existsSync(resolve(ROOT, baseFile))) continue;
    if (!existsSync(resolve(ROOT, tgtDir + f))) continue;
    const oldE = pieces(read(baseFile));
    const newE = pieces(read(srcDir + f));

    // 旧条目按标题和按正文开头各建一张表。claims 记已配上的，
    // 免得两条旧条目抢同一条新条目（并条之后标题会撞上一次）。
    const byTitle = new Map(), byKey = new Map();
    for (const [n, e] of oldE) {
      const t = titleOf(e.head);
      if (!byTitle.has(t)) byTitle.set(t, []);
      byTitle.get(t).push({ n, e });
      if (!byKey.has(keyOf(e))) byKey.set(keyOf(e), []);
      byKey.get(keyOf(e)).push({ n, e });
    }
    const claimed = new Set();

    const gone = [], reword = [], fresh = [];
    for (const [n, e] of newE) {
      const t = titleOf(e.head);
      let hit = (byTitle.get(t) || []).find(x => !claimed.has(x.e));
      if (hit) {
        claimed.add(hit.e);
        if (keyOf(hit.e) !== keyOf(e)) { reword.push(`${n}（旧 ${hit.n}）`); totals.reword++; }
        else totals.same++;
        continue;
      }
      hit = (byKey.get(keyOf(e)) || []).find(x => !claimed.has(x.e));
      if (hit) { claimed.add(hit.e); totals.same++; continue; }
      fresh.push(n); totals.fresh++;
    }
    for (const [n, e] of oldE) if (!claimed.has(e)) { gone.push(`${n}「${titleOf(e.head).slice(0, 26)}」`); totals.gone++; }

    if (gone.length || reword.length || fresh.length) {
      perSection.push({ code, f, gone, reword, fresh });
    }
  }
}

for (const { code, f, gone, reword, fresh } of perSection) {
  console.log(`\n${code}  ${f}`);
  if (gone.length) console.log(`  删掉 ${gone.length}：${gone.join('  ')}`);
  if (reword.length) console.log(`  改写 ${reword.length}：${reword.join('  ')}`);
  if (fresh.length) console.log(`  新增 ${fresh.length}：第 ${fresh.join('、')} 条`);
}
console.log(`\n合计：正文与标题都没变 ${totals.same}，标题变（要重翻）${totals.reword}，新增（要翻）${totals.fresh}，删掉（译文去掉、条号顺延）${totals.gone}`);
