from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import shutil
import os
from pathlib import Path
import cv2
import numpy as np
from . import tracker

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploaded_film", exist_ok=True)
app.mount("/films", StaticFiles(directory="uploaded_film", html=False), name="films")

_homography_matrix = None


@app.post("/process-video/")
async def process_video_endpoint(
    file: UploadFile = File(...),
    start_sec: float = Form(0.0),
    end_sec: float = Form(0.0),
):
    upload_path = Path(f"uploaded_film/{file.filename}")
    with open(upload_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract preview frame at start_sec
    cap = cv2.VideoCapture(str(upload_path))
    if start_sec > 0:
        cap.set(cv2.CAP_PROP_POS_MSEC, start_sec * 1000.0)
    success, frame1 = cap.read()
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    cap.release()

    frame1_path = upload_path.with_name(upload_path.stem + "_frame1.jpg")
    if success:
        cv2.imwrite(str(frame1_path), frame1)

    output_video_path = upload_path.with_name(upload_path.stem + "_tracked.mp4")
    tracking_data = tracker.process_video(
        str(upload_path),
        str(output_video_path),
        start_sec=start_sec,
        end_sec=end_sec,
    )

    return {
        "filename": file.filename,
        "video_url": f"http://localhost:8000/films/{upload_path.name}",
        "frame1_url": f"http://localhost:8000/films/{frame1_path.name}",
        "fps": fps,
        "width": width,
        "height": height,
        "total_frames": total_frames,
        "start_sec": start_sec,
        "tracking": tracking_data,
    }


@app.post("/calibrate-homography/")
async def calibrate_homography(payload: dict):
    global _homography_matrix
    pixel_pts = np.array(payload["pixel_points"], dtype="float32")
    yard_pts = np.array(payload["yard_points"], dtype="float32")
    H, status = cv2.findHomography(pixel_pts, yard_pts)
    _homography_matrix = H.tolist() if H is not None else None
    return {
        "homography": _homography_matrix,
        "status": status.flatten().tolist() if hasattr(status, "tolist") else status,
    }