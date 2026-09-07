# 核实记录：第 10 节扩写 + 第 21、22、23 节新增

核实日期：2026-09-07。本轮新增 35 条（第 10 节 +8，第 21 节 10，第 22 节 10，第 23 节 7），全书 274 → 309 条。

方法与前几轮一致：英文文献用 Europe PMC REST（`search?query=TITLE:"…"&resultType=core`）取回题录与摘要原文；PubMed 未收录的心理学期刊改用 Crossref（`api.crossref.org/works?query.bibliographic=`）取题录、Semantic Scholar（`api.semanticscholar.org/graph/v1/paper/DOI:…`）取摘要。中文法规用国务院政策文件库 JSON 接口（`sousuo.www.gov.cn/search-gov/data?t=zhengcelibrary`）定位，再抓原文页去标签逐条核对；全国人大制定的法律不在该库内，改用最高人民检察院官网的转载全文。

---

## 一、第 10 节（恋爱与结婚）

### 文献

| 文献 | 核对到的原文 | 用在哪 |
| --- | --- | --- |
| Joel S, Eastwick PW, Finkel EJ (2017). Psychological Science, 28(10), 1478-1489. doi:10.1177/0956797617714580（PMID 28853645） | 摘要原文：「Random forests models predicted 4% to 18% of actor variance and 7% to 27% of partner variance; crucially, however, they were unable to predict relationship variance using any combination of traits and preferences reported before the dates.」 | 「认识更多人，而不是死磕一个」 |
| Eastwick PW, Finkel EJ (2008). JPSP, 94(2), 245-264. doi:10.1037/0022-3514.94.2.245（PMID 18211175） | 摘要原文：「participants' ideal preferences, assessed before the speed-dating event, failed to predict what inspired their actual desire at the event.」 | 同上 |
| Hall JA, Xing C, Brooks S (2015). Communication Research, 42(7), 939-958. doi:10.1177/0093650214534972 | Crossref 摘要原文：「The results indicated that interactions where flirting did not occur were more accurately perceived than interactions where flirting occurred.」样本 52 对（n=104）、10–12 分钟；研究二 26 段 1 分钟视频、261 名旁观者 | 「判断对方有没有兴趣」 |
| Perilloux C, Kurzban R (2015). Psychological Science, 26(1), 70-77. doi:10.1177/0956797614555727（PMID 25413875） | 摘要原文：「these results imply that men might be accurate in perceiving and reporting women's sexual intentions」 | 同条的争议标注 |
| Joel S, Eastwick PW, Allison CJ, et al. (2020). PNAS, 117(32), 19061-19071. doi:10.1073/pnas.1917036117（PMID 32719123） | 摘要原文：43 个纵向数据集、29 个实验室；「the top relationship-specific predictors … were perceived-partner commitment, appreciation, sexual satisfaction, perceived-partner satisfaction, and conflict」；「relationship-specific variables predicted up to 45% of variance at baseline, and up to 18% … at the end」；「Actor-reported variables … predicted two to four times more variance than partner-reported variables」；「relationship-quality change … was largely unpredictable」 | 「关系好不好，主要看你自己的感受」 |
| Aron A, Melinat E, Aron EN, Vallone RD, Bator RJ (1997). PSPB, 23(4), 363-377. doi:10.1177/0146167297234003 | Crossref 题录核对无误。36 题、45 分钟、与闲聊对照组的对比为该研究通行描述 | 「轮流回答一组由浅入深的问题」 |
| Stafford L, Merolla AJ, Castle JD (2006). JSPR, 23(6), 901-919. doi:10.1177/0265407506070472 | Crossref 摘要原文：「About half of LDDR partners experience this transition, whereas the other half end their relationships during separation. Among reunited relationships, one-third terminate within 3 months of reunion.」 | 「异地不比同城差，坎在重聚」 |
| Stafford L, Merolla AJ (2007). JSPR, 24(1), 37-54. doi:10.1177/0265407507072578 | Crossref 摘要原文：「LDDRs were more stable than GCDRs as long as LDDR partners remained geographically separated, but LDDR partners were likely to terminate their relationship upon becoming proximal.」 | 同上 |
| Dargie E, Blair KL, Goldfinger C, Pukall CF (2015). J Sex Marital Ther, 41(2), 181-202. doi:10.1080/0092623X.2013.864367（PMID 24274061） | 摘要原文：「Few differences existed between long-distance dating relationships and geographically close relationships」；样本 474+243 异地、314+111 同城 | 同条备注 |

