// 失效链接检查：把正文和长文里的外链挨个请求一遍，报出打不开的。
//
//   node tools/check-links.mjs              # 全量检查，结果打到终端；在 GitHub Actions 里还写进 job summary
//   node tools/check-links.mjs --limit 50   # 只查前 50 条，本地试跑用
//
// 只报告，退出码恒为 0：gov.cn 一类站点从境外访问时通时不通，拿它挡构建只会天天红。
// 结果分两档。「确定失效」只收 404 和 410，以及 DOI 在 doi.org 登记处查不到的，这一档要回去修。
// 「没连上」是超时、403、5xx 这类，多半是对方挡了机房 IP 或临时故障，连着几周都在才值得看。
//
// DOI 不去打开出版商页面：Wiley、SAGE 这些站对机器请求一律 403，查了也白查。
// 改问 doi.org 的登记处接口，它只回答「这个 DOI 存不存在」，正好是这里要的。
import { readFileSync, readdirSync, appendFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg > 0 ? Number(process.argv[limitArg + 1]) : Infinity;
const CONCURRENCY = 8;
const TIMEOUT = 20000;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

// 链接从哪来：book/ 每节、docs/ 根下的长文（核实记录是历史状态，不查）、README。
const files = [
  ...readdirSync(resolve(ROOT, 'book')).filter(f => /^\d\d-.*\.md$/.test(f)).map(f => `book/${f}`),
  ...readdirSync(resolve(ROOT, 'docs')).filter(f => f.endsWith('.md') && f !== '引用对照.md').map(f => `docs/${f}`),
  'README.md',
];

// url -> 第一次出现的位置
const where = new Map();
for (const f of files) {
  readFileSync(resolve(ROOT, f), 'utf8').split(/\r?\n/).forEach((line, i) => {
    // 来源栏的链接写成 <url>，尖括号里的整段就是链接，DOI 里的括号（10.1016/S0140-6736(15)01225-8）
    // 也原样保留；裸写的链接按空白和中文标点截断，再去掉末尾不成对的右括号。
    const found = [...line.matchAll(/<(https?:\/\/[^>\s]+)>/g)].map(m => m[1]);
    const rest = line.replace(/<https?:\/\/[^>\s]+>/g, '');
    for (const m of rest.matchAll(/https?:\/\/[^\s<>（）「」，。；、"'`\]]+/g)) {
      let url = m[0].replace(/[.,;:]+$/, '');
      while (url.endsWith(')') && (url.match(/\(/g) ?? []).length < (url.match(/\)/g) ?? []).length) url = url.slice(0, -1);
      found.push(url);
    }
    for (const url of found) if (!where.has(url)) where.set(url, `${f}:${i + 1}`);
  });
}
// 徽章、检索页自身、Release 下载链接不查：它们不是来源，挂了也会有别的地方先发现。
const SKIP = /img\.shields\.io|eternity4719\.github\.io|\/releases\/download\/|localhost/;
// 不少地方政府站还用着老的加密套件或证书链不全，Node 握手直接报错，浏览器却能正常打开。
// 这类单独一档，不和真正连不上的混在一起。
const TLS = /^(ERR_SSL_|UNABLE_TO_VERIFY|CERT_|SELF_SIGNED|DEPTH_ZERO)/;
const urls = [...where.keys()].filter(u => !SKIP.test(u)).slice(0, LIMIT);

const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('超时')), ms))]);

async function checkDoi(doi) {
  const r = await withTimeout(fetch(`https://doi.org/api/handles/${encodeURIComponent(doi)}`), TIMEOUT);
  if (r.status === 404) return { dead: true, why: 'doi.org 查无此 DOI' };
  if (!r.ok) return { dead: false, why: `doi.org 返回 ${r.status}` };
  return null;
}

async function checkUrl(url) {
  const doi = /^https?:\/\/(?:dx\.)?doi\.org\/(.+)$/i.exec(url);
  if (doi) return checkDoi(decodeURIComponent(doi[1]));
  // 先 GET 不先 HEAD：有的站 HEAD 返回 403 而 GET 正常（海南省药监局就是这样），用 HEAD 会误判成死链。
  const r = await withTimeout(fetch(url, { redirect: 'follow', headers: { 'User-Agent': UA, Accept: 'text/html,*/*' } }), TIMEOUT);
  r.body?.cancel().catch(() => {});
  if ([404, 410].includes(r.status)) return { dead: true, why: `${r.status}` };
  if (!r.ok) return { dead: false, why: `${r.status}` };
  return null;
}

const dead = [];
const flaky = [];
const tls = [];
let next = 0;
async function worker() {
  while (next < urls.length) {
    const url = urls[next++];
    try {
      const res = await checkUrl(url);
      if (res) (res.dead ? dead : flaky).push({ url, why: res.why, at: where.get(url) });
    } catch (e) {
      const why = e.cause?.code ?? e.message;
      (TLS.test(why) ? tls : flaky).push({ url, why, at: where.get(url) });
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const sortAt = a => a.sort((x, y) => x.at.localeCompare(y.at, 'zh'));
const lines = [
  `## 失效链接检查`,
  ``,
  `共查 ${urls.length} 条链接，确定失效 ${dead.length} 条，没连上 ${flaky.length} 条，加密握手不兼容 ${tls.length} 条。`,
  ``,
  `### 确定失效（404、410、DOI 查无此号）`,
  ``,
  ...(dead.length ? sortAt(dead).map(d => `- ${d.at}　${d.why}　${d.url}`) : ['无']),
  ``,
  `### 没连上（超时、403、5xx，多半是对方挡了机房 IP，连着几周都在才值得看）`,
  ``,
  ...(flaky.length ? sortAt(flaky).map(d => `- ${d.at}　${d.why}　${d.url}`) : ['无']),
  ``,
  `### 加密握手不兼容（老政府站的加密方式 Node 不认，浏览器一般能开，不用修）`,
  ``,
  ...(tls.length ? sortAt(tls).map(d => `- ${d.at}　${d.why}　${d.url}`) : ['无']),
  ``,
];
console.log(lines.join('\n'));
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
