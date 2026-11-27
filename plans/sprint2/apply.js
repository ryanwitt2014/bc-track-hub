(() => {
const W = JSON.parse(JSON.stringify(window._RAW)), SPR = ["Sprints","Hurdles","Long Jump","High Jump","Pole Vault"];
const strip = t => t.replace(/^(\[[^\]]+\]\s*)+/, ""), tagsOf = t => (t.match(/^(\[[^\]]+\]\s*)+/)||[""])[0];
const rep = {pct:0, stop:0, s3:0, hsr:0, lib:0, hl:0, days:0, miss:[]};
const pctRx = /\(about (\d{2})%(, never a race)?\)/g;
const PCT = (m, p, nr) => `(${p}% speed: target ≈ best comparable time ÷ 0.${p}${nr ? ", never a race" : ""})`;
const DATE = {};
W.forEach(w => w.days.forEach(d => { DATE[iso(dayDate(w, d.day))] = d; }));
const swap = (d, date, test, fn) => { const c = (d.combos||[]).find(c => JSON.stringify(c.groups)===JSON.stringify(SPR)); if (!c) return false;
  const i = c.items.findIndex(it => it.lv==="HS" && test(strip(it.t), it.t)); if (i < 0) { rep.miss.push(date); return false; } const out = fn(c.items[i].t); c.items.splice(i, 1, ...[].concat(out).map(t => ({t, lv:"HS"}))); rep.lib++; return true; };
Object.entries(DATE).forEach(([date, d]) => {
  const c = (d.combos||[]).find(c => JSON.stringify(c.groups)===JSON.stringify(SPR)); if (!c || date < "2027-03-01") return; rep.days++;
  c.items.forEach(it => { if (it.lv !== "HS") return; let t = it.t;
    if (pctRx.test(t)) { t = t.replace(pctRx, PCT); rep.pct++; } pctRx.lastIndex = 0;
    t = t.replace(/controlled, about 90%/g, () => { rep.pct++; return "controlled (90% speed: target ≈ best comparable time ÷ 0.90)"; });
    t = t.replace(/at about 85–90% each/g, () => { rep.pct++; return "at about 85–90% effort each"; });
    if (/Stop when mechanics break or a rep is 3%\+ slower than the first after full rest\./.test(t)) { t = t.replace("Stop when mechanics break or a rep is 3%+ slower than the first after full rest.", "Stop when mechanics break. Same-distance reps: stop if one is about 3% slower than your best rep today. Split runs and different distances are judged on target splits and form, not the 3% rule."); rep.stop++; }
    if (/Do today's Mid-Distance workout instead\./.test(t)) { t = t.replace("Do today's Mid-Distance workout instead.", "One workout today: the Mid-Distance session takes precedence. Don't add this sprint session on top."); rep.s3++; }
    it.t = t; });
  // high / low label on the sprint groups' day focus
  const hs = c.items.filter(i => i.lv==="HS").map(i => strip(i.t)).join(" | ");
  const L = /^Meet:|\| Meet:/.test(hs) || /^Meet:/.test(hs) ? "COMPETITION" : /^Rest\.?$|Optional: rest/.test(hs) && !/fast-day warm-up/.test(hs) ? "OFF" : /short HS fast-day warm-up|Premeet/i.test(hs) ? "LOW" : /HS fast-day warm-up/.test(hs) ? "HIGH" : "LOW";
  d.gfocus = d.gfocus || {}; SPR.forEach(g => { const cur = String(d.gfocus[g]||"").replace(/^(HIGH|LOW|COMPETITION|OFF) · /, ""); d.gfocus[g] = L + (cur ? " · " + cur : ""); }); rep.hl++;
});
// HSR week: normal low-volume speed, controlled rhythm Thursday, no taper language
const H = (date, from, to) => { const d = DATE[date]; if (d && swap(d, date, s => s.startsWith(from), t => tagsOf(t) + to)) rep.hsr++; };
H("2027-03-22","Recovery:","Recovery or general preparation: 8–10 min easy + ankle rocks, dead bug, side plank, light mobility");
H("2027-03-23","Tune-up:","Normal low-volume speed: 3 × 20m starts + 2–3 × flying 20m · full rest (no long reps this week)");
H("2027-03-25","Sharpening:","Controlled race rhythm: 2 × 20m starts · S1 1 × 60m / S2 2 × 100m at race rhythm, relaxed (instead of the optional session)");
// workout library placements (replace, never add)
const d29 = DATE["2027-03-29"]; d29 && swap(d29, "2027-03-29", s => s.startsWith("Starts: 3 × 30m"), t => tagsOf(t) + "BC Resisted Acceleration (sleds available + prepared athletes): 3 × 15m light sled + 3 × 20m unresisted · full recovery. No sled or not ready: Starts 3 × 30m · 2–3 min rest");
const d15 = DATE["2027-04-15"]; d15 && swap(d15, "2027-04-15", s => s.startsWith("3 × flying 20m"), t => tagsOf(t) + "BC Sprint-Float-Sprint (prepared athletes): 2–3 × (20m accel + 20m fast + 20m relaxed float + 20m fast) · 6–8 min rest. Everyone else: 3 × flying 20m · 4–5 min rest");
d15 && swap(d15, "2027-04-15", s => s.startsWith("Then 1 × 150m controlled"), t => tagsOf(t) + "Prepared 400 specialists: BC Special Endurance II: 1 × 250m at 92% speed (target ≈ best comparable ÷ 0.92) instead of the 150 · full recovery after. Everyone else: 1 × 150m controlled (90% speed) · 8 min after the flies");
["2027-03-31","2027-04-22"].forEach(ds => { const d = DATE[ds]; d && swap(d, ds, s => s.startsWith("Prepared 400 runners: split run 200m + 150m"), t => t.replace("Prepared 400 runners: split run 200m + 150m", "Prepared 400 runners: BC Broken 350 (200m + 150m)")); });
window._NEW = W; return JSON.stringify(rep);
})()
