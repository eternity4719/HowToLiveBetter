// 生成检索页（en/index.html、zh/index.html、vi/index.html）、根目录跳语言的小页、
// sitemap.xml 和 robots.txt。没翻完的语言这次不生成（眼下是 vi），页面上也不列它，
// 免得给读者一个点进去是 404 的入口。
//
//   node tools/site/build.mjs            # 生成
//   node tools/site/build.mjs --check    # 只比对，有一处对不上就退出码 1（CI 用）
//
// 页面本体在 tools/site/page.template.html，界面文案在 tools/site/locales/<code>.json，
// 目录和正文在各自语言下（en/README.md + en/book/、仓库根的 README.md + book/、vi/…）。
// 站点地址和仓库地址在 tools/site/site.json，别在别处再抄一遍。
// 生成物入库，Pages 直接发；改页面改模板和字典，别改生成出来的那几份。
//
// 有两类文案，别弄混：
// · 界面文案（strings）—— 按钮、标签、报错，按语言写。
// · 正文标记 —— 条目字段名「- 成本：」、成本标签注释、「第 X 条」指路的正则、争议和待核实
//   的开头。这些在 locale.json 顶层，不在 strings 里：译文按它们写，但取值（钱=0|少|多、
//   大|中|小、死亡率|金钱|时间|自由）三种语言共用一份，地址栏和分享出去的链接才对得上。
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
// 仓库根。直接跑 node 时按文件位置算；被 Astro 构建打包时 import.meta.url 会指到
// 构建缓存里，读到的全是空——这时按环境变量 HOWTOLIVEBETTER_ROOT 来，
// web/astro.config.mjs 会在构建前把它指到仓库根（直接跑 node 时不用设）。
const ROOT = process.env.HOWTOLIVEBETTER_ROOT ? resolve(process.env.HOWTOLIVEBETTER_ROOT) : resolve(HERE, '../..');
const CHECK = process.argv.includes('--check');
const read = p => readFileSync(resolve(ROOT, p), 'utf8').replace(/\r\n/g, '\n');

// 目录和正文位置。zh 指仓库根（中文是正文源头，不能搬走），en/vi 指各自的子目录。
export const LOCALES = JSON.parse(read('tools/site/locales.json'));
export const DEFAULT_LOCALE = LOCALES.find(l => l.default)?.code ?? LOCALES[0].code;

// 正则里的元字符要转义，不然字段名里的括号和问号会被当成语法
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ---------------------------------------------------------------- 键的收集
// 静态键从模板里扫（data-i18n / T('x')），动态键在这里列全：拼出来的键扫不到，
// 少一个就是页面上一个键名（tools/site/build.mjs 会拦，页面本身不会崩）。
const DYNAMIC_KEYS = [
  'ratio.top', 'ratio.high', 'ratio.mid',                    // T('ratio.' + 档位)
  'gain.large', 'gain.medium', 'gain.small',                 // T('gain.' + 收益量级)
  'cost.money.0', 'cost.money.few', 'cost.money.much',
  'cost.time.few', 'cost.time.mid', 'cost.time.much',
  'cost.will.no', 'cost.will.some', 'cost.will.lots',
];

