// Dựng EPUB 3 tiếng Việt từ vi/front, vi/book, vi/docs.
// 用法：node tools/vi/build-epub.mjs [输出路径]   默认 dist/HowToLiveBetter-vi.epub
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { resolve, posix, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { zip } from '../lib/zip.mjs';
import { Marked, Tokenizer } from 'marked';
import { ROOT } from '../lib/book.mjs';

const VI = resolve(ROOT, 'vi');
const OUT = resolve(ROOT, process.argv[2] ?? 'dist/HowToLiveBetter-vi.epub');
const BOOK_ID = 'urn:uuid:8f2a6d1c-4b7e-4c2a-9f61-2d7b8e5a3c10';
const NOW = new Date();
const SRC = JSON.parse(readFileSync(resolve(ROOT, 'vi/source.json'), 'utf8'));
const COMMIT = SRC.sourceCommit || (() => { try { return execSync('git rev-parse HEAD', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return ''; } })();
const BUILD_DATE = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'long' }).format(NOW);

const TITLE = 'Cẩm nang sống đáng giá';
const SUBTITLE = 'Đổi ít tiền, thời gian và sức lực lấy nhiều tuổi thọ, tiền bạc và tự do hơn';
const AUTHOR = 'eternity4719';
const REPO = 'https://github.com/eternity4719/HowToLiveBetter';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const plain = html => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

// ---------- đọc sách ----------
const bookFiles = readdirSync(resolve(VI, 'book')).filter(f => f.endsWith('.md')).sort();
const DOC_ORDER = [
  'cuoi-co-dang-khong.md', 'danh-muc-do-dung-khan-cap-gia-dinh.md', 'gap-nguoi-la-bi-nan-co-nen-dung-lai.md',
  'lam-nen-tang-can-nhung-giay-phep-gi.md', 'nhip-dong-ho-sinh-hoc-va-ca-dem.md', 'bi-cat-giam-roi-lam-gi-truoc.md',
  'viec-can-lam-truoc-va-sau-khi-sinh-con.md', 'vua-chan-doan-benh-man-tinh.md', 'truoc-khi-doi-viec-doi-thanh-pho.md',
];
const docFiles = DOC_ORDER.filter(f => existsSync(resolve(VI, 'docs', f)));

function splitEntries(text) {
  const parts = text.split(/^### /m);
  return { intro: parts.shift() ?? '', entries: parts.map(p => {
    const i = p.indexOf('\n');
    return { head: i < 0 ? p : p.slice(0, i), body: i < 0 ? '' : p.slice(i + 1) };
  }) };
}

const LABELS = ['Chi phí', 'Nói dễ hiểu', 'Lợi ích', 'Mức chứng cứ', 'Nguồn', 'Ghi chú'];
function parseFields(body) {
  const out = [];
  let cur = null;
  for (const line of body.split('\n')) {
    const m = line.match(/^- ([^:]+):\s*(.*)$/);
    if (m && LABELS.includes(m[1].trim())) { cur = { label: m[1].trim(), value: m[2] }; out.push(cur); continue; }
    if (m) { cur = null; continue; }
    if (cur) cur.value += '\n' + line;
  }
  return out;
}

const chapters = bookFiles.map((f, i) => {
  const text = readFileSync(resolve(VI, 'book', f), 'utf8').replace(/^\[[^\]]*\]\([^)]*\)\s*\n/, '');
  const hm = text.match(/^#\s+(\d+)\.\s*(.+)$/m);
  const no = hm ? Number(hm[1]) : i + 1;
  const title = hm ? hm[2].trim() : f;
  const { intro, entries } = splitEntries(text.slice(text.indexOf('\n', text.indexOf('# ')) + 1));
  return { file: `ch${String(no).padStart(2, '0')}.xhtml`, src: f, no, title, intro: intro.trim(), entries: entries.map(e => {
    const em = e.head.match(/^(\d+)\.\s*(.*)$/);
    const body = e.body.replace(/^\s*<!--\s*nhan-chi-phi:([^>]*?)-->/m, (all, tag) => { e.tag = tag.trim(); return ''; });
    return { no: em ? Number(em[1]) : null, title: em ? em[2] : e.head, tag: e.tag ?? '', fields: parseFields(body) };
  }) };
});

// mục lục tham chiếu chéo
const entryIndex = new Map();
for (const c of chapters) for (const e of c.entries) entryIndex.set(`${c.no}-${e.no}`, `s${String(c.no).padStart(2, '0')}e${e.no}`);

