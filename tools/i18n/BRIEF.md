# Translating this book

This file is the brief given to every translation task. Read it, then translate the
block you were given and write it back to the same path.

## What the book is

A life guide ordered by value for money: every entry says what it costs (money, time,
energy, willpower), what it buys back, how strong the evidence is, and where the numbers
came from. Readers are ordinary adults with no professional training. Write for them.

## Output

Write the complete translated block to the file you were given, overwriting it. Output
nothing else — no commentary, no code fence around the whole thing.

## Hard requirements

These are machine-checked by `tools/i18n/check.mjs`. Any violation fails the build.

1. **Structure is copied exactly.** Entry headings stay `### N. …` with the same numbers.
   The same number of entries, in the same order. Section headings and intro paragraphs
   are translated, not dropped. If a block has no `# ` section heading, do not invent one.

   Everything in headings and intros is translated, including the **entry heading text**
   (`### 21. 每天都喝酒、一停就手抖心慌的人，别自己硬戒` → `### 21. Người uống rượu mỗi
   ngày, …`) and the **section heading** (`# 6. 反面清单` → `# 6. Danh sách phản tác dụng`).
   A heading left in Chinese fails the check — it is what a reader sees first in search
   results and in the sidebar. The one exception: statute and book names quoted inside
   「」 or 《》 in a heading stay as they are (rule 6).

   A section's `# N. …` line must match the title in that language's README table of
   contents word for word — the page sidebar is built from the README, so the two places
   have to say the same thing. Change both the README line and the block's line in
   `.i18n/<locale>/<section>/part00.md`; the `book/` file is regenerated from the block.

2. **Field labels** (six per entry, in this order):

   | Chinese | English | Vietnamese |
   | --- | --- | --- |
   | `- 成本：` | `- Cost:` | `- Chi phí:` |
   | `- 说人话：` | `- In plain language:` | `- Nói thẳng:` |
   | `- 收益：` | `- Benefit:` | `- Lợi ích:` |
   | `- 证据等级：` | `- Evidence grade:` | `- Mức bằng chứng:` |
   | `- 来源：` | `- Sources:` | `- Nguồn:` |
   | `- 备注：` | `- Notes:` | `- Ghi chú:` |

   If an entry lacks a field in the source, omit it. Never add one.

3. **The cost-tag comment line is copied verbatim, including the Chinese:**

   ```
   <!-- 成本标签: 钱=0 时间=少 毅力=否 收益=大 口径=死亡率 -->
   ```

   Nothing inside is translated. The site's filters and its shareable URLs are keyed on
   these exact Chinese tokens, and all three languages share one set of them. Translating
   them silently breaks every filter and every link.

4. **Numbers are frozen.** Every number in the Benefit, Cost and Sources fields stays
   exactly as written: HR, RR, OR, SMR, percentages, `95% CI 0.50 到 0.68` (keep both
   numbers; translate 到 as "to" / "đến"), years, counts, yuan amounts. No rounding, no
   reformatting, no adding or removing thousands separators.

   Scale words must be converted, not copied: 「每 10 万人 6.60 人」 → "6.60 per 100,000
   people" / "6,60 trên 100.000 người"; 「167 万女性」 → "1,670,000 women" / "1.670.000 phụ
   nữ"; 「每百万人 302 例」 → "302 per million" / "302 trên một triệu". Amounts of six or
   more digits keep the shape 「约 X 万元（精确值 元）」 → "about 120,000 yuan (exact figure
   1130040 yuan)" / "khoảng 120.000 tệ (con số chính xác 1130040 tệ)".

   The conversion only works when the scale word is there. 「200 余万元」「10 万元」
   → "hơn 2.000.000 tệ"? No — the checker counts digit sequences, so the source's 200
   and 10 must survive as 200 and 10: write 「200 余万元」 as "200 vạn tệ trở lên" and
   「10 万元」 as "10 vạn tệ". Converting "10 万元" to "100.000" drops a digit the source
   has and adds one it does not, and the Benefits column is where the book's whole
   checkability rests.

   **Vietnamese only:** statute article numbers written in Chinese numerals in the source
   「第一千零四十五条」 become "Điều 1045" — the checker knows the number was in the source.
   Amounts are the opposite case: 「3,018 人」 becomes "3.018 người" (thousands separator),
   but 「3,177」 stays "3.177" only because that group has three digits; 「1130040」 stays
   as written. Never re-group digits the source did not group.

   The Notes field is prose, so "40 例" may become "several dozen". The three fields above
   may not.

