# Tương thích trình đọc

## Đã kiểm tra

| Môi trường | Cách kiểm tra | Kết quả |
| --- | --- | --- |
| EPUBCheck 5.4.0 (Java 21) | `java -jar epubcheck.jar dist/HowToLiveBetter-vi.epub` | 0 lỗi, 0 cảnh báo (xem `vi/qa/report.md`) |
| Chromium headless (engine của Chrome trên máy) | Mở từng trang XHTML đã giải nén, chụp 620×1000, 820×1200, 1100×1400; đo `scrollWidth`/`clientWidth` | Không tràn ngang; bìa, trang tiêu đề, mục lục, mở chương, mục, bảng, phụ lục, trang ấn bản hiển thị đúng; dấu tiếng Việt đủ |
| Liên kết nội bộ | `check-links.mjs` trên toàn bộ OEBPS | 2.199 liên kết, 0 hỏng |
| Cấu trúc | `check-content.mjs`, `manifest.json` | 34 chương, 767 mục, 9 phụ lục, đúng thứ tự |

## Chưa kiểm tra được

- **Apple Books**: ứng dụng có trên máy, đã thử mở tệp nhưng phiên chạy không có quyền chụp màn hình (`screencapture` báo «could not create image from display»), nên **không có bằng chứng thị giác**. Không tuyên bố đã kiểm tra.
- **Calibre, Thorium Reader, Kindle, Kobo**: không cài trên máy; chưa thử.
- **Chế độ tối** của từng ứng dụng: sách không đặt màu nền/màu chữ toàn trang, để ứng dụng đọc quyết định; chưa thử thực tế.
- **Cỡ chữ người dùng phóng to 200%**: bố cục dùng `em`, không đặt chiều rộng cố định, nhưng chưa thử.
- **Thiết bị e-ink**: chưa tự kiểm tra. Người dùng báo lỗi trên Boox (NeoReader), đã sửa ngày 2026-11-04, xem mục dưới.
- **Người bản ngữ đọc toàn bộ**: chưa có; xem giới hạn trong `vi/qa/report.md`.

## Boox (NeoReader)

Người dùng báo hai lỗi khi đọc trên Boox:

- **Bấm một mục trong trang Mục lục thì hiện khung popup thay vì nhảy trang**, và chữ trong khung dính liền («47Từ 45 tuổi», «Mức chứng cứ Aít tiền»). NeoReader coi liên kết nội bộ có `#mảnh` như chú thích, hiện nội dung đích bằng chữ trơn, bỏ CSS. Cách sửa:
  - Trang mục lục trong mạch đọc giờ là `toc.xhtml`, chỉ liệt kê chương và phụ lục, liên kết tới đầu tệp, không có `#mảnh`. Danh sách đủ 767 mục vẫn nằm trong `nav.xhtml` và `toc.ncx`, dùng cho menu Mục lục của ứng dụng; `nav.xhtml` không còn nằm trong spine.
  - Mỗi mục có dấu ngăn ngay trong văn bản: số mục «47.» kèm khoảng trắng, « · » giữa mức chứng cứ và nhãn chi phí, «:» sau nhãn trường. Hai dấu sau bị CSS ẩn trên trang, chỉ hiện trong popup và khi trình đọc màn hình đọc to.
- **Tham chiếu chéo trỏ sai chương**: «mục 10 của phần 19», «mục 7 phần 2» (khoảng 470 chỗ) bị nối sang mục cùng số của chương đang đọc. Bộ dựng giờ nhận cả dạng «mục N (của) phần M» và danh sách «mục 1 và 2 của phần 19». Phụ lục cũng được nối tham chiếu có ghi số phần.

Lượt rà thứ hai (sau khi người dùng chụp «Mức chứng cứ A» đè lên chữ «không»):

- NeoReader bỏ qua `display: inline-block`, `min-width`, `padding` và `margin` trên phần tử nội dòng rồi vẽ khung đè chữ kế bên. Bỏ khung quanh mức chứng cứ, bỏ ô rộng cố định của số mục; khoảng cách chỉ dựa vào ký tự thật («47. », « · »).
- Bỏ chữ cái lớn đầu chương (`::first-letter` + `float`), một kiểu hay vỡ trên máy e-ink.
- Tắt ngắt âm tiết (`hyphens: none`): trình đọc không có từ điển tiếng Việt sẽ cắt âm tiết theo quy tắc tiếng Anh.
- Tiêu đề, dòng nhãn, danh sách và phần Nguồn căn trái; Nguồn có URL dài nên căn đều tạo khoảng trắng rất lớn.
- Bỏ `page-break-inside: avoid` ở khung «Nói dễ hiểu»: chữ cỡ lớn thì khung dài hơn một trang, đẩy sang trang sau để lại khoảng trống.
- Bỏ gạch chân kép ở tham chiếu chéo (gạch chân của liên kết + viền dưới).
- Phông nhúng là bản rút gọn, thiếu ℃ ≥ ≤ ≈ ≠ γ μ ⁻⁵ Ⅲ… Thêm phông phụ HTLB Symbols (rút từ DejaVu Serif, `tools/vi/make-symbol-font.py`) đứng thứ hai trong mọi `font-family`. ①–⑳ không phông nào có nên đổi thành (1)–(20) lúc dựng. Đã kiểm tra: mọi ký tự ngoài chữ Hán trong sách đều có trong phông nhúng.
- Trang Mục lục có mặt trong menu Mục lục và NCX, để chân trang Boox không hiện tên chương trước đó.
- Đã kiểm tra: mọi tệp XHTML/OPF/NCX là XML hợp lệ, không trùng id, manifest không thiếu và không thừa tệp; không trang nào tràn ngang ở khổ 460 px với chữ 120%.

## Kết luận

Ấn bản đạt yêu cầu kỹ thuật của EPUB 3 theo EPUBCheck và hiển thị đúng trong engine Chromium. Các trình đọc khác cần được kiểm tra trước khi phát hành rộng rãi; báo cáo này không thay thế kiểm tra đó.
