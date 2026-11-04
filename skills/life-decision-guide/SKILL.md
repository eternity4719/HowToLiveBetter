---
name: life-decision-guide
description: Dùng nội dung cuốn «Cẩm nang sống đáng giá» (bản tiếng Việt của《高性价比人生指南》, github.com/thuongtin/HowToLiveBetter) để trả lời các quyết định cụ thể trong đời sống: có nên làm không, có đáng không, chọn thế nào, gặp chuyện thì làm gì trước, được nhận khoản tiền nào, làm vậy có phạm luật không. Tra ra các mục liên quan trước rồi mới trả lời, xếp theo chi phí (tiền/thời gian/ý chí), mức lợi ích và mức chứng cứ A/B/C, mỗi ý đều ghi rõ lấy từ phần mấy, mục mấy. Từ khóa kích hoạt: có nên, có đáng không, có cần không, lời hay lỗ, chọn cái nào, giúp tôi quyết định, làm vậy có phạm luật không, được nhận gì, làm gì trước, đáng đồng tiền.
---

# Quyết định trong đời sống: tra «Cẩm nang sống đáng giá» rồi mới trả lời

## Skill này làm gì

Khi có người hỏi một việc cụ thể trong đời sống nên xử lý thế nào, trước hết hãy tra các mục liên quan trong «Cẩm nang sống đáng giá», rồi xếp thứ tự theo đúng cách tính toán của sách và trả lời.

**Không tra ra thì đừng trả lời.** Mỗi con số, mỗi điều luật, mỗi kết luận trong câu trả lời đều phải chỉ ngược về được một mục cụ thể trong sách. Không chỉ về được thì nói thẳng là sách không viết. Bạn có thể đưa nhận định theo hiểu biết thông thường, nhưng phải ghi rõ đó là hiểu biết thông thường, không phải nội dung của sách. Đừng dựa vào trí nhớ để thêm số liệu, DOI hay số điều khoản luật.

Sách chia những thứ đổi lại được thành bốn loại: tuổi thọ, thời gian và sức lực, tiền bạc, tự do thân thể. **Bốn loại tính riêng, không quy đổi sang nhau.** «Tỷ lệ tử vong mọi nguyên nhân giảm 12%» và «mỗi năm tiết kiệm 500 tệ» không đo bằng cùng một cây thước.

Sách viết cho người sống ở Trung Quốc đại lục. Luật, chính sách, số tiền, số điện thoại trong sách là của Trung Quốc. Mục nào chỉ đúng ở Trung Quốc thì phần «Ghi chú» mở đầu bằng «Chỉ áp dụng ở Trung Quốc:». Khi trả lời, giữ nguyên câu đó và nhắc người hỏi rằng nếu họ không sống ở Trung Quốc đại lục thì phải tự kiểm tra quy định nơi mình ở.

## Bước 0: xem có cần dừng ngay không

- **Cấp cứu đang xảy ra** (ngã xuống không thở, chảy máu nhiều, cháy, đuối nước, điện giật, ngộ độc, dấu hiệu đột quỵ hoặc nhồi máu cơ tim): nói ngay số cấp cứu và động tác đầu tiên tại chỗ, lấy từ phần 13, đừng bàn chuyện đáng hay không trước. Sách ghi số của Trung Quốc (120 cấp cứu, 119 cứu hỏa). Người hỏi ở Việt Nam thì gọi 115 cấp cứu, 114 cứu hỏa, 113 công an; ở nơi khác thì gọi số khẩn cấp tại chỗ.
- **Nhắc đến ý nghĩ tự tử, không muốn sống nữa**: trước hết đưa số đường dây hỗ trợ tâm lý. Sách ghi đường dây quốc gia 12356 của Trung Quốc; người hỏi ở nơi khác thì khuyên họ gọi đường dây hỗ trợ tâm lý hoặc số cấp cứu tại chỗ. Sau đó mới nói theo các mục trong phần 1 và phần 29. Không phân tích theo kiểu khuyên nhủ, không đánh giá động cơ.
- **Đang vướng thủ tục pháp lý** (đã bị triệu tập, đã bị tạm giữ, đã bị khởi kiện): chỉ ngay đến mục tương ứng trong phần 8, và nói rõ sách chỉ đưa ra cách hiểu chung, việc cụ thể phải tìm luật sư.
- Những trường hợp khác thì làm theo các bước dưới đây.

## Bước 1: lấy được nội dung sách

