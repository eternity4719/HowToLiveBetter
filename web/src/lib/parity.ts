// 校验：Astro 这边解析出来的结构，和检索页现在用的那份一模一样。
//
//   npm run check
//
// 为什么必须有这个：web/src/lib/parse.ts 是从 page.template.html 里搬过来的副本。
// 两份各自演化，迟早会对不上；对不上时，爬虫看到的和读者看到的就不是一本书了。
// 这个脚本不靠「我抄对了」，它把原版 parseReadme 从模板里抠出来、在同一份
// markdown 上跑一遍，两边逐字段比。任何一条对不上就退出码 1。
//
// 只比页面真正用来渲染和筛选的字段。原文不用比：两边的语料读的是同一个文件。
import { readFileSync } from 'node:fs';
import { LOCALES, locale, readRepo, readmePath, at, repoPath } from './site';
import { parseReadme, buildGloss } from './parse';
import { loadLocale, hasReadme } from './load';
import { existsSync } from 'node:fs';

/** 把模板里原版 parseReadme 的源码抠出来，组装成一个能直接调用的函数。
    原版还依赖几个定义在函数外面的量（SITE、COST_W、fieldRe、RE_COST…RE_NOTE、RE_DISPUTE），
    那几行也一起抠进来，不然会报 RE_COST is not defined。 */
function originalParser(templateSrc, cfg) {
  // 原版还依赖几个定义在函数外面的东西：fieldRe 和 RE_COST…RE_NOTE、RE_DISPUTE。
  // 只抠这几行声明（按行匹配，不整段切——整段切会把用 location 的 UI 代码带进来）。
  const decl = [];
  for (const line of templateSrc.split('\n')) {
    if (/^\/\/ 条目字段名各语言不同/.test(line)) continue;               // 只是注释
    if (/^const fieldRe = /.test(line)) decl.push(line);
    else if (/^const RE_DISPUTE = /.test(line)) decl.push(line);
    else if (/^const RE_COST = fieldRe/.test(line)) decl.push(line);
    else if (/^ {6}RE_GRADE = fieldRe/.test(line)) decl.push('  ' + line.trim());
  }
  if (decl.length < 4) throw new Error(`page.template.html 里只抠到 ${decl.length} 行声明，模板结构可能变了`);
  const fn = templateSrc.slice(
    templateSrc.indexOf('function parseReadme(md){'),
    endOfFunction(templateSrc, templateSrc.indexOf('function parseReadme(md){')),
  );
  const src = decl.join('\n') + '\n' + fn;

  // 原版读的是页面里的全局量：SITE 和 COST_W。这里按 locale 配置造一份同名同形状的，
  // 被抠出来的那几行代码一个字不改。
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const SITE = {
    fields: cfg.fields, dispute: cfg.dispute, todo: cfg.todo,
    urlTrim: cfg.urlTrim, xref: cfg.xref,
  };
  const COST_W = { money: { '0': 0, '少': 1, '多': 2 }, time: { '少': 0, '中': 1, '多': 2 }, will: { '否': 0, '些': 1, '是': 2 } };
  void esc;
  return new Function('SITE', 'COST_W', `${src}; return parseReadme;`)(SITE, COST_W);
}

/** 从函数体的第一个 { 起，配平括号找到结尾的下标 */
function endOfFunction(src, start) {
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return i + 1; }
  }
  return -1;
}

const FIELDS = ['sec', 'n', 'title', 'cost', 'human', 'gain', 'grade', 'src', 'note',
  'money', 'time', 'will', 'level', 'lens', 'dispute', 'todo', 'cs', 'ratio', 'hay'];

let bad = 0;
const report = (code, what, detail) => {
  bad++;
  console.log(`  ✗ ${code} ${what}${detail ? '：' + detail : ''}`);
};

const templateSrc = readRepo('tools/site/page.template.html');
const live = LOCALES.filter(l => hasReadme(l.code));

console.log(`解析一致性校验：${live.map(l => l.code).join('、')}\n`);

