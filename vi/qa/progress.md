# Tiến độ bản tiếng Việt

Cập nhật: 2026-11-04 (giờ Việt Nam). Mọi số lấy từ `vi/manifest.json` và `vi/qa/audit.json`.

## Đang ở đâu

- Nguyên tác: 34 chương, 767 mục, 9 bài dài; commit `e2605d3`.
- Đã dịch lại và gộp: **26/34 chương, 639/767 mục (83,3%)**. Các chương đạt: 1–26 và 22.
- Đang dịch: 20 lô còn lại của chương 27–34 (job nền), đã xong 106/126 lô.
- Sách hiện có 752 mục: 639 mục đã dịch lại, phần còn lại vẫn là bản nháp cũ và **chưa được tính là đạt**.
- 9/9 bài dài đã dịch lại và gộp.
- Ebook nháp dựng được: 2,2 MB, EPUBCheck 0 lỗi/0 cảnh báo, 2.199 liên kết nội bộ không hỏng, 2.325 liên kết ngoài.

## Chất lượng đo được

- `audit.json`: 0 mục lệch `Nguồn`, 0 chữ Hán ngoài `Nguồn`, 0 tiêu đề còn chữ Hán.
- 160 mục còn thiếu số — hầu hết nằm ở các chương chưa dịch lại; 5 chương đã gộp có 0 mục thiếu số (sau khi sửa tay mục 1.34 và 3.27).
- Đã phát hiện và sửa một lỗi số nghiêm trọng: `90895,5 亿元` bị dịch thành «90895,5 tỷ tệ» (sai 10 lần), nay là «9.089,55 tỷ tệ». Đã bổ sung đơn vị `tỷ/triệu/trăm triệu` vào bộ kiểm tra số để bắt các lỗi cùng loại.

## Lỗi hệ thống đã sửa (chi tiết ở `vi/qa/corrections.md`)

- Khôi phục 185 cột `Nguồn` bị cắt cụt; từ nay `merge.mjs` ép lại từ nguyên tác.
- Chuẩn hóa `vạn/亿` và dấu thập phân; `1,76 trăm triệu` → `176 triệu`.
- Sửa thuật ngữ hình sự: `拘役` → «tạm giữ hình sự», `司法解释` → «giải thích tư pháp».
- Sửa điều kiện địa điểm `地下一层以下（不含地下一层）` → «từ tầng hầm hai trở xuống (không tính tầng hầm một)».
- Bỏ dữ kiện không có trong nguyên tác.

## Việc tiếp theo

1. Chờ 60 lô chương 1–13 xong; gộp các chương đủ mục, chạy audit từng chương.
2. Chạy 66 lô còn lại (chương 2, 5–17, 19–21, 23–34), gồm 10 lô bị lỗi ở lần chạy đầu.
3. Dịch lại 34 phần mở đầu; kiểm tra tập số mục bằng `check-intro.mjs`.
4. Dịch lại 9 bài dài (bản cũ dịch máy rất kém).
5. Soát từng chương (đối chiếu nghĩa, câu cụt, thuật ngữ, dấu 「Chỉ áp dụng ở Trung Quốc」).
6. Dựng EPUB cuối, chạy EPUBCheck, kiểm tra nội dung/liên kết, chụp ảnh 3 khổ, đọc lại.
7. Cập nhật báo cáo, commit, chuẩn bị PR.

## Giới hạn đã biết

- Chưa thử trên Apple Books / Kindle / Kobo / Thorium; chỉ có EPUBCheck và Chromium.
- Chưa có người bản ngữ đọc toàn bộ; đây là ấn bản dịch có kiểm tra tự động, không phải bản đã qua biên tập viên người Việt.
- Liên kết ngoài chưa kiểm tra trực tuyến.
