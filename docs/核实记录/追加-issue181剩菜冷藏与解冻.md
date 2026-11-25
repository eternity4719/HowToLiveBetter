# 追加：issue #181，第 1 节第 50 条（饭菜两小时内放进冰箱、剩菜冷藏与解冻）

2026-11-25。issue #181 读者建议补「家庭食物的安全保存」。范围由主任务定：第 1 节节末追加一条，解冻并在同一条里。下面所有网页的访问日期都是 2026-11-25。

## 四问评估

1. 普通读者会碰上吗：会，家家都有剩菜和冻肉。
2. 是不是普遍不知道：「热菜要放凉了再进冰箱」「冻肉早上拿出来放台面上化一天」是常见做法，和官方指引相反。
3. 动作是不是新的：全书查过，第 1 节第 48 条管米酵菌酸（木耳、湿米粉、酵米面），第 2 节管黄曲霉毒素，没有一条写普通剩菜的时间温度和解冻。
4. 有没有官方原始来源：有，见下。中国官方来源只查到原则性的话，具体的小时数和天数靠世界卫生组织的中文版手册和美国农业部。

## 1. 国家卫健委 2024-06-21 新闻发布会文字实录

- URL：<https://www.nhc.gov.cn/xcs/c100122/202406/03d4253c5a8e4b9cad4c695ddc7d2e25.shtml>
- 取法：curl 取不到，无头 Chrome 不带代理能取。先用卫健委站内搜索 `https://zs.kaipuyun.cn/s?siteCode=bm24000006&searchWord=剩饭剩菜` 找到。
- 答问人，页面原文写的是：「国家卫生健康委食品安全评估中心副主任 刘兆平」。
- 「第二，要妥善储存和处理食品。对于一些没有用完的食材，或者剩饭菜，最好及时放到冰箱里冷藏和冷冻，放的时候也要保证生熟分开，保证食品之间有一定的间隙，这样做的目的就是为了避免出现交叉污染。」
- 「冰箱不是食品的保险箱。我们知道，冰箱低温冷藏是可以抑制一些细菌的生长，但是有些细菌不怕冷，也不怕冻。比如说单增李斯特菌，它在0度的时候可以照样生长繁殖」。李斯特菌按任务要求没有展开，正文只写了「有些危险的微生物在 5℃ 以下仍能生长」，这句取自世界卫生组织手册。
- 「另外，我们从冰箱里拿出来剩饭剩菜来食用时，一定要充分加热再食用，这样更安全。」
- 同一场发布会另一位答问人说：「饭菜要尽量当日吃完，如果有剩余饭菜要妥善冷藏，并在食用前彻底加热」。没引。
- **没查到**：中国官方（卫健委、市场监管总局、国家食品安全风险评估中心、中国疾控中心）写明「2 小时内」「冷藏几天」「怎么解冻」的原文。站内搜索「剩饭剩菜」命中的另两场发布会（2026-07-15、2026-05-19）只有「冰箱里取出的食物应该彻底加热，叶菜尤其不建议过夜」这类话，没有小时数和天数，没引。市场监管总局、中国疾控中心没有逐站去翻。

## 2. 世界卫生组织《食品安全五大要点》培训手册（中文版）

- 条目页：<https://iris.who.int/handle/10665/43546>（读者给的 <https://www.who.int/publications/i/item/9789241594639> 指向同一份）。元数据 dc.date.issued 是 2006-12-31。
- 中文 PDF：<https://iris.who.int/server/api/core/bitstreams/fc1785aa-f126-4b38-be36-3975fc50e850/content>（文件名 9789245594634_chi.pdf）。
- 取法：页面上的 `apps.who.int/iris/bitstream/...` 旧链接只返回一个前端壳页。改走接口：`/server/api/pid/find?id=10665/43546` 拿条目，再 `/server/api/core/items/<uuid>/bundles` 和 `/bundles/<id>/bitstreams?size=100` 找到中文 PDF。中文 PDF 的文本层是乱码，用 pymupdf 把第 18、19 页渲染成图片逐字看的（页脚页码也是 18、19）。
- 第 18 页，要点 4 核心内容：
  - 「熟食在室温下不得存放 2 小时以上；」
  - 「所有熟食和易腐食物应及时冷藏(最好在 5℃以下)」
  - 「食用前应保持食物达到足够的温度(超过 60℃)」
  - 「即使在冰箱中也不能过久地贮存食物；」
  - 「冷冻食品不要在室温下化冻。」
  - 为什么：「如果在室温下存放食品，微生物可以迅速繁殖。把温度保持在 5℃以下或 60℃以上，可使微生物生长繁殖速度减慢或停止。有些危险微生物在 5℃以下仍能生长。」
  - 「微波炉可用来解冻食品，但能够留下微生物能够生长的暖点。应立刻烹饪用微波炉解冻的食物。」