5. **Cross-references keep their numbers and anchor words.**

   | Chinese | English | Vietnamese |
   | --- | --- | --- |
   | 见第 13 节 | see section 13 | xem phần 13 |
   | 见第 9 节第 22 条 | see item 22 in section 9 | xem mục 22 ở phần 9 |
   | 本节第 32 条 | item 32 in this section | mục 32 của phần này |
   | 见第 16 节第 1、2 条（…） | items 1 and 2 in section 16 (…) | xem mục 1 và 2 ở phần 16 (…) |

   Keep the anchor text in parentheses — it is what tells the reader which item is meant.
   Never write "see above" or "see below".

   **Vietnamese only:** 条目 is "mục", 节 is "phần", and a statute's sub-clause is
   "khoản (2)" or "điểm (a)". Never write "phần 2" for a statute clause — the reader
   would take it for section 2 of the book.

   Statute article numbers are not cross-references: copy the number. 「刑法第三百九十条」
   → "Article 390 of the Criminal Law" / "Điều 390 của Bộ luật Hình sự".

6. **Source links are byte-identical.** Every URL stays as written. Bibliographic entries
   (authors, year, journal, DOI) keep their original form — they are there so a reader can
   check the claim. Chinese organisation names may be translated with the Chinese in
   parentheses on first use: "Ministry of Emergency Management (应急管理部)".

   Statute quotations (法条原文) stay in the original Chinese, verbatim, followed by a
   plain-language explanation. This is the book's own rule: readers rely on being able to
   compare the translation against the original text.

7. **Disputed and unverified markers.** A Notes field beginning with 争议 must begin with
   "Disputed" / "Tranh cãi". Keep the literal word "TODO" wherever it appears. The checker
   counts disputed entries and unverified items; the counts have to match.

   **Vietnamese only:** a space after the colon is fine — the checker skips leading
   whitespace. What it does need is the marker word itself at the start: `- Ghi chú:
   Tranh cãi.` reads the same as `- Ghi chú:Tranh cãi.` and both pass. What fails is a
   marker in the middle of the note, or an entry the source did not dispute getting one.

8. **No Chinese left in running prose.** Apart from the quotations rules 5 and 6 allow
   (statute text, statute and book names, bibliographic identifiers like 国务院令第 768 号,
   organisation names in parentheses), a Chinese word sitting inside an English or
   Vietnamese sentence is a missed translation — the reader sees it. Common in practice:
   a connective that came through as 本身 / 普遍 / 恰 / 口径, or a heading left untranslated.
   Keep the whole phrase translated rather than splicing a Chinese word into the middle
   of a Vietnamese one ("cũng普遍 đánh giá" → "cũng đánh giá").

9. **Register.** Short declarative sentences, one idea each, roughly 15–25 words, never
   over 40. Explicit subjects: you, the doctor, the court, the company. Calm. No
   exclamation marks. No lecturing. No AI-sounding filler: no "It is worth noting that",
   no "essentially", no repeated "in other words", no uplifting summary sentence at the end
   of a paragraph. No metaphors the reader has to translate themselves ("the other side",
   "output", "a shield"). Negation, scope, conditions and judgements are content — do not
   cut them as filler.

10. **Glossary.** Use the exact terms in `tools/i18n/glossary.en.mjs` (English) or
   `tools/i18n/glossary.vi.mjs` (Vietnamese). Recurring terms must be worded the same way
   everywhere, or the book contradicts itself.

## Checking your work

After writing, the file is compared against the Chinese source: entry count, entry
numbers, field presence and order, the cost-tag comment, evidence grades, disputed and
unverified markers, every number in the three checked fields, cross-reference numbers,
link counts — plus the three lines that are easy to leave behind: the section heading, the
section intro, and each entry's own heading. Fix everything it reports before finishing.

`node tools/i18n/join.mjs book/<file> --locale <code>` runs that comparison for one
section. `bash tools/i18n/join-ready.sh <code>` joins every section you have finished and
prints the failures for the ones you have not.

A section that reports 「切了 N 块，译文只有 M 块」 has a block file in the wrong place or
a stray extra one — list the folder and compare the entry numbers each block starts with
against the source.
