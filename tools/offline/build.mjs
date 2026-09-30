// 把一页 + 那一份语言的 README + book/*.md 打成一个自包含的 HTML：双击就能看，不用服务器、不用联网。
//
//   node tools/offline/build.mjs                    # 默认语言（en）
//   node tools/offline/build.mjs --locale vi
//   node tools/offline/build.mjs zh                 # 位置参数也认
//   node tools/offline/build.mjs --locale vi dist/HowToLiveBetter-vi.html
//
// 页面是 tools/site/page.template.html + tools/site/locales/<code>.json 经
// tools/site/build.mjs 生成的（tools/site/build.mjs 的 renderPage），不是拿哪一份生成物改的——
// 生成物入库是为了让 Pages 直接发，脚本直接从源头渲，别反过来依赖生成物。
// 正文内联进 window.__CORPUS__，页面的 init() 认这个变量就不再发请求；
// 站内相对链接改成线上地址，侧栏图片转成 data URI，其余一个字不动。
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { ROOT, REPO, SITE, read, gitCommit, buildStamp } from '../lib/book.mjs';
import { LOCALES, SOURCE } from '../site/locales.mjs';
import { renderPage } from '../site/build.mjs';

const argv = process.argv.slice(2);
const li = argv.indexOf('--locale');
const code = (li < 0 ? null : argv[li + 1]) ?? argv.find(a => !a.startsWith('-') && LOCALES.some(l => l.code === a)) ?? null;
const L = LOCALES.find(l => l.code === code) ?? LOCALES.find(l => l.default);
const outArg = argv.find((a, i) => !a.startsWith('-') && a !== L.code && !(li >= 0 && i === li + 1));

const OUT = resolve(ROOT, outArg ?? `dist/HowToLiveBetter${L.code === (LOCALES.find(l => l.default)?.code) ? '' : '-' + L.code}.html`);
const STAMP = buildStamp();
const COMMIT = gitCommit();

// 路径拼法统一走 at()：zh 的 contentDir 是空串，直接拼会得到 '/book/x.md'，
// resolve 把它当绝对路径，跑到文件系统根上找去了。
const at = p => (L.contentDir ? L.contentDir + '/' : '') + p;
const stats = JSON.parse(read('tools/site/stats.json'));

