// 把「正文真改了」的条目拆到句子级：报出每条多了一句、删了一句还是整段换了，
// 好按工作量分派翻译任务。
//
//   node tools/i18n/diff-delta.mjs <旧 book 目录>
//   node tools/i18n/diff-delta.mjs <旧 book 目录> en
//
// 判据和 rebase.mjs 一致：按标题配对，按映射改过指路条号之后逐字比，还是不一样
// 就是真改了。输出按「只加了一句」「只删了一句」「整段重写」三档归类。

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALES, SOURCE, strings } from '../site/locales.mjs';
import { refsOf } from './structure.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = p => readFileSync(resolve(ROOT, p), 'utf8').replace(/\r\n/g, '\n');

const argv = process.argv.slice(2);
const baseDir = argv[0];
const only = argv[1] ?? null;          // 'en' / 'vi' / null（全看）
if (!baseDir || !existsSync(resolve(ROOT, baseDir))) {
  console.error('用法：node tools/i18n/diff-delta.mjs <旧 book 目录> [en|vi]');
  process.exit(2);
}

function pieces(text) {
  const lines = text.split('\n');
  const at = lines.map((l, i) => (/^### /.test(l) ? i : -1)).filter(i => i >= 0);
  const byN = new Map();
  for (let k = 0; k < at.length; k++) {
    const stop = k + 1 < at.length ? at[k + 1] : lines.length;
    const seg = lines.slice(at[k], stop);
    while (seg.length && !seg[seg.length - 1].trim()) seg.pop();
    byN.set(/^### (\d+)\./.exec(seg[0])[1], seg);
  }
  return byN;
}

/** 一条拆成 { 字段名: 内容 }，注释行和标题行单放 */
function fields(seg, S) {
  const out = { __tag: '' };
  for (const l of seg) {
    const tag = /^<!--\s*成本标签:\s*(.*?)\s*-->$/.exec(l);
    if (tag) { out.__tag = tag[1]; continue; }
    if (/^### /.test(l)) { out.__title = l; continue; }
    for (const [k, name] of Object.entries(S.fields)) {
      const m = new RegExp('^- ' + name.replace(/[：:]$/, '') + '[：:](.*)$').exec(l);
      if (m) { out[k] = m[1]; break; }
    }
  }
  return out;
}

/** 中文字符串切句：句末标点加下一段引号/括注收尾。够用就行，判据是人读。 */
const sentences = s => String(s ?? '')
  .split(/(?<=[。；！？])/)
  .map(x => x.trim())
  .filter(Boolean);

/** 按句配对：旧句里出现在新句中的算没动，剩下的就是删的/加的 */
function delta(oldS, newS) {
  const setOld = new Set(sentences(oldS));
  const setNew = new Set(sentences(newS));
  return {
    added: sentences(newS).filter(x => !setOld.has(x)),
    removed: sentences(oldS).filter(x => !setNew.has(x)),
  };
}

const zhS = strings(SOURCE.code);
const srcDir = (SOURCE.contentDir ? SOURCE.contentDir + '/' : '') + 'book/';
const secs = readdirSync(resolve(ROOT, srcDir)).filter(x => x.endsWith('.md')).sort();
const secNames = secs.map(f => f.replace(/\.md$/, ''));

const buckets = { addOnly: [], mixed: [], rewrite: [] };
let total = 0;

for (const f of secs) {
  const baseFile = `${baseDir}/${f}`;
  if (!existsSync(resolve(ROOT, baseFile))) continue;
  const oldE = pieces(read(baseFile));
  const newE = pieces(read(srcDir + f));
  const name = f.replace(/\.md$/, '');
  const map = new Map();
  // 先按标题配一遍，得出本节 old->new
  const byTitle = new Map();
  for (const [n, seg] of oldE) {
    const t = seg[0].replace(/^### \d+\.\s*/, '').trim();
    if (!byTitle.has(t)) byTitle.set(t, []);
    byTitle.get(t).push({ n, seg });
  }
  const claimed = new Set();
  const pairs = [];
  for (const [n, seg] of newE) {
    const t = seg[0].replace(/^### \d+\.\s*/, '').trim();
    const hit = (byTitle.get(t) || []).find(x => !claimed.has(x.seg));
    if (!hit) continue;
    claimed.add(hit.seg); pairs.push([n, hit.n, seg, hit.seg]);
  }
  for (const [n, o, seg] of pairs) map.set(o, n);

  // 指路条号改写（中文原文自己那一份）
  const renum = t => {
    let out = '', last = 0;
    for (const m of String(t).matchAll(new RegExp(zhS.xref.pattern, 'g'))) {
      const g = m.groups ?? {};
      const key = g.nums !== undefined ? 'nums' : g.nums2 !== undefined ? 'nums2' : g.nums3 !== undefined ? 'nums3' : null;
      if (!key) continue;
      const allow = new Set(refsOf(t, zhS.xref).map(r => (r.startsWith('s') ? r.slice(1) : r.startsWith('*') ? r.slice(1) : null)).filter(Boolean));
      const span = g[key];
      const sub = span.replace(/\d+/g, d => (allow.has(d) && map.get(d) ? String(map.get(d)) : d));
      out += String(t).slice(last, m.index) + m[0].replace(span, sub);
      last = m.index + m[0].length;
    }
    return out + String(t).slice(last);
  };

  for (const [n, o, newSeg, oldSeg] of pairs) {
    const nf = fields(newSeg, zhS), of = fields(oldSeg, zhS);
    // 逐栏比：只差指路条号的不算改动
    const diffFields = [];
    for (const k of new Set([...Object.keys(nf), ...Object.keys(of)])) {
      if (k === '__title') continue;
      const a = renum(of[k] ?? '').replace(/\s+/g, '');
      const b = (nf[k] ?? '').replace(/\s+/g, '');
      if (a !== b) diffFields.push(k);
    }
    if (!diffFields.length) continue;
    total++;

    let addOnly = true, big = false;
    const detail = [];
    for (const k of diffFields) {
      const d = delta(renum(of[k] ?? ''), nf[k] ?? '');
      if (d.removed.length) addOnly = false;
      if (d.added.some(x => x.length > 60)) big = true;
      detail.push({ k, ...d });
    }
    const label = `${name} 第 ${n} 条`;
    const row = { label, fields: detail };
    if (addOnly && !big) buckets.addOnly.push(row);
    else if (big || d2heavy(detail)) buckets.rewrite.push(row);
    else buckets.mixed.push(row);
  }
}

/** 增删都有的，且删掉的句子不短——多半是整段重写，人读一遍比逐句补更省事 */
function d2heavy(detail) {
  return detail.some(d => d.removed.some(x => x.length > 40) && d.added.some(x => x.length > 40));
}

for (const [k, v] of Object.entries(buckets)) {
  console.log(`\n=== ${k}（${v.length} 条）===`);
  for (const r of v) {
    console.log(`\n${r.label}`);
    for (const d of r.fields) {
      console.log(`  [${d.k}]`);
      for (const a of d.added) console.log(`    + ${a.slice(0, 110)}`);
      for (const a of d.removed) console.log(`    - ${a.slice(0, 110)}`);
    }
  }
}
console.log(`\n正文真改了 ${total} 条：只加 ${buckets.addOnly.length}，增删都有 ${buckets.mixed.length}，整段重写 ${buckets.rewrite.length}`);