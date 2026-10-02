# 译文维护

英文（`en/`）和越南文（`vi/`）由本仓库维护，中文（仓库根的 `README.md`、`book/`、`docs/`）是原文。
作者只改中文那一份；两种译文由下面的流程跟上，结构对齐和数字一致性由机器查，作者不需要读译文。

判据、命令、坑，都写在 [BRIEF.md](BRIEF.md) 和 [../CLAUDE.md](../CLAUDE.md) 的「译文怎么维护」一节。
这一份是索引。

## 日常流程

```bash
# 1. 中文改完之后，把要翻的节切块
node tools/i18n/split.mjs book/01-不要早死.md --locale en

# 2. 翻 .i18n/en/01-不要早死/partNN.md（已翻过的块不会被覆盖，重跑 split 不会冲掉译文）

# 3. 逐块校一遍再合成 en/book/01-不要早死.md
node tools/i18n/join.mjs book/01-不要早死.md --locale en
# 一次翻了好几节就用这个：它把「块里不再带 - 成本：」的那些节挨个 join
bash tools/i18n/join-ready.sh en vi

# 4. 整本校一遍（CI 跑的就是这个）
node tools/i18n/check.mjs

# 5. 重建检索页（页面里的节数、卡片数跟着变）
node tools/site/build.mjs
```

`.i18n/` 是中间产物，已 gitignore。它同时是活的翻译进度：`split` 不覆盖已翻的块，所以每翻一块跑一次
`join` 就能看到还差哪几块。`join-ready.sh` 用的就是这个判据——一个块里还带 `- 成本：`，
就是这块还没翻。

**节标题改哪一份**：两边都要改，`<语言>/README.md` 的目录里一份、`.i18n/<语言>/<节名>/part00.md`
的块 0 里一份。`book/` 那份是 join 从块 0 合出来的，改了它，下次 join 就被覆盖回去
（2026-10-02 改完 book/ 里三节，第二天 CI 就报「节标题跟目录不一致」——就是只改了一半）。
`check.mjs` 拿 README 目录里那份跟译本节标题对字，两边得说同一句话。

**仓库里的路径一律走 `contentPath(code, rel)`（`tools/site/locales.mjs`），别用 `dir`。**
`dir` 是页面上线的目录，英文那份是空串（页面在根 URL 上）；`contentDir` 才是正文在仓库里
的位置（英文是 `en`）。拿 `dir` 拼路径会拼到 `book/`——中文原文那一份，`join.mjs` 那样写
会把英文译文写进原文。

## 新增一种语言

1. `tools/site/locales.json` 加一项：`code`、`dir`（页面上线的目录，默认语言是 `""` 表示在根上）、
   `contentDir`（正文在仓库里的位置，中文原文是 `""`）、`contentBase`（浏览器那边的相对根）、
   `assetBase`、`repoBlob`、`htmlLang`、`ogLocale`、`sortLocale`、`name`（语言自己的名字）、
   `accept`（匹配 `navigator.language` 的前缀）、`canonical`、`note`、`default` 或 `source`（各一个）。
2. `tools/site/locales/<code>.json`：解析正文用的标记（`fields`、`dispute`、`todo`、`glossary`、
   `contents`…）加界面文案 `strings`。`node tools/site/extract.mjs` 只能从模板抠中文，文案得自己写。
3. `tools/i18n/glossary.<code>.mjs`：词表。
4. `node tools/i18n/split.mjs --all --locale <code>` 切块，翻，`join --all`。

`tools/site/extract.mjs` 里 `cost.money.0` 那一组（动态拼出来的键）要往 `DYNAMIC_KEYS` 里加，
漏了页面就显示不出那几个徽章——`build.mjs` 会报「缺 N 个键」，不会静默过去。

## 文件

| 文件 | 管什么 |
| --- | --- |
| `BRIEF.md` | 翻译要求本身，人看的版本。改要求改这一份 |
| `prompt.mjs` | 把 BRIEF.md 整个塞进模型提示词（要接 API 时用这个） |
| `split.mjs` | 一节正文切成十来个条一块，放 `.i18n/<语言>/<节名>/partNN.md` |
| `join.mjs` | 逐块校一遍再合成 `<语言>/book/<节名>.md`，对不上就不写盘 |
| `join-ready.sh` | 一轮把两种语言里所有「已经翻全」的节挨个 join 掉，省得一次次敲 |
| `structure.mjs` | 一节（或一块）的结构骨架 + 逐条比对。`join` 和 `check` 共用同一份判据 |
| `check.mjs` | 拿中文原文对全部译文，CI 的「译文检查」job 跑它 |
| `check-docs.mjs` | 长文（`docs/`）里的条目指路有没有跟着原文的条号走，CI 也跑 |
| `rebase.mjs` | 中文改了之后把已有译文搬到新条号上（删条并条之后用这个，见下） |
| `diff-scope.mjs` | 每节的删/改/增清单，用来估工作量 |
| `diff-delta.mjs` | 真改了的条目拆到句子级，按「只加了一句」「增删都有」「整段重写」分三档 |
| `put.mjs` | 把一条译文写进它该在的块，按条号找，找不到就退出码 1 |
| `anchors.mjs` | 译本里逐字照抄的那几样（成本标签注释、字段顺序、不许动的数字、指路、链接） |
| `glossary.{en,vi}.mjs` | 词表。同一件事全书一个说法，靠它 |

