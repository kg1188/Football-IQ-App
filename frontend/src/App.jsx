import React, { useState } from "react";
import Calibration from "./components/Calibration.jsx";
import SplitScreen from "./components/SplitScreen.jsx";
import Phase5 from "./components/Phase5.jsx";
import MegaTrainer from "./components/MegaTrainer.jsx";
import FootballGlossaryDrawer from "./components/FootballGlossaryDrawer.jsx";
import { getCoachTheme } from "./data/coachTheme.js";

export default function App() {
  const [activeTab, setActiveTab] = useState("trainer"); // "trainer" or "spatial"
  const [themeName, setThemeName] = useState(() => {
    try {
      return localStorage.getItem("coach_theme") || "light";
    } catch {
      return "light";
    }
  });
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  const [file, setFile] = useState(null);
  const [startSec, setStartSec] = useState("3");
  const [endSec, setEndSec] = useState("15");
  const [status, setStatus] = useState("");
  const [videoInfo, setVideoInfo] = useState(null);
  const [homography, setHomography] = useState(null);
  const [orientation, setOrientation] = useState("sideline");

  const t = getCoachTheme(themeName);

  const toggleTheme = (nextTheme) => {
    setThemeName(nextTheme);
    try {
      localStorage.setItem("coach_theme", nextTheme);
    } catch {
      // Ignore storage errors
    }
  };

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
      setStatus("Processing failed. Make sure the Python backend server is running.");
    }
  };

  const handleCalibrated = (matrix, selectedOrientation = "sideline") => {
    setHomography(matrix);
    setOrientation(selectedOrientation);
    setStatus("Calibration complete. Syncing video and field.");
  };

  return (
    <div style={{ minHeight: "100vh", background: t.backdrop, color: t.text }}>
      {/* Top Coach's Binder Navigation Bar */}
      <nav
        style={{
          background: t.headerBg,
          borderBottom: `2px solid ${t.headerBorder}`,
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            className="font-coach"
            style={{
              fontWeight: 800,
              fontSize: "24px",
              letterSpacing: "0.03em",
              color: t.text,
            }}
          >
            FOOTBALL ANALYTICS AI
          </span>
          <span
            className="font-coach"
            style={{
              fontSize: "12px",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "4px",
              background: t.cardBg,
              border: `1px solid ${t.borderStrong}`,
              color: t.accent,
            }}
          >
            COACH&apos;S PLAYBOOK BINDER
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Primary Mode Tabs */}
          <button
            type="button"
            onClick={() => setActiveTab("trainer")}
            className="font-coach"
            style={{
              padding: "7px 14px",
              borderRadius: "6px",
              border: `1px solid ${activeTab === "trainer" ? t.accent : t.borderStrong}`,
              background: activeTab === "trainer" ? t.accent : t.cardBg,
              color: activeTab === "trainer" ? "#FFFFFF" : t.text,
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Mega Trainer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("spatial")}
            className="font-coach"
            style={{
              padding: "7px 14px",
              borderRadius: "6px",
              border: `1px solid ${activeTab === "spatial" ? t.accent : t.borderStrong}`,
              background: activeTab === "spatial" ? t.accent : t.cardBg,
              color: activeTab === "spatial" ? "#FFFFFF" : t.text,
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Spatial Hub (Film Room)
          </button>

          {/* Phase 3 #1: Playbook Reference Glossary Drawer Button */}
          <button
            type="button"
            onClick={() => setGlossaryOpen(true)}
            className="font-coach"
            style={{
              padding: "7px 13px",
              borderRadius: "6px",
              border: `1px solid ${t.goldBorder}`,
              background: t.goldBg,
              color: t.gold,
              fontSize: "15px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            📖 Playbook Reference
          </button>

          {/* Phase 2 #1: Persistent Dual Coach Theme Switcher */}
          <div
            style={{
              display: "flex",
              borderRadius: "6px",
              overflow: "hidden",
              border: `1px solid ${t.borderStrong}`,
              background: t.cardAlt,
            }}
          >
            <button
              type="button"
              onClick={() => toggleTheme("light")}
              style={{
                padding: "6px 10px",
                border: "none",
                background: themeName === "light" ? t.cardBg : "transparent",
                color: themeName === "light" ? t.text : t.muted,
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              📋 Clipboard Paper
            </button>
            <button
              type="button"
              onClick={() => toggleTheme("dark")}
              style={{
                padding: "6px 10px",
                border: "none",
                borderLeft: `1px solid ${t.border}`,
                background: themeName === "dark" ? "#262A2F" : "transparent",
                color: themeName === "dark" ? "#F5F2EB" : t.muted,
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              🏟️ Sideline Dark
            </button>
          </div>
        </div>
      </nav>

      {/* Active View */}
      {activeTab === "trainer" ? (
        <MegaTrainer themeName={themeName} />
      ) : (
        <div style={{ padding: "20px" }}>
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              background: t.cardBg,
              padding: "22px",
              borderRadius: "12px",
              border: `1px solid ${t.border}`,
              boxShadow: t.cardShadow,
            }}
          >
            <h1 className="font-coach" style={{ fontSize: "30px", fontWeight: 800, margin: "0 0 4px 0" }}>
              FOOTBALL SPATIAL HUB — ALL-22 FILM ROOM
            </h1>
            <p style={{ color: t.muted, margin: "0 0 16px 0", fontSize: "14px" }}>
              Upload an All-22 MP4 clip to generate tactical maps, homography calibration, and coaching insights.
            </p>

            <input
              type="file"
              accept="video/mp4"
              onChange={(e) => setFile(e.target.files[0])}
              style={{
                display: "block",
                width: "100%",
                fontSize: "13px",
                color: t.textSecondary,
                padding: "10px",
                borderRadius: "8px",
                border: `1px dashed ${t.borderStrong}`,
                background: t.cardAlt,
                marginBottom: "14px",
              }}
            />

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "14px", marginBottom: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: t.muted, fontWeight: 700, marginBottom: "4px" }}>
                  Start (sec)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={startSec}
                  onChange={(e) => setStartSec(e.target.value)}
                  style={{
                    width: "92px",
                    padding: "7px 10px",
                    borderRadius: "6px",
                    background: t.cardAlt,
                    border: `1px solid ${t.borderStrong}`,
                    color: t.text,
                    fontSize: "13px",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: t.muted, fontWeight: 700, marginBottom: "4px" }}>
                  End (sec, 0 = full)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={endSec}
                  onChange={(e) => setEndSec(e.target.value)}
                  style={{
                    width: "120px",
                    padding: "7px 10px",
                    borderRadius: "6px",
                    background: t.cardAlt,
                    border: `1px solid ${t.borderStrong}`,
                    color: t.text,
                    fontSize: "13px",
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleProcess}
                className="font-coach"
                style={{
                  background: "#15803D",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: "16px",
                  padding: "8px 22px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Process Film
              </button>
            </div>

            {status && (
              <p className="font-mono-coach" style={{ marginTop: "8px", color: t.gold, fontSize: "13px", fontWeight: 700 }}>
                {status}
              </p>
            )}

            {videoInfo && !homography && (
              <Calibration frame1Url={videoInfo.frame1_url} onCalibrated={handleCalibrated} themeName={themeName} />
            )}

            {videoInfo && homography && (
              <SplitScreen
                videoUrl={videoInfo.video_url}
                trackingData={videoInfo.tracking}
                fps={videoInfo.fps}
                homography={homography}
                startSec={videoInfo.start_sec || 0}
                initialOrientation={orientation}
                themeName={themeName}
              />
            )}

            {videoInfo && homography && (
              <Phase5 trackingData={videoInfo.tracking} fps={videoInfo.fps} themeName={themeName} />
            )}
          </div>
        </div>
      )}

      {/* Slide-out Playbook Reference Drawer */}
      <FootballGlossaryDrawer
        isOpen={glossaryOpen}
        onClose={() => setGlossaryOpen(false)}
        themeName={themeName}
      />
    </div>
  );
}
