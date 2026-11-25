/* eslint-disable react/prop-types */
// frontend/src/components/Phase5.jsx
import React, { useState, useMemo } from "react";
import { getCoachTheme } from "../data/coachTheme";

const COVERAGES = ["Cover 0", "Cover 1", "Cover 2", "Cover 3", "Cover 4"];

// Built-in sample All-22 telemetry used only when no video has been processed yet
function buildDemoTelemetry() {
  const fps = 10;
  const totalFrames = 45; // 4.5s total, snap at frame 15 (1.5s)
  const snapFrame = 15;
  const players = [
    // Offense (attacks UP toward y = 0, LOS = 35)
    { id: "QB-12", side: "O", pos: "QB", x0: 26.6, y0: 40.0, vx: -0.2, vy: 0.6 },
    { id: "WR-1", side: "O", pos: "WR", x0: 6.5, y0: 35.2, vx: 0.8, vy: -5.4 },
    { id: "WR-2", side: "O", pos: "WR", x0: 46.8, y0: 35.2, vx: -1.6, vy: -4.8 },
    { id: "TE-87", side: "O", pos: "TE", x0: 33.0, y0: 35.5, vx: -1.4, vy: -3.2 },
    { id: "RB-28", side: "O", pos: "RB", x0: 26.6, y0: 42.2, vx: 2.2, vy: -1.5 },
    { id: "OL-71", side: "O", pos: "OL", x0: 23.0, y0: 35.3, vx: -0.2, vy: 0.5 },
    { id: "OL-65", side: "O", pos: "OL", x0: 26.6, y0: 35.1, vx: 0.0, vy: 0.4 },
    { id: "OL-77", side: "O", pos: "OL", x0: 30.2, y0: 35.3, vx: 0.2, vy: 0.5 },
    // Defense (SS creeps pre-snap, FS rotates post-snap to Cover 3)
    { id: "CB-24", side: "D", pos: "CB", x0: 6.2, y0: 28.0, vx: 0.5, vy: -4.9 },
    { id: "CB-21", side: "D", pos: "CB", x0: 47.0, y0: 27.5, vx: -0.7, vy: -4.4 },
    { id: "FS-32", side: "D", pos: "SAF", x0: 21.0, y0: 22.0, vx: 1.9, vy: -2.2, preDx: 2.8, preDy: -1.2 },
    { id: "SS-33", side: "D", pos: "SAF", x0: 34.5, y0: 23.0, vx: -0.8, vy: 1.2, preDx: -1.2, preDy: 3.4 },
    { id: "LB-54", side: "D", pos: "LB", x0: 23.5, y0: 30.5, vx: -0.6, vy: -1.4 },
    { id: "LB-58", side: "D", pos: "LB", x0: 30.0, y0: 30.5, vx: 1.1, vy: -1.6, preDx: 0.0, preDy: 1.9 },
    { id: "DL-97", side: "D", pos: "DL", x0: 24.5, y0: 34.2, vx: 0.3, vy: 1.1 },
    { id: "DL-99", side: "D", pos: "DL", x0: 29.0, y0: 34.2, vx: -0.4, vy: 1.2 },
  ];

  const frames = [];
  for (let f = 0; f < totalFrames; f++) {
    const preRatio = Math.min(1, f / snapFrame);
    const postSec = Math.max(0, (f - snapFrame) / fps);
    frames.push({
      frame: f,
      players: players.map((p) => {
        const x = p.x0 + (p.preDx || 0) * preRatio + p.vx * postSec;
        const y = p.y0 + (p.preDy || 0) * preRatio + p.vy * postSec;
        return { id: p.id, side: p.side, pos: p.pos, x: +x.toFixed(2), y: +y.toFixed(2) };
      }),
    });
  }
  return { fps, snap_frame: snapFrame, los_y: 35, isDemo: true, frames };
}

