// frontend/src/data/shadowBoxEngine.js
import nflStats from "./nfl_stats_engine.json";
import { SCHEME_BASICS } from "./playbookData";

// Maps your UI scheme IDs to the exact NFL coverage labels in nfl_stats_engine.json
const COVERAGE_MAP = {
  "cover-1": "COVER_1",
  "cover-2": "COVER_2",
  "cover-3": "COVER_3",
  "cover-4": "COVER_4",
};

// Look up real NFL EPA & Success Rate from your 92,087-play dataset
export function getNflMatchupStats(schemeId, boxCount, attackZone, playAction = false) {
  const nflCov = COVERAGE_MAP[schemeId] || "COVER_3";
  const boxBucket = boxCount >= 7 ? "HEAVY_7+" : "LIGHT_6-";

  const exact = nflStats.find(
    (row) =>
      row.defense_coverage_type === nflCov &&
      row.box_bucket === boxBucket &&
      row.attack_zone === attackZone &&
      row.pa === playAction
  );

  const fallback =
    exact ||
    nflStats.find(
      (row) =>
        row.defense_coverage_type === nflCov &&
        row.attack_zone === attackZone
    );

  return (
    fallback || {
      plays: 0,
      avg_epa: 0,
      success_rate: 0.45,
      avg_air_yards: 7.5,
      pressure_rate: 0.22,
    }
  );
}

// Simulate where defenders move post-snap based on their pre-snap alignment + coverage rules
export function simulatePostSnapDefense(defenders, schemeId, offensePlayers) {
  const receivers = offensePlayers.filter(
    (p) => p.routeType === "pass" && p.id !== "QB"
  );

  return defenders.map((d) => {
    // 1. Defensive Linemen rush 3 yards across the LOS
    if (d.label === "DE" || d.label === "DT") {
      return { ...d, postX: d.x, postY: Math.min(39, d.y + 3.5) };
    }

    // 2. Safeties rotate based on 1-high vs 2-high coverage
    if (d.label === "FS" || d.label === "SS") {
      if (schemeId === "cover-3" || schemeId === "cover-1") {
        // Deep safety stays middle; rolled-down safety buzzes to hook/curl
        if (d.y < 19) {
          return { ...d, postX: 50, postY: 10 };
        }
        return { ...d, postX: d.x > 50 ? d.x + 6 : d.x - 6, postY: 26 };
      }
      // Cover 2 or Cover 4: both safeties drop deep
      return { ...d, postX: d.x, postY: 11 };
    }

    // 3. Cornerbacks play flat (Cover 2), deep zone (Cover 3/4), or man (Cover 1)
    if (d.label === "CB") {
      if (schemeId === "cover-2") {
        return { ...d, postX: d.x, postY: 26 }; // Squat flat
      }
      if (schemeId === "cover-1") {
        // Mirror nearest receiver's route destination
        let closest = null;
        let minD = Infinity;
        receivers.forEach((r) => {
          const dist = Math.hypot(r.x - d.x, r.y - d.y);
          if (dist < minD) {
            minD = dist;
            closest = r;
          }
        });
        if (closest && closest.path?.length) {
          const dest = closest.path[closest.path.length - 1];
          return { ...d, postX: dest.x, postY: Math.min(34, dest.y + 2.2) };
        }
      }
      return { ...d, postX: d.x, postY: 13 }; // Deep 1/3 or 1/4 bail
    }

    // 4. Linebackers & Nickel drop 3 yards from wherever the user lined them up
    return {
      ...d,
      postX: d.x,
      postY: Math.max(19, d.y - 3),
    };
  });
}

