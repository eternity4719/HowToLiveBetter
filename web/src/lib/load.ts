// 一个语言站点的构建输入：README + book/*.md + docs/*.md，解析成节和条目。
//
// 判据和 tools/site/build.mjs 一样（那边是同一批规则，注释更全）：
//   · 目录清单从 README 的「目录」一节里扒，不维护第二份文件名单，新增一节两边自动跟上
//   · 目录里列着、正文还没翻到的节，跳过并报出来，不当成「翻坏了」
//   · 没翻完的语言这次不生成（README 都没有）
import { readRepo, readmePath, at, repoPath } from './site';
import { parseReadme, parseGlossary } from './parse';
import { existsSync, readFileSync } from 'node:fs';

/** README 的目录一节里列的 book 文件，按目录里的顺序 */
function listedFiles(readme, cfg) {
  const start = readme.indexOf(cfg.contents);
  if (start < 0) throw new Error(`${readmePath(cfg.code)} 的目录一节（${cfg.contents}）没找到`);
  const rest = readme.slice(start);
  const m = rest.match(/\]\((book\/[^)#/]+\.md)\)/);
  void m;
  const files = [];
  for (const hit of rest.matchAll(/\]\((book\/[^)#/]+\.md)\)/g)) files.push(hit[1]);
  return [...new Set(files)];
}

/** 这一种语言能不能上线：README 在才算 */
export function hasReadme(code) {
  return existsSync(repoPath(readmePath(code)));
}

/**
 * 读一个语言站点的全部内容并解析。
 * @returns {{code, cfg, readme, sections, docs, skipped, files, corpus}}
 */
export function loadLocale(code, cfg) {
  const readme = readRepo(readmePath(code));
  const listed = listedFiles(readme, cfg);

  const files = [];
  const skipped = [];
  for (const f of listed) {
    const p = at(code, f);
    if (existsSync(repoPath(p))) files.push({ path: f, text: readRepo(p) });
    else skipped.push(f);
  }
  if (!files.length) throw new Error(`${readmePath(code)} 的目录里列了 ${listed.length} 节，正文一份都还没有`);

  // 页面原来的做法是 parts.join('\n\n') 之后整体解析（init 里读的就是 SITE.files 那几份，
  // README 只拿去解析术语表，不进节）。这里照抄：README 里有一行 "### 5. ……" 的盐的例子，
  // 进了解析就是一条没人要的孤儿条目——现在两边都掉，不代表以后也不会，入口对齐最保险。
  const sections = parseReadme(files.map(f => f.text).join('\n\n'), cfg);
  if (!sections.length) throw new Error(`${readmePath(code)} 解析出来 0 节`);
  const glossary = parseGlossary(readme, cfg);

  // 长文：目录里列的、这一份语言实际有的
  const docs = [];
  for (const hit of readme.matchAll(/\]\((docs\/[^)#/]+\.md)\)/g)) {
    const p = at(code, hit[1]);
    if (existsSync(repoPath(p))) docs.push({ path: hit[1], text: readRepo(p) });
  }

  return {
    code, cfg, readme, sections, docs, glossary, skipped, files,
    corpus: { readme, parts: Object.fromEntries(files.map(f => [f.path, f.text])), docs: Object.fromEntries(docs.map(d => [d.path, d.text])) },
  };
}

/** 离线单文件构建用：按 corpusJson 的口径取条目数之类的汇总 */
export function totals(sections) {
  return { entries: sections.reduce((n, s) => n + s.entries.length, 0), sections: sections.length };
}

export { readFileSync };
