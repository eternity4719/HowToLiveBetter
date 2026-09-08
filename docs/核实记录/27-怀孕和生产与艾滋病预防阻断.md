# 第 27 节「怀孕和生产」与艾滋病预防／阻断 · 核实记录（2026-09-08）

任务来源：读者提了两件事——「发现怀孕了，要生产了，应该怎么办，流程是什么，都没有写清楚」；「还有艾滋病什么的，怎么避免，如果发现自己有可能感染了，发生了性行为，吃阻断药，都没有写」。

原有覆盖：孕产流程是整段空白。全书搜「产检」「孕期」「分娩」「出生医学证明」只命中第 18、20 两节——第 18 节只有产假 98 天和生育津贴（属于「拆账」），第 20 节从孩子出生后讲起，中间从确认怀孕到出院办证完全没有。艾滋病是零覆盖：全书搜「艾滋」「HIV」「安全套」「阻断药」零命中。

落点（经用户确认）：**新开第 27 节**，文件 `book/27-怀孕和生产.md`，追加在末尾而不是插在 18、20 之间——插在中间要重排 19 至 26 全部文件名和跨节锚点引用，且当时另有两个会话正在改 README.md、CLAUDE.md、第 2 节和第 25 节，重排必冲突。艾滋病拆两处：日常预防与检测进第 1 节（新增第 28、29 条），72 小时阻断药进第 13 节（新增第 37 条），都追加在节末，同样为避开并发改动。README 目录表、README 章节列表、CLAUDE.md 目录结构各加一行，第 18、20 节节首各加一句指路。

同步改的计数：README「26 个文件」→「27 个文件」，index.html 页脚同句同改；README 里 A 级条目数 260 → 277、性价比极高条目数 72 → 75（按 `grep '^- 证据等级：A'` 与 `钱=0 时间=少 毅力=否 收益=大` 重新数过，包含此前两个会话新加的条目）。

## 第 27 节

