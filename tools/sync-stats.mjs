// 统计对齐：改完条目跑一次。按顺序做四件事：
// ① 重算全书的统计数字，回写 README.md、tools/site/stats.json、tools/og.html；
// ② 调 check-refs.mjs 重算 docs/引用对照.md；
// ③ 调 check-plain.mjs 查说人话，不合格只提示不中断；
// ④ 用无头 Chrome 把 tools/og.html 重新截成 og.png。
//
//   node tools/sync-stats.mjs                   # 全做
//   node tools/sync-stats.mjs --no-screenshot   # 不截图
//   node tools/sync-stats.mjs --check           # 只比对 ① 不写，有过时的数字则退出码 1（CI 用）
//
// Chrome 按常见安装位置找，装在别处就设环境变量 CHROME 指到可执行文件。
// og.html 用的是微软雅黑，Linux 上没有就会换成别的字体，截出来的图和 Windows 上不一样；
// CI 只跑 --check 不截图，也是这个原因。
//
// 2026-09-29 从 sync-stats.ps1 移植过来，ps1 已删：它只在 Windows 上跑，
// 网页上直接合并的外部 PR 完全经过不了它，数字过时了也没有任何检查会红。
// ① 只替换数字本身，不动任何其他文字。
// 数字口径：条目数 = book/*.md 里的 ### 标题数；节数 = book/*.md 的文件数；
// A/B/C = 证据等级行的首字母（带（争议）后缀的照样算）；争议 = 备注以「争议」开头的条数；
// TODO = 正文里含「待核实」或「TODO」的行数；链接 = 「- 来源：」和「- 备注：」行里的 http(s) 总数；
// 性价比三档的规则抄自检索页模板（tools/site/page.template.html）。
// 切行用 /\r?\n/，理由见 check-refs.mjs 文件头。
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const read = f => readFileSync(join(ROOT, f), 'utf8');

// 档位规则和检索页模板的 COST_W、e.ratio 两行一致；那两行改了这里必须跟着改，所以先比对一次
const indexText = read('tools/site/page.template.html');
const COST_W_LINE = "const COST_W = { money:{'0':0,'少':1,'多':2}, time:{'少':0,'中':1,'多':2}, will:{'否':0,'些':1,'是':2} };";
const RATIO_LINE = "e.ratio = e.level === '大' ? (e.cs === 0 ? '极高' : (e.cs <= 2 ? '高' : '一般'))";
if (!indexText.includes(COST_W_LINE)) throw new Error('检索页模板的 COST_W 行变了，请同步本脚本里的成本权重');
if (!indexText.includes(RATIO_LINE)) throw new Error('检索页模板的 e.ratio 行变了，请同步本脚本里的档位规则');

const W = {
  money: { '0': 0, '少': 1, '多': 2 },
  time: { '少': 0, '中': 1, '多': 2 },
  will: { '否': 0, '些': 1, '是': 2 },
};

function ratioOf(cost, level) {
  if (level === '大') return cost === 0 ? '极高' : cost <= 2 ? '高' : '一般';
  return level === '中' && cost === 0 ? '高' : '一般';
}

const bookFiles = readdirSync(join(ROOT, 'book')).filter(f => f.endsWith('.md')).sort();
const sections = bookFiles.length;
let entries = 0, dispute = 0, todo = 0, links = 0;
const grade = { A: 0, B: 0, C: 0 };
const ratio = { '极高': 0, '高': 0, '一般': 0 };

