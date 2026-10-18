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