export function requiredKeys(template) {
  const keys = new Set([
    ...[...template.matchAll(/data-i18n(?:-content|-attr|-attr2)?="([\w.]+)"/g)].map(m => m[1]),
    // T('cost.' + dim + '.' + k) 这种拼出来的键扫不到前缀，跳过，完整的键在 DYNAMIC_KEYS 里；
    // 'key' 是 T() 自己漏译时回显的那句，不是键
    ...[...template.matchAll(/\bT\('([\w.]+)'/g)].map(m => m[1]).filter(k => !k.endsWith('.') && k !== 'key'),
  ]);
  for (const k of DYNAMIC_KEYS) keys.add(k);
  return [...keys].sort();
}

// ---------------------------------------------------------------- 占位符
// strings 里可以写 {{entries}}、{{sections}} 这类占位符，取自 tools/site/stats.json，在构建时填。
// 同一套尖括号也用来写 T('key', {n}) 的运行时变量（{{n}}、{{sec}}…），那些留到浏览器里替换，
// 所以只换 stats.json 里有的那几个。填完还有没被替换的，就是漏了变量，最后统一查一遍。
export function fill(text, stats) {
  if (Array.isArray(text)) return text.map(t => fill(t, stats));   // meta.about 是个词表
  return String(text).replace(/\{\{(\w+)\}\}/g, (m, k) => (k in stats ? stats[k] : m));
}

// ---------------------------------------------------------------- 标签扫描
// 只认开始标签，够用了：模板里 data-i18n 那批元素没有一个套着另一个 data-i18n 元素，
// 有的话也不会互相吃内容（内层先替，外层再按剩下的空内容替）。
const TOKENS = /<[^>]*>|[^<]+/g;

function applyMarkup(html, strings, blocks) {
  const toks = html.match(TOKENS) ?? [];
  // 先把 data-i18n-block 的范围整块换掉：位置变了，后面按位置找就全错了
  const replaced = [];
  for (let i = 0; i < toks.length; i++){
    const open = toks[i];
    const m = /^<([a-z0-9]+)\b[^>]*\bdata-i18n-block="(\w+)"[^>]*>/i.exec(open);
    if (!m) continue;
    const [, tag, key] = m;
    if (!(key in blocks)) throw new Error(`模板里 data-i18n-block="${key}"，构建没有给这个块的内容`);
    const depth = countClose(toks, i, tag);
    replaced.push({ from: i, to: depth, text: blocks[key] });
  }
  for (let r = replaced.length - 1; r >= 0; r--){
    const { from, to, text } = replaced[r];
    toks.splice(from + 1, to - from - 1, text);   // 只换内文，外面的开闭标签留着
  }

  for (let i = 0; i < toks.length; i++){
    const tok = toks[i];
    if (!tok.startsWith('<')) continue;
    const m = /^<([a-z0-9]+)\b([^>]*)>/i.exec(tok);
    if (!m) continue;
    const [, tag, attrs] = m;
    const i18n = /\bdata-i18n="([\w.]+)"/.exec(attrs);
    const content = /\bdata-i18n-content="([\w.]+)"/.exec(attrs);
    if (attrs.includes('data-i18n-attr') || attrs.includes('data-i18n-attr2')){
      // 「placeholder:key;aria-label:key2」写成一段，改同名属性；template 里给的是空串
      for (const [attrName, raw] of [[/data-i18n-attr="([^"]+)"/, attrs], [/data-i18n-attr2="([^"]+)"/, attrs]]){
        const am = attrName.exec(attrs);
        if (!am) continue;
        let tag2 = tok;
        for (const pair of am[1].split(';')){
          const [name, key] = pair.split(':');
          const value = strings[key];
          if (value === undefined) throw new Error(`字典里缺 ${key}`);
          const re = new RegExp(`(\\s${name}=")[^"]*(")`);
          if (!re.test(tag2)) throw new Error(`模板里 ${name}="${key}" 这处属性没写出来`);
          tag2 = tag2.replace(re, (_, a, b) => a + escAttr(value) + b);
        }
        toks[i] = tag2;
      }
    }
    if (content){
      // <meta ... content="…">：换的是这个 content，不是别处的。同一个标签只会有一个 content
      const value = strings[content[1]];
      if (value === undefined) throw new Error(`字典里缺 ${content[1]}`);
      if (!/\bcontent="[^"]*"/.test(toks[i])) throw new Error(`模板里 data-i18n-content="${content[1]}" 这处没有 content 属性`);
      toks[i] = toks[i].replace(/\bcontent="[^"]*"/, `content="${escAttr(value)}"`);
    }
    if (i18n){
      const value = strings[i18n[1]];
      if (value === undefined) throw new Error(`字典里缺 ${i18n[1]}`);
      const end = countClose(toks, i, tag);
      toks.splice(i + 1, end - i - 1, value);
      i++;
    }
  }
  return toks.join('');
}
const escAttr = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
// 拼仓库根相对路径。zh 的 contentDir 是空串，直接拼会得到 '/book/x.md'，
// resolve 把它当绝对路径，就跑到文件系统根上找去了。
const at = (L, p) => (L.contentDir ? L.contentDir + '/' + p : p);
const escText = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// 从开始标签 i 起数它的配对结束标签，返回结束标签的位置
function countClose(toks, i, tag) {
  const re = new RegExp(`^</${tag}\\s*>$`, 'i');
  let depth = 0;
  for (let j = i + 1; j < toks.length; j++){
    const t = toks[j];
    if (t.startsWith('</')){
      if (re.test(t)){ if (depth === 0) return j; depth--; }
      else if (new RegExp(`^</${tag}\\b`, 'i').test(t)) depth--;
    } else if (new RegExp(`^<${tag}\\b`, 'i').test(t)) depth++;
  }
  throw new Error(`<${tag}> 没有配对的结束标签`);
}

// ---------------------------------------------------------------- 正文清单
// README 的「目录」一节就是节清单，noscript 的兜底列表由它生成：多一处要维护的地方，
// 中文那版就是从这一节生成的，两边永远一致。
/**
 * 目录那一节。节标题和表头里「长文」那一格的叫法各语言不同（目录 / Contents / Mục lục，
 * 长文 / Long-form / Bài dài），都从 locale 配置里来，不在这里写死。
 * 用配置而不是英文，是因为同一份代码要同时读三份 README。
 */
export function readContents(md, S) {
  const lines = md.split('\n');
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const at = lines.findIndex(l => new RegExp('^##\\s+' + esc(S.contents)).test(l));
  if (at < 0) throw new Error(`README 里找不到「${S.contents}」那一节`);
  const rest = lines.slice(at + 1);
  const end = rest.findIndex(l => /^##\s/.test(l));
  const body = end < 0 ? rest : rest.slice(0, end);
  // 目录行尾那句「长文见 [docs/x.md](docs/x.md)。」在页头那行已经单独链了，目录里这句摘掉
  const tail = new RegExp('\\s*' + esc(S.longformSee) + '\\s*\\[[^\\]]+\\]\\([^)]+\\)[^ ]*');
  const out = [];
  for (const line of body){
    const m = /^\s*\d+\.\s+\[([^\]]+)\]\(([^)]+)\)\s*[：:,]\s*(.*)$/.exec(line) ?? /^\s*\d+\.\s+\[([^\]]+)\]\(([^)]+)\)\s*(.*)$/.exec(line);
    if (!m) continue;
    out.push({ n: out.length + 1, title: m[1], path: m[2], blurb: m[3].replace(tail, '').trim() });
  }
  return out;
}

