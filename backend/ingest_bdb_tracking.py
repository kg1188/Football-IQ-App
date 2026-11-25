# backend/ingest_bdb_tracking.py
import polars as pl
import json
from pathlib import Path

print("Loading Kaggle Big Data Bowl tracking & play files...")
plays = pl.read_csv("backend/data/plays.csv", ignore_errors=True)
track = pl.read_csv("backend/data/tracking_week_1.csv", ignore_errors=True)

# Attach player positions if players.csv is present
players_path = Path("backend/data/players.csv")
if players_path.exists() and "position" not in track.columns:
    players_df = pl.read_csv(players_path, ignore_errors=True).select(["nflId", "position"])
    track = track.join(players_df, on="nflId", how="left")

cov_col = "pff_passCoverage" if "pff_passCoverage" in plays.columns else "passCoverage"
form_col = "offenseFormation" if "offenseFormation" in plays.columns else "formation"
week1_games = track["gameId"].unique().to_list()

# Filter to Week 1 pass plays (completions/incompletions) with charted coverage
query = plays.filter(pl.col("gameId").is_in(week1_games) & pl.col(cov_col).is_not_null())
if "passResult" in plays.columns:
    query = query.filter(pl.col("passResult").is_in(["C", "I"]))

sample_plays = (
    query.select(["gameId", "playId", "playDescription", form_col, cov_col, "absoluteYardlineNumber"])
         .head(35)
)

exported = []
for row in sample_plays.iter_rows(named=True):
    g_id, p_id = row["gameId"], row["playId"]
    los_x = float(row["absoluteYardlineNumber"] or 50.0)
    p_track = track.filter(
        (pl.col("gameId") == g_id) &
        (pl.col("playId") == p_id) &
        pl.col("nflId").is_not_null()
    )
    if p_track.is_empty():
        continue

    # Locate the snap frame and trim out the huddle (start 1.5s = 15 frames pre-snap)
    min_frame = p_track["frameId"].min()
    max_frame = p_track["frameId"].max()
    snap_rows = (
        p_track.filter(pl.col("event").is_in(["ball_snap", "autoevent_ballsnap"]))
        if "event" in p_track.columns else pl.DataFrame()
    )
    if snap_rows.is_empty():
        continue

    snap_frame = int(snap_rows["frameId"].min())
    start_frame = max(min_frame, snap_frame - 15)
    p_track = p_track.filter(pl.col("frameId") >= start_frame)

    total_sec = round((max_frame - start_frame) * 0.1, 2)
    snap_time = round((snap_frame - start_frame) * 0.1, 2)
    if total_sec - snap_time < 2.2:
        continue

    direction = p_track["playDirection"][0]
    raw_players = []

    for (nfl_id, name, pos, club), grp in p_track.group_by(["nflId", "displayName", "position", "club"]):
        grp = grp.sort("frameId")
        pos_str = str(pos or "ATH")
        is_off = pos_str in ["QB", "RB", "FB", "WR", "TE", "T", "G", "C", "OT", "OG"]
        pos_group = (
            "DB" if pos_str in ["CB", "FS", "SS", "DB", "SAF"] else
            "LB" if pos_str in ["ILB", "OLB", "MLB", "LB"] else
            "DL" if pos_str in ["DE", "DT", "NT", "DL"] else
            "OL" if pos_str in ["T", "G", "C", "OT", "OG"] else
            "RB" if pos_str in ["RB", "FB"] else
            "WR" if pos_str in ["WR", "TE"] else "QB"
        )

        keyframes = []
        for f in grp.iter_rows(named=True):
            t = round((f["frameId"] - start_frame) * 0.1, 2)
            dx = (los_x - f["x"]) if direction == "left" else (f["x"] - los_x)
            dy = (53.3 - f["y"]) if direction == "left" else f["y"]
            svg_x = round(max(2.0, min(98.0, (dy / 53.3) * 100.0)), 1)
            svg_y = round(max(2.0, min(53.0, 35.0 - dx)), 1)
            keyframes.append({"t": t, "x": svg_x, "y": svg_y})

        # Measure how far downfield this player runs (smaller svg_y = deeper downfield)
        min_y = min(k["y"] for k in keyframes)
        last_name = str(name).split()[-1] if name else pos_str

        raw_players.append({
            "id": pos_str,
            "lastName": last_name,
            "side": "O" if is_off else "D",
            "posGroup": pos_group,
            "minY": min_y,
            "keyframes": keyframes[::2],
        })

    # Assign QB read numbers [1]-[4] to the 4 deepest downfield eligible receivers/backs
    eligibles = [p for p in raw_players if p["side"] == "O" and p["posGroup"] in ["WR", "RB"]]
    eligibles.sort(key=lambda p: p["minY"])
    for idx, p in enumerate(eligibles[:4], start=1):
        p["readOrder"] = idx

    players_out = []
    for p in raw_players:
        ro = p.get("readOrder")
        players_out.append({
            "id": p["id"],
            "side": p["side"],
            "posGroup": p["posGroup"],
            "readOrder": ro,
            "routeLabel": f"{p['lastName']} ({p['id']})" + (f" [{ro}]" if ro else ""),
            "keyframes": p["keyframes"],
        })

    cov_label = str(row[cov_col])
    form_label = str(row[form_col] or "NFL Formation")

    exported.append({
        "id": f"bdb-{g_id}-{p_id}",
        "title": f"NFL Real Tracking: {form_label} vs. {cov_label}",
        "personnel": "NFL Next Gen Stats 10Hz Tracking",
        "formation": form_label,
        "preSnapShell": f"Pre-Snap Alignment ({form_label})",
        "postSnapCoverage": cov_label,
        "disguiseNote": row["playDescription"] or "Real NFL tracking play.",
        "motionNote": "Watch pre-snap receiver motion and safety rotation for 1.5s before the snap.",
        "snapTime": snap_time,
        "maxTime": total_sec,
        "pocketTime": max(2.4, round(total_sec - snap_time - 0.3, 1)),
        "nflBenchmark": {"epa": "Real", "successRate": "NGS", "avgAirYards": "10Hz"},
        "coachNotes": {
            "QB": f"Actual NFL Play ({cov_label}): {row['playDescription']}",
            "WR": "Track receiver stem angle, break depth, and separation against coverage leverage.",
            "RB": "Observe pass-protection scan vs. checkdown release timing.",
            "OL": "Evaluate pocket width and interior double-team handoffs.",
            "DL": "Track rush-lane integrity and pocket collapse timing.",
            "LB": "Watch hook/curl drop depth and eye discipline on crossing routes.",
            "DB": f"Study {cov_label} zone landmarks and closing speed at the catch point.",
        },
        "players": players_out,
    })

out_path = Path("frontend/src/data/imported_nfl_plays.json")
out_path.write_text(json.dumps(exported, indent=2))
print(f"Done! Imported {len(exported)} clean, huddle-trimmed NFL pass plays into {out_path}")