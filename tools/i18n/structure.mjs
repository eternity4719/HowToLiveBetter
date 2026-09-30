// 一节正文（或一块条目）的结构骨架，以及逐条比对。
// split.mjs 切块、join.mjs 合块、check.mjs 校整本，用的是同一套解析和同一套比对，
// 所以「块级过、整节也不过」这种事不会发生。
//
// 骨架只留机器能查的东西：条号、六个字段各有无、数字、链接、指路的条号节号、
// 成本标签注释、证据等级、争议和待核实的标记。文字一个字都不管——译文和原文
// 本来就该不一样，管文字就管死了。

import { strings, SOURCE, LOCALES } from '../site/locales.mjs';

const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const FIELDS = ['cost', 'human', 'gain', 'grade', 'src', 'note'];
// 原文与译文都必须有的字段。「说人话」「来源」「备注」有些条目本来就没有，
// 原文缺译文也缺才算过（比的时候按实际有的比，不按固定六栏）
const ALWAYS = ['cost', 'gain', 'grade'];

/**
 * 数字：指路里的条号节号不算，那些单独查。千分位逗号去掉再比，248,099 和 248099 一样。
 *
 * 量级词单独处理。中文在英文里只能换个写法：「每万人 30.8 人」写成 "30.8 per 10,000"，
 * 「167 万女性」写成 "1,670,000 women"，「每百万人 302 例」写成 "302 per million"。
 * 这些不是改了数字，是量级本身换了个写法。所以返回两份：必须要有的（ns），
 * 和量级换算时允许出现的（scale，可多可少）。百、千、万、亿四种都算。
 */
const SCALE_WORDS = [
  [1e2, '百'], [1e3, '千'], [1e4, '万'], [1e5, '十万'], [1e6, '百万'], [1e7, '千万'], [1e8, '亿'],
];
const SCALE_VALUES = SCALE_WORDS.map(([v]) => String(v));

function numbersOf(text) {
  const s = String(text);
  const norm = n => n.replace(/[.,](?=\d{3}\b)/g, '');
  const ns = [...s.matchAll(/\d+(?:[.,]\d+)*/g)].map(m => norm(m[0]));

  // 只有这一栏里出现过量级词，才允许出现量级换算的结果
  if (!/[百千万亿]/.test(s)) return { ns: ns.sort(), scale: new Set() };
  const scale = new Set(SCALE_VALUES);
  // 「167 万」「每万枚」「每百万人」两种语序都算：数在词前，词在数前
  for (const [v, word] of SCALE_WORDS){
    for (const m of s.matchAll(new RegExp(`(\\d+(?:[.,]\\d+)*)\\s*${word}`, 'g'))){
      const raw = norm(m[1]);
      const base = Number(raw);
      if (!Number.isFinite(base) || base === 0) continue;
      // 尾数可以拆开重组：中文「2.21 亿元」在英文里写成 "221 million yuan"
      // 是同一个数（2.21 × 1e8 = 221 × 1e6），不算改数字。所以 ±3 到 +8 个
      // 数量级都放进允许名单，超出这个范围的还是真改了。
      for (let k = -3; k <= 8; k++){
        const x = base * Math.pow(10, k);
        if (Number.isFinite(x) && Math.abs(x) >= 1) scale.add(String(Number(x.toPrecision(12))));
      }
      scale.add(raw);
      const i = ns.indexOf(raw);
      if (i >= 0) ns.splice(i, 1);     // 基数本身不再必须出现
    }
  }
  return { ns: ns.sort(), scale };
}

/**
 * 指路：条号、节号，以及「8 到 10」这种区间。
 * 正则是各语言自己那份（tools/site/locales/<code>.json 的 xref.pattern），和检索页
 * 把「第 X 条」变成可点的引用用的是同一套。所以这里查的就是读者真能点到的那些指路，
 * 译文里条号节号丢了或者写不成可点的形状，这一层就报出来。
 *
 * 顺序：先认区间，再按分隔符切。英文的 listSep 里就含 "to" 和 "-"
 * （"items 8 to 11" 要切得开），先切的话 "8 to 11" 被切成 "8" 和 "11"，
 * 区间就再也认不出来——一次翻 22 块之后才发现，第 5 节两处指路报「不见了」。
 */