// 页头那行长文：README 顶部导航表里「长文」那一格，EPUB 和 PDF 也从同一处扒
export function readLongform(md, S) {
  const cell = new RegExp(`<b>${S.longformLabel}<\\/b><\\/td><td[^>]*>([\\s\\S]*?)<\\/td>`).exec(md);
  if (!cell) throw new Error(`README 顶部导航表里找不到「${S.longformLabel}」那一格`);
  // 连链接文字一起扒（译文里那句是该语言的书名）。只拿路径的话页面上露出的是中文文件名
  return [...cell[1].matchAll(/\[([^\]]+)\]\((docs\/[^)#/]+\.md)\)/g)].map(m => ({ path: m[2], title: m[1] }));
}

const pctEncode = p => p.split('/').map(encodeURIComponent).join('/');

// 下面几个函数都只吐内文：data-i18n-block 换的是内文，外层标签模板里已经有了。
// 原来连外层标签一起吐，页面上出来的是 <div><div>。
function noscriptList(contents, L, strings, S) {
  // 「标题：说明」中间那个分隔符，各语言不一样
  return contents.map(c => `      <li>${escText(c.title)}${c.blurb ? S.listSep + escText(c.blurb) : ''}</li>`).join('\n');
}

function docLinks(docs, L, strings, S) {
  const links = docs.map(f =>
    `<a href="${escAttr(L.repoBlob + pctEncode(f.path))}">${escText(f.title)}</a>`);
  // 核实记录是作者的工作底稿，没有译本，各语言都指中文那一份
  links.push(`<a href="${escAttr(REPO + '/tree/main/docs/%E6%A0%B8%E5%AE%9E%E8%AE%B0%E5%BD%95')}">${escText(strings['docs.records'])}</a>`);
  return `${escText(strings['docs.label'])}${S.listSep}${links.join(' · ')}`;
}

// 根 URL 现在直接发英文（默认语言就住在根上，见 locales.json 里 en 的 dir: ""）。
// 以前这里是「跳语言的小页」——一块小 HTML，开 JS 就按 navigator.language 跳走。
// 那一版有两个问题：① 根 URL 发出的是中文标题的跳页，英文默认并没有真的落在根上；
// ② 自动跳转会把读者直接送走，页内的语言下拉和锚点都没机会用。
// 现在保留的只有它唯一无可替代的一点：?lang=xx 这个老链接形式（README 和别处都这么写过）。
// 命中就跳，命中不了就留在英文页上——页内下拉随时能换。
//
// 只列 PUBLISHED：还没翻完的那种 hreflang 和跳转表里都不出现——
// 列出来点进去是 404，比不列更糟。翻完重跑这个脚本，它自己回来。
export function chooserJump() {
  // 跳转表按 accept 排。?lang=xx 命中就走，命中不了（没带、带了不认识的那种）就什么都不做，
  // 读者留在这一页上——默认语言就在这儿，页内下拉随时能换。
  //
  // accept 传字符串（「en」「vi」「zh」），正则留到页面里现 new RegExp。
  // 曾经在这儿塞 new RegExp 再 JSON.stringify，出来的是 {}（RegExp 序列化不出自己），
  // 于是 l.test.test 抛 TypeError，整个脚本当场死掉，跳转一次也没真发生过。
  const picks = PUBLISHED.map(l => ({ code: l.code, url: l.canonical, accept: l.accept }));
  return `<script>
(function(){
  var q = new URLSearchParams(location.search).get('lang');
  if (!q) return;                                   // 没带 lang：就在这一页上，不跳
  var list = ${JSON.stringify(picks)};
  var hit = list.filter(function(l){
    return l.code === q || new RegExp('^' + l.accept, 'i').test(q);
  })[0];
  if (!hit) return;                                  // 带了一种没有的语言：留在原地
  var url = hit.url + location.search.replace(/[?&]lang=[^&]*/, '')
                   .replace(/^\?/, '?').replace(/^&/, '?') + location.hash;
  if (url !== location.href) location.replace(url);
})();
</script>
`;
}

// ---------------------------------------------------------------- 渲染一份页面
// 这一轮真的会生成页面的语言：README 在的才算。还没翻完的那种语言
// 不能出现在 hreflang 和页内语言下拉里——那些都是读者会点开的链接，
// 点进去只有一个 404，比不列更糟。翻完重跑这个脚本，它自己回来。
const readmeOf = L => (L.contentDir ? L.contentDir + '/' : '') + 'README.md';
export const PUBLISHED = LOCALES.filter(L => existsSync(resolve(ROOT, readmeOf(L))));

// hreflang 由 PUBLISHED 生成，不在模板里写死：写死了就得记得在加语言、改域名时两处一起改，
// 漏一处就是一堆指向不存在页面的 hreflang。
function hreflangLinks() {
  return [
    ...PUBLISHED.map(l => `<link rel="alternate" hreflang="${l.htmlLang}" href="${l.canonical}">`),
    `<link rel="alternate" hreflang="x-default" href="${SITE_URL()}">`,
  ].join('\n');
}

export function renderPage(L, template, stats) {
  // 内容还没翻的语言这次先跳过：zh 那一份照发，翻完再带上
  const readme0 = readmeOf(L);
  // 按 code 比，不比对象：L 有两份来源（build.mjs 自己 parse locales.json，
  // 别的脚本从 tools/site/locales.mjs 拿），是同一份 JSON 的两个不同对象，
  // 用 includes() 比永远不相等，离线版和 PDF 构建就都拿到 null 了。
  if (!PUBLISHED.some(p => p.code === L.code)){ SKIP.add(L.code); return null; }

  const raw = JSON.parse(read(`tools/site/locales/${L.code}.json`));
  if (!raw.strings) throw new Error(`locales/${L.code}.json 里没有 strings`);
  const missing = requiredKeys(template).filter(k => raw.strings[k] === undefined);
  if (missing.length) throw new Error(`locales/${L.code}.json 缺 ${missing.length} 个键：${missing.join('、')}`);

  const strings = Object.fromEntries(Object.entries(raw.strings).map(([k, v]) => [k, fill(v, stats)]));
  // 内容根目录由 locales.json 定：zh 指仓库根（原文在那儿），en/vi 指自己的子目录。
  // 找不到就是还没翻，不是可以退回去读中文——退回去会造出一个内容对不上的页面
  const readmePath = readme0;
  const readme = read(readmePath);
  const listed = readContents(readme, raw);
  if (!listed.length) throw new Error(`${readmePath} 的「${raw.contents}」一节里没扒到节`);
  // 目录里列了、正文还没翻到的那几节，这次先不收进页面。全书翻完会自动全进来；
  // 真的漏翻由 tools/i18n/check.mjs 报（它拿目录清单和实际文件逐节对）
  const contents = listed.filter(c => {
    const there = existsSync(resolve(ROOT, at(L, c.path)));
    if (!there) SKIPPED.push(`${c.n} ${c.title}`);
    return there;
  });
  if (!contents.length) throw new Error(`${readmePath} 的目录里列了 ${listed.length} 节，正文一份都还没有`);
  // 长文同理：没翻到的那几篇这次不进页面
  const docs = readLongform(readme, raw).filter(d => {
    const there = existsSync(resolve(ROOT, at(L, d.path)));
    if (!there) SKIPPED.push(d.title);
    return there;
  });

  const blocks = {
    noscriptList: noscriptList(contents, L, strings, raw),
    docLinks: docLinks(docs, L, strings, raw),
    aiLink: `${escText(strings['docs.aiLabel'])}${raw.listSep}${escText(strings['docs.ai'])}`,
    jsonld: jsonLd(L, strings, contents.length, stats),
  };

  let html = template
    .replace('{{htmlLang}}', L.htmlLang)
    .replace(/\{\{canonical\}\}/g, L.canonical)
    .replace(/\{\{ogLocale\}\}/g, L.ogLocale)
    .replace('{{hreflang}}', hreflangLinks())
    .replace(/\{\{site\}\}/g, SITE)
    .replace(/\{\{repo\}\}/g, REPO);
  html = applyMarkup(html, strings, blocks);

  // 核实记录的链接：模板里只留一个 data-src 占位，地址指向仓库那一份中文的
  // （工作底稿没有译本），链接文字按语言给
  // 注意：data-src 里那个值本身已经是百分号编码过的（模板里照抄的 GitHub 链接），
  // 再编一次就变成 %25E6…，点开是 404
  const records = /<a data-src="(docs\/[^"]+)">[^<]*<\/a>/g;
  if (!records.test(html)) throw new Error('模板里找不到页脚的核实记录链接（data-src）');
  html = html.replace(records, (_, p) =>
    `<a href="${REPO}/tree/main/${p}">${escText(strings['docs.records'])}</a>`);

  // 相对路径按这一份的位置改写：zh 的正文和广告都在上一层
  html = html
    .replaceAll('href="README.md"', `href="${L.contentBase}README.md"`)
    .replaceAll('href="book/"', `href="${L.contentBase}book/"`)
    .replaceAll('src="ads/', `src="${L.assetBase}`);

  // logo 指向本站的这一页，用绝对地址（模板里的 "./" 是相对路径）
  // 曾经写成 L.dir（「en/」这种），从 /en/ 点就解析成 /en/en/，zh 那边是 /zh/zh/。
  // 相对路径只在「相对谁」不变时才成立，而这一页自己就在那个目录里——
  // L.contentBase 也不行，en 那份是 "./"（指自己）、zh 那份是 "../"（指上一级，跳出本站）。
  // L.canonical 由 site.json 推出，和 hreflang、canonical 同源，改域名一起跟着走。
  html = html.replace(
    `<a class="title" href="./">`,
    `<a class="title" href="${L.canonical}">`);

  const config = {
    code: L.code, dir: L.dir, contentBase: L.contentBase, assetBase: L.assetBase,
    repoBlob: L.repoBlob, htmlLang: L.htmlLang, sortLocale: L.sortLocale,
    locales: PUBLISHED.map(l => l.code), langNames: Object.fromEntries(PUBLISHED.map(l => [l.code, l.name])),
    // 每种语言页面上线上的地址，末尾带斜杠（默认语言是 ''，页面就在根上）。
    // 页内的语言下拉要靠它算跳转目标，所以得整张表，不能只有当前这页的 dir。
    langDirs: Object.fromEntries(PUBLISHED.map(l => [l.code, l.dir])),
    offline: false,
    files: contents.map(c => c.path),      // 这一份真正收了哪几节，页面照这个取
    docFiles: docs.map(d => d.path),
    contents: raw.contents, longformLabel: raw.longformLabel, longformSee: raw.longformSee,
    fields: raw.fields, dispute: raw.dispute, todo: raw.todo,
    glossary: raw.glossary, glossarySplit: raw.glossarySplit,
    xref: raw.xref, lens: raw.lens, costKeys: raw.costKeys, gainWords: raw.gainWords,
    urlTrim: raw.urlTrim, srcOpen: raw.srcOpen, srcClose: raw.srcClose, srcSemi: raw.srcSemi,
    strings,
  };
  const script = `<script id="site-config" type="application/json">${JSON.stringify(config)}</script>`;
  const needle = '<script id="site-config" type="application/json">{{config}}</script>';
  if (!html.includes(needle)) throw new Error('模板里找不到 site-config 的占位脚本，页面取不到语言配置');
  html = html.replace(needle, script);

  // 页面里不该再有没填的 {{}}。字典那份不算：T('key', {n}) 的变量就是留给浏览器填的，
  // 它整份在 site-config 里，剔掉再查，剩下的是真漏了（stats.json 里没这个数，或 T() 没传变量）。
  const shell = html.replace(script, '');
  const left = [...shell.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]);
  if (left.length) throw new Error(`生成的 ${L.dir}index.html 里还剩 {{${[...new Set(left)].join('}}、{{')} }}，要么 stats.json 里没这个数，要么 T() 忘了传变量`);
  return html;
}

