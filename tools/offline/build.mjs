// 把 index.html + README + book/*.md 打成一个自包含的 HTML：双击就能看，不用服务器、不用联网。
// 用法：node tools/offline/build.mjs [输出路径]   默认输出 dist/HowToLiveBetter.html
// 正文内联进 window.__CORPUS__，index.html 的 init() 认这个变量就不再发请求；
// 站内相对链接改成线上地址，侧栏图片转成 data URI，其余一个字不动。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { ROOT, REPO, SITE, read, gitCommit, buildStamp } from '../lib/book.mjs';

const OUT = resolve(ROOT, process.argv[2] ?? 'dist/HowToLiveBetter.html');
const STAMP = buildStamp();
const COMMIT = gitCommit();

// ---------- 正文 ----------
const readme = read('README.zh.md');
const files = [...new Set([...readme.matchAll(/\]\((book\/[^)]+\.md)\)/g)].map(m => m[1]))].sort();
if (!files.length) throw new Error('README 目录里没找到 book/ 文件，离线版会是空的');
// 长文（docs/*.md）也要带上：检索页的长文弹窗就地渲染它们，离线副本里没有就只剩
// 一个点不开的 GitHub 链接。清单从 README 里扒，和 EPUB、PDF 两套构建用的是同一处。
const docs = [...new Set([...readme.matchAll(/\]\((docs\/[^)#/]+\.md)\)/g)].map(m => m[1]))].sort();
const corpus = {
  readme,
  parts: Object.fromEntries(files.map(f => [f, read(f)])),
  docs: Object.fromEntries(docs.map(f => [f, read(f)])),
  // 最近更新的标记，tools/updates.mjs 生成、入库
  updates: JSON.parse(read('updates.json')),
};
// </script 会提前关掉脚本标签；\/ 在 JS 字符串里就是 /，内容不变
const corpusJson = JSON.stringify(corpus).replace(/<\/script/gi, '<\\/script');

// ---------- 页面 ----------
let html = read('index.html');
const must = (needle, label) => {
  if (!html.includes(needle)) throw new Error(`index.html 里找不到${label}，离线版脚本要跟着改：${needle}`);
};

// 统计脚本不能跟着离线版走：别人双击打开的副本不该往外发请求，断网时还要等超时
const GA_START = '<!-- ga:start', GA_END = '<!-- ga:end -->';
must(GA_START, ' GA 片段的起始标记');
must(GA_END, ' GA 片段的结束标记');
html = html.slice(0, html.indexOf(GA_START)) + html.slice(html.indexOf(GA_END) + GA_END.length);
// 只查外连域名：主脚本里的 track() 带 typeof 守卫，没有 gtag 也能跑，不算残留
if (/googletagmanager|google-analytics/.test(html)) throw new Error('剥掉标记之间的内容后仍有统计域名残留，离线版会往外发请求');

// 相对链接在本地打开时是死的，改成线上地址
must('href="README.zh.md"', ' README.md 链接');
must('href="book/"', ' book/ 链接');
must('href="selfcheck.html"', ' 自查页链接');
html = html
  .replaceAll('href="README.zh.md"', `href="${REPO}/blob/main/README.zh.md"`)
  .replaceAll('href="selfcheck.html"', `href="${SITE}selfcheck.html"`)
  .replaceAll('href="book/"', `href="${REPO}/tree/main/book"`)
  .replaceAll('<a class="title" href="./"', `<a class="title" href="${SITE}"`);

// 侧栏广告图和赞赏码转 data URI，否则离线打开是个裂图
for (const [img, mime] of [['ads/mcyyy-side.webp', 'image/webp'], ['ads/wechat-reward.png', 'image/png']]) {
  must(`src="${img}"`, `图片 ${img}`);
  const data = readFileSync(resolve(ROOT, img)).toString('base64');
  html = html.replace(`src="${img}"`, `src="data:${mime};base64,${data}"`);
}

// 页脚注明这是哪一版的离线副本
const foot = '<div class="foot">';
must(foot, '页脚');
const commitNote = COMMIT ? `，正文提交 ${COMMIT.slice(0, 7)}` : '';
html = html.replace(foot, `${foot}离线副本，生成于 ${STAMP}（北京时间）${commitNote}；正文会继续更新，以 <a href="${SITE}">在线版</a> 为准。<br>`);

// 正文要在主脚本之前就位
const mainScript = '\n<script>\n/* ---------- 调试面板';
must(mainScript, '主脚本的开头');
html = html.replace(mainScript, `\n<script>window.__CORPUS__=${corpusJson}</script>${mainScript}`);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);
const kb = n => (n / 1024 | 0) + ' KB';
console.log(`已生成 ${OUT}：${files.length} 个正文文件，长文 ${docs.length} 篇，${kb(Buffer.byteLength(html))}（其中正文 ${kb(Buffer.byteLength(corpusJson))}）`);
