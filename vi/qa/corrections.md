# Sổ hiệu chỉnh và nhật ký kiểm tra

Cập nhật: đang thực hiện. Mọi con số dưới đây lấy từ `vi/qa/audit.json`, `vi/manifest.json` và `vi/qa/report.md`, không phải ước lượng.

## 0. Nguồn và mốc so sánh

- Nguyên tác tiếng Trung: commit `e2605d3`, 34 chương, 767 mục, 9 bài dài.
- Bản nháp tiếng Việt ban đầu: bản dịch cộng đồng `chuanman2707`, tương ứng với nguyên tác tại commit `a18ee40` (672 mục, 2026-10-08).
- Vì nguyên tác đã thay đổi sau mốc đó (thêm 95 mục, sửa 508 mục, đổi 77 tiêu đề), không thể dùng bản nháp làm bản cuối. Toàn bộ 767 mục được dịch lại từ nguyên tác hiện hành; bản nháp chỉ dùng để tham khảo thuật ngữ.

## 1. Lỗi hệ thống phát hiện trong bản nháp

| Mã | Mức | Mô tả | Bằng chứng | Cách xử lý | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| S-01 | CAO | Cột `Nguồn` bị cắt cụt: 133 mục mất một phần danh mục, có mục chỉ còn nguồn đầu tiên | `audit.json` trước khi sửa: 133 mục thiếu URL | `sync-sources.mjs` chép lại nguyên văn cột `来源`; `merge.mjs` tiếp tục ép lại ở mọi lần gộp | đã sửa toàn bộ 672 mục |
| S-02 | CAO | 404 mục bị lược số liệu trong `Lợi ích`, thường mất khoảng tin cậy, tỷ số và số mẫu | đối chiếu số theo từng mục, `audit.json` | dịch lại toàn bộ từ nguyên tác; kiểm tra số tự động | đang hoàn tất theo từng chương |
| S-03 | CAO | 95 mục mới của nguyên tác chưa có bản dịch | so khớp 672 với 767 | dịch mới | đang hoàn tất |
| S-04 | CAO | 77 tiêu đề mục đã đổi trong nguyên tác, bản nháp vẫn giữ tiêu đề cũ | so khớp tiêu đề giữa hai commit | dịch lại tiêu đề theo bản hiện hành | đang hoàn tất |
| S-05 | CAO | Thuật ngữ hình sự sai: `拘役` bị dịch thành «cải tạo không giam giữ»; `司法解释` thành «giải thích của tòa» | mục 22.3, 22.4 | bảng thuật ngữ pháp lý bắt buộc + soát lại | đã sửa ở các lô mới |
| S-06 | CAO | Dịch sai điều kiện địa điểm: `地下一层以下（不含地下一层）` thành «dưới tầng hầm một» | mục 22.5 | sửa thành «từ tầng hầm hai trở xuống (không tính tầng hầm một)» | đã sửa |
| S-07 | CAO | Thêm dữ kiện không có trong nguyên tác (ví dụ «cửa phải giải đố mới mở», «người bị lừa hút cũng bị tạm giữ 10–15 ngày») | mục 22.4, 22.5 | bỏ; chỉ dịch điều nguyên tác viết | đã sửa |
| S-08 | TRUNG | 9 bài dài bị dịch máy nặng, nhiều câu tối nghĩa («tách một bút sổ rối», «bầy chiếu khán») | `vi/docs/` bản cũ | dịch lại toàn bộ 9 bài | chưa xong |
| S-09 | TRUNG | Đơn vị Trung Quốc («vạn», «亿») và dấu thập phân không thống nhất | quét toàn văn | `normalize-units.mjs`: «10 vạn» → «100.000», «0.65» → «0,65», giữ nhóm nghìn | đã chạy, sẽ chạy lại sau khi gộp |
| S-10 | TRUNG | Phần mở đầu 34 chương còn là bản cũ, có chương nhắc số mục đã lệch | so sánh `vi/book` với `book` | dịch lại phần mở đầu, kiểm tra tập số mục | chưa xong |
| S-11 | THẤP | Nhãn `Chỉ tham khảo TQ` rải rác, không thống nhất | quét `Ghi chú` | chuẩn hóa thành «Chỉ áp dụng ở Trung Quốc:» ở đầu ghi chú | đang làm |
| S-12 | CAO | Mục 1.34: `90895.5 亿元` dịch thành «90895,5 tỷ tệ», sai 10 lần (đúng là 9.089,55 tỷ) | đối chiếu số tự động sau khi bổ sung đơn vị `tỷ/triệu` | sửa cả hai con số; bổ sung kiểm tra đơn vị | đã sửa |
| S-13 | CAO | Mục 22.3 vẫn còn «cải tạo không giam giữ» cho `拘役` và «giải thích của tòa» cho `司法解释` sau khi đã có quy ước | đọc lại chương 22 | sửa thành «tạm giữ hình sự» và «giải thích tư pháp» | đã sửa |
| S-14 | CAO | Mục 22.5: phần «Nói dễ hiểu» vẫn viết «dưới tầng hầm một» dù phần «Lợi ích» đã đúng | đọc lại chương 22 | sửa thành «từ tầng hầm hai trở xuống, tức là tầng hầm một vẫn được phép» | đã sửa |