- 第 19 页：
  - 「5℃至 60℃是危险范围，微生物可以在此温度范围内迅速繁殖。」
  - 「冷藏或冷冻食品不能杀死微生物，但能限制其繁殖。」
  - 「不要在冰箱中存放剩饭菜超过 3 天，重复加热不能超过一次；」
  - 「食物化冻应在冰箱中或冷的环境下进行。」
  - 「剩饭菜的快速冷却方法：将食物放在敞口盘中；大块肉切成小块」。没引。

## 3. 美国农业部食品安全检验局（USDA FSIS）三个页面

取法：curl 带代理仍是 Akamai 的 Access Denied，无头 Chrome 带代理能取。

- "Danger Zone" (40°F - 140°F)，页面标 Last Updated: Jun 28, 2023。<https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/danger-zone-40f-140f>
  - 「Bacteria grow most rapidly in the range of temperatures between 40 °F and 140 °F, doubling in number in as little as 20 minutes.」「20 分钟翻一倍」没写进正文。
  - 「Never leave food out of refrigeration over 2 hours. If the temperature is above 90 °F, food should not be left out more than 1 hour.」
  - 「leftovers must be put in shallow containers for quick cooling and refrigerated at 40 °F or below within two hours.」
  - 「Foods should be reheated thoroughly to an internal temperature of 165 °F or until hot and steaming.」正文的「或者热到整份冒热气」出自这句。
- Leftovers and Food Safety，Last Updated: Jul 31, 2020。<https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/leftovers-and-food-safety>
  - 「Within 2 hours of cooking food or after it is removed from an appliance keeping it warm, leftovers must be refrigerated. Throw away all perishable foods that have been left in room temperature for more than 2 hours (1 hour if the temperature is over 90° F, such as at an outdoor picnic during summer).」
  - 「A big pot of soup, for example, will take a long time to cool, inviting bacteria to multiply and increasing the danger of foodborne illness. Instead, divide the pot of soup into smaller containers so it will cool quickly.」
  - **热的能不能直接进冰箱，原句找到了**：「Hot food can be placed directly in the refrigerator or be rapidly chilled in an ice or cold water bath before refrigerating.」
  - 「Leftovers can be kept in the refrigerator for 3 to 4 days or frozen for 3 to 4 months.」冷冻 3 到 4 个月没写。
  - 「When reheating leftovers, be sure they reach 165° F as measured with a food thermometer. Reheat sauces, soups and gravies by bringing them to a rolling boil.」
- The Big Thaw — Safe Defrosting Methods，Last Updated: Jun 15, 2013。<https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/big-thaw-safe-defrosting-methods>
  - 「Perishable foods should never be thawed on the counter, or in hot water and must not be left at room temperature for more than two hours.」
  - 「Even though the center of the package may still be frozen as it thaws on the counter, the outer layer of the food could be in the "Danger Zone," between 40 and 140 °F — temperatures where bacteria multiply rapidly.」
  - 「There are three safe ways to thaw food: in the refrigerator, in cold water, and in the microwave. In a hurry? It's safe to cook foods from the frozen state.」
  - 「Even small amounts of frozen food — such as a pound of ground meat or boneless chicken breasts — require a full day to thaw.」正文写成「一斤左右的肉也要整整一天」，1 磅约 454 克。
  - 「The food must be in a leak-proof package or plastic bag.」「The bag should be submerged in cold tap water, changing the water every 30 minutes so it continues to thaw.」「If thawed completely, the food must be cooked immediately.」
  - 「After thawing in the microwave, always cook immediately after」
- 华氏度换算（自算）：40°F 约 4.4℃，90°F 约 32.2℃，140°F 是 60℃，165°F 约 73.9℃。正文写「约 32℃（原文 90°F）」「约 74℃（原文 165°F）」。冷藏温度正文用了世界卫生组织的 5℃，没另写 4℃。

## 4. 蜡样芽孢杆菌暴发，中国 2010 到 2020 年

