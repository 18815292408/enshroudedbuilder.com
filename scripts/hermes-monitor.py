#!/usr/bin/env python3
"""Cheap, LLM-free watcher for the Hermes enshroudedbuilder job (monitor-script mode).

Hermes runs this on every tick. If the printed text is byte-identical to the last tick,
the agent run is skipped; if it changed, the agent wakes up and sees the diff.
So the output must be stable: no timestamps, no ordering noise.

What it prints:
  - Keen Games' official Steam announcements for Enshrouded (gid | date | title), last 60 days
  - git blob SHAs of the game data export upstream (rossicler/enshrouded-skill-tree)
  - the ISO week, so the agent runs at least once a week to work through its pending list

On a network failure it prints the last good output instead of an error, so a flaky
connection does not wake the agent twice (once on failure, once on recovery).
"""
import datetime as dt
import json
import os
import urllib.request

APPID = 1203620
NEWS = f"https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid={APPID}&count=30&maxlength=1&feeds=steam_community_announcements&format=json"
TREE = "https://api.github.com/repos/rossicler/enshrouded-skill-tree/git/trees/main?recursive=1"
DATA_FILES = ("constants/gameSkillData.json", "constants/gameProgression.json", "locales/en/nodes.json")
CACHE = os.path.expanduser("~/.hermes/state/enshroudedbuilder-monitor.json")


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "enshroudedbuilder-monitor"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def load_cache():
    try:
        with open(CACHE) as f:
            return json.load(f)
    except Exception:
        return {}


cache = load_cache()
cutoff = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=60)

try:
    items = get(NEWS)["appnews"]["newsitems"]
    news = sorted(
        f"{n['gid']} | {dt.datetime.fromtimestamp(n['date'], dt.timezone.utc):%Y-%m-%d} | {n['title'].strip()}"
        for n in items
        if dt.datetime.fromtimestamp(n["date"], dt.timezone.utc) >= cutoff
    )
    cache["news"] = news
except Exception:
    news = cache.get("news", [])

try:
    tree = get(TREE)["tree"]
    data = sorted(f"{t['path'].split('src/', 1)[-1]} {t['sha']}" for t in tree if t["path"].endswith(DATA_FILES))
    cache["data"] = data
except Exception:
    data = cache.get("data", [])

try:
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    with open(CACHE, "w") as f:
        json.dump(cache, f)
except Exception:
    pass

year, week, _ = dt.date.today().isocalendar()
print(f"weekly sweep: {year}-W{week:02d}")
print("== Keen Games announcements (Steam, last 60 days) ==")
print("\n".join(reversed(news)) or "(none)")
print("== Upstream game data export (blob sha) ==")
print("\n".join(data) or "(unavailable)")
