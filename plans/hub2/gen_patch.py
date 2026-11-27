# Track Hub 2.0: HS Distance / Mid patch builder.
# Output: patch.json = {"set":[{date,g,items,gf?,f?}], "ops":[{date,g,op,match,new?}], "rx":[...regex replacements by date range]}
import json
D, M = "Distance", "Mid Distance"
SET, OPS = [], []

def S(date, g, items, gf=None, f=None):
    SET.append({"date": date, "g": g, "items": items, **({"gf": gf} if gf else {}), **({"f": f} if f else {})})

def op(date, g, kind, match, new=None):
    OPS.append({"date": date, "g": g, "op": kind, "match": match, **({"new": new} if new is not None else {})})

def easy(a, b, c, what="Easy", extra=""):
    return [f"[A] {a} min {what}{extra}", f"[B] {b} min {what}{extra}", f"[C] {c} min {what}{extra}"]

def rec(a, b, c):
    return [f"[A] {a} min recovery run, slow end of Easy", f"[B] {b} min recovery run, slow end of Easy", f"[C] {c} min recovery run, slow end of Easy"]

def longrun(da, db, dc, ha, hb, hc, note=""):
    return [f"[A] [Distance] {da} min long run, Easy pace{note}", f"[B] [Distance] {db} min long run, Easy pace{note}", f"[C] [Distance] {dc} min long run, Easy pace{note}",
            f"[A] [Hybrid] {ha} min long run, Easy pace{note}", f"[B] [Hybrid] {hb} min long run, Easy pace{note}", f"[C] [Hybrid] {hc} min long run, Easy pace{note}"]

MID_SAT_OPT = ["[A] 800 runners (aerobic-oriented): optional 30–40 min Easy", "[B] 800 runners (aerobic-oriented): optional 25–35 min Easy",
               "[C] 800 runners (aerobic-oriented): optional 20–25 min Easy", "400-focused runners: rest"]
WU = "Warm-up and cool-down: 10–15 min Easy each."
MWU = "Warm-up: 10 min Easy + dynamic drills. Cool-down: 5–10 min Easy."
STR = "Strength M · Maintenance (in season: one main session a week, 2+ reps in reserve)"
NOTRACE = lambda a, b, c: [f"[A] Not racing: {a} min Easy + 4 × 100m relaxed strides", f"[B] Not racing: {b} min Easy + 4 × 100m relaxed strides", f"[C] Not racing: {c} min Easy + 4 × 100m relaxed strides"]
MID_NOTRACE = "Not racing: B1 Easy run: 15–25 min Easy + 4 × 80m relaxed strides"

