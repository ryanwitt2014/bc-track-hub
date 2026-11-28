(() => {
const W = JSON.parse(JSON.stringify(window._RAW)), SPR = JSON.stringify(["Sprints","Hurdles","Long Jump","High Jump","Pole Vault"]);
const rep = {lowStr:0, addStr:0, drill:0, cool:0, coolJH:0, hsDays:new Set(), jhDays:new Set(), hadStrHigh:0};
const strip = t => t.replace(/^(\[[^\]]+\]\s*)+/, ""), tg = t => (t.match(/^(\[[^\]]+\]\s*)+/)||[""])[0];
const DRILLS = ["Drill: band-resisted acceleration march 2 × 10m (before the starts)", "Drill: three broad jumps into acceleration 2 × (3 jumps + 10m), replaces one start", "Drill: bilateral pogos 2 × 10 contacts",
  "Drill: flying wickets 2 passes at individual spacing, replaces one flying rep", "Drill: supported band-resisted block drives 2 × 4 sec each leg", "Drill: tennis ball single-leg pogos 2 × 8 each leg"];
const COOL = "Cool-down: 5 min easy walk + quick mobility: toe sit, hip flexor stretch, hip 90/90, alternating calf stretch";
let di = 0; const weekHad = {};
const days = []; W.forEach(w => w.days.forEach(d => days.push([iso(dayDate(w, d.day)), d, w.start])));
days.sort((a,b)=>a[0].localeCompare(b[0])).forEach(([ds, d, wk]) => { if (ds < "2027-03-01") return;
  const c = (d.combos||[]).find(c => JSON.stringify(c.groups)===SPR); if (!c) return;
  const L = String((d.gfocus||{}).Sprints||"").split(" · ")[0];
  c.items.forEach(it => { const s = strip(it.t);
    if (/^Cool-down: 5 min easy walk \+ calf and hip mobility/.test(s)) { it.t = tg(it.t) + COOL; if (it.lv==="JH") { rep.coolJH++; rep.jhDays.add(ds); } else { rep.cool++; rep.hsDays.add(ds); } }
    if (it.lv==="HS" && L==="LOW" && /^Sprint Strength [AB]\b/.test(s)) { it.t = tg(it.t) + "Sprint Lower-Leg & Hip circuit (if recovered)"; rep.lowStr++; rep.hsDays.add(ds); } });
  if (L==="HIGH") { const hs = c.items.filter(i => i.lv==="HS");
    if (hs.some(i => /Sprint Strength [AB]/.test(i.t))) rep.hadStrHigh++;
    else if (ds <= "2027-04-30" && !weekHad[wk]) { const ab = (Object.keys(weekHad).length % 2) ? "B" : "A"; weekHad[wk] = 1;
      const ci = c.items.findIndex(i => i.lv==="HS" && /^Cool-down/.test(strip(i.t))); c.items.splice(ci<0 ? c.items.length : ci, 0, {t:`Sprint Strength ${ab} (after sprinting; 25–30 min, first 3–4 exercises)`, lv:"HS"}); rep.addStr++; rep.hsDays.add(ds); }
    const wi = c.items.findIndex(i => i.lv==="HS" && /^Warm-up:/.test(strip(i.t)));
    if (wi >= 0 && ds <= "2027-05-09") { c.items.splice(wi+1, 0, {t: DRILLS[di++ % DRILLS.length], lv:"HS"}); rep.drill++; rep.hsDays.add(ds); } }
});
window._NEW = W; return JSON.stringify(Object.assign({}, rep, {hsDays: rep.hsDays.size, jhDays: rep.jhDays.size}));
})()
