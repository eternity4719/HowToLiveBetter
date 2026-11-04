# Báo cáo phát hành — Cẩm nang sống đáng giá (bản tiếng Việt)

## 1. Phạm vi và nguồn

- Nguyên tác: `HowToLiveBetter` của **eternity4719**, bản tiếng Trung tại commit `e2605d3` (2026-11-04).
- Phạm vi: **34 chương, 767 mục**, 34 phần mở đầu, **9 bài dài**.
- Bản dịch tham chiếu bản cộng đồng của **chuanman2707** (CC BY 4.0) nhưng đã đối chiếu lại từng câu với nguyên tác hiện hành; phần lớn được dịch lại.
- Giấy phép: CC BY 4.0. Đây là ấn bản không chính thức, không liên kết với nhà xuất bản Trung Quốc.

## 2. Sản phẩm

| Sản phẩm | Đường dẫn |
| --- | --- |
| EPUB cuối | `dist/HowToLiveBetter-vi.epub` (2,4 MB) |
| Bản sao tiện dụng | `HowToLiveBetter-vi.epub` ở thư mục gốc |
| Nguồn dịch | `vi/book/` (34 chương), `vi/docs/` (9 bài), `vi/front/` |
| Manifest | `vi/manifest.json` — 34/34 chương, 767/767 mục, coverage 1.0 |
| Sổ lỗi | `vi/qa/corrections.md` — 22 mẫu lỗi hệ thống |
| Kiểm tra kỹ thuật | `vi/qa/epubcheck.txt`, `vi/qa/report.md` |
| Kiểm tra thị giác | `vi/qa/visual.md`, ảnh trong `vi/qa/shots/` |
| Tương thích trình đọc | `vi/qa/reader-compatibility.md` |
| Hướng dẫn dựng lại | `vi/README.md` |

## 3. Kết quả kiểm tra

### Nội dung

- `audit.json`: **0 mục thiếu, 0 trường thiếu, 0 số thiếu, 0 nguồn lệch, 0 chữ Hán ngoài `Nguồn`, 0 tiêu đề Hán, 0 thuật ngữ nghiên cứu trong «Nói dễ hiểu»**.
- 34/34 chương khớp số mục với nguyên tác; 767/767 mục đủ sáu trường và cost tag.
- 9/9 bài dài qua `check-doc` với so sánh số theo giá trị chuẩn (không so chuỗi thô).

### Soát độc lập

- **9/9 bài dài**: 125 chỗ sửa; 15 lỗi nghiêm trọng/nặng. Đáng chú ý: DOI bị bước chuẩn hóa đơn vị đổi dấu chấm, hai thuật ngữ y khoa bị đảo nghĩa trong bài bệnh mạn tính, một điều kiện ly hôn bị bỏ chữ «等恶习», một URL nguồn bị hỏng.
- **34/34 chương**: 596 chỗ sửa; 3 lỗi nghiêm trọng và 67 lỗi nặng. Ví dụ: `十年以上` bị dịch «trên 10 năm» (làm mất đúng mốc 10 năm), `近亲属` thành «người thân trực hệ» (thu hẹp quyền của anh chị em), `长租公寓` thành «căn hộ» (sai chủ thể), `地下一层以下` thành «dưới tầng hầm một», `900 斤` thành «900 cân» thay vì 450 kg.
- Sau khi sửa: audit vẫn 0 thiếu số/0 lệch nguồn; các sửa tay đã kiểm chứng được giữ bằng `tools/vi/fixups.mjs`.

### EPUB

- EPUBCheck 5.4.0: **0 lỗi, 0 cảnh báo** (`vi/qa/epubcheck.txt`).
- 34 chương + 9 phụ lục + bìa + trang tiêu đề + mục lục + ấn bản; đúng thứ tự.
- 2.364 liên kết nội bộ, **0 hỏng**.
- 2.575 liên kết ngoài; **chưa kiểm tra trực tuyến**.
- `dc:language=vi`, `xml:lang=vi`, `dcterms:modified`, metadata accessibility, nav + NCX + landmarks.
- Phông nhúng: Literata (thân), Be Vietnam Pro (tiêu đề), Cormorant Garamond (bìa/drop cap), OFL 1.1.

