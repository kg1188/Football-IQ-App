/* eslint-disable react/prop-types */
// frontend/src/components/FootballGlossaryDrawer.jsx
import React, { useState, useEffect } from "react";
import { getCoachTheme } from "../data/coachTheme";

const ROUTE_TREE = [
  {
    num: 0,
    name: "Hitch / Smoke",
    depth: "5 yds",
    breakDir: "Stop / Back to QB",
    beats: "Off Coverage, Cover 3 Cushion, Cover 4",
    cue: "Push vertical 5 steps to sell go, drop hips violently, show numbers to QB.",
    pts: [
      { x: 50, y: 46 },
      { x: 50, y: 36 },
      { x: 47, y: 38 },
    ],
  },
  {
    num: 1,
    name: "Flat / Speed Out",
    depth: "3–5 yds",
    breakDir: "Hard Outside (90°)",
    beats: "Cover 1 Man (outside leverage), Soft Cover 3",
    cue: "Burst 3 yards vertical then snap outside at 90° toward the sideline numbers.",
    pts: [
      { x: 50, y: 46 },
      { x: 50, y: 39 },
      { x: 24, y: 39 },
    ],
  },
  {
    num: 2,
    name: "Slant",
    depth: "3–5 yds",
    breakDir: "45° Inside",
    beats: "Cover 0/1 Blitz, Outside-Leverage Press",
    cue: "3-step outside jab release, plant outside foot, cross defender's face on 45° angle.",
    pts: [
      { x: 50, y: 46 },
      { x: 50, y: 40 },
      { x: 74, y: 27 },
    ],
  },
  {
    num: 3,
    name: "Quick Out / 10-Yd Out",
    depth: "10 yds",
    breakDir: "90° Outside",
    beats: "Cover 3 Curl/Flat, Cover 1 Inside Trail",
    cue: "Stem vertical at cornerback's outside hip for 10 yards, stick inside foot, drive out.",
    pts: [
      { x: 50, y: 46 },
      { x: 50, y: 29 },
      { x: 20, y: 29 },
    ],
  },
  {
    num: 4,
    name: "Curl / Hook",
    depth: "10–12 yds",
    breakDir: "Inside Turnback",
    beats: "Cover 3, Cover 4 Quarters Cushion",
    cue: "Eat up corner's 8-yard cushion to 12 yards, snap head inside, settle in void away from LB.",
    pts: [
      { x: 50, y: 46 },
      { x: 50, y: 25 },
      { x: 56, y: 28 },
    ],
  },
  {
    num: 5,
    name: "Comeback",
    depth: "14–15 yds",
    breakDir: "45° Back & Outside",
    beats: "Cover 3 Deep Third, Bail Corner",
    cue: "Sell vertical fade to 15 yards until DB flips hips, drop weight, break 45° back to sideline.",
    pts: [
      { x: 50, y: 46 },
      { x: 50, y: 17 },
      { x: 28, y: 24 },
    ],
  },
  {
    num: 6,
    name: "Dig / Square In",
    depth: "12–15 yds",
    breakDir: "90° Inside",
    beats: "Cover 2 Mid Hole, Cover 4 (behind cleared safety)",
    cue: "Vertical stem to 12–15 yards, break flat across the field behind linebackers and under safeties.",
    pts: [
      { x: 50, y: 46 },
      { x: 50, y: 21 },
      { x: 84, y: 21 },
    ],
  },
  {
    num: 7,
    name: "Corner / Flag",
    depth: "12–15 yds",
    breakDir: "45° Deep Outside",
    beats: "Cover 2 (Sideline Honey Hole), Cover 6",
    cue: "Stem at inside leverage of CB/safety to hold them inside, break 45° toward back pylon.",
    pts: [
      { x: 50, y: 46 },
      { x: 50, y: 23 },
      { x: 21, y: 9 },
    ],
  },
  {
    num: 8,
    name: "Post",
    depth: "15–18 yds",
    breakDir: "45° Deep Inside",
    beats: "Cover 2 (Deep Middle Open), Cover 4 Play-Action",
    cue: "Threaten outside shoulder for 12–15 yards, break sharply at 45° toward the goalpost.",
    pts: [
      { x: 50, y: 46 },
      { x: 50, y: 18 },
      { x: 75, y: 6 },
    ],
  },
  {
    num: 9,
    name: "Go / Fade / Seam",
    depth: "18+ yds",
    breakDir: "Vertical Stack",
    beats: "Cover 0/1 1-on-1 Matchup, Cover 3 Seams",
    cue: "Win release off the line, stack directly on top of DB's hip, track ball over outside shoulder.",
    pts: [
      { x: 50, y: 46 },
      { x: 50, y: 6 },
    ],
  },
];

