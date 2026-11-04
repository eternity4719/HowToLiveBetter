// Kiểm tra liên kết nội bộ trong EPUB đã giải nén: tệp đích và id neo phải tồn tại.
// 用法：node tools/vi/check-links.mjs [thư mục OEBPS]
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname, posix } from 'node:path';

const dir = resolve(process.argv[2] ?? '/tmp/vi-epub/OEBPS');
const files = readdirSync(dir).filter(f => f.endsWith('.xhtml'));
const ids = new Map();
for (const f of files) {
  const text = readFileSync(resolve(dir, f), 'utf8');
  ids.set(f, new Set([...text.matchAll(/\sid="([^"]+)"/g)].map(m => m[1])));
}
let links = 0, broken = 0, external = 0;
for (const f of files) {
  const text = readFileSync(resolve(dir, f), 'utf8');
  for (const m of text.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    const href = m[1].replace(/&amp;/g, '&');
    if (/^(https?:|mailto:|tel:)/.test(href)) { external++; continue; }
    links++;
    const [p, hash] = href.split('#');
    const target = p ? posix.normalize(posix.join(posix.dirname(f), p)) : f;
    if (!existsSync(resolve(dir, target))) { broken++; console.log(`✗ ${f}: thiếu tệp ${target}`); continue; }
    if (hash && !ids.get(target)?.has(hash)) { broken++; console.log(`✗ ${f}: thiếu neo #${hash} trong ${target}`); }
  }
}
console.log(`${links} liên kết nội bộ, ${broken} hỏng; ${external} liên kết ngoài (không kiểm tra mạng)`);
process.exit(broken ? 1 : 0);
