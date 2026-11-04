# Cẩm nang sống đáng giá — bản tiếng Việt

Bản dịch tiếng Việt của 《高性价比人生指南》 (HowToLiveBetter), nguyên tác của **eternity4719**: <https://github.com/eternity4719/HowToLiveBetter>.

Kho mã nguồn, bản phát hành và nơi gửi báo lỗi của bản tiếng Việt: <https://github.com/thuongtin/HowToLiveBetter>.

Ấn bản điện tử: **`dist/HowToLiveBetter-vi.epub`** (EPUB 3, reflowable, ngôn ngữ `vi`).

## Nội dung

- 34 chương, 772 mục lời khuyên.
- Mỗi mục: tiêu đề (một lời khuyên), Chi phí, Nói dễ hiểu, Lợi ích, Mức chứng cứ, Nguồn, Ghi chú.
- 9 bài dài (phụ lục) về hôn nhân, đồ dùng khẩn cấp, sơ cứu người lạ, giấy phép làm nền tảng, nhịp sinh học và ca đêm, mất việc, sinh con, bệnh mạn tính, đổi việc đổi thành phố.
- Lời giới thiệu của bản dịch, ghi chú về bối cảnh Trung Quốc, bảng thuật ngữ.

## Cấu trúc kho

```
vi/
  front/           lời giới thiệu, bối cảnh, bảng thuật ngữ, ấn bản
  book/            34 chương tiếng Việt (nguồn của EPUB)
  docs/            9 bài dài tiếng Việt
  fonts/           Literata, Be Vietnam Pro, Cormorant Garamond (OFL 1.1)
  source.json      commit nguyên tác, giấy phép, nguồn
  manifest.json    bản đồ nguồn Trung → bản dịch, số mục, tình trạng
  qa/              nhiệm vụ dịch, bản nháp, báo cáo, ảnh kiểm tra thị giác
tools/vi/
  make-tasks.mjs        cắt nguyên tác thành lô dịch
  check-out.mjs         kiểm tra một lô: số mục, trường, số, link, chữ Hán
  merge.mjs             gộp bản dịch vào vi/book, ép lại Nguồn và cost tag
  normalize-units.mjs   đổi «vạn / 亿» sang cách viết Việt Nam
  normalize-terms.mjs   thống nhất «phần/mục», KTC, tên cơ quan
  postmerge.mjs         gộp + chuẩn hóa + audit + manifest đúng thứ tự
  merge-docs.mjs        gộp 9 bài dài đã kiểm tra
  make-review-tasks.mjs sinh đề bài soát độc lập từng chương
  audit.mjs             đối chiếu toàn bộ với nguyên tác
  manifest.mjs          sinh vi/manifest.json
  make-cover.mjs        dựng bìa 1600×2400
  build-epub.mjs        dựng EPUB
  render-qa.mjs         chụp ảnh các trang ở 3 khổ màn hình
  check-links.mjs       kiểm tra liên kết nội bộ trong EPUB
```

## Dựng lại

Yêu cầu: Node.js ≥ 22, Java (để chạy EPUBCheck), Chrome/Chromium (để dựng bìa và chụp ảnh kiểm tra).

```bash
npm --prefix tools/vi ci
node tools/vi/make-cover.mjs
node tools/vi/build-epub.mjs              # → dist/HowToLiveBetter-vi.epub
java -jar epubcheck.jar dist/HowToLiveBetter-vi.epub
node tools/vi/audit.mjs
node tools/vi/manifest.mjs
```

Quy trình dịch (chạy khi cần cập nhật theo nguyên tác mới):

```bash
node tools/vi/make-tasks.mjs     # sinh vi/qa/tasks/*.md
# dịch từng lô vào vi/qa/out/*.md, kiểm tra bằng check-out.mjs
node tools/vi/merge.mjs          # gộp chương đã đủ mục
node tools/vi/normalize-units.mjs
node tools/vi/audit.mjs
node tools/vi/build-epub.mjs
```

## Kiểm tra chất lượng

- **Đối chiếu cấu trúc**: mỗi chương phải đủ số mục so với nguyên tác; mỗi mục đủ sáu trường và cost tag.
- **Số liệu**: mọi con số trong nguyên tác phải xuất hiện trong bản dịch cùng mục (kể cả khoảng tin cậy, tỷ số, số điều luật). `audit.mjs` báo từng mục thiếu số.
- **Dẫn chứng**: cột `Nguồn` được chép nguyên văn từ nguyên tác (giữ chữ Hán, URL, DOI, số hiệu văn bản) và được ép lại ở bước `merge.mjs`; không phụ thuộc vào việc người dịch chép tay.
- **Chữ Hán**: ngoài cột `Nguồn`, thân bài không còn chữ Hán.
- **Liên kết**: `check-links.mjs` kiểm tra mọi liên kết nội bộ và neo trong EPUB.
- **EPUBCheck**: mục tiêu 0 lỗi, 0 cảnh báo.
- **Thị giác**: `render-qa.mjs` chụp trang bìa, trang tiêu đề, mục lục, mở chương, một mục, phụ lục ở 620, 820 và 1100 px.

## Giấy phép và ghi công

- Nguyên tác và bản dịch phát hành theo **CC BY 4.0**: <https://creativecommons.org/licenses/by/4.0/>.
- Bản dịch kế thừa bản cộng đồng của **chuanman2707** (CC BY 4.0), sau đó được đối chiếu lại với nguyên tác tiếng Trung và dịch lại toàn bộ theo bản hiện hành.
- Phông chữ theo SIL Open Font License 1.1; xem `fonts/`.

Đây là ấn bản không chính thức, không liên kết với nhà xuất bản của bản tiếng Trung.
