// Các sửa tay đã kiểm chứng, phải chạy lại sau mỗi lần gộp vì merge ghi đè từ bản nháp.
// 用法：node tools/vi/fixups.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from '../lib/book.mjs';

const FIXES = [
  ['vi/book/01-dung-chet-som.md',
   '### 32. Ý nghĩ tự tử vừa nảy ra thì nói ngay cho một người bên cạnh, giao mấy chục phút đó cho họ',
   '### 32. Ý nghĩ tự tử vừa nảy ra thì nói ngay với một người bên cạnh, đừng ở một mình trong mấy chục phút đó'],

  ['vi/book/18-nuoi-con-co-dang-khong.md',
   'Vi phạm thì bị phạt 1000 đến 5000 tệ mỗi người. Muốn đòi bồi thường thì đi thế nào, xem phần 19.',
   'Nếu đơn vị vi phạm quy định về tăng ca hoặc ca đêm trong thời gian cho con bú thì bị phạt 1000 đến 5000 tệ mỗi người. Còn bị giảm lương hay sa thải trái pháp luật thì đi trọng tài lao động để đòi phục hồi hoặc bồi thường; cách làm xem phần 19.'],

  ['vi/book/20-cham-tre-so-sinh.md',
   'một phần một trăm nghìn',
   '1/100.000'],

  ['vi/book/22-thu-gian-the-nao.md',
   'cải tạo không giam giữ',
   'tạm giữ hình sự'],

  ['vi/book/22-thu-gian-the-nao.md',
   'Giải thích của Tòa án nhân dân tối cao',
   'Giải thích tư pháp của Tòa án nhân dân tối cao'],

  ['vi/book/22-thu-gian-the-nao.md',
   'cũng không được đặt dưới tầng hầm một.',
   'cũng không được đặt từ tầng hầm hai trở xuống.'],

  ['vi/book/22-thu-gian-the-nao.md',
   'dưới tầng hầm một của tòa nhà trở xuống (không tính tầng hầm một)',
   'từ tầng hầm hai của tòa nhà trở xuống (không tính tầng hầm một)'],
];

let changed = 0, missing = 0;
for (const [file, from, to] of FIXES) {
  const p = resolve(ROOT, file);
  const text = readFileSync(p, 'utf8');
  if (!text.includes(from)) { console.log(`KHÔNG THẤY: ${file} — ${from.slice(0, 50)}…`); missing++; continue; }
  const next = text.split(from).join(to);
  writeFileSync(p, next);
  changed += text.split(from).length - 1;
}
console.log(`Sửa tay: ${changed} chỗ; ${missing} mẫu không thấy`);
