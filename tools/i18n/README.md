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
| `anchors.mjs` | 译本里逐字照抄的那几样（成本标签注释、字段顺序、不许动的数字、指路、链接） |
| `glossary.{en,vi}.mjs` | 词表。同一件事全书一个说法，靠它 |

## 为什么译文不用人审

`check.mjs` 查的都是「翻着翻着丢了东西」：节数条数、六个字段的有无与顺序、成本标签注释、
证据等级、争议与待核实的条数、收益/成本/来源三栏里的每一个数字、交叉引用的条号节号、
来源与备注里的链接数量。数字是全书可核对性的底座，改一个就断了，而这一层机器查得出来。
剩下的是文字质量，那不在工具的判据里——发现哪处别扭，开个 issue 说第几节第几条。