### 法规

| 文件 | 核对到的原文 | 用在哪 |
| --- | --- | --- |
| 治安管理处罚法（2025 修订，2026-01-01 施行），最高检转载 <https://www.spp.gov.cn/spp/fl/202506/t20250627_699863.shtml> | 第五十条第一款第（五）项：「多次发送淫秽、侮辱、恐吓等信息或者采取滋扰、纠缠、跟踪等方法，干扰他人正常生活的」，本款罚则「处五日以下拘留或者一千元以下罚款；情节较重的，处五日以上十日以下拘留，可以并处一千元以下罚款」；第二款：「有前款第五项规定的滋扰、纠缠、跟踪行为的……经公安机关负责人批准，可以责令其一定期限内禁止接触被侵害人。对违反禁止接触规定的，处五日以上十日以下拘留，可以并处一千元以下罚款。」文末「本法自 2026 年 1 月 1 日起施行。」 | 「对方明确拒绝之后就停下」 |
| 婚姻登记条例（国令第 804 号，2025-04-06 公布，2025-05-10 施行）<https://www.gov.cn/zhengce/zhengceku/202504/content_7017752.htm> | 第二条（登记机关为县级民政部门或省级政府按便民原则确定的乡镇政府，无「常住户口所在地」限制）；第六条「婚姻登记机关办理婚姻登记，不得收取费用」；第八条内地居民只需「（一）本人的居民身份证；（二）本人无配偶以及与对方当事人没有直系血亲和三代以内旁系血亲关系的签字声明」；第九条四类不予登记情形；第十条「应当当场予以登记，发给结婚证」；第十二条「一方当事人患有重大疾病的，应当在结婚登记前如实告知另一方当事人；不如实告知的，另一方当事人可以依据民法典第一千零五十三条的规定向人民法院请求撤销婚姻」 | 「领证只要身份证加一份签字声明」「婚前做一次婚检」 |
| 出生缺陷防治能力提升计划（2023—2027 年）（国卫办妇幼发〔2023〕9 号，2023-08-17）<https://www.gov.cn/zhengce/zhengceku/202308/content_6900320.htm> | 「婚前医学检查率、孕前优生健康检查目标人群覆盖率分别保持在 70% 和 80% 以上」；「推进婚前医学检查机构与婚姻登记场所就近设置方便群众」；「推广婚姻登记、婚前医学检查、生育指导『一站式』服务」 | 「婚前做一次婚检」 |

注：新条例正文未出现「婚前医学检查」四字，也未见「全国通办」字样——「不再要户口簿」和「不限户口所在地」是与 2003 年旧条例（第四条要求到「一方当事人常住户口所在地」、第五条要求出具户口簿）对比后的表述，正文按「旧条例里的限制已经取消」措辞，未声称新条例写了「全国通办」。婚检是否免费无全国统一文件，已标 TODO。

---

## 二、第 21 节（出国、旅行与境外安全）