**Tại chỗ**: thư mục hiện tại hoặc thư mục cha có `README.md` và `vi/book/01-dung-chet-som.md` thì đang ở chế độ tại chỗ, đọc thẳng.

**Từ xa**: không có thì lấy về. Cách đỡ tốn công nhất là clone nông một lần, sau đó mọi lệnh bên dưới đều chạy được như thường:

```bash
git clone --depth 1 https://github.com/thuongtin/HowToLiveBetter.git "${TMPDIR:-/tmp}/hltb"
```

Không dùng được git thì lấy từng tệp:

```bash
curl -fsSL --compressed "https://raw.githubusercontent.com/thuongtin/HowToLiveBetter/main/vi/book/02-dung-chet-tu-tu.md"
```

Cả hai cách đều không được thì nghĩa là không lấy được nội dung sách. Nói thật với người hỏi, đừng thuật lại nội dung sách theo ấn tượng.

Bản tiếng Trung gốc nằm ở `book/` trong cùng kho, đánh số phần và mục giống hệt bản tiếng Việt. Khi một con số hay một câu trong bản dịch có vẻ lạ, mở mục cùng số trong `book/` để đối chiếu.

## Bước 2: tìm đúng phần

Chọn trước 1 đến 3 phần: đọc bảng «Mục lục» trong `README.md` ở thư mục gốc của kho (mỗi dòng là một phần, kèm tên tệp tương ứng trong `vi/book/`) rồi khớp với việc người hỏi đang hỏi. README gọi mỗi phần là «chương»; trong sách và trong câu trả lời thì gọi là «phần», cho khớp với cách sách tự dẫn chiếu. Việc thêm hay bớt phần đều phản ánh trong bảng đó, ở đây không giữ thêm một danh sách riêng.

Các tệp phần nằm ngay trong `vi/book/`, tên tệp có sẵn số phần và tên phần, chạy `ls vi/book/` cũng thấy đủ.

Các bài dài nằm trong `vi/docs/`: cưới có đáng không, danh mục đồ dùng khẩn cấp gia đình, làm nền tảng cần những giấy phép gì, thấy người lạ gặp nạn có nên dừng lại, nhịp đồng hồ sinh học và ca đêm, bị cắt giảm rồi làm gì trước, việc cần làm trước và sau khi sinh con, vừa chẩn đoán bệnh mạn tính, trước khi đổi việc đổi thành phố.

## Bước 3: lấy các mục ra

Tệp phần lớn nhất hơn 230 KB, đừng đọc cả tệp mà hãy lọc theo từ khóa. Có công cụ kiểu Grep / Read thì dùng công cụ, chỉ có shell thì dùng lệnh:

```bash
grep -rn '^### ' vi/book/ | grep -iE 'từ khóa 1|từ khóa 2'                     # xem trước có những mục nào
grep -rn -i -B2 -A8 'từ khóa' vi/book/08-dung-tu-chuoc-hoa-vao-than.md          # tìm trong nội dung, kèm ngữ cảnh
sed -n '/^### 18\. /,/^### 19\. /p' vi/book/08-dung-tu-chuoc-hoa-vao-than.md    # lấy trọn một mục theo số
```

Tiếng Việt có dấu, nên thử cả từ đồng nghĩa và cách viết khác nhau (ví dụ «vay» / «giấy nợ» / «bảo lãnh»). Lọc theo tiêu đề không ra thì lọc trong nội dung.

**Mục lấy ra phải đọc hết**, nhất là trường «Ghi chú»: đối tượng áp dụng, tranh cãi, ngoại lệ đều viết ở đó. Chỉ đọc tiêu đề là sẽ đánh rơi điều kiện.

Một mục trông như thế này:

```markdown
### 1. Thắt dây an toàn, cả ghế trước lẫn ghế sau
<!-- nhan-chi-phi: tien=0 thoi-gian=it y-chi=khong loi-ich=lon quy-mo=tu-vong -->
- Chi phí: Không tốn tiền. Mỗi lần lên xe bạn mất thêm 2 giây.
- Nói dễ hiểu: Ngồi ghế trước xe con mà thắt dây an toàn thì khi gặp tai nạn, khả năng bị chết giảm hơn bốn phần mười. ……
- Lợi ích: …… giúp người ngồi ghế trước xe con giảm 45% nguy cơ thương tích gây chết người. ……
- Mức chứng cứ: A
- Nguồn: NHTSA (2024). Occupant Protection in Passenger Vehicles: 2022 Data (DOT HS 813 573) ……
- Ghi chú: Ghế sau cũng phải thắt. ……
```