| URL | 复核 | 原文引句 |
|---|---|---|
| <https://doi.org/10.1002/14651858.CD007950.pub3>（Europe PMC 题录与摘要全文，PMID 26662928） | 是 | 「a protective effect of daily folic acid supplementation … in preventing NTDs compared with no interventions/placebo …（risk ratio (RR) 0.31, 95% confidence interval (CI) 0.17 to 0.58); five studies; 6708 births; high quality evidence)」；再发「RR 0.34, 95% CI 0.18 to 0.64); four studies; 1846 births」；「the positive effect … is not affected by the explored daily folic acid dosage (400 µg (0.4 mg) or higher) or whether folic acid is given alone or with other vitamins and minerals」；对唇腭裂、先心、流产均无明确效果 |
| <https://www.jingjiang.gov.cn/xxgk/zdlyxxgk/wsjk/art/2023/art_383017a2e7794892bc772bfbe042f379.html> | 是 | 服务对象「辖区内常住的孕产妇」；「免费早孕建卡检查1次及初次化验检测1套」；「免费孕中、晚期产检4次，分别在孕16-20、21-24、28-36、37-40周之间」；「免费产后访视1次」；「免费产后42天健康检查1次及化验检测（含血常规、白带常规），产后抑郁筛查1次」 |
| <https://www.nhc.gov.cn/ewebeditor/uploadfile/2017/04/20170417104506514.pdf> | 部分 | 《国家基本公共卫生服务规范（第三版）》原件为 PDF。本机 pdftotext 对中文政府 PDF 只能出数字和英文（无 ToUnicode 映射），无法逐字核对，因此「1 次孕早期＋2 次孕中期＋2 次孕晚期＋产后访视＋产后 42 天」这一结构以靖江市政府公开的地方服务清单逐字核对，PDF 仅作为规范原件出处并列在来源栏 |
| <https://wjw.xinjiang.gov.cn/hfpc/zhgl6/202012/08b7de496f0b40e586d4b99d00cf79c4.shtml> | 是 | 《预防艾滋病、梅毒和乙肝母婴传播工作规范（2020 年版）》，孕早期或初次产前检查时告知并「提供适宜、规范的免费检测」，据结果提供检测后咨询或转诊 |
| <https://wjw.beijing.gov.cn/zwgk_20040/zcwj2022/flfg/202304/t20230408_2992986.html> | 是 | 《艾滋病防治条例》第二十三条「应当为自愿接受艾滋病咨询、检测的人员免费提供咨询和初筛检测」；第四十四条第（四）项「向感染艾滋病病毒的孕产妇免费提供预防艾滋病母婴传播的治疗和咨询」；第四十三条「阻断、治疗、产后访视、婴儿随访和检测等服务」；第三条不得歧视；第三十八条第（二）项「将感染或者发病的事实及时告知与其有性关系者」 |
| <https://www.cdc.gov/tobacco/campaign/tips/diseases/pregnancy.html> | 是 | 「Your baby may be born too small, even after a full-term pregnancy.」「Your baby may be born too early (premature birth).」「Smoking doubles your risk of abnormal bleeding during pregnancy and delivery.」「Smoking raises your baby's risk for birth defects, including cleft lip, cleft palate, or both.」「Smoking can damage your baby's developing lungs and brain. The damage can last through childhood.」「Babies of moms who smoke during pregnancy—and babies exposed to cigarette smoke after birth—have a higher risk for SIDS.」「It's best to quit smoking before you get pregnant. But if you're already pregnant, quitting can still help.」「It's never too late to quit smoking.」 |
| <https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/low-dose-aspirin-use-for-the-prevention-of-morbidity-and-mortality-from-preeclampsia-preventive-medication> | 是 | Grade B；「low-dose aspirin (81 mg/day) as preventive medication after 12 weeks of gestation」；子痫前期 pooled RR 0.85（0.75-0.95，16 studies）、早产 RR 0.80（0.67-0.95，13 studies）、围产期死亡 RR 0.79（0.66-0.96，11 studies）、SGA/IUGR RR 0.82（0.68-0.99，16 studies）；高危因素表：既往子痫前期、多胎、慢性高血压、孕前 1/2 型糖尿病、肾病、自身免疫病 |
| <https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/gestational-diabetes-screening> | 是 | 「The USPSTF recommends screening for gestational diabetes in asymptomatic pregnant persons at 24 weeks of gestation or after.」（B）；24 周前为 I 级「current evidence is insufficient」；「One-time screening should be performed at 24 weeks of gestation or after.」 |
| <https://www.cdc.gov/hearher/maternal-warning-signs/index.html> | 是 | 14 条预警信号逐条（headache that won't go away or gets worse；dizziness or fainting；changes in your vision；fever of 100.4°F or higher；extreme swelling of hands or face；thoughts about harming yourself or your baby；trouble breathing；chest pain or fast-beating heart；severe nausea and throwing up；severe belly pain that doesn't go away；baby's movement stopping or slowing；vaginal bleeding or fluid leaking during pregnancy；vaginal bleeding or discharge after pregnancy；severe swelling, redness or pain of leg or arm）；问题可发生在产后一年内 |
| <https://www.who.int/news-room/fact-sheets/detail/maternal-mortality> | 是 | 「About 260 000 women died during and following pregnancy and childbirth in 2023.」「The major complications that account for around 75% of all maternal deaths are: severe bleeding … infections … high blood pressure during pregnancy (pre-eclampsia and eclampsia) … complications from delivery … unsafe abortion.」「Most maternal deaths are preventable …」「Severe bleeding after birth can kill a healthy woman within hours if she is unattended.」 |
| <https://wjw.beijing.gov.cn/bmfw_20143/jkzs/jzjj/202001/t20200115_1575632.html> | 是 | 「马上找个地方平躺下来，防止羊水流出来」「不要随意走动」「立即拨打120急救电话」，等车期间通知家人带物品到医院 |
| <https://www.bch-syfy.cn/Html/News/Articles/9453.html> | 是 | 站立位羊水流出、脐带可能脱出导致脐带脱垂；就近卧床、抬高臀部、左侧卧位；破水伴规律宫缩／胎动明显减少／体温超 37.5 ℃ 或寒战／羊水黄绿色或混胎粪，必须立刻就医 |
| <https://doi.org/10.1002/14651858.CD000331.pub4>（Europe PMC 摘要全文） | 是 | 「Low-quality evidence shows that epidural analgesia may be more effective in reducing pain during labour and increasing maternal satisfaction with pain relief than non-epidural methods.」「a post hoc subgroup analysis showed this effect is not seen in recent studies (after 2005)」（器械助产）「Epidural analgesia had no impact on the risk of caesarean section or long-term backache」；副作用「more hypotension, motor blockade, fever, and urinary retention … longer first and second stages of labour … more likely to have oxytocin augmentation」 |
| <https://www.gov.cn/zhengce/202406/content_6957553.htm> | 是 | 「各地原有产科类医疗服务价格项目映射整合为30项」；「将『分娩镇痛』『导乐分娩』『亲情陪产』等项目单独立项」；原因是一些地方按椎管麻醉项目收费、无独立价格项目降低了医院开展分娩镇痛的积极性 |
| <https://www.who.int/publications/i/item/WHO-RHR-15.02> | 部分 | WHO 2015 声明。出版物页可访问，正文 PDF 未逐字取回；「人群层面剖宫产率升至约 10% 时母婴死亡下降、超过 10% 无证据显示进一步改善」与「应尽力为有需要者提供剖宫产而非追求某一比率」两句为该声明的核心结论，多处转述一致，正文按此写，未引用超出该声明结论的数字 |
| <https://guangdong.chinatax.gov.cn/gdsw/qysw_gkwj/2020-02/12/content_8e8c485d0db34b989531f3ba57cec5a9.shtml> | 是 | 《社会保险法》第五十四条：用人单位已缴生育保险费的其职工享受生育保险待遇，「职工未就业配偶按照国家规定享受生育医疗费用待遇」，所需资金从生育保险基金支付；待遇含生育医疗费用和生育津贴。第五十六条三种情形；生育津贴「按照职工所在用人单位上年度职工月平均工资计发」 |
| <https://www.gov.cn/guoqing/2021-10/29/content_5647619.htm> | 是 | 《母婴保健法》第二十三条：医疗保健机构和从事家庭接生的人员按国务院卫生行政部门规定，出具统一制发的新生儿出生医学证明 |
| <http://www.gov.cn/gongbao/content/2009/content_1371363.htm> | 是 | 《新生儿疾病筛查管理办法》第三条「全国新生儿疾病筛查病种包括先天性甲状腺功能减低症、苯丙酮尿症等新生儿遗传代谢病和听力障碍」；第十条阳性病例及时通知监护人确诊、听力疑似者转听力筛查中心；第十一条筛查前如实告知项目、条件、方式、灵敏度和费用并取得签字同意 |
| <https://www.gov.cn/zhengce/202409/content_6973567.htm> | 是 | 「新生儿凭出生医学证明就可以在线上参保」；「新生儿出院以后就能够直接报销医药费用」；参保缴费平均时长「从年初的28.7个工作日压减到6.4个工作日」；此前为「落户才参保」、先垫付后报销 |
| <http://www.gd.gov.cn/zwgk/wjk/zcfgk/content/post_2531969.html> | 是 | 《户口登记条例》第七条「婴儿出生后一个月以内，由户主、亲属、抚养人或者邻居向婴儿常住地户口登记机关申报出生登记」 |

