#!/bin/bash
# verify-site-build.sh — 站点门禁（包装 verify-ads.sh + 静态基座校验）
# 用法: bash scripts/verify-site-build.sh 2>&1 | tail -n 30
# 门禁: 0 failed 即过，不硬编码 passed 数量
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
ADS_DIR="${ADS_DIR:-assets}"
if [ -d "$ROOT/public/$ADS_DIR" ]; then SRC_DIR="$ROOT/public/$ADS_DIR"; else SRC_DIR="$ROOT/$ADS_DIR"; fi
FAILED=0
PASSED=0
pass(){ echo "PASS: $1"; PASSED=$((PASSED+1)); }
fail(){ echo "FAIL: $1"; FAILED=$((FAILED+1)); }

echo "== verify-site-build.sh =="
echo ""

if node --check "$SRC_DIR/ads.js" >/dev/null 2>&1; then pass "ads.js 语法：node --check 通过"; else fail "ads.js 语法：node --check 失败"; fi
if python3 -m json.tool "$SRC_DIR/ads-config.json" >/dev/null 2>&1; then pass "ads-config.json：JSON 合法"; else fail "ads-config.json：JSON 非法"; fi

for k in enabled native socialBar categories placement consent adsterra; do
  if grep -q "\"$k\"" "$SRC_DIR/ads-config.json"; then pass "config 必填键：$k"; else fail "config 必填键：$k 缺失"; fi
done

HTML_V=$(grep -o 'ads\.js?v=[0-9A-Za-z._-]*' src/layouts/Base.astro | head -1 | cut -d= -f2)
JS_V=$(grep -o 'ads-config\.json?v=[0-9A-Za-z._-]*' "$SRC_DIR/ads.js" | head -1 | cut -d= -f2)
if [ -n "${HTML_V:-}" ] && [ "${HTML_V:-}" = "${JS_V:-}" ]; then pass "版本双处同步：?v=$HTML_V"; else fail "版本双处同步：HTML=${HTML_V:-none} JS=${JS_V:-none}"; fi

if grep -q 'class="ad-slot ads-native"' src/components/AdSlot.astro; then pass "native 容器：AdSlot 组件含容器"; else fail "native 容器：AdSlot 组件缺失"; fi
if grep -q 'ads && <div class="wrap"><AdSlot />' src/layouts/Base.astro; then pass "native 容器：Base 按页开关（404/文章页自行摆放）"; else fail "native 容器：Base 未按页开关"; fi
if [ "$(grep -c 'id="ads-social-holder"' src/layouts/Base.astro)" -eq 1 ]; then pass "social holder：全站单例 1 处"; else fail "social holder：应为 1 处"; fi
if grep -q 'dh-ga-consent' src/layouts/Base.astro; then pass "consent 门控：模板层写入 dh-ga-consent"; else fail "consent 门控：模板层未写入 dh-ga-consent"; fi
if grep -q 'ads-social-holder' "$SRC_DIR/ads.js" && grep -q 'shouldShow' "$SRC_DIR/ads.js"; then pass "脚本注入：ads.js 含 shouldShow 门控与 holder 处理"; else fail "脚本注入：ads.js 缺少门控或 holder 处理"; fi

if bash scripts/verify-ads.sh > /tmp/verify-ads.out 2>&1; then
  pass "verify-ads.sh：8 项广告校验 0 failed"
else
  fail "verify-ads.sh：存在 failed"
fi
tail -n 3 /tmp/verify-ads.out 2>/dev/null || true

echo ""
echo "verify-site-build: $PASSED passed, $FAILED failed — 0 failed 即过"
if [ "$FAILED" -eq 0 ]; then echo "verify-site-build: PASS"; else echo "verify-site-build: FAIL"; fi
exit $FAILED