// ---------- 正文 ----------
const readme = read(at('README.md'));
// 清单从 README 的目录里扒，和检索页是同一处。翻到一半的那几节正文还没有，
// 这里跳过而不是打错：清单和页面都得是「实际存在的那几节」，两份对不上就是 bug
const listed = [...new Set([...readme.matchAll(/\]\((book\/[^)]+\.md)\)/g)].map(m => m[1]))].sort();
if (!listed.length) throw new Error(`${at('README.md')} 的目录里没找到 book/ 文件，离线版会是空的`);
const files = listed.filter(f => existsSync(resolve(ROOT, at(f))));
const absent = listed.filter(f => !existsSync(resolve(ROOT, at(f))));
if (!files.length) throw new Error(`${at('README.md')} 的目录里列了 ${listed.length} 节，正文一份都还没有`);
if (absent.length) console.log(`另有 ${absent.length} 节还没翻到，这次没进离线副本：${absent.slice(0, 5).join('、')}${absent.length > 5 ? ' …' : ''}`);
// 长文（docs/*.md）也要带上：检索页的长文弹窗就地渲染它们，离线副本里没有就只剩
// 一个点不开的 GitHub 链接。清单从 README 里扒，和 EPUB、PDF 两套构建用的是同一处。
const docs = [...new Set([...readme.matchAll(/\]\((docs\/[^)#/]+\.md)\)/g)].map(m => m[1]))]
  .sort()
  .filter(f => existsSync(resolve(ROOT, at(f))));
const corpus = {
  readme,
  parts: Object.fromEntries(files.map(f => [f, read(at(f))])),
  docs: Object.fromEntries(docs.map(f => [f, read(at(f))])),
};
// </script 会提前关掉脚本标签；\/ 在 JS 字符串里就是 /，内容不变
const corpusJson = JSON.stringify(corpus).replace(/<\/script/gi, '<\\/script');

// ---------- 页面 ----------
let html = renderPage(L, read('tools/site/page.template.html'), stats);
const must = (needle, label) => {
  if (!html.includes(needle)) throw new Error(`生成的 ${L.dir}index.html 里找不到${label}，离线版脚本要跟着改：${needle}`);
};

// 统计脚本不能跟着离线版走：别人双击打开的副本不该往外发请求，断网时还要等超时
const GA_START = '<!-- ga:start', GA_END = '<!-- ga:end -->';
must(GA_START, ' GA 片段的起始标记');
must(GA_END, ' GA 片段的结束标记');
html = html.slice(0, html.indexOf(GA_START)) + html.slice(html.indexOf(GA_END) + GA_END.length);
// 只查外连域名：主脚本里的 track() 带 typeof 守卫，没有 gtag 也能跑，不算残留
if (/googletagmanager|google-analytics/.test(html)) throw new Error('剥掉标记之间的内容后仍有统计域名残留，离线版会往外发请求');

// 离线副本没有目录可以跳，语言切换得藏起来（SITE.offline 就在 build.mjs 里置上）
html = html.replace(/"offline":false/, '"offline":true');

// 相对链接在本地打开时是死的，改成线上地址
must(`href="${L.contentBase}README.md"`, ' README.md 链接');
must(`href="${L.contentBase}book/"`, ' book/ 链接');
html = html
  .replaceAll(`href="${L.contentBase}README.md"`, `href="${REPO}/blob/main/${(L.contentDir ? L.contentDir + '/' : '') + 'README.md'}"`)
  .replaceAll(`href="${L.contentBase}book/"`, `href="${REPO}/tree/main/${L.contentDir ? L.contentDir + '/book' : 'book'}"`);
  // logo 不用改：build.mjs 给的已经是 L.canonical（线上那一页的绝对地址），
  // 离线副本里点它正好跳去线上看更新，本地打开也不会解析成 /en/en/。

// 侧栏广告图和赞赏码转 data URI，否则离线打开是个裂图
for (const [img, mime] of [['ads/mcyyy-side.webp', 'image/webp'], ['ads/wechat-reward.png', 'image/png']]) {
  must(`src="${L.assetBase}${img.replace('ads/', '')}"`, `图片 ${img}`);
  const data = readFileSync(resolve(ROOT, img)).toString('base64');
  html = html.replace(`src="${L.assetBase}${img.replace('ads/', '')}"`, `src="data:${mime};base64,${data}"`);
}

// 页脚注明这是哪一版的离线副本
const foot = '<div class="foot">';
must(foot, '页脚');
const commitNote = COMMIT ? `，正文提交 ${COMMIT.slice(0, 7)}` : '';
const noteText = `${L.code === SOURCE.code ? '' : `${L.name} 版，`}离线副本，生成于 ${STAMP}（北京时间）${commitNote}；正文会继续更新，以 <a href="${SITE}${L.dir}">在线版</a> 为准。`;
html = html.replace(foot, `${foot}<span>${noteText}</span><br>`);

// 正文要在主脚本之前就位。锚点是主脚本开头那行注释（语言配置那行）。
// 这里不写死整段：注释一改就找不到，但只要主脚本还在就能插进去
const mainScript = '\n<script>\n/* ---------- 语言配置';
must(mainScript, '主脚本的开头');
html = html.replace(mainScript, `\n<script>window.__CORPUS__=${corpusJson}</script>${mainScript}`);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);
const kb = n => (Buffer.byteLength(n) / 1024 | 0) + ' KB';
console.log(`已生成 ${OUT}（${L.name}）：${files.length} 个正文文件，长文 ${docs.length} 篇，${kb(html)}（其中正文 ${kb(corpusJson)}）`);
