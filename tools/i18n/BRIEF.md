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

8. **Register.** Short declarative sentences, one idea each, roughly 15–25 words, never
   over 40. Explicit subjects: you, the doctor, the court, the company. Calm. No
   exclamation marks. No lecturing. No AI-sounding filler: no "It is worth noting that",
   no "essentially", no repeated "in other words", no uplifting summary sentence at the end
   of a paragraph. No metaphors the reader has to translate themselves ("the other side",
   "output", "a shield"). Negation, scope, conditions and judgements are content — do not
   cut them as filler.

9. **Glossary.** Use the exact terms in `tools/i18n/glossary.en.mjs` (English) or
   `tools/i18n/glossary.vi.mjs` (Vietnamese). Recurring terms must be worded the same way
   everywhere, or the book contradicts itself.

## Checking your work

After writing, the file is compared against the Chinese source: entry count, entry
numbers, field presence and order, the cost-tag comment, evidence grades, every number in
the three checked fields, cross-reference numbers, and link counts. Fix what it reports
before finishing. `node tools/i18n/join.mjs book/<file> --locale <code>` runs that
comparison for one section if you want to see it directly.
