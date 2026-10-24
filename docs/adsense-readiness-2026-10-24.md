# AdSense 就绪度审计 — enshroudedbuilder.com

- 审计日期：2026-10-24
- 审计类型：申请前（pre-application），并评估从 Adsterra 切换到 AdSense
- 依据：Google AdSense Help 与 Google Publisher Policies（`adsense-site-auditor` 技能清单快照 2026-06-16，共 73 条要求 ID）
- 审计对象：线上 https://enshroudedbuilder.com（16 个已上线 URL）；本地已有 6 个法语页待部署

## 结论

**Ready after fixes（修完可申请）**

内容质量、原创性、站点结构、抓取可达性、隐私页、免责声明这几项实际做得比多数新站好。真正卡住的是三件事：广告网络（Adsterra Social Bar 的弹层/跳转风险）、隐私政策里没有 Google 广告的披露、以及 EEA 流量缺 Google 认证 CMP。这三项都属于"申请前必须处理"，但都是配置和文案工作，不是内容返工。

## Blockers

- `ADS-UX-04`：站内当前挂着 Adsterra Social Bar（`pl31901893.profitableratecpmnetwork.com`，同意后立即注入，`#ads-social-holder` 固定底部浮层）。该单元会在点击时打开新标签/浮层，YouTube 视频下已有法国观众公开留言「Je clique dessus et virus ... signaler directement」。这同时命中"不得意外跳转/弹窗"和"不得含恶意行为"两条。**修复：申请前彻底移除 Adsterra（至少先关 Social Bar 只留 Native），AdSense 通过后再考虑是否加回其他网络。**
- `ADS-PRIV-01`：`/privacy/` 披露了 Cloudflare、Google Fonts、GA4、Clarity、Adsterra 与 Cookie，但**完全没有提到 Google 广告（AdSense）及其 Cookie/标识符**。**修复：加入 Google 作为第三方广告供应商的披露、DoubleClick/Google Cookie 说明，并链接 Google《合作伙伴网站使用数据的方式》。**
- `ADS-ELIG-03`：取决于上面两条与下述 G/H 段，内容本身无违规。

## High Risks

- `ADS-PRIV-04`：EEA/英国流量需要 Google 认证 CMP。当前是自建同意横幅 + Consent Mode v2，**不是认证 CMP**。法国是本站第 5 大展现来源（28 天 130 次展现），不能忽略。**修复：接入 Funding Choices（AdSense 内置）或其他 Google 认证 CMP，再对 EEA 投放。**
- `ADS-TXT-01`：`/ads.txt` 返回 404。拿到 publisher ID 后必须发布 `google.com, pub-XXXX, DIRECT, f08c47fec0942fa0`。
- `ADS-CONTENT-05`：`/builds/`（344 词）、`/builder/`（346 词）、`/contact/`（78 词）这类低正文页也挂了广告单元。单页只有一个 Native 单元，风险中等，但建议 AdSense 上线时只在高正文页（build 页 1801–2148 词、`/skills/` 4972 词）展示。
- `ADS-UX-05`：`/contact/` 只指向 GitHub Issues，没有邮箱。信任信号偏弱，建议补一个 `contact@` 邮箱。

## 已通过的关键项（摘）

- 内容原创：8 篇 build 指南正文 1800–2150 词，`/skills/` 4972 词，技能顺序由游戏数据脚本生成并做点数预算校验，插图为自制 AI 图并已声明（`/about/`）。
- 归属与授权：`/about/` 明确写出 GPL-3.0 数据来源、CC BY-SA 4.0 wiki 来源、AI 插图声明、非官方粉丝站免责声明。
- 抓取：`robots.txt` 为 `Allow: /`，未屏蔽 Mediapartners-Google；16 个 URL 全部 200；http→https 301、www→apex 301、无尾斜杠 308 到带斜杠；sitemap 收录 16 个 URL。
- 站点已被 Google 收录并有真实点击（GSC 10/17–10/22：160 次点击 / 3556 次展现）。
- 同意门禁真实生效：未同意前不向 Adsterra 发出任何请求，`ads.js` 连自身配置都不拉取。
- 无登录墙、无 POST 依赖、无成人/赌博/武器等受限内容。

## 完整清单（73 项）