| S-15 | CAO | Bộ kiểm tra số bỏ sót đơn vị `千`/`千余`/`多万`, nên `9 千余元` và `2000 多万` bị coi là thiếu số dù bản dịch đúng | rà 34 chương sau khi gộp | mở rộng bộ chuẩn hóa và đối chiếu số | đã sửa |
| S-16 | CAO | Mỗi lần gộp lại ghi đè bản đã chuẩn hóa bằng bản thô, làm `610.6 vạn` quay lại và audit báo thiếu số | phát hiện khi chương 11 tái phát | thêm `postmerge.mjs`, bắt buộc gộp → chuẩn hóa → audit | đã sửa |
| S-17 | TRUNG BÌNH | 22 phần mở đầu cũ thiếu mục mới, có chương thiếu 10 mục; một số tiêu đề còn chữ Hán | kiểm tra tập số mục từng chương | dịch lại 34 phần mở đầu, kiểm tra đủ/không lặp, nối liên kết nội bộ | đã sửa |
| S-18 | THẤP | `十万分之一` dịch thành «một phần một trăm nghìn», đúng nghĩa nhưng mất con số để đối chiếu | audit chương 20 | đổi thành `1/100.000` | đã sửa |

| S-19 | CAO | Các sửa tay ở chương 1, 18, 20, 22 bị lần gộp sau ghi đè, lỗi cũ quay lại (`cải tạo không giam giữ`, `dưới tầng hầm một`) | rà lại sau khi gộp chương 31–33 | thêm `fixups.mjs` chạy trong `postmerge.mjs` sau chuẩn hóa | đã sửa |

## 2. Quy trình sửa một mục

1. Đọc nguyên tác của đúng mục đó, không đọc câu rời.
2. Dịch lại đủ sáu trường, giữ nguyên mọi số, URL, DOI, số điều.
3. Chạy `check-out.mjs` cho lô: đủ mục, đủ trường, đủ số, đủ link, không chữ Hán ngoài `Nguồn`.
4. Gộp vào chương bằng `merge.mjs`; script ép lại `Nguồn` và cost tag từ nguyên tác.
5. Chạy `audit.mjs`: mục nào còn thiếu số, lệch nguồn, thiếu trường thì đưa lại vào hàng sửa.
6. Đọc lại cả chương bằng `check-chapter.mjs` (số mục, số, nguồn, câu dài) và đọc mẫu các mục nguy cơ cao.

## 3. Kiểm tra theo chương

Bảng đầy đủ nằm trong `vi/manifest.json` (mỗi chương: số mục nguồn, số mục đã dịch, mục thiếu, số mục thiếu số, nguồn lệch). Cột «đạt» chỉ được đánh khi:

- đủ số mục;
- `audit.json` không còn mục thiếu số;
- `Nguồn` khớp nguyên văn;
- không còn chữ Hán ngoài `Nguồn`;
- đã đọc lại toàn chương và sửa các lỗi nghĩa/tiếng Việt phát hiện được.

## 4. Kiểm tra EPUB

- EPUBCheck 5.4.0: xem `vi/qa/report.md`.
- `check-content.mjs`: đủ chương, đủ mục, tiêu đề khớp nguồn, không rỗng.
- `check-links.mjs`: mọi liên kết nội bộ và neo phải tồn tại.
- `render-qa.mjs`: ảnh chụp bìa, trang tiêu đề, mục lục, mở chương, một mục, phụ lục ở ba khổ.

## 5. Những gì chưa kiểm tra được

- Chưa thử trên Apple Books, Kindle, Kobo hay Thorium; chỉ kiểm tra bằng EPUBCheck và engine Chromium. Báo cáo cuối sẽ ghi rõ.
- Chưa có người bản ngữ đọc toàn bộ 767 mục; đây là giới hạn thật của ấn bản này.
- Các liên kết ngoài không được kiểm tra trực tuyến trong lần dựng này (nhiều trang chính phủ Trung Quốc chặn truy cập từ nước ngoài).