| 文件 | 核对到的原文 | 用在哪 |
| --- | --- | --- |
| 国务院关于出境入境管理的规定（国令第 841 号，2026-07-22 成文，2026-07-31 发布，2026-09-15 施行）<https://www.gov.cn/zhengce/zhengceku/202607/content_7077173.htm> | 第二条「中国公民应当关注国外安全提醒和旅游目的地安全风险提示，避免前往及驻留高风险国家或者地区」，及「对准备前往风险等级为最高级别或者严重危及人身安全案件突发高发的国家或者地区的中国公民，必要时应当劝阻其前往」；第三条「出境入境人员申请出境入境、停留居留的事由应当真实、合法」，虚假材料「有权决定不予签发出境入境证件或者不准其出境、入境」；第四条「中国公民在境外从事违法犯罪活动，危害国家安全和利益的，可以……决定自回国之日起 6 个月至 3 年以内不准其出境」，骗取证件、非法出入境受行政拘留的同为「6 个月至 3 年」；第七条中介备案（设立之日起 15 日内；施行前已从事的 90 日内）；第八条中介应具备的条件、「境外企业、机构不得在中国境内提供出境入境中介服务」；第十条中介禁止行为六项；第十一条「个人为他人申请出境入境、停留居留出具虚假邀请函件或者其他申请材料的，由移民管理机构处 5000 元以上 1 万元以下罚款」，单位 1 万至 5 万元并对责任人 5000 至 1 万元；第十九条施行日期 | 第 1、5、8、9 条 |
| 司法部、公安部、国家移民局就该规定答记者问（2026-08-01）<https://www.gov.cn/zhengce/202608/content_7077270.htm> | 「上当受骗出境或者虚构事由非法出境从事跨境赌博、电信网络诈骗等违法活动，严重危害人民群众生命和财产安全」；「2018 年取消因私出入境中介服务机构准入许可后，中介服务机构数量快速增长……出现了中介服务机构底数不清、部分机构违法违规办理业务、损害出境入境人员合法权益等问题」 | 第 5、8 条 |
| 领事保护与协助条例（国令第 763 号，2023-07-13 公布，2023-09-01 施行）<https://www.gov.cn/zhengce/zhengceku/202307/content_6891761.htm> | 第九条第二款（探视或联络、要求人道主义待遇和公正待遇）；第十条（旁听、保障诉讼权利）；第十三条（下落不明时提供当地报警方式及其他获取救助的信息，立案后敦促处理）；第十四条（受伤时敦促紧急救助、死亡时协助善后）；第十六条（提供当地法律服务、翻译、医疗、殡葬机构信息）；第十九条（外交部公开发布国外安全提醒，级别划分和发布程序由外交部制定）；第二十一条「有关中国公民……应当积极关注安全提醒，根据安全提醒要求，在当地做好安全防范、避免前往及驻留高风险国家或者地区」，及旅行社的出行前告知义务；第二十六条「在领事保护与协助过程中，得到第三方提供的食宿、交通、医疗等物资和服务的，应当支付应由其自身承担的费用」 | 第 1、3、4、6、10 条 |
| 外交部领事司「安全提醒」栏目 <https://cs.mfa.gov.cn/zggmzhw/lsbh/aqtx/> | 2026-09-07 抓取列表页并解析链接，在列的「暂勿前往」类提醒：斯威士兰 2026-08-25、巴勒斯坦 2023-10-10、苏丹 2023-04-17、阿富汗 2023-02-17、叙利亚 2023-01-04、秘鲁 2022-12-29、索马里 2022-11-24；另有缅北地区（2023-11-09）、刚果（金）伊图里等省（2023-09-13）的专门提醒。级别措辞实见「暂勿前往」「谨慎前往」「加强安全防范」「注意安全」 | 第 1 条 |
| 关于当前缅北地区安全局势的领事提醒（2023-11-09）<https://cs.mfa.gov.cn/zggmzhw/lsbh/aqtx/202311/t20231109_11176682.shtml> | 「外交部全球领事保护与服务应急热线（24 小时）：+86-10-12308 / +86-10-65612308」 | 第 2 条 |
| 国务院政策例行吹风会：领事保护与协助有关情况（2023-07-14）<https://www.gov.cn/xinwen/2023zccfh/11/index.htm> | 12308「24 小时运转，自 2014 年开通以来，累计接听了 300 多万通来电」；同期处置各类领事保护案件「50 多万起」 | 第 2 条 |
| UN Treaty Collection, Convention on Road Traffic (Geneva, 19 September 1949) | 生效日期「26 March 1952, in accordance with article 29」；缔约方 103、签署国 19；中国内地不在缔约方名单内，仅脚注提及香港特别行政区的适用 | 第 7 条 |

未取得 / 未采用：
- 《中国领事保护和协助指南》PDF（<http://cs.mfa.gov.cn/zggmzhw/lsbh/lbsc_660514/202311/P020231114392262052796.pdf>）本机无 PDF 文本提取工具，未能逐字核对「领事官员不能做什么」清单，因此第 3 条改为全部引条例条文，不引该指南。
- 境外医疗与医疗转运的费用数字未找到官方或行业统计口径，第 4 条标 TODO 并降为 C 级。
- 出境健康（黄热病疫苗、疟疾预防）本轮未写，缺可逐字核对的中文官方来源。

---

## 三、第 22 节（娱乐场所和减压）

### 法规

