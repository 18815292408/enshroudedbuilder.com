#!/bin/bash
# verify-site-build.sh — 站点门禁
# 用法: bash scripts/verify-site-build.sh 2>&1 | tail -n 30
# 门禁: 0 failed 即过，不硬编码 passed 数量
#
# 2026-10-24: 站内广告（Adsterra）已全部撤下，等待 Google AdSense 审核。
# 本门禁断言「广告链路与广告素材完全不存在」，防止旧广告被误加回来，
# 同时校验 AdSense 申请前必须具备的隐私披露。
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
LAYOUT="src/layouts/Base.astro"
FAILED=0
PASSED=0
pass(){ echo "PASS: $1"; PASSED=$((PASSED+1)); }
fail(){ echo "FAIL: $1"; FAILED=$((FAILED+1)); }

echo "== verify-site-build.sh =="
echo ""

# 1. 广告素材文件必须已删除（不是禁用，是不存在）
if [ -e public/assets/ads.js ]; then fail "广告素材残留：public/assets/ads.js 仍存在"; else pass "广告素材已删除：ads.js"; fi
if [ -e public/assets/ads-config.json ]; then fail "广告素材残留：ads-config.json 仍存在"; else pass "广告素材已删除：ads-config.json"; fi
if [ -e src/components/AdSlot.astro ]; then fail "广告组件残留：AdSlot.astro 仍存在"; else pass "广告组件已删除：AdSlot.astro"; fi

# 2. 模板层不得引用任何广告资源
for needle in 'ads.js' 'ads-social-holder' 'AdSlot' 'ad-slot' 'profitableratecpmnetwork'; do
  if grep -q "$needle" "$LAYOUT"; then fail "模板层残留广告引用：$needle"; else pass "模板层无广告引用：$needle"; fi
done

# 3. 页面层不得再摆放广告组件或传 ads 开关
if grep -rq 'AdSlot\|ads={false}' src/pages 2>/dev/null; then fail "页面层残留 AdSlot / ads 开关"; else pass "页面层无广告组件"; fi

# 4. 站内不得再出现旧广告网络名称
if grep -rqi 'adsterra' src/ 2>/dev/null; then fail "源码残留 Adsterra 字样"; else pass "源码无 Adsterra 残留"; fi

# 5. 隐私政策必须含 Google 广告披露（AdSense 硬性要求）
for needle in 'Google AdSense' 'Third-party vendors, including Google' 'google.com/settings/ads' 'technologies/partner-sites'; do
  if grep -qF "$needle" src/pages/privacy.astro; then pass "隐私披露：$needle"; else fail "隐私披露缺失：$needle"; fi
done

# 5b. AdSense 接入：ads.txt 与 head 代码必须一致
if [ -f public/ads.txt ] && grep -q '^google.com, pub-9919512237426779, DIRECT, f08c47fec0942fa0$' public/ads.txt; then
  pass "ads.txt：google 授权行正确"
else
  fail "ads.txt：缺失或授权行不匹配"
fi
if grep -q 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js' "$LAYOUT"; then pass "AdSense 代码：已在 head 注入"; else fail "AdSense 代码：未注入"; fi
if grep -q 'ca-pub-9919512237426779' src/lib/site.ts; then pass "AdSense 代码：client id 来自 SITE"; else fail "AdSense 代码：client id 未集中配置"; fi

# 6. 同意横幅必须仍在（分析用途），且不得承诺不存在的广告
if grep -q 'id="consent"' "$LAYOUT"; then pass "同意横幅：仍在位"; else fail "同意横幅：缺失"; fi
if grep -q 'ad_storage: "denied"' "$LAYOUT"; then pass "Consent Mode：广告信号默认拒绝"; else fail "Consent Mode：缺少广告信号默认拒绝"; fi

echo ""
echo "verify-site-build: $PASSED passed, $FAILED failed — 0 failed 即过"
if [ "$FAILED" -eq 0 ]; then echo "verify-site-build: PASS"; else echo "verify-site-build: FAIL"; fi
exit $FAILED
