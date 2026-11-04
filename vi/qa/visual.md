# Kiểm tra thị giác và khả năng đọc

Thiết bị/engine dùng để kiểm tra: **Chromium headless** (bản đi kèm Chrome trên máy), phông nhúng trong EPUB, ba khổ: 620×1000, 820×1200, 1100×1400 px, hệ số 2×. Ảnh lưu ở `vi/qa/shots/` (không đưa vào sách).

## Đã kiểm tra

| Hạng mục | Kết quả | Ghi chú |
| --- | --- | --- |
| Bìa | đạt | 1600×2400; tiêu đề đọc rõ ở ảnh thu nhỏ 200×300; không cắt chữ, dấu tiếng Việt đủ |
| Trang tiêu đề | đạt | tiêu đề, phụ đề, tác giả, người dịch xuống dòng đúng ở cả ba khổ |
| Mục lục | đạt | 34 chương + 767 mục; phân cấp; liên kết hoạt động |
| Mở chương | đạt | số chương, tiêu đề, đường kẻ; chữ đầu chương (drop cap) hiển thị, không đè chữ |
| Một mục | đạt | nhãn Chi phí / Nói dễ hiểu / Lợi ích / Nguồn / Ghi chú rõ; callout nền ngà, viền vàng; cảnh báo «Chỉ áp dụng ở Trung Quốc» in đậm, không chỉ dựa vào màu |
| Nguồn và URL | đạt | URL dài tự xuống dòng, không tràn ngang; liên kết giữ nguyên |
| Bảng | đạt | bảng thuật ngữ 2 cột đọc được ở 620 px; chữ trong ô tự xuống dòng |
| Chú thích | đạt | khối «Ghi chú» có đường kẻ trên, tách khỏi phần trên |
| Trích dẫn | đạt | blockquote nghiêng, canh trái, không giãn chữ |
| Trang ấn bản | đạt | tiêu đề và phụ đề tách dòng; blockquote ghi công canh trái |
| Tràn ngang | không phát hiện | `scrollWidth == clientWidth` ở trang mục; không có phần tử tràn |
| Dấu tiếng Việt | đủ | kiểm tra trực quan các chữ ă, â, đ, ê, ô, ơ, ư, các thanh điệu; không thấy ô vuông hay dấu rời |

## Chưa kiểm tra được

- Chưa mở bằng **Apple Books, Kindle, Kobo, Thorium, Calibre**. Các nhận xét trên chỉ đúng cho engine Chromium.
- Chưa thử chế độ tối của từng ứng dụng đọc. Sách không đặt màu nền/màu chữ toàn trang, để ứng dụng đọc tự quyết; callout và nhãn dùng thêm chữ, không chỉ màu.
- Chưa thử cỡ chữ người dùng phóng to 200%; bố cục dùng đơn vị `em`, không đặt chiều rộng cố định, nhưng cần một lần thử thực tế.
- Chưa có ảnh chụp trên thiết bị e-ink.

## Cách chạy lại

```bash
node tools/vi/make-cover.mjs
node tools/vi/build-epub.mjs
mkdir -p /tmp/vi-epub && unzip -q dist/HowToLiveBetter-vi.epub -d /tmp/vi-epub
node tools/vi/render-qa.mjs /tmp/vi-epub/OEBPS
```

Ảnh nằm trong `vi/qa/shots/`. Muốn thêm trang, sửa danh sách `targets` trong `tools/vi/render-qa.mjs`.