# ---------------- Winter (Dec 1 – Feb 12): fixes, speed progression, elastic progression ----------------
op("2026-12-01", D, "remove", "5 miles easy")
AD = {  # date: (athletic development line, speed line, mid add-on line or None)
 "2026-12-03": ("Athletic development (elastic foundations): Jump-and-stick 2 × 4, Single-leg balance 2 × 20 sec/leg, Lateral band walks 2 × 10 steps each way",
                "Strides (only if approved as limited contact; otherwise skip): 4 × 60m relaxed progressive strides, walk back", None),
 "2026-12-10": ("Athletic development (elastic foundations): Bilateral pogos 2 × 10 contacts, Skipping 2 × 20m, Medicine-ball chest pass 3 × 4, Side plank 2 × 20 sec/side",
                "Strides (only if approved as limited contact; otherwise skip): 4 × 60m relaxed progressive strides, walk back",
                "Mid-distance: if fresh, add 1 set to the medicine-ball chest pass or the pogos (power focus)."),
 "2026-12-17": ("Athletic development (elastic foundations): Line hops 2 × 10 contacts, Bilateral pogos 2 × 10 contacts, Single-leg balance reach 2 × 5/leg, Medicine-ball throws 3 × 4",
                "Strides (only if approved as limited contact; otherwise skip): 4 × 60m relaxed progressive strides, walk back",
                "Mid-distance: if fresh, add 1 set to the medicine-ball throws or the pogos (power focus)."),
 "2027-01-07": ("Athletic development (single-leg elasticity): Single-leg pogos 2 × 8/leg, Low lateral hops 2 × 6/side, Medicine-ball throws 3 × 4, Lateral band walks 2 × 10 steps each way",
                "Strides (only if approved as limited contact; otherwise skip): 4–6 × 60–80m progressive strides, walk back (A: 6, B: 5, C: 4)",
                "Mid-distance: if fresh, add 1 set to the medicine-ball throws or the single-leg pogos (power focus)."),
 "2027-01-14": ("Athletic development (single-leg elasticity): Single-leg landing 2 × 4/leg, Low box jumps 2 × 3 (prepared athletes only), Medicine-ball throws 3 × 4, Single-leg balance reach 2 × 5/leg",
                "Strides (only if approved as limited contact; otherwise skip): 4–6 × 60–80m progressive strides, walk back (A: 6, B: 5, C: 4)",
                "Mid-distance: if fresh, add 1 set to the medicine-ball throws or the box jumps (power focus)."),
 "2027-01-21": (None, "Strides (only if approved as limited contact; otherwise skip): 3 × 60m relaxed strides (recovery week, reduced)", None),
 "2027-01-28": ("Athletic development (single-leg elasticity): Lateral bounds 2 × 4/side (stick each landing), Single-leg pogos 2 × 10/leg, Medicine-ball throws 3 × 4, Low box jumps 2 × 3 (prepared athletes only)",
                "Accelerations (only if approved as limited contact; otherwise skip): 4 × 8–10 sec flat accelerations, walk back, full recovery",
                "Mid-distance: if fresh, add 1 set to the medicine-ball throws or the bounds (power focus)."),
 "2027-02-04": ("Athletic development (reactive strength): Low hurdle hops 2 × 5, Bilateral pogos 2 × 10 contacts, Medicine-ball throws 3 × 4, Hip-stability circuit: band walks, clamshells, single-leg bridge, 1 round each",
                "Accelerations (only if approved as limited contact; otherwise skip): 3 × 30m accelerations + 2 × flying 10–20m, full recovery. Relaxed, not maximal.",
                "Mid-distance: if fresh, add 1 set to the medicine-ball throws or the hurdle hops (power focus)."),
 "2027-02-11": (None, "Accelerations (only if approved as limited contact; otherwise skip): 2 × 30m accelerations + 2 × flying 10–20m, full recovery (light week)", None),
}
for date, (adl, spd, midl) in AD.items():
    for g in (D, M):
        if adl: op(date, g, "replace", "Athletic development", adl)
        op(date, g, "insertAfter", "Drills", spd)
        if midl and g == M: op(date, g, "replace", "Mid-distance: if fresh", midl)

# ---------------- Official season ----------------
# Week 12 · Feb 15
S("2027-02-16", D, ["Warm-up: 10–15 min Easy + drills.", "BC Cruise Intervals: Tempo (threshold) reps with short easy-jog breaks. Controlled: finish able to do one more.",
    "[A] 3 × 5 min Tempo, 90 sec jog between", "[B] 3 × 4 min Tempo, 90 sec jog between", "[C] 2 × 4 min Tempo, 90 sec jog between",
    "Cool-down: 10–15 min Easy.", "Optional: short Strength M · Maintenance if there's time and runners feel good."], f="Threshold · BC Cruise Intervals")
S("2027-02-16", M, ["Warm-up: 10–15 min Easy + drills.", "BC Cruise Intervals (mid-distance dose): controlled, never a race.",
    "800 runners: 2 × 4 min Tempo, 90 sec jog between", "400-focused runners: 2 × 3 min Tempo, 90 sec jog between",
    "Cool-down: 10 min Easy.", "Optional: short Strength M · Maintenance if there's time and runners feel good."], gf="Threshold")
S("2027-02-18", D, ["Warm-up: 15 min Easy + drills.", "BC Track Accelerations: progressive accelerations on the track (near-max by 30m), walk back + 60–90 sec (full recovery)",
    "[A] 6 × 40m", "[B] 5 × 40m", "[C] 4 × 40m", "2 × 150m at Rep pace (fast and relaxed), 3–4 min recovery",
    "[Crossover] [Hybrid] Optional instead of the 150s: 3 × 300m at 800 pace, 4–5 min recovery (first 800-specific Thursday)",
    "Run tall, quick arms, relaxed face. Speed, not strain. Stop if your mechanics fall apart.", "Cool-down: 10 min Easy."], f="Acceleration · BC Track Accelerations")