const COVERAGE_GUIDE = [
  {
    id: "Cover 0",
    preSnap: "0-High (No Deep Safety)",
    postSnap: "All-out man coverage + blitz pressure. Zero deep help.",
    howToSpot: "Safeties walk down over slots/TEs or mug the A/B gaps. No safety deeper than 8 yards.",
    beater: "Hot Slants, Rub/Mesh Picks & RB Screens",
    why: "With zero deep safety help, quick 1-on-1 horizontal breaks or screens into vacated blitz lanes hit big yardage immediately.",
    zones: [],
    defenders: [
      { id: "CB", x: 14, y: 32 },
      { id: "NB", x: 32, y: 31 },
      { id: "LB", x: 45, y: 33 },
      { id: "LB", x: 55, y: 33 },
      { id: "SS", x: 68, y: 30 },
      { id: "CB", x: 86, y: 32 },
    ],
  },
  {
    id: "Cover 1",
    preSnap: "1-High (MOFC)",
    postSnap: "1 Free Safety deep middle; CBs & LBs locked man-to-man.",
    howToSpot: "Corners aligned tight in press with eyes locked on receivers. Pre-snap motion drags a defender across the field.",
    beater: "Mesh (Double Crossers) & Rub/Wheel Concepts",
    why: "Crossing routes force man defenders through traffic/picks, and an RB wheel beats a trailing linebacker up the sideline.",
    zones: [{ label: "DEEP 1/1", x: 50, y: 11, rx: 18, ry: 6 }],
    defenders: [
      { id: "CB", x: 14, y: 33 },
      { id: "LB", x: 42, y: 27 },
      { id: "LB", x: 58, y: 27 },
      { id: "NB", x: 74, y: 32 },
      { id: "CB", x: 86, y: 33 },
      { id: "FS", x: 50, y: 12 },
    ],
  },
  {
    id: "Cover 2",
    preSnap: "2-High (MOFO)",
    postSnap: "2 Safeties split deep halves; CBs squat shallow flats at 4–5 yds.",
    howToSpot: "Two deep safeties aligned on the hashes (12–15y), corners rolled up shallow looking at the QB.",
    beater: "Smash (Hitch + Corner) & Deep Middle Post",
    why: "Corners jump the short hitch, leaving a massive 'honey hole' at 14–18 yds on the sideline before the safety can get over, plus the deep middle is open.",
    zones: [
      { label: "DEEP 1/2", x: 26, y: 11, rx: 20, ry: 6.5 },
      { label: "DEEP 1/2", x: 74, y: 11, rx: 20, ry: 6.5 },
      { label: "FLAT", x: 13, y: 28, rx: 10, ry: 4.5 },
      { label: "TAMPA", x: 50, y: 23, rx: 12, ry: 4.5 },
      { label: "FLAT", x: 87, y: 28, rx: 10, ry: 4.5 },
    ],
    defenders: [
      { id: "CB", x: 14, y: 29 },
      { id: "LB", x: 42, y: 26 },
      { id: "LB", x: 58, y: 26 },
      { id: "CB", x: 86, y: 29 },
      { id: "FS", x: 31, y: 13 },
      { id: "SS", x: 69, y: 13 },
    ],
  },
  {
    id: "Cover 3",
    preSnap: "1-High (MOFC) or 2-High Buzz",
    postSnap: "3 deep thirds (FS middle + 2 CBs outside); 4 defenders underneath.",
    howToSpot: "Backed-off corners (7+ yds) bailing deep at the snap while one safety rolls into the box/flat and the other takes the deep middle.",
    beater: "Flood (3-Level Sideline) & Four Verticals (Seams)",
    why: "Flood puts 3 routes at different depths on one sideline to outnumber the single flat defender; seams split the deep thirds.",
    zones: [
      { label: "1/3", x: 17, y: 11, rx: 14, ry: 6.5 },
      { label: "1/3", x: 50, y: 10, rx: 15, ry: 6.5 },
      { label: "1/3", x: 83, y: 11, rx: 14, ry: 6.5 },
      { label: "CURL/FLAT", x: 14, y: 27, rx: 11, ry: 4.5 },
      { label: "HOOK", x: 40, y: 26, rx: 10, ry: 4.5 },
      { label: "HOOK", x: 60, y: 26, rx: 10, ry: 4.5 },
      { label: "CURL/FLAT", x: 86, y: 27, rx: 11, ry: 4.5 },
    ],
    defenders: [
      { id: "CB", x: 15, y: 22 },
      { id: "LB", x: 42, y: 27 },
      { id: "LB", x: 56, y: 27 },
      { id: "SS", x: 72, y: 27 },
      { id: "CB", x: 85, y: 22 },
      { id: "FS", x: 50, y: 11 },
    ],
  },
  {
    id: "Cover 4",
    preSnap: "2-High (MOFO) Quarters",
    postSnap: "4 deep quarters (2 CBs + 2 Safeties); 3 defenders underneath.",
    howToSpot: "All 4 defensive backs sit 7–11 yards off and bail vertically at the snap—building a 4-across deep ceiling.",
    beater: "Mills (Post + Dig) & Checkdown Flats",
    why: "With 4 defenders deep, only 3 cover the entire width underneath. High-low concepts like Mills pull the safety deep to clear the 12-yd dig.",
    zones: [
      { label: "1/4", x: 14, y: 11, rx: 10.5, ry: 6.5 },
      { label: "1/4", x: 38, y: 11, rx: 10.5, ry: 6.5 },
      { label: "1/4", x: 62, y: 11, rx: 10.5, ry: 6.5 },
      { label: "1/4", x: 86, y: 11, rx: 10.5, ry: 6.5 },
      { label: "FLAT", x: 16, y: 28, rx: 11, ry: 4.5 },
      { label: "HOOK", x: 50, y: 26, rx: 13, ry: 4.5 },
      { label: "FLAT", x: 84, y: 28, rx: 11, ry: 4.5 },
    ],
    defenders: [
      { id: "CB", x: 14, y: 21 },
      { id: "LB", x: 41, y: 27 },
      { id: "LB", x: 59, y: 27 },
      { id: "CB", x: 86, y: 21 },
      { id: "FS", x: 36, y: 14 },
      { id: "SS", x: 64, y: 14 },
    ],
  },
  {
    id: "Cover 6",
    preSnap: "2-High Split (Combo Shell)",
    postSnap: "Split-field hybrid: Cover 4 (Quarters) to one half, Cover 2 to the other.",
    howToSpot: "One CB squats at 5 yards (Cover 2 side) while the opposite CB plays off at 8 yards (Quarters side).",
    beater: "Smash / Flood to the Cover 2 Side",
    why: "Attack the squat-corner side with a corner route or orbit flat stretch into the sideline honey hole.",
    zones: [
      { label: "1/4", x: 14, y: 11, rx: 10, ry: 6.5 },
      { label: "1/4", x: 37, y: 11, rx: 10, ry: 6.5 },
      { label: "DEEP 1/2", x: 75, y: 11, rx: 20, ry: 6.5 },
      { label: "FLAT", x: 88, y: 28, rx: 9, ry: 4.5 },
    ],
    defenders: [
      { id: "CB", x: 14, y: 22 },
      { id: "FS", x: 36, y: 14 },
      { id: "LB", x: 44, y: 27 },
      { id: "LB", x: 62, y: 27 },
      { id: "SS", x: 72, y: 12 },
      { id: "CB", x: 87, y: 29 },
    ],
  },
];

