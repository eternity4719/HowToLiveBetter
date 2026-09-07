# 核实记录：第 13 节补 9 条（急救缺口 + 野外）

核实日期：2026-09-07。本轮第 13 节 18 → 27 条，全书 309 → 318 条。

补的是原来漏掉的几种常见致死场景：过敏性休克、癫痫发作、低血糖、触电、一氧化碳中毒；以及野外部分原来只有迷路、失温、蛇咬、遇兽、中暑，补上雷击、高原病、蜱虫、野外饮水。

方法与前几轮一致：英文文献用 Europe PMC REST（`search?query=TITLE:"…"&resultType=core`）取题录与摘要原文，开放获取的用 `/{PMCID}/fullTextXML` 取正文逐字核对；官方机构页面用 WebFetch 取正文并要求逐字引用。

---

## 一、逐条核对到的原文

| 来源 | 核对到的原文 | 用在哪 |
| --- | --- | --- |
| 过敏性休克急救临床实践指南（2020），Frontiers in Pharmacology 2022, doi:10.3389/fphar.2022.845689（PMC8996305，开放获取，取全文 XML 核对） | 6.1「Epinephrine is the first-line medicine in GRADE II to IV anaphylaxis. (Strong recommendation)」；6.4「The recommended dose of IM epinephrine is 0.01 mg/kg, up to a maximum of 0.5 mg for patients aged ≥14 years, and up to a maximum of 0.3 mg in patients <14 years old… Dosing may be repeated every in 5–15 min if there is no response.」；6.5「Intramuscular epinephrine should be injected in the mid-anterolateral thigh. (Strong recommendation)」 | 「按过敏性休克处理」 |
| Muraro A, et al. (2022). EAACI guidelines: Anaphylaxis (2021 update). Allergy. doi:10.1111/all.15032（PMID 34343358） | 摘要原文：「The prompt use of intramuscular adrenaline as first-line management is recommended with the availability of adrenaline autoinjectors to patients in the community.」「The evidence for the management of anaphylaxis remains mostly at a very low level.」 | 同条，及「证据等级低」的说明 |
| 美国疾控中心《癫痫发作急救》<https://www.cdc.gov/epilepsy/first-aid-for-seizures/index.html> | 「Don't hold the person down or stop their movements. This could injure you or them.」「Don't put anything in their mouth. This can hurt their teeth or jaw.」「Don't offer water or food until they are fully alert.」「Time the seizure to track if it lasts more than 5 minutes. If it does, seek immediate medical attention or call 911.」「If the person is lying down, turn them gently on their side, with their mouth pointing to the ground.」另列叫救护车的其他情形：再次发作、呼吸困难或叫不醒、发作中受伤、水中发作、首次发作 | 「有人抽搐倒地」 |
| 美国糖尿病学会《糖尿病诊疗标准 2025》第 6 章，Diabetes Care, doi:10.2337/dc25-S006（PMC11635034，经 PMC 页面核对） | 分级「Level 1: Glucose <70 mg/dL (<3.9 mmol/L) and ≥54 mg/dL (≥3.0 mmol/L)」「Level 2: Glucose <54 mg/dL (<3.0 mmol/L)」「Level 3: A severe event characterized by altered mental and/or physical status requiring assistance for treatment of hypoglycemia, irrespective of glucose level」；处理「For most individuals, 15 g carbohydrates should be ingested」「Fifteen minutes after initial treatment, repeat the treatment if hypoglycemia persists」；「All individuals treated with insulin or who are at high risk of hypoglycemia…should be prescribed glucagon」「intranasal and ready-to-inject glucagon preparations are now widely available and are preferred due to their ease of administration」 | 「先给 15 克糖」 |
| 美国疾控中心《一氧化碳中毒》<https://www.cdc.gov/carbon-monoxide/about/index.html> | 「More than 400 Americans die from unintentional CO poisoning not linked to fires」「More than 100,000 visit an emergency department」「More than 14,000 are hospitalized」；症状「The most common symptoms of CO poisoning are headache, dizziness, weakness, upset stomach, vomiting, chest pain, and confusion.」 | 「一氧化碳报警器响了」 |
| 美国消费品安全委员会《一氧化碳信息中心》<https://www.cpsc.gov/Safety-Education/Safety-Education-Centers/Carbon-Monoxide-Information-Center> | 「If you suspect CO poisoning, get outside to fresh air immediately, and then call 911.」「More than 200 people in the United States die every year from accidental non-fire related CO poisoning associated with consumer products.」 | 同条的处置步骤 |
| 美国国家气象局《户外雷电安全》<https://www.weather.gov/safety/lightning-outdoors> | 「There is no safe place outside when thunderstorms are in the area.」「Avoid open fields, the top of a hill or a ridge top. Stay away from tall, isolated trees or other tall objects.」「Stay away from water, wet items, such as ropes, and metal objects, such as fences and poles.」「If you are in a group, spread out to avoid the current traveling between group members.」「Wait 30 minutes until after the last rumble of thunder before going back to the beach.」硬顶车厢为安全掩体 | 「野外遇上雷雨」 |
| 美国疾控中心《黄皮书·高海拔旅行与高原病》<https://www.cdc.gov/yellow-book/hcp/environmental-hazards-risks/high-altitude-travel-and-altitude-illness.html> | 「Any unacclimatized traveler proceeding to a sleeping altitude of ≥2,450 m (≥8,000 ft)—and sometimes lower—is at risk for altitude illness.」；上升速度「500 m (1,650 ft) per night in sleeping altitude once above 3,000 m (9,800 ft)」，每上升 1,000 m 加一天适应日；乙酰唑胺预防「125 mg twice a day; 250 mg twice a day if >100 kg body weight」；「If symptoms become worse despite rest or treatment at the same elevation」及疑似 HACE/HAPE 须下撤 | 「上高原按睡眠海拔慢慢升」 |
| 荒野医学会《急性高原病预防、诊断与治疗临床实践指南（2024 更新）》，Wilderness & Environmental Medicine, doi:10.1016/j.wem.2023.05.013（PMID 37833187） | 题录与摘要核对无误（非开放获取，只作为并列指南列出，正文数字全部取自上一行的 CDC 黄皮书） | 同上 |
| 美国疾控中心《被蜱叮咬之后》<https://www.cdc.gov/ticks/after-a-tick-bite/index.html> | 「Grasp the tick as close to the skin's surface as possible using clean fine-tipped tweezers」「Pull tick away from the skin with steady, even pressure.」「Do not use petroleum jelly, heat, nail polish, or other substances to try and make the tick detach from the skin. This may agitate the tick and force infected fluid from the tick into the skin.」 | 「被蜱虫叮住」 |
| 美国疾控中心《黄皮书·旅行者的水消毒》<https://www.cdc.gov/yellow-book/hcp/preparing-international-travelers/water-disinfection-for-travelers.html> | 「All organisms that may cause illness from drinking water are killed within seconds at boiling temperature.」「CDC recommends that travelers boil water for a full minute to account for user variability in identifying boiling points and to add a margin of safety.」「Although the boiling point for water decreases with increasing elevation, at common travel elevations the temperature needed to achieve boiling is still well above the temperature required to inactivate enteric pathogens.」另：加热到 60 ℃ 保持 30 分钟同样有效 | 「野外的水一律烧开再喝」 |

