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

// 中文数字转阿拉伯数字：法条编号在原文里是汉字（「第一千零四十五条」），译文按 BRIEF
// 要求写成「Điều 1045」——那 1045 是原文就有的那个数，不是译文自己加的。
// 不转换的话，越南文这一栏每条法条都报「多了原文没有的数字」，
// 英文因为把编号拼成 "one thousand and forty-five" 反而躲过去了，纯属侥幸。
const CN_DIGITS = { 零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
const CN_UNITS = { 十: 10, 百: 100, 千: 1000 };
function cnNumber(s) {
  // 「一千零四十五」= 1045：「零」不占位，只表示这一段没读数
  let total = 0, section = 0, cur = 0;
  for (const ch of s){
    if (ch in CN_DIGITS){ cur = CN_DIGITS[ch]; continue; }
    const u = CN_UNITS[ch];
    if (!u) return null;                     // 万、亿之类这里不拆（法条编号里不出现）
    // 「十五」开头没有「一」，十就是 10 不是 0+10
    section += (cur === 0 && u === 10 ? 1 : cur) * u;
    cur = 0;
  }
  total = section + cur;
  return total > 0 ? String(total) : null;
}

/** 一栏里所有法条编号里的中文数字换算成的阿拉伯数字。
 *
 * 原文的编号是汉字（「第一千零四十五条」），译文按 BRIEF 要求写成「Điều 1045」——
 * 那个 1045 是原文就有的，不算译文自己加的数。
 *
 * 一条法条可以并排写：「第一千零五十二、一千零五十三条」「第十六、十七条」——
 * 「第」只在头一个，后面几个是顿号连着的。所以先把「第…条」整串切出来（串里
 * 允许顿号继续接数字），再按顿号逐个读。只认「第 + 数字 + 条」的话，第二、三个
 * 编号全都读不到，译文里对应的数字就被报成「多了原文没有的」（越南文那边每条
 * 法条都踩一次）。
 */
function cnNumbersOf(field) {
  const out = new Set();
  const D = '[零〇一二三四五六七八九十百千]';
  const run = new RegExp(`第${D}{1,8}(?:[、,，]${D}{1,8})*[条款项号章节]`, 'g');
  for (const m of String(field).matchAll(run)){
    for (const p of m[0].slice(1).split(/[、,，]/)){
      const v = cnNumber(p.replace(/[条款项号章节]$/, ''));
      if (v) out.add(v);
    }
  }
  return [...out];
}

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
  // trimStart：字段名和内容之间可能有空格（「- Ghi chú: Tranh cãi. …」，越南文那边
  // 就是这样写的），不带这个 trim 的话 ^Tranh cãi 匹配不上，一条争议条目会被报成
  // 「原文标了争议，译文没标」。锚点还是 ^，正文中间提到争议不算。
  e.dispute = new RegExp('^' + S.dispute).test((e.fields.note ?? '').trimStart());
  e.todo = S.todo.some(w => all.includes(w) || (e.fields.cost ?? '').includes(w));
}

/** 两种语言的字段名在页面上叫什么，报告里好读 */
function label(S, f) { return S.fields[f].replace(/[：:]$/, ''); }

/**
 * 逐条比。返回问题清单（空数组就是这块对了）。dstLabel 是给报告前缀用的语言名。
 * 这一套就是 check.mjs 的判据，抽出来是为了 join 逐块校时用同一份。
 */
/** 汉字。「」《》里照抄的法条名、书名不算漏译（BRIEF 规则 6 明确允许）。 */
const han = s => /[㐀-鿿]/.test(s);
/** 剔掉允许照抄的部分，再看还有没有汉字——有就是漏译。 */
const titleBare = s => String(s)
  .replace(/「[^」]*」|『[^』]*』|《[^》]*》/g, '')
  .replace(/（[^）]*）/g, '')
  .replace(/\([^)]*\)/g, '')
  .replace(/<https?:\/\/[^>]*>/g, '')
  .trim();

