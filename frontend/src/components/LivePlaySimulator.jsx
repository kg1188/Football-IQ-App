/* eslint-disable react/prop-types */
// frontend/src/components/LivePlaySimulator.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { LIVE_NFL_PLAYS } from "../data/livePlaysData";
import IMPORTED_PLAYS from "../data/imported_nfl_plays.json";
import { getCoachTheme } from "../data/coachTheme";

const ALL_SIM_PLAYS = [
  ...LIVE_NFL_PLAYS,
  ...(Array.isArray(IMPORTED_PLAYS) ? IMPORTED_PLAYS : []),
];

const POSITION_GROUPS = ["ALL", "QB", "WR", "RB", "OL", "DL", "LB", "DB"];

const TRAIL_COLORS = {
  WR: "#FACC15",
  RB: "#34D399",
  QB: "#60A5FA",
  OL: "#FB923C",
  DL: "#F87171",
  LB: "#C084FC",
  DB: "#F472B6",
};

const ZOOM_MODES = {
  all22: { label: "All-22", viewBox: "0 0 100 54", dotScale: 0.82 },
  tight: { label: "1.3x Tight", viewBox: "12 6 76 42", dotScale: 0.72 },
  trenches: { label: "2.2x Trenches", viewBox: "27 24 46 21", dotScale: 0.52 },
};

const TELESTRATOR_TOOLS = [
  { id: "pointer", label: "Pointer", color: null },
  { id: "yellow", label: "Yellow Chalk", color: "#FACC15" },
  { id: "red", label: "Red Marker", color: "#EF4444" },
  { id: "white", label: "White Chalk", color: "#FFFFFF" },
];

const STARRED_STORAGE_KEY = "megatrainer_starred_plays";

function getPlayerPositionAtTime(player, t) {
  const frames = player.keyframes;
  if (!frames || frames.length === 0) return { x: 50, y: 35 };
  if (t <= frames[0].t) return { x: frames[0].x, y: frames[0].y };
  if (t >= frames[frames.length - 1].t) {
    const last = frames[frames.length - 1];
    return { x: last.x, y: last.y };
  }
  for (let i = 0; i < frames.length - 1; i++) {
    const a = frames[i];
    const b = frames[i + 1];
    if (t >= a.t && t <= b.t) {
      const ratio = (t - a.t) / (b.t - a.t || 1);
      return {
        x: a.x + (b.x - a.x) * ratio,
        y: a.y + (b.y - a.y) * ratio,
      };
    }
  }
  return { x: frames[0].x, y: frames[0].y };
}

function getCoverageZones(coverageStr) {
  const cov = (coverageStr || "").toLowerCase();

  if (cov.includes("cover 2") || cov.includes("cover-2") || cov.includes("tampa")) {
    return {
      banner: null,
      zones: [
        { label: "DEEP 1/2", x: 25, y: 12, rx: 22, ry: 7.5 },
        { label: "DEEP 1/2", x: 75, y: 12, rx: 22, ry: 7.5 },
        { label: "CLOUD FLAT", x: 10, y: 29, rx: 9, ry: 4.2 },
        { label: "CLOUD FLAT", x: 90, y: 29, rx: 9, ry: 4.2 },
        { label: "HOOK", x: 30, y: 25, rx: 9, ry: 4.2 },
        { label: "TAMPA HOLE", x: 50, y: 24, rx: 10.5, ry: 4.2 },
        { label: "HOOK", x: 70, y: 25, rx: 9, ry: 4.2 },
      ],
    };
  }

  if (cov.includes("cover 3") || cov.includes("cover-3")) {
    return {
      banner: null,
      zones: [
        { label: "DEEP 1/3", x: 17, y: 12, rx: 14, ry: 7.5 },
        { label: "DEEP 1/3", x: 50, y: 11, rx: 16, ry: 7.5 },
        { label: "DEEP 1/3", x: 83, y: 12, rx: 14, ry: 7.5 },
        { label: "CURL / FLAT", x: 12, y: 28, rx: 10.5, ry: 4.2 },
        { label: "CURL / FLAT", x: 88, y: 28, rx: 10.5, ry: 4.2 },
        { label: "HOOK", x: 36, y: 26, rx: 11, ry: 4.2 },
        { label: "HOOK", x: 64, y: 26, rx: 11, ry: 4.2 },
      ],
    };
  }

  if (cov.includes("cover 4") || cov.includes("cover-4") || cov.includes("quarter")) {
    return {
      banner: null,
      zones: [
        { label: "DEEP 1/4", x: 13, y: 12, rx: 11, ry: 7.5 },
        { label: "DEEP 1/4", x: 38, y: 12, rx: 11, ry: 7.5 },
        { label: "DEEP 1/4", x: 62, y: 12, rx: 11, ry: 7.5 },
        { label: "DEEP 1/4", x: 87, y: 12, rx: 11, ry: 7.5 },
        { label: "FLAT", x: 13, y: 28, rx: 10, ry: 4.2 },
        { label: "HOOK", x: 38, y: 26, rx: 10.5, ry: 4.2 },
        { label: "HOOK", x: 62, y: 26, rx: 10.5, ry: 4.2 },
        { label: "FLAT", x: 87, y: 28, rx: 10, ry: 4.2 },
      ],
    };
  }

  if (cov.includes("cover 6") || cov.includes("cover-6")) {
    const cover2Left = cov.includes("left");
    return {
      banner: null,
      zones: cover2Left
        ? [
            { label: "DEEP 1/2", x: 25, y: 12, rx: 21, ry: 7.5 },
            { label: "DEEP 1/4", x: 62, y: 12, rx: 11, ry: 7.5 },
            { label: "DEEP 1/4", x: 87, y: 12, rx: 11, ry: 7.5 },
            { label: "CLOUD FLAT", x: 11, y: 29, rx: 9.5, ry: 4.2 },
            { label: "HOOK", x: 33, y: 25, rx: 9.5, ry: 4.2 },
            { label: "HOOK", x: 63, y: 26, rx: 10, ry: 4.2 },
            { label: "CURL / FLAT", x: 88, y: 28, rx: 10, ry: 4.2 },
          ]
        : [
            { label: "DEEP 1/4", x: 13, y: 12, rx: 11, ry: 7.5 },
            { label: "DEEP 1/4", x: 38, y: 12, rx: 11, ry: 7.5 },
            { label: "DEEP 1/2", x: 75, y: 12, rx: 21, ry: 7.5 },
            { label: "CURL / FLAT", x: 12, y: 28, rx: 10, ry: 4.2 },
            { label: "HOOK", x: 37, y: 26, rx: 10, ry: 4.2 },
            { label: "HOOK", x: 67, y: 25, rx: 9.5, ry: 4.2 },
            { label: "CLOUD FLAT", x: 89, y: 29, rx: 9.5, ry: 4.2 },
          ],
    };
  }

  if (cov.includes("red zone")) {
    return {
      banner: "RED ZONE MATCH — COMPRESSED END ZONE WINDOWS",
      zones: [],
    };
  }

  return {
    banner: "MAN COVERAGE — LOCKED ON RECEIVERS",
    zones: [],
  };
}

function detectPreSnapShellType(play) {
  const pre = (play.preSnapShell || "").toLowerCase();
  if (pre.includes("2-high")) return "2-high";
  if (pre.includes("1-high")) return "1-high";

  const highSafeties = (play.players || []).filter((p) => {
    if (p.side !== "D") return false;
    if (!["FS", "SS", "S", "SAF", "DB"].includes(p.id) && p.posGroup !== "DB") return false;
    const pos = getPlayerPositionAtTime(p, play.snapTime || 1.5);
    return pos.y <= 26.5 && pos.x >= 20 && pos.x <= 80;
  });

  return highSafeties.length >= 2 ? "2-high" : "1-high";
}

function maskPlayTitle(play) {
  if (!play) return "";
  if (/vs\.\s+/i.test(play.title)) {
    return play.title.replace(/vs\.\s+.+$/i, "vs. [HIDDEN SHELL]");
  }
  const baseName = play.formation || play.title.split("(")[0].trim();
  return `${baseName} vs. [HIDDEN SHELL]`;
}

