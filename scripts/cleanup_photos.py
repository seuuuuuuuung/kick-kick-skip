#!/usr/bin/env python3
"""Remove KICK KICK SKIP photobooth images older than 24 hours.
Requires GitHub Actions secret SUPABASE_SERVICE_ROLE_KEY.
Never embed the service-role key in website files.
"""
import datetime as dt
import json
import os
import sys
import urllib.error
import urllib.request

BASE = "https://tizenxnvfchegstmzdoz.supabase.co"
BUCKET = "photobooth"
KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
if not KEY:
    sys.exit("Missing SUPABASE_SERVICE_ROLE_KEY GitHub Actions secret")
CUTOFF = dt.datetime.now(dt.timezone.utc) - dt.timedelta(hours=24)


def api(path, payload, method="POST"):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        BASE + "/storage/v1/" + path, data=data, method=method,
        headers={"apikey": KEY, "Authorization": "Bearer " + KEY,
                 "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as res:
            return json.load(res)
    except urllib.error.HTTPError as err:
        sys.exit("Supabase API failure: HTTP " + str(err.code) +
                 " " + err.read(350).decode(errors="replace"))


def objects(prefix=""):
    result = []
    offset = 0
    while True:
        page = api("object/list/" + BUCKET, {
            "prefix": prefix, "limit": 100, "offset": offset,
            "sortBy": {"column": "name", "order": "asc"}
        })
        if not isinstance(page, list):
            sys.exit("Unexpected Supabase Storage list response")
        result.extend(page)
        if len(page) < 100:
            break
        offset += len(page)
    return result


to_delete = []
for entry in objects():
    name = entry.get("name", "")
    # Only auto-generated photobooth JPGs. Never touch unrelated files.
    if len(name) != 52 or not name.endswith(".jpg"):
        continue
    photo_id = name[:-4]
    if len(photo_id) != 48 or any(ch not in "0123456789abcdef" for ch in photo_id):
        continue
    created = entry.get("created_at")
    if not created:
        continue
    try:
        timestamp = dt.datetime.fromisoformat(created.replace("Z", "+00:00"))
        if timestamp.tzinfo is None:
            timestamp = timestamp.replace(tzinfo=dt.timezone.utc)
    except ValueError:
        continue
    if timestamp < CUTOFF:
        to_delete.append(name)

for start in range(0, len(to_delete), 100):
    batch = to_delete[start:start + 100]
    api("object/" + BUCKET, {"prefixes": batch}, method="DELETE")
print(f"Deleted {len(to_delete)} photobooth photos older than 24 hours.")