const PERSONNEL_GROUPS = [
  {
    code: "11 Personnel",
    split: "1 RB • 1 TE • 3 WR",
    summary: "Modern NFL base offense (~62% of snaps). Forces defenses into Nickel (5 DBs) and creates spread passing lanes with inside-zone run threats.",
    offense: [
      { id: "X", x: 12, y: 36 },
      { id: "H", x: 26, y: 38 },
      { id: "TE", x: 65, y: 36 },
      { id: "Z", x: 88, y: 36 },
      { id: "RB", x: 44, y: 44 },
    ],
  },
  {
    code: "12 Personnel",
    split: "1 RB • 2 TE • 2 WR",
    summary: "Balanced 'heavy' threat. Lets the offense run power out of base alignment or run deep play-action boots (like PA Yankee) against base defenses.",
    offense: [
      { id: "X", x: 14, y: 36 },
      { id: "TE", x: 35, y: 37 },
      { id: "TE", x: 65, y: 36 },
      { id: "Z", x: 86, y: 36 },
      { id: "RB", x: 50, y: 44 },
    ],
  },
  {
    code: "21 Personnel",
    split: "2 RB (1 FB) • 1 TE • 2 WR",
    summary: "Pro-style / Shanahan downhill offense. Uses a lead Fullback to kick out edge defenders and create explosive outside-zone & play-action looks.",
    offense: [
      { id: "X", x: 14, y: 36 },
      { id: "TE", x: 65, y: 36 },
      { id: "Z", x: 86, y: 36 },
      { id: "FB", x: 50, y: 41 },
      { id: "RB", x: 50, y: 46 },
    ],
  },
  {
    code: "22 Personnel",
    split: "2 RB • 2 TE • 1 WR",
    summary: "Short-yardage / Goal-line heavy package. Forces the defense into an 8-man box, opening vertical play-action seams if the safeties bite.",
    offense: [
      { id: "TE", x: 35, y: 36 },
      { id: "TE", x: 65, y: 36 },
      { id: "Z", x: 86, y: 36 },
      { id: "FB", x: 46, y: 42 },
      { id: "RB", x: 53, y: 46 },
    ],
  },
];

