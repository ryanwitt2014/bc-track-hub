/* BC Track Hub · Sprints, Hurdles & Jumps program (2026–27 winter foundation)
   Loaded after index.html's main script. Uses its globals: views, SECTIONS, ATHLETES, CATEGORIES, esc, render, canPost,
   publishFiles, saving, parseD, iso, today, back.
   Data: the 12-week plan, drills, pathways and strength below are structured records (not free text).
   Group assignments live in Supabase hub_data key "sgroups": {athleteId: {p:"S1"|"S2"|"S3"|"H"|"J"|"MD", s:["H","J"], s3:"mid"|"sprint"}}.
   Spring (March–State) workouts are NOT written yet: add weeks to SP_WEEKS (same shape) when they're ready. */
(function(){
"use strict";

/* ---------- styles ---------- */
const css = `
.sp-grp{display:inline-block;font:700 11px var(--body);letter-spacing:.03em;border-radius:3px;padding:1px 6px;margin-right:4px;white-space:nowrap;background:var(--chip);color:var(--fg)}
.sp-grp.S1{background:#1e4d2f;color:#fff}.sp-grp.S2{background:#2f6f45;color:#fff}.sp-grp.S3{background:#6b4fa3;color:#fff}.sp-grp.H{background:#b4472b;color:#fff}.sp-grp.J{background:#2f4f8f;color:#fff}.sp-grp.MD{background:transparent;border:1px solid var(--line);color:var(--muted)}
.sp-rows{width:100%;border-collapse:collapse;font-size:14px}
.sp-rows td{padding:6px 8px;border-top:1px solid var(--line);vertical-align:top}
.sp-rows tr:first-child td{border-top:0}
.sp-rows td.rx{font-family:var(--mono);white-space:nowrap}
.sp-rows td.rest{font-size:13px;color:var(--muted);white-space:nowrap}
.sp-rows .nm{font-weight:600}.sp-rows .nm a{color:var(--fg)}
.sp-rows .sub{display:block;font-size:12.5px;color:var(--muted);font-weight:400;margin-top:2px}
.sp-int{display:inline-block;font-size:11px;font-weight:700;border-radius:3px;padding:0 5px;margin-left:4px;background:var(--gold-soft);border:1px solid var(--gold);white-space:nowrap}
.sp-int.max{background:#b4472b;border-color:#b4472b;color:#fff}.sp-int.tech{background:transparent;border-color:var(--line);color:var(--muted)}
.sp-cut{display:block;font-size:12px;color:#b4472b;margin-top:2px}
.sp-tech{background:var(--chip);border-radius:5px;padding:8px 10px;margin:6px 0 0}
.sp-tech summary{cursor:pointer}.sp-tech summary h4{display:inline}
.sp-tech h4{margin:0 0 4px;font-size:13px;letter-spacing:.04em;text-transform:uppercase}
.sp-tech ul{margin:0;padding-left:18px}
.sp-sess{display:grid;gap:8px}
.sp-head{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:baseline}
.sp-head .t{font:600 20px var(--display);text-transform:uppercase}
.sp-head .d{font:13px var(--mono);color:var(--muted)}
.sp-banner{border-left:4px solid var(--gold);background:var(--gold-soft);border-radius:4px;padding:8px 12px;font-size:14px}
.sp-banner.off{border-color:#2f4f8f;background:rgba(47,79,143,.10)}
.sp-banner.brk{border-color:var(--line);background:transparent;border-style:dashed;border-width:1px 1px 1px 4px}
.sp-wkgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}
.sp-wk{border:1px solid var(--line);border-radius:5px;padding:6px 8px;background:var(--surface);cursor:pointer;text-align:left;font:13px var(--body);color:var(--fg)}
.sp-wk b{display:block;font-size:12px;font-family:var(--mono)}.sp-wk[aria-pressed="true"]{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}
.sp-wk.brk{border-style:dashed;color:var(--muted)}.sp-wk.now{background:var(--gold-soft)}
.sp-drills{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px}
.sp-drill h3{margin:0 0 2px}
.sp-drill dl{display:grid;grid-template-columns:100px 1fr;gap:4px 10px;margin:8px 0 0;font-size:14px}
.sp-drill dt{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding-top:2px}
.sp-drill dd{margin:0}.sp-drill dd ul{margin:0;padding-left:16px}
.sp-env{font-size:11px;font-weight:700;border-radius:3px;padding:0 5px;border:1px solid var(--line);color:var(--muted);margin-left:4px;white-space:nowrap}
.sp-stage{border-left:4px solid var(--accent);padding-left:12px}
.sp-ged td{white-space:nowrap}.sp-ged td.nm{white-space:normal}
.sp-ged select{font:14px var(--body);padding:4px 6px;border:1px solid var(--line);border-radius:4px;background:var(--bg);color:var(--fg)}
.sp-sug{font-size:11px;color:var(--muted);font-style:italic}
.sp-me{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.sp-me select{font:15px var(--body);padding:6px 8px;border:1px solid var(--line);border-radius:5px;background:var(--bg);color:var(--fg);max-width:100%}
@media (max-width:620px){.sp-rows tr{display:block;border-top:1px solid var(--line);padding:6px 0}.sp-rows tr:first-child{border-top:0}.sp-rows td{display:block;border:0;padding:1px 4px}.sp-rows td.rx,.sp-rows td.rest{display:inline-block;padding-top:0}.sp-rows td.rest{white-space:normal}.sp-rows td.rest:not(:empty)::before{content:"rest ";}.sp-drill dl{grid-template-columns:1fr}.sp-drill dt{padding-top:6px}}
`;
const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

/* ---------- groups ---------- */
const GROUPS = {
  S1:{n:"Short Sprints", ev:"100 · 200 · sprint relays", em:"Acceleration, max velocity, speed endurance, block starts"},
  S2:{n:"Long Sprints", ev:"200 · 400", em:"Acceleration, max velocity, speed endurance, race preparation"},
  S3:{n:"Sprint/Mid Hybrids", ev:"400 · 800", em:"Follows the Mid-Distance plan by default; a coach can assign the sprint session instead (never both)"},
  H:{n:"Hurdles", ev:"100/110H · 300H", em:"Shares sprint development with S1/S2, plus hurdle technique"},
  J:{n:"Jumps", ev:"LJ · TJ · HJ · PV", em:"Shares acceleration and max-velocity work, plus approach, takeoff and event technique"},
  MD:{n:"Distance & Mid program", ev:"Distance-first athletes", em:"Main training is the Distance & Mid plan; hurdle/jump work only as a secondary event"},
};
const GKEYS = ["S1","S2","S3","H","J"];
const chip = g => g ? `<span class="sp-grp ${g}" title="${esc(GROUPS[g].n)}">${g==="MD"?"Dist/Mid":g}</span>` : "";

/* ---------- drill library ---------- */
// env: both | out | in(door-only) ; dose = standard prescription
const DRILLS = {
  amarch:{n:"A-March → A-Skip", cat:"Warm-up & mechanics", env:"both", desc:"Marching, then skipping, with a quick knee lift and the foot stepping down under the hips.",
    why:"Teaches front-side mechanics and posture with a simple rhythm.", setup:"15–20m of flat floor or track.", dose:"2×15m march, 2×15m skip",
    cues:["Tall, hips tall","Knee up, toe up","Step down under you, not in front"], errs:["Leaning back","Reaching the foot out front","Flat-footed landings"],
    prog:["A-skip with arm emphasis","A-skip for distance, then for speed"], reg:["Wall A-march holds","Single-leg A-march in place"]},
  ankling:{n:"Ankling", cat:"Warm-up & mechanics", env:"both", desc:"Small, quick steps with a stiff ankle, landing on the ball of the foot under the hips.",
    why:"Builds ankle stiffness and teaches quick, active ground contact.", setup:"15–20m.", dose:"2×15m",
    cues:["Stiff ankle, quick off the ground","Hips over the foot","Quiet feet"], errs:["Heel landing","Bending the knee too much","Leaning back"],
    prog:["Ankling into a 10m build-up"], reg:["Ankling in place"]},
  dribble:{n:"Dribble runs", cat:"Warm-up & mechanics", env:"both", desc:"Running drill where the foot steps over the opposite ankle, then calf, then knee as the height rises.",
    why:"Front-side coordination, rhythm, and stepping down under the body.", setup:"15–20m. Indoors: a clear hallway lane.", dose:"2–4 passes (ankle → calf → knee)",
    cues:["Step over, step down","Rhythm before speed","Tall posture"], errs:["Kicking the heel to the butt (back-side)","Overstriding","Rushing the rhythm"],
    prog:["Dribble into a 10m build-up","Dribble into wickets (outdoors)"], reg:["Ankle-height dribbles only","Walking dribbles"]},
  buildup:{n:"Build-ups", cat:"Warm-up & mechanics", env:"both", desc:"Gradual accelerations to a fast, relaxed pace, then a smooth slow-down.",
    why:"Final step of the warm-up: raises speed safely before maximal work.", setup:"Outdoors 40–60m. Indoors only with real stopping room.", dose:"2×40m at 70% / 85% (indoors 2×15m at 70%)",
    cues:["Smooth, not strained","Gradual from the first step","Stop gradually"], errs:["Sprinting from step one","Stopping abruptly"],
    prog:["Add a third build-up at 90%"], reg:["Skip them indoors if stopping room is short"]},
  wall:{n:"Wall acceleration switches", cat:"Acceleration", env:"both", desc:"Hands on a wall, body at an acceleration angle, one knee driven up; switch legs on the coach's count.",
    why:"Trunk stability and coordinated pushing in the acceleration position.", setup:"A sturdy wall. No equipment.", dose:"2×5 switches per leg",
    cues:["Straight line, head to heel","Push the floor back","Switch fast, stay stiff"], errs:["Hips sagging or piking","Lifting the toe high (step down, push back)","Bent support leg collapsing"],
    prog:["Single exchange → double → triple","Partner-resisted march"], reg:["Wall march holds (3 s per position)"]},
  fall:{n:"Falling starts", cat:"Acceleration", env:"both", desc:"Stand tall, lean forward as one piece until you have to step, then accelerate.",
    why:"Forward projection and a powerful first step without the setup of a stance.", setup:"5–10m lane and stopping space.", dose:"3–4 × 5–10m",
    cues:["Fall as one piece","Push, don't reach","Low heel recovery, quick first step"], errs:["Bending at the waist","Popping straight up","Stepping out in front"],
    prog:["Falling start → 20m acceleration","Partner-release falling start"], reg:["Wall falls into 2 steps"]},
  stand:{n:"Standing (2-point) accelerations", cat:"Acceleration", env:"both", desc:"Staggered 2-point stance, accelerate over the set distance.",
    why:"Practices projection and a gradual rise with a repeatable start.", setup:"Cones at start and finish, room to slow down.", dose:"3–4 × 10–20m",
    cues:["Push the ground back","Shins at an angle","Rise gradually"], errs:["Standing up in 2 steps","Short choppy steps","Reaching forward"],
    prog:["Three-point starts","Timed 10m"], reg:["Shorter distance (5–10m)"]},
  three:{n:"Three-point starts", cat:"Acceleration", env:"both", desc:"One hand down, hips slightly above shoulders, push off both legs.",
    why:"Bridges standing starts to blocks: positioning and pushing mechanics.", setup:"10–20m lane, room to slow down.", dose:"3–5 × 10–20m",
    cues:["Weight forward over the hand","Push hard with both legs","Low, fast first steps"], errs:["Too much weight back","Popping up","Swinging the arm across the body"],
    prog:["Block starts","Timed 10m from three-point"], reg:["Falling starts"]},
  block:{n:"Block starts", cat:"Acceleration", env:"both", desc:"Starts from the athlete's own block settings, with commands.",
    why:"Setup, coordinated push, first steps, and a progressive rise: our signature weakness.", setup:"Starting blocks on a surface that holds them. Indoors only where the floor and setup are safe.", dose:"2–4 quality starts",
    cues:["Same setup every time","Push both pedals, then drive","Low heels, gradual rise"], errs:["Different setup each rep","Popping up","Short, choppy first steps","Rear leg swinging wide"],
    prog:["Timed 10m/20m block starts","Starts with commands and reaction","Curve starts"], reg:["Three-point starts","Blocks with no commands, partner watching one cue"]},
  accel:{n:"Accelerations (progressive)", cat:"Acceleration", env:"both", desc:"Accelerations from a standing or three-point start over 20–30m.",
    why:"Practices the full drive phase into upright running.", setup:"Outdoors 20–30m plus slowing room. Indoors capped at 10–20m.", dose:"2–4 × 20–30m",
    cues:["Push, push, push, then run tall","Patient rise","Relax the face and hands"], errs:["Standing up early","Overstriding as speed rises"],
    prog:["Flying sprints","Timed 20m"], reg:["Shorter distance"]},
  wicket:{n:"Wicket runs", cat:"Max velocity", env:"both", desc:"Running over low mini-hurdles (wickets) spaced to the athlete's stride.",
    why:"Upright mechanics, rhythm, posture, and quick ground contact.", setup:"Wickets or flat mini-hurdles, individualized spacing (start ~5.5–6.5 ft and adjust). Indoors only with enough lead-in and stopping room.", dose:"3–5 passes",
    cues:["Tall and bouncy","Step over, step down","Rhythm, not strain"], errs:["Reaching for the next wicket","Sitting down (hips low)","Spacing that's too wide or too tight"],
    prog:["Wider spacing / faster entry","Wickets into a flying 10m"], reg:["Dribble runs","Fewer wickets"]},
  broad:{n:"Standing broad jumps", cat:"Power", env:"both", desc:"Two-foot jump forward for distance, stick the landing.",
    why:"Horizontal power and controlled landing. Also our standing broad jump test.", setup:"Mats or turf. Tape line for measuring.", dose:"2–3 × 3 reps",
    cues:["Big arm swing","Explode out, not up","Stick it, knees over toes"], errs:["Falling back on landing","Knees caving in","No arm swing"],
    prog:["Broad jump into sprint 10m","Double broad jump"], reg:["Snap-down to stick","Jumps for quality at half effort"]},
  pogo:{n:"Pogo hops", cat:"Power", env:"both", desc:"Small, stiff-ankle hops in place or moving forward.",
    why:"Ankle stiffness and a controlled landing. Low-volume introduction to plyometrics.", setup:"Flat, firm surface (not concrete if possible).", dose:"2 × 10 contacts",
    cues:["Stiff ankles, bounce off the floor","Quick and quiet","Tall body"], errs:["Bending knees too much","Heels touching","Too many contacts"],
    prog:["Forward pogos","Single-leg pogos (later)"], reg:["Calf raises","Fewer contacts"]},
  medball:{n:"Medicine-ball throws", cat:"Power", env:"both", desc:"Chest pass, scoop toss, or overhead backward throw with full intent.",
    why:"Explosive full-body power with low impact.", setup:"Med balls of an appropriate weight (about 2–4 kg HS), clear throwing area or wall.", dose:"2–3 × 3–5",
    cues:["Every throw is fast","Use the legs and hips","Reset between reps"], errs:["Too heavy (slow throws)","Rushing reps"],
    prog:["Scoop toss for distance","Heavier ball only if speed stays high"], reg:["Lighter ball","Chest pass only"]},
  fly10:{n:"Flying 10m", cat:"Max velocity", env:"out", desc:"Build up over 20–30m, sprint a timed 10m zone at top speed, then slow down gradually.",
    why:"Max velocity: the 'cat' work. Timed when possible.", setup:"Outdoors: 20–30m build-up zone, 10m timed zone, 20m+ slowing zone. Indoors only if all three zones are verified safe.", dose:"2–3 reps, full recovery (4–6 min)",
    cues:["Fast and relaxed through the zone","Tall, bouncy","Don't strain at the line"], errs:["Starting too fast in the build-up","Straining (tight face/shoulders)","Short rest"],
    prog:["Flying 20m"], reg:["Longer build-up, 2 reps"]},
  fly20:{n:"Flying 20m", cat:"Max velocity", env:"out", desc:"Build up over 20–30m, then a timed 20m zone at top speed.",
    why:"Max velocity held a little longer.", setup:"Outdoors: build-up, 20m timed zone, slowing zone.", dose:"2–3 reps, 4–6 min recovery",
    cues:["Relax at top speed","Hold your form through the line"], errs:["Short rest","Too many reps"],
    prog:["Timed, tracked over the season"], reg:["Flying 10m"]},
  sefast:{n:"Controlled fast runs (speed endurance)", cat:"Speed endurance", env:"out", desc:"60–120m at controlled fast or about 90–95% effort with long recovery.",
    why:"Introduces speed endurance late in winter without turning into conditioning.", setup:"Outdoor track only. Never in a hallway.", dose:"2 reps with 6–10 min recovery",
    cues:["Fast and smooth","Same form at the end as the start"], errs:["Short rest","Adding reps"],
    prog:["Spring race-specific work (to be written)"], reg:["Shorter distance or 1 rep"]},
  // hurdles
  hlead:{n:"Lead-leg drill", cat:"Hurdles", env:"both", desc:"Walking or wall drill: knee up, then the heel of the lead leg attacks over the hurdle.",
    why:"Attacking lead-leg mechanics.", setup:"One split-bar or low hurdle; a wall for the wall version.", dose:"2 × 5 each leg",
    cues:["Knee first, then heel","Snap it down behind the hurdle","Stay square"], errs:["Kicking the straight leg up","Swinging the leg around"],
    prog:["Lead leg from a 3-step skip","Single-hurdle attack"], reg:["Wall lead-leg holds"]},
  htrail:{n:"Trail-leg drill", cat:"Hurdles", env:"both", desc:"Walking beside the hurdle, the trail knee comes up and through to the front.",
    why:"Clean, flat trail-leg clearance.", setup:"One low hurdle.", dose:"2 × 5 each leg",
    cues:["Knee up and through","Toe up","Pull it to the front, not out to the side"], errs:["Dropping the knee","Trail toe pointing down"],
    prog:["Trail leg at a jog","Trail leg over 3 hurdles"], reg:["Wall trail-leg drill"]},
  hmob:{n:"Hurdle mobility / walkovers", cat:"Hurdles", env:"both", desc:"Walking over and under a line of low hurdles forward and sideways.",
    why:"Hip mobility for hurdlers. A good warm-up piece.", setup:"3–5 low hurdles.", dose:"2 × 5 hurdles",
    cues:["Tall over the top","Smooth hips"], errs:["Leaning back","Rushing"], prog:["Higher hurdles"], reg:["Fewer, lower hurdles"]},
  hwalk:{n:"Walking clearance", cat:"Hurdles", env:"both", desc:"Walk-skip into a full clearance over a low hurdle.",
    why:"Puts lead and trail legs together slowly.", setup:"One split-bar hurdle, low.", dose:"4–6 reps",
    cues:["Attack with the knee","Snap down, keep going"], errs:["Jumping the hurdle"], prog:["Single-hurdle attack"], reg:["Lead or trail drill only"]},
  hsingle:{n:"Single-hurdle attacks", cat:"Hurdles", env:"both", desc:"Short approach (3–5 steps) at speed into one hurdle.",
    why:"Confidence and attacking mechanics at speed.", setup:"One split-bar hurdle, reduced height first. Indoors: approach and stopping room checked.", dose:"4 reps",
    cues:["Attack the hurdle, run off it","Lean into it","Step down fast"], errs:["Stutter-stepping","Floating over"],
    prog:["2–3 hurdle rhythm"], reg:["Lower height, walking clearance"]},
  hrhythm:{n:"Rhythm runs (2–4 hurdles)", cat:"Hurdles", env:"both", desc:"Reduced height and spacing so the athlete can 3-step (or rhythm-step) between hurdles.",
    why:"Rhythm consistency and speed between hurdles.", setup:"2–4 hurdles, shortened spacing. Indoors: start with 2.", dose:"3 × 2–3 hurdles",
    cues:["Fast feet between","Same rhythm every hurdle"], errs:["Spacing too long (reaching)","Slowing into each hurdle"],
    prog:["More hurdles, closer to race spacing"], reg:["1 hurdle, single attacks"]},
  hstart:{n:"Start to first hurdle", cat:"Hurdles", env:"out", desc:"Block or 3-point start to hurdle 1 with the right number of steps.",
    why:"First-hurdle execution: the race starts here.", setup:"Blocks, hurdle 1 at reduced height then race marks.", dose:"3–4 reps",
    cues:["Same step count every time","Rise early enough to attack"], errs:["Chopping the last steps","Standing up out of the blocks"],
    prog:["Start over hurdles 1–2","Race height and spacing (spring)"], reg:["Start to a cone at the hurdle mark"]},
  // jumps
  ljapp:{n:"Approach runs (LJ/TJ)", cat:"Jumps", env:"out", desc:"Run-throughs on the approach with a coach checking the mark at 4 steps out and the board.",
    why:"Approach consistency: the biggest variable in the horizontal jumps.", setup:"Runway or track, check-marks.", dose:"3–4 run-throughs",
    cues:["Same start every time","Accelerate the whole way","Eyes up, not on the board"], errs:["Changing the start","Slowing at the board"],
    prog:["Approach into takeoff"], reg:["Short approach (6–8 steps)"]},
  ljpen:{n:"Penultimate step drill", cat:"Jumps", env:"both", desc:"Skip or run into a slightly longer, lower second-to-last step and a quick last step.",
    why:"Sets up a fast, flat takeoff.", setup:"Floor or runway, cones.", dose:"2 × 4",
    cues:["Long then quick","Hips stay tall"], errs:["Sitting down too much","Chopping steps"], prog:["Short approach jumps"], reg:["Walking penultimate rhythm"]},
  ljpop:{n:"Short-approach pop-ups", cat:"Jumps", env:"out", desc:"4–8 step approach, takeoff, and hold the flight position into the pit.",
    why:"Takeoff mechanics without full-approach load.", setup:"Sand pit. Indoors: no takeoffs onto a hard floor; use soft landing mats only.", dose:"4–6 jumps",
    cues:["Run off the board","Knee up, chest up"], errs:["Reaching for the board","Leaning back early"], prog:["Mid approach jumps"], reg:["Standing long jumps into sand"]},
  tjbound:{n:"Bounding progression (TJ)", cat:"Jumps", env:"out", desc:"Low-amplitude bounds, then alternate-leg and same-leg bounding over short distances.",
    why:"Prepares the legs for triple jump phases. Impact contacts are counted and kept low.", setup:"Grass, turf or track. Not concrete.", dose:"2 × 15–20m (start very low)",
    cues:["Active, flat-footed landings","Stay tall, use the arms"], errs:["Too many contacts","Landing on the heel"],
    prog:["Hop-step-jump from short approach"], reg:["Skips for distance"]},
  tjhsj:{n:"Hop-step-jump from a short approach", cat:"Jumps", env:"out", desc:"6–8 step approach into a controlled hop, step and jump.",
    why:"Phase coordination and landing control.", setup:"Pit with a takeoff board set short.", dose:"3–4 jumps",
    cues:["Even rhythm: da-da-DUM","Flat hop, active step"], errs:["Too big a hop","Collapsing on the step"], prog:["Longer approach"], reg:["Standing hop-step-jump"]},
  hjcurve:{n:"J-curve runs (HJ)", cat:"Jumps", env:"both", desc:"Run the high jump approach: straight steps, then the curve, lean away from the bar.",
    why:"Curved approach and rhythm.", setup:"Mark the approach with cones. Gym works.", dose:"4–6 runs",
    cues:["Lean in on the curve","Last 3 steps quick","Drive the knee up at takeoff"], errs:["Cutting the curve","Slowing on the curve"],
    prog:["Curve into a takeoff (no bar)"], reg:["Circle runs"]},
  hjscissor:{n:"Scissor jumps & short-approach back-overs (HJ)", cat:"Jumps", env:"out", desc:"Low-bar scissors, then short-approach jumps landing on the back on the pit.",
    why:"Takeoff mechanics and bar clearance at low heights.", setup:"High jump pit and a low (bungee) bar. Never without a pit.", dose:"4–6 jumps",
    cues:["Plant and drive up","Patient: let the curve turn you"], errs:["Jumping into the bar","Diving early"], prog:["Mid approach at modest heights"], reg:["Curve runs only"]},
  pvcarry:{n:"Pole carry runs (PV)", cat:"Jumps", env:"both", desc:"Running the approach with the pole held in carry position.",
    why:"Pole carry and approach rhythm.", setup:"Runway or gym. Qualified supervision.", dose:"4–6 runs",
    cues:["Tip high, then drop it gradually","Run tall, stay relaxed"], errs:["Carrying the pole low too early","Running stiff"],
    prog:["Run-throughs with the plant"], reg:["Walking carries"]},
  pvplant:{n:"Plant drills (PV)", cat:"Jumps", env:"both", desc:"Walking and jogging plants against a wall or into a box, no takeoff.",
    why:"Plant mechanics and takeoff preparation.", setup:"Wall or plant box. Pole vault work only under qualified supervision with proper facilities and equipment.", dose:"2 × 5",
    cues:["Hands up early","Plant tall, top hand over the toe"], errs:["Late plant","Bent top arm"], prog:["Short-run plants into the pit (qualified coach, pit set up)"], reg:["Standing plant positions"]},
};
const CATS_ORDER = ["Warm-up & mechanics","Acceleration","Max velocity","Power","Speed endurance","Hurdles","Jumps"];

/* ---------- standard warm-up ---------- */
const WARMUP = [
  ["Easy movement + activation","2–3 min","Jog, skips, side shuffles, carioca, leg swings."],
  ["Dynamic mobility","3 min","Walking lunge with reach, hip openers/closers, inchworm, world's greatest stretch. No long static holds before sprinting."],
  ["Coordination drills","4–5 min","A-march → A-skip, ankling, dribbles (ankle → calf → knee). Pick one or two cues for the day."],
  ["Build-ups","2–3 min","2 × 40m at 70% then 85%. Indoors: 2 × 15m at 70%, or skip if stopping room is short."],
  ["Event prep","2 min","Sprinters: 2 falling-start rehearsals. Hurdlers: walkovers. Jumpers: 2 short approach rhythm runs."],
];

/* ---------- pathways ---------- */
const BLOCKS = [
  {mo:"December", t:"Acceleration fundamentals", items:["Falling starts","Standing starts","Three-point starts","Projection angles","First-step placement"]},
  {mo:"January", t:"Block mechanics", items:["Individual block settings (write them down)","Set position","Front/rear pedal push","First three steps","Slow-motion video analysis"]},
  {mo:"February", t:"Explosive execution", items:["Timed 10m/20m block starts","Consistent setup","Drive phase","Transition toward upright running"]},
  {mo:"March–May", t:"Race execution", items:["Starter commands","Reaction consistency","Block starts under competition conditions","Curve starts (200, 400, relays)","Race-specific preparation"]},
];
const SCORECARD = [
  ["Setup consistency","Same pedal settings, hand position and set position every rep."],
  ["Coordinated push","Both legs push hard; arms and legs work together off the line."],
  ["First-step placement","First steps land under/behind the hips, low and fast, no reaching."],
  ["Progressive rise","Body rises gradually over the drive phase, no popping up."],
];
const HURDLES = [
  {mo:"December", items:["Lead-leg drills","Trail-leg drills","Hurdle mobility","Walking clearance","Controlled single-hurdle drills"]},
  {mo:"January", items:["Short approaches","Single-hurdle attacks","Reduced-height rhythm drills","Progressive three-step patterns where appropriate"]},
  {mo:"February", items:["Starts to the first hurdle","Two-to-four hurdle sequences","Rhythm consistency","Increased approach speed"]},
  {mo:"March–May", items:["Competition-height progression","Race-specific spacing","Full approach rhythm","100/110H and 300H race preparation"]},
];
const JUMPS = {
  "Long Jump":{focus:["Approach consistency","Acceleration","Penultimate step","Takeoff mechanics","Landing technique"], drills:["ljapp","ljpen","ljpop"],
    mo:{dec:["Approach check-mark runs ×4 (outdoors) or 6–8 step rhythm runs (indoors)","Penultimate step drill 2×4"], jan:["Short-approach pop-ups ×4–6 (pit only)","Penultimate step drill 2×4"], feb:["Mid-approach jumps ×4–6 with check-mark","Landing drill into the pit ×4"]}},
  "Triple Jump":{focus:["Approach consistency","Hop-step-jump coordination","Landing control","Progressive bounding","Careful management of impact contacts"], drills:["ljapp","tjbound","tjhsj"],
    mo:{dec:["Skips for distance 2×20m","Low bounding 2×15m (not on concrete)"], jan:["Standing hop-step-jump ×4","Low bounding 2×20m"], feb:["Short-approach hop-step-jump ×3–4","Approach run-throughs ×3"]}},
  "High Jump":{focus:["Curved approach","Approach rhythm","Takeoff mechanics","Bar clearance","Indoor technical alternatives (curve runs, takeoff drills, no bar without a pit)"], drills:["hjcurve","hjscissor"],
    mo:{dec:["J-curve runs ×4–6","Scissor jumps ×4 at a low bungee (pit only)"], jan:["Curve into takeoff, no bar ×4","Short-approach back-overs ×4–6 (pit only)"], feb:["Mid approach at modest heights ×4–6 (pit only)","Approach rhythm runs ×3"]}},
  "Pole Vault":{focus:["Pole carry","Approach rhythm","Plant mechanics","Takeoff preparation","Technical work only under qualified supervision with proper facilities and equipment"], drills:["pvcarry","pvplant"],
    mo:{dec:["Pole carry runs ×4–6","Walking plants 2×5"], jan:["Jogging plants 2×5","Pole carry runs at approach rhythm ×4"], feb:["Short-run plants into the pit ×4 (qualified coach, pit set)","Carry runs ×3"]}},
};
const HURDLE_TECH = {
  dec:[["Lead-leg drill","2×5 each leg","hlead"],["Trail-leg drill","2×5 each leg","htrail"],["Walkovers","2×5 hurdles","hmob"],["Walking clearance","4–6","hwalk"]],
  jan:[["Lead/trail-leg drills","2×5 each leg","hlead"],["Single-hurdle attacks","4","hsingle"],["Rhythm at reduced height","3 × 2–3 hurdles (if space)","hrhythm"]],
  feb:[["Start to first hurdle","3–4","hstart"],["2–4 hurdle sequences","3","hrhythm"],["Lead/trail-leg drills","1×5 each leg","hlead"]],
};
const SPRINT_TECH = {
  dec:[["Start positions: falling → standing → three-point","5–8 min","three"],["One cue: first-step placement","",""]],
  jan:[["Block setup + set position + first 3 steps","8–10 min","block"],["Film 1–2 starts (slow-motion)","",""]],
  feb:[["Timed 10m block starts (if not timed today)","2–3","block"],["Drive phase → upright transition","",""]],
};

/* ---------- strength ---------- */
const STR = {
  dec:{n:"December · Movement quality", ex:[["Trap-bar deadlift (or goblet squat)","2×6–8"],["Dumbbell bench press","2×8"],["Split squat","2×6 each leg"],["Dumbbell row","2×8"],["Romanian deadlift (dumbbells)","2×8"],["Core: dead bug + side plank","2×8 each / 2×20 s"],["Med-ball chest pass","2×5"]],
    note:"Light. Learn positions. Stop 3+ reps before failure."},
  jan:{n:"January · Progressive loading", ex:[["Trap-bar deadlift","3×4–6"],["Dumbbell bench press","3×5–6"],["Rear-foot split squat","3×5 each"],["Romanian deadlift","3×6"],["Pull-ups or inverted rows","3×5–8"],["Core: Pallof press + side plank","2×8 / 2×25 s"],["Med-ball scoop toss","3×3"]],
    note:"Add load only when every rep looks the same. Leave 2–3 reps in reserve."},
  feb:{n:"February · Maintain + move fast", ex:[["Trap-bar deadlift (fast up)","2–3×3–4"],["Dumbbell bench (fast up)","2×5"],["Split squat","2×5 each"],["Rows","2×8"],["Med-ball scoop toss / overhead throw","3×3"]],
    note:"Same weights as late January. Explosive intent, no soreness. Cut a set if legs are flat."},
  spring:{n:"March–May · Maintenance", ex:[["Trap-bar deadlift","2×3"],["Split squat","2×4 each"],["Upper push + pull","2×5"],["Med-ball throws","2×3"]],
    note:"1–2 short sessions a week. Nothing heavy within 48 hours of a priority meet. Coordinate with the meet schedule."},
};
const STR_MOD = {red:"Reduced volume: one fewer set on each lift.", light:"Light: 2 sets, no new loads.", mod:"Moderate: normal sets, no new maxes, stop fresh.", intro:"Introductory: technique first, light loads."};

/* ---------- the 12-week winter calendar ----------
   Row: {x:label, p:prescription, r:rest, i:"max"|"near"|"cf"|"tech"|"9095", d:drill id, g:[groups] (omit = everyone), n:note, cut:true (H/J may skip)}
   {tech:true} expands to each group's event technique for that month.  {str:"dec"|..., mod:"red"|...} = strength block. */
const R = {acc:"2–3 min, walk back", fly:"4–6 min", fall:"1–2 min", bj:"60–90 s", wall:"30–45 s", drill:"walk back", se80:"6–8 min", se120:"8–10 min", full:"Full recovery"};
const WU = {x:"Standard warm-up", p:"12–15 min", wu:true};
const TECH = {tech:true, x:"Event-specific technical work", p:"15–20 min"};
const row = (x,p,o) => Object.assign({x,p}, o||{});
const SP_WEEKS = [
 {n:1, start:"2026-12-07", focus:"Acceleration foundations", st:"vol", mo:"dec",
  tue:{out:[WU,row("Wall switches","2×5 each leg",{d:"wall",r:R.wall,i:"tech"}),row("Falling starts","4×10m",{d:"fall",r:R.fall,i:"max"}),row("Standing accelerations","3×20m",{d:"stand",r:R.acc,i:"max"}),row("Progressive accelerations","2×30m",{d:"accel",r:"3 min",i:"near",cut:true}),TECH],
       in:[WU,row("Wall switches","2×5 each leg",{d:"wall",r:R.wall,i:"tech"}),row("Falling starts","4×5m",{d:"fall",r:R.fall,i:"max"}),row("Standing accelerations","4×10m",{d:"stand",r:R.acc,i:"max"}),row("Accelerations","2×15m if safe",{d:"accel",r:R.acc,i:"near",cut:true,n:"Only with traction, a clear lane and stopping room."}),TECH]},
  thu:{out:[WU,row("Starts","3×20m",{d:"stand",r:R.acc,i:"max"}),row("Broad jumps","2×3",{d:"broad",r:R.bj,i:"max"}),TECH,{str:"dec",mod:"intro"}],
       in:[WU,row("Starts","3×10m",{d:"stand",r:R.acc,i:"max"}),row("Broad jumps","2×3",{d:"broad",r:R.bj,i:"max"}),TECH,{str:"dec",mod:"intro"}]}},
 {n:2, start:"2026-12-14", focus:"First-step projection", st:"vol", mo:"dec",
  tue:{out:[WU,row("Falling starts","3×10m",{d:"fall",r:R.fall,i:"max"}),row("Three-point starts","4×20m",{d:"three",r:R.acc,i:"max"}),row("Accelerations","2×30m",{d:"accel",r:"3 min",i:"near",cut:true}),TECH],
       in:[WU,row("Falling starts","3×5m",{d:"fall",r:R.fall,i:"max"}),row("Three-point starts","4×10m",{d:"three",r:R.acc,i:"max"}),row("Accelerations","3×15m if safe",{d:"accel",r:R.acc,i:"near",cut:true}),TECH]},
  thu:{out:[WU,row("Starts","3×20m",{d:"three",r:R.acc,i:"max"}),row("Broad jumps","3×3",{d:"broad",r:R.bj,i:"max"}),Object.assign({},TECH,{x:"Hurdle / jump technique"}),{str:"dec"}],
       in:[WU,row("Starts","4×10m",{d:"three",r:R.acc,i:"max"}),row("Broad jumps","3×3",{d:"broad",r:R.bj,i:"max"}),Object.assign({},TECH,{x:"Hurdle / jump technique"}),{str:"dec"}]}},
 {n:3, start:"2026-12-21", focus:"Horizontal pushing (on your own)", st:"break", mo:"dec",
  tue:{out:[row("Easy warm-up + drills","10–12 min",{d:"amarch",i:"tech"}),row("Accelerations","3×20m",{d:"accel",r:R.acc,i:"near"}),row("Flying 10m","2 reps",{d:"fly10",r:R.fly,i:"max",n:"Only with a safe build-up and slowing area. Full recovery."})],
       in:[row("Wall switches","2×5 each leg",{d:"wall",r:R.wall,i:"tech"}),row("Dribble drills","2–3 passes",{d:"dribble",i:"tech",n:"Driveway, garage or a safe flat spot."}),row("Short accelerations","4×10m only if you have a safe space",{d:"accel",r:R.acc,i:"near"})]},
  thu:{out:[row("Light technical work","10 min",{d:"dribble",i:"tech"}),row("Mobility","10–15 min",{i:"tech"}),{str:"dec",mod:"light",home:true}],
       in:[row("Light technical work","10 min",{d:"dribble",i:"tech"}),row("Mobility","10–15 min",{i:"tech"}),{str:"dec",mod:"light",home:true}]}},
 {n:4, start:"2026-12-28", focus:"Holiday recovery (on your own)", st:"break", mo:"dec",
  tue:{out:[row("Mobility","10–15 min",{i:"tech"}),row("Easy technical work: A-skips, ankling, dribbles","10 min",{d:"amarch",i:"tech"})], in:null},
  thu:{out:[row("Mobility","10–15 min",{i:"tech"}),{str:"dec",mod:"light",home:true}], in:null}},
 {n:5, start:"2027-01-04", focus:"Baseline speed testing", st:"vol", mo:"jan", test:true,
  tue:{out:[WU,row("Accelerations","3×20m",{d:"accel",r:R.acc,i:"max"}),row("Flying 10m, timed","3 reps",{d:"fly10",r:R.fly,i:"max",n:"Baseline test. Record method, surface and conditions."})],
       in:[WU,row("Accelerations","4×10m",{d:"accel",r:R.acc,i:"max"}),row("Timed 10m starts","2 if safe",{d:"stand",r:R.acc,i:"max",n:"Indoor time: keep separate from outdoor times."})]},
  thu:{out:[WU,row("Short starts","3×10m",{d:"three",r:R.acc,i:"max"}),row("Pogo hops + broad jumps","2×10 contacts / 2×3",{d:"pogo",r:R.bj,i:"max",n:"Low-volume plyometrics."}),row("Block setup instruction","10 min",{d:"block",i:"tech"}),TECH,{str:"jan"}], in:null}},
 {n:6, start:"2027-01-11", focus:"Block clearance", st:"vol", mo:"jan",
  tue:{out:[WU,row("Starts","3×30m",{d:"block",r:"3 min",i:"max"}),row("Flying 10m","3 reps",{d:"fly10",r:R.fly,i:"max",cut:true})],
       in:[WU,row("Starts","4×10m",{d:"block",r:R.acc,i:"max"}),row("Starts","2×15m if safe",{d:"block",r:R.acc,i:"max",cut:true}),row("Wicket / dribble passes","3",{d:"wicket",r:R.drill,i:"tech"})]},
  thu:{out:[WU,row("Short accelerations","3×10–15m",{d:"accel",r:R.acc,i:"max"}),row("Low-volume jumps","2×3 broad jumps",{d:"broad",r:R.bj,i:"max"}),Object.assign({},TECH,{x:"Hurdle / jump technique"}),{str:"jan"}], in:null}},
 {n:7, start:"2027-01-18", focus:"Drive-phase development", st:"vol", mo:"jan",
  tue:{out:[WU,row("Accelerations","3×20m",{d:"accel",r:R.acc,i:"max"}),row("Flying 20m","3 reps",{d:"fly20",r:R.fly,i:"max",cut:true})],
       in:[WU,row("Starts","4×10–15m",{d:"block",r:R.acc,i:"max"}),row("Wicket / dribble drills","3 passes",{d:"wicket",r:R.drill,i:"tech"})]},
  thu:{out:[WU,row("Short starts","3×10m",{d:"block",r:R.acc,i:"max"}),row("Controlled explosive jumps","2×3 broad jumps + 2×10 pogos",{d:"broad",r:R.bj,i:"max"}),TECH,{str:"jan"}], in:null}},
 {n:8, start:"2027-01-25", focus:"Acceleration reassessment", st:"vol", mo:"jan", test:true,
  tue:{out:[WU,row("Timed 10m starts","2–3 attempts",{d:"block",r:R.acc,i:"max",n:"Reassessment. Same protocol as Week 5."}),row("Timed 20m starts","2–3 attempts",{d:"block",r:"3 min",i:"max"}),row("Flying 20m","2 if still fresh",{d:"fly20",r:R.fly,i:"max",cut:true})],
       in:[WU,row("Timed 10m starts","2–3 attempts",{d:"block",r:R.acc,i:"max",n:"Indoor time: keep separate from outdoor times."}),row("Technical accelerations","2×10–15m",{d:"accel",r:R.acc,i:"near"})]},
  thu:{out:[WU,row("Short starts (reduced volume)","2×10m",{d:"block",r:R.acc,i:"max"}),row("Video analysis","10 min",{i:"tech",n:"Review Tuesday's starts with the scorecard."}),TECH,{str:"jan"}], in:null}},
 {n:9, start:"2027-02-01", focus:"Maximum velocity", st:"vol", mo:"feb",
  tue:{out:[WU,row("Starts","3×30m",{d:"block",r:"3 min",i:"max"}),row("Flying 20m","3 reps",{d:"fly20",r:R.fly,i:"max",cut:true})],
       in:[WU,row("Starts","4×10–15m",{d:"block",r:R.acc,i:"max"}),row("Short wicket passes","3",{d:"wicket",r:R.drill,i:"tech"})]},
  thu:{out:[WU,row("Controlled fast efforts","2×60m",{d:"sefast",g:["S1"],r:R.full,i:"cf"}),row("Controlled fast efforts","2×100m",{d:"sefast",g:["S2"],r:R.full,i:"cf"}),TECH,{str:"feb",mod:"red"}],
       in:[WU,row("Starts","3×10m",{d:"block",r:R.acc,i:"max"}),row("Low-volume power","2×3 med-ball throws + 2×3 broad jumps",{d:"medball",r:R.bj,i:"max"}),TECH,{str:"feb"},row("Longer sprints","Deferred: not indoors",{i:"tech",n:"The 60m/100m efforts wait for an outdoor day."})]}},
 {n:10, start:"2027-02-08", focus:"Speed endurance introduction", st:"vol", mo:"feb",
  tue:{out:[WU,row("Starts","2×30m",{d:"block",r:"3 min",i:"max"}),row("Flying 20m","3 reps",{d:"fly20",r:R.fly,i:"max",cut:true})],
       in:[WU,row("Starts","3×10–15m",{d:"block",r:R.acc,i:"max"}),row("Technical sprint-drill passes","3",{d:"dribble",r:R.drill,i:"tech"})]},
  thu:{out:[WU,row("Speed endurance","2×80m",{d:"sefast",g:["S1"],r:R.se80,i:"9095"}),row("Speed endurance","2×120m",{d:"sefast",g:["S2"],r:R.se120,i:"cf"}),TECH,{str:"feb",mod:"red"}],
       in:[WU,row("Starts","3×10m",{d:"block",r:R.acc,i:"max"}),row("Low-volume jumps","2×3 broad jumps",{d:"broad",r:R.bj,i:"max"}),TECH,{str:"feb"},row("No 80–120m reps in a hallway","",{i:"tech"})]}},
 {n:11, start:"2027-02-15", focus:"Speed consolidation", st:"off", mo:"feb",
  tue:{out:[WU,row("Accelerations","2×20m",{d:"accel",r:R.acc,i:"max"}),row("Flying 20m","2 reps",{d:"fly20",r:R.fly,i:"max",cut:true})],
       in:[WU,row("Accelerations","3×10m",{d:"accel",r:R.acc,i:"max"}),row("Low-volume technical work","10 min",{d:"dribble",i:"tech"}),row("Video review","10 min",{i:"tech"})]},
  thu:{out:[WU,row("Short starts","3×10m",{d:"block",r:R.acc,i:"max"}),TECH,{str:"feb",mod:"light"}], in:null}},
 {n:12, start:"2027-02-22", focus:"Preseason transition", st:"off", mo:"feb",
  tue:{out:[WU,row("Accelerations","3×30m",{d:"accel",r:"3 min",i:"max"}),row("Fast runs","2×60m",{d:"sefast",g:["S1"],r:R.full,i:"cf"}),row("Fast runs","2×80m",{d:"sefast",g:["S2"],r:R.full,i:"cf"})],
       in:[WU,row("Accelerations","4×10–15m",{d:"accel",r:R.acc,i:"max"}),row("Controlled power","2×3 med-ball throws",{d:"medball",r:R.bj,i:"max"}),row("Technical drills","3 passes",{d:"dribble",r:R.drill,i:"tech"})]},
  thu:{out:[WU,row("Short starts","3×10m",{d:"block",r:R.acc,i:"max"}),TECH,{str:"feb",mod:"mod",n:"Avoid excessive fatigue."}], in:null}},
];
const ST = {vol:["Coach-led · voluntary / out-of-season","sp-banner"], break:["Athlete-led · no practice · optional","sp-banner brk"], off:["Official practice (confirm the IHSAA start date)","sp-banner off"]};
const INT = {max:["Max","max"], near:["Fast, relaxed",""], cf:["Controlled fast",""], "9095":["~90–95%",""], tech:["Technical","tech"]};
const DUR = {Tue:"60–75 min", Thu:"75–90 min"};

/* ---------- state ---------- */
const SP = window.SP = {tab:"cal", wi:null, env:"out", g:"All", me:"", groups:{}, draft:null, msg:{kind:"",text:""}, gq:"", gshow:"all"};
try { const e = localStorage.getItem("sp-env"); if (e==="in"||e==="out") SP.env = e; } catch(e){}
try { SP.me = localStorage.getItem("sp-me") || ""; } catch(e){}

/* ---------- helpers ---------- */
const addDays = (s,n) => { const d = parseD(s); d.setDate(d.getDate()+n); return d; };
const fmt = d => d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
const dateOf = (w, day) => addDays(w.start, day==="Tue"?1:3);
function curWeekIdx(){
  const t = today;
  const i = SP_WEEKS.findIndex(w => t >= parseD(w.start) && t < addDays(w.start,7));
  if (i>=0) return i;
  if (t < parseD(SP_WEEKS[0].start)) return 0;
  return SP_WEEKS.length-1;
}
const hsAthletes = () => ATHLETES.filter(a => a.level==="HS");
// Suggested groups from current events (coaches confirm on Coaches → Sprint Groups)
function suggest(a){
  if (a.level!=="HS") return null;
  const c = a.cats||[], ev = new Set([...Object.keys(a.prs||{}), ...(a.events||[])]);
  const sp = c.includes("Sprints"), mid = c.includes("Mid Distance") || ev.has("800"), dist = c.includes("Distance");
  const long = ev.has("400") || ev.has("400 split");
  const H = c.includes("Hurdles"), J = c.some(x=>["Long Jump","High Jump","Pole Vault"].includes(x));
  let p = null;
  if (dist && !long) p = (H||J) ? "MD" : null;
  else if (long && mid) p = "S3";
  else if (long) p = "S2";
  else if (sp) p = "S1";
  if (!p && H) p = "H"; else if (!p && J) p = "J";
  if (!p) return null;
  const s = [H && p!=="H" ? "H" : null, J && p!=="J" ? "J" : null].filter(Boolean);
  return {p, s, sug:true};
}
const groupOf = a => SP.groups[a.id] || suggest(a);
const jumpEvents = a => ["Long Jump","High Jump","Pole Vault"].filter(x => (a.cats||[]).includes(x));
const meA = () => SP.me ? ATHLETES.find(a=>a.id===SP.me) : null;
// Which group's rows to show for a filter key. S3 on the sprint plan follows S2 rows; H and J follow S1 for group-only rows.
const rowFor = (r, g) => !r.g || g==="All" || r.g.includes(g) || (g==="S3" && r.g.includes("S2")) || ((g==="H"||g==="J") && r.g.includes("S1"));

function drillLink(id, label){ return id && DRILLS[id] ? `<a href="#sprints" onclick="SP.tab='drills';SP.drill='${id}';render();setTimeout(()=>{const e=document.getElementById('dr-${id}');if(e)e.scrollIntoView({behavior:'smooth'})},30);return false">${esc(label)}</a>` : esc(label); }
function techBlocks(mo, env, g, a){
  const out = [];
  const want = k => g==="All" || g===k || (a && groupOf(a) && (groupOf(a).p===k || (groupOf(a).s||[]).includes(k)));
  if (want("S1") || want("S2") || (g==="All")) out.push(["Sprinters (S1/S2) · block-start pathway", (SPRINT_TECH[mo]||[]).filter(x=>x[0]).map(([x,p,d])=>[x,p,d])]);
  if (want("H")) out.push(["Hurdlers · " + ({dec:"December",jan:"January",feb:"February"})[mo], (HURDLE_TECH[mo]||[]).map(([x,p,d])=>[x + (env==="in" && /rhythm|sequence/i.test(x) ? " (start with 1–2 hurdles indoors)" : ""), p, d])]);
  if (want("J")) {
    const evs = a ? jumpEvents(a) : Object.keys(JUMPS);
    (evs.length ? evs : Object.keys(JUMPS)).forEach(e => {
      const J = JUMPS[e]; if (!J) return;
      let items = (J.mo[mo]||[]).map(x=>[x,"",""]);
      if (env==="in") items = items.map(([x])=>[x + (/pit|jumps|back-overs|landing|bounding|hop-step/i.test(x) ? " · indoors: approach + takeoff drills only" : ""),"",""]);
      out.push(["Jumpers · " + e + (e==="Pole Vault" ? " (qualified supervision only)" : ""), items]);
    });
  }
  const outOnly = d => env==="in" && d && DRILLS[d] && DRILLS[d].env==="out" ? ` <span class="sp-cut">Outdoors only. Indoors: ${d==="hstart" ? "single-hurdle attacks from 3–5 steps" : "technical drills instead"}.</span>` : "";
  const list = items => `<ul>${items.map(([x,p,d])=>`<li>${drillLink(d, x)}${p?` <span class="mono">${esc(p)}</span>`:""}${outOnly(d)}</li>`).join("")}</ul>`;
  const fold = g==="All" && !a;
  return (fold ? `<p class="note" style="margin:4px 0 0">Tap a group to open its technique, or pick a group above.</p>` : "") +
    out.map(([h, items]) => fold ? `<details class="sp-tech"><summary><h4>${esc(h)}</h4></summary>${list(items)}</details>` : `<div class="sp-tech"><h4>${esc(h)}</h4>${list(items)}</div>`).join("");
}
function strBlock(r){
  const S = STR[r.str]; if (!S) return "";
  return `<details class="sp-tech"><summary><b>${r.home ? "Home strength (optional)" : "Weight room"} · ${esc(S.n)}</b> · 30–35 min${r.mod?` · <span class="muted">${esc(STR_MOD[r.mod])}</span>`:""}</summary>
    <ul>${(r.home ? [["Split squat","2×8 each leg"],["Push-ups","2×8–12"],["Single-leg RDL (bodyweight)","2×8 each"],["Glute bridge","2×10"],["Dead bug + side plank","2×8 each / 2×20 s"]] : S.ex).map(([n,p])=>`<li>${esc(n)} <span class="mono">${esc(p)}</span></li>`).join("")}</ul>
    <p class="note" style="margin:4px 0 0">${esc(r.home ? "Bodyweight at home. Stop well before failure." : S.note)} ${r.n?esc(r.n):""} Supervised and individualized; never to failure.</p></details>`;
}
function rowsHTML(rows, mo, env, g, a){
  const isHJ = g==="H" || g==="J" || (a && groupOf(a) && ["H","J"].includes(groupOf(a).p));
  return `<table class="sp-rows"><tbody>${rows.filter(r=>r.tech||r.str||r.wu||rowFor(r,g)).map(r=>{
    if (r.wu) return `<tr><td class="nm" colspan="3"><a href="#sprints" onclick="SP.tab='warm';render();return false">Standard warm-up</a> <span class="mono">12–15 min</span><span class="sub">Easy movement, dynamic mobility, A-skips / ankling / dribbles, build-ups, event prep.</span></td></tr>`;
    if (r.str) return `<tr><td colspan="3">${strBlock(r)}</td></tr>`;
    if (r.tech) return `<tr><td colspan="3"><span class="nm">${esc(r.x)}</span> <span class="mono">${esc(r.p)}</span>${techBlocks(mo, env, g, a)}</td></tr>`;
    const it = INT[r.i];
    return `<tr><td class="nm">${drillLink(r.d, r.x)}${r.g?` ${r.g.map(chip).join("")}`:""}${it?`<span class="sp-int ${it[1]}">${esc(it[0])}</span>`:""}${r.n?`<span class="sub">${esc(r.n)}</span>`:""}${r.cut && (isHJ || g==="All")?`<span class="sp-cut">H/J: skip this set on days with a full hurdle or jump technical session.</span>`:""}</td>
      <td class="rx">${esc(r.p)}</td><td class="rest">${r.r?esc(r.r):""}</td></tr>`; }).join("")}</tbody></table>`;
}
function sessionHTML(w, day, wi){
  const S = w[day.toLowerCase()]; if (!S) return "";
  const env = SP.env, rows = (env==="in" ? (S.in || S.out) : S.out);
  const same = env==="in" && !S.in;
  const a = meA();
  const g = SP.g;
  const brk = w.st==="break";
  const envName = brk ? (env==="in" ? "At home" : "Outdoors") : (env==="in" ? "Indoor: hallway / gym" : "Outdoor: track");
  return `<div class="day"><div class="when">${day}<small>${fmt(dateOf(w,day))} · ${brk?"optional":DUR[day]}</small></div>
    <div class="sp-sess"><div class="sp-head"><span class="muted" style="font-size:13px">${esc(envName)}${same?" · same plan in either space (keep starts ≤10–20m indoors)":""}</span>
      ${canPost && !brk ? `<button type="button" class="btn sm" onclick="SP.print(${wi},'${day}')">Print session plan</button>` : ""}</div>
      ${rowsHTML(rows, w.mo, env, g, a)}</div></div>`;
}

/* ---------- print: coach-facing daily session plan ---------- */
SP.print = function(wi, day){
  const w = SP_WEEKS[wi], S = w[day.toLowerCase()];
  const one = (env) => { const rows = env==="in" ? (S.in||S.out) : S.out;
    return `<h2>${env==="in"?"Indoor (hallway / gym)":"Outdoor (track)"}</h2><table><tr><th>Block</th><th>Prescription</th><th>Rest</th><th>Groups / notes</th></tr>
    ${rows.map(r=>{
      if (r.wu) return `<tr><td><b>Standard warm-up</b></td><td>12–15 min</td><td></td><td>${WARMUP.map(x=>esc(x[0])).join(" → ")}</td></tr>`;
      if (r.str) { const s = STR[r.str]; return `<tr><td><b>Strength</b> · ${esc(s.n)}</td><td>30–35 min</td><td></td><td>${s.ex.map(e=>esc(e[0]+" "+e[1])).join("; ")}${r.mod?". "+esc(STR_MOD[r.mod]):""}</td></tr>`; }
      if (r.tech) return `<tr><td><b>${esc(r.x)}</b></td><td>${esc(r.p)}</td><td></td><td>S1/S2: ${esc((SPRINT_TECH[w.mo]||[]).map(x=>x[0]).join("; "))}<br>H: ${esc((HURDLE_TECH[w.mo]||[]).map(x=>x[0]+" "+x[1]).join("; "))}<br>J: ${esc(Object.entries(JUMPS).map(([k,J])=>k+": "+(J.mo[w.mo]||[]).join(", ")).join(" | "))}</td></tr>`;
      return `<tr><td><b>${esc(r.x)}</b>${r.i&&INT[r.i]?` (${esc(INT[r.i][0])})`:""}</td><td>${esc(r.p)}</td><td>${esc(r.r||"")}</td><td>${r.g?esc(r.g.join("/")):"All"}${r.cut?" · H/J may skip":""}${r.n?" · "+esc(r.n):""}</td></tr>`; }).join("")}</table>`; };
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Session plan · ${esc(day)} ${esc(fmt(dateOf(w,day)))}</title>
    <style>body{font:13px/1.4 system-ui,sans-serif;margin:24px;color:#111}h1{font-size:20px;margin:0}h2{font-size:15px;margin:16px 0 6px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #bbb;padding:5px 7px;text-align:left;vertical-align:top}th{background:#eee}.n{margin-top:12px;font-size:12px}</style></head><body>
    <h1>BC Sprints, Hurdles &amp; Jumps · Week ${w.n} · ${esc(day)} ${esc(fmt(dateOf(w,day)))}</h1>
    <div>Focus: <b>${esc(w.focus)}</b> · ${esc(ST[w.st][0])} · ${esc(DUR[day])}</div>
    ${one("out")}${S.in?one("in"):""}
    <div class="n"><b>Every session:</b> full recovery between max reps (2–3 min short accelerations, 4–6 min flying). Indoor accelerations 10–20m only with traction, clear lanes and stopping room, and coach approval. No indoor flying sprints unless the approach, timed zone and stopping area are verified. If sprinting isn't safe, swap for technical drills, controlled power and strength. Reduce volume for beginners, returning-from-injury athletes, and anyone doing a full hurdle/jump session. S3 hybrids follow the Mid-Distance plan unless assigned this session.</div>
    <div class="n">Attendance / notes: ______________________________________________</div>
    <script>window.onload=()=>window.print()<\/script></body></html>`;
  const win = window.open("", "_blank"); if (!win) return; win.document.write(html); win.document.close();
};

/* ---------- views ---------- */
function calendarView(){
  if (SP.wi===null) SP.wi = curWeekIdx();
  const wi = SP.wi, w = SP_WEEKS[wi], ci = curWeekIdx();
  const a = meA(), ag = a ? groupOf(a) : null;
  const hs = hsAthletes().filter(x=>groupOf(x) && groupOf(x).p!=="MD").sort((x,y)=>x.name.localeCompare(y.name));
  const meBar = `<div class="sp-me"><label for="sp-me" class="muted" style="font-size:14px">Find my workout:</label>
    <select id="sp-me" onchange="SP.setMe(this.value)"><option value="">Pick your name</option>${hs.map(x=>`<option value="${x.id}" ${SP.me===x.id?"selected":""}>${esc(x.name)}</option>`).join("")}</select>
    ${a && ag ? `<span>${chip(ag.p)}${(ag.s||[]).map(chip).join("")}</span>` : ""}</div>`;
  const s3 = (SP.g==="S3" || (ag && ag.p==="S3")) ? `<div class="sp-banner">${a && ag && ag.p==="S3" && (SP.groups[a.id]||{}).s3==="sprint" ? `<b>${esc(a.name)}</b> is assigned this sprint session (S3 on the sprint plan).` : `<b>S3 hybrids follow the <a href="#middistance">Mid-Distance plan</a></b> by default. Do this sprint session only if your coach assigns it. Never both on the same day.`}</div>` : "";
  return `<div class="bar" style="justify-content:flex-start">
      <div class="seg" role="group" aria-label="Indoor or outdoor">${[["out","Outdoor"],["in","Indoor"]].map(([k,l])=>`<button type="button" aria-pressed="${SP.env===k}" onclick="SP.setEnv('${k}')">${w.st==="break" ? (k==="in"?"At home":"Outdoors") : l}</button>`).join("")}</div>
      <div class="filters" role="group" aria-label="Group">${["All",...GKEYS].map(g=>`<button type="button" aria-pressed="${SP.g===g}" onclick="SP.g='${g}';render()">${g==="All"?"All groups":g}</button>`).join("")}</div></div>
    ${meBar}
    <div class="sp-wkgrid">${SP_WEEKS.map((x,i)=>`<button type="button" class="sp-wk ${x.st==="break"?"brk":""} ${i===ci && today>=parseD(SP_WEEKS[0].start)?"now":""}" aria-pressed="${i===wi}" onclick="SP.wi=${i};render()"><b>Wk ${x.n} · ${fmt(parseD(x.start))}</b>${esc(x.focus)}</button>`).join("")}</div>
    <div><h2 style="margin:6px 0 4px">Week ${w.n} · ${esc(w.focus)}</h2>
      <div class="${ST[w.st][1]}">${esc(ST[w.st][0])}${w.st==="break" ? ". Dec 21 – Jan 3: no practices. Here are things to do if you'd like." : w.st==="vol" ? ". Follow current IHSAA out-of-season rules; confirm with the AD." : ""}${w.test ? " <b>Testing week:</b> log times with method, surface and indoor/outdoor." : ""}</div></div>
    ${s3}
    ${w.st==="break" && w.n===4 ? `<div class="panel"><p style="margin:0">No organized workouts. Optional: mobility and easy technical work below.</p></div>` : ""}
    <div class="days">${sessionHTML(w,"Tue",wi)}${sessionHTML(w,"Thu",wi)}</div>
    <p class="note">Every max rep gets full recovery. Coaches reduce volume for beginners, athletes returning from injury, and athletes doing a full hurdle or jump session. Times from indoor and outdoor, or hand and electronic timing, are never compared directly.</p>`;
}
function drillCard(id){
  const D = DRILLS[id];
  const ul = a => `<ul>${a.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`;
  return `<div class="panel sp-drill" id="dr-${id}" style="${SP.drill===id?"box-shadow:0 0 0 2px var(--gold)":""}"><h3>${esc(D.n)}<span class="sp-env">${D.env==="out"?"Outdoor":D.env==="in"?"Indoor":"Indoor + outdoor"}</span></h3>
    <p style="margin:0">${esc(D.desc)}</p><dl>
    <dt>Purpose</dt><dd>${esc(D.why)}</dd><dt>Setup</dt><dd>${esc(D.setup)}</dd><dt>Sets / reps</dt><dd class="mono">${esc(D.dose)}</dd>
    <dt>Cues</dt><dd>${ul(D.cues)}</dd><dt>Mistakes</dt><dd>${ul(D.errs)}</dd><dt>Progress</dt><dd>${ul(D.prog)}</dd><dt>Regress</dt><dd>${ul(D.reg)}</dd>
    ${D.url?`<dt>Video</dt><dd><a href="${esc(D.url)}" target="_blank" rel="noopener">▶ Watch</a></dd>`:""}</dl></div>`;
}
function drillsView(){
  const cats = CATS_ORDER.filter(c => Object.values(DRILLS).some(d=>d.cat===c));
  SP.dcat = SP.dcat || "All";
  const ids = Object.keys(DRILLS).filter(id => SP.dcat==="All" || DRILLS[id].cat===SP.dcat);
  return `<div class="filters" role="group" aria-label="Drill type">${["All",...cats].map(c=>`<button type="button" aria-pressed="${SP.dcat===c}" onclick="SP.dcat='${c}';render()">${c}</button>`).join("")}</div>
    <div class="sp-drills">${ids.map(drillCard).join("")}</div>
    <p class="note">Video links can be added to any drill (the <code>url</code> field in sprints.js) once we pick the clips we like.</p>`;
}
function philView(){
  return `<div class="panel"><h2>Our philosophy</h2>
      <p style="margin:0 0 8px">About <b>80% Tony Holler (Feed the Cats)</b> and <b>20% Jack Daniels</b>-style individual progression and planning. That's a blend of coaching ideas, not an 80/20 easy/hard split.</p>
      <div class="cols"><div><h3 style="margin:0 0 6px">Feed the cats</h3><ul class="exp"><li>Max velocity and acceleration come first</li><li>Sprint fast while fresh, early in the session</li><li>Time sprints whenever we can</li><li>Full recovery between max reps</li><li>No conditioning for conditioning's sake</li><li>Competition is a big part of training</li></ul></div>
        <div><h3 style="margin:0 0 6px">Plan like Daniels</h3><ul class="exp"><li>Progressions fit each athlete's event, training age and readiness</li><li>Volumes are starting points; coaches reduce them when needed</li><li>Strength, plyos, hurdles and jumps are added without overloading</li><li>Peak for championship meets</li></ul></div>
        <div><h3 style="margin:0 0 6px">Measure it</h3><ul class="exp"><li>Improvement, not just workout completion</li><li>Baseline testing Week 5, reassessment Week 8</li><li>10m, 20m, flying 10/20m, standing broad jump, block-start scores</li></ul></div></div></div>
    <div class="panel sp-stage"><h2>Signature priorities</h2><p style="margin:0">Our biggest team-wide weaknesses: <b>starting-block mechanics, initial acceleration, and explosiveness</b>. Every winter week trains them. See the <a href="#sprints" onclick="SP.tab='blocks';render();return false">block-start pathway</a>.</p></div>
    <div class="panel"><h2>Training groups</h2><div class="tbl"><table><thead><tr><th>Group</th><th>Events</th><th>Emphasis</th></tr></thead><tbody>
      ${GKEYS.map(k=>`<tr><td>${chip(k)} <b>${esc(GROUPS[k].n)}</b></td><td>${esc(GROUPS[k].ev)}</td><td>${esc(GROUPS[k].em)}</td></tr>`).join("")}</tbody></table></div>
      <p class="note" style="margin:8px 0 0">Each athlete has <b>one primary group</b> and optional secondary events. We never stack full workouts from two groups on one athlete: hurdle and jump work <b>replaces</b> sprint volume, it doesn't add to it.</p></div>
    <div class="cols"><div class="panel"><h2>Winter week</h2><div class="tbl"><table><tbody>
        <tr><td><b>Tue</b></td><td>Speed + acceleration</td><td class="mono">60–75 min</td></tr>
        <tr><td><b>Thu</b></td><td>Speed mechanics, event technique, power, weight room</td><td class="mono">75–90 min</td></tr></tbody></table></div>
        <p class="note" style="margin:8px 0 0">Starts Dec 7. Dec 21 – Jan 3 is athlete-led: no practices, optional work only. Winter sessions are voluntary/out-of-season and follow current IHSAA rules (confirm with the AD).</p></div>
      <div class="panel"><h2>Indoor rules</h2><ul class="exp"><li>Hallway/gym space is about 40–60m <b>including</b> slowing down</li><li>Indoor accelerations start at 10–20m, only with traction, clear lanes, stopping room and coach approval</li><li>No indoor flying sprints unless the approach, timed zone and stopping area are verified safe</li><li>If sprinting isn't safe: technical drills, controlled power, strength</li></ul></div></div>`;
}
function warmView(){
  return `<div class="panel"><h2>Standard warm-up · 12–15 min</h2><div class="tbl"><table><thead><tr><th>Part</th><th>Time</th><th>What</th></tr></thead><tbody>
    ${WARMUP.map(([a,b,c])=>`<tr><td><b>${esc(a)}</b></td><td class="mono">${esc(b)}</td><td>${esc(c)}</td></tr>`).join("")}</tbody></table></div>
    <p class="note" style="margin:8px 0 0">Form drills take 8–12 minutes and focus on one or two meaningful cues. Avoid long static stretching before max sprinting.</p></div>
    <div class="sp-drills">${["amarch","ankling","dribble","buildup"].map(drillCard).join("")}</div>`;
}
function blocksView(){
  return `<div class="panel"><h2>Starting-block pathway</h2><p style="margin:0">Four stages, one per phase of the season. Starts happen early in the session when athletes are fresh.</p></div>
    <div class="cols">${BLOCKS.map((b,i)=>`<div class="panel sp-stage"><div class="mlabel" style="margin:0">Stage ${i+1} · ${esc(b.mo)}</div><h3 style="margin:2px 0 6px">${esc(b.t)}</h3><ul class="exp" style="margin:0">${b.items.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`).join("")}</div>
    <div class="panel"><h2>Block Start Scorecard</h2><p style="margin:0 0 8px">Coaches rate each item 1–5 from live viewing or video, with a video link and notes. Recording scores comes with the Speed &amp; Power profiles (next update).</p>
      <div class="tbl"><table><thead><tr><th>Item</th><th>What a 5 looks like</th></tr></thead><tbody>${SCORECARD.map(([a,b])=>`<tr><td><b>${esc(a)}</b></td><td>${esc(b)}</td></tr>`).join("")}</tbody></table></div>
      <p class="note" style="margin:8px 0 0">Times alone don't diagnose technique. A slow 10m could be setup, push, first steps, or just a tired day: watch it or film it.</p></div>
    <div class="sp-drills">${["fall","three","block","wall"].map(drillCard).join("")}</div>`;
}
function hurdleView(){
  return `<div class="panel"><h2>Hurdle development</h2><p style="margin:0">We're planning to buy about four <a href="https://www.everythingtrackandfield.com/First-Place-Split-Bar-Training-Hurdle/" target="_blank" rel="noopener">First Place Split Bar Training Hurdles</a> for confidence, attacking mechanics, first-hurdle execution and rhythm. Conventional hurdles stay in use for competition-specific work.</p></div>
    <div class="cols">${HURDLES.map(h=>`<div class="panel sp-stage"><div class="mlabel" style="margin:0">${esc(h.mo)}</div><ul class="exp" style="margin:6px 0 0">${h.items.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`).join("")}</div>
    <div class="cols"><div class="panel"><h2>Example technical session</h2><ol class="exp"><li>Warm-up</li><li>Lead/trail-leg drills: 2×5 each leg</li><li>Single-hurdle attacks: 4 reps</li><li>Rhythm: 3 × 2–3 hurdles if space permits</li><li>Short video feedback</li><li>Strength or mobility as scheduled</li></ol></div>
      <div class="panel"><h2>Rules</h2><ul class="exp"><li>Indoors, start with one or two hurdles. Add more only when approach, spacing, clearance and stopping room are safe.</li><li>Hurdle reps count as high-intensity work. Never add a full hurdle session on top of a full max-sprint session.</li></ul></div></div>
    <div class="sp-drills">${["hlead","htrail","hmob","hwalk","hsingle","hrhythm","hstart"].map(drillCard).join("")}</div>`;
}
function jumpsView(){
  return `<div class="panel"><h2>Jump development</h2><p style="margin:0">Jumpers share the acceleration and max-velocity work, with sprint volume adjusted for jumping days. Event work below follows the calendar month.</p></div>
    <div class="cols">${Object.entries(JUMPS).map(([e,J])=>`<div class="panel"><h2>${esc(e)}</h2><ul class="exp" style="margin:0">${J.focus.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
      ${["dec","jan","feb"].map(m=>`<div class="mlabel">${({dec:"December",jan:"January",feb:"February"})[m]}</div><ul class="exp" style="margin:4px 0 0">${J.mo[m].map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`).join("")}
      <p class="note" style="margin:8px 0 0">Drills: ${J.drills.map(d=>drillLink(d, DRILLS[d].n)).join(" · ")}</p></div>`).join("")}</div>
    <p class="note">Pole vault technical sessions require qualified supervision and proper facilities and equipment. No high jump or pole vault landings without a pit.</p>`;
}
function strengthView(){
  return `<div class="panel"><h2>Thursday weight room · 30–35 min</h2><p style="margin:0">Supervised and individualized. Never to failure. Exercise menu: trap-bar deadlift or squat variation, dumbbell bench, Romanian deadlift, rows or pull-ups, split squats, core stabilization, med-ball power.</p></div>
    <div class="cols">${["dec","jan","feb","spring"].map(k=>{ const S = STR[k]; return `<div class="panel"><h2>${esc(S.n)}</h2><div class="tbl" style="border:0"><table><tbody>${S.ex.map(([n,p])=>`<tr><td>${esc(n)}</td><td class="mono">${esc(p)}</td></tr>`).join("")}</tbody></table></div><p class="note" style="margin:6px 0 0">${esc(S.note)}</p></div>`; }).join("")}</div>`;
}
function groupsView(){
  const by = {}; hsAthletes().forEach(a => { const g = groupOf(a); if (!g) return; (by[g.p] ||= []).push([a,g,"p"]); (g.s||[]).forEach(s => (by[s] ||= []).push([a,g,"s"])); });
  const anySug = hsAthletes().some(a => !SP.groups[a.id] && suggest(a));
  return `${anySug ? `<p class="note" style="margin:0">${canPost ? `Some groups are <i>suggested</i> from last season's events until a coach saves them on <a href="#coaches" onclick="ctab='sgroups'">Coaches → Sprint Groups</a>.` : "Groups are still being finalized by the coaches."}</p>` : ""}
    <div class="cols">${[...GKEYS,"MD"].filter(k=>by[k]).map(k=>`<div class="panel"><h2>${chip(k)} ${esc(GROUPS[k].n)}</h2><p class="note" style="margin:0 0 6px">${esc(GROUPS[k].ev)}</p>
      <ul class="exp" style="margin:0">${by[k].sort((x,y)=>(x[2]===y[2]?0:x[2]==="p"?-1:1) || x[0].name.localeCompare(y[0].name)).map(([a,g,t])=>`<li>${t==="p"?`<b>${esc(a.name)}</b>`:`${esc(a.name)} <span class="muted" style="font-size:12px">(secondary)</span>`}${canPost&&g.sug?` <span class="sp-sug">suggested</span>`:""}</li>`).join("")}</ul></div>`).join("")}</div>`;
}

const TABS = [["cal","Calendar"],["phil","Philosophy"],["warm","Warm-up"],["drills","Drill Library"],["blocks","Block Starts"],["hurdles","Hurdles"],["jumps","Jumps"],["strength","Strength"],["groups","Groups"]];
views.sprints = function(){
  const body = SP.tab==="phil" ? philView() : SP.tab==="warm" ? warmView() : SP.tab==="drills" ? drillsView() : SP.tab==="blocks" ? blocksView() : SP.tab==="hurdles" ? hurdleView() : SP.tab==="jumps" ? jumpsView() : SP.tab==="strength" ? strengthView() : SP.tab==="groups" ? groupsView() : calendarView();
  return `${back}<div class="stack"><div><div class="eyebrow">2026–27 winter foundation · High school</div><h1>Sprints, Hurdles &amp; Jumps</h1>
      <p class="lede" style="margin:6px 0 0">Fast and fresh. Full recovery. Measure what matters: starts, acceleration, explosiveness.</p></div>
    <div class="seg mdtabs" role="group" aria-label="Section">${TABS.map(([k,l])=>`<button type="button" aria-pressed="${SP.tab===k}" onclick="SP.tab='${k}';render()">${l}</button>`).join("")}</div>
    ${body}</div>`;
};
SP.setEnv = e => { SP.env = e; try { localStorage.setItem("sp-env", e); } catch(x){} render(); };
SP.setMe = id => { SP.me = id; try { localStorage.setItem("sp-me", id); } catch(x){} const a = meA(), g = a && groupOf(a); SP.g = g && g.p!=="MD" ? g.p : "All"; render(); };

/* ---------- coach editor: Coaches → Sprint Groups ---------- */
SP.editor = function(){
  if (!SP.draft) SP.draft = JSON.parse(JSON.stringify(SP.groups));
  const D = SP.draft;
  const list = hsAthletes().filter(a => SP.gshow==="all" ? (suggest(a) || D[a.id]) : SP.gshow==="unset" ? !D[a.id] && suggest(a) : true)
    .filter(a => !SP.gq || a.name.toLowerCase().includes(SP.gq.toLowerCase()))
    .sort((x,y)=>x.g.localeCompare(y.g) || x.name.localeCompare(y.name));
  const cur = a => D[a.id] || suggest(a) || {p:"", s:[]};
  return `<p class="lede" style="margin:0">Give each high school sprinter, hurdler and jumper one <b>primary group</b> and any <b>secondary events</b>. Suggestions come from last season's events: check them, change what's off, and save. Groups show publicly on the Sprints page (no notes here).</p>
    <div class="bar" style="justify-content:flex-start">${segBtns(SP.gshow,[["all","Sprint/hurdle/jump kids"],["unset","Not saved yet"],["every","Every HS athlete"]],"(v=>{SP.gshow=v;render()})")}
      <input id="sp-gsearch" class="search" type="search" placeholder="Search name" value="${esc(SP.gq)}" oninput="SP.gq=this.value;render();const e=document.getElementById('sp-gsearch');e.focus();e.setSelectionRange(e.value.length,e.value.length)"></div>
    <div class="tbl sp-ged"><table><thead><tr><th>Athlete</th><th>Primary</th><th>Secondary</th><th>S3 follows</th><th></th></tr></thead><tbody>
    ${list.map(a=>{ const c = cur(a), saved = !!D[a.id];
      return `<tr><td class="nm"><b>${esc(a.name)}</b><div class="muted" style="font-size:12px">${a.g==="B"?"Boys":"Girls"} · ${a.grade} · ${esc((a.cats||[]).join(", ")||"no events yet")}</div></td>
        <td><select aria-label="Primary group for ${esc(a.name)}" onchange="SP.setG('${a.id}','p',this.value)"><option value="">None</option>${[...GKEYS,"MD"].map(k=>`<option value="${k}" ${c.p===k?"selected":""}>${k==="MD"?"Dist/Mid program":k+" · "+GROUPS[k].n}</option>`).join("")}</select></td>
        <td>${GKEYS.filter(k=>k!==c.p).map(k=>`<label class="ed-check" style="margin-right:6px"><input type="checkbox" ${(c.s||[]).includes(k)?"checked":""} onchange="SP.setG('${a.id}','s:${k}',this.checked)"> ${k}</label>`).join("")}</td>
        <td>${c.p==="S3"?`<select aria-label="S3 plan for ${esc(a.name)}" onchange="SP.setG('${a.id}','s3',this.value)"><option value="mid" ${(c.s3||"mid")==="mid"?"selected":""}>Mid-Distance plan</option><option value="sprint" ${c.s3==="sprint"?"selected":""}>Sprint plan</option></select>`:`<span class="muted">—</span>`}</td>
        <td>${saved?"":`<span class="sp-sug">suggested</span>`}</td></tr>`; }).join("")}
    </tbody></table></div>
    <div class="ed-save"><button type="button" class="btn primary" onclick="SP.saveGroups(false)" ${saving?"disabled":""}>${saving?"Saving…":"Save groups"}</button>
      <button type="button" class="btn" onclick="SP.saveGroups(true)" ${saving?"disabled":""}>Accept all suggestions + save</button></div>
    <p class="ed-msg ${SP.msg.kind}" role="status" style="margin:0">${esc(SP.msg.text)}</p>`;
};
SP.setG = function(id, k, v){
  const a = ATHLETES.find(x=>x.id===id); const D = SP.draft;
  const t = Object.assign({}, D[id] || suggest(a) || {p:"", s:[]}); delete t.sug; t.s = [...(t.s||[])];
  if (k==="p") { t.p = v; t.s = t.s.filter(x=>x!==v); if (v!=="S3") delete t.s3; }
  else if (k==="s3") t.s3 = v;
  else if (k.startsWith("s:")) { const g = k.slice(2); t.s = v ? [...new Set([...t.s, g])] : t.s.filter(x=>x!==g); }
  if (!t.p && !t.s.length) delete D[id]; else D[id] = t;
  SP.msg = {kind:"",text:""}; render();
};
SP.saveGroups = async function(acceptAll){
  const next = JSON.parse(JSON.stringify(SP.draft || SP.groups));
  if (acceptAll) hsAthletes().forEach(a => { if (!next[a.id]) { const s = suggest(a); if (s) next[a.id] = {p:s.p, s:s.s}; } });
  const err = await publishFiles({"sgroups.json": JSON.stringify(next)});
  if (err) SP.msg = {kind:"err", text:err};
  else { SP.groups = next; SP.draft = JSON.parse(JSON.stringify(next)); SP.msg = {kind:"ok", text:`Saved ${Object.keys(next).length} athletes' groups.`}; }
  render();
};

/* ---------- Workouts page: show the sprint sessions in the Sprints / Hurdles / jump groups (display only, never saved into the posted weeks) ---------- */
const plain = r => r.wu ? "Standard sprint warm-up: 12–15 min" : r.str ? `Weight room: ${STR[r.str].n} (30–35 min)${r.mod?" · "+STR_MOD[r.mod]:""}` : `${r.x}${r.p?": "+r.p:""}${r.r?" · rest "+r.r:""}${r.i&&INT[r.i]?" · "+INT[r.i][0]:""}${r.g?" ("+r.g.join("/")+")":""}`;
SP.inject = function(w){
  if (!w || !w.start) return w;
  const sw = SP_WEEKS.find(x => x.start===w.start); if (!sw) return w;
  const copy = Object.assign({}, w, {days:(w.days||[]).map(d=>Object.assign({}, d, {groups:Object.assign({}, d.groups||{}), combos:[...(d.combos||[])]}))});
  ["Tue","Thu"].forEach(day => {
    const S = sw[day.toLowerCase()]; if (!S) return;
    const env = SP.env, rows = env==="in" ? (S.in||S.out) : S.out;
    let d = copy.days.find(x=>x.day===day);
    if (!d) { d = {day, focus:"", all:[], groups:{}, combos:[]}; copy.days.push(d); copy.days.sort((a,b)=>["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].indexOf(a.day)-["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].indexOf(b.day)); }
    const items = [{t:`${sw.st==="break" ? "Optional, on your own" : (env==="in" ? "Indoor plan" : "Outdoor plan")} · ${sw.focus} → full plan, indoor/outdoor, your group`, link:"#sprints", lv:"HS"}]
      .concat(rows.filter(r=>!r.tech).map(r => ({t: plain(r), lv:"HS"})));
    const SG = ["Sprints","Hurdles","Long Jump","High Jump","Pole Vault"];
    d.combos.push({groups:SG, name:"Sprints · Hurdles · Jumps", items});
    d.gfocus = Object.assign({}, d.gfocus||{}); SG.forEach(g => { if (!d.gfocus[g]) d.gfocus[g] = sw.focus; });
    const tech = rows.some(r=>r.tech);
    if (tech) {
      const m = sw.mo;
      const add = (g, arr) => { d.groups[g] = (d.groups[g]||[]).concat(arr.map(t=>({t, lv:"HS"}))); };
      add("Sprints", (SPRINT_TECH[m]||[]).filter(x=>x[0]).map(x=>"Technique: " + x[0] + (x[1]?" · "+x[1]:"")));
      add("Hurdles", (HURDLE_TECH[m]||[]).map(x=>"Technique: " + x[0] + " · " + x[1]));
      add("Long Jump", (JUMPS["Long Jump"].mo[m]||[]).concat((JUMPS["Triple Jump"].mo[m]||[]).map(x=>"TJ: "+x)).map(x=>"Technique: " + x));
      add("High Jump", (JUMPS["High Jump"].mo[m]||[]).map(x=>"Technique: " + x));
      add("Pole Vault", (JUMPS["Pole Vault"].mo[m]||[]).map(x=>"Technique (qualified supervision): " + x));
    }
    if (d.focus && typeof d.focus==="object") { if (!d.focus.HS) d.focus = Object.assign({}, d.focus, {HS: sw.focus}); }
    else if (!d.focus) d.focus = {HS: sw.focus, JH: ""};
  });
  return copy;
};

/* ---------- data + registration ---------- */
SP.onData = function(byKey){
  if (byKey && byKey.sgroups && typeof byKey.sgroups === "object") { SP.groups = byKey.sgroups; SP.draft = null; }
};
if (window.HUB_BYKEY) SP.onData(window.HUB_BYKEY);
if (!SECTIONS.some(s=>s.id==="sprints")) {
  const i = SECTIONS.findIndex(s=>s.id==="middistance");
  SECTIONS.splice(i+1, 0, {id:"sprints", g:"train", name:"Sprints, Hurdles & Jumps", blurb:"Sprint, hurdle and jump program: winter calendar (indoor/outdoor), drills, block starts, strength"});
}
SP.weeks = SP_WEEKS; SP.drills = DRILLS; SP.suggest = suggest; SP.groupOf = groupOf;
render();
})();
