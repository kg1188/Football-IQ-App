@echo off
title Football Spatial Hub Launcher
cd /d "%~dp0"

echo ========================================================
echo   Football Analytics AI & MegaTrainer - Starting App
echo ========================================================

echo [1/3] Starting FastAPI Backend on http://localhost:8000 ...
start "Football Spatial Hub - Backend (Port 8000)" cmd /k ".\backend\venv\Scripts\python -m uvicorn backend.main:app --reload --port 8000"

echo [2/3] Starting Vite Frontend on http://localhost:5173 ...
start "Football Spatial Hub - Frontend (Port 5173)" cmd /k "npm --prefix frontend run dev"

echo [3/3] Waiting 3 seconds before opening browser...
timeout /t 3 /nobreak > nul
start "" "http://localhost:5173"

echo Launch complete! Close the backend/frontend windows to stop the servers.