for (const meta of live) {
  const cfg = locale(meta.code);
  const data = loadLocale(meta.code, cfg);
  // 运行时真正的输入是正文文件拼起来（README 只给术语表，不进节解析）——
  // 按这个比，loadLocale 里拼什么这里就拼什么，两边入口必须一致。
  const md = data.files.map(f => f.text).join('\n\n');

  let want;
  try {
    want = originalParser(templateSrc, cfg)(md);
  } catch (err) {
    console.log(`  ! ${meta.code} 原版 parseReadme 跑不起来：${err.message}`);
    report(meta.code, '原版解析', err.message);
    continue;
  }

  const got = parseReadme(md, cfg);

  // README 里有一行 "### 5. ……" 的盐的例子：它要是哪天进了节解析，两边会一起多出
  // 一节孤儿条目。所以再断言一次「README 加进来也不多出东西」，多出来就说明入口
  // 又对不上了，而不是内容真变了。
  const withReadme = parseReadme([data.readme, ...data.files.map(f => f.text)].join('\n\n'), cfg);
  if (withReadme.length !== got.length || withReadme.reduce((n, s) => n + s.entries.length, 0) !== got.reduce((n, s) => n + s.entries.length, 0))
    report(meta.code, 'README 拼入', 'README 拼进来之后节数或条数变了：入口没对齐，孤儿条目漏进了某一边');

  // 术语表也比：预渲染的 abbr 和运行时 termify 用的必须是同一份行表。
  // 原版 parseGlossary 带副作用（写 GLOSS_RE/GLOSS_BY），这里只取它的返回值比行。
  try {
    const glossSrc = templateSrc.slice(templateSrc.indexOf('function parseGlossary(md){'), endOfFunction(templateSrc, templateSrc.indexOf('function parseGlossary(md){')));
    const glossFn = new Function('SITE', `${glossSrc}; return parseGlossary;`)({ glossary: cfg.glossary, glossarySep: cfg.glossarySep, glossarySplit: cfg.glossarySplit });
    const wantGloss = glossFn(data.readme);
    const gotGloss = buildGloss(data.readme, cfg).rows;
    if (wantGloss.length !== gotGloss.length) report(meta.code, '术语表行数', `新 ${gotGloss.length} vs 原 ${wantGloss.length}`);
    else for (let i = 0; i < wantGloss.length; i++) {
      const a = wantGloss[i], b = gotGloss[i];
      if (a.term !== b.term || a.meaning !== b.meaning || !!a.latin !== !!b.latin) { report(meta.code, `术语表第 ${i + 1} 行`, `${a.term} vs ${b.term}`); break; }
    }
  } catch (err) {
    report(meta.code, '术语表解析', err.message);
  }

  if (got.length !== want.length) {
    report(meta.code, '节数', `新 ${got.length} vs 原 ${want.length}`);
    continue;
  }
  let n = 0;
  for (let i = 0; i < want.length; i++) {
    const a = want[i], b = got[i];
    if (a.n !== b.n || a.title !== b.title) { report(meta.code, `第 ${i + 1} 节`, `${a.n}. ${a.title} vs ${b.n}. ${b.title}`); continue; }
    if (a.intro.join('\n') !== b.intro.join('\n')) report(meta.code, `第 ${a.n} 节导读`);
    if (a.entries.length !== b.entries.length) { report(meta.code, `第 ${a.n} 节条目数`, `新 ${b.entries.length} vs 原 ${a.entries.length}`); continue; }
    for (let j = 0; j < a.entries.length; j++) {
      const x = a.entries[j], y = b.entries[j];
      for (const k of FIELDS) {
        if (String(x[k]) !== String(y[k])) {
          report(meta.code, `第 ${a.n} 节第 ${x.n} 条的 ${k}`, `原 ${JSON.stringify(String(x[k]).slice(0, 60))} vs 新 ${JSON.stringify(String(y[k]).slice(0, 60))}`);
          break;
        }
      }
      n++;
    }
  }
  if (!bad) console.log(`  ✓ ${meta.code}：${got.length} 节 ${n} 条，19 个字段逐条一致`);
}

console.log();
if (bad) {
  console.log(`解析对不上 ${bad} 处。web/src/lib/parse.ts 和 page.template.html 的 parseReadme 必须同时改。`);
  process.exit(1);
}
console.log('解析一致：站内渲染和构建时预渲染看到的是同一本书。');
void readmePath; void at; void repoPath; void existsSync; void readFileSync;
