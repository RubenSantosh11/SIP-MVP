"""Export the anonymous interaction log to outputs/interaction_log.csv.

Usage (with the database's REST URL and token from Vercel → Storage → your Upstash database → ".env.local" tab):
  KV_REST_API_URL=... KV_REST_API_TOKEN=... python mvp/export_log.py
"""
import csv
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from sip_help import store  # noqa: E402

rows = store.export()
out = ROOT / "outputs" / "interaction_log.csv"
cols = list(rows[0].keys()) if rows else ["ts"]
with open(out, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
    w.writeheader()
    w.writerows(rows)
print(f"{len(rows)} interactions → {out}")
