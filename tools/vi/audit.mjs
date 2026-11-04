// 越南语版结构审计：把中文原文和越南语译文按「节 + 条号」对齐，检查
// 条目数、字段齐全、数字是否漏、链接是否原样、中文残留、译文长度比例。
// 只读，输出 vi/qa/audit.json 和一份摘要。用法：node tools/vi/audit.mjs [--json]
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { ROOT } from '../lib/book.mjs';

const BOOK_ZH = resolve(ROOT, 'book');
const BOOK_VI = resolve(ROOT, 'vi/book');
const OUT = resolve(ROOT, 'vi/qa');

const ZH_TITLE = /^# (\d+)\.\s*(.+)$/m;
const num = s => s.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xfee0));

function parseEntries(text) {
  const parts = text.split(/^### /m);
  const intro = parts.shift() ?? '';
  const entries = parts.map(p => {
    const nl = p.indexOf('\n');
    const head = nl < 0 ? p : p.slice(0, nl);
    const body = nl < 0 ? '' : p.slice(nl + 1);
    const m = head.match(/^(\d+)\.\s*(.*)$/);
    return { no: m ? Number(m[1]) : null, title: m ? m[2] : head.trim(), body, raw: p };
  });
  return { intro, entries };
}

// 中文字段名 → 越南语字段名
const FIELDS = [
  ['成本', 'Chi phí'],
  ['说人话', 'Nói dễ hiểu'],
  ['收益', 'Lợi ích'],
  ['证据等级', 'Mức chứng cứ'],
  ['来源', 'Nguồn'],
  ['备注', 'Ghi chú'],
];

function fieldMap(body, labels) {
  const out = {};
  let cur = null;
  for (const line of body.split('\n')) {
    const m = line.match(/^- ([^：:]+)[：:]\s*(.*)$/);
    if (m && labels.includes(m[1].trim())) { cur = m[1].trim(); out[cur] = m[2]; continue; }
    if (m) { cur = null; continue; }
    if (cur) out[cur] += '\n' + line;
  }
  return out;
}

const parseNum = t => {
  if (t.includes(',') && t.includes('.')) return Number(t.replace(/\./g, '').replace(',', '.'));
  if (t.includes(',')) {
    // «1,234» khó phân biệt nghìn hay thập phân; coi là thập phân trừ khi có đúng 3 chữ số và phần nguyên dài
    const [a, b] = t.split(',');
    return b.length === 3 && a.length > 1 ? Number(a + b) : Number(a + '.' + b);
  }
  if (t.includes('.')) {
    const [a, b] = t.split('.');
    if (b.length === 3 && a.length > 1) return Number(a + b);
    return Number(t);
  }
  return Number(t);
};
const numbers = s => {
  const expanded = num(s)
    .replace(/(\d+(?:[.,]\d+)*)\s*(万|亿)/g, (m, n, u) => String(Math.round(parseNum(n) * (u === '万' ? 1e4 : 1e8))))
    .replace(/(\d+(?:[.,]\d+)*)\s*(trăm triệu|trăm nghìn|nghìn tỷ)/gi, (m, n, u) => String(Math.round(parseNum(n) * ({ 'trăm triệu': 1e8, 'trăm nghìn': 1e5, 'nghìn tỷ': 1e12 }[u.toLowerCase()]))))
    .replace(/(\d+(?:[.,]\d+)*)\s*(nghìn|triệu|tỷ)/gi, (m, n, u) => String(Math.round(parseNum(n) * ({ 'nghìn': 1e3, 'triệu': 1e6, 'tỷ': 1e9 }[u.toLowerCase()]))));
  return [...expanded.matchAll(/\d+(?:[.,]\d+)*/g)].map(m => m[0].replace(/[.,]/g, ''));
};
const urls = s => (s.match(/https?:\/\/[^\s<>）)」】]+/g) ?? []).map(u => u.replace(/[.,;]+$/, ''));
const cjk = s => (s.match(/[\u3400-\u9fff]/g) ?? []);

const files = readdirSync(BOOK_ZH).filter(f => f.endsWith('.md')).sort();
const report = { generatedAt: new Date().toISOString(), chapters: [], totals: {} };
let tot = { zhEntries: 0, viEntries: 0, missing: 0, extra: 0, fieldMissing: 0, numMissing: 0, urlMissing: 0, cjkOutsideSource: 0, lowRatio: 0, highRatio: 0, sourceMismatch: 0, jargon: 0, introCjk: 0, titleCjk: 0 };

