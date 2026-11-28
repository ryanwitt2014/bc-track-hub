(() => {
const W = JSON.parse(JSON.stringify(window._RAW)), SPR = JSON.stringify(["Sprints","Hurdles","Long Jump","High Jump","Pole Vault"]);
const strip = t => t.replace(/^(\[[^\]]+\]\s*)+/, ""), tg = t => (t.match(/^(\[[^\]]+\]\s*)+/)||[""])[0];
const MAR = ["Drill: resisted bilateral pogos 2 × 8 contacts (secure anchors; JH-style unresisted if no anchors)", "Drill: elevated supported single-leg ankle rebounds 2 × 8 each leg",
  "Drill: bilateral wicket pogos 2 × 6 contacts", "Drill: sled pushes 3 × 15m if the sleds are here (otherwise band-resisted acceleration march 2 × 10m)"];
const ACT = ["Activation: seated banded clamshell + prone banded leg lift, 1 × 10 each", "Activation: banded straight-leg kickback + banded seated leg raise, 1 × 10 each", "Mobility: down-dog walks + all-four hip openers, 1 × 8 each"];
const FLOW = "Cool-down mobility flow (pick 6–8): toe sit, ankle sit, hip flexor stretch, world's greatest stretch, hip 90/90, crab extensions, squat to hamstring stretch, Cossack stretch, pigeon pose, alternating calf stretch";
const rep = {marDrill:0, act:0, flow:0, days:new Set()}; let mi = 0, ai = 0;
const days = []; W.forEach(w => w.days.forEach(d => days.push([iso(dayDate(w, d.day)), d])));
days.sort((a,b)=>a[0].localeCompare(b[0])).forEach(([ds, d]) => { if (ds < "2027-03-01" || ds > "2027-05-09") return;
  const c = (d.combos||[]).find(c => JSON.stringify(c.groups)===SPR); if (!c) return; const L = String((d.gfocus||{}).Sprints||"").split(" · ")[0];
  if (L==="HIGH" && ds <= "2027-03-31") { const i = c.items.findIndex(it => it.lv==="HS" && /^Drill:/.test(strip(it.t))); if (i >= 0) { c.items[i] = {t: MAR[mi++ % MAR.length], lv:"HS"}; rep.marDrill++; rep.days.add(ds); } }
  if (L==="LOW") {
    const e = c.items.findIndex(it => it.lv==="HS" && /^Easy 8–10 min walk or bike/.test(strip(it.t)));
    if (e >= 0) { c.items.splice(e+1, 0, {t: ACT[ai++ % ACT.length], lv:"HS"}); rep.act++; rep.days.add(ds); }
    const k = c.items.findIndex(it => it.lv==="HS" && /^Cool-down: 5 min easy walk/.test(strip(it.t)));
    if (k >= 0) { c.items[k] = {t: tg(c.items[k].t) + FLOW, lv:"HS"}; rep.flow++; rep.days.add(ds); } }
});
window._NEW = W; return JSON.stringify(Object.assign({}, rep, {days: rep.days.size}));
})()
