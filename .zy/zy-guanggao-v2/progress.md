# Zy ledger — plan: .zy/zy-guanggao-v2/progress.md

Task 1: complete (commits a709a47..a802403 — 2026-10-19)

- 托管：Cloudflare Pages（enshroudedbuilder.com）。部署为手动 `wrangler pages deploy dist --project-name enshroudedbuilder --branch main`；adsDir=assets → 源目录 public/assets/ → URL /assets/（skill 默认值，缓存 4h 用 ?v= 击穿）
- 网站：siteId **6132818**（以 `GET /api/sites?domain_search=enshroudedbuilder.com` 为准；创建 POST 返回的 id 只是流水号），category Other(3)，adult 关闭，ad_units [29,49]，站点 status 2（active）
- 单元 1：Native Banner placement 31801393 / key `64a94719d402cdba4d7c834a89e3fb5f` / container `container-64a94719d402cdba4d7c834a89e3fb5f` / invoke `pl31901892.profitableratecpmnetwork.com`
- 单元 2：Social Bar placement 31801394 / key `5a77bc2e5f3af96ef430fc0256726017` / container 合成 `container-5a77bc2e5f3af96ef430fc0256726017` / invoke `pl31901893.profitableratecpmnetwork.com`
- 移动端 1×1：`PATCH /api/placement/31801393/template` body 单层 `{"##NATIVE_ROWS##":"1","##NATIVE_COLUMNS##":"1"}` → 200，复核 `template_values` ROWS=1 COLUMNS=1
- 站内基座：public/assets/ads-config.json（真实值唯一入口）、public/assets/ads.js（window.__ADS + IntersectionObserver 懒加载 + 1/min 节流 + avoidOverlap）、模板层 1 容器 + 单例 holder + `<script ?v=20261018-1>`、docs/ads-adsterra-runbook.md
- 同意门控：`dh-ga-consent`；未同意时 shouldShow=false 且 0 广告请求（config 都不取）；站上原有横幅复用，旧访客仅有 eb-consent 时会再问一次
- 本地门禁：`bash scripts/verify-site-build.sh` → **15 passed, 0 failed**（内层 verify-ads.sh 13 passed, 0 failed）
- 线上校验：ads-config.json 200 / 893B 含 2 条 invoke；`assets/ads.js` 本地与线上 sha256 前 12 位 **76addfcb12c7 一致**；首页/内页/隐私页各 1 容器 + 1 holder + 1 脚本标签
- 双态 E2E：DENIED `{should:false, nativeScripts:0, socialScripts:0, bannerVisible:true, errs:0}`；ALLOW `{should:true, cfg:true, nativeScripts:1, nativeDur:969ms|864ms, socialScripts:1, holderHidden:false, errs:0}`（300–3000ms 区间内）
- 待 Adsterra 审批：两条单元 `active=3`，对照在跑的 deepseek-harness.io 6022813 为 `active=4`；故容器 `children 0` 暂无填充 —— 按 skill 口径「填充出图=加分项，不判失败」，审批通过后自动开始
- 回滚：`window.__ADS.setConfig({enabled:false}); window.__ADS.unloadSocialBar();` 或 config `enabled:false` + 双处 `?v=` 递增后部署
@@
 Task 1: complete (commits a709a47..a802403 — 2026-10-19)
@@
 - 待 Adsterra 审批：两条单元 `active=3`，对照在跑的 deepseek-harness.io 6022813 为 `active=4`；故容器 `children 0` 暂无填充 —— 按 skill 口径「填充出图=加分项，不判失败」，审批通过后自动开始
+
+Task 2: complete (commits a802403..75addb3 — 2026-10-19)
+
+- 触发：对照社群「静态资讯站广告建议」审计，发现 3 条硬规则未遵守 + 位置偏离矩阵
+- 整改 1 禁懒加载：ads.js 移除 IntersectionObserver，允许后脚本 async 随页面发出（E2E：不滚动即 nativeScripts 1，1122ms）
+- 整改 2 预留高度：`.ad-slot{min-height:100px}`（手机 90px），E2E 里 slot 高度加载前后都是 100px
+- 整改 3 404 无位：Base 增加 `ads` 开关，404 传 `ads={false}`；线上实测 404 页 slots=0
+- 整改 4 位置：新增 src/components/AdSlot.astro；build 页放核心技能之后（HTML 30%），首页与 /builds/ 放第 3 张卡之后；每页仍为 1 个 unit 实例
+- 整改 5 Social 脚本：注入到 document.body 末尾（原为 head）
+- 门禁扩展：verify-ads.sh 增加 9 禁懒加载 / 10 预留高度 / 11 404 无位；verify-site-build 16 passed 0 failed
+- 未接：Banner 标准尺寸（需新建 banner unit）、更多屏蔽类目与插页开关（需经理）


