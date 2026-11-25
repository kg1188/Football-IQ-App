import nflreadpy as nfl
import polars as pl

print("Downloading play-by-play, defensive coverages, and FTN charting...")

# Download 2023 and 2024 seasons and standardize play IDs to integers
pbp = nfl.load_pbp([2023, 2024]).with_columns(pl.col("play_id").cast(pl.Int64))
part = nfl.load_participation([2023, 2024]).with_columns(pl.col("play_id").cast(pl.Int64))
ftn = nfl.load_ftn_charting([2023, 2024]).with_columns(pl.col("nflverse_play_id").cast(pl.Int64))

# Merge them together by game and play ID
master = (
    pbp.join(
        part,
        left_on=["game_id", "play_id"],
        right_on=["nflverse_game_id", "play_id"],
        how="inner",
        suffix="_part"
    )
    .join(
        ftn,
        left_on=["game_id", "play_id"],
        right_on=["nflverse_game_id", "nflverse_play_id"],
        how="left",
        suffix="_ftn"
    )
)

# Flatten any list columns so CSV export succeeds cleanly
master = master.with_columns([
    pl.col(col).list.join(";") for col, dtype in master.schema.items() if isinstance(dtype, pl.List)
])

# Save to your data folder
master.write_csv("data/nfl_master_plays.csv")
print(f"Done! Saved {master.height} plays to data/nfl_master_plays.csv")