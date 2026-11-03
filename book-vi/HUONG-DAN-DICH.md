# Hướng dẫn dịch (cho người và cho AI)

Dịch `book/NN-*.md` sang tiếng Việt thành `book-vi/NN-<slug>.md`, mỗi chương một PR. Không sửa gì trong `book/`.

## Quy trình

1. `python3 tools-vi/prep.py N` chia chương thành các phần `tools-vi/work/NN/partK_src.md` (mặc định 6 mục/phần).
2. Dịch từng phần, lưu thành `tools-vi/work/NN/partK_vi.md`. Phần 1 gồm cả tiêu đề, đoạn mở đầu và danh sách nhóm chủ đề.
3. `python3 tools-vi/finish.py N <slug-không-dấu>` ghép, kiểm tra (đủ mục, đúng thứ tự, không sót chữ Hán, so số liệu) và cập nhật mục lục trong `book-vi/README.md`.
4. Xử lý mọi dòng CẢNH BÁO, rồi tạo nhánh `vi-chNN`, commit, mở PR. Không push thẳng vào main.

`tools-vi/work/` là thư mục tạm, không commit.

## Quy tắc giữ nguyên (tuyệt đối)

- Dòng `@@TAG@@` và dòng `- Nguồn: @@SRC@@` giữ y nguyên, không dịch, không bỏ, không thêm.
- Số liệu, khoảng tin cậy, HR/RR/OR/CI/P, số hiệu văn bản pháp luật, số điều khoản, tên riêng, số đường dây nóng (12315, 12378, 12333…): giữ nguyên giá trị.
- Không rút gọn, không thêm ý, không làm câu khẳng định mạnh hơn bản gốc. Giữ cả phủ định, điều kiện, phạm vi.

## Quy ước dịch

- Cấu trúc mục: `### N. Tiêu đề`, rồi `@@TAG@@`, rồi các dòng `- Chi phí:`, `- Nói dễ hiểu:`, `- Lợi ích:`, `- Mức bằng chứng:`, `- Nguồn:`, `- Ghi chú:` (tương ứng 成本、说人话、收益、证据等级、来源、备注).
- Tiêu đề đầu file: `[← Về mục lục](README.md)`, dòng trống, `# N. Tên chương`.
- 元 → tệ. 万 → vạn hoặc viết số đầy đủ. **亿 = 100 triệu**: ghi "N trăm triệu tệ (khoảng X tỷ)", kiểm tra phép nhân.
- "第 N 节第 M 条" → "mục M chương N". "本节第 N 条" → "mục N chương này". Giữ từ khóa mô tả trong ngoặc, ví dụ "mục 7 chương 5 (đổi lãi thành lãi suất quy năm)".
- HR/RR/OR/CI giữ ký hiệu, giải thích ngắn lần đầu trong mục (tỷ số nguy cơ, khoảng tin cậy).
- Mức bằng chứng A/B/C giữ nguyên. Đầu ghi chú có "争议" thì dịch thành "Có tranh cãi" hoặc "Tranh cãi" ở đầu ghi chú.
- Giọng văn: tiếng Việt tự nhiên, câu ngắn, không dùng từ Hán Việt khó hiểu khi có từ thường, không giảng đạo, không dùng dấu chấm than.
- Tên cơ quan, luật: dịch nghĩa lần đầu nếu cần, giữ tên gốc/số hiệu trong ngoặc khi giúp tra cứu.
