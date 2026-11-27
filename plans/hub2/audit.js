(async () => {
const get = async k => (await SB.from("hub_data").select("value").eq("key", k)).data[0].value;
const OLD = mergeWeeks(await get("workouts_bak_hub2")), NEW = mergeWeeks(await get("workouts"));
const LV = ["A","B","C"], PATHS = ["Distance","Hybrid","Mid"];
const vis = (t, tier, path) => { const {tags} = splitTags(t); const l = tags.filter(x=>LV.includes(x)), p = tags.filter(x=>PATHS.includes(x));
  if (tags.includes("Boys")) return false; if (l.length && !l.includes(tier)) return false; if (p.length && !p.includes(path)) return false; return true; };
const QUAL = /Tempo|Interval pace|at 3200 pace|at 1600 pace|at 800 pace|Ladder|Michigan|Broken|Event Reps|Mystery|I-Pace|Threshold/i;
const ALT = /400-focused|Not racing|Didn't race|Racing |Raced |Only if you are NOT|not entered|Season finished|Skip if|swap this|instead/i;
const mins = t => { if (ALT.test(t)) return 0; const m = t.match(/(\d+)(?:–(\d+))? min (?:Easy|recovery run|long run|very easy)/i); return m ? (m[2] ? (+m[1] + +m[2]) / 2 : +m[1]) : 0; };
const week = (Ws, start, tier, path, g) => { const w = Ws.find(x => x.start === start); if (!w) return null; let m = 0, q = 0, th = 0;
  w.days.forEach(d => { const its = forLv((d.groups||{})[g], "HS").map(i => i.t).filter(t => vis(t, tier, path)); m += its.reduce((s,t) => s + mins(t), 0);
    const f = gFocus(d, g, "HS") || ""; if (its.some(t => QUAL.test(t) && !ALT.test(t)) || /Threshold|Aerobic power|Race-specific/.test(f)) q++; if (/^Threshold/.test(f) || its.some(t=>/Tempo/.test(t) && !ALT.test(t) && !/Warm-up/.test(t))) th++; });
  return {m: Math.round(m), q, th}; };
const rows = NEW.filter(w => w.start >= "2027-02-15").map(w => { const r = {wk: w.start.slice(5)};
  [["dA","A","Distance","Distance"],["dB","B","Distance","Distance"],["dC","C","Distance","Distance"],["hA","A","Hybrid","Distance"],["mA","A","Mid","Mid Distance"]].forEach(([k,t,p,g]) => { const o = week(OLD, w.start, t, p, g), n = week(NEW, w.start, t, p, g); r[k] = o && n ? `${o.m}→${n.m} ${o.q}→${n.q} ${o.th}→${n.th}` : "-"; });
  return r; });
return rows.map(r => [r.wk, r.dA, r.dB, r.dC, r.hA, r.mA].join(" | ")).join("\n");
})()