for (const f of bookFiles) {
  for (const line of read(join('book', f)).split(/\r?\n/)) {
    if (line.startsWith('### ')) entries++;
    const g = line.match(/^- 证据等级：([ABC])/);
    if (g) grade[g[1]]++;
    if (line.startsWith('- 备注：争议')) dispute++;
    if (/待核实|TODO/.test(line)) todo++;
    if (/^- (来源|备注)：/.test(line)) links += (line.match(/https?:\/\//g) ?? []).length;
    const t = line.match(/<!--\s*成本标签:\s*钱=(\S+)\s+时间=(\S+)\s+毅力=(\S+)\s+收益=(\S+)\s+口径=/);
    if (t) ratio[ratioOf(W.money[t[1]] + W.time[t[2]] + W.will[t[3]], t[4])]++;
  }
}

const tagged = ratio['极高'] + ratio['高'] + ratio['一般'];
if (tagged !== entries) console.warn(`警告：有 ${entries - tagged} 条缺成本标签，性价比三档对不上条目数`);
if (grade.A + grade.B + grade.C !== entries) console.warn('警告：证据等级行数和条目数对不上，检查有没有条目漏写证据等级');

// 三档百分比用最大余数法分配：先向下取整，剩下的百分点按小数部分从大到小补。
// 三个数各自四舍五入会凑出 99 或者 101（2026-09-21 加第 33 节时碰到过），这里保证加起来正好 100。
const ORDER = ['极高', '高', '一般'];
const pct = {}, rem = {};
for (const k of ORDER) {
  const exact = ratio[k] * 100 / entries;
  pct[k] = Math.floor(exact);
  rem[k] = exact - pct[k];
}
const short = 100 - ORDER.reduce((s, k) => s + pct[k], 0);
for (const k of [...ORDER].sort((a, b) => rem[b] - rem[a]).slice(0, Math.max(short, 0))) pct[k]++;

console.log(`条目 ${entries} ｜ 节 ${sections} ｜ A ${grade.A} B ${grade.B} C ${grade.C} ｜ 争议 ${dispute} ｜ TODO ${todo} ｜ 链接 ${links}`);
console.log(`性价比 极高 ${ratio['极高']}（${pct['极高']}%） 高 ${ratio['高']}（${pct['高']}%） 一般 ${ratio['一般']}（${pct['一般']}%）`);
console.log('');

const EDITS = [
  ['README.md', '首屏条目数', /(\d+) 条建议/g, `${entries} 条建议`],
  ['README.md', '条目徽章', /%E6%9D%A1%E7%9B%AE-(\d+)%20%E6%9D%A1/g, `%E6%9D%A1%E7%9B%AE-${entries}%20%E6%9D%A1`],
  ['README.md', '证据分级徽章', /A%20(\d+)%20%C2%B7%20B%20\d+%20%C2%B7%20C%20\d+/g, `A%20${grade.A}%20%C2%B7%20B%20${grade.B}%20%C2%B7%20C%20${grade.C}`],
  ['README.md', '文献链接徽章', /-(\d+)%20%E6%9D%A1%E9%93%BE%E6%8E%A5/g, `-${links}%20%E6%9D%A1%E9%93%BE%E6%8E%A5`],
  ['README.md', '怎么读里的 A 级数', /大型试验的 (\d+) 条/g, `大型试验的 ${grade.A} 条`],
  ['README.md', '怎么读里的极高条数', /勾选性价比「极高」，得到 (\d+) 条/g, `勾选性价比「极高」，得到 ${ratio['极高']} 条`],
  ['README.md', '证据分级段', /全书 (\d+) 条中 A 级 \d+ 条、B 级 \d+ 条、C 级 \d+ 条，另有 \d+ 条标注了争议、\d+ 处/g,
    `全书 ${entries} 条中 A 级 ${grade.A} 条、B 级 ${grade.B} 条、C 级 ${grade.C} 条，另有 ${dispute} 条标注了争议、${todo} 处`],
  ['README.md', '性价比段', /全书 (\d+) 条中性价比极高 \d+ 条（\d+%）、高 \d+ 条（\d+%）、一般 \d+ 条（\d+%）/g,
    `全书 ${entries} 条中性价比极高 ${ratio['极高']} 条（${pct['极高']}%）、高 ${ratio['高']} 条（${pct['高']}%）、一般 ${ratio['一般']} 条（${pct['一般']}%）`],
  ['README.md', '正文文件数', /正文按节拆成 (\d+) 个文件/g, `正文按节拆成 ${sections} 个文件`],
  ['tools/og.html', 'og 条目数', /<b>(\d+)<\/b> 条建议/g, `<b>${entries}</b> 条建议`],
  ['tools/og.html', 'og A 级数', /A 级证据 <b>(\d+)<\/b> 条/g, `A 级证据 <b>${grade.A}</b> 条`],
  ['tools/og.html', 'og 链接数', /<b>(\d+)<\/b> 条原始文献链接/g, `<b>${links}</b> 条原始文献链接`],
];

// 检索页的数字不进页面源码：模板和三份字典里写的是 {{entries}} 这类占位符，由
// tools/site/build.mjs 从 stats.json 填。stats.json 是这几个数字唯一的落点，三种语言共用。
const STATS_PATH = 'tools/site/stats.json';
const stats = {
  entries, sections, gradeA: grade.A, gradeB: grade.B, gradeC: grade.C,
  dispute, todo, links,
  ratioTop: ratio['极高'], ratioTopPct: pct['极高'],
  ratioHigh: ratio['高'], ratioHighPct: pct['高'],
  ratioMid: ratio['一般'], ratioMidPct: pct['一般'],
};
const statsText = JSON.stringify(stats, null, 2) + '\n';

const texts = new Map();
const stale = [];
for (const [file, label, pattern, repl] of EDITS) {
  const text = texts.get(file) ?? read(file);
  const found = [...text.matchAll(pattern)];
  if (found.length === 0) throw new Error(`${file} 里找不到「${label}」，模式：${pattern}`);
  const old = found[0][1];
  // 用函数做替换值，免得替换串里的 $ 被当成分组引用
  const updated = text.replace(pattern, () => repl);
  texts.set(file, updated);
  if (updated === text) {
    console.log(`  ${file} ${label}：${old}（未变）`);
    continue;
  }
  stale.push(`${file} ${label}`);
  console.log(`  ${file} ${label}：${old} -> ${CHECK ? '过时' : `已更新（${found.length} 处）`}`);
}

if (CHECK) {
  if (read(STATS_PATH) !== statsText) {
    stale.push(STATS_PATH);
    console.log(`  ${STATS_PATH} stats.json：过时`);
  }
  if (stale.length === 0) {
    console.log('\n统计数字检查通过');
    process.exit(0);
  }
  console.log(`\n有 ${stale.length} 处统计数字过时。本地跑 node tools/sync-stats.mjs（顺带重出 og.png），然后提交。`);
  process.exit(1);
}

for (const [file, text] of texts) if (text !== read(file)) writeFileSync(join(ROOT, file), text);
if (read(STATS_PATH) !== statsText) writeFileSync(join(ROOT, STATS_PATH), statsText);

// stats.json 变了，网站下次构建就带上新数字：web.yml 的触发路径含 book/** 和 stats.json
// 所在的 tools/site/**，push 之后 CI 自动重建。不在这里调 Astro 构建——
// 一是慢（全站预渲染），二是构建产物直发 Pages，不经过仓库，本地跑了也只是看看。
// 唯一要在本地确认的是解析器没和模板跑偏（改了 COST_W/e.ratio 才需要）：
// cd web && npm run check。

// ② 重算交叉引用对照表：插入或删除条目会让后面的「第 X 条」集体错位，而错位后的条号
// 往往仍在范围内（2026-09-19 第 7 节那 6 处就是），只有把「引用 → 目标标题」摊开入库，
// diff 才看得见。放在截图之前，--no-screenshot 也要跑到
const runTool = name => spawnSync(process.execPath, [join(ROOT, 'tools', name)], { stdio: 'inherit' }).status;
console.log('');
if (runTool('check-refs.mjs') !== 0) throw new Error('check-refs.mjs 失败');
console.log('提交前扫一眼 docs/引用对照.md 的 diff：条号没动而「指向的条目」变了，就是被顺延撞歪的引用。');

// ③ 说人话检查只提示不中断：数字已经同步完了，卡在这里反而让人以为统计没更新。CI 里它会红
console.log('');
if (runTool('check-plain.mjs') !== 0) console.log('上面列出的说人话不合格，提交前改掉（规则见 tools/check-plain.mjs 文件头）。');

if (process.argv.includes('--no-screenshot')) process.exit(0);

// ④ 截 og.png
const CHROME_PATHS = [
  process.env.CHROME,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];
const chrome = CHROME_PATHS.find(p => p && existsSync(p));
if (!chrome) throw new Error('找不到 Chrome，设环境变量 CHROME 指到它，或者加 --no-screenshot 跳过截图');

// 每次用全新的 user-data-dir：否则 Chrome 会拿缓存里的旧 og.html 渲染，截出来还是旧数字。
// --screenshot 必须给绝对路径：给相对路径 Chrome 什么都不写，还照样返回 0
const profile = mkdtempSync(join(tmpdir(), 'og-shot-'));
const target = join(ROOT, 'og.png');
const startedAt = Date.now();
// Chrome 把「xxx bytes written」这类信息写在 stderr 上，不是报错，直接丢掉
spawnSync(chrome, [
  '--headless', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
  '--window-size=1200,630', `--user-data-dir=${profile}`, `--screenshot=${target}`,
  pathToFileURL(join(ROOT, 'tools', 'og.html')).href,
], { stdio: 'ignore' });
rmSync(profile, { recursive: true, force: true });

// 自检：文件是这次写的、大小在正常区间。过了这两关就不必再打开图看，省一次读图的开销
const png = statSync(target);
if (png.mtimeMs < startedAt - 1000) throw new Error('og.png 没有被这次运行写入，截图失败了');
if (png.size < 120 * 1024 || png.size > 400 * 1024) throw new Error(`og.png 大小异常（${png.size} 字节），正常在 120KB 到 400KB，打开看一眼是不是渲染坏了`);
console.log(`\nog.png 已重出：${png.size} 字节，自检通过。改过 tools/og.html 的版式才需要打开图确认。`);