- **读者给的题录有误**。doi 10.46234/ccdcw2023.140 在 Europe PMC 上对应的是：Duan S, Yu Y, Guo Y, Lu D, Li N, Liu Z, Liang J, Jiang Y, Wang S, Fu P, Liu J, Liu H (2023). Epidemiological Evaluation of Bacillus cereus-Induced Foodborne Outbreaks — China, 2010–2020. China CDC Weekly 5(33):737-741。PMID 37663900，PMCID PMC10468372。读者写的「Liu X 等，5(31):691-696」对不上，正文按 Europe PMC 的题录写。Liu J、Liu H 是通讯作者。
- 全文：<https://www.ebi.ac.uk/europepmc/webservices/rest/PMC10468372/fullTextXML>；DOI <https://doi.org/10.46234/ccdcw2023.140>
- 「From 2010 to 2020, a total of 419 foodborne outbreaks prompted by B. cereus were reported in China, leading to 7,892 cases, 2,786 hospital admissions, and 5 fatalities.」
- 表 1：Rice or flour 194 起（46.30%）、3221 例、死亡 3 人；Complex food 54 起、死亡 2 人；合计 419 起、7892 例、住院 2786、死亡 5、病死率 0.06%。
- 「rice and rice products accounted for a higher number of outbreaks (158 outbreaks), compared to flour and flour products (36 outbreaks).」
- 「Multifactor contamination was identified as the cause for 39.14% of outbreaks and 41.02% of associated cases. This was closely followed by improper storage, accounting for 111 outbreaks (26.49%) and 1,981 cases (25.10%).」摘要：「in instances where only one factor contributed, improper storage was most frequently implicated.」正文写成「只查出一个原因的事件里，存放不当最多，有 111 起，占全部事件的 26.49%」。多因素那 39.14% 里也常有存放不当（两因素组合里「inadequate storage and inappropriate processing」占 48.78%），没写进正文。
- 「26.25% of outbreaks could be traced back to food prepared in these school canteens, accounting for 48.34% of cases」「However, the household held the record for the highest hospitalization rate at 53.92%, along with the highest mortality rate at 1.37%.」场所指做饭的场所（setting for food preparation）。家庭的起数和例数只在图 3 里，全文 XML 里没有数字，没写。学校食堂的占比没写，因为本条写的是家里。
- **没写的**：蜡样芽孢杆菌的呕吐毒素耐热、再加热破坏不了。这篇全文只说它产生呕吐型和腹泻型两类毒素（「vomiting-type and diarrhea-type enterotoxins」），没有一句讲耐热。世界卫生组织手册和美国农业部三个页面也没写。按任务要求，来源里没有就不写。
- 文中「fried rice constituted … 33% within the category of rice and rice products」，炒饭占三分之一，没写。

## 5. Li H 等 (2021)，没采用

- Characteristics of Settings and Etiologic Agents of Foodborne Disease Outbreaks — China, 2020. China CDC Weekly 3(42):889-893，doi 10.46234/ccdcw2021.219，PMCID PMC8545604。题录核对无误。
- 「household had the highest number of outbreaks (4,140) and deaths (128)」「households had the most deaths, accounting for 89.5% of all deaths (Table 1); poisonous mushrooms (79 deaths), aconite (10 deaths), bongkrek acid (11 deaths), and methanol (8 deaths) were the most common causes」。
- 不用的原因：家庭里的起数和死亡主要来自毒蘑菇、乌头、米酵菌酸和甲醇，和剩菜存放无关。把「家庭占 58.5%」放进本条，会让读者以为这些都是剩菜惹的。
- 顺带发现：这篇正文写家庭里米酵菌酸死亡 11 人、毒蘑菇 79 人、甲醇 8 人，第 48 条收益栏写的是全年 12 人、80 人、14 人。两组数口径不同（家庭对全部场所），本轮没有去核第 48 条，留给主任务判断要不要看。

## 证据等级和收益量级

- 证据等级 B：时间和温度是官方指引，没有分组试验。有全国监测数据给出「存放不当」的起数，但算不出照做能少多少，所以不到 A。
- 收益量级「小」，口径死亡率：11 年 419 起里死亡 5 人，病死率 0.06%，多数后果是呕吐、腹泻和住院，属于替代终点。读者 issue 的说法没有照着往高里标。
- 成本标签：钱=0，时间=少，毅力=些（要改「放凉再进冰箱」「台面上解冻」两个习惯）。没加人群标签。

## 其他

- 节首导览挂在「孩子、老人和野外的意外」那一块末尾，紧跟第 48 条木耳，短名「饭菜两小时内放进冰箱」。
- 孕妇和李斯特菌没写，也没写指向第 27 节的引用，等主任务补。
- 自检：`node tools/check-plain.mjs` 773 条不合格 0；`node tools/check-refs.mjs --check` 通过，引用总数 1855 → 1857，正好是新增的两处（导览一处、备注指第 48 条一处）。
