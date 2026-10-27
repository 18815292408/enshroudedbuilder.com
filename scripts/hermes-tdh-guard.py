#!/usr/bin/env python3
"""Guard for pages that are already live: Hermes may improve them, but not reshape them.

Usage: scripts/hermes-tdh-guard.py https://example.com      (run after the build; exit 0 = OK, 2 = blocked)

For every URL that is both in dist/sitemap-0.xml and in the live sitemap, the built page is
compared with the live page:
  - title, meta description and H1 must stay the same. Numbers are ignored, so a count that
    follows the data ("All 178 skills", "4 independent rankings") may still change.
  - the body may not change drastically in one run: at least 70% of the live text must survive,
    and a page over 200 words may grow to at most 1.6x its live length.
  - no live URL may disappear from the sitemap.
Why: these pages already rank. Rewriting their title/description/H1 or most of their text in one
go resets what search engines know about them, and the traffic can drop with it.
"""
import concurrent.futures as cf
import difflib
import os
import re
import sys
import urllib.request
from html.parser import HTMLParser

SITE = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else sys.exit(__doc__)
DIST = os.path.join(os.getcwd(), "dist")
KEEP = 0.70
GROW = 1.6


def fetch(url):
    last = None
    for _ in range(2):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "hermes-tdh-guard"})
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read().decode("utf8", "replace")
        except Exception as e:
            last = e
    raise last


def locs(xml):
    return {re.sub(r"^https?://[^/]+", "", u) for u in re.findall(r"<loc>([^<]+)</loc>", xml)}


class Page(HTMLParser):
    SKIP = {"script", "style", "header", "footer", "nav", "noscript", "svg", "template"}

    def __init__(self, html):
        super().__init__()
        self.skip = 0
        self.where = None
        self.title, self.h1, self.desc = "", "", ""
        self.words = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        if tag == "meta" and dict(attrs).get("name") == "description":
            self.desc = dict(attrs).get("content") or ""
        if tag in ("title", "h1") and not getattr(self, f"_{tag}_done", False):
            self.where = tag
        if tag in self.SKIP:
            self.skip += 1

    def handle_endtag(self, tag):
        if tag == self.where:
            setattr(self, f"_{tag}_done", True)
            self.where = None
        if tag in self.SKIP and self.skip:
            self.skip -= 1

    def handle_data(self, d):
        if self.where == "title":
            self.title += d
        elif self.where == "h1":
            self.h1 += d
        if not self.skip and self.where != "title":
            self.words += re.findall(r"\w[\w'’-]*", d.lower())


def norm(s):
    return re.sub(r"\s+", " ", re.sub(r"\d[\d.,]*", "#", s)).strip()


def built_html(url):
    for p in (os.path.join(DIST, url.strip("/"), "index.html"), os.path.join(DIST, url.strip("/") + ".html")):
        if os.path.isfile(p):
            return open(p, encoding="utf8").read()
    return None


def compare(url):
    html = built_html(url)
    if html is None:
        return [f"{url}: built page not found in dist/"]
    live = Page(fetch(SITE + url))
    new = Page(html)
    out = []
    for label, a, b in (("title", live.title, new.title), ("meta description", live.desc, new.desc), ("H1", live.h1, new.h1)):
        if norm(a) != norm(b):
            out.append(f'{url}: {label} changed\n     live:  "{a.strip()}"\n     built: "{b.strip()}"')
    old_w = [re.sub(r"\d", "#", w) for w in live.words]
    new_w = [re.sub(r"\d", "#", w) for w in new.words]
    if old_w and old_w != new_w:
        sm = difflib.SequenceMatcher(None, old_w, new_w, autojunk=False)
        kept = sum(b.size for b in sm.get_matching_blocks()) / len(old_w)
        if kept < KEEP:
            out.append(f"{url}: drastic rewrite, only {kept:.0%} of the live text kept (needs >= {KEEP:.0%})")
        if len(old_w) > 200 and len(new_w) > GROW * len(old_w):
            out.append(f"{url}: drastic growth, {len(old_w)} -> {len(new_w)} words in one publish (max {GROW}x)")
    return out


try:
    built = locs(open(os.path.join(DIST, "sitemap-0.xml")).read())
    live = locs(fetch(f"{SITE}/sitemap-0.xml"))
except Exception as e:
    print(f"TDH GUARD BLOCKED: cannot read sitemaps ({e}); try again next run")
    sys.exit(2)

problems = [f"{u}: live page would disappear from the sitemap (never delete or rename a page)" for u in sorted(live - built)]
with cf.ThreadPoolExecutor(8) as ex:
    futs = {ex.submit(compare, u): u for u in sorted(built & live)}
    for f in cf.as_completed(futs):
        try:
            problems += f.result()
        except Exception as e:
            problems.append(f"{futs[f]}: cannot read the live page ({e}); try again next run")

if problems:
    print("TDH GUARD BLOCKED: existing pages changed too much")
    for p in sorted(problems):
        print(" - " + p)
    print("Put the old title / description / H1 back and keep edits to existing pages small. If a change there really is needed, write it under 技术待办（交给 Claude） in HERMES-LOG.md instead.")
    sys.exit(2)
print(f"TDH GUARD OK: {len(built & live)} existing page(s) checked")
