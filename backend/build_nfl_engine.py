import polars as pl
import json
from pathlib import Path

print("Reading 92,087 NFL plays...")
df = pl.read_csv("backend/data/nfl_master_plays.csv", ignore_errors=True)

# Group plays by Coverage + Box Count + Field Zone + Play-Action
clean = (
    df.filter(
        pl.col("defense_coverage_type").is_not_null() &
        pl.col("play_type").is_in(["pass", "run"]) &
        pl.col("epa").is_not_null()
    )
    .with_columns([
        pl.when(pl.col("defenders_in_box") >= 7).then(pl.lit("HEAVY_7+"))
          .when(pl.col("defenders_in_box") <= 6).then(pl.lit("LIGHT_6-"))
          .otherwise(pl.lit("UNKNOWN")).alias("box_bucket"),
        pl.when(pl.col("play_type") == "run")
          .then(pl.concat_str([pl.lit("RUN_"), pl.col("run_location").fill_null("MIDDLE")]))
          .otherwise(pl.concat_str([pl.lit("PASS_"), pl.col("pass_location").fill_null("MIDDLE")]))
          .alias("attack_zone"),
        pl.col("is_play_action").fill_null(False).alias("pa"),
    ])
)

stats = (
    clean.group_by(["defense_coverage_type", "box_bucket", "attack_zone", "pa"])
    .agg([
        pl.len().alias("plays"),
        pl.col("epa").mean().round(3).alias("avg_epa"),
        pl.col("success").mean().round(3).alias("success_rate"),
        pl.col("air_yards").mean().round(1).alias("avg_air_yards"),
        pl.col("was_pressure").mean().round(3).alias("pressure_rate"),
    ])
    .filter(pl.col("plays") >= 25)
)

out_path = Path("frontend/src/data/nfl_stats_engine.json")
out_path.write_text(json.dumps(stats.to_dicts(), indent=2))
print(f"Success! Created {out_path} with {stats.height} NFL matchup summaries.")