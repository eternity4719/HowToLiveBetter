// README 的结构解析和文件清单：EPUB（tools/epub）和 PDF（tools/pdf）两套构建共用。
// 只认 README 里的结构，不维护文件名单——新增一节或一篇长文，两套构建都自动跟上。
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const REPO = 'https://github.com/eternity4719/HowToLiveBetter';
export const SITE = 'https://eternity4719.github.io/HowToLiveBetter/';
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

// README 里从某个标题到下一个标题之间的一段
export function readBook() {
  const readme = read('README.zh.md');
  const lines = readme.split('\n');
  const between = (from, to) => {
    const a = lines.findIndex(l => l.startsWith(from));
    const b = lines.findIndex((l, i) => i > a && l.startsWith(to));
    if (a < 0 || b < 0) throw new Error(`README 里找不到 ${from} 到 ${to} 这一段`);
    return lines.slice(a, b).join('\n');
  };
  const description = between('# 高性价比人生指南', '[![')
    .split('\n').slice(1).map(l => l.replace(/<[^>]+>/g, '').trim()).filter(Boolean).join('');
  const frontMd = between('## 这本书想回答的问题', '## 目录');
  const contentsMd = between('## 目录', '## 正文')
    .split('\n\n').filter(p => !p.includes('index.html')).join('\n\n');
  const bookFiles = unique([...contentsMd.matchAll(/\]\((book\/[^)#]+\.md)\)/g)].map(m => m[1]));
  const docFiles = unique([...readme.matchAll(/\]\((docs\/[^)#/]+\.md)\)/g)].map(m => m[1]));
  if (bookFiles.length === 0) throw new Error('README 目录里没找到 book/ 文件');
  return { readme, description, frontMd, contentsMd, bookFiles, docFiles };
}

// 性价比三档：和 index.html 的 COST_W、e.ratio 两行一致，sync-stats.mjs 每次运行都会比对一次。
// 统计数字和 Anki 牌组的标签共用这一份。
export const COST_W = {
  money: { '0': 0, '少': 1, '多': 2 },
  time: { '少': 0, '中': 1, '多': 2 },
  will: { '否': 0, '些': 1, '是': 2 },
};

export function ratioOf(cost, level) {
  if (level === '大') return cost === 0 ? '极高' : cost <= 2 ? '高' : '一般';
  return level === '中' && cost === 0 ? '高' : '一般';
}
