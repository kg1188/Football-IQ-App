/* eslint-disable react/prop-types */
// frontend/src/components/MegaTrainer.jsx
import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  SCHEME_BASICS,
  OFFENSIVE_SCHEMES,
  SCENARIOS,
  GAP_GRID,
  INITIAL_PLAYBOOK,
} from "../data/playbookData";
import { LIVE_NFL_PLAYS } from "../data/livePlaysData";
import { evaluateShadowBox } from "../data/shadowBoxEngine";
import { getCoachTheme } from "../data/coachTheme";
import LivePlaySimulator from "./LivePlaySimulator";

const ROUTE_STYLES = {
  pass: { color: "#FACC15", dash: "", label: "Pass Route (Yellow)" },
  motion: { color: "#38BDF8", dash: "2 1.2", label: "Pre-Snap Motion (Dashed Blue)" },
  run: { color: "#FB923C", dash: "", label: "Run Path (Orange)" },
  block: { color: "#CBD5E1", dash: "1 0.8", label: "Block Assignment (Gray)" },
};

const POSITIONS = ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB"];

// Smoothly interpolates (x, y) and builds the partial polyline drawn up to progress (0..1)
function interpolateAlongPath(startX, startY, waypoints = [], progress = 1) {
  if (!waypoints || waypoints.length === 0 || progress <= 0) {
    return { x: startX, y: startY, drawnPoints: `${startX},${startY}` };
  }

  const pts = [{ x: startX, y: startY }, ...waypoints];
  if (progress >= 1) {
    const last = pts[pts.length - 1];
    return {
      x: last.x,
      y: last.y,
      drawnPoints: pts.map((p) => `${p.x},${p.y}`).join(" "),
    };
  }

  const segLengths = [];
  let totalLen = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    segLengths.push(d);
    totalLen += d;
  }

  if (totalLen === 0) {
    return { x: startX, y: startY, drawnPoints: `${startX},${startY}` };
  }

  const targetDist = totalLen * progress;
  let accum = 0;
  const drawn = [`${startX},${startY}`];

  for (let i = 0; i < segLengths.length; i++) {
    const seg = segLengths[i];
    if (accum + seg >= targetDist) {
      const ratio = seg > 0 ? (targetDist - accum) / seg : 0;
      const curX = +(pts[i].x + (pts[i + 1].x - pts[i].x) * ratio).toFixed(2);
      const curY = +(pts[i].y + (pts[i + 1].y - pts[i].y) * ratio).toFixed(2);
      drawn.push(`${curX},${curY}`);
      return { x: curX, y: curY, drawnPoints: drawn.join(" ") };
    }
    accum += seg;
    drawn.push(`${pts[i + 1].x},${pts[i + 1].y}`);
  }

  const last = pts[pts.length - 1];
  return { x: last.x, y: last.y, drawnPoints: drawn.join(" ") };
}

// Convert imported 10Hz NFL plays into Shadow-Box compatible plays (0-100 x 0-60 SVG field)
function convertLiveNflPlays(plays = []) {
  if (!Array.isArray(plays)) return [];
  return plays.map((play, idx) => {
    const rawPlayers = play.players || play.offense || [];
    const offenseOnly = rawPlayers.filter((p) => {
      const side = String(p.side || p.team || "").toUpperCase();
      return side === "O" || side === "OFF" || side === "OFFENSE" || !side;
    });

    const mappedPlayers = offenseOnly.slice(0, 11).map((p, pIdx) => {
      const role = String(p.position || p.pos || p.role || `P${pIdx + 1}`).toUpperCase();
      const id = p.label || (role === "WR" ? `WR${pIdx}` : role === "TE" ? "TE" : role);
      const frames = p.frames || p.track || [];

      const toSvg = (pt) => {
        const rawX = Number(pt.x ?? p.x ?? 26.65);
        const rawY = Number(pt.y ?? p.y ?? 37);
        const x = rawX <= 55 ? (rawX / 53.3) * 100 : rawX;
        const y = Math.max(4, Math.min(56, rawY));
        return { x: +x.toFixed(1), y: +y.toFixed(1) };
      };

      const start = frames.length > 0 ? toSvg(frames[0]) : toSvg(p);
      const sampledPath = [];
      if (frames.length > 1) {
        const step = Math.max(1, Math.floor(frames.length / 8));
        for (let f = step; f < frames.length; f += step) {
          sampledPath.push(toSvg(frames[f]));
        }
        const finalPt = toSvg(frames[frames.length - 1]);
        sampledPath.push(finalPt);
      }

      const routeType =
        role === "OL" || ["LT", "LG", "C", "RG", "RT"].includes(role)
          ? "block"
          : role === "RB" && String(play.playType || "").toUpperCase().includes("RUN")
            ? "run"
            : "pass";

      return {
        id,
        team: "O",
        x: start.x,
        y: start.y,
        routeType,
        path: sampledPath,
      };
    });

    return {
      id: play.id || `nfl-live-${idx}`,
      name: play.name || play.title || `NFL Play #${idx + 1}`,
      side: "Offense",
      category: "NFL Real Tracking",
      beats: play.postSnapCoverage || play.coverage || "Cover 3",
      description:
        play.description ||
        play.conceptNote ||
        "Real 10Hz NFL Next Gen Stats tracking play converted for Shadow-Box testing.",
      players: mappedPlayers.length > 0 ? mappedPlayers : INITIAL_PLAYBOOK[0].players,
    };
  });
}

function renderOffenseMarker(x, y, label, selected = false, opacity = 1) {
  return (
    <g opacity={opacity}>
      <circle
        cx={x}
        cy={y}
        r="2.1"
        fill="#FAF8F3"
        stroke={selected ? "#FACC15" : "#1D4ED8"}
        strokeWidth={selected ? "0.75" : "0.6"}
      />
      <text
        x={x}
        y={y + 0.65}
        fill="#1E3A8A"
        fontSize="1.65"
        textAnchor="middle"
        fontWeight="900"
        style={{ pointerEvents: "none" }}
      >
        {label}
      </text>
    </g>
  );
}

