#!/usr/bin/env bash
# Safe publish for the Hermes agent: only data/page edits, must pass the build, the site gate and the
# new-page gate, then commit, push, deploy to Cloudflare Pages and verify live.
# Retries transient failures by itself; reverts the commit and redeploys on a failed live check.
# Usage: scripts/hermes-publish.sh "Hermes: <one line>"
set -uo pipefail
cd "$(dirname "$0")/.."
export PATH="$HOME/.local/node26/bin:$HOME/.local/bin:/opt/homebrew/bin:$PATH"
MSG="${1:-Hermes: game update}"
SITE=https://enshroudedbuilder.com
PNPM="npx -y pnpm@11.7.0"  # the mini's corepack pnpm is broken; pin the version this repo locks with
ALLOWED='^(src/data/|src/pages/|vendor/enshrouded-skill-tree/|drafts/|HERMES-LOG\.md$|src/lib/site\.ts$)'

retry() { # retry <tries> <cmd...> with 15s, 30s, 60s backoff
  local n=$1; shift; local i=1 wait=15
  until "$@"; do
    [ $i -ge $n ] && return 1
    echo "RETRY $i/$n: $*"; sleep $wait; wait=$((wait * 2)); i=$((i + 1))
  done
}
changed() { git status --porcelain --untracked-files=all | sed -E 's/^.. //; s/^"(.*)"$/\1/'; }

# 1. Only allowed paths may change. In src/lib/site.ts only lastVerified / gameVersion / source labels.
CHANGED=$(changed)
if [ -z "$CHANGED" ]; then echo "PUBLISH: nothing to publish"; exit 0; fi
BAD=$(echo "$CHANGED" | grep -vE "$ALLOWED" || true)
if git diff --quiet -- src/lib/site.ts 2>/dev/null; then :; else
  if git diff -U0 -- src/lib/site.ts | grep -E '^[+-] ' | grep -vqE '^[+-] +(lastVerified|gameVersion):|^[+-] +[a-zA-Z]+: \{ label:'; then
    BAD=$(printf '%s\nsrc/lib/site.ts' "$BAD")
  fi
fi
BAD=$(echo "$BAD" | sed '/^$/d')
if [ -n "$BAD" ]; then
  echo "PUBLISH BLOCKED: edits outside allowed paths (reverting them, keeping the rest):"; echo "$BAD"
  for f in $BAD; do git checkout -- "$f" 2>/dev/null || rm -rf -- "$f"; done
  CHANGED=$(changed)
  [ -z "$CHANGED" ] && { echo "PUBLISH: nothing left to publish"; exit 0; }
fi

# 2. Build + site gate + new-page gate + guard on live pages (title/description/H1 stay, no drastic rewrites).
[ -d node_modules ] || retry 3 $PNPM install --frozen-lockfile >/dev/null 2>&1
if ! $PNPM run build > /tmp/enshroudedbuilder-build.log 2>&1; then
  echo "PUBLISH BLOCKED: build failed (edits kept for fixing)"; tail -25 /tmp/enshroudedbuilder-build.log; exit 3
fi
if ! npx tsx scripts/check-builds.mts > /tmp/enshroudedbuilder-check.log 2>&1; then
  echo "PUBLISH BLOCKED: build point budgets failed (edits kept for fixing)"; tail -25 /tmp/enshroudedbuilder-check.log; exit 3
fi
if ! bash scripts/verify-site-build.sh > /tmp/enshroudedbuilder-verify.log 2>&1; then
  echo "PUBLISH BLOCKED: site gate failed (edits kept for fixing)"; grep '^FAIL' /tmp/enshroudedbuilder-verify.log; exit 3
fi
if ! python3 scripts/hermes-page-gate.py check; then exit 3; fi
if ! python3 scripts/hermes-tdh-guard.py "$SITE"; then exit 3; fi
# Every new number in src/data must match a fact the zyseo ledger verified from >=2 independent sources
# (or 1 official). In shadow mode this only records what would be blocked; in enforce mode it blocks.
ZY="/Users/zhongyao/Documents/zhongyaoruanjian/SEO skill/zyseo"
if [ -d "$ZY" ]; then
  # fact-gate reads `git diff HEAD`, which skips untracked files: stage first so a brand-new page's numbers are checked too.
  git add -A -- src/data src/pages vendor/enshrouded-skill-tree drafts HERMES-LOG.md src/lib/site.ts 2>/dev/null || true
  /Users/zhongyao/miniconda3/bin/python3 "$ZY/scripts/zyseo.py" fact-gate --site enshroudedbuilder-com --repo "$PWD" --base HEAD --head WORKTREE --json > /tmp/enshroudedbuilder-factgate.json 2>&1
  FG=$?
  /Users/zhongyao/miniconda3/bin/python3 - <<PY 2>/dev/null || true
import json
r = json.load(open("/tmp/enshroudedbuilder-factgate.json"))
print(f"FACT GATE ({r['mode']}): backed={r['backed_facts']} unbacked={len(r['unbacked'])} page_warnings={len(r['warnings'])}")
for u in r["unbacked"][:15]:
    print(f"  UNBACKED {u['file']}:{u['line']} token={u['token']} :: {u['text'][:120]}")
PY
  if [ "$FG" = "3" ]; then
    echo "FACT GATE BLOCKED: new values above have no verified fact. Run zyseo fact-add with their sources, or remove them."; exit 3
  fi
fi

# 3. 交给 PR（2026-11-02 用户定：zyseo 接入的站全部走 PR）：推到 zyseo/data-updates 分支，
#    由「zyseo PR 审核合并」任务审核合并；合并后它会跑 scripts/hermes-deploy.sh 部署并确认上线。
BR="zyseo/data-updates"
PATHS=""
for p in src/data src/pages vendor/enshrouded-skill-tree drafts HERMES-LOG.md src/lib/site.ts; do [ -e "$p" ] && PATHS="$PATHS $p"; done
if ! retry 3 git fetch -q origin; then echo "PUSH FAILED: git fetch 失败（改动留在工作区，下次再发）"; exit 4; fi
if ! git stash push -q --include-untracked -- $PATHS; then echo "PUSH FAILED: 暂存改动失败（改动留在工作区）"; exit 4; fi
if git rev-parse -q --verify "origin/$BR" >/dev/null && ! git merge-base --is-ancestor "origin/$BR" origin/main; then
  git checkout -q -B "$BR" "origin/$BR"   # 上一批还没合并：这批接在它后面，一起审
else
  git checkout -q -B "$BR" origin/main
fi
if ! git stash pop -q; then
  git reset -q --hard HEAD; git clean -fdq -- $PATHS; git checkout -q main; git stash pop -q
  echo "PR WAITING: 上一批数据还没合并，和这次改到了同一处；改动留在工作区，等上一批合并后再发"; exit 4
fi
git add -A -- $PATHS
git commit -q -m "$MSG"
if ! retry 3 git push -q origin "$BR"; then
  echo "PUSH FAILED after retries（提交留在本地分支 ${BR}，下次再推）"; git checkout -q main; exit 4
fi
git checkout -q main && git pull -q --ff-only origin main 2>/dev/null || true
echo "PR READY $(git rev-parse --short "$BR")：已推到 ${BR}，等「zyseo PR 审核合并」任务合并后部署上线"