function jsonLd(L, strings, sections, stats) {
  const doc = {
    '@context': 'https://schema.org', '@graph': [
      { '@type': 'WebSite', '@id': `${SITE}#website`, url: SITE + '/', name: strings['meta.siteName'],
        description: strings['meta.description'], inLanguage: L.htmlLang,
        potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${L.canonical}?q={search_term_string}` }, 'query-input': 'required name=search_term_string' } },
      { '@type': 'Book', '@id': `${SITE}#book`, name: strings['meta.siteName'], url: SITE + '/',
        inLanguage: L.htmlLang, bookFormat: 'https://schema.org/EBook',
        numberOfPages: Number(stats.entries), license: 'https://creativecommons.org/licenses/by/4.0/',
        abstract: strings['meta.description'], about: strings['meta.about'], isAccessibleForFree: true },
    ],
  };
  return JSON.stringify(doc, null, 0).replace(/<\/script/gi, '<\\/script');
}
// sitemap.xml 也由这里生成，跟着这次真正生成的页面走。原来是手写的：域名单独抄了
// 一份、列的是 README.md（Pages 上那不是页面）、三种语言页一个都没有。
// 不写 <lastmod>：它得跟着正文改，每次重新生成都变，纯粹制造无意义的 diff；
// 写一个过期的日期比不写更糟，Google 的说明里 lastmod 本来就是可选的。
//
// 每一条都带 xhtml:link 互指：三种语言是同一本书的三种语言，搜索引擎靠这个知道，
// 不然它会把 en/ 和 vi/ 当成两本不同的书。x-default 指跳语言的小页。
export function sitemapXml() {
  const alternates = PUBLISHED.map(l =>
    `    <xhtml:link rel="alternate" hreflang="${l.htmlLang}" href="${escAttr(l.canonical)}"/>`);
  alternates.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${escAttr(SITE_URL())}"/>`);
  const url = (loc, priority) =>
    `  <url>\n    <loc>${escText(loc)}</loc>\n${alternates.join('\n')}\n    <priority>${priority}</priority>\n  </url>`;
  // 每条只列一次。默认语言住在根上，它的 canonical 就是 SITE_URL()，
  // 而根 URL 本来就要单列一条（读者直接打开的就是它）——不去重 sitemap 里
  // 同一个地址会出现两次，一次 1.0 一次 0.9。
  const seen = new Set();
  const entry = (loc, priority) => {
    if (seen.has(loc)) return '';
    seen.add(loc);
    return url(loc, priority) + '\n';
  };
  let out = entry(SITE_URL(), '1.0');
  for (const l of PUBLISHED) out += entry(l.canonical, l.default ? '0.9' : '0.8');
  return '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
    + ' xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
    + out
    + '</urlset>\n';
}

