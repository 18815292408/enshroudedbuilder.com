#!/usr/bin/env python3
"""Switch the AdSense state that sets the new-page quota (hermes/config.json), and commit it.

Usage: scripts/hermes-adsense.py approved | rejected | reviewing | status
Run it only when the user has told you the AdSense result (or asked to re-apply).
"""
import datetime as dt
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, "hermes/config.json")
cfg = json.load(open(P))
arg = sys.argv[1] if len(sys.argv) > 1 else "status"

if arg == "status":
    print(f"ADSENSE {cfg['adsense']} since {cfg['adsense_since']}")
    sys.exit(0)
if arg not in ("approved", "rejected", "reviewing"):
    print(__doc__)
    sys.exit(1)

cfg["adsense"] = arg
cfg["adsense_since"] = dt.date.today().isoformat()
with open(P, "w") as f:
    json.dump(cfg, f, indent=2, ensure_ascii=False)
    f.write("\n")
subprocess.run(["git", "-C", ROOT, "add", "hermes/config.json"], check=True)
subprocess.run(["git", "-C", ROOT, "commit", "-q", "-m", f"Hermes: AdSense state is now {arg}"], check=True)
subprocess.run(["sh", "-c", f"cd '{ROOT}' && git pull -q --rebase && git push -q"])
print(f"ADSENSE {arg} since {cfg['adsense_since']}")