# Week 13 · Feb 22 (no meets)
S("2027-02-22", D, ["Before the run (fresh legs): Low hurdle hops 2 × 5, Bilateral pogos 2 × 10 contacts"] + easy("40–45", "30–35", "20–25", extra=" + 4 × 100m relaxed strides") + [STR], f="Easy + strength")
S("2027-02-22", M, [MWU, "BC Flyers, scaled to experience (full recovery, 3–5 min):",
    "New to sprinting: 2 × 30m accelerations + 2 × flying 10–20m", "800 runners: 3 × 30m accelerations + 3 × flying 20m",
    "400-focused runners (experienced): 4 × 30m accelerations + 4 × flying 20–30m, coach-timed",
    "E1 Strength: split squat 2×6/leg, Romanian deadlift 2×6, bent-knee calf raise 2×12, dead bug 2×8/side, push-up 2×8"], gf="Max velocity · BC Flyers")
S("2027-02-24", D, rec("30–35", "25–30", "20–25"), f="Recovery")
S("2027-02-25", D, [WU, "[Distance] BC Continuous Tempo: one steady Tempo run, even effort.", "[A] [Distance] 18 min Tempo", "[B] [Distance] 14 min Tempo", "[C] [Distance] 10 min Tempo",
    "[Hybrid] Thursday is your 800 day: 800 rhythm at current 800 pace, 90 sec–2 min recovery", "[A] [Hybrid] 6 × 200m at 800 pace", "[B] [Hybrid] 5 × 200m at 800 pace", "[C] [Hybrid] 4 × 200m at 800 pace",
    "Controlled and repeatable. Don't race teammates."], f="Threshold · BC Continuous Tempo")
S("2027-02-26", D, easy("30–35", "25–30", "20–25"), f="Easy")
S("2027-02-27", D, longrun("60–75", "45–60", "35–45", "50–65", "40–55", "30–40"), f="Long run")
S("2027-02-27", M, MID_SAT_OPT, gf="Optional easy")

# Week 14 · Mar 1 (meet Fri)
S("2027-03-01", D, ["Indoor season. Race days are performance days; we don't bury them under extra training."] + easy("40–45", "30–35", "20–30", extra=" + 4 × 100m relaxed strides") + [STR,
    "[Crossover] Optional after the run: 2 × 30m accelerations + 2 × flying 20m (speed maintenance)"], f="Easy + strength")
S("2027-03-02", D, [WU, "BC 7-Minute Ladder (continuous): surges of 15 – 30 – 45 – 60 – 45 – 30 – 15 sec = 4:00 of surges, with six 30-sec float jogs between them = 3:00. Total 7:00. No float after the last surge.",
    "15–30 sec surges at 1600 effort, 45–60 sec surges at 3200 effort.", "[A] [Distance] 2 sets, 5 min Easy jog between", "Everyone else: 1 set.",
    "Floats are jogs, never walks. If the last 15 sec isn't your fastest, you started too hard. Friday is a meet, so keep it controlled."], f="Aerobic power · BC 7-Minute Ladder")
S("2027-03-02", M, [MWU, "BC 7-Minute Ladder (Mid), 1 set: surges of 15 – 30 – 45 – 60 – 45 – 30 – 15 sec at 1600 to 800 effort (4:00), six 30-sec float jogs between (3:00) = 7:00. No float after the last surge.",
    "400-focused runners: short version, surges of 15 – 30 – 45 – 30 – 15 sec (2:15) with four 30-sec floats (2:00) = 4:15.",
    "Floats are jogs, never walks. Friday is a meet, so keep it controlled."], gf="Aerobic power · BC 7-Minute Ladder")
S("2027-03-03", D, rec("30", "25", "20"), f="Recovery")
S("2027-03-04", D, easy("25", "20–25", "15–20", extra=" + 4 × 80m relaxed strides"), f="Pre-meet")
S("2027-03-05", D, ["West Lafayette Individuals (anticipated). Goal: useful 400/800/1600 times. The race is the hard day.", "[Hybrid] This race is your speed work for the week."] + NOTRACE("35–40", "30", "20–25"), f="Meet")
S("2027-03-05", M, ["West Lafayette Individuals (anticipated)", MID_NOTRACE], gf="Meet")
S("2027-03-06", D, ["Raced Friday: 20–35 min recovery run or rest, depending on how much you raced", "[A] Didn't race: 50–60 min long run, Easy pace", "[B] Didn't race: 40–50 min long run, Easy pace", "[C] Didn't race: 30–40 min long run, Easy pace"], f="Recovery or long run")