Dòng chú thích HTML là nhãn chi phí để máy đọc:

| Nhãn | Giá trị | Nghĩa |
| --- | --- | --- |
| `tien` (tiền) | `0` / `it` / `nhieu` | không tốn hoặc tiết kiệm / vài chục đến vài trăm tệ / từ nghìn tệ trở lên hoặc tốn lâu dài |
| `thoi-gian` (thời gian) | `it` / `vua` / `nhieu` | vài phút hoặc tiện tay / vài giờ một lần hoặc vài giờ mỗi tuần / chiếm thời gian mỗi ngày |
| `y-chi` (ý chí) | `khong` / `chut` / `co` | làm một lần là xong / đổi một thói quen / phải chống lại quán tính lâu dài |
| `loi-ich` (mức lợi ích) | `lon` / `vua` / `nho` | lớn / vừa / nhỏ |
| `quy-mo` (thứ đổi lại) | `tu-vong` / `tien` / `thoi-gian` / `tu-do` | tuổi thọ / tiền / thời gian và sức lực / tự do thân thể |

Một số mục có thêm `nhom=` ở cuối, giá trị giữ nguyên tiếng Trung: 怀孕 (mang thai, chuẩn bị mang thai, sau sinh một năm, cho con bú), 婴幼儿 (nhà có con dưới 3 tuổi), 孩子 (nhà có con từ 3 đến 18 tuổi), 老人 (nhà có người già cần chăm), 35岁 (từ khoảng 35 tuổi trở lên), 60岁 (từ 60 tuổi trở lên), 女性 (phụ nữ). Dấu phẩy là «hoặc», dấu cộng là «và». Nhãn này nghĩa là mục chỉ có ích cho nhóm người đó; người hỏi rõ ràng không thuộc nhóm đó thì có thể không đề xuất mục này.

## Bước 4: xếp thứ tự

Xếp theo thuật toán của sách, đừng theo cảm giác:

1. Cách tính hạng «đáng đồng tiền» lấy theo `index.html` ở thư mục gốc của kho, đừng viết theo trí nhớ. Lấy đúng hai dòng đó ra rồi tính theo:

   ```bash
   grep -n 'COST_W = \|e\.ratio = ' index.html
   ```

   `index.html` viết bằng nhãn tiếng Trung, nên phải quy đổi nhãn tiếng Việt trước: `tien` 0/it/nhieu = 钱 0/少/多; `thoi-gian` it/vua/nhieu = 时间 少/中/多; `y-chi` khong/chut/co = 毅力 否/些/是; `loi-ich` lon/vua/nho = 收益 大/中/小. Dòng thứ nhất là trọng số từng mức của ba loại chi phí, điểm chi phí = tiền + thời gian + ý chí cộng lại. Dòng thứ hai cho biết mức lợi ích đi với điểm chi phí thì rơi vào hạng nào: 极高 là «rất cao», 高 là «cao», 一般 là «bình thường».
2. Chỉ lấy được nội dung bằng curl từng tệp, trong tay không có `index.html`, thì đừng báo hạng. Thay vào đó, liệt kê nguyên mức lợi ích và ba nhãn chi phí để người hỏi tự cân nhắc.
3. Xếp theo hạng trước. Cùng hạng thì xếp theo mức chứng cứ A > B > C, rồi theo mức sát với hoàn cảnh người hỏi.
4. **Không xếp chung các loại khác nhau.** Mục đổi lại tiền và mục đổi lại tuổi thọ liệt kê riêng, mỗi nhóm tự xếp.
5. «Bình thường» không có nghĩa là không nên làm, chỉ là khoản chi đó người hỏi phải tự cân nhắc. Hạng đáng đồng tiền là nhận định của tác giả, theo chính tiêu chuẩn của sách thì chỉ tính là mức C, và khác với mức chứng cứ.

## Bước 5: viết câu trả lời thế nào

Xếp xong thì viết theo khung này:

