# Adsterra runbook — enshroudedbuilder.com

Adsterra site **6132818** (domain enshroudedbuilder.com, category `Other`, adult ads off).
Units: **Native Banner** placement `31801393` / key `64a94719d402cdba4d7c834a89e3fb5f`,
**Social Bar** placement `31801394` / key `5a77bc2e5f3af96ef430fc0256726017`.

## 1. Where the configuration lives

| What | File | Notes |
| --- | --- | --- |
| Real keys, switches, consent gate | `public/assets/ads-config.json` | The only file with real Adsterra values. No zone, key or invoke URL is hardcoded in HTML. |
| Loader / public API | `public/assets/ads.js` | `window.__ADS`, lazy native load via IntersectionObserver, social throttle, banner overlap. |
| Container, holder, script tag | `src/layouts/Base.astro` | Native container `container-64a94719d402cdba4d7c834a89e3fb5f`, holder `#ads-social-holder`, `<script src="/assets/ads.js?v=20261018-1">`. |
| Consent wiring | `src/layouts/Base.astro` inline script | Mirrors the choice into `dh-ga-consent` and calls `window.notifyConsentChange()`. |
| Disclosure | `src/pages/privacy.astro` | Advertising section names Adsterra and the category blocks. |

`{adsDir}` is `assets` for this site (Cloudflare Pages default), served from `public/assets/` and deployed by the Astro build.

## 2. Zone and units (fill here, never in HTML)

| Unit | placement id | placementKey | invoke.js |
| --- | --- | --- | --- |
| Native Banner | 31801393 | `64a94719d402cdba4d7c834a89e3fb5f` | `https://pl31901892.profitableratecpmnetwork.com/64a94719d402cdba4d7c834a89e3fb5f/invoke.js` |
| Social Bar | 31801394 | `5a77bc2e5f3af96ef430fc0256726017` | `https://pl31901893.profitableratecpmnetwork.com/5a/77/bc/5a77bc2e5f3af96ef430fc0256726017.js` |

Container ids are derived: `container-<nativeKey>` from the API, `container-<socialKey>` synthesised because the API does not return one for Social Bar.

`GET /api/sites?domain_search=enshroudedbuilder.com` is the authoritative source for the siteId
(the id returned by the create POST is only a queue number).

## 3. Switches

| Switch | File key | Value now | Effect |
| --- | --- | --- | --- |
| Master | `enabled` | `true` | `false` = zero ad requests, everywhere. |
| Native | `native.rows` / `native.columns` | `1` / `1` | Mobile-safe 1×1 unit; server-side template `##NATIVE_ROWS##`/`##NATIVE_COLUMNS##` also patched to 1. |
| Social Bar | `socialBar.interstitialEnabled` | `false` | Interstitials stay off. |
| Social Bar | `socialBar.throttleMs` | `60000` | At most one social load per visitor per minute. |
| Adult filter | `categories.adult` | `false` | Adult targeting always off. |
| Category blocks | `categories.blockedCategories` | `["adult","dating"]` | Blocked on the placement. |

## 4. Consent

- Gate key: `dh-ga-consent` (`allowed` / `denied`); missing means denied.
- The site's own banner (`#consent`) is the UI. On *Allow analytics* it writes both `eb-consent` and `dh-ga-consent`, then calls `window.notifyConsentChange()`, which loads the native unit and the social bar.
- Consent Mode v2 signals `ad_storage` / `ad_user_data` / `ad_personalization` follow the same click.
- A denied visitor makes **no** request to the Adsterra network: `ads.js` does not even fetch its own config, and no ad script is injected.
- Visitors who only ever granted analytics (before ads existed) are asked again, because the ad gate is a separate key.

## 5. Mobile

Native is a single 1×1 unit per page, placed after the page content and before the footer, so it never occupies the first screen. The Social Bar sits in `#ads-social-holder` (`fixed bottom`, `z-50`).

## 6. Overlap with the consent banner

`avoidOverlap()` measures the banner's `offsetHeight + 12` and lifts the holder, listening to `resize` and a `MutationObserver` on the banner's `hidden` / `style` / `class` attributes.

## 7. Manager wording (paste as-is)

中文：

> ① 插页（Interstitial）请直接关闭，如需保留则 ≤1/min 且默认关；② 剔除 dating/adult；③ 移动端 Native 1×1；④ Adult 选项常闭。

English:

> Please turn interstitials off; if they must stay, cap them at one per minute and keep them off by default. Exclude the dating and adult categories. Keep the mobile Native unit at 1×1. Leave adult ads disabled.

## 8. Verification