# Week 15 · Mar 8 (two meets: Thu + Sat)
S("2027-03-08", D, ["Two-meet week: the meets are the hard work."] + easy("35–40", "30", "20–25", extra=" + 4 × 80m relaxed strides"), f="Easy")
S("2027-03-09", D, [WU, "[Distance] BC Threshold Maintenance: controlled Tempo, replaces this week's workout (not an extra one).",
    "[A] [Distance] 3 × 5 min Tempo, 60–90 sec jog", "[B] [Distance] 2 × 5 min Tempo, 60–90 sec jog", "[C] [Distance] 2 × 4 min Tempo, 60–90 sec jog",
    "[Distance] Racing Thursday: 2 sets max.", "[Hybrid] 2–3 × 200m at 800 pace (controlled), full 4–5 min recovery. 2 if you race Thursday."], f="Threshold · BC Threshold Maintenance")
S("2027-03-10", D, easy("25", "20", "15–20"), f="Easy")
S("2027-03-11", D, ["West Lafayette HSR Qualifier (anticipated): girls' 4×800"] + NOTRACE("30–35", "25–30", "20"), f="Meet")
S("2027-03-11", M, ["West Lafayette HSR Qualifier (anticipated)", MID_NOTRACE], gf="Meet")
S("2027-03-13", D, ["Maverick HSR Qualifier (anticipated): selected entries. Coaches set lineups after Thursday.", "[A] Not racing: 50–60 min long run, Easy pace", "[B] Not racing: 40–50 min long run, Easy pace", "[C] Not racing: 30–40 min long run, Easy pace"], f="Meet")
S("2027-03-13", M, ["Maverick HSR Qualifier (anticipated)", "800 runners not racing: optional 25–35 min Easy", "400-focused runners not racing: rest"], gf="Meet")

# Week 16 · Mar 15 (no meets)
S("2027-03-15", D, ["Goal: recover from qualifying, keep developing."] + easy("40", "30–35", "25") + [STR,
    "Max velocity, after the run: 2 × 30m accelerations + 2 × flying 20m, full recovery. Skip if you're not recovered from Saturday's race."], f="Easy + strength")
S("2027-03-16", D, ["Warm-up: 15 min Easy + drills + 4 strides. Cool-down: 10–15 min Easy.",
    "[Distance] BC Broken Tempo: Tempo blocks with 2 min Easy between. Same effort all the way; the blocks get shorter, not faster.",
    "[A] [Distance] 8 min · 2 min Easy · 6 min · 2 min Easy · 4 min, all at Tempo (18 min)", "[B] [Distance] 6 min · 2 min Easy · 5 min · 2 min Easy · 3 min, all at Tempo (14 min)",
    "[C] [Distance] 5 min · 2 min Easy · 4 min, both at Tempo (9 min)",
    "[Hybrid] BC Michigan: every rep a little faster than the last. Record every split. Nobody races the 1200.",
    "[A] [Hybrid] 1200 Tempo · 2 min jog · 800 Interval · 3 min jog · 400 at 1600 pace · 3–4 min walk/jog · 200 at 800 pace",
    "[B] [Hybrid] 1000 Tempo · 2 min jog · 600 Interval · 3 min jog · 400 at 1600 pace · 3–4 min walk/jog · 200 at 800 pace",
    "[C] [Hybrid] 800 Tempo · 2 min jog · 400 Interval · 3 min walk/jog · 200 at 800 pace"], f="Threshold · BC Broken Tempo")
S("2027-03-16", M, ["Warm-up: 10 min Easy + dynamic drills + 4 strides. Cool-down: 5–10 min Easy.",
    "800 runners: Broken 800: 200–400–200 at current 800 pace, 60 sec between segments. One set. Record splits.",
    "Newer 800 runners: 3 × 200m at 800 pace, 2 min recovery",
    "400-focused runners: BC Michigan (Mid): 400 Tempo · 3 min jog · 300 at 800 pace · 4 min walk/jog · 200 at Rep pace · 4 min walk · 150 fast and relaxed. Each rep a little faster than the last."], gf="Race-specific · Broken 800")
S("2027-03-17", D, rec("30–35", "25–30", "20"), f="Recovery")
S("2027-03-18", D, [WU, "BC Flyers, full recovery (4–5 min). Stop the set if times drop off or mechanics fall apart.",
    "[Distance] Maintenance version: 2 × 30m accelerations + 2 × flying 20m, then 2 × 150m at Rep pace (fast and relaxed), 3–4 min recovery",
    "[Hybrid] Development version: 3 × 30m accelerations + 3 × flying 20m (Tuesday was Michigan, so Flyers only)"], f="Max velocity · BC Flyers")