| ID | 状态 | 证据 | 下一步 |
| --- | --- | --- | --- |
| ADS-ELIG-01 | Unknown | 需确认申请人年龄与账号主体 | 申请前确认 |
| ADS-ELIG-02 | Unknown | 需确认是否已有 AdSense 账号 | 有则用现有账号添加站点 |
| ADS-ELIG-03 | Fail | 当前挂 Adsterra Social Bar，且隐私政策缺 Google 广告披露 | 见 Blockers |
| ADS-ELIG-04 | N/A | 自建静态站，非 Blogger/YouTube 托管产品 | — |
| ADS-OWN-01 | Pass | 拥有域名与仓库，`<head>` 由 `src/layouts/Base.astro` 注入 | — |
| ADS-OWN-02 | Pass | 域名与 GitHub 仓库均为本人所有 | — |
| ADS-OWN-03 | Pass | 纯静态站，JS 正常渲染，head/body 结构完整 | — |
| ADS-SITE-01 | Fail | 站点尚未加入 AdSense 站点列表 | 申请时添加并验证 |
| ADS-SITE-02 | Pass | 可通过 ad code 或 meta 标签验证（可改 Base.astro） | 选一种验证方式 |
| ADS-TXT-01 | Fail | `/ads.txt` 404 | 拿到 pub ID 后发布 |
| ADS-TXT-02 | Fail | 同上 | 同上 |
| ADS-CONTENT-01 | Pass | 8 篇 1800–2150 词原创 build 指南 + 4972 词技能库，技能顺序由数据脚本生成 | — |
| ADS-CONTENT-02 | Pass | 数据来源在 `/about/` 标注（GPL-3.0 导出、CC BY-SA wiki），插图为自制 | — |
| ADS-CONTENT-03 | Fail | `/builds/` 344 词、`/builder/` 346 词、`/contact/` 78 词 | 低正文页不放广告或补正文 |
| ADS-CONTENT-04 | Pass | 无 under construction / lorem ipsum，16 页全部可用 | — |
| ADS-CONTENT-05 | Fail | 低正文页也挂了 1 个 Native 单元 | 只在高正文页展示 |
| ADS-CONTENT-06 | Pass | 主语言英语，法语页为真实内容（6 页待部署） | 部署法语页后复核 |
| ADS-CONTENT-07 | N/A | 站内无评论区、无 UGC | — |
| ADS-CONTENT-08 | Pass | 标题/H1 各不相同，无门页模式 | — |
| ADS-UX-01 | Pass | 桌面/移动导航可用，移动端为 details 菜单 | — |
| ADS-UX-02 | Pass | 首页→builds→单篇 面包屑完整 | — |
| ADS-UX-03 | Pass | 无假下载按钮、无假播放按钮、无空链接跳转 | — |
| ADS-UX-04 | Fail | Adsterra Social Bar 浮层可开新标签，观众已投诉"病毒" | 移除 Adsterra |
| ADS-UX-05 | Fail | About/Privacy 齐全，Contact 仅 GitHub Issues 无邮箱 | 补邮箱 |
| ADS-UX-06 | Fail | 单页仅 1 个广告单元，但低正文页也展示 | 按正文量控制 |
| ADS-CRAWL-01 | Pass | 16 个 URL 全部 200，响应 1.3–2.4s | — |
| ADS-CRAWL-02 | Pass | `robots.txt` 为 `Allow: /`，无 WAF/登录墙 | — |
| ADS-CRAWL-03 | Pass | 无 POST 依赖页面 | — |
| ADS-CRAWL-04 | Pass | 仅 http→https、www→apex 301 与尾斜杠 308 | — |
| ADS-CRAWL-05 | Pass | URL 稳定语义化，canonical 齐全，无 session ID | — |
| ADS-CRAWL-06 | Pass | Cloudflare Pages，DNS/TLS 正常 | — |
| ADS-CRAWL-07 | Pass | sitemap 16 个 URL，内链完整 | 部署法语页后更新 sitemap |
| ADS-PROG-01 | Unknown | 需业主确认从未自点广告 | 明确禁止自点 |
| ADS-PROG-02 | Pass | 站内无"支持我们请点广告"类文案 | — |
| ADS-PROG-03 | Pass | 广告位有 `ad-slot` 容器，未伪装成内容 | AdSense 上线后加中性 ad 标签 |
| ADS-PROG-04 | Pass | 流量来自 Google 自然搜索、ChatGPT、YouTube 真实推荐 | — |
| ADS-PROG-05 | Pass | 目前无 Google 广告代码 | 上线后不改代码 |
| ADS-PROG-06 | Pass | 无弹窗/工具栏/邮件内广告 | — |
| ADS-PROG-07 | N/A | 非 App/WebView | — |
| ADS-PUB-01 | Pass | 游戏攻略站，无违法内容 | — |
| ADS-PUB-02 | Pass | 非官方粉丝站，`/about/` 声明商标归属 Keen Games，插图为自制非官方素材 | 保持免责声明可见 |
| ADS-PUB-03 | Pass | 无仇恨/歧视/暴力宣扬 | — |
| ADS-PUB-04 | Pass | 无动物虐待内容 | — |
| ADS-PUB-05 | Pass | `/about/` 与页脚均写明非官方身份 | — |
| ADS-PUB-06 | Pass | 无钓鱼、无个人信息收集、无虚假收益承诺 | — |
| ADS-PUB-07 | Pass | 无外挂/破解/作弊内容 | — |
| ADS-PUB-08 | Pass | 无成人内容，Adsterra 已关 adult/dating | — |
| ADS-PUB-09 | Unknown | 站点身份信息需在 AdSense 账号内如实填写 | 申请时填准确 |
| ADS-PUB-10 | Fail | Social Bar 固定底部浮层，可能遮挡内容 | 移除后自动解决 |
| ADS-PUB-11 | Fail | 低正文页（contact 78 词）展示广告 | 低正文页不放广告 |
| ADS-PUB-12 | Pass | 无背景页、无离屏投放 | — |
| ADS-PUB-13 | N/A | 无新闻/健康/政治/气候内容 | — |
| ADS-PUB-14 | N/A | 无政治/公共议题类合成媒体 | — |
| ADS-PUB-15 | N/A | 无未成年人相关风险内容 | — |
| ADS-PUB-16 | N/A | 无危机事件相关内容 | — |
| ADS-REST-01 | Pass | 无性内容 | — |
| ADS-REST-02 | Pass | 游戏攻略文字，无血腥图像 | — |
| ADS-REST-03 | Pass | 无枪械/爆炸物内容（游戏内武器属游戏设定） | — |
| ADS-REST-04 | Pass | 无烟草/毒品内容 | — |
| ADS-REST-05 | Pass | 无酒类销售 | — |
| ADS-REST-06 | Pass | 无赌博内容 | — |
| ADS-REST-07 | Pass | 无药品/保健品 | — |
| ADS-REST-08 | Fail | Social Bar 浮层属遮挡风险 | 移除 Adsterra |
| ADS-PRIV-01 | Fail | 隐私页未披露 Google 广告数据收集 | 补 Google 广告披露 |
| ADS-PRIV-02 | Fail | 未说明第三方广告 Cookie/Web Beacon（Google 侧） | 同上 |
| ADS-PRIV-03 | Pass | 无 PII 传入广告请求，无用户身份识别 | — |
| ADS-PRIV-04 | Fail | 自建横幅非 Google 认证 CMP | 接 Funding Choices |
| ADS-PRIV-05 | N/A | 不收集精确位置 | — |
| ADS-PRIV-06 | N/A | 非儿童向内容 | — |
| ADS-PRIV-07 | Pass | 无自建代理/拦截 Google 域 Cookie 的代码 | — |
| ADS-PRIV-08 | Pass | 未基于敏感信息建受众 | — |
| ADS-PRIV-09 | N/A | 无住房/就业/信贷类广告 | — |
| ADS-PRIV-10 | Fail | 个性化广告缺少 CMP 与披露配合 | 随 ADS-PRIV-04 一起修 |

