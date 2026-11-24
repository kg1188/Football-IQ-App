# System Architecture

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, HTML5 Canvas (for synchronized 2D tactical field rendering).
- **Backend:** Python 3.13, FastAPI, Uvicorn.
- **Computer Vision & AI:** Ultralytics YOLOv8 (object detection & multi-object tracking), OpenCV (frame extraction & homography matrix transformation).

## Data Pipeline
1. **Ingestion:** User uploads an All-22 MP4 clip via the React dashboard (`POST /upload-video/`).
2. **Detection & Tracking (`tracker.py`):** OpenCV reads frames sequentially; YOLOv8 detects players (`class=0`) and assigns persistent tracking IDs across frames.
3. **Spatial Calibration (Homography):** Pixel coordinates `(x, y)` from the video frame are mapped onto standardized 2D field coordinates (`120 x 53.3 yards`) using OpenCV perspective transformation.
4. **Tactical Analysis:** Tracking JSON is analyzed for spacing, velocity, route clustering, and coverage shell matching.
5. **Visualization:** Backend returns structured frame-by-frame JSON coordinates to React to animate players on the 2D field alongside the video player.
