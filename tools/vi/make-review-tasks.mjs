// Sinh đề bài soát độc lập cho từng chương, kèm cờ lỗi hiện có từ audit.
// 用法：node tools/vi/make-review-tasks.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from '../lib/book.mjs';

const DIR = resolve(ROOT, 'vi/qa/review');
rmSync(DIR, { recursive: true, force: true }); mkdirSync(DIR, { recursive: true });
const audit = JSON.parse(readFileSync(resolve(ROOT, 'vi/qa/audit.json'), 'utf8'));
const zh = readdirSync(resolve(ROOT, 'book')).filter(f => f.endsWith('.md')).sort();
const vi = readdirSync(resolve(ROOT, 'vi/book')).filter(f => f.endsWith('.md')).sort();

audit.chapters.forEach((c, i) => {
  const no = Number(c.zh.slice(0, 2));
  const brief = `# SOÁT ĐỘC LẬP — chương ${no}

- Nguyên tác: \`book/${c.zh}\`
- Bản dịch: \`vi/book/${c.vi}\`
- Số mục: ${c.viEntries}/${c.zhEntries}${c.missing.length ? `; thiếu: ${c.missing.join(', ')}` : ''}
- Mục thiếu số (audit): ${c.numMissing.length ? JSON.stringify(c.numMissing) : 'không'}
- Nguồn lệch: ${c.sourceMismatch.length}; chữ Hán ngoài Nguồn: ${c.cjkOutsideSource.length}; chữ Hán trong tiêu đề: ${c.titleCjk}
- Trường quá ngắn: ${c.lowRatio.length ? JSON.stringify(c.lowRatio) : 'không'}

Đọc TOÀN BỘ hai tệp. Soát từng mục theo thứ tự ưu tiên:

1. **Nghĩa (CRITICAL/HIGH)**: bỏ sót câu, thêm ý không có trong nguyên tác, đảo nghĩa, sai điều kiện/ngoại lệ, sai chủ thể, sai con số hoặc đơn vị.
2. **An toàn (CRITICAL)**: y khoa, cấp cứu, thai sản, trẻ em, pháp luật, tiền bạc. Câu nào có thể khiến người đọc làm sai thì sửa ngay.
3. **Tiếng Việt (MEDIUM)**: câu cụt, thiếu chủ ngữ/vị ngữ, dịch sát chữ Hán, từ ghép lạ, câu tối nghĩa, lặp từ, giọng văn không tự nhiên.
4. **Nhất quán (LOW/MEDIUM)**: thuật ngữ, cách gọi «phần/mục», dấu câu, số thập phân, tên cơ quan.

Quy tắc sửa:
- Sửa trực tiếp tệp \`vi/book/${c.vi}\` bằng công cụ edit; sửa từng chỗ, không viết lại cả chương.
- KHÔNG sửa dòng \`- Nguồn:\` (giữ nguyên văn; đó là dữ liệu đối chiếu).
- KHÔNG đổi cost tag, không đổi số mục, không đổi cấu trúc sáu trường.
- Không đổi con số, trừ khi con số đang sai so với nguyên tác; khi đó ghi rõ trong báo cáo.
- Không thêm lời bình, không thêm khuyến nghị mới, không «nâng cấp» giọng văn.
- Giữ nguyên các câu ngắn có chủ ý của tác giả.

Sau khi sửa, chạy \`node tools/vi/check-chapter.mjs ${no}\` để xem lại số mục/số/nguồn (audit có thể còn cũ; nếu báo thiếu số do đơn vị vạn/tỷ thì bỏ qua).

Trả về JSON: {"chapter":${no},"fixes":<số chỗ sửa>,"critical":<số>,"high":<số>,"medium":<số>,"notes":"2-3 câu, nêu 1-2 lỗi điển hình đã sửa"}.
`;
  writeFileSync(resolve(DIR, `ch${String(no).padStart(2, '0')}.md`), brief);
});
console.log(`Sinh ${audit.chapters.length} đề bài soát trong vi/qa/review/`);
