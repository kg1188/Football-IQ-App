import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { getCoachTheme } from "../data/coachTheme";

export default function SplitScreen({
  videoUrl,
  trackingData,
  fps,
  homography,
  startSec = 0,
  initialOrientation = "sideline",
  themeName = "light",
}) {
  const t = getCoachTheme(themeName);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 640, height: 440 });
  const [orientation, setOrientation] = useState(initialOrientation); // "sideline" | "endzone"
  const [flipped, setFlipped] = useState(false);
  const [routeMode, setRouteMode] = useState("full"); // "full" | "trail" | "dots"

  useEffect(() => {
    setOrientation(initialOrientation);
  }, [initialOrientation]);

  const playerTracks = useMemo(() => {
    const tracks = new Map();
    trackingData.forEach((item) => {
      if (item.id === -1) return;
      const t = item.time ?? item.frame / (fps || 30);
      const sc = item.scene ?? 0;
      const key = `${sc}_${item.id}`;
      if (!tracks.has(key)) tracks.set(key, []);
      tracks.get(key).push({ ...item, time: t, scene: sc });
    });
    tracks.forEach((pts) => pts.sort((a, b) => a.time - b.time));
    return tracks;
  }, [trackingData, fps]);

  const applyHomography = (x, y) => {
    if (!homography) return { fieldX: (x / 1280) * 120, fieldY: (y / 720) * 53.33 };
    const [a, b, c] = homography[0];
    const [d, e, f] = homography[1];
    const [g, h, i] = homography[2];
    const denom = g * x + h * y + i;
    if (!denom) return { fieldX: 60, fieldY: 26.66 };
    return {
      fieldX: (a * x + b * y + c) / denom,
      fieldY: (d * x + e * y + f) / denom,
    };
  };

  // Map canonical field yards (0..120 x 0..53.33) onto the selected 2D canvas orientation
  const toCanvasCoords = (footX, footY, width, height) => {
    const { fieldX, fieldY } = applyHomography(footX, footY);
    const nx = Math.max(0.01, Math.min(0.99, fieldX / 120));
    const ny = Math.max(0.02, Math.min(0.98, fieldY / 53.33));

    let u, v;
    if (orientation === "sideline") {
      u = flipped ? 1 - nx : nx;
      v = flipped ? 1 - ny : ny;
    } else {
      // Endzone view: sidelines span left-to-right, yard lines run bottom-to-top
      u = flipped ? 1 - ny : ny;
      v = flipped ? nx : 1 - nx;
    }

    return {
      cx: u * width,
      cy: v * height,
    };
  };

  // Smoothly interpolate a player's exact position at currentTime (60fps)
  const getInterpolatedPosition = (pts, currentTime) => {
    if (!pts.length) return null;
    if (currentTime < pts[0].time - 0.15) return null;
    const last = pts[pts.length - 1];
    if (currentTime > last.time + 0.35) return null;

    if (currentTime <= pts[0].time) {
      return { foot_x: pts[0].foot_x, foot_y: pts[0].foot_y };
    }
    if (currentTime >= last.time) {
      return { foot_x: last.foot_x, foot_y: last.foot_y };
    }

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      if (currentTime >= p0.time && currentTime <= p1.time) {
        const span = p1.time - p0.time;
        const alpha = span > 1e-5 ? (currentTime - p0.time) / span : 0;
        return {
          foot_x: p0.foot_x + alpha * (p1.foot_x - p0.foot_x),
          foot_y: p0.foot_y + alpha * (p1.foot_y - p0.foot_y),
        };
      }
    }
    return { foot_x: last.foot_x, foot_y: last.foot_y };
  };

  const drawField = (ctx, width, height) => {
    ctx.fillStyle = "#0b5d1e";
    ctx.fillRect(0, 0, width, height);

    if (orientation === "sideline") {
      // End zones left & right
      ctx.fillStyle = "#073d13";
      ctx.fillRect(0, 0, (10 / 120) * width, height);
      ctx.fillRect(width - (10 / 120) * width, 0, (10 / 120) * width, height);

      // 5-yard & 10-yard lines
      ctx.textAlign = "center";
      ctx.font = "bold 11px sans-serif";
      for (let yard = 10; yard <= 110; yard += 5) {
        const x = (yard / 120) * width;
        const isTen = yard % 10 === 0;
        ctx.strokeStyle = isTen ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.22)";
        ctx.lineWidth = isTen ? 1.8 : 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        if (isTen && yard >= 20 && yard <= 100) {
          const rawLabel = yard <= 60 ? yard - 10 : 110 - yard;
          const label = flipped ? (120 - yard <= 60 ? 110 - yard : yard - 10) : rawLabel;
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          ctx.fillText(String(label), x, height - 10);
          ctx.fillText(String(label), x, 18);
        }
      }

      // Hash marks
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 1;
      for (let yard = 11; yard <= 109; yard += 1) {
        const x = (yard / 120) * width;
        ctx.beginPath();
        ctx.moveTo(x, height * 0.36);
        ctx.lineTo(x, height * 0.38);
        ctx.moveTo(x, height * 0.62);
        ctx.lineTo(x, height * 0.64);
        ctx.stroke();
      }
    } else {
      // Endzone (Vertical) field: end zones top & bottom
      ctx.fillStyle = "#073d13";
      ctx.fillRect(0, 0, width, (10 / 120) * height);
      ctx.fillRect(0, height - (10 / 120) * height, width, (10 / 120) * height);

      ctx.textAlign = "left";
      ctx.font = "bold 11px sans-serif";
      for (let yard = 10; yard <= 110; yard += 5) {
        const y = (yard / 120) * height;
        const isTen = yard % 10 === 0;
        ctx.strokeStyle = isTen ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.22)";
        ctx.lineWidth = isTen ? 1.8 : 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        if (isTen && yard >= 20 && yard <= 100) {
          const fieldYards = flipped ? yard : 120 - yard;
          const label = fieldYards <= 60 ? fieldYards - 10 : 110 - fieldYards;
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          ctx.fillText(String(label), 10, y - 4);
          ctx.fillText(String(label), width - 26, y - 4);
        }
      }

      // Vertical hash marks
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 1;
      for (let yard = 11; yard <= 109; yard += 1) {
        const y = (yard / 120) * height;
        ctx.beginPath();
        ctx.moveTo(width * 0.36, y);
        ctx.lineTo(width * 0.38, y);
        ctx.moveTo(width * 0.62, y);
        ctx.lineTo(width * 0.64, y);
        ctx.stroke();
      }
    }
  };

  const drawFrame = (currentTime) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvasSize;
    ctx.clearRect(0, 0, width, height);

    drawField(ctx, width, height);

    // Find active camera scene at currentTime
    let activeScene = null;
    let closestTimeDiff = Infinity;
    playerTracks.forEach((pts) => {
      pts.forEach((p) => {
        const diff = Math.abs(p.time - currentTime);
        if (diff < closestTimeDiff && diff <= 0.4) {
          closestTimeDiff = diff;
          activeScene = p.scene;
        }
      });
    });

    if (activeScene === null) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Pass 1: Draw thick, outlined route paths
    if (routeMode !== "dots") {
      playerTracks.forEach((pts) => {
        if (pts[0].scene !== activeScene) return;
        const currPos = getInterpolatedPosition(pts, currentTime);
        if (!currPos) return;

        const minTime = routeMode === "trail" ? currentTime - 2.5 : -Infinity;
        const history = pts.filter((p) => p.time <= currentTime && p.time >= minTime);
        if (!history.length) return;

        const team = pts[0].team;
        const mainColor =
          team === 0 ? "#ff4d4d" : team === 1 ? "#38bdf8" : "#facc15";

        const pathPoints = [
          ...history.map((pt) => toCanvasCoords(pt.foot_x, pt.foot_y, width, height)),
          toCanvasCoords(currPos.foot_x, currPos.foot_y, width, height),
        ];

        if (pathPoints.length >= 2) {
          // Dark outline underneath route so it never looks washed out
          ctx.strokeStyle = "rgba(10, 20, 15, 0.75)";
          ctx.lineWidth = 5.5;
          ctx.beginPath();
          pathPoints.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.cx, pt.cy);
            else ctx.lineTo(pt.cx, pt.cy);
          });
          ctx.stroke();

          // Thick colored route line
          ctx.strokeStyle = mainColor;
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          pathPoints.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.cx, pt.cy);
            else ctx.lineTo(pt.cx, pt.cy);
          });
          ctx.stroke();
        }
      });
    }

    // Pass 2: Draw smooth player dots on top of all route lines
    playerTracks.forEach((pts) => {
      if (pts[0].scene !== activeScene) return;
      const currPos = getInterpolatedPosition(pts, currentTime);
      if (!currPos) return;

      const team = pts[0].team;
      const fillColour =
        team === 0 ? "#ef4444" : team === 1 ? "#2563eb" : "#eab308";

      const { cx, cy } = toCanvasCoords(currPos.foot_x, currPos.foot_y, width, height);

      ctx.beginPath();
      ctx.arc(cx, cy, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = fillColour;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.8;
      ctx.stroke();
    });
  };

  useEffect(() => {
    let animationId = null;
    const render = () => {
      if (videoRef.current && canvasRef.current) {
        drawFrame(videoRef.current.currentTime);
      }
      animationId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationId);
  }, [playerTracks, homography, canvasSize, orientation, flipped, routeMode]);

  useEffect(() => {
    const resize = () => {
      const parent = canvasRef.current?.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        if (rect.width > 0) {
          setCanvasSize({ width: Math.round(rect.width), height: 440 });
        }
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="mt-6">
      {/* 2D Map View Controls */}
      <div
        style={{
          background: t.insetBg,
          border: `1px solid ${t.border}`,
          color: t.text,
        }}
        className="flex flex-wrap items-center justify-between gap-3 mb-3 p-3 rounded text-xs"
      >
        <div className="flex items-center gap-2">
          <span style={{ color: t.muted }} className="font-semibold">Map Orientation:</span>
          <button
            type="button"
            onClick={() => setOrientation("sideline")}
            className={`px-3 py-1.5 rounded font-medium ${
              orientation === "sideline"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Sideline (Horizontal)
          </button>
          <button
            type="button"
            onClick={() => setOrientation("endzone")}
            className={`px-3 py-1.5 rounded font-medium ${
              orientation === "endzone"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Endzone (Vertical)
          </button>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="px-3 py-1.5 rounded font-medium bg-gray-700 text-gray-200 hover:bg-gray-600"
          >
            Flip 180°
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-semibold">Routes:</span>
          {[
            ["full", "Full Routes"],
            ["trail", "Last 2.5s"],
            ["dots", "Dots Only"],
          ].map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setRouteMode(mode)}
              className={`px-3 py-1.5 rounded font-medium ${
                routeMode === mode
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Large Side-by-Side Video & 2D Field */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
        <div className="flex justify-center items-center bg-black rounded overflow-hidden border border-gray-700">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            onLoadedMetadata={() => {
              if (videoRef.current && startSec > 0) {
                videoRef.current.currentTime = startSec;
              }
            }}
            className="w-full h-[440px] object-contain"
            crossOrigin="anonymous"
          />
        </div>
        <div className="w-full h-[440px]">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="border border-gray-600 rounded w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}

SplitScreen.propTypes = {
  videoUrl: PropTypes.string.isRequired,
  trackingData: PropTypes.array.isRequired,
  fps: PropTypes.number.isRequired,
  homography: PropTypes.array,
  startSec: PropTypes.number,
  initialOrientation: PropTypes.string,
  themeName: PropTypes.string,
};