未写进正文的内容与原因：

- **「新生儿出生 90 天内参保可自出生之日起享受待遇」不写具体天数**。这条广为流传，但本轮在中国政府网、国家医保局公开文件里没有取到可逐字核对的全国统一表述，取到的只有 2024 年吹风会的「凭出生医学证明即可在线参保、出院即可报销」。因此正文只写可核对的部分，并在备注里说明天数规定各地不同、以当地医保部门为准。
- **孕产妇妊娠风险评估五色管理的具体分级**。《孕产妇妊娠风险评估与管理工作规范》未收录进国务院政策文件库（`searchfield=title` 复核仍无命中），拿不到可逐字核对的原文，正文只写「建册越早，妊娠风险分级越早做出来」这一定性表述，不写颜色和对应处置。
- **无痛分娩的全国普及率、剖宫产率的中国数字**。没有取到可逐字核对的官方年度统计，正文不写。
- **数胎动的具体方法（每小时几次、12 小时几次）**。正式的胎动计数方案在大型随机试验里没有显示出降低死亡的效果，与「胎动明显减少要就医」不是同一回事，正文只保留后者（并入第 7 条 CDC 清单），不给计数口径。
- 第 8 条定 B 而非 A：北京市卫健委的科普页给了处置动作但没有说明脐带脱垂这一机制，机制句取自北京市顺义区妇幼保健院（公立医疗机构官网），两份材料都不是指南或荟萃分析。
- 第 10 条的收益量级定「中」而非「大」：WHO 声明给的是「超过 10% 后无进一步改善」这一否定性结论，不是「不做非医学指征剖宫产可降低多少死亡」的效应量。