### Thị giác

- Chụp 620×1000, 820×1200, 1100×1400 cho bìa, trang tiêu đề, mục lục, mở chương, một mục, phụ lục, trang ấn bản.
- Phát hiện và sửa tràn ngang 749 px ở phụ lục do URL dài; sau sửa **0 tràn ngang** ở cả ba khổ.
- Dấu tiếng Việt đủ; không thấy cắt chữ hay ô vuông.
- **Tương phản cao cho Boox/màn hình màu**: toàn bộ chữ đổi sang đen trên nền trắng; bỏ chữ xám (#5c6575), nhãn vàng nhạt (#8a6d2f), callout kem; callout nay nền trắng viền đen. Tỷ lệ tương phản chữ thân 21:1, chữ phụ 18,9:1, liên kết 12,6:1. Bìa cũng đổi sang đen trên nền trắng ngà.
- **Chỉ kiểm tra bằng Chromium.** Apple Books có trên máy nhưng phiên chạy không có quyền chụp màn hình; Calibre, Thorium, Kindle, Kobo chưa cài.

## 4. Cổng chất lượng

| Cổng | Kết quả | Bằng chứng |
| --- | --- | --- |
| G1 Nghĩa | đạt sau soát | audit + 596 sửa |
| G2 Tiếng Việt | đạt sau soát | 34 báo cáo review |
| G3 Câu đủ | đạt sau soát | review từng chương |
| G4 Mạch đoạn | đạt sau soát | review từng chương |
| G5 Biên tập | đạt ở mức có thể kiểm chứng | không có người bản ngữ đọc toàn bộ |
| G6 Thuật ngữ | đạt | `normalize-terms`, glossary |
| G7 Sự kiện | đạt | audit số/nguồn |
| G8 Thẩm quyền | đạt | nhãn «Chỉ áp dụng ở Trung Quốc» |
| G9 Kỹ thuật | đạt | EPUBCheck, links |
| G10 Trải nghiệm | đạt trong Chromium | ảnh 3 khổ |
| G11 Soát độc lập | đạt | 43 báo cáo |

## 5. Dựng lại

```bash
npm --prefix tools/vi ci
node tools/vi/make-cover.mjs
node tools/vi/build-epub.mjs
java -jar /path/to/epubcheck.jar dist/HowToLiveBetter-vi.epub
node tools/vi/check-content.mjs
node tools/vi/check-links.mjs /tmp/vi-epub/OEBPS
node tools/vi/audit.mjs
node tools/vi/manifest.mjs
```

Không chạy `postmerge.mjs` sau khi đã soát: nó gộp lại từ bản nháp và sẽ ghi đè các sửa của review.

## 6. Giới hạn

- **Chưa có người bản ngữ đọc toàn bộ 767 mục.** Đây là bản dịch có kiểm tra tự động và soát độc lập bằng mô hình, không phải bản đã qua biên tập viên người Việt.
- **Chưa thử Apple Books, Kindle, Kobo, Thorium, Calibre.** Chỉ có EPUBCheck và Chromium.
- **Chưa kiểm tra 2.575 liên kết ngoài**; nhiều trang chính phủ Trung Quốc chặn truy cập từ nước ngoài.
- Chưa thử chế độ tối, cỡ chữ 200%, thiết bị e-ink.
- Nội dung y khoa/pháp luật là bản dịch trung thành của nguyên tác, không phải lời khuyên y khoa hay pháp lý độc lập; người đọc ở Việt Nam cần kiểm tra quy định Việt Nam trước khi áp dụng.

## 7. Git

- Nhánh: `vi`
- Commit cuối: xem `git log -1` sau commit báo cáo này.
- Không merge `main`, không phát hành GitHub Release.
- Nguyên tác Trung Quốc không bị sửa (`git diff main -- book/ docs/ README.md index.html` rỗng).
