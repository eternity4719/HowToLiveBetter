// 渲染一致性检查：跑在 Astro 构建产物（web/dist）上，确认爬虫看到的和读者看到的是同一本书。
//
//   npm run verify
//
// 查三件事：
// ① 全文在不在：每条的标题/成本/说人话/收益/备注/来源， normalized 之后都能在 HTML 里找到。
//    normalized = 去标签、解转义、去 **、去 \ 转义、小写、压空白——和页面里 e.hay 一个算法，
//    搜得到 e.hay 的词，爬虫就看得到这条。
// ② 结构对不对：节块数、卡片数、计数器、侧栏目录、术语表；xref 和目录的 data-keys/data-go
//    指到的 id 都在同一页里；hydration 要用的钩子（data-ssg、__CORPUS__、.t/.cost/…）都在。
// ③ 没填完的占位符：去掉 site-config 和语料两段 script 之后，不该再有 {{word}}。
//
// 任何一条不过就退出码 1。SEO 的正确性不能靠「我抄对了」，得靠这个。
import { readFileSync, existsSync } from 'node:fs';
import { locale, readRepo } from './site';
import { loadLocale, hasReadme } from './load';
import { LOCALES } from './site';
import { createCtx, renderText, splitSrc } from './render';
import { buildGloss } from './parse';
import { fill } from '../../../tools/site/build.mjs';

const DIST = new URL('../../dist/', import.meta.url);

let bad = 0;
const fail = (code, what, detail) => { bad++; console.log(`  ✗ ${code} ${what}${detail ? '：' + detail : ''}`); };

const norm = s => String(s)
  .replace(/<(https?:\/\/[^>\s]+)>/g, '$1') // <https://…> 是正文里裹链接的写法（页面里 URL_RE 认它），先还原再去标签，不然链接整个被当成标签吃掉
  .replace(/<[^>]*>/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/\*\*/g, '').replace(/\\([*_])/g, '$1').replace(/[;；]/g, ' ').toLowerCase().replace(/\s+/g, ' ').trim();
