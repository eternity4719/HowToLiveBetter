// 校译文。中文是原文，en/ 和 vi/ 是译本；这一套检查抓的是「翻着翻着就把东西弄丢了」。
//
//   node tools/i18n/check.mjs                   # 校所有语言
//   node tools/i18n/check.mjs --locale en      # 只校英文
//   node tools/i18n/check.mjs --warnings       # 不一致只提示不失败（还没翻完时用）
//
// 逐条对着原文查。判据在 tools/i18n/structure.mjs 里（join 逐块校时用的是同一份）：
//   ① 条数、条号、字段的有无与顺序和原文一致
//   ② 成本标签注释逐字照抄 —— 检索页的筛选和地址栏全靠它，三种语言共用一套中文取值
//   ③ 证据等级 A/B/C 一样；标了争议的、含待核实的条数一样
//   ④ 收益、成本、来源三栏里的数字一个不多一个不少（量级词换算除外，见 structure.mjs）
//   ⑤ 「第 X 条」「第 X 节」指路的条号节号都还在
//   ⑥ 来源栏和备注栏里的 http(s) 链接数量一致
//   ⑦ 每个文件的回总目录链接指向本语言的目录
//
// ④ 和 ⑥ 最要紧：正文里一个数字被改动，全书的可核对性就断在那儿，而这一层机器查得出来。

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALES, SOURCE, LOCALE, strings, contentPath } from '../site/locales.mjs';
import { STRUCT, entrySkeleton } from './structure.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = p => readFileSync(resolve(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
const WARN = process.argv.includes('--warnings');
const only = process.argv.indexOf('--locale');
const codes = only < 0 ? LOCALES.map(l => l.code) : [process.argv[only + 1]];

const problems = [];
const report = (where, what) => problems.push(`${where}：${what}`);

/** 那门语言 README「目录」一节的节名，按节文件名（01-不要早死）索引。
    页面的侧栏目录读的是 README，译本 book/ 里的节标题是另一处，两处该说同一句话。 */
function tocTitles(code) {
  const p = contentPath(code, 'README.md');
  if (!existsSync(resolve(ROOT, p))) return {};
  const S = strings(code);
  const out = {};
  for (const m of read(p).matchAll(/^\s*\d+\.\s+\[([^\]]+)\]\((book\/[^)]+\.md)\)/gm)){
    out[m[2].slice('book/'.length).replace(/\.md$/, '')] = m[1];
  }
  return out;
}

for (const code of codes){
  if (code === SOURCE.code) continue;
  const L = LOCALE(code);
  const S = strings(code);

  const srcDir = (SOURCE.contentDir ? SOURCE.contentDir + '/' : '') + 'book/';
  const files = readdirSync(resolve(ROOT, srcDir)).filter(f => f.endsWith('.md')).sort();
  const toc = tocTitles(code);
  const have = [];
  for (const f of files){
    // 译文所在的仓库目录：contentPath，不是 L.dir（那是页面上线上的地址，英文是空串）
    const dstPath = contentPath(code, `book/${f}`);
    if (!existsSync(resolve(ROOT, dstPath))) continue;
    have.push(f);
    const src = entrySkeleton(read(srcDir + f), strings(SOURCE.code));
    const dst = entrySkeleton(read(dstPath), S);
    for (const e of dst.entries) e._locale = code;
    if (src.n !== dst.n) report(`${code} book/${f}`, `节号是 ${dst.n}，原文 ${src.n}`);
    // 节标题和导读：条目之外，节首那几行也得翻。节标题还要跟 README 目录里那一份一致
    for (const w of STRUCT.compareSection(src, dst, `${code} book/${f}`, toc[f.replace(/\.md$/, '')])) problems.push(w);
    if (src.entries.length !== dst.entries.length)
      report(`${code} book/${f}`, `条目数 ${dst.entries.length}，原文 ${src.entries.length}`);
    for (let i = 0; i < Math.min(src.entries.length, dst.entries.length); i++)
      for (const w of STRUCT.compare(src.entries[i], dst.entries[i], `${code} book/${f} 第 ${src.entries[i].n} 条`))
        problems.push(w);
    // ⑦ 回总目录那行要指向本语言的目录
    const first = read(dstPath).split('\n')[0];
    if (!/^\[.*\]\((?:\.\.\/|\.\/)?README\.md\)/.test(first))
      report(`${code} book/${f}`, `第一行「${first.slice(0, 40)}」不是回本语言目录的链接`);
  }
  const repoDir = (L.contentDir ? L.contentDir + '/' : '') || './';
  const all = existsSync(resolve(ROOT, contentPath(code, 'README.md')));
  console.log(`${L.name}（${repoDir}，页面上 ${L.dir || '/' }）：正文 ${have.length}/${files.length} 节已翻${all ? '' : '，README 还没有'}`);
}

if (problems.length){
  console.log(`\n${problems.length} 处对不上：`);
  for (const p of problems.slice(0, 200)) console.log('  ' + p);
  if (problems.length > 200) console.log(`  …还有 ${problems.length - 200} 处`);
  if (WARN){ console.log('\n（--warnings：只提示，不判失败）'); process.exit(0); }
  process.exit(1);
}
console.log('译文检查通过');
