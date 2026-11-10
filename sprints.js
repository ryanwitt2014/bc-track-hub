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
.sp-grp.S1{background:#004631;color:#fff}.sp-grp.S2{background:#fcb827;color:#161105}.sp-grp.S3{background:#6b4fa3;color:#fff}.sp-grp.H{background:#b4472b;color:#fff}.sp-grp.J{background:#2f4f8f;color:#fff}.sp-grp.MD{background:transparent;border:1px solid var(--line);color:var(--muted)}
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
.sp-strip{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.sp-dbtn{border:1px solid var(--line);border-radius:6px;background:var(--surface);color:var(--fg);padding:6px 2px;display:grid;justify-items:center;gap:1px;cursor:pointer;font:12px var(--body);min-width:0}
.sp-dbtn b{font-size:12px;letter-spacing:.04em;text-transform:uppercase}.sp-dbtn span{font:600 18px var(--display)}.sp-dbtn small{font-size:10px;line-height:1.1;text-align:center;color:var(--muted);overflow-wrap:anywhere}
.sp-dbtn[aria-pressed="true"]{box-shadow:inset 0 0 0 2px var(--accent);border-color:var(--accent)}.sp-dbtn.today span{color:var(--accent);text-decoration:underline}
.sp-dbtn:disabled{opacity:.4;cursor:default}
.sp-dbtn.lb-speed,.sp-dbtn.lb-power{border-top:4px solid var(--accent)}.sp-dbtn.lb-rec{border-top:4px solid #6aa4c8}.sp-dbtn.lb-gf{border-top:4px solid var(--gold)}.sp-dbtn.lb-opt{border-top:4px dashed var(--gold)}.sp-dbtn.lb-rest{border-top:4px solid var(--line)}.sp-dbtn.lb-meet{border-top:4px solid #b4472b}
.sp-lb{display:inline-block;font:700 12px var(--body);border-radius:3px;padding:2px 8px;white-space:nowrap}
.sp-lb.lb-gsc{background:transparent;border:2px solid var(--accent);color:var(--fg)}.sp-dbtn.lb-gsc{border-top:4px double var(--accent)}
.sp-lb.lb-speed,.sp-lb.lb-power{background:var(--accent);color:var(--accent-ink)}.sp-lb.lb-rec{background:#6aa4c8;color:#0b1d29}.sp-lb.lb-gf{background:var(--gold);color:var(--gold-ink)}.sp-lb.lb-opt{background:transparent;border:1px dashed var(--gold);color:var(--fg)}.sp-lb.lb-rest{background:var(--chip);color:var(--fg)}.sp-lb.lb-meet{background:#b4472b;color:#fff}
.sp-daycard{display:grid;gap:10px}
.sp-ddate{font:600 13px var(--mono);color:var(--muted);margin-bottom:4px}
.sp-dtitle{margin:0;font-size:24px}
.sp-facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
.sp-facts div{background:var(--chip);border-radius:5px;padding:8px 10px;display:grid;gap:2px}
.sp-facts span{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}.sp-facts b{font-size:14px;font-weight:600}
.sp-pre{margin:0;font-size:15px}
.sp-checks{list-style:none;margin:4px 0 0;padding:0;display:grid;gap:4px}
.sp-step{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);border-radius:5px;padding:8px 10px;background:var(--surface)}
.sp-step input{width:22px;height:22px;margin:1px 0 0;accent-color:var(--accent);flex:none}
.sp-step details{flex:1;min-width:0}.sp-step summary{cursor:pointer;list-style:none}.sp-step summary::-webkit-details-marker{display:none}
.sp-step summary .dose{color:var(--muted);font-weight:500}.sp-step summary .how{font-size:12px;color:var(--accent);font-weight:600;margin-left:6px;white-space:nowrap}.sp-step details[open] .how{display:none}
.sp-cue{font-size:14px;color:var(--muted);margin-top:4px}
.sp-alts{display:grid;gap:6px}
.sp-done{display:flex;flex-wrap:wrap;gap:6px;align-items:center;border-top:1px dashed var(--line);padding-top:10px}
.sp-done .btn[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
.sp-ed td{vertical-align:top}.sp-ed select,.sp-ed input{font:14px var(--body);padding:4px 6px;border:1px solid var(--line);border-radius:4px;background:var(--bg);color:var(--fg);max-width:100%}
@media (max-width:620px){.sp-dbtn small{display:none}.sp-dtitle{font-size:20px}}
@media (max-width:620px){.sp-rows tr{display:block;border-top:1px solid var(--line);padding:6px 0}.sp-rows tr:first-child{border-top:0}.sp-rows td{display:block;border:0;padding:1px 4px}.sp-rows td.rx,.sp-rows td.rest{display:inline-block;padding-top:0}.sp-rows td.rest{white-space:normal}.sp-rows td.rest:not(:empty)::before{content:"rest ";}.sp-drill dl{grid-template-columns:1fr}.sp-drill dt{padding-top:6px}}
`;
const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

/* ---------- groups ---------- */
const GROUPS = {
  S1:{n:"Short Sprints", ev:"100 · 200 · sprint relays", em:"Acceleration, max velocity, speed endurance, block starts"},
  S2:{n:"Long Sprints", ev:"200 · 400", em:"Acceleration, max velocity, speed endurance, race preparation"},
  S3:{n:"Sprint/Mid Hybrids", ev:"400 · 800", em:"Follows the Mid-Distance plan by default; a coach can assign the sprint session instead (never both)"},
  H:{n:"Hurdles", ev:"100/110H · 300H", em:"Shares sprint development with S1/S2, plus hurdle technique"},
  J:{n:"Jumps", ev:"LJ · HJ · PV", em:"Shares acceleration and max-velocity work, plus approach, takeoff and event technique"},
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
  ljapp:{n:"Approach runs (LJ)", cat:"Jumps", env:"out", desc:"Run-throughs on the approach with a coach checking the mark at 4 steps out and the board.",
    why:"Approach consistency: the biggest variable in the horizontal jumps.", setup:"Runway or track, check-marks.", dose:"3–4 run-throughs",
    cues:["Same start every time","Accelerate the whole way","Eyes up, not on the board"], errs:["Changing the start","Slowing at the board"],
    prog:["Approach into takeoff"], reg:["Short approach (6–8 steps)"]},
  ljpen:{n:"Penultimate step drill", cat:"Jumps", env:"both", desc:"Skip or run into a slightly longer, lower second-to-last step and a quick last step.",
    why:"Sets up a fast, flat takeoff.", setup:"Floor or runway, cones.", dose:"2 × 4",
    cues:["Long then quick","Hips stay tall"], errs:["Sitting down too much","Chopping steps"], prog:["Short approach jumps"], reg:["Walking penultimate rhythm"]},
  ljpop:{n:"Short-approach pop-ups", cat:"Jumps", env:"out", desc:"4–8 step approach, takeoff, and hold the flight position into the pit.",
    why:"Takeoff mechanics without full-approach load.", setup:"Sand pit. Indoors: no takeoffs onto a hard floor; use soft landing mats only.", dose:"4–6 jumps",
    cues:["Run off the board","Knee up, chest up"], errs:["Reaching for the board","Leaning back early"], prog:["Mid approach jumps"], reg:["Standing long jumps into sand"]},
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
const WARMUP_HS = [
  ["Easy movement + activation","2–3 min","Jog, skips, side shuffles, carioca, leg swings."],
  ["Dynamic mobility","3 min","Walking lunge with reach, hip openers/closers, inchworm, world's greatest stretch. No long static holds before sprinting."],
  ["Coordination drills","4–5 min","A-march → A-skip, ankling, dribbles (ankle → calf → knee). Pick one or two cues for the day."],
  ["Build-ups","2–3 min","2 × 40m at 70% then 85%. Indoors: 2 × 15m at 70%, or skip if stopping room is short."],
  ["Event prep","2 min","Sprinters: 2 falling-start rehearsals. Hurdlers: walkovers. Jumpers: 2 short approach rhythm runs."],
];

/* ---------- pathways ---------- */
const BLOCKS_HS = [
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
const HURDLES_HS = [
  {mo:"December", items:["Lead-leg drills","Trail-leg drills","Hurdle mobility","Walking clearance","Controlled single-hurdle drills"]},
  {mo:"January", items:["Short approaches","Single-hurdle attacks","Reduced-height rhythm drills","Progressive three-step patterns where appropriate"]},
  {mo:"February", items:["Starts to the first hurdle","Two-to-four hurdle sequences","Rhythm consistency","Increased approach speed"]},
  {mo:"March–May", items:["Competition-height progression","Race-specific spacing","Full approach rhythm","100/110H and 300H race preparation"]},
];
const JUMPS_HS = {
  "Long Jump":{focus:["Approach consistency","Acceleration","Penultimate step","Takeoff mechanics","Landing technique"], drills:["ljapp","ljpen","ljpop"],
    mo:{dec:["Approach check-mark runs ×4 (outdoors) or 6–8 step rhythm runs (indoors)","Penultimate step drill 2×4"], jan:["Short-approach pop-ups ×4–6 (pit only)","Penultimate step drill 2×4"], feb:["Mid-approach jumps ×4–6 with check-mark","Landing drill into the pit ×4"]}},
  "High Jump":{focus:["Curved approach","Approach rhythm","Takeoff mechanics","Bar clearance","Indoor technical alternatives (curve runs, takeoff drills, no bar without a pit)"], drills:["hjcurve","hjscissor"],
    mo:{dec:["J-curve runs ×4–6","Scissor jumps ×4 at a low bungee (pit only)"], jan:["Curve into takeoff, no bar ×4","Short-approach back-overs ×4–6 (pit only)"], feb:["Mid approach at modest heights ×4–6 (pit only)","Approach rhythm runs ×3"]}},
  "Pole Vault":{focus:["Pole carry","Approach rhythm","Plant mechanics","Takeoff preparation","Technical work only under qualified supervision with proper facilities and equipment"], drills:["pvcarry","pvplant"],
    mo:{dec:["Pole carry runs ×4–6","Walking plants 2×5"], jan:["Jogging plants 2×5","Pole carry runs at approach rhythm ×4"], feb:["Short-run plants into the pit ×4 (qualified coach, pit set)","Carry runs ×3"]}},
};
const HURDLE_TECH_HS = {
  dec:[["Lead-leg drill","2×5 each leg","hlead"],["Trail-leg drill","2×5 each leg","htrail"],["Walkovers","2×5 hurdles","hmob"],["Walking clearance","4–6","hwalk"]],
  jan:[["Lead/trail-leg drills","2×5 each leg","hlead"],["Single-hurdle attacks","4","hsingle"],["Rhythm at reduced height","3 × 2–3 hurdles (if space)","hrhythm"]],
  feb:[["Start to first hurdle","3–4","hstart"],["2–4 hurdle sequences","3","hrhythm"],["Lead/trail-leg drills","1×5 each leg","hlead"]],
};
const SPRINT_TECH_HS = {
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

/* ---------- the winter calendar: Dec 1, 2026 – Feb 28, 2027 (13 weeks, Mon–Sun) ----------
   Coach-led Tue/Thu rows: {x:label, p:prescription, r:rest, i:"max"|"near"|"cf"|"tech"|"9095", d:drill id, g:[groups] (omit = everyone), n:note, cut:true (H/J may skip)}
   {tech:true} expands to each group's event technique for that month.  {str:"dec"|..., mod:"red"|...} = strength block.
   Other days come from the weekly defaults (DEF) unless a week lists its own in `days`. */
const PROGRAM_START = "2026-12-01", SPORT_START = "2026-12-07";
const R = {acc:"2–3 min, walk back", fly:"4–6 min", fall:"1–2 min", bj:"60–90 s", wall:"30–45 s", drill:"walk back", se80:"6–8 min", se120:"8–10 min", full:"Full recovery"};
const WU = {x:"Standard warm-up", p:"12–15 min", wu:true};
const TECH = {tech:true, x:"Event-specific technical work", p:"15–20 min"};
const HJT = Object.assign({}, TECH, {x:"Hurdle / jump technique"});
const row = (x,p,o) => Object.assign({x,p}, o||{});

/* Independent (home) workout library. Every step is written out; no equipment needed. */
const IND = {
  RA:{n:"Recovery A · Easy Walk + Mobility", dur:"20–30 min", rpe:"1–2/10 · very easy", equip:"None", obj:"Comfortable movement that leaves you fresher than when you started.",
    steps:[["Walk at a comfortable pace","15–20 min","Easy enough to chat the whole time."],["Ankle circles","10 each direction, each ankle","Slow, full circles."],["Leg swings, forward/back","8 each leg","Hold a wall. Controlled, not kicking."],["Leg swings, side to side","8 each leg","Swing across your body and out, smooth."],["Bodyweight squats","8","Sit back, chest up, heels down."],["Hip-flexor stretch","30 s each side","Half-kneeling, squeeze the glute of the down knee, gentle."],["Calf stretch","30 s each side","Hands on a wall, back heel down, back knee straight."]],
    end:"You should finish feeling better than when you started."},
  RB:{n:"Recovery B · Easy Aerobic", dur:"20–30 min", rpe:"2–3/10 · easy, can hold a conversation", equip:"None (bike or pool if you have one)", obj:"General fitness and blood flow without adding fatigue.",
    choose:[["Brisk walk","20–30 min"],["Easy stationary bike","15–25 min"],["Easy outdoor cycling, only where it's safe","20–30 min"],["Easy swimming, if available","15–20 min"]],
    opt:"Experienced 200/400 athletes may instead jog 10–15 min at a fully conversational effort. Not required for 100/200 sprinters or jumpers.",
    end:"No intervals, no tempo, no hard finish."},
  RC:{n:"Recovery C · Mobility Reset", dur:"12–18 min", rpe:"1–2/10 · very easy", equip:"None (a towel or mat helps)", obj:"Loosen up and reduce stiffness. Great after a long school day or when you're tired.",
    steps:[["Cat-cow","8 reps","On hands and knees: round your back, then let it sag. Move with your breath."],["World's greatest stretch","4 each side","Lunge, same-side elbow toward the front foot, then rotate that arm to the sky."],["90/90 hip rotations","8 total","Sit with both knees bent 90°, rotate both knees side to side, stay tall."],["Ankle rocks","10 each side","Half-kneeling, push the front knee forward over the toes, heel stays down."],["Thoracic rotations","8 each side","On hands and knees, hand behind the head, rotate the elbow up toward the ceiling."],["Gentle hamstring mobility","8 each side","Lying on your back, raise a straight leg and lower slowly. No yanking."],["Easy calf stretch","30 s each side","Hands on a wall, back heel down."],["Relaxed breathing","2 min","Lie on your back, in through the nose for 4, out slowly for 6."]],
    end:"If anything hurts, skip it and tell your coach."},
  GFA:{n:"General Fitness A · Bodyweight Strength", dur:"20–25 min", rpe:"4–5/10 · moderate", equip:"None", obj:"General strength that supports sprinting, without getting sore.",
    pre:"Warm up 3–5 min first: march in place, arm circles, 10 bodyweight squats, 5 slow lunges each leg.", rounds:2,
    steps:[["Bodyweight squats","10","Chest up, knees track over toes."],["Reverse lunges","6 each leg","Step back, back knee lowers gently, push through the front heel."],["Push-ups","6–12","Straight line head to heels. Knees down is fine."],["Glute bridges","12","Squeeze glutes at the top for 1 second."],["Bird dogs","8 each side","Opposite arm and leg out, hips stay level."],["Side plank","20–30 s each side","Straight line, hips up. Knees down is fine."],["Calf raises","12","Slow up, slow down."]],
    rest:"Rest 30–60 s between exercises as needed.", end:"Controlled reps. Never to failure. Stop if your form slips. Sore from Thursday's lift? Do Recovery A or C instead."},
  GFB:{n:"General Fitness B · Core + Stability", dur:"15–20 min", rpe:"3–4/10 · easy to moderate", equip:"None", obj:"Trunk and hip stability for posture at top speed.", rounds:2,
    steps:[["Dead bugs","8 each side","Low back stays flat on the floor. Slow."],["Bird dogs","8 each side","Reach long, hips level."],["Front plank","20–30 s","Squeeze glutes, don't let the hips sag."],["Side plank","20 s each side","Hips high."],["Glute bridges","12","Pause at the top."],["Single-leg balance","30 s each side","Stand tall. Hard? Hold a wall. Easy? Close your eyes."],["Slow calf raises","10","3 seconds up, 3 seconds down."]],
    rest:"Rest as needed.", end:"This should not make you sore."},
  TA:{n:"Optional Technique A · Sprint Coordination", dur:"10–15 min", rpe:"2–3/10 · low", equip:"None. A safe, non-slip area (driveway, garage, gym floor).", obj:"Keep the drills you learned without sprinting.",
    steps:[["A-march","2 × 10m","Tall, knee up, toe up, step down under you."],["Wall acceleration holds","2 × 10 s each side","Lean into the wall, straight line head to heel, one knee up."],["Slow wall switches","2 × 5 each leg","Switch legs under control, stay stiff."],["Dribble marching","2 × 10m","Step over the ankle, step down. Rhythm, not speed."],["Easy walk cooldown","3 min",""]],
    end:"Only if you've been taught these drills. No max sprinting, resisted sprints, block starts, or hard jumping."},
};
Object.assign(IND, {
  W1WED:{n:"Optional · Mobility + Comfortable Walk", dur:"10–15 min", rpe:"1–2/10 · very easy", equip:"None", obj:"Loosen up after Tuesday's first lift.",
    steps:[["Comfortable walk","5–8 min","Easy pace, chat-level."],["Ankle circles","10 each direction, each ankle",""],["Leg swings, forward/back + side to side","8 each, each leg","Hold a wall, controlled."],["Hip-flexor stretch","30 s each side","Half-kneeling, squeeze the glute of the down knee."],["Calf stretch","30 s each side","Hands on a wall, back heel down."]], end:"If you're sore from Tuesday, that's normal. Keep it easy."},
  W1FRI:{n:"Optional · Easy Walk, Cycle, or Mobility", dur:"15–25 min", rpe:"2–3/10 · easy", equip:"None (bike if you have one)", obj:"Easy movement after Thursday's session.",
    choose:[["Easy walk","15–25 min"],["Easy bike (stationary or outdoors where safe)","15–25 min"],["Mobility: Recovery C · Mobility Reset","12–18 min"]], end:"Nothing hard. You should feel better when you're done."},
  W1SAT:{n:"Optional · Recreational Activity or General Fitness", dur:"20–30 min", rpe:"3–4/10 · comfortable", equip:"Whatever the activity needs", obj:"Move for fun. Enjoy it.",
    choose:[["Shoot hoops, play catch, or a pickup game","20–30 min"],["Bike ride, hike, or swim","20–30 min"],["General Fitness B · Core + Stability","15–20 min"]], end:"Pick ONE. Tired or sore? Rest instead."},
});
const IND_KIND = {RA:"rec", RB:"rec", RC:"rec", GFA:"gf", GFB:"gf", TA:"opt"};
// Standard independent days
const DEF_HS = {
  Mon:{k:"rec", tpl:"RC", extra:"Optional: a 10–15 min comfortable walk.", total:"12–30 min", obj:"Maintain mobility, reduce stiffness, and get ready for Tuesday's max sprint work.", avoid:"No demanding leg strength work, hard running, or jumping today."},
  Wed:{k:"rec", tpl:"RA", alts:["RC"], total:"12–30 min", obj:"Comfortable movement between coach-led sessions. Don't add fatigue; Thursday is power and technique.", altNote:"Short on time? Do Recovery C instead."},
  Fri:{k:"rec", tpl:"RB", alts:["RA","RC"], total:"15–30 min", obj:"Easy movement after Thursday's session and general fitness, without extra fatigue.", avoid:"No recovery run is required."},
  Sat:{k:"gf", tpl:"GFB", alts:["GFA","RB","rest"], total:"15–30 min", obj:"Optional general physical preparation.", altNote:"Pick ONE. Don't stack options. Tired or sore? Rest completely."},
  Sun:{k:"rest"},
};
// Group modifications on independent days (S3 is handled separately: it follows the Mid-Distance plan)
const IND_MODS_HS = {
  S1:"100/200: mostly walking, mobility and core. Easy aerobic work is optional. No required mileage. Freshness for Tuesday's speed comes first.",
  S2:"200/400: walking, mobility and core. Optional 15–25 min easy cycling. Experienced athletes may occasionally jog 10–15 min conversational. Never add your own speed-endurance workouts.",
  H:"Hurdlers: mobility, trunk stability, easy walking or cycling. Low-intensity hurdle mobility (walkovers) only if you have equipment, space, and have been taught it. No high-speed hurdle clearances on your own.",
  J:"Jumpers: mobility, balance, core, and general strength as tolerated. No maximal jumping, high-volume bounding, or pole vault technique on your own.",
};
const LABELS = {gsc:["General Strength & Conditioning","lb-gsc"], speed:["Coach-Led Speed","lb-speed"], power:["Coach-Led Power/Technique","lb-power"], rec:["Independent Recovery","lb-rec"], gf:["Independent General Fitness","lb-gf"], opt:["Optional Conditioning","lb-opt"], rest:["Rest","lb-rest"], meet:["Meet Day","lb-meet"], closed:["School Closed · Home Session","lb-opt"]};

const SP_WEEKS_HS = [
 {n:1, start:"2026-11-30", focus:"General strength & conditioning", st:"vol", mo:"dec", note:"Dec 1–6: general strength and conditioning only. No sprint-specific training (blocks, timed sprints, sprint technique, hurdle or jump work) until Tue Dec 8: the limited-contact period for sport-specific training starts the week of Dec 7.",
  days:{Mon:{k:"none"},
    Tue:{k:"gsc", lift:"GA1", title:"General Strength A1: Movement Foundation", dur:"45–60 min", obj:"Learn the weight room: safety, equipment, and the squat, hinge, lunge, push and brace.",
      blocks:[["warm","General dynamic warm-up","8–10 min","Easy jog or march, skips, arm circles, leg swings, walking lunges with reach, inchworms. General movement only, no sprint drills."],
              ["intro","Weight-room safety, lifting technique, and equipment","10 min","How to pick up and rack dumbbells, spacing, spotting and clearing the area, and the cues for each lift below."],
              ["str","Weight room: General Strength A1 · Movement Foundation","20–25 min",""],
              ["cool","General cooldown + mobility","5 min","Easy walk, then calf, hip-flexor and hamstring stretches, 30 s each side."]]},
    Wed:{k:"opt", tpl:"W1WED", total:"10–15 min", obj:"Optional: loosen up after Tuesday's first lift."},
    Thu:{k:"gsc", lift:"GA2", title:"General Strength A2: Stability & Conditioning", dur:"45–60 min", obj:"Hip and trunk stability, general strength, and easy aerobic conditioning.",
      blocks:[["warm","General warm-up","8–10 min","Easy jog or march, skips, arm circles, leg swings, glute bridges ×10, walking lunges."],
              ["str","Weight room: General Strength A2 · Stability & Conditioning","20–25 min",""],
              ["cond","General aerobic conditioning","10–15 min","Easy cycling, walking, or another low-intensity activity at RPE 2–3/10 (can talk the whole time)."],
              ["cool","Cooldown","5 min","Easy walk + calf, hip-flexor and hamstring stretches."]]},
    Fri:{k:"opt", tpl:"W1FRI", total:"15–25 min", obj:"Optional easy movement after Thursday."},
    Sat:{k:"opt", tpl:"W1SAT", total:"20–30 min", obj:"Optional: something active you enjoy."}}},
 {n:2, start:"2026-12-07", focus:"Acceleration foundations", st:"vol", mo:"dec",
  tue:{out:[WU,row("Welcome to sprints: expectations + your training group","5 min",{i:"tech",n:"How Tue/Thu work, the home days, full recovery, and how to find your workout on the hub."}),row("Wall switches","2×5 each leg",{d:"wall",r:R.wall,i:"tech"}),row("Falling starts","4×10m",{d:"fall",r:R.fall,i:"max"}),row("Standing accelerations","3×20m",{d:"stand",r:R.acc,i:"max"}),row("Progressive accelerations","2×30m",{d:"accel",r:"3 min",i:"near",cut:true}),TECH],
       in:[WU,row("Welcome to sprints: expectations + your training group","5 min",{i:"tech"}),row("Wall switches","2×5 each leg",{d:"wall",r:R.wall,i:"tech"}),row("Falling starts","4×5m",{d:"fall",r:R.fall,i:"max"}),row("Standing accelerations","4×10m",{d:"stand",r:R.acc,i:"max"}),row("Accelerations","2×15m if safe",{d:"accel",r:R.acc,i:"near",cut:true,n:"Only with traction, a clear lane and stopping room."}),TECH]},
  thu:{out:[WU,row("Starts","3×20m",{d:"stand",r:R.acc,i:"max"}),row("Intro plyometrics: pogo hops","2×10 contacts",{d:"pogo",r:R.bj,i:"tech"}),row("Broad jumps","2×3",{d:"broad",r:R.bj,i:"max"}),HJT,{str:"dec",mod:"intro"}],
       in:[WU,row("Starts","3×10m",{d:"stand",r:R.acc,i:"max"}),row("Intro plyometrics: pogo hops","2×10 contacts",{d:"pogo",r:R.bj,i:"tech"}),row("Broad jumps","2×3",{d:"broad",r:R.bj,i:"max"}),HJT,{str:"dec",mod:"intro"}]}},
 {n:3, start:"2026-12-14", focus:"First-step projection", st:"vol", mo:"dec",
  tue:{out:[WU,row("Falling starts","3×10m",{d:"fall",r:R.fall,i:"max"}),row("Three-point starts","4×20m",{d:"three",r:R.acc,i:"max"}),row("Accelerations","2×30m",{d:"accel",r:"3 min",i:"near",cut:true}),TECH],
       in:[WU,row("Falling starts","3×5m",{d:"fall",r:R.fall,i:"max"}),row("Three-point starts","4×10m",{d:"three",r:R.acc,i:"max"}),row("Accelerations","3×15m if safe",{d:"accel",r:R.acc,i:"near",cut:true}),TECH]},
  thu:{out:[WU,row("Starts","3×20m",{d:"three",r:R.acc,i:"max"}),row("Broad jumps","3×3",{d:"broad",r:R.bj,i:"max"}),HJT,{str:"dec"}],
       in:[WU,row("Starts","4×10m",{d:"three",r:R.acc,i:"max"}),row("Broad jumps","3×3",{d:"broad",r:R.bj,i:"max"}),HJT,{str:"dec"}]}},
 {n:4, start:"2026-12-21", focus:"Holiday: on your own", st:"break", mo:"dec",
  days:{Tue:{k:"opt", tpl:"TA", alts:["RC"], total:"10–15 min", obj:"Keep the drills you know. No practice this week."}, Thu:{k:"rec", tpl:"RC", alts:["RA"], total:"12–18 min", obj:"Christmas Eve: mobility only if you want it."}, Fri:{k:"rest", note:"Christmas Day."}}},
 {n:5, start:"2026-12-28", focus:"Holiday: on your own", st:"break", mo:"dec",
  days:{Tue:{k:"opt", tpl:"TA", alts:["RC"], total:"10–15 min", obj:"Keep the drills you know. No practice this week."}, Thu:{k:"gf", tpl:"GFA", alts:["GFB","RA","rest"], total:"20–25 min", obj:"New Year's Eve: optional bodyweight strength.", altNote:"Pick ONE or rest."}, Fri:{k:"rest", note:"New Year's Day."}}},
 {n:6, start:"2027-01-04", focus:"Baseline speed testing", st:"vol", mo:"jan", test:true,
  tue:{out:[WU,row("Accelerations","3×20m",{d:"accel",r:R.acc,i:"max"}),row("Flying 10m, timed","3 reps",{d:"fly10",r:R.fly,i:"max",n:"Baseline test. Record method, surface and conditions."})],
       in:[WU,row("Accelerations","4×10m",{d:"accel",r:R.acc,i:"max"}),row("Timed 10m starts","2 if safe",{d:"stand",r:R.acc,i:"max",n:"Indoor time: keep separate from outdoor times."})]},
  thu:{out:[WU,row("Short starts","3×10m",{d:"three",r:R.acc,i:"max"}),row("Pogo hops + broad jumps","2×10 contacts / 2×3",{d:"pogo",r:R.bj,i:"max",n:"Low-volume plyometrics."}),row("Block setup instruction","10 min",{d:"block",i:"tech"}),TECH,{str:"jan"}], in:null}},
 {n:7, start:"2027-01-11", focus:"Block clearance", st:"vol", mo:"jan",
  tue:{out:[WU,row("Starts","3×30m",{d:"block",r:"3 min",i:"max"}),row("Flying 10m","3 reps",{d:"fly10",r:R.fly,i:"max",cut:true})],
       in:[WU,row("Starts","4×10m",{d:"block",r:R.acc,i:"max"}),row("Starts","2×15m if safe",{d:"block",r:R.acc,i:"max",cut:true}),row("Wicket / dribble passes","3",{d:"wicket",r:R.drill,i:"tech"})]},
  thu:{out:[WU,row("Short accelerations","3×10–15m",{d:"accel",r:R.acc,i:"max"}),row("Low-volume jumps","2×3 broad jumps",{d:"broad",r:R.bj,i:"max"}),HJT,{str:"jan"}], in:null}},
 {n:8, start:"2027-01-18", focus:"Drive-phase development", st:"vol", mo:"jan",
  tue:{out:[WU,row("Accelerations","3×20m",{d:"accel",r:R.acc,i:"max"}),row("Flying 20m","3 reps",{d:"fly20",r:R.fly,i:"max",cut:true})],
       in:[WU,row("Starts","4×10–15m",{d:"block",r:R.acc,i:"max"}),row("Wicket / dribble drills","3 passes",{d:"wicket",r:R.drill,i:"tech"})]},
  thu:{out:[WU,row("Short starts","3×10m",{d:"block",r:R.acc,i:"max"}),row("Controlled explosive jumps","2×3 broad jumps + 2×10 pogos",{d:"broad",r:R.bj,i:"max"}),TECH,{str:"jan"}], in:null}},
 {n:9, start:"2027-01-25", focus:"Acceleration reassessment", st:"vol", mo:"jan", test:true,
  tue:{out:[WU,row("Timed 10m starts","2–3 attempts",{d:"block",r:R.acc,i:"max",n:"Reassessment. Same protocol as Week 6."}),row("Timed 20m starts","2–3 attempts",{d:"block",r:"3 min",i:"max"}),row("Flying 20m","2 if still fresh",{d:"fly20",r:R.fly,i:"max",cut:true})],
       in:[WU,row("Timed 10m starts","2–3 attempts",{d:"block",r:R.acc,i:"max",n:"Indoor time: keep separate from outdoor times."}),row("Technical accelerations","2×10–15m",{d:"accel",r:R.acc,i:"near"})]},
  thu:{out:[WU,row("Short starts (reduced volume)","2×10m",{d:"block",r:R.acc,i:"max"}),row("Video analysis","10 min",{i:"tech",n:"Review Tuesday's starts with the scorecard."}),TECH,{str:"jan"}], in:null}},
 {n:10, start:"2027-02-01", focus:"Maximum velocity", st:"vol", mo:"feb",
  tue:{out:[WU,row("Starts","3×30m",{d:"block",r:"3 min",i:"max"}),row("Flying 20m","3 reps",{d:"fly20",r:R.fly,i:"max",cut:true})],
       in:[WU,row("Starts","4×10–15m",{d:"block",r:R.acc,i:"max"}),row("Short wicket passes","3",{d:"wicket",r:R.drill,i:"tech"})]},
  thu:{out:[WU,row("Controlled fast efforts","2×60m",{d:"sefast",g:["S1"],r:R.full,i:"cf"}),row("Controlled fast efforts","2×100m",{d:"sefast",g:["S2"],r:R.full,i:"cf"}),TECH,{str:"feb",mod:"red"}],
       in:[WU,row("Starts","3×10m",{d:"block",r:R.acc,i:"max"}),row("Low-volume power","2×3 med-ball throws + 2×3 broad jumps",{d:"medball",r:R.bj,i:"max"}),row("Longer sprints","Deferred: not indoors",{i:"tech",n:"The 60m/100m efforts wait for an outdoor day."}),TECH,{str:"feb"}]}},
 {n:11, start:"2027-02-08", focus:"Speed endurance introduction", st:"vol", mo:"feb",
  tue:{out:[WU,row("Starts","2×30m",{d:"block",r:"3 min",i:"max"}),row("Flying 20m","3 reps",{d:"fly20",r:R.fly,i:"max",cut:true})],
       in:[WU,row("Starts","3×10–15m",{d:"block",r:R.acc,i:"max"}),row("Technical sprint-drill passes","3",{d:"dribble",r:R.drill,i:"tech"})]},
  thu:{out:[WU,row("Speed endurance","2×80m",{d:"sefast",g:["S1"],r:R.se80,i:"9095"}),row("Speed endurance","2×120m",{d:"sefast",g:["S2"],r:R.se120,i:"cf"}),TECH,{str:"feb",mod:"red"}],
       in:[WU,row("Starts","3×10m",{d:"block",r:R.acc,i:"max"}),row("Low-volume jumps","2×3 broad jumps",{d:"broad",r:R.bj,i:"max"}),row("No 80–120m reps in a hallway","",{i:"tech"}),TECH,{str:"feb"}]}},
 {n:12, start:"2027-02-15", focus:"Speed consolidation", st:"off", mo:"feb",
  tue:{out:[WU,row("Accelerations","2×20m",{d:"accel",r:R.acc,i:"max"}),row("Flying 20m","2 reps",{d:"fly20",r:R.fly,i:"max",cut:true})],
       in:[WU,row("Accelerations","3×10m",{d:"accel",r:R.acc,i:"max"}),row("Low-volume technical work","10 min",{d:"dribble",i:"tech"}),row("Video review","10 min",{i:"tech"})]},
  thu:{out:[WU,row("Short starts","3×10m",{d:"block",r:R.acc,i:"max"}),TECH,{str:"feb",mod:"light"}], in:null}},
 {n:13, start:"2027-02-22", focus:"Preseason transition", st:"off", mo:"feb",
  tue:{out:[WU,row("Accelerations","3×30m",{d:"accel",r:"3 min",i:"max"}),row("Fast runs","2×60m",{d:"sefast",g:["S1"],r:R.full,i:"cf"}),row("Fast runs","2×80m",{d:"sefast",g:["S2"],r:R.full,i:"cf"})],
       in:[WU,row("Accelerations","4×10–15m",{d:"accel",r:R.acc,i:"max"}),row("Controlled power","2×3 med-ball throws",{d:"medball",r:R.bj,i:"max"}),row("Technical drills","3 passes",{d:"dribble",r:R.drill,i:"tech"})]},
  thu:{out:[WU,row("Short starts","3×10m",{d:"block",r:R.acc,i:"max"}),TECH,{str:"feb",mod:"mod",n:"Avoid excessive fatigue."}], in:null}},
];
const ST_HS = {vol:["Coach-led Tue/Thu are voluntary / out-of-season. Home days are always optional.","sp-banner"], break:["Holiday: no practices. Everything this week is optional; family and travel come first. Missed sprint sessions are never made up.","sp-banner brk"], off:["Official practice season (confirm the IHSAA start date). Your coach may post practice on more days.","sp-banner off"]};
const INT = {max:["Max","max"], near:["Fast, relaxed",""], cf:["Controlled fast",""], "9095":["~90–95%",""], tech:["Technical","tech"]};
const DUR_HS = {Tue:"60–75 min", Thu:"75–90 min"};
const DAYN = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
/* ---- Proposed revision (Nov 2026): HS February preparation by pathway. Shown only once a coach posts it
   (hub_data "sprint_rev" = true, set by supabase/spring_sprints.sql) or in the coach preview. ---- */
const SP_REV = {HS:{
  "2027-01-21": {sess:{out:[WU,row("Short starts","3×10m",{d:"block",r:R.acc,i:"max"}),row("Controlled explosive jumps","2×3 broad jumps + 2×10 pogos",{d:"broad",r:R.bj,i:"max"}),
    row("Rhythm runs","2×60m",{d:"sefast",g:["S2"],r:"walk back",i:"near",n:"Relaxed, about 75–80%. Learning longer sprint rhythm."}),TECH,{str:"jan"}]}},
  "2027-02-16": {focus:"February preparation: speed", sess:{out:[WU,row("Accelerations","4×20m",{d:"accel",r:"2–4 min",i:"max"}),row("Accelerations","2×30m",{d:"accel",r:"3–4 min",i:"max"}),
    row("Flying 20m","3 reps",{d:"fly20",r:"4–6 min",i:"max",cut:true,n:"Individual build-up, safe run-out."}),row("Joined Feb 15 (intro week)","3×20m standing starts + 2×20m build-ups only",{r:"2–3 min",i:"near"})]}},
  "2027-02-18": {focus:"February preparation: sprint endurance", sess:{out:[WU,row("Short starts","3×10m",{d:"block",r:R.acc,i:"max"}),
    row("Sprint endurance","2×100m",{d:"sefast",g:["S1"],r:"8–10 min",i:"9095",n:"Fast and controlled. Stop if the 2nd rep is 3%+ slower."}),
    row("Longer reps","2×150m",{d:"sefast",g:["S2"],r:"6–8 min",i:"cf",n:"About 90%. Never a race."}),
    row("Joined Feb 15 (intro week)","2×60m relaxed fast instead of the longer reps",{r:"5 min",i:"near"}),TECH,{str:"feb",mod:"light"}]}},
  "2027-02-23": {focus:"February preparation: speed", sess:{out:[WU,row("Accelerations","3×30m",{d:"accel",r:"3 min",i:"max"}),row("Flying 20m","3 reps",{d:"fly20",r:"4–6 min",i:"max",cut:true}),
    row("Joined Feb 15 (week 2)","4×20m starts + 2 × flying 10m",{r:"2–4 min",i:"max"})]}},
  "2027-02-25": {focus:"February preparation: longer reps", sess:{out:[WU,row("Short starts","3×10m",{d:"block",r:R.acc,i:"max"}),
    row("Sprint endurance","2×120m",{d:"sefast",g:["S1"],r:"10–12 min",i:"9095",n:"Fast and controlled, about 95%."}),
    row("Longer reps","2×180m",{d:"sefast",g:["S2"],r:"8–10 min",i:"cf",n:"About 90%. Never a race."}),
    row("Joined Feb 15 (week 2)","2×80m relaxed fast",{r:"5–6 min",i:"near"}),TECH,{str:"feb",mod:"mod",n:"Avoid excessive fatigue."}]}}
}, JH:{}};
/* ======================= JUNIOR HIGH (grades 6–8) =======================
   Same week structure, drill names and philosophy as HS, with JH workloads, levels and progressions.
   Rows may carry jl:[2,3] (Level 2+) or jl:[3] (Level 3 only). {lift:"JA"} = a shared JH lift table from the main page (LIFTS). */
const LEVELS_JH = {
  1:{n:"Level 1 · Foundation", typ:"Typically newer 6th/7th graders", focus:["General athletic movement","Coordination","Running posture","Basic acceleration","Safe landing","Introductory hurdle mobility","Event exploration"]},
  2:{n:"Level 2 · Development", typ:"Typically experienced 7th/8th graders", focus:["Consistent acceleration mechanics","Controlled sprint technique","Introductory starting positions","Maximum-velocity development","Hurdle rhythm","Jump approaches","Supervised introductory strength"]},
  3:{n:"Level 3 · Advanced", typ:"Experienced, physically prepared athletes who show the movement competency", focus:["More precise acceleration mechanics","Introductory block starts","Timed sprinting","Event-specific technical progression","Individualized sprint volume","Preparation for high school training"]},
};
const WARMUP_JH = [
  ["Easy movement","2–3 min","Jog, skips, shuffles, carioca, follow-the-leader."],
  ["Dynamic mobility","2–3 min","Leg swings, walking lunges, arm circles, inchworms."],
  ["A-march + basic skipping","2 min","A-march 2×10m, skips 2×15m. One cue for the day: tall and quick."],
  ["Ankling","1 min","2×10m, quiet quick feet."],
  ["Build-ups","1–2 min","2×20–30m at 70% then 80%. Indoors 2×10m easy, or skip them if stopping room is short."],
  ["Coordination game","1–2 min","Reaction starts (coach claps or drops a ball), mirror drill, or partner tag in a small box. Short and fun."],
];
const WU_TIME = {HS:"12–15 min", JH:"8–12 min"};
const DUR_JH = {Tue:"45–65 min", Thu:"45–65 min"};
const ST_JH = {vol:["Coach-led Tue/Thu assume they're permitted under junior high rules and district policy (confirm with the AD; high school IHSAA rules aren't assumed). Home days are always optional.","sp-banner"],
  break:["Holiday: no required practices. Everything this week is optional; family and travel come first. Missed sessions are never made up.","sp-banner brk"],
  off:["Preseason (confirm the junior high practice start date). Your coach may post practice on more days.","sp-banner off"]};
const BLOCKS_JH = [
  {mo:"December", t:"Posture + first steps", items:["Wall drives","Falling starts","Standing starts","Push the ground back, low first steps"]},
  {mo:"January", t:"Starting positions", items:["Standing starts (everyone)","Three-point starts (Level 2+)","Block setup introduction (Level 3 only)"]},
  {mo:"February", t:"Consistency", items:["The same start every rep","First 3 steps low and fast","Timed 10m for athletes ready for testing"]},
  {mo:"March–May", t:"Race starts", items:["Starter commands","Block starts in races for Level 3 (Level 2 when ready)","Standing starts are fine for Level 1"]},
];
const HURDLES_JH = [
  {mo:"December", items:["Hurdle mobility","Walking lead/trail-leg drills","Single-hurdle introduction"]},
  {mo:"January", items:["Controlled approaches","One- and two-hurdle drills","Reduced-height rhythm"]},
  {mo:"February", items:["Two-to-four hurdle sequences where safe","More consistent approaches","Progressive rhythm"]},
  {mo:"March–May", items:["Age-appropriate competition heights and spacing","Race-specific technique","Starts to the first hurdle","Three-step rhythm where appropriate"]},
];
const HURDLE_TECH_JH = {
  dec:[["Hurdle mobility walkovers","2 × 4 hurdles","hmob"],["Walking lead-leg drill","2 × 4 each leg","hlead"],["Walking trail-leg drill","2 × 4 each leg","htrail"],["Single-hurdle introduction (low split-bar)","3–4","hwalk"]],
  jan:[["Controlled approach into one hurdle","4","hsingle"],["One- and two-hurdle drills","3","hrhythm"],["Reduced-height rhythm","2–3 passes","hrhythm"]],
  feb:[["2–4 hurdle sequences where safe","3","hrhythm"],["Consistent approach to hurdle 1","3","hstart"],["Lead/trail-leg drills","1 × 4 each leg","hlead"]],
};
const SPRINT_TECH_JH = {
  dec:[["Posture + arm action: wall drives, A-march","5 min","wall"],["Falling → standing start positions","5 min","fall"]],
  jan:[["Standing starts; three-point starts for Level 2+","5–8 min","three"],["Block setup introduction (Level 3 only)","5 min","block"]],
  feb:[["Start consistency + first three steps","5–8 min","three"],["Upright running: dribbles or low wickets","2–3 passes","wicket"]],
};
const JUMPS_JH = {
  "Long Jump":{starter:true, focus:["Safe landing first","Short, consistent approach","Takeoff off one foot, run through the board","Event exploration: everyone tries it"], drills:["ljpen","ljpop"],
    mo:{dec:["Standing long jumps into sand or onto a mat ×4 (landing practice)","Skips for distance 2 × 15m"], jan:["Short-approach (4–6 step) pop-ups ×4 (pit only)","Penultimate rhythm drill 2 × 3"], feb:["Short-to-mid approach jumps ×4 (pit only)","Approach consistency runs ×3"]}},
  "High Jump":{starter:true, focus:["Curved approach (J-curve)","Takeoff off the outside foot, knee drive up","Bar clearance at low heights","No high jump without a pit"], drills:["hjcurve","hjscissor"],
    mo:{dec:["J-curve runs ×4","Scissor jumps at a low bungee ×4 (pit only)"], jan:["Curve into takeoff, no bar ×4","Short-approach scissors / back-overs at low heights ×4 (pit only)"], feb:["Short approach at modest heights ×4–6 (pit only)","Approach rhythm runs ×3"]}},
};
const IND_MODS_JH = {
  S1:"Sprinters: play, walk, or bike. No extra running needed. Stay fresh for Tuesday.",
  S2:"400 runners: easy biking or walking is plenty. No extra hard runs on your own.",
  H:"Hurdlers: mobility and balance. Walkovers only if you have a safe hurdle setup and were taught them. No hurdling at speed on your own.",
  J:"Jumpers: balance and core. No jumping for height or distance on your own.",
};
Object.assign(IND, {
  JRC:{n:"Mobility · 10 minutes", dur:"10–15 min", rpe:"1–2/10 · very easy", equip:"None", obj:"Loosen up and feel good for Tuesday.",
    steps:[["Cat-cow","8 reps","On hands and knees: round your back, then let it sag."],["World's greatest stretch","3 each side","Big lunge, elbow toward the front foot, then reach that arm to the sky."],["Ankle rocks","8 each side","Half-kneeling, push the front knee over the toes, heel down."],["Leg swings","8 each way, each leg","Hold a wall, smooth swings."],["Calf stretch","20–30 s each side","Hands on a wall, back heel down."],["Relaxed breathing","1 min","In through the nose for 4, out for 6."]], end:"Should feel easy. If something hurts, skip it and tell your coach."},
  JEA:{n:"Easy Activity", dur:"15–25 min", rpe:"2–3/10 · easy", equip:"None", obj:"Move for fun between practices.",
    choose:[["Walk with family, friends, or the dog","15–25 min"],["Easy bike ride (where it's safe)","15–25 min"],["Shoot hoops, play catch, or a backyard game","15–25 min"]], end:"Pick ONE. Nothing hard today."},
  JRA:{n:"Recovery · Walk + Stretch", dur:"15–20 min", rpe:"1–2/10 · very easy", equip:"None", obj:"Easy movement after Thursday's practice.",
    steps:[["Easy walk","10–15 min","Chat-level pace."],["Ankle circles","10 each direction, each ankle",""],["Bodyweight squats","8","Slow and smooth."],["Hip-flexor stretch","20–30 s each side","Half-kneeling, squeeze the glute of the down knee."],["Calf stretch","20–30 s each side",""]], end:"You should finish feeling better than when you started."},
  JGF:{n:"Optional Fitness or Play", dur:"15–25 min", rpe:"3–4/10 · comfortable", equip:"None", obj:"Optional: something active you enjoy.",
    choose:[["Play outside: tag, soccer, basketball, frisbee","15–25 min"],["Bike ride, hike, or swim","15–25 min"],["Mini circuit ×2: 8 squats, 6 lunges each leg, 6 push-ups, 10 glute bridges, 20 s plank","10–15 min"]], end:"Pick ONE, or rest if you're tired or sore."},
  JTA:{n:"Optional · Drills at Home", dur:"10–15 min", rpe:"2–3/10 · low", equip:"None. A safe, non-slip spot.", obj:"Keep the drills you know. No practice this week.",
    steps:[["A-march","2 × 10m","Tall, knee up, toe up."],["Wall drives","2 × 4 each leg","Lean into the wall, straight line, drive one knee up."],["Dribble marching","2 × 10m","Step over the ankle, step down."],["Skips","2 × 15m","Bouncy and relaxed."],["Easy walk cooldown","3 min",""]], end:"No max sprinting, no jumping for distance, no block starts."},
  JW1E:{n:"Optional · Easy Activity, Mobility, or Play", dur:"10–20 min", rpe:"1–3/10 · easy", equip:"None", obj:"Optional. Move a little, have fun.",
    choose:[["Easy walk or bike","10–20 min"],["Mobility · 10 minutes (Mon routine)","10–15 min"],["Recreational play: shoot hoops, catch, tag","10–20 min"]], end:"Totally optional. No need to report anything."},
});
const DEF_JH = {
  Mon:{k:"rec", tpl:"JRC", total:"10–15 min", obj:"Independent recovery and mobility. Get ready for Tuesday."},
  Wed:{k:"rec", tpl:"JEA", alts:["JRC"], total:"15–25 min", obj:"Independent easy activity between practices."},
  Fri:{k:"rec", tpl:"JRA", alts:["JRC"], total:"15–20 min", obj:"Independent recovery after Thursday."},
  Sat:{k:"gf", tpl:"JGF", alts:["rest"], total:"15–25 min", obj:"Optional general fitness or recreational activity.", altNote:"Or rest."},
  Sun:{k:"rest"},
};
const RJ = {acc:"1–2 min, walk back", fly:"3–4 min", fall:"1 min", bj:"60 s", wall:"30 s", drill:"walk back", full:"Full recovery (3–4 min)"};
const WUJ = {x:"JH warm-up", p:"8–12 min", wu:true};
const TECHJ = {tech:true, x:"Event technique", p:"10–15 min"};
const HJTJ = {tech:true, x:"Introductory hurdle / jump movement", p:"10–15 min"};
const COOL = {x:"Cooldown","p":"3–5 min", i:"tech", n:"Easy walk, calf and hip-flexor stretch."};
const JLIFT = (code, p) => ({lift:code, x:"Basic strength", p: p || "15–20 min"});
const SP_WEEKS_JH = [
 {n:1, start:"2026-11-30", focus:"General movement & strength", st:"vol", mo:"dec", note:"Dec 1–6: general movement and strength only. No sprint, hurdle, or jump instruction until the week of Dec 7 (assuming permitted under junior high rules and approved by the athletic department).",
  days:{Mon:{k:"none"},
    Tue:{k:"gsc", lift:"JGA1", title:"General Movement + Strength A1", dur:"35–45 min", obj:"Learn to move well: squat, hinge, lunge, push, brace and balance.", equip:"Workout clothes and shoes, water. Dowels and mats are provided.",
      blocks:[["warm","Warm-up","5–8 min","5 minutes of easy movement, then dynamic mobility and basic coordination (skips, shuffles, simple partner games)."],
              ["str","JH General Strength A1 · Movement Circuit","20–25 min",""],
              ["cool","Easy mobility","5 min","Easy walk, then calf, hip-flexor and hamstring stretches."]]},
    Wed:{k:"opt", tpl:"JW1E", total:"10–20 min", obj:"Optional easy activity, mobility, or recreational play."},
    Thu:{k:"gsc", lift:"JGA2", title:"General Movement + Strength A2", dur:"35–45 min", obj:"Balance, stability and general strength, then easy movement.", equip:"Workout clothes and shoes, water. Light bands and mats are provided.",
      blocks:[["warm","Warm-up","5–8 min","General movement: easy jog or march, skips, arm circles, leg swings, walking lunges."],
              ["str","JH General Strength A2 · Movement Circuit","20–25 min",""],
              ["cond","Easy movement","5–10 min","Comfortable walking or recreational movement."],
              ["cool","Cooldown","3–5 min","Easy stretching."]]},
    Fri:{k:"opt", tpl:"JW1E", total:"10–20 min", obj:"Optional easy activity, mobility, or recreational play."},
    Sat:{k:"opt", tpl:"JW1E", total:"10–20 min", obj:"Optional easy activity, mobility, or recreational play."}}},
 {n:2, start:"2026-12-07", focus:"Acceleration foundations", st:"vol", mo:"dec",
  tue:{out:[WUJ,row("Wall drives","2×4 each leg",{d:"wall",r:RJ.wall,i:"tech"}),row("Falling starts","3×10m",{d:"fall",r:RJ.fall,i:"near"}),row("Standing accelerations","3×15m",{d:"stand",r:RJ.acc,i:"near"}),row("Simple coordination games","5–8 min",{d:"coord",i:"tech"}),COOL],
       in:[WUJ,row("Wall drives","2×4 each leg",{d:"wall",r:RJ.wall,i:"tech"}),row("Falling starts","3×5m",{d:"fall",r:RJ.fall,i:"near"}),row("Standing accelerations","3×10m",{d:"stand",r:RJ.acc,i:"near",n:"Only with traction, a clear lane and stopping room."}),row("Dribble marching","2×10m",{d:"dribble",i:"tech"}),COOL]},
  thu:{out:[WUJ,row("Short accelerations","2–3 × 10–15m",{d:"stand",r:RJ.acc,i:"near"}),HJTJ,JLIFT("JA"),COOL], in:null}},
 {n:3, start:"2026-12-14", focus:"First-step mechanics", st:"vol", mo:"dec",
  tue:{out:[WUJ,row("Falling starts","3×10m",{d:"fall",r:RJ.fall,i:"max"}),row("Accelerations","3×20m",{d:"accel",r:RJ.full,i:"near",cut:true}),COOL],
       in:[WUJ,row("Falling starts","3×5m",{d:"fall",r:RJ.fall,i:"max"}),row("Accelerations","3×10–15m if safe",{d:"accel",r:RJ.acc,i:"near",cut:true}),COOL]},
  thu:{out:[WUJ,row("Coordination drills","5 min",{d:"dribble",i:"tech"}),row("Short starts","3×10m",{d:"stand",r:RJ.acc,i:"max"}),TECHJ,JLIFT("JA"),COOL], in:null}},
 {n:4, start:"2026-12-21", focus:"Holiday: on your own", st:"break", mo:"dec",
  days:{Tue:{k:"opt", tpl:"JTA", alts:["JRC"], total:"10–15 min", obj:"Optional, low-volume movement if you want it. No required practices."}, Thu:{k:"rec", tpl:"JRC", total:"10–15 min", obj:"Christmas Eve: mobility only if you want it."}, Fri:{k:"rest", note:"Christmas Day."}}},
 {n:5, start:"2026-12-28", focus:"Holiday recovery", st:"break", mo:"dec",
  days:{Tue:{k:"opt", tpl:"JTA", alts:["JRC"], total:"10–15 min", obj:"Optional general movement."}, Thu:{k:"opt", tpl:"JGF", alts:["rest"], total:"15–25 min", obj:"New Year's Eve: optional play or fitness."}, Fri:{k:"rest", note:"New Year's Day."}}},
 {n:6, start:"2027-01-04", focus:"Acceleration assessment", st:"vol", mo:"jan", test:true,
  tue:{out:[WUJ,row("Accelerations","3×15–20m",{d:"accel",r:RJ.acc,i:"max"}),row("Timed 10m","1–2 tries, optional",{d:"stand",r:RJ.acc,i:"max",jl:[2,3],n:"Only for athletes ready for testing."}),COOL],
       in:[WUJ,row("Accelerations","3–4×10m if safe",{d:"accel",r:RJ.acc,i:"max"}),COOL]},
  thu:{out:[WUJ,row("Coordination drills","5 min",{d:"coord",i:"tech"}),HJTJ,JLIFT("JB"),COOL], in:null}},
 {n:7, start:"2027-01-11", focus:"Starting positions", st:"vol", mo:"jan",
  tue:{out:[WUJ,row("Standing starts","3×10m",{d:"stand",r:RJ.acc,i:"max"}),row("Three-point starts","3×20m",{d:"three",r:RJ.acc,i:"max",jl:[2,3]}),COOL],
       in:[WUJ,row("Starts","3×5m",{d:"stand",r:RJ.acc,i:"max"}),row("Accelerations","3×10m",{d:"accel",r:RJ.acc,i:"near"}),COOL]},
  thu:{out:[WUJ,row("Block setup introduction","10 min",{d:"block",i:"tech",jl:[3]}),TECHJ,JLIFT("JB"),COOL], in:null}},
 {n:8, start:"2027-01-18", focus:"Acceleration + upright running", st:"vol", mo:"jan",
  tue:{out:[WUJ,row("Accelerations","3×20m",{d:"accel",r:RJ.acc,i:"max"}),row("Flying 10m","2 reps",{d:"fly10",r:RJ.fly,i:"max",jl:[2,3],cut:true,n:"Gradual build-up, full recovery. Prepared athletes only."}),COOL],
       in:[WUJ,row("Starts","3×10–15m",{d:"stand",r:RJ.acc,i:"max"}),row("Coordination + low wickets","2–3 passes",{d:"wicket",i:"tech"}),COOL]},
  thu:{out:[WUJ,HJTJ,JLIFT("JB"),COOL], in:null}},
 {n:9, start:"2027-01-25", focus:"Progress assessment", st:"vol", mo:"jan", test:true,
  tue:{out:[WUJ,row("Timed 10m","2–3 attempts",{d:"stand",r:RJ.acc,i:"max",n:"Same setup as Week 6."}),row("Accelerations","2×20m",{d:"accel",r:RJ.acc,i:"near"}),COOL],
       in:[WUJ,row("Timed 10m","2–3 attempts if safe",{d:"stand",r:RJ.acc,i:"max",n:"Indoor time: keep separate from outdoor times."}),COOL]},
  thu:{out:[WUJ,row("Technical review","10 min",{i:"tech",n:"Look back at starts and arm action; one thing to keep, one thing to fix."}),row("Event exploration","10–15 min",{d:"coord",i:"tech",n:"Try an event you haven't done yet."}),JLIFT("JB"),COOL], in:null}},
 {n:10, start:"2027-02-01", focus:"Speed development", st:"vol", mo:"feb",
  tue:{out:[WUJ,row("Accelerations","3×20m",{d:"accel",r:RJ.acc,i:"max"}),row("Flying 10m","2 reps",{d:"fly10",r:RJ.fly,i:"max",jl:[2,3],cut:true}),COOL],
       in:[WUJ,row("Starts","3×10–15m",{d:"stand",r:RJ.acc,i:"max"}),row("Wicket / dribble drills","2–3 passes",{d:"wicket",i:"tech"}),COOL]},
  thu:{out:[WUJ,TECHJ,row("Low-volume explosive jumps","2×3 broad jumps",{d:"broad",r:RJ.bj,i:"max"}),JLIFT("JB"),COOL], in:null}},
 {n:11, start:"2027-02-08", focus:"Speed + event skills", st:"vol", mo:"feb",
  tue:{out:[WUJ,row("Accelerations","3×20m",{d:"accel",r:RJ.acc,i:"max"}),row("Controlled fast runs","2×40–60m",{d:"sefast",r:RJ.full,i:"cf",jl:[2,3],cut:true}),COOL],
       in:[WUJ,row("Short accelerations","3×10m",{d:"accel",r:RJ.acc,i:"near"}),row("Mechanics + coordination","5–8 min",{d:"dribble",i:"tech"}),COOL]},
  thu:{out:[WUJ,HJTJ,JLIFT("JB"),COOL], in:null}},
 {n:12, start:"2027-02-15", focus:"Technical consolidation", st:"vol", mo:"feb",
  tue:{out:[WUJ,row("Accelerations","2×20m",{d:"accel",r:RJ.acc,i:"max"}),row("Flying 10m","2 reps",{d:"fly10",r:RJ.fly,i:"max",jl:[2,3],cut:true}),COOL],
       in:[WUJ,row("Accelerations","3×10m",{d:"accel",r:RJ.acc,i:"near"}),row("Technical drills","5–8 min",{d:"dribble",i:"tech"}),COOL]},
  thu:{out:[WUJ,row("Event skill review","15 min",{i:"tech"}),TECHJ,JLIFT("JL","10–15 min"),COOL], in:null}},
 {n:13, start:"2027-02-22", focus:"Preseason transition", st:"vol", mo:"feb",
  tue:{out:[WUJ,row("Accelerations","3×20m",{d:"accel",r:RJ.acc,i:"max"}),row("Controlled runs","2×40–60m",{d:"sefast",r:RJ.full,i:"cf",jl:[2,3],cut:true}),COOL],
       in:[WUJ,row("Starts","3×10–15m",{d:"stand",r:RJ.acc,i:"max"}),row("Mechanics","5–8 min",{d:"dribble",i:"tech"}),COOL]},
  thu:{out:[WUJ,TECHJ,JLIFT("JM"),COOL], in:null}},
];
// JH dose/notes on the shared drills (same names as high school)
const JH_DRILL = {
  wall:{n:"Wall drives", dose:"2 × 4–5 each leg", note:"Posture and coordination.", safe:"Sturdy wall, dry floor, hands at shoulder height."},
  fall:{dose:"3 × 5–10m", note:"Controlled forward projection.", safe:"Clear lane and 10m+ of stopping room."},
  stand:{dose:"3–4 × 10–20m", note:"Focus on pushing mechanics.", safe:"Indoors: 5–15m only, with traction and stopping room."},
  three:{dose:"2–3 × 10–15m", note:"Introduce when the athlete is ready (usually Level 2+).", safe:"Hands on a clean, dry surface."},
  block:{dose:"2–3 low-volume technical starts", note:"Level 3 only, after the start fundamentals look solid.", safe:"Blocks on a surface that holds them; coach checks every setup."},
  wicket:{dose:"2–3 passes", note:"Low height, athlete-appropriate spacing (start short and widen).", safe:"Flat mini-hurdles that tip over; never stacked or rigid."},
  dribble:{dose:"2–3 passes", note:"Coordination and rhythm.", safe:"Clear lane."},
  broad:{dose:"2 × 3", note:"Explosive movement and controlled, quiet landings.", safe:"Mats or turf; stick every landing."},
  pogo:{dose:"1–2 × 8 contacts", note:"Low-volume introduction. Emphasize control.", safe:"Not on concrete."},
  medball:{dose:"2 × 3–5", note:"Light equipment (1–2 kg).", safe:"Throw to a wall or open space; partners stand aside."},
  accel:{dose:"2–3 × 15–20m (indoors 5–15m)", note:"Patient rise, relaxed.", safe:"Indoors only with verified space and traction."},
  fly10:{dose:"2 reps, full recovery", note:"Level 2+ (prepared athletes), outdoors with a gradual build-up.", safe:"Outdoors only with a build-up and a long slowing zone."},
  sefast:{dose:"2 × 40–60m", note:"Level 2+, controlled fast, full recovery.", safe:"Outdoor track only."},
  amarch:{dose:"2 × 10m march, 2 × 15m skip", note:"", safe:"Clear lane."},
  ankling:{dose:"2 × 10m", note:"", safe:""}, buildup:{dose:"2 × 20–30m (indoors 2 × 10m easy)", note:"", safe:"Gradual stop."},
  hmob:{dose:"2 × 4 hurdles", note:"", safe:"Low hurdles."}, hlead:{dose:"2 × 4 each leg", note:"Walking first.", safe:"Split-bar hurdle, low."}, htrail:{dose:"2 × 4 each leg", note:"Walking first.", safe:"Split-bar hurdle, low."},
  hwalk:{dose:"3–4", note:"", safe:"Split-bar hurdle at the lowest height."}, hsingle:{dose:"3–4", note:"Controlled approach.", safe:"Reduced height."}, hrhythm:{dose:"2–3 passes", note:"Start with 1–2 hurdles.", safe:"Indoors only with safe approach, spacing and stopping room."},
  hstart:{dose:"3", note:"Age-appropriate height and marks.", safe:"Outdoors."},
  ljpen:{dose:"2 × 3", note:"", safe:""}, ljpop:{dose:"4 jumps", note:"Short approach (4–6 steps).", safe:"Sand pit only. No landings on a hard floor."},
  hjcurve:{dose:"4 runs", note:"", safe:""}, hjscissor:{dose:"4 jumps", note:"Low bungee only.", safe:"Never without a pit."},
};
const JH_NO = new Set(["fly20","pvcarry","pvplant","tjbound","tjhsj"]);   // not used in junior high (no pole vault in JH)
DRILLS.coord = {n:"Coordination games", cat:"Warm-up & mechanics", env:"both", desc:"Short, fun reaction and coordination games: reaction starts to a clap or ball drop, partner mirror, small-box tag, ladder or line hops.",
  why:"Coordination, reaction and enjoyment. Great for junior high and as a warm-up finisher.", setup:"Cones, a ball, a small marked box. Indoors: short lanes only.", dose:"5–8 min",
  cues:["React fast, stay in control","Tall posture","Have fun"], errs:["Turning it into conditioning","Long sprints indoors"], prog:["Reaction starts into a 10m acceleration (outdoors)"], reg:["Walk-through versions"]};

/* ---------- level switching: every view reads these, so HS/JH is one toggle ---------- */
const PLAN = {
  HS:{weeks:SP_WEEKS_HS, def:DEF_HS, mods:IND_MODS_HS, ht:HURDLE_TECH_HS, jumps:JUMPS_HS, st:SPRINT_TECH_HS, wu:WARMUP_HS, dur:DUR_HS, stat:ST_HS, hurdles:HURDLES_HS, blocks:BLOCKS_HS, sg:["Sprints","Hurdles","Long Jump","High Jump","Pole Vault"]},
  JH:{weeks:SP_WEEKS_JH, def:DEF_JH, mods:IND_MODS_JH, ht:HURDLE_TECH_JH, jumps:JUMPS_JH, st:SPRINT_TECH_JH, wu:WARMUP_JH, dur:DUR_JH, stat:ST_JH, hurdles:HURDLES_JH, blocks:BLOCKS_JH, sg:["Sprints","Hurdles","Long Jump","High Jump"]},
};
let SP_WEEKS, DEF, IND_MODS, HURDLE_TECH, JUMPS, SPRINT_TECH, WARMUP, DUR, ST, HURDLES, BLOCKS, SG_LV, CUR_LV = "HS";
function useLv(lv){ const P = PLAN[lv] || PLAN.HS; CUR_LV = PLAN[lv] ? lv : "HS";
  SP_WEEKS = P.weeks; DEF = P.def; IND_MODS = P.mods; HURDLE_TECH = P.ht; JUMPS = P.jumps; SPRINT_TECH = P.st; WARMUP = P.wu; DUR = P.dur; ST = P.stat; HURDLES = P.hurdles; BLOCKS = P.blocks; SG_LV = P.sg; }
useLv("HS");
function withLv(lv, fn){ const keep = CUR_LV; useLv(lv); try { return fn(); } finally { useLv(keep); } }


/* ---------- state ---------- */
const SP = window.SP = {rev:true, lv:"HS", jl:"All", tab:"cal", sel:null, edits:{}, edraft:null, ewi:null, etab:"groups", emsg:{kind:"",text:""}, wi:null, env:"out", g:"All", me:"", groups:{}, draft:null, msg:{kind:"",text:""}, gq:"", gshow:"all"};
try { const e = localStorage.getItem("sp-env"); if (e==="in"||e==="out") SP.env = e; } catch(e){}
try { SP.me = localStorage.getItem("sp-me") || ""; if (!SP.me) { const h = localStorage.getItem("hub-me") || ""; const ha = h && ATHLETES.find(x=>x.id===h); if (ha && (ha.cats||[]).some(c=>["Sprints","Hurdles","Long Jump","High Jump","Pole Vault"].includes(c))) { SP.me = h; SP.lv = ha.level; } } } catch(e){}
try { const l = localStorage.getItem("sp-lv"); if (l==="JH"||l==="HS") SP.lv = l; } catch(e){}
{ const _a = SP.me && ATHLETES.find(x=>x.id===SP.me); if (_a) SP.lv = _a.level; }
useLv(SP.lv);

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
const hsAthletes = () => ATHLETES.filter(a => a.level===CUR_LV);   // athletes at the level being viewed
// Suggested groups from current events (coaches confirm on Coaches → Sprints)
// JH level suggestion (coaches confirm): 6th → L1, 7th → L2 with track marks else L1, 8th → L2. Level 3 is a coach call.
function suggestJl(a){ const tr = Object.keys(a.prs||{}).some(k=>!k.startsWith("XC")); return a.grade<=6 ? 1 : a.grade===7 ? (tr ? 2 : 1) : 2; }
function suggest(a){
  if (a.level==="JH") { const s = suggestHS(a); return s ? Object.assign(s, {jl: suggestJl(a)}) : null; }
  return suggestHS(a);
}
function suggestHS(a){
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
const jumpEvents = a => Object.keys(JUMPS).filter(x => (a.cats||[]).includes(x));
const jlOf = a => { const g = a && groupOf(a); return g ? (g.jl || suggestJl(a)) : null; };
// JH level filter: rows marked jl:[2,3] show only for those levels (a picked athlete's level wins over the filter).
const levelOK = r => { if (CUR_LV!=="JH" || !r.jl) return true; const a = meA(); const L = a && a.level==="JH" ? jlOf(a) : (SP.jl==="All" ? null : +SP.jl); return !L || r.jl.includes(L); };
const jlChip = r => r.jl ? `<span class="sp-int tech">${r.jl.length===1 ? "Level "+r.jl[0]+" only" : "Level "+r.jl[0]+"+"}</span>` : "";
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
      out.push(["Jumpers · " + e + (e==="Pole Vault" ? " (qualified supervision only)" : "") + (J.starter ? " (starter progression)" : ""), items]);
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
    <p class="note" style="margin:4px 0 0"><b>Rest:</b> ${r.home ? "30–45 s between exercises." : "60–90 s between sets of the first two lifts; 30–45 s between the rest (as a circuit)."}</p>
    <p class="note" style="margin:4px 0 0">${esc(r.home ? "Bodyweight at home. Stop well before failure." : S.note)} ${r.n?esc(r.n):""} Supervised and individualized; never to failure.</p></details>`;
}
function rowsHTML(rows, mo, env, g, a){
  const isHJ = g==="H" || g==="J" || (a && groupOf(a) && ["H","J"].includes(groupOf(a).p));
  return `<table class="sp-rows"><tbody>${rows.filter(r=>r.tech||r.str||r.lift||r.wu||(rowFor(r,g) && levelOK(r))).map(r=>{
    if (r.wu) return `<tr><td class="nm" colspan="3"><a href="#sprints" onclick="SP.tab='warm';render();return false">${CUR_LV==="JH"?"JH warm-up":"Standard warm-up"}</a> <span class="mono">${WU_TIME[CUR_LV]}</span><span class="sub">${CUR_LV==="JH" ? "Easy movement, dynamic mobility, A-march + skipping, ankling, build-ups, a short coordination game." : "Easy movement, dynamic mobility, A-skips / ankling / dribbles, build-ups, event prep."}</span></td></tr>`;
    if (r.str) return `<tr><td colspan="3">${strBlock(r)}</td></tr>`;
    if (r.lift) return `<tr><td colspan="3"><span class="nm">${esc(r.x)}: ${esc((typeof LIFTS!=="undefined" && LIFTS[r.lift] ? LIFTS[r.lift].name : r.lift))}</span> <span class="mono">${esc(r.p)}</span>${typeof liftHTML==="function" ? liftHTML(r.lift) : ""}</td></tr>`;
    if (r.tech) return `<tr><td colspan="3"><span class="nm">${esc(r.x)}</span> <span class="mono">${esc(r.p)}</span>${techBlocks(mo, env, g, a)}</td></tr>`;
    const it = INT[r.i];
    return `<tr><td class="nm">${drillLink(r.d, r.x)}${r.g?` ${r.g.map(chip).join("")}`:""}${it?`<span class="sp-int ${it[1]}">${esc(it[0])}</span>`:""}${jlChip(r)}${r.n?`<span class="sub">${esc(r.n)}</span>`:""}${r.cut && (isHJ || g==="All")?`<span class="sp-cut">H/J: skip this set on days with a full hurdle or jump technical session.</span>`:""}</td>
      <td class="rx">${esc(r.p)}</td><td class="rest">${r.r?esc(r.r):""}</td></tr>`; }).join("")}</tbody></table>`;
}
/* ---------- one day: plan + coach changes ---------- */
const dateIso = (w, dn) => iso(addDays(w.start, DAYN.indexOf(dn)));
function baseDay(w, dn){
  const own = w.days && w.days[dn];
  if (own) return Object.assign({}, own);
  if (dn==="Tue" && w.tue) return {k:"speed", sess:w.tue};
  if (dn==="Thu" && w.thu) return {k:"power", sess:w.thu};
  return Object.assign({}, DEF[dn]);
}
function locate(ds){ const wi = SP_WEEKS.findIndex(w => ds >= w.start && ds <= iso(addDays(w.start,6))); return wi<0 ? null : {wi, dn: DAYN[(parseD(ds).getDay()+6)%7]}; }
function dayInfo(wi, dn){
  const w = SP_WEEKS[wi]; if (!w) return null;
  const ds = dateIso(w, dn); if (ds < PROGRAM_START) return null;
  let b = baseDay(w, dn);
  const rv = (SP.rev || SP.revPrev) && (SP_REV[CUR_LV]||{})[ds];
  if (rv && b.sess) b = Object.assign({}, b, {sess: Object.assign({}, b.sess, rv.sess)}, rv.focus ? {revFocus: rv.focus} : {});
  const ov = SP.edits[ds];
  if (ov) {
    const sportOK = ds >= SPORT_START;   // limited-contact period for sport-specific training starts the week of Dec 7
    if (ov.k==="move" && ov.from && locate(ov.from) && (sportOK || !["speed","power"].includes(baseDay(SP_WEEKS[locate(ov.from).wi], locate(ov.from).dn).k))) { const L = locate(ov.from); b = baseDay(SP_WEEKS[L.wi], L.dn); b.movedFrom = ov.from; b.fromWi = L.wi; }
    else if (ov.k==="indoor") b.forceIn = true;
    else if (ov.k==="home") b = {k:"closed", tpl: ov.tpl || "TA", alts:["RC","GFB"], total: IND[ov.tpl||"TA"].dur, obj:"School is closed or practice is cancelled. Do this at home instead, only if it's safe and you feel good."};
    else if (ov.k==="meet") b = {k:"meet", meet: ov.meet || "Meet"};
    else if (ov.k==="rest") b = {k:"rest"};
    if (ov.note) b.cnote = ov.note;
  }
  if (b.k==="none") return null;
  return Object.assign(b, {wi: b.fromWi ?? wi, ownWi: wi, w: SP_WEEKS[b.fromWi ?? wi], dn, ds, date: parseD(ds)});
}
const isCoach = i => i && (i.k==="speed" || i.k==="power");
const isGsc = i => i && i.k==="gsc";
const isCoachLed = i => isCoach(i) || isGsc(i);
const isInd = i => i && !!i.tpl && !isCoach(i);
function dayTitle(i){ return isGsc(i) ? i.title : isCoach(i) ? (i.revFocus || i.w.focus) : i.k==="meet" ? i.meet : i.k==="rest" ? "Full rest" : IND[i.tpl].n; }
function dayFacts(i){
  if (isGsc(i)) return {dur: i.dur, rpe: CUR_LV==="JH" ? "Easy to moderate (RPE 3–5/10). Technique and confidence, never to failure." : "Light to moderate (RPE 4–6/10). Technique first, never to failure.", equip: i.equip || "Workout clothes and shoes, water. Dumbbells, mats and benches are provided.", obj: i.obj};
  if (isCoach(i)) { const od = i.movedFrom ? locate(i.movedFrom).dn : i.dn; return {dur: DUR[od] || "60–90 min", rpe:"Max effort on each sprint with full rest. The session shouldn't leave you exhausted.", equip: od==="Thu" ? "Running shoes, water, workout clothes for the weight room" : "Running shoes, water, layers for outdoors", obj: i.w.focus}; }
  if (isInd(i)) { const T = IND[i.tpl]; return {dur: i.total || T.dur, rpe: T.rpe, equip: T.equip, obj: i.obj || T.obj}; }
  if (i.k==="meet") return {dur:"Meet day", rpe:"Race effort", equip:"Uniform, spikes, water", obj:"Compete. No extra workout."};
  return {dur:"—", rpe:"Rest", equip:"None", obj:"Recover. Optional comfortable walk or normal daily activity."};
}
const lab = i => LABELS[i.k] || LABELS.rec;
const store = {get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }, set(k,v){ try { if (v==null) localStorage.removeItem(k); else localStorage.setItem(k,v); } catch(e){} }};

function midItems(ds){
  const mon = iso(addDays(ds, -((parseD(ds).getDay()+6)%7)));
  const wk = (typeof WORKOUTS!=="undefined" ? WORKOUTS : []).find(x => x.start===mon);
  const dn = DAYN[(parseD(ds).getDay()+6)%7];
  const d = wk && (wk.days||[]).find(x=>x.day===dn);
  const items = d ? ((d.groups||{})["Mid Distance"]||[]).filter(it=>!it.lv || it.lv==="HS") : [];
  return items;
}
function s3HTML(i){
  const items = midItems(i.ds);
  return `<div class="sp-banner"><b>S3 (400/800 hybrids): follow today's Mid-Distance workout</b>${isInd(i) ? " instead of this home session" : ", unless your coach assigned you this sprint session"}. Never both.
    ${items.length ? `<ul style="margin:6px 0 0">${items.map(it=>`<li>${esc(it.t)}</li>`).join("")}</ul>` : ` <a href="#workouts">See it on the Workouts page →</a>`}</div>`;
}
function wantMods(i){
  const a = meA(), g = a && groupOf(a);
  if (g) return [g.p, ...(g.s||[])];
  return SP.g==="All" ? ["S1","S2","H","J"] : [SP.g];
}
function stepsHTML(T, ds, checklist){
  const key = n => `sp-ck-${ds}-${n}`;
  const one = ([n,p,c],k) => `<li class="sp-step">${checklist ? `<input type="checkbox" aria-label="${esc(n)} done" ${store.get(key(k))?"checked":""} onchange="SP.tick('${key(k)}',this.checked)">` : ""}
    <details><summary><b>${esc(n)}</b> · <span class="dose">${esc(p)}</span>${c?`<span class="how">How ›</span>`:""}</summary>${c?`<div class="sp-cue">${esc(c)}</div>`:""}</details></li>`;
  return `${T.pre ? `<p class="sp-pre"><b>Warm-up:</b> ${esc(T.pre)}</p>` : ""}
    ${T.choose ? `<p class="sp-pre"><b>Choose ONE:</b></p><ul class="sp-checks">${T.choose.map(([n,p],k)=>one([n,p,""],k)).join("")}</ul>${T.opt?`<p class="note" style="margin:4px 0 0">${esc(T.opt)}</p>`:""}` : ""}
    ${T.steps ? `${T.rounds?`<p class="sp-pre"><b>${T.rounds} rounds of:</b></p>`:""}<ul class="sp-checks">${T.steps.map(one).join("")}</ul>` : ""}
    ${T.rest ? `<p class="note" style="margin:4px 0 0">${esc(T.rest)}</p>` : ""}
    ${T.end ? `<p class="note" style="margin:4px 0 0"><b>${esc(T.end)}</b></p>` : ""}`;
}
function doneHTML(ds){
  if (CUR_LV==="JH") return "";   // JH: no completion reporting for voluntary activities
  const v = store.get("sp-done-"+ds) || "";
  return `<div class="sp-done"><span class="muted" style="font-size:13px">How did it go?</span>${[["done","Completed as written"],["alt","Did an alternative"],["rest","Rested"],["skip","Skipped"]].map(([k,l])=>`<button type="button" class="btn sm" aria-pressed="${v===k}" onclick="SP.done('${ds}','${v===k?"":k}')">${l}</button>`).join("")}
    <span class="note" style="width:100%;margin:0">Saved on this phone. Home days are voluntary, never required.</span></div>`;
}
function dayCard(i){
  const F = dayFacts(i), L = lab(i), a = meA(), g = a ? groupOf(a) : null;
  const s3 = (SP.g==="S3" || (g && g.p==="S3")) && (isCoachLed(i) ? !(a && (SP.groups[a.id]||{}).s3==="sprint") : i.k!=="rest" && i.k!=="meet");
  let body = "";
  if (isGsc(i)) {
    const nm = {warm:"Warm-up", intro:"Weight-room intro", str:"Strength", cond:"Conditioning", cool:"Cool-down"};
    body = `<div class="sp-banner">${CUR_LV==="JH" ? "General movement &amp; strength only. Speed work starts the week of Dec 7." : "General strength &amp; conditioning only. Sprint-specific training starts Tue Dec 8."}</div>
      ${i.blocks.map(([k,x,p,n]) => `<div class="sp-tech"><h4>${esc(nm[k])}</h4><p style="margin:0"><b>${esc(x.replace(/^Weight room: /,""))}</b> <span class="mono">${esc(p)}</span></p>${n?`<p class="note" style="margin:2px 0 0">${esc(n)}</p>`:""}${k==="str" && typeof liftHTML==="function" ? liftHTML(i.lift).replace("<details class=\"lift\">","<details class=\"lift\" open>") : ""}</div>`).join("")}
      <p class="note" style="margin:0">Light resistance, technique first, never to failure. Anything hurts? Stop and tell your coach or athletic trainer. ${CUR_LV==="JH" ? "Assumes it's permitted under junior high rules and district policy, approved by the athletic department." : "Coach-led and voluntary; follows the AD's reading of IHSAA out-of-season conditioning rules."}</p>`;
  } else if (isCoach(i)) {
    const env = i.forceIn ? "in" : SP.env, S = i.sess, rows = env==="in" ? (S.in || S.out) : S.out;
    body = `${i.forceIn ? `<div class="sp-banner">Moved indoors today (weather or facility).</div>` : ""}
      <p class="sp-pre"><b>${env==="in" ? "Indoor: hallway / gym" : "Outdoor: track"}</b>${env==="in" && !S.in ? ` · same plan either way; keep starts to ${CUR_LV==="JH"?"5–15m":"10–20m"} indoors` : ""}</p>
      ${rowsHTML(rows, i.w.mo, env, SP.g, a)}
      <details class="sp-tech"><summary><b>Safety + recovery</b></summary><ul>
        <li>Full recovery between max reps: 2–3 min for short accelerations, 4–6 min for flying sprints.</li>
        <li>Indoors: accelerations only 10–20m, with traction, a clear lane, stopping room and coach approval. No indoor flying sprints unless the zones are verified safe.</li>
        <li>Anything hurts? Stop and tell your coach or the athletic trainer.</li>
        <li>After: 5 min easy walk + Recovery C mobility at home tonight if you're stiff.</li></ul></details>
      ${canPost ? `<div><button type="button" class="btn sm" onclick="SP.print(${i.wi},'${i.movedFrom ? locate(i.movedFrom).dn : i.dn}')">Print session plan</button></div>` : ""}`;
  } else if (isInd(i)) {
    const T = IND[i.tpl];
    const mods = wantMods(i).filter(k=>IND_MODS[k]);
    body = `${stepsHTML(T, i.ds, true)}
      ${i.extra ? `<p class="sp-pre">${esc(i.extra)}</p>` : ""}${i.avoid ? `<p class="note" style="margin:4px 0 0">${esc(i.avoid)}</p>` : ""}
      ${(i.alts||[]).length ? `<div class="sp-alts"><b>Alternatives</b>${i.altNote?` <span class="muted">${esc(i.altNote)}</span>`:""}${i.alts.map(k => k==="rest" ? `<div class="sp-tech">Complete rest: take the day off.</div>` : `<details class="sp-tech"><summary><b>${esc(IND[k].n)}</b> · ${esc(IND[k].dur)} · RPE ${esc(IND[k].rpe)}</summary>${stepsHTML(IND[k], i.ds+"-"+k, false)}</details>`).join("")}</div>` : ""}
      ${mods.length ? `<div class="sp-tech"><h4>Your group</h4><ul>${mods.map(k=>`<li>${chip(k)} ${esc(IND_MODS[k])}</li>`).join("")}</ul></div>` : ""}
      <p class="note" style="margin:4px 0 0">Safety: stop if anything hurts and tell your coach or athletic trainer. Don't make up a missed sprint session on a home day.</p>
      ${doneHTML(i.ds)}`;
  } else if (i.k==="meet") body = `<p style="margin:0">Meet day: follow your coach's meet-day plan. No extra workout.</p>`;
  else body = `<p style="margin:0">No assigned workout. Optional comfortable walk or normal daily activity.${i.note?` <b>${esc(i.note)}</b>`:""}</p>`;
  return `<div class="panel sp-daycard"><div class="sp-dhead"><div><div class="sp-ddate">${i.date.toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}</div>
      <span class="sp-lb ${L[1]}">${esc(L[0])}</span>${i.movedFrom ? ` <span class="sp-lb lb-opt">Moved from ${fmt(parseD(i.movedFrom))}</span>` : ""}</div></div>
    <h2 class="sp-dtitle">${esc(dayTitle(i))}</h2>
    ${i.cnote ? `<div class="sp-banner"><b>Coach note:</b> ${esc(i.cnote)}</div>` : ""}
    <div class="sp-facts"><div><span>How long</span><b>${esc(F.dur)}</b></div><div><span>How hard</span><b>${esc(F.rpe)}</b></div><div><span>Equipment</span><b>${esc(F.equip)}</b></div><div><span>Goal</span><b>${esc(F.obj)}</b></div></div>
    ${s3 ? s3HTML(i) : ""}
    ${body}</div>`;
}

/* ---------- print: coach-facing daily session plan ---------- */
SP.print = function(wi, day){
  const w = SP_WEEKS[wi], S = w[day.toLowerCase()]; if (!S) return;
  const one = (env) => { const rows = env==="in" ? (S.in||S.out) : S.out;
    return `<h2>${env==="in"?"Indoor (hallway / gym)":"Outdoor (track)"}</h2><table><tr><th>Block</th><th>Prescription</th><th>Rest</th><th>Groups / notes</th></tr>
    ${rows.map(r=>{
      if (r.wu) return `<tr><td><b>${CUR_LV==="JH"?"JH warm-up":"Standard warm-up"}</b></td><td>${WU_TIME[CUR_LV]}</td><td></td><td>${WARMUP.map(x=>esc(x[0])).join(" → ")}</td></tr>`;
      if (r.lift) { const L = (typeof LIFTS!=="undefined" && LIFTS[r.lift]) || {name:r.lift, ex:[]}; return `<tr><td><b>${esc(r.x)}</b> · ${esc(L.name)}</td><td>${esc(r.p)}</td><td>${esc(L.rest||"30–60 sec")}</td><td>${L.ex.map(e=>esc(e[0]+" "+e[1])).join("; ")}</td></tr>`; }
      if (r.str) { const s = STR[r.str]; return `<tr><td><b>Strength</b> · ${esc(s.n)}</td><td>30–35 min</td><td></td><td>${s.ex.map(e=>esc(e[0]+" "+e[1])).join("; ")}${r.mod?". "+esc(STR_MOD[r.mod]):""}</td></tr>`; }
      if (r.tech) return `<tr><td><b>${esc(r.x)}</b></td><td>${esc(r.p)}</td><td></td><td>S1/S2: ${esc((SPRINT_TECH[w.mo]||[]).map(x=>x[0]).join("; "))}<br>H: ${esc((HURDLE_TECH[w.mo]||[]).map(x=>x[0]+" "+x[1]).join("; "))}<br>J: ${esc(Object.entries(JUMPS).map(([k,J])=>k+": "+(J.mo[w.mo]||[]).join(", ")).join(" | "))}</td></tr>`;
      return `<tr><td><b>${esc(r.x)}</b>${r.i&&INT[r.i]?` (${esc(INT[r.i][0])})`:""}</td><td>${esc(r.p)}</td><td>${esc(r.r||"")}</td><td>${r.g?esc(r.g.join("/")):"All"}${r.jl?" · Level "+r.jl[0]+(r.jl.length>1?"+":" only"):""}${r.cut?" · H/J may skip":""}${r.n?" · "+esc(r.n):""}</td></tr>`; }).join("")}</table>`; };
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Session plan · ${esc(day)} ${esc(fmt(addDays(w.start, DAYN.indexOf(day))))}</title>
    <style>body{font:13px/1.4 system-ui,sans-serif;margin:24px;color:#111}h1{font-size:20px;margin:0}h2{font-size:15px;margin:16px 0 6px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #bbb;padding:5px 7px;text-align:left;vertical-align:top}th{background:#eee}.n{margin-top:12px;font-size:12px}</style></head><body>
    <h1>BC ${CUR_LV==="JH"?"Junior High ":""}Sprints, Hurdles &amp; Jumps · Week ${w.n} · ${esc(day)} ${esc(fmt(addDays(w.start, DAYN.indexOf(day))))}</h1>
    <div>Focus: <b>${esc(w.focus)}</b> · ${esc(DUR[day]||"")}</div>
    ${one("out")}${S.in?one("in"):""}
    <div class="n"><b>Every session:</b> full recovery between max reps (2–3 min short accelerations, 4–6 min flying). Indoor accelerations 10–20m only with traction, clear lanes and stopping room, and coach approval. No indoor flying sprints unless the approach, timed zone and stopping area are verified. If sprinting isn't safe, swap for technical drills, controlled power and strength. Reduce volume for beginners, returning-from-injury athletes, and anyone doing a full hurdle/jump session. S3 hybrids follow the Mid-Distance plan unless assigned this session.</div>
    <div class="n">Attendance / notes: ______________________________________________</div>
    <script>window.onload=()=>window.print()<\/script></body></html>`;
  const win = window.open("", "_blank"); if (!win) return; win.document.write(html); win.document.close();
};

/* ---------- views ---------- */
function defaultSel(){
  const t = iso(today), first = PROGRAM_START, last = iso(addDays(SP_WEEKS[SP_WEEKS.length-1].start, 6));
  return t < first ? first : t > last ? last : t;
}
function calendarView(){
  if (!SP.sel || !locate(SP.sel)) SP.sel = defaultSel();
  const L0 = locate(SP.sel), wi = L0.wi, w = SP_WEEKS[wi];
  const a = meA(), ag = a ? groupOf(a) : null;
  const hs = hsAthletes().filter(x=>groupOf(x) && groupOf(x).p!=="MD").sort((x,y)=>x.name.localeCompare(y.name));
  const tIso = iso(today);
  const meBar = `<div class="sp-me"><label for="sp-me" class="muted" style="font-size:14px">Find my workout:</label>
    <select id="sp-me" onchange="SP.setMe(this.value)"><option value="">Pick your name</option>${hs.map(x=>`<option value="${x.id}" ${SP.me===x.id?"selected":""}>${esc(x.name)}</option>`).join("")}</select>
    ${a && ag ? `<span>${chip(ag.p)}${(ag.s||[]).map(chip).join("")}${a.level==="JH"?` <span class="sp-grp">L${jlOf(a)}</span>`:""}</span>` : ""}</div>`;
  const jlBar = CUR_LV==="JH" ? `<div class="filters" role="group" aria-label="Level">${[["All","All levels"],["1","Level 1"],["2","Level 2"],["3","Level 3"]].map(([k,l])=>`<button type="button" aria-pressed="${String(SP.jl)===k}" onclick="SP.jl='${k}';render()">${l}</button>`).join("")}${a && a.level==="JH" ? `<span class="muted" style="font-size:13px;align-self:center">${esc(a.name.split(" ")[0])} is Level ${jlOf(a)}</span>` : ""}</div>` : "";
  const strip = DAYN.map(dn => { const i = dayInfo(wi, dn), ds = dateIso(w, dn);
    return `<button type="button" class="sp-dbtn ${i ? lab(i)[1] : "lb-none"} ${ds===tIso?"today":""}" aria-pressed="${ds===SP.sel}" ${i?"":"disabled"} onclick="SP.sel='${ds}';render()">
      <b>${dn}</b><span>${parseD(ds).getDate()}</span><small>${i ? esc(lab(i)[0].replace("General Strength & Conditioning","Strength").replace("Independent ","").replace("Coach-Led ","").replace("Optional Conditioning","Optional")) : "—"}</small></button>`; }).join("");
  const sel = dayInfo(wi, L0.dn);
  return `${meBar}
    <div class="bar" style="justify-content:flex-start">
      <div class="seg" role="group" aria-label="Indoor or outdoor">${[["out","Outdoor"],["in","Indoor"]].map(([k,l])=>`<button type="button" aria-pressed="${SP.env===k}" onclick="SP.setEnv('${k}')">${l}</button>`).join("")}</div>
      <div class="filters" role="group" aria-label="Group">${["All",...GKEYS].map(g=>`<button type="button" aria-pressed="${SP.g===g}" onclick="SP.g='${g}';render()">${g==="All"?"All groups":g}</button>`).join("")}</div></div>
    ${jlBar}
    <div class="weekpick" style="justify-content:flex-start"><button type="button" aria-label="Previous week" ${wi===0?"disabled":""} onclick="SP.week(-1)">‹</button>
      <b>Wk ${w.n} · ${fmt(parseD(w.start < PROGRAM_START ? PROGRAM_START : w.start))}–${addDays(w.start,6).getDate()}</b>
      <button type="button" aria-label="Next week" ${wi===SP_WEEKS.length-1?"disabled":""} onclick="SP.week(1)">›</button>
      ${SP.sel!==defaultSel() ? `<button type="button" class="btn sm" onclick="SP.sel=null;render()">Today</button>` : ""}</div>
    <div class="${ST[w.st][1]}"><b>${esc(w.focus)}.</b> ${esc(w.note || ST[w.st][0])}${w.test ? " <b>Testing week:</b> times are logged with method, surface and indoor/outdoor." : ""}</div>
    <div class="sp-strip">${strip}</div>
    ${sel ? dayCard(sel) : `<div class="panel"><p style="margin:0">The program starts Tuesday, Dec 1.</p></div>`}
    <details class="panel"><summary><b>All 13 weeks</b></summary><div class="sp-wkgrid" style="margin-top:8px">${SP_WEEKS.map((x,k)=>`<button type="button" class="sp-wk ${x.st==="break"?"brk":""}" aria-pressed="${k===wi}" onclick="SP.sel='${x.start < PROGRAM_START ? PROGRAM_START : iso(addDays(x.start,1))}';render()"><b>Wk ${x.n} · ${fmt(parseD(x.start < PROGRAM_START ? PROGRAM_START : x.start))}</b>${esc(x.focus)}</button>`).join("")}</div></details>`;
}
function drillCard(id){
  const D = DRILLS[id];
  const ul = a => `<ul>${a.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`;
  return `<div class="panel sp-drill" id="dr-${id}" style="${SP.drill===id?"box-shadow:0 0 0 2px var(--gold)":""}"><h3>${esc(CUR_LV==="JH" && JH_DRILL[id] && JH_DRILL[id].n ? JH_DRILL[id].n + " (" + D.n + ")" : D.n)}<span class="sp-env">${D.env==="out"?"Outdoor":D.env==="in"?"Indoor":"Indoor + outdoor"}</span></h3>
    <p style="margin:0">${esc(D.desc)}</p><dl>
    <dt>Purpose</dt><dd>${esc(D.why)}</dd><dt>Setup</dt><dd>${esc(D.setup)}</dd><dt>Sets / reps</dt><dd class="mono">${esc(D.dose)}${CUR_LV==="JH" && JH_DRILL[id] ? ` <span class="muted">(high school)</span>` : ""}</dd>
    ${CUR_LV==="JH" && JH_DRILL[id] ? `<dt>Junior high</dt><dd><b class="mono">${esc(JH_DRILL[id].dose)}</b>${JH_DRILL[id].note?` · ${esc(JH_DRILL[id].note)}`:""}</dd>` : ""}
    <dt>Cues</dt><dd>${ul(D.cues)}</dd><dt>Mistakes</dt><dd>${ul(D.errs)}</dd><dt>Progress</dt><dd>${ul(D.prog)}</dd><dt>Regress</dt><dd>${ul(D.reg)}</dd>
    ${CUR_LV==="JH" && JH_DRILL[id] && JH_DRILL[id].safe ? `<dt>Safety</dt><dd>${esc(JH_DRILL[id].safe)}</dd>` : ""}
    ${D.url?`<dt>Video</dt><dd><a href="${esc(D.url)}" target="_blank" rel="noopener">▶ Watch</a></dd>`:""}</dl></div>`;
}
function drillsView(){
  const cats = CATS_ORDER.filter(c => Object.values(DRILLS).some(d=>d.cat===c));
  SP.dcat = SP.dcat || "All";
  const ids = Object.keys(DRILLS).filter(id => (SP.dcat==="All" || DRILLS[id].cat===SP.dcat) && !(CUR_LV==="JH" && JH_NO.has(id)) && !(CUR_LV==="JH" && /^(Pole vault|PV)/i.test(DRILLS[id].n)));
  return `<div class="filters" role="group" aria-label="Drill type">${["All",...cats].map(c=>`<button type="button" aria-pressed="${SP.dcat===c}" onclick="SP.dcat='${c}';render()">${c}</button>`).join("")}</div>
    <div class="sp-drills">${ids.map(drillCard).join("")}</div>
    <p class="note">Video links can be added to any drill (the <code>url</code> field in sprints.js) once we pick the clips we like.</p>`;
}
function sprintWhyHTML(jh){
  const L = (a,b) => `<tr><td><b>${a}</b></td><td>${b}</td></tr>`;
  return `<div class="panel"><h2>How we build sprinters</h2>
    <p style="margin:0 0 8px">Fast, fresh, measured. Every athlete shares the same speed foundation; the event decides what gets added on top.</p>
    <div class="tbl"><table><tbody>
      ${L("Acceleration", jh ? "Getting up to speed: 3–4 × 10–20m starts with full recovery. One cue at a time." : "Getting up to speed: starts and 20–30m accelerations (e.g. 4 × 20m + 2 × 30m), 2–4 min rest. Blocks progress setup → first steps → transition → commands → race-condition starts.")}
      ${L("Max velocity", jh ? "Relaxed build-ups. Short flying zones only for technically ready athletes with room to slow down." : "Top speed: 3–4 flying 20s with an individual build-up and safe run-out, 4–6 min rest (longer if needed).")}
      ${L("Sprint endurance", jh ? "Holding form a bit longer: 2 × 60–80m, building to 2 × 100–120m with generous rest." : "100/200: holding speed late in the race. Starts at 2 × 100m fast and controlled (8–10 min rest), builds toward 2 × 120–150m (10–15 min).")}
      ${L("400 preparation", jh ? "Prepared JH 400 runners only: controlled 120–150m reps later in the season. No split-run fatigue sessions." : "200/400: longer reps from 2 × 150m to 2 × 200m at about 90% (6–10 min rest), opening control, curve and backstretch rhythm, 4×400 exchanges. Prepared 400 runners occasionally run one 200m + 150m split (90 sec between); it replaces other endurance work, never adds to it.")}
      ${L("400/800", "Coordinated with Mid-Distance under one lead coach. One workout a day, never both.")}
      ${L("Recovery", "Full recovery keeps sprints fast and teaches speed; short rest turns them into conditioning. About 48 hours between demanding days. Meets, fast relay exchanges, hurdles and jumps all count as load. Missed sessions are never made up.")}
      ${L("Strength & power", jh ? "Bodyweight first: squat, hinge, lunge, calf raises, simple landings. Add load only when technique is solid." : "Posterior chain (RDL, hip hinge), calves/ankles (calf raises, pogos), single-leg strength (split squat, step-up) and low-volume landings and jumps. Progress load or difficulty only when technique is solid; new exercises come in slowly. In season it's maintenance, lifted on sprint days, not extra hard days.")}
      ${L("Indoors", "Short starts indoors are useful, but they don't replace top speed or longer reps. When we get back outside, longer reps restart at the last distance actually run outdoors. We never squeeze a missed month into one week.")}
      ${L(jh ? "Junior high → high school" : "From junior high", jh ? "Same drill names, warm-up and lifts as high school, smaller doses and no forced times. JH explores events, learns curves, blocks where appropriate, relay exchanges and finishing mechanics. HS adds pathways, sprint endurance and 400 work." : "JH learns the same drills, warm-up and lifts with event exploration and small doses. HS adds pathway-specific endurance, blocks under race conditions and 400 work.")}
    </tbody></table></div></div>`;
}
function philViewJH(){
  const wk = [["Mon","Independent recovery / mobility","10–15 min"],["Tue","<b>Coach-led speed development</b>","45–65 min"],["Wed","Independent easy activity","15–25 min"],["Thu","<b>Coach-led speed, event technique &amp; strength</b>","45–65 min"],["Fri","Independent recovery","15–20 min"],["Sat","Optional general fitness or recreational play","15–25 min"],["Sun","Full rest","—"]];
  return `<div class="panel"><h2>Junior high: one 6th–12th grade system</h2><p style="margin:0">Same coaching approach as high school (80% Tony Holler / Feed the Cats, 20% Jack Daniels-inspired individual progression), sized for junior high. Not the high school workouts with fewer reps: the same fundamentals with different workloads, technical expectations and progression rates.</p>
      <ul class="exp" style="margin:8px 0 0"><li>Make speed fun, and build confidence and positive competition</li><li>Teach sprint mechanics, acceleration and coordination</li><li>Explosive movement skills with low fatigue</li><li>Try lots of events. Build habits that carry into high school</li></ul></div>
    <div class="panel"><h2>Three levels</h2><p style="margin:0 0 8px">Athletes move up on technique, readiness and coach judgment, not age or race times. Coaches set each athlete's level on Coaches → Sprints.</p>
      <div class="cols">${[1,2,3].map(n=>`<div><h3 style="margin:0">${esc(LEVELS_JH[n].n)}</h3><div class="muted" style="font-size:13px">${esc(LEVELS_JH[n].typ)}</div><ul class="exp" style="margin:6px 0 0">${LEVELS_JH[n].focus.map(f=>`<li>${esc(f)}</li>`).join("")}</ul></div>`).join("")}</div></div>
    ${sprintWhyHTML(true)}
    <div class="cols"><div class="panel"><h2>The week</h2><div class="tbl"><table><tbody>${wk.map(([d,x,m])=>`<tr><td><b>${d}</b></td><td>${x}</td><td class="mono">${m}</td></tr>`).join("")}</tbody></table></div>
        <p class="note" style="margin:8px 0 0">Starts Tue Dec 1 with general movement + strength (Dec 1 and Dec 3, 35–45 min). Speed work starts the week of Dec 7. Dec 22–24 is a reduced optional week and Dec 29–31 is holiday recovery: no required sessions. Coach-led sessions assume they're permitted under junior high rules and district policy (high school IHSAA rules aren't assumed; confirm with the AD). Voluntary days are optional, with no completion reporting.</p></div>
      <div class="panel"><h2>Indoor rules</h2><ul class="exp"><li>Hallway/gym space is about 40–60m <b>including</b> slowing down</li><li>Junior high indoor accelerations start at 5–15m, only with traction, clear lanes and stopping room</li><li>Never force longer sprints indoors. No max sprinting in unsafe hallways</li><li>Every coach-led day has an outdoor and indoor version with the same goal</li></ul></div></div>`;
}
function philView(){
  if (CUR_LV==="JH") return philViewJH();
  return `<div class="panel"><h2>Our philosophy</h2>
      <p style="margin:0 0 8px">About <b>80% Tony Holler (Feed the Cats)</b> and <b>20% Jack Daniels</b>-style individual progression and planning. That's a blend of coaching ideas, not an 80/20 easy/hard split.</p>
      <div class="cols"><div><h3 style="margin:0 0 6px">Feed the cats</h3><ul class="exp"><li>Max velocity and acceleration come first</li><li>Sprint fast while fresh, early in the session</li><li>Time sprints whenever we can</li><li>Full recovery between max reps</li><li>No conditioning for conditioning's sake</li><li>Competition is a big part of training</li></ul></div>
        <div><h3 style="margin:0 0 6px">Plan like Daniels</h3><ul class="exp"><li>Progressions fit each athlete's event, training age and readiness</li><li>Volumes are starting points; coaches reduce them when needed</li><li>Strength, plyos, hurdles and jumps are added without overloading</li><li>Peak for championship meets</li></ul></div>
        <div><h3 style="margin:0 0 6px">Measure it</h3><ul class="exp"><li>Improvement, not just workout completion</li><li>Baseline testing Week 6 (Jan 5), reassessment Week 9 (Jan 26)</li><li>10m, 20m, flying 10/20m, standing broad jump, block-start scores</li></ul></div></div></div>
    ${sprintWhyHTML(false)}
    <div class="panel sp-stage"><h2>Signature priorities</h2><p style="margin:0">Our biggest team-wide weaknesses: <b>starting-block mechanics, initial acceleration, and explosiveness</b>. Every winter week trains them. See the <a href="#sprints" onclick="SP.tab='blocks';render();return false">block-start pathway</a>.</p></div>
    <div class="panel"><h2>Training groups</h2><div class="tbl"><table><thead><tr><th>Group</th><th>Events</th><th>Emphasis</th></tr></thead><tbody>
      ${GKEYS.map(k=>`<tr><td>${chip(k)} <b>${esc(GROUPS[k].n)}</b></td><td>${esc(GROUPS[k].ev)}</td><td>${esc(GROUPS[k].em)}</td></tr>`).join("")}</tbody></table></div>
      <p class="note" style="margin:8px 0 0">Each athlete has <b>one primary group</b> and optional secondary events. We never stack full workouts from two groups on one athlete: hurdle and jump work <b>replaces</b> sprint volume, it doesn't add to it.</p></div>
    <div class="cols"><div class="panel"><h2>Winter week</h2><div class="tbl"><table><tbody>
        <tr><td><b>Mon</b></td><td>Independent recovery: Mobility Reset</td><td class="mono">12–30 min</td></tr>
        <tr><td><b>Tue</b></td><td><b>Coach-led speed</b>: acceleration, max velocity, mechanics</td><td class="mono">60–75 min</td></tr>
        <tr><td><b>Wed</b></td><td>Independent recovery: Easy Walk + Mobility</td><td class="mono">12–30 min</td></tr>
        <tr><td><b>Thu</b></td><td><b>Coach-led power/technique</b>: hurdles/jumps, power, weight room</td><td class="mono">75–90 min</td></tr>
        <tr><td><b>Fri</b></td><td>Independent recovery: Easy Aerobic</td><td class="mono">15–30 min</td></tr>
        <tr><td><b>Sat</b></td><td>Optional general fitness: Core + Stability</td><td class="mono">15–30 min</td></tr>
        <tr><td><b>Sun</b></td><td>Full rest</td><td class="mono">—</td></tr></tbody></table></div>
        <p class="note" style="margin:8px 0 0">Starts Tue Dec 1 with general strength &amp; conditioning (Dec 1 and Dec 3). Sprint-specific training starts Tue Dec 8, when the limited-contact period begins. Dec 21 – Jan 3: no practices, optional work only. Coach-led winter sessions are voluntary/out-of-season and follow current IHSAA rules (confirm with the AD). Home days are always voluntary. <b>A recovery day is not another workout disguised as recovery.</b></p></div>
      <div class="panel"><h2>Indoor rules</h2><ul class="exp"><li>Hallway/gym space is about 40–60m <b>including</b> slowing down</li><li>Indoor accelerations start at 10–20m, only with traction, clear lanes, stopping room and coach approval</li><li>No indoor flying sprints unless the approach, timed zone and stopping area are verified safe</li><li>If sprinting isn't safe: technical drills, controlled power, strength</li></ul></div></div>`;
}
function warmView(){
  return `<div class="panel"><h2>${CUR_LV==="JH" ? "Junior high warm-up · 8–12 min" : "Standard warm-up · 12–15 min"}</h2><div class="tbl"><table><thead><tr><th>Part</th><th>Time</th><th>What</th></tr></thead><tbody>
    ${WARMUP.map(([a,b,c])=>`<tr><td><b>${esc(a)}</b></td><td class="mono">${esc(b)}</td><td>${esc(c)}</td></tr>`).join("")}</tbody></table></div>
    <p class="note" style="margin:8px 0 0">${CUR_LV==="JH" ? "Keep it short and fun. Avoid long, exhausting warm-ups." : "Form drills take 8–12 minutes and focus on one or two meaningful cues. Avoid long static stretching before max sprinting."}</p></div>
    <div class="sp-drills">${(CUR_LV==="JH" ? ["amarch","ankling","buildup","coord"] : ["amarch","ankling","dribble","buildup"]).map(drillCard).join("")}</div>`;
}
function blocksView(){
  return `<div class="panel"><h2>${CUR_LV==="JH" ? "Starting-position pathway (junior high)" : "Starting-block pathway"}</h2><p style="margin:0">${CUR_LV==="JH" ? "Junior high builds the foundations: posture, falling and standing starts, then three-point starts. Blocks are for Level 3 only, after the fundamentals look solid. High school picks up from here." : "Four stages, one per phase of the season. Starts happen early in the session when athletes are fresh."}</p></div>
    <div class="cols">${BLOCKS.map((b,i)=>`<div class="panel sp-stage"><div class="mlabel" style="margin:0">Stage ${i+1} · ${esc(b.mo)}</div><h3 style="margin:2px 0 6px">${esc(b.t)}</h3><ul class="exp" style="margin:0">${b.items.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`).join("")}</div>
    <div class="panel"><h2>Block Start Scorecard</h2><p style="margin:0 0 8px">Coaches rate each item 1–5 from live viewing or video, with a video link and notes. Recording scores comes with the Speed &amp; Power profiles (next update).</p>
      <div class="tbl"><table><thead><tr><th>Item</th><th>What a 5 looks like</th></tr></thead><tbody>${SCORECARD.map(([a,b])=>`<tr><td><b>${esc(a)}</b></td><td>${esc(b)}</td></tr>`).join("")}</tbody></table></div>
      <p class="note" style="margin:8px 0 0">Times alone don't diagnose technique. A slow 10m could be setup, push, first steps, or just a tired day: watch it or film it.</p></div>
    <div class="sp-drills">${["fall","three","block","wall"].map(drillCard).join("")}</div>`;
}
function hurdleView(){
  return `<div class="panel"><h2>Hurdle development</h2><p style="margin:0">We're planning to buy about four <a href="https://www.everythingtrackandfield.com/First-Place-Split-Bar-Training-Hurdle/" target="_blank" rel="noopener">First Place Split Bar Training Hurdles</a> for confidence, attacking mechanics, first-hurdle execution and rhythm. Conventional hurdles stay in use for competition-specific work.</p></div>
    <div class="cols">${HURDLES.map(h=>`<div class="panel sp-stage"><div class="mlabel" style="margin:0">${esc(h.mo)}</div><ul class="exp" style="margin:6px 0 0">${h.items.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`).join("")}</div>
    ${CUR_LV==="JH" ? `<div class="panel"><h2>Junior high hurdles</h2><ul class="exp" style="margin:0"><li>Split-bar hurdles teach confidence, lead and trail legs, moving forward over the hurdle, rhythm and the first-hurdle approach.</li><li>They're technical aids, not a substitute for practice over regulation hurdles in the spring.</li><li>Indoors: one or two hurdles only, with safe approach, spacing and stopping room.</li></ul></div>` : ""}
    <div class="cols"><div class="panel"><h2>Example technical session</h2><ol class="exp"><li>Warm-up</li><li>Lead/trail-leg drills: 2×5 each leg</li><li>Single-hurdle attacks: 4 reps</li><li>Rhythm: 3 × 2–3 hurdles if space permits</li><li>Short video feedback</li><li>Strength or mobility as scheduled</li></ol></div>
      <div class="panel"><h2>Rules</h2><ul class="exp"><li>Indoors, start with one or two hurdles. Add more only when approach, spacing, clearance and stopping room are safe.</li><li>Hurdle reps count as high-intensity work. Never add a full hurdle session on top of a full max-sprint session.</li></ul></div></div>
    <div class="sp-drills">${["hlead","htrail","hmob","hwalk","hsingle","hrhythm","hstart"].map(drillCard).join("")}</div>`;
}
function jumpsView(){
  return `<div class="panel"><h2>Jump development${CUR_LV==="JH" ? " · junior high" : ""}</h2><p style="margin:0">${CUR_LV==="JH" ? "Starter progressions for long jump and high jump, beginner-friendly with safe landings first. The full junior high jump section is still to be added." : "Jumpers share the acceleration and max-velocity work, with sprint volume adjusted for jumping days. Event work below follows the calendar month."}</p></div>
    <div class="cols">${Object.entries(JUMPS).map(([e,J])=>`<div class="panel"><h2>${esc(e)}</h2><ul class="exp" style="margin:0">${J.focus.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
      ${["dec","jan","feb"].map(m=>`<div class="mlabel">${({dec:"December",jan:"January",feb:"February"})[m]}</div><ul class="exp" style="margin:4px 0 0">${J.mo[m].map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`).join("")}
      <p class="note" style="margin:8px 0 0">Drills: ${J.drills.map(d=>drillLink(d, DRILLS[d].n)).join(" · ")}</p></div>`).join("")}</div>
    <p class="note">${CUR_LV==="JH" ? "No high jump landings without a pit. No long jump takeoffs onto a hard floor." : "Pole vault technical sessions require qualified supervision and proper facilities and equipment. No high jump or pole vault landings without a pit."}</p>`;
}
function strengthView(){
  if (CUR_LV==="JH") return `<div class="panel"><h2>Junior high strength</h2><p style="margin:0">Supervised, bodyweight and light loads, technique and confidence first. Never to failure, no max lifting. These are the same JH lifts the junior high distance group uses, so it's one system.</p></div>
    <div class="cols">${[["JGA1","Tue Dec 1"],["JGA2","Thu Dec 3"],["JA","December Thursdays (15–20 min)"],["JB","January–February Thursdays"],["JL","Feb 18 (light)"],["JM","Feb 25 on (maintenance)"]].map(([c,w])=>`<div class="panel"><div class="mlabel" style="margin:0">${esc(w)}</div><h3 style="margin:2px 0 6px">${esc(LIFTS[c] ? LIFTS[c].name : c)}</h3>${typeof liftHTML==="function" ? liftHTML(c).replace('<details class="lift">','<details class="lift" open>') : ""}</div>`).join("")}</div>`;
  return `<div class="panel"><h2>Thursday weight room · 30–35 min</h2><p style="margin:0">Supervised and individualized. Never to failure. Exercise menu: trap-bar deadlift or squat variation, dumbbell bench, Romanian deadlift, rows or pull-ups, split squats, core stabilization, med-ball power.</p></div>
    <div class="cols">${["dec","jan","feb","spring"].map(k=>{ const S = STR[k]; return `<div class="panel"><h2>${esc(S.n)}</h2><div class="tbl" style="border:0"><table><tbody>${S.ex.map(([n,p])=>`<tr><td>${esc(n)}</td><td class="mono">${esc(p)}</td></tr>`).join("")}</tbody></table></div><p class="note" style="margin:6px 0 0">${esc(S.note)}</p></div>`; }).join("")}</div>`;
}
function groupsView(){
  const by = {}; hsAthletes().forEach(a => { const g = groupOf(a); if (!g) return; (by[g.p] ||= []).push([a,g,"p"]); (g.s||[]).forEach(s => (by[s] ||= []).push([a,g,"s"])); });
  const anySug = hsAthletes().some(a => !SP.groups[a.id] && suggest(a));
  return `${anySug ? `<p class="note" style="margin:0">${canPost ? `Some groups are <i>suggested</i> from last season's events until a coach saves them on <a href="#coaches" onclick="ctab='sgroups'">Coaches → Sprints</a>.` : "Groups are still being finalized by the coaches."}</p>` : ""}
    <div class="cols">${[...GKEYS,"MD"].filter(k=>by[k]).map(k=>`<div class="panel"><h2>${chip(k)} ${esc(GROUPS[k].n)}</h2><p class="note" style="margin:0 0 6px">${esc(GROUPS[k].ev)}</p>
      <ul class="exp" style="margin:0">${by[k].sort((x,y)=>(x[2]===y[2]?0:x[2]==="p"?-1:1) || x[0].name.localeCompare(y[0].name)).map(([a,g,t])=>`<li>${a.level==="JH"?`<span class="sp-grp">L${g.jl||suggestJl(a)}</span> `:""}${t==="p"?`<b>${esc(a.name)}</b>`:`${esc(a.name)} <span class="muted" style="font-size:12px">(secondary)</span>`}${canPost&&g.sug?` <span class="sp-sug">suggested</span>`:""}</li>`).join("")}</ul></div>`).join("")}</div>`;
}

const TABS = [["cal","Today & Week"],["phil","Philosophy"],["warm","Warm-up"],["drills","Drill Library"],["blocks","Block Starts"],["hurdles","Hurdles"],["jumps","Jumps"],["strength","Strength"],["groups","Groups"]];
views.sprints = function(){
  const body = SP.tab==="phil" ? philView() + (typeof spaHTML==="function" ? spaHTML() : "") : SP.tab==="warm" ? warmView() : SP.tab==="drills" ? drillsView() : SP.tab==="blocks" ? blocksView() : SP.tab==="hurdles" ? hurdleView() : SP.tab==="jumps" ? jumpsView() : SP.tab==="strength" ? strengthView() : SP.tab==="groups" ? groupsView() : calendarView();
  return `${back}<div class="stack"><div class="bar"><div><div class="eyebrow">Dec 1, 2026 – Feb 28, 2027 · ${CUR_LV==="JH" ? "Junior high (grades 6–8)" : "High school"} · every day of the week</div><h1>Sprints, Hurdles &amp; Jumps</h1>
      <p class="lede" style="margin:6px 0 0">${CUR_LV==="JH" ? "Learn to run fast and have fun doing it. Same fundamentals as high school, sized for junior high." : "Open this any day and know exactly what to do. Fast and fresh, full recovery, and home days that leave you fresher."}</p></div>
      <div class="seg" role="group" aria-label="Level">${[["JH","Junior High"],["HS","High School"]].map(([k,l])=>`<button type="button" aria-pressed="${CUR_LV===k}" onclick="SP.setLv('${k}')">${l}</button>`).join("")}</div></div>
    <div class="seg mdtabs" role="group" aria-label="Section">${TABS.map(([k,l])=>`<button type="button" aria-pressed="${SP.tab===k}" onclick="SP.tab='${k}';render()">${l}</button>`).join("")}</div>
    ${body}</div>`;
};
SP.week = d => { const L = locate(SP.sel||defaultSel()); const w = SP_WEEKS[Math.max(0,Math.min(SP_WEEKS.length-1,L.wi+d))]; SP.sel = w.start < PROGRAM_START ? PROGRAM_START : iso(addDays(w.start, DAYN.indexOf(L.dn))); if (SP.sel < PROGRAM_START) SP.sel = PROGRAM_START; render(); };
SP.tick = (k,v) => { store.set(k, v ? "1" : null); };
SP.done = (ds,v) => { store.set("sp-done-"+ds, v || null); render(); };
SP.setEnv = e => { SP.env = e; try { localStorage.setItem("sp-env", e); } catch(x){} render(); };
SP.setMe = id => { SP.me = id; try { localStorage.setItem("sp-me", id); } catch(x){} const a = meA(), g = a && groupOf(a); if (a && a.level!==CUR_LV) { SP.lv = a.level; useLv(a.level); } SP.g = g && g.p!=="MD" ? g.p : "All"; render(); };
SP.setLv = lv => { SP.lv = lv; useLv(lv); try { localStorage.setItem("sp-lv", lv); } catch(x){} const a = meA(); if (a && a.level!==lv) SP.me = ""; SP.g = "All"; SP.jl = "All"; SP.draft = null; render(); };

/* ---------- coach editor: Coaches → Sprints ---------- */
SP.editor = function(){
  if (!SP.draft) SP.draft = JSON.parse(JSON.stringify(SP.groups));
  const D = SP.draft;
  const list = hsAthletes().filter(a => SP.gshow==="all" ? (suggest(a) || D[a.id]) : SP.gshow==="unset" ? !D[a.id] && suggest(a) : true)
    .filter(a => !SP.gq || a.name.toLowerCase().includes(SP.gq.toLowerCase()))
    .sort((x,y)=>x.g.localeCompare(y.g) || x.name.localeCompare(y.name));
  const cur = a => D[a.id] || suggest(a) || {p:"", s:[]};
  return `<div class="seg" role="group" aria-label="Level">${[["JH","Junior High"],["HS","High School"]].map(([k,l])=>`<button type="button" aria-pressed="${CUR_LV===k}" onclick="SP.setLv('${k}')">${l}</button>`).join("")}</div>
    <p class="lede" style="margin:0">Give each ${CUR_LV==="JH" ? "junior high" : "high school"} sprinter, hurdler and jumper one <b>primary group</b>${CUR_LV==="JH" ? ", a <b>level</b> (1 Foundation, 2 Development, 3 Advanced: by readiness and technique, not grade or times)," : ""} and any <b>secondary events</b>. Suggestions come from last season's events: check them, change what's off, and save. Groups show publicly on the Sprints page (no notes here).</p>
    <div class="bar" style="justify-content:flex-start">${segBtns(SP.gshow,[["all","Sprint/hurdle/jump kids"],["unset","Not saved yet"],["every",CUR_LV==="JH"?"Every JH athlete":"Every HS athlete"]],"(v=>{SP.gshow=v;render()})")}
      <input id="sp-gsearch" class="search" type="search" placeholder="Search name" value="${esc(SP.gq)}" oninput="SP.gq=this.value;render();const e=document.getElementById('sp-gsearch');e.focus();e.setSelectionRange(e.value.length,e.value.length)"></div>
    <div class="tbl sp-ged"><table><thead><tr><th>Athlete</th><th>Primary</th>${CUR_LV==="JH"?"<th>Level</th>":""}<th>Secondary</th><th>S3 follows</th><th></th></tr></thead><tbody>
    ${list.map(a=>{ const c = cur(a), saved = !!D[a.id];
      return `<tr><td class="nm"><b>${esc(a.name)}</b><div class="muted" style="font-size:12px">${a.g==="B"?"Boys":"Girls"} · ${a.grade} · ${esc((a.cats||[]).join(", ")||"no events yet")}</div></td>
        <td><select aria-label="Primary group for ${esc(a.name)}" onchange="SP.setG('${a.id}','p',this.value)"><option value="">None</option>${[...GKEYS,"MD"].map(k=>`<option value="${k}" ${c.p===k?"selected":""}>${k==="MD"?"Dist/Mid program":k+" · "+GROUPS[k].n}</option>`).join("")}</select></td>
        ${CUR_LV==="JH" ? `<td><select aria-label="Level for ${esc(a.name)}" onchange="SP.setG('${a.id}','jl',this.value)">${[1,2,3].map(n=>`<option value="${n}" ${(c.jl||suggestJl(a))===n?"selected":""}>L${n} · ${["Foundation","Development","Advanced"][n-1]}</option>`).join("")}</select></td>` : ""}
        <td>${GKEYS.filter(k=>k!==c.p).map(k=>`<label class="ed-check" style="margin-right:6px"><input type="checkbox" ${(c.s||[]).includes(k)?"checked":""} onchange="SP.setG('${a.id}','s:${k}',this.checked)"> ${k}</label>`).join("")}</td>
        <td>${c.p==="S3"?`<select aria-label="S3 plan for ${esc(a.name)}" onchange="SP.setG('${a.id}','s3',this.value)"><option value="mid" ${(c.s3||"mid")==="mid"?"selected":""}>Mid-Distance plan</option><option value="sprint" ${c.s3==="sprint"?"selected":""}>Sprint plan</option></select>`:`<span class="muted">—</span>`}</td>
        <td>${saved?"":`<span class="sp-sug">suggested</span>`}</td></tr>`; }).join("")}
    </tbody></table></div>
    <div class="ed-save sticky"><button type="button" class="btn primary" onclick="SP.saveGroups(false)" ${saving?"disabled":""}>${saving?"Saving…":"Save groups"}</button>
      <button type="button" class="btn" onclick="SP.saveGroups(true)" ${saving?"disabled":""}>Accept all suggestions + save</button></div>
    <p class="ed-msg ${SP.msg.kind}" role="status" style="margin:0">${esc(SP.msg.text)}</p>`;
};
SP.setG = function(id, k, v){
  const a = ATHLETES.find(x=>x.id===id); const D = SP.draft;
  const t = Object.assign({}, D[id] || suggest(a) || {p:"", s:[]}); delete t.sug; t.s = [...(t.s||[])];
  if (k==="p") { t.p = v; t.s = t.s.filter(x=>x!==v); if (v!=="S3") delete t.s3; }
  else if (k==="s3") t.s3 = v;
  else if (k==="jl") t.jl = +v;
  else if (k.startsWith("s:")) { const g = k.slice(2); t.s = v ? [...new Set([...t.s, g])] : t.s.filter(x=>x!==g); }
  if (!t.p && !t.s.length && !t.jl) delete D[id]; else D[id] = t;
  SP.msg = {kind:"",text:""}; render();
};
SP.saveGroups = async function(acceptAll){
  const next = JSON.parse(JSON.stringify(SP.draft || SP.groups));
  if (acceptAll) hsAthletes().forEach(a => { if (!next[a.id]) { const s = suggest(a); if (s) next[a.id] = Object.assign({p:s.p, s:s.s}, s.jl ? {jl:s.jl} : {}); } });
  const err = await publishFiles({"sgroups.json": JSON.stringify(next)});
  if (err) SP.msg = {kind:"err", text:err};
  else { SP.groups = next; SP.draft = JSON.parse(JSON.stringify(next)); SP.msg = {kind:"ok", text:`Saved ${Object.keys(next).length} athletes' groups.`}; }
  render();
};

/* ---------- coach day changes: Coaches → Sprints → Day changes (hub_data key "sprint_edits": {"YYYY-MM-DD": {k, tpl, meet, from, note}}) ---------- */
const OV_K = [["","Use the plan"],["indoor","Weather: move indoors"],["home","School closed / cancelled → home session"],["meet","Meet day"],["rest","Rest day"],["move","Do another day's session"]];
SP.dayEditor = function(){
  if (!SP.edraft) SP.edraft = JSON.parse(JSON.stringify(SP.edits));
  if (SP.ewi===null) SP.ewi = locate(defaultSel()).wi;
  const w = SP_WEEKS[SP.ewi], E = SP.edraft;
  const allDates = SP_WEEKS.flatMap(x => DAYN.map(dn => ({x, dn, ds: dateIso(x, dn)}))).filter(o => o.ds >= PROGRAM_START);
  const rowsH = DAYN.map(dn => {
    const ds = dateIso(w, dn); if (ds < PROGRAM_START) return "";
    const ov = E[ds] || {}, plan = (() => { const b = baseDay(w, dn); return b.k==="none" ? "—" : (LABELS[b.k]||LABELS.rec)[0] + ": " + (b.k==="gsc" ? b.title : b.k==="speed"||b.k==="power" ? w.focus : b.tpl ? IND[b.tpl].n : "Rest"); })();
    return `<tr><td><b>${dn} ${fmt(parseD(ds))}</b><div class="muted" style="font-size:12px">${esc(plan)}</div></td>
      <td><select aria-label="Change for ${dn}" onchange="SP.setOv('${ds}','k',this.value)">${OV_K.map(([k,l])=>`<option value="${k}" ${(ov.k||"")===k?"selected":""}>${l}</option>`).join("")}</select>
        ${ov.k==="home" ? `<select aria-label="Home session" onchange="SP.setOv('${ds}','tpl',this.value)">${Object.keys(IND).map(k=>`<option value="${k}" ${(ov.tpl||"TA")===k?"selected":""}>${esc(IND[k].n)}</option>`).join("")}</select>` : ""}
        ${ov.k==="meet" ? `<input type="text" placeholder="Meet name" value="${esc(ov.meet||"")}" onchange="SP.setOv('${ds}','meet',this.value.trim())">` : ""}
        ${ov.k==="move" ? `<select aria-label="Which day's session" onchange="SP.setOv('${ds}','from',this.value)"><option value="">Pick a day…</option>${allDates.filter(o=>o.ds!==ds && ds >= SPORT_START && ["speed","power"].includes(baseDay(o.x,o.dn).k)).map(o=>`<option value="${o.ds}" ${ov.from===o.ds?"selected":""}>Wk ${o.x.n} ${o.dn} ${fmt(parseD(o.ds))}: ${esc(o.x.focus)}</option>`).join("")}</select>` : ""}</td>
      <td><input type="text" style="width:100%;min-width:160px" placeholder="Note shown to athletes (optional)" value="${esc(ov.note||"")}" onchange="SP.setOv('${ds}','note',this.value.trim())"></td></tr>`; }).join("");
  const n = Object.keys(E).length;
  return `<p class="lede" style="margin:0">Change any day for weather, school closures, meets, or how the team is feeling. The plan itself never changes; your change shows on the Sprints page and the Workouts page for that date.</p>
    <div class="weekpick" style="justify-content:flex-start"><button type="button" aria-label="Previous week" ${SP.ewi===0?"disabled":""} onclick="SP.ewi--;render()">‹</button>
      <b>Week ${w.n} · ${fmt(parseD(w.start < PROGRAM_START ? PROGRAM_START : w.start))}–${fmt(addDays(w.start,6))} · ${esc(w.focus)}</b>
      <button type="button" aria-label="Next week" ${SP.ewi===SP_WEEKS.length-1?"disabled":""} onclick="SP.ewi++;render()">›</button></div>
    <div class="tbl sp-ed"><table><thead><tr><th>Day · plan</th><th>Change</th><th>Note</th></tr></thead><tbody>${rowsH}</tbody></table></div>
    <div class="ed-save" style="flex-wrap:wrap;gap:6px">
      <button type="button" class="btn" onclick="SP.weekOv('closed')">Whole week: school closed (Tue/Thu → home)</button>
      <button type="button" class="btn" onclick="SP.weekOv('indoor')">Whole week: indoors</button>
      <button type="button" class="btn" onclick="SP.weekOv('clear')">Clear this week's changes</button></div>
    <div class="ed-save"><button type="button" class="btn primary" onclick="SP.saveEdits()" ${saving?"disabled":""}>${saving?"Saving…":"Save changes"}</button><span class="note">${n} day${n===1?"":"s"} changed across the season.</span></div>
    <p class="ed-msg ${SP.emsg.kind}" role="status" style="margin:0">${esc(SP.emsg.text)}</p>`;
};
SP.setOv = function(ds, k, v){
  const E = SP.edraft, o = Object.assign({}, E[ds]);
  if (v) o[k] = v; else delete o[k];
  if (k==="k" && v!=="home") delete o.tpl; if (k==="k" && v!=="meet") delete o.meet; if (k==="k" && v!=="move") delete o.from;
  if (k==="k" && v==="home" && !o.tpl) o.tpl = "TA";
  if (!o.k && !o.note) delete E[ds]; else E[ds] = o;
  SP.emsg = {kind:"",text:""}; render();
};
SP.weekOv = function(kind){
  const w = SP_WEEKS[SP.ewi];
  DAYN.forEach(dn => { const ds = dateIso(w, dn); if (ds < PROGRAM_START) return; const b = baseDay(w, dn);
    if (kind==="clear") delete SP.edraft[ds];
    else if (b.k==="speed" || b.k==="power" || (b.k==="gsc" && kind==="closed")) SP.edraft[ds] = Object.assign({}, SP.edraft[ds], kind==="closed" ? {k:"home", tpl: dn==="Tue" ? "TA" : "GFB"} : {k:"indoor"}); });
  SP.emsg = {kind:"",text:"Changed. Hit Save to publish."}; render();
};
SP.saveEdits = async function(){
  const next = JSON.parse(JSON.stringify(SP.edraft || {}));
  Object.keys(next).forEach(ds => { const o = next[ds]; if (o.k==="move" && !o.from) delete o.k; if (!o.k && !o.note) delete next[ds]; });
  const err = await publishFiles({"sprint_edits.json": JSON.stringify(next)});
  if (err) SP.emsg = {kind:"err", text:err};
  else { SP.edits = next; SP.edraft = JSON.parse(JSON.stringify(next)); SP.emsg = {kind:"ok", text:"Saved. Athletes see the change now."}; }
  render();
};
SP.coachTab = function(){
  return `<div class="seg" role="group" aria-label="Sprint tools">${[["groups","Groups"],["days","Day changes"]].map(([k,l])=>`<button type="button" aria-pressed="${SP.etab===k}" onclick="SP.etab='${k}';render()">${l}</button>`).join("")}</div>
    ${SP.etab==="days" ? SP.dayEditor() : SP.editor()}`;
};

/* ---------- Workouts page: every sprint day shows under Sprints / Hurdles / Long Jump / High Jump / Pole Vault (display only, never saved into the posted weeks) ---------- */
const jlTag = r => r.jl ? ` [${r.jl.length===1 ? "Level "+r.jl[0]+" only" : "Level "+r.jl[0]+"+"}]` : "";
const liftLine = r => { const L = typeof LIFTS!=="undefined" && LIFTS[r.lift]; return L ? `${r.x || L.name}${r.p?" ("+r.p+")":""}: ${(L.rows||L.ex||[]).map(e=>Array.isArray(e)?e.slice(0,2).join(" "):e).join(", ")}` : (r.x || r.lift); };
const plain = r => r.wu ? `Standard ${CUR_LV==="JH"?"junior high":"sprint"} warm-up: ${WU_TIME[CUR_LV]}` : r.lift ? liftLine(r) : r.str ? `Weight room (${STR[r.str].n}, 30–35 min${r.mod?"; "+STR_MOD[r.mod].replace(/\.$/,"").replace(/:/g," ·"):""}): ${STR[r.str].ex.map(e=>e[0]+" "+e[1]).join(", ")}` : `${r.x}${r.p?": "+r.p:""}${r.r?" · rest "+r.r:""}${r.i&&INT[r.i]?" · "+INT[r.i][0]:""}${r.g?" ("+r.g.join("/")+")":""}${jlTag(r)}`;
const SG = ["Sprints","Hurdles","Long Jump","High Jump","Pole Vault"];
function printLine(r){
  if (r.wu) return CUR_LV==="JH" ? "Junior high warm-up (8–12 min): easy movement → dynamic mobility → A-march / skips / ankling → build-ups → coordination game" : "Standard sprint warm-up (12–15 min): easy movement → dynamic mobility → A-skips / ankling / dribbles → build-ups → event prep";
  if (r.lift) return liftLine(r) + ". Technique first, never to failure.";
  if (r.str) { const s = STR[r.str]; return `Weight room · ${s.n} (30–35 min): ${s.ex.map(e=>e[0]+" "+e[1]).join(" · ")}. Rest 60–90 s on the first two lifts, 30–45 s on the rest. ${r.mod?STR_MOD[r.mod]+" ":""}${s.note}`; }
  let p = r.p || "", m, q;
  if ((m = r.x.match(/flying (\d+)m/i)) && (q = p.match(/^(\d+(?:–\d+)?)\s*(?:reps?)?(.*)$/))) p = `${q[1]}×flying ${m[1]}m${q[2]}`;
  else if ((m = r.x.match(/^Timed (\d+)m starts/i)) && (q = p.match(/^(\d+(?:–\d+)?)\s*(?:attempts?)?(.*)$/))) p = `${q[1]}×${m[1]}m${q[2]}`;
  return `${r.x}${p?": "+p:""}${r.r?" · rest "+r.r:""}${r.i&&INT[r.i]?" · "+INT[r.i][0]:""}${r.g?" ("+r.g.join("/")+" only)":""}${r.cut?" · H/J may skip":""}${jlTag(r)}${r.n?" · "+r.n:""}`;
}
// Packets/sheets: true when a sprint day is not a practice (home day, rest, meet) so no group sheet prints for it
SP.printSkip = function(start, dn, lv){ return withLv(lv==="JH" ? "JH" : "HS", () => { const wi = SP_WEEKS.findIndex(x=>x.start===start); if (wi<0) return false; const i = dayInfo(wi, dn); return !!i && !isCoachLed(i); }); };
const tplLines = T => [
  ...(T.pre ? ["Warm-up: " + T.pre] : []),
  ...(T.choose ? ["Choose ONE: " + T.choose.map(([n,p])=>`${n} (${p})`).join(" · ")] : []),
  ...(T.opt ? [T.opt] : []),
  ...(T.steps ? (T.rounds ? [`${T.rounds} rounds:`] : []).concat(T.steps.map(([n,p,c])=>`${n}: ${p}${c?" · "+c:""}`)) : []),
  ...(T.rest ? [T.rest] : []), ...(T.end ? [T.end] : [])];
/* ---------- Simple lines (Workouts page, athlete week, calendar): warm-up / reps / "View lifts" / cool-down, nothing else ---------- */
const SWN = k => ({dec:"Dec", jan:"Jan", feb:"Feb", spring:"Spring"})[k] || k;
const GTAG = {S1:"S1", S2:"S2", S3:"S3", H:"Hurdles", J:"Jumps"};
const sTag = r => { const g = (r.g||[]).filter(x=>GTAG[x]).map(x=>`[${GTAG[x]}]`); const l = r.jl ? [`[Level ${r.jl.length===1 ? r.jl[0] : r.jl[0]+"+"}]`] : []; return g.concat(l).join(" ") + (g.length||l.length ? " " : ""); };
function simpleRow(r){
  if (r.wu) return "Warm-up: sprint warm-up";
  if (r.lift) { const L = typeof LIFTS!=="undefined" && LIFTS[r.lift]; return L ? L.name.split(" · ")[0] : r.x || r.lift; }
  if (r.str) return `Sprint Weight Room (${SWN(r.str)})`;
  let p = r.p || "", m, q;
  if ((m = r.x.match(/flying (\d+)m/i)) && (q = p.match(/^(\d+(?:–\d+)?)\s*(?:reps?)?(.*)$/))) return `${sTag(r)}${q[1]} × flying ${m[1]}m${q[2]}${r.r?" · rest "+r.r:""}`;
  return `${sTag(r)}${r.x}${p?": "+p:""}${r.r && !/walk back$/.test(r.r) ? " · rest "+r.r : r.r ? " · "+r.r : ""}`;
}
function simpleItems(i, LV, d){
  const JHL = LV==="JH", it = t => ({t, lv:LV}), out = [];
  const s3 = () => { if (!JHL) out.push(it("[S3] Do today's Mid-Distance workout instead.")); };
  if (i.cnote) out.push(it("Coaching: " + i.cnote));
  if (isGsc(i)) {
    i.blocks.forEach(([k,x,p]) => out.push(it(k==="warm" ? "Warm-up: " + x : k==="cool" ? "Cool-down: " + x : k==="str" ? (LIFTS && LIFTS[i.lift] ? LIFTS[i.lift].name.split(" · ")[0] : x) : `${x.replace(/\s*\([^)]*\)\s*$/,"")} · ${p}`)));
    s3();
  } else if (isCoach(i)) {
    const env = i.forceIn ? "in" : SP.env, rows = env==="in" ? (i.sess.in||i.sess.out) : i.sess.out;
    if (i.forceIn) out.push(it("Indoors today (hallway/gym)"));
    rows.filter(r=>!r.tech).forEach(r => out.push(it(simpleRow(r))));
    if (!rows.some(r=>r.wu)) out.unshift(it("Warm-up: sprint warm-up"));
    out.push(it("Cool-down: easy walk + mobility"));
    s3();
    if (rows.some(r=>r.tech)) {
      const m = i.w.mo, add = (g, arr) => { d.groups[g] = (d.groups[g]||[]).concat(arr.slice(0,2).map(t=>({t, lv:LV}))); };
      add("Sprints", (SPRINT_TECH[m]||[]).filter(x=>x[0]).map(x=>"Technique: " + x[0]));
      add("Hurdles", (HURDLE_TECH[m]||[]).map(x=>"Technique: " + x[0]));
      add("Long Jump", (JUMPS["Long Jump"].mo[m]||[]).map(x=>"Technique: " + String(x).split(/[.:(]/)[0]));
      add("High Jump", (JUMPS["High Jump"].mo[m]||[]).map(x=>"Technique: " + String(x).split(/[.:(]/)[0]));
      if (JUMPS["Pole Vault"]) add("Pole Vault", (JUMPS["Pole Vault"].mo[m]||[]).map(x=>"Technique (with a coach): " + String(x).split(/[.:(]/)[0]));
    }
  } else if (isInd(i)) {
    const T = IND[i.tpl];
    const nm = s => String(s).replace(/\s*\([^)]*\)/g,"").replace(/:.*$/,"").trim();
    if (T.choose) out.push(it(`At home, pick one (${T.dur}): ` + T.choose.map(([n])=>nm(n).replace(/^\w/,c=>c.toLowerCase())).join(" / ")));
    if (T.steps) out.push(it(`At home (${T.dur}): ` + T.steps.slice(0,5).map(([n,p],k)=>k===0 ? `${nm(n).toLowerCase()} ${p}` : nm(n).toLowerCase()).join(", ") + (T.steps.length>5 ? ", + more" : "")));
    s3();
  } else if (i.k==="meet") out.push(it("Meet day."));
  else out.push(it("Rest."));
  return out;
}
SP.weeksWith = function(list){
  const have = new Set((list||[]).map(w=>w.start));
  const extra = [...new Set([...SP_WEEKS_HS, ...SP_WEEKS_JH].map(w=>w.start))].filter(s => !have.has(s)).map(start=>({start})).map(w => ({start:w.start, days:[], spOnly:true}));
  return extra.length ? (list||[]).concat(extra).sort((a,b)=>a.start.localeCompare(b.start)) : list;
};
SP.inject = function(w, opt){
  const P = !!(opt && opt.print);
  if (!w || !w.start) return w;
  const copy = Object.assign({}, w, {days:(w.days||[]).map(d=>Object.assign({}, d, {groups:Object.assign({}, d.groups||{}), combos:[...(d.combos||[])], gfocus:Object.assign({}, d.gfocus||{})}))});
  ["HS","JH"].forEach(LV => withLv(LV, () => {
  const wi = SP_WEEKS.findIndex(x => x.start===w.start); if (wi<0) return;
  const SG = SG_LV, JHL = LV==="JH";
  DAYN.forEach(dn => {
    const i = dayInfo(wi, dn); if (!i) return;
    let d = copy.days.find(x=>x.day===dn);
    if (!d) { d = {day:dn, focus:"", all:[], groups:{}, combos:[], gfocus:{}}; copy.days.push(d); }
    const L = lab(i), F = dayFacts(i);
    const head = P ? {t: i.k==="rest" ? "Rest" : isCoachLed(i) ? `${L[0]} · ${dayTitle(i)} · ${F.dur}` : `${L[0]} (optional, at home) · ${dayTitle(i)} · ${F.dur} · RPE ${F.rpe}. Full steps on the hub.`, lv:LV} : i.k==="rest" ? {t:"Rest · Full rest", lv:LV} : {t:`${L[0]} · ${dayTitle(i)} · ${F.dur}${isCoachLed(i) ? "" : " · RPE " + F.rpe} → full details, checklist and your group on the Sprints, Hurdles & Jumps page`, link:"#sprints", lv:LV};
    let items = [head];
    if (!P) {
      items = simpleItems(i, LV, d);
      const ex0 = d.combos.find(c => c.sp);
      if (ex0) { ex0.items = ex0.items.concat(items); ex0.groups = [...new Set(ex0.groups.concat(SG))]; }
      else d.combos.push({groups:[...SG], name:"Sprints · Hurdles · Jumps", items, sp:true});
      const ttl = i.k==="rest" ? "Rest" : isInd(i) ? "Optional · " + IND[i.tpl].n.replace(/^(Optional\s*·?\s*|(Recovery|General Fitness)( [A-Z])?\s*·\s*)/i,"").replace(/^\w/,c=>c.toUpperCase()) : dayTitle(i).replace(/^General (Movement \+ )?Strength (A\d)\b.*$/, (m0,a,b)=>"Strength " + b);
      SG.forEach(g => { const gk = (JHL ? "JH " : "") + g; if (!d.gfocus[gk]) d.gfocus[gk] = ttl; });
      if (d.focus && typeof d.focus==="object") { if (!d.focus[LV]) d.focus = Object.assign({}, d.focus, {[LV]: dayTitle(i)}); }
      else if (!d.focus) d.focus = {HS: "", JH: "", [LV]: dayTitle(i)};
      return;
    }
    if (i.cnote) items.push({t:"Coach note: " + i.cnote, lv:LV});
    if (isGsc(i)) {
      items.push({t:JHL ? "General movement & strength only: technique and confidence, no sprint, hurdle or jump instruction yet. Voluntary days are optional with no reporting." : "General strength & conditioning only. Sprint-specific training starts Tue Dec 8.", lv:LV});
      i.blocks.forEach(([k,x,p,n]) => items.push({t: k==="warm" ? `Warm-up (${p}): ${n}` : k==="cool" ? `Cool-down (${p}): ${n}` : k==="str" ? `${x} (${p})` : `${x} (${p}): ${n}`, lv:LV}));
      if (!JHL) items.push({t:"400/800 hybrids (S3): follow the Mid Distance plan today.", lv:LV});
    } else if (isCoach(i)) {
      const env = i.forceIn ? "in" : SP.env, rows = env==="in" ? (i.sess.in||i.sess.out) : i.sess.out;
      items.push({t:(env==="in" ? "Indoor plan (hallway/gym)" : "Outdoor plan (track)") + (i.forceIn ? ": moved indoors today" : ""), lv:LV});
      items = items.concat(rows.filter(r=>!r.tech).filter(r=>!JHL || !SP.jl || SP.jl==="All" || P || levelOK(r)).map(r => ({t: P ? printLine(r) : plain(r), lv:LV})));
      if (P) {
        const other = env==="in" ? i.sess.out : i.sess.in;
        if (other && !i.forceIn) items.push({t:"Indoor version (hallway/gym): " + other.filter(r=>!r.wu && !r.tech && !r.str && !r.lift).map(r=>`${r.x} ${r.p||""}`.trim() + jlTag(r)).join("; ") + ". " + (JHL ? "Junior high indoor accelerations 5–15m" : "Indoor accelerations 10–20m") + " only with traction, a clear lane and stopping room.", lv:LV});
        if (rows.some(r=>r.tech)) items.push({t:"Event technique (15–20 min): see each group's technique lines.", lv:LV});
        items.push({t: JHL ? "Coaching: full recovery between reps, keep it fun and fast. Level 1 does the base plan; rows tagged Level 2+/3 are for those athletes only. Cut volume for anyone tired, new or returning from injury." : "Coaching: full recovery between max reps (2–3 min short accelerations, 4–6 min flying). Reduce volume for beginners and anyone returning from injury.", lv:LV});
      }
      if (!JHL) items.push({t:"400/800 hybrids (S3): follow the Mid Distance workout today unless your coach assigned this session.", lv:LV});
      if (rows.some(r=>r.tech)) {
        const m = i.w.mo, add = (g, arr) => { d.groups[g] = (d.groups[g]||[]).concat(arr.map(t=>({t, lv:LV}))); };
        add("Sprints", (SPRINT_TECH[m]||[]).filter(x=>x[0]).map(x=>"Technique: " + x[0] + (x[1]?" · "+x[1]:"")));
        add("Hurdles", (HURDLE_TECH[m]||[]).map(x=>"Technique: " + x[0] + " · " + x[1]));
        add("Long Jump", (JUMPS["Long Jump"].mo[m]||[]).map(x=>(JHL ? "Starter progression: " : "Technique: ") + x));
        add("High Jump", (JUMPS["High Jump"].mo[m]||[]).map(x=>(JHL ? "Starter progression: " : "Technique: ") + x));
        if (JUMPS["Pole Vault"]) add("Pole Vault", (JUMPS["Pole Vault"].mo[m]||[]).map(x=>"Technique (qualified supervision): " + x));
      }
    } else if (isInd(i) && P) {
      if (!JHL) items.push({t:"400/800 hybrids (S3): Mid Distance workout instead.", lv:LV});
    } else if (isInd(i)) {
      const T = IND[i.tpl];
      items.push({t:`Goal: ${F.obj} · Equipment: ${F.equip}`, lv:LV});
      items = items.concat(tplLines(T).map(t=>({t, lv:LV})));
      if (i.extra) items.push({t:i.extra, lv:LV});
      if (i.avoid) items.push({t:i.avoid, lv:LV});
      if ((i.alts||[]).length) items.push({t:"Alternatives: " + i.alts.map(k=>k==="rest"?"complete rest":IND[k].n).join(" · ") + (i.altNote?". "+i.altNote:""), lv:LV});
      if (!JHL) items.push({t:"400/800 hybrids (S3): do today's Mid Distance workout instead of this.", lv:LV});
      items.push({t:"Voluntary. Stop if anything hurts and tell your coach or athletic trainer.", lv:LV});
      const add = (g, k) => { d.groups[g] = (d.groups[g]||[]).concat([{t: IND_MODS[k], lv:LV}]); };
      add("Sprints","S1"); add("Sprints","S2"); add("Hurdles","H"); SG.filter(g=>g!=="Sprints"&&g!=="Hurdles").forEach(g=>add(g,"J"));
    } else if (i.k==="meet") items.push({t:"Meet day: follow your coach's meet-day plan. No extra workout.", lv:LV});
    else if (P) items = [{t:"Rest: no assigned workout. Optional comfortable walk." + (i.note?" " + i.note:""), lv:LV}];
    else items.push({t:"No assigned workout. Optional comfortable walk or normal daily activity." + (i.note?" " + i.note:""), lv:LV});
    // one shared block per day so JH and HS sit side by side
    const ex = d.combos.find(c => c.sp);
    if (ex) { ex.items = ex.items.concat(items); ex.groups = [...new Set(ex.groups.concat(SG))]; }
    else d.combos.push({groups:[...SG], name:"Sprints · Hurdles · Jumps", items, sp:true});
    SG.forEach(g => { const gk = (JHL ? "JH " : "") + g; if (!d.gfocus[gk]) d.gfocus[gk] = P ? `${L[0]}: ${dayTitle(i)}` : L[0]; });
    if (d.focus && typeof d.focus==="object") { if (!d.focus[LV]) d.focus = Object.assign({}, d.focus, {[LV]: dayTitle(i)}); }
    else if (!d.focus) d.focus = {HS: "", JH: "", [LV]: dayTitle(i)};
  });
  }));
  copy.days.sort((a,b)=>DAYN.indexOf(a.day)-DAYN.indexOf(b.day));
  return copy;
};

/* ---------- data + registration ---------- */
SP.onData = function(byKey){
  if (byKey && byKey.sgroups && typeof byKey.sgroups === "object") { SP.groups = byKey.sgroups; SP.draft = null; }
  if (byKey && byKey.sprint_edits && typeof byKey.sprint_edits === "object") { SP.edits = byKey.sprint_edits; SP.edraft = null; }
  SP.rev = true;   // February revision approved Nov 9, 2026
};
if (window.HUB_BYKEY) SP.onData(window.HUB_BYKEY);
if (!SECTIONS.some(s=>s.id==="sprints")) {
  const i = SECTIONS.findIndex(s=>s.id==="middistance");
  SECTIONS.splice(i+1, 0, {id:"sprints", g:"train", cnav:true, name:"Sprints, Hurdles & Jumps", blurb:"Sprint, hurdle and jump program: winter calendar (indoor/outdoor), drills, block starts, strength"});
}
if (typeof LIFTS!=="undefined") Object.keys(STR).forEach(k => { LIFTS["SW"+k] = {name:"Sprint Weight Room (" + SWN(k) + ")", when:STR[k].n, spr:1, gen:1, rest:"60–90 s", note:STR[k].note, ex:STR[k].ex.map(e=>[e[0], e[1]])}; });
SP.phil = lv => withLv(lv==="JH" ? "JH" : "HS", () => philView().split('<div class="panel sp-stage">')[0].split('<div class="panel"><h2>Training groups')[0].split('<div class="cols"><div class="panel"><h2>The week')[0]);
SP.withLv = withLv; SP.dayInfo = dayInfo; SP.dayTitle = dayTitle; SP.dayFacts = dayFacts; SP.weeksOf = lv => withLv(lv, () => SP_WEEKS);
SP.weeks = SP_WEEKS; SP.drills = DRILLS; SP.suggest = suggest; SP.groupOf = groupOf;
render();
})();