// 来源栏的裸 URL 渲染时显示文本会去掉 https:// 开头和末尾的 /（页面里 mkLink 那两行正则），
// href 属性检查侧又看不到（标签都去掉了）。所以字段侧先做同样的剥离再比。
const normField = s => norm(s).replace(/https?:\/\//g, '').replace(/\/(?=\s|$)/g, '');

for (const meta of LOCALES) {
  if (!hasReadme(meta.code)) { console.log(`  - ${meta.code}：README 还没有，跳过`); continue; }
  const cfg = locale(meta.code);
  const data = loadLocale(meta.code, cfg);
  const p = new URL(`${meta.dir}index.html`, DIST);
  if (!existsSync(p)) { fail(meta.code, '构建产物缺失', `${meta.dir}index.html 不在 web/dist 里，先跑 npm run build`); continue; }
  const html = readFileSync(p, 'utf8');
  const total = data.sections.reduce((n, s) => n + s.entries.length, 0);

  // 钩子（这两处看整页，含 script）
  if (!html.includes('data-ssg="1"')) fail(meta.code, 'hydration 钩子', '没有 data-ssg="1"，浏览器会走老路重建，预渲染白做了');
  if (!html.includes('window.__CORPUS__=')) fail(meta.code, '语料', '没有内联 __CORPUS__，hydration 解析不出 SECS/ITEMS');

  // 下面全看正文区：script 里有客户端模板字符串（`<h3 class="t"></h3>` 这种），
  // 数个数、找文字都得先去掉，不然模板字符串冒充卡片、语料 JSON 冒充正文——
  // 查的就是「爬虫不执行 JS 能看到什么」，script 里的一律不算。
  const content = html.replace(/<script[\s\S]*?<\/script>/g, '');
  if (!html.includes(`<b id="cnt">${total}</b>`)) fail(meta.code, '计数', `cnt 不是 ${total}`);
  if (!html.includes(`<span id="tot">${total}</span>`)) fail(meta.code, '总数', `tot 不是 ${total}`);

  // 结构数
  const blocks = (content.match(/<section class="sec-block"/g) || []).length;
  if (blocks !== data.sections.length) fail(meta.code, '节块数', `HTML 里 ${blocks}，正文 ${data.sections.length}`);
  const cards = (content.match(/<article class="card"/g) || []).length;
  if (cards !== total) fail(meta.code, '卡片数', `HTML 里 ${cards}，正文 ${total}`);

  // hydration 要用的子节点：每张卡片 .t/.cost/.human/.gain/.note/.src .body/.cnt 缺一个，
  // 浏览器索引到 undefined，apply() 就崩。用数量对：6 类各 total 个（cnt 在 summary 里）。
  for (const [sel, re, want] of [
    ['.t', /class="t"/g, total], ['.v cost', /class="v cost"/g, total], ['.human', /class="human"/g, total],
    ['.v gain', /class="v gain"/g, total], ['.v note', /class="v note"/g, total], ['.src .body', /class="body"/g, total],
    ['summary .cnt', /class="cnt"/g, total], ['toc a[data-go]', /data-go="/g, total],
  ]) {
    const n = (content.match(re) || []).length;
    if (n !== want) fail(meta.code, `hydration 节点 ${sel}`, `HTML 里 ${n}，要 ${want}`);
  }

  // id 与引用：卡片 id、节 id、目录 data-go、xref data-keys，四者互相指得上
  const ids = new Set([...content.matchAll(/ id="([^"]+)"/g)].map(m => m[1]));
  for (const s of data.sections) {
    if (!ids.has(`sec-${s.n}`)) { fail(meta.code, `节锚点 sec-${s.n}`, '没有这个 id，目录跳不过去'); break; }
  }
  let idBad = 0;
  for (const s of data.sections) for (const e of s.entries) {
    if (!ids.has(`e-${e.sec}-${e.n}`)) { if (!idBad++) fail(meta.code, '卡片 id', `e-${e.sec}-${e.n} 不在 HTML 里（只报第一处）`); }
  }
  const goBad = [...content.matchAll(/data-go="([^"]+)"/g)].map(m => m[1]).filter(k => !ids.has(`e-${k}`));
  if (goBad.length) fail(meta.code, '目录指路', `${goBad.length} 处 data-go 指到不存在的卡片：${goBad.slice(0, 3).join('、')}`);
  const keyBad = [...content.matchAll(/data-keys="([^"]+)"/g)].flatMap(m => m[1].split(','))
    .filter(k => !(k.startsWith('s') ? ids.has(`sec-${k.slice(1)}`) : ids.has(`e-${k}`)));
  if (keyBad.length) fail(meta.code, 'xref 指路', `${keyBad.length} 处 data-keys 悬空：${keyBad.slice(0, 3).join('、')}`);

  // 全文：证明 raw → render → page 整条链不断。分两截查：
  // ① render(field) ⊆ page：渲染出来的东西都进了页面（装配没错）。
  // ② raw 的词 ⊆ render(field)：原文的词渲染时都没丢（渲染没错）。
  // 合起来就是「原文每个词都在页面里」，这正是 SEO 要的保证。
  // ② 的词按渲染规则切：md 链接取文字+显示地址、裸 URL 取显示地址（去 scheme 和末尾 /）、
  // ** 和 \ 转义还原；来源栏先按 ;； 切分（渲染时 splitSrc 就是这么拆的，括号里的分号除外，
  // 这里多切了也无妨——切出来的词一定更短，一定还在）。
  const displayUrl = u => u.replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/[).,;:，。；：、]+$/, '').toLowerCase();
  // 原文取词。urlsLast（来源栏）时裸链接会被攒到最后，地址和它前后的文字是分开的三块，
  // 取词时两边都补空格，不然会造出“前文+地址”粘在一起的词——渲染出来它们根本不挨着。
  // 行内链接（[文字](地址)）不受影响：它永远原地渲染，只取文字。
  const tokensOf = (raw, urlsLast) => String(raw)
    .replace(/<(https?:\/\/[^>\s]+)>/g, urlsLast ? ' $1 ' : '$1 ')
    .replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, '$1 ')
    .replace(/\*\*((?:\\\*|[^*\n])+)\*\*/g, '$1')
    .replace(/\\([*_])/g, '$1')
    .replace(/<?https?:\/\/[A-Za-z0-9\-._~:\/?#\[\]@!$&'()*+,=%]+>?/g, m => (urlsLast ? ' ' : '') + displayUrl(m.replace(/^<|>$/g, '')) + ' ')
    .toLowerCase().split(/\s+/).map(t => t.trim()).filter(t => t.length >= 4);
  const norm0 = s => String(s).replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .toLowerCase().replace(/\s+/g, ' ').trim();
  const strings = Object.fromEntries(Object.entries(cfg.strings).map(([k, v]) => [k, fill(v, JSON.parse(readRepo('tools/site/stats.json')))]));
  const rctx = createCtx(cfg, strings, data.sections, buildGloss(data.readme, cfg));
  const pageText = norm0(content);
  let miss = 0;
  const fieldsOf = e => [['标题', e.title], ['成本', e.cost], ['说人话', e.human], ['收益', e.gain], ['备注', e.note], ['来源', e.src]];
  for (const s of data.sections) for (const e of s.entries) {
    // CUR_SEC 按卡片所属的节走（页面里 renderCard 第一行干的就是这个）：
    // 不设的话「本节第 X 条」在检查侧解析不出来，渲染侧却链上了，两边对不上。
    rctx.curSec = e.sec;
    // 来源栏按页面真正的 splitSrc 切（括号里的分号不算分隔符），别的栏整段取词。
    // 自己另写一套切法，切口和页面不一样，渲染出来就对不上——之前这么错过。
    const jobs = [];
    for (const [name, f] of fieldsOf(e)) {
      if (name === '来源') for (const part of splitSrc(rctx, String(f))) jobs.push([name, part]);
      else jobs.push([name, f]);
    }
    for (const [name, f] of jobs) {
      const rendered = norm0(renderText(rctx, f, [], true, name === '来源'));
      if (rendered && !pageText.includes(rendered)) { if (miss++ < 3) fail(meta.code, `第 ${s.n} 节第 ${e.n} 条${name}没进页面`, JSON.stringify(rendered.slice(0, 50))); continue; }
      for (const tok of tokensOf(f, name === '来源')) {
        if (!rendered.includes(tok)) {
          if (miss++ < 3) {
            fail(meta.code, `第 ${s.n} 节第 ${e.n} 条${name}丢词`, JSON.stringify(tok));
          }
          break;
        }
      }
    }
    if (miss > 10) break;
  }
  if (!miss) console.log(`  ✓ ${meta.code}：${data.sections.length} 节 ${total} 条，原文每个词都在 HTML 里`);

  // 占位符：site-config 和语料两段 script 里允许 {{}}（那是运行时变量），别处不允许
  const shell = content.replace(/<script>window\.__CORPUS__=.*?<\/script>/s, '').replace(/<script id="site-config".*?<\/script>/s, '');
  const left = [...shell.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]);
  if (left.length) fail(meta.code, '没填完的占位符', [...new Set(left)].slice(0, 5).join('、'));
}

console.log();
if (bad) { console.log(`渲染检查 ${bad} 处不过。先修 web/src/lib/render.ts，再重跑 npm run build。`); process.exit(1); }
console.log('渲染一致：构建产物里有全文，hydration 钩子齐，引用不悬空。');
void readRepo;
