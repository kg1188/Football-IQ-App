// frontend/src/data/livePlaysData.js
// Coordinate system: 100 x 60 SVG grid | Center = x:50 | LOS = y:35 | Offense attacks UP (toward y:0)

export const LIVE_NFL_PLAYS = [
    {
      id: "nfl-yankee-disguise",
      title: "PA Yankee (Jet Motion + Cross/Post)",
      personnel: "12 Personnel (1 RB, 2 TE, 2 WR)",
      formation: "Under Center Heavy Play-Action",
      preSnapShell: "2-High Split Safety (Disguised)",
      postSnapCoverage: "Cover 3 Buzz (SS Drops to Hook, FS Rotates Middle)",
      disguiseNote:
        "Pre-snap shows two deep safeties at 13 yards. At the snap, SS rotates down into the middle hook/curl while FS bails to the deep middle third.",
      motionNote:
        "Z motions left-to-right pre-snap. Notice the CB does NOT follow him across—confirming Zone coverage before the snap.",
      snapTime: 1.6,
      maxTime: 4.8,
      pocketTime: 3.1,
      nflBenchmark: { epa: "+0.34", successRate: "61%", avgAirYards: "16.8 yds" },
      coachNotes: {
        QB: "1) Watch Z's jet motion: CB stays on his side = Zone. 2) At the snap, watch SS roll down—that vacates the deep over window behind the Mike LB. Key the FS: if FS widens with the Post [1], drill the Deep Over [2] at 18 yards.",
        WR: "X (Post): Stem hard at the FS to hold him in the deep middle third. Z (Deep Over): Come off the jet fake full speed, climb to 18 yards behind the hook defenders, and flatten across the field.",
        RB: "Sell the outside zone run fake to the left edge, then step up inside to seal any delayed A/B-gap linebacker blitz.",
        OL: "Full-zone aggressive run-action step left for 0.6s to pull the linebackers up, then hinge back into a max-protect 7-man cup.",
        DL: "DEs: Do not get washed inside by the zone fake—keep outside contain on the bootleg threat. DTs: Fight across the blocker's face into the playside A/B gaps.",
        LB: "Read your keys! Do not bite hard on the run fake—get depth to your hook/curl landmarks to wall the deep crossing route.",
        DB: "FS: Sprint to the deep middle third landmark at the snap. SS: Buzz down under control to rob the shallow cross while staying aware of the deep over behind you.",
      },
      players: [
        // OFFENSE (11)
        {
          id: "LT", side: "O", posGroup: "OL", readOrder: null, routeLabel: "PA Zone Hinge",
          keyframes: [{ t: 0, x: 40, y: 36.5 }, { t: 1.6, x: 40, y: 36.5 }, { t: 2.3, x: 37, y: 36 }, { t: 4.8, x: 37, y: 39 }],
        },
        {
          id: "LG", side: "O", posGroup: "OL", readOrder: null, routeLabel: "PA Zone Hinge",
          keyframes: [{ t: 0, x: 45, y: 36.5 }, { t: 1.6, x: 45, y: 36.5 }, { t: 2.3, x: 43, y: 36 }, { t: 4.8, x: 43, y: 38.5 }],
        },
        {
          id: "C", side: "O", posGroup: "OL", readOrder: null, routeLabel: "PA Center Set",
          keyframes: [{ t: 0, x: 50, y: 36.5 }, { t: 1.6, x: 50, y: 36.5 }, { t: 2.3, x: 49, y: 36 }, { t: 4.8, x: 50, y: 38 }],
        },
        {
          id: "RG", side: "O", posGroup: "OL", readOrder: null, routeLabel: "PA Zone Hinge",
          keyframes: [{ t: 0, x: 55, y: 36.5 }, { t: 1.6, x: 55, y: 36.5 }, { t: 2.3, x: 54, y: 36 }, { t: 4.8, x: 55, y: 38.5 }],
        },
        {
          id: "RT", side: "O", posGroup: "OL", readOrder: null, routeLabel: "Backside Edge Seal",
          keyframes: [{ t: 0, x: 60, y: 36.5 }, { t: 1.6, x: 60, y: 36.5 }, { t: 2.3, x: 60, y: 37.5 }, { t: 4.8, x: 61, y: 40 }],
        },
        {
          id: "TE1", side: "O", posGroup: "WR", readOrder: null, routeLabel: "Max Protect Edge",
          keyframes: [{ t: 0, x: 65, y: 36.5 }, { t: 1.6, x: 65, y: 36.5 }, { t: 2.5, x: 64, y: 38 }, { t: 4.8, x: 65, y: 40.5 }],
        },
        {
          id: "TE2", side: "O", posGroup: "WR", readOrder: 3, routeLabel: "Leak Flat [3]",
          keyframes: [{ t: 0, x: 35, y: 37.5 }, { t: 1.6, x: 35, y: 37.5 }, { t: 2.6, x: 32, y: 35 }, { t: 3.8, x: 20, y: 31 }, { t: 4.8, x: 14, y: 29 }],
        },
        {
          id: "QB", side: "O", posGroup: "QB", readOrder: null, routeLabel: "PA Boot Set",
          keyframes: [{ t: 0, x: 50, y: 38.5 }, { t: 1.6, x: 50, y: 38.5 }, { t: 2.4, x: 47, y: 43 }, { t: 3.2, x: 52, y: 44.5 }, { t: 4.8, x: 53, y: 45 }],
        },
        {
          id: "RB", side: "O", posGroup: "RB", readOrder: null, routeLabel: "Run Fake + Check",
          keyframes: [{ t: 0, x: 50, y: 44 }, { t: 1.6, x: 50, y: 44 }, { t: 2.3, x: 42, y: 40 }, { t: 3.1, x: 45, y: 39.5 }, { t: 4.8, x: 46, y: 40 }],
        },
        {
          id: "X", side: "O", posGroup: "WR", readOrder: 1, routeLabel: "Deep Post [1]",
          keyframes: [{ t: 0, x: 15, y: 36.5 }, { t: 1.6, x: 15, y: 36.5 }, { t: 2.8, x: 16, y: 21 }, { t: 3.8, x: 33, y: 12 }, { t: 4.8, x: 46, y: 7 }],
        },
        {
          id: "Z", side: "O", posGroup: "WR", readOrder: 2, routeLabel: "Jet Deep Over [2]",
          keyframes: [{ t: 0, x: 24, y: 38.5 }, { t: 1.6, x: 74, y: 38.5 }, { t: 2.7, x: 76, y: 24 }, { t: 3.8, x: 56, y: 17 }, { t: 4.8, x: 38, y: 15 }],
        },
  
        // DEFENSE (11) - Shows 2-High pre-snap, rotates to Cover 3 Buzz post-snap
        {
          id: "DE1", side: "D", posGroup: "DL", readOrder: null, routeLabel: "Contain Rush",
          keyframes: [{ t: 0, x: 34, y: 33.5 }, { t: 1.6, x: 34, y: 33.5 }, { t: 2.6, x: 36, y: 36.5 }, { t: 4.8, x: 44, y: 42 }],
        },
        {
          id: "DT1", side: "D", posGroup: "DL", readOrder: null, routeLabel: "A-Gap Rush",
          keyframes: [{ t: 0, x: 46, y: 33.5 }, { t: 1.6, x: 46, y: 33.5 }, { t: 2.6, x: 45, y: 36 }, { t: 4.8, x: 48, y: 40 }],
        },
        {
          id: "DT2", side: "D", posGroup: "DL", readOrder: null, routeLabel: "3-Tech Rush",
          keyframes: [{ t: 0, x: 56, y: 33.5 }, { t: 1.6, x: 56, y: 33.5 }, { t: 2.6, x: 55, y: 36.5 }, { t: 4.8, x: 54, y: 41 }],
        },
        {
          id: "DE2", side: "D", posGroup: "DL", readOrder: null, routeLabel: "Edge Rush",
          keyframes: [{ t: 0, x: 66, y: 33.5 }, { t: 1.6, x: 66, y: 33.5 }, { t: 2.6, x: 63, y: 37.5 }, { t: 4.8, x: 57, y: 43 }],
        },
        {
          id: "W", side: "D", posGroup: "LB", readOrder: null, routeLabel: "PA Bite -> Curl",
          keyframes: [{ t: 0, x: 41, y: 28 }, { t: 1.6, x: 42, y: 28 }, { t: 2.3, x: 40, y: 31 }, { t: 3.6, x: 35, y: 26 }, { t: 4.8, x: 30, y: 25 }],
        },
        {
          id: "M", side: "D", posGroup: "LB", readOrder: null, routeLabel: "PA Bite -> Hook",
          keyframes: [{ t: 0, x: 53, y: 28 }, { t: 1.6, x: 55, y: 28 }, { t: 2.3, x: 51, y: 31.5 }, { t: 3.6, x: 53, y: 26 }, { t: 4.8, x: 52, y: 24 }],
        },
        {
          id: "S", side: "D", posGroup: "LB", readOrder: null, routeLabel: "Seam / Flat",
          keyframes: [{ t: 0, x: 68, y: 28 }, { t: 1.6, x: 73, y: 28 }, { t: 2.8, x: 77, y: 25 }, { t: 4.8, x: 80, y: 24 }],
        },
        {
          id: "CB1", side: "D", posGroup: "DB", readOrder: null, routeLabel: "Deep Left 1/3",
          keyframes: [{ t: 0, x: 15, y: 26 }, { t: 1.6, x: 15, y: 26 }, { t: 3.0, x: 17, y: 15 }, { t: 4.8, x: 22, y: 9 }],
        },
        {
          id: "CB2", side: "D", posGroup: "DB", readOrder: null, routeLabel: "Deep Right 1/3",
          keyframes: [{ t: 0, x: 85, y: 26 }, { t: 1.6, x: 85, y: 26 }, { t: 3.0, x: 83, y: 15 }, { t: 4.8, x: 80, y: 10 }],
        },
        {
          id: "FS", side: "D", posGroup: "DB", readOrder: null, routeLabel: "2-High -> Deep Mid 1/3",
          keyframes: [{ t: 0, x: 36, y: 19 }, { t: 1.6, x: 38, y: 19 }, { t: 2.8, x: 47, y: 12 }, { t: 4.8, x: 49, y: 7 }],
        },
        {
          id: "SS", side: "D", posGroup: "DB", readOrder: null, routeLabel: "2-High -> Buzz Robber",
          keyframes: [{ t: 0, x: 64, y: 19 }, { t: 1.6, x: 63, y: 20 }, { t: 2.7, x: 60, y: 25 }, { t: 4.8, x: 56, y: 23 }],
        },
      ],
    },
  
    {
      id: "nfl-bunch-mesh-robber",
      title: "Bunch Mesh Wheel vs. Cover 1 Robber",
      personnel: "11 Personnel (1 RB, 1 TE, 3 WR)",
      formation: "Gun Trips Bunch Right",
      preSnapShell: "1-High Single Safety (Man Press)",
      postSnapCoverage: "Cover 1 Robber (SS Lurks Shallow Cross)",
      disguiseNote:
        "Cover 1 Man across the board, but SS creeps down at 8 yards to 'rob' the shallow mesh crossers—leaving the RB Wheel up the sideline 1-on-1 against a trailing LB.",
      motionNote:
        "RB shifts wide then motions back into the backfield; the Weak LB steps out with him, confirming Man-to-Man coverage.",
      snapTime: 1.4,
      maxTime: 4.6,
      pocketTime: 2.9,
      nflBenchmark: { epa: "+0.28", successRate: "58%", avgAirYards: "9.4 yds" },
      coachNotes: {
        QB: "1) Pre-snap motion confirms Man coverage. 2) Post-snap, look at the Mesh crossers [1]/[2] first—if the Robber safety (SS) jumps the shallow cross, immediately layer the ball up the left sideline to the RB Wheel [3]!",
        WR: "X & Y (Mesh): Set the rub at 5 yards—Y runs under X so man defenders collide. Z (Corner): Clear out the outside CB deep right to create room underneath.",
        RB: "Sell the flat flare for 1.0s to get the Mike LB running horizontally, then plant and wheel vertically up the left sideline.",
        OL: "5-man big-on-big pass protection; Center sets the ID on the Mike LB.",
        DL: "Win 1-on-1 rush lanes with inside/outside counters—no zone eyes in the backfield.",
        LB: "M: You are locked man-to-man on the RB—do not bite on the flat fake and let him wheel past your outside shoulder!",
        DB: "SS (Robber): Squat at 7–8 yards in the low hole and jump the first shallow crosser entering your vision.",
      },
      players: [
        // OFFENSE
        {
          id: "LT", side: "O", posGroup: "OL", readOrder: null, routeLabel: "Pass Pro",
          keyframes: [{ t: 0, x: 40, y: 36.5 }, { t: 1.4, x: 40, y: 36.5 }, { t: 4.6, x: 38.5, y: 40 }],
        },
        {
          id: "LG", side: "O", posGroup: "OL", readOrder: null, routeLabel: "Pass Pro",
          keyframes: [{ t: 0, x: 45, y: 36.5 }, { t: 1.4, x: 45, y: 36.5 }, { t: 4.6, x: 44.5, y: 39.5 }],
        },
        {
          id: "C", side: "O", posGroup: "OL", readOrder: null, routeLabel: "Pass Pro",
          keyframes: [{ t: 0, x: 50, y: 36.5 }, { t: 1.4, x: 50, y: 36.5 }, { t: 4.6, x: 50, y: 39 }],
        },
        {
          id: "RG", side: "O", posGroup: "OL", readOrder: null, routeLabel: "Pass Pro",
          keyframes: [{ t: 0, x: 55, y: 36.5 }, { t: 1.4, x: 55, y: 36.5 }, { t: 4.6, x: 55.5, y: 39.5 }],
        },
        {
          id: "RT", side: "O", posGroup: "OL", readOrder: null, routeLabel: "Pass Pro",
          keyframes: [{ t: 0, x: 60, y: 36.5 }, { t: 1.4, x: 60, y: 36.5 }, { t: 4.6, x: 61.5, y: 40 }],
        },
        {
          id: "QB", side: "O", posGroup: "QB", readOrder: null, routeLabel: "Gun 3-Step Drop",
          keyframes: [{ t: 0, x: 50, y: 43 }, { t: 1.4, x: 50, y: 43 }, { t: 2.3, x: 50, y: 46.5 }, { t: 4.6, x: 50, y: 46.5 }],
        },
        {
          id: "RB", side: "O", posGroup: "RB", readOrder: 3, routeLabel: "Motion -> Sideline Wheel [3]",
          keyframes: [{ t: 0, x: 34, y: 42 }, { t: 1.4, x: 44, y: 43 }, { t: 2.4, x: 24, y: 36 }, { t: 3.5, x: 16, y: 24 }, { t: 4.6, x: 15, y: 12 }],
        },
        {
          id: "X", side: "O", posGroup: "WR", readOrder: 1, routeLabel: "Mesh Over [1]",
          keyframes: [{ t: 0, x: 14, y: 36.5 }, { t: 1.4, x: 14, y: 36.5 }, { t: 2.3, x: 16, y: 30 }, { t: 3.4, x: 48, y: 29.5 }, { t: 4.6, x: 74, y: 28 }],
        },
        {
          id: "Y", side: "O", posGroup: "WR", readOrder: 2, routeLabel: "Mesh Under [2]",
          keyframes: [{ t: 0, x: 70, y: 36.5 }, { t: 1.4, x: 70, y: 36.5 }, { t: 2.3, x: 66, y: 31 }, { t: 3.4, x: 46, y: 31 }, { t: 4.6, x: 24, y: 29 }],
        },
        {
          id: "H", side: "O", posGroup: "WR", readOrder: 4, routeLabel: "Bunch Sit / Pivot [4]",
          keyframes: [{ t: 0, x: 75, y: 38.5 }, { t: 1.4, x: 75, y: 38.5 }, { t: 2.5, x: 68, y: 26 }, { t: 3.5, x: 74, y: 25 }, { t: 4.6, x: 77, y: 25 }],
        },
        {
          id: "Z", side: "O", posGroup: "WR", readOrder: null, routeLabel: "Bunch Corner Clear",
          keyframes: [{ t: 0, x: 80, y: 37.5 }, { t: 1.4, x: 80, y: 37.5 }, { t: 2.8, x: 82, y: 23 }, { t: 4.6, x: 91, y: 12 }],
        },
  
        // DEFENSE (Cover 1 Robber)
        {
          id: "DE1", side: "D", posGroup: "DL", readOrder: null, routeLabel: "Speed Rush",
          keyframes: [{ t: 0, x: 37, y: 33.5 }, { t: 1.4, x: 37, y: 33.5 }, { t: 4.6, x: 43, y: 44 }],
        },
        {
          id: "DT1", side: "D", posGroup: "DL", readOrder: null, routeLabel: "Bull Rush",
          keyframes: [{ t: 0, x: 46, y: 33.5 }, { t: 1.4, x: 46, y: 33.5 }, { t: 4.6, x: 47, y: 41 }],
        },
        {
          id: "DT2", side: "D", posGroup: "DL", readOrder: null, routeLabel: "3-Tech Rush",
          keyframes: [{ t: 0, x: 56, y: 33.5 }, { t: 1.4, x: 56, y: 33.5 }, { t: 4.6, x: 55, y: 41 }],
        },
        {
          id: "DE2", side: "D", posGroup: "DL", readOrder: null, routeLabel: "Edge Rush",
          keyframes: [{ t: 0, x: 63, y: 33.5 }, { t: 1.4, x: 63, y: 33.5 }, { t: 4.6, x: 57, y: 44 }],
        },
        {
          id: "M", side: "D", posGroup: "LB", readOrder: null, routeLabel: "Man on RB (Trails Wheel)",
          keyframes: [{ t: 0, x: 39, y: 28 }, { t: 1.4, x: 44, y: 28 }, { t: 2.5, x: 31, y: 31 }, { t: 3.6, x: 23, y: 23 }, { t: 4.6, x: 21, y: 15 }],
        },
        {
          id: "W", side: "D", posGroup: "LB", readOrder: null, routeLabel: "Spy / Rush",
          keyframes: [{ t: 0, x: 54, y: 28 }, { t: 1.4, x: 54, y: 28 }, { t: 2.8, x: 52, y: 31 }, { t: 4.6, x: 51, y: 36 }],
        },
        {
          id: "CB1", side: "D", posGroup: "DB", readOrder: null, routeLabel: "Press Man on X",
          keyframes: [{ t: 0, x: 14, y: 33 }, { t: 1.4, x: 14, y: 33 }, { t: 2.4, x: 18, y: 28 }, { t: 3.5, x: 45, y: 28 }, { t: 4.6, x: 69, y: 27 }],
        },
        {
          id: "NB", side: "D", posGroup: "DB", readOrder: null, routeLabel: "Man on Y (Caught in Rub)",
          keyframes: [{ t: 0, x: 69, y: 32 }, { t: 1.4, x: 69, y: 32 }, { t: 2.5, x: 65, y: 28 }, { t: 3.6, x: 52, y: 29 }, { t: 4.6, x: 33, y: 28 }],
        },
        {
          id: "S", side: "D", posGroup: "DB", readOrder: null, routeLabel: "Man on H",
          keyframes: [{ t: 0, x: 75, y: 27 }, { t: 1.4, x: 75, y: 27 }, { t: 2.6, x: 69, y: 23 }, { t: 4.6, x: 76, y: 22 }],
        },
        {
          id: "CB2", side: "D", posGroup: "DB", readOrder: null, routeLabel: "Man on Z",
          keyframes: [{ t: 0, x: 82, y: 32 }, { t: 1.4, x: 82, y: 32 }, { t: 2.8, x: 83, y: 21 }, { t: 4.6, x: 90, y: 11 }],
        },
        {
          id: "SS", side: "D", posGroup: "DB", readOrder: null, routeLabel: "Robber (Jumps Mesh)",
          keyframes: [{ t: 0, x: 58, y: 22 }, { t: 1.4, x: 58, y: 23 }, { t: 2.8, x: 50, y: 26 }, { t: 4.6, x: 44, y: 28 }],
        },
        {
          id: "FS", side: "D", posGroup: "DB", readOrder: null, routeLabel: "Deep Middle 1/1",
          keyframes: [{ t: 0, x: 50, y: 13 }, { t: 1.4, x: 50, y: 13 }, { t: 4.6, x: 52, y: 9 }],
        },
      ],
    },
  
    {
      id: "nfl-rpo-glance-boxdrop",
      title: "Inside Zone Glance RPO (Safety Drop)",
      personnel: "11 Personnel (1 RB, 1 TE, 3 WR)",
      formation: "Gun 2x2 Spread",
      preSnapShell: "2-High Light Box (6 Defenders)",
      postSnapCoverage: "Cover 1 / 3 Safety Drop (7th Defender in Box)",
      disguiseNote:
        "Pre-snap shows a light 6-man box so the run looks wide open. Right before/at the snap, the Strong Safety drops down into the box—leaving the X receiver 1-on-1 on the Glance Slant.",
      motionNote:
        "No motion—this is a pure post-snap conflict read on the Strong Safety (SS).",
      snapTime: 0.8,
      maxTime: 3.6,
      pocketTime: 2.4,
      nflBenchmark: { epa: "+0.25", successRate: "57%", avgAirYards: "6.2 yds" },
      coachNotes: {
        QB: "Mesh with the RB and stare straight at the Strong Safety (SS). If SS stays deep, hand the ball off [RB]. Because SS crashes into the box, pull the ball and fire the Glance Slant [1] into the void he just left!",
        WR: "X (Glance): Push 5 yards vertical to freeze the CB's hips, then break sharply inside behind the vacated safety lane. Z: Run off the boundary CB.",
        RB: "Aim for the Center's playside hip—if the QB keeps it to throw the RPO, carry out your fake through the line to hold the linebackers.",
        OL: "Run block Inside Zone aggressively! Do NOT climb more than 3 yards downfield before the ball is thrown or you'll draw an Illegal Man Downfield penalty.",
        DL: "Squeeze the double-team blocks and hold your gap against Inside Zone.",
        LB: "Trigger downhill on the Inside Zone mesh—watch for the quick glance slant behind your ears.",
        DB: "SS: If you trigger down into the run fit, you are leaving your CB 1-on-1 with zero inside help on the Glance route.",
      },
      players: [
        // OFFENSE
        {
          id: "LT", side: "O", posGroup: "OL", readOrder: null, routeLabel: "Inside Zone Left",
          keyframes: [{ t: 0, x: 40, y: 36.5 }, { t: 0.8, x: 40, y: 36.5 }, { t: 3.6, x: 37, y: 33.5 }],
        },
        {
          id: "LG", side: "O", posGroup: "OL", readOrder: null, routeLabel: "Zone Combo",
          keyframes: [{ t: 0, x: 45, y: 36.5 }, { t: 0.8, x: 45, y: 36.5 }, { t: 3.6, x: 43, y: 33 }],
        },
        {
          id: "C", side: "O", posGroup: "OL", readOrder: null, routeLabel: "Zone Combo",
          keyframes: [{ t: 0, x: 50, y: 36.5 }, { t: 0.8, x: 50, y: 36.5 }, { t: 3.6, x: 48, y: 33 }],
        },
        {
          id: "RG", side: "O", posGroup: "OL", readOrder: null, routeLabel: "Zone Scoop",
          keyframes: [{ t: 0, x: 55, y: 36.5 }, { t: 0.8, x: 55, y: 36.5 }, { t: 3.6, x: 53, y: 33.5 }],
        },
        {
          id: "RT", side: "O", posGroup: "OL", readOrder: null, routeLabel: "Backside Cutoff",
          keyframes: [{ t: 0, x: 60, y: 36.5 }, { t: 0.8, x: 60, y: 36.5 }, { t: 3.6, x: 58, y: 34 }],
        },
        {
          id: "QB", side: "O", posGroup: "QB", readOrder: null, routeLabel: "RPO Mesh Read",
          keyframes: [{ t: 0, x: 50, y: 42.5 }, { t: 0.8, x: 50, y: 42.5 }, { t: 1.8, x: 48, y: 43 }, { t: 3.6, x: 47, y: 43.5 }],
        },
        {
          id: "RB", side: "O", posGroup: "RB", readOrder: 3, routeLabel: "Inside Zone Carry [3]",
          keyframes: [{ t: 0, x: 56, y: 42.5 }, { t: 0.8, x: 56, y: 42.5 }, { t: 1.8, x: 48, y: 41 }, { t: 3.6, x: 44, y: 31 }],
        },
        {
          id: "X", side: "O", posGroup: "WR", readOrder: 1, routeLabel: "Glance Slant [1]",
          keyframes: [{ t: 0, x: 14, y: 36.5 }, { t: 0.8, x: 14, y: 36.5 }, { t: 1.7, x: 15, y: 29 }, { t: 2.7, x: 28, y: 25 }, { t: 3.6, x: 38, y: 23 }],
        },
        {
          id: "H", side: "O", posGroup: "WR", readOrder: 2, routeLabel: "Bubble Screen [2]",
          keyframes: [{ t: 0, x: 28, y: 38.5 }, { t: 0.8, x: 28, y: 38.5 }, { t: 2.0, x: 19, y: 38 }, { t: 3.6, x: 12, y: 35 }],
        },
        {
          id: "Y", side: "O", posGroup: "WR", readOrder: null, routeLabel: "Seam Stalk",
          keyframes: [{ t: 0, x: 72, y: 38.5 }, { t: 0.8, x: 72, y: 38.5 }, { t: 3.6, x: 70, y: 22 }],
        },
        {
          id: "Z", side: "O", posGroup: "WR", readOrder: null, routeLabel: "Go / Stalk",
          keyframes: [{ t: 0, x: 86, y: 36.5 }, { t: 0.8, x: 86, y: 36.5 }, { t: 3.6, x: 86, y: 18 }],
        },
  
        // DEFENSE (SS drops into the box)
        {
          id: "DE1", side: "D", posGroup: "DL", readOrder: null, routeLabel: "C-Gap Squeeze",
          keyframes: [{ t: 0, x: 38, y: 33.5 }, { t: 0.8, x: 38, y: 33.5 }, { t: 3.6, x: 39, y: 35 }],
        },
        {
          id: "DT1", side: "D", posGroup: "DL", readOrder: null, routeLabel: "A-Gap Hold",
          keyframes: [{ t: 0, x: 47, y: 33.5 }, { t: 0.8, x: 47, y: 33.5 }, { t: 3.6, x: 46, y: 34.5 }],
        },
        {
          id: "DT2", side: "D", posGroup: "DL", readOrder: null, routeLabel: "B-Gap Hold",
          keyframes: [{ t: 0, x: 56, y: 33.5 }, { t: 0.8, x: 56, y: 33.5 }, { t: 3.6, x: 55, y: 34.5 }],
        },
        {
          id: "DE2", side: "D", posGroup: "DL", readOrder: null, routeLabel: "Read QB",
          keyframes: [{ t: 0, x: 63, y: 33.5 }, { t: 0.8, x: 63, y: 33.5 }, { t: 3.6, x: 61, y: 36 }],
        },
        {
          id: "W", side: "D", posGroup: "LB", readOrder: null, routeLabel: "Run Fit B-Gap",
          keyframes: [{ t: 0, x: 43, y: 27 }, { t: 0.8, x: 43, y: 27 }, { t: 2.2, x: 42, y: 31 }, { t: 3.6, x: 43, y: 33 }],
        },
        {
          id: "M", side: "D", posGroup: "LB", readOrder: null, routeLabel: "Run Fit A-Gap",
          keyframes: [{ t: 0, x: 56, y: 27 }, { t: 0.8, x: 56, y: 27 }, { t: 2.2, x: 52, y: 31 }, { t: 3.6, x: 49, y: 32.5 }],
        },
        {
          id: "CB1", side: "D", posGroup: "DB", readOrder: null, routeLabel: "Off Man on X",
          keyframes: [{ t: 0, x: 14, y: 27 }, { t: 0.8, x: 14, y: 27 }, { t: 2.0, x: 14, y: 24 }, { t: 3.6, x: 24, y: 23 }],
        },
        {
          id: "NB", side: "D", posGroup: "DB", readOrder: null, routeLabel: "Apex on H",
          keyframes: [{ t: 0, x: 29, y: 29 }, { t: 0.8, x: 29, y: 29 }, { t: 2.2, x: 22, y: 32 }, { t: 3.6, x: 15, y: 34 }],
        },
        {
          id: "CB2", side: "D", posGroup: "DB", readOrder: null, routeLabel: "Deep 1/3",
          keyframes: [{ t: 0, x: 86, y: 26 }, { t: 0.8, x: 86, y: 26 }, { t: 3.6, x: 86, y: 16 }],
        },
        {
          id: "SS", side: "D", posGroup: "DB", readOrder: null, routeLabel: "Drops into Box!",
          keyframes: [{ t: 0, x: 36, y: 20 }, { t: 0.8, x: 37, y: 23 }, { t: 2.2, x: 39, y: 29 }, { t: 3.6, x: 41, y: 32 }],
        },
        {
          id: "FS", side: "D", posGroup: "DB", readOrder: null, routeLabel: "Rotates Deep Mid",
          keyframes: [{ t: 0, x: 64, y: 18 }, { t: 0.8, x: 60, y: 17 }, { t: 3.6, x: 52, y: 12 }],
        },
      ],
    },
  
    {
      id: "nfl-trips-orbit-flood",
      title: "Trips Orbit Motion Flood vs. Cover 6",
      personnel: "11 Personnel (1 RB, 1 TE, 3 WR)",
      formation: "Gun Trips Right Orbit",
      preSnapShell: "2-High Quarters Shell",
      postSnapCoverage: "Cover 6 (Quarters Left / Cover 2 Right)",
      disguiseNote:
        "Orbit motion to the right forces the defense to check to Cover 2 on the trips side (CB squats in the flat, SS takes the deep half)—creating a classic Smash/Flood honey-hole behind the squat corner.",
      motionNote:
        "RB orbits out of the backfield toward the right flat at the snap, widening the flat defender.",
      snapTime: 1.2,
      maxTime: 4.5,
      pocketTime: 3.0,
      nflBenchmark: { epa: "+0.22", successRate: "55%", avgAirYards: "12.1 yds" },
      coachNotes: {
        QB: "Read Top-to-Bottom on the right sideline: 1) Deep Clearout [Z]—if CB squats at 5 yards, throw the Deep Corner [1] into the sideline honey hole before the SS gets over. 2) If SS gets over the top, dump to the RB Orbit Flat [2].",
        WR: "Z: Push vertical on the outside stem to pin the deep safety. Y: Stem inside to sell seam, then break to the corner at 12 yards into the sideline void. H: Sit in the curl window at 10 yards.",
        RB: "Orbit full speed to the right flat—get your head around quickly in case the cornerback sinks under the corner route.",
        OL: "Slide protection left toward the 3-tech DT; right tackle fans out to kick-set the wide 9-technique DE.",
        DL: "DE2: Don't get baited by the orbit motion—keep rush integrity upfield.",
        LB: "S: Push wide with the orbit motion to take away the quick swing pass while keeping eyes on #2's corner stem.",
        DB: "CB2 (Cover 2 side): Jam Z, sink to 12 yards to squeeze the corner route, and rally up to the orbit flat.",
      },
      players: [
        // OFFENSE
        {
          id: "LT", side: "O", posGroup: "OL", readOrder: null, routeLabel: "Slide Left",
          keyframes: [{ t: 0, x: 40, y: 36.5 }, { t: 1.2, x: 40, y: 36.5 }, { t: 4.5, x: 38, y: 39.5 }],
        },
        {
          id: "LG", side: "O", posGroup: "OL", readOrder: null, routeLabel: "Slide Left",
          keyframes: [{ t: 0, x: 45, y: 36.5 }, { t: 1.2, x: 45, y: 36.5 }, { t: 4.5, x: 43.5, y: 39.5 }],
        },
        {
          id: "C", side: "O", posGroup: "OL", readOrder: null, routeLabel: "Slide Left",
          keyframes: [{ t: 0, x: 50, y: 36.5 }, { t: 1.2, x: 50, y: 36.5 }, { t: 4.5, x: 49, y: 39 }],
        },
        {
          id: "RG", side: "O", posGroup: "OL", readOrder: null, routeLabel: "Man Right",
          keyframes: [{ t: 0, x: 55, y: 36.5 }, { t: 1.2, x: 55, y: 36.5 }, { t: 4.5, x: 55.5, y: 39.5 }],
        },
        {
          id: "RT", side: "O", posGroup: "OL", readOrder: null, routeLabel: "Kick Set 9-Tech",
          keyframes: [{ t: 0, x: 60, y: 36.5 }, { t: 1.2, x: 60, y: 36.5 }, { t: 4.5, x: 62.5, y: 40.5 }],
        },
        {
          id: "QB", side: "O", posGroup: "QB", readOrder: null, routeLabel: "5-Step Gun Drop",
          keyframes: [{ t: 0, x: 50, y: 43 }, { t: 1.2, x: 50, y: 43 }, { t: 2.3, x: 51, y: 47 }, { t: 4.5, x: 52, y: 47 }],
        },
        {
          id: "RB", side: "O", posGroup: "RB", readOrder: 2, routeLabel: "Orbit Flat [2]",
          keyframes: [{ t: 0, x: 44, y: 43 }, { t: 1.2, x: 56, y: 43 }, { t: 2.5, x: 76, y: 36 }, { t: 4.5, x: 89, y: 31 }],
        },
        {
          id: "X", side: "O", posGroup: "WR", readOrder: null, routeLabel: "Backside Dig",
          keyframes: [{ t: 0, x: 14, y: 36.5 }, { t: 1.2, x: 14, y: 36.5 }, { t: 2.8, x: 15, y: 22 }, { t: 4.5, x: 38, y: 21 }],
        },
        {
          id: "Y", side: "O", posGroup: "WR", readOrder: 1, routeLabel: "Honey-Hole Corner [1]",
          keyframes: [{ t: 0, x: 68, y: 37.5 }, { t: 1.2, x: 68, y: 37.5 }, { t: 2.5, x: 70, y: 24 }, { t: 3.6, x: 82, y: 18 }, { t: 4.5, x: 90, y: 14 }],
        },
        {
          id: "H", side: "O", posGroup: "WR", readOrder: 3, routeLabel: "Curl Sit [3]",
          keyframes: [{ t: 0, x: 77, y: 38.5 }, { t: 1.2, x: 77, y: 38.5 }, { t: 2.8, x: 76, y: 24 }, { t: 4.5, x: 74, y: 25 }],
        },
        {
          id: "Z", side: "O", posGroup: "WR", readOrder: null, routeLabel: "Clearout Go",
          keyframes: [{ t: 0, x: 87, y: 36.5 }, { t: 1.2, x: 87, y: 36.5 }, { t: 3.0, x: 86, y: 18 }, { t: 4.5, x: 82, y: 7 }],
        },
  
        // DEFENSE (Cover 6)
        {
          id: "DE1", side: "D", posGroup: "DL", readOrder: null, routeLabel: "Edge Rush",
          keyframes: [{ t: 0, x: 37, y: 33.5 }, { t: 1.2, x: 37, y: 33.5 }, { t: 4.5, x: 43, y: 44 }],
        },
        {
          id: "DT1", side: "D", posGroup: "DL", readOrder: null, routeLabel: "3-Tech Rush",
          keyframes: [{ t: 0, x: 44, y: 33.5 }, { t: 1.2, x: 44, y: 33.5 }, { t: 4.5, x: 46, y: 41 }],
        },
        {
          id: "DT2", side: "D", posGroup: "DL", readOrder: null, routeLabel: "1-Tech Rush",
          keyframes: [{ t: 0, x: 54, y: 33.5 }, { t: 1.2, x: 54, y: 33.5 }, { t: 4.5, x: 54, y: 40.5 }],
        },
        {
          id: "DE2", side: "D", posGroup: "DL", readOrder: null, routeLabel: "Wide-9 Rush",
          keyframes: [{ t: 0, x: 64, y: 33.5 }, { t: 1.2, x: 64, y: 33.5 }, { t: 4.5, x: 59, y: 44.5 }],
        },
        {
          id: "W", side: "D", posGroup: "LB", readOrder: null, routeLabel: "Hook / Dig",
          keyframes: [{ t: 0, x: 42, y: 27 }, { t: 1.2, x: 42, y: 27 }, { t: 4.5, x: 39, y: 22 }],
        },
        {
          id: "M", side: "D", posGroup: "LB", readOrder: null, routeLabel: "Mid Hook",
          keyframes: [{ t: 0, x: 55, y: 27 }, { t: 1.2, x: 55, y: 27 }, { t: 4.5, x: 62, y: 24 }],
        },
        {
          id: "S", side: "D", posGroup: "DB", readOrder: null, routeLabel: "Apex / Curl-Flat",
          keyframes: [{ t: 0, x: 72, y: 28 }, { t: 1.2, x: 73, y: 28 }, { t: 3.0, x: 76, y: 25 }, { t: 4.5, x: 78, y: 26 }],
        },
        {
          id: "CB1", side: "D", posGroup: "DB", readOrder: null, routeLabel: "Quarters 1/4",
          keyframes: [{ t: 0, x: 14, y: 26 }, { t: 1.2, x: 14, y: 26 }, { t: 4.5, x: 16, y: 13 }],
        },
        {
          id: "CB2", side: "D", posGroup: "DB", readOrder: null, routeLabel: "Cover 2 Squat Flat",
          keyframes: [{ t: 0, x: 87, y: 30 }, { t: 1.2, x: 87, y: 30 }, { t: 2.8, x: 88, y: 26 }, { t: 4.5, x: 89, y: 28 }],
        },
        {
          id: "FS", side: "D", posGroup: "DB", readOrder: null, routeLabel: "Quarters Safety",
          keyframes: [{ t: 0, x: 35, y: 17 }, { t: 1.2, x: 35, y: 17 }, { t: 4.5, x: 33, y: 12 }],
        },
        {
          id: "SS", side: "D", posGroup: "DB", readOrder: null, routeLabel: "Deep Half (Covers Go)",
          keyframes: [{ t: 0, x: 68, y: 17 }, { t: 1.2, x: 69, y: 17 }, { t: 3.0, x: 74, y: 11 }, { t: 4.5, x: 78, y: 8 }],
        },
      ],
    },
  ];