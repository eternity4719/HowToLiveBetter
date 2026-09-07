# 第 1 节来源核实记录

核实日期 2026-09-07。多数出版社站点（NEJM、Elsevier、Wiley、BMJ、AHA）对 WebFetch 返回 403，这些文献通过 Europe PMC REST 接口（`<https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:">…"&resultType=core&format=json`）读取了同一 DOI 对应记录的标题、作者、期刊、年份和摘要全文；doi.org 本身能解析（302 到出版社）。以下「原文」均为从摘要/正文中抓到的原句。

## 1. 安全带
- <https://crashstats.nhtsa.dot.gov/Api/Public/ViewPublication/813573> — 已打开（PDF 用 pdftotext 转文本）。标题 "Occupant Protection in Passenger Vehicles: 2022 Data, DOT HS 813 573, May 2024" 匹配。
  - 原文："Fifty percent of passenger vehicle occupants killed in traffic crashes in 2022 were unrestrained (based on known restraint use)."
  - 原文："lap/shoulder seat belts, when used, reduce the risk of: fatal injury to front-seat passenger car occupants by 45 percent; … fatal injury to front-seat light-truck occupants by 60 percent"
  - 原文："60 percent of those in the second row were unrestrained."
- <https://www.who.int/news-room/fact-sheets/detail/road-traffic-injuries> — 已打开。原文："Wearing a seat-belt can reduce the risk of death among vehicle occupants by up to 50%."
- <https://ghoapi.azureedge.net/api/RS_196?$filter=SpatialDim%20eq%20%27CHN%27> — 已打开（WHO GHO API）。China 2021：248,099（95% CI 233,685–262,513）。RS_198 同法打开：2021 年 17.4/10 万。
  - 注意：GHO 接口返回时 RS_196 给的是绝对数、RS_198 给的是率，与我预期的指标编号相反；数字本身取自返回 JSON。

## 2. 头盔
- <https://doi.org/10.1002/14651858.CD004333.pub3> — doi.org 解析到 Wiley（403），Europe PMC 记录确认：Liu BC, 2008, "Helmets for preventing injury in motorcycle riders"。
  - 原文："helmets were estimated to reduce the risk of death by 42% (OR 0.58, 95% CI 0.50 to 0.68)"；"reduce the risk of head injury by 69% (OR 0.31, 95% CI 0.25 to 0.38)"

## 3. 烟雾报警器 / 一氧化碳
- <https://doi.org/10.1001/jama.279.20.1633> — Europe PMC 记录确认：Marshall SW, Runyan CW 等, JAMA 1998, "Fatal residential fires: who dies and who survives?"。
  - 原文："Overall, a functioning smoke detector lowered the risk of death (OR, 0.39; 95% CI, 0.18-0.83)."
- <https://www.usfa.fema.gov/downloads/pdf/statistics/v22i2.pdf> — 已打开（PDF 转文本）。标题 "Fatal Fires in Residential Buildings (2018-2020), Topical Fire Report Series June 2022 Vol 22 Issue 2" 匹配。
  - 原文："Smoke alarms were not present in 24% of fatal fires in occupied residential buildings."；"The leading human factor contributing to the ignition of fatal fires in residential buildings was being 'asleep' (41%)."
- <https://doi.org/10.46234/ccdcw2020.008> — doi.org 解析到 weekly.chinacdc.cn（只显示元数据），全文通过 Europe PMC PMC8392909 fullTextXML 读取。作者 You J, Liu J, Zhou M，China CDC Weekly 2020。
  - 原文："In 2018, there were 11,523 deaths caused by carbon monoxide poisoning reported in China"；"highest proportions occurring in December (72.59%), January (67.42%), and February (66.48%)"
- 未采用：NFPA "Smoke Alarms in US Home Fires" 页面只返回标题，报告 PDF 返回 500，未能核实，故没有引用 NFPA 的「死亡率低 55%」数字。