```bash
bash scripts/verify-site-build.sh 2>&1 | tail -n 20      # 0 failed 即过
bash scripts/verify-ads.sh 2>&1 | tail -n 20             # 8 项广告原子校验
curl -s -A "Mozilla/5.0" "https://enshroudedbuilder.com/assets/ads-config.json?v=20261018-1" | grep -c invoke.js
shasum -a 256 assets/ads.js | cut -c1-12
curl -s -A "Mozilla/5.0" "https://enshroudedbuilder.com/assets/ads.js?v=20261018-1" | shasum -a 256 | cut -c1-12
curl -s -A "Mozilla/5.0" https://enshroudedbuilder.com/ | grep -c "container-64a94719d402cdba4d7c834a89e3fb5f"
```

Browser E2E (two states, both required): denied → `window.__ADS.shouldShow() === false`, 0 ad scripts, banner visible; after *Allow analytics* → native + social scripts injected, `#container-64a94719d402cdba4d7c834a89e3fb5f` gets its children, 0 JS errors.

## 9. GSC note

AdSense/Adsterra scripts do not change indexability, but keep an eye on 体验 → 核心网页指标 for the pages that host the native unit. If the unit hurts LCP on mobile, move the container below the fold or keep it lazy-loaded (it already loads only within 300px of the viewport).

## 10. Rollback

```js
window.__ADS.setConfig({ enabled: false }); window.__ADS.unloadSocialBar();
```

Or set `enabled: false` in `public/assets/ads-config.json`, bump `?v=` in **both** `src/layouts/Base.astro` and the `CONFIG_URL` inside `assets/ads.js`, then deploy. Cloudflare Pages caches static assets for 4h, so the `?v=` bump is what busts it.


## 11. 内容站广告建议对齐（2026-10-19 整改）

对照社群里的静态资讯站广告建议逐条核过，整改后状态如下。

| 规则 | 状态 | 证据 |
| --- | --- | --- |
| 禁用 Popunder / Interstitial / Direct Link | 遵守 | 只建了 Native(49) + Social(29) 两个 unit，站点 `ad_units [29,49]`，没有其余格式 |
| Social Bar 关掉插页 | 待经理确认 | 配置 `interstitialEnabled:false`；Adsterra 后台该项需要经理/后台关掉 |
| Native 强制 1×1 | 遵守 | `PATCH /api/placement/31801393/template` → 200，`template_values` ROWS=1 COLUMNS=1 |
| 单页 ≤3 个广告位 | 遵守 | 每页 1 个 |
| 404 / 搜索 / 分页 2 页以后 0 位 | 遵守 | 404 用 `ads={false}`；实测请求不存在的路径 → 404 页 slots=0 |
| 首屏不放 | 遵守 | 首页广告在第 3 张卡之后；文章页在正文约 30% |
| 列表页第 3～5 条之间 | 遵守 | 首页与 `/builds/` 都在第 3 张卡之后 |
| 文章页正文约 1/3 处 | 遵守 | build 页放在核心技能表之后、技能顺序之前（HTML 30%） |
| 容器预留固定高度 | 遵守 | `.ad-slot{min-height:100px}`，手机 90px；E2E 里 slot 高度加载前后都是 100 |
| 不给广告位懒加载 | 遵守 | 已移除 IntersectionObserver；E2E 允许后不滚动即 `nativeScripts 1` |
| `data-cfasync="false"` | 遵守 | `makeScript()` 统一设置 |
| 一个 unit 一个位置 | 遵守 | 每页只出现一次；同一 unit 在各页同一相对位置复用 |
| Social 脚本在 `</body>` 前 | 遵守 | 注入到 `document.body` 末尾，每页一次 |
| Banner 标准尺寸（728×90 / 300×250 / 320×50 / 160×600） | 未接 | 目前只有 Native + Social；要按矩阵上 Banner 需要新建 banner unit |
| 屏蔽约会/赌博/成人/假下载/假杀毒 | 待经理 | 配置里声明了 `adult`、`dating`；其余分类需要在 Adsterra 后台或找经理加 |

### 与 AdSense 的关系

站点刚上线，离 AdSense 的域龄、原创篇数、UV 门槛都还远。按建议把 Adsterra 当过渡：AdSense 通过后只留 Native 或整体撤掉，不要两套混跑。

### 上线后 14 天的迭代口径

1. 按 unit 分开看 RPM / CTR，两周后砍掉最差的，只留最好的两个。
2. Clarity 盯性能评分与 CLS；评分掉了先查广告位高度是否被改动。
3. GSC 与 Bing 盯收录（Bing 的 API 密钥当前失效，需要换新 key）。
4. 跳出率突然上涨，先怀疑广告插进了阅读节奏。
