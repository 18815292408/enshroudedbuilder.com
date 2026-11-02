#!/usr/bin/env bash
# 合并后部署（2026-11-02）：所有改动先走 zyseo/* 分支 + PR，「zyseo PR 审核合并」任务合并进 main 后
# 运行本脚本（站点配置 execution.post_merge_command）：拉最新 main → 构建 → 部署 → 上线确认，失败自动回滚。
set -uo pipefail
cd "$(dirname "$0")/.."
export PATH="$HOME/.local/node26/bin:$HOME/.local/bin:/opt/homebrew/bin:$PATH"
SITE=https://enshroudedbuilder.com
PNPM="npx -y pnpm@11.7.0"  # the mini's corepack pnpm is broken; pin the version this repo locks with
retry() { # retry <tries> <cmd...> with 15s, 30s, 60s backoff
  local n=$1; shift; local i=1 wait=15
  until "$@"; do
    [ $i -ge $n ] && return 1
    echo "RETRY $i/$n: $*"; sleep $wait; wait=$((wait * 2)); i=$((i + 1))
  done
}
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "DEPLOY BLOCKED: 工作区有未提交的改动，先处理再部署"; exit 3; fi
git checkout -q main && retry 3 git pull -q --ff-only origin main || { echo "DEPLOY FAILED: 拉不到最新 main"; exit 4; }
[ -d node_modules ] || retry 3 $PNPM install --frozen-lockfile >/dev/null 2>&1
if ! $PNPM run build > /tmp/enshroudedbuilder-build.log 2>&1; then
  echo "DEPLOY BLOCKED: main 上构建失败"; tail -25 /tmp/enshroudedbuilder-build.log; exit 3
fi
# 4. Deploy (git push does NOT deploy this site; wrangler must run) + verify live.
deploy() { npx wrangler pages deploy dist --project-name enshroudedbuilder --branch main --commit-dirty=true > /tmp/enshroudedbuilder-deploy.log 2>&1; }
if ! retry 3 deploy; then
  if grep -qiE "authentication|not logged in|token.*(expired|invalid)|login" /tmp/enshroudedbuilder-deploy.log; then
    echo "DEPLOY AUTH EXPIRED: Cloudflare login on the Mac mini needs to be renewed (code is merged; site unchanged)"
  else
    echo "DEPLOY FAILED after retries (code is merged; run scripts/hermes-deploy.sh again)"; tail -10 /tmp/enshroudedbuilder-deploy.log
  fi
  exit 5
fi
sleep 20
URLS="/ $(python3 -c 'import json,os;p=".hermes-pending-pages.json";print(" ".join(e["url"] for e in json.load(open(p))) if os.path.exists(p) else "")')"
BADLIVE=""
for u in $URLS; do
  CODE=000
  for i in 1 2 3; do
    CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE$u" -m 20 || true)
    [ "$CODE" = "200" ] && break; sleep 20
  done
  [ "$CODE" = "200" ] || BADLIVE="$BADLIVE $u=$CODE"
done
if [ -n "$BADLIVE" ]; then
  echo "LIVE CHECK FAILED:$BADLIVE — reverting this commit and redeploying the previous version"
  rm -f .hermes-pending-pages.json
  { if git rev-parse -q --verify HEAD^2 >/dev/null; then git revert --no-edit -m 1 HEAD -q; else git revert --no-edit HEAD -q; fi; } && $PNPM run build > /tmp/enshroudedbuilder-build.log 2>&1 && retry 3 deploy && echo "ROLLED BACK" || echo "ROLLBACK FAILED"
  retry 3 sh -c 'git pull -q --rebase origin main && git push -q origin main' || true
  exit 6
fi
python3 scripts/hermes-page-gate.py record
if ! git diff --quiet -- hermes/new-pages.json; then
  git add hermes/new-pages.json && git commit -q -m "Hermes: record new page date" && retry 3 sh -c 'git pull -q --rebase origin main && git push -q origin main' || true
fi
echo "PUBLISHED $(git rev-parse --short HEAD) · live=200 ·$URLS"