// robots.txt 和 sitemap.xml 是一对：sitemap 指的那个地址得是真的。一起从 site.json 拼，
// 换域名就不会只改了一半。
export function robotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL()}sitemap.xml
`;
}

// site 和 repo 是全书唯一和「部署在哪个域名」有关的两处，都放在 tools/site/site.json。
// 换域名只改那一处：locales.json 里每种语言的 canonical 和 repoBlob 由它们推出来，
// 对不上就在 checkUrls() 里报错，不会出现「Pages 发到 A 域名、页面自称是 B 域名」。
// site 不带尾斜杠：模板里是 {{site}}/en/、{{site}}/og.png，带了会拼出双斜杠。
export const { site: SITE, repo: REPO } = JSON.parse(read('tools/site/site.json'));
export const SITE_URL = () => SITE + '/';

// locales.json 的 canonical / repoBlob 是从 site.json 抄的。抄错了页面照样生成，
// 但链接会指向别处，而且没人会一眼看出来。这里逐个对一遍。
function checkUrls() {
  for (const l of LOCALES) {
    // dir 是空串时拼出来正好是 SITE + '/'：默认语言就住在根 URL 上（要求 2）
    const wantCanonical = SITE + '/' + l.dir;
    const wantBlob = REPO + '/blob/main/' + (l.contentDir ? l.contentDir + '/' : '');
    if (l.canonical !== wantCanonical)
      throw new Error(`locales.json 里 ${l.code} 的 canonical 是 ${l.canonical}，按 site.json 应该是 ${wantCanonical}`);
    if (l.repoBlob !== wantBlob)
      throw new Error(`locales.json 里 ${l.code} 的 repoBlob 是 ${l.repoBlob}，按 site.json 应该是 ${wantBlob}`);
  }
}

// ---------------------------------------------------------------- 写盘
// SKIP：这一份语言的 README 和正文都还没翻，页面这次不生成。
// SKIPPED：页面生成了，但目录里列的节或长文还没翻到，这次没进页面。
// 两回事，分开报，免得把「还没翻」说成「翻坏了」。
//
// 下面整段只在直接运行时执行（node tools/site/build.mjs）：
// tools/offline/build.mjs 和 web/ 的 Astro 构建都 import renderPage，
// import 时要是顺手写盘，Astro 每次构建都会把仓库根的生成物重写一遍。
// 判据是 argv[1] 是不是本文件——import 时 argv[1] 是调用方的入口。
// SKIP/SKIPPED 是模块级的：renderPage 往里写，
// 直接运行时底下那段读它们，被 import 时调用方自己看。
export const SKIP = new Set();
export const SKIPPED = [];

const isMainEntry = !!process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMainEntry) {

const stats = JSON.parse(read('tools/site/stats.json'));
const template = read('tools/site/page.template.html');
checkUrls();   // 先对域名，对不上就别生成，免得发出一批指向别处的链接
const targets = [];
for (const L of LOCALES){
  const text = renderPage(L, template, stats);
  if (text !== null) targets.push({ path: `${L.dir}index.html`, text });
}
targets.push({ path: 'sitemap.xml', text: sitemapXml() });
targets.push({ path: 'robots.txt', text: robotsTxt() });

if (CHECK) {
  const stale = [];
  for (const { path, text } of targets){
    const cur = existsSync(resolve(ROOT, path)) ? read(path) : null;
    if (cur === text) continue;
    stale.push(path);
    if (cur === null) console.log(`  ${path}：还没有`);
    else console.log(`  ${path}：和模板/字典对不上`);
  }
  if (!stale.length){ console.log('检索页、sitemap 和 robots.txt 都是最新的'); process.exit(0); }
  console.log(`\n有 ${stale.length} 份生成物过时：${stale.join('、')}。本地跑 node tools/site/build.mjs 然后提交。`);
  process.exit(1);
}

for (const { path, text } of targets){
  mkdirSync(dirname(resolve(ROOT, path)), { recursive: true });
  writeFileSync(resolve(ROOT, path), text);
  console.log(`  ${path}：${(Buffer.byteLength(text) / 1024 | 0)} KB`);
}
const done = LOCALES.filter(l => !SKIP.has(l.code)).map(l => l.code);
console.log(`\n已生成检索页 ${done.length} 份（${done.join('、')}，默认 ${DEFAULT_LOCALE}）和 sitemap.xml、robots.txt`);
if (SKIP.size) console.log(`跳过 ${[...SKIP].join('、')}：这一份的 README 和正文还没翻完，翻完重跑本脚本就会带上。`);
if (SKIPPED.length){
  console.log(`另有 ${SKIPPED.length} 项在目录里列着、正文还没翻到，这次没进页面：${SKIPPED.slice(0, 6).join('、')}${SKIPPED.length > 6 ? ' …' : ''}`);
}
} // isMainEntry：被 import 时到这里结束，调用方只拿 renderPage 等函数