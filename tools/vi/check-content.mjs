// Đối chiếu nội dung EPUB đã giải nén với nguồn vi/book: đủ chương, đủ mục, đúng tiêu đề,
// không trùng mục, không rỗng. 用法：node tools/vi/check-content.mjs [thư mục OEBPS]
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from '../lib/book.mjs';

const dir = resolve(process.argv[2] ?? '/tmp/vi-epub/OEBPS');
const bookDir = resolve(ROOT, 'vi/book');
const unesc = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const strip = s => unesc(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

const source = new Map();
for (const f of readdirSync(bookDir).filter(f => f.endsWith('.md')).sort()) {
  const no = Number(f.slice(0, 2));
  const text = readFileSync(resolve(bookDir, f), 'utf8');
  const entries = text.split(/^### /m).slice(1).map(b => {
    const i = b.indexOf('\n');
    return { no: Number((i < 0 ? b : b.slice(0, i)).match(/^(\d+)\./)?.[1]), title: (i < 0 ? b : b.slice(0, i)).replace(/^\d+\.\s*/, '').trim(), body: i < 0 ? '' : b.slice(i + 1) };
  });
  source.set(no, entries);
}

const issues = [];
let total = 0;
for (const [no, entries] of source) {
  const file = `ch${String(no).padStart(2, '0')}.xhtml`;
  let html;
  try { html = readFileSync(resolve(dir, file), 'utf8'); } catch { issues.push(`thiếu ${file}`); continue; }
  const htmlEntries = [...html.matchAll(/<h2 class="entry-title"><span class="entry-no">(\d+)<\/span>([\s\S]*?)<\/h2>/g)]
    .map(m => ({ no: Number(m[1]), title: strip(m[2]) }));
  if (htmlEntries.length !== entries.length) issues.push(`ch${no}: ${htmlEntries.length} mục trong EPUB, nguồn ${entries.length}`);
  const seen = new Set();
  for (const e of entries) {
    const h = htmlEntries.find(x => x.no === e.no);
    if (!h) { issues.push(`ch${no}: thiếu mục ${e.no}`); continue; }
    if (seen.has(e.no)) issues.push(`ch${no}: trùng mục ${e.no}`);
    seen.add(e.no);
    if (h.title !== e.title) issues.push(`ch${no} mục ${e.no}: tiêu đề khác («${h.title}» ≠ «${e.title}»)`);
    total++;
  }
  const bodyWords = strip(html).length;
  const srcLen = entries.reduce((n, e) => n + e.body.length, 0);
  if (bodyWords < srcLen * 1.05) issues.push(`ch${no}: văn bản EPUB ngắn bất thường (${bodyWords} so với ${srcLen})`);
}
const docs = readdirSync(dir).filter(f => /^doc\d+\.xhtml$/.test(f)).length;
console.log(`${source.size} chương, ${total} mục, ${docs} phụ lục; ${issues.length} vấn đề`);
for (const i of issues.slice(0, 20)) console.log('  - ' + i);
process.exit(issues.length ? 1 : 0);
