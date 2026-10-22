import readline from 'node:readline'

const samples = new Map()
for await (const line of readline.createInterface({ input: process.stdin })) {
  const marker = line.indexOf('LAGO_VITAL ')
  if (marker < 0) continue
  try {
    const metric = JSON.parse(line.slice(marker + 11))
    const key = `${metric.device}/${metric.group}/${metric.name}`
    if (!Number.isFinite(metric.value)) continue
    const values = samples.get(key) || []
    values.push(metric.value)
    samples.set(key, values)
  } catch { /* Ignore unrelated/malformed log lines. */ }
}
console.log(JSON.stringify([...samples].map(([key, values]) => {
  values.sort((a,b) => a-b)
  return { key, count: values.length, p75: values.length >= 100 ? values[Math.ceil(values.length * 0.75)-1] : null, note: values.length >= 100 ? 'Sampled visitor observations; inspect time window and representativeness.' : 'Insufficient observations; do not claim a field percentile.' }
}), null, 2))
