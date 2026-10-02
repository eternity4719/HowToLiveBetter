// Astro 页面组装：共用 tools/site/build.mjs 的壳，再把预渲染和语料塞进去。
//
// 分工（别串了）：
// · 壳（SEO 头、hreflang、JSON-LD、界面文案、site-config、跳语言页、sitemap、robots）
//   全部由 tools/site/build.mjs 出，Astro 只是调 renderPage/chooserJump/sitemapXml/robotsTxt。
//   域名、文案、统计数字改那边，这里自动跟上。
// · 预渲染（卡片、侧栏目录、术语表）和语料内联由 web/ 出（render.ts + 下面这个文件）。
//   爬虫看到的全文从这里来。
//
// 注入全走字符串锚点，和 tools/offline/build.mjs 一个路数：锚点找不到就抛错，
// 不要静默发出半成品——少一段预渲染，页面看起来正常但爬虫少看几百条。
import { renderPage, chooserJump, sitemapXml, robotsTxt } from '../../../tools/site/build.mjs';
import { locale, readRepo } from './site';
import { loadLocale } from './load';
import { buildGloss } from './parse';
import { fill } from '../../../tools/site/build.mjs';
import { createCtx, listHtml, sidebarHtml, glossDl } from './render';

function once(html, needle, label) {
  const n = html.split(needle).length - 1;
  if (n !== 1) throw new Error(`组装 ${label} 时锚点对不上：${JSON.stringify(needle.slice(0, 60))} 出现了 ${n} 次`);
  return n;
}

/** 某一种语言的主页完整 HTML（含预渲染正文 + 内联语料，开箱即发）。 */
export function localePageHtml(code) {
  const cfg = locale(code);
  const data = loadLocale(code, cfg);
  const template = readRepo('tools/site/page.template.html');
  const stats = JSON.parse(readRepo('tools/site/stats.json'));
  const meta = cfg; // locale() 返回 {...meta, ...raw}，renderPage 只读 meta 那几个键
  let html = renderPage({ code: meta.code, dir: meta.dir, contentBase: meta.contentBase, assetBase: meta.assetBase, repoBlob: meta.repoBlob, htmlLang: meta.htmlLang, sortLocale: meta.sortLocale, canonical: meta.canonical, contentDir: meta.contentDir, default: meta.default, accept: meta.accept, name: meta.name, note: meta.note }, template, stats);
  if (html === null) throw new Error(`${code} 这次没生成页面（README 还没有？先翻 README）`);

  const strings = Object.fromEntries(Object.entries(cfg.strings).map(([k, v]) => [k, fill(v, stats)]));
  const gloss = buildGloss(data.readme, cfg);
  const ctx = createCtx(cfg, strings, data.sections, gloss);
  const total = data.sections.reduce((n, s) => n + s.entries.length, 0);

  // 语料：和离线单文件同一份东西。hydration 拿它解析出 SECS/ITEMS（给 xref 弹窗），
  // 关掉 JS 的读者和爬虫看的是下面的预渲染，两边是同一份正文。
  const corpusJson = JSON.stringify(data.corpus).replace(/<\/script/gi, '<\\/script');
  const configAnchor = '<script id="site-config" type="application/json">';
  once(html, configAnchor, '语料');
  html = html.replace(configAnchor, `<script>window.__CORPUS__=${corpusJson}</script>\n` + configAnchor);

  // 侧栏目录：爬虫顺着这些 #e- 锚点走到每一条。
  once(html, '<div class="sec-links" id="f-sec" data-dim="sec"></div>', '侧栏');
  html = html.replace('<div class="sec-links" id="f-sec" data-dim="sec"></div>', `<div class="sec-links" id="f-sec" data-dim="sec">${sidebarHtml(ctx, data.sections, strings)}</div>`);

  // 卡片：塞进 #list，放在 status/empty 之后（和页面里 build() appendChild 的顺序一样）。
  once(html, '<div id="list">', '列表标记');
  html = html.replace('<div id="list">', '<div id="list" data-ssg="1">');
  const listClose = '    </div>\n    <div class="foot">';
  once(html, listClose, '列表结尾');
  html = html.replace(listClose, listHtml(ctx, data.sections) + '\n' + listClose);

  // 计数：服务端先写对，apply() 跑起来会再算一遍，一样。
  once(html, '<b id="cnt">–</b>', '计数');
  html = html.replace('<b id="cnt">–</b>', `<b id="cnt">${total}</b>`);
  once(html, '<span id="tot">–</span>', '总数');
  html = html.replace('<span id="tot">–</span>', `<span id="tot">${total}</span>`);

  // 术语表：页面里 buildGlossary() 塞的 dl，服务端直接写好（hydration 时浏览器只索引）。
  once(html, '<dl></dl>', '术语表');
  html = html.replace('<dl></dl>', `<dl>${glossDl(ctx, gloss)}</dl>`);

  return { html, sections: data.sections.length, entries: total, skipped: data.skipped };
}

/** 把 renderPage 吐出来的整页切成三段，给 .astro 页面用。
    .astro 文件自己写 <html><head><body> 骨架，中间两块原样塞进去——
    骨架之外的东西（doctype、html 标签）Astro 不让用 set:html，拆开最干净。
    三个标记在模板里各出现一次，对不上就抛错，别拼出半页。 */
export function splitDoc(html) {
  const headOpen = html.indexOf('<head>');
  const headClose = html.indexOf('</head>');
  const bodyOpen = html.indexOf('<body>');
  const bodyClose = html.indexOf('</body>');
  if (headOpen < 0 || headClose < 0 || bodyOpen < 0 || bodyClose < 0
    || !(headOpen < headClose && headClose < bodyOpen && bodyOpen < bodyClose))
    throw new Error('整页切分对不上：<head>、</head>、<body>、</body> 的顺序或数量不对');
  const pre = html.slice(0, headOpen); // <!doctype html>...<html lang="..">，.astro 那边自己写骨架，不用这段
  const lang = /<html lang="([^"]*)">/.exec(pre)?.[1] ?? '';
  if (!lang) throw new Error('整页切分对不上：<html lang=".."> 没找到');
  return { lang, head: html.slice(headOpen + 6, headClose), body: html.slice(bodyOpen + 6, bodyClose) };
}

/** 某一种语言的主页三段（head/body 直接塞进 .astro 骨架）。 */
export function localePageParts(code) {
  const { html, ...rest } = localePageHtml(code);
  return { ...splitDoc(html), ...rest };
}

/** ?lang=xx 老链接的跳转脚本，整段塞进根页面的 head。没带 lang 就不跳。 */
export function chooserJumpParts() {
  return chooserJump();
}

export { chooserJump, sitemapXml, robotsTxt };
