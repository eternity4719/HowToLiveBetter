// 服务端渲染：把解析好的节和条目渲成和浏览器里一模一样的卡片 HTML。
//
// 为什么有一份这个：Astro 构建时把卡片直接写进 HTML，爬虫和关掉 JS 的读者
// 不用等 JS 就看到全文。这是整个 Astro 迁移的 SEO 收益所在。
//
// 和谁一致：tools/site/page.template.html 里 build() + renderCard() 在
// terms=[]、key='' 时产出的 DOM。只保证初始状态一致——搜了之后的重渲染
// 本来就是浏览器里现算的，和服务端没关系。
//
// 改这里的判据：改完跑一遍 web 的渲染一致性检查（下面有说明），
// 再跑 tools/site/build.mjs --check。两边各管一头，别只看一头。
import { buildGloss } from './parse';

const MD_LINK_RE = /\[([^\]\n]+)\]\(([^)\s]+)\)/;
const URL_RE = /<?(https?:\/\/[A-Za-z0-9\-._~:\/?#\[\]@!$&'()*+,=%]+)>?/g;
const BOLD_RE = /\*\*((?:\\\*|[^*\n])+)\*\*/;
const unescMd = s => s.replace(/\\([*_])/g, '$1');

// 和页面里的 esc() 同一个函数：& < > " 四个都转。textContent 赋值和这个转义
// 渲染出来是同一个 DOM（&quot; 解析回来就是 "），所以服务端统一用它。
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const escAttr = esc;

export function T(strings, key, vars) {
  let s = strings[key];
  if (s === undefined) return key;   // 和页面一样：漏译的键回显键名，构建那边会拦
  if (s === null || typeof s !== 'string') return key;
  if (vars) for (const k in vars) s = s.split('{{' + k + '}}').join(vars[k]);
  return s;
}

export interface RenderCtx {
  cfg: any;
  strings: Record<string, any>;
  repoBlob: string;
  items: Map<string, any>;
  secs: Map<string, any>;
  curSec: string;
  reXref: RegExp;
  reXRange: RegExp;
  reSep: RegExp;
  reUrlTrim: RegExp;
  glossRe: RegExp | null;
  glossBy: Record<string, any>;
  lensLabel: Record<string, string>;
  label: Record<string, Record<string, string>>;
}

/** 建渲染上下文：先把 SECS/ITEMS 两张表按 build() 第一行的顺序填好，
    再逐节渲染——和页面里一样，写在前面的节引用后面的节也认。 */
export function createCtx(cfg, strings, sections, gloss) {
  const items = new Map();
  const secs = new Map();
  for (const s of sections) { secs.set(s.n, s); for (const e of s.entries) items.set(`${s.n}-${e.n}`, e); }
  const lensLabel = {};
  for (const k in cfg.lens) lensLabel[k] = T(strings, cfg.lens[k]);
  const label = {};
  for (const [dim, key] of [['money', 'money'], ['time', 'time'], ['will', 'will']])
    label[dim] = Object.fromEntries(Object.entries(cfg.costKeys[dim]).map(([k, v]) => [k, T(strings, 'cost.' + key + '.' + v)]));
  // 术语里要是有 &<>"，下面按转义后文本匹配就对不上了。現在三份都沒有，
  // 有的那天（比如 "R&D" 进了术语表）这里会直接报错，而不是悄悄少标几个词。
  for (const g of gloss.rows) {
    if (/[&<>"]/.test(g.term)) throw new Error(`术语 ${JSON.stringify(g.term)} 里有 &<>"，服务端 termify 按转义后文本匹配会对不上，先处理这个术语`);
  }
  return {
    cfg, strings, repoBlob: cfg.repoBlob, items, secs, curSec: '',
    reXref: new RegExp(cfg.xref.pattern, 'g'),
    reXRange: new RegExp(cfg.xref.rangeRe),
    reSep: new RegExp(cfg.xref.listSep),
    reUrlTrim: new RegExp(cfg.urlTrim),
    glossRe: gloss.re, glossBy: gloss.by, lensLabel, label,
  };
}

function trimUrl(ctx, u) {
  let t = '';
  for (;;) {
    const ch = u.slice(-1);
    const unbalanced = ch === ')' && (u.split('(').length < u.split(')').length);
    if (!ctx.reUrlTrim.test(ch) && !unbalanced) break;
    t = ch + t;
    u = u.slice(0, -1);
  }
  return [u, t];
}

function hrefOf(ctx, p) {
  if (/^(https?:|mailto:|#)/.test(p)) return p;
  return ctx.repoBlob + p.replace(/^(\.\.?\/)+/, '').split('/').map(encodeURIComponent).join('/');
}

function highlightHtml(s, terms) {
  if (!terms.length) return esc(s);
  const lower = s.toLowerCase();
  let i = 0, out = '';
  while (i < s.length) {
    let best = -1, bl = 0;
    for (const t of terms) { const k = lower.indexOf(t, i); if (k !== -1 && (best === -1 || k < best)) { best = k; bl = t.length; } }
    if (best === -1) { out += esc(s.slice(i)); break; }
    if (best > i) out += esc(s.slice(i, best));
    out += '<mark>' + esc(s.slice(best, best + bl)) + '</mark>';
    i = best + bl;
  }
  return out;
}

const xrefKeys = (ctx, sec, spec) => {
  const ns = [];
  // 先认整串区间，再按分隔符切：英文的 listSep 里含 "to" 和 "-"，先切的话
  // "8 to 11" 被切成 "8" 和 "11"，区间再也认不出来（和页面里 xrefKeys 同样的顺序）。
  const whole = String(spec).trim();
  const wr = ctx.reXRange.exec(whole);
  if (wr) {
    const a = +wr[1], b = +wr[2];
    if (b >= a && b - a <= 40) for (let i = a; i <= b; i++) ns.push(i);
    return ns.map(n => `${sec}-${n}`).filter(k => ctx.items.has(k));
  }
  for (const part of whole.split(ctx.reSep)) {
    const r = ctx.reXRange.exec(part);
    if (r) {
      const a = +r[1], b = +r[2];
      if (b >= a && b - a <= 40) for (let i = a; i <= b; i++) ns.push(i);
      continue;
    }
    const n = part.trim();
    if (n) ns.push(n);
  }
  return ns.map(n => `${sec}-${n}`).filter(k => ctx.items.has(k));
};

/** xrefInto 的字符串版：能解析到真实条目的才包成 span.xref，
    解析不到的（法条条款号）原样留作文字，不用另写规则排除。 */
function xrefHtml(ctx, s, terms) {
  ctx.reXref.lastIndex = 0;
  let m, last = 0, any = false, out = '';
  while ((m = ctx.reXref.exec(s))) {
    const g = m.groups || {};
    const keys = g.secs !== undefined
      ? String(g.secs).split(ctx.reSep).map(x => x.trim()).filter(x => ctx.secs.has(x)).map(x => 's' + x)
      : xrefKeys(ctx, g.sec ?? ctx.curSec, g.nums ?? g.nums2 ?? g.nums3 ?? '');
    if (!keys.length) continue;
    out += highlightHtml(s.slice(last, m.index), terms);
    out += `<span class="xref" tabindex="0" data-keys="${keys.join(',')}">${esc(m[0])}</span>`;
    last = m.index + m[0].length;
    any = true;
  }
  // 匹配文本本身不包 mark（页面里是 textContent，不是 highlightInto），
  // 但要进术语表：页面里最后那遍 termify 会走进 span.xref（它只跳过 a 和 abbr）。
  // 这里先原样拼，整段拼完统一过一遍 termifyHtml，和页面的顺序一样。
  out += highlightHtml(s.slice(last), terms);
  void any;
  return out;
}

/** termify 的字符串版。页面里是最后走一遍 DOM 文本节点、跳过 a 和 abbr；
    这里按标签切开，只处理不在 a/abbr 里面的文本段。术语不含 &<>"（createCtx 里断言过），
    所以在转义后的文本上匹配和在原文上匹配是一回事。 */
function termifyHtml(ctx, html) {
  if (!ctx.glossRe) return html;
  const toks = html.match(/<[^>]*>|[^<]+/g) ?? [];
  let depth = 0;
  const out = toks.map(tok => {
    if (tok.startsWith('<')) {
      const m = /^<\/?([a-z0-9]+)/i.exec(tok);
      const tag = m ? m[1].toLowerCase() : '';
      const selfClose = /\/>$/.test(tok) || tag === 'br' || tag === 'img' || tag === 'hr' || tag === 'input';
      if (!selfClose && (tag === 'a' || tag === 'abbr')) depth += tok.startsWith('</') ? -1 : 1;
      return tok;
    }
    if (depth > 0) return tok;
    // lastIndex 按段清零：页面里每个文本节点单独走一遍 test + exec（test 会推进 lastIndex，
    // 所以 exec 前重设为 0）。这里不逐段清零的话，上一段剩下的位置会带到下一段，
    // 下一段开头的词就漏标了——漏标只影响 abbr，不丢字，但两边行为必须一致。
    ctx.glossRe.lastIndex = 0;
    let out2 = '', last = 0, m;
    let hit = false;
    while ((m = ctx.glossRe.exec(tok))) {
      const g = ctx.glossBy[m[0]];
      if (!g) continue;
      hit = true;
      out2 += tok.slice(last, m.index);
      out2 += `<abbr class="term" tabindex="0" data-term="${escAttr(g.term)}" title="${escAttr(g.meaning)}">${tok.slice(m.index, m.index + m[0].length)}</abbr>`;
      last = m.index + m[0].length;
    }
    if (!hit) return tok;
    return out2 + tok.slice(last);
  });
  return out.join('');
}

/** renderText 的字符串版：md 链接、裸 URL、加粗、xref、高亮，最后统一过术语表。
    参数顺序和页面里一样（withTerms、urlsLast），调的时候别传错。 */
export function renderText(ctx, text, terms = [], withTerms = true, urlsLast = false) {
  const LINK_RE = new RegExp([MD_LINK_RE.source, URL_RE.source, BOLD_RE.source].join('|'), 'g');
  const held = [];
  let justHeld = false, out = '';
  const pushText = s => {
    if (!s) return;
    if (justHeld && /^[\s、,，]+$/.test(s)) return;
    justHeld = false;
    out += xrefHtml(ctx, unescMd(s), terms);
  };
  let last = 0, m;
  while ((m = LINK_RE.exec(text))) {
    pushText(text.slice(last, m.index));
    last = m.index + m[0].length;
    if (m[4] !== undefined) {
      out += '<strong>' + highlightHtml(unescMd(m[4]), terms) + '</strong>';
      justHeld = false;
      continue;
    }
    if (m[3]) {
      const [u, tail] = trimUrl(ctx, m[3]);
      const a = `<a href="${escAttr(u)}" target="_blank" rel="noopener" class="url">${esc(u.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a>`;
      if (urlsLast) { held.push(a); justHeld = true; }
      else out += a;
      pushText(tail);
      continue;
    }
    out += `<a href="${escAttr(hrefOf(ctx, m[2]))}" target="_blank" rel="noopener">${esc(m[1])}</a>`;
    justHeld = false;
  }
  pushText(text.slice(last));
  for (const a of held) out += a;
  return withTerms ? termifyHtml(ctx, out) : out;
}

export function splitSrc(ctx, text) {
  const open = ctx.cfg.srcOpen, close = ctx.cfg.srcClose;
  const parts = [];
  let buf = '', depth = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (open.includes(c)) depth++;
    if (close.includes(c)) depth = Math.max(0, depth - 1);
    const semi = c === ctx.cfg.srcSemi || (c === ';' && /\s/.test(text[i - 1] || '') && /\s/.test(text[i + 1] || ''));
    if (semi && depth === 0) { parts.push(buf); buf = ''; continue; }
    buf += c;
  }
  parts.push(buf);
  return parts.map(s => s.trim()).filter(Boolean);
}

/** renderSrc 的字符串版，返回值是 [html, 条数]：条数决定 summary 后面跟不跟「· N 条」。 */
export function renderSrc(ctx, text, terms = []) {
  const parts = splitSrc(ctx, text);
  if (parts.length < 2) return [renderText(ctx, text, terms, true, true), parts.length];
  return ['<ol>' + parts.map(p => '<li>' + renderText(ctx, p, terms, true, true) + '</li>').join('') + '</ol>', parts.length];
}

function badgesHtml(ctx, e) {
  const S = ctx.strings;
  let out = '';
  if (e.ratio) {
    out += `<span class="badge r${({ '极高': '3', '高': '2', '一般': '1' })[e.ratio]}" title="${escAttr(T(S, 'badge.ratioTitle', { level: T(S, 'gain.' + (ctx.cfg.gainWords[e.level] || e.level)), lens: ctx.lensLabel[e.lens] || e.lens }))}">${esc(T(S, 'badge.ratio', { v: T(S, 'ratio.' + ({ '极高': 'top', '高': 'high', '一般': 'mid' })[e.ratio]) }))}</span>`;
  }
  out += `<span class="badge ${escAttr(e.grade)}">${esc(T(S, 'badge.grade', { g: e.grade }))}</span>`;
  if (e.lens) out += `<span class="badge plain">${esc(ctx.lensLabel[e.lens] || e.lens)}</span>`;
  for (const d of ['money', 'time', 'will']) if (e[d]) out += `<span class="badge plain">${esc(ctx.label[d][e[d]] || e[d])}</span>`;
  if (e.dispute) out += `<span class="badge danger">${esc(T(S, 'badge.dispute'))}</span>`;
  if (e.todo) out += `<span class="badge warn">${esc(T(S, 'badge.todo'))}</span>`;
  return out;
}

/** renderCard(card, [], '') 的字符串版：初始状态（没搜、没筛）长什么样，服务端就长什么样。
    顺序和页面里 build() 一样：先 sec-h 和导读，再逐条卡片；CUR_SEC 按卡片所属的节走，
    「本节第 X 条」才不会指错节。 */
export function cardHtml(ctx, e) {
  const S = ctx.strings;
  ctx.curSec = e.sec;
  const id = `e-${e.sec}-${e.n}`;
  const [srcHtml, nSrc] = renderSrc(ctx, e.src, []);
  return `<article class="card" id="${id}">`
    + `<div class="card-h"><span class="idx">${esc(e.n)}</span><h3 class="t">${renderText(ctx, e.title, [], true)}</h3><a class="anchor" href="#${id}" aria-label="${escAttr(T(S, 'card.link'))}">#</a></div>`
    + `<div class="badges">${badgesHtml(ctx, e)}</div>`
    + `<p class="human"${e.human ? '' : ' hidden'}>${e.human ? renderText(ctx, e.human, [], true) : ''}</p>`
    + `<div class="rows">`
    + `<div class="k">${esc(T(S, 'field.cost'))}</div><div class="v cost">${renderText(ctx, e.cost, [], true)}</div>`
    + `<div class="k">${esc(T(S, 'field.gain'))}</div><div class="v gain">${renderText(ctx, e.gain, [], true)}</div>`
    + `<div class="k">${esc(T(S, 'field.note'))}</div><div class="v note">${renderText(ctx, e.note, [], true)}</div>`
    + `</div>`
    + `<details class="src"><summary>${esc(T(S, 'field.src'))}<span class="cnt">${nSrc > 1 ? esc(T(S, 'src.count', { n: nSrc })) : ''}</span></summary><div class="body">${srcHtml}</div></details>`
    + `</article>`;
}

export function sectionHtml(ctx, s) {
  ctx.curSec = s.n;
  return `<section class="sec-block" data-sec="${escAttr(s.n)}" id="sec-${escAttr(s.n)}">`
    + `<div class="sec-h"><h2>${esc(s.n)}. ${esc(s.title)}</h2><span class="shown"><span class="k">${s.entries.length}</span> / ${s.entries.length}</span></div>`
    + s.intro.map(para => `<p class="intro">${renderText(ctx, para, [], false)}</p>`).join('')
    + s.entries.map(e => cardHtml(ctx, e)).join('')
    + `</section>`;
}

/** #list 的整块：页面里 build() appendChild 的顺序就是这个顺序。 */
export function listHtml(ctx, sections) {
  return sections.map(s => sectionHtml(ctx, s)).join('');
}

const FOLD_SVG = '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** 侧栏 #f-sec 的整块：页面里 build() 拼「全部章节」按钮、节按钮和目录的顺序一样。
    服务端先渲出来，爬虫顺着这些 #e- 节-条 锚点能走到每一条；hydration 时浏览器只索引，不重建。 */
export function sidebarHtml(ctx, sections, strings) {
  const total = sections.reduce((n, s) => n + s.entries.length, 0);
  let out = `<button class="sec-link all" data-v="" aria-pressed="true"><span>${esc(T(strings, 'sec.all'))}</span><i>${total}</i></button>`;
  for (const s of sections) {
    out += `<button class="sec-link" data-v="${escAttr(s.n)}" aria-pressed="false"><span>${esc(s.n)}. ${esc(s.title)}</span><i>${s.entries.length}</i><b class="fold" title="${escAttr(T(strings, 'sec.fold'))}">${FOLD_SVG}</b></button>`;
    out += `<div class="toc-sub" hidden>`;
    for (const e of s.entries) {
      out += `<a href="#e-${escAttr(e.sec)}-${escAttr(e.n)}" data-go="${escAttr(e.sec)}-${escAttr(e.n)}" title="${escAttr(e.title)}"><i>${esc(e.n)}</i><span>${esc(e.title)}</span></a>`;
    }
    out += `<p class="toc-none" hidden>${esc(T(strings, 'sec.none'))}</p></div>`;
  }
  return out;
}

/** 术语表 dl：页面里 buildGlossary() 按 sortLocale 排好塞进去，服务端直接写好。 */
export function glossDl(ctx, gloss) {
  return [...gloss.rows]
    .sort((a, b) => a.term.localeCompare(b.term, ctx.cfg.sortLocale))
    .map(g => `<dt>${esc(g.term)}</dt><dd>${esc(g.meaning)}</dd>`).join('');
}

export { buildGloss };
