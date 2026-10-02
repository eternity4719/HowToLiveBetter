// 上游改了中文原文之后，把已有的译文搬到新的条号上。
//
//   node tools/i18n/rebase.mjs <旧 book 目录>            # 两种语言
//   node tools/i18n/rebase.mjs <旧 book 目录> en
//   node tools/i18n/rebase.mjs <旧 book 目录> --dry     # 只报不写
//
// 为什么不能直接跑 split.mjs：删条并条之后条号整体顺延，按条号配会把译文挂到
// 别的条目上（上游这次删了 9 条、第 2 节两条并成一条）。resplit.mjs 也是按条号
// 配的，并条之后会把两条并成一条的译文拆错。这个脚本按条目标题配——标题是作者
// 写的动作句，改写之外一般不动。
//
// 搬的时候要改两处，两处都会让译文对不上：
// ① 条号本身（### 12. → ### 11.）。
// ② 译文里的指路条号。中文原文第 2 节删了一条，原文里「第 2 节第 30 条」跟着改成
//    第 29 条，译文里的 "item 30 in section 2" 不同改就是指错条目，而 check.mjs
//    是拿译文的指路跟中文原文逐个比，条号对不上直接失败。节号不变（34 节没增减），
//    所以只改条号。
//
// 三种结果：标题和正文都没变的，译文搬过去（条号和指路改好）；标题变了的、正文
// 变了的、新增的，译文那边留中文原文，等着人翻。搬不动的（并条之后指路指向的条号
// 在新原文里没有了、跨删除点的区间引用）报出来，不猜。
//
// 跑完 join.mjs 一校就知道有没有搬坏。

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALES, SOURCE, strings } from '../site/locales.mjs';
import { splitSection } from './split.mjs';