const DEFENSIVE_FRONTS = [
  {
    name: "4-3 Over",
    box: "7-Man Box (4 DL + 3 LB)",
    summary: "Four down linemen shifted toward the Tight End side: 3-tech DT over the strong guard, 1-tech NT shaded on the center, plus 3 off-ball LBs.",
    defenders: [
      { id: "DE", x: 37, y: 32 },
      { id: "1T", x: 47, y: 32 },
      { id: "3T", x: 57, y: 32 },
      { id: "DE", x: 66, y: 32 },
      { id: "W", x: 41, y: 24 },
      { id: "M", x: 52, y: 24 },
      { id: "S", x: 68, y: 25 },
    ],
  },
  {
    name: "3-4 Odd",
    box: "7-Man Box (3 DL + 4 LB)",
    summary: "A heavy 0-tech Nose Tackle heads up on the Center with two 4i/5-tech DEs and 4 athletic linebackers—disguises where the 4th pass rusher is coming from.",
    defenders: [
      { id: "DE", x: 41, y: 32 },
      { id: "NT", x: 50, y: 32 },
      { id: "DE", x: 59, y: 32 },
      { id: "OLB", x: 35, y: 30 },
      { id: "ILB", x: 45, y: 24 },
      { id: "ILB", x: 55, y: 24 },
      { id: "OLB", x: 65, y: 30 },
    ],
  },
  {
    name: "Nickel 4-2-5",
    box: "6-Man Light Box (4 DL + 2 LB + Slot NB)",
    summary: "Swaps a linebacker for a 5th defensive back (Nickel) to match 11 Personnel slot WRs. Creates favorable 6-man light boxes for inside-zone runs.",
    defenders: [
      { id: "DE", x: 38, y: 32 },
      { id: "DT", x: 47, y: 32 },
      { id: "DT", x: 56, y: 32 },
      { id: "DE", x: 63, y: 32 },
      { id: "W", x: 43, y: 25 },
      { id: "M", x: 57, y: 25 },
      { id: "NB", x: 26, y: 29 },
    ],
  },
];