// Main Shadow-Boxing Evaluator: checks if the play works, why/why not, and what to change
export function evaluateShadowBox({
  offensePlayers,
  schemeId,
  customDefenders,
  playAction = false,
  position = "QB",
}) {
  const schemeObj = SCHEME_BASICS.find((s) => s.id === schemeId) || SCHEME_BASICS[0];
  const postDefenders = simulatePostSnapDefense(customDefenders, schemeId, offensePlayers);

  // Count defenders in the box (x: 35-65, y: 24-35)
  const boxCount = customDefenders.filter(
    (d) => d.x >= 35 && d.x <= 65 && d.y >= 24 && d.y <= 35
  ).length;

  // Detect whether play is a run or pass and which zone it attacks
  const rb = offensePlayers.find((p) => p.id === "RB");
  const isRunPlay = rb && rb.routeType === "run" && rb.path?.length > 0;
  const activeRoutes = offensePlayers.filter(
    (p) => (p.routeType === "pass" || p.routeType === "run") && p.path?.length > 0 && p.id !== "QB"
  );

  let attackZone = "PASS_MIDDLE";
  if (isRunPlay) {
    const endX = rb.path[rb.path.length - 1].x;
    attackZone = endX < 46 ? "RUN_LEFT" : endX > 54 ? "RUN_RIGHT" : "RUN_MIDDLE";
  } else if (activeRoutes.length > 0) {
    const avgX =
      activeRoutes.reduce((sum, p) => sum + p.path[p.path.length - 1].x, 0) /
      activeRoutes.length;
    attackZone = avgX < 42 ? "PASS_LEFT" : avgX > 58 ? "PASS_RIGHT" : "PASS_MIDDLE";
  }

  // Grade each route's open grass against post-snap defenders
  const routeGrades = activeRoutes.map((p) => {
    const target = p.path[p.path.length - 1];
    let nearestDef = null;
    let minDist = Infinity;

    postDefenders.forEach((d) => {
      const dist = Math.hypot(d.postX - target.x, d.postY - target.y);
      if (dist < minDist) {
        minDist = dist;
        nearestDef = d;
      }
    });

    return {
      playerId: p.id,
      target,
      nearestDef: nearestDef?.id || "DEF",
      clearanceYds: +minDist.toFixed(1),
      status: minDist >= 6.5 ? "OPEN" : minDist >= 4.2 ? "CONTESTED" : "COVERED",
    };
  });

  const openCount = routeGrades.filter((r) => r.status === "OPEN").length;
  const nflData = getNflMatchupStats(schemeId, boxCount, attackZone, playAction);

  // Check dynamic "If-Then-Because" alignment rules
  const widenedLb = customDefenders.find(
    (d) => d.label === "LB" && (d.x > 63 || d.x < 37)
  );
  const muggedLb = customDefenders.find(
    (d) => d.label === "LB" && d.x >= 44 && d.x <= 56 && d.y >= 29
  );
  const middleShotInC3 =
    (schemeId === "cover-3" || schemeId === "cover-1") &&
    routeGrades.some((r) => r.target.x >= 43 && r.target.x <= 57 && r.target.y <= 15);

  const slotIds = new Set(["Y", "H", "WR2", "TE", "TE1"]);
  const outsideIds = new Set(["Z", "X", "WR1", "WR3"]);
  const hasExplicitOutside = offensePlayers.some((p) => outsideIds.has(p.id));
  const firstReceiver = offensePlayers.find((p) => p.routeType === "pass" && p.id !== "QB");

  let status = "WORKS"; // "WORKS" | "ADJUST" | "BROKEN"
  let headline = `Play Works — ${openCount} open window(s) created vs. ${schemeObj.name.split(" (")[0]}.`;
  let because = `Your route spacing stretches the ${schemeObj.name.split(" (")[0]} zones and creates clean throwing lanes.`;
  let adjustment = null;

  if (isRunPlay && boxCount >= 7) {
    status = "BROKEN";
    headline = `Check Out of Run — Heavy ${boxCount}-Man Box`;
    because = `Because ${boxCount} defenders are packed inside the box against 5 blockers, the defense has an unblocked extra tackler at the point of attack.`;
    adjustment = {
      label: "Kill Run → Quick Slant / Flat RPO",
      apply: (players) =>
        players.map((p) => {
          if (p.id === "RB") return { ...p, routeType: "pass", path: [{ x: 26, y: 33 }] };
          if (p.id === "X" || p.id === "WR1") return { ...p, routeType: "pass", path: [{ x: p.x, y: 31 }, { x: 28, y: 27 }] };
          if (p.id === "Z" || p.id === "WR2") return { ...p, routeType: "pass", path: [{ x: p.x, y: 31 }, { x: 72, y: 27 }] };
          return p;
        }),
    };
  } else if (!isRunPlay && boxCount <= 5) {
    status = "ADJUST";
    headline = `Light ${boxCount}-Man Box — Run Advantage Available`;
    because = `Because the defense only has ${boxCount} defenders in the box, your offensive line can block everyone up front for an easy 5+ yard run.`;
    adjustment = {
      label: "Audible to Inside Zone Run",
      apply: (players) =>
        players.map((p) => {
          if (p.id === "RB") return { ...p, routeType: "run", path: [{ x: 52, y: 41 }, { x: 53, y: 27 }] };
          if (["LT", "LG", "C", "RG", "RT"].includes(p.id)) {
            return { ...p, routeType: "block", path: [{ x: p.x + 3, y: 34 }] };
          }
          return p;
        }),
    };
  } else if (widenedLb) {
    status = "ADJUST";
    headline = `Linebacker Widened (${widenedLb.id}) — Attack the Vacated Hook`;
    because = `Because ${widenedLb.id} lined up wide outside the tackle box, he takes away the sideline flat—leaving a huge soft spot right over the middle at 10–12 yards.`;
    adjustment = {
      label: "Bend Slot Route Into Open Middle Dig",
      apply: (players) =>
        players.map((p) =>
          slotIds.has(p.id) || (!hasExplicitOutside && firstReceiver && p.id === firstReceiver.id)
            ? { ...p, routeType: "pass", path: [{ x: p.x, y: 24 }, { x: 50, y: 22 }] }
            : p
        ),
    };
  } else if (muggedLb) {
    status = "ADJUST";
    headline = `A-Gap Blitz Threat (${muggedLb.id}) — Hot Read Required`;
    because = `Because ${muggedLb.id} walked up into the A-gap at the line of scrimmage, he threatens immediate interior pressure—leaving the short middle behind him completely empty.`;
    adjustment = {
      label: "Convert Hot Receiver to Quick Slant Behind Blitz",
      apply: (players) =>
        players.map((p) =>
          p.id === "Z" || (!hasExplicitOutside && firstReceiver && p.id === firstReceiver.id)
            ? { ...p, routeType: "pass", path: [{ x: p.x, y: 32 }, { x: 64, y: 27 }] }
            : p
        ),
    };
  } else if (middleShotInC3) {
    status = "BROKEN";
    headline = "Deep Middle Capped by 1-High Safety";
    because = `Because ${schemeObj.name.split(" (")[0]} keeps a Free Safety in the deep middle, throwing straight down the middle runs right into coverage. Attack the seams instead.`;
    adjustment = {
      label: "Bend Route to Open Seam (x=66)",
      apply: (players) =>
        players.map((p) =>
          p.id === "Y" || p.id === "Z" || p.id === "WR2" || p.id === "TE"
            ? { ...p, routeType: "pass", path: [{ x: 66, y: 15 }] }
            : p
        ),
    };
  } else if (!isRunPlay && openCount === 0 && activeRoutes.length > 0) {
    status = "BROKEN";
    headline = "All Routes Covered — Need a High-Low Stretch";
    because = `Every drawn route finishes within 4 yards of a defender in ${schemeObj.name.split(" (")[0]}. Add a flat route underneath to force the defender to choose.`;
    adjustment = {
      label: "Release RB to Flat for High-Low Stretch",
      apply: (players) =>
        players.map((p) =>
          p.id === "RB"
            ? { ...p, routeType: "pass", path: [{ x: 78, y: 32 }] }
            : p
        ),
    };
  }

  // Position-specific coaching instructions for all 8 position rooms
  const positionCoaching = {
    QB: `Pre-snap: Count ${boxCount} in the box and confirm ${schemeObj.name.split(" (")[0]}. Post-snap: Key the conflict defender—if he widens, throw inside; if he sinks, take the underneath flat.`,
    RB: `Scan A-gap to C-gap for blitzers (${muggedLb ? `${muggedLb.id} is showing blitz` : "no immediate A-gap mug"}). ${isRunPlay ? "Press the frontside A/B gap and read the first down-lineman's shoulder for a cutback." : "If protection is clean, release fast to the flat to widen the underneath coverage."}`,
    WR: `Stem vertically at full speed to threaten the defender's cushion before breaking into open grass. Against ${schemeObj.name.split(" (")[0]}, settle in zone voids instead of running into the next defender.`,
    TE: `Check DE alignment pre-snap: chip the edge if ${boxCount >= 7 ? "the front threatens quick pressure" : "your tackle is in 1-on-1 protection"}, then drive into the seam between the hook LB and deep safety.`,
    OL: `${boxCount >= 7 ? `Heavy ${boxCount}-man box: slide protection toward the 3-tech DT and communicate the extra rusher.` : `Light ${boxCount}-man box: win double-teams at the point of attack and climb smoothly to the linebackers.`}`,
    DL: `Read the offensive guard's block key first (pass set vs. pull/down block). ${isRunPlay ? "Lock out your gap and spill pullers outside to your unblocked linebacker." : "Maintain rush-lane integrity—keep contain on the edges and collapse the pocket up the middle."}`,
    LB: `Read the guards' pull/pass set first. ${widenedLb ? "Since you are widened outside the hash, wall #2's vertical stem before sinking to the curl." : "Gain depth to your hook/curl landmark with eyes on the QB's front shoulder."}`,
    DB: `${schemeId === "cover-2" ? "Trap the flat at 4–5 yards and funnel outside releases inside to your deep half safety." : "Maintain top-down leverage on your deep third/quarter and drive downhill on throws in front of you."}`,
  };

  return {
    status,
    headline,
    because,
    adjustment,
    boxCount,
    attackZone,
    nflData,
    routeGrades,
    postDefenders,
    positionTip: positionCoaching[position] || positionCoaching.QB,
  };
}