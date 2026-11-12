# 人生决策 skill（life-decision-guide）

让 AI 助手照《高性价比人生指南》回答具体问题：该不该做、值不值、怎么选、出事了先做什么、能领哪笔钱、这么干犯不犯法。

它做的事只有一件：**先把相关条目从正文里查出来，再照书的算账方式排序回答**，每条注明出自第几节第几条。查不到就说查不到，不凭记忆编数字。

规则全在 [SKILL.md](SKILL.md) 里，两个工具共用同一个文件，不维护两份。

## 装到 Claude Code

在本仓库里开 Claude Code，不用装——`.claude/skills/life-decision-guide/` 已经指向这份规则。

想在任何目录下都能用，复制到个人 skill 目录：

```bash
mkdir -p ~/.claude/skills/life-decision-guide && curl -fsSL -o ~/.claude/skills/life-decision-guide/SKILL.md "https://raw.githubusercontent.com/eternity4719/HowToLiveBetter/main/skills/life-decision-guide/SKILL.md"
```

之后直接问「每天通勤两小时值不值」「朋友让我替他担保，签不签」就会触发；也可以显式说「用 life-decision-guide 回答」。

## 装到 Codex

在本仓库里开 Codex，不用装——根目录的 `AGENTS.md` 已经把它指出来了。

想在任何目录下都能用，复制到 Codex 的个人 skill 目录 `~/.agents/skills`：

```bash
mkdir -p ~/.agents/skills/life-decision-guide && curl -fsSL -o ~/.agents/skills/life-decision-guide/SKILL.md "https://raw.githubusercontent.com/eternity4719/HowToLiveBetter/main/skills/life-decision-guide/SKILL.md"
```

之后直接问问题就会按描述自动触发，也可以输入 `$life-decision-guide` 显式调用。注意是 `$` 不是 `/`，新版 Codex 输入 `/life-decision-guide` 会报 `Unrecognized command`。没出现就重启一次 Codex。

旧版 Codex 还没有 skill，只能用自定义提示词：把文件放到 `~/.codex/prompts/life-decision-guide.md`，再用 `/life-decision-guide` 调用。Codex 已宣布弃用这套写法（[openai/codex#10848](https://github.com/openai/codex/issues/10848)），新版用上面的 skill 装法。

## 正文从哪来

本地有这个仓库就读本地的 `book/`；没有就现取：

```bash
git clone --depth 1 https://github.com/eternity4719/HowToLiveBetter.git "${TMPDIR:-/tmp}/hltb"
```

整本 1.3 MB，浅克隆一次几秒。取不到网络就如实说取不到，不替代正文。

## 打成离线包

要把 skill 上传到别处，或者发给连不上 GitHub 的人，在仓库根目录跑：

```bash
node tools/skill/build.mjs
```

产物是 `dist/life-decision-guide.zip`，约 1 MB。里面除了 SKILL.md，还带着全书正文和一份条目索引 `references/index.tsv`，装上以后不用联网。压缩包里套着一层 `life-decision-guide/` 目录。上传的地方要求 SKILL.md 在压缩包根上的，加 `--flat`。

包里的正文停在打包那一刻。正文改了要重新打一次。

## 改动须知

SKILL.md 里不留任何会跟着正文漂的清单和数值：节的清单去读 README 的「这本书想回答的问题」表，性价比档的算法去读 `index.html` 里的 `COST_W` 和 `e.ratio` 两行，离线包里的索引是打包时现算的。所以增删节、改档位规则都不用动这个目录。