export const STRUCT = {
  ALWAYS, FIELDS,
  /** 整节的判据：节号、节标题、导读。条目逐条比是 compare()。
    *
    * 节标题和导读以前没人查，join.mjs 又拿中文原文那一份盖在译文前面（2026-10-02 修），
    * 结果 en 和 vi 一半的节标题是中文的，有的还多出一份，页面上那一节渲染两遍。
    * 这两条都是机器查得出来的：节标题跟原文一字不差就是没翻；导读里只要还有
    * 整段没翻的中文就是没翻完。 */
  // `toc` 是那门语言 README 目录里的节名。给了就要求译本的节标题跟它一字不差：
  // 页面侧栏读的是 README，book 文件的节标题是另一处，同一节说两句话的话读者的
  // 两处搜索对不上，这层该拦。
  compareSection(a, b, tag, toc) {
    const out = [];
    if (a.n !== b.n) out.push(`${tag}：节号是 ${b.n}，原文 ${a.n}`);
    if (!b.title.trim()) out.push(`${tag}：节标题是空的`);
    else if (a.title && b.title === a.title)
      out.push(`${tag}：节标题「${b.title}」跟中文原文一字不差，这一行没翻`);
    else if (toc && b.title !== toc)
      out.push(`${tag}：节标题「${b.title}」跟目录里的「${toc}」不一致`);

    // 导读逐段比。节首的导读是散文，但「整段还是中文」是查得出来的：把一行里
    // 照抄的中文（法条名、书名）剔掉之后，剩下的还是汉字，就是没翻。
    // 只在原文有导读时查，段落数不强制——译文可以合并或拆开自然段。
    if (a.intro.length && !b.intro.length) out.push(`${tag}：导读不见了，原文有 ${a.intro.length} 段`);
    for (const line of b.intro){
      if (!han(line)) continue;   // 整段没有汉字，不用往下剔了
      // 照抄的部分：法条名、书名、括注、链接。剩下的还有汉字，就是整段还没翻。
      // 只剔「紧贴汉字、含汉字」的这些形式——英文里写 (breaking line) 是普通括注，
      // 一并剔掉会把真漏译的段落放过去。
      const s = line
        .replace(/^\[.*\]\(.*\)$/, '')                                  // 回目录那行
        .replace(/「[^」]*」|『[^』]*』|《[^》]*》/g, '')                // 照抄的法条名、书名
        .replace(/\[[^\]]*\]\([^)]*\)/g, '')                             // 照抄的链接
        .replace(/[（(][^)）]*[㐀-鿿][^)）]*[）)]/g, '')                  // 含汉字的括注
        .trim();
      if (han(s)) out.push(`${tag}：导读里这一段还没翻：「${line.slice(0, 30)}…」`);
    }
    return out;
  },
  compare(a, b, tag) {
    const out = [];
    const S = strings(SOURCE.code);
    const D = strings(b._locale ?? SOURCE.code);
    if (a.n !== b.n) out.push(`${tag}：条号是 ${b.n}，原文 ${a.n}`);
    if (!b.title.trim()) out.push(`${tag}：标题是空的`);
    // 标题正文不能还是中文（法条名、书名、括注里的照抄不算——那些是 BRIEF 规则 6 允许的）。
    // 条正文逐栏校了六遍，标题这一行以前没人管，翻漏了就一直漏着
    // （2026-10-02 在 vi 02 和 vi 20 各查出来几条）。
    else if (a.title && han(titleBare(b.title)) && b.title === a.title)
      out.push(`${tag}：标题「${b.title}」跟中文原文一字不差，这一行没翻`);

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
    // 两个例外：
    // ① 量级换算：源文「167 万」在英文里只能写成 1,670,000，那不算改了数字。
    // ② 中文数字：源文「第一千零四十五条」按 BRIEF 要写成「Điều 1045」，
    //    那个 1045 是原文就有的，放进允许名单（见 cnNumber）。
    for (const f of ['gain', 'cost', 'src']){
      const A = a.numbers[f], B = b.numbers[f];
      const allowed = new Set([...A.ns, ...A.scale, ...cnNumbersOf(a.fields[f] ?? '')]);
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
