// 生成一批翻译任务的提示词。分批是为了并行：一批十来个块，一次翻得完。
// 用法：node tools/i18n/prompt-batch.mjs en 03-不要浪费精力,04-不要浪费时间,10-恋爱和结婚划不划算
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync, readFileSync } from 'node:fs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const locale = process.argv[2];
const secs = (process.argv[3] ?? '').split(',').filter(Boolean);

const LANG = { en: 'English', vi: 'Vietnamese' }[locale];
const CONV = locale === 'vi'
  ? `- 条目 = "mục", 节 = "phần", statute sub-clause = "khoản (2)" or "điểm (a)". Never confuse them.
- 「第 X 节」 → "phần X" (writing "mục X" for a section makes the reader think it is item X)
- 「第 X 条」 → "mục X" ; 「本节第 X 条」 → "mục X của phần này" ; 「第 A 节第 B 条」 → "mục B ở phần A"
- Statute article 「第 285 条」 → "Điều 285". NEVER write "phần N" for a statute clause.`
  : `- Cross-references: 「第 X 节」 → "section X", 「第 X 条」 → "item X", 「本节第 X 条」 → "item X in this section", 「第 A 节第 B 条」 → "item B in section A".`;

const files = [];
for (const sec of secs){
  const dir = resolve(ROOT, '.i18n', locale, sec);
  for (const f of readdirSync(dir).filter(x => /^part\d+\.md$/.test(x)).sort()) files.push(`${sec}/${f}`);
}

const todo = files.filter(f => readFileSync(resolve(ROOT, '.i18n', locale, f), 'utf8').includes('成本：'));

console.log(`Translate these ${todo.length} blocks of a Chinese life-guide book into ${LANG}.

READ FIRST, both files, completely:
  ${ROOT}/tools/i18n/BRIEF.md          — every hard requirement (structure, the six field names, verbatim Chinese cost tags, frozen numbers, cross-references, byte-identical URLs, register)
  ${ROOT}/tools/i18n/glossary.${locale}.mjs   — use these exact terms

Write each translation back to the SAME path, overwriting the Chinese. Output nothing else.

${CONV}

FILES (${todo.length}):
${todo.map(f => '  ' + ROOT + '/.i18n/' + locale + '/' + f).join('\n')}

WHEN DONE, verify each section you finished:
  cd ${ROOT}
  node tools/i18n/join.mjs book/<section>.md --locale ${locale}
It prints one line per mismatch; fix what it reports and re-run until the section is clean
("合好 N 节，问题 0 处"). A section whose blocks you did NOT touch will still report missing
blocks — that is expected, ignore it and report it as such.

Do NOT run tools/site/build.mjs (another task is using it). Do NOT touch any file outside
.i18n/${locale}/ and ${locale}/book/.

Final response: one short line — which sections came out clean, and which (if any) still have
problems, quoting the checker's message.`);
