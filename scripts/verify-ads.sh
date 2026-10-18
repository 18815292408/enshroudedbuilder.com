#!/bin/bash
# verify-ads.sh — 8项广告原子校验（被 verify-site-build.sh 包装汇总）
# 用法: bash scripts/verify-ads.sh 2>&1 | tail -n 20
# 门禁: 0 failed 即过，不硬编码 passed 数量（项数随站点配置）
# Astro 站点：静态资源源目录 public/{adsDir}，URL 为 /{adsDir}/
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ADS_DIR="${ADS_DIR:-assets}"
if [ -d "$ROOT/public/$ADS_DIR" ]; then SRC_DIR="$ROOT/public/$ADS_DIR"; else SRC_DIR="$ROOT/$ADS_DIR"; fi
CONFIG="$SRC_DIR/ads-config.json"
ADS_JS="$SRC_DIR/ads.js"
LAYOUT="$ROOT/src/layouts/Base.astro"
SLOT="$ROOT/src/components/AdSlot.astro"
FAILED=0
PASSED=0
pass(){ echo "PASS: $1"; PASSED=$((PASSED+1)); }
fail(){ echo "FAIL: $1"; FAILED=$((FAILED+1)); }

echo "== verify-ads.sh: 8项广告校验 =="
echo "ADS_DIR=$ADS_DIR SRC_DIR=$SRC_DIR"
echo ""

# 1. native 计数
if [ -f "$CONFIG" ] && grep -q '"native"' "$CONFIG" && grep -q 'class="ad-slot ads-native"' "$SLOT"; then
  pass "native 计数：config 含 native 且 AdSlot 组件含预留高度的容器"
else
  fail "native 计数：config 或 AdSlot 容器缺失"
fi

# 2. social 计数
if [ -f "$CONFIG" ] && grep -q '"socialBar"' "$CONFIG" && grep -q 'id="ads-social-holder"' "$LAYOUT"; then
  pass "social 计数：config 含 socialBar 且模板层含 #ads-social-holder 单例"
else
  fail "social 计数：config 或 holder 缺失"
fi

# 3. 硬编码零命中（invoke/zone 域名；隐私页对合作方的点名披露不算硬编码）
HARD=$(grep -rnE 'profitableratecpm|pl3[0-9]{6,}|invoke\.js' "$ROOT/src" 2>/dev/null || true)
if [ -n "$HARD" ]; then
  fail "hardcode：模板层含真实广告 zone 或 invoke（应仅进 ads-config.json）"
else
  pass "hardcode：模板层零命中（真实值仅存于 ads-config.json）"
fi
if grep -q 'adsterra' "$ROOT/src/pages/privacy.astro" 2>/dev/null; then
  pass "披露：隐私页点名广告合作方"
else
  fail "披露：隐私页未点名广告合作方"
fi

# 4. data-adsterra-social 仅在 JS
if grep -q 'data-adsterra-social' "$ADS_JS" 2>/dev/null; then pass "data-adsterra-social 仅在 JS：ads.js 命中"; else fail "data-adsterra-social 仅在 JS：ads.js 未命中"; fi
if grep -rq 'data-adsterra-social' "$ROOT/src" 2>/dev/null; then fail "data-adsterra-social 仅在 JS：模板层不应命中"; else pass "data-adsterra-social 仅在 JS：模板层零命中"; fi

# 5. config 安全
if [ -f "$CONFIG" ]; then
  if grep -q '"adult"[[:space:]]*:[[:space:]]*false' "$CONFIG"; then pass "config 安全：adult:false"; else fail "config 安全：adult:false 缺失"; fi
  if grep -q '"blockedCategories"' "$CONFIG" && grep -q '"dating"' "$CONFIG" && grep -q '"adult"' "$CONFIG"; then pass "config 安全：blockedCategories 含 adult/dating"; else fail "config 安全：blockedCategories 缺失"; fi
  if grep -q '"interstitialEnabled"[[:space:]]*:[[:space:]]*false' "$CONFIG"; then pass "config 安全：interstitialEnabled:false"; else fail "config 安全：interstitialEnabled 未关闭"; fi
  if grep -q '"rows"[[:space:]]*:[[:space:]]*1' "$CONFIG" && grep -q '"columns"[[:space:]]*:[[:space:]]*1' "$CONFIG"; then pass "config 安全：rows/columns=1（移动端 1x1）"; else fail "config 安全：rows/columns 非 1"; fi
else
  fail "config 安全：$CONFIG 不存在"
fi

# 6. avoidOverlap 存在
if grep -q 'avoidOverlap' "$ADS_JS" 2>/dev/null; then pass "avoidOverlap 存在：ads.js 含错位逻辑"; else fail "avoidOverlap 存在：ads.js 未找到 avoidOverlap"; fi

# 7. runbook 存在
if [ -f "$ROOT/docs/ads-adsterra-runbook.md" ]; then pass "runbook 存在：docs/ads-adsterra-runbook.md"; else fail "runbook 存在：未找到 runbook"; fi

# 8. 容器就绪：containerId 三处一致
CID="$(python3 -c "import json;print(json.load(open('$CONFIG'))['native']['containerId'])" 2>/dev/null)"
if [ -n "${CID:-}" ] && grep -q "$CID" "$ROOT/docs/ads-adsterra-runbook.md" && grep -q "$CID" "$SLOT"; then
  pass "容器就绪：containerId 在 config、AdSlot、runbook 三处一致"
else
  fail "容器就绪：containerId 三处不一致（CID=${CID:-none}）"
fi

# 9. 禁懒加载：广告脚本必须随页面 async 发出，不得用 IntersectionObserver 延迟
if grep -q 'IntersectionObserver' "$ADS_JS" 2>/dev/null; then
  fail "懒加载：ads.js 仍含 IntersectionObserver（广告位禁止懒加载/延迟加载）"
else
  pass "懒加载：ads.js 无 IntersectionObserver，脚本 async 随页面发出"
fi

# 10. 预留固定高度：CLS 保护
if grep -q '\.ad-slot' "$ROOT/src/styles/global.css" && grep -q 'min-height' "$ROOT/src/styles/global.css"; then
  pass "预留高度：.ad-slot 声明 min-height"
else
  fail "预留高度：global.css 缺少 .ad-slot 的 min-height"
fi

# 11. 404 等低质页不放广告位
if grep -q 'ads={false}' "$ROOT/src/pages/404.astro" && ! grep -q 'AdSlot' "$ROOT/src/pages/404.astro"; then
  pass "低质页：404 无广告位"
else
  fail "低质页：404 仍带广告位（或未显式关闭）"
fi

echo ""
echo "verify-ads: $PASSED passed, $FAILED failed — 0 failed 即过（项数随站点配置，不硬编码 73）"
if [ "$FAILED" -eq 0 ]; then echo "verify-ads: PASS"; else echo "verify-ads: FAIL"; fi
exit $FAILED
