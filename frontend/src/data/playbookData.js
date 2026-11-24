// frontend/src/data/playbookData.js

export const GAP_GRID = [
  { label: "D", x: 30 },
  { label: "C", x: 36 },
  { label: "B", x: 42 },
  { label: "A", x: 47.5 },
  { label: "A", x: 52.5 },
  { label: "B", x: 58 },
  { label: "C", x: 64 },
  { label: "D", x: 70 },
];

// 1. SCHEME BASICS (4-Step Spotlight + What Beats It)
export const SCHEME_BASICS = [
  {
    id: "cover-3",
    name: "Cover 3 (3 Deep, 4 Underneath)",
    nickname: "The Everyday Zone Defense",
    plainEnglish:
      "Three defenders split the deep field into thirds (left, middle, right), while four defenders cover the short/medium zones underneath.",
    steps: [
      {
        stepTitle: "Step 1: Look at the Deep Safeties",
        spotlightIds: ["FS"],
        question: "How many safeties are lined up deep in the middle of the field?",
        options: [
          { text: "1 Deep Safety (Middle of the field is CLOSED)", correct: true },
          { text: "2 Deep Safeties (Middle of the field is OPEN)", correct: false },
        ],
        explanation:
          "One deep safety in the middle ('1-High') means the defense is protecting the deep middle. This immediately narrows it down to Cover 1 (Man) or Cover 3 (Zone).",
      },
      {
        stepTitle: "Step 2: Check the Outside Cornerbacks",
        spotlightIds: ["CB1", "CB2"],
        question: "Where are the outside cornerbacks lined up?",
        options: [
          { text: "Backed off 7+ yards with eyes on the QB (Zone)", correct: true },
          { text: "Right up in the receiver's face (Press Man)", correct: false },
        ],
        explanation:
          "Backed-off corners + 1 deep safety is the classic tell for Cover 3. Those two corners are responsible for the deep left and deep right thirds.",
      },
      {
        stepTitle: "Step 3: Count the Box",
        spotlightIds: ["DE1", "DT1", "DT2", "DE2", "W", "M", "SS"],
        question: "How many defenders are near the middle ('in the box')?",
        options: [
          { text: "7 defenders (Heavy Box — crowded for running)", correct: true },
          { text: "5 defenders (Light Box — easy to run)", correct: false },
        ],
        explanation:
          "Because the Strong Safety (SS) rolled down near the line, there are 7 defenders in the box. That makes running up the middle tough.",
      },
      {
        stepTitle: "Step 4: What Works Best Against Cover 3?",
        spotlightIds: ["FS", "CB2", "SS"],
        showWeaknesses: true,
        question: "Knowing 3 defenders are deep and 4 are underneath, where is the defense weakest?",
        options: [
          { text: "The Seams (between the deep thirds) & Sideline Floods (stretching the flat defender)", correct: true },
          { text: "Throwing a deep jump ball straight down the middle", correct: false },
        ],
        explanation:
          "Best Beaters: 1) 'Flood' (put 3 receivers at different depths on one sideline—the flat defender can only guard one). 2) 'Four Verticals / Seams' (attack the gaps between the deep safety and the outside corners). 3) Quick underneath slants/hitches before the corners can close.",
      },
    ],
    bestBeaters: [
      { name: "Flood Concept", why: "Sends a deep, medium, and short route to one sideline—overloads the single flat defender." },
      { name: "Seam Routes (4 Verts)", why: "Attacks the open grass between the single deep safety and the outside cornerbacks." },
      { name: "Curl / Flat", why: "Forces the outside linebacker/safety to choose between guarding the curl or the flat." },
    ],
    zoneBubbles: [
      { label: "Deep 1/3", x: 18, y: 12, rx: 14, ry: 9 },
      { label: "Deep 1/3", x: 50, y: 10, rx: 16, ry: 9 },
      { label: "Deep 1/3", x: 82, y: 12, rx: 14, ry: 9 },
      { label: "Flat", x: 18, y: 27, rx: 10, ry: 5 },
      { label: "Hook", x: 42, y: 25, rx: 10, ry: 5 },
      { label: "Hook", x: 58, y: 25, rx: 10, ry: 5 },
      { label: "Flat", x: 82, y: 27, rx: 10, ry: 5 },
    ],
    weaknesses: [
      { label: "Seam Gap", x: 34, y: 16, r: 5 },
      { label: "Seam Gap", x: 66, y: 16, r: 5 },
      { label: "Sideline Flood", x: 88, y: 21, r: 5.5 },
    ],
    defense: [
      { id: "DE1", label: "DE", x: 38, y: 33 },
      { id: "DT1", label: "DT", x: 47, y: 33 },
      { id: "DT2", label: "DT", x: 56, y: 33 },
      { id: "DE2", label: "DE", x: 63, y: 33 },
      { id: "W",   label: "LB", x: 42, y: 27 },
      { id: "M",   label: "LB", x: 54, y: 27 },
      { id: "SS",  label: "SS", x: 66, y: 26 },
      { id: "CB1", label: "CB", x: 14, y: 25 },
      { id: "CB2", label: "CB", x: 86, y: 25 },
      { id: "FS",  label: "FS", x: 50, y: 14 },
    ],
  },
  {
    id: "cover-2",
    name: "Cover 2 (2 Deep, 5 Underneath)",
    nickname: "The Anti-Deep-Ball Defense",
    plainEnglish:
      "Two safeties split the deep field in half, while the cornerbacks stay shallow to guard the sidelines (flats).",
    steps: [
      {
        stepTitle: "Step 1: Look at the Deep Safeties",
        spotlightIds: ["FS", "SS"],
        question: "How many safeties are lined up deep?",
        options: [
          { text: "2 Deep Safeties (Middle of the field is OPEN)", correct: true },
          { text: "1 Deep Safety (Middle of the field is CLOSED)", correct: false },
        ],
        explanation:
          "Two deep safeties ('2-High') leave the deep middle open between them. This usually means Cover 2 or Cover 4.",
      },
      {
        stepTitle: "Step 2: Check the Outside Cornerbacks",
        spotlightIds: ["CB1", "CB2"],
        question: "Where are the cornerbacks lined up?",
        options: [
          { text: "Shallow (4–5 yards off), watching the QB and ready to jump short sideline throws", correct: true },
          { text: "Backed way off 10 yards deep", correct: false },
        ],
        explanation:
          "Shallow corners + 2 deep safeties = Cover 2. The corners only guard the short flat, leaving a big 'honey hole' behind them.",
      },
      {
        stepTitle: "Step 3: Count the Box",
        spotlightIds: ["DE1", "DT1", "DT2", "DE2", "W", "M"],
        question: "How many defenders are in the box?",
        options: [
          { text: "6 defenders (Light Box — favorable for running)", correct: true },
          { text: "8 defenders (Stacked Box)", correct: false },
        ],
        explanation:
          "Because both safeties are deep, Cover 2 usually has a lighter 6-man box—making Inside Zone and run plays very effective.",
      },
      {
        stepTitle: "Step 4: What Works Best Against Cover 2?",
        spotlightIds: ["FS", "SS", "CB2"],
        showWeaknesses: true,
        question: "Where are the biggest soft spots in Cover 2?",
        options: [
          { text: "Deep Middle (between the 2 safeties) & Sideline 'Honey Hole' (behind the shallow CB)", correct: true },
          { text: "Short flat passes right at the cornerback", correct: false },
        ],
        explanation:
          "Best Beaters: 1) 'Smash' (short hitch holds the CB down, corner route goes right behind him into the honey hole). 2) 'Deep Post' (splits the two safeties right down the open middle). 3) Run the ball against the light box.",
      },
    ],
    bestBeaters: [
      { name: "Smash Concept", why: "Short hitch holds the shallow CB; the corner route arcs right over his head into the sideline honey hole." },
      { name: "Deep Post / Mills", why: "Splits the two deep safeties right down the open middle of the field." },
      { name: "Inside Zone Run", why: "Takes advantage of the light 6-man box since both safeties are deep." },
    ],
    zoneBubbles: [
      { label: "Deep 1/2", x: 30, y: 12, rx: 20, ry: 9 },
      { label: "Deep 1/2", x: 70, y: 12, rx: 20, ry: 9 },
      { label: "Flat", x: 15, y: 29, rx: 10, ry: 5 },
      { label: "Hook", x: 38, y: 25, rx: 9, ry: 5 },
      { label: "Mid Hole", x: 50, y: 23, rx: 9, ry: 5 },
      { label: "Hook", x: 62, y: 25, rx: 9, ry: 5 },
      { label: "Flat", x: 85, y: 29, rx: 10, ry: 5 },
    ],
    weaknesses: [
      { label: "Deep Middle", x: 50, y: 12, r: 5.5 },
      { label: "Honey Hole", x: 86, y: 20, r: 5 },
      { label: "Honey Hole", x: 14, y: 20, r: 5 },
    ],
    defense: [
      { id: "DE1", label: "DE", x: 38, y: 33 },
      { id: "DT1", label: "DT", x: 47, y: 33 },
      { id: "DT2", label: "DT", x: 56, y: 33 },
      { id: "DE2", label: "DE", x: 63, y: 33 },
      { id: "W",   label: "LB", x: 43, y: 27 },
      { id: "M",   label: "LB", x: 57, y: 27 },
      { id: "CB1", label: "CB", x: 14, y: 30 },
      { id: "CB2", label: "CB", x: 86, y: 30 },
      { id: "FS",  label: "FS", x: 33, y: 15 },
      { id: "SS",  label: "SS", x: 67, y: 15 },
    ],
  },
  {
    id: "cover-1",
    name: "Cover 1 (Man-to-Man + 1 Deep Safety)",
    nickname: "Lockdown Man Coverage",
    plainEnglish:
      "Every receiver is guarded 1-on-1 by a defender, with one lone Free Safety deep in the middle as insurance.",
    steps: [
      {
        stepTitle: "Step 1: Look at the Deep Safety",
        spotlightIds: ["FS"],
        question: "How many safeties are deep?",
        options: [
          { text: "1 Deep Safety in the middle", correct: true },
          { text: "2 Deep Safeties", correct: false },
        ],
        explanation: "Just like Cover 3, Cover 1 has 1 deep safety—so you need Step 2 to tell them apart.",
      },
      {
        stepTitle: "Step 2: Check the Cornerbacks",
        spotlightIds: ["CB1", "CB2", "NB"],
        question: "How are the corners lined up?",
        options: [
          { text: "Tight/Press right in front of the receivers, eyes locked on the man (not the QB)", correct: true },
          { text: "Backed off 8 yards staring at the QB", correct: false },
        ],
        explanation:
          "Tight press alignment with eyes on the receiver = Man Coverage. If a receiver motions across the field and a defender follows him, that's 100% confirmation of Man.",
      },
      {
        stepTitle: "Step 3: What Works Best Against Cover 1?",
        spotlightIds: ["CB1", "CB2", "NB"],
        showWeaknesses: true,
        question: "How do you beat Man-to-Man coverage?",
        options: [
          { text: "Crossing routes, Rub/Mesh picks, and Slants that make defenders chase through traffic", correct: true },
          { text: "Standing still in a spot (hitches) where the defender is glued to you", correct: false },
        ],
        explanation:
          "Best Beaters: 1) 'Mesh' (two shallow crossers rub past each other so defenders get stuck in traffic). 2) 'Slant / Out' (quick horizontal breaks away from leverage). 3) QB Scramble (defenders have their backs turned running with receivers).",
      },
    ],
    bestBeaters: [
      { name: "Mesh (Double Crossers)", why: "Creates natural traffic/rubs so man defenders collide or get trailed." },
      { name: "Slants & Quick Outs", why: "Forces defenders to flip their hips and chase horizontally." },
      { name: "QB Scramble / RPO", why: "Every defender's back is turned chasing receivers, leaving massive running lanes." },
    ],
    zoneBubbles: [{ label: "Deep 1/1 Help", x: 50, y: 12, rx: 18, ry: 8 }],
    weaknesses: [
      { label: "Crossing Traffic", x: 50, y: 28, r: 6 },
      { label: "1-on-1 Sideline", x: 86, y: 22, r: 5 },
    ],
    defense: [
      { id: "DE1", label: "DE", x: 38, y: 33 },
      { id: "DT1", label: "DT", x: 47, y: 33 },
      { id: "DT2", label: "DT", x: 56, y: 33 },
      { id: "DE2", label: "DE", x: 63, y: 33 },
      { id: "W",   label: "LB", x: 44, y: 27 },
      { id: "M",   label: "LB", x: 56, y: 27 },
      { id: "NB",  label: "NB", x: 75, y: 32 },
      { id: "CB1", label: "CB", x: 14, y: 33 },
      { id: "CB2", label: "CB", x: 88, y: 33 },
      { id: "FS",  label: "FS", x: 50, y: 14 },
    ],
  },
  {
    id: "cover-4",
    name: "Cover 4 (Quarters — 4 Deep, 3 Underneath)",
    nickname: "The Prevent-Big-Plays Defense",
    plainEnglish:
      "Four defenders (2 Corners + 2 Safeties) split the deep field into quarters. Almost impossible to throw deep against, but soft underneath.",
    steps: [
      {
        stepTitle: "Step 1: Look at the Safeties & Corners Together",
        spotlightIds: ["FS", "SS", "CB1", "CB2"],
        question: "What do all 4 defensive backs have in common?",
        options: [
          { text: "All 4 are backed off 7–10 yards deep, forming a wall across the deep field", correct: true },
          { text: "Corners are pressed up tight at the line of scrimmage", correct: false },
        ],
        explanation:
          "2 Deep Safeties + 2 Deep/Off Corners = Cover 4 (Quarters). Nobody is getting beat deep.",
      },
      {
        stepTitle: "Step 2: What Works Best Against Cover 4?",
        spotlightIds: ["W", "M"],
        showWeaknesses: true,
        question: "If 4 defenders are bailing deep, where is all the open grass?",
        options: [
          { text: "Underneath in the Flats and Short Middle (take the easy 6–8 yards)", correct: true },
          { text: "Throwing 40-yard bombs into quadruple coverage", correct: false },
        ],
        explanation:
          "Best Beaters: 1) 'Checkdowns / RB Flats' (4 deep means only 3 underneath—dump it short for easy yards). 2) 'Mills / Dagger' (a deep post pulls the safety, opening a wide-open dig route right underneath him).",
      },
    ],
    bestBeaters: [
      { name: "Underneath Flats & Drags", why: "With 4 defenders bailing deep, only 3 are left to cover the entire width of the short field." },
      { name: "Dagger (Seam + Dig)", why: "Vertical route clears the safety out, leaving a huge void for the 12-yard in-breaking dig." },
    ],
    zoneBubbles: [
      { label: "Deep 1/4", x: 14, y: 12, rx: 11, ry: 9 },
      { label: "Deep 1/4", x: 38, y: 12, rx: 11, ry: 9 },
      { label: "Deep 1/4", x: 62, y: 12, rx: 11, ry: 9 },
      { label: "Deep 1/4", x: 86, y: 12, rx: 11, ry: 9 },
      { label: "Under", x: 25, y: 27, rx: 12, ry: 5 },
      { label: "Middle", x: 50, y: 26, rx: 12, ry: 5 },
      { label: "Under", x: 75, y: 27, rx: 12, ry: 5 },
    ],
    weaknesses: [
      { label: "Open Flat", x: 16, y: 31, r: 5 },
      { label: "Open Flat", x: 84, y: 31, r: 5 },
      { label: "Underneath Dig", x: 50, y: 21, r: 5 },
    ],
    defense: [
      { id: "DE1", label: "DE", x: 38, y: 33 },
      { id: "DT1", label: "DT", x: 47, y: 33 },
      { id: "DT2", label: "DT", x: 56, y: 33 },
      { id: "DE2", label: "DE", x: 63, y: 33 },
      { id: "W",   label: "LB", x: 42, y: 27 },
      { id: "M",   label: "LB", x: 58, y: 27 },
      { id: "CB1", label: "CB", x: 14, y: 24 },
      { id: "CB2", label: "CB", x: 86, y: 24 },
      { id: "FS",  label: "FS", x: 35, y: 16 },
      { id: "SS",  label: "SS", x: 65, y: 16 },
    ],
  },
];

