# Danh sách kiểm tra phát hành

Bản dịch tiếng Việt của *Cẩm nang sống đáng giá*. Mọi mục dưới đây phải được chạy lại trên đúng commit phát hành.

## 1. Nguồn và phạm vi

- [ ] `git diff --stat main -- book/ docs/ README.md index.html` rỗng (nguyên tác Trung Quốc không đổi).
- [ ] `vi/manifest.json`: `chaptersComplete = 34`, `entriesVerified = 767`, `coverage = 1`.
- [ ] 9 bài dài trong `vi/docs/` đều qua `check-doc`.
- [ ] 34 phần mở đầu qua `check-intro`; mỗi chương nhắc đủ số mục, không lặp, không thiếu.
- [ ] `audit.json`: `sourceMismatch = 0`, `cjkOutsideSource = 0`, `titleCjk = 0`, `missing = 0`, `numMissing = 0`.

## 2. Nội dung

- [ ] `node tools/vi/check-content.mjs`: 34 chương, 767 mục, tiêu đề khớp nguyên tác, không chương rỗng.
- [ ] `node tools/vi/check-links.mjs <OEBPS>`: 0 liên kết nội bộ hỏng.
- [ ] Liên kết ngoài: đếm và ghi rõ **chưa kiểm tra trực tuyến**.
- [ ] Soát ngẫu nhiên 34 chương đã qua review độc lập; lưu báo cáo review.
- [ ] Không còn sót câu tiếng Trung ngoài `Nguồn` và tên riêng có chủ ý.

## 3. EPUB

- [ ] `node tools/vi/make-cover.mjs` (nếu đổi bìa).
- [ ] `node tools/vi/build-epub.mjs`.
- [ ] `java -jar /tmp/epubcheck/epubcheck-5.4.0/epubcheck.jar dist/HowToLiveBetter-vi.epub`: **0 lỗi, 0 cảnh báo**.
- [ ] `dc:language = vi`, `xml:lang="vi"`, có `dcterms:modified`.
- [ ] Bìa, trang tiêu đề, mục lục, 34 chương, 9 phụ lục, trang ấn bản đúng thứ tự.
- [ ] Ảnh bìa có `alt`; bảng có tiêu đề cột; nav có `landmarks`.
- [ ] Giải nén và đối chiếu số tệp XHTML với manifest; không có tệp mồ côi.

## 4. Thị giác

- [ ] Chụp 620×1000, 820×1200, 1100×1400: bìa, trang tiêu đề, mục lục, mở chương, một mục, bảng, phụ lục, trang ấn bản.
- [ ] Không tràn ngang (`scrollWidth == clientWidth`).
- [ ] Dấu tiếng Việt đủ; không ô vuông; không cắt chữ.
- [ ] Ghi rõ chỉ kiểm tra bằng Chromium; Apple Books/Kindle/Kobo/Thorium chưa thử.

## 5. Đóng gói

- [ ] `dist/HowToLiveBetter-vi.epub` tồn tại, kích thước hợp lý.
- [ ] Bản sao `HowToLiveBetter-vi.epub` ở thư mục gốc (không commit).
- [ ] `vi/qa/report.md`, `vi/qa/visual.md`, `vi/qa/corrections.md`, `vi/qa/progress.md` cập nhật.
- [ ] `vi/README.md` hướng dẫn dựng lại từ đầu.
- [ ] Commit cuối trên nhánh `vi`; không merge `main`, không phát hành Release.
- [ ] Tạo PR nháp với bằng chứng kiểm tra.

## 6. Điều không được tuyên bố

- Không nói đã được người bản ngữ đọc toàn bộ.
- Không nói đã thử Apple Books, Kindle, Kobo, Thorium, Calibre.
- Không nói đã kiểm tra mọi liên kết ngoài.
- Không nói là bản dịch chính thức của tác giả hay nhà xuất bản.