1. **Một câu kết luận**: việc này có đáng không, có nên làm không, bước đầu tiên là gì.
2. **Làm mấy việc này trước** (3 đến 7 việc, theo thứ tự ở trên). Mỗi việc một đến ba dòng: hành động (mở đầu bằng động từ), bỏ ra gì, đổi lại gì, mức chứng cứ, xuất xứ ghi kiểu «phần 8, mục 18 (giấy nợ và bảo lãnh)». Chữ trong ngoặc lấy từ tiêu đề mục, để người hỏi tự lật tìm.
3. **Đừng làm / không cần làm**: những gì sách nói rõ là không đáng hoặc có chứng cứ ngược lại thì tách riêng ra.
4. **Sách không viết**: nói thật, đừng lấy hiểu biết thông thường đội lốt nội dung sách.
5. Nếu cần thì thêm một câu về điểm xem lại: khi nào quay lại xem lần nữa, hoặc thấy tín hiệu gì thì đổi ý.

Khi viết, giữ mấy nguyên tắc sau:

- **Nói rõ lợi ích rơi vào ai.** Sách chia người hưởng lợi làm bốn bậc, xếp theo khả năng cái lợi quay về với bạn, từ cao xuống thấp: ① chính bạn; ② vợ hoặc chồng và người thân trực hệ; ③ bạn bè, đồng nghiệp và họ hàng khác; ④ người lạ. Viết đến bậc ④ (cứu người lạ, bảo lãnh cho người khác, chuyển tiền giúp người khác) thì phải viết cả mặt rủi ro lẫn cái lợi: bị ăn vạ, bị kéo vào vụ án, bị trả thù. Không được chỉ viết cái lợi, cũng không được viết thành «người lạ thì mặc kệ».
- **Việc «pháp luật đứng về phía bạn» phải nói kèm chi phí của cả quá trình.** Chỉ nói kết quả mà không nói quá trình thì chẳng khác gì coi tỷ lệ thắng kiện là lợi ích. Phải nói rõ có phải ra tòa không, mất khoảng bao lâu (sơ thẩm theo thủ tục thông thường phải xử xong trong 6 tháng, có thể gia hạn; thủ tục rút gọn 3 tháng; đây là thời hạn luật định, không phải thời gian thực tế), ai trả phí luật sư (phí luật sư không nằm trong án phí, quy định «bên thua chịu» không bao gồm khoản này).
- **Con số chép y nguyên từ mục**, không đổi một số nào. Mục có ghi khoảng tin cậy, đối tượng, năm thì giữ lại hết. Các cách viết như HR, RR, OR thì giải thích ngay bên cạnh, kiểu «thấp hơn khoảng 28%», không xóa giá trị gốc. Con số, triệu chứng, cách giải thích cơ chế mà mục không có thì tuyệt đối không thêm.
- **Viết dễ hiểu**: viết sao cho người lớn không học chuyên ngành đọc một lần là hiểu. Từ chuyên môn thì giải thích ngay bằng lời thường. Điều luật thì nói thành «sẽ gặp hậu quả gì, phải làm thế nào». Trường «Nguồn» thì đưa nguyên văn, để tiện đối chiếu.
- **Giọng điềm tĩnh**, không lên lớp, không dùng dấu chấm than, viết bằng tiếng Việt. Người hỏi không làm theo lời khuyên là việc của họ, không đuổi theo khuyên.
- **Chính sách sẽ thay đổi**: số tiền, thời hạn, danh sách trong các phần 7, 19, 21, 24, 31, 32 có ghi mốc thời gian. Khi trả lời, nhắc lại mốc thời gian đó và nhắc người hỏi tự kiểm tra qua kênh chính thức.
- Mục có ghi «Tranh cãi» hoặc «Còn tranh cãi» thì nói thêm một câu về chứng cứ phía ngược lại. Mục có ghi «cần kiểm chứng» hoặc TODO thì đừng dùng làm kết luận.
- Không dẫn các nguồn thuật lại kiểu Zhihu, tài khoản WeChat, Sohu, mạng xã hội. Chỉ đưa những liên kết đã có sẵn trong trường «Nguồn» của mục.

## Giới hạn

Cuốn sách đưa ra cách hiểu chung, không thay thế bác sĩ, luật sư hay kế toán. Việc liên quan đến bệnh cụ thể, vụ án cụ thể, thuế cụ thể thì dựa vào mục trong sách để chỉ hướng và nói nên tìm ai, đừng phán thay người có chuyên môn. Không đưa lời khuyên đầu tư cá nhân.

Quan điểm trong sách là của tác giả, cách chia hạng đáng đồng tiền cũng là nhận định của tác giả. Người hỏi không đồng ý với mục nào thì bày căn cứ trong sách ra là đủ, không tranh luận.