function normalizeTracking(trackingData, fpsProp) {
  const source =
    trackingData &&
    ((Array.isArray(trackingData.frames) && trackingData.frames.length > 0) ||
      (Array.isArray(trackingData.players) && trackingData.players.length > 0) ||
      (Array.isArray(trackingData) && trackingData.length > 0))
      ? trackingData
      : buildDemoTelemetry();

  const fps = Number(fpsProp) || Number(source.fps) || 30;
  const isDemo = Boolean(source.isDemo);

  const rows = [];
  if (Array.isArray(source.frames)) {
    source.frames.forEach((fr, fIdx) => {
      const fNum = fr.frame ?? fr.frame_id ?? fIdx;
      const list = fr.players || fr.objects || fr.detections || [];
      list.forEach((p, pIdx) => {
        const rawX = p.x ?? p.field_x ?? p.cx ?? p.foot_x ?? 0;
        const rawY = p.y ?? p.field_y ?? p.cy ?? p.foot_y ?? 0;
        rows.push({
          frame: fNum,
          id: String(p.id ?? p.track_id ?? p.player_id ?? `P-${pIdx + 1}`),
          side: p.side || p.team || null,
          pos: p.pos || p.position || null,
          rawX: Number(rawX),
          rawY: Number(rawY),
        });
      });
    });
  } else if (Array.isArray(source.players)) {
    source.players.forEach((p, pIdx) => {
      const track = p.frames || p.positions || p.keyframes || [];
      track.forEach((pt, tIdx) => {
        rows.push({
          frame: pt.frame ?? (pt.t != null ? Math.round(pt.t * fps) : tIdx),
          id: String(p.id ?? p.track_id ?? `P-${pIdx + 1}`),
          side: p.side || p.team || null,
          pos: p.pos || p.position || null,
          rawX: Number(pt.x ?? pt.field_x ?? 0),
          rawY: Number(pt.y ?? pt.field_y ?? 0),
        });
      });
    });
  } else if (Array.isArray(source)) {
    source.forEach((item, idx) => {
      if (item.players || item.objects) {
        const fNum = item.frame ?? idx;
        (item.players || item.objects).forEach((p, pIdx) => {
          rows.push({
            frame: fNum,
            id: String(p.id ?? p.track_id ?? `P-${pIdx + 1}`),
            side: p.side || p.team || null,
            pos: p.pos || p.position || null,
            rawX: Number(p.x ?? p.foot_x ?? 0),
            rawY: Number(p.y ?? p.foot_y ?? 0),
          });
        });
      } else {
        rows.push({
          frame: item.frame ?? idx,
          id: String(item.id ?? item.track_id ?? "P-1"),
          side: item.side ?? item.team ?? null,
          pos: item.pos || item.position || null,
          rawX: Number(item.x ?? item.foot_x ?? 0),
          rawY: Number(item.y ?? item.foot_y ?? 0),
        });
      }
    });
  }

  if (rows.length === 0) return { fps, isDemo: true, players: [], snapTime: 1.5, maxTime: 4.0, losYds: 35 };

  const maxRawX = Math.max(...rows.map((r) => r.rawX), 1);
  const maxRawY = Math.max(...rows.map((r) => r.rawY), 1);
  const isPixelSpace = maxRawX > 105 || maxRawY > 65;
  const frameW = source.width || (isPixelSpace ? Math.max(1280, maxRawX) : 53.3);
  const frameH = source.height || (isPixelSpace ? Math.max(720, maxRawY) : 60);

  const minFrame = Math.min(...rows.map((r) => r.frame));
  const maxFrame = Math.max(...rows.map((r) => r.frame));
  const snapFrame =
    source.snap_frame ??
    source.snapFrame ??
    Math.min(maxFrame, minFrame + Math.round(fps * 1.5));

  const snapTime = Math.max(0.5, (snapFrame - minFrame) / fps);
  const maxTime = Math.max(snapTime + 1.0, (maxFrame - minFrame) / fps);

  const mappedRows = rows.map((r) => {
    const xYds = isPixelSpace
      ? (r.rawX / frameW) * 53.3
      : maxRawX > 60
      ? (r.rawX / 100) * 53.3
      : r.rawX;
    const yYds = isPixelSpace ? (r.rawY / frameH) * 60.0 : r.rawY;
    return {
      ...r,
      t: (r.frame - minFrame) / fps,
      xYds: Math.max(0.5, Math.min(52.8, xYds)),
      yYds: Math.max(1.0, Math.min(59.0, yYds)),
    };
  });

  const snapRows = mappedRows.filter((r) => Math.abs(r.frame - snapFrame) <= 1);
  const sortedSnapY = [...snapRows].map((r) => r.yYds).sort((a, b) => a - b);
  const losYds =
    source.los_y ??
    (sortedSnapY.length > 0 ? sortedSnapY[Math.floor(sortedSnapY.length * 0.48)] : 35.0);

  const byPlayer = new Map();
  mappedRows.forEach((r) => {
    if (!byPlayer.has(r.id)) byPlayer.set(r.id, []);
    byPlayer.get(r.id).push(r);
  });

  const players = [];
  byPlayer.forEach((pts, id) => {
    pts.sort((a, b) => a.t - b.t);
    const atSnap = pts.reduce(
      (best, cur) => (Math.abs(cur.t - snapTime) < Math.abs(best.t - snapTime) ? cur : best),
      pts[0]
    );

    const rawSide = String(atSnap.side ?? "").toUpperCase();
    const isOffense =
      rawSide === "O" || rawSide === "OFF" || rawSide === "OFFENSE" || rawSide === "0"
        ? true
        : rawSide === "D" || rawSide === "DEF" || rawSide === "DEFENSE" || rawSide === "1"
        ? false
        : atSnap.yYds >= losYds - 0.6;

    const rawPos = String(atSnap.pos || "").toUpperCase();
    let role = rawPos;
    if (!role) {
      const distFromLos = Math.abs(atSnap.yYds - losYds);
      const distFromCenter = Math.abs(atSnap.xYds - 26.65);
      if (isOffense) {
        if (distFromLos > 3.2 && distFromCenter < 4.5) role = "QB";
        else if (distFromCenter > 9.5) role = "WR";
        else if (distFromLos <= 2.2) role = "OL";
        else role = "RB";
      } else {
        if (distFromLos > 8.5) role = "SAF";
        else if (distFromCenter > 11.0) role = "CB";
        else if (distFromLos <= 2.6) role = "DL";
        else role = "LB";
      }
    }

    players.push({
      id,
      side: isOffense ? "O" : "D",
      role,
      snapPos: atSnap,
      points: pts,
    });
  });

  return { fps, isDemo, players, snapTime, maxTime, losYds };
}

