# 追加：急诊怎么排队、扎进身体的异物与骨折、伤残鉴定与残疾人证

2026-09-10。起因是读者提的三件事：医院看病的流程到底怎么走（新闻里有人头上插着刀还在挂号窗口排队）、重大伤害和骨折当场该做什么、要不要给自己办一张残疾证。查下来这三块都没有现成条目，按归属分别落在第 13 节（现场急救）和第 24 节（就医流程与治完之后的手续），没有新增小节。

第 13 节新增第 41、42 条；第 24 节新增第 8、9、10、11 条。

## 第 24 节第 8 条（急诊预检分诊）

| URL | 复核 | 原文引句 |
|---|---|---|
| <https://www.gov.cn/zhengce/zhengceku/202405/content_6951260.htm>（国家卫生健康委办公厅《关于印发急诊医学等 6 个专业医疗质量控制指标（2024 年版）的通知》，国卫办医政函〔2024〕150 号，2024 年 4 月 30 日） | 是 | 附件 1 指标四「急诊分级分诊执行率（EM-ME-04）」说明：「急诊预检分诊要依据科学的标准进行准确分级，目前广泛使用的标准按病情危重程度将患者分为四级：I 级为急危患者，需要立即得到救治；II 级为急重患者，往往评估与救治同时进行；III 级为急症患者，需要短时间内得到诊治；IV 级为非急症患者或亚急症患者，在普通诊疗区顺序就诊」 |
| <http://wjw.beijing.gov.cn/zwgk_20040/ylws/201912/t20191216_1242338.html>（北京市卫生健康委员会《北京市加强急诊预检分诊分级工作方案》及附件《北京市医院急诊预检分诊分级标准（试行）》，2019 年 12 月） | 是 | 「坚持急危重症优先就诊原则。按照患者病情的严重程度，遵循从重到轻、从病情迅速变化到相对稳定的原则，合理安排患者就诊顺序。」「在急诊科入口的显著位置，设置急诊预检分诊区域」「按照『三区四级』的原则……区分『濒危、危重、急症、非急症』」。附件成人表：1 级濒危「正在或即将发生的生命威胁或病情恶化，需要立即进行积极干预」，处置「立即进行评估和救治，安排患者进入复苏室或抢救室」（红色）；2 级危重「立即监护生命体征，10 分钟内得到救治，安排患者进入抢救室」（红色）；3 级急症「先于 4 级患者优先诊治，安排患者在普通诊疗区候诊；若候诊时间大于 30 分钟，需再次评估」（黄色）；4 级非急症「顺序就诊，除非病情变化，否则候诊时间较长；若候诊时间大于 4 小时，可再次评估」（绿色）。1 级人工评定指标含「心率＞180 次/min 或＜40 次/min」「收缩压＜70mmHg」「SpO2＜80% 且呼吸急促」「休克」「明确心肌梗死」「急性意识障碍/无反应或仅有疼痛刺激反应（GCS<9）」 |

定级 A：四级分诊的定义出自国家卫健委现行文件，各级响应时间出自北京市的执行标准，两处都能逐字核对。口径「时间」——这条换回的是不被排在后面耽误，不是一个可量化的死亡率降幅，所以不套死亡率口径。收益量级「中」：没有相对降幅数字可套，按判断定中（重症提前到 10 分钟内进抢救室是实质差别，但本条只保证顺序、不保证结果）。成本 钱=0 时间=少 毅力=否，合成为「高」。

未取得：卫生部《急诊科建设与管理指南（试行）》（卫医政发〔2009〕50 号）是「三区四级」的源头，但 nhc.gov.cn 全站对本机返回 412（Invoke-WebRequest 与无头 Chrome 均失败），行业标准 WS/T 390—2012《医院急诊科规范化流程》的官方 PDF 是扫描件、无文本层，pdftotext 抽不出字。因此这两份不进来源栏，改引 2024 年质控指标（国家层面、可逐字核对）加北京市方案（响应时间、可逐字核对）。国务院政策文件库不收卫健委的部门文件，检索该库无果属正常。

## 第 24 节第 9 条（没钱没证件也得先救）

| URL | 复核 | 原文引句 |
|---|---|---|
| <https://www.gov.cn/zhengce/zhengceku/2013-03/01/content_6069.htm>（国务院办公厅《关于建立疾病应急救助制度的指导意见》，国办发〔2013〕15 号） | 是 | 救助对象为「在中国境内发生急重危伤病、需要急救但身份不明确或无力支付相应费用的患者」；基金支付「无法查明身份患者所发生的急救费用」「身份明确但无力缴费的患者所拖欠的急救费用」；「各级各类医疗机构及其工作人员必须及时、有效地对急重危伤患者施救，不得以任何理由拒绝、推诿或拖延救治」 |
| <http://www.gov.cn/gongbao/content/2014/content_2580977.htm>（国家卫生和计划生育委员会令第 3 号《院前医疗急救管理办法》） | 是 | 第十三条「全国院前医疗急救呼叫号码为『120』」；第二十二条「不得因指挥调度原因拒绝、推诿或者延误院前医疗急救服务」；第二十三条「应当按照就近、就急、满足专业需要、兼顾患者意愿的原则，将患者转运至医疗机构救治」；第二十五条「不得因费用问题拒绝或者延误院前医疗急救服务」 |

