# Cẩm nang sống đáng giá — bản tiếng Việt (v1.0.3)

Bản dịch tiếng Việt đầy đủ của **《高性价比人生指南》** (*HowToLiveBetter*) của **eternity4719**, nguyên tác tại commit `e2605d3`.

**Kho mã nguồn bản tiếng Việt: https://github.com/thuongtin/HowToLiveBetter**

## Thay đổi so với v1.0.2

Sửa lỗi hiển thị trên **Boox** (NeoReader), qua thử trực tiếp trên máy (PR #3):

- **Trang Mục lục**: bấm vào một dòng giờ nhảy thẳng tới chương. Trước đây Boox mở một khung xem trước với chữ dính liền nhau. Trang mục lục trong sách giờ chỉ liệt kê chương và phụ lục; danh sách đủ 767 mục có trong menu Mục lục của ứng dụng đọc.
- **Không còn dính chữ** trong khung xem trước khi bấm tham chiếu chéo («47Từ», «Mức chứng cứ Aít tiền»).
- **«Mức chứng cứ A» không còn bị khung đè lên chữ bên cạnh**; số mục không còn khoảng trống lớn phía sau.
- **Tham chiếu chéo trỏ đúng chương**: khoảng 470 chỗ dạng «mục 10 của phần 19», «mục 7 phần 2» trước đây trỏ nhầm sang mục cùng số của chương đang đọc. Phụ lục cũng có liên kết tham chiếu.
- **Phông ký hiệu**: thêm phông phụ HTLB Symbols (rút từ DejaVu Serif) cho ℃, ≥, ≤, ≈, γ, μ… mà phông nhúng không có, để không hiện ô vuông.
- **Chữ dễ đọc hơn trên e-ink**: tắt ngắt âm tiết tự động, bỏ chữ cái lớn đầu chương, căn trái tiêu đề, danh sách và phần Nguồn, khung «Nói dễ hiểu» được ngắt trang khi chữ to.
- Sửa một tham chiếu dịch sai ở chương 1 (mục 12 phần 16, bệnh phổi tắc nghẽn mạn tính).

## Trong bản phát hành này

- **34 chương, 767/767 mục**, 34 phần mở đầu, **9 bài dài** (phụ lục).
- Mỗi mục giữ đủ sáu trường: Chi phí, Nói dễ hiểu, Lợi ích, Mức chứng cứ, Nguồn, Ghi chú.

## Đã kiểm tra

- EPUBCheck 5.4.0 chạy trong workflow phát hành (release chỉ được tạo khi không có lỗi).
- `check-content`: 34 chương, 767 mục, 0 vấn đề. `check-links`: 2.686 liên kết nội bộ, 0 hỏng.
- Mọi ký tự ngoài chữ Hán trong phần Nguồn đều có trong phông nhúng.
- Kết xuất ở khổ 460 px, chữ 120%: 0 tràn ngang.

## Giới hạn

- Chưa có người bản ngữ đọc toàn bộ.
- Đã sửa theo ảnh chụp trên Boox; Apple Books, Kindle, Kobo, Thorium, Calibre chưa thử.
- 2.578 liên kết ngoài chưa kiểm tra trực tuyến.
- Nội dung y khoa/pháp luật là bản dịch trung thành của nguyên tác Trung Quốc, không phải lời khuyên độc lập cho Việt Nam.

## Giấy phép và ghi công

- Nguyên tác và bản dịch: **CC BY 4.0**. Bản dịch kế thừa bản cộng đồng của **chuanman2707** (CC BY 4.0).
- Phông chữ: Literata, Be Vietnam Pro, Cormorant Garamond (SIL OFL 1.1); HTLB Symbols, bản rút gọn của DejaVu Serif (giấy phép Bitstream Vera, xem `vi/fonts/HTLBSymbols-LICENSE.txt`).

Đây là ấn bản không chính thức, không liên kết với nhà xuất bản của bản tiếng Trung.