S("2027-03-19", D, easy("30", "25", "20"), f="Easy")
S("2027-03-20", D, longrun("55–65", "45–55", "35–45", "45–55", "40–50", "30–40"), f="Long run")
S("2027-03-20", M, MID_SAT_OPT, gf="Optional easy")

# Week 17 · Mar 22 · HSR Finals Sat = Indoor Performance Checkpoint (no taper)
CK = "Indoor Performance Checkpoint week (spring break): normal training, no taper. HSR Finals on Saturday is the week's main hard effort."
S("2027-03-22", D, [CK] + easy("40", "30–35", "25", extra=" + 4 × 80m relaxed strides") + ["Optional, prepared athletes: light Strength M · Maintenance"], f="Easy")
S("2027-03-22", M, [CK, "[A] B1 Easy run: 25 min Easy", "[B] B1 Easy run: 20 min Easy", "[C] B1 Easy run: 15 min Easy", "400-focused runners: 10–15 min Easy, optional", "4 × 80m relaxed strides",
    "Optional, prepared athletes: E1 Strength (light): split squat 2×5/leg, calf raise 2×10, dead bug 2×6/side"], gf="Easy")
S("2027-03-23", D, [WU, "Controlled work only: nothing exhausting this close to HSR.",
    "[Distance] BC Cruise Intervals (controlled), 60–90 sec jog: finish feeling like you could do two more.", "[A] [Distance] 4 × 5 min Tempo (HSR qualifiers: 3 × 5)", "[B] [Distance] 3 × 5 min Tempo", "[C] [Distance] 2 × 5 min Tempo",
    "[Hybrid] 3 × 4 min Tempo, 90 sec jog. HSR 800 qualifiers instead: 3 × 200m at 800 pace, full recovery (modest rhythm)."], f="Threshold · BC Cruise Intervals")
S("2027-03-23", M, [MWU, "800 runners: D1 800 rhythm (low volume): 3 × 200m at 800 pace, 3 min recovery", "400-focused runners: A3 Speed maintenance (short): 2 × 30m accelerations + 2 × flying 20m, full recovery"], gf="Race rhythm")
S("2027-03-24", D, rec("30–35", "25–30", "20"), f="Recovery")
S("2027-03-24", M, ["[A] B1 Easy run: 20–25 min Easy", "[B] B1 Easy run: 15–20 min Easy", "[C] B1 Easy run: 15 min Easy", "400-focused runners: 10–15 min Easy, optional"], gf="Recovery")
S("2027-03-25", D, easy("30–35", "25–30", "20") + ["Then 2 × 30m relaxed accelerations or 4 × 80m strides, full recovery"], f="Easy + strides")
S("2027-03-25", M, ["[A] B1 Easy run: 20 min Easy", "[B] B1 Easy run: 15–20 min Easy", "[C] B1 Easy run: 15 min Easy", "2 × 30m relaxed accelerations or 3 × 60m strides, full recovery"], gf="Easy + strides")
S("2027-03-26", D, ["HSR qualifiers: normal pre-meet day: 15–20 min Easy + mobility, or rest (your call). Nothing hard.", "[A] Not racing Saturday: 35 min Easy", "[B] Not racing Saturday: 30 min Easy", "[C] Not racing Saturday: 20–25 min Easy"], f="Pre-meet")
S("2027-03-26", M, ["HSR qualifiers: 10–15 min Easy + mobility, or rest (your call)", "Not racing Saturday: B1 Easy run: 15–25 min Easy"], gf="Pre-meet")
S("2027-03-27", D, ["HSR Finals: today is your hard day. Race it.", "[A] [Distance] Not racing: 55–65 min long run, Easy pace", "[B] [Distance] Not racing: 45–55 min long run, Easy pace", "[C] [Distance] Not racing: 35–45 min long run, Easy pace",
    "[Hybrid] Not racing: 45–55 min long run, Easy pace (C: 30–40)"], f="HSR Finals")
S("2027-03-27", M, ["HSR Finals (qualifiers): today is your hard day.", "800 runners not racing: optional 25–40 min Easy", "400-focused runners not racing: rest or 15 min Easy"], gf="HSR Finals")

# Week 18 · Mar 29 (no automatic recovery week)
S("2027-03-29", D, ["Outdoor season. No team recovery week: your HSR race load decides.", "Raced 2+ hard events at HSR: 20–30 min recovery run or rest today, then rejoin.",
    "[A] Everyone else: 40 min Easy + 4 × 100m relaxed strides", "[B] Everyone else: 30–35 min Easy + 4 × 100m relaxed strides", "[C] Everyone else: 25 min Easy + 4 × 100m relaxed strides", STR], f="Easy + strength")
