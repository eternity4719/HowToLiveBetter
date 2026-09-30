// 内容集合：就地读仓库里已有的 book/*.md，不挪位置（理由见 astro.config.mjs 的 ②）。
//
// 三个语言各一份集合。集合只收实际存在的文件，「目录里列了但还没翻到」由站点构建
// 去报（tools/site/build.mjs 的 SKIPPED），不要在这里静默当成没有这一节——
// 静默了就分不清「翻坏了」和「还没翻」。
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 每种语言的正文在仓库根的哪：zh 指根（中文是原文，不能搬走），en/vi 指自己的子目录。
// 这个文件在 web/src/，所以 '../../' 才到仓库根，'../' 只到 web/。
const up = p => new URL('../../' + p, import.meta.url).pathname;

const book = base => defineCollection({
  loader: glob({ pattern: '**/*.md', base: up(base + '/book/') }),
  schema: z.object({ entries: z.number().optional() }),
});

const docs = base => defineCollection({
  loader: glob({ pattern: '*.md', base: up(base + '/docs/') }),
});

export const collections = {
  book_zh: book(''),
  book_en: book('en'),
  book_vi: book('vi'),
  docs_zh: docs(''),
  docs_en: docs('en'),
  docs_vi: docs('vi'),
};
