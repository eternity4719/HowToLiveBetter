// 站点配置：把 tools/ 下那几个 JSON 原样读进来。
//
// 为什么直接读 tools/site/ 那几份、而不是在 web/ 里复制一份：
// site.json、locales.json、locales/<code>.json、stats.json 已经是
// tools/site/build.mjs 的唯一事实来源，检索页和电子书都从那儿来。
// 复制一份就多一处会过时的地方——域名、界面文案、统计数字都得改两遍。
// 这里只读，不改：写入口仍然只有 tools/ 那几个脚本。
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

// 仓库根。直接跑 tsx 脚本时按文件位置算（../../../ 到仓库根）；
// 进 Astro 构建时会被打包，import.meta.url 指到构建缓存里，
// 这时按环境变量 HOWTOLIVEBETTER_ROOT 来——web/astro.config.mjs 会在构建前把它指到仓库根。
// 少一层都到不了根，会读空；中文文件名走 fileURLToPath（见 repoPath）。
const ROOT = process.env.HOWTOLIVEBETTER_ROOT
  ? pathToFileURL(process.env.HOWTOLIVEBETTER_ROOT.replace(/\/?$/, '/'))
  : new URL('../../../', import.meta.url);
const read = p => readFileSync(new URL(p, ROOT), 'utf8').replace(/\r\n/g, '\n');
const readJSON = p => JSON.parse(read(p));

export const site = readJSON('tools/site/site.json');
export const LOCALES = readJSON('tools/site/locales.json');
export const stats = readJSON('tools/site/stats.json');

/** 某一种语言的全部配置：locales.json 的那一条 + 界面文案字典 */
export function locale(code) {
  const meta = LOCALES.find(l => l.code === code);
  if (!meta) throw new Error(`没有语言 ${code}，locales.json 里只有 ${LOCALES.map(l => l.code).join('、')}`);
  const raw = readJSON(`tools/site/locales/${code}.json`);
  if (!raw.strings) throw new Error(`locales/${code}.json 里没有 strings`);
  return { ...meta, ...raw };
}

/** 这一轮真正会生成页面的语言：README 在的才算。
    还没翻完的那种（眼下是 vi）不在 hreflang 和跳语言页里——列出来点进去是 404。 */
export function published() {
  return LOCALES.filter(l => {
    const p = l.contentDir ? `${l.contentDir}/README.md` : 'README.md';
    try { readFileSync(new URL(p, ROOT)); return true; } catch { return false; }
  });
}

/** 语言 <-> 仓库相对路径 */
export const contentDir = code => LOCALES.find(l => l.code === code)?.contentDir ?? '';
export const readmePath = code => {
  const d = contentDir(code);
  return d ? `${d}/README.md` : 'README.md';
};
export const at = (code, p) => {
  const d = contentDir(code);
  return d ? `${d}/${p}` : p;
};
export const readRepo = p => read(p);

/** 仓库根的绝对路径，给 fs 用。
    走 fileURLToPath 而不是 URL.pathname：正文文件名是中文（book/01-不要早死.md），
    pathname 会把它们百分号编码，existsSync 就一律 false——症状是「目录列了 34 节，
    正文一份都还没有」。 */
export const repoPath = p => fileURLToPath(new URL(p, ROOT));
export { read };