S("2027-03-30", D, [WU, "BC Threshold 1000s at Tempo, 60–75 sec jog between. Rep count is set by total Tempo time, not distance. Compare your Tempo splits with Mar 23's Cruise Intervals.",
    "[A] [Distance] 5–6 × 1000m Tempo (about 18–24 min)", "[A] [Hybrid] 4–5 × 1000m Tempo (about 15–20 min)", "[B] 4 × 1000m Tempo (about 14–17 min)", "[C] 2–3 × 1000m Tempo (about 8–12 min)",
    "Raced 2+ hard events at HSR: swap this for an Easy run."], f="Threshold · BC Threshold 1000s")
S("2027-03-31", D, rec("30–35", "25–30", "20"), f="Recovery")
S("2027-04-01", D, [WU, "[Distance] BC 3200 Ladder at current 3200 pace (Paces page): 60 sec jog after the 200s and 400s, 90 sec after the 600s, 2 min after the 800. Even and relaxed, no racing.",
    "[A] [Distance] 200–400–600–800–600–400–200 at 3200 pace", "[B] [Distance] 200–400–600–600–400–200 at 3200 pace", "[C] [Distance] 200–400–600–400–200 at 3200 pace",
    "[Hybrid] BC Event Reps at current 1600 pace (Paces page), never goal pace, 2 min recovery", "[A] [Hybrid] 5 × 300m at 1600 pace", "[B] [Hybrid] 5 × 300m at 1600 pace", "[C] [Hybrid] 4 × 300m at 1600 pace"],
    f="Race-specific · BC 3200 Ladder")
S("2027-04-02", D, easy("30–35", "25–30", "20"), f="Easy")
S("2027-04-03", D, longrun("60–75", "45–60", "35–45", "50–65", "40–55", "30–40", note=" (shorter if HSR was big)"), f="Long run")
S("2027-04-03", M, MID_SAT_OPT, gf="Optional easy")

# Week 19 · Apr 5 (meets Tue + Thu)
S("2027-04-05", D, ["Two meets this week = plenty of hard running. No extra workout."] + easy("35–40", "30", "20–25", extra=" + 4 × 100m relaxed strides") + [
    "[Crossover] Optional after the strides: 3 × 30m accelerations, full recovery"], f="Easy")
S("2027-04-06", D, ["Meet: Seeger / BC / Covington"] + NOTRACE("35–40", "30", "20–25"), f="Meet")
S("2027-04-06", M, ["Meet: Seeger / BC / Covington", MID_NOTRACE], gf="Meet")
S("2027-04-07", D, rec("25–35", "20–30", "15–20"), f="Recovery")
S("2027-04-08", D, ["Home meet: South Newton / North Newton / Fountain Central"] + NOTRACE("35–40", "30", "20–25"), f="Meet")
S("2027-04-08", M, ["Home meet: South Newton / North Newton / Fountain Central", MID_NOTRACE], gf="Meet")
S("2027-04-09", D, ["[A] Rest or 20–30 min recovery run", "[B] Rest or 20 min recovery run", "[C] Rest"], f="Recovery")
S("2027-04-10", D, ["Long run sized to how much you raced this week: raced hard both days? Take the low end.", "[A] [Distance] 50–65 min long run, Easy pace", "[B] [Distance] 40–50 min long run, Easy pace", "[C] [Distance] 30–40 min long run, Easy pace",
    "[A] [Hybrid] 45–55 min long run, Easy pace", "[B] [Hybrid] 35–45 min long run, Easy pace", "[C] [Hybrid] 25–35 min long run, Easy pace"], f="Long run")

# Week 20 · Apr 12 (meet Tue)
S("2027-04-12", D, easy("35–40", "30", "20–25", extra=" + 4 strides") + ["Max velocity, after the strides: 2 × flying 20m, full recovery"], f="Easy + speed")
S("2027-04-13", D, ["Meet: Twin Lakes / Lafayette Jeff"] + NOTRACE("35–40", "30", "20–25"), f="Meet")
S("2027-04-13", M, ["Meet: Twin Lakes / Lafayette Jeff", MID_NOTRACE], gf="Meet")
S("2027-04-14", D, rec("30", "25", "20"), f="Recovery")
S("2027-04-15", D, [WU, "BC Mystery Workout: draw a card or pick at the line. Every option in your level is the same total Tempo time, so nobody gets an easier or harder card. Raced a lot Tuesday? Take the shortest version or run Easy.",
    "[A] (a) 3 × 6 min · (b) 6 × 3 min · (c) 9 × 2 min, all at Tempo = 18 min (jog 90 / 60 / 45 sec)",
    "[B] (a) 3 × 5 min · (b) 5 × 3 min · (c) 10 min + 5 min, all at Tempo = 15 min (jog 90 / 60 / 120 sec)",
    "[C] (a) 2 × 5 min · (b) 5 × 2 min · (c) 10 min continuous, all at Tempo = 10 min (jog 90 / 45 sec)"], f="Threshold · BC Mystery Workout")