const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = p => readFileSync(resolve(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
const write = (p, t) => {
  mkdirSync(resolve(ROOT, p).replace(/\/[^/]+$/, ''), { recursive: true });
  writeFileSync(resolve(ROOT, p), t);
};

const argv = process.argv.slice(2);
const dry = argv.includes('--dry');
const baseDir = argv.find(a => !a.startsWith('--'));
const locales = argv.includes('--all') || !argv.some(a => LOCALES.some(l => l.code === a))
  ? LOCALES.map(l => l.code).filter(c => c !== SOURCE.code)
  : argv.filter(a => LOCALES.some(l => l.code === a));
if (!baseDir || !existsSync(resolve(ROOT, baseDir))) {
  console.error('用法：node tools/i18n/rebase.mjs <旧 book 目录> [en|vi] [--dry]');
  process.exit(2);
}

/** 一份正文拆成「头部 + 按条号索引的条目」，条目是行数组 */
function pieces(text) {
  const lines = text.split('\n');
  const at = lines.map((l, i) => (/^### /.test(l) ? i : -1)).filter(i => i >= 0);
  let end = lines.length;
  while (end > 0 && !lines[end - 1].trim()) end--;
  if (end > 0 && /^\[.*\]\(/.test(lines[end - 1])) end--;
  const head = at.length ? lines.slice(0, at[0]) : [];
  const byN = new Map();
  for (let k = 0; k < at.length; k++){
    const stop = k + 1 < at.length ? at[k + 1] : end;
    const seg = lines.slice(at[k], stop);
    while (seg.length && !seg[seg.length - 1].trim()) seg.pop();
    byN.set(/^### (\d+)\./.exec(seg[0])[1], seg);
  }
  return { head, byN, tail: lines.slice(end) };
}

const titleOf = l => l.replace(/^### \d+\.\s*/, '').trim();
const bodyOf = seg => seg.slice(1).join('\n');
const keyOf = seg => bodyOf(seg).replace(/\s+/g, '').slice(0, 60);
const squash = s => s.replace(/\s+/g, '');

// ---------------------------------------------------------------- 1. 条号映射
// 每节一张 oldNum -> newNum。搬得动的才进这张表：并条和真改写的那几条搬不过去，
// 指路指着它们的地方一并报出来（见下面的 dangling）。
const srcDir = (SOURCE.contentDir ? SOURCE.contentDir + '/' : '') + 'book/';
const secs = readdirSync(resolve(ROOT, srcDir)).filter(x => x.endsWith('.md')).sort();
const secNames = secs.map(f => f.replace(/\.md$/, ''));
const targetSecName = n => secNames[Number(n) - 1];   // 「第 N 节」的第 N 个文件名
const maps = {};        // { 节名: Map<旧条号, 新条号> }
const fresh = {};       // { 节名: [新条号] }  要人翻的
const rewords = [];     // [{ 节名, 条号 }]  正文真改了、译文要重翻的
const pending = [];     // 配好对、待验正文的
const zhXref = strings(SOURCE.code).xref;
for (const f of secs){
  const name = f.replace(/\.md$/, '');
  const baseFile = `${baseDir}/${f}`;
  if (!existsSync(resolve(ROOT, baseFile))) { console.log(`跳过 ${f}：旧原文里没有这一节`); continue; }
  const oldE = pieces(read(baseFile));
  const newE = pieces(read(srcDir + f));
  const byTitle = new Map(), byKey = new Map();
  for (const [n, seg] of oldE.byN){
    const t = titleOf(seg[0]);
    if (!byTitle.has(t)) byTitle.set(t, []);
    byTitle.get(t).push({ n, seg });
    if (!byKey.has(keyOf(seg))) byKey.set(keyOf(seg), []);
    byKey.get(keyOf(seg)).push({ n, seg });
  }
  const claimed = new Set();
  const paired = [];   // [新条号, 旧条号, 新正文, 旧正文]
  const todo = [];
  for (const [n, seg] of newE.byN){
    const t = titleOf(seg[0]);
    const hit = (byTitle.get(t) || []).find(x => !claimed.has(x.seg) && keyOf(x.seg) === keyOf(seg))
             ?? (byTitle.get(t) || []).find(x => !claimed.has(x.seg))
             ?? (byKey.get(keyOf(seg)) || []).find(x => !claimed.has(x.seg));
    if (!hit){ todo.push(n); continue; }
    claimed.add(hit.seg);
    paired.push([n, hit.n, bodyOf(seg), bodyOf(hit.seg)]);
  }
  maps[name] = new Map(paired.map(([n, o]) => [o, n]));
  fresh[name] = todo;
  pending.push({ name, paired, map: maps[name] });
}

// 配好对之后逐条验：标题对得上但正文动了的，要分两种——只是指路条号跟着顺延
// （译文照同样的规则改一下就行），还是真的改了内容（译文得重翻）。判据是把旧
// 正文里的指路按映射改一遍，再跟新正文逐字比：一样就是顺延，不一样就是真改了。
// 先把全部映射建好再验：一条的指路可能指着同一节里排在它后面的条目，那条的映射
// 这时还没建，边建边验会把它当成「指路没动」。
for (const { name, paired, map } of pending){
  const edited = [];
  for (const [n, o, newBody, oldBody] of paired){
    if (squash(oldBody) === squash(newBody)) continue;
    const allow = sourceRefs(newBody, zhXref, name);
    if (squash(remapRefs(oldBody, zhXref, name, map, allow, [])) === squash(newBody)) continue;
    map.delete(o);
    fresh[name].push(n);
    edited.push(n);
  }
  if (edited.length) rewords.push(`${name} 第 ${edited.join('、')} 条`);
}

// ---------------------------------------------------------------- 2. 改指路条号
// 各语言的指路写法从 locales/<code>.json 的 xref 拿，和检索页把「第 X 条」变成
// 可点引用、以及 structure.mjs 的 refsOf 是同一套正则，所以这里改的就是读者
// 真能点到的那几处。
//
// 数字一律逐个替换（\d+），分隔符原样留着——「items 8, 10 and 11」这种形状不该被
// 脚本改写成别的样子。区间另算，见下面的 findRanges。
function remapRefs(text, xref, secName, map, allow, dangling) {
  if (!xref) return text;
  let out = '', last = 0;
  for (const m of text.matchAll(new RegExp(xref.pattern, 'g'))){
    const g = m.groups ?? {};
    // 节号那组（sections / phần）不动：34 节没有增减
    const key = g.nums !== undefined ? 'nums' : g.nums2 !== undefined ? 'nums2' : g.nums3 !== undefined ? 'nums3' : null;
    if (!key) continue;
    const target = g.sec ? g.sec : null;             // 缺省就是本节
    const secOf = target ? targetSecName(target) : secName;
    const mapOf = target ? maps[secOf] : map;
    if (!mapOf){ continue; }                          // 指向的小节没了，原样留着
    const span = g[key];
    const sub = span.replace(/\d+/g, d => {
      // allow 是「中文原文这一条里当作条目引用写的号」，只有在里面才改。
      // 不这么卡住就是乱改：英文的 xref 正则里有一条光秃秃的 \bitems?\s+(\d+)，
      // 来源栏里「劳部发〔1994〕309 号，第 59 条」译成 "item 59" 也照样命中，
      // 那是法条条款号不是条目号，改了就把引用指到别的条目上（实测这一类有 7 处）。
      if (!allow.has(secOf + ':' + d)) return d;
      const nn = mapOf.get(d);
      if (nn === undefined){ dangling.push(`${secName} 译文指路「第 ${target ?? '本节'}${d} 条」，新原文里没有对应条目`); return d; }
      return String(nn);
    });
    out += text.slice(last, m.index) + m[0].replace(span, sub);
    last = m.index + m[0].length;
  }
  return out + text.slice(last);
}
/** 区间引用跨了删除点就不能逐个替换：「items 8 to 11」里的第 9 条要是被删了，
    新的应该写成「items 8, 10 and 11」，脚本猜不出该用哪种分隔，报出来让人看。 */
function findRanges(text, xref, secName, allow) {
  if (!xref) return [];
  const out = [];
  for (const m of text.matchAll(new RegExp(xref.pattern, 'g'))){
    const g = m.groups ?? {};
    const key = g.nums !== undefined ? 'nums' : g.nums2 !== undefined ? 'nums2' : g.nums3 !== undefined ? 'nums3' : null;
    if (!key) continue;
    const r = new RegExp(xref.rangeRe).exec(g[key]);
    if (!r) continue;
    const a = +r[1], b = +r[2];
    const secOf = g.sec ? targetSecName(g.sec) : secName;
    // 和 remapRefs 同一个卡口：原文没把它当条目引用的（多半是法条条款号），不看
    if (![...Array(b - a + 1)].every((_, i) => allow.has(secOf + ':' + (a + i)))) continue;
    const map = maps[secOf];
    if (!map) continue;
    const moved = [];
    for (let i = a; i <= b; i++) if (map.get(i) !== i) moved.push(`${i}->${map.get(i) ?? '没了'}`);
    if (moved.length) out.push(`${secName}：区间 ${m[0]}（${moved.join('、')}）`);
  }
  return out;
}

/** 一段正文里当条目引用写出来的号，格式「节名:条号」，本节的写本节名。
    xref 传哪门语言的写法就按那门语言解析——中文原文传中文的，译文传译文的
    （结构检查那边就是这么比的，所以这套判定要跟 refsOf 一致）。

    这里没有直接用 structure.mjs 的 refsOf：它把节号和条号拼成一个字符串
    （「第 6 节第 26 条」出来是 's626'，节号 6 条号 26 连在一起），本节与别节
    的引用混在一处，比对时要拆开才分得清。拼起来的形状本身也有歧义——第 13 节
    第 22 条和第 1 节第 322 条都出来是 's1322'——所以这里按 xref 的分组各读各的，
    区间和分隔符的处理照 refsOf 那份（listSep / rangeRe）。 */
function sourceRefs(body, xref, secName) {
  const out = new Set();
  if (!xref) return out;
  const range = new RegExp(xref.rangeRe);
  const sep = new RegExp(xref.listSep);
  for (const m of String(body).matchAll(new RegExp(xref.pattern, 'g'))){
    const g = m.groups ?? {};
    if (g.secs !== undefined){                       // 「第 8、24 节」：只有节号
      for (const s of String(g.secs).split(sep)) if (s.trim()) out.add(targetSecName(s.trim()));
      continue;
    }
    const key = g.nums !== undefined ? 'nums' : g.nums2 !== undefined ? 'nums2' : g.nums3 !== undefined ? 'nums3' : null;
    if (!key) continue;
    const sec = g.sec ? targetSecName(g.sec) : secName;
    if (!sec) continue;
    const spec = String(g[key]).trim();
    const push = t => out.add(sec + ':' + t);
    if (range.test(spec)){                          // 「第 8 到 11 条」摊成一个一个
      const r = range.exec(spec);
      const a = +r[1], b = +r[2];
      if (b >= a && b - a <= 40) for (let i = a; i <= b; i++) push(i);
      continue;
    }
    for (const part of spec.split(sep)){ const t = part.trim(); if (t) push(t); }
  }
  return out;
}

// ---------------------------------------------------------------- 3. 搬
let carried = 0, untranslated = 0;
const allDangling = [], allRanges = [], heads = [], stale = [];
if (rewords.length){
  console.log(`\n正文真改了、译文要重翻 ${rewords.length} 处:`);
  for (const r of rewords) console.log('  ' + r);
}
for (const locale of locales){
  const L = LOCALES.find(x => x.code === locale);
  const S = strings(locale);
  const tgtDir = (L.contentDir ? L.contentDir + '/' : '') + 'book/';
  for (const f of secs){
    const name = f.replace(/\.md$/, '');
    const bookFile = tgtDir + f;
    if (!existsSync(resolve(ROOT, bookFile))) { console.log(`跳过 ${locale} ${f}：译文目录里没有`); continue; }
    const oldBook = pieces(read(bookFile));
    const cut = splitSection(read(srcDir + f));
    const map = maps[name];
    if (!map) continue;

    const dangling = [], ranges = [];
    // 译文的条号就是旧原文的条号（两边条目数 run 前已核对一致），按号取译文，
    // 再用 map 把旧号改成新号。反查 map 得到旧号：新号到旧号。
    const newToOld = new Map([...map].map(([o, n]) => [n, o]));
    const blocks = cut.blocks.map((entries, i) => entries.map(entryLines => {
      const num = /^### (\d+)\./.exec(entryLines[0])[1];
      const oldNum = newToOld.get(num);
      const seg = oldNum !== undefined ? oldBook.byN.get(oldNum) : null;
      if (!seg){ untranslated++; return entryLines; }   // 新增或改写的，留中文等着翻
      // 卡口用旧原文这一条的指路，不是新原文那一条的。译文里的号是旧号，
      // 「这是不是条目引用」这件事也只有旧原文说了算（法条条款号混在同一段里）。
      // 用新原文的号去卡旧号，删条之后两边对不上，译文里的旧号就会一个都不改——
      // 比报错更坏，指路静默指错条目还不报。
      const allow = sourceRefs(bodyOf(seg), zhXref, name);
      const rest = remapRefs(bodyOf(seg), S.xref, name, map, allow, dangling);
      ranges.push(...findRanges(bodyOf(seg), S.xref, name, allow));
      // 搬过来的译文，指路必须跟新原文对得上。这是 rebase 自己的一份校验：
      // 上游删条并条之后没跟着改的指路（指向被删掉或被并掉的那条），结构检查
      // 那边只会说「指路不见了」，看不出是哪一处指错了条目。这里点名报出来。
      // 译文那边要用它自己那门语言的指路写法解析，否则解析不出来，等于没比。
      const want = sourceRefs(bodyOf(entryLines), zhXref, name);
      const got = sourceRefs(rest, S.xref, name);
      for (const r of want) if (!got.has(r))
        stale.push(`${locale} ${name} 第 ${num} 条：译文的指路没有新原文的「${r}」，原文指向的那条被删或被并了`);
      carried++;
      // 标题行只改条号，标题文字是译文，原样留（节标题另说，见下面 head 的处理）
      return [`### ${num}. ${titleOf(seg[0])}`, ...rest.split('\n')];
    }));

    // 节首（第 0 块里的回目录那行 + 「# N. 节名」+ 导读）单独判。判据比的是
    // 旧原文和现原文的节首，不是译文和现原文——译文本来就是另一种语言。
    // 三档：原文没动就搬译文节首；只是指路条号顺延（导读里「第 20 条」改成
    // 第 19 条），译文节首照同样的规则改一下就行；真加了句子就留中文待翻——
    // 节名或导读一动，侧栏（读 README）和正文两处都得改，只改一处 check.mjs
    // 就会拿目录里的节名跟正文比。
    const oldZhHead = pieces(read(`${baseDir}/${f}`)).head.join('\n');
    const newZhHead = cut.head.join('\n');
    const norm = s => s.replace(/\s+/g, '');
    let head = newZhHead;
    if (norm(oldZhHead) === norm(newZhHead)) head = oldBook.head.join('\n');
    else {
      const empty = [], d = [];
      const renum = remapRefs(oldZhHead, zhXref, name, map, sourceRefs(oldZhHead, zhXref, name), empty);
      if (norm(renum) === norm(newZhHead)){
        head = remapRefs(oldBook.head.join('\n'), S.xref, name, map, sourceRefs(newZhHead, zhXref, name), d);
        heads.push(`${locale} ${name}：节首只是指路条号顺延，已按映射改好`);
      } else heads.push(`${locale} ${name}：节首（节名或导读）真改了，留在中文待翻`);
    }
    allDangling.push(...dangling.map(d => `${locale} ${d}`));
    allRanges.push(...ranges.map(r => `${locale} ${r}`));

    const dir = `.i18n/${locale}/${name}`;
    if (dry){
      console.log(`${locale} ${name}：${blocks.length} 块，待翻 ${fresh[name].length} 条`);
      continue;
    }
    rmSync(resolve(ROOT, dir), { recursive: true, force: true });
    blocks.forEach((body, i) => {
      write(`${dir}/part${String(i).padStart(2, '0')}.md`,
        (i === 0 ? head + '\n' : '') + body.flat().join('\n') + '\n');
    });
    if (cut.tailLink) write(`${dir}/tail.txt`, cut.tailLink + '\n');
    console.log(`${locale} ${name}：${blocks.length} 块，搬过 ${blocks.flat().length - fresh[name].length} 条，待翻 ${fresh[name].length} 条（第 ${fresh[name].join('、')} 条）`);
  }
}

console.log(`\n搬过 ${carried} 条，留中文待翻 ${untranslated} 条`);
if (allDangling.length){ console.log(`\n指路搬不动的 ${allDangling.length} 处（要人工看）:`); for (const d of [...new Set(allDangling)]) console.log('  ' + d); }
if (stale.length){ console.log(`\n译文的指路跟新原文对不上 ${stale.length} 处（上游删条并条后没跟着改，要人工定）:`); for (const s of [...new Set(stale)]) console.log('  ' + s); }
if (allRanges.length){ console.log(`\n区间引用跨了删除点 ${allRanges.length} 处（要人工改写法）:`); for (const r of [...new Set(allRanges)]) console.log('  ' + r); }
if (heads.length){ console.log(`\n节首要人工看 ${heads.length} 处:`); for (const h of [...new Set(heads)]) console.log('  ' + h); }
