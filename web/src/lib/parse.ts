// 正文解析：从 README 的目录和 book/*.md 里把节和条目拆出来。
//
// 这段是从检索页原来的 parseReadme() 原样搬过来的（tools/site/page.template.html），
// 只改了参数：原来读全局的 SITE 和 COEF，函数体一行没动。
// 搬过来是为了让它在构建时跑——Astro 用它在构建期把卡片渲进 HTML，
// 爬虫和弱网就不用等 JS 了。页面那边还留着同一份逻辑（读内联的正文），
// 那是给「本地改一点样式立刻看效果」和离线副本兜底的；两边必须同时改，
// 改判据是 tools/site/build.mjs --check 和 web 的 npm run check 都绿。
//
// 成本权重和档位规则原来写死在页面里（COST_W / e.ratio 两行），
// tools/sync-stats.mjs 会拿它和那两行比对，这里是第三份，照抄。

const COST_W = { money: { '0': 0, '少': 1, '多': 2 }, time: { '少': 0, '中': 1, '多': 2 }, will: { '否': 0, '些': 1, '是': 2 } };

/** 字段名在各语言里不同（中文「- 成本：」、英文「- Cost:」），从 locale 配置来，不写死。
    尾部照抄原版：默认 '(.*)' 会把标签后面的空格一起收进来（页面那边就是这个行为，
    渲染时那点空格看不出来，但要和它逐字段一致就不能改）；证据等级另给一个窄的
    '\\s*([ABC])'，只取字母，「A（争议）」不会连后缀一起进来。 */
function fieldRe(name, cfg, tail) {
  const label = cfg.fields[name].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('^- ' + label + (tail || '(.*)'));
}

/**
 * @param {string} md       README + 全部正文拼起来（和原来页面里一样，节和条目的结构都在里面）
 * @param {object} cfg      locale(code) 的返回值：fields / dispute / todo 是解析用的
 * @returns {Array} sections
 */
export function parseReadme(md, cfg) {
  const RE_COST = fieldRe('cost', cfg);
  const RE_HUMAN = fieldRe('human', cfg);
  const RE_GAIN = fieldRe('gain', cfg);
  const RE_GRADE = fieldRe('grade', cfg, '\\s*([ABC])');
  const RE_SRC = fieldRe('src', cfg);
  const RE_NOTE = fieldRe('note', cfg);
  const RE_DISPUTE = new RegExp('^' + cfg.dispute);

  const lines = md.split(/\r?\n/);
  const sections = [];
  let sec = null, entry = null;
  const flush = () => { if (entry && sec) { sec.entries.push(entry); } entry = null; };
  for (const raw of lines) {
    const line = raw.trimEnd();
    let m;
    if ((m = /^#{1,2} (\d+)\. (.+)$/.exec(line))) { flush(); sec = { n: m[1], title: m[2].trim(), intro: [], entries: [] }; sections.push(sec); continue; }
    if (/^#{1,2} /.test(line)) { flush(); sec = null; continue; }
    if (!sec) continue;
    if ((m = /^### (\d+)\. (.+)$/.exec(line))) { flush(); entry = { sec: sec.n, n: m[1], title: m[2].trim(), cost: '', human: '', gain: '', grade: '', src: '', note: '', money: '', time: '', will: '', level: '', lens: '' }; continue; }
    if ((m = /^<!--\s*成本标签:\s*(.*?)\s*-->/.exec(line)) && entry) {
      // 成本标签注释照抄中文（钱/时间/毅力/收益/口径 + 0|少|多、大|中|小、死亡率|金钱|时间|自由）：
      // 这些取值就是筛选和地址栏里的值，三种语言共用一份，跨语言共享的链接才对得上
      for (const kv of m[1].split(/\s+/)) {
        const [k, v] = kv.split('=');
        if (k === '钱') entry.money = v;
        if (k === '时间') entry.time = v;
        if (k === '毅力') entry.will = v;
        if (k === '收益') entry.level = v;
        if (k === '口径') entry.lens = v;
      }
      continue;
    }
    if (entry) {
      if ((m = RE_COST.exec(line))) entry.cost = m[1];
      else if ((m = RE_HUMAN.exec(line))) entry.human = m[1];
      else if ((m = RE_GAIN.exec(line))) entry.gain = m[1];
      else if ((m = RE_GRADE.exec(line))) entry.grade = m[1];
      else if ((m = RE_SRC.exec(line))) entry.src = m[1];
      else if ((m = RE_NOTE.exec(line))) entry.note = m[1];
      continue;
    }
    if (line) sec.intro.push(line);   // 第一条之前的每一段导读都收，不止第一段
  }
  flush();

  for (const s of sections) for (const e of s.entries) {
    e.dispute = RE_DISPUTE.test(e.note);
    e.todo = cfg.todo.some(w => (e.src + e.gain + e.note + e.cost).includes(w));
    e.cs = (COST_W.money[e.money] ?? 0) + (COST_W.time[e.time] ?? 0) + (COST_W.will[e.will] ?? 0);
    e.ratio = e.level === '大' ? (e.cs === 0 ? '极高' : (e.cs <= 2 ? '高' : '一般'))
      : e.level === '中' ? (e.cs === 0 ? '高' : '一般') : '一般';
    e.hay = [e.title, e.human, e.cost, e.gain, e.note, e.src, e.grade].join('\n')
      .replace(/\*\*/g, '').replace(/\\([*_])/g, '$1').toLowerCase();
  }
  return sections;
}

/** 术语表：原样搬自页面里的 parseGlossary()（tools/site/page.template.html）。
    注意它和 parseReadme 不一样：字段取值之外，这里连「怎么写正则」都是逻辑的一部分
    （长词优先的最长匹配、拉丁词的前后守卫），抄的时候不能只抄行、把正则重写了。
    返回行表；附带的 re/by 给渲染时的 termify 用，和页面里 GLOSS_RE/GLOSS_BY 同一份。 */
export function buildGloss(md, cfg) {
  const m = new RegExp('^##\\s*' + cfg.glossary + '[^\\n]*\\n([\\s\\S]*?)(?=^##\\s)', 'm').exec(md);
  if (!m) return { rows: [], re: null, by: {} };
  const rows = [];
  for (const line of m[1].split(/\r?\n/)) {
    const c = /^\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/.exec(line);
    if (!c || c[1] === '术语' || /^-+$/.test(c[1])) continue;
    for (const t of c[1].split(cfg.glossarySep)) {
      const term = t.trim();
      if (!term) continue;
      rows.push({ term, meaning: c[2], latin: cfg.glossarySplit ? new RegExp(cfg.glossarySplit).test(term) : /^[A-Za-z0-9%. ]+$/.test(term) });
    }
  }
  rows.sort((a, b) => b.term.length - a.term.length);
  // 合并成一条正则：长词在前保证最长匹配，拉丁术语要求前后不是字母数字
  const escRe = t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const alt = list => list.map(g => escRe(g.term)).join('|');
  const parts = [];
  const latin = rows.filter(g => g.latin), cjk = rows.filter(g => !g.latin);
  if (latin.length) parts.push(`(?<![A-Za-z0-9])(?:${alt(latin)})(?![A-Za-z0-9])`);
  if (cjk.length) parts.push(`(?:${alt(cjk)})`);
  const re = parts.length ? new RegExp(parts.join('|'), 'g') : null;
  const by = Object.fromEntries(rows.map(g => [g.term, g]));
  return { rows, re, by };
}

/** 行表。渲染之外的用途（比如只数有多少术语）走这个。 */
export function parseGlossary(md, cfg) {
  return buildGloss(md, cfg).rows;
}
