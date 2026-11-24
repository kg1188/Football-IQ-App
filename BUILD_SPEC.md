# Football Spatial Hub — Complete Build Specification

## Phase 2: Backend YOLOv8 Tracking & Team Color Clustering
1. Install `scikit-learn` in `backend\venv` if not present.
2. Update `backend/tracker.py` to run `YOLO("yolov8n.pt")` with `model.track(frame, persist=True, tracker="bytetrack.yaml", classes=[0], conf=0.35)`. Extract ground-contact foot coordinates (`foot_x = x_center`, `foot_y = y_center + height / 2`).
3. Crop each player's torso (25%-55% height, 30%-70% width), take median RGB across the first 15 frames, and run K-Means (`n_clusters=3`) to label tracks as `team_a`, `team_b`, or `official`.
4. Update `backend/main.py` to serve `uploaded_film/` at `/films/` and add `POST /process-video/` which saves the MP4, extracts `frame1.jpg`, runs tracking, and returns `{ filename, video_url, frame1_url, fps, width, height, total_frames, frames }`.

## Phase 3: 4-Point Field Homography Calibration
1. Add `POST /calibrate-homography/` in `backend/main.py` accepting 4 clicked pixel points and 4 real yard coordinates (`120 x 53.33` yard grid). Use `cv2.findHomography()` and `cv2.perspectiveTransform()` to map every player's `(foot_x, foot_y)` to `(yard_x, yard_y)`, plus 5-frame smoothed speed in yards/sec and mph.
2. In React, display Frame 1 so the user can click 4 field landmarks (with presets for High School, College, and NFL hash widths) or click "Skip / Auto-Estimate" to preview immediately.

## Phase 4: Synchronized Split-Screen 2D Tactical Clipboard
1. Build a split-screen React layout: HTML5 `<video>` player on the left (with Play/Pause, Frame Step Back/Forward, Speed `0.25x`/`0.5x`/`1x`, and "Mark Snap Frame" button) and a 2D HTML5 `<canvas>` football field on the right.
2. Sync player dots on the 2D field to `video.currentTime * fps` via `requestAnimationFrame`. Add toggles for Route Trails, Flip Field Orientation, and Manual ID Swap (click two dots to swap IDs after trench collisions).

## Phase 5: Coaching & Scouting Intelligence
Add a tabbed panel below the viewer powered by `(yard_x, yard_y)`:
1. **Coverage Trainer:** Classify shell (`Cover 0/1/2/3/4`) at `snap_frame + 1.0s` from safety/corner depth, plus a Quiz Mode that pauses at the snap and lets the user guess before revealing.
2. **Pre-Snap Tells:** Highlight defenders with a pulsing ring if they creep `> 1.5` yds toward the LOS or rotate safety depth `> 2.5` yds in the final 1.5s pre-snap.
3. **Fatigue Tracker:** Sortable table of Peak Speed (mph), Distance Covered (yds), and Late-Play Deceleration %.
4. **Assignment Grading:** Score defender closing distance and zone discipline (`0-100`) and flag blown coverages (`> 4.5` yds separation).