function matchesFilter(play, filterId, starredSet) {
  const cov = (play.postSnapCoverage || "").toLowerCase();
  const form = (play.formation || "").toLowerCase();
  switch (filterId) {
    case "cover2":
      return cov.includes("cover 2") || cov.includes("cover-2") || cov.includes("tampa");
    case "cover3":
      return cov.includes("cover 3") || cov.includes("cover-3");
    case "cover4":
      return cov.includes("cover 4") || cov.includes("cover-4") || cov.includes("quarter");
    case "man":
      return (
        cov.includes("cover 1") ||
        cov.includes("cover-1") ||
        cov.includes("cover 0") ||
        cov.includes("cover-0") ||
        cov.includes("man")
      );
    case "shotgun":
      return form.includes("shotgun") || form.includes("gun");
    case "starred":
      return starredSet.has(play.id);
    case "all":
    default:
      return true;
  }
}

function formatBallOn(yard) {
  if (yard >= 100) return "Opp EZ";
  if (yard === 50) return "50-yd Line";
  if (yard < 50) return `Own ${yard}`;
  return `Opp ${100 - yard}`;
}

function formatDownOrdinal(down) {
  if (down === 1) return "1st";
  if (down === 2) return "2nd";
  if (down === 3) return "3rd";
  return "4th";
}

