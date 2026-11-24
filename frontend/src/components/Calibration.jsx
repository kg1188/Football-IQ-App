import React, { useRef, useState } from "react";

export default function Calibration({ frame1Url, onCalibrated }) {
  const imgRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [orientation, setOrientation] = useState("sideline"); // "sideline" | "endzone"
  const [yardA, setYardA] = useState("30"); // Sideline: Left Yard | Endzone: Top (Far) Yard
  const [yardB, setYardB] = useState("80"); // Sideline: Right Yard | Endzone: Bottom (Near) Yard
  const [status, setStatus] = useState(null);

  const handleOrientationChange = (nextOrientation) => {
    setOrientation(nextOrientation);
    setPoints([]);
    if (nextOrientation === "sideline") {
      setYardA("30");
      setYardB("80");
    } else {
      setYardA("60"); // 50-yard line near top of endzone frame
      setYardB("10"); // Goal line near bottom of endzone frame
    }
  };

  const handleClick = (e) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const scaleX = (imgRef.current.naturalWidth || rect.width) / rect.width;
    const scaleY = (imgRef.current.naturalHeight || rect.height) / rect.height;

    const displayX = Math.round(e.clientX - rect.left);
    const displayY = Math.round(e.clientY - rect.top);

    setPoints((prev) => {
      const next = [
        ...prev,
        {
          displayX,
          displayY,
          x: Math.round(displayX * scaleX),
          y: Math.round(displayY * scaleY),
        },
      ];
      return next.slice(0, 4);
    });
  };

  const buildYardPoints = (a, b) => {
    if (orientation === "sideline") {
      // Top-Left, Top-Right, Bottom-Right, Bottom-Left along the sidelines
      return [
        [a, 0],
        [b, 0],
        [b, 53.33],
        [a, 53.33],
      ];
    }
    // Endzone view: Top-Left, Top-Right, Bottom-Right, Bottom-Left looking down the field
    return [
      [a, 0],
      [a, 53.33],
      [b, 53.33],
      [b, 0],
    ];
  };

  const submitPoints = async (pixelPoints, yardPoints) => {
    try {
      const resp = await fetch("http://localhost:8000/calibrate-homography/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pixel_points: pixelPoints,
          yard_points: yardPoints,
        }),
      });
      const data = await resp.json();
      setStatus("Calibration completed.");
      onCalibrated(data.homography, orientation);
    } catch (err) {
      console.error(err);
      setStatus("Calibration failed.");
    }
  };

  const applyCustomCalibration = () => {
    if (points.length !== 4) {
      setStatus("Click 4 yard-line corners in order: Top-Left, Top-Right, Bottom-Right, Bottom-Left.");
      return;
    }
    const a = parseFloat(yardA) || 0;
    const b = parseFloat(yardB) || 120;
    submitPoints(
      points.map((p) => [p.x, p.y]),
      buildYardPoints(a, b)
    );
  };

  const autoEstimate = () => {
    const w = imgRef.current?.naturalWidth || 1280;
    const h = imgRef.current?.naturalHeight || 720;
    const a = parseFloat(yardA) || (orientation === "sideline" ? 30 : 60);
    const b = parseFloat(yardB) || (orientation === "sideline" ? 80 : 10);
    submitPoints(
      [
        [0, 0],
        [w, 0],
        [w, h],
        [0, h],
      ],
      buildYardPoints(a, b)
    );
  };

  const reset = () => {
    setPoints([]);
    setStatus(null);
  };

  const polygonPoints = points.map((p) => `${p.displayX},${p.displayY}`).join(" ");

  return (
    <div className="mt-6 p-4 border rounded bg-gray-50 text-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <h2 className="text-xl font-bold text-gray-900">4-Point Field Calibration</h2>
        <div className="flex rounded overflow-hidden border border-gray-400 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleOrientationChange("sideline")}
            className={`px-3 py-1.5 ${
              orientation === "sideline" ? "bg-blue-600 text-white" : "bg-white text-gray-800"
            }`}
          >
            Sideline View (Horizontal)
          </button>
          <button
            type="button"
            onClick={() => handleOrientationChange("endzone")}
            className={`px-3 py-1.5 ${
              orientation === "endzone" ? "bg-blue-600 text-white" : "bg-white text-gray-800"
            }`}
          >
            Endzone View (Vertical)
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3">
        Click 4 corners where two yard lines meet the sidelines in order:{" "}
        <strong>1. Top-Left → 2. Top-Right → 3. Bottom-Right → 4. Bottom-Left</strong>.
      </p>

      <div className="flex flex-wrap gap-4 mb-3 text-xs text-gray-700 bg-gray-200 p-2.5 rounded">
        <div>
          <label className="block font-semibold mb-1">
            {orientation === "sideline" ? "Left Yard Line (0–120)" : "Top / Far Yard Line (0–120)"}
          </label>
          <input
            type="number"
            value={yardA}
            onChange={(e) => setYardA(e.target.value)}
            className="w-24 px-2 py-1 border border-gray-400 rounded bg-white text-gray-900"
          />
          <span className="ml-2 text-gray-600">(Goal=10, 20yd=30, 50yd=60)</span>
        </div>
        <div>
          <label className="block font-semibold mb-1">
            {orientation === "sideline" ? "Right Yard Line (0–120)" : "Bottom / Near Yard Line (0–120)"}
          </label>
          <input
            type="number"
            value={yardB}
            onChange={(e) => setYardB(e.target.value)}
            className="w-24 px-2 py-1 border border-gray-400 rounded bg-white text-gray-900"
          />
          <span className="ml-2 text-gray-600">(Goal=10, 50yd=60, Opp 20yd=90)</span>
        </div>
      </div>

      <div className="relative inline-block">
        <img
          src={frame1Url}
          alt="First frame"
          ref={imgRef}
          onClick={handleClick}
          className="cursor-crosshair max-w-full border border-gray-300"
        />
        {points.length > 1 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <polygon
              points={polygonPoints}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="#ef4444"
              strokeWidth="2"
            />
          </svg>
        )}
        {points.map((p, i) => (
          <div
            key={i}
            className="absolute w-5 h-5 bg-red-600 text-white text-[11px] font-bold flex items-center justify-center border border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${p.displayX}px`, top: `${p.displayY}px` }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-medium"
          onClick={applyCustomCalibration}
        >
          Apply 4-Point Calibration ({points.length}/4)
        </button>
        <button
          className="px-4 py-1.5 bg-gray-700 hover:bg-gray-800 text-white rounded font-medium"
          onClick={autoEstimate}
        >
          Skip / Auto-Estimate
        </button>
        <button
          className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-medium"
          onClick={reset}
        >
          Reset
        </button>
      </div>
      {status && <p className="mt-2 text-sm font-medium text-gray-800">{status}</p>}
    </div>
  );
}