for (const [i, zf] of files.entries()) {
  const vf = readdirSync(BOOK_VI).filter(f => f.endsWith('.md')).sort()[i];
  if (!vf) { report.chapters.push({ zh: zf, vi: null, error: 'no vi file' }); continue; }
  const zhText = readFileSync(resolve(BOOK_ZH, zf), 'utf8');
  const viText = readFileSync(resolve(BOOK_VI, vf), 'utf8');
  const zh = parseEntries(zhText), vi = parseEntries(viText);
  const viByNo = new Map(vi.entries.map(e => [e.no, e]));
  const ch = { zh: zf, vi: vf, zhEntries: zh.entries.length, viEntries: vi.entries.length, missing: [], fieldMissing: [], numMissing: [], urlMissing: [], cjkOutsideSource: [], lowRatio: [], highRatio: [], sourceMismatch: [], jargon: [], introCjk: 0, titleCjk: 0 };
  ch.introCjk = cjk(vi.intro).length; tot.introCjk += ch.introCjk;
  tot.zhEntries += zh.entries.length; tot.viEntries += vi.entries.length;

  for (const ze of zh.entries) {
    const ve = viByNo.get(ze.no);
    if (!ve) { ch.missing.push(ze.no); tot.missing++; continue; }
    const zf2 = fieldMap(ze.body, FIELDS.map(f => f[0]));
    const vf2 = fieldMap(ve.body, FIELDS.map(f => f[1]));
    const zSrc = (zf2['来源'] ?? '').trim(), vSrc = (vf2['Nguồn'] ?? '').replace(/^Nguồn:\s*/, '').trim();
    if (zSrc !== vSrc) { ch.sourceMismatch.push(ze.no); tot.sourceMismatch++; }
    const plain = (vf2['Nói dễ hiểu'] ?? '');
    if (/\b(HR|RR|OR|IRR|SMR|CI|RCT)\b|hazard|meta-analysis|đoàn hệ|phân tích gộp|ý nghĩa thống kê/i.test(plain)) { ch.jargon.push(ze.no); tot.jargon++; }
    if (cjk(ve.title).length) { ch.titleCjk++; tot.titleCjk++; }
    for (const [zl, vl] of FIELDS) {
      if ((zf2[zl] ?? '').trim() && !(vf2[vl] ?? '').trim()) { ch.fieldMissing.push([ze.no, vl]); tot.fieldMissing++; }
    }
    // 数字：中文字段里的数字必须都能在越南语同一条目里找到（整条比对，不跨条）
    const zAll = Object.values(zf2).join('\n');
    const vAll = Object.values(vf2).join('\n');
    const vNums = new Set(numbers(vAll));
    const miss = [...new Set(numbers(zAll))].filter(n => !vNums.has(n));
    if (miss.length) { ch.numMissing.push([ze.no, miss]); tot.numMissing++; }
    // 链接：中文字段里的每个 URL 都要原样出现
    const vUrl = new Set(urls(vAll));
    const missU = [...new Set(urls(zAll))].filter(u => !vUrl.has(u));
    if (missU.length) { ch.urlMissing.push([ze.no, missU]); tot.urlMissing++; }
    // 中文字符只允许出现在来源栏
    const c = cjk(Object.entries(vf2).filter(([k]) => k !== 'Nguồn').map(([, v]) => v).join('\n'));
    if (c.length) { ch.cjkOutsideSource.push([ze.no, c.length]); tot.cjkOutsideSource += c.length; }
    // 长度比例：收益 / 说人话 / 备注 各自比
    for (const [zl, vl] of [['收益', 'Lợi ích'], ['说人话', 'Nói dễ hiểu'], ['备注', 'Ghi chú'], ['成本', 'Chi phí']]) {
      const zl2 = (zf2[zl] ?? '').trim().length, vl2 = (vf2[vl] ?? '').trim().length;
      if (zl2 >= 40 && vl2 > 0) {
        const r = vl2 / zl2;
        if (r < 0.55) ch.lowRatio.push([ze.no, vl, r.toFixed(2), zl2, vl2]);
        if (r > 2.6) ch.highRatio.push([ze.no, vl, r.toFixed(2), zl2, vl2]);
      }
    }
  }
  tot.lowRatio += ch.lowRatio.length; tot.highRatio += ch.highRatio.length;
  report.chapters.push(ch);
}

report.totals = tot;
mkdirSync(OUT, { recursive: true });
writeFileSync(resolve(OUT, 'audit.json'), JSON.stringify(report, null, 1));

if (!process.argv.includes('--json')) {
  console.log(`章节 ${report.chapters.length}，中文 ${tot.zhEntries} 条，越南语 ${tot.viEntries} 条`);
  console.log(`缺条 ${tot.missing}，缺字段 ${tot.fieldMissing}，缺数字的条 ${tot.numMissing}，缺链接的条 ${tot.urlMissing}`);
  console.log(`来源栏外的中文 ${tot.cjkOutsideSource} 字，偏短字段 ${tot.lowRatio}，偏长字段 ${tot.highRatio}`);
  console.log(`来源栏与原文不一致 ${tot.sourceMismatch} 条，说人话含研究行话 ${tot.jargon} 条，引文里中文 ${tot.introCjk} 字，标题含中文 ${tot.titleCjk} 条`);
  for (const c of report.chapters) {
    const flags = c.missing.length + c.numMissing.length + c.urlMissing.length + c.cjkOutsideSource.length + c.lowRatio.length + c.sourceMismatch.length + c.jargon.length;
    if (flags) console.log(`${c.zh} → ${c.vi}: 缺 ${c.missing.length}，数字 ${c.numMissing.length}，链接 ${c.urlMissing.length}，中文 ${c.cjkOutsideSource.length}，短 ${c.lowRatio.length}`);
  }
}
