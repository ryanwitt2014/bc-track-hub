/* BC Track Hub · Scouting (Competitive Intelligence) · Phase 1
   Coach-only. Data lives in Supabase tables schools, meets, import_batches, results (see supabase/migrations/001_scouting.sql).
   Loaded after index.html's main script and uses its globals: SB, canPost, coachEmail, ATHLETES, EV_NAME, esc, render, segBtns, iso, today. */
(function(){
"use strict";

/* ---------- styles ---------- */
const css = `
.ix-tabs{display:flex;flex-wrap:wrap;gap:6px}
.ix-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:10px 18px}
.ix textarea{font:13px var(--mono);width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:5px;background:var(--bg);color:var(--fg)}
.ix input[type=text],.ix input[type=date],.ix input[type=url],.ix select{font:15px var(--body);width:100%;padding:7px 10px;border:1px solid var(--line);border-radius:5px;background:var(--bg);color:var(--fg);min-width:0}
.ix-tbl td,.ix-tbl th{white-space:nowrap}.ix-tbl td.wrap{white-space:normal}
.ix-bad{background:rgba(180,71,43,.10)}.ix-dup{opacity:.55}
.ix-pill{display:inline-block;font-size:12px;font-weight:700;border-radius:3px;padding:1px 7px;margin-right:4px;background:var(--chip)}
.ix-pill.new{background:var(--gold);color:var(--gold-ink)}.ix-pill.err{background:#b4472b;color:#fff}.ix-pill.ok{background:var(--accent);color:var(--accent-ink)}
.ix-edit input{font:13px var(--body);padding:3px 6px;width:100%;min-width:60px;border:1px solid var(--line);border-radius:4px;background:var(--bg);color:var(--fg)}
.dash-bc{background:var(--gold-soft)}div.dash-bc{border-radius:3px;padding:0 4px;margin:0 -4px}
.lu-ev{display:inline-block;margin:0 10px 2px 0;white-space:nowrap}
.brief{border-left:4px solid var(--gold)}
.dash-x{font:700 11px var(--body);border:1px solid var(--line);background:transparent;color:var(--muted);border-radius:3px;padding:0 4px;margin-right:4px;cursor:pointer;line-height:1.4}
.dash-x:hover{color:#b4472b;border-color:#b4472b}
.dash-list{margin:0;padding-left:20px;display:grid;gap:6px}
.ix-stat{font-family:var(--mono);font-size:28px;font-weight:500}
`;
const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

/* ---------- state ---------- */
const IX = window.IX = {
  tab:"dash", loaded:false, loading:false, err:"",
  schools:[], meets:[], counts:{}, batches:[],
  imp:{name:"", date:"", level:"HS", type:"conference", host:"", url:"", note:"", gender:"row", scoring:"auto", csv:"", file:"", rows:null, map:{}, saving:false, msg:null},
  rf:{meet:"", event:"", gender:"", school:"", rows:null, loading:false}, edit:null, medit:null, sedit:null, merge:null, del:null, msg:null,
};

/* ---------- event, gender, mark parsing ---------- */
const FIELD = new Set(["LJ","HJ","PV","SP","DT","TJ"]);
const EV_ORDER = ["100","200","400","800","1600","3200","100H","110H","300H","4x100","4x200","4x400","4x800","LJ","HJ","PV","SP","DT"];
function normEvent(s){
  const t = String(s||"").toLowerCase().replace(/(\d)\s*m\b/g,"$1 ").replace(/(boys|girls|men'?s|women'?s|varsity|jv|junior high|high school)/g,"").replace(/meters?|metres?|meter|run|dash|\bm\b/g," ").replace(/\s+/g," ").trim();
  if (!t) return null;
  if (/relay|4\s*x/.test(t)) { const m = t.match(/4\s*x\s*(\d+)/); return m ? "4x"+m[1] : null; }
  if (/hurdle|\bh\b/.test(t)) { const m = t.match(/(100|110|300)/); return m ? m[1]+"H" : null; }
  if (/long ?jump|^lj$/.test(t)) return "LJ"; if (/high ?jump|^hj$/.test(t)) return "HJ"; if (/pole ?vault|^pv$/.test(t)) return "PV";
  if (/shot|^sp$/.test(t)) return "SP"; if (/discus|^dt$/.test(t)) return "DT"; if (/triple/.test(t)) return "TJ";
  if (/mile/.test(t) && !/2 ?mile/.test(t)) return "1600"; if (/2 ?mile/.test(t)) return "3200";
  const n = t.match(/\b(100|200|400|800|1600|3200|1500|3000)\b/); return n ? n[1] : null;
}
function normGender(s){ const t = String(s||"").trim().toLowerCase(); if (/^(b|boys?|m|men|male)$/.test(t)) return "B"; if (/^(g|girls?|w|women|f|female)$/.test(t)) return "G"; return null; }
const STATUS = /^(dnf|dns|dq|nh|nm|fs|scr|foul|ns|ff)$/i;
// Races -> seconds. Field -> inches.
function parseMark(event, raw){
  const r0 = String(raw||"").trim();
  if (STATUS.test(r0)) return {value:null, status:r0.toUpperCase(), ok:true};
  const s = r0.replace(/[hc*#]$/i,"").replace(/\s*[qQ]$/,"").trim();
  if (!s) return {value:null, status:"", ok:false};
  if (FIELD.has(event)) {
    let m = s.match(/^(\d+)\s*(?:-|'|’|ft)\s*(\d+(?:\.\d+)?)?\s*(?:"|”|in)?$/i); if (m) return {value: +m[1]*12 + (+m[2]||0), status:"", ok:true};
    m = s.match(/^(\d+(?:\.\d+)?)\s*m$/i); if (m) return {value: +m[1]*39.3701, status:"", ok:true};
    m = s.match(/^(\d+(?:\.\d+)?)$/); if (m) return {value: +m[1]*12, status:"", ok:true};   // plain feet
    return {value:null, status:"", ok:false};
  }
  if (!/^[\d:.]+$/.test(s)) return {value:null, status:"", ok:false};
  const v = s.split(":").reduce((a,x)=>a*60+parseFloat(x),0);
  return isFinite(v) && v>0 ? {value:v, status:"", ok:true} : {value:null, status:"", ok:false};
}
const fmtMark = (event, v) => v==null ? "" : FIELD.has(event) ? `${Math.floor(v/12)}-${(v%12).toFixed(2).padStart(5,"0")}` : (v>=60 ? `${Math.floor(v/60)}:${(v%60).toFixed(2).padStart(5,"0")}` : v.toFixed(2));
const nk = s => String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();

/* ---------- CSV ---------- */
function parseCSV(text){
  const rows = []; let row = [], cell = "", q = false;
  const src = String(text||"").replace(/\r/g,"");
  const delim = (src.split("\n")[0].match(/\t/g)||[]).length > (src.split("\n")[0].match(/,/g)||[]).length ? "\t" : ",";
  for (let i=0;i<src.length;i++){
    const c = src[i];
    if (q) { if (c==='"' && src[i+1]==='"') { cell+='"'; i++; } else if (c==='"') q=false; else cell+=c; }
    else if (c==='"') q=true; else if (c===delim) { row.push(cell); cell=""; } else if (c==="\n") { row.push(cell); rows.push(row); row=[]; cell=""; } else cell+=c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r=>r.some(x=>String(x).trim()));
}
const COLS = {event:["event","event name"], gender:["gender","sex","division"], round:["round","section"], place:["place","pl","rank"],
  athlete:["athlete","name","athlete name","relay team"], school:["school","team","affiliation"], grade:["grade","gr","yr","year"],
  mark:["mark","time","result","performance","finals","final"], points:["points","pts","score"], relay:["relay"]};
function mapHeader(h){ const out = {}; h.forEach((x,i)=>{ const k = nk(x); for (const [f,al] of Object.entries(COLS)) if (al.includes(k) && out[f]==null) out[f]=i; }); return out; }

/* ---------- schools ---------- */
function findSchool(name){
  const k = nk(name); if (!k) return null;
  return IX.schools.find(s => nk(s.name)===k || nk(s.short)===k || (s.aliases||[]).some(a=>nk(a)===k)) || null;
}
const bcSchool = () => IX.schools.find(s=>nk(s.name)==="benton central");
function bcAthlete(name, level){
  const k = nk(name).split(" ").filter(Boolean); if (!k.length) return null;
  const pool = ATHLETES.filter(a=>a.level===level);
  return (pool.find(a=>nk(a.fullName||a.name)===k.join(" ")) || pool.find(a=>{ const n = nk(a.fullName||a.name).split(" "); return n[0]===k[0] && n[n.length-1]===k[k.length-1]; })) || null;
}

/* ---------- import preview ---------- */
function meetKey(){ return [nk(IX.imp.name), IX.imp.date||"", IX.imp.level].join("|"); }
// Results copied straight from a web page (MileSplit "PLACE ATHLETE TEAM MARK", or "Athlete: Team: Result: Place:" lists).
// Turns them into CSV-style rows so the same preview and save run on them.
const GRADES = {SR:12, JR:11, SO:10, FR:9, "8":8, "7":7};
function looksLikeCSV(t){ const first = String(t||"").trim().split("\n")[0].toLowerCase(); return /(^|[,\t])\s*(event|athlete|name)\s*([,\t]|$)/.test(first) && /[,\t]/.test(first); }
function parsePasted(text){
  const lines = String(text||"").replace(/\r/g,"").replace(/(\d|["'”-])(Boys|Girls) /g, "$1\n$2 ").replace(/More Results/g,"\n").split("\n").map(l=>l.trim());
  const HEAD = /^(?:(Varsity|JV|C?omplete|Results)\s+)?(Boys|Girls)\s+(.+?)(?:\s+(Finals|Prelims|Preliminaries|Final))?$/i;
  const ROW_G = /^(\d+|-|--)\s+(.+?)\s+(SR|JR|SO|FR|7|8)\s+(.+?)\s+(\S+)(?:\s+(\d+))?$/;
  const MARK = String.raw`(\d{1,2}:\d{2}(?:\.\d+)?|\d{1,3}\.\d+|\d+-\d+(?:\.\d+)?|\d+'\s*\d+(?:\.\d+)?"?|DQ|DNF|DNS|NT|NH|FS)`;
  const ROW_END = new RegExp(String.raw`^(\d+|-|--)\s+(.+?)\s+` + MARK + String.raw`(?:\s+(\d+))?$`);          // place first: "1 Name Team 5:12.4 [heat]"
  const ROW_PL_LAST = new RegExp(String.raw`^(.+?)\s+` + MARK + String.raw`\s+(\d+|-)$`);                           // place last: "Name Team 5:12 1"
  // known team names: our schools + aliases, plus any team seen in a row that has a grade
  const teams = new Set(); IX.schools.forEach(s=>{ teams.add(s.name); if (s.short) teams.add(s.short); (s.aliases||[]).forEach(a=>teams.add(a)); });
  lines.forEach(l=>{ const m = l.match(ROW_G); if (m) teams.add(m[4]); });
  const byLen = [...teams].filter(Boolean).sort((a,b)=>b.length-a.length);
  const splitTeam = who => { const t = byLen.find(t => who===t || who.endsWith(" "+t)); return t ? [who===t ? "" : who.slice(0, -t.length-1).trim(), t] : null; };
  const out = [], bad = [], relayN = {}; let ev = null, g = null, rnd = "F", jv = false;
  for (const l of lines) {
    if (!l || /^place\b/i.test(l) || /^athlete:/i.test(l)) continue;
    const h = l.match(HEAD);
    if (h && !/\d\s*\d*$/.test(l.replace(/\d+m\b/gi,"").replace(/\b(100|110|200|300|400|800|1600|3200|4x\d+)\b/gi,""))) {
      jv = /^jv/i.test(h[1]||""); g = /^b/i.test(h[2]) ? "B" : "G"; ev = h[3].trim(); rnd = /^prelim/i.test(h[4]||"") ? "P" : "F"; continue; }
    if (!ev || jv) continue;
    const relay = /relay|4\s*x/i.test(ev);
    const push = (pl, ath, team, gr, mark) => {
      if (relay) { const k = ev+g+rnd+team; relayN[k] = (relayN[k]||0)+1; ath = "ABCDEFGH"[relayN[k]-1]; }
      out.push([ev, g, rnd, /^-/.test(pl) ? "" : pl, ath, team, gr, mark, ""]); };
    let m = !relay && l.match(ROW_G);
    if (m) { push(m[1], m[2], m[4], GRADES[m[3]]||"", m[5]); continue; }
    m = l.match(ROW_END);
    if (m) { const st = relay ? ["", m[2]] : splitTeam(m[2]); if (st) { push(m[1], st[0], st[1], "", m[3]); continue; } }
    m = l.match(ROW_PL_LAST);
    if (m) { const who = m[1].replace(/^-\s+/, ""), st = relay ? ["", who] : splitTeam(who); if (st) { push(m[3], st[0], st[1], "", m[2].replace(/(\d+)'\s*(\d+(?:\.\d+)?)"?/, "$1-$2")); continue; } }
    bad.push(l);
  }
  // drop exact repeats (pages often list an event twice)
  const seen = new Set(), rows = out.filter(r=>{ const k = r.join("|"); if (seen.has(k)) return false; seen.add(k); return true; });
  return {rows: [["event","gender","round","place","athlete","school","grade","mark","points"], ...rows], bad};
}
// Points from places when the results don't list them (ties split the points)
function applyScoring(rows, sc){
  const by = {};
  rows.forEach(r => { if (r.errs.length || r.dupInFile || r.round!=="F" || !r.place) return; const k = r.event+"|"+r.gender; (by[k] = by[k]||{}); (by[k][r.place] = by[k][r.place]||[]).push(r); });
  Object.values(by).forEach(grp => Object.entries(grp).forEach(([pl, rs]) => {
    const P = rs[0].relay ? (sc.relay||sc.ind) : sc.ind;
    const share = rs.reduce((a,_,i)=>a + (P[+pl-1+i]||0), 0) / rs.length;
    rs.forEach(r => { r.points = share || null; });
  }));
}
const SCORING_OPTS = {auto:null, "10-8-6-5-4-3-2-1":{ind:[10,8,6,5,4,3,2,1], relay:[10,8,6,5,4,3,2,1]}, "6-4-3-2-1":{ind:[6,4,3,2,1], relay:[6,4,3,2,1]}, "5-3-1":{ind:[5,3,1], relay:[5]}};
function buildPreview(){
  const p = IX.imp; p.msg = null;
  let rows; p.unread = [];
  if (looksLikeCSV(p.csv)) rows = parseCSV(p.csv);
  else { const r = parsePasted(p.csv); rows = r.rows; p.unread = r.bad; p.pasted = true; }
  if (rows.length < 2) { p.rows = null; p.msg = {kind:"err", text:"Paste at least a header row and one result."}; return; }
  const H = mapHeader(rows[0]);
  const need = ["event","athlete","mark"].filter(f=>H[f]==null);
  if (need.length) { p.rows = null; p.msg = {kind:"err", text:`Missing column${need.length>1?"s":""}: ${need.join(", ")}. The first row needs headers like event, gender, place, athlete, school, grade, mark, points.`}; return; }
  const seen = new Set();
  p.rows = rows.slice(1).map((r,i)=>{
    const g = (f) => H[f]==null ? "" : String(r[H[f]]??"").trim();
    const event = normEvent(g("event")), gender = normGender(g("gender")) || (p.gender!=="row" ? p.gender : null);
    const relay = /^4x/.test(event||"") || /^(y|yes|true|1)$/i.test(g("relay"));
    const m = event ? parseMark(event, g("mark")) : {ok:false};
    const errs = [];
    if (!event) errs.push(`event "${g("event")}"`); if (!gender) errs.push("gender"); if (!m.ok) errs.push(`mark "${g("mark")}"`);
    if (!g("school") && !relay) errs.push("school");
    const place = parseInt(g("place"),10), grade = parseInt(g("grade"),10), points = parseFloat(g("points"));
    const round = /^p/i.test(g("round")) ? "P" : /^h/i.test(g("round")) ? "H" : "F";
    const school = g("school") || (relay ? g("athlete") : "");
    const key = [meetKey(), event, gender, round, nk(g("athlete")), nk(school), nk(g("mark"))].join("|");
    const dupInFile = seen.has(key); seen.add(key);
    return {n:i+2, raw:Object.fromEntries(rows[0].map((h,j)=>[h, r[j]??""])), event, gender, round, place:isFinite(place)?place:null, athlete:g("athlete"), school,
      grade:isFinite(grade)?grade:null, mark:g("mark"), value:m.value, status:m.status||"", points:isFinite(points)?points:null, relay, key, errs, dupInFile};
  });
  if (p.scoring && p.scoring!=="auto" && SCORING_OPTS[p.scoring] && !p.rows.some(r=>r.points!=null)) { applyScoring(p.rows, SCORING_OPTS[p.scoring]); p.scoredBy = p.scoring; } else p.scoredBy = null;
  // unknown schools: start as "new"
  const names = [...new Set(p.rows.filter(r=>!r.errs.length).map(r=>r.school).filter(Boolean))];
  names.forEach(n => { if (!findSchool(n) && !(nk(n) in p.map)) p.map[nk(n)] = "new"; });
  Object.keys(p.map).forEach(k => { if (!names.some(n=>nk(n)===k)) delete p.map[k]; });
  if (!p.name) p.msg = {kind:"err", text:"Fill in the meet name above before saving."};
}
function inferScoring(rows){
  const tally = {ind:{}, relay:{}};
  rows.filter(r=>r.place && r.points>0 && r.round!=="P").forEach(r=>{ const t = tally[r.relay?"relay":"ind"]; (t[r.place] = t[r.place]||{})[r.points] = ((t[r.place]||{})[r.points]||0)+1; });
  const pick = t => { const out = []; for (let pl=1; pl<=12; pl++){ const c = t[pl]; if (!c) break; out.push(+Object.entries(c).sort((a,b)=>b[1]-a[1])[0][0]); } return out; };
  const ind = pick(tally.ind), relay = pick(tally.relay), n = rows.filter(r=>r.points>0).length;
  return ind.length ? {ind, relay: relay.length ? relay : ind, inferred:true, basis:`${n} scoring rows`} : null;
}

/* ---------- Supabase helpers ---------- */
async function fetchAll(build){ const out = []; for (let from=0;;from+=1000){ const {data, error} = await build().range(from, from+999); if (error) throw error; out.push(...data); if (data.length<1000) return out; } }
async function ixLoad(force){
  if (!SB || !canPost) return;
  if (IX.loading || (IX.loaded && !force)) return;
  IX.loading = true; IX.err = "";
  try {
    IX.schools = await fetchAll(()=>SB.from("schools").select("*").order("name"));
    IX.meets = await fetchAll(()=>SB.from("meets").select("*").order("meet_date",{ascending:false}));
    IX.batches = await fetchAll(()=>SB.from("import_batches").select("*").order("created_at",{ascending:false}));
    try { IX.flags = await fetchAll(()=>SB.from("athlete_flags").select("*")); IX.flagsMissing = false; } catch(e) { IX.flags = []; IX.flagsMissing = true; }
    const ids = await fetchAll(()=>SB.from("results").select("meet_id,school_id"));
    IX.counts = {meet:{}, school:{}}; ids.forEach(r=>{ IX.counts.meet[r.meet_id]=(IX.counts.meet[r.meet_id]||0)+1; IX.counts.school[r.school_id]=(IX.counts.school[r.school_id]||0)+1; });
    IX.loaded = true;
  } catch(e) {
    IX.err = /relation .* does not exist|schema cache/i.test(e.message||"") ? "The scouting tables aren't set up yet. Run supabase/migrations/001_scouting.sql in Supabase first." : "Couldn't load scouting data: " + (e.message||e);
  }
  IX.loading = false; render();
}
async function ixSave(){
  const p = IX.imp; if (!p.rows || p.saving) return;
  if (!p.name.trim()) { p.msg = {kind:"err", text:"Fill in the meet name first."}; render(); return; }
  const good = p.rows.filter(r=>!r.errs.length && !r.dupInFile);
  if (!good.length) { p.msg = {kind:"err", text:"No rows are ready to save."}; render(); return; }
  p.saving = true; p.msg = {kind:"", text:"Saving…"}; render();
  try {
    // 1. meet: find or create
    let meet = IX.meets.find(m => nk(m.name)===nk(p.name) && (m.meet_date||"")===(p.date||"") && m.level===p.level);
    const mrow = {name:p.name.trim(), meet_date:p.date||null, season:p.date?+p.date.slice(0,4):null, level:p.level, meet_type:p.type||null, host:p.host||null, source_url:p.url||null, source_note:p.note||null, created_by:coachEmail};
    if (!meet) { const {data, error} = await SB.from("meets").insert(mrow).select().single(); if (error) throw error; meet = data; }
    else { const {error} = await SB.from("meets").update({meet_type:mrow.meet_type, host:mrow.host, source_url:mrow.source_url||meet.source_url, source_note:mrow.source_note||meet.source_note}).eq("id", meet.id); if (error) throw error; }
    // 2. schools: create new ones, add aliases for mapped ones
    for (const [k, v] of Object.entries(p.map)) {
      const name = good.find(r=>nk(r.school)===k)?.school; if (!name) continue;
      if (v==="new") { if (!findSchool(name)) { const {data, error} = await SB.from("schools").insert({name}).select().single(); if (error) throw error; IX.schools.push(data); } }
      else { const s = IX.schools.find(x=>String(x.id)===String(v)); if (s && !findSchool(name)) { const aliases = [...(s.aliases||[]), name]; const {error} = await SB.from("schools").update({aliases}).eq("id", s.id); if (error) throw error; s.aliases = aliases; } }
    }
    // 3. batch
    const {data:batch, error:be} = await SB.from("import_batches").insert({meet_id:meet.id, source:p.url||p.note||"paste", filename:p.file||null, rows_in:p.rows.length, errors:p.rows.filter(r=>r.errs.length).length, created_by:coachEmail}).select().single();
    if (be) throw be;
    // 4. results, skipping anything already imported
    const bc = bcSchool();
    const recs = good.map(r => { const s = findSchool(r.school); const a = s && bc && s.id===bc.id && !r.relay ? bcAthlete(r.athlete, p.level) : null;
      return {meet_id:meet.id, batch_id:batch.id, event:r.event, gender:r.gender, round:r.round, place:r.place, athlete:r.athlete||null, school_id:s?s.id:null, grade:r.grade,
        mark:r.mark, mark_value:r.value, status:r.status||null, points:r.points, relay:r.relay, bc_athlete_id:a?a.id:null, source_row:r.raw, dedupe_key:r.key}; });
    let inserted = 0;
    for (let i=0;i<recs.length;i+=500){
      const {data, error} = await SB.from("results").upsert(recs.slice(i,i+500), {onConflict:"dedupe_key", ignoreDuplicates:true}).select("id");
      if (error) throw error; inserted += data.length;
    }
    const dups = recs.length - inserted;
    await SB.from("import_batches").update({inserted, duplicates:dups}).eq("id", batch.id);
    // 5. scoring: keep what's set, otherwise infer from the points column
    if (!meet.scoring) { const sc = p.scoredBy ? {...SCORING_OPTS[p.scoredBy], inferred:false, basis:"chosen at import"} : inferScoring(good); if (sc) await SB.from("meets").update({scoring:sc}).eq("id", meet.id); }
    p.saving = false;
    p.msg = {kind:"ok", text:`Saved to "${meet.name}": ${inserted} new result${inserted===1?"":"s"}${dups?`, ${dups} already in the system (skipped)`:""}${p.rows.length-good.length?`, ${p.rows.length-good.length} row${p.rows.length-good.length===1?"":"s"} with problems not saved`:""}.`};
    p.rows = null; p.csv = ""; p.file = ""; p.map = {}; p.pasted = false; p.unread = [];
    IX.loaded = false; IX.all = null; await ixLoad(true);
  } catch(e) { p.saving = false; p.msg = {kind:"err", text:"Save failed: " + (e.message||e)}; render(); }
}
async function ixResults(){
  const f = IX.rf; if (!f.meet && !f.school && !f.event) { f.rows = null; render(); return; }
  f.loading = true; render();
  try {
    f.rows = await fetchAll(()=>{ let q = SB.from("results").select("*").order("event").order("gender").order("round").order("place",{nullsFirst:false});
      if (f.meet) q = q.eq("meet_id", f.meet); if (f.event) q = q.eq("event", f.event); if (f.gender) q = q.eq("gender", f.gender); if (f.school) q = q.eq("school_id", f.school); return q; });
  } catch(e) { IX.msg = {kind:"err", text:e.message||String(e)}; }
  f.loading = false; render();
}
async function ixFix(id){
  const e = IX.edit; if (!e) return;
  const r = IX.rf.rows.find(x=>x.id===id); const m = parseMark(r.event, e.mark);
  if (!m.ok) { IX.msg = {kind:"err", text:`"${e.mark}" isn't a mark I can read.`}; render(); return; }
  const s = e.school ? findSchool(e.school) : null;
  if (e.school && !s) { IX.msg = {kind:"err", text:`No school called "${e.school}". Add it on the Schools tab first, or use an existing name.`}; render(); return; }
  const upd = {place: e.place===""?null:+e.place, athlete:e.athlete||null, school_id:s?s.id:r.school_id, grade:e.grade===""?null:+e.grade, mark:e.mark, mark_value:m.value, status:m.status||null,
    points:e.points===""?null:+e.points, corrected_by:coachEmail, corrected_at:new Date().toISOString(), correction_note:e.note||null};
  const {error} = await SB.from("results").update(upd).eq("id", id);
  if (error) { IX.msg = {kind:"err", text:error.message}; render(); return; }
  Object.assign(r, upd); IX.edit = null; IX.msg = {kind:"ok", text:"Fixed. The original import row is still kept with the result."}; render();
}
async function ixDelResult(id){
  const {error} = await SB.from("results").delete().eq("id", id);
  if (error) { IX.msg = {kind:"err", text:error.message}; } else { IX.rf.rows = IX.rf.rows.filter(x=>x.id!==id); IX.msg = {kind:"ok", text:"Result removed."}; }
  IX.del = null; render();
}
async function ixSaveMeet(id){
  const e = IX.medit; const sc = String(e.scoring||"").trim();
  const nums = s => s.split(/[\s,\-–]+/).map(Number).filter(x=>isFinite(x)&&x>0);
  const scoring = sc ? {ind:nums(sc.split("|")[0]), relay:nums(sc.split("|")[1]||sc.split("|")[0]), inferred:false, basis:"set by coach"} : null;
  const {error} = await SB.from("meets").update({name:e.name, meet_date:e.date||null, season:e.date?+e.date.slice(0,4):null, level:e.level, meet_type:e.type||null, host:e.host||null, source_url:e.url||null, source_note:e.note||null, scoring}).eq("id", id);
  if (error) { IX.msg = {kind:"err", text:error.message}; render(); return; }
  IX.medit = null; IX.msg = {kind:"ok", text:"Meet saved."}; IX.loaded = false; ixLoad(true);
}
async function ixDelMeet(id){
  const {error} = await SB.from("meets").delete().eq("id", id);
  IX.del = null; IX.msg = error ? {kind:"err", text:error.message} : {kind:"ok", text:"Meet and its results deleted."}; IX.loaded = false; ixLoad(true);
}
async function ixSaveSchool(id){
  const e = IX.sedit;
  const {error} = await SB.from("schools").update({name:e.name.trim(), short:e.short||null, conference:e.conference||null, aliases:e.aliases.split(",").map(x=>x.trim()).filter(Boolean)}).eq("id", id);
  if (error) { IX.msg = {kind:"err", text:/duplicate/.test(error.message) ? "Another school already has that name. Use Merge instead." : error.message}; render(); return; }
  IX.sedit = null; IX.msg = {kind:"ok", text:"School saved."}; IX.loaded = false; ixLoad(true);
}
async function ixMerge(fromId, toId){
  const a = IX.schools.find(s=>s.id===fromId), b = IX.schools.find(s=>String(s.id)===String(toId)); if (!a || !b || a.id===b.id) return;
  let r = await SB.from("results").update({school_id:b.id}).eq("school_id", a.id); if (r.error) { IX.msg = {kind:"err", text:r.error.message}; render(); return; }
  r = await SB.from("schools").update({aliases:[...new Set([...(b.aliases||[]), a.name, ...(a.aliases||[])])]}).eq("id", b.id); if (r.error) { IX.msg = {kind:"err", text:r.error.message}; render(); return; }
  r = await SB.from("schools").delete().eq("id", a.id);
  IX.merge = null; IX.msg = r.error ? {kind:"err", text:r.error.message} : {kind:"ok", text:`Merged "${a.name}" into "${b.name}". Its old name is now an alias.`}; IX.loaded = false; ixLoad(true);
}
function readFile(input){
  const f = input.files && input.files[0]; if (!f) return;
  const rd = new FileReader(); rd.onload = () => { IX.imp.csv = String(rd.result||""); IX.imp.file = f.name; buildPreview(); render(); }; rd.readAsText(f);
}
const TEMPLATE = "event,gender,round,place,athlete,school,grade,mark,points\n1600,G,F,1,Jane Runner,West Lafayette,11,5:12.40,10\n1600,G,F,2,Lillian Weigle,Benton Central,9,5:15.02,8\nLong Jump,B,F,1,Sam Jumper,Western,12,21-04.50,10\n4x400,G,F,1,A,Hamilton Heights,,4:05.11,10\n";
function downloadTemplate(){ const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(TEMPLATE); a.download = "scouting-results-template.csv"; a.click(); }

/* ---------- view ---------- */
const evLabel = e => (EV_NAME && EV_NAME[e]) || e;
const schoolName = id => (IX.schools.find(s=>s.id===id)||{}).name || "—";
const msgHTML = m => m ? `<p class="ed-msg ${m.kind}" role="status" style="margin:0">${esc(m.text)}</p>` : "";
const fld = (id, label, val, oninput, type="text", ph="") => `<label class="ed-row" for="${id}"><span>${label}</span><input id="${id}" type="${type}" value="${esc(val)}" placeholder="${esc(ph)}" oninput="${oninput}"></label>`;
const scoringTxt = sc => sc && sc.ind && sc.ind.length ? `${sc.ind.join("-")}${sc.relay && sc.relay.join()!==sc.ind.join() ? " · relays "+sc.relay.join("-") : ""}${sc.inferred?" (from results)":""}` : "—";

function importView(){
  const p = IX.imp;
  const types = ["conference","sectional","regional","invite","dual","tri","quad","state","other"];
  const ready = p.rows ? p.rows.filter(r=>!r.errs.length && !r.dupInFile) : [];
  const bad = p.rows ? p.rows.filter(r=>r.errs.length) : [];
  const existing = p.rows && IX.meets.find(m => nk(m.name)===nk(p.name) && (m.meet_date||"")===(p.date||"") && m.level===p.level);
  const newSchools = Object.entries(p.map);
  return `<div class="panel ed ix"><h2>1 · The meet</h2>
      <div class="ix-grid">
        ${fld("ix-name","Meet name",p.name,"IX.imp.name=this.value","text","Hoosier Conference")}
        ${fld("ix-date","Date",p.date,"IX.imp.date=this.value","date")}
        <label class="ed-row" for="ix-level"><span>Level</span><select id="ix-level" onchange="IX.imp.level=this.value">${["HS","JH"].map(x=>`<option ${p.level===x?"selected":""}>${x}</option>`).join("")}</select></label>
        <label class="ed-row" for="ix-type"><span>Type</span><select id="ix-type" onchange="IX.imp.type=this.value">${types.map(x=>`<option ${p.type===x?"selected":""}>${x}</option>`).join("")}</select></label>
        ${fld("ix-host","Host",p.host,"IX.imp.host=this.value","text","optional")}
        ${fld("ix-url","Source link",p.url,"IX.imp.url=this.value","url","where the results came from")}
        ${fld("ix-note","Source note",p.note,"IX.imp.note=this.value","text","e.g. Hy-Tek PDF from AD")}
        <label class="ed-row" for="ix-sc"><span>Scoring</span><select id="ix-sc" onchange="IX.imp.scoring=this.value;if(IX.imp.rows)IX.preview()">${Object.keys(SCORING_OPTS).map(k=>`<option value="${k}" ${p.scoring===k?"selected":""}>${k==="auto"?"From the points column / set later":k==="5-3-1"?"5-3-1, relays 5 (dual)":k==="6-4-3-2-1"?"6-4-3-2-1 (tri/quad)":k+" (conference, sectional, invite)"}</option>`).join("")}</select></label>
        <label class="ed-row" for="ix-g"><span>Gender</span><select id="ix-g" onchange="IX.imp.gender=this.value;if(IX.imp.csv)IX.preview()"><option value="row" ${p.gender==="row"?"selected":""}>From the gender column</option><option value="B" ${p.gender==="B"?"selected":""}>All boys</option><option value="G" ${p.gender==="G"?"selected":""}>All girls</option></select></label>
      </div></div>
    <div class="panel ed ix"><div class="bar"><h2>2 · The results</h2><button type="button" class="btn sm" onclick="IX.template()">Download CSV template</button></div>
      <p style="margin:0"><b>Fastest:</b> open the results page (MileSplit or similar), select all (Ctrl+A), copy (Ctrl+C), and paste it below. Then <b>Check rows</b>. A CSV with columns <b>event, gender, round, place, athlete, school, grade, mark, points</b> also works.</p>
      <label class="ed-row" for="ix-file"><span>CSV file</span><input id="ix-file" type="file" accept=".csv,.txt,.tsv,text/csv" onchange="IX.readFile(this)"></label>
      <textarea id="ix-csv" rows="8" aria-label="Paste results" placeholder="Paste the copied results page here" oninput="IX.imp.csv=this.value">${esc(p.csv)}</textarea>
      <div class="ed-save"><button type="button" class="btn" onclick="IX.preview()">Check rows</button>${p.file?`<span class="muted">${esc(p.file)}</span>`:""}</div>
      ${msgHTML(p.msg)}</div>
    ${p.rows ? `<div class="panel ix"><h2>3 · Check and save</h2>
      <p style="margin:0 0 8px"><span class="ix-pill ok">${ready.length} ready</span>${bad.length?`<span class="ix-pill err">${bad.length} with problems</span>`:""}${p.rows.filter(r=>r.dupInFile).length?`<span class="ix-pill">${p.rows.filter(r=>r.dupInFile).length} repeated in this file</span>`:""}
        ${existing?`<span class="ix-pill">Adds to existing meet · ${IX.counts.meet[existing.id]||0} results already there; duplicates are skipped</span>`:""}</p>
      ${newSchools.length ? `<div class="panel" style="padding:10px 14px"><b>Schools not in the system yet.</b> Add each as new, or match it to a school you already have (it becomes an alias).
        <div class="ix-grid" style="margin-top:8px">${newSchools.map(([k,v])=>{ const nm = p.rows.find(r=>nk(r.school)===k)?.school || k;
          return `<label class="ed-row"><span>${esc(nm)}</span><select onchange="IX.imp.map['${esc(k)}']=this.value"><option value="new" ${v==="new"?"selected":""}>Add as a new school</option>
            ${IX.schools.map(s=>`<option value="${s.id}" ${String(v)===String(s.id)?"selected":""}>Same as ${esc(s.name)}</option>`).join("")}</select></label>`; }).join("")}</div></div>` : ""}
      ${p.pasted ? `<p class="note" style="margin:0 0 6px">Read from pasted text: ${ready.length} results.${p.unread && p.unread.length ? ` <b>${p.unread.length} line${p.unread.length===1?"":"s"} couldn't be read</b> (usually headers or ads): <span class="mono">${p.unread.slice(0,4).map(esc).join(" · ")}${p.unread.length>4?" …":""}</span>` : ""}</p>` : ""}
      ${p.scoredBy ? `<p class="note" style="margin:0 0 6px">Points filled in from places using <b>${esc(p.scoredBy)}</b> (finals only, ties split).</p>` : ""}
      ${(()=>{ const sc = inferScoring(ready); return sc ? `<p class="note" style="margin:8px 0">Scoring from the points column: <b>${sc.ind.join("-")}</b>${sc.relay.join()!==sc.ind.join()?`, relays <b>${sc.relay.join("-")}</b>`:""}.</p>` : `<p class="note" style="margin:8px 0">No points column, so scoring will be worked out later from team totals.</p>`; })()}
      <div class="tbl"><table class="ix-tbl"><thead><tr><th>Row</th><th>Event</th><th>G</th><th>Rd</th><th>Pl</th><th>Athlete</th><th>School</th><th>Gr</th><th>Mark</th><th>Read as</th><th>Pts</th><th>Problem</th></tr></thead><tbody>
        ${p.rows.slice(0,400).map(r=>`<tr class="${r.errs.length?"ix-bad":r.dupInFile?"ix-dup":""}"><td>${r.n}</td><td>${esc(r.event?evLabel(r.event):"?")}</td><td>${r.gender||"?"}</td><td>${r.round}</td><td>${r.place??""}</td>
          <td>${esc(r.athlete)}</td><td>${esc(r.school)}${r.school && !findSchool(r.school)?` <span class="ix-pill new">new</span>`:""}</td><td>${r.grade??""}</td><td class="mono">${esc(r.mark)}</td>
          <td class="mono">${r.status||esc(r.event?fmtMark(r.event, r.value):"")}</td><td>${r.points??""}</td><td class="wrap">${r.errs.length?"Can't read "+esc(r.errs.join(", ")):r.dupInFile?"Repeated row":""}</td></tr>`).join("")}
      </tbody></table></div>${p.rows.length>400?`<p class="note">Showing the first 400 of ${p.rows.length} rows.</p>`:""}
      <div class="ed-save"><button type="button" class="btn primary" onclick="IX.save()" ${p.saving||!ready.length?"disabled":""}>${p.saving?"Saving…":`Save ${ready.length} result${ready.length===1?"":"s"}`}</button>
        <button type="button" class="btn" onclick="IX.imp.rows=null;render()">Cancel</button></div>${msgHTML(p.msg)}</div>` : ""}`;
}
function meetsView(){
  if (!IX.meets.length) return `<div class="panel"><p style="margin:0">No meets yet. Start on the Import tab.</p></div>`;
  return `<div class="tbl"><table class="ix-tbl"><thead><tr><th>Meet</th><th>Date</th><th>Lvl</th><th>Type</th><th>Results</th><th>Scoring</th><th>Source</th><th></th></tr></thead><tbody>
    ${IX.meets.map(m=>{ const e = IX.medit && IX.medit.id===m.id ? IX.medit : null;
      if (e) return `<tr class="ix-edit"><td><input value="${esc(e.name)}" oninput="IX.medit.name=this.value"></td><td><input type="date" value="${esc(e.date)}" oninput="IX.medit.date=this.value"></td>
        <td><input value="${esc(e.level)}" oninput="IX.medit.level=this.value.toUpperCase()" style="width:44px"></td><td><input value="${esc(e.type)}" oninput="IX.medit.type=this.value"></td><td>${IX.counts.meet[m.id]||0}</td>
        <td><input value="${esc(e.scoring)}" placeholder="10-8-6-5-4-3-2-1 | 10-8-6-4-2" oninput="IX.medit.scoring=this.value"></td><td><input value="${esc(e.url)}" placeholder="link" oninput="IX.medit.url=this.value"></td>
        <td><button type="button" class="btn sm primary" onclick="IX.saveMeet(${m.id})">Save</button><button type="button" class="btn sm" onclick="IX.medit=null;render()">Cancel</button></td></tr>`;
      const bs = IX.batches.filter(b=>b.meet_id===m.id);
      return `<tr><td><b>${esc(m.name)}</b>${bs.length?`<div class="muted" style="font-size:12px">${bs.length} import${bs.length===1?"":"s"} · last by ${esc((bs[0].created_by||"").split("@")[0])} ${esc((bs[0].created_at||"").slice(0,10))}</div>`:""}</td>
        <td>${esc(m.meet_date||"—")}</td><td>${m.level}</td><td>${esc(m.meet_type||"—")}</td><td><a href="#coaches" onclick="IX.tab='results';IX.rf={meet:'${m.id}',event:'',gender:'',school:'',rows:null};IX.loadResults();return false">${IX.counts.meet[m.id]||0}</a></td>
        <td>${esc(scoringTxt(m.scoring))}</td><td class="wrap">${m.source_url?`<a href="${esc(m.source_url)}" target="_blank" rel="noopener">link ↗</a>`:""} ${esc(m.source_note||"")}</td>
        <td>${IX.del==="m"+m.id?`<button type="button" class="btn sm danger" onclick="IX.delMeet(${m.id})">Delete meet + results</button><button type="button" class="btn sm" onclick="IX.del=null;render()">Cancel</button>`
          :`<button type="button" class="btn sm" onclick="IX.medit={id:${m.id},name:${esc(JSON.stringify(m.name))},date:'${m.meet_date||""}',level:'${m.level}',type:'${m.meet_type||""}',url:${esc(JSON.stringify(m.source_url||""))},note:${esc(JSON.stringify(m.source_note||""))},host:${esc(JSON.stringify(m.host||""))},scoring:${esc(JSON.stringify(m.scoring&&m.scoring.ind?m.scoring.ind.join("-")+(m.scoring.relay?" | "+m.scoring.relay.join("-"):""):""))}};render()">Edit</button><button type="button" class="btn sm" onclick="IX.del='m${m.id}';render()">Delete</button>`}</td></tr>`; }).join("")}
  </tbody></table></div>`;
}
function resultsView(){
  const f = IX.rf, evs = EV_ORDER;
  const sel = (id, label, cur, opts, key) => `<label class="ed-row" for="${id}"><span>${label}</span><select id="${id}" onchange="IX.rf.${key}=this.value;IX.loadResults()"><option value="">All</option>${opts.map(([v,l])=>`<option value="${v}" ${String(cur)===String(v)?"selected":""}>${esc(l)}</option>`).join("")}</select></label>`;
  const rows = f.rows || [];
  return `<div class="panel ed ix"><div class="ix-grid">
      ${sel("rf-m","Meet",f.meet,IX.meets.map(m=>[m.id, `${m.name} ${m.meet_date||""} ${m.level}`]),"meet")}
      ${sel("rf-e","Event",f.event,evs.map(e=>[e, evLabel(e)]),"event")}
      ${sel("rf-g","Gender",f.gender,[["B","Boys"],["G","Girls"]],"gender")}
      ${sel("rf-s","School",f.school,IX.schools.map(s=>[s.id, s.name]),"school")}</div>
      <p class="note" style="margin:0">Pick a meet, event, or school. Tap <b>Fix</b> to correct a row; the original import is kept.</p>${msgHTML(IX.msg)}</div>
    ${f.loading ? `<p class="note">Loading…</p>` : f.rows ? (rows.length ? `<div class="tbl"><table class="ix-tbl"><thead><tr><th>Meet</th><th>Event</th><th>G</th><th>Rd</th><th>Pl</th><th>Athlete</th><th>School</th><th>Gr</th><th>Mark</th><th>Pts</th><th></th></tr></thead><tbody>
      ${rows.map(r=>{ const e = IX.edit && IX.edit.id===r.id ? IX.edit : null; const m = IX.meets.find(x=>x.id===r.meet_id)||{};
        if (e) return `<tr class="ix-edit"><td>${esc(m.name||"")}</td><td>${esc(evLabel(r.event))}</td><td>${r.gender}</td><td>${r.round}</td>
          <td><input value="${esc(e.place)}" oninput="IX.edit.place=this.value" style="width:44px"></td><td><input value="${esc(e.athlete)}" oninput="IX.edit.athlete=this.value"></td>
          <td><input value="${esc(e.school)}" list="ix-schools" oninput="IX.edit.school=this.value"></td><td><input value="${esc(e.grade)}" oninput="IX.edit.grade=this.value" style="width:44px"></td>
          <td><input value="${esc(e.mark)}" oninput="IX.edit.mark=this.value"></td><td><input value="${esc(e.points)}" oninput="IX.edit.points=this.value" style="width:50px"></td>
          <td><input value="${esc(e.note)}" placeholder="why" oninput="IX.edit.note=this.value"><button type="button" class="btn sm primary" onclick="IX.fix(${r.id})">Save</button><button type="button" class="btn sm" onclick="IX.edit=null;render()">Cancel</button></td></tr>`;
        return `<tr><td>${esc(m.name||"")} <span class="muted">${esc((m.meet_date||"").slice(0,4))}</span></td><td>${esc(evLabel(r.event))}</td><td>${r.gender}</td><td>${r.round}</td><td>${r.place??""}</td>
          <td>${esc(r.athlete||"")}${r.bc_athlete_id?` <a href="#a-${r.bc_athlete_id}" class="ix-pill ok">BC</a>`:""}</td><td>${esc(schoolName(r.school_id))}</td><td>${r.grade??""}</td>
          <td class="mono">${esc(r.status||r.mark||"")}${r.corrected_at?` <span class="ix-pill" title="${esc((r.correction_note||"")+" · "+(r.corrected_by||""))}">fixed</span>`:""}</td><td>${r.points??""}</td>
          <td>${IX.del==="r"+r.id?`<button type="button" class="btn sm danger" onclick="IX.delResult(${r.id})">Remove</button><button type="button" class="btn sm" onclick="IX.del=null;render()">Cancel</button>`
            :`<button type="button" class="btn sm" onclick="IX.edit=${esc(JSON.stringify({id:r.id, place:r.place??"", athlete:r.athlete||"", school:schoolName(r.school_id)==="—"?"":schoolName(r.school_id), grade:r.grade??"", mark:r.mark||r.status||"", points:r.points??"", note:""}))};render()">Fix</button><button type="button" class="btn sm" onclick="IX.del='r${r.id}';render()">Remove</button>`}</td></tr>`; }).join("")}
      </tbody></table></div><datalist id="ix-schools">${IX.schools.map(s=>`<option value="${esc(s.name)}">`).join("")}</datalist><p class="note">${rows.length} result${rows.length===1?"":"s"}.</p>` : `<p class="note">No results match.</p>`) : ""}`;
}
function schoolsView(){
  if (!IX.schools.length) return `<div class="panel"><p style="margin:0">No schools yet.</p></div>`;
  return `<p class="note" style="margin:0">Same school under two names? Use <b>Merge</b>: results move over and the old name becomes an alias, so future imports match it automatically.</p>${msgHTML(IX.msg)}
    <div class="tbl"><table class="ix-tbl"><thead><tr><th>School</th><th>Short</th><th>Conference</th><th>Also called</th><th>Results</th><th></th></tr></thead><tbody>
    ${IX.schools.map(s=>{ const e = IX.sedit && IX.sedit.id===s.id ? IX.sedit : null;
      if (e) return `<tr class="ix-edit"><td><input value="${esc(e.name)}" oninput="IX.sedit.name=this.value"></td><td><input value="${esc(e.short)}" oninput="IX.sedit.short=this.value" style="width:70px"></td>
        <td><input value="${esc(e.conference)}" oninput="IX.sedit.conference=this.value"></td><td><input value="${esc(e.aliases)}" placeholder="comma separated" oninput="IX.sedit.aliases=this.value"></td><td>${IX.counts.school[s.id]||0}</td>
        <td><button type="button" class="btn sm primary" onclick="IX.saveSchool(${s.id})">Save</button><button type="button" class="btn sm" onclick="IX.sedit=null;render()">Cancel</button></td></tr>`;
      return `<tr><td><b>${esc(s.name)}</b></td><td>${esc(s.short||"")}</td><td>${esc(s.conference||"")}</td><td class="wrap">${esc((s.aliases||[]).join(", "))}</td><td>${IX.counts.school[s.id]||0}</td>
        <td>${IX.merge===s.id ? `<select onchange="if(this.value)IX.doMerge(${s.id}, this.value)"><option value="">Merge into…</option>${IX.schools.filter(x=>x.id!==s.id).map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("")}</select><button type="button" class="btn sm" onclick="IX.merge=null;render()">Cancel</button>`
          : `<button type="button" class="btn sm" onclick="IX.sedit=${esc(JSON.stringify({id:s.id, name:s.name, short:s.short||"", conference:s.conference||"", aliases:(s.aliases||[]).join(", ")}))};render()">Edit</button><button type="button" class="btn sm" onclick="IX.merge=${s.id};render()">Merge</button>`}</td></tr>`; }).join("")}
    </tbody></table></div>`;
}

/* ---------- Phase 2: Scouting dashboard ----------
   Pick an upcoming meet → who's in it → project every event from best marks (2026 results + our current roster PRs),
   with last year's seniors removed. Shows projected team scores, each event's top places, and where BC is closest to more points. */
IX.d = {meet:"", g:"G", grad:true, entries:"", open:null};
IX.all = null;
async function ixAll(){
  if (IX.all || IX.allLoading) return; IX.allLoading = true;
  try { IX.all = await fetchAll(()=>SB.from("results").select("id,meet_id,event,gender,round,place,athlete,school_id,grade,mark_value,status,relay,bc_athlete_id")); }
  catch(e){ IX.err = "Couldn't load results: " + (e.message||e); }
  GRADE_FILL = null; IX.allLoading = false; render();
}
const LOWER = ev => !FIELD.has(ev);
const better = (ev, a, b) => LOWER(ev) ? a < b : a > b;
const DASH_EV = ["100","200","400","800","1600","3200","100H","110H","300H","4x100","4x400","4x800","HJ","LJ","PV","SP","DT"];
const evFor = g => DASH_EV.filter(e => !(g==="G" && e==="110H") && !(g==="B" && e==="100H"));
function scheduleMeets(){
  const out = [];
  (typeof SCHEDULE!=="undefined" ? SCHEDULE : []).filter(m=>m.level==="HS" && !/indoor|regional|hsr/i.test(m.meet)).forEach(m => {
    const name = m.meet.replace(/\s*\*[^*]+\*/g,"").trim();
    let type = /conference/i.test(name) ? "conference" : /sectional/i.test(name) ? "sectional" : /invitational|invite/i.test(name) ? "invite" : null;
    let schools = [], missing = [], tmpl = null;
    if (type==="conference" || type==="sectional") {
      tmpl = IX.meets.filter(x=>x.meet_type===type && x.level==="HS").sort((a,b)=>(b.meet_date||"").localeCompare(a.meet_date||""))
        .find(x => type!=="sectional" || !/girls|boys/i.test(name) || new RegExp(/girls/i.test(name)?"girls":"boys","i").test(x.name));
      if (tmpl) schools = [...new Set((IX.all||[]).filter(r=>r.meet_id===tmpl.id).map(r=>r.school_id))].filter(Boolean);
    } else {
      name.split(/\s*(?:\/|,|\bvs\.?\b|&)\s*/i).map(s=>s.trim()).filter(Boolean).forEach(p => { const s = findSchool(p); if (s) schools.push(s.id); else if (!/^(bc|benton central)$/i.test(p)) missing.push(p); });
    }
    const bc = bcSchool(); if (bc && !schools.includes(bc.id)) schools.push(bc.id);
    const n = schools.length;
    if (!type) type = n<=2 ? "dual" : n===3 ? "tri" : n===4 ? "quad" : "invite";
    // scoring: from the matching 2026 meet if we have one, else the defaults
    if (!tmpl) tmpl = IX.meets.filter(x=>x.level==="HS" && x.meet_type!=="conference" && x.meet_type!=="sectional").map(x=>{ const ids = new Set((IX.all||[]).filter(r=>r.meet_id===x.id).map(r=>r.school_id)); return {x, hit: schools.filter(s=>ids.has(s)).length}; })
      .filter(o=>o.hit>=Math.min(2,n)).sort((a,b)=>b.hit-a.hit)[0]?.x || null;
    const sc = tmpl && tmpl.scoring && tmpl.scoring.ind ? tmpl.scoring : type==="dual" ? {ind:[5,3,1], relay:[5]} : (type==="tri"||type==="quad") ? {ind:[6,4,3,2,1], relay:[6,4,3,2,1]} : {ind:[10,8,6,5,4,3,2,1], relay:[10,8,6,5,4,3,2,1]};
    const gOnly = /girls/i.test(name) && !/boys/i.test(name) ? "G" : /boys/i.test(name) && !/girls/i.test(name) ? "B" : null;
    out.push({key:m.date+"|"+name, date:m.date, name, type, schools, missing, sc, gOnly, tmpl, entries: (type==="conference"||type==="sectional"||type==="invite") ? 2 : 3});
  });
  return out;
}
// Best mark per athlete (or per relay team) in an event, for the chosen schools
// Opponents a coach marked as not returning
const isGone = (schoolId, name) => (IX.flags||[]).some(f => f.school_id===schoolId && f.athlete_key===nk(name) && f.status==="gone");
async function markGone(schoolId, name){
  if (IX.flagsMissing) { IX.msg = {kind:"err", text:"Run supabase/migrations/003_scouting_not_returning.sql in Supabase first."}; render(); return; }
  const {data, error} = await SB.from("athlete_flags").insert({school_id:schoolId, athlete:name, athlete_key:nk(name), status:"gone", created_by:coachEmail}).select().single();
  if (error) { IX.msg = {kind:"err", text:error.message}; } else { IX.flags.push(data); IX.msg = {kind:"ok", text:`${name} marked not returning.`}; }
  render();
}
async function unGone(id){
  const {error} = await SB.from("athlete_flags").delete().eq("id", id);
  if (error) { IX.msg = {kind:"err", text:error.message}; } else { IX.flags = IX.flags.filter(f=>f.id!==id); IX.msg = {kind:"ok", text:"Back in the projections."}; }
  render();
}
// Relay adjustments: key "4x800|G" per school. adj_mark = new projected time; empty = not a factor.
const relayKey = (ev, g) => ev+"|"+g;
const relayFlag = (schoolId, ev, g) => (IX.flags||[]).find(f => f.status==="relay" && f.school_id===schoolId && f.athlete_key===nk(relayKey(ev,g)));
async function setRelay(schoolId, ev, g, mark){
  if (IX.flagsMissing) { IX.msg = {kind:"err", text:"Run supabase/migrations/003_scouting_not_returning.sql in Supabase first."}; render(); return; }
  const m = mark ? parseMark(ev, mark) : {ok:true};
  if (mark && (!m.ok || m.value==null)) { IX.msg = {kind:"err", text:`"${mark}" isn't a time I can read.`}; render(); return; }
  const old = relayFlag(schoolId, ev, g); if (old) await SB.from("athlete_flags").delete().eq("id", old.id);
  const {data, error} = await SB.from("athlete_flags").insert({school_id:schoolId, athlete:`${schoolName(schoolId)} ${evLabel(ev)} (${g==="G"?"girls":"boys"})`, athlete_key:nk(relayKey(ev,g)), status:"relay", adj_mark:mark||null, created_by:coachEmail}).select().single();
  if (error) { IX.msg = {kind:"err", text:error.message}; } else { IX.flags = (IX.flags||[]).filter(f=>f!==old).concat([data]); IX.msg = {kind:"ok", text: mark ? `Relay set to ${mark}.` : "Relay dropped from the projection."}; }
  IX.d.radj = null; render();
}
async function noteGone(id, note){ const f = IX.flags.find(x=>x.id===id); if (!f) return; f.note = note; await SB.from("athlete_flags").update({note}).eq("id", id); }
// Grade for results that didn't list one: the same kid's grade at another meet
let GRADE_FILL = null;
function gradeOf(r){
  if (r.grade) return r.grade;
  if (!GRADE_FILL) { GRADE_FILL = new Map(); (IX.all||[]).forEach(x=>{ if (x.grade && !x.relay) { const k = x.school_id+"|"+nk(x.athlete); GRADE_FILL.set(k, Math.max(GRADE_FILL.get(k)||0, x.grade)); } }); }
  return GRADE_FILL.get(r.school_id+"|"+nk(r.athlete)) || null;
}
const onRoster = name => { const k = nk(name).split(" "); return ATHLETES.some(a=>{ if (a.level!=="HS") return false; const n = nk(a.fullName||a.name).split(" "); return n.join(" ")===k.join(" ") || (n[0]===k[0] && n[n.length-1]===k[k.length-1]); }); };
let USE_GOALS = false;
function entrants(ev, g, schoolIds, grad){
  const bc = bcSchool(), best = new Map(), goalKeys = new Set();
  const put = (key, o) => { const cur = best.get(key); if (!cur || better(ev, o.v, cur.v)) best.set(key, o); };
  (IX.all||[]).forEach(r => {
    if (r.event!==ev || r.gender!==g || r.mark_value==null || !schoolIds.includes(r.school_id)) return;
    const gr = r.relay ? null : gradeOf(r);
    if (grad && gr===12) return;                                       // graduated
    if (grad && !r.relay && isGone(r.school_id, r.athlete)) return;    // marked not returning
    if (grad && bc && r.school_id===bc.id && !r.relay && !(r.bc_athlete_id ? ATHLETES.some(a=>a.id===r.bc_athlete_id) : onRoster(r.athlete))) return;   // not on this year's roster
    if (r.relay && grad) { const rf = relayFlag(r.school_id, ev, g); if (rf) return; }   // replaced by the coach's adjustment below
    const key = r.relay ? "R|"+r.school_id : r.school_id+"|"+nk(r.athlete);
    if (USE_GOALS && bc && r.school_id===bc.id && !r.relay) { const a = ATHLETES.find(a=>a.id===r.bc_athlete_id) || null; if (a && a.goals && a.goals[ev]) return; }
    put(key, {v:+r.mark_value, who:r.relay ? "Relay" : r.athlete, school:r.school_id, grade: gr ? (grad ? gr+1 : gr) : null, bc: bc && r.school_id===bc.id, src:"2026"});
  });
  // coach-adjusted relays
  if (grad && /^4x/.test(ev)) (IX.flags||[]).filter(f=>f.status==="relay" && f.athlete_key===nk(relayKey(ev,g)) && schoolIds.includes(f.school_id) && f.adj_mark).forEach(f => {
    const m = parseMark(ev, f.adj_mark); if (m.ok && m.value!=null) put("R|"+f.school_id, {v:m.value, who:"Relay", school:f.school_id, grade:null, bc: bc && f.school_id===bc.id, src:"adjusted", adj:true});
  });
  // goals: when "Use goals" is on, a kid's goal stands in for their mark (even for events they haven't run)
  if (USE_GOALS && bc && schoolIds.includes(bc.id) && !/^4x/.test(ev)) ATHLETES.filter(a=>a.level==="HS" && a.g===g && a.goals && a.goals[ev]).forEach(a => {
    const m = parseMark(ev, a.goals[ev]); if (!m.ok || m.value==null) return;
    goalKeys.add(bc.id+"|"+nk(a.fullName||a.name));
    best.set(bc.id+"|"+nk(a.fullName||a.name), {v:m.value, who:a.name, school:bc.id, grade:a.grade, bc:true, id:a.id, src:"goal", goal:true});
  });
  // our current roster's PRs (covers new kids and marks from meets we didn't import)
  if (bc && schoolIds.includes(bc.id) && !/^4x/.test(ev)) ATHLETES.filter(a=>a.level==="HS" && a.g===g && a.prs && a.prs[ev]).forEach(a => {
    const m = parseMark(ev, a.prs[ev]); if (!m.ok || m.value==null) return;
    if (goalKeys.has(bc.id+"|"+nk(a.fullName||a.name))) return;
    put(bc.id+"|"+nk(a.fullName||a.name), {v:m.value, who:a.name, school:bc.id, grade:a.grade, bc:true, id:a.id, src:"PR"});
  });
  return [...best.values()].sort((a,b)=> LOWER(ev) ? a.v-b.v : b.v-a.v);
}
function projectEvent(ev, g, schoolIds, sc, entries, grad){
  const relay = /^4x/.test(ev), pts = relay ? (sc.relay||sc.ind) : sc.ind, cap = relay ? 1 : entries;
  const per = {}, field = [];
  entrants(ev, g, schoolIds, grad).forEach(e => { per[e.school] = (per[e.school]||0)+1; if (per[e.school] <= cap) field.push(e); });
  field.forEach((e,i)=>{ e.place = i+1; e.pts = pts[i]||0; });
  return {ev, field, pts, scoring: pts.length};
}
function dashData(m, g, grad, entries){ return analyze(evFor(g).map(ev => projectEvent(ev, g, m.schools, m.sc, entries, grad)), m); }
function analyze(evs, m){
  const team = {}; m.schools.forEach(s=>team[s]=0);
  evs.forEach(e => e.field.forEach(x => team[x.school] = (team[x.school]||0) + x.pts));
  const bc = bcSchool(), opps = [], open = [];
  evs.forEach(e => {
    const scorers = e.field.filter(x=>x.pts>0).length;
    if (scorers < e.scoring) open.push({ev:e.ev, spots:e.scoring-scorers, bcIn:e.field.some(x=>x.bc)});
    e.field.forEach((x,i) => { if (!x.bc || i===0) return;
      const ahead = e.field[i-1]; if (ahead.bc) return;
      const gain = (e.pts[i-1]||0) - (e.pts[i]||0); if (gain<=0) return;
      const gap = Math.abs(ahead.v - x.v), pct = gap / ahead.v * 100;
      opps.push({ev:e.ev, x, ahead, gain, gap, pct}); });
    // BC kid just outside the scoring places
    const outIdx = e.field.findIndex((x,i)=>x.bc && i>=e.scoring);
    if (outIdx>0 && e.scoring>0 && outIdx===e.scoring) { const last = e.field[e.scoring-1]; if (!last.bc) { const x = e.field[outIdx], gap = Math.abs(last.v-x.v);
      opps.push({ev:e.ev, x, ahead:last, gain:e.pts[e.scoring-1]||0, gap, pct: gap/last.v*100}); } }
  });
  const seenO = new Set(); const uniq = opps.filter(o=>{ const k = o.ev+"|"+o.x.who+"|"+o.ahead.who; if (seenO.has(k)) return false; seenO.add(k); return true; });
  opps.length = 0; opps.push(...uniq);
  opps.sort((a,b)=> (a.pct+0.05)/a.gain - (b.pct+0.05)/b.gain);
  return {evs, team, opps, open, bc};
}

/* ---------- Phase 5: lineup optimizer + "Ways to steal points" ----------
   Opponents enter their best (up to the per-school entry cap). BC kids are placed to score the most team points,
   with each kid limited to N individual events (relays are kept as projected, outside the limit). */
const EV_GROUP = ev => /^4x/.test(ev) ? "Relays" : ["100","200","100H","110H","300H"].includes(ev) ? "Sprints & hurdles" : ev==="400" ? "Sprints & hurdles" : ["800","1600","3200"].includes(ev) ? "Distance" : ["HJ","LJ","PV"].includes(ev) ? "Jumps" : "Throws";
// realistic gain on rivals per week of training, % of the mark (rivals improve too, so this is the relative edge)
const RATE = ev => ["100","200"].includes(ev) ? 0.05 : ["100H","110H","300H","400"].includes(ev) ? 0.10 : ["800","1600","3200"].includes(ev) ? 0.12 : ["HJ","LJ","PV"].includes(ev) ? 0.15 : ["SP","DT"].includes(ev) ? 0.25 : 0.08;
const CAP = ev => ["100","200"].includes(ev) ? 1.5 : ["SP","DT"].includes(ev) ? 6 : 4;
function feasibility(ev, pct, weeks){
  const room = Math.min(CAP(ev), RATE(ev) * Math.max(weeks, 0));
  if (pct <= 0.0001) return {tag:"Tiebreak", k:0};
  if (pct <= room*0.5) return {tag:"Realistic", k:1};
  if (pct <= room) return {tag:"Stretch", k:2};
  return {tag:"Long shot", k:3};
}
function bcCandidates(ev, g, m, grad){
  const bc = bcSchool(); if (!bc) return [];
  const rid = name => { const k = nk(name).split(" "); const a = ATHLETES.find(a=>{ if (a.level!=="HS") return false; const n = nk(a.fullName||a.name).split(" "); return n.join(" ")===k.join(" ") || (n[0]===k[0] && n[n.length-1]===k[k.length-1]); }); return a ? a.id : null; };
  const list = entrants(ev, g, [bc.id], grad).filter(x=>x.bc).map(x=>{ const id = x.id || rid(x.who); return {...x, id, key: id || nk(x.who)}; });
  // distance kids in a distance event they haven't run: estimate from their VDOT (Daniels equivalence)
  if (["800","1600","3200"].includes(ev) && typeof athleteVdot==="function" && typeof raceSec==="function") {
    ATHLETES.filter(a=>a.level==="HS" && a.g===g && (a.cats.includes("Distance")||a.cats.includes("Mid Distance")) && !list.some(x=>x.key===a.id || x.key===nk(a.name))).forEach(a => {
      if (USE_GOALS && a.goals && a.goals[ev]) return;
      const b = athleteVdot(a); const r = b && raceSec(a, b, ev); if (!r || !isFinite(r.s)) return;
      list.push({v:r.s, who:a.name, school:bc.id, grade:a.grade, bc:true, id:a.id, key:a.id, src:"est.", est:true});
    });
  }
  return list;
}
function placeField(ev, opp, mine, pts){
  const field = [...opp, ...mine].sort((a,b)=> LOWER(ev) ? a.v-b.v : b.v-a.v).map(x=>({...x}));
  field.forEach((x,i)=>{ x.place = i+1; x.pts = pts[i]||0; });
  return field;
}
function optimize(m, g, grad, entries, perKid){
  const bc = bcSchool(); const evs = evFor(g);
  const ind = evs.filter(ev=>!/^4x/.test(ev)), rel = evs.filter(ev=>/^4x/.test(ev));
  const opp = {}, cand = {}, pts = m.sc.ind;
  ind.forEach(ev => { const per = {}; opp[ev] = entrants(ev, g, m.schools.filter(s=>!bc || s!==bc.id), grad).filter(x=>{ per[x.school]=(per[x.school]||0)+1; return per[x.school] <= entries; }); cand[ev] = bcCandidates(ev, g, m, grad); });
  const evPts = (ev, mine) => placeField(ev, opp[ev], mine, pts).filter(x=>x.bc).reduce((a,x)=>a+x.pts, 0);
  const pick = {}; ind.forEach(ev=>pick[ev]=[]);
  const load = k => ind.reduce((a,ev)=>a + (pick[ev].some(x=>x.key===k)?1:0), 0);
  const total = () => ind.reduce((a,ev)=>a+evPts(ev, pick[ev]), 0);
  // greedy: keep adding the entry that adds the most points
  for (let guard=0; guard<200; guard++) {
    let best = null;
    ind.forEach(ev => { if (pick[ev].length >= entries) return; const base = evPts(ev, pick[ev]);
      cand[ev].forEach(c => { if (pick[ev].some(x=>x.key===c.key) || load(c.key) >= perKid) return;
        const gain = evPts(ev, [...pick[ev], c]) - base; if (gain > 0 && (!best || gain > best.gain || (gain===best.gain && !c.est && best.c.est))) best = {ev, c, gain}; }); });
    if (!best) break; pick[best.ev].push(best.c);
  }
  // swaps: try moving each kid's entry to a better event, or swapping in a different kid
  for (let round=0; round<6; round++) {
    let improved = false;
    for (const ev of ind) for (const cur of [...pick[ev]]) {
      const before = total();
      for (const ev2 of ind) for (const c of cand[ev2]) {
        if (ev2===ev && c.key===cur.key) continue;
        if (pick[ev2].some(x=>x.key===c.key)) continue;
        const keep = pick[ev]; pick[ev] = pick[ev].filter(x=>x!==cur);
        const fits = pick[ev2].length < entries && (load(c.key) < perKid);
        if (fits) { pick[ev2].push(c); if (total() > before + 1e-9) { improved = true; break; } pick[ev2].pop(); }
        pick[ev] = keep;
      }
      if (improved) break;
    }
    if (!improved) break;
  }
  const out = ind.map(ev => ({ev, field: placeField(ev, opp[ev], pick[ev], pts), pts, scoring: pts.length}))
    .concat(rel.map(ev => projectEvent(ev, g, m.schools, m.sc, entries, grad)));
  out.sort((a,b)=>evs.indexOf(a.ev)-evs.indexOf(b.ev));
  // lineup per kid
  const kids = {};
  out.forEach(e => e.field.filter(x=>x.bc && x.who!=="Relay").forEach(x => { const k = x.key||x.id||nk(x.who); (kids[k] = kids[k] || {who:x.who, id:x.id, evs:[], pts:0}); kids[k].evs.push({ev:e.ev, place:x.place, pts:x.pts, est:x.est, goal:x.goal, v:x.v}); kids[k].pts += x.pts; }));
  // kids with marks who didn't make the lineup
  const benched = {}; ind.forEach(ev => cand[ev].filter(c=>!c.est && !kids[c.key]).forEach(c => { (benched[c.key] = benched[c.key] || {who:c.who, evs:[]}).evs.push(ev); }));
  return {evs: out, kids: Object.values(kids).sort((a,b)=>b.pts-a.pts), benched: Object.values(benched)};
}
function weeksTo(dateStr){ return Math.max(0, Math.round((new Date(dateStr+"T12:00") - today)/ (7*864e5))); }
// Plain-English plan, built from the numbers
let USE_GOALS_VIEW = false;
function briefHTML(m, g, A, O, naiveBC){
  const bcId = A.bc && A.bc.id; if (!bcId) return "";
  const teams = Object.entries(A.team).map(([s,v])=>[+s, v]).sort((a,b)=>b[1]-a[1]);
  const rank = teams.findIndex(t=>t[0]===bcId)+1, mine = A.team[bcId]||0;
  const leader = teams[0], ahead = rank>1 ? teams[rank-2] : null, behind = teams[rank] || null;
  const weeks = weeksTo(m.date), sN = id => schoolName(id);
  const target = rank===1 ? (behind && behind[0]) : leader[0];
  const need = rank===1 ? 0 : leader[1] - mine + 0.5;
  // levers: pass-ups, valued as the swing against the team we're chasing (or holding off)
  const levers = [];
  A.evs.forEach(e => e.field.forEach((x,i) => {
    if (!x.bc || x.who==="Relay" && !/^4x/.test(e.ev)) return;
    for (let j=i-1; j>=Math.max(0,i-2); j--) {
      const y = e.field[j]; if (y.bc) break;
      const gain = (e.pts[j]||0) - (x.pts||0); if (gain<=0) continue;
      // everyone from j..i-1 drops one place
      let theirLoss = 0; for (let k=j;k<i;k++) if (e.field[k].school===target) theirLoss += (e.pts[k]||0) - (e.pts[k+1]||0);
      const gap = Math.abs(y.v - x.v), pct = gap / y.v * 100, f = feasibility(e.ev, pct, weeks);
      levers.push({ev:e.ev, x, y, places:i-j, gain, swing: gain + theirLoss, gap, pct, f});
    }
  }));
  levers.sort((a,b)=> a.f.k - b.f.k || (b.swing/(a.pct+0.3)) - (a.swing/(b.pct+0.3)) );
  const usable = levers.filter(l=>l.f.k<=2);
  // pick a set of levers (one per kid per event) until the gap is covered
  let sum = 0; const plan = []; const used = new Set();
  for (const l of usable) { const k = l.ev+"|"+l.x.who; if (used.has(k)) continue; used.add(k); plan.push(l); sum += l.swing; if (rank>1 && sum >= need) break; if (plan.length>=8) break; }
  const open = A.open.filter(o=>!o.bcIn);
  const groups = {}; plan.forEach(l => { const gname = EV_GROUP(l.ev); groups[gname] = (groups[gname]||0) + l.swing; });
  const topGroups = Object.entries(groups).sort((a,b)=>b[1]-a[1]);
  const overLimit = O ? null : null;
  const when = weeks>16 ? `${weeks} weeks out: lots of time. Most of these gains come from training, so build them into the season plan now.` : weeks>6 ? `${weeks} weeks out: in season. Target the specific kids and events below in practice and test them at regular-season meets.` : weeks>0 ? `${weeks} week${weeks===1?"":"s"} out: fitness is mostly set. Points now come from the lineup, relays, and execution.` : "This meet has passed.";
  const head = rank===1
    ? `<b>Projected 1st</b> with ${mine%1?mine.toFixed(1):mine}, ${behind ? `${(mine-behind[1]).toFixed(1).replace(/\.0$/,"")} ahead of ${esc(sN(behind[0]))}` : ""}. The goal is holding the lead.`
    : `<b>Projected ${rank}${["st","nd","rd"][rank-1]||"th"}</b> with ${mine%1?mine.toFixed(1):mine}. <b>${need.toFixed(1).replace(/\.0$/,"").replace(/\.5$/,"½")} points</b> from beating ${esc(sN(leader[0]))}${ahead && ahead[0]!==leader[0] ? ` (${(ahead[1]-mine).toFixed(1).replace(/\.0$/,"")} from ${esc(sN(ahead[0]))})` : ""}.`;
  const lev = l => `<li><b>${esc(evLabel(l.ev))}</b>: ${/^4x/.test(l.ev) ? `our relay moves from ${l.x.place}${["st","nd","rd"][l.x.place-1]||"th"} past ${esc(sN(l.y.school))}` : `${esc(l.x.who)} ${l.x.est?"(est.) ":""}moves from ${l.x.place}${["st","nd","rd"][l.x.place-1]||"th"} past ${esc(l.y.who)} (${esc(sN(l.y.school))})`} by finding <b>${esc(gapTxt(l.ev, l.gap))}</b>${l.pct>0?` (${l.pct.toFixed(1)}%)`:""}. <b>+${l.gain}</b>${l.swing>l.gain?`, a <b>${l.swing}-point swing</b> vs ${esc(sN(target))}`:""}. <span class="ix-pill ${l.f.k<=1?"ok":l.f.k===2?"new":"err"}">${l.f.tag}</span></li>`;
  return `<div class="panel brief"><div class="bar"><h2>Ways to steal points</h2><button type="button" class="btn sm" onclick="IX.copyBrief()">Copy for Claude</button></div>
    <p style="margin:0 0 6px">${head}</p>
    <p class="note" style="margin:0 0 10px">${esc(when)}${USE_GOALS_VIEW ? " This view uses our kids' goal marks." : ""}</p>
    ${O && O.gain>0 ? `<p style="margin:0 0 10px">📋 <b>Lineup:</b> putting kids in their best events (below) is worth <b>+${O.gain%1?O.gain.toFixed(1):O.gain}</b> over everyone running everything they have a mark in.${O.notes.length?" "+O.notes.map(esc).join(" "):""}</p>` : ""}
    ${plan.length ? `<p style="margin:0"><b>${rank>1 ? (sum>=need ? "A path to the win" : "Biggest moves") : "Where to add cushion"}</b>${rank>1 && sum>=need ? ` (together about +${sum%1?sum.toFixed(1):sum} vs ${esc(sN(target))}, enough to pass them)` : ""}:</p><ol class="dash-list">${plan.map(lev).join("")}</ol>` : `<p class="note" style="margin:0">No realistic single pass-ups found. Look at the lineup and open spots.</p>`}
    ${open.length ? `<p style="margin:10px 0 0">🎯 <b>Coverage:</b> nobody from BC in ${open.map(o=>`${esc(evLabel(o.ev))} (${o.spots} open spot${o.spots===1?"":"s"})`).join(", ")}. Any kid who finishes there scores. Worth finding a body.</p>` : ""}
    ${topGroups.length ? `<p style="margin:10px 0 0">🏋️ <b>Training focus:</b> ${topGroups.map(([gname,v])=>`${esc(gname)} (+${v%1?v.toFixed(1):v})`).join(" · ")}.</p>` : ""}
    <p class="note" style="margin:10px 0 0">Realistic/Stretch is based on how much a kid typically gains on rivals in the weeks left, with everyone else improving too. It's a guide, not a guarantee. Opponents' new kids won't show until they race.</p></div>`;
}

const gapTxt = (ev, gap) => FIELD.has(ev) ? (gap>=12 ? `${Math.floor(gap/12)}' ${(gap%12).toFixed(1)}"` : `${gap.toFixed(1)}"`) : (gap>=60 ? fmtMark(ev, gap) : gap.toFixed(2)+"s");
function goneHTML(){
  const fl = (IX.flags||[]).filter(f=>f.status==="gone"||f.status==="relay"), q = IX.d.q||"";
  let hits = [];
  if (q.trim().length >= 3) { const k = nk(q), seen = new Set();
    (IX.all||[]).forEach(r => { if (r.relay || !nk(r.athlete).includes(k)) return; const key = r.school_id+"|"+nk(r.athlete); if (seen.has(key) || isGone(r.school_id, r.athlete)) return; seen.add(key); hits.push(r); }); hits = hits.slice(0,8); }
  return `<details class="panel" ${IX.d.goneOpen?"open":""} ontoggle="IX.d.goneOpen=this.open"><summary><b>Not returning &amp; relay changes (${fl.length})</b> <span class="muted">· left out of or adjusted in the 2027 view. Tap ✕ next to a name, ✎ next to a relay, or search.</span></summary>
    ${IX.flagsMissing ? `<p class="ed-msg err" style="margin:8px 0 0">Run <b>supabase/migrations/003_scouting_not_returning.sql</b> in Supabase to turn this on.</p>` : ""}
    ${msgHTML(IX.msg)}
    ${fl.length ? `<div class="tbl" style="margin-top:8px"><table class="ix-tbl"><tbody>${fl.map(f=>`<tr><td><b>${esc(f.athlete)}</b>${f.status==="relay"?` <span class="ix-pill">${f.adj_mark?"relay → "+esc(f.adj_mark):"relay dropped"}</span>`:""}</td><td>${esc(schoolName(f.school_id))}</td>
      <td class="ix-edit"><input value="${esc(f.note||"")}" placeholder="why (optional)" onchange="IX.noteGone(${f.id}, this.value)"></td><td><button type="button" class="btn sm" onclick="IX.unGone(${f.id})">Undo</button></td></tr>`).join("")}</tbody></table></div>` : ""}
    <label class="ed-row ix" for="gq" style="margin-top:8px"><span>Find an athlete</span><input id="gq" type="text" value="${esc(q)}" placeholder="name, 3+ letters" oninput="IX.d.q=this.value;render();const e=document.getElementById('gq');e.focus();e.setSelectionRange(e.value.length,e.value.length)"></label>
    ${hits.length ? `<div style="display:flex;flex-wrap:wrap;gap:6px">${hits.map(r=>`<button type="button" class="btn sm" onclick="IX.markGone(${r.school_id}, ${esc(JSON.stringify(r.athlete))})">✕ ${esc(r.athlete)} · ${esc(schoolName(r.school_id))}</button>`).join("")}</div>` : ""}
  </details>`;
}
function dashView(){
  if (!IX.all) { setTimeout(ixAll, 0); return `<p class="note">Loading results…</p>`; }
  if (!IX.all.length) return `<div class="panel"><p style="margin:0">No results yet. Import some meets first.</p></div>`;
  const ms = scheduleMeets(), d = IX.d;
  let m = ms.find(x=>x.key===d.meet) || ms.find(x=>x.date >= iso(today)) || ms[0];
  if (!m) return `<div class="panel"><p style="margin:0">No HS meets on the schedule.</p></div>`;
  if (m.gOnly) d.g = m.gOnly;
  const entries = +d.entries || m.entries, perKid = +d.perKid || 3;
  const nGoals = ATHLETES.filter(a=>a.level==="HS" && a.g===d.g && a.goals && Object.keys(a.goals).some(k=>a.goals[k])).length;
  USE_GOALS = false; const Onow = optimize(m, d.g, d.grad, entries, perKid), Dnow = analyze(Onow.evs, m);
  USE_GOALS = true;  const Ogoal = nGoals ? optimize(m, d.g, d.grad, entries, perKid) : null, Dgoal = Ogoal ? analyze(Ogoal.evs, m) : null;
  USE_GOALS = false;
  const useG = d.useGoals && Ogoal;
  const O = useG ? Ogoal : Onow; O.gain = 0; O.notes = [];
  const D = useG ? Dgoal : Dnow;
  IX.lastBrief = {m, g:d.g, D, O, perKid, entries};
  const sName = id => schoolName(id), bcId = D.bc && D.bc.id;
  const teams = Object.entries(D.team).sort((a,b)=>b[1]-a[1]);
  const evRow = e => { const top = e.field.slice(0, Math.max(e.scoring, 3));
    const bcBest = e.field.find(x=>x.bc);
    return `<tr><td><b>${esc(evLabel(e.ev))}</b></td>
      <td class="wrap">${top.map(x=>`<div class="${x.bc?"dash-bc":""}"><span class="mono">${x.place}.</span> ${x.who==="Relay" && d.grad ? (IX.d.radj===e.ev+"|"+x.school ? `<span class="ix-edit"><input id="radj" style="width:80px" placeholder="new time" value="${esc((relayFlag(x.school,e.ev,d.g)||{}).adj_mark||"")}"></span><button type="button" class="btn sm primary" onclick="IX.setRelay(${x.school}, '${e.ev}', '${d.g}', document.getElementById('radj').value.trim())">Save</button><button type="button" class="btn sm" onclick="IX.setRelay(${x.school}, '${e.ev}', '${d.g}', '')">Drop relay</button><button type="button" class="btn sm" onclick="IX.d.radj=null;render()">Cancel</button> `
      : `<button type="button" class="dash-x" title="Adjust this relay" aria-label="Adjust ${esc(sName(x.school))} relay" onclick="IX.d.radj='${e.ev}|${x.school}';render()">✎</button>`) : ""}${!x.bc && x.who!=="Relay" && d.grad ? `<button type="button" class="dash-x" title="Mark ${esc(x.who)} not returning" aria-label="Mark ${esc(x.who)} not returning" onclick="IX.markGone(${x.school}, ${esc(JSON.stringify(x.who))})">✕</button>` : ""}${esc(x.who)}${x.grade?` <span class="muted">(${x.grade})</span>`:""} · ${esc(sName(x.school))} · <span class="mono">${esc(fmtMark(e.ev, x.v))}</span>${x.adj?` <span class="ix-pill">adjusted</span>`:""}${x.goal?` <span class="ix-pill ok">goal</span>`:""}${x.pts?` <b>${x.pts}</b>`:""}</div>`).join("")}</td>
      <td class="wrap">${bcBest ? `<b>${bcBest.place}${["st","nd","rd"][bcBest.place-1]||"th"}</b> · ${esc(bcBest.who)} <span class="mono">${esc(fmtMark(e.ev, bcBest.v))}</span>` : `<span class="muted">No BC mark</span>`}</td>
      <td class="mono">${e.field.filter(x=>x.bc).reduce((a,x)=>a+x.pts,0)||""}</td></tr>`; };
  return `<div class="panel ed ix"><div class="ix-grid">
      <label class="ed-row" for="dm"><span>Meet</span><select id="dm" onchange="IX.d.meet=this.value;IX.d.entries='';render()">${ms.map(x=>`<option value="${esc(x.key)}" ${x.key===m.key?"selected":""}>${esc(new Date(x.date+"T12:00").toLocaleDateString("en-US",{month:"short",day:"numeric"}))} · ${esc(x.name)}</option>`).join("")}</select></label>
      <div class="ed-row"><span>Gender</span>${m.gOnly ? `<b>${m.gOnly==="G"?"Girls":"Boys"}</b>` : segBtns(d.g,[["G","Girls"],["B","Boys"]],"(v=>{IX.d.g=v;render()})")}</div>
      <label class="ed-row" for="dk"><span>Individual events per kid</span><input id="dk" type="text" inputmode="numeric" value="${perKid}" oninput="IX.d.perKid=this.value" onchange="render()"></label>
      <label class="ed-row" for="de"><span>Entries per school</span><input id="de" type="text" inputmode="numeric" value="${entries}" oninput="IX.d.entries=this.value" onchange="render()"></label>
      <label class="ed-check" for="dug"><input id="dug" type="checkbox" ${d.useGoals?"checked":""} ${nGoals?"":"disabled"} onchange="IX.d.useGoals=this.checked;render()"> Use goals: BC kids at their goal marks ${nGoals?`(${nGoals} ${d.g==="G"?"girls":"boys"} have goals)`:"(no goals set yet: add them on Data Log)"}</label>
      <label class="ed-check" for="dg"><input id="dg" type="checkbox" ${d.grad?"checked":""} onchange="IX.d.grad=this.checked;render()"> 2027 view: last year's seniors removed, everyone a grade older</label></div>
      <p class="note" style="margin:0">Teams: ${m.schools.map(s=>esc(sName(s))).join(", ")}${m.missing.length?` · <b>No 2026 data for ${esc(m.missing.join(", "))}</b>`:""} · Scoring ${esc(m.sc.ind.join("-"))}${m.sc.relay&&m.sc.relay.join()!==m.sc.ind.join()?`, relays ${esc(m.sc.relay.join("-"))}`:""}${m.sc.inferred&&m.tmpl&&/assumed/.test(m.sc.basis||"")?" (assumed)":""}.
        Marks are each kid's best from last season, plus our current roster's PRs. BC kids are placed in the events that score the most, up to ${perKid} individual events each (Indiana's limit is 4 including relays; relays are counted separately here, so check with your AD). It's a projection, not a prediction.</p></div>
    ${(USE_GOALS_VIEW = !!useG, briefHTML(m, d.g, D, O))}
    <div class="cols">
      <div class="panel"><h2>Projected team scores</h2><div class="tbl"><table>${Dgoal?`<thead><tr><th></th><th></th><th>Now</th><th>At goals</th></tr></thead>`:""}<tbody>${(()=>{ const f = v => v%1?v.toFixed(1):v;
        const order = Object.entries((useG?Dgoal:Dnow).team).sort((a,b)=>b[1]-a[1]);
        return order.map(([s,v],i)=>`<tr class="${+s===bcId?"dash-bc":""}"><td>${i+1}</td><td><b>${esc(sName(+s))}</b></td><td class="mono">${f(Dnow.team[s]||0)}</td>${Dgoal?`<td class="mono">${f(Dgoal.team[s]||0)}${+s===bcId && Dgoal.team[s]!==Dnow.team[s]?` <b class="${Dgoal.team[s]>Dnow.team[s]?"ok":""}">(${Dgoal.team[s]>Dnow.team[s]?"+":""}${f(Dgoal.team[s]-Dnow.team[s])})</b>`:""}</td>`:""}</tr>`).join(""); })()}</tbody></table></div>
        ${Dgoal ? (()=>{ const r = Object.entries(Dgoal.team).sort((a,b)=>b[1]-a[1]).findIndex(t=>+t[0]===bcId)+1; return `<p class="note" style="margin:8px 0 0">If our kids hit their goals: <b>${r}${["st","nd","rd"][r-1]||"th"}</b>. Opponents stay at last season's marks.</p>`; })() : ""}</div>
      <div class="panel"><h2>Closest points to grab</h2>${D.opps.length ? `<ol class="dash-list">${D.opps.slice(0,8).map(o=>`<li><b>${esc(evLabel(o.ev))}</b>: ${esc(o.x.who)} (${o.x.place}${["st","nd","rd"][o.x.place-1]||"th"}, <span class="mono">${esc(fmtMark(o.ev,o.x.v))}</span>) ${o.gap<1e-6 ? `is <b>tied</b> with ${esc(sName(o.ahead.school))} (lost on misses/tiebreak).` : `is <b>${esc(gapTxt(o.ev,o.gap))}</b> behind ${esc(sName(o.ahead.school))}.`} Passing them is <b>+${o.gain}</b>.</li>`).join("")}</ol>` : `<p class="note" style="margin:0">No close calls found.</p>`}
        ${D.open.length ? `<p style="margin:10px 0 0"><b>Open scoring spots</b> (fewer entrants than places that score): ${D.open.map(o=>`${esc(evLabel(o.ev))} (${o.spots}${o.bcIn?"":", no BC entry"})`).join(" · ")}. An entry there scores just by finishing.</p>` : ""}</div></div>
    <div class="panel"><div class="bar"><h2>Best lineup for this meet</h2><span class="muted">BC ${(()=>{ const t = D.team[D.bc&&D.bc.id]||0; return t%1?t.toFixed(1):t; })()} pts</span></div>
      ${O.kids.length ? `<div class="tbl"><table class="ix-tbl"><thead><tr><th>Athlete</th><th>Events (projected place · pts)</th><th>Pts</th></tr></thead><tbody>
        ${O.kids.map(k=>`<tr><td><b>${k.id?`<a href="#a-${k.id}">${esc(k.who)}</a>`:esc(k.who)}</b></td><td class="wrap">${k.evs.map(e=>`<span class="lu-ev">${esc(evLabel(e.ev))}${e.est?` <span class="ix-pill new" title="Estimated from their other distance marks">est.</span>`:""}${e.goal?` <span class="ix-pill ok" title="Their goal mark">goal</span>`:""} · ${e.place}${["st","nd","rd"][e.place-1]||"th"}${e.pts?` · <b>${e.pts%1?e.pts.toFixed(1):e.pts}</b>`:""}</span>`).join("")}</td><td class="mono">${k.pts%1?k.pts.toFixed(1):k.pts}</td></tr>`).join("")}</tbody></table></div>` : `<p class="note" style="margin:0">No BC marks for this gender yet.</p>`}
      ${O.benched.length ? `<p class="note" style="margin:8px 0 0">Not in the scoring lineup (they don't change the points here, but could run for experience or as relay legs): ${O.benched.map(b=>`${esc(b.who)} (${b.evs.map(evLabel).map(esc).join(", ")})`).join(" · ")}.</p>` : ""}
      <p class="note" style="margin:6px 0 0"><b>est.</b> = a distance kid placed in a race they haven't run, using a time estimated from their other races. Worth a try at a regular-season meet before trusting it.</p></div>
    ${goneHTML()}
    <div class="tbl"><table class="ix-tbl"><thead><tr><th>Event</th><th>Projected top places</th><th>Our best</th><th>BC pts</th></tr></thead><tbody>${D.evs.map(evRow).join("")}</tbody></table></div>`;
}

function ixView(){
  if (!SB) return `<div class="panel"><p style="margin:0">Supabase isn't set up.</p></div>`;
  if (!IX.loaded && !IX.loading && !IX.err) setTimeout(()=>ixLoad(), 0);
  const tabs = [["dash","Dashboard"],["import","Import results"],["meets","Meets"],["results","Results"],["schools","Schools"]];
  const nRes = Object.values(IX.counts.meet||{}).reduce((a,b)=>a+b,0);
  const head = `<p class="lede" style="margin:0">Opponent results for scouting. <b>Coaches only</b>: nothing here is visible on the public Hub.</p>
    <div class="cols ${IX.tab==="dash"?"no-dash":""}"><div class="panel"><div class="ix-stat">${IX.meets.length}</div><div class="muted">meets</div></div><div class="panel"><div class="ix-stat">${nRes}</div><div class="muted">results</div></div><div class="panel"><div class="ix-stat">${IX.schools.length}</div><div class="muted">schools</div></div></div>
    <div class="seg ix-tabs" role="group" aria-label="Scouting">${tabs.map(([k,l])=>`<button type="button" aria-pressed="${IX.tab===k}" onclick="IX.tab='${k}';IX.msg=null;render()">${l}</button>`).join("")}</div>`;
  if (IX.err) return head + `<div class="panel"><p style="margin:0" class="ed-msg err">${esc(IX.err)}</p><div class="ed-save"><button type="button" class="btn" onclick="IX.err='';IX.reload()">Try again</button></div></div>`;
  if (!IX.loaded) return head + `<p class="note">Loading scouting data…</p>`;
  const body = IX.tab==="dash" ? dashView() : IX.tab==="meets" ? msgHTML(IX.msg) + meetsView() : IX.tab==="results" ? resultsView() : IX.tab==="schools" ? schoolsView() : importView();
  return head + body;
}

async function copyBrief(){
  const b = IX.lastBrief; if (!b) return; const {m, g, D, O} = b, sN = id => schoolName(id);
  const teams = Object.entries(D.team).sort((x,y)=>y[1]-x[1]).map(([s,v])=>`${sN(+s)} ${v}`).join(", ");
  const lines = [`Meet: ${m.name} (${m.date}), ${g==="G"?"girls":"boys"}. Scoring ${m.sc.ind.join("-")}. Teams: ${m.schools.map(sN).join(", ")}.`,
    `Projected team scores: ${teams}.`, `BC lineup (max ${b.perKid} individual events each):`,
    ...O.kids.map(k=>`- ${k.who}: ${k.evs.map(e=>`${evLabel(e.ev)}${e.est?" (est.)":""} ${e.place}th ${e.pts}pts ${fmtMark(e.ev,e.v)}`).join("; ")}`),
    `Events (projected top places):`, ...D.evs.map(e=>`- ${evLabel(e.ev)}: ${e.field.slice(0, e.scoring+1).map(x=>`${x.place}. ${x.who} (${sN(x.school)}) ${fmtMark(e.ev,x.v)}`).join("; ")}`),
    `Question: what's our best plan to win this meet?`];
  try { await navigator.clipboard.writeText(lines.join("\n")); IX.msg = {kind:"ok", text:"Copied. Paste it into a chat with Claude."}; }
  catch(e) { IX.msg = {kind:"err", text:"Couldn't copy automatically. Your browser blocked it."}; }
  render();
}
Object.assign(IX, {copyBrief, markGone, unGone, setRelay, noteGone, view:ixView, reload:()=>ixLoad(true), preview:()=>{ buildPreview(); render(); }, save:ixSave, loadResults:ixResults, fix:ixFix, delResult:ixDelResult,
  saveMeet:ixSaveMeet, delMeet:ixDelMeet, saveSchool:ixSaveSchool, doMerge:ixMerge, readFile, template:downloadTemplate,
  _test:{parsePasted, looksLikeCSV, normEvent, normGender, parseMark, parseCSV, mapHeader, inferScoring, fmtMark}});
if (typeof render === "function") render();
})();