S("2027-04-16", D, easy("30–35", "25–30", "20") + [STR + " (light)"], f="Easy + strength")
S("2027-04-17", D, longrun("60–75", "45–60", "35–45", "50–65", "40–55", "30–40"), f="Long run")
S("2027-04-17", M, MID_SAT_OPT, gf="Optional easy")

# Week 21 · Apr 19 (meet Tue)
S("2027-04-19", D, ["[Hybrid] Stronger 800 focus starts now for open 800 / 4×800 girls."] + easy("35–40", "30", "20–25", extra=" + 4 strides"), f="Easy")
S("2027-04-20", D, ["Meet: Faith Christian / Attica / Central Catholic"] + NOTRACE("35–40", "30", "20–25"), f="Meet")
S("2027-04-20", M, ["Meet: Faith Christian / Attica / Central Catholic", MID_NOTRACE], gf="Meet")
S("2027-04-21", D, rec("25–35", "20–30", "15–20"), f="Recovery")
S("2027-04-22", D, [WU, "[Distance] Aerobic power: BC I-Pace 600s at Interval pace (Paces page), 2–3 min jog between. Hard but controlled, every rep the same. Raced 2+ hard events Tuesday? Run Easy instead.",
    "[A] [Distance] 5 × 600m at Interval pace", "[B] [Distance] 4 × 600m at Interval pace", "[C] [Distance] 3 × 600m at Interval pace",
    "[Hybrid] BC Broken Race at current race pace, one set only. Raced 2+ hard events Tuesday? Run Easy instead.", "[Hybrid] 800: 500m + 300m at 800 pace, 3 min rest"], f="Aerobic power · BC I-Pace 600s")
S("2027-04-23", D, easy("30", "25", "20") + [STR + " (light)", "If a relay invitational is confirmed for Apr 23–24, coaches will adjust this day and Saturday."], f="Easy + strength")
S("2027-04-24", D, longrun("55–70", "45–55", "30–40", "45–60", "40–50", "30–40"), f="Long run")
S("2027-04-24", M, MID_SAT_OPT, gf="Optional easy")

# Week 22 · Apr 26 (meet Tue, Kouts Sat if approved)
S("2027-04-26", D, ["Conference prep. Time to get tactical."] + easy("35–40", "30", "20–25", extra=" + 4 strides"), f="Easy")
S("2027-04-27", D, ["Meet: Sheridan / Clinton Prairie / Delphi"] + NOTRACE("35–40", "30", "20–25"), f="Meet")
S("2027-04-27", M, ["Meet: Sheridan / Clinton Prairie / Delphi", MID_NOTRACE], gf="Meet")
S("2027-04-28", D, rec("25–35", "20–30", "15–20"), f="Recovery")
S("2027-04-29", D, [WU, "BC Threshold Maintenance: controlled Tempo, 60–90 sec jog. Replaces this week's workout.",
    "[A] 3 × 5 min Tempo (racing Kouts Saturday: 2 × 5)", "[B] 2 × 5 min Tempo (racing Kouts: 2 × 4)", "[C] 2 × 4 min Tempo (racing Kouts: 2 × 3)",
    "[Crossover] Optional after: 2 × flying 20m (speed maintenance)"], f="Threshold · BC Threshold Maintenance")
S("2027-04-30", D, easy("20–25", "20", "15") + ["Mobility 5–10 min"], f="Pre-meet")
S("2027-05-01", D, ["Kouts Invitational (if approved): priority race", "[A] Not racing: 50–60 min long run, Easy pace", "[B] Not racing: 40–50 min long run, Easy pace", "[C] Not racing: 30–40 min long run, Easy pace"], f="Meet")

