#!/bin/bash
# 把 .i18n/<语言>/<节>/ 里全翻好的节合成 <语言>/book/<节>.md，全书一遍。
#
# 判据是 split 不覆盖已翻的块这件事带来的副产品：块里还带「- 成本：」就是还没翻。
# 合成用的 join.mjs 自己还会逐块校一遍数字和链接，对不上就不写盘——
# 所以这里只管「哪些节翻全了」，判据还是在 join.mjs 那里。
#
#   tools/i18n/join-ready.sh en vi
cd "$(dirname "$0")/../.." || exit 1
locales=("$@")
[ ${#locales[@]} -eq 0 ] && locales=(en vi)

for loc in "${locales[@]}"; do
  for dir in .i18n/$loc/*/; do
    [ -d "$dir" ] || continue
    # 块里还带中文字段名 = 还没翻完，这节这次跳过（重跑这个脚本就好）
    grep -l -- '- 成本：' "$dir"part*.md 2>/dev/null | grep -q . && continue
    name=$(basename "$dir")
    node tools/i18n/join.mjs "book/$name.md" --locale "$loc" 2>&1 | grep -E '合好|处对不上|没写进'
  done
done
