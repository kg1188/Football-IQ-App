# AI Coding Agent Instructions
Read `ARCHITECTURE.md` and `BUILD_SPEC.md` completely before writing code.

## Critical Environment Guardrails
1. **Node & Vite:** This machine runs Node `v20.18.3`. Keep `vite` pinned to `^6.0.0` and `@vitejs/plugin-react` pinned to `^4.3.4` in `frontend/package.json`. DO NOT upgrade Vite to v8+.
2. **Python:** Always run FastAPI and pip using `backend\venv\Scripts\python.exe` and `backend\venv\Scripts\pip.exe`.
3. **Video Playback:** Stream the user's original uploaded MP4 via FastAPI StaticFiles and sync JSON coordinates on top of it (do not rely on OpenCV `mp4v` for `<video>` tags).

## Execution Order
Implement `BUILD_SPEC.md` sequentially from Phase 2 through Phase 5 and verify both `uvicorn` (port 8000) and `vite` (port 5173) start cleanly.
