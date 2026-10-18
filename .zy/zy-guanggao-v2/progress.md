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