| 文件 | 核对到的原文 | 用在哪 |
| --- | --- | --- |
| 娱乐场所管理条例（国令第 458 号）<http://www.gov.cn/zhengce/zhengceku/2008-03/28/content_6297.htm> | 第十四条禁止「贩卖、提供毒品，或者组织、强迫、教唆、引诱、欺骗、容留他人吸食、注射毒品」；第二十条（法定代表人对消防和其他安全负责）；第二十一条「营业期间，娱乐场所应当保证疏散通道和安全出口畅通，不得封堵、锁闭疏散通道和安全出口，不得在疏散通道和安全出口设置栅栏等影响疏散的障碍物」及指示标志不得遮挡；第二十三条「歌舞娱乐场所不得接纳未成年人」；第二十九条「娱乐场所提供娱乐服务项目和出售商品，应当明码标价，并向消费者出示价目表；不得强迫、欺骗消费者接受服务、购买商品」；第三十条（警示标志须注明举报电话）；第四十二条（违反第十四条：没收违法所得和非法财物，责令停业整顿 3 至 6 个月，情节严重吊销许可证）；第五十三条（违反价格法律法规由有关部门处罚） | 第 1、2、3 条 |
| 互联网上网服务营业场所管理条例（国令第 363 号）<http://www.gov.cn/gongbao/content/2002/content_61788.htm> | 第二十一条「营业期间禁止封堵或者锁闭门窗、安全疏散通道和安全出口」「禁止明火照明和吸烟并悬挂禁止吸烟标志」；第二十三条「应当对上网消费者的身份证等有效证件进行核对、登记，并记录有关上网信息。登记内容和记录备份保存时间不得少于 60 日」，保存期内不得修改或删除；不得接纳未成年人并须悬挂未成年人禁入标志 | 第 1、4 条 |
| 五部门关于加强剧本娱乐经营场所管理的通知（2022-06-27）<https://www.gov.cn/zhengce/zhengceku/2022-06/27/content_5698021.htm> | 「剧本娱乐经营场所不得设在居民楼内、建筑物地下一层以下（不含地下一层）等地」；「常态化开展火灾风险自知、自查、自改，提高紧急情况下的组织疏散逃生和初起火灾扑救能力」；适龄提示与「除国家法定节假日、休息日及寒暑假期外，剧本娱乐经营场所不得向未成年人提供剧本娱乐活动」 | 第 5 条 |

### 文献

| 文献 | 核对到的原文 | 用在哪 |
| --- | --- | --- |
| Noetel M, Sanders T, Gallardo-Gómez D, et al. (2024). BMJ, 384, e075847. doi:10.1136/bmj-2023-075847（PMID 38355154） | 218 项研究、495 个组、14170 人；walking or jogging g −0.62（−0.80 至 −0.45）、yoga −0.55（−0.73 至 −0.36）、strength training −0.49（−0.69 至 −0.29）、mixed aerobic −0.43（−0.61 至 −0.24）、tai chi or qigong −0.42（−0.65 至 −0.21）；「The effects of exercise were proportional to the intensity prescribed.」；「only one study met the Cochrane criteria for low risk of bias」，CINeMA 置信度 walking/jogging 为 low、其余 very low | 第 6 条（含争议标注） |
| Hoge EA, Bui E, Mete M, Dutton MA, Baker AW, Simon NM (2023). JAMA Psychiatry, 80(1), 13-21. doi:10.1001/jamapsychiatry.2022.3679（PMID 36350591） | 276 人入组、208 人进入非劣效样本（MBSR 102 / 艾司西酞普兰 106）；CGI-S 下降 1.35 对 1.43；组间差 −0.07（0.16；95% CI −0.38 至 0.23，P=.65），非劣效界值 −0.495；不良事件 78.6% 对 15.4%，药物组 10 人因不良事件退出、正念组 0 人 | 第 7 条 |
| Balban MY, Neri E, Kogon MM, et al. (2023). Cell Reports Medicine, 4(1), 100895. doi:10.1016/j.xcrm.2022.100895（PMID 36630953） | 「remote, randomized, controlled study (NCT05304000) of three different daily 5-min breathwork exercises compared with an equivalent period of mindfulness meditation over 1 month」；「breathwork, especially the exhale-focused cyclic sighing, produces greater improvement in mood (p < 0.05) and reduction in respiratory rate (p < 0.05) compared with mindfulness meditation」 | 第 8 条 |
| Holt-Lunstad J, Smith TB, Baker M, Harris T, Stephenson D (2015). Perspect Psychol Sci, 10(2), 227-237. doi:10.1177/1745691614568352（PMID 25910392） | 题录核对无误。70 项研究、约 340 万人、平均随访 7 年，社会隔离 OR 1.29、孤独 1.26、独居 1.32，且 65 岁以下效应更大——为该研究通行报告的数值 | 第 9 条 |
| Rojas-Rueda D, Nieuwenhuijsen MJ, Gascon M, Perez-Leon D, Mudu P (2019). Lancet Planet Health, 3(11), e469-e477. doi:10.1016/S2542-5196(19)30215-3（PMID 31777338） | 摘要原文：9 项研究、8 324 652 人、7 个国家；「The pooled HR for all-cause mortality per increment of 0·1 NDVI within a buffer of 500 m or less … was 0·96 (95% CI 0·94-0·97; I², 95%)」；9 项中 7 项显著、2 项无关联 | 第 10 条（含争议标注） |