// ---------- markdown ----------
let page = null;
const marked = new Marked({ gfm: true });
marked.use({
  tokenizer: {
    url(src) {
      const tok = Tokenizer.prototype.url.call(this, src);
      if (!tok || /^[\x21-\x7e]*$/.test(tok.raw)) return tok;
      const ascii = tok.raw.match(/^[\x21-\x7e]*/)[0];
      return ascii ? Tokenizer.prototype.url.call(this, ascii) : tok;
    },
  },
  renderer: {
    heading({ tokens, depth }) {
      const html = this.parser.parseInline(tokens);
      const id = `h${page.headings.length + 1}`;
      page.headings.push({ id, depth, text: plain(html) });
      return `<h${depth} id="${id}">${html}</h${depth}>\n`;
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const t = title ? ` title="${esc(title)}"` : '';
      return `<a href="${esc(rewriteHref(href))}"${t}>${text}</a>`;
    },
    image({ href, title, text }) { return `<img src="${esc(href)}" alt="${esc(text || '')}"${title ? ` title="${esc(title)}"` : ''}/>`; },
    html() { return ''; },
  },
});

function rewriteHref(href) {
  if (/^(https?:|mailto:|tel:|#)/.test(href)) return href;
  const [path, hash] = href.split('#');
  const norm = posix.normalize(path);
  const base = posix.basename(norm);
  const target = page?.linkMap?.get(base);
  if (target) return hash ? `${target}#${hash}` : target;
  const doc = docPageByBasename.get(base);
  if (doc) return hash ? `${doc}#${hash}` : doc;
  if (/(^|\/)README\.md$/.test(norm)) return 'nav.xhtml';
  return `${REPO}/blob/main/${norm}`;
}
const docPageByBasename = new Map();

function renderMd(md) {
  const body = marked.parse(md);
  return body.replace(/<!--[\s\S]*?-->/g, '');
}

function xref(html, chNo) {
  // «phần 3, mục 18» và «mục 18» trong cùng chương → liên kết nội bộ.
  // Một lượt regex duy nhất để không lồng thẻ <a>.
  return html.replace(/(phần|chương)\s+(\d{1,2})\s*,\s*mục\s+(\d{1,3})|(mục)\s+(\d{1,3})\b/g,
    (m, w, c, e, w2, e2, offset, whole) => {
      if (w) {
        const id = entryIndex.get(`${Number(c)}-${Number(e)}`);
        return id ? `<a class="xref" href="ch${String(Number(c)).padStart(2, '0')}.xhtml#${id}">${m}</a>` : m;
      }
      const before = whole.slice(Math.max(0, offset - 12), offset);
      if (/phần\s+\d+\s*,\s*$/.test(before) || /<a[^>]*>$/.test(before)) return m;
      const id = entryIndex.get(`${chNo}-${Number(e2)}`);
      return id ? `<a class="xref" href="ch${String(chNo).padStart(2, '0')}.xhtml#${id}">${m}</a>` : m;
    });
}

function renderValue(value, chNo, opts = {}) {
  const trimmed = value.trim();
  let html;
  if (/\n\s*[-*]\s|\n\n|\n\d+\.\s/.test(trimmed)) html = renderMd(trimmed);
  else html = `<p>${marked.parseInline(trimmed)}</p>`;
  if (!opts.noXref) html = xref(html, chNo);
  return html;
}

const evidenceClass = g => `grade-${(String(g).match(/[ABC]/)?.[0] ?? 'c').toLowerCase()}`;
const GRADE_LABEL = { A: 'A', B: 'B', C: 'C' };

// ---------- trang ----------
function wrap(title, body, { cls = '', lang = 'vi' } = {}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${lang}" lang="${lang}">
<head>
<meta charset="utf-8"/>
<title>${esc(title)}</title>
<link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body${cls ? ` class="${cls}"` : ''}>
${body}</body>
</html>
`;
}

const COST_LABEL = {
  tien: { '0': 'không tốn tiền', it: 'ít tiền', nhieu: 'nhiều tiền' },
  'thoi-gian': { it: 'ít thời gian', vua: 'vừa phải', nhieu: 'nhiều thời gian' },
  'y-chi': { khong: 'không cần ý chí', chut: 'cần chút ý chí', co: 'cần ý chí' },
  'loi-ich': { lon: 'lợi ích lớn', vua: 'lợi ích vừa', nho: 'lợi ích nhỏ' },
  'quy-mo': { 'tu-vong': 'tuổi thọ', tien: 'tiền bạc', 'thoi-gian': 'thời gian', 'tu-do': 'tự do' },
};
function costLine(tag) {
  const kv = Object.fromEntries([...tag.matchAll(/([\w-]+)=([\w-]+)/g)].map(m => [m[1], m[2]]));
  const parts = [];
  if (kv.tien) parts.push(COST_LABEL.tien[kv.tien]);
  if (kv['thoi-gian']) parts.push(COST_LABEL['thoi-gian'][kv['thoi-gian']]);
  if (kv['y-chi']) parts.push(COST_LABEL['y-chi'][kv['y-chi']]);
  if (kv['loi-ich']) parts.push(COST_LABEL['loi-ich'][kv['loi-ich']]);
  if (kv['quy-mo']) parts.push(COST_LABEL['quy-mo'][kv['quy-mo']]);
  return parts.filter(Boolean).join(' · ');
}

function entryHtml(e, chNo) {
  const f = Object.fromEntries(e.fields.map(x => [x.label, x.value]));
  const grade = (f['Mức chứng cứ'] ?? '').match(/[ABC]/)?.[0] ?? 'C';
  const id = `s${String(chNo).padStart(2, '0')}e${e.no}`;
  let note = f['Ghi chú'] ? renderValue(f['Ghi chú'], chNo) : '';
  note = note.replace(/^<p>(Chỉ áp dụng ở Trung Quốc:|Chỉ tham khảo TQ:|Chỉ đúng ở Trung Quốc:)/, '<p><strong class="juris">$1</strong>');
  note = note.replace(/^<p>(Còn tranh cãi|Tranh cãi)([:：.])/, '<p><strong class="disputed">$1$2</strong>');
  return `<section class="entry" id="${id}">
<h2 class="entry-title"><span class="entry-no">${e.no}</span>${esc(e.title)}</h2>
<p class="entry-meta"><span class="grade ${evidenceClass(grade)}">Mức chứng cứ ${GRADE_LABEL[grade] ?? grade}</span><span class="cost">${esc(costLine(e.tag))}</span></p>
${f['Chi phí'] ? `<div class="field field-cost"><p class="label">Chi phí</p>${renderValue(f['Chi phí'], chNo)}</div>` : ''}
${f['Nói dễ hiểu'] ? `<div class="callout"><p class="label">Nói dễ hiểu</p>${renderValue(f['Nói dễ hiểu'], chNo)}</div>` : ''}
${f['Lợi ích'] ? `<div class="field field-benefit"><p class="label">Lợi ích</p>${renderValue(f['Lợi ích'], chNo)}</div>` : ''}
${f['Nguồn'] ? `<div class="sources"><p class="label">Nguồn</p>${renderValue(f['Nguồn'], chNo, { noXref: true })}</div>` : ''}
${note ? `<div class="note"><p class="label">Ghi chú</p>${note}</div>` : ''}
</section>`;
}

// ===== thống kê =====
const allEntries = chapters.flatMap(c => c.entries);
const gradeOf = e => (e.fields.find(f => f.label === 'Mức chứng cứ')?.value.match(/[ABC]/)?.[0] ?? '?');
const STATS = {
  entries: allEntries.length,
  A: allEntries.filter(e => gradeOf(e) === 'A').length,
  B: allEntries.filter(e => gradeOf(e) === 'B').length,
  C: allEntries.filter(e => gradeOf(e) === 'C').length,
  DISPUTED: allEntries.filter(e => /^\s*(Còn tranh cãi|Tranh cãi)/.test(e.fields.find(f => f.label === 'Ghi chú')?.value ?? '')).length,
};

// ===== các trang =====
const pages = [];

// bìa
pages.push({ file: 'cover.xhtml', title: 'Bìa', cls: 'cover-page', body: `<div class="cover"><img src="cover.png" alt="Bìa sách ${esc(TITLE)} — ${esc(SUBTITLE)}"/></div>` });

// trang tiêu đề
pages.push({ file: 'titlepage.xhtml', title: 'Trang tiêu đề', cls: 'titlepage', body: `<p class="tp-kicker">Sách phi hư cấu · Bản dịch tiếng Việt</p>
<h1>${esc(TITLE)}</h1>
<p class="tp-sub">${esc(SUBTITLE)}</p>
<hr class="tp-rule"/>
<p class="tp-author">Nguyên tác: ${esc(AUTHOR)} · 《高性价比人生指南》</p>
<p class="tp-trans">Bản dịch tiếng Việt: nhóm HowToLiveBetter-vi<br/>dựa trên bản dịch cộng đồng của chuanman2707</p>
<p class="tp-imprint">Ấn bản điện tử · ${esc(String(new Date().getFullYear()))}</p>` });

// colophon
{
  const md = readFileSync(resolve(VI, 'front/colophon.md'), 'utf8').replaceAll('{{COMMIT}}', COMMIT.slice(0, 7)).replaceAll('{{DATE}}', BUILD_DATE)
    .replaceAll('{{ENTRIES}}', String(STATS.entries)).replaceAll('{{A}}', String(STATS.A)).replaceAll('{{B}}', String(STATS.B)).replaceAll('{{C}}', String(STATS.C)).replaceAll('{{DISPUTED}}', String(STATS.DISPUTED));
  page = { headings: [], linkMap: new Map() };
  pages.push({ file: 'colophon.xhtml', title: 'Ấn bản', cls: 'frontmatter', body: `<section epub:type="copyright-page">${renderMd(md)}</section>` });
}

// lời giới thiệu + bối cảnh
for (const [file, id, cls, type] of [
  ['translator-note.md', 'note.xhtml', 'frontmatter', 'preface'],
  ['context.md', 'context.xhtml', 'frontmatter', 'frontmatter'],
  ['glossary.md', 'glossary.xhtml', 'frontmatter', 'glossary'],
]) {
  const md = readFileSync(resolve(VI, 'front', file), 'utf8');
  page = { headings: [], linkMap: new Map() };
  const html = renderMd(md);
  const title = page.headings[0]?.text ?? file;
  pages.push({ file: id, title, cls, body: `<section epub:type="${type}" class="${cls}">${html}</section>` });
}

// chương
for (const c of chapters) {
  page = { headings: [], linkMap: new Map() };
  const intro = renderMd(c.intro);
  const body = `<section epub:type="chapter" class="chapter">
<header class="chapter-head">
<p class="chapter-kicker">Chương ${String(c.no).padStart(2, '0')}</p>
<h1>${esc(c.title)}</h1>
<hr class="ch-rule"/>
</header>
<div class="chapter-intro">${intro}</div>
${c.entries.map(e => entryHtml(e, c.no)).join('\n')}
</section>`;
  pages.push({ file: c.file, title: `Chương ${c.no}. ${c.title}`, body, chapter: c });
}

// phụ lục
const appendices = [];
for (const [i, f] of docFiles.entries()) {
  const md = readFileSync(resolve(VI, 'docs', f), 'utf8');
  const file = `doc${String(i + 1).padStart(2, '0')}.xhtml`;
  docPageByBasename.set(f, file);
  page = { headings: [], linkMap: new Map() };
  pages.push({ file, title: md.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? f, body: '', md, appendix: { file } });
  appendices.push({ f, file });
}
for (const a of appendices) {
  const p = pages.find(x => x.file === a.file);
  page = { headings: [], linkMap: new Map() };
  const html = renderMd(p.md.replace(/^\[[^\]]*\]\([^)]*\)\s*\n/, ''));
  p.title = p.title ?? page.headings[0]?.text;
  p.headings = page.headings;
  p.body = `<section epub:type="appendix" class="appendix">${html}</section>`;
}

// ghi chú kỹ thuật
{
  const entries = chapters.reduce((n, c) => n + c.entries.length, 0);
  const md = `# Ghi chú kỹ thuật

Ấn bản điện tử này được dựng tự động từ nguồn Markdown của dự án, cùng nguồn với bản tiếng Trung. Dựng lại được bằng lệnh \`node tools/vi/build-epub.mjs\` trong kho mã nguồn.

- Nguyên tác tiếng Trung: 《高性价比人生指南》 của eternity4719, commit \`${COMMIT}\`.
- Số chương: ${chapters.length}. Số mục: ${entries}. Số phụ lục: ${docFiles.length}.
- Ngày dựng: ${BUILD_DATE}.
- Định dạng: EPUB 3, bố cục co giãn (reflowable), ngôn ngữ \`vi\`.
- Giấy phép: CC BY 4.0, <https://creativecommons.org/licenses/by/4.0/>.
- Kho mã nguồn và báo lỗi: <${REPO}>.

## Về các liên kết

Liên kết tới bài báo, DOI và văn bản pháp luật được giữ nguyên như nguyên tác. Một số trang của cơ quan nhà nước Trung Quốc chặn truy cập từ nước ngoài hoặc đã đổi địa chỉ; khi đó hãy tìm theo tên văn bản, số hiệu hoặc DOI.

## Về phông chữ

Sách nhúng sẵn phông Literata (phần thân), Be Vietnam Pro (tiêu đề) và Cormorant Garamond (trang bìa, chữ đầu chương), phát hành theo SIL Open Font License 1.1. Bạn vẫn có thể chọn phông chữ và cỡ chữ của riêng mình trong ứng dụng đọc; khi đó phông nhúng sẽ nhường chỗ cho lựa chọn của bạn.
`;
  page = { headings: [], linkMap: new Map() };
  pages.push({ file: 'back.xhtml', title: 'Ghi chú kỹ thuật', cls: 'backmatter', body: `<section epub:type="colophon" class="backmatter">${renderMd(md)}</section>` });
}

// ===== nav =====
page = { headings: [], linkMap: new Map() };
const navList = [];
for (const p of pages) {
  if (['cover.xhtml', 'nav.xhtml', 'back.xhtml'].includes(p.file)) continue;
  const subs = p.chapter ? p.chapter.entries.map(e => ({ href: `${p.file}#s${String(p.chapter.no).padStart(2, '0')}e${e.no}`, text: `${e.no}. ${e.title}` }))
    : p.file.startsWith('doc') ? (p.headings ?? []).filter(h => h.depth === 2).map(h => ({ href: `${p.file}#${h.id}`, text: h.text })) : [];
  navList.push({ href: p.file, text: p.title, subs });
}
const navBody = `<nav epub:type="toc" id="toc">
<h1>Mục lục</h1>
<ol>
${navList.map(n => `<li><a href="${n.href}">${esc(n.text)}</a>${n.subs.length ? `\n<ol>\n${n.subs.map(s => `<li><a href="${s.href}">${esc(s.text)}</a></li>`).join('\n')}\n</ol>\n` : ''}</li>`).join('\n')}
</ol>
</nav>
<nav epub:type="landmarks" hidden="hidden">
<ol>
<li><a epub:type="cover" href="cover.xhtml">Bìa</a></li>
<li><a epub:type="toc" href="nav.xhtml">Mục lục</a></li>
<li><a epub:type="bodymatter" href="ch01.xhtml">Nội dung</a></li>
</ol>
</nav>`;
pages.splice(pages.findIndex(p => p.file === 'ch01.xhtml'), 0, { file: 'nav.xhtml', title: 'Mục lục', body: navBody, nav: true });

// ===== OPF =====
const coverExists = existsSync(resolve(VI, 'cover.png'));
if (!coverExists) throw new Error('thiếu vi/cover.png — chạy node tools/vi/make-cover.mjs trước');
const modified = NOW.toISOString().replace(/\.\d{3}Z$/, 'Z');
const fontFiles = ['Literata-Regular.ttf', 'Literata-SemiBold.ttf', 'Literata-Italic.ttf', 'BeVietnamPro-Regular.ttf', 'BeVietnamPro-SemiBold.ttf', 'Cormorant-SemiBold.ttf'];
const manifestItems = [
  `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
  `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`,
  `<item id="css" href="style.css" media-type="text/css"/>`,
  `<item id="cover-img" href="cover.png" media-type="image/png" properties="cover-image"/>`,
  ...fontFiles.map((f, i) => `<item id="font${i + 1}" href="fonts/${f}" media-type="font/ttf"/>`),
  ...pages.filter(p => p.file !== 'nav.xhtml').map(p => `<item id="${p.file.replace('.xhtml', '')}" href="${p.file}" media-type="application/xhtml+xml"/>`),
];
const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id" xml:lang="vi" prefix="schema: http://schema.org/">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="pub-id">${BOOK_ID}</dc:identifier>
<dc:title id="t1">${esc(TITLE)}</dc:title>
<meta refines="#t1" property="title-type">main</meta>
<dc:title id="t2">${esc(SUBTITLE)}</dc:title>
<meta refines="#t2" property="title-type">subtitle</meta>
<dc:creator id="creator">${esc(AUTHOR)}</dc:creator>
<meta refines="#creator" property="role" scheme="marc:relators">aut</meta>
<meta refines="#creator" property="file-as">eternity4719</meta>
<dc:contributor id="tr">chuanman2707</dc:contributor>
<meta refines="#tr" property="role" scheme="marc:relators">trl</meta>
<dc:contributor id="ed">nhóm HowToLiveBetter-vi</dc:contributor>
<meta refines="#ed" property="role" scheme="marc:relators">edt</meta>
<dc:language>vi</dc:language>
<dc:description>Sách phi hư cấu về sống lâu, sức khỏe, tiền bạc, pháp luật, gia đình và công việc: 767 mục lời khuyên, mỗi mục ghi chi phí, lợi ích, mức chứng cứ và nguồn gốc. Bản dịch tiếng Việt của 《高性价比人生指南》.</dc:description>
<dc:subject>sức khỏe</dc:subject>
<dc:subject>tài chính cá nhân</dc:subject>
<dc:subject>pháp luật</dc:subject>
<dc:subject>kỹ năng sống</dc:subject>
<dc:source>${REPO}/tree/${COMMIT}</dc:source>
<dc:rights>CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)</dc:rights>
<dc:date>${NOW.toISOString().slice(0, 10)}</dc:date>
<meta property="dcterms:modified">${modified}</meta>
<meta name="cover" content="cover-img"/>
<meta property="schema:accessMode">textual</meta>
<meta property="schema:accessModeSufficient">textual</meta>
<meta property="schema:accessibilityFeature">structuralNavigation</meta>
<meta property="schema:accessibilityFeature">tableOfContents</meta>
<meta property="schema:accessibilityHazard">none</meta>
<meta property="schema:accessibilitySummary">Toàn bộ nội dung là văn bản, có mục lục điều hướng theo chương và từng mục; không có hình ảnh minh họa ngoài trang bìa.</meta>
</metadata>
<manifest>
${manifestItems.join('\n')}
</manifest>
<spine toc="ncx" page-progression-direction="ltr">
${pages.map(p => `<itemref idref="${p.file.replace('.xhtml', '')}"/>`).join('\n')}
</spine>
</package>
`;

// ===== NCX =====
let play = 0;
const navPoint = n => `<navPoint id="np${++play}" playOrder="${play}"><navLabel><text>${esc(n.text)}</text></navLabel><content src="${n.href}"/>${n.subs?.length ? n.subs.map(navPoint).join('') : ''}</navPoint>`;
const ncx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="vi">
<head>
<meta name="dtb:uid" content="${BOOK_ID}"/>
<meta name="dtb:depth" content="2"/>
<meta name="dtb:totalPageCount" content="0"/>
<meta name="dtb:maxPageNumber" content="0"/>
</head>
<docTitle><text>${esc(TITLE)}</text></docTitle>
<navMap>
${navList.map(navPoint).join('\n')}
</navMap>
</ncx>
`;

const container = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>
`;

// ===== zip =====
const entries = [
  { name: 'mimetype', data: Buffer.from('application/epub+zip'), store: true },
  { name: 'META-INF/container.xml', data: Buffer.from(container) },
  { name: 'OEBPS/content.opf', data: Buffer.from(opf) },
  { name: 'OEBPS/toc.ncx', data: Buffer.from(ncx) },
  { name: 'OEBPS/style.css', data: readFileSync(resolve(ROOT, 'tools/vi/style.css')) },
  { name: 'OEBPS/cover.png', data: readFileSync(resolve(VI, 'cover.png')) },
  ...fontFiles.map(f => ({ name: `OEBPS/fonts/${f}`, data: readFileSync(resolve(VI, 'fonts', f)) })),
  ...pages.map(p => ({ name: `OEBPS/${p.file}`, data: Buffer.from(wrap(p.title, p.body, { cls: p.cls ?? '' })) })),
];
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, zip(entries, NOW));
const totalEntries = chapters.reduce((n, c) => n + c.entries.length, 0);
console.log(`Đã dựng ${OUT}: ${chapters.length} chương, ${totalEntries} mục (A ${STATS.A} · B ${STATS.B} · C ${STATS.C}), ${docFiles.length} phụ lục, ${(entries.reduce((n, e) => n + e.data.length, 0) / 1024) | 0} KB chưa nén`);