## 中文原文改了之后（rebase）

作者改了中文（自己写的，或者 merge 上游），条目数变了、条号顺延了，已有的译文还停在旧的条号上。
这时候**不能直接跑 `split.mjs` 或 `resplit.mjs`**：删条并条之后条号整体顺延，按条号配会把
译文挂到别的条目上，而且不报错——结构检查只看条号在不在范围内，顺延后的号仍在范围内
（上游 2026-10 那次删了 9 条、第 2 节两条并成一条）。

```bash
git archive <改动前的 commit> book | tar -x -C /tmp/oldbook
node tools/i18n/diff-scope.mjs /tmp/oldbook/book en     # 看看要动多少
node tools/i18n/rebase.mjs    /tmp/oldbook/book en     # 搬（加 --dry 只报不写）
node tools/i18n/rebase.mjs    /tmp/oldbook/book vi
bash tools/i18n/join-ready.sh en vi                     # 搬完合一趟
node tools/i18n/check.mjs && node tools/i18n/check-docs.mjs
```

`rebase.mjs` 做三件事：

1. **按条目标题配对**（标题是作者写的动作句，改写之外一般不动；全书没有两条标题相同）。
   配不上的、标题变了的、正文真变了的，那几条译文留在中文等着人翻——`join-ready.sh`
   会因为块里还有 `- 成本：` 而跳过那一节，这是设计，不是坏了。
2. **改条号和指路条号**。删条之后中文原文的「第 20 条」变成「第 19 条」，译文的
   `item 20` 不同改就是指错条目，而 `check.mjs` 拿的是译文的指路跟中文原文逐个比。
3. **把搬不动的报出来**，一节一节点名，不猜：上游删条并条后没跟着改的指路、跨删除点的
   区间引用、跟着原文改了内容的条目、节标题或导读真改了的节。

**改指路要卡住「这是不是条目引用」。** 英文的 `xref.pattern` 里有一条光秃秃的
`\bitems?\s+(\d+)`，来源栏里「劳部发〔1994〕309 号，第 59 条」译成 `item 59` 照样命中，
APA 的 `item 705` 也命中。照单全改就是把法条条款号当条目号，指到别的条目上去。卡口是拿
**旧原文**那一条的指路当白名单（译文里的号是旧号，是不是条目引用也只有旧原文说了算）；
拿新原文的号去卡旧号，删条之后两边对不上，译文里的旧号一个都不改，比报错更坏——
指路静默指错还不报。

**跑之前先确认没有别的活儿在动块。** `rebase.mjs` 会重写 `.i18n/<语言>/**` 全部块文件，
翻译任务进行中跑它会把已翻的条目一起盖回中文（2026-10-02 有子代理这么干过一轮，
en、vi 各有十几个条目被冲掉要重翻）。翻译任务并行的时候只让它改块，别同时跑 rebase。

## 长文（docs/）不在 check.mjs 的扫描范围里

`check.mjs` 逐条比的是 `book/` 里的条目。长文（`docs/*.md`）是另一批文件，全是条目指路，
`check.mjs` 一个字都不看——「孩子出生前后要办的事」那种按时间排的动作清单，引用指错条目，
读者照着做的那一步就错了，比正文里指错更难受。单独用 `check-docs.mjs` 查：拿译文引的
(节, 条) 集合跟中文原文比，多了少了都报。

判据只比集合，不逐字比锚点：锚点是给人看的，长文里本来就允许截断（中文原文自己就在截，
「药按医嘱吃满」是「药按医嘱吃满，别感觉好了就停」的截断），译文截断的地方和长度都不一样，
逐字比只会报出一堆假警报。要拦的是条号顺延——译文那一份还在引旧号，读者点进去落在隔壁
那条上——集合一比就露馅，而且不依赖译文的措辞。括号里的锚点对不上得人看。

2026-10-02 查出过一处真错：上游在第 2 节删条并条之后，正文这边 `rebase.mjs` 搬了，长文这边
没人搬，`docs/生物钟和夜班.md` 的「第 2 节第 39 条」在英越两语还写着 item 40，而 2.40
已经是「买预包装食用油」。已改，并把这个检查挂进 CI 的「译文检查」job。
## 为什么译文不用人审

`check.mjs` 查的都是「翻着翻着丢了东西」：节数条数、六个字段的有无与顺序、成本标签注释、
证据等级、争议与待核实的条数、收益/成本/来源三栏里的每一个数字、交叉引用的条号节号、
来源与备注里的链接数量。数字是全书可核对性的底座，改一个就断了，而这一层机器查得出来。
剩下的是文字质量，那不在工具的判据里——发现哪处别扭，开个 issue 说第几节第几条。