function refsOf(text, xref) {
  if (!xref) return [];
  const range = new RegExp(xref.rangeRe);
  const sep = new RegExp(xref.listSep);   // 正则，不是字面串：英文是 ", and to –" 一串
  const out = [];
  // 区间摊成一个个号，不留「8-11」这种形状：原文写「第 8 到 11 条」、
  // 英文写 "items 8, 9, 10 and 11" 指的是同一批条目，摊开才比得上。
  // 上限 40 和检索页一致，防着把法条条款号那种大范围摊成几百个号。
  const push = (sec, spec) => {
    const r = range.exec(spec);
    if (r){
      const a = +r[1], b = +r[2];
      if (b >= a && b - a <= RANGE_MAX) for (let i = a; i <= b; i++) out.push(`${sec}${i}`);
      return;
    }
    out.push(`${sec}${spec}`);
  };
  for (const m of text.matchAll(new RegExp(xref.pattern, 'g'))){
    const g = m.groups ?? {};
    if (g.secs !== undefined){
      for (const s of String(g.secs).split(sep)) if (s.trim()) out.push('s' + s.trim());
      continue;
    }
    // 节号缺省就是本节：中文「本节第 3 条」、英文「this section's item 3」
    const sec = g.sec ? 's' + g.sec : '*';
    // 先认整串区间再按分隔符切：英文的 listSep 里含 "to" 和 "-"，
    // 先切的话 "8 to 11" 变成 "8" 和 "11"，区间再也认不出来
    const spec = String(g.nums ?? g.nums2 ?? g.nums3 ?? '').trim();
    if (range.test(spec)){ push(sec, spec); continue; }
    for (const part of spec.split(sep)){
      const t = part.trim();
      if (t) push(sec, t);
    }
  }
  return out.sort();
}
// 区间摊开的上限，和检索页 xrefKeys 一样
const RANGE_MAX = 40;

/**
 * 解析一节正文。head 是节标题和导读，entries 是条目。
 * 字段名从 locale 取：中文「- 成本：」，英文「- Cost:」，越南文「- Chi phí:」。
 */
