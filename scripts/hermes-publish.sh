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

# 3. Commit + push (rebase on remote first, retry on network errors).
git add -A -- src/data src/pages vendor/enshrouded-skill-tree drafts HERMES-LOG.md src/lib/site.ts 2>/dev/null
git commit -q -m "$MSG"
if ! retry 3 sh -c 'git pull -q --rebase && git push -q'; then
  echo "PUSH FAILED after retries (commit kept locally, next run will push it)"
fi

# 4. Deploy (git push does NOT deploy this site; wrangler must run) + verify live.
deploy() { npx wrangler pages deploy dist --project-name enshroudedbuilder --branch main --commit-dirty=true > /tmp/enshroudedbuilder-deploy.log 2>&1; }
if ! retry 3 deploy; then
  if grep -qiE "authentication|not logged in|token.*(expired|invalid)|login" /tmp/enshroudedbuilder-deploy.log; then
    echo "DEPLOY AUTH EXPIRED: Cloudflare login on the Mac mini needs to be renewed (code is pushed; site unchanged)"
  else
    echo "DEPLOY FAILED after retries (code is pushed; next run will deploy)"; tail -10 /tmp/enshroudedbuilder-deploy.log
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
  git revert --no-edit HEAD -q && $PNPM run build > /tmp/enshroudedbuilder-build.log 2>&1 && retry 3 deploy && echo "ROLLED BACK" || echo "ROLLBACK FAILED"
  retry 3 sh -c 'git pull -q --rebase && git push -q' || true
  exit 6
fi
python3 scripts/hermes-page-gate.py record
if ! git diff --quiet -- hermes/new-pages.json; then
  git add hermes/new-pages.json && git commit -q -m "Hermes: record new page date" && retry 3 sh -c 'git pull -q --rebase && git push -q' || true
fi
echo "PUBLISHED $(git rev-parse --short HEAD) · live=200 ·$URLS"