## 第 1 节第 28、29 条与第 13 节第 37 条（艾滋病）

| URL | 复核 | 原文引句 |
|---|---|---|
| <https://doi.org/10.1586/14737167.2016.1102635>（Europe PMC 摘要全文） | 是 | 「Twenty-five studies with 10,676 HIV serodiscordant heterosexual couples were analyzed. The risk of HIV transmission was considerably lower among couples that were always using condoms compared to never-users (RR: 0.29, 95% CI: 0.20-0.43) or inconsistent users (RR: 0.23, 0.13-0.40).」「condoms reduce HIV transmission by more than 70% when used consistently」 |
| <https://doi.org/10.1097/QAD.0000000000001145>（Europe PMC 摘要全文） | 是 | 「Trials with PrEP use more than 70% demonstrated the highest PrEP effectiveness (risk ratio = 0.30, 95% confidence interval: 0.21-0.45, P < 0.001) compared with placebo. Trials with low PrEP use did not show a significantly protective effect.」 |
| <https://doi.org/10.1016/S0140-6736(19)30418-0>（Europe PMC 摘要全文） | 是 | PARTNER2：「782 provided 1593 eligible couple-years of follow-up」「couples reported condomless anal sex a total of 76 088 times」「15 new HIV infections occurred during eligible couple-years of follow-up, but none were phylogenetically linked」 |
| <https://www.who.int/news-room/fact-sheets/detail/hiv-aids> | 是 | 「People living with HIV who are taking ART and have an undetectable viral load will not transmit HIV to their sexual partners.」；PrEP/PEP 的定义 |
| <https://www.beijing.gov.cn/fuwu/bmfw/jhsyfwzdzx/sjazbr/fakp/202311/t20231110_3299397.html> | 是 | 「尽可能在2小时内进行预防性用药，最好在24小时内、不超过72小时」；「连续服用28天」；PrEP 定义「当人面临HIV感染高风险时，通过服用药物以降低被感染概率的生物学预防方法」；暴露前预防用药为处方药物、应在专业人员指导下使用 |
| <https://cdcp.gd.gov.cn/jkjy/kpydjwjxz/content/post_3441820.html> | 是 | 窗口期：核酸约 1 周、第四代抗原抗体联合检测比抗体检测缩短约 1 周（约 2 周）、第三代抗体约 3 周；「建议至少2周后再去检测」，「检测间隔时间一般为2-4周」；末次高危行为后「绝大多数人（99.99%以上）在3个月后可以排除HIV感染」 |
| <https://www.cqcdc.org/index.php?a=shows&catid=2270&id=3045> | 是 | 重庆「提供艾滋病暴露前和暴露后预防药物服务的机构已经增加至26个区县29家门诊」「主要为医院感染科门诊」「能提供24小时全天候服务的门诊已经达到14家」；「72小时内服用特定的抗病毒药物」「需要每天服用并连续服药28天」 |
| <https://www.chinacdc.cn/jkyj/crb2/yl/azb/jswj_azb/202410/t20241027_302131.html> | 部分 | 中国疾控中心页面只有公告与范围说明（「涵盖了艾滋病病毒非职业暴露后预防的各个方面：HIV暴露风险评估，PEP适用性评估及实施，PEP依从性教育及综合干预以及PEP随访管理」），技术细节在附件 PDF 中，未逐字取回。因此 72 小时／28 天两个数字以北京市人民政府防艾科普页为主引，指南列为并列来源 |

第 13 节第 37 条定 B 而非 A：时限与疗程来自官方科普与技术指南（试用），不是随机试验；PEP 本身没有也不可能有安慰剂对照试验。随访时间点（第 4 至 6 周、3 个月）写在备注并注明按医嘱，未标为核实过的官方数字。

第 1 节第 28 条成本记「毅力=些」：难点在每次使用而非花钱。第 29 条成本记「钱=0 毅力=些」：条例明确免费，毅力是「愿意去查」。第 13 节第 37 条成本记「钱=多」：一个疗程药费上千元且多数地区自费，本轮未取到全国统一的费用或报销规定，正文按「多数地区自费」写并未给具体金额区间之外的口径。