export function entrySkeleton(md, S = strings(SOURCE.code)) {
  const lines = md.split('\n');
  const fieldRe = Object.fromEntries(FIELDS.map(f => [f, new RegExp('^- ' + escRe(S.fields[f]) + '(.*)$')]));
  const out = { n: '', title: '', intro: [], entries: [] };
  let entry = null;
  for (const raw of lines){
    const line = raw.replace(/\s+$/, '');
    let m;
    if (!entry && (m = /^# (\d+)\. (.+)$/.exec(line))){ out.n = m[1]; out.title = m[2].trim(); continue; }
    if ((m = /^### (\d+)\. (.+)$/.exec(line))){
      entry = { n: m[1], title: m[2].trim(), tag: '', fields: {}, extra: [] };
      out.entries.push(entry);
      continue;
    }
    if (!entry){ if (line.trim()) out.intro.push(line); continue; }
    if ((m = /^<!--\s*成本标签:\s*(.*?)\s*-->$/.exec(line))){ entry.tag = m[1].trim(); continue; }
    let hit = false;
    for (const f of FIELDS){
      if ((m = fieldRe[f].exec(line))){ entry.fields[f] = m[1]; hit = true; break; }
    }
    if (hit){
      if (entry.fields.grade) entry.grade = entry.fields.grade.trim()[0];
      continue;
    }
    if (line.startsWith('- ')) entry.extra.push(line);
  }
  for (const e of out.entries) decorate(e, S);
  return out;
}

function decorate(e, S) {
  const all = [e.fields.human ?? '', e.fields.gain ?? '', e.fields.note ?? '', e.fields.src ?? ''].join('\n');
  e.numbers = {
    gain: numbersOf(e.fields.gain ?? ''),
    cost: numbersOf(e.fields.cost ?? ''),
    src: numbersOf(e.fields.src ?? ''),
  };
  e.refs = refsOf(all, S.xref);
  e.links = all.match(/https?:\/\//g)?.length ?? 0;
  e.order = FIELDS.filter(f => e.fields[f] !== undefined);
  e.dispute = new RegExp('^' + S.dispute).test(e.fields.note ?? '');
  e.todo = S.todo.some(w => all.includes(w) || (e.fields.cost ?? '').includes(w));
}

/** 两种语言的字段名在页面上叫什么，报告里好读 */
function label(S, f) { return S.fields[f].replace(/[：:]$/, ''); }

/**
 * 逐条比。返回问题清单（空数组就是这块对了）。dstLabel 是给报告前缀用的语言名。
 * 这一套就是 check.mjs 的判据，抽出来是为了 join 逐块校时用同一份。
 */
export const STRUCT = {
  ALWAYS, FIELDS,
  compare(a, b, tag) {
    const out = [];
    const S = strings(SOURCE.code);
    const D = strings(b._locale ?? SOURCE.code);
    if (a.n !== b.n) out.push(`${tag}：条号是 ${b.n}，原文 ${a.n}`);
    if (!b.title.trim()) out.push(`${tag}：标题是空的`);

    // 成本标签逐字照抄：检索页的筛选和地址栏全靠它，三种语言共用一套中文取值
    if (a.tag !== b.tag) out.push(`${tag}：成本标签「${b.tag}」和原文「${a.tag}」不一样，要一字不改照抄`);

    for (const f of ALWAYS) if (b.fields[f] === undefined) out.push(`${tag}：少了「${label(S, f)}」这一栏`);
    for (const f of ['human', 'src', 'note']){
      const had = a.fields[f] !== undefined, has = b.fields[f] !== undefined;
      if (had !== has) out.push(`${tag}：原文${had ? '有' : '没有'}「${label(S, f)}」栏，译文${has ? '有' : '没有'}`);
    }
    if (b.extra.length) out.push(`${tag}：多出原文没有的字段行「${b.extra[0].slice(0, 30)}」`);
    if (b.order.join() !== a.order.join())
      out.push(`${tag}：字段顺序是 ${b.order.map(f => label(D, f)).join('、')}，原文 ${a.order.map(f => label(S, f)).join('、')}`);

    if (a.grade !== b.grade) out.push(`${tag}：证据等级是 ${b.grade ?? '空'}，原文 ${a.grade}`);
    if (a.dispute !== b.dispute) out.push(`${tag}：${a.dispute ? '原文标了争议，译文没标' : '译文标了争议，原文没有'}`);
    if (a.todo !== b.todo) out.push(`${tag}：${a.todo ? '原文有「待核实」，译文没有' : '译文有「待核实」，原文没有'}`);

    // 数字：收益、成本、来源三栏逐个对。全书可核对性的底座，一个都不许动
    // 数字：收益、成本、来源三栏逐个对。全书可核对性的底座，一个都不许动。
    // 备注是散文，「40 例」这类个数和量级本来就随语言变（「several dozen」），
    // 数字不许动的是前三个栏（CLAUDE.md 的原话：收益栏是全书可核对性的底座）。
    // 唯一的例外是量级换算：源文「167 万」在英文里只能写成 1,670,000，那不算改了数字。
    for (const f of ['gain', 'cost', 'src']){
      const A = a.numbers[f], B = b.numbers[f];
      const allowed = new Set([...A.ns, ...A.scale]);
      const miss = [...new Set(A.ns.filter(x => !B.ns.includes(x)))];
      const extra = [...new Set(B.ns.filter(x => !allowed.has(x)))];
      if (miss.length) out.push(`${tag}：${label(D, f)}栏少了原文的数字 ${miss.join('、')}`);
      if (extra.length) out.push(`${tag}：${label(D, f)}栏多了原文没有的数字 ${extra.join('、')}`);
    }

    for (const r of a.refs) if (!b.refs.includes(r)) out.push(`${tag}：指路「第 ${r}」不见了，条号节号要照抄`);
    if (a.links !== b.links) out.push(`${tag}：来源和备注里有 ${b.links} 个链接，原文 ${a.links} 个`);
    return out;
  },
};

export { FIELDS, numbersOf, refsOf, LOCALES };