## 二、未取得 / 未采用

| 想找的 | 结果 | 处理 |
| --- | --- | --- |
| 触电急救「先断电再碰人」的权威原文 | 欧洲复苏委员会《2021 特殊情况下的心脏骤停》(doi:10.1016/j.resuscitation.2021.02.011) 含触电章节，但全文付费；其德文译本 PMC8190767 为节选，不含该章节；resus.org.uk 返回 403，Resuscitation Council UK 的指南只有 PDF，本机读不了 PDF；美国心脏协会与红十字会《2024 急救指南》(doi:10.1161/CIR.0000000000001281) 覆盖该主题但 ahajournals.org 返回 403 | 该条定 C 级，来源栏写 TODO 并说明未取得的原因 |
| 中国全国层面的一氧化碳中毒死亡人数 | 未找到公开的年度统计 | 条目备注写 TODO，正文只用美国数字并标明是美国 |
| 中国发热伴血小板减少综合征的年发病数与病死率 | 本次未取得官方数字 | 条目备注写 TODO，蜱虫条不写病死率 |
| 美国心脏协会与红十字会《2024 急救指南》全文 | ahajournals.org 403，Europe PMC 无开放全文；摘要只列了覆盖的主题（含 spinal motion restriction、anaphylaxis、snakebite 等），没有具体数值 | 未引用；本轮各条改用能逐字核对的机构页面与开放获取指南 |
| CDC 的一氧化碳「报警器响了怎么办」页面 | `/carbon-monoxide/about/` 只讲预防与症状，`/carbon-monoxide/prevention/` 为 404 | 处置步骤改引 CPSC 原文 |

## 三、口径与收益量级

九条里七条口径为死亡率（含健康终点）。收益量级按第 13 节的通行口径定：直接决定生死的（过敏性休克、低血糖重度发作、触电、一氧化碳、雷击、高原脑水肿/肺水肿）定「大」；主要是避免二次伤害或延误的（癫痫、蜱虫、野外饮水）定「中」。除蜱虫（需要一把尖头镊子，钱=少）外均为零成本，雷击与高原额外记了「毅力=些」——难的不是知道，是雷响时肯掉头、高原上肯下撤。
