// Deterministic lab medians and observed min/max; never estimates field percentiles.
import fs from 'node:fs'
import zlib from 'node:zlib'
const read = p => JSON.parse(p.endsWith('.gz') ? zlib.gunzipSync(fs.readFileSync(p)) : fs.readFileSync(p, 'utf8'))
const before = read(process.argv[2] || 'docs/performance/baseline-origin.json.gz')
const after = read(process.argv[3] || 'docs/performance/after-origin.json.gz')
const stats = xs => { const v = [...xs].sort((a,b)=>a-b); return { median: v[Math.floor(v.length/2)], min: v[0], max: v.at(-1), n: v.length } }
const metrics = ['lcpMs','cls','ttfbMs','domReadyMs','loadMs','transferredBytes','requests','longTaskCount','longTaskMs','labBlockingMs','domNodes']
const rows = []
for (const device of ['desktop','mobile']) for (const cache of ['cold','warm']) for (const route of [...new Set(before.results.map(r=>r.route))]) {
  const a = before.results.filter(r=>r.device===device&&r.cache===cache&&r.route===route)
  const b = after.results.filter(r=>r.device===device&&r.cache===cache&&r.route===route)
  if (a.length !== 3 || b.length !== 3) throw new Error(`Expected3 comparable runs ${device} ${cache} ${route}`)
  const values = Object.fromEntries(metrics.map(m=>[m,{before:stats(a.map(r=>r[m])),after:stats(b.map(r=>r[m]))}]))
  for (const type of ['Script','Stylesheet','Image','Font']) values[type+'Bytes'] = { before:stats(a.map(r=>r.bytesByType[type]||0)),after:stats(b.map(r=>r.bytesByType[type]||0)) }
  rows.push({device,cache,route,metrics:values})
}
const api = [...new Set(before.api.map(r=>r.route))].map(route=>({route,before:stats(before.api.filter(r=>r.route===route).map(r=>r.elapsedMs)),after:stats(after.api.filter(r=>r.route===route).map(r=>r.elapsedMs)),beforeStatus:before.api.filter(r=>r.route===route).map(r=>r.status),afterStatus:after.api.filter(r=>r.route===route).map(r=>r.status)}))
const interactionFiles=['docs/performance/baseline-interactions.json','docs/performance/after-interactions.json']
let interactions=[]
if(interactionFiles.every(f=>fs.existsSync(f))){const[a,b]=interactionFiles.map(read);interactions=['desktop','mobile'].map(device=>({device,metrics:Object.fromEntries(['loginTogglePaintProxyMs','navigationReadyMs','typingPaintProxyMs','searchTerminalResponseMs','initialCatalogueRequests','documents'].map(m=>[m,{before:stats(a.results.filter(r=>r.device===device).map(r=>r[m])),after:stats(b.results.filter(r=>r.device===device).map(r=>r[m]))}]))}))}
fs.writeFileSync('docs/performance/comparison.json',JSON.stringify({kind:'3-run laboratory medians and observed range; not field percentiles',beforeSource:before.sourceCommit,afterSource:after.sourceCommit,browser:after.browser,conditions:after.profiles,rows,api,interactions},null,2)+'\n')
let md='# Before/after laboratory results\n\nThree samples per cell, median [minimum–maximum]. Same simulated profiles and anonymous production-origin conditions; details/caveats in [README](README.md). Times are milliseconds; transfer weight includes response overhead. These are not field percentiles.\n\n'
for(const device of ['mobile','desktop']){
 md+=`## ${device} — cold browser cache\n\n| Route | LCP before → after (ms) | Transfer before → after (KiB) | Requests before → after | CLS before → after |\n| --- | --- | --- | --- | --- |\n`
 const fmt=(s,scale=1,d=0)=>`${(s.median/scale).toFixed(d)} [${(s.min/scale).toFixed(d)}–${(s.max/scale).toFixed(d)}]`
 for(const r of rows.filter(r=>r.device===device&&r.cache==='cold')){const m=r.metrics;md+=`| ${r.route} | ${fmt(m.lcpMs.before)} → ${fmt(m.lcpMs.after)} | ${fmt(m.transferredBytes.before,1024,1)} → ${fmt(m.transferredBytes.after,1024,1)} | ${fmt(m.requests.before)} → ${fmt(m.requests.after)} | ${fmt(m.cls.before,1,4)} → ${fmt(m.cls.after,1,4)} |\n`}
}
md+='\nFull warm/cold timings, TTFB, main-thread long tasks, payload types and API samples are in [comparison.json](comparison.json). Interaction event→paint proxies are not INP; store/search terminal500 timings are not successful catalog results.\n'
for(const r of interactions){md+=`\n### ${r.device} interactions\n\n| Metric | Before median [range] | After median [range] |\n| --- | --- | --- |\n`;for(const[k,v]of Object.entries(r.metrics)){const f=s=>`${s.median.toFixed(1)} [${s.min.toFixed(1)}–${s.max.toFixed(1)}]`;md+=`| ${k} | ${f(v.before)} | ${f(v.after)} |\n`}}
fs.writeFileSync('docs/performance/results.md',md)
console.log(md)
