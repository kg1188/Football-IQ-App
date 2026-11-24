import React, { useState } from "react";
import Calibration from "./components/Calibration.jsx";
import SplitScreen from "./components/SplitScreen.jsx";
import Phase5 from "./components/Phase5.jsx";
import MegaTrainer from "./components/MegaTrainer.jsx";

export default function App() {
  const [activeTab, setActiveTab] = useState("trainer"); // "trainer" or "spatial"
  const [file, setFile] = useState(null);
  const [startSec, setStartSec] = useState("3");
  const [endSec, setEndSec] = useState("15");
  const [status, setStatus] = useState("");
  const [videoInfo, setVideoInfo] = useState(null);
  const [homography, setHomography] = useState(null);
  const [orientation, setOrientation] = useState("sideline");

  const handleProcess = async () => {
    if (!file) return;
    setVideoInfo(null);
    setHomography(null);
    setStatus("Uploading and processing film...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("start_sec", startSec || "0");
    formData.append("end_sec", endSec || "0");

    try {
      const response = await fetch("http://localhost:8000/process-video/", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setVideoInfo(data);
      setStatus("Video processed. Ready for calibration.");
    } catch (error) {
      console.error(error);
      setStatus("Processing failed. Ensure backend is running.");
    }
  };

  const handleCalibrated = (matrix, selectedOrientation = "sideline") => {
    setHomography(matrix);
    setOrientation(selectedOrientation);
    setStatus("Calibration complete. Syncing video and field.");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-950 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <span className="font-bold text-lg tracking-wide text-blue-400">
          Football Analytics AI
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("trainer")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              activeTab === "trainer"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Mega Trainer
          </button>
          <button
            onClick={() => setActiveTab("spatial")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              activeTab === "spatial"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Spatial Hub (Film Room)
          </button>
        </div>
      </nav>

      {/* Active View */}
      {activeTab === "trainer" ? (
        <MegaTrainer />
      ) : (
        <div className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h1 className="text-3xl font-bold mb-2">Football Spatial Hub</h1>
            <p className="text-gray-400 mb-4">
              Upload an All-22 MP4 clip to generate tactical maps and coaching insights.
            </p>

            <input
              type="file"
              accept="video/mp4"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 mb-4"
            />

            <div className="flex flex-wrap items-end gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Start (sec)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={startSec}
                  onChange={(e) => setStartSec(e.target.value)}
                  className="w-24 px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">End (sec, 0 = full)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={endSec}
                  onChange={(e) => setEndSec(e.target.value)}
                  className="w-32 px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white text-sm"
                />
              </div>
              <button
                onClick={handleProcess}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors"
              >
                Process Film
              </button>
            </div>

            {status && <p className="mt-2 text-yellow-400 font-mono text-sm">{status}</p>}

            {videoInfo && !homography && (
              <Calibration frame1Url={videoInfo.frame1_url} onCalibrated={handleCalibrated} />
            )}

            {videoInfo && homography && (
              <SplitScreen
                videoUrl={videoInfo.video_url}
                trackingData={videoInfo.tracking}
                fps={videoInfo.fps}
                homography={homography}
                startSec={videoInfo.start_sec || 0}
                initialOrientation={orientation}
              />
            )}

            {videoInfo && homography && (
              <Phase5 trackingData={videoInfo.tracking} fps={videoInfo.fps} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}