# Week 23 · May 3 (Conference Thu: no full taper)
S("2027-05-03", D, ["Conference week: keep normal easy running and cut only avoidable fatigue. No full taper."] + easy("35", "30", "20–25", extra=" + 4 relaxed strides"), f="Easy")
op("2027-05-03", M, "replace", "Conference week", "Conference week: normal easy running and short speed, no extra hard sessions. No full taper.")
S("2027-05-04", D, ["Crawfordsville: selected entries only for conference scorers"] + NOTRACE("30–35", "25–30", "20"), f="Meet")
S("2027-05-05", D, easy("25", "20–25", "15–20", extra=" + 3–4 relaxed strides"), f="Pre-meet")
S("2027-05-08", D, easy("45–60", "35–45", "25–35"), f="Easy")

# Week 24 · May 10
S("2027-05-10", D, ["Last full week before sectionals. Contenders start cutting fatigue; everyone else trains normally.", "Meet: Logansport (selected entries for sectional athletes)"] + NOTRACE("35–40", "30", "20–25"), f="Meet")
S("2027-05-11", D, rec("25–35", "20–30", "15–20"), f="Recovery")
S("2027-05-12", D, [WU, "BC Threshold 1000s (sharpening) at Tempo, 75 sec jog between. Skip if you're carrying a lot of race fatigue.", "[A] 3 × 1000m Tempo", "[B] 2–3 × 1000m Tempo", "[C] 2 × 1000m Tempo (or 2 × 4 min)"], f="Threshold · BC Threshold 1000s")
S("2027-05-13", D, easy("30", "25", "20", extra=" + 4 relaxed strides") + ["[Crossover] Optional after the strides: 3 × 30m accelerations, full recovery"], f="Easy")
S("2027-05-15", D, easy("45–60", "40–50", "30–40", what="long run, Easy pace,", extra=" comfortable"), f="Long run")

# Week 25 · May 17 (sectionals: individualized)
op("2027-05-17", D, "insertAfter", "Girls sectional Tue", "Individualized week: your events, relays, fatigue and chance of advancing decide how fresh you need to be. Not entered in sectionals: normal training week (Tue BC Cruise Intervals by level, other days Easy by level).")
op("2027-05-17", M, "insertAfter", "Girls sectional Tue", "Individualized week: your events and fatigue decide how fresh you need to be. Not entered in sectionals: normal week (B1 Easy runs + one speed day).")
# Week 26 · May 24 (regionals)
op("2027-05-24", D, "insertAfter", "Girls regional Tue", "Season finished? Transition week: 3–4 easy runs of 20–40 min plus one fun speed day (2 × 30m + 2 × flying 20m). Then a real break.")
op("2027-05-24", M, "insertAfter", "Girls regional Tue", "Season finished? Transition week: 3–4 easy runs of 15–30 min plus one fun speed day. Then a real break.")
# Week 27 · May 31 (state: individualized taper)
op("2027-05-31", D, "insertAfter", "State dates to be confirmed", "Taper is individualized: less volume, same intensity, short speed and rhythm, no new hard workouts. Coaches adjust it to your training history and events.")

# Mid group text-wide rules (applied to HS Mid Distance items Feb 22 → Jun 6 on days not set above)
RX = [
 {"from": "2027-02-22", "to": "2027-06-06", "g": M, "exact": "B1 Easy run: 15–25 min Easy (400-focused runners: 10–15 min, optional)",
  "new": ["[A] B1 Easy run: 25 min Easy", "[B] B1 Easy run: 20 min Easy", "[C] B1 Easy run: 15 min Easy", "400-focused runners: 10–15 min Easy, optional"]},
 {"from": "2027-02-15", "to": "2027-03-31", "g": M, "exact": "E2 Athletic development: pogo hops 2×10, A-skips 2×20m, mini-hurdle run 2×, 5 min hip mobility",
  "new": ["E2 Athletic development (reactive strength): low hurdle hops 2×5, pogo hops 2×10, A-skips 2×20m, 5 min hip mobility"]},
 {"from": "2027-04-01", "to": "2027-06-06", "g": M, "exact": "E2 Athletic development: pogo hops 2×10, A-skips 2×20m, mini-hurdle run 2×, 5 min hip mobility",
  "new": ["E2 Athletic development (maintenance, low volume): pogo hops 2×10, A-skips 2×20m, mini-hurdle run 2×, 5 min hip mobility"]},
]
json.dump({"set": SET, "ops": OPS, "rx": RX}, open("/home/claude/work/patch.json", "w"), ensure_ascii=False)
print(len(SET), "day/group sets,", len(OPS), "ops,", len(RX), "rules")
