#!/usr/bin/env python3
"""New-URL gate for Hermes publishes. Deterministic, so the agent cannot talk its way past it.

Usage:
  scripts/hermes-page-gate.py check            # after the build; exit 0 = OK, 2 = blocked
  scripts/hermes-page-gate.py record           # after a successful deploy; logs the URLs check passed
  scripts/hermes-page-gate.py status           # print quota state, change nothing
Options: --today YYYY-MM-DD (testing), --live-sitemap FILE (testing, instead of fetching)

A "new URL" is a URL in dist/sitemap-0.xml that the live sitemap does not have.
Rules (numbers live in hermes/config.json):
  - the page must declare data-page-kind="tool" | "version" | "guide" (missing = guide)
  - that kind must be allowed in the current AdSense state
  - rolling-window quota per AdSense state, counted from hermes/new-pages.json
  - enough visible words for its kind, linked from at least one other page,
    title 30-65 chars, meta description 70-160 chars
  - no live URL may disappear from the sitemap
"""
import datetime as dt
import json
import os
import re
import sys
import urllib.request
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = json.load(open(os.path.join(ROOT, "hermes/config.json")))
LEDGER = os.path.join(ROOT, "hermes/new-pages.json")
DIST = os.path.join(ROOT, "dist")
SITE = "https://enshroudedbuilder.com"

args = sys.argv[1:]
today = dt.date.today()
if "--today" in args:
    today = dt.date.fromisoformat(args[args.index("--today") + 1])
cmd = args[0] if args else "status"


def locs(xml):
    return {re.sub(r"^https?://[^/]+", "", u) for u in re.findall(r"<loc>([^<]+)</loc>", xml)}


def live_sitemap():
    if "--live-sitemap" in args:
        return open(args[args.index("--live-sitemap") + 1]).read()
    req = urllib.request.Request(f"{SITE}/sitemap-0.xml", headers={"User-Agent": "hermes-page-gate"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode()


class Text(HTMLParser):
    SKIP = {"script", "style", "header", "footer", "nav", "noscript", "svg"}

    def __init__(self):
        super().__init__()
        self.depth = 0
        self.words = 0
        self.kind = None
        self.title = ""
        self.desc = ""
        self.in_title = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("data-page-kind"):
            self.kind = a["data-page-kind"]
        if tag == "meta" and a.get("name") == "description":
            self.desc = a.get("content") or ""
        if tag == "title":
            self.in_title = True
        if tag in self.SKIP:
            self.depth += 1

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag in self.SKIP and self.depth:
            self.depth -= 1

    def handle_data(self, d):
        if self.in_title:
            self.title += d
        elif not self.depth:
            self.words += len(re.findall(r"[A-Za-zÀ-ÿ0-9][\w'’-]*", d))


def page_file(url):
    return os.path.join(DIST, url.strip("/"), "index.html")


def inbound(url):
    pat = re.compile(r'href="(?:%s)?%s"' % (re.escape(SITE), re.escape(url)))
    n = 0
    for d, _, files in os.walk(DIST):
        for f in files:
            p = os.path.join(d, f)
            if f.endswith(".html") and p != page_file(url) and pat.search(open(p, encoding="utf8").read()):
                n += 1
    return n


def ledger():
    try:
        return json.load(open(LEDGER))
    except Exception:
        return []


def quota_left(kind_count=1):
    state = CFG["adsense"]
    out = []
    for rule in CFG["new_page_quota"][state]:
        since = today - dt.timedelta(days=rule["days"] - 1)
        used = sum(1 for e in ledger() if dt.date.fromisoformat(e["date"]) >= since)
        out.append((rule, used, rule["max"] - used))
    return out


def analyse(url):
    t = Text()
    t.feed(open(page_file(url), encoding="utf8").read())
    return t


if cmd == "status":
    print(f"GATE adsense={CFG['adsense']} since={CFG['adsense_since']} kinds={CFG['new_page_kinds_allowed'][CFG['adsense']]}")
    for rule, used, left in quota_left():
        print(f"GATE quota {rule['days']}d: used {used}/{rule['max']}, left {max(left, 0)}")
    sys.exit(0)

if cmd == "record":
    pend = os.path.join(ROOT, ".hermes-pending-pages.json")
    if not os.path.exists(pend):
        sys.exit(0)
    entries = ledger() + [dict(e, date=today.isoformat()) for e in json.load(open(pend))]
    with open(LEDGER, "w") as f:
        json.dump(entries, f, indent=2)
        f.write("\n")
    os.remove(pend)
    print(f"PAGE GATE recorded {len(entries)} total Hermes page(s)")
    sys.exit(0)

built = locs(open(os.path.join(DIST, "sitemap-0.xml")).read())
try:
    live = locs(live_sitemap())
except Exception as e:
    print(f"PAGE GATE BLOCKED: cannot read the live sitemap ({e}); try again next run")
    sys.exit(2)
new = sorted(built - live)
gone = sorted(live - built)

problems = []
if gone:
    problems.append("live URLs would disappear: " + ", ".join(gone) + " (never delete or rename a page; edit it instead)")

state = CFG["adsense"]
allowed = CFG["new_page_kinds_allowed"][state]
for rule, used, left in quota_left():
    if len(new) > left:
        problems.append(f"new-page quota: {len(new)} new URL(s), {max(left, 0)} left in the {rule['days']}-day window (AdSense state: {state})")

pending = []
for url in new:
    t = analyse(url)
    kind = t.kind or "guide"
    pending.append({"url": url, "kind": kind})
    if kind not in allowed:
        problems.append(f"{url}: kind '{kind}' is not allowed while AdSense is '{state}' (allowed: {allowed or 'none'})")
    need = CFG["min_words"].get(kind, 900)
    if t.words < need:
        problems.append(f"{url}: thin page, {t.words} words < {need} for a {kind} page")
    title = t.title.strip()
    if not 30 <= len(title) <= 65:
        problems.append(f"{url}: title is {len(title)} chars, needs 30-65")
    if not 70 <= len(t.desc) <= 160:
        problems.append(f"{url}: description is {len(t.desc)} chars, needs 70-160")
    if inbound(url) < 1:
        problems.append(f"{url}: orphan page, no other page links to it")

if problems:
    print("PAGE GATE BLOCKED:")
    for p in problems:
        print(" - " + p)
    print("Move the new page file(s) to drafts/ (keeps them out of the build) or fix the problems, then run the publish script again.")
    sys.exit(2)

with open(os.path.join(ROOT, ".hermes-pending-pages.json"), "w") as f:
    json.dump(pending, f)
print(f"PAGE GATE OK: {len(new)} new URL(s)" + (": " + ", ".join(new) if new else ""))
