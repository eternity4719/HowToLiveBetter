// README 的结构解析和文件清单：EPUB（tools/epub）和 PDF（tools/pdf）两套构建共用。
// 只认 README 里的结构，不维护文件名单——新增一节或一篇长文，两套构建都自动跟上。
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { SOURCE, LOCALE, strings } from '../site/locales.mjs';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
// 站点地址和仓库地址只有一处：tools/site/site.json。EPUB、PDF、离线单文件三套构建
// 生成的页脚和下载链接都从这儿来，换域名只改那一处，别在这里再抄一份。
const urls = JSON.parse(readFileSync(resolve(ROOT, 'tools/site/site.json'), 'utf8'));
export const REPO = urls.repo;
export const SITE = urls.site + '/';
export const TITLE = '高性价比人生指南';
export const RELEASE = `${REPO}/releases/download/epub-latest`;

// 一律按 LF 交给各套构建：Windows 上 core.autocrlf=true 检出的是 CRLF，离线版脚本
// 拿 '\n' 写的 needle 去 index.html 里找锚点就一个都找不着，本地构建直接报「找不到
// 主脚本的开头」（CI 是 Linux，从没碰到过）。正文解析也不必各自处理 \r。
export const read = p => readFileSync(resolve(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
export const unique = arr => [...new Set(arr)];

export function gitCommit() {
  try {
    return execSync('git rev-parse HEAD', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return process.env.GITHUB_SHA ?? '';
  }
}

// 正文一天可能改好几轮，只给日期分不出是哪一版，所以精确到分钟。
// CI 跑在 UTC 上，统一按北京时间显示，免得下载的人按自己那边的日期对不上。
export function buildStamp() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', dateStyle: 'short', timeStyle: 'short' }).format(new Date());
}

export function stripBackLink(md) {
  return md.replace(/^\[← 回总目录\]\([^)]*\)\s*\n/, '');
}

/**
 * README 里从某个标题到下一个标题之间的一段。
 * 三个标题名各语言不同（'# 高性价比人生指南' / '# A High-Return Life Guide'），都从
 * locale 配置里来，不在这里写死——同一份代码要同时读三份 README。
 * 找不到就退回到「第一个一级标题到第一个徽章」：各语言的标题写法不一样，硬找会脆。
 */
function between(lines, from, to) {
  const a = lines.findIndex(l => l.startsWith(from));
  const b = lines.findIndex((l, i) => i > a && l.startsWith(to));
  if (a < 0 || b < 0) throw new Error(`README 里找不到 ${from} 到 ${to} 这一段`);
  return lines.slice(a, b).join('\n');
}

/**
 * 读一份 README，拆出电子书两套构建要的东西。
 *   locale —— 语言码；给了就读那一份（<code>/README.md），不给读仓库根的中文原文
 * 目录、标题这些位置按该语言的配置找，不维护第二份文件名单：新增一节或一篇长文，
 * EPUB、PDF 两套构建都自动跟上。
 */
export function readBook(locale = null) {
  const L = locale ? LOCALE(locale) : SOURCE;
  const S = strings(L.code);
  const md = L.contentDir ? L.contentDir + '/README.md' : 'README.md';
  const readme = read(md);
  const lines = readme.split('\n');

  // 书名标题：那一行以 '# ' 开头且不是 '## '，全篇只有一处
  const h1 = lines.findIndex(l => /^# \S/.test(l));
  const badge = lines.findIndex(l => l.startsWith('[!['));
  if (h1 < 0 || badge < 0 || badge < h1) throw new Error(`${md} 里的书名标题或徽章没找到`);
  const description = lines.slice(h1 + 1, badge)
    .map(l => l.replace(/<[^>]+>/g, '').trim()).filter(Boolean).join('');

  const frontMd = between(lines, '## ' + S.contentsQuestion, '## ' + S.contents);
  const contentsMd = between(lines, '## ' + S.contents, '## ' + S.text)
    .split('\n\n').filter(p => !p.includes('index.html')).join('\n\n');
  const bookFiles = unique([...contentsMd.matchAll(/\]\((book\/[^)#]+\.md)\)/g)].map(m => m[1]));
  const docFiles = unique([...readme.matchAll(/\]\((docs\/[^)#/]+\.md)\)/g)].map(m => m[1]));
  if (bookFiles.length === 0) throw new Error(`${md} 的目录里没找到 book/ 文件`);
  return { readme, description, frontMd, contentsMd, bookFiles, docFiles, locale: L.code, readmePath: md };
}
