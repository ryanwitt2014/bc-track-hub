(() => {
const P = window._PATCH, W = JSON.parse(JSON.stringify(window._RAW));
const days = {}; W.forEach(w => w.days.forEach(d => { const k = iso(dayDate(w, d.day)); (days[k] = days[k] || []).push(d); }));
const rep = {missingDate:[], dupDate:[], opMiss:[], set:0, ops:0, rx:0};
const hsItems = (d, g) => ((d.groups = d.groups || {})[g] || []);
const one = date => { const a = days[date]; if (!a) { rep.missingDate.push(date); return null; } if (a.length > 1) rep.dupDate.push(date); return a.find(d => ["Distance","Mid Distance"].some(g => hsItems(d,g).some(i=>i.lv==="HS"))) || a[0]; };
P.set.forEach(s => { const d = one(s.date); if (!d) return;
  d.groups[s.g] = hsItems(d, s.g).filter(i => i.lv && i.lv !== "HS").concat(s.items.map(t => ({t, lv:"HS"})));
  if (s.f) { d.gfocus = d.gfocus || {}; d.gfocus["Distance"] = s.f; }
  if (s.gf) { d.gfocus = d.gfocus || {}; d.gfocus["Mid Distance"] = s.gf; }
  rep.set++; });
P.ops.forEach(o => { const d = one(o.date); if (!d) return; const arr = hsItems(d, o.g);
  const i = arr.findIndex(it => it.lv === "HS" && (o.op === "remove" ? it.t.trim() === o.match : it.t.startsWith(o.match)));
  if (i < 0) { rep.opMiss.push(o.date + " " + o.g + " " + o.op + " " + o.match.slice(0,30)); return; }
  if (o.op === "remove") arr.splice(i, 1); else if (o.op === "replace") arr[i] = {t:o.new, lv:"HS"}; else arr.splice(i+1, 0, {t:o.new, lv:"HS"});
  d.groups[o.g] = arr; rep.ops++; });
const setKeys = new Set(P.set.map(s => s.date + "|" + s.g));
P.rx.forEach(r => Object.entries(days).forEach(([k, ds]) => { if (k < r.from || k > r.to || setKeys.has(k + "|" + r.g)) return;
  ds.forEach(d => { const arr = hsItems(d, r.g); const i = arr.findIndex(it => it.lv === "HS" && it.t === r.exact); if (i < 0) return;
    arr.splice(i, 1, ...r.new.map(t => ({t, lv:"HS"}))); d.groups[r.g] = arr; rep.rx++; }); }));
window._NEW = W; return JSON.stringify(rep);
})()
