import cv2
import numpy as np
import torch
from sklearn.cluster import KMeans
from ultralytics import YOLO


def _smooth_and_stabilize_track(points, width, height, fps, scene_end_time):
    """Interpolate brief occlusion gaps, smooth jitter, and keep players visible
    unless they actually exit the screen bounds.
    """
    if not points:
        return []

    points.sort(key=lambda p: p["time"])

    # 1. Bridge brief detection gaps (up to 1.5s) via linear interpolation
    dt_step = 2.0 / max(fps, 15.0)
    bridged = [points[0]]
    for i in range(1, len(points)):
        prev_p = bridged[-1]
        curr_p = points[i]
        gap = curr_p["time"] - prev_p["time"]
        if dt_step * 1.4 < gap <= 1.5:
            steps = int(round(gap / dt_step))
            for s in range(1, steps):
                alpha = s / steps
                bridged.append(
                    {
                        "frame": int(round(prev_p["frame"] + alpha * (curr_p["frame"] - prev_p["frame"]))),
                        "time": round(prev_p["time"] + alpha * gap, 3),
                        "scene": prev_p["scene"],
                        "id": prev_p["id"],
                        "foot_x": prev_p["foot_x"] + alpha * (curr_p["foot_x"] - prev_p["foot_x"]),
                        "foot_y": prev_p["foot_y"] + alpha * (curr_p["foot_y"] - prev_p["foot_y"]),
                        "raw_x": prev_p["raw_x"] + alpha * (curr_p["raw_x"] - prev_p["raw_x"]),
                        "raw_y": prev_p["raw_y"] + alpha * (curr_p["raw_y"] - prev_p["raw_y"]),
                    }
                )
        bridged.append(curr_p)

    # 2. If player didn't exit screen edges, hold last position up to 1.5s through pileups/tackles
    last = bridged[-1]
    margin = 28
    on_screen = (
        margin <= last["raw_x"] <= (width - margin)
        and margin <= last["raw_y"] <= (height - margin)
    )
    if on_screen and scene_end_time > last["time"]:
        hold_until = min(scene_end_time, last["time"] + 1.5)
        t_cur = last["time"] + dt_step
        while t_cur <= hold_until + 1e-6:
            bridged.append(
                {
                    **last,
                    "frame": int(round(t_cur * fps)) + 1,
                    "time": round(t_cur, 3),
                }
            )
            t_cur += dt_step

    # 3. Gaussian smoothing across 7 keyframes to remove bounding-box bounce
    n = len(bridged)
    if n >= 5:
        weights = np.array([1, 3, 6, 8, 6, 3, 1], dtype=np.float64)
        weights /= weights.sum()
        pad = len(weights) // 2
        xs = np.pad([p["foot_x"] for p in bridged], (pad, pad), mode="edge")
        ys = np.pad([p["foot_y"] for p in bridged], (pad, pad), mode="edge")
        xs_s = np.convolve(xs, weights, mode="valid")
        ys_s = np.convolve(ys, weights, mode="valid")
        for idx in range(n):
            bridged[idx]["foot_x"] = float(xs_s[idx])
            bridged[idx]["foot_y"] = float(ys_s[idx])

    # 4. Pre-snap / stationary deadband so linemen sit rock-solid instead of vibrating
    for idx in range(1, n):
        dx = bridged[idx]["foot_x"] - bridged[idx - 1]["foot_x"]
        dy = bridged[idx]["foot_y"] - bridged[idx - 1]["foot_y"]
        if (dx * dx + dy * dy) < 2.25:  # < 1.5 px micro-jitter
            bridged[idx]["foot_x"] = bridged[idx - 1]["foot_x"]
            bridged[idx]["foot_y"] = bridged[idx - 1]["foot_y"]

    return bridged


