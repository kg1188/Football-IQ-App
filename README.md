# Football Spatial Hub

An all-in-one football analytics and coaching platform powered by computer vision. Built to transform All-22 coaching film into 2D top-down tactical maps, automated playbooks, and defensive scheme breakdowns.

## Core Features
1. **Computer Vision Player & Ball Tracking:** Detects and tracks all 22 players and the football frame-by-frame from All-22 film.
2. **2D Tactical Pitch Mapping (Homography):** Converts angled stadium camera coordinates into a flat, top-down 2D football field view.
3. **Automated Playbook & Tendency Generator:** Clusters player alignments and route concepts to auto-generate opponent tendency reports.
4. **Defensive Coverage & Key Recognition Trainer:** Interactive study module highlighting pre-snap and post-snap defensive keys to teach coverage shells.
5. **Pre-Snap "Tell" Detection:** Flags subtle pre-snap micro-movements (stance shifts, depth changes) that telegraph play direction or coverage rotation.
6. **Real-Time Player Fatigue Tracking:** Tracks sprint velocity drop-offs across drives to optimize defensive substitutions.
7. **Automated Assignment Grading:** Compares actual player paths against ideal scheme responsibilities to pinpoint blown coverages.

## Project Structure
- `backend/` — Python FastAPI server, YOLOv8 player tracker, and OpenCV field calibration.
- `frontend/` — React + Vite + Tailwind CSS dashboard and 2D tactical canvas.