// 2. PLAY-BY-PLAY & POSITION DRILLS
export const SCENARIOS = [
  {
    id: "qb-cover3-flood",
    title: "Trips Right vs. Cover 3 (Heavy Box)",
    side: "Offense",
    position: "QB",
    downDistance: "2nd & 7 • Ball on OPP 38",
    front: "4-3 Over (7-Man Box)",
    boxCount: 7,
    boxStatus: "HEAVY",
    coverage: "Cover 3",
    prompt:
      "Pre-snap you see 1 deep safety, backed-off corners, and 7 defenders crowded in the box. Your huddle call is Inside Zone / Kill to Flood. What is your call?",
    options: [
      { id: "a", text: "Keep Inside Zone — run into the crowded box", correct: false },
      { id: "b", text: "KILL to Flood — attack the sideline flat defender in Cover 3", correct: true },
      { id: "c", text: "Throw a deep ball straight at the Free Safety", correct: false },
    ],
    coachingTakeaway:
      "7 in the box is too crowded for Inside Zone—kill the run. Flood puts 3 receivers on the right sideline to stretch the single flat defender.",
    zoneBubbles: SCHEME_BASICS[0].zoneBubbles,
    weaknesses: [{ label: "Flood Sideline", x: 86, y: 20, r: 6 }],
    offense: [
      { id: "LT", x: 40, y: 37, postX: 39, postY: 40 },
      { id: "LG", x: 45, y: 37, postX: 45, postY: 39.5 },
      { id: "C",  x: 50, y: 37, postX: 50, postY: 39 },
      { id: "RG", x: 55, y: 37, postX: 55, postY: 39.5 },
      { id: "RT", x: 60, y: 37, postX: 61, postY: 40 },
      { id: "QB", x: 50, y: 45, postX: 50, postY: 48 },
      { id: "RB", x: 44, y: 45, postX: 57, postY: 42 },
      { id: "X",  x: 14, y: 37, postX: 14, postY: 16 },
      { id: "Y",  x: 68, y: 38, postX: 86, postY: 20 },
      { id: "H",  x: 77, y: 39, postX: 88, postY: 31 },
      { id: "Z",  x: 88, y: 37, postX: 88, postY: 11 },
    ],
    defense: [
      { id: "DE", tech: "5",  x: 38, y: 33, postX: 39, postY: 38 },
      { id: "DT", tech: "1",  x: 47, y: 33, postX: 47, postY: 36 },
      { id: "DT", tech: "3",  x: 57, y: 33, postX: 57, postY: 36 },
      { id: "DE", tech: "5",  x: 63, y: 33, postX: 62, postY: 38 },
      { id: "W",  tech: "LB", x: 42, y: 27, postX: 42, postY: 25 },
      { id: "M",  tech: "LB", x: 52, y: 27, postX: 56, postY: 25 },
      { id: "S",  tech: "LB", x: 68, y: 28, postX: 78, postY: 27 },
      { id: "CB", tech: "CB", x: 14, y: 26, postX: 16, postY: 14 },
      { id: "CB", tech: "CB", x: 88, y: 26, postX: 85, postY: 14 },
      { id: "SS", tech: "S",  x: 64, y: 20, postX: 76, postY: 27 },
      { id: "FS", tech: "S",  x: 50, y: 15, postX: 50, postY: 10 },
    ],
  },
  {
    id: "ol-id-mike-under",
    title: "Center Protection Call vs. 4-3 Under",
    side: "Offense",
    position: "OL",
    downDistance: "3rd & 5 • Ball on OWN 45",
    front: "4-3 Under (3-Tech Left, 1-Tech Right)",
    boxCount: 6,
    boxStatus: "LIGHT",
    coverage: "Cover 2",
    prompt:
      "You are the Center. There is a dangerous 3-tech DT over your Left Guard. Which way do you slide the pass protection?",
    options: [
      { id: "a", text: "Slide Left (toward the 3-tech for double-team help)", correct: true },
      { id: "b", text: "Slide Right (away from the 3-tech)", correct: false },
    ],
    coachingTakeaway:
      "Sliding toward the 3-tech gives your Left Guard and Left Tackle help against the best interior rusher while your RB picks up any backside blitz.",
    zoneBubbles: SCHEME_BASICS[1].zoneBubbles,
    weaknesses: [{ label: "Deep Middle", x: 50, y: 13, r: 6 }],
    offense: [
      { id: "LT", x: 40, y: 37, postX: 38, postY: 39.5 },
      { id: "LG", x: 45, y: 37, postX: 43, postY: 39.5 },
      { id: "C",  x: 50, y: 37, postX: 48, postY: 39.5 },
      { id: "RG", x: 55, y: 37, postX: 55, postY: 39.5 },
      { id: "RT", x: 60, y: 37, postX: 61, postY: 39.5 },
      { id: "QB", x: 50, y: 45, postX: 50, postY: 48 },
      { id: "RB", x: 56, y: 45, postX: 58, postY: 41 },
      { id: "X",  x: 14, y: 37, postX: 14, postY: 20 },
      { id: "Y",  x: 65, y: 37, postX: 50, postY: 16 },
      { id: "Z",  x: 86, y: 37, postX: 86, postY: 20 },
      { id: "H",  x: 26, y: 39, postX: 26, postY: 24 },
    ],
    defense: [
      { id: "DE", tech: "5",  x: 37, y: 33, postX: 38, postY: 38 },
      { id: "DT", tech: "3",  x: 43, y: 33, postX: 44, postY: 37 },
      { id: "NT", tech: "1",  x: 52, y: 33, postX: 52, postY: 37 },
      { id: "DE", tech: "5",  x: 63, y: 33, postX: 62, postY: 38 },
      { id: "W",  tech: "LB", x: 41, y: 27, postX: 41, postY: 25 },
      { id: "M",  tech: "LB", x: 54, y: 27, postX: 54, postY: 23 },
      { id: "CB", tech: "CB", x: 14, y: 29, postX: 14, postY: 27 },
      { id: "NB", tech: "CB", x: 26, y: 28, postX: 28, postY: 26 },
      { id: "CB", tech: "CB", x: 86, y: 29, postX: 86, postY: 27 },
      { id: "FS", tech: "S",  x: 34, y: 16, postX: 30, postY: 12 },
      { id: "SS", tech: "S",  x: 66, y: 16, postX: 70, postY: 12 },
    ],
  },
  {
    id: "lb-guard-pull-fit",
    title: "Mike LB Run Fit vs. Pulling Guard",
    side: "Defense",
    position: "LB",
    downDistance: "1st & 10 • Ball on OWN 30",
    front: "4-3 Base (7-Man Box)",
    boxCount: 7,
    boxStatus: "HEAVY",
    coverage: "Cover 1",
    prompt:
      "You are the Mike LB. At the snap, the Offensive Line fires low and the Left Guard pulls right across your face. Where do you go?",
    options: [
      { id: "a", text: "Drop back into pass coverage", correct: false },
      { id: "b", text: "Scrape over the top and meet the puller in the strong-side C-gap", correct: true },
      { id: "c", text: "Dive into the backside A-gap", correct: false },
    ],
    coachingTakeaway:
      "Pulling Guard = Power run. Scrape over the top of the blocks and meet the puller in the C-gap to force the runner back inside.",
    zoneBubbles: [],
    weaknesses: [{ label: "C-Gap Fit", x: 64, y: 33, r: 4.5 }],
    offense: [
      { id: "LT", x: 40, y: 37, postX: 41, postY: 34 },
      { id: "LG", x: 45, y: 37, postX: 62, postY: 36 },
      { id: "C",  x: 50, y: 37, postX: 48, postY: 34 },
      { id: "RG", x: 55, y: 37, postX: 54, postY: 34 },
      { id: "RT", x: 60, y: 37, postX: 58, postY: 34 },
      { id: "TE", x: 65, y: 37, postX: 64, postY: 34 },
      { id: "QB", x: 50, y: 41, postX: 54, postY: 43 },
      { id: "RB", x: 50, y: 48, postX: 61, postY: 41 },
      { id: "FB", x: 56, y: 44, postX: 65, postY: 35 },
      { id: "X",  x: 14, y: 37, postX: 16, postY: 30 },
      { id: "Z",  x: 86, y: 37, postX: 84, postY: 30 },
    ],
    defense: [
      { id: "DE", tech: "5",  x: 38, y: 33, postX: 41, postY: 34 },
      { id: "DT", tech: "1",  x: 47, y: 33, postX: 48, postY: 34 },
      { id: "DT", tech: "3",  x: 57, y: 33, postX: 57, postY: 34 },
      { id: "DE", tech: "7",  x: 66, y: 33, postX: 65, postY: 35 },
      { id: "W",  tech: "LB", x: 42, y: 27, postX: 50, postY: 31 },
      { id: "M",  tech: "LB", x: 52, y: 27, postX: 63, postY: 32 },
      { id: "S",  tech: "LB", x: 68, y: 28, postX: 70, postY: 32 },
      { id: "CB", tech: "CB", x: 14, y: 29, postX: 16, postY: 29 },
      { id: "CB", tech: "CB", x: 86, y: 29, postX: 84, postY: 29 },
      { id: "SS", tech: "S",  x: 62, y: 22, postX: 67, postY: 28 },
      { id: "FS", tech: "S",  x: 50, y: 15, postX: 54, postY: 20 },
    ],
  },
];

