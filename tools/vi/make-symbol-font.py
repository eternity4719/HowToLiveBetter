# Tạo phông phụ «HTLB Symbols» cho EPUB tiếng Việt.
# Literata và Be Vietnam Pro nhúng trong sách là bản rút gọn (Latin + tiếng Việt), thiếu các ký tự
# như ℃ ≥ ≤ ≈ ≠ γ μ ① Ⅲ ⁻⁵. Trên Boox và nhiều máy đọc e-ink, ký tự thiếu không phải lúc nào cũng
# được thay bằng phông hệ thống, có thể hiện thành ô vuông. Phông phụ này rút từ DejaVu Serif
# (giấy phép Bitstream Vera / DejaVu, cho phép sửa đổi nếu đổi tên phông) và đứng thứ hai trong
# mọi font-family của style.css.
#
# Cách chạy (cần fonttools: pip install fonttools):
#   python3 tools/vi/make-symbol-font.py /usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf vi/fonts/HTLBSymbols-Regular.ttf
import sys
from fontTools import subset
from fontTools.ttLib import TTFont

src, out = sys.argv[1], sys.argv[2]
RANGES = [
    (0x00B5, 0x00B5),  # µ
    (0x0370, 0x03FF),  # Hy Lạp
    (0x2070, 0x209F),  # chỉ số trên, dưới
    (0x2100, 0x214F),  # ℃ ℉ №
    (0x2150, 0x218F),  # số La Mã, phân số
    (0x2190, 0x21FF),  # mũi tên
    (0x2200, 0x22FF),  # toán tử
    (0x2460, 0x24FF),  # ① ② ③
]
opts = subset.Options()
opts.name_IDs = ['*']
opts.notdef_outline = True
opts.layout_features = ['*']
font = TTFont(src)
sub = subset.Subsetter(opts)
sub.populate(unicodes=[c for a, b in RANGES for c in range(a, b + 1)])
sub.subset(font)
NAME = 'HTLB Symbols'
for rec in font['name'].names:
    if rec.nameID in (1, 16):
        rec.string = NAME
    elif rec.nameID in (4,):
        rec.string = NAME + ' Regular'
    elif rec.nameID in (3, 6):
        rec.string = 'HTLBSymbols-Regular'
    elif rec.nameID == 5:
        rec.string = 'Subset of DejaVu Serif ' + str(rec.toUnicode())
font.save(out)
print(out, sum(1 for _ in font.getBestCmap()), 'glyphs')