function getPosAtTime(player, t) {
  const pts = player.points;
  if (!pts || pts.length === 0) return { xYds: 26.6, yYds: 35 };
  if (t <= pts[0].t) return pts[0];
  if (t >= pts[pts.length - 1].t) return pts[pts.length - 1];
  for (let i = 0; i < pts.length - 1; i++) {
    if (t >= pts[i].t && t <= pts[i + 1].t) {
      const ratio = (t - pts[i].t) / (pts[i + 1].t - pts[i].t || 1);
      return {
        xYds: pts[i].xYds + (pts[i + 1].xYds - pts[i].xYds) * ratio,
        yYds: pts[i].yYds + (pts[i + 1].yYds - pts[i].yYds) * ratio,
      };
    }
  }
  return pts[0];
}

function renderDefenseX(svgX, svgY, isHighlight, roleText, subText) {
  return (
    <g>
      <circle
        cx={svgX}
        cy={svgY}
        r="2.45"
        fill={isHighlight ? "rgba(254, 243, 199, 0.94)" : "rgba(250, 248, 243, 0.88)"}
        stroke={isHighlight ? "#D97706" : "rgba(220, 38, 38, 0.55)"}
        strokeWidth={isHighlight ? "0.55" : "0.3"}
      />
      <line
        x1={svgX - 1.15}
        y1={svgY - 1.15}
        x2={svgX + 1.15}
        y2={svgY + 1.15}
        stroke="#DC2626"
        strokeWidth="0.7"
        strokeLinecap="round"
      />
      <line
        x1={svgX + 1.15}
        y1={svgY - 1.15}
        x2={svgX - 1.15}
        y2={svgY + 1.15}
        stroke="#DC2626"
        strokeWidth="0.7"
        strokeLinecap="round"
      />
      <text
        x={svgX}
        y={svgY + 4.0}
        fill="#FAF8F3"
        fontSize="1.65"
        textAnchor="middle"
        fontWeight="bold"
      >
        {roleText}
        {subText ? ` ${subText}` : ""}
      </text>
    </g>
  );
}

