// 把 life-decision-guide 这个 skill 连同全书正文打成一个能离线用的 zip。
// 用法：node tools/skill/build.mjs [输出路径] [--flat]   默认输出 dist/life-decision-guide.zip
//
// 仓库里的 skill 只有一份 SKILL.md，正文靠本地仓库或现取 GitHub。拿去别处上传、分发时，
// 对方多半连不上 GitHub，所以把正文一起带上。包里的东西：
//   life-decision-guide/SKILL.md              原样，来自 skills/life-decision-guide/
//   life-decision-guide/README.md             这个包是什么、怎么装、哪天打的
//   life-decision-guide/references/README.md  书的 README（SKILL.md 第 2 步要读里面的问题表）
//   life-decision-guide/references/book/      各节正文
//   life-decision-guide/references/docs/      README 里链接过的长文（核实记录、引用对照不带）
//   life-decision-guide/references/index.tsv  一行一条：标题、成本标签、性价比档、证据等级
//   life-decision-guide/references/VERSION.txt    打包时间和提交号
//
// zip 里默认套一层 life-decision-guide/ 目录，解压到 ~/.claude/skills/ 这类目录下正好就位。
// 上传的地方要求 SKILL.md 在压缩包根上的，加 --flat。
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { zip } from '../lib/zip.mjs';
import { ROOT, REPO, SITE, TITLE, read, readBook, COST_W, ratioOf, gitCommit, buildStamp } from '../lib/book.mjs';

const args = process.argv.slice(2);
const flat = args.includes('--flat');
const OUT = resolve(ROOT, args.find(a => !a.startsWith('--')) ?? 'dist/life-decision-guide.zip');
const NAME = 'life-decision-guide';

// ---------- 读条目，只取索引要的那几样 ----------
function parseSection(file) {
  const md = read(file);
  const head = md.match(/^# (\d+)\. (.+)$/m);
  if (!head) throw new Error(`${file} 里找不到「# N. 节名」`);
  const entries = [];
  let e = null;
  for (const line of md.split('\n')) {
    const h = line.match(/^### (\d+)\. (.+)$/);
    if (h) { e = { n: h[1], title: h[2].trim() }; entries.push(e); continue; }
    if (!e) continue;
    const tag = line.match(/^<!--\s*成本标签:\s*(.*?)\s*-->/);
    if (tag) {
      for (const kv of tag[1].split(/\s+/)) { const [k, v] = kv.split('='); e[k] = v; }
      continue;
    }
    const grade = line.match(/^- 证据等级：\s*([ABC])/);
    if (grade) e.grade = grade[1];
    if (/^- 备注：争议/.test(line)) e.dispute = true;
  }
  return { file, sec: head[1], name: head[2].trim(), entries };
}

const { bookFiles, docFiles } = readBook();
const sections = bookFiles.map(parseSection);

const COLS = ['节', '条', '标题', '性价比', '收益', '口径', '钱', '时间', '毅力', '证据', '争议', '人群', '文件'];
const rows = [];
const tally = { 极高: 0, 高: 0, 一般: 0 };
for (const s of sections) {
  for (const e of s.entries) {
    const tagged = e.钱 in COST_W.money && e.时间 in COST_W.time && e.毅力 in COST_W.will && e.收益;
    if (!tagged) throw new Error(`第 ${s.sec} 节第 ${e.n} 条的成本标签不全，索引算不出性价比档`);
    const ratio = ratioOf(COST_W.money[e.钱] + COST_W.time[e.时间] + COST_W.will[e.毅力], e.收益);
    tally[ratio]++;
    rows.push([s.sec, e.n, e.title.replace(/\t/g, ' '), ratio, e.收益, e.口径 ?? '', e.钱, e.时间, e.毅力,
      e.grade ?? '', e.dispute ? '争议' : '', e.人群 ?? '', s.file]);
  }
}
const index = [COLS, ...rows].map(r => r.join('\t')).join('\n') + '\n';

// ---------- 包里的两份说明 ----------
const commit = gitCommit();
const stamp = buildStamp();
const version = `${TITLE} · life-decision-guide skill
打包时间：${stamp}（北京时间）
正文版本：${commit ? commit.slice(0, 7) : '未知'}
${sections.length} 节 ${rows.length} 条，长文 ${docFiles.length} 篇
最新版正文：${REPO}
`;

const readme = `# 人生决策 skill（${NAME}）

让 AI 助手照《${TITLE}》回答具体问题：该不该做、值不值、怎么选、出事了先做什么、能领哪笔钱、这么干犯不犯法。

它先把相关条目从正文里查出来，再按书里的算账方式排序回答，每条注明出自第几节第几条。查不到就说查不到，不凭记忆编数字。

## 包里有什么

- \`SKILL.md\`：给 AI 助手的规则。
- \`references/\`：全书正文，${sections.length} 节 ${rows.length} 条，另有 ${docFiles.length} 篇长文。不用联网就能查。
- \`references/index.tsv\`：一行一条，带成本标签、性价比档和证据等级，供检索和排序。
- \`references/VERSION.txt\`：这份正文的打包时间。本包打于 ${stamp}（北京时间）。

## 怎么装

把 \`${NAME}\` 这个目录整个放进 AI 助手的 skill 目录，然后重开一次会话。

- Claude Code：\`~/.claude/skills/\`
- Codex：\`~/.agents/skills/\`
- 其他支持 SKILL.md 的助手：放进它的 skill 目录，或者直接让它读这份 SKILL.md。

装好以后直接问「朋友让我替他担保，签不签」「每天通勤两小时值不值」就会触发。

## 边界

书给的是通用口径，不替代医生、律师、会计。涉及具体病情、具体案件、具体税务的，它只按书里的条目给方向和该找谁。

正文一直在更新，政策类的金额、时限、名单会变。答复里会带上本包的打包日期，要紧的事请按条目来源栏里的官方链接再核一遍。

## 来源和许可

正文出自开源项目《${TITLE}》，作者 eternity4719。

- 仓库：${REPO}
- 在线检索页：${SITE}

正文（\`references/\` 下的文字）用 CC BY 4.0 发布，转载、改编要署名并附许可证链接 https://creativecommons.org/licenses/by/4.0/ 。SKILL.md 用 MIT 许可。
`;

// ---------- 打包 ----------
const prefix = flat ? '' : `${NAME}/`;
const text = s => Buffer.from(s, 'utf8');
const files = [
  { name: `${prefix}SKILL.md`, data: text(read(`skills/${NAME}/SKILL.md`)) },
  { name: `${prefix}README.md`, data: text(readme) },
  { name: `${prefix}references/README.md`, data: text(read('README.md')) },
  { name: `${prefix}references/index.tsv`, data: text(index) },
  { name: `${prefix}references/VERSION.txt`, data: text(version) },
  ...[...bookFiles, ...docFiles].map(f => ({ name: `${prefix}references/${f}`, data: text(read(f)) })),
];

const buf = zip(files, new Date(), { unix: true });
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, buf);

const raw = files.reduce((n, f) => n + f.data.length, 0);
console.log(`${sections.length} 节 ${rows.length} 条 ｜ 极高 ${tally.极高} 高 ${tally.高} 一般 ${tally.一般} ｜ 长文 ${docFiles.length} 篇`);
console.log(`${files.length} 个文件，解压后 ${(raw / 1024 / 1024).toFixed(2)} MB，zip ${(buf.length / 1024).toFixed(0)} KB${flat ? '（SKILL.md 在压缩包根上）' : ''}`);
console.log(OUT);
