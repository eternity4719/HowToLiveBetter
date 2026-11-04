// Sinh nhiệm vụ dịch 9 bài dài trong docs/ (không gồm bảng đối chiếu nội bộ).
// 用法：node tools/vi/make-doc-tasks.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from '../lib/book.mjs';

const ZH = resolve(ROOT, 'docs'), VI = resolve(ROOT, 'vi/docs');
const DIR = resolve(ROOT, 'vi/qa/doc-tasks');
rmSync(DIR, { recursive: true, force: true }); mkdirSync(DIR, { recursive: true });

const ORDER = ['cuoi-co-dang-khong', 'danh-muc-do-dung-khan-cap-gia-dinh', 'gap-nguoi-la-bi-nan-co-nen-dung-lai',
  'lam-nen-tang-can-nhung-giay-phep-gi', 'nhip-dong-ho-sinh-hoc-va-ca-dem', 'bi-cat-giam-roi-lam-gi-truoc',
  'viec-can-lam-truoc-va-sau-khi-sinh-con', 'vua-chan-doan-benh-man-tinh', 'truoc-khi-doi-viec-doi-thanh-pho'];
// ghép theo thứ tự tên tệp tiếng Trung đã biết trong README
const known = ['结婚划不划算.md', '家庭应急装备清单.md', '遇到陌生人出事该不该停.md', '做平台要办哪些证.md',
  '生物钟和夜班.md', '被裁了之后先做什么.md', '孩子出生前后要办的事.md', '刚确诊慢性病之后.md', '换工作、换城市之前.md'];
const tasks = known.map((zf, i) => {
  const vi = ORDER[i];
  const zhText = readFileSync(resolve(ZH, zf), 'utf8');
  const old = readFileSync(resolve(VI, vi + '.md'), 'utf8');
  const id = `doc-${String(i + 1).padStart(2, '0')}`;
  const body = [`# NHIỆM VỤ DỊCH — bài dài «${zf}»`, '',
    'Dịch toàn bộ bài sang tiếng Việt cho một cuốn sách xuất bản. Giữ nguyên cấu trúc tiêu đề (##, ###), danh sách, bảng, mọi con số, URL, DOI và số hiệu văn bản.',
    'Bản dịch cũ dưới đây chất lượng kém, chỉ dùng để tra thuật ngữ; phải dịch lại từ bản Trung.', '',
    '<<<BẢN GỐC TIẾNG TRUNG>>>', zhText.trim(), '',
    '<<<BẢN DỊCH CŨ (CHỈ THAM KHẢO)>>>', old.trim(), ''].join('\n');
  writeFileSync(resolve(DIR, id + '.md'), body);
  return { id, zh: zf, vi: vi + '.md', out: `vi/qa/docs-out/${vi}.md` };
});
writeFileSync(resolve(DIR, 'tasks.json'), JSON.stringify(tasks, null, 1));
console.log(`Sinh ${tasks.length} nhiệm vụ bài dài`);
