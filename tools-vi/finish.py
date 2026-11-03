#!/usr/bin/env python3
"""Ghép các phần đã dịch, kiểm tra, cập nhật mục lục.
Dùng: python3 tools-vi/finish.py <số chương> <slug-không-dấu> [--no-readme]
Đọc tools-vi/work/<NN>/part*_vi.md theo thứ tự, ghi book-vi/<NN>-<slug>.md.
"""
import sys, glob, re
n = int(sys.argv[1]); slug = sys.argv[2]
src = glob.glob(f'book/{n:02d}-*.md')[0]
orig = open(src, encoding='utf-8').read().splitlines()
tags = [l for l in orig if l.startswith('<!-- 成本标签')]
srcs = [l[len('- 来源：'):] for l in orig if l.startswith('- 来源：')]
parts = sorted(glob.glob(f'tools-vi/work/{n:02d}/part*_vi.md'), key=lambda p: int(re.search(r'part(\d+)_', p).group(1)))
vi = ''.join(open(p, encoding='utf-8').read().rstrip('\n') + '\n\n' for p in parts)
err = []
if vi.count('@@TAG@@') != len(tags): err.append(f'@@TAG@@: {vi.count("@@TAG@@")} != {len(tags)}')
if vi.count('@@SRC@@') != len(srcs): err.append(f'@@SRC@@: {vi.count("@@SRC@@")} != {len(srcs)}')
if err: sys.exit('LỖI: ' + '; '.join(err))
it = iter(tags); vi = re.sub('@@TAG@@', lambda m: next(it), vi)
for s in srcs: vi = vi.replace('@@SRC@@', s, 1)
vi = vi.rstrip() + '\n'
# kiểm tra
nums = [int(x) for x in re.findall(r'^### (\d+)\.', vi, re.M)]
onums = [int(x) for x in re.findall(r'^### (\d+)\.', '\n'.join(orig), re.M)]
if nums != onums: sys.exit(f'LỖI: số thứ tự mục lệch: {nums} vs {onums}')
for i, l in enumerate(vi.splitlines(), 1):
    if re.search(r'[一-鿿]', l) and not l.startswith('<!-- 成本') and not l.startswith('- Nguồn:'):
        print(f'CẢNH BÁO còn chữ Hán, dòng {i}: {l[:60]}')
def nums_of(text):
    text = re.sub(r'(?<=\d),(?=\d)', '.', text)
    return re.findall(r'\d+(?:\.\d+)?', text)
def body(ls): return '\n'.join(l for l in ls if not l.startswith(('<!-- 成本', '- 来源：', '- Nguồn:')))
from collections import Counter
a, b = Counter(nums_of(body(orig))), Counter(nums_of(body(vi.splitlines())))
miss = {k: v - b[k] for k, v in a.items() if v > b[k]}
if miss: print('CẢNH BÁO số có trong bản gốc nhưng thiếu/ít hơn trong bản dịch (có thể do đổi 万/亿, kiểm tra tay):', dict(list(miss.items())[:40]))
out = f'book-vi/{n:02d}-{slug}.md'
open(out, 'w', encoding='utf-8').write(vi)
print(f'Đã ghi {out}: {len(nums)} mục')
if '--no-readme' not in sys.argv:
    r = open('book-vi/README.md', encoding='utf-8').read().splitlines()
    for i, l in enumerate(r):
        m = re.match(rf'^{n}\. \[(.+?)\]\(\.\./book/{n:02d}-.*\)\s*$', l)
        if m: r[i] = f'{n}. [{m.group(1)}]({n:02d}-{slug}.md) ✅ đã dịch'; print('Đã cập nhật mục lục'); break
    else: print('CẢNH BÁO: không thấy dòng mục lục chưa dịch của chương này')
    open('book-vi/README.md', 'w', encoding='utf-8').write('\n'.join(r) + '\n')