Task 3: complete (commits 6cff653..HEAD — 2026-10-19)

- 复核（T+约2h）：站点 status=2 Approved、2 Ad Units、has_pending_ad_unit=false；两条 placement 仍 active=3（在跑的 6022813 为 4）
- 统计页：切 Today（2026/10/19）按 DOMAIN 分组 = No data（当日统计未落库）；10/14–18 全站 173 展示 / 13 点击 / $4.72 属既有站点，余额 $19.03
- 本机复测：代理拦广告域（TLS tlsv1 alert / resource status 0 / 0 bytes / fetch Failed）；直连 + Referer + 移动 UA → 200 / 51983 字节；block_anonym_ip=true 使 VPN 出口不投素材
- skill zy-guanggao 升 2.3.0：Stage 1 增复核时点（T+15min 基线 → T+2h → T+24h 期望 active=4 且有曝光 → T+48h 找经理），Stage 5 增「注入≠加载」与代理假阴性判定，Pitfalls 增审批误判
- 下一步：T+24h 复核当日 impressions；本机要验证填充需手机蜂窝网络或给广告域加 DIRECT 规则


Task 4: complete (2026-10-24) — 全部广告撤下，转 AdSense 申请

- 触发：YouTube 引流视频下出现公开指控「点进去是病毒」（@Solaei08），本地复现确认 Social Bar 脚本同意后即注入；同时决定改走 AdSense
- 撤销范围：删除 `public/assets/ads.js`、`public/assets/ads-config.json`、`src/components/AdSlot.astro`、`scripts/verify-ads.sh`；Base 移除 AdSlot 渲染、`ads` 开关、`#ads-social-holder`、`ads.js` 脚本标签；9 个页面移除 `<AdSlot />` 与 `ads={false}`；global.css 移除 `.ad-slot` 预留高度规则
- 同意横幅：文案去掉「ad partner」，`apply()` 不再写 `dh-ga-consent`，Consent Mode 广告信号固定 denied（审核期间无广告网络）
- 隐私政策：Advertising 章节改写为 Google AdSense 披露（第三方供应商 Cookie、Google 广告 Cookie 说明、Ads Settings 与 aboutads.info 退出链接、partner-sites 数据说明）
- 门禁重写：`scripts/verify-site-build.sh` 由「广告基座校验」改为「广告必须不存在 + AdSense 隐私披露校验」→ **16 passed, 0 failed**
- 线上验收：dist 内 0 处 `ads.js`/`ad-slot`/`profitableratecpmnetwork`/`Adsterra`；23 页全部 200
- 待办（只能拿到 publisher ID 后做）：`ads.txt`、Funding Choices（EEA 认证 CMP）、AdSense 代码注入 `<head>`

Task 5: complete (2026-10-24 21:31) — 接入既有 AdSense 账号并提交审核

- 发现：ego 里登录的 Google 账号（thefreem7@gmail.com）**已有 AdSense 账号** `pub-9919512237426779`，账号内已有 gptlives.com；故非新申请
- AdSense 后台：网站 → 新增网站 enshroudedbuilder.com → 代码段验证所有权（通过）→ 申请审核（已提交，状态「正在准备」，2026-10-24 21:31）
- 站点侧：`SITE.adsenseClient = "ca-pub-9919512237426779"`；Base `<head>` 注入 adsbygoogle.js；`public/ads.txt` 发布 google 授权行
- 门禁：verify-site-build.sh 扩到 **19 passed, 0 failed**（新增 ads.txt 行、head 标签、client id 单一来源三项）
- 未完成（需业主本人）：后台「收款」步骤仍空 —— 银行账户与税务信息；Ads.txt 状态仍「未找到」，待 Google 重新抓取