定级 A：两份都是现行有效的国家文件，条款可逐字核对。口径「金钱」，收益量级「中」——兜的是急救那一段的费用，不是万元级的赔偿或待遇，各省封顶额不同故不写金额。成本全零，合成为「高」。

## 第 24 节第 10 条（伤残鉴定的时机）

| URL | 复核 | 原文引句 |
|---|---|---|
| <https://www.moj.gov.cn/pub/sfbgw/zwxxgk/fdzdgknr/fdzdgknrtzwj/201908/P020210316701681025917.pdf>（最高人民法院、最高人民检察院、公安部、国家安全部、司法部《关于发布〈人体损伤致残程度分级〉的公告》，2016 年 4 月 18 日发布，2017 年 1 月 1 日施行；司法部政府信息公开栏 PDF，有文本层，已逐字抽取核对） | 是 | 4.2 鉴定时机：「应在原发性损伤及其与之确有关联的并发症治疗终结或者临床治疗效果稳定后进行鉴定。」4.4：「本标准将人体损伤致残程度划分为 10 个等级，从一级（人体致残率 100%）到十级（人体致残率 10%），每级致残率相差 10%。」4.5：「依据人体组织器官结构破坏、功能障碍及其对医疗、护理的依赖程度，适当考虑由于残疾引起的社会交往和心理因素影响，综合判定致残程度等级。」5.10.6 十级脊柱、骨盆及四肢损伤：「一椎体压缩性骨折（压缩程度达 1/3）或者粉碎性骨折」「骨盆两处以上骨折或者粉碎性骨折，畸形愈合」「四肢任一大关节（踝关节除外）功能丧失 25% 以上」。6.2：「同一部位和性质的残疾，不应采用本标准条款两条以上或者同一条款两次以上进行鉴定。」4.3 伤病关系：因果关系「可依次分别表述为：完全作用、主要作用、同等作用、次要作用、轻微作用、没有作用」 |

定级 A：标准原文可逐字核对。口径「金钱」，收益量级「大」——等级直接决定残疾赔偿金，按第 9 节已核实的口径（上年度城镇居民人均可支配收入乘 20 年）是万元级以上。成本 钱=少 时间=中 毅力=些，成本分 3，合成为「一般」。

鉴定费「几百到两千元」写在成本栏，是各地司法鉴定收费的常见区间，没有全国统一定价文件可引，故不进收益栏、不作为数字主张，成本栏只写区间并说明由申请方先垫。

## 第 24 节第 11 条（残疾人证）

| URL | 复核 | 原文引句 |
|---|---|---|
| <https://www.bdpf.org.cn/cms68/web1459/subject/n1/n1459/n1508/n1509/n1512/c68465/content.html>（北京市残疾人联合会转载《中华人民共和国残疾人证管理办法》全文，2017 年 5 月 27 日发布、2018 年 1 月 1 日施行） | 是 | 第二条「中华人民共和国残疾人证……是认定残疾人及其残疾类别、残疾等级的合法凭证，是残疾人依法享有国家和地方政府优惠政策的重要依据。残疾评定标准为中华人民共和国国家标准《残疾人残疾分类和分级》（GB/T26341-2010）」；第三条「残疾人证坚持申领自愿、属地管理原则。凡符合残疾标准的视力、听力、言语、肢体、智力、精神及多重残疾人均可申领残疾人证」；第五条残疾等级代码「一级:1 二级:2 三级:3 四级:4」；第七条「县级残联负责残疾人证的申办受理、核发管理等工作」，依据省级指定机构的评定结论核发；第九条（一）申请需「持申请人居民身份证、户口本和 3 张两寸近期免冠白底彩照，向户口所在地县级残联提出办证申请」，（三）评定结论符合标准的「应在申请人所在的村（社区）予以公示，公示时间为五个工作日」，（四）县级残联「在十个工作日内审核完毕」；第十七条「办理残疾人证不收取工本费。指定机构评定残疾类别、等级的费用以及照片等费用，原则上由申请人个人自理；有条件的地方可由当地财政予以补贴，对特殊困难的申请人应协调有关部门予以减免」；第十九条「残疾人证有效期十年，期满可到批准残联免费换领」；第二十二条「残疾类别或残疾等级发生变化的，本人提出申请，经批准残联同意，可到指定机构重新进行残疾评定」；第二十五条对评定结论有异议的「可在十个工作日内到所在地市级残联申请重新评定」，仍有异议的由省级残疾评定专家委员会评定，「该评定结论为最终结论」；第十三条多重残疾「按所属残疾中残疾程度最重类别的分级确定其残疾等级」；第十八条「残疾人证只限持证人本人使用……不得转借他人」；第二十四条注销后「一年内不得重新申请」 |