// 3. PLAYBOOK LIBRARY (Starter Plays + Custom User Plays)
export const INITIAL_PLAYBOOK = [
  {
    id: "play-mesh",
    name: "Mesh (Man Beater)",
    side: "Offense",
    category: "Pass",
    beats: "Cover 1 / Man-to-Man",
    description: "Two shallow crossing routes rub past each other at 5 yards, creating natural picks against man coverage.",
    players: [
      { id: "LT", team: "O", x: 40, y: 37, routeType: "block", path: [{ x: 39, y: 40 }] },
      { id: "LG", team: "O", x: 45, y: 37, routeType: "block", path: [{ x: 45, y: 40 }] },
      { id: "C",  team: "O", x: 50, y: 37, routeType: "block", path: [{ x: 50, y: 39 }] },
      { id: "RG", team: "O", x: 55, y: 37, routeType: "block", path: [{ x: 55, y: 40 }] },
      { id: "RT", team: "O", x: 60, y: 37, routeType: "block", path: [{ x: 61, y: 40 }] },
      { id: "QB", team: "O", x: 50, y: 45, routeType: "pass",  path: [{ x: 50, y: 48 }] },
      { id: "RB", team: "O", x: 44, y: 45, routeType: "pass",  path: [{ x: 25, y: 38 }, { x: 18, y: 28 }] },
      { id: "X",  team: "O", x: 14, y: 37, routeType: "pass",  path: [{ x: 14, y: 30 }, { x: 65, y: 30 }] },
      { id: "Y",  team: "O", x: 66, y: 37, routeType: "pass",  path: [{ x: 66, y: 29 }, { x: 25, y: 29 }] },
      { id: "Z",  team: "O", x: 86, y: 37, routeType: "pass",  path: [{ x: 86, y: 18 }, { x: 68, y: 12 }] },
      { id: "H",  team: "O", x: 76, y: 39, routeType: "pass",  path: [{ x: 76, y: 24 }, { x: 52, y: 22 }] },
    ],
  },
  {
    id: "play-smash",
    name: "Smash (Cover 2 Beater)",
    side: "Offense",
    category: "Pass",
    beats: "Cover 2",
    description: "Outside receiver runs a 5-yard hitch to freeze the shallow CB; slot receiver runs a corner route into the 'honey hole' behind him.",
    players: [
      { id: "LT", team: "O", x: 40, y: 37, routeType: "block", path: [{ x: 39, y: 40 }] },
      { id: "LG", team: "O", x: 45, y: 37, routeType: "block", path: [{ x: 45, y: 40 }] },
      { id: "C",  team: "O", x: 50, y: 37, routeType: "block", path: [{ x: 50, y: 39 }] },
      { id: "RG", team: "O", x: 55, y: 37, routeType: "block", path: [{ x: 55, y: 40 }] },
      { id: "RT", team: "O", x: 60, y: 37, routeType: "block", path: [{ x: 61, y: 40 }] },
      { id: "QB", team: "O", x: 50, y: 45, routeType: "pass",  path: [{ x: 50, y: 48 }] },
      { id: "RB", team: "O", x: 56, y: 45, routeType: "pass",  path: [{ x: 56, y: 36 }] },
      { id: "X",  team: "O", x: 14, y: 37, routeType: "pass",  path: [{ x: 14, y: 29 }] },
      { id: "H",  team: "O", x: 26, y: 39, routeType: "pass",  path: [{ x: 26, y: 25 }, { x: 12, y: 15 }] },
      { id: "Y",  team: "O", x: 74, y: 39, routeType: "pass",  path: [{ x: 74, y: 25 }, { x: 88, y: 15 }] },
      { id: "Z",  team: "O", x: 86, y: 37, routeType: "pass",  path: [{ x: 86, y: 29 }] },
    ],
  },
  {
    id: "play-inside-zone",
    name: "Inside Zone (Light Box Run)",
    side: "Offense",
    category: "Run",
    beats: "Cover 2 / Light 6-Man Box",
    description: "OL steps in unison to the right; RB reads the first down-lineman and cuts upfield into the open A or B gap.",
    players: [
      { id: "LT", team: "O", x: 40, y: 37, routeType: "block", path: [{ x: 43, y: 34 }] },
      { id: "LG", team: "O", x: 45, y: 37, routeType: "block", path: [{ x: 48, y: 34 }] },
      { id: "C",  team: "O", x: 50, y: 37, routeType: "block", path: [{ x: 53, y: 34 }] },
      { id: "RG", team: "O", x: 55, y: 37, routeType: "block", path: [{ x: 58, y: 34 }] },
      { id: "RT", team: "O", x: 60, y: 37, routeType: "block", path: [{ x: 63, y: 34 }] },
      { id: "QB", team: "O", x: 50, y: 45, routeType: "run",   path: [{ x: 47, y: 45 }] },
      { id: "RB", team: "O", x: 44, y: 45, routeType: "run",   path: [{ x: 52, y: 42 }, { x: 54, y: 28 }] },
      { id: "X",  team: "O", x: 14, y: 37, routeType: "block", path: [{ x: 16, y: 28 }] },
      { id: "Y",  team: "O", x: 66, y: 38, routeType: "motion", path: [{ x: 35, y: 38 }] },
      { id: "Z",  team: "O", x: 86, y: 37, routeType: "block", path: [{ x: 84, y: 28 }] },
    ],
  },
];

export const DEFAULT_DESIGNER_PLAYERS = [
  { id: "LT", team: "O", x: 40, y: 37, routeType: "block", path: [] },
  { id: "LG", team: "O", x: 45, y: 37, routeType: "block", path: [] },
  { id: "C",  team: "O", x: 50, y: 37, routeType: "block", path: [] },
  { id: "RG", team: "O", x: 55, y: 37, routeType: "block", path: [] },
  { id: "RT", team: "O", x: 60, y: 37, routeType: "block", path: [] },
  { id: "QB", team: "O", x: 50, y: 45, routeType: "pass",  path: [] },
  { id: "RB", team: "O", x: 44, y: 45, routeType: "run",   path: [] },
  { id: "X",  team: "O", x: 14, y: 37, routeType: "pass",  path: [] },
  { id: "H",  team: "O", x: 28, y: 39, routeType: "pass",  path: [] },
  { id: "Y",  team: "O", x: 68, y: 38, routeType: "pass",  path: [] },
  { id: "Z",  team: "O", x: 86, y: 37, routeType: "pass",  path: [] },
];