function renderDefenseXMarker(x, y, label, highlight = false, opacity = 1) {
  return (
    <g opacity={opacity}>
      {highlight && <circle cx={x} cy={y} r="3.4" fill="rgba(250, 204, 21, 0.32)" />}
      <circle
        cx={x}
        cy={y}
        r="2.25"
        fill="rgba(250, 248, 243, 0.9)"
        stroke={highlight ? "#D97706" : "rgba(220, 38, 38, 0.55)"}
        strokeWidth={highlight ? "0.55" : "0.3"}
      />
      <line
        x1={x - 1.05}
        y1={y - 1.05}
        x2={x + 1.05}
        y2={y + 1.05}
        stroke="#DC2626"
        strokeWidth="0.65"
        strokeLinecap="round"
        style={{ pointerEvents: "none" }}
      />
      <line
        x1={x + 1.05}
        y1={y - 1.05}
        x2={x - 1.05}
        y2={y + 1.05}
        stroke="#DC2626"
        strokeWidth="0.65"
        strokeLinecap="round"
        style={{ pointerEvents: "none" }}
      />
      <text
        x={x}
        y={y + 3.6}
        fill="#FAF8F3"
        fontSize="1.45"
        textAnchor="middle"
        fontWeight="800"
        style={{ pointerEvents: "none" }}
      >
        {label}
      </text>
    </g>
  );
}

