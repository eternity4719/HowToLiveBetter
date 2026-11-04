# Skill quyết định đời sống (life-decision-guide)

Skill này giúp trợ lý AI trả lời các câu hỏi cụ thể theo đúng «Cẩm nang sống đáng giá»: có nên làm không, có đáng không, chọn thế nào, gặp chuyện thì làm gì trước, được nhận khoản tiền nào, làm vậy có phạm luật không.

Nó chỉ làm một việc: **tra các mục liên quan trong sách trước, rồi xếp thứ tự theo cách tính của sách để trả lời**, mỗi ý ghi rõ lấy từ phần mấy, mục mấy. Không tra ra thì nói là không tra ra, không bịa số liệu theo trí nhớ.

Toàn bộ quy tắc nằm trong [SKILL.md](SKILL.md). Hai công cụ dùng chung một tệp, không giữ hai bản.

## Cài vào Claude Code

Mở Claude Code ngay trong kho này thì không cần cài: `.claude/skills/life-decision-guide/` đã trỏ sẵn đến bộ quy tắc này.

Muốn dùng ở bất kỳ thư mục nào thì chép vào thư mục skill cá nhân:

```bash
mkdir -p ~/.claude/skills/life-decision-guide && curl -fsSL -o ~/.claude/skills/life-decision-guide/SKILL.md "https://raw.githubusercontent.com/thuongtin/HowToLiveBetter/main/skills/life-decision-guide/SKILL.md"
```

Sau đó cứ hỏi thẳng, ví dụ «mỗi ngày đi làm mất hai tiếng có đáng không» hay «bạn nhờ tôi đứng ra bảo lãnh, có nên ký không», skill sẽ tự kích hoạt. Cũng có thể nói rõ «trả lời bằng life-decision-guide».

## Cài vào Codex

Mở Codex ngay trong kho này thì không cần cài: tệp `AGENTS.md` ở thư mục gốc đã chỉ đến skill này.

Muốn dùng ở bất kỳ thư mục nào thì chép vào thư mục skill cá nhân của Codex là `~/.agents/skills`:

```bash
mkdir -p ~/.agents/skills/life-decision-guide && curl -fsSL -o ~/.agents/skills/life-decision-guide/SKILL.md "https://raw.githubusercontent.com/thuongtin/HowToLiveBetter/main/skills/life-decision-guide/SKILL.md"
```

Sau đó cứ hỏi thẳng, skill sẽ tự kích hoạt theo phần mô tả. Cũng có thể gõ `$life-decision-guide` để gọi rõ. Lưu ý là `$` chứ không phải `/`: Codex bản mới mà gõ `/life-decision-guide` sẽ báo `Unrecognized command`. Không thấy skill thì khởi động lại Codex một lần.

Codex bản cũ chưa có skill, chỉ dùng được custom prompt: đặt tệp vào `~/.codex/prompts/life-decision-guide.md`, rồi gọi bằng `/life-decision-guide`. Codex đã thông báo bỏ cách này ([openai/codex#10848](https://github.com/openai/codex/issues/10848)), bản mới thì dùng cách cài skill ở trên.

## Nội dung sách lấy từ đâu

Có sẵn kho này trên máy thì đọc `vi/book/` tại chỗ (bản tiếng Trung gốc ở `book/`, đánh số giống hệt). Không có thì lấy về:

```bash
git clone --depth 1 https://github.com/thuongtin/HowToLiveBetter.git "${TMPDIR:-/tmp}/hltb"
```

Clone nông một lần chỉ mất vài giây. Không có mạng thì nói thật là không lấy được, không trả lời thay cho nội dung sách.

## Lưu ý khi sửa

SKILL.md không giữ danh sách hay con số nào sẽ thay đổi theo nội dung sách: danh sách phần thì đọc bảng «Mục lục» trong README, thuật toán xếp hạng đáng đồng tiền thì đọc hai dòng `COST_W` và `e.ratio` trong `index.html`. Vì vậy thêm bớt phần hay đổi quy tắc xếp hạng đều không phải sửa thư mục này. Riêng bảng quy đổi nhãn chi phí tiếng Việt sang tiếng Trung trong SKILL.md thì phải sửa theo nếu `vi/STYLE.md` đổi tên nhãn.