export default function FootballGlossaryDrawer({ isOpen, onClose, themeName = "light" }) {
  const [tab, setTab] = useState("routes"); // "routes" | "coverages" | "personnel"
  const [selectedRoute, setSelectedRoute] = useState(7);
  const [selectedCov, setSelectedCov] = useState("Cover 2");
  const [selectedFront, setSelectedFront] = useState("4-3 Over");

  const t = getCoachTheme(themeName);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeRoute = ROUTE_TREE.find((r) => r.num === selectedRoute) || ROUTE_TREE[7];
  const activeCov = COVERAGE_GUIDE.find((c) => c.id === selectedCov) || COVERAGE_GUIDE[2];
  const activeFront = DEFENSIVE_FRONTS.find((f) => f.name === selectedFront) || DEFENSIVE_FRONTS[0];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        justifyContent: "flex-end",
        background: "rgba(15, 17, 20, 0.55)",
        backdropFilter: "blur(2px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(680px, 96vw)",
          height: "100%",
          background: t.cardBg,
          color: t.text,
          borderLeft: `3px solid ${t.borderStrong}`,
          boxShadow: "-8px 0 30px rgba(0,0,0,0.28)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            background: t.headerBg,
            borderBottom: `1px solid ${t.border}`,
            padding: "14px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div className="font-coach" style={{ fontSize: "22px", fontWeight: 800, lineHeight: 1.1 }}>
              PLAYBOOK GLOSSARY &amp; CHEAT SHEET
            </div>
            <div style={{ fontSize: "12px", color: t.muted, marginTop: "2px" }}>
              Sideline quick-reference for routes, coverage beaters &amp; defensive fronts
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: `1px solid ${t.borderStrong}`,
              background: t.cardBg,
              color: t.text,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Binder Divider Tabs */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            padding: "10px 18px 0 18px",
            background: t.headerBg,
            borderBottom: `1px solid ${t.border}`,
          }}
        >
          {[
            { id: "routes", label: "Route Tree (0–9)" },
            { id: "coverages", label: "Coverage Shells & Beaters" },
            { id: "personnel", label: "Personnel & Fronts" },
          ].map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className="font-coach"
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px 8px 0 0",
                  border: `1px solid ${active ? t.border : "transparent"}`,
                  borderBottom: active ? `2px solid ${t.cardBg}` : "none",
                  background: active ? t.cardBg : t.tabBg,
                  color: active ? t.accent : t.tabText,
                  fontWeight: 700,
                  fontSize: "15px",
                  cursor: "pointer",
                  marginBottom: active ? "-1px" : "0",
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: "18px", overflowY: "auto", flex: 1 }}>
          {/* TAB 1: ROUTE TREE (0-9) */}
          {tab === "routes" && (
            <div>
              <div
                style={{
                  background: t.cardAlt,
                  border: `1px solid ${t.border}`,
                  borderRadius: "10px",
                  padding: "12px",
                  marginBottom: "14px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span className="font-coach" style={{ fontSize: "16px", fontWeight: 700, color: t.accent }}>
                    COMPLETE PASSING ROUTE TREE (CLICK ANY ROUTE #)
                  </span>
                  <span style={{ fontSize: "11px", color: t.muted, fontWeight: 600 }}>
                    Even = Inside/Back • Odd = Outside/Vert
                  </span>
                </div>

                <svg
                  viewBox="0 0 100 54"
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    background: t.turf,
                    border: `4px solid ${t.turfFrame}`,
                  }}
                >
                  {/* Depth Yard Lines */}
                  {[
                    { y: 40, label: "5y" },
                    { y: 31, label: "10y" },
                    { y: 24, label: "15y" },
                    { y: 15, label: "20y" },
                  ].map((line) => (
                    <g key={line.label}>
                      <line
                        x1="0"
                        y1={line.y}
                        x2="100"
                        y2={line.y}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="0.3"
                        strokeDasharray="1.2 1"
                      />
                      <text x="3" y={line.y - 0.8} fill="rgba(255,255,255,0.65)" fontSize="2.2" fontWeight="bold">
                        {line.label}
                      </text>
                    </g>
                  ))}
                  <line x1="0" y1="46" x2="100" y2="46" stroke="#38BDF8" strokeWidth="0.6" strokeDasharray="1.5 1" />
                  <text x="97" y="44.8" fill="#BAE6FD" fontSize="2.1" textAnchor="end" fontWeight="bold">
                    LOS
                  </text>

                  {/* All 10 Routes */}
                  {ROUTE_TREE.map((r) => {
                    const isSel = r.num === selectedRoute;
                    const end = r.pts[r.pts.length - 1];
                    return (
                      <g
                        key={r.num}
                        onClick={() => setSelectedRoute(r.num)}
                        style={{ cursor: "pointer" }}
                        opacity={isSel ? 1 : 0.45}
                      >
                        <polyline
                          points={r.pts.map((p) => `${p.x},${p.y}`).join(" ")}
                          fill="none"
                          stroke={isSel ? "#FACC15" : "#E2E8F0"}
                          strokeWidth={isSel ? "1.1" : "0.55"}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx={end.x}
                          cy={end.y}
                          r={isSel ? "2.6" : "2.1"}
                          fill={isSel ? "#FACC15" : "#1D4ED8"}
                          stroke="#FFFFFF"
                          strokeWidth="0.4"
                        />
                        <text
                          x={end.x}
                          y={end.y + 0.8}
                          fill={isSel ? "#1C1917" : "#FFFFFF"}
                          fontSize="2.2"
                          fontWeight="900"
                          textAnchor="middle"
                        >
                          {r.num}
                        </text>
                      </g>
                    );
                  })}

                  {/* WR Origin O Marker */}
                  <circle cx="50" cy="46" r="2.4" fill="#FAF8F3" stroke="#1D4ED8" strokeWidth="0.8" />
                  <text x="50" y="46.8" fill="#1D4ED8" fontSize="2.1" fontWeight="900" textAnchor="middle">
                    WR
                  </text>
                </svg>
              </div>

              {/* Selected Route Breakdown */}
              <div
                style={{
                  background: t.goldBg,
                  border: `1px solid ${t.goldBorder}`,
                  borderRadius: "10px",
                  padding: "12px 14px",
                  marginBottom: "14px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                  <div className="font-coach" style={{ fontSize: "20px", fontWeight: 800 }}>
                    #{activeRoute.num} — {activeRoute.name}
                  </div>
                  <span
                    className="font-mono-coach"
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: t.cardBg,
                      border: `1px solid ${t.border}`,
                    }}
                  >
                    Depth: {activeRoute.depth}
                  </span>
                </div>
                <div style={{ fontSize: "12.5px", marginTop: "6px", color: t.text }}>
                  <strong>Break:</strong> {activeRoute.breakDir} • <strong>Attacks:</strong> {activeRoute.beats}
                </div>
                <div style={{ fontSize: "12.5px", marginTop: "4px", color: t.textSecondary }}>
                  <strong>Coaching Cue:</strong> {activeRoute.cue}
                </div>
              </div>

              {/* 0-9 Compact Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {ROUTE_TREE.map((r) => {
                  const isSel = r.num === selectedRoute;
                  return (
                    <button
                      key={r.num}
                      type="button"
                      onClick={() => setSelectedRoute(r.num)}
                      style={{
                        textAlign: "left",
                        padding: "9px 10px",
                        borderRadius: "8px",
                        border: isSel ? `2px solid ${t.accent}` : `1px solid ${t.border}`,
                        background: isSel ? t.accentSoftBg : t.cardAlt,
                        color: t.text,
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "13px" }}>
                        <span>
                          #{r.num} {r.name}
                        </span>
                        <span style={{ color: t.accent, fontSize: "11px" }}>{r.depth}</span>
                      </div>
                      <div style={{ fontSize: "11px", color: t.muted, marginTop: "2px" }}>{r.beats}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: COVERAGE SHELLS & BEATERS */}
          {tab === "coverages" && (
            <div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
                {COVERAGE_GUIDE.map((c) => {
                  const active = c.id === selectedCov;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCov(c.id)}
                      className="font-coach"
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: `1px solid ${active ? t.accent : t.border}`,
                        background: active ? t.accent : t.cardAlt,
                        color: active ? "#FFFFFF" : t.text,
                        fontWeight: 700,
                        fontSize: "15px",
                        cursor: "pointer",
                      }}
                    >
                      {c.id}
                    </button>
                  );
                })}
              </div>

              {/* Mini Shell Diagram */}
              <div
                style={{
                  background: t.cardAlt,
                  border: `1px solid ${t.border}`,
                  borderRadius: "10px",
                  padding: "12px",
                  marginBottom: "14px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span className="font-coach" style={{ fontSize: "18px", fontWeight: 800 }}>
                    {activeCov.id} — {activeCov.preSnap}
                  </span>
                </div>

                <svg
                  viewBox="0 0 100 44"
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    background: t.turf,
                    border: `4px solid ${t.turfFrame}`,
                  }}
                >
                  {[10, 20, 30].map((y) => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.18)" strokeWidth="0.3" />
                  ))}
                  <line x1="0" y1="35" x2="100" y2="35" stroke="#38BDF8" strokeWidth="0.6" strokeDasharray="1.5 1" />

                  {activeCov.zones.map((z, idx) => (
                    <g key={idx}>
                      <ellipse
                        cx={z.x}
                        cy={z.y}
                        rx={z.rx}
                        ry={z.ry}
                        fill="rgba(56, 189, 248, 0.14)"
                        stroke="rgba(56, 189, 248, 0.45)"
                        strokeWidth="0.4"
                        strokeDasharray="1.2 0.8"
                      />
                      <text x={z.x} y={z.y + 0.7} fill="#E0F2FE" fontSize="2" fontWeight="bold" textAnchor="middle">
                        {z.label}
                      </text>
                    </g>
                  ))}

                  {activeCov.zones.length === 0 && (
                    <text x="50" y="12" fill="rgba(255,255,255,0.45)" fontSize="2.6" fontWeight="800" textAnchor="middle">
                      MAN COVERAGE — LOCKED ON RECEIVERS
                    </text>
                  )}

                  {/* Offensive Line O Markers */}
                  {[40, 45, 50, 55, 60].map((x, idx) => (
                    <circle key={idx} cx={x} cy="37" r="1.5" fill="#FAF8F3" stroke="#1D4ED8" strokeWidth="0.55" />
                  ))}

                  {/* Defensive X Markers */}
                  {activeCov.defenders.map((d, idx) => (
                    <g key={idx}>
                      <circle cx={d.x} cy={d.y} r="2.4" fill="rgba(250, 248, 243, 0.88)" stroke="rgba(220, 38, 38, 0.55)" strokeWidth="0.3" />
                      <line x1={d.x - 1.2} y1={d.y - 1.2} x2={d.x + 1.2} y2={d.y + 1.2} stroke="#DC2626" strokeWidth="0.7" strokeLinecap="round" />
                      <line x1={d.x + 1.2} y1={d.y - 1.2} x2={d.x - 1.2} y2={d.y + 1.2} stroke="#DC2626" strokeWidth="0.7" strokeLinecap="round" />
                      <text x={d.x} y={d.y + 4.3} fill="#FAF8F3" fontSize="1.9" fontWeight="bold" textAnchor="middle">
                        {d.id}
                      </text>
                    </g>
                  ))}
                </svg>

                <div style={{ marginTop: "10px", display: "grid", gap: "8px", fontSize: "13px" }}>
                  <div>
                    <strong>Post-Snap Shell:</strong> {activeCov.postSnap}
                  </div>
                  <div>
                    <strong>How to Spot It:</strong> {activeCov.howToSpot}
                  </div>
                  <div
                    style={{
                      background: t.greenBg,
                      border: `1px solid ${t.green}`,
                      borderRadius: "8px",
                      padding: "10px",
                    }}
                  >
                    <div style={{ fontWeight: 800, color: t.green, fontSize: "12px" }}>
                      #1 PASSING BEATER: {activeCov.beater}
                    </div>
                    <div style={{ marginTop: "3px", color: t.text }}>{activeCov.why}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PERSONNEL & FRONTS */}
          {tab === "personnel" && (
            <div style={{ display: "grid", gap: "16px" }}>
              <div>
                <div className="font-coach" style={{ fontSize: "18px", fontWeight: 800, marginBottom: "4px" }}>
                  OFFENSIVE PERSONNEL PACKAGES (RB + TE DIGITS)
                </div>
                <p style={{ fontSize: "12.5px", color: t.muted, margin: "0 0 10px 0" }}>
                  First digit = Running Backs, Second digit = Tight Ends, remaining skill players (out of 5) = Wide Receivers.
                </p>
                <div style={{ display: "grid", gap: "8px" }}>
                  {PERSONNEL_GROUPS.map((pg) => (
                    <div
                      key={pg.code}
                      style={{
                        background: t.cardAlt,
                        border: `1px solid ${t.border}`,
                        borderRadius: "8px",
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong className="font-coach" style={{ fontSize: "17px", color: t.accent }}>
                          {pg.code}
                        </strong>
                        <span
                          className="font-mono-coach"
                          style={{
                            fontSize: "11.5px",
                            fontWeight: 700,
                            background: t.insetBg,
                            padding: "2px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          {pg.split}
                        </span>
                      </div>
                      <div style={{ fontSize: "12.5px", color: t.textSecondary, marginTop: "4px", lineHeight: 1.45 }}>
                        {pg.summary}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-coach" style={{ fontSize: "18px", fontWeight: 800, marginBottom: "8px" }}>
                  DEFENSIVE FRONTS &amp; BOX STRUCTURE
                </div>
                <div style={{ display: "flex", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
                  {DEFENSIVE_FRONTS.map((f) => {
                    const active = f.name === selectedFront;
                    return (
                      <button
                        key={f.name}
                        type="button"
                        onClick={() => setSelectedFront(f.name)}
                        className="font-coach"
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: `1px solid ${active ? t.accent : t.border}`,
                          background: active ? t.accent : t.cardAlt,
                          color: active ? "#FFFFFF" : t.text,
                          fontWeight: 700,
                          fontSize: "14px",
                          cursor: "pointer",
                        }}
                      >
                        {f.name}
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    background: t.cardAlt,
                    border: `1px solid ${t.border}`,
                    borderRadius: "10px",
                    padding: "12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <strong className="font-coach" style={{ fontSize: "17px" }}>{activeFront.name}</strong>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: t.gold }}>{activeFront.box}</span>
                  </div>

                  <svg
                    viewBox="0 0 100 32"
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      background: t.turf,
                      border: `4px solid ${t.turfFrame}`,
                      marginBottom: "8px",
                    }}
                  >
                    <line x1="0" y1="22" x2="100" y2="22" stroke="#38BDF8" strokeWidth="0.5" strokeDasharray="1.4 1" />
                    {/* OL 5 O markers */}
                    {[40, 45, 50, 55, 60].map((x, idx) => (
                      <g key={idx}>
                        <circle cx={x} cy="25" r="1.8" fill="#FAF8F3" stroke="#1D4ED8" strokeWidth="0.6" />
                        <text x={x} y="25.6" fill="#1D4ED8" fontSize="1.6" fontWeight="bold" textAnchor="middle">
                          {["LT", "LG", "C", "RG", "RT"][idx]}
                        </text>
                      </g>
                    ))}
                    {/* Front X markers */}
                    {activeFront.defenders.map((d, idx) => (
                      <g key={idx}>
                        <circle cx={d.x} cy={d.y - 14} r="2.1" fill="rgba(250, 248, 243, 0.88)" stroke="rgba(220,38,38,0.55)" strokeWidth="0.25" />
                        <line x1={d.x - 1.0} y1={d.y - 15.0} x2={d.x + 1.0} y2={d.y - 13.0} stroke="#DC2626" strokeWidth="0.65" strokeLinecap="round" />
                        <line x1={d.x + 1.0} y1={d.y - 15.0} x2={d.x - 1.0} y2={d.y - 13.0} stroke="#DC2626" strokeWidth="0.65" strokeLinecap="round" />
                        <text x={d.x} y={d.y - 10.3} fill="#FAF8F3" fontSize="1.8" fontWeight="bold" textAnchor="middle">
                          {d.id}
                        </text>
                      </g>
                    ))}
                  </svg>

                  <p style={{ margin: 0, fontSize: "12.5px", color: t.textSecondary, lineHeight: 1.45 }}>
                    {activeFront.summary}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
