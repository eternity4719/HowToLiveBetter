#!/usr/bin/env python3
"""Chuẩn bị nguồn để dịch một chương.
Dùng: python3 tools-vi/prep.py <số chương> [số mục mỗi phần, mặc định 6]
Kết quả: tools-vi/work/<NN>/part1_src.md, part2_src.md, ...
Dòng nhãn chi phí và dòng nguồn được thay bằng @@TAG@@ và - Nguồn: @@SRC@@ (giữ nguyên khi dịch).
"""
import sys, glob, os, re
n = int(sys.argv[1]); per = int(sys.argv[2]) if len(sys.argv) > 2 else 6
f = glob.glob(f'book/{n:02d}-*.md')[0]
lines = open(f, encoding='utf-8').read().splitlines()
out = []
for l in lines:
    if l.startswith('<!-- 成本标签'): out.append('@@TAG@@')
    elif l.startswith('- 来源：'): out.append('- 来源：@@SRC@@')
    else: out.append(l)
idx = [i for i, l in enumerate(out) if l.startswith('### ')]
starts = [0] + idx[per::per]
starts = sorted(set(starts))
d = f'tools-vi/work/{n:02d}'; os.makedirs(d, exist_ok=True)
for k, s in enumerate(starts):
    e = starts[k + 1] if k + 1 < len(starts) else len(out)
    open(f'{d}/part{k+1}_src.md', 'w', encoding='utf-8').write('\n'.join(out[s:e]) + '\n')
print(f'{f}: {len(idx)} mục, chia {len(starts)} phần trong {d}/')