export default function LivePlaySimulator({ themeName = "light" }) {
  const t = getCoachTheme(themeName);

  // Filter, Search & Starred Call Sheet State
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [starredIds, setStarredIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STARRED_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const starredSet = useMemo(() => new Set(starredIds), [starredIds]);

  const filteredPlays = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ALL_SIM_PLAYS.filter((p) => {
      if (!matchesFilter(p, activeFilter, starredSet)) return false;
      if (!q) return true;
      const hay = `${p.title} ${p.formation || ""} ${p.postSnapCoverage || ""} ${p.personnel || ""} ${p.disguiseNote || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [activeFilter, searchQuery, starredSet]);

  const [selectedPlayId, setSelectedPlayId] = useState(ALL_SIM_PLAYS[0].id);
  const play = useMemo(
    () =>
      filteredPlays.find((p) => p.id === selectedPlayId) ||
      ALL_SIM_PLAYS.find((p) => p.id === selectedPlayId) ||
      ALL_SIM_PLAYS[0],
    [filteredPlays, selectedPlayId]
  );

  // Core Playback State
  const [phase, setPhase] = useState("presnap"); // "presnap" | "live" | "ball_flight" | "result"
  const [currentTime, setCurrentTime] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [speed, setSpeed] = useState(0.85);
  const [zoomMode, setZoomMode] = useState("tight"); // "all22" | "tight" | "trenches"
  const [coachPos, setCoachPos] = useState("ALL");

  // Phase 1 Toggles
  const [showOffRoutes, setShowOffRoutes] = useState(true);
  const [showDefPaths, setShowDefPaths] = useState(false);
  const [showZones, setShowZones] = useState(true);
  const [showAssignmentLabels, setShowAssignmentLabels] = useState(false);
  const [blindMode, setBlindMode] = useState(false);
  const [preSnapGuess, setPreSnapGuess] = useState(null); // "1-high" | "2-high" | null

  // Phase 2 Telestrator State
  const [telestratorTool, setTelestratorTool] = useState("pointer");
  const [strokes, setStrokes] = useState([]); // [{ color, points: [{x, y}] }]
  const [activeStroke, setActiveStroke] = useState(null);

  // Phase 3 Conflict Defender & Drive Challenge State
  const [passInfo, setPassInfo] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [conflictInfo, setConflictInfo] = useState(null);
  const [driveMode, setDriveMode] = useState(false);
  const [driveState, setDriveState] = useState({
    down: 1,
    toGo: 10,
    ballOn: 25,
    status: "active", // "active" | "td" | "turnover" | "downs"
    log: [],
  });

  const svgRef = useRef(null);
  const rafRef = useRef(null);
  const lastFrameRef = useRef(null);

  const activeZoom = ZOOM_MODES[zoomMode] || ZOOM_MODES.all22;
  const s = activeZoom.dotScale;
  const isBlindLocked = blindMode && phase !== "result";
  const truePreSnapType = useMemo(() => detectPreSnapShellType(play), [play]);
  const coverageZones = useMemo(() => getCoverageZones(play.postSnapCoverage), [play.postSnapCoverage]);

  const toggleStar = (playId) => {
    setStarredIds((prev) => {
      const next = prev.includes(playId) ? prev.filter((id) => id !== playId) : [...prev, playId];
      try {
        localStorage.setItem(STARRED_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage quota errors
      }
      return next;
    });
  };

  const resetDrive = () => {
    setDriveState({
      down: 1,
      toGo: 10,
      ballOn: 25,
      status: "active",
      log: [],
    });
  };

  const resetPlay = useCallback(() => {
    setPhase("presnap");
    setCurrentTime(0);
    setIsPaused(true);
    setPassInfo(null);
    setOutcome(null);
    setConflictInfo(null);
    setPreSnapGuess(null);
    lastFrameRef.current = null;
  }, []);

  const handleSelectPlay = useCallback((id) => {
    setSelectedPlayId(id);
    setPhase("presnap");
    setCurrentTime(0);
    setIsPaused(true);
    setPassInfo(null);
    setOutcome(null);
    setConflictInfo(null);
    setPreSnapGuess(null);
    lastFrameRef.current = null;
  }, []);

  const advanceDrivePlay = () => {
    const pool = filteredPlays.length > 0 ? filteredPlays : ALL_SIM_PLAYS;
    const curIdx = pool.findIndex((p) => p.id === play.id);
    const nextPlay = pool[(curIdx + 1) % pool.length];
    handleSelectPlay(nextPlay.id);
  };

  const recordDrivePlay = useCallback(
    (resultType, rawYards, detailTitle) => {
      if (!driveMode) return;
      setDriveState((prev) => {
        if (prev.status !== "active") return prev;

        if (resultType === "INT") {
          return {
            ...prev,
            status: "turnover",
            log: [
              { play: detailTitle, result: "INTERCEPTED", yards: 0, spot: formatBallOn(prev.ballOn) },
              ...prev.log,
            ],
          };
        }

        const gained = resultType === "PBU" ? 0 : resultType === "SACK" ? -7 : Math.max(2, rawYards);
        const nextBallOn = Math.max(1, Math.min(100, prev.ballOn + gained));

        if (nextBallOn >= 100) {
          return {
            down: 1,
            toGo: 10,
            ballOn: 100,
            status: "td",
            log: [
              { play: detailTitle, result: "TOUCHDOWN!", yards: gained, spot: "Opp EZ" },
              ...prev.log,
            ],
          };
        }

        const madeFirstDown = gained >= prev.toGo;
        if (madeFirstDown) {
          const nextToGo = Math.min(10, 100 - nextBallOn);
          return {
            down: 1,
            toGo: nextToGo,
            ballOn: nextBallOn,
            status: "active",
            log: [
              { play: detailTitle, result: "1ST DOWN", yards: gained, spot: formatBallOn(nextBallOn) },
              ...prev.log,
            ],
          };
        }

        if (prev.down >= 4) {
          return {
            down: 4,
            toGo: Math.max(1, prev.toGo - gained),
            ballOn: nextBallOn,
            status: "downs",
            log: [
              { play: detailTitle, result: "TURNOVER ON DOWNS", yards: gained, spot: formatBallOn(nextBallOn) },
              ...prev.log,
            ],
          };
        }

        return {
          down: prev.down + 1,
          toGo: Math.max(1, prev.toGo - gained),
          ballOn: nextBallOn,
          status: "active",
          log: [
            {
              play: detailTitle,
              result: resultType === "SACK" ? "SACK" : resultType === "PBU" ? "INCOMPLETE" : "GAIN",
              yards: gained,
              spot: formatBallOn(nextBallOn),
            },
            ...prev.log,
          ],
        };
      });
    },
    [driveMode]
  );

  const handlePlayToggle = useCallback(() => {
    if (phase === "result") {
      resetPlay();
      return;
    }
    lastFrameRef.current = null;
    setIsPaused((prev) => !prev);
  }, [phase, resetPlay]);

  const triggerSnapNow = () => {
    if (phase === "presnap") {
      setCurrentTime(play.snapTime);
      setPhase("live");
      setIsPaused(false);
      lastFrameRef.current = null;
    }
  };

  const stepFrame = useCallback(
    (deltaSec) => {
      if (!isPaused) return;
      setCurrentTime((prev) => {
        const next = Math.max(0, Math.min(play.maxTime, +(prev + deltaSec).toFixed(2)));
        setPhase(next < play.snapTime ? "presnap" : "live");
        setPassInfo(null);
        setOutcome(null);
        setConflictInfo(null);
        return next;
      });
    },
    [isPaused, play.maxTime, play.snapTime]
  );

  const handleThrowToTarget = useCallback(
    (targetPlayer) => {
      if (phase !== "live") return;

      const qbPlayer = play.players.find((p) => p.id === "QB" || p.posGroup === "QB");
      const qbPos = qbPlayer ? getPlayerPositionAtTime(qbPlayer, currentTime) : { x: 50, y: 40 };
      const flightDuration = 0.55;
      const catchTime = Math.min(play.maxTime, currentTime + flightDuration);
      const catchSpot = getPlayerPositionAtTime(targetPlayer, catchTime);

      setIsPaused(false);
      setPhase("ball_flight");
      setPassInfo({
        targetId: targetPlayer.id,
        routeLabel: targetPlayer.routeLabel,
        readOrder: targetPlayer.readOrder,
        startX: qbPos.x,
        startY: qbPos.y,
        endX: catchSpot.x,
        endY: catchSpot.y,
        catchTime,
        progress: 0,
      });
    },
    [phase, play, currentTime]
  );

  const computeConflictDefender = useCallback(
    (info, sepYds) => {
      const nonDlDefs = play.players.filter((p) => p.side === "D" && p.posGroup !== "DL");
      const pool = nonDlDefs.length > 0 ? nonDlDefs : play.players.filter((p) => p.side === "D");
      if (pool.length === 0) return null;

      let keyDef = pool[0];
      let minDist = Infinity;
      pool.forEach((d) => {
        const dEnd = getPlayerPositionAtTime(d, info.catchTime);
        const dist = Math.hypot(dEnd.x - info.endX, dEnd.y - info.endY);
        if (dist < minDist) {
          minDist = dist;
          keyDef = d;
        }
      });

      const snapPos = getPlayerPositionAtTime(keyDef, play.snapTime);
      const endPos = getPlayerPositionAtTime(keyDef, info.catchTime);
      const dx = endPos.x - snapPos.x;
      const dy = endPos.y - snapPos.y;

      let vertMove = "held mid-level depth";
      if (dy < -2.2) vertMove = `bailed ${Math.abs(dy).toFixed(1)} yds deep`;
      else if (dy > 1.8) vertMove = `triggered ${dy.toFixed(1)} yds downhill toward the LOS`;

      let horizMove = "";
      if (Math.abs(dx) > 2.2) {
        horizMove = ` and widened ${Math.abs(dx).toFixed(1)} yds ${dx > 0 ? "right" : "left"}`;
      }

      const defTitle =
        keyDef.routeLabel && keyDef.routeLabel !== keyDef.id
          ? `${keyDef.id} (${keyDef.routeLabel})`
          : `${keyDef.posGroup} ${keyDef.id}`;

      const windowOutcome =
        sepYds < 2.6
          ? `His hips/leverage closed cleanly to ${sepYds} yds of separation, shutting down ${info.routeLabel}.`
          : sepYds < 4.5
          ? `He closed late to ${sepYds} yds, shrinking the throwing lane to a tight contested window.`
          : `That post-snap leverage shift vacated ${sepYds} yds of open grass for ${info.targetId} (${info.routeLabel}).`;

      return {
        defender: keyDef,
        defTitle,
        snapPos,
        endPos,
        summary: `Key Read: ${defTitle} ${vertMove}${horizMove} post-snap. ${windowOutcome}`,
      };
    },
    [play]
  );

  const resolveThrowOutcome = useCallback(
    (info) => {
      const defenders = play.players.filter((p) => p.side === "D");
      let closestDef = null;
      let minSeparation = Infinity;

      defenders.forEach((d) => {
        const dPos = getPlayerPositionAtTime(d, info.catchTime);
        const dist = Math.hypot(dPos.x - info.endX, dPos.y - info.endY);
        if (dist < minSeparation) {
          minSeparation = dist;
          closestDef = d;
        }
      });

      const yardsGained = Math.round(35 - info.endY);
      const sepYds = +minSeparation.toFixed(1);
      const conflict = computeConflictDefender(info, sepYds);
      setConflictInfo(conflict);

      const cleanTitle = maskPlayTitle(play).replace(" vs. [HIDDEN SHELL]", "");

      if (sepYds < 1.9) {
        setOutcome({
          grade: "INTERCEPTED",
          color: "#DC2626",
          title: `Intercepted! ${closestDef?.id || "Defender"} jumped the route (${sepYds} yds separation)`,
          detail: `${info.routeLabel} was undercut by ${closestDef?.id || "coverage"} (${closestDef?.routeLabel || ""}). Watch the post-snap rotation and work your progression to the open grass.`,
          takeaway: conflict?.summary || "",
        });
        recordDrivePlay("INT", 0, cleanTitle);
      } else if (sepYds < 2.6) {
        setOutcome({
          grade: "PASS BROKEN UP",
          color: "#DC2626",
          title: `Incomplete / PBU! ${closestDef?.id || "Defender"} closed at the catch point (${sepYds} yds)`,
          detail: `${info.routeLabel} was contested tightly by ${closestDef?.id || "coverage"} (${closestDef?.routeLabel || ""}).`,
          takeaway: conflict?.summary || "",
        });
        recordDrivePlay("PBU", 0, cleanTitle);
      } else if (sepYds < 4.5) {
        const gain = Math.max(2, yardsGained);
        setOutcome({
          grade: "CONTESTED CATCH",
          color: "#D97706",
          title: `Tight-Window Completion to ${info.targetId} (+${gain} yds)`,
          detail: `Fit into a ${sepYds}-yard window with ${closestDef?.id || "defender"} closing fast. Good ball placement, though another read had cleaner grass.`,
          takeaway: conflict?.summary || "",
        });
        recordDrivePlay("COMP", gain, cleanTitle);
      } else if (yardsGained >= 15) {
        setOutcome({
          grade: "EXPLOSIVE PLAY",
          color: "#15803D",
          title: `Strike to ${info.targetId} for +${yardsGained} Yards! (${sepYds} yds open)`,
          detail: `Elite read! You recognized the ${play.postSnapCoverage} rotation and hit ${info.routeLabel} in wide-open grass.`,
          takeaway: conflict?.summary || "",
        });
        recordDrivePlay("COMP", yardsGained, cleanTitle);
      } else {
        const gain = Math.max(2, yardsGained);
        setOutcome({
          grade: "COMPLETION",
          color: "#1D4ED8",
          title: `Clean Completion to ${info.targetId} for +${gain} Yards`,
          detail: `${sepYds} yards of separation against ${closestDef?.id || "defender"}. Chains moved cleanly.`,
          takeaway: conflict?.summary || "",
        });
        recordDrivePlay("COMP", gain, cleanTitle);
      }
      setPhase("result");
      setIsPaused(true);
    },
    [play, computeConflictDefender, recordDrivePlay]
  );

  // Animation Loop
  useEffect(() => {
    const tick = (now) => {
      if (!lastFrameRef.current) lastFrameRef.current = now;
      const dt = ((now - lastFrameRef.current) / 1000) * speed;
      lastFrameRef.current = now;

      if (!isPaused) {
        if (phase === "presnap") {
          setCurrentTime((prev) => {
            const next = prev + dt;
            if (next >= play.snapTime) {
              setPhase("live");
              return play.snapTime;
            }
            return next;
          });
        } else if (phase === "live") {
          setCurrentTime((prev) => {
            const next = prev + dt;
            const elapsedPostSnap = next - play.snapTime;
            if (elapsedPostSnap >= play.pocketTime) {
              const qbPlayer = play.players.find((p) => p.id === "QB" || p.posGroup === "QB");
              const qbPos = qbPlayer ? getPlayerPositionAtTime(qbPlayer, next) : { x: 50, y: 42 };
              const rushers = play.players.filter((p) => p.side === "D");
              let closestRusher = rushers[0];
              let minRDist = Infinity;
              rushers.forEach((d) => {
                const pos = getPlayerPositionAtTime(d, next);
                const dist = Math.hypot(pos.x - qbPos.x, pos.y - qbPos.y);
                if (dist < minRDist) {
                  minRDist = dist;
                  closestRusher = d;
                }
              });
              if (closestRusher) {
                const snapPos = getPlayerPositionAtTime(closestRusher, play.snapTime);
                const endPos = getPlayerPositionAtTime(closestRusher, next);
                setConflictInfo({
                  defender: closestRusher,
                  defTitle: `${closestRusher.id} (${closestRusher.posGroup})`,
                  snapPos,
                  endPos,
                  summary: `Pocket collapsed after ${play.pocketTime.toFixed(1)}s — ${closestRusher.id} closed into the pocket while coverage capped your primary reads.`,
                });
              }

              setOutcome({
                grade: "SACKED",
                color: "#DC2626",
                title: `Pocket Collapsed (${play.pocketTime.toFixed(1)}s) — Sacked!`,
                detail:
                  "You held the ball past the protection clock. Click a receiver or press keys 1–4 as soon as they clear linebacker/safety leverage.",
                takeaway: closestRusher
                  ? `${closestRusher.id} closed the pocket after ${play.pocketTime.toFixed(1)}s while underneath zones squeezed the primary break.`
                  : "",
              });
              recordDrivePlay("SACK", -7, maskPlayTitle(play).replace(" vs. [HIDDEN SHELL]", ""));
              setPhase("result");
              setIsPaused(true);
              return next;
            }
            return Math.min(play.maxTime, next);
          });
        } else if (phase === "ball_flight" && passInfo) {
          setCurrentTime((prev) => Math.min(play.maxTime, prev + dt));
          setPassInfo((prev) => {
            if (!prev) return null;
            const nextProg = prev.progress + dt / 0.55;
            if (nextProg >= 1) {
              resolveThrowOutcome(prev);
              return { ...prev, progress: 1 };
            }
            return { ...prev, progress: nextProg };
          });
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, isPaused, speed, play, passInfo, resolveThrowOutcome, recordDrivePlay]);

  // Keyboard Shortcuts: Space, 1-4, ArrowLeft/ArrowRight (when paused), C (clear telestrator ink)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
      if (e.code === "Space") {
        e.preventDefault();
        handlePlayToggle();
      } else if (["Digit1", "Digit2", "Digit3", "Digit4"].includes(e.code) && phase === "live") {
        const num = Number(e.code.replace("Digit", ""));
        const target = play.players.find((p) => p.side === "O" && p.readOrder === num);
        if (target) handleThrowToTarget(target);
      } else if (e.code === "ArrowLeft" && isPaused) {
        e.preventDefault();
        stepFrame(-0.1);
      } else if (e.code === "ArrowRight" && isPaused) {
        e.preventDefault();
        stepFrame(0.1);
      } else if (e.key === "c" || e.key === "C") {
        setStrokes([]);
        setActiveStroke(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, isPaused, play, handlePlayToggle, handleThrowToTarget, stepFrame]);

  // Telestrator SVG coordinate helper (works accurately across all zoom viewBoxes)
  const getSvgPoint = (e) => {
    const svg = svgRef.current;
    if (!svg) return null;
    if (svg.createSVGPoint && svg.getScreenCTM) {
      const ctm = svg.getScreenCTM();
      if (ctm) {
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const loc = pt.matrixTransform(ctm.inverse());
        return { x: +loc.x.toFixed(2), y: +loc.y.toFixed(2) };
      }
    }
    const rect = svg.getBoundingClientRect();
    const parts = activeZoom.viewBox.split(" ").map(Number);
    const [vx, vy, vw, vh] = parts;
    return {
      x: +(vx + ((e.clientX - rect.left) / rect.width) * vw).toFixed(2),
      y: +(vy + ((e.clientY - rect.top) / rect.height) * vh).toFixed(2),
    };
  };

  const handleSvgPointerDown = (e) => {
    if (telestratorTool === "pointer") return;
    const toolObj = TELESTRATOR_TOOLS.find((item) => item.id === telestratorTool);
    if (!toolObj?.color) return;
    const pt = getSvgPoint(e);
    if (!pt) return;
    setActiveStroke({ color: toolObj.color, points: [pt] });
  };

  const handleSvgPointerMove = (e) => {
    if (!activeStroke) return;
    const pt = getSvgPoint(e);
    if (!pt) return;
    setActiveStroke((prev) => (prev ? { ...prev, points: [...prev.points, pt] } : null));
  };

  const finishStroke = () => {
    if (!activeStroke) return;
    if (activeStroke.points.length >= 2) {
      setStrokes((prev) => [...prev, activeStroke]);
    }
    setActiveStroke(null);
  };

  const liveSnapshot = useMemo(() => {
    const positioned = play.players.map((p, idx) => ({
      ...p,
      _uid: `${p.id}-${idx}`,
      ...getPlayerPositionAtTime(p, currentTime),
    }));
    const defs = positioned.filter((p) => p.side === "D");

    return positioned.map((p) => {
      if (p.side !== "O" || !p.readOrder) return p;
      let minDist = Infinity;
      defs.forEach((d) => {
        const dist = Math.hypot(d.x - p.x, d.y - p.y);
        if (dist < minDist) minDist = dist;
      });
      return {
        ...p,
        separation: +minDist.toFixed(1),
        isOpen: minDist >= 5.0,
      };
    });
  }, [play, currentTime]);

  const elapsedPostSnap = Math.max(0, currentTime - play.snapTime);
  const pocketPct = Math.max(0, Math.min(100, 100 - (elapsedPostSnap / play.pocketTime) * 100));

  const ballCoords = useMemo(() => {
    if (passInfo) {
      return {
        x: passInfo.startX + (passInfo.endX - passInfo.startX) * passInfo.progress,
        y: passInfo.startY + (passInfo.endY - passInfo.startY) * passInfo.progress,
      };
    }
    const qb = liveSnapshot.find((p) => p.id === "QB" || p.posGroup === "QB");
    return qb ? { x: qb.x + 1.1 * s, y: qb.y - 0.7 * s } : { x: 50, y: 40 };
  }, [passInfo, liveSnapshot, s]);

  const filterCounts = useMemo(
    () => ({
      all: ALL_SIM_PLAYS.length,
      cover2: ALL_SIM_PLAYS.filter((p) => matchesFilter(p, "cover2", starredSet)).length,
      cover3: ALL_SIM_PLAYS.filter((p) => matchesFilter(p, "cover3", starredSet)).length,
      cover4: ALL_SIM_PLAYS.filter((p) => matchesFilter(p, "cover4", starredSet)).length,
      man: ALL_SIM_PLAYS.filter((p) => matchesFilter(p, "man", starredSet)).length,
      shotgun: ALL_SIM_PLAYS.filter((p) => matchesFilter(p, "shotgun", starredSet)).length,
      starred: starredIds.length,
    }),
    [starredSet, starredIds.length]
  );

  const effectiveShowZones = showZones && !isBlindLocked;
  const isStarred = starredSet.has(play.id);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2.1fr 1fr", gap: "18px", alignItems: "start" }}>
      {/* LEFT COLUMN: PLAYBOOK FILTERING, LIVE 22-PLAYER DRY-ERASE BOARD & CONTROLS */}
      <div
        style={{
          background: t.cardBg,
          border: `1px solid ${t.border}`,
          borderRadius: "12px",
          padding: "14px",
          boxShadow: t.cardShadow,
        }}
      >
        {/* Phase 1 #4: Filter Pills & Search */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {[
              { id: "all", label: `All (${filterCounts.all})` },
              { id: "cover2", label: `Cover 2 (${filterCounts.cover2})` },
              { id: "cover3", label: `Cover 3 (${filterCounts.cover3})` },
              { id: "cover4", label: `Cover 4 (${filterCounts.cover4})` },
              { id: "man", label: `Man / Cover 1 (${filterCounts.man})` },
              { id: "shotgun", label: `Shotgun (${filterCounts.shotgun})` },
              { id: "starred", label: `⭐ Starred (${filterCounts.starred})` },
            ].map((pill) => {
              const active = activeFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setActiveFilter(pill.id)}
                  style={{
                    padding: "4px 9px",
                    borderRadius: "999px",
                    border: active ? `1px solid ${t.accent}` : `1px solid ${t.border}`,
                    background: active ? t.accent : t.cardAlt,
                    color: active ? "#FFFFFF" : t.textSecondary,
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search formation, player..."
            style={{
              padding: "5px 9px",
              borderRadius: "6px",
              border: `1px solid ${t.borderStrong}`,
              background: t.cardAlt,
              color: t.text,
              fontSize: "12px",
              minWidth: "175px",
            }}
          />
        </div>

        {/* Row 1: Play Selector, Star Bookmark, Blind Mode, Drive Mode & Speed */}
        <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", alignItems: "center", marginBottom: "8px" }}>
          <select
            value={play.id}
            onChange={(e) => handleSelectPlay(e.target.value)}
            style={{
              flex: 1,
              minWidth: "210px",
              padding: "8px 10px",
              borderRadius: "6px",
              background: t.cardAlt,
              color: t.text,
              border: `1px solid ${t.borderStrong}`,
              fontWeight: 700,
              fontSize: "13px",
            }}
          >
            {filteredPlays.length === 0 ? (
              <option value={play.id}>
                No matching plays — showing current ({isBlindLocked ? maskPlayTitle(play) : play.title})
              </option>
            ) : (
              filteredPlays.map((p, i) => {
                const maskThis = blindMode && (p.id !== play.id || phase !== "result");
                return (
                  <option key={p.id} value={p.id}>
                    {i + 1}. {maskThis ? maskPlayTitle(p) : p.title}
                  </option>
                );
              })
            )}
          </select>

          <button
            type="button"
            title={isStarred ? "Remove from Starred Call Sheet" : "Bookmark Play to Call Sheet"}
            onClick={() => toggleStar(play.id)}
            style={{
              padding: "7px 10px",
              borderRadius: "6px",
              border: `1px solid ${isStarred ? t.goldBorder : t.borderStrong}`,
              background: isStarred ? t.goldBg : t.cardAlt,
              color: isStarred ? t.gold : t.muted,
              fontWeight: 800,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            {isStarred ? "★" : "☆"}
          </button>

          <button
            type="button"
            onClick={() => {
              setBlindMode((prev) => !prev);
              setPreSnapGuess(null);
            }}
            style={{
              padding: "7px 10px",
              borderRadius: "6px",
              border: `1px solid ${blindMode ? t.goldBorder : t.borderStrong}`,
              background: blindMode ? t.goldBg : t.cardAlt,
              color: blindMode ? t.gold : t.text,
              fontWeight: 800,
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            {blindMode ? "🙈 Blind Mode: ON" : "👁️ Blind Mode"}
          </button>

          <button
            type="button"
            onClick={() => setDriveMode((prev) => !prev)}
            style={{
              padding: "7px 10px",
              borderRadius: "6px",
              border: `1px solid ${driveMode ? t.green : t.borderStrong}`,
              background: driveMode ? t.greenBg : t.cardAlt,
              color: driveMode ? t.green : t.text,
              fontWeight: 800,
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            {driveMode ? "🏈 Drive Mode: ON" : "🏈 Drive Challenge"}
          </button>

          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{
              padding: "7px 8px",
              borderRadius: "6px",
              background: t.cardAlt,
              color: t.accent,
              border: `1px solid ${t.borderStrong}`,
              fontWeight: 700,
              fontSize: "12px",
            }}
          >
            <option value={0.5}>0.5x Film</option>
            <option value={0.85}>0.85x Sim</option>
            <option value={1.0}>1.0x Live</option>
          </select>
        </div>

        {/* Phase 3 #3: 4-Down Situational Drive Challenge Scoreboard */}
        {driveMode && (
          <div
            style={{
              background: t.insetBg,
              border: `1px solid ${t.borderStrong}`,
              borderRadius: "8px",
              padding: "8px 12px",
              marginBottom: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span
                className="font-coach"
                style={{
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background:
                    driveState.status === "td"
                      ? "#15803D"
                      : driveState.status === "turnover" || driveState.status === "downs"
                      ? "#DC2626"
                      : t.accent,
                  color: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: 800,
                }}
              >
                {driveState.status === "td"
                  ? "TOUCHDOWN!"
                  : driveState.status === "turnover"
                  ? "TURNOVER (INT)"
                  : driveState.status === "downs"
                  ? "TURNOVER ON DOWNS"
                  : `${formatDownOrdinal(driveState.down)} & ${
                      driveState.ballOn + driveState.toGo >= 100 ? "Goal" : driveState.toGo
                    }`}
              </span>

              <span className="font-mono-coach" style={{ fontSize: "12px", fontWeight: 700 }}>
                Ball on {formatBallOn(driveState.ballOn)}
              </span>

              <div style={{ width: "110px", height: "8px", background: t.border, borderRadius: "4px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${driveState.ballOn}%`,
                    height: "100%",
                    background: driveState.status === "td" ? "#16A34A" : t.accent,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              {driveState.status === "active" && phase === "result" && (
                <button
                  type="button"
                  onClick={advanceDrivePlay}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "5px",
                    border: "none",
                    background: "#15803D",
                    color: "#FFFFFF",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Next Play in Drive →
                </button>
              )}
              <button
                type="button"
                onClick={resetDrive}
                style={{
                  padding: "4px 9px",
                  borderRadius: "5px",
                  border: `1px solid ${t.borderStrong}`,
                  background: t.cardBg,
                  color: t.text,
                  fontSize: "11.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Reset Drive
              </button>
            </div>
          </div>
        )}

        {/* Row 2: Zoom + Interactive Telestrator Bar + Visibility Checkboxes */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "8px",
            background: t.insetBg,
            border: `1px solid ${t.border}`,
            padding: "7px 10px",
            borderRadius: "8px",
          }}
        >
          {/* Zoom Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "11px", color: t.muted, fontWeight: 700, marginRight: "2px" }}>ZOOM:</span>
            {Object.entries(ZOOM_MODES).map(([key, cfg]) => {
              const active = zoomMode === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setZoomMode(key)}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "4px",
                    border: active ? `1px solid ${t.accent}` : `1px solid ${t.borderStrong}`,
                    background: active ? t.accent : t.cardBg,
                    color: active ? "#FFFFFF" : t.text,
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Phase 2 #3: Sideline Telestrator Marker Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", color: t.muted, fontWeight: 700 }}>TELESTRATOR:</span>
            {TELESTRATOR_TOOLS.map((tool) => {
              const active = telestratorTool === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setTelestratorTool(tool.id)}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "4px",
                    border: active ? `1.5px solid ${t.text}` : `1px solid ${t.borderStrong}`,
                    background: active ? t.cardBg : t.cardAlt,
                    color: t.text,
                    fontSize: "11px",
                    fontWeight: active ? 800 : 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {tool.color && (
                    <span
                      style={{
                        width: "9px",
                        height: "9px",
                        borderRadius: "50%",
                        background: tool.color,
                        border: "1px solid rgba(0,0,0,0.45)",
                        display: "inline-block",
                      }}
                    />
                  )}
                  {tool.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setStrokes([]);
                setActiveStroke(null);
              }}
              style={{
                padding: "3px 8px",
                borderRadius: "4px",
                border: `1px solid ${t.borderStrong}`,
                background: t.redBg,
                color: t.red,
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Clear Ink (C)
            </button>
          </div>

          {/* Independent Trail, Zone & Name Checkboxes */}
          <div style={{ display: "flex", alignItems: "center", gap: "9px", flexWrap: "wrap" }}>
            <label style={{ fontSize: "11.5px", color: t.text, fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
              <input type="checkbox" checked={showOffRoutes} onChange={(e) => setShowOffRoutes(e.target.checked)} />
              Off Routes
            </label>
            <label style={{ fontSize: "11.5px", color: t.text, fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
              <input type="checkbox" checked={showDefPaths} onChange={(e) => setShowDefPaths(e.target.checked)} />
              Def Paths
            </label>
            <label style={{ fontSize: "11.5px", color: t.text, fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
              <input type="checkbox" checked={showZones} onChange={(e) => setShowZones(e.target.checked)} />
              Zones
            </label>
            <label style={{ fontSize: "11.5px", color: t.text, fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={showAssignmentLabels}
                onChange={(e) => setShowAssignmentLabels(e.target.checked)}
              />
              Names
            </label>
          </div>
        </div>

        {/* Status Bar: Pre-Snap Shell vs Post-Snap Disguise + Pocket Timer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: t.insetBg,
            border: `1px solid ${t.border}`,
            padding: "7px 12px",
            borderRadius: "8px",
            marginBottom: "8px",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <span
              className="font-coach"
              style={{
                fontSize: "12px",
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: "4px",
                background: phase === "presnap" ? t.accent : "#DC2626",
                color: "#FFFFFF",
                marginRight: "8px",
              }}
            >
              {phase === "presnap"
                ? isPaused
                  ? "READY (PRE-SNAP)"
                  : "PRE-SNAP MOTION"
                : "POST-SNAP ROTATION"}
            </span>
            <strong style={{ fontSize: "13px", color: isBlindLocked ? t.gold : phase === "presnap" ? t.accent : t.red }}>
              {isBlindLocked
                ? phase === "presnap"
                  ? "PRE-SNAP: READ THE SAFETIES!"
                  : "POST-SNAP: READ THE SAFETIES!"
                : phase === "presnap"
                ? play.preSnapShell
                : play.postSnapCoverage}
            </strong>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "160px" }}>
            <span style={{ fontSize: "11px", color: t.muted, fontWeight: 700 }}>POCKET:</span>
            <div style={{ flex: 1, height: "8px", background: t.border, borderRadius: "4px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${pocketPct}%`,
                  height: "100%",
                  background: pocketPct > 45 ? "#16A34A" : pocketPct > 20 ? "#D97706" : "#DC2626",
                  transition: "width 0.05s linear",
                }}
              />
            </div>
          </div>
        </div>

        {/* Phase 1 #3: Blind Mode Pre-Snap Quick-Guess Bar */}
        {blindMode && (
          <div
            style={{
              background: t.goldBg,
              border: `1px solid ${t.goldBorder}`,
              borderRadius: "8px",
              padding: "7px 12px",
              marginBottom: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {phase === "presnap" ? (
              <>
                <span style={{ fontSize: "12.5px", fontWeight: 700, color: t.text }}>
                  Pre-Snap Shell Quiz: Identify safety alignment before the snap:
                </span>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[
                    { id: "1-high", label: "1-High (MOFC)" },
                    { id: "2-high", label: "2-High (MOFO)" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPreSnapGuess(opt.id)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "5px",
                        border: preSnapGuess === opt.id ? `2px solid ${t.accent}` : `1px solid ${t.borderStrong}`,
                        background: preSnapGuess === opt.id ? t.accent : t.cardBg,
                        color: preSnapGuess === opt.id ? "#FFFFFF" : t.text,
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            ) : preSnapGuess ? (
              <span
                style={{
                  fontSize: "12.5px",
                  fontWeight: 700,
                  color: preSnapGuess === truePreSnapType ? t.green : t.red,
                }}
              >
                {preSnapGuess === truePreSnapType
                  ? `✓ Spot-On Pre-Snap Read! Alignment was ${truePreSnapType === "2-high" ? "2-High (MOFO)" : "1-High (MOFC)"} — track any post-snap rotation!`
                  : `✗ Pre-Snap alignment was actually ${truePreSnapType === "2-high" ? "2-High (MOFO)" : "1-High (MOFC)"}. Watch how the safeties move post-snap.`}
              </span>
            ) : (
              <span style={{ fontSize: "12px", fontWeight: 600, color: t.textSecondary }}>
                Blind Mode Active — complete your throw to reveal coverage shell &amp; zones.
              </span>
            )}
          </div>
        )}

        {/* 22-PLAYER INTERACTIVE DRY-ERASE PLAYBOOK FIELD */}
        <div
          style={{
            borderRadius: "10px",
            border: `6px solid ${t.turfFrame}`,
            boxShadow: t.shadow,
            overflow: "hidden",
            background: t.turf,
          }}
        >
          <svg
            ref={svgRef}
            viewBox={activeZoom.viewBox}
            onPointerDown={handleSvgPointerDown}
            onPointerMove={handleSvgPointerMove}
            onPointerUp={finishStroke}
            onPointerLeave={finishStroke}
            style={{
              width: "100%",
              display: "block",
              background: t.turf,
              cursor: telestratorTool !== "pointer" ? "crosshair" : "default",
              touchAction: telestratorTool !== "pointer" ? "none" : "auto",
            }}
          >
            {/* Chalk Yard Lines, Hashes & Subtle Yard Numbers */}
            {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((y) => {
              const distFromLos = 35 - y;
              const isTen = distFromLos % 10 === 0 && distFromLos > 0;
              return (
                <g key={y}>
                  <line
                    x1="0"
                    y1={y}
                    x2="100"
                    y2={y}
                    stroke={y % 10 === 5 ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.12)"}
                    strokeWidth={0.28 * s}
                  />
                  <line x1="40" y1={y - 0.35} x2="40" y2={y + 0.35} stroke="rgba(255,255,255,0.4)" strokeWidth={0.25 * s} />
                  <line x1="60" y1={y - 0.35} x2="60" y2={y + 0.35} stroke="rgba(255,255,255,0.4)" strokeWidth={0.25 * s} />
                  {isTen && (
                    <>
                      <text
                        x="6"
                        y={y - 0.7}
                        fill="rgba(255,255,255,0.28)"
                        fontSize={2.4 * s}
                        fontWeight="800"
                        style={{ pointerEvents: "none" }}
                      >
                        {distFromLos}
                      </text>
                      <text
                        x="94"
                        y={y - 0.7}
                        fill="rgba(255,255,255,0.28)"
                        fontSize={2.4 * s}
                        fontWeight="800"
                        textAnchor="end"
                        style={{ pointerEvents: "none" }}
                      >
                        {distFromLos}
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* Line of Scrimmage */}
            <line x1="0" y1="35" x2="100" y2="35" stroke="#93C5FD" strokeWidth={0.55 * s} strokeDasharray="1.4 0.9" />

            {/* Phase 1 #2: Coverage Zone Landmarks Overlay */}
            {effectiveShowZones && (
              <g style={{ pointerEvents: "none" }}>
                {coverageZones.banner && (
                  <g>
                    <rect
                      x="18"
                      y="7.4"
                      width="64"
                      height="4.4"
                      rx="1.2"
                      fill="rgba(56, 189, 248, 0.10)"
                      stroke="rgba(56, 189, 248, 0.35)"
                      strokeWidth={0.35 * s}
                      strokeDasharray="1.2 0.8"
                    />
                    <text
                      x="50"
                      y="10.2"
                      fill="rgba(224, 242, 254, 0.88)"
                      fontSize={1.7 * s}
                      fontWeight="800"
                      textAnchor="middle"
                    >
                      {coverageZones.banner}
                    </text>
                  </g>
                )}

                {coverageZones.zones.map((z, idx) => (
                  <g key={`zone-${idx}`}>
                    <ellipse
                      cx={z.x}
                      cy={z.y}
                      rx={z.rx}
                      ry={z.ry}
                      fill="rgba(56, 189, 248, 0.10)"
                      stroke="rgba(56, 189, 248, 0.35)"
                      strokeWidth={0.4 * s}
                      strokeDasharray="1.2 0.8"
                    />
                    <text
                      x={z.x}
                      y={z.y + 0.55 * s}
                      fill="rgba(224, 242, 254, 0.85)"
                      fontSize={1.45 * s}
                      fontWeight="800"
                      textAnchor="middle"
                    >
                      {z.label}
                    </text>
                  </g>
                ))}
              </g>
            )}

            {/* Phase 1 #1: Independent Offensive Routes vs Defensive Paths */}
            {play.players.map((p, idx) => {
              const showThis = p.side === "O" ? showOffRoutes : showDefPaths;
              if (!showThis) return null;

              const isHighlighted = coachPos === "ALL" || p.posGroup === coachPos;
              const trailColor = TRAIL_COLORS[p.posGroup] || "#E2E8F0";
              const baseOpacity = isHighlighted ? 0.88 : 0.16;

              const preSnapPts = p.keyframes.filter((k) => k.t <= play.snapTime + 0.08);
              const postSnapPts = p.keyframes.filter((k) => k.t >= play.snapTime - 0.08);

              return (
                <g key={`trail-${p.id}-${idx}`} opacity={baseOpacity} style={{ pointerEvents: "none" }}>
                  {preSnapPts.length > 1 && (
                    <polyline
                      points={preSnapPts.map((k) => `${k.x},${k.y}`).join(" ")}
                      fill="none"
                      stroke={trailColor}
                      strokeWidth={0.55 * s}
                      strokeDasharray={`${0.35 * s} ${0.85 * s}`}
                      strokeLinecap="round"
                    />
                  )}
                  {postSnapPts.length > 1 && (
                    <polyline
                      points={postSnapPts.map((k) => `${k.x},${k.y}`).join(" ")}
                      fill="none"
                      stroke={trailColor}
                      strokeWidth={(p.readOrder ? 0.65 : 0.5) * s}
                      strokeDasharray={p.side === "D" ? `${1.1 * s} ${0.7 * s}` : ""}
                      strokeLinecap="round"
                    />
                  )}
                </g>
              );
            })}

            {/* Phase 3 #2: Conflict Defender Trajectory & Pulsing Ring */}
            {phase === "result" && conflictInfo && (
              <g style={{ pointerEvents: "none" }}>
                <line
                  x1={conflictInfo.snapPos.x}
                  y1={conflictInfo.snapPos.y}
                  x2={conflictInfo.endPos.x}
                  y2={conflictInfo.endPos.y}
                  stroke="#FACC15"
                  strokeWidth={0.6 * s}
                  strokeDasharray="1 0.6"
                />
                {(() => {
                  const currDef = getPlayerPositionAtTime(conflictInfo.defender, currentTime);
                  return (
                    <g>
                      <circle
                        cx={currDef.x}
                        cy={currDef.y}
                        r={3.8 * s}
                        fill="rgba(250, 204, 21, 0.14)"
                        stroke="#FACC15"
                        strokeWidth={0.55 * s}
                      >
                        <animate attributeName="r" values={`${3.0 * s};${5.2 * s};${3.0 * s}`} dur="1.2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1;0.35;1" dur="1.2s" repeatCount="indefinite" />
                      </circle>
                      <text
                        x={currDef.x}
                        y={currDef.y - 3.9 * s}
                        fill="#FEF08A"
                        fontSize={1.45 * s}
                        fontWeight="900"
                        textAnchor="middle"
                      >
                        KEY READ
                      </text>
                    </g>
                  );
                })()}
              </g>
            )}

            {/* Phase 2 #2: 22 Players rendered as Classic Royal-Ink O (Offense) & Crimson X (Defense) */}
            {liveSnapshot.map((p) => {
              const isOffense = p.side === "O";
              const isEligibleTarget = isOffense && p.readOrder && phase === "live" && telestratorTool === "pointer";
              const isCoachFocus = coachPos === "ALL" || p.posGroup === coachPos;
              const r = (p.readOrder ? 2.05 : 1.75) * s;

              return (
                <g
                  key={p._uid}
                  opacity={isCoachFocus ? 1 : 0.24}
                  onClick={() => isEligibleTarget && handleThrowToTarget(p)}
                  style={{ cursor: isEligibleTarget ? "pointer" : "default" }}
                >
                  {isEligibleTarget && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={3.5 * s}
                      fill={p.isOpen ? "rgba(74, 222, 128, 0.25)" : "rgba(248, 113, 113, 0.16)"}
                      stroke={p.isOpen ? "#4ADE80" : "#F87171"}
                      strokeWidth={0.45 * s}
                      strokeDasharray="1 0.6"
                    />
                  )}

                  {isOffense ? (
                    <>
                      {/* Royal-Ink O Marker */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={r}
                        fill="#FAF8F3"
                        stroke={isCoachFocus && coachPos !== "ALL" ? "#FACC15" : "#1D4ED8"}
                        strokeWidth={(isCoachFocus && coachPos !== "ALL" ? 0.85 : 0.68) * s}
                      />
                      <text
                        x={p.x}
                        y={p.y + 0.52 * s}
                        fill="#1E3A8A"
                        fontSize={1.42 * s}
                        textAnchor="middle"
                        fontWeight="900"
                        style={{ pointerEvents: "none" }}
                      >
                        {p.id}
                      </text>
                    </>
                  ) : (
                    <>
                      {/* Subtle Halo + Bold Crimson X Symbol */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={r * 1.15}
                        fill="rgba(250, 248, 243, 0.88)"
                        stroke={isCoachFocus && coachPos !== "ALL" ? "#FACC15" : "rgba(220, 38, 38, 0.5)"}
                        strokeWidth={0.28 * s}
                      />
                      <line
                        x1={p.x - 1.05 * s}
                        y1={p.y - 1.05 * s}
                        x2={p.x + 1.05 * s}
                        y2={p.y + 1.05 * s}
                        stroke="#DC2626"
                        strokeWidth={0.62 * s}
                        strokeLinecap="round"
                        style={{ pointerEvents: "none" }}
                      />
                      <line
                        x1={p.x + 1.05 * s}
                        y1={p.y - 1.05 * s}
                        x2={p.x - 1.05 * s}
                        y2={p.y + 1.05 * s}
                        stroke="#DC2626"
                        strokeWidth={0.62 * s}
                        strokeLinecap="round"
                        style={{ pointerEvents: "none" }}
                      />
                      <text
                        x={p.x}
                        y={p.y + 3.15 * s}
                        fill="#FAF8F3"
                        fontSize={1.22 * s}
                        textAnchor="middle"
                        fontWeight="800"
                        style={{ pointerEvents: "none" }}
                      >
                        {p.id}
                      </text>
                    </>
                  )}

                  {isOffense && p.readOrder && (
                    <g style={{ pointerEvents: "none" }}>
                      <circle cx={p.x + 2.0 * s} cy={p.y - 1.8 * s} r={1.15 * s} fill="#FACC15" />
                      <text
                        x={p.x + 2.0 * s}
                        y={p.y - 1.35 * s}
                        fill="#1C1917"
                        fontSize={1.35 * s}
                        textAnchor="middle"
                        fontWeight="900"
                      >
                        {p.readOrder}
                      </text>
                    </g>
                  )}

                  {showAssignmentLabels && isCoachFocus && (
                    <text
                      x={p.x}
                      y={p.y + (isOffense ? 3.2 : 4.5) * s}
                      fill="#FEF08A"
                      fontSize={1.25 * s}
                      textAnchor="middle"
                      fontWeight="700"
                      style={{ pointerEvents: "none" }}
                    >
                      {p.routeLabel}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Football */}
            <ellipse
              cx={ballCoords.x}
              cy={ballCoords.y}
              rx={1.1 * s}
              ry={0.68 * s}
              fill="#92400E"
              stroke="#FEF3C7"
              strokeWidth={0.28 * s}
              style={{ pointerEvents: "none" }}
            />

            {/* Phase 2 #3: Telestrator Freehand Chalk/Marker Strokes */}
            {strokes.map((st, idx) => (
              <polyline
                key={`stroke-${idx}`}
                points={st.points.map((pt) => `${pt.x},${pt.y}`).join(" ")}
                fill="none"
                stroke={st.color}
                strokeWidth={0.75 * s}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ pointerEvents: "none" }}
              />
            ))}
            {activeStroke && (
              <polyline
                points={activeStroke.points.map((pt) => `${pt.x},${pt.y}`).join(" ")}
                fill="none"
                stroke={activeStroke.color}
                strokeWidth={0.75 * s}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ pointerEvents: "none" }}
              />
            )}
          </svg>
        </div>

        {/* Playback Transport + Phase 1 #5 Frame-by-Frame Stepping */}
        <div style={{ display: "flex", gap: "7px", alignItems: "center", marginTop: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handlePlayToggle}
            className="font-coach"
            style={{
              padding: "7px 16px",
              borderRadius: "6px",
              border: "none",
              background: phase === "result" ? t.accent : isPaused ? "#16A34A" : "#D97706",
              color: "#FFFFFF",
              fontWeight: 800,
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            {phase === "result"
              ? "↺ Replay Play (Space)"
              : isPaused
              ? "▶ Play (Space)"
              : "❚❚ Pause (Space)"}
          </button>

          {phase === "presnap" && (
            <button
              type="button"
              onClick={triggerSnapNow}
              style={{
                padding: "7px 12px",
                borderRadius: "6px",
                border: `1px solid ${t.accent}`,
                background: t.accentSoftBg,
                color: t.accentSoftText,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              🏈 Snap Now
            </button>
          )}

          <button
            type="button"
            disabled={!isPaused}
            title="Step Back 0.10s (ArrowLeft while paused)"
            onClick={() => stepFrame(-0.1)}
            style={{
              padding: "7px 9px",
              borderRadius: "6px",
              border: `1px solid ${t.borderStrong}`,
              background: t.cardAlt,
              color: isPaused ? t.text : t.muted,
              fontSize: "12px",
              fontWeight: 700,
              cursor: isPaused ? "pointer" : "not-allowed",
            }}
          >
            ◄ -0.1s
          </button>
          <button
            type="button"
            disabled={!isPaused}
            title="Step Forward 0.10s (ArrowRight while paused)"
            onClick={() => stepFrame(0.1)}
            style={{
              padding: "7px 9px",
              borderRadius: "6px",
              border: `1px solid ${t.borderStrong}`,
              background: t.cardAlt,
              color: isPaused ? t.text : t.muted,
              fontSize: "12px",
              fontWeight: 700,
              cursor: isPaused ? "pointer" : "not-allowed",
            }}
          >
            +0.1s ►
          </button>

          <button
            type="button"
            onClick={resetPlay}
            style={{
              padding: "7px 10px",
              borderRadius: "6px",
              border: `1px solid ${t.borderStrong}`,
              background: t.cardAlt,
              color: t.text,
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reset
          </button>

          <input
            type="range"
            min={0}
            max={play.maxTime}
            step={0.05}
            value={currentTime}
            onChange={(e) => {
              const val = Number(e.target.value);
              setIsPaused(true);
              setCurrentTime(val);
              setPhase(val < play.snapTime ? "presnap" : "live");
              setPassInfo(null);
              setOutcome(null);
              setConflictInfo(null);
            }}
            style={{ flex: 1, minWidth: "110px" }}
          />
          <span className="font-mono-coach" style={{ fontSize: "12px", color: t.muted, fontWeight: 700 }}>
            {currentTime.toFixed(2)}s
          </span>
        </div>

        {/* Quick Throw Buttons for QB Progression */}
        <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
          {liveSnapshot
            .filter((p) => p.side === "O" && p.readOrder)
            .sort((a, b) => a.readOrder - b.readOrder)
            .map((target) => (
              <button
                key={target._uid}
                type="button"
                disabled={phase !== "live"}
                onClick={() => handleThrowToTarget(target)}
                style={{
                  flex: 1,
                  minWidth: "130px",
                  padding: "7px 10px",
                  borderRadius: "6px",
                  border:
                    target.isOpen && phase === "live"
                      ? `2px solid ${t.green}`
                      : `1px solid ${t.borderStrong}`,
                  background: phase === "live" ? t.cardAlt : t.insetBg,
                  color: phase === "live" ? t.text : t.muted,
                  cursor: phase === "live" ? "pointer" : "not-allowed",
                  textAlign: "left",
                  fontSize: "12px",
                }}
              >
                <strong style={{ color: t.gold }}>
                  [{target.readOrder}] {target.id}:
                </strong>{" "}
                {target.routeLabel.replace(/ \[\d\]/, "")}
              </button>
            ))}
        </div>
      </div>

      {/* RIGHT COLUMN: THROW GRADE + CONFLICT DEFENDER TAKEAWAY, DISGUISE INTEL, DRIVE LOG & COACH ROOM */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {outcome && (
          <div
            style={{
              background: t.cardBg,
              border: `2px solid ${outcome.color}`,
              borderRadius: "12px",
              padding: "14px",
              boxShadow: t.cardShadow,
            }}
          >
            <span
              className="font-coach"
              style={{
                background: outcome.color,
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: "4px",
              }}
            >
              {outcome.grade}
            </span>
            <h4 className="font-coach" style={{ margin: "8px 0 6px 0", fontSize: "18px", fontWeight: 800 }}>
              {outcome.title}
            </h4>
            <p style={{ margin: 0, fontSize: "13px", color: t.textSecondary, lineHeight: 1.45 }}>
              {outcome.detail}
            </p>

            {/* Phase 3 #2: Conflict Defender Film Room Takeaway */}
            {outcome.takeaway && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "9px 11px",
                  borderRadius: "8px",
                  background: t.goldBg,
                  border: `1px solid ${t.goldBorder}`,
                  fontSize: "12.5px",
                  color: t.text,
                  lineHeight: 1.45,
                }}
              >
                <div style={{ fontWeight: 800, color: t.gold, fontSize: "11px", marginBottom: "2px" }}>
                  FILM ROOM TAKEAWAY (WHY DID IT WORK?)
                </div>
                {outcome.takeaway}
              </div>
            )}
          </div>
        )}

        {/* Concept & Disguise Breakdown (Masked in Blind Mode until play resolves) */}
        <div
          style={{
            background: t.cardBg,
            border: `1px solid ${t.border}`,
            borderRadius: "12px",
            padding: "14px",
            boxShadow: t.cardShadow,
          }}
        >
          <div className="font-coach" style={{ fontSize: "14px", fontWeight: 800, color: t.accent, marginBottom: "4px" }}>
            CONCEPT &amp; DISGUISE BREAKDOWN
          </div>
          <div style={{ fontSize: "12px", color: t.muted, marginBottom: "8px" }}>
            {play.personnel} • {play.formation}
          </div>

          <p style={{ margin: "0 0 8px 0", fontSize: "12.5px", color: t.textSecondary, lineHeight: 1.45 }}>
            <strong>Motion Tell:</strong> {play.motionNote}
          </p>

          {isBlindLocked ? (
            <div
              style={{
                padding: "10px",
                borderRadius: "6px",
                background: t.insetBg,
                border: `1px dashed ${t.goldBorder}`,
                fontSize: "12px",
                color: t.gold,
                fontWeight: 700,
              }}
            >
              🔒 Shell Disguise hidden in Blind Mode — complete the play to reveal coverage answer.
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: "12.5px", color: t.red, lineHeight: 1.45, fontWeight: 600 }}>
              <strong>Shell Disguise ({play.postSnapCoverage}):</strong> {play.disguiseNote}
            </p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "6px",
              marginTop: "10px",
              textAlign: "center",
            }}
          >
            <div style={{ background: t.insetBg, border: `1px solid ${t.border}`, padding: "6px", borderRadius: "6px" }}>
              <div style={{ fontSize: "10px", color: t.muted, fontWeight: 700 }}>NFL EPA</div>
              <div className="font-mono-coach" style={{ fontWeight: 800, color: t.green, fontSize: "13px" }}>
                {play.nflBenchmark.epa}
              </div>
            </div>
            <div style={{ background: t.insetBg, border: `1px solid ${t.border}`, padding: "6px", borderRadius: "6px" }}>
              <div style={{ fontSize: "10px", color: t.muted, fontWeight: 700 }}>SUCCESS</div>
              <div className="font-mono-coach" style={{ fontWeight: 800, color: t.text, fontSize: "13px" }}>
                {play.nflBenchmark.successRate}
              </div>
            </div>
            <div style={{ background: t.insetBg, border: `1px solid ${t.border}`, padding: "6px", borderRadius: "6px" }}>
              <div style={{ fontSize: "10px", color: t.muted, fontWeight: 700 }}>AIR YDS</div>
              <div className="font-mono-coach" style={{ fontWeight: 800, color: t.accent, fontSize: "13px" }}>
                {play.nflBenchmark.avgAirYards}
              </div>
            </div>
          </div>
        </div>

        {/* Position Coach Film Room (Blurred/Locked in Blind Mode until resolved) */}
        <div
          style={{
            background: t.cardBg,
            border: `1px solid ${t.border}`,
            borderRadius: "12px",
            padding: "14px",
            boxShadow: t.cardShadow,
          }}
        >
          <div className="font-coach" style={{ fontSize: "14px", fontWeight: 800, color: t.green, marginBottom: "8px" }}>
            POSITION COACH FILM ROOM (HIGHLIGHTS GROUP)
          </div>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "10px" }}>
            {POSITION_GROUPS.map((pos) => {
              const active = coachPos === pos;
              return (
                <button
                  key={pos}
                  type="button"
                  onClick={() => {
                    setCoachPos(pos);
                    if (pos === "OL" || pos === "DL") setZoomMode("trenches");
                  }}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: `1px solid ${active ? t.green : t.borderStrong}`,
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    background: active ? t.green : t.cardAlt,
                    color: active ? "#FFFFFF" : t.text,
                  }}
                >
                  {pos}
                </button>
              );
            })}
          </div>

          {isBlindLocked && coachPos !== "ALL" ? (
            <div
              style={{
                padding: "10px",
                borderRadius: "6px",
                background: t.insetBg,
                border: `1px dashed ${t.goldBorder}`,
                fontSize: "12px",
                color: t.gold,
                fontWeight: 700,
              }}
            >
              🔒 Position Coach Notes hidden in Blind Mode until play finishes.
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: "13px", color: t.textSecondary, lineHeight: 1.5 }}>
              {coachPos === "ALL"
                ? "All 22 players highlighted (Offense = Royal O, Defense = Crimson X). Select any position button above (QB, WR, RB, OL, DL, LB, DB) to isolate that room's assignment."
                : play.coachNotes[coachPos]}
            </p>
          )}
        </div>

        {/* Drive Play Log when Drive Challenge Mode is active */}
        {driveMode && driveState.log.length > 0 && (
          <div
            style={{
              background: t.cardBg,
              border: `1px solid ${t.border}`,
              borderRadius: "12px",
              padding: "12px 14px",
              boxShadow: t.cardShadow,
            }}
          >
            <div className="font-coach" style={{ fontSize: "14px", fontWeight: 800, color: t.gold, marginBottom: "6px" }}>
              DRIVE PLAY-BY-PLAY LOG
            </div>
            <div style={{ display: "grid", gap: "5px", maxHeight: "160px", overflowY: "auto" }}>
              {driveState.log.map((entry, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    padding: "5px 8px",
                    borderRadius: "5px",
                    background: t.insetBg,
                    border: `1px solid ${t.border}`,
                  }}
                >
                  <span style={{ fontWeight: 700, color: t.text }}>{entry.result}</span>
                  <span className="font-mono-coach" style={{ color: t.muted }}>
                    {entry.yards >= 0 ? `+${entry.yards}` : entry.yards} yds • {entry.spot}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
