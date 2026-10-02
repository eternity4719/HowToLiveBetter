// 把译好的块按块号拼回一节正文，再跑结构检查。
//
//   node tools/i18n/join.mjs book/01-不要早死.md --locale en
//   node tools/i18n/join.mjs --all --locale vi
//
// 块在 .i18n/<语言>/<节名>/partNN.md，翻译完一块就往那儿放一个文件。
// 少一块就少合一块（进度能看出来），但 check.mjs 会因为条目数对不上而失败。
//
// 拼之前先逐块对一遍原文（条号、字段、成本标签、数字、链接），有一块不对就在这儿
// 报出来，不用等拼完才发现第 31 条少了一句。

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALES, SOURCE, strings, contentPath } from '../site/locales.mjs';
import { splitSection } from './split.mjs';
import { STRUCT, entrySkeleton } from './structure.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = p => readFileSync(resolve(ROOT, p), 'utf8').replace(/\r\n/g, '\n');

const argv = process.argv.slice(2);
const li = argv.indexOf('--locale');
const locale = li < 0 ? 'en' : argv[li + 1];
const L = LOCALES.find(x => x.code === locale);
if (!L) { console.error(`--locale 得是 ${LOCALES.map(x => x.code).join(' / ')} 里的一项`); process.exit(2); }

const files = [];
if (argv.includes('--all')) {
  const dir = (SOURCE.contentDir ? SOURCE.contentDir + '/' : '') + 'book/';
  for (const f of readdirSync(resolve(ROOT, dir))) if (f.endsWith('.md')) files.push(dir + f);
} else {
  for (const a of argv) if (a.endsWith('.md')) files.push(a);
}
if (!files.length) { console.error('给一个 book/*.md 的路径，或者加 --all'); process.exit(2); }

// ---------------------------------------------------------------- 逐节拼
let bad = 0, done = 0;
for (const srcPath of files){
  const name = basename(srcPath);
  const dir = `.i18n/${locale}/${name.replace(/\.md$/, '')}`;
  if (!existsSync(resolve(ROOT, dir))) { console.log(`跳过 ${name}：还没切块`); continue; }

  const src = splitSection(read(srcPath));
  const parts = readdirSync(resolve(ROOT, dir)).filter(f => /^part\d+\.md$/.test(f)).sort();
  if (parts.length !== src.blocks.length){
    bad++;
    console.error(`${locale} ${name}：切了 ${src.blocks.length} 块，译文只有 ${parts.length} 块，缺 ${src.blocks.length - parts.length} 块`);
    continue;
  }

  // 块对块地校：第 k 块对第 k 块，中途插入或漏译都会在这里露出来
  let trouble = 0;
  const pieces = [];
  for (let k = 0; k < parts.length; k++){
    const want = src.blocks[k].flat().join('\n');   // blocks[k] 是「这一块有哪几条」
    const got = read(`${dir}/${parts[k]}`);
    const a = entrySkeleton(want, strings(SOURCE.code));
    const b = entrySkeleton(got, strings(locale));
    for (const e of b.entries) e._locale = locale;   // 字段名按译文那门语言认
    // 第 0 块自带节首，节号/标题/导读在这一块里校（译文块是整节的一小块，不是整节）。
    // 拿整节那一份（src + 第 0 块合起来）当基准：want 只是条目，节首在 want 里没有。
    if (k === 0 && /^#{1,2} \d+\. /m.test(got)){
      const secA = entrySkeleton(src.head.join('\n') + '\n' + want, strings(SOURCE.code));
      for (const w of STRUCT.compareSection(secA, b, `${locale} ${name} 块 0 节首`)){ bad++; trouble++; console.error('  ' + w); }
    }
    for (const [i, x] of a.entries.entries()){
      const y = b.entries[i];
      const tag = `${name} 块 ${k} 第 ${x.n} 条`;
      if (!y){ bad++; trouble++; console.error(`  ${tag}：译文缺这一条`); continue; }
      for (const w of STRUCT.compare(x, y, tag)){ bad++; trouble++; console.error('  ' + w); }
    }
    if (b.entries.length !== a.entries.length){
      bad++; trouble++;
      console.error(`  ${dir}/${parts[k]}：${b.entries.length} 条，原文这块 ${a.entries.length} 条`);
    }
    // 节首（回目录那行 + 「# N. 节名」 + 导读）归第 0 块管，译文该翻的就在第 0 块里。
    //
    // 这里只判「有没有」，不判「翻没翻」——翻没翻是 check.mjs 的事（它拿节标题跟原文
    // 逐字比，一模一样就是没翻）。曾经在这里反过来做：拿原文节首的每一行去译文块里
    // 逐行找，对上了就把译文那份节首去掉、再把中文节首拼上去。结果是译文里翻好的节名
    // 被当成「多出来的」删掉，中文那份留着——en 和 vi 一半的节标题是中文的，
    // 有的还多出一份（中文在前、翻好的在后），页面上那一节连同条目渲染两遍。
    // 拼的时候不该拿原文去覆盖译文：原文那一份在 book/ 里摆着，译文自己带节首才对。
    let body = got;
    if (k === 0 && src.head.length && !/^#{1,2} \d+\. /m.test(got)){
      // 第 0 块没带节首（少数块是这样切的）：补上，但补的是中文原文那份，所以报出来。
      // 不报的话 check.mjs 只会说「节标题跟原文一样」，看不出是这里补上去的。
      body = src.head.join('\n') + '\n' + got;
      console.error(`  ${name} 块 0：译文块里没有节首，先补了中文原文那份——节名和导读得在 .i18n/${locale}/${name.replace(/\.md$/, '')}/part00.md 里翻好`);
    }
    pieces.push(body);
  }
  // 写进仓库里的译文目录：contentPath，不是 L.dir。L.dir 是页面上线上的地址，
  // 英文那份是空串（页面在根上），拿它拼就是 book/ —— 中文原文那一份。
  const dst = contentPath(locale, `book/${name}`);
  if (trouble) { console.error(`${locale} ${name}：${trouble} 处对不上，没写进 ${dst}`); continue; }

  let out = pieces.join('\n');
  const tail = `${dir}/tail.txt`;
  if (existsSync(resolve(ROOT, tail))) out += '\n' + read(tail);
  mkdirSync(dirname(resolve(ROOT, dst)), { recursive: true });
  writeFileSync(resolve(ROOT, dst), out);
  done++;
  console.log(`${locale} book/${name}：${parts.length} 块合好，${src.count} 条，${((out.length / 1024) | 0)}K`);
}
console.log(`\n合好 ${done} 节，问题 ${bad} 处`);
process.exit(bad ? 1 : 0);