**完整性检查**
- 参考清单 ID 数：73
- 本报告 ID 数：73
- 缺失：无

## 整改记录（2026-10-24 晚）

已按本报告执行，站点进入"零广告待审核"状态：

| 原 ID | 原状态 | 现状态 | 处置 |
| --- | --- | --- | --- |
| ADS-UX-04 | Fail | Pass | 删除 Adsterra 全部素材与加载器（`ads.js`、`ads-config.json`、`AdSlot.astro`），模板与 9 个页面的引用全部移除 |
| ADS-PUB-10 | Fail | Pass | Social Bar 浮层随广告一并移除 |
| ADS-PUB-11 | Fail | Pass | 所有页面不再展示广告 |
| ADS-CONTENT-05 | Fail | Pass | 同上 |
| ADS-UX-06 | Fail | Pass | 同上 |
| ADS-REST-08 | Fail | Pass | 同上 |
| ADS-PRIV-01 | Fail | Pass | `/privacy/` 新增 Google AdSense 披露、第三方供应商 Cookie 说明、Ads Settings 与 aboutads.info 退出链接、partner-sites 链接 |
| ADS-PRIV-02 | Fail | Pass | 同上 |
| ADS-ELIG-03 | Fail | Pass | 站内已无第三方广告网络 |

仍然开放、且**只能在拿到 publisher ID 之后处理**：

- `ADS-TXT-01` / `ADS-TXT-02`：发布 `ads.txt`（需 `pub-XXXX`）
- `ADS-PRIV-04` / `ADS-PRIV-10`：接入 Funding Choices（EEA/UK/CH 认证 CMP）
- `ADS-SITE-01`：在 AdSense 后台添加站点并验证所有权
- `ADS-ELIG-01` / `ADS-ELIG-02` / `ADS-PROG-01` / `ADS-PUB-09`：需账号主体确认

门禁：`bash scripts/verify-site-build.sh` → 16 passed, 0 failed（断言广告素材与引用彻底不存在 + 隐私披露齐全）。
