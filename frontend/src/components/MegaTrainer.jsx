// frontend/src/components/MegaTrainer.jsx
import React, { useState, useRef } from "react";
import {
  SCHEME_BASICS,
  SCENARIOS,
  GAP_GRID,
  INITIAL_PLAYBOOK,
  DEFAULT_DESIGNER_PLAYERS,
} from "../data/playbookData";

const ROUTE_STYLES = {
  pass: { color: "#facc15", dash: "", label: "Pass Route (Yellow)" },
  motion: { color: "#38bdf8", dash: "2 1.2", label: "Pre-Snap Motion (Dashed Blue)" },
  run: { color: "#fb923c", dash: "", label: "Run Path (Orange)" },
  block: { color: "#cbd5e1", dash: "1 0.8", label: "Block Assignment (Gray)" },
};

export default function MegaTrainer() {
  const [mode, setMode] = useState("basics"); // "basics" | "pbp" | "position" | "playbook"

  // --- 1. SCHEME BASICS STATE ---
  const [schemeIdx, setSchemeIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [basicAnswer, setBasicAnswer] = useState(null);
  const scheme = SCHEME_BASICS[schemeIdx];
  const currentStep = scheme.steps[stepIdx];

  // --- 2. PLAY-BY-PLAY / POSITION STATE ---
  const [posFilter, setPosFilter] = useState("ALL");
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [snapped, setSnapped] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showGaps, setShowGaps] = useState(true);
  const [showBox, setShowBox] = useState(true);
  const [showZones, setShowZones] = useState(false);

  const filteredScenarios =
    posFilter === "ALL"
      ? SCENARIOS
      : SCENARIOS.filter((s) => s.position === posFilter || s.side === posFilter);
  const scenario = filteredScenarios[scenarioIdx % filteredScenarios.length] || SCENARIOS[0];

  // --- 3. PLAYBOOK & INTERACTIVE DESIGNER STATE ---
  const [playbook, setPlaybook] = useState(() => {
    const saved = localStorage.getItem("custom_playbook_v1");
    return saved ? [...INITIAL_PLAYBOOK, ...JSON.parse(saved)] : INITIAL_PLAYBOOK;
  });
  const [playbookView, setPlaybookView] = useState("library"); // "library" | "designer"
  const [activePlayId, setActivePlayId] = useState(INITIAL_PLAYBOOK[0].id);
  const [simPlaying, setSimPlaying] = useState(false);

  // Designer state
  const [designerPlayers, setDesignerPlayers] = useState(DEFAULT_DESIGNER_PLAYERS);
  const [selectedPlayerId, setSelectedPlayerId] = useState("Z");
  const [toolMode, setToolMode] = useState("drag"); // "drag" | "draw"
  const [routeType, setRouteType] = useState("pass");
  const [draggingId, setDraggingId] = useState(null);
  const [newPlayName, setNewPlayName] = useState("");
  const [newPlayBeats, setNewPlayBeats] = useState("Cover 3");
  const [copyMsg, setCopyMsg] = useState("");
  const svgRef = useRef(null);

  const activePlay = playbook.find((p) => p.id === activePlayId) || playbook[0];

  // Helper: Convert mouse click to 100x60 SVG coords
  const getSvgCoords = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 60;
    return { x: Math.max(2, Math.min(98, +x.toFixed(1))), y: Math.max(2, Math.min(58, +y.toFixed(1))) };
  };

  const handleFieldPointerMove = (e) => {
    if (!draggingId || toolMode !== "drag") return;
    const { x, y } = getSvgCoords(e);
    setDesignerPlayers((prev) =>
      prev.map((p) => (p.id === draggingId ? { ...p, x, y } : p))
    );
  };

  const handleFieldClick = (e) => {
    if (toolMode !== "draw" || !selectedPlayerId) return;
    const pt = getSvgCoords(e);
    setDesignerPlayers((prev) =>
      prev.map((p) =>
        p.id === selectedPlayerId
          ? { ...p, routeType, path: [...p.path, pt] }
          : p
      )
    );
  };

  const clearSelectedRoute = () => {
    setDesignerPlayers((prev) =>
      prev.map((p) => (p.id === selectedPlayerId ? { ...p, path: [] } : p))
    );
  };

  const saveCustomPlay = () => {
    if (!newPlayName.trim()) return alert("Give your play a name first!");
    const newPlay = {
      id: `custom-${Date.now()}`,
      name: newPlayName.trim(),
      side: "Offense",
      category: "Custom",
      beats: newPlayBeats,
      description: "Custom play created in the Scheme Lab.",
      players: designerPlayers,
    };
    const updated = [...playbook, newPlay];
    setPlaybook(updated);
    const customOnly = updated.filter((p) => p.id.startsWith("custom-"));
    localStorage.setItem("custom_playbook_v1", JSON.stringify(customOnly));
    setActivePlayId(newPlay.id);
    setNewPlayName("");
    setPlaybookView("library");
  };

  const copyPlayJson = () => {
    const snippet = JSON.stringify(
      {
        id: `custom-${Date.now()}`,
        name: newPlayName || "My Custom Play",
        side: "Offense",
        category: "Custom",
        beats: newPlayBeats,
        players: designerPlayers,
      },
      null,
      2
    );
    navigator.clipboard.writeText(snippet);
    setCopyMsg("Copied JSON!");
    setTimeout(() => setCopyMsg(""), 2000);
  };

  // Render a player's polyline path + endpoint
  const renderPath = (p, keyPrefix) => {
    if (!p.path || p.path.length === 0) return null;
    const style = ROUTE_STYLES[p.routeType] || ROUTE_STYLES.pass;
    const points = [`${p.x},${p.y}`, ...p.path.map((pt) => `${pt.x},${pt.y}`)].join(" ");
    const end = p.path[p.path.length - 1];
    return (
      <g key={`${keyPrefix}-path-${p.id}`}>
        <polyline
          points={points}
          fill="none"
          stroke={style.color}
          strokeWidth="0.65"
          strokeDasharray={style.dash}
        />
        <circle cx={end.x} cy={end.y} r="1.1" fill={style.color} />
      </g>
    );
  };

  return (
    <div style={{ background: "#0f172a", color: "#f8fafc", minHeight: "100vh", padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      {/* 4-Tab Sub-Navigation */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap", borderBottom: "1px solid #1e293b", paddingBottom: "12px" }}>
        {[
          { id: "basics", label: "1. Scheme Basics (Step-by-Step)" },
          { id: "pbp", label: "2. Play-by-Play Training" },
          { id: "position", label: "3. Position Training" },
          { id: "playbook", label: "4. Playbook & Scheme Lab" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "14px",
              background: mode === tab.id ? "#2563eb" : "#1e293b",
              color: mode === tab.id ? "#fff" : "#94a3b8",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================= TAB 1: SCHEME BASICS (4-STEP SPOTLIGHT) ================= */}
      {mode === "basics" && (
        <div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
            {SCHEME_BASICS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => { setSchemeIdx(idx); setStepIdx(0); setBasicAnswer(null); }}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  background: schemeIdx === idx ? "#0ea5e9" : "#1e293b",
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                {s.name.split(" (")[0]}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", alignItems: "start" }}>
            {/* Spotlight Field */}
            <div style={{ background: "#1e293b", borderRadius: "12px", padding: "14px" }}>
              <div style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
                <strong>{scheme.name}</strong>
                <span style={{ color: "#38bdf8", fontSize: "13px" }}>
                  Step {stepIdx + 1} of {scheme.steps.length}
                </span>
              </div>
              <svg viewBox="0 0 100 50" style={{ width: "100%", borderRadius: "8px", background: "#14532d" }}>
                {[10, 20, 30, 40].map((y) => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" />
                ))}
                <line x1="0" y1="35" x2="100" y2="35" stroke="#38bdf8" strokeWidth="0.6" strokeDasharray="1.5 1" />

                {/* Zone Bubbles on final step or after answering */}
                {(currentStep.showWeaknesses || basicAnswer) &&
                  scheme.zoneBubbles.map((z, i) => (
                    <g key={i}>
                      <ellipse cx={z.x} cy={z.y} rx={z.rx} ry={z.ry} fill="rgba(59,130,246,0.22)" stroke="#60a5fa" strokeWidth="0.3" />
                      <text x={z.x} y={z.y + 0.8} fill="#bfdbfe" fontSize="2" textAnchor="middle">{z.label}</text>
                    </g>
                  ))}

                {/* Soft Spots */}
                {currentStep.showWeaknesses &&
                  scheme.weaknesses.map((w, i) => (
                    <g key={i}>
                      <circle cx={w.x} cy={w.y} r={w.r} fill="rgba(250,204,21,0.3)" stroke="#facc15" strokeWidth="0.5" strokeDasharray="1 0.8" />
                      <text x={w.x} y={w.y + 0.7} fill="#fef08a" fontSize="1.9" textAnchor="middle" fontWeight="bold">{w.label}</text>
                    </g>
                  ))}

                {/* Static Offense Reference */}
                {[40, 45, 50, 55, 60].map((x, i) => (
                  <circle key={`ol-${i}`} cx={x} cy="37" r="1.7" fill="#334155" opacity="0.7" />
                ))}
                <circle cx="50" cy="43" r="1.8" fill="#2563eb" opacity="0.8" />
                <text x="50" y="43.6" fill="#fff" fontSize="1.5" textAnchor="middle">QB</text>

                {/* Defense with Spotlight Dimming */}
                {scheme.defense.map((d) => {
                  const isSpot = currentStep.spotlightIds.includes(d.id);
                  return (
                    <g key={d.id} opacity={isSpot ? 1 : 0.25}>
                      {isSpot && <circle cx={d.x} cy={d.y} r="3.4" fill="rgba(250,204,21,0.35)" />}
                      <circle cx={d.x} cy={d.y} r="2.2" fill="#dc2626" stroke={isSpot ? "#facc15" : "#fff"} strokeWidth={isSpot ? "0.6" : "0.3"} />
                      <text x={d.x} y={d.y + 0.7} fill="#fff" fontSize="1.7" textAnchor="middle" fontWeight="bold">{d.label}</text>
                    </g>
                  );
                })}
              </svg>

              {/* What Works Best Against This Scheme */}
              <div style={{ marginTop: "14px", background: "#0f172a", padding: "12px", borderRadius: "8px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#4ade80", marginBottom: "6px" }}>
                  WHAT WORKS BEST AGAINST {scheme.name.split(" (")[0].toUpperCase()}:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px" }}>
                  {scheme.bestBeaters.map((b, i) => (
                    <div key={i} style={{ background: "#1e293b", padding: "8px 10px", borderRadius: "6px", fontSize: "12px" }}>
                      <strong style={{ color: "#facc15" }}>{b.name}</strong>
                      <div style={{ color: "#cbd5e1", marginTop: "3px" }}>{b.why}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Plain-English Step Card */}
            <div style={{ background: "#1e293b", borderRadius: "12px", padding: "16px" }}>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>{scheme.plainEnglish}</div>
              <h3 style={{ margin: "8px 0", color: "#38bdf8" }}>{currentStep.stepTitle}</h3>
              <p style={{ fontSize: "14px", color: "#f8fafc", lineHeight: 1.5 }}>{currentStep.question}</p>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                {currentStep.options.map((opt, idx) => {
                  let bg = "#334155";
                  if (basicAnswer) {
                    if (opt.correct) bg = "#15803d";
                    else if (basicAnswer === opt) bg = "#b91c1c";
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => setBasicAnswer(opt)}
                      style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "none",
                        background: bg,
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>

              {basicAnswer && (
                <div style={{ marginTop: "14px", padding: "12px", background: "#0f172a", borderRadius: "8px", borderLeft: "4px solid #4ade80" }}>
                  <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.5 }}>{currentStep.explanation}</p>
                  <button
                    onClick={() => {
                      setBasicAnswer(null);
                      if (stepIdx < scheme.steps.length - 1) setStepIdx(stepIdx + 1);
                      else {
                        setStepIdx(0);
                        setSchemeIdx((schemeIdx + 1) % SCHEME_BASICS.length);
                      }
                    }}
                    style={{ marginTop: "10px", width: "100%", padding: "8px", borderRadius: "6px", border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                  >
                    {stepIdx < scheme.steps.length - 1 ? "Next Step →" : "Next Coverage Scheme →"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TABS 2 & 3: PLAY-BY-PLAY & POSITION TRAINING ================= */}
      {(mode === "pbp" || mode === "position") && (
        <div>
          {mode === "position" && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
              {["ALL", "QB", "OL", "LB"].map((pos) => (
                <button
                  key={pos}
                  onClick={() => { setPosFilter(pos); setScenarioIdx(0); setSnapped(false); setSelectedOption(null); }}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    background: posFilter === pos ? "#10b981" : "#1e293b",
                    color: posFilter === pos ? "#000" : "#fff",
                    fontWeight: 700,
                  }}
                >
                  {pos === "ALL" ? "All Positions" : pos}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", alignItems: "start" }}>
            <div style={{ background: "#1e293b", borderRadius: "12px", padding: "12px" }}>
              <div style={{ display: "flex", gap: "12px", marginBottom: "10px", fontSize: "13px", flexWrap: "wrap" }}>
                <label><input type="checkbox" checked={showGaps} onChange={(e) => setShowGaps(e.target.checked)} /> Gaps</label>
                <label><input type="checkbox" checked={showBox} onChange={(e) => setShowBox(e.target.checked)} /> Box ({scenario.boxCount} - {scenario.boxStatus})</label>
                <label><input type="checkbox" checked={showZones} onChange={(e) => setShowZones(e.target.checked)} /> Zones</label>
                <button
                  onClick={() => setSnapped(!snapped)}
                  style={{ marginLeft: "auto", padding: "4px 10px", borderRadius: "6px", border: "none", background: "#10b981", color: "#000", fontWeight: 700, cursor: "pointer" }}
                >
                  {snapped ? "Reset Pre-Snap" : "Animate Snap"}
                </button>
              </div>

              <svg viewBox="0 0 100 60" style={{ width: "100%", borderRadius: "8px", background: "#14532d" }}>
                {[10, 20, 30, 40, 50].map((y) => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.18)" strokeWidth="0.3" />
                ))}
                <line x1="0" y1="35" x2="100" y2="35" stroke="#38bdf8" strokeWidth="0.6" strokeDasharray="1.5 1" />
                {showBox && (
                  <rect x="35" y="24" width="30" height="12" fill={scenario.boxStatus === "HEAVY" ? "rgba(239,68,68,0.18)" : "rgba(34,197,94,0.18)"} stroke={scenario.boxStatus === "HEAVY" ? "#ef4444" : "#22c55e"} strokeWidth="0.4" strokeDasharray="1 1" />
                )}
                {showGaps && GAP_GRID.map((g, i) => (
                  <text key={i} x={g.x} y="34.4" fill="#fde047" fontSize="2.2" textAnchor="middle" fontWeight="bold">{g.label}</text>
                ))}
                {showZones && scenario.zoneBubbles.map((z, i) => (
                  <ellipse key={i} cx={z.x} cy={z.y} rx={z.rx} ry={z.ry} fill="rgba(59,130,246,0.22)" stroke="#60a5fa" strokeWidth="0.3" />
                ))}
                {snapped && scenario.offense.map((p, i) => (
                  <line key={`ol-${i}`} x1={p.x} y1={p.y} x2={p.postX} y2={p.postY} stroke="#facc15" strokeWidth="0.45" strokeDasharray="1 0.6" />
                ))}
                {scenario.offense.map((p, i) => (
                  <g key={`o-${i}`} style={{ transition: "all 0.9s ease" }}>
                    <circle cx={snapped ? p.postX : p.x} cy={snapped ? p.postY : p.y} r="2.1" fill="#2563eb" stroke="#fff" strokeWidth="0.4" />
                    <text x={snapped ? p.postX : p.x} y={(snapped ? p.postY : p.y) + 0.7} fill="#fff" fontSize="1.8" textAnchor="middle" fontWeight="bold">{p.id}</text>
                  </g>
                ))}
                {scenario.defense.map((p, i) => (
                  <g key={`d-${i}`} style={{ transition: "all 0.9s ease" }}>
                    <circle cx={snapped ? p.postX : p.x} cy={snapped ? p.postY : p.y} r="2.1" fill="#dc2626" stroke="#fff" strokeWidth="0.4" />
                    <text x={snapped ? p.postX : p.x} y={(snapped ? p.postY : p.y) + 0.7} fill="#fff" fontSize="1.7" textAnchor="middle" fontWeight="bold">{p.id}</text>
                  </g>
                ))}
              </svg>
            </div>

            <div style={{ background: "#1e293b", borderRadius: "12px", padding: "16px" }}>
              <div style={{ fontSize: "12px", color: "#38bdf8", fontWeight: 700 }}>{scenario.position} DRILL • {scenario.coverage}</div>
              <h3 style={{ marginTop: "6px" }}>{scenario.title}</h3>
              <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.5 }}>{scenario.prompt}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                {scenario.options.map((opt) => {
                  let bg = "#334155";
                  if (selectedOption) {
                    if (opt.correct) bg = "#15803d";
                    else if (selectedOption.id === opt.id) bg = "#b91c1c";
                  }
                  return (
                    <button
                      key={opt.id}
                      onClick={() => { setSelectedOption(opt); setSnapped(true); setShowZones(true); }}
                      style={{ textAlign: "left", padding: "10px 12px", borderRadius: "8px", border: "none", background: bg, color: "#fff", cursor: "pointer", fontSize: "14px" }}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
              {selectedOption && (
                <div style={{ marginTop: "14px", padding: "12px", background: "#0f172a", borderRadius: "8px" }}>
                  <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1" }}>{scenario.coachingTakeaway}</p>
                  <button
                    onClick={() => { setScenarioIdx((i) => i + 1); setSnapped(false); setSelectedOption(null); setShowZones(false); }}
                    style={{ marginTop: "10px", width: "100%", padding: "8px", borderRadius: "6px", border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                  >
                    Next Drill →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: PLAYBOOK LIBRARY & INTERACTIVE SCHEME LAB ================= */}
      {mode === "playbook" && (
        <div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <button
              onClick={() => { setPlaybookView("library"); setSimPlaying(false); }}
              style={{ padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: 700, background: playbookView === "library" ? "#0ea5e9" : "#1e293b", color: "#fff" }}
            >
              Playbook Library ({playbook.length})
            </button>
            <button
              onClick={() => { setPlaybookView("designer"); setSimPlaying(false); }}
              style={{ padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: 700, background: playbookView === "designer" ? "#10b981" : "#1e293b", color: playbookView === "designer" ? "#000" : "#fff" }}
            >
              + Scheme Lab (Draw & Test Plays)
            </button>
          </div>

          {playbookView === "library" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px", alignItems: "start" }}>
              {/* Play List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {playbook.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setActivePlayId(p.id); setSimPlaying(false); }}
                    style={{
                      textAlign: "left",
                      padding: "12px",
                      borderRadius: "8px",
                      border: activePlayId === p.id ? "2px solid #38bdf8" : "1px solid #334155",
                      background: "#1e293b",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: "12px", color: "#4ade80", marginTop: "2px" }}>Beats: {p.beats}</div>
                  </button>
                ))}
              </div>

              {/* Play Viewer */}
              <div style={{ background: "#1e293b", borderRadius: "12px", padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{activePlay.name}</h3>
                    <span style={{ fontSize: "13px", color: "#cbd5e1" }}>{activePlay.description}</span>
                  </div>
                  <button
                    onClick={() => setSimPlaying(!simPlaying)}
                    style={{ padding: "6px 14px", borderRadius: "6px", border: "none", background: "#10b981", color: "#000", fontWeight: 700, cursor: "pointer" }}
                  >
                    {simPlaying ? "Reset" : "Run Simulation"}
                  </button>
                </div>

                <svg viewBox="0 0 100 60" style={{ width: "100%", borderRadius: "8px", background: "#14532d" }}>
                  {[10, 20, 30, 40, 50].map((y) => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" />
                  ))}
                  <line x1="0" y1="35" x2="100" y2="35" stroke="#38bdf8" strokeWidth="0.6" strokeDasharray="1.5 1" />
                  {activePlay.players.map((p) => renderPath(p, "lib"))}
                  {activePlay.players.map((p) => {
                    const dest = simPlaying && p.path?.length ? p.path[p.path.length - 1] : { x: p.x, y: p.y };
                    return (
                      <g key={p.id} style={{ transition: "all 1s ease" }}>
                        <circle cx={dest.x} cy={dest.y} r="2.1" fill="#2563eb" stroke="#fff" strokeWidth="0.4" />
                        <text x={dest.x} y={dest.y + 0.7} fill="#fff" fontSize="1.7" textAnchor="middle" fontWeight="bold">{p.id}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          ) : (
            /* ================= INTERACTIVE SCHEME LAB (DRAG, DRAW, SIMULATE, SAVE) ================= */
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", alignItems: "start" }}>
              <div style={{ background: "#1e293b", borderRadius: "12px", padding: "14px" }}>
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    onClick={() => setToolMode("drag")}
                    style={{ padding: "5px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: 700, background: toolMode === "drag" ? "#2563eb" : "#334155", color: "#fff" }}
                  >
                    ✋ Drag Players
                  </button>
                  <button
                    onClick={() => setToolMode("draw")}
                    style={{ padding: "5px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: 700, background: toolMode === "draw" ? "#f59e0b" : "#334155", color: toolMode === "draw" ? "#000" : "#fff" }}
                  >
                    ✏️ Draw Route for [{selectedPlayerId}]
                  </button>
                  <button
                    onClick={clearSelectedRoute}
                    style={{ padding: "5px 10px", borderRadius: "6px", border: "none", cursor: "pointer", background: "#7f1d1d", color: "#fff", fontSize: "12px" }}
                  >
                    Clear {selectedPlayerId} Path
                  </button>
                  <button
                    onClick={() => setSimPlaying(!simPlaying)}
                    style={{ marginLeft: "auto", padding: "5px 14px", borderRadius: "6px", border: "none", background: "#10b981", color: "#000", fontWeight: 700, cursor: "pointer" }}
                  >
                    {simPlaying ? "Reset" : "▶ Run Simulation"}
                  </button>
                </div>

                <svg
                  ref={svgRef}
                  viewBox="0 0 100 60"
                  onPointerMove={handleFieldPointerMove}
                  onPointerUp={() => setDraggingId(null)}
                  onClick={handleFieldClick}
                  style={{ width: "100%", borderRadius: "8px", background: "#14532d", cursor: toolMode === "draw" ? "crosshair" : "default", touchAction: "none" }}
                >
                  {[10, 20, 30, 40, 50].map((y) => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" />
                  ))}
                  <line x1="0" y1="35" x2="100" y2="35" stroke="#38bdf8" strokeWidth="0.6" strokeDasharray="1.5 1" />

                  {designerPlayers.map((p) => renderPath(p, "des"))}

                  {designerPlayers.map((p) => {
                    const isSel = p.id === selectedPlayerId;
                    const dest = simPlaying && p.path.length ? p.path[p.path.length - 1] : { x: p.x, y: p.y };
                    return (
                      <g
                        key={p.id}
                        style={{ transition: draggingId ? "none" : "all 0.9s ease", cursor: "grab" }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          setSelectedPlayerId(p.id);
                          if (toolMode === "drag") setDraggingId(p.id);
                        }}
                      >
                        <circle cx={dest.x} cy={dest.y} r="2.3" fill="#2563eb" stroke={isSel ? "#facc15" : "#fff"} strokeWidth={isSel ? "0.7" : "0.4"} />
                        <text x={dest.x} y={dest.y + 0.7} fill="#fff" fontSize="1.7" textAnchor="middle" fontWeight="bold" style={{ pointerEvents: "none" }}>{p.id}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Designer Controls & Save */}
              <div style={{ background: "#1e293b", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <h3 style={{ margin: 0 }}>Scheme Lab Controls</h3>
                <div style={{ fontSize: "13px", color: "#cbd5e1" }}>
                  1. Click any player to select them.<br />
                  2. Use <strong>Drag Players</strong> to set your formation.<br />
                  3. Switch to <strong>Draw Route</strong> and click points on the field to build routes or motions.
                </div>

                <div>
                  <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Line Type</label>
                  <select
                    value={routeType}
                    onChange={(e) => setRouteType(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "#0f172a", color: "#fff", border: "1px solid #334155" }}
                  >
                    {Object.entries(ROUTE_STYLES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>

                <hr style={{ borderColor: "#334155", width: "100%" }} />

                <div>
                  <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Play Name</label>
                  <input
                    value={newPlayName}
                    onChange={(e) => setNewPlayName(e.target.value)}
                    placeholder="e.g. Trips Flood Right"
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "#0f172a", color: "#fff", border: "1px solid #334155", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Works Best Against</label>
                  <input
                    value={newPlayBeats}
                    onChange={(e) => setNewPlayBeats(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "#0f172a", color: "#fff", border: "1px solid #334155", boxSizing: "border-box" }}
                  />
                </div>

                <button
                  onClick={saveCustomPlay}
                  style={{ padding: "10px", borderRadius: "6px", border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  Save to Playbook
                </button>
                <button
                  onClick={copyPlayJson}
                  style={{ padding: "8px", borderRadius: "6px", border: "1px solid #475569", background: "transparent", color: "#cbd5e1", cursor: "pointer", fontSize: "13px" }}
                >
                  {copyMsg || "Copy Play JSON (for Permanent Library)"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}