export default function Phase5({ trackingData, fps, themeName = "light" }) {
  const [activeTab, setActiveTab] = useState("coverage"); // "coverage" | "tells" | "fatigue" | "grading"
  const [quizMode, setQuizMode] = useState(false);
  const [quizGuess, setQuizGuess] = useState(null);
  const [sortBy, setSortBy] = useState("peakSpeed"); // "peakSpeed" | "distance" | "decel"
  const [sortDir, setSortDir] = useState("desc");

  const t = getCoachTheme(themeName);
  const data = useMemo(() => normalizeTracking(trackingData, fps), [trackingData, fps]);

  // 1. COVERAGE CLASSIFICATION AT SNAP + 1.0s
  const coverageIntel = useMemo(() => {
    const evalT = Math.min(data.maxTime, data.snapTime + 1.0);
    const defs = data.players.filter((p) => p.side === "D");

    const evalDefs = defs.map((d) => {
      const pos = getPosAtTime(d, evalT);
      const depth = +(data.losYds - pos.yYds).toFixed(1);
      return { ...d, ...pos, depth };
    });

    const deepSafeties = evalDefs.filter(
      (d) =>
        (d.role === "SAF" || d.role === "FS" || d.role === "SS" || d.role === "DB" || d.depth >= 10.5) &&
        d.depth >= 10.0 &&
        d.xYds >= 9.0 &&
        d.xYds <= 44.3
    );

    const corners = evalDefs.filter(
      (d) => d.role === "CB" || (d.depth >= 3.0 && (d.xYds < 9.0 || d.xYds > 44.3))
    );

    const avgCbDepth =
      corners.length > 0
        ? +(corners.reduce((sum, c) => sum + c.depth, 0) / corners.length).toFixed(1)
        : 6.5;

    const boxCount = evalDefs.filter((d) => d.depth <= 5.5 && d.xYds >= 17 && d.xYds <= 36.3).length;

    let detected = "Cover 3";
    let rationale = "Single-high post safety with corners bailing to deep outside thirds.";

    if (deepSafeties.length === 0) {
      detected = "Cover 0";
      rationale = "Zero deep safeties at snap + 1.0s — all defenders committed to man coverage or pressure.";
    } else if (deepSafeties.length === 1) {
      if (avgCbDepth < 6.5) {
        detected = "Cover 1";
        rationale = `Single-high safety (${deepSafeties[0].id} at ${deepSafeties[0].depth} yds) with tight press/trail corners (${avgCbDepth} yd avg depth).`;
      } else {
        detected = "Cover 3";
        rationale = `Single-high safety (${deepSafeties[0].id} at ${deepSafeties[0].depth} yds) with outside corners bailing to deep thirds (${avgCbDepth} yd avg depth).`;
      }
    } else if (deepSafeties.length >= 2) {
      if (avgCbDepth < 6.5) {
        detected = "Cover 2";
        rationale = `Split 2-high safeties (${deepSafeties.map((s) => `${s.id} @ ${s.depth}y`).join(", ")}) with flat-squatting corners (${avgCbDepth} yd avg depth).`;
      } else {
        detected = "Cover 4";
        rationale = `Four-across deep shell: 2 high safeties plus corners bailing past ${avgCbDepth} yards into quarters.`;
      }
    }

    return {
      evalT,
      detected,
      rationale,
      deepSafetyCount: deepSafeties.length,
      avgCbDepth,
      boxCount,
      evalDefs,
    };
  }, [data]);

  // 2. PRE-SNAP TELLS (FINAL 1.5s BEFORE SNAP)
  const preSnapTells = useMemo(() => {
    const tStart = Math.max(0, data.snapTime - 1.5);
    const tSnap = data.snapTime;
    const defs = data.players.filter((p) => p.side === "D");

    return defs.map((d) => {
      const start = getPosAtTime(d, tStart);
      const snap = getPosAtTime(d, tSnap);
      const creepYds = +(snap.yYds - start.yYds).toFixed(2);
      const totalShiftYds = +Math.hypot(snap.xYds - start.xYds, snap.yYds - start.yYds).toFixed(2);
      const isSafety = ["SAF", "FS", "SS", "DB"].includes(d.role) && data.losYds - start.yYds >= 8.0;

      let flagged = false;
      let tellType = null;
      let note = "Held pre-snap leverage.";

      if (creepYds > 1.5) {
        flagged = true;
        tellType = "LOS CREEP / BLITZ TELL";
        note = `Crept ${creepYds.toFixed(1)} yds toward LOS in final 1.5s pre-snap — high blitz/press indicator.`;
      } else if (isSafety && totalShiftYds > 2.5) {
        flagged = true;
        tellType = "SAFETY SHELL ROTATION";
        note = `Rotated ${totalShiftYds.toFixed(1)} yds pre-snap — disguising post-snap coverage shell.`;
      }

      return { ...d, start, snap, creepYds, totalShiftYds, flagged, tellType, note };
    });
  }, [data]);

  // 3. FATIGUE & KINEMATICS TRACKER
  const fatigueRows = useMemo(() => {
    const midTime = data.snapTime + (data.maxTime - data.snapTime) * 0.55;
    const lateStart = Math.max(data.snapTime, data.maxTime - 1.5);

    const rows = data.players.map((p) => {
      let distYds = 0;
      let peakMph = 0;
      let earlyPeakMph = 0;
      let latePeakMph = 0;

      for (let i = 1; i < p.points.length; i++) {
        const a = p.points[i - 1];
        const b = p.points[i];
        const dt = b.t - a.t;
        if (dt <= 0) continue;
        const stepYds = Math.hypot(b.xYds - a.xYds, b.yYds - a.yYds);
        distYds += stepYds;

        const mph = Math.min(23.5, (stepYds / dt) * 2.04545);
        if (mph > peakMph) peakMph = mph;
        if (b.t >= data.snapTime && b.t <= midTime && mph > earlyPeakMph) earlyPeakMph = mph;
        if (b.t >= lateStart && mph > latePeakMph) latePeakMph = mph;
      }

      const decelPct =
        earlyPeakMph > 2.0
          ? Math.max(0, Math.min(85, Math.round(((earlyPeakMph - latePeakMph) / earlyPeakMph) * 100)))
          : 0;

      return {
        id: p.id,
        side: p.side,
        role: p.role,
        peakSpeed: +peakMph.toFixed(1),
        distance: +distYds.toFixed(1),
        decel: decelPct,
      };
    });

    return rows.sort((a, b) => {
      const mult = sortDir === "desc" ? -1 : 1;
      return (a[sortBy] - b[sortBy]) * mult;
    });
  }, [data, sortBy, sortDir]);

  // 4. DEFENSIVE ASSIGNMENT GRADING & BLOWN COVERAGE DETECTOR
  const assignmentGrades = useMemo(() => {
    const evalEnd = Math.max(data.snapTime + 0.5, data.maxTime - 0.15);
    const evalBefore = Math.max(data.snapTime, evalEnd - 1.0);
    const eligibles = data.players.filter((p) => p.side === "O" && p.role !== "OL" && p.role !== "QB");
    const defs = data.players.filter((p) => p.side === "D" && p.role !== "DL");

    return defs
      .map((d) => {
        const dEnd = getPosAtTime(d, evalEnd);
        const dPrev = getPosAtTime(d, evalBefore);

        let nearestOff = null;
        let minSepEnd = Infinity;

        eligibles.forEach((o) => {
          const oEnd = getPosAtTime(o, evalEnd);
          const dist = Math.hypot(oEnd.xYds - dEnd.xYds, oEnd.yYds - dEnd.yYds);
          if (dist < minSepEnd) {
            minSepEnd = dist;
            nearestOff = o;
          }
        });

        let closingDelta = 0;
        if (nearestOff) {
          const oPrev = getPosAtTime(nearestOff, evalBefore);
          const sepPrev = Math.hypot(oPrev.xYds - dPrev.xYds, oPrev.yYds - dPrev.yYds);
          closingDelta = +(sepPrev - minSepEnd).toFixed(1);
        }

        const sepYds = Number.isFinite(minSepEnd) ? +minSepEnd.toFixed(1) : 3.0;
        const blownCoverage = sepYds > 4.5;

        const rawScore = 94 - Math.max(0, sepYds - 2.0) * 9 + closingDelta * 4;
        const score = Math.max(38, Math.min(99, Math.round(rawScore)));

        return {
          id: d.id,
          role: d.role,
          nearestTarget: nearestOff ? nearestOff.id : "Zone",
          separationYds: sepYds,
          closingDelta,
          blownCoverage,
          score,
        };
      })
      .sort((a, b) => a.score - b.score);
  }, [data]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const flaggedCount = preSnapTells.filter((tItem) => tItem.flagged).length;
  const blownCount = assignmentGrades.filter((g) => g.blownCoverage).length;

  return (
    <div
      style={{
        background: t.cardBg,
        border: `1px solid ${t.border}`,
        borderRadius: "12px",
        padding: "16px",
        color: t.text,
        marginTop: "16px",
        boxShadow: t.cardShadow,
      }}
    >
      {/* Header & Laminated Binder Sub-Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "14px",
          paddingBottom: "12px",
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div>
          <h3 className="font-coach" style={{ margin: 0, fontSize: "21px", fontWeight: 800, color: t.accent }}>
            ALL-22 FILM INTELLIGENCE ENGINE
          </h3>
          <span style={{ fontSize: "12px", color: t.muted }}>
            {data.isDemo
              ? "Showing sample All-22 telemetry (upload an MP4 clip above to analyze your own game film)"
              : `Live Video Telemetry • ${data.players.length} Tracked Players @ ${data.fps} FPS`}
          </span>
        </div>

        {/* 4 Binder Sub-Tab Buttons */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[
            { id: "coverage", label: "1. Coverage Trainer" },
            { id: "tells", label: `2. Pre-Snap Tells (${flaggedCount})` },
            { id: "fatigue", label: "3. Fatigue Tracker" },
            { id: "grading", label: `4. Assignment Grading (${blownCount} Blown)` },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="font-coach"
                style={{
                  padding: "7px 13px",
                  borderRadius: "6px",
                  border: active ? `1px solid ${t.accent}` : `1px solid ${t.border}`,
                  background: active ? t.accent : t.tabBg,
                  color: active ? "#FFFFFF" : t.tabText,
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: active ? t.shadow : "none",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: COVERAGE TRAINER & QUIZ MODE */}
      {activeTab === "coverage" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "16px", alignItems: "start" }}>
          <div style={{ background: t.cardAlt, border: `1px solid ${t.border}`, borderRadius: "10px", padding: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span className="font-coach" style={{ fontSize: "14px", fontWeight: 800, color: t.accent }}>
                POST-SNAP SHELL SNAPSHOT (SNAP + 1.0s) • DEFENSE = X
              </span>
              <label style={{ fontSize: "12px", color: t.gold, fontWeight: 700, display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={quizMode}
                  onChange={(e) => {
                    setQuizMode(e.target.checked);
                    setQuizGuess(null);
                  }}
                />
                Quiz Mode (Hide Answer)
              </label>
            </div>

            {/* Matte Dry-Erase Turf Field Diagram */}
            <svg
              viewBox="0 0 100 48"
              style={{
                width: "100%",
                borderRadius: "8px",
                background: t.turf,
                border: `4px solid ${t.turfFrame}`,
              }}
            >
              {[
                { y: 6, num: "30" },
                { y: 16, num: "20" },
                { y: 26, num: "10" },
              ].map((l) => (
                <g key={l.y}>
                  <line x1="0" y1={l.y} x2="100" y2={l.y} stroke="rgba(255,255,255,0.22)" strokeWidth="0.35" />
                  <text x="5" y={l.y - 0.8} fill="rgba(255,255,255,0.28)" fontSize="3.2" fontWeight="800">
                    {l.num}
                  </text>
                  <text x="95" y={l.y - 0.8} fill="rgba(255,255,255,0.28)" fontSize="3.2" fontWeight="800" textAnchor="end">
                    {l.num}
                  </text>
                </g>
              ))}
              {[10, 20, 30, 40].map((y) => (
                <g key={`h-${y}`}>
                  <line x1="38" y1={y - 0.3} x2="38" y2={y + 0.3} stroke="rgba(255,255,255,0.35)" strokeWidth="0.3" />
                  <line x1="62" y1={y - 0.3} x2="62" y2={y + 0.3} stroke="rgba(255,255,255,0.35)" strokeWidth="0.3" />
                </g>
              ))}
              <line x1="0" y1="36" x2="100" y2="36" stroke="#93C5FD" strokeWidth="0.6" strokeDasharray="1.5 1" />

              {coverageIntel.evalDefs.map((d) => {
                const svgX = (d.xYds / 53.3) * 100;
                const svgY = Math.max(4, Math.min(44, 36 - d.depth));
                const isDeep = d.depth >= 10.0;
                return (
                  <g key={d.id}>
                    {renderDefenseX(svgX, svgY, isDeep, d.role, `(${d.depth}y)`)}
                  </g>
                );
              })}
            </svg>
          </div>

          <div style={{ background: t.cardAlt, border: `1px solid ${t.border}`, borderRadius: "10px", padding: "14px" }}>
            {quizMode && !quizGuess ? (
              <div>
                <div className="font-coach" style={{ fontSize: "15px", fontWeight: 800, color: t.gold, marginBottom: "8px" }}>
                  QUIZ MODE: IDENTIFY THE COVERAGE SHELL
                </div>
                <p style={{ fontSize: "13px", color: t.textSecondary, marginTop: 0 }}>
                  Count the deep safeties (gold-ringed X markers) and check cornerback cushion at <strong>snap + 1.0s</strong>:
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {COVERAGES.map((cov) => (
                    <button
                      key={cov}
                      type="button"
                      onClick={() => setQuizGuess(cov)}
                      className="font-coach"
                      style={{
                        padding: "9px",
                        borderRadius: "6px",
                        border: `1px solid ${t.borderStrong}`,
                        background: t.cardBg,
                        color: t.text,
                        fontWeight: 700,
                        fontSize: "15px",
                        cursor: "pointer",
                      }}
                    >
                      {cov}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {quizMode && quizGuess && (
                  <div
                    style={{
                      padding: "8px 10px",
                      borderRadius: "6px",
                      marginBottom: "10px",
                      background: quizGuess === coverageIntel.detected ? t.greenBg : t.redBg,
                      border: `1px solid ${quizGuess === coverageIntel.detected ? t.green : t.red}`,
                      fontSize: "13px",
                      fontWeight: 700,
                      color: t.text,
                    }}
                  >
                    {quizGuess === coverageIntel.detected
                      ? `Correct! You identified ${coverageIntel.detected}.`
                      : `You guessed ${quizGuess} — actual shell is ${coverageIntel.detected}.`}
                  </div>
                )}

                <div style={{ fontSize: "11px", color: t.muted, fontWeight: 800 }}>AUTO-CLASSIFIED COVERAGE</div>
                <div className="font-coach" style={{ fontSize: "28px", fontWeight: 800, color: t.green, margin: "4px 0 8px 0" }}>
                  {coverageIntel.detected}
                </div>
                <p style={{ margin: "0 0 12px 0", fontSize: "13px", color: t.textSecondary, lineHeight: 1.45 }}>
                  {coverageIntel.rationale}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", textAlign: "center" }}>
                  <div style={{ background: t.insetBg, border: `1px solid ${t.border}`, padding: "8px", borderRadius: "6px" }}>
                    <div style={{ fontSize: "10px", color: t.muted, fontWeight: 700 }}>DEEP SAFETIES</div>
                    <div className="font-coach" style={{ fontSize: "20px", fontWeight: 800, color: t.gold }}>
                      {coverageIntel.deepSafetyCount}
                    </div>
                  </div>
                  <div style={{ background: t.insetBg, border: `1px solid ${t.border}`, padding: "8px", borderRadius: "6px" }}>
                    <div style={{ fontSize: "10px", color: t.muted, fontWeight: 700 }}>AVG CB DEPTH</div>
                    <div className="font-coach" style={{ fontSize: "20px", fontWeight: 800, color: t.accent }}>
                      {coverageIntel.avgCbDepth} yds
                    </div>
                  </div>
                  <div style={{ background: t.insetBg, border: `1px solid ${t.border}`, padding: "8px", borderRadius: "6px" }}>
                    <div style={{ fontSize: "10px", color: t.muted, fontWeight: 700 }}>BOX DEFENDERS</div>
                    <div className="font-coach" style={{ fontSize: "20px", fontWeight: 800, color: t.text }}>
                      {coverageIntel.boxCount}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRE-SNAP TELLS DETECTOR */}
      {activeTab === "tells" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: "16px", alignItems: "start" }}>
          <div style={{ background: t.cardAlt, border: `1px solid ${t.border}`, borderRadius: "10px", padding: "14px" }}>
            <div className="font-coach" style={{ fontSize: "14px", fontWeight: 800, color: t.gold, marginBottom: "8px" }}>
              FINAL 1.5s PRE-SNAP MOVEMENT RADAR (PULSING RINGS = FLAGGED TELLS)
            </div>
            <svg
              viewBox="0 0 100 48"
              style={{
                width: "100%",
                borderRadius: "8px",
                background: t.turf,
                border: `4px solid ${t.turfFrame}`,
              }}
            >
              {[10, 20, 30, 40].map((y) => (
                <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.16)" strokeWidth="0.3" />
              ))}
              <line x1="0" y1="36" x2="100" y2="36" stroke="#93C5FD" strokeWidth="0.6" strokeDasharray="1.5 1" />
              {preSnapTells.map((d) => {
                const x1 = (d.start.xYds / 53.3) * 100;
                const y1 = Math.max(4, Math.min(44, 36 - (data.losYds - d.start.yYds)));
                const x2 = (d.snap.xYds / 53.3) * 100;
                const y2 = Math.max(4, Math.min(44, 36 - (data.losYds - d.snap.yYds)));

                return (
                  <g key={d.id}>
                    {d.flagged && (
                      <>
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FACC15" strokeWidth="0.6" strokeDasharray="0.8 0.6" />
                        <circle cx={x2} cy={y2} r="3.4" fill="none" stroke="#FACC15" strokeWidth="0.65">
                          <animate attributeName="r" values="2.6;5.4;2.6" dur="1.4s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="1;0.15;1" dur="1.4s" repeatCount="indefinite" />
                        </circle>
                      </>
                    )}
                    {renderDefenseX(x2, y2, d.flagged, d.role, "")}
                  </g>
                );
              })}
            </svg>
          </div>

          <div
            style={{
              background: t.cardAlt,
              border: `1px solid ${t.border}`,
              borderRadius: "10px",
              padding: "14px",
              maxHeight: "340px",
              overflowY: "auto",
            }}
          >
            <div className="font-coach" style={{ fontSize: "14px", fontWeight: 800, color: t.accent, marginBottom: "8px" }}>
              DETECTED PRE-SNAP INDICATORS
            </div>
            {preSnapTells.filter((tItem) => tItem.flagged).length === 0 ? (
              <p style={{ fontSize: "13px", color: t.muted }}>
                No major pre-snap creeps (over 1.5 yds) or safety rotations (over 2.5 yds) detected on this clip.
              </p>
            ) : (
              preSnapTells
                .filter((tItem) => tItem.flagged)
                .map((tItem) => (
                  <div
                    key={tItem.id}
                    style={{
                      background: t.cardBg,
                      border: `1px solid ${t.border}`,
                      borderLeft: `4px solid ${t.goldBorder}`,
                      padding: "10px",
                      borderRadius: "6px",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 800, color: t.gold }}>
                      {tItem.tellType} • {tItem.id} ({tItem.role})
                    </div>
                    <div style={{ fontSize: "12.5px", color: t.textSecondary, marginTop: "4px" }}>{tItem.note}</div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FATIGUE & WORKLOAD TRACKER */}
      {activeTab === "fatigue" && (
        <div
          style={{
            background: t.cardAlt,
            border: `1px solid ${t.border}`,
            borderRadius: "10px",
            padding: "14px",
            overflowX: "auto",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: t.tableHeaderBg, borderBottom: `2px solid ${t.border}`, color: t.muted, textAlign: "left" }}>
                <th style={{ padding: "8px" }}>Player</th>
                <th style={{ padding: "8px" }}>Side / Role</th>
                <th style={{ padding: "8px", cursor: "pointer", color: t.accent }} onClick={() => toggleSort("peakSpeed")}>
                  Peak Speed (mph) {sortBy === "peakSpeed" ? (sortDir === "desc" ? "▼" : "▲") : ""}
                </th>
                <th style={{ padding: "8px", cursor: "pointer", color: t.accent }} onClick={() => toggleSort("distance")}>
                  Distance (yds) {sortBy === "distance" ? (sortDir === "desc" ? "▼" : "▲") : ""}
                </th>
                <th style={{ padding: "8px", cursor: "pointer", color: t.accent }} onClick={() => toggleSort("decel")}>
                  Late-Play Decel % {sortBy === "decel" ? (sortDir === "desc" ? "▼" : "▲") : ""}
                </th>
                <th style={{ padding: "8px" }}>Load Status</th>
              </tr>
            </thead>
            <tbody>
              {fatigueRows.map((r) => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${t.tableRowBorder}` }}>
                  <td style={{ padding: "8px", fontWeight: 700 }}>{r.id}</td>
                  <td style={{ padding: "8px", color: r.side === "O" ? t.accent : t.red, fontWeight: 600 }}>
                    {r.side === "O" ? "OFF (O)" : "DEF (X)"} • {r.role}
                  </td>
                  <td className="font-mono-coach" style={{ padding: "8px", fontWeight: 700, color: t.green }}>
                    {r.peakSpeed} mph
                  </td>
                  <td className="font-mono-coach" style={{ padding: "8px" }}>{r.distance} yds</td>
                  <td className="font-mono-coach" style={{ padding: "8px" }}>{r.decel}%</td>
                  <td style={{ padding: "8px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: r.decel >= 35 ? t.redBg : r.decel >= 18 ? t.goldBg : t.greenBg,
                        color: r.decel >= 35 ? t.red : r.decel >= 18 ? t.gold : t.green,
                        border: `1px solid ${r.decel >= 35 ? t.red : r.decel >= 18 ? t.goldBorder : t.green}`,
                      }}
                    >
                      {r.decel >= 35 ? "High Fatigue" : r.decel >= 18 ? "Moderate Load" : "Fresh"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: DEFENSIVE ASSIGNMENT GRADING */}
      {activeTab === "grading" && (
        <div
          style={{
            background: t.cardAlt,
            border: `1px solid ${t.border}`,
            borderRadius: "10px",
            padding: "14px",
            overflowX: "auto",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: t.tableHeaderBg, borderBottom: `2px solid ${t.border}`, color: t.muted, textAlign: "left" }}>
                <th style={{ padding: "8px" }}>Defender</th>
                <th style={{ padding: "8px" }}>Nearest Matchup</th>
                <th style={{ padding: "8px" }}>End Separation</th>
                <th style={{ padding: "8px" }}>Closing Gain (Last 1s)</th>
                <th style={{ padding: "8px" }}>Grade (0–100)</th>
                <th style={{ padding: "8px" }}>Assignment Status</th>
              </tr>
            </thead>
            <tbody>
              {assignmentGrades.map((g) => (
                <tr key={g.id} style={{ borderBottom: `1px solid ${t.tableRowBorder}` }}>
                  <td style={{ padding: "8px", fontWeight: 700 }}>
                    {g.id} ({g.role})
                  </td>
                  <td style={{ padding: "8px" }}>{g.nearestTarget}</td>
                  <td
                    className="font-mono-coach"
                    style={{ padding: "8px", color: g.blownCoverage ? t.red : t.text, fontWeight: 700 }}
                  >
                    {g.separationYds} yds
                  </td>
                  <td
                    className="font-mono-coach"
                    style={{ padding: "8px", color: g.closingDelta >= 0 ? t.green : t.gold, fontWeight: 700 }}
                  >
                    {g.closingDelta >= 0 ? `+${g.closingDelta}` : g.closingDelta} yds
                  </td>
                  <td className="font-coach" style={{ padding: "8px", fontWeight: 800, fontSize: "17px" }}>
                    {g.score}
                  </td>
                  <td style={{ padding: "8px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 800,
                        background: g.blownCoverage ? "#DC2626" : g.score >= 82 ? "#15803D" : "#1D4ED8",
                        color: "#FFFFFF",
                      }}
                    >
                      {g.blownCoverage
                        ? "BLOWN COVERAGE (>4.5y)"
                        : g.score >= 82
                        ? "LOCKDOWN / TIGHT"
                        : "DISCIPLINED ZONE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