def process_video(input_video_path, output_video_path, start_sec=0.0, end_sec=0.0):
    device = 0 if torch.cuda.is_available() else "cpu"
    model = YOLO("yolov8n.pt")
    cap = cv2.VideoCapture(input_video_path)

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    if start_sec > 0:
        cap.set(cv2.CAP_PROP_POS_MSEC, start_sec * 1000.0)

    raw_idx = 0
    processed_count = 0
    tracking_data = []
    colour_samples = {}
    scene_max_time = {}

    # Constrained affine camera stabilization (pan + zoom + slight roll, NO keystone skew)
    prev_gray = None
    prev_boxes = []
    H_curr_to_ref = np.eye(3, dtype=np.float64)
    scene_id = 0

    while cap.isOpened():
        current_sec = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000.0
        if end_sec > 0 and current_sec > end_sec:
            break

        success, frame = cap.read()
        if not success:
            break

        raw_idx += 1
        if raw_idx % 2 != 1:
            continue

        processed_count += 1
        if processed_count % 20 == 0:
            print(f"Scanned {processed_count} keyframes ({current_sec:.1f}s)...")

        curr_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        if prev_gray is not None:
            bg_mask = np.ones_like(prev_gray, dtype=np.uint8) * 255
            for bx1, by1, bx2, by2 in prev_boxes:
                pad = 18
                bg_mask[
                    max(0, by1 - pad) : min(height, by2 + pad),
                    max(0, bx1 - pad) : min(width, bx2 + pad),
                ] = 0

            prev_pts = cv2.goodFeaturesToTrack(
                prev_gray, maxCorners=400, qualityLevel=0.01, minDistance=18, mask=bg_mask
            )
            scene_cut = True
            if prev_pts is not None and len(prev_pts) >= 20:
                curr_pts, status, _ = cv2.calcOpticalFlowPyrLK(
                    prev_gray, curr_gray, prev_pts, None
                )
                if curr_pts is not None and status is not None:
                    valid = status.flatten() == 1
                    good_prev = prev_pts[valid]
                    good_curr = curr_pts[valid]
                    if len(good_curr) >= 15:
                        M, inliers = cv2.estimateAffinePartial2D(
                            good_curr, good_prev, method=cv2.RANSAC, ransacReprojThreshold=2.5
                        )
                        if M is not None and inliers is not None:
                            scale = float(np.hypot(M[0, 0], M[0, 1]))
                            shift = float(np.hypot(M[0, 2], M[1, 2]))
                            inlier_ratio = float(np.sum(inliers)) / len(good_curr)
                            if (
                                0.94 <= scale <= 1.06
                                and shift <= width * 0.12
                                and inlier_ratio >= 0.40
                            ):
                                H_step = np.vstack([M, [0.0, 0.0, 1.0]])
                                H_curr_to_ref = H_curr_to_ref @ H_step
                                scene_cut = False

            if scene_cut:
                scene_id += 1
                H_curr_to_ref = np.eye(3, dtype=np.float64)

        scene_max_time[scene_id] = round(current_sec, 3)

        # Higher resolution + lower confidence threshold to catch all 22 players on screen
        results = model.track(
            frame,
            persist=True,
            tracker="bytetrack.yaml",
            classes=[0],
            conf=0.16,
            iou=0.55,
            imgsz=1024,
            device=device,
            verbose=False,
        )

        frame_num = int(round(current_sec * fps)) + 1
        curr_boxes = []

        for result in results:
            for box in result.boxes:
                x_center, y_center, w, h = box.xywh[0].tolist()
                track_id = int(box.id[0]) if box.id is not None else -1
                x1 = int(x_center - w / 2)
                y1 = int(y_center - h / 2)
                x2 = int(x_center + w / 2)
                y2 = int(y_center + h / 2)
                curr_boxes.append((x1, y1, x2, y2))

                foot_x = x_center
                foot_y = y_center + h / 2

                stab_x = float(
                    H_curr_to_ref[0, 0] * foot_x
                    + H_curr_to_ref[0, 1] * foot_y
                    + H_curr_to_ref[0, 2]
                )
                stab_y = float(
                    H_curr_to_ref[1, 0] * foot_x
                    + H_curr_to_ref[1, 1] * foot_y
                    + H_curr_to_ref[1, 2]
                )

                tracking_data.append(
                    {
                        "frame": frame_num,
                        "time": round(current_sec, 3),
                        "scene": scene_id,
                        "id": track_id,
                        "foot_x": stab_x,
                        "foot_y": stab_y,
                        "raw_x": float(foot_x),
                        "raw_y": float(foot_y),
                    }
                )

                if track_id != -1 and len(colour_samples.get(track_id, [])) < 30:
                    torso_x0 = max(0, int(x1 + 0.35 * w))
                    torso_y0 = max(0, int(y1 + 0.20 * h))
                    torso_x1 = min(width, int(x1 + 0.65 * w))
                    torso_y1 = min(height, int(y1 + 0.45 * h))
                    torso = frame[torso_y0:torso_y1, torso_x0:torso_x1]
                    if torso.size > 0:
                        torso_lab = cv2.cvtColor(torso, cv2.COLOR_BGR2LAB)
                        median_lab = np.median(torso_lab.reshape(-1, 3), axis=0)
                        colour_samples.setdefault(track_id, []).append(median_lab)

        prev_gray = curr_gray
        prev_boxes = curr_boxes

    cap.release()
    print(f"Done! Processed {processed_count} keyframes across {scene_id + 1} camera angle(s).")

    # Cluster jersey colors into 2 teams (0 = Red, 1 = Blue)
    track_ids = []
    colour_vectors = []
    for tid, samples in colour_samples.items():
        if len(samples) >= 3:
            track_ids.append(tid)
            colour_vectors.append(np.median(np.stack(samples), axis=0))

    if len(colour_vectors) >= 2:
        kmeans = KMeans(n_clusters=2, random_state=0, n_init="auto").fit(colour_vectors)
        label_map = {tid: int(lbl) for tid, lbl in zip(track_ids, kmeans.labels_)}
    else:
        label_map = {}

    grouped = {}
    for entry in tracking_data:
        if entry["id"] == -1:
            continue
        key = (entry["scene"], entry["id"])
        grouped.setdefault(key, []).append(entry)

    cleaned_data = []
    for (sc, tid), pts in grouped.items():
        if len(pts) < 4:
            continue
        smoothed = _smooth_and_stabilize_track(
            pts, width, height, fps, scene_max_time.get(sc, pts[-1]["time"])
        )
        team = label_map.get(tid, -1)
        for p in smoothed:
            cleaned_data.append(
                {
                    "frame": p["frame"],
                    "time": p["time"],
                    "scene": p["scene"],
                    "id": p["id"],
                    "foot_x": round(p["foot_x"], 2),
                    "foot_y": round(p["foot_y"], 2),
                    "team": team,
                }
            )

    cleaned_data.sort(key=lambda x: x["time"])
    return cleaned_data