## 4. 血压
- <https://doi.org/10.1016/S0140-6736(15)01225-8> — Elsevier 页面只显示 Redirecting；Europe PMC 记录确认：Ettehad D, Lancet 2016。
  - 原文："relative risk [RR] 0·80, 95% CI 0·77-0·83"（主要心血管事件）；"stroke (0·73, 0·68-0·77)"；"heart failure (0·72, 0·67-0·78)"；"a significant 13% reduction in all-cause mortality (0·87, 0·84-0·91)"
  - 原文："We identified 123 studies with 613,815 participants for the tabular meta-analysis."
- <https://doi.org/10.1016/S0140-6736(17)32478-9> — Europe PMC 记录确认：Lu J, Lancet 2017, China PEACE Million Persons Project。
  - 原文："44·7% (95% CI 44·6-44·8) of the sample had hypertension, of whom 44·7% (44·6-44·8) were aware of their diagnosis, 30·1% (30·0-30·2) were taking prescribed antihypertensive medications, and 7·2% (7·1-7·2) had achieved control"

## 5. 不超速不酒驾
- <https://www.who.int/news-room/fact-sheets/detail/road-traffic-injuries> — 已打开。
  - 原文："Every 1% increase in mean speed produces a 4% increase in the fatal crash risk."；"The risk of a road traffic crash starts at low levels of blood alcohol concentration (BAC)."

## 6. 儿童安全座椅
- NHTSA 813573（同第 1 条）。原文："NHTSA has estimated that car seats reduce the risk of fatal injury by 71 percent for infants (younger than 1 year old) and by 54 percent for toddlers (1 to 4 years old) in passenger cars."
- WHO 道路交通 fact sheet（同上）。原文："The use of child restraints can lead to a 71% reduction in deaths among infants."

## 7. 溺水
- <https://doi.org/10.1136/ip.2010.028688> — doi.org 解析到 injuryprevention.bmj.com（403）；Europe PMC 记录确认：Cummings P, Mueller BA, Quan L. Injury Prevention 2011;17(3):156-159, PMID 20889519。
  - 原文："The adjusted RR was 0.51 (95% CI 0.35 to 0.74)."
  - 注意：我最初记的 DOI（…028381）是错的，doi.org 返回 404，已改为 Europe PMC 给出的 …028688。
- <https://doi.org/10.46234/ccdcw2023.198> — 解析到 weekly.chinacdc.cn；全文经 Europe PMC PMC10689961 读取。Li Z, China CDC Weekly 2023。
  - 原文："the national drowning mortality rate from 6.60 per 100,000 in 2013 down to 3.28 per 100,000 in 2021"；"rural areas exhibited roughly double the mortality rate found in urban areas"；"in China, it is deemed the primary cause of death for children between the ages of 1 and 14"；"peaking at 3.95 per 100,000 in the 15–19 year age group"
- <https://doi.org/10.46234/ccdcw2024.057> — 解析到 weekly.chinacdc.cn；摘要经 Europe PMC 读取。Zhou J, China CDC Weekly 2024。
  - 原文："In 2021, drowning and road traffic crashes were the top two causes of child injury deaths, explaining 31.1% and 27.9% of total injury deaths, respectively."
- 未采用：中国疾控中心网页 chinacdc.cn/…/t20210809_233793.html 返回 404。

## 8. 老人防跌
- <https://doi.org/10.1002/14651858.CD012424.pub2> — Wiley 403；Europe PMC 记录确认：Sherrington C, 2019。
  - 原文："Exercise reduces the rate of falls by 23% (rate ratio (RaR) 0.77, 95% confidence interval (CI) 0.71 to 0.83"；"reduces the number of people experiencing one or more falls by 15% (risk ratio (RR) 0.85, 95% CI 0.81 to 0.89"
  - 原文："We included 108 RCTs with 23,407 participants living in the community in 25 countries."
- <https://doi.org/10.1002/14651858.CD007146.pub3> — Europe PMC 记录确认：Gillespie LD, 2012。
  - 原文："Home safety assessment and modification interventions were effective in reducing rate of falls (RR 0.81, 95% CI 0.68 to 0.97; six trials; 4208 participants)"；"Tai Chi did significantly reduce risk of falling (RR 0.71, 95% CI 0.57 to 0.87…)"
- <https://doi.org/10.46234/ccdcw2021.013> — 解析到 weekly.chinacdc.cn；全文经 Europe PMC PMC8393086 读取。Lu Z, China CDC Weekly 2021。
  - 原文："Falls are the top cause for death from injuries in people aged 65 years and above"；"Home (55.97%), road/street (18.69%), and public residential institution (12.80%) were the sites where falls most often occurred"

## 9. 乙肝
- <https://doi.org/10.1371/journal.pmed.1001774> — PLOS 重定向后未取到正文；Europe PMC 记录确认：Qu C, PLoS Medicine 2014。
  - 原文："efficacies of 84% (95% CI 23%-97%)"（PLC 发病）；"catch-up vaccination on HBsAg seroprevalence in early adulthood was 21% (95% CI 10%-30%), substantially weaker than that of the neonatal vaccination (72%, 95% CI 68%-75%)"
- <https://doi.org/10.3201/eid2305.161477> — Europe PMC 记录确认：Cui F, Emerging Infectious Diseases 2017。
  - 原文："HBV surface antigen prevalence declined 46% by 2006 and by 52% by 2014"；5 岁以下 "the decline was 97%"

## 10. HPV 疫苗
- <https://doi.org/10.1056/NEJMoa1917338> — NEJM 403；Europe PMC 记录确认：Lei J, NEJM 2020。
  - 原文："the incidence rate ratio was 0.12 (95% CI, 0.00 to 0.34) among women who had been vaccinated before the age of 17 years and 0.47 (95% CI, 0.27 to 0.75) among women who had been vaccinated at the age of 17 to 30 years"
  - 原文："follow an open population of 1,672,983 girls and women who were 10 to 30 years of age from 2006 through 2017"

## 11. 宫颈癌筛查
- <https://doi.org/10.1056/NEJMoa0808516> — NEJM 403；Europe PMC 记录确认：Sankaranarayanan R, NEJM 2009。
  - 原文："hazard ratio for the detection of advanced cancer in the HPV-testing group, 0.47; 95% confidence interval [CI], 0.32 to 0.69"；"34 deaths from cancer in the HPV-testing group, as compared with 64 in the control group (hazard ratio, 0.52; 95% CI, 0.33 to 0.83)"

## 12. 结直肠癌筛查
- <https://doi.org/10.1002/14651858.CD001216.pub2> — Europe PMC 记录确认：Hewitson P, 2007。
  - 原文："a 16% reduction in the relative risk of colorectal cancer mortality (RR 0.84, CI: 0.78-0.90)"；"25% relative risk reduction (RR 0.75, CI: 0.66 - 0.84) for those attending at least one round of screening"
- <https://doi.org/10.1056/NEJMoa2208375> — Europe PMC 记录确认：Bretthauer M, NEJM 2022。
  - 原文："the risk of colorectal cancer at 10 years was 0.98% in the invited group and 1.20% in the usual-care group, a risk reduction of 18% (risk ratio, 0.82; 95% confidence interval [CI], 0.70 to 0.93)"；"The risk of death from colorectal cancer was 0.28% in the invited group and 0.31% in the usual-care group (risk ratio, 0.90; 95% CI, 0.64 to 1.16)"

## 13. 流感疫苗
- <https://doi.org/10.1161/CIRCULATIONAHA.121.057042> — AHA 403；Europe PMC 记录确认：Fröbert O, Circulation 2021 (IAMI)。
  - 原文："Rates of all-cause death were 2.9% and 4.9% (hazard ratio, 0.59 [95% CI, 0.39-0.89]; P=0.010)"；"rates of cardiovascular death were 2.7% and 4.5%, (hazard ratio, 0.59 [95% CI, 0.39-0.90]"
  - 原文："2571 participants were randomized at 30 centers across 8 countries"；"Over the 12-month follow-up, the primary outcome occurred in…"
- <https://doi.org/10.1001/jamanetworkopen.2022.8873> — JAMA 页面直接打开成功。Behrouzi B, JAMA Network Open 2022。
  - 原文："influenza vaccine was associated with a lower risk of composite cardiovascular events (3.6% vs 5.4%; RR, 0.66; 95% CI, 0.53-0.83"；"1.7% of vaccine recipients died of cardiovascular causes compared with 2.5% of placebo or control recipients (RR, 0.74; 95% CI, 0.42-1.30"
- <https://doi.org/10.1002/14651858.CD004876.pub4> — Europe PMC 记录确认：Demicheli V, 2018。
  - 原文："may experience less influenza over a single season compared with placebo, from 6% to 2.4%"（low-certainty）；"very low-certainty evidence for the effect on mortality"

## 14. 幽门螺杆菌
- <https://doi.org/10.1136/bmj.l5016> — BMJ 403；Europe PMC 记录确认：Li WQ, BMJ 2019。
  - 原文："A protective effect of H pylori treatment on gastric cancer incidence persisted 22 years post-intervention (odds ratio 0.48, 95% confidence interval 0.32 to 0.71)"；"fully adjusted hazard ratio for H pylori treatment was 0.62 (95% confidence interval 0.39 to 0.99)"

## 15. 低剂量 CT
- <https://doi.org/10.1056/NEJMoa1102873> — NEJM 403；Europe PMC 记录确认（PMID 21714641），并在 <https://pmc.ncbi.nlm.nih.gov/articles/PMC4356534/> 打开全文摘要。
  - 原文："53,454 persons at high risk for lung cancer at 33 U.S. medical centers"；"24.2% with low-dose CT and 6.9% with radiography over all three rounds"；"96.4% of the positive screening results in the low-dose CT group … were false positive results"；"20.0% (95% CI, 6.8 to 26.7; P = 0.004)"；"6.7% (95% CI, 1.2 to 13.6; P = 0.02)"
  - 入组标准（55–74 岁、≥30 包年、戒烟 ≤15 年）在 Europe PMC 摘要中确认。

## 16. 心理危机
- <https://doi.org/10.1016/S2215-0366(16)30030-X> — Elsevier 页面只显示 Redirecting；Europe PMC 记录确认：Zalsman G, Lancet Psychiatry 2016。
  - 原文："Evidence for restricting access to lethal means in prevention of suicide has strengthened since 2005"；"overall decrease of 43% since 2005"（镇痛药管控）；"hot-spots for suicide by jumping (reduction of 86% since 2005, 79% to 91%)"；"School-based awareness programmes have been shown to reduce suicide attempts (odds ratio [OR] 0·45, 95% CI 0·24-0·85"
- <https://www.gov.cn/zhengce/zhengceku/202412/content_6994470.htm> — 已打开。标题「国家卫生健康委关于应用"12356"全国统一心理援助热线电话号码的通知」，国卫医政函〔2024〕259 号，2024-12-06。
  - 原文："设置'12356'作为全国统一心理援助热线电话号码"；"每日提供不少于18小时心理援助服务"；"确保于2025年5月1日0时前，实现拨打'12356'电话号码接通心理援助热线的功能"
  - nhc.gov.cn 原始链接返回 412，改引国务院政策文件库的同一文件。

## 未确认 / 未采用
- NHTSA 网页 nhtsa.gov/risky-driving/seat-belts、car-seats-and-booster-seats：403，未确认，改用 crashstats 的官方 PDF。
- NFPA 烟雾报警器报告：未确认，未引用。
- WHO Global status report on road safety 2023 中国 country profile PDF：404，未确认；中国道路死亡改用 GHO API。
- WHO 溺水 fact sheet（已打开，2026-05-01 版）：无中国数字，未引用；"around 300 000 annual drowning deaths worldwide" 未用到。
- 收益栏里的试验规模数字（Ettehad 123 项/613,815 人、Sherrington 108 项/23,407 人、Lei 1,672,983 人、IAMI 2571 人）已在第二轮 Europe PMC 抓取中逐字核对，见各条原文。
- 成本栏的价格（头盔、报警器、疫苗、检查费等）是作者按市价的粗估，不属于引用数字，未核实。