未采用：容留他人吸毒的刑法第三百五十四条与吸毒的治安处罚条款，本轮未找到可逐字核对且符合本书引用规则的官方转载页，第 3 条只写「属于刑事犯罪」的定性并全部引娱乐场所管理条例的条文，未写具体刑期。

---

## 四、第 23 节（学什么技能划算）

| 来源 | 核对到的原文 | 用在哪 |
| --- | --- | --- |
| Psacharopoulos G, Patrinos HA (2018). Education Economics, 26(5), 445-458. doi:10.1080/09645292.2018.1484426；世界银行政策研究工作论文 8402, doi:10.1596/1813-9450-8402 | 摘要原文（经 Semantic Scholar 按 DOI 取回）：「reviews the latest trends and patterns based on 1120 estimates in 139 countries from 1950 to 2014. The private average global return to a year of schooling is 9% a year. Private returns to higher education increased … Social returns to schooling remain high. Women continue to experience higher average returns to schooling」 | 第 1 条 |
| 人力资源社会保障部关于开展技术技能类「山寨证书」专项治理工作的通知（2022-03-18）<https://www.gov.cn/zhengce/zhengceku/2022-03/18/content_5679641.htm> | 「一些机构和单位以新职业职业资格、职业技能等级等名义随意举办培训、评价、发证活动，乱收费、滥发证；一些机构和单位虚假或夸大宣传，甚至假冒权威机构名义组织培训、评价、颁发证书等，社会对此反映强烈」；「严厉打击假冒鉴定机构、人社部门备案评价机构的评价发证活动」；「引导公众了解证书查询渠道和方式，判断证书合法合规性和含金量等」 | 第 2 条 |
| 国务院就业促进和劳动保护工作领导小组关于开展大规模职业技能提升培训行动的指导意见（2025-07-15）<https://www.gov.cn/zhengce/zhengceku/202507/content_7032222.htm> | 「从 2025 年到 2027 年底……聚焦高精尖产业与急需行业、就业重点群体等开展补贴性培训 3000 万人次以上」；「统筹发挥就业补助资金、失业保险基金、行业发展资金、东西部协作资金、企业职工教育经费等」；「进一步健全根据职业（工种）急需紧缺程度、培训成本等情况确定的差异化补贴机制」；「确保 60% 以上用于一线职工教育和培训」；「大力推行『新八级工』职业技能等级制度……对表现突出的职工，可打破工作年限、等级、资历等条件，直接认定相应职业技能等级」；「指导企业实行岗位薪酬与岗位价值、技能等级双挂钩的分配办法」；「支持民办培训机构开展市场化的高质量职业技能培训项目和能短期实现就业的『短平快』式职业技能培训项目」；「推动在职业院校开设微专业和职业能力培训课程」 | 第 3、5、6、7 条 |
| 人力资源社会保障部「技能中国行动」实施方案（2021-07-06）<https://www.gov.cn/zhengce/zhengceku/2021-07/06/content_5622619.htm> | 题录核对无误，作为技能等级制度的第二来源 | 第 5 条 |
| Frey CB, Osborne MA (2017). Technological Forecasting and Social Change, 114, 254-280. doi:10.1016/j.techfore.2016.08.019 | Crossref 题录核对无误。702 个职业、约 47% 高风险、三类工程瓶颈（感知与操作、创造性智能、社会智能）为该研究通行报告的结论；正文已标注它按整个职业打分、后续按任务拆分的研究得出的比例低得多 | 第 4 条 |

未取得：
- 人力资源社会保障部官网（mohrss.gov.cn）在本机网络下只返回一个约 988 字节的反爬壳页，无头 Chrome 渲染同样超时，「全国招聘求职 100 个短缺职业排行」未能取得原文。
- 国家统计局网站可访问，但「最新发布」栏目当前页未列出分行业年平均工资的发布条目，未取得可引用的分职业工资数据。
以上两项合并为第 6 条里的一处 TODO，正文按既定口径不写具体工种月薪、不引招聘平台数字。
- 英语等通用语言技能的回报，未找到符合引用规则的原始文献，本轮不写。
