// 语言下拉的落点检查。跑在构建产物（web/dist）上：
//
//   npm run check-lang
//
// 查一件事：每种语言的页面上，换语言选项指向的地址是不是「同一个目录换成那种语言」，
// 而且当前的筛选参数（?q=…）和定位锚点（#e-13-1）都跟着过去。要求 4 就是这一条。
//
// 为什么单独抠这一段跑：页内那段 buildLangPicker 读的是 location，浏览器才有。
// 这里给它一份假的 location，把它从构建产物里原样抠出来执行一遍——
// 抠的是发出去的那份代码本身，不是照着抄的一份，抄错了就测不出来。
//
// 曾经的错：选项地址写的是 (here === SITE.dir ? here : SITE.dir)，SITE.dir 是
// 「这一页所在的目录」，跟「要去的那种语言」无关。结果从 /zh/ 选英文，跳到 /zh/，
// 还是中文；换语言等于没换。这个检查就是为了不让它再溜过去。
import { readFileSync, existsSync } from 'node:fs';
import { site } from './site';

const DIST = new URL('../../dist/', import.meta.url);
// 站点根在 Pages 上带的路径前缀（/HowToLiveBetter/ 这种）。页面自己那份
// site-config 里没有 canonical，根从 site.json 取——换域名只改那一处，这里自动跟上。
const PREFIX = new URL(site.site + '/').pathname;

const read = p => readFileSync(p, 'utf8');
const configOf = file =>
  JSON.parse(/id="site-config" type="application\/json">([\s\S]*?)<\/script>/.exec(read(file))[1]);
// 构建产物里没有的页面（比如那种语言还没翻完）就不测，不是错
const pages = [['index.html', ''], ['en/index.html', 'en/'], ['vi/index.html', 'vi/'], ['zh/index.html', 'zh/']]
  .filter(([file]) => existsSync(new URL(file, DIST)));

let bad = 0;
const fail = what => { bad++; console.log(`  ✗ ${what}`); };

// 每种语言的正文页都该有这一段，且几份完全一致——不一致说明有一份没重新构建。
// 别名页（/en/ 现在是转发页）不算：它就是一块跳转页，本来就没有语言下拉。
const bodyPages = pages.filter(([file]) => file.endsWith('index.html') && file !== 'en/index.html');
let body = null;
for (const [file] of bodyPages) {
  const m = /function buildLangPicker\(\)\{[\s\S]*?\n\}/.exec(read(new URL(file, DIST)));
  if (!m) { fail(`${file} 里没有 buildLangPicker，语言下拉不会建`); continue; }
  if (body === null) body = m[0];
  else if (body !== m[0]) fail(`${file} 里的 buildLangPicker 和根上那份不是同一段（构建产物不是一起出的？）`);
}
if (body === null) { console.log('构建产物里没有 buildLangPicker'); process.exit(1); }

// 假 DOM：够 buildLangPicker 用就行（它只用 createElement/getElementById/addEventListener）
const opts = [];
const sel = { appendChild: o => opts.push(o), addEventListener(){}, closest: () => ({}), selectedOptions: [] };
const document = { getElementById: id => (id === 'lang' ? sel : null), createElement: () => ({ dataset: {} }) };
const location = { pathname: '', search: '', hash: '' };
const run = new Function('document', 'location', 'SITE', body + '; buildLangPicker();');

// 每页测两种落点：干净的，和带着筛选参数+锚点定位到某一条的
const CASES = [
  ['',     '',            ''],
  ['?q=travel', '',   '#e-13-1'],
];

for (const [file] of pages) {
  if (file === 'en/index.html') {        // 别名转发页，没有语言下拉可测
    const a = read(new URL(file, DIST));
    if (!/http-equiv="refresh"/.test(a)) fail('en/index.html 不是转发页，/en/ 的老链接会 404');
    else console.log('  ✓ en/：别名转发页，带着 ?q= 和锚点回根上');
    continue;
  }
  const cfg = configOf(new URL(file, DIST));
  cfg.offline = false;
  const prefix = PREFIX;
  const here = `${prefix}${cfg.dir || ''}`;
  for (const [search, , hash] of CASES) {
    opts.length = 0;
    location.pathname = here;
    location.search = search;
    location.hash = hash;
    try { run(document, location, cfg); }
    catch (e) { fail(`${cfg.code} 页面上跑 buildLangPicker 抛错：${e.message}`); continue; }

    for (const o of opts) {
      if (!o.dataset.url) {                       // 当前语言，不给链接是对的
        if (o.value !== cfg.code) fail(`${cfg.code} 页面上「${o.value}」没有链接，它不是当前语言`);
        continue;
      }
      const want = new URL(prefix + (cfg.langDirs?.[o.value] ?? o.value + '/'), 'https://x' + here).href;
      const got = new URL(o.dataset.url, 'https://x' + here).href;
      if (got !== want + search + hash)
        fail(`${here} 选「${o.value}」：应该是 ${want + search + hash}，实际 ${got}`);
      // 落点那条在这个语言里得存在：/<dir>/ 下要有页面（别名页也算）
      const path = new URL(got).pathname;
      const file = path.slice(prefix.length).replace(/^\/+/, '');
      const target = (file || 'index.html').endsWith('/') ? file + 'index.html' : file;
      if (!existsSync(new URL(target, DIST)) && !existsSync(new URL(file, DIST)))
        fail(`${here} 选「${o.value}」指向 ${path}，构建产物里没有那一页`);
    }
  }
  console.log(`  ✓ ${cfg.code}（${here || '/'}）：${cfg.locales.length} 种语言，换语言换目录，?q= 和锚点都带着`);
}

if (bad) { console.log(`\n语言下拉有 ${bad} 处不对`); process.exit(1); }
console.log('\n语言下拉落点都对：换语言换目录，筛选参数和定位锚点都跟着走。');
