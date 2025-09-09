#!/usr/bin/env python3
"""
prepare_data.py
---------------
Offline transformer to convert the large cb-digital-questions.json (25–30MB) into static chunks + manifest
so the app can be hosted on GitHub Pages (no Flask).

Usage:
  python prepare_data.py --input path/to/cb-digital-questions.json --out ./data --chunk 1000

It will produce:
  data/
    manifest.json
    chunks/
      part-000.json
      part-001.json
      ...

And (optionally) a derived lookup.json with distinct facets.
"""
import json, os, argparse, math, re
from collections import defaultdict

def load_any(input_path:str):
  txt = open(input_path, "r", encoding="utf-8").read().strip()
  # Try to detect structure: either a dict of {id: obj} or a clean JSON array
  if txt.startswith("{") and txt.endswith("}"):
    try:
      data = json.loads(txt)
      # If it's a dict of id->obj, convert to list
      if isinstance(data, dict):
        items = []
        for k, v in data.items():
          if isinstance(v, dict):
            v.setdefault("uId", k)
          items.append(v)
        return items
      elif isinstance(data, list):
        return data
    except Exception:
      pass

  # Fallback: attempt to wrap dict-without-braces pattern (keyed entries separated by commas)
  try:
    wrapped = "{%s}" % txt.strip().strip(",")
    wrapped = re.sub(r',\s*}', '}', wrapped)  # trailing comma fix
    data = json.loads(wrapped)
    if isinstance(data, dict):
      items = []
      for k, v in data.items():
        if isinstance(v, dict):
          v.setdefault("uId", k)
        items.append(v)
      return items
  except Exception:
    pass

  # Last resort: NDJSON (one object per line)
  try:
    items = []
    for line in txt.splitlines():
      line = line.strip().rstrip(",")
      if not line: continue
      obj = json.loads(line)
      items.append(obj)
    return items
  except Exception as e:
    raise SystemExit(f"Could not parse input JSON: {e}")

def normalize(x:dict)->dict:
  return {
    "uId": x.get("uId") or x.get("id") or x.get("questionId"),
    "questionId": x.get("questionId") or x.get("id") or x.get("uId"),
    "module": x.get("module") or ("math" if "math" in (x.get("category","").lower()) else "reading-writing"),
    "primary_class_cd_desc": x.get("primary_class_cd_desc") or x.get("domain") or "",
    "skill_cd": x.get("skill_cd") or "",
    "skill_desc": x.get("skill_desc") or "",
    "difficulty": x.get("difficulty") or x.get("diff") or "",
    "score_band_range_cd": x.get("score_band_range_cd") or x.get("band"),
    "stem_html": x.get("stem_html") or x.get("stem") or x.get("question_html") or "",
    "choices": x.get("choices") or x.get("options"),
    "correct_choice_index": x.get("correct_choice_index") if isinstance(x.get("correct_choice_index"), int) else x.get("answer_index"),
    "explanation_html": x.get("explanation_html") or x.get("explanation") or "",
  }

def build_lookup(items):
  facets = defaultdict(set)
  for x in items:
    facets["module"].add(x.get("module") or "")
    facets["domain"].add(x.get("primary_class_cd_desc") or "")
    facets["difficulty"].add(x.get("difficulty") or "")
    facets["skill"].add(x.get("skill_desc") or "")
  return {k: sorted([v for v in vals if v]) for k, vals in facets.items()}

def main():
  ap = argparse.ArgumentParser()
  ap.add_argument("--input", required=True)
  ap.add_argument("--out", default="./data")
  ap.add_argument("--chunk", type=int, default=1000)
  args = ap.parse_args()

  os.makedirs(args.out, exist_ok=True)
  chunks_dir = os.path.join(args.out, "chunks")
  os.makedirs(chunks_dir, exist_ok=True)

  raw = load_any(args.input)
  items = [normalize(x) for x in raw if (x.get("uId") or x.get("id") or x.get("questionId"))]

  # shard
  N = len(items)
  csize = max(1, args.chunk)
  n_parts = math.ceil(N / csize)
  manifest = {"version":1, "count": N, "chunks":[]}
  for i in range(n_parts):
    part = items[i*csize:(i+1)*csize]
    rel = f"chunks/part-{i:03d}.json"
    with open(os.path.join(chunks_dir, f"part-{i:03d}.json"), "w", encoding="utf-8") as f:
      json.dump(part, f, separators=(",",":"))
    manifest["chunks"].append({"path": rel, "count": len(part)})

  with open(os.path.join(args.out, "manifest.json"), "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2)

  # optional lookup
  lookup = build_lookup(items)
  with open(os.path.join(args.out, "lookup.json"), "w", encoding="utf-8") as f:
    json.dump(lookup, f, indent=2)

  print(f"Wrote {N} items across {n_parts} chunks into {args.out}")
  print("Done. Ship the entire 'data' dir to GitHub along with index.html/styles.css/app.js.")
if __name__ == "__main__":
  main()