条文另在 banshi.beijing.gov.cn 的《泰安市人大社会建设工作法律法规汇编》PDF（有文本层）上做了第二次逐字比对，两处一致。文号本轮未取得可信来源（检索结果里同时出现「残联发〔2017〕34 号」和其他编号，广东省政府政策库转载的通知页只有发布日期没有文号），按项目规则不确定的不写，来源栏只写发布与施行日期。

定级 A：办法原文与全部时限、费用规定可逐字核对。口径「金钱」，收益量级「中」——证本身不发钱，接上的两项补贴按第 7 节第 9 条已核实的口径是每月几十到几百元，够不上万元级。成本 钱=少 时间=中 毅力=些，成本分 3，合成为「一般」。

## 第 13 节第 41、42 条（穿透伤异物、骨折）

| URL | 复核 | 原文引句 |
|---|---|---|
| <https://www.ifrc.org/sites/default/files/2026-03/IFRC%20International%20First%20Aid,%20Resuscitation%20and%20Education%20Guidelines%202025.pdf>（国际红十字与红新月会联合会《International First Aid, Resuscitation and Education Guidelines 2025》，官方 PDF，有文本层） | 是 | 第 256–257 页：「First aid providers should apply pressure around an embedded object (e.g. a knife) to stabilize the object. Avoid removing the object.」第 267–268 页：「Impaled objects in the body should be stabilized, and if the object is pulsating, it should be allowed to do so while loosely stabilized.」「First aid providers should not push internal organs back into the body.」「Do not remove any impaled objects from an abdominal or chest wound, as this may cause serious bleeding and make it more difficult for a medical professional to determine the severity of the wound.」「An open chest wound that is not actively bleeding may be left open, without the application of a dressing, because a sealed wound may allow air to build up in the chest, which may lead to the lung partially or fully collapsing (pneumothorax).」「First aid providers should access emergency medical care for all penetrating chest or abdominal wounds.」第 301–302 页：「Any injury to an extremity should be approached as a potential bone fracture.」「The injury should be stabilized to minimize any movement and pain either manually (e.g. self-splinting) or mechanically (e.g. using a sling and bandages).」「first aid providers may ice or cool the sprained joint or soft tissue injury for up to 20 consecutive minutes, as this may decrease the pain. Cooling for longer than this may damage the skin.」「If a long bone is injured, such as the femur, the bleeding from the bone itself can be life-threatening.」「The only accurate way to diagnose a fracture is with an X-ray. When in doubt, assume it is a fracture.」「Access emergency medical services (EMS) if the person has a lot of pain or swelling, signs of shock, the fracture is in the femur or if the limb is in an abnormal position.」「When in a remote environment (or one with limited resources) and the limb below the angulated fracture is cool, pale or the first aid provider is unable to splint for movement, the first aid provider may consider straightening it if trained to do so.」「If the injury is an open fracture, your priority is to stop the bleeding and limit infection.」证据小节：院前牵引固定股骨骨折的唯一一项回顾性队列显示「a statistically significant decrease in units of blood transfusion needed within the first 24 hours and a statistically significant shorter length of hospital stay」，但「a statistically significant decrease in mortality and complications could not be demonstrated, and the evidence was of very low certainty」；复位与原位固定的比较「no evidence was found」 |

两条都定 B：指南把这些列为 good practice points，背后没有随机试验，牵引固定那条只有一项极低确定性的回顾性队列，复位与否根本没有证据。第 41 条收益量级「大」——死亡率口径，防的是拔出异物后的即刻大出血和张力性气胸这类致命后果；成本 钱=0 时间=少 毅力=些，成本分 1，合成为「高」。第 42 条收益量级「中」——防的主要是二次损伤和残疾，不是死亡（股骨骨折失血那一句是例外，但本条的主体动作是固定与冷敷）；成本全零，合成为「高」。

未采用：NICE NG37（复杂骨折）页面对本机返回 403；2020 年 ILCOR 国际急救科学共识（doi:10.1161/cir.0000000000000897）的摘要主题里没有穿透性异物，只有闭合关节伤的加压包扎，故不引。中国红十字会的救护培训教材没有可公开逐字核对的版本，不引。

## 跟着改的引用

第 13 节第 41、42 条互相指路，并指向第 24 节第 8、10、11 条；第 24 节第 10 条指向第 9 节（残疾赔偿金）、第 19 节（劳动能力鉴定）、第 6 条（病历留存），第 11 条指向第 7 节第 9 条（残疾人两项补贴）。第 24 节导语补了「到了急诊怎么排队、重伤治完之后该做哪些鉴定和证件」。

## 统计

全书 479 → 485 条，A 级 306 → 310、B 级 124 → 126、C 级不变 49，文献链接 927 → 935。性价比「高」240 → 244、「一般」154 → 156，极高仍 85，百分比四舍五入后仍是 18%/50%/32%。README 目录里第 13 节简介补「扎进身体的异物、骨折固定」，第 24 节简介补急诊分诊、疾病应急救助、伤残鉴定时机、残疾人证四项；导读表加了一行问句。CLAUDE.md 的第 13、24 节简介同步。tools/og.html 三个数字改完并用无头 Chrome 重出 og.png。