export default function MegaTrainer({ themeName = "light" }) {
  const t = getCoachTheme(themeName);
  const [mode, setMode] = useState("basics"); // "basics" | "pbp" | "position" | "live" | "playbook"

  // --- 1. SCHEME BASICS STATE (DEFENSIVE COVERAGES + OFFENSIVE SCHEMES) ---
  const [schemeSide, setSchemeSide] = useState("defense"); // "defense" | "offense"
  const [schemeIdx, setSchemeIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [basicAnswer, setBasicAnswer] = useState(null);

  const activeSchemeList = schemeSide === "offense" ? OFFENSIVE_SCHEMES : SCHEME_BASICS;
  const scheme = activeSchemeList[schemeIdx % activeSchemeList.length] || activeSchemeList[0];
  const currentStep = scheme.steps[stepIdx % scheme.steps.length] || scheme.steps[0];

  // --- 2. PLAY-BY-PLAY / POSITION STATE + SMOOTH 0..1 ANIMATION ---
  const [posFilter, setPosFilter] = useState("ALL");
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [animProgress, setAnimProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showGaps, setShowGaps] = useState(true);
  const [showBox, setShowBox] = useState(true);
  const [showZones, setShowZones] = useState(false);

  const filteredScenarios =
    posFilter === "ALL"
      ? SCENARIOS
      : SCENARIOS.filter((s) => s.position === posFilter || s.side === posFilter);
  const scenario = filteredScenarios[scenarioIdx % filteredScenarios.length] || SCENARIOS[0];

  // --- 3. PLAYBOOK (40+ PLAYS) & INTERACTIVE SHADOW-BOX LAB STATE ---
  const convertedNflPlays = useMemo(() => convertLiveNflPlays(LIVE_NFL_PLAYS), []);

  const [playbook, setPlaybook] = useState(() => {
    try {
      const saved = localStorage.getItem("custom_playbook_v1");
      const custom = saved ? JSON.parse(saved) : [];
      return [...INITIAL_PLAYBOOK, ...convertLiveNflPlays(LIVE_NFL_PLAYS), ...custom];
    } catch {
      return [...INITIAL_PLAYBOOK, ...convertLiveNflPlays(LIVE_NFL_PLAYS)];
    }
  });
  const [playbookFilter, setPlaybookFilter] = useState("ALL"); // "ALL" | "CORE" | "NFL" | "CUSTOM"
  const [playbookView, setPlaybookView] = useState("designer"); // "library" | "designer"
  const [activePlayId, setActivePlayId] = useState(INITIAL_PLAYBOOK[0].id);

  // Smooth 0..1 animation progress for Tab 5
  const [labProgress, setLabProgress] = useState(0);
  const [labAnimating, setLabAnimating] = useState(false);

  const [designerPlayers, setDesignerPlayers] = useState(
    () => JSON.parse(JSON.stringify(INITIAL_PLAYBOOK[1].players))
  );
  const [selectedPlayerId, setSelectedPlayerId] = useState("Z");
  const [toolMode, setToolMode] = useState("drag"); // "drag" | "draw"
  const [routeType, setRouteType] = useState("pass");
  const [draggingTarget, setDraggingTarget] = useState(null);

  const [labCoverageId, setLabCoverageId] = useState("cover-2");
  const [labDefenders, setLabDefenders] = useState(() =>
    JSON.parse(JSON.stringify(SCHEME_BASICS[1].defense))
  );
  const [labPlayAction, setLabPlayAction] = useState(false);
  const [labPosition, setLabPosition] = useState("QB");
  const [showLabZones, setShowLabZones] = useState(true);

  const [newPlayName, setNewPlayName] = useState("");
  const [newPlayBeats, setNewPlayBeats] = useState("Cover 2");
  const [copyMsg, setCopyMsg] = useState("");
  const svgRef = useRef(null);

  // Smooth requestAnimationFrame driver for Tabs 2 & 3
  useEffect(() => {
    if (!isAnimating) return;
    let rafId;
    const durationMs = 2200;
    const startT = performance.now() - animProgress * durationMs;

    const tick = (now) => {
      const next = Math.min(1, (now - startT) / durationMs);
      setAnimProgress(next);
      if (next < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setIsAnimating(false);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isAnimating]);

  // Smooth requestAnimationFrame driver for Tab 5 (Shadow-Box & Playbook)
  useEffect(() => {
    if (!labAnimating) return;
    let rafId;
    const durationMs = 2200;
    const startT = performance.now() - labProgress * durationMs;

    const tick = (now) => {
      const next = Math.min(1, (now - startT) / durationMs);
      setLabProgress(next);
      if (next < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setLabAnimating(false);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [labAnimating]);

  const filteredPlaybook = useMemo(() => {
    if (playbookFilter === "CORE") {
      return playbook.filter((p) => !p.id.startsWith("nfl-live-") && !p.id.startsWith("custom-"));
    }
    if (playbookFilter === "NFL") {
      return playbook.filter((p) => p.id.startsWith("nfl-live-"));
    }
    if (playbookFilter === "CUSTOM") {
      return playbook.filter((p) => p.id.startsWith("custom-"));
    }
    return playbook;
  }, [playbook, playbookFilter]);

  const activePlay = playbook.find((p) => p.id === activePlayId) || playbook[0];
  const labSchemeObj = SCHEME_BASICS.find((s) => s.id === labCoverageId) || SCHEME_BASICS[0];

  const shadowResult = useMemo(() => {
    return evaluateShadowBox({
      offensePlayers: designerPlayers,
      schemeId: labCoverageId,
      customDefenders: labDefenders,
      playAction: labPlayAction,
      position: labPosition,
    });
  }, [designerPlayers, labCoverageId, labDefenders, labPlayAction, labPosition]);

  const handleCoverageChange = (newCovId) => {
    setLabCoverageId(newCovId);
    setLabAnimating(false);
    setLabProgress(0);
    const found = SCHEME_BASICS.find((s) => s.id === newCovId);
    if (found) {
      setLabDefenders(JSON.parse(JSON.stringify(found.defense)));
    }
  };

  const resetDefenseAlignment = () => {
    setLabAnimating(false);
    setLabProgress(0);
    setLabDefenders(JSON.parse(JSON.stringify(labSchemeObj.defense)));
  };

  const loadPlayIntoLab = (play) => {
    setDesignerPlayers(JSON.parse(JSON.stringify(play.players)));
    setNewPlayName(play.name);
    setNewPlayBeats(play.beats);
    setLabAnimating(false);
    setLabProgress(0);
    setPlaybookView("designer");
  };

  const getSvgCoords = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 60;
    return {
      x: Math.max(2, Math.min(98, +x.toFixed(1))),
      y: Math.max(2, Math.min(58, +y.toFixed(1))),
    };
  };

  const handleFieldPointerMove = (e) => {
    if (!draggingTarget || toolMode !== "drag") return;
    const { x, y } = getSvgCoords(e);
    if (draggingTarget.team === "O") {
      setDesignerPlayers((prev) =>
        prev.map((p) => (p.id === draggingTarget.id ? { ...p, x, y } : p))
      );
    } else {
      setLabDefenders((prev) =>
        prev.map((d) => (d.id === draggingTarget.id ? { ...d, x, y } : d))
      );
    }
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
      description: "Custom play created in the Shadow-Box Scheme Lab.",
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

  // Renders faint full blueprint pre-snap + solid active trail building dynamically during animation
  const renderAnimatedPath = (p, keyPrefix, progress) => {
    if (!p.path || p.path.length === 0) return null;
    const style = ROUTE_STYLES[p.routeType] || ROUTE_STYLES.pass;
    const fullPoints = [`${p.x},${p.y}`, ...p.path.map((pt) => `${pt.x},${pt.y}`)].join(" ");
    const end = p.path[p.path.length - 1];
    const activeInterp = interpolateAlongPath(p.x, p.y, p.path, progress);

    return (
      <g key={`${keyPrefix}-path-${p.id}`}>
        {/* Pre-snap blueprint guide */}
        <polyline
          points={fullPoints}
          fill="none"
          stroke={style.color}
          strokeWidth="0.55"
          strokeDasharray={style.dash || "1.4 0.8"}
          opacity={progress > 0 ? 0.35 : 0.9}
        />
        {/* Live route stem building as the player runs */}
        {progress > 0 && (
          <polyline
            points={activeInterp.drawnPoints}
            fill="none"
            stroke={style.color}
            strokeWidth="0.85"
            strokeDasharray={style.dash}
          />
        )}
        <circle cx={end.x} cy={end.y} r="1.05" fill={style.color} opacity={progress > 0 ? 0.45 : 0.95} />
      </g>
    );
  };

  const verdictColors = {
    WORKS: { bg: t.greenBg, border: t.green, badge: "#15803D", label: "PLAY WORKS" },
    ADJUST: { bg: t.goldBg, border: t.goldBorder, badge: "#D97706", label: "ADJUSTMENT NEEDED" },
    BROKEN: { bg: t.redBg, border: t.red, badge: "#DC2626", label: "COVERAGE WINS — AUDIBLE" },
  };
  const vStyle = verdictColors[shadowResult.status] || verdictColors.WORKS;

  const toggleScenarioAnim = () => {
    if (isAnimating) {
      setIsAnimating(false);
    } else if (animProgress >= 1) {
      setAnimProgress(0);
      setIsAnimating(false);
    } else {
      setIsAnimating(true);
    }
  };

  const toggleLabAnim = () => {
    if (labAnimating) {
      setLabAnimating(false);
    } else if (labProgress >= 1) {
      setLabProgress(0);
      setLabAnimating(false);
    } else {
      setLabAnimating(true);
    }
  };

  return (
    <div style={{ background: t.backdrop, color: t.text, minHeight: "100vh", padding: "18px 20px" }}>
      {/* Laminated Playbook Binder Divider Tabs */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "18px",
          flexWrap: "wrap",
          borderBottom: `2px solid ${t.borderStrong}`,
          paddingBottom: "0px",
        }}
      >
        {[
          { id: "basics", label: "1. Scheme Basics" },
          { id: "pbp", label: "2. Play-by-Play Training" },
          { id: "position", label: "3. Position Training (8 Rooms)" },
          { id: "live", label: "4. Live 22-Player QB & Coach Sim" },
          { id: "playbook", label: `5. Shadow-Box & Scheme Lab (${playbook.length})` },
        ].map((tab) => {
          const active = mode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMode(tab.id)}
              className="font-coach"
              style={{
                padding: "9px 16px",
                borderRadius: "8px 8px 0 0",
                border: `1px solid ${active ? t.borderStrong : t.border}`,
                borderBottom: active ? `2px solid ${t.cardBg}` : `1px solid ${t.borderStrong}`,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "15px",
                background: active ? t.tabActiveBg : t.tabBg,
                color: active ? t.accent : t.tabText,
                marginBottom: active ? "-2px" : "0",
                boxShadow: active ? t.shadow : "none",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: SCHEME BASICS (DEFENSE + OFFENSE) ================= */}
      {mode === "basics" && (
        <div>
          {/* Top Side Switcher: Defensive Coverages vs. Offensive Schemes */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => {
                setSchemeSide("defense");
                setSchemeIdx(0);
                setStepIdx(0);
                setBasicAnswer(null);
              }}
              className="font-coach"
              style={{
                padding: "7px 15px",
                borderRadius: "6px",
                border: `1px solid ${schemeSide === "defense" ? t.red : t.borderStrong}`,
                background: schemeSide === "defense" ? t.red : t.cardBg,
                color: schemeSide === "defense" ? "#FFFFFF" : t.text,
                fontWeight: 800,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              🛡️ Defensive Coverages ({SCHEME_BASICS.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setSchemeSide("offense");
                setSchemeIdx(0);
                setStepIdx(0);
                setBasicAnswer(null);
              }}
              className="font-coach"
              style={{
                padding: "7px 15px",
                borderRadius: "6px",
                border: `1px solid ${schemeSide === "offense" ? t.accent : t.borderStrong}`,
                background: schemeSide === "offense" ? t.accent : t.cardBg,
                color: schemeSide === "offense" ? "#FFFFFF" : t.text,
                fontWeight: 800,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              🏈 Offensive Schemes & Concepts ({OFFENSIVE_SCHEMES.length})
            </button>
          </div>

          {/* Scheme Selector Pills */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
            {activeSchemeList.map((s, idx) => {
              const active = schemeIdx === idx;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSchemeIdx(idx);
                    setStepIdx(0);
                    setBasicAnswer(null);
                  }}
                  className="font-coach"
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    border: `1px solid ${active ? t.accent : t.borderStrong}`,
                    cursor: "pointer",
                    background: active ? t.accent : t.cardBg,
                    color: active ? "#FFFFFF" : t.text,
                    fontWeight: 700,
                    fontSize: "15px",
                  }}
                >
                  {s.name.split(" (")[0]}
                </button>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "18px", alignItems: "start" }}>
            <div
              style={{
                background: t.cardBg,
                border: `1px solid ${t.border}`,
                borderRadius: "12px",
                padding: "14px",
                boxShadow: t.cardShadow,
              }}
            >
              <div style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong className="font-coach" style={{ fontSize: "19px" }}>{scheme.name}</strong>
                <span className="font-mono-coach" style={{ color: t.accent, fontSize: "12px", fontWeight: 700 }}>
                  Step {stepIdx + 1} of {scheme.steps.length}
                </span>
              </div>

              <svg
                viewBox="0 0 100 50"
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  background: t.turf,
                  border: `5px solid ${t.turfFrame}`,
                }}
              >
                {[10, 20, 30, 40].map((y) => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" />
                ))}
                <line x1="0" y1="35" x2="100" y2="35" stroke="#93C5FD" strokeWidth="0.6" strokeDasharray="1.5 1" />

                {(currentStep.showWeaknesses || basicAnswer || schemeSide === "offense") &&
                  (scheme.zoneBubbles || []).map((z, i) => (
                    <g key={i}>
                      <ellipse
                        cx={z.x}
                        cy={z.y}
                        rx={z.rx}
                        ry={z.ry}
                        fill="rgba(56,189,248,0.16)"
                        stroke="rgba(186,230,253,0.65)"
                        strokeWidth="0.35"
                        strokeDasharray="1.2 0.8"
                      />
                      <text x={z.x} y={z.y + 0.8} fill="#E0F2FE" fontSize="2" textAnchor="middle" fontWeight="bold">
                        {z.label}
                      </text>
                    </g>
                  ))}

                {currentStep.showWeaknesses &&
                  (scheme.weaknesses || []).map((w, i) => (
                    <g key={i}>
                      <circle cx={w.x} cy={w.y} r={w.r} fill="rgba(250,204,21,0.28)" stroke="#FACC15" strokeWidth="0.5" strokeDasharray="1 0.8" />
                      <text x={w.x} y={w.y + 0.7} fill="#FEF08A" fontSize="1.9" textAnchor="middle" fontWeight="bold">
                        {w.label}
                      </text>
                    </g>
                  ))}

                {/* Render custom offensive formation + routes for Offensive Schemes, or standard shell offense for Defense */}
                {scheme.offensePlayers ? (
                  <>
                    {scheme.offensePlayers.map((p) => {
                      const isSpot = currentStep.spotlightIds.includes(p.id);
                      const style = ROUTE_STYLES[p.routeType] || ROUTE_STYLES.pass;
                      const pts = [`${p.x},${p.y}`, ...(p.path || []).map((pt) => `${pt.x},${pt.y}`)].join(" ");
                      return (
                        <g key={`off-p-${p.id}`} opacity={isSpot ? 1 : 0.45}>
                          {p.path?.length > 0 && (
                            <polyline
                              points={pts}
                              fill="none"
                              stroke={style.color}
                              strokeWidth={isSpot ? "0.85" : "0.5"}
                              strokeDasharray={style.dash}
                            />
                          )}
                          {renderOffenseMarker(p.x, p.y, p.id, isSpot, isSpot ? 1 : 0.6)}
                        </g>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {[40, 45, 50, 55, 60].map((x, i) => (
                      <circle key={`ol-${i}`} cx={x} cy="37" r="1.65" fill="#FAF8F3" stroke="#1D4ED8" strokeWidth="0.55" opacity="0.85" />
                    ))}
                    {renderOffenseMarker(50, 43, "QB", false, 0.92)}
                  </>
                )}

                {scheme.defense.map((d) => {
                  const isSpot = currentStep.spotlightIds.includes(d.id);
                  return (
                    <g key={d.id}>
                      {renderDefenseXMarker(d.x, d.y, d.label, isSpot, isSpot ? 1 : 0.35)}
                    </g>
                  );
                })}
              </svg>

              <div
                style={{
                  marginTop: "14px",
                  background: t.insetBg,
                  border: `1px solid ${t.border}`,
                  padding: "12px",
                  borderRadius: "8px",
                }}
              >
                <div className="font-coach" style={{ fontSize: "15px", fontWeight: 800, color: t.green, marginBottom: "6px" }}>
                  {schemeSide === "offense"
                    ? `HOW DEFENSES COUNTER ${scheme.name.split(" (")[0].toUpperCase()}:`
                    : `WHAT WORKS BEST AGAINST ${scheme.name.split(" (")[0].toUpperCase()}:`}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px" }}>
                  {scheme.bestBeaters.map((b, i) => (
                    <div
                      key={i}
                      style={{
                        background: t.cardBg,
                        border: `1px solid ${t.border}`,
                        padding: "8px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    >
                      <strong style={{ color: t.gold }}>{b.name}</strong>
                      <div style={{ color: t.textSecondary, marginTop: "3px" }}>{b.why}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                background: t.cardBg,
                border: `1px solid ${t.border}`,
                borderRadius: "12px",
                padding: "16px",
                boxShadow: t.cardShadow,
              }}
            >
              <div style={{ fontSize: "12.5px", color: t.muted, marginBottom: "6px" }}>{scheme.plainEnglish}</div>
              <h3 className="font-coach" style={{ margin: "8px 0", color: t.accent, fontSize: "20px", fontWeight: 800 }}>
                {currentStep.stepTitle}
              </h3>
              <p style={{ fontSize: "14px", color: t.text, lineHeight: 1.5 }}>{currentStep.question}</p>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                {currentStep.options.map((opt, idx) => {
                  let bg = t.cardAlt;
                  let border = t.borderStrong;
                  let txtColor = t.text;
                  if (basicAnswer) {
                    if (opt.correct) {
                      bg = "#15803D";
                      border = "#15803D";
                      txtColor = "#FFFFFF";
                    } else if (basicAnswer === opt) {
                      bg = "#DC2626";
                      border = "#DC2626";
                      txtColor = "#FFFFFF";
                    }
                  }
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBasicAnswer(opt)}
                      style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: `1px solid ${border}`,
                        background: bg,
                        color: txtColor,
                        cursor: "pointer",
                        fontSize: "13.5px",
                        fontWeight: 600,
                      }}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>

              {basicAnswer && (
                <div
                  style={{
                    marginTop: "14px",
                    padding: "12px",
                    background: t.insetBg,
                    borderRadius: "8px",
                    borderLeft: `4px solid ${t.green}`,
                  }}
                >
                  <p style={{ margin: 0, fontSize: "13px", color: t.textSecondary, lineHeight: 1.5 }}>{currentStep.explanation}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setBasicAnswer(null);
                      if (stepIdx < scheme.steps.length - 1) setStepIdx(stepIdx + 1);
                      else {
                        setStepIdx(0);
                        setSchemeIdx((schemeIdx + 1) % activeSchemeList.length);
                      }
                    }}
                    style={{
                      marginTop: "10px",
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "none",
                      background: t.accent,
                      color: "#FFFFFF",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {stepIdx < scheme.steps.length - 1 ? "Next Step →" : "Next Scheme →"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TABS 2 & 3: PLAY-BY-PLAY & 8-ROOM POSITION TRAINING ================= */}
      {(mode === "pbp" || mode === "position") && (
        <div>
          {mode === "position" && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
              {["ALL", ...POSITIONS].map((pos) => {
                const active = posFilter === pos;
                const count =
                  pos === "ALL"
                    ? SCENARIOS.length
                    : SCENARIOS.filter((s) => s.position === pos).length;
                return (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => {
                      setPosFilter(pos);
                      setScenarioIdx(0);
                      setIsAnimating(false);
                      setAnimProgress(0);
                      setSelectedOption(null);
                    }}
                    className="font-coach"
                    style={{
                      padding: "6px 13px",
                      borderRadius: "6px",
                      border: `1px solid ${active ? t.green : t.borderStrong}`,
                      cursor: "pointer",
                      background: active ? t.green : t.cardBg,
                      color: active ? "#FFFFFF" : t.text,
                      fontWeight: 700,
                      fontSize: "14px",
                    }}
                  >
                    {pos === "ALL" ? `All Positions (${count})` : `${pos} (${count})`}
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "18px", alignItems: "start" }}>
            <div
              style={{
                background: t.cardBg,
                border: `1px solid ${t.border}`,
                borderRadius: "12px",
                padding: "12px",
                boxShadow: t.cardShadow,
              }}
            >
              <div style={{ display: "flex", gap: "12px", marginBottom: "10px", fontSize: "13px", flexWrap: "wrap", alignItems: "center" }}>
                <label style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                  <input type="checkbox" checked={showGaps} onChange={(e) => setShowGaps(e.target.checked)} /> Gaps
                </label>
                <label style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                  <input type="checkbox" checked={showBox} onChange={(e) => setShowBox(e.target.checked)} /> Box ({scenario.boxCount} - {scenario.boxStatus})
                </label>
                <label style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                  <input type="checkbox" checked={showZones} onChange={(e) => setShowZones(e.target.checked)} /> Zones
                </label>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="font-mono-coach" style={{ fontSize: "11px", color: t.muted, fontWeight: 700 }}>
                    {Math.round(animProgress * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={toggleScenarioAnim}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "6px",
                      border: "none",
                      background: isAnimating ? "#D97706" : "#15803D",
                      color: "#FFFFFF",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {isAnimating
                      ? "⏸ Pause"
                      : animProgress >= 1
                        ? "↺ Reset Pre-Snap"
                        : "▶ Animate Snap"}
                  </button>
                </div>
              </div>

              <svg
                viewBox="0 0 100 60"
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  background: t.turf,
                  border: `5px solid ${t.turfFrame}`,
                }}
              >
                {[10, 20, 30, 40, 50].map((y) => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" />
                ))}
                <line x1="0" y1="35" x2="100" y2="35" stroke="#93C5FD" strokeWidth="0.6" strokeDasharray="1.5 1" />
                {showBox && (
                  <rect
                    x="35"
                    y="24"
                    width="30"
                    height="12"
                    fill={scenario.boxStatus === "HEAVY" ? "rgba(239,68,68,0.18)" : "rgba(34,197,94,0.18)"}
                    stroke={scenario.boxStatus === "HEAVY" ? "#EF4444" : "#22C55E"}
                    strokeWidth="0.4"
                    strokeDasharray="1 1"
                  />
                )}
                {showGaps &&
                  GAP_GRID.map((g, i) => (
                    <text key={i} x={g.x} y="34.4" fill="#FDE047" fontSize="2.2" textAnchor="middle" fontWeight="bold">
                      {g.label}
                    </text>
                  ))}
                {showZones &&
                  scenario.zoneBubbles.map((z, i) => (
                    <ellipse
                      key={i}
                      cx={z.x}
                      cy={z.y}
                      rx={z.rx}
                      ry={z.ry}
                      fill="rgba(56,189,248,0.16)"
                      stroke="rgba(186,230,253,0.6)"
                      strokeWidth="0.3"
                    />
                  ))}

                {/* Progressive route trails building behind each offensive player */}
                {animProgress > 0 &&
                  scenario.offense.map((p, i) => {
                    const curX = p.x + (p.postX - p.x) * animProgress;
                    const curY = p.y + (p.postY - p.y) * animProgress;
                    return (
                      <line
                        key={`ol-${i}`}
                        x1={p.x}
                        y1={p.y}
                        x2={curX}
                        y2={curY}
                        stroke="#FACC15"
                        strokeWidth="0.6"
                        strokeDasharray="1 0.5"
                      />
                    );
                  })}

                {scenario.offense.map((p, i) => {
                  const curX = p.x + (p.postX - p.x) * animProgress;
                  const curY = p.y + (p.postY - p.y) * animProgress;
                  return (
                    <g key={`o-${i}`}>
                      {renderOffenseMarker(curX, curY, p.id)}
                    </g>
                  );
                })}
                {scenario.defense.map((p, i) => {
                  const curX = p.x + (p.postX - p.x) * animProgress;
                  const curY = p.y + (p.postY - p.y) * animProgress;
                  return (
                    <g key={`d-${i}`}>
                      {renderDefenseXMarker(curX, curY, p.id)}
                    </g>
                  );
                })}
              </svg>
            </div>

            <div
              style={{
                background: t.cardBg,
                border: `1px solid ${t.border}`,
                borderRadius: "12px",
                padding: "16px",
                boxShadow: t.cardShadow,
              }}
            >
              <div className="font-coach" style={{ fontSize: "13px", color: t.accent, fontWeight: 800 }}>
                {scenario.position} DRILL • {scenario.coverage} • {scenario.downDistance}
              </div>
              <h3 className="font-coach" style={{ marginTop: "6px", fontSize: "21px", fontWeight: 800 }}>
                {scenario.title}
              </h3>
              <p style={{ color: t.textSecondary, fontSize: "14px", lineHeight: 1.5 }}>{scenario.prompt}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                {scenario.options.map((opt) => {
                  let bg = t.cardAlt;
                  let border = t.borderStrong;
                  let txtColor = t.text;
                  if (selectedOption) {
                    if (opt.correct) {
                      bg = "#15803D";
                      border = "#15803D";
                      txtColor = "#FFFFFF";
                    } else if (selectedOption.id === opt.id) {
                      bg = "#DC2626";
                      border = "#DC2626";
                      txtColor = "#FFFFFF";
                    }
                  }
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedOption(opt);
                        setAnimProgress(0);
                        setIsAnimating(true);
                        setShowZones(true);
                      }}
                      style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: `1px solid ${border}`,
                        background: bg,
                        color: txtColor,
                        cursor: "pointer",
                        fontSize: "13.5px",
                        fontWeight: 600,
                      }}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
              {selectedOption && (
                <div style={{ marginTop: "14px", padding: "12px", background: t.insetBg, borderRadius: "8px", borderLeft: `4px solid ${t.green}` }}>
                  <p style={{ margin: 0, fontSize: "13px", color: t.textSecondary }}>{scenario.coachingTakeaway}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setScenarioIdx((i) => i + 1);
                      setIsAnimating(false);
                      setAnimProgress(0);
                      setSelectedOption(null);
                      setShowZones(false);
                    }}
                    style={{
                      marginTop: "10px",
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "none",
                      background: t.accent,
                      color: "#FFFFFF",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Next Drill →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: SHADOW-BOXING & INTERACTIVE SCHEME LAB ================= */}
      {mode === "playbook" && (
        <div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => {
                setPlaybookView("designer");
                setLabAnimating(false);
                setLabProgress(0);
              }}
              className="font-coach"
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: `1px solid ${playbookView === "designer" ? t.green : t.borderStrong}`,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "15px",
                background: playbookView === "designer" ? t.green : t.cardBg,
                color: playbookView === "designer" ? "#FFFFFF" : t.text,
              }}
            >
              🥊 Shadow-Box & Scheme Lab
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaybookView("library");
                setLabAnimating(false);
                setLabProgress(0);
              }}
              className="font-coach"
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: `1px solid ${playbookView === "library" ? t.accent : t.borderStrong}`,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "15px",
                background: playbookView === "library" ? t.accent : t.cardBg,
                color: playbookView === "library" ? "#FFFFFF" : t.text,
              }}
            >
              Playbook Library ({playbook.length} Plays)
            </button>

            {/* Category Filter Pills for 40+ Plays */}
            <div style={{ display: "flex", gap: "6px", marginLeft: "auto", flexWrap: "wrap" }}>
              {[
                { id: "ALL", label: `All (${playbook.length})` },
                { id: "CORE", label: `Core (${INITIAL_PLAYBOOK.length})` },
                { id: "NFL", label: `NFL 10Hz (${convertedNflPlays.length})` },
                { id: "CUSTOM", label: "Custom" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPlaybookFilter(f.id)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "6px",
                    border: `1px solid ${playbookFilter === f.id ? t.accent : t.borderStrong}`,
                    background: playbookFilter === f.id ? t.accent : t.cardBg,
                    color: playbookFilter === f.id ? "#FFFFFF" : t.textSecondary,
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {playbookView === "library" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "18px", alignItems: "start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "540px", overflowY: "auto", paddingRight: "4px" }}>
                {filteredPlaybook.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActivePlayId(p.id);
                      setLabAnimating(false);
                      setLabProgress(0);
                    }}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: activePlayId === p.id ? `2px solid ${t.accent}` : `1px solid ${t.border}`,
                      background: t.cardBg,
                      color: t.text,
                      cursor: "pointer",
                      boxShadow: t.shadow,
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: "12px", color: t.green, marginTop: "2px", fontWeight: 600 }}>
                      {p.category} • Beats: {p.beats}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        loadPlayIntoLab(p);
                      }}
                      style={{
                        marginTop: "8px",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        border: "none",
                        background: t.accent,
                        color: "#FFFFFF",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Test vs. Defense in Shadow-Box →
                    </button>
                  </div>
                ))}
              </div>

              <div
                style={{
                  background: t.cardBg,
                  border: `1px solid ${t.border}`,
                  borderRadius: "12px",
                  padding: "14px",
                  boxShadow: t.cardShadow,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <h3 className="font-coach" style={{ margin: 0, fontSize: "21px", fontWeight: 800 }}>
                      {activePlay.name}
                    </h3>
                    <span style={{ fontSize: "13px", color: t.textSecondary }}>{activePlay.description}</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => loadPlayIntoLab(activePlay)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "none",
                        background: t.accent,
                        color: "#FFFFFF",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Shadow-Box This Play
                    </button>
                    <button
                      type="button"
                      onClick={toggleLabAnim}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "6px",
                        border: "none",
                        background: labAnimating ? "#D97706" : "#15803D",
                        color: "#FFFFFF",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {labAnimating ? "⏸ Pause" : labProgress >= 1 ? "↺ Reset" : "▶ Run Play"}
                    </button>
                  </div>
                </div>

                <svg
                  viewBox="0 0 100 60"
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    background: t.turf,
                    border: `5px solid ${t.turfFrame}`,
                  }}
                >
                  {[10, 20, 30, 40, 50].map((y) => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" />
                  ))}
                  <line x1="0" y1="35" x2="100" y2="35" stroke="#93C5FD" strokeWidth="0.6" strokeDasharray="1.5 1" />
                  {activePlay.players.map((p) => renderAnimatedPath(p, "lib", labProgress))}
                  {activePlay.players.map((p) => {
                    const cur = interpolateAlongPath(p.x, p.y, p.path, labProgress);
                    return (
                      <g key={p.id}>
                        {renderOffenseMarker(cur.x, cur.y, p.id)}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.15fr", gap: "18px", alignItems: "start" }}>
              <div
                style={{
                  background: t.cardBg,
                  border: `1px solid ${t.border}`,
                  borderRadius: "12px",
                  padding: "14px",
                  boxShadow: t.cardShadow,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "10px",
                    flexWrap: "wrap",
                    alignItems: "center",
                    background: t.insetBg,
                    border: `1px solid ${t.border}`,
                    padding: "8px 10px",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ fontSize: "12px", color: t.accent, fontWeight: 800 }}>OFFENSE ({filteredPlaybook.length}):</div>
                  <select
                    onChange={(e) => {
                      const found = playbook.find((p) => p.id === e.target.value);
                      if (found) loadPlayIntoLab(found);
                    }}
                    defaultValue={INITIAL_PLAYBOOK[1].id}
                    style={{
                      maxWidth: "230px",
                      padding: "5px 8px",
                      borderRadius: "5px",
                      background: t.cardBg,
                      color: t.text,
                      border: `1px solid ${t.borderStrong}`,
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {filteredPlaybook.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>

                  <label style={{ fontSize: "12px", color: t.text, display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
                    <input type="checkbox" checked={labPlayAction} onChange={(e) => setLabPlayAction(e.target.checked)} />
                    Play-Action
                  </label>

                  <div style={{ fontSize: "12px", color: t.red, fontWeight: 800, marginLeft: "8px" }}>DEFENSE:</div>
                  <select
                    value={labCoverageId}
                    onChange={(e) => handleCoverageChange(e.target.value)}
                    style={{
                      padding: "5px 8px",
                      borderRadius: "5px",
                      background: t.cardBg,
                      color: t.text,
                      border: `1px solid ${t.borderStrong}`,
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {SCHEME_BASICS.map((s) => (
                      <option key={s.id} value={s.id}>{s.name.split(" (")[0]}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={resetDefenseAlignment}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "5px",
                      border: `1px solid ${t.borderStrong}`,
                      background: t.cardBg,
                      color: t.text,
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Reset Def
                  </button>

                  <label style={{ fontSize: "12px", color: t.accent, display: "flex", alignItems: "center", gap: "4px", marginLeft: "auto", fontWeight: 600 }}>
                    <input type="checkbox" checked={showLabZones} onChange={(e) => setShowLabZones(e.target.checked)} />
                    Zones
                  </label>
                </div>

                <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => setToolMode("drag")}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "6px",
                      border: `1px solid ${toolMode === "drag" ? t.accent : t.borderStrong}`,
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "12px",
                      background: toolMode === "drag" ? t.accent : t.cardAlt,
                      color: toolMode === "drag" ? "#FFFFFF" : t.text,
                    }}
                  >
                    ✋ Drag Offense or Defense
                  </button>
                  <button
                    type="button"
                    onClick={() => setToolMode("draw")}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "6px",
                      border: `1px solid ${toolMode === "draw" ? t.goldBorder : t.borderStrong}`,
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "12px",
                      background: toolMode === "draw" ? "#D97706" : t.cardAlt,
                      color: toolMode === "draw" ? "#FFFFFF" : t.text,
                    }}
                  >
                    ✏️ Draw Route [{selectedPlayerId}]
                  </button>
                  <button
                    type="button"
                    onClick={clearSelectedRoute}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "6px",
                      border: `1px solid ${t.red}`,
                      cursor: "pointer",
                      background: t.redBg,
                      color: t.red,
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    Clear {selectedPlayerId}
                  </button>
                  <button
                    type="button"
                    onClick={toggleLabAnim}
                    style={{
                      marginLeft: "auto",
                      padding: "6px 14px",
                      borderRadius: "6px",
                      border: "none",
                      background: labAnimating ? "#D97706" : "#15803D",
                      color: "#FFFFFF",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    {labAnimating
                      ? "⏸ Pause"
                      : labProgress >= 1
                        ? "↺ Reset Pre-Snap"
                        : "▶ Snap & Shadow-Box"}
                  </button>
                </div>

                <svg
                  ref={svgRef}
                  viewBox="0 0 100 60"
                  onPointerMove={handleFieldPointerMove}
                  onPointerUp={() => setDraggingTarget(null)}
                  onClick={handleFieldClick}
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    background: t.turf,
                    border: `5px solid ${t.turfFrame}`,
                    cursor: toolMode === "draw" ? "crosshair" : "default",
                    touchAction: "none",
                  }}
                >
                  {[10, 20, 30, 40, 50].map((y) => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" />
                  ))}
                  <line x1="0" y1="35" x2="100" y2="35" stroke="#93C5FD" strokeWidth="0.6" strokeDasharray="1.5 1" />

                  {showLabZones &&
                    labSchemeObj.zoneBubbles.map((z, i) => (
                      <g key={`lz-${i}`} opacity="0.78">
                        <ellipse
                          cx={z.x}
                          cy={z.y}
                          rx={z.rx}
                          ry={z.ry}
                          fill="rgba(56,189,248,0.14)"
                          stroke="rgba(186,230,253,0.6)"
                          strokeWidth="0.3"
                        />
                        <text x={z.x} y={z.y + 0.7} fill="#E0F2FE" fontSize="1.7" textAnchor="middle">
                          {z.label}
                        </text>
                      </g>
                    ))}

                  {shadowResult.routeGrades.map((rg) => {
                    const ringColor =
                      rg.status === "OPEN" ? "#4ADE80" : rg.status === "CONTESTED" ? "#FACC15" : "#F87171";
                    return (
                      <g key={`rg-${rg.playerId}`}>
                        <circle
                          cx={rg.target.x}
                          cy={rg.target.y}
                          r="3.2"
                          fill="none"
                          stroke={ringColor}
                          strokeWidth="0.45"
                          strokeDasharray="1 0.6"
                        />
                        <text
                          x={rg.target.x}
                          y={rg.target.y - 3.8}
                          fill={ringColor}
                          fontSize="1.7"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          {rg.status} ({rg.clearanceYds}y)
                        </text>
                      </g>
                    );
                  })}

                  {designerPlayers.map((p) => renderAnimatedPath(p, "des", labProgress))}

                  {shadowResult.postDefenders.map((d) => {
                    const posX = d.x + (d.postX - d.x) * labProgress;
                    const posY = d.y + (d.postY - d.y) * labProgress;
                    return (
                      <g
                        key={`def-${d.id}`}
                        style={{ cursor: "grab" }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          if (toolMode === "drag") setDraggingTarget({ team: "D", id: d.id });
                        }}
                      >
                        {renderDefenseXMarker(posX, posY, d.id)}
                      </g>
                    );
                  })}

                  {designerPlayers.map((p) => {
                    const isSel = p.id === selectedPlayerId;
                    const cur = interpolateAlongPath(p.x, p.y, p.path, labProgress);
                    return (
                      <g
                        key={`off-${p.id}`}
                        style={{ cursor: "grab" }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          setSelectedPlayerId(p.id);
                          if (toolMode === "drag") setDraggingTarget({ team: "O", id: p.id });
                        }}
                      >
                        {renderOffenseMarker(cur.x, cur.y, p.id, isSel)}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Right Panel */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ background: vStyle.bg, border: `1px solid ${vStyle.border}`, borderRadius: "12px", padding: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span className="font-coach" style={{ background: vStyle.badge, color: "#FFFFFF", fontSize: "12px", fontWeight: 800, padding: "2px 8px", borderRadius: "4px" }}>
                      {vStyle.label}
                    </span>
                    <span className="font-mono-coach" style={{ fontSize: "11px", color: t.muted, fontWeight: 700 }}>
                      Box: {shadowResult.boxCount}
                    </span>
                  </div>
                  <div className="font-coach" style={{ fontWeight: 800, fontSize: "18px", marginBottom: "6px" }}>
                    {shadowResult.headline}
                  </div>
                  <p style={{ margin: 0, fontSize: "13px", color: t.textSecondary, lineHeight: 1.45 }}>{shadowResult.because}</p>

                  {shadowResult.adjustment && (
                    <button
                      type="button"
                      onClick={() => {
                        setDesignerPlayers((prev) => shadowResult.adjustment.apply(prev));
                        setLabProgress(0);
                        setLabAnimating(true);
                      }}
                      style={{
                        marginTop: "10px",
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "none",
                        background: "#D97706",
                        color: "#FFFFFF",
                        fontWeight: 800,
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      ⚡ Apply Fix: {shadowResult.adjustment.label}
                    </button>
                  )}
                </div>

                <div
                  style={{
                    background: t.cardBg,
                    border: `1px solid ${t.border}`,
                    borderRadius: "10px",
                    padding: "12px",
                    boxShadow: t.shadow,
                  }}
                >
                  <div className="font-coach" style={{ fontSize: "13px", fontWeight: 800, color: t.accent, marginBottom: "6px" }}>
                    NFL BENCHMARK ({labSchemeObj.name.split(" (")[0].toUpperCase()} • {shadowResult.attackZone})
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", textAlign: "center" }}>
                    <div style={{ background: t.insetBg, border: `1px solid ${t.border}`, padding: "6px", borderRadius: "6px" }}>
                      <div style={{ fontSize: "11px", color: t.muted }}>EPA/Play</div>
                      <div className="font-mono-coach" style={{ fontWeight: 800, color: shadowResult.nflData.avg_epa >= 0 ? t.green : t.red }}>
                        {shadowResult.nflData.avg_epa >= 0 ? `+${shadowResult.nflData.avg_epa}` : shadowResult.nflData.avg_epa}
                      </div>
                    </div>
                    <div style={{ background: t.insetBg, border: `1px solid ${t.border}`, padding: "6px", borderRadius: "6px" }}>
                      <div style={{ fontSize: "11px", color: t.muted }}>Success</div>
                      <div className="font-mono-coach" style={{ fontWeight: 800, color: t.text }}>
                        {Math.round((shadowResult.nflData.success_rate || 0) * 100)}%
                      </div>
                    </div>
                    <div style={{ background: t.insetBg, border: `1px solid ${t.border}`, padding: "6px", borderRadius: "6px" }}>
                      <div style={{ fontSize: "11px", color: t.muted }}>NFL Snaps</div>
                      <div className="font-mono-coach" style={{ fontWeight: 800, color: t.textSecondary }}>
                        {shadowResult.nflData.plays.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: t.cardBg,
                    border: `1px solid ${t.border}`,
                    borderRadius: "10px",
                    padding: "12px",
                    boxShadow: t.shadow,
                  }}
                >
                  <div className="font-coach" style={{ fontSize: "13px", fontWeight: 800, color: t.green, marginBottom: "6px" }}>
                    POSITION COACHING LENS (ALL 8 ROOMS):
                  </div>
                  <div style={{ display: "flex", gap: "4px", marginBottom: "8px", flexWrap: "wrap" }}>
                    {POSITIONS.map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setLabPosition(pos)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          border: `1px solid ${labPosition === pos ? t.green : t.borderStrong}`,
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                          background: labPosition === pos ? t.green : t.cardAlt,
                          color: labPosition === pos ? "#FFFFFF" : t.text,
                        }}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                  <p style={{ margin: 0, fontSize: "12.5px", color: t.textSecondary, lineHeight: 1.45 }}>
                    {shadowResult.positionTip}
                  </p>
                </div>

                <div
                  style={{
                    background: t.cardBg,
                    border: `1px solid ${t.border}`,
                    borderRadius: "10px",
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    boxShadow: t.shadow,
                  }}
                >
                  <div style={{ fontSize: "12px", fontWeight: 700 }}>Route Line Type & Save</div>
                  <select
                    value={routeType}
                    onChange={(e) => setRouteType(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "6px",
                      borderRadius: "6px",
                      background: t.cardAlt,
                      color: t.text,
                      border: `1px solid ${t.borderStrong}`,
                      fontSize: "12px",
                    }}
                  >
                    {Object.entries(ROUTE_STYLES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      value={newPlayName}
                      onChange={(e) => setNewPlayName(e.target.value)}
                      placeholder="Play name..."
                      style={{
                        flex: 1,
                        padding: "6px",
                        borderRadius: "6px",
                        background: t.cardAlt,
                        color: t.text,
                        border: `1px solid ${t.borderStrong}`,
                        fontSize: "12px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={saveCustomPlay}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "none",
                        background: t.accent,
                        color: "#FFFFFF",
                        fontWeight: 700,
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      Save
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={copyPlayJson}
                    style={{
                      padding: "5px",
                      borderRadius: "6px",
                      border: `1px solid ${t.borderStrong}`,
                      background: t.cardAlt,
                      color: t.textSecondary,
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    {copyMsg || "Copy Play JSON"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === "live" && <LivePlaySimulator themeName={themeName} />}
    </div>
  );
}