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
    // 译文块里如果又带了一遍节首（回目录那行 + 「# N. 节名」+ 导读），拼出来就是两份，
    // 页面上那一节连同它的条目渲染两遍——en 和 vi 五个文件都中过（2026-09-30 迁移到
    // Astro 时预渲染和运行时解析出来的节数对不上，查出来的）。
    //
    // 判据按内容，不按行数：节首的每一行都逐行对上（导读在译文里可能已经翻过，
    // 对不上就整块留着，宁可多渲染一遍导读也不能把译文正文吃掉）。
    let body = got;
    if (k === 0 && src.head.length){
      const headLines = src.head.join('\n').split('\n').map(l => l.trim()).filter(Boolean);
      const bodyLines = got.split('\n');
      let consumed = 0;
      for (const hl of headLines){
        const at2 = bodyLines.findIndex((l, i) => i >= consumed && l.trim() === hl);
        if (at2 < 0) { consumed = -1; break; }   // 对不上：整块保留
        consumed = at2 + 1;
      }
      if (consumed > 0 && /^#{1,2} \d+\. /.test(headLines.find(l => /^#{1,2} \d+\. /.test(l)) || '')){
        body = bodyLines.slice(consumed).join('\n').replace(/^\n+/, '');
        console.log(`  ${name} 块 0：译文里带了节首（${headLines.length} 行），已去掉，之前会重复渲染一次`);
      }
    }
    pieces.push(k === 0 ? src.head.join('\n') + '\n' + body : body);
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