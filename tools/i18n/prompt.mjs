// 翻译任务的提示词。真正的要求写在 tools/i18n/BRIEF.md（人看的版本，两边一致）：
// 结构、字段名、成本标签逐字照抄、数字不许动、指路、链接、语气，都在那边。
// 每个文件只用一次 SYSTEM + 一次 buildPrompt，改要求改 BRIEF.md 一处就够。

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BRIEF = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), 'BRIEF.md'), 'utf8');

/** 给模型看的：先说清是谁、译成什么，再把 BRIEF.md 整个给出去 */
export const system = lang => `You are translating a Chinese life-guide book into ${lang}. The full brief is below; follow every rule in it.

${BRIEF}`;

/** 逐个文件的内容；一次一个，别一次塞一整本 */
export function buildPrompt(locale, kind, source) {
  const what = {
    book: 'This is one block of entries from a section of the book',
    readme: 'This is the book\'s README (the landing page: intro, how to read it, glossary, table of contents, licence)',
    docs: 'This is one long-form essay',
  }[kind];
  return `${what}. Translate it and output only the translation.\n\n<source>\n${source}\n</source>`;
}
