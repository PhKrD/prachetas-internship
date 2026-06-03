// Root-cause repair: scan Neon donations, find all referred_by values
// that don't match a canonical student slug, auto-map to the right slug,
// and UPDATE Neon. Also fix NULL referred_by for known payment IDs.

import { studentsData } from '../src/data/studentsData.js'

const NEON_API  = 'https://api.c-3.us-east-1.aws.neon.tech/sql'
const NEON_CONN = 'postgresql://neondb_owner:npg_4JGziLHbTnx5@ep-withered-block-ahmd8lhh-pooler.c-3.us-east-1.aws.neon.tech/neondb'
const STATS_URL = 'https://prachetasfoundation.com/.netlify/functions/student-stats'

const q = async (sql) => {
  const r = await fetch(NEON_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Neon-Connection-String': NEON_CONN },
    body: JSON.stringify({ query: sql, params: [] }),
  })
  const d = await r.json()
  if (d.message) throw new Error(d.message + ' | SQL: ' + sql)
  return d.rows || []
}

const esc = (s) => String(s).replace(/'/g, "''")

// Known payment_id -> slug overrides (handles NULL referred_by)
const PAYMENT_OVERRIDES = {
  pay_SsEQWRGPIRHLq8: 'aadya-shah',
  pay_SsHg1oiatK8TmM: 'aadya-shah',
  pay_SsHgloiatK8TmM: 'aadya-shah',
  pay_SrF4gAvJhBEHiC: 'aadya-shah',
  pay_SshXSSuHm9lyGu: 'chinmay-vikas-chavan',
  pay_St7UrIAgPTLJn0: 'parth-patil',
  pay_St7UrIAgPTLJnO: 'parth-patil',
  pay_Ssr6HIpnunImUE: 'aryan-khairkhar',
  pay_Srk4B6w59dVI8d: 'mukul-manohar-bhosale',
  pay_SsLxhIkLusDKsu: 'mukul-manohar-bhosale',
}

// === STEP 1: canonical slug set ===
const slugSet = new Set(studentsData.map(s => s.slug))
console.log(`Loaded ${slugSet.size} canonical student slugs`)

// === STEP 2: read current state ===
const refRows = await q(`
  SELECT referred_by, COUNT(*)::int AS cnt, COALESCE(SUM(amount::numeric),0)::numeric AS total
  FROM donations
  WHERE status = 'completed'
  GROUP BY referred_by
  ORDER BY total DESC NULLS LAST
`)

const matched = []
const unmatched = []
let nullRef = null
for (const r of refRows) {
  if (r.referred_by === null) { nullRef = r; continue }
  if (slugSet.has(r.referred_by)) matched.push(r)
  else unmatched.push(r)
}

console.log(`\nMatched referred_by (clean): ${matched.length}`)
console.log(`Unmatched referred_by (need fix): ${unmatched.length}`)
console.log(`NULL referred_by: ${nullRef ? `${nullRef.cnt} donations, Rs ${nullRef.total}` : 'none'}`)

// === STEP 3: auto-map each unmatched -> canonical slug ===
// Strategy: try prefix-of, then strip trailing non-alnum, then substring.
const findCanonical = (ref) => {
  const lc = ref.toLowerCase()
  // 1. exact after stripping trailing punctuation (']', '.', ',' etc.)
  const stripped = lc.replace(/[^a-z0-9-]+$/g, '')
  if (slugSet.has(stripped)) return stripped
  // 2. prefix match (longest wins): e.g. 'amruta-shriramjwar-m9ah' -> 'amruta-shriramjwar'
  const prefixes = [...slugSet].filter(s => lc.startsWith(s + '-') || lc.startsWith(s + ']'))
  if (prefixes.length) { prefixes.sort((a, b) => b.length - a.length); return prefixes[0] }
  // 3. last-resort: any canonical slug that the variant contains as substring
  const subs = [...slugSet].filter(s => lc.includes(s))
  if (subs.length === 1) return subs[0]
  if (subs.length > 1) { subs.sort((a, b) => b.length - a.length); return subs[0] }
  return null
}

const mapping = {}
const ambiguous = []
for (const r of unmatched) {
  const canon = findCanonical(r.referred_by)
  if (canon) mapping[r.referred_by] = canon
  else ambiguous.push(r)
}

console.log(`\n=== MAPPINGS TO APPLY (${Object.keys(mapping).length}) ===`)
for (const [from, to] of Object.entries(mapping)) {
  const r = unmatched.find(x => x.referred_by === from)
  console.log(`  '${from}'  ->  '${to}'   (${r.cnt} donations, Rs ${r.total})`)
}

if (ambiguous.length) {
  console.log(`\n=== UNMAPPABLE (need manual review) ===`)
  for (const r of ambiguous) console.log(`  '${r.referred_by}': ${r.cnt} donations, Rs ${r.total}`)
}

// === STEP 4: apply UPDATEs for variant slugs ===
console.log(`\n=== APPLYING SLUG FIXES ===`)
for (const [from, to] of Object.entries(mapping)) {
  await q(`UPDATE donations SET referred_by = '${esc(to)}' WHERE referred_by = '${esc(from)}' AND status = 'completed'`)
  console.log(`  Fixed referred_by '${from}' -> '${to}'`)
}

// === STEP 5: fix NULL referred_by for known payment_ids ===
console.log(`\n=== FIXING NULL referred_by VIA payment_id ===`)
for (const [pid, slug] of Object.entries(PAYMENT_OVERRIDES)) {
  const rows = await q(`UPDATE donations SET referred_by = '${esc(slug)}' WHERE payment_id = '${esc(pid)}' AND (referred_by IS NULL OR referred_by != '${esc(slug)}') AND status = 'completed' RETURNING payment_id`)
  if (rows.length > 0) console.log(`  payment_id='${pid}' set to '${slug}' (${rows.length} row(s))`)
}

// === STEP 6: verify ===
console.log(`\n=== VERIFICATION ===`)
const after = await q(`
  SELECT referred_by, COUNT(*)::int AS cnt, COALESCE(SUM(amount::numeric),0)::numeric AS total
  FROM donations
  WHERE status = 'completed'
  GROUP BY referred_by
  ORDER BY total DESC NULLS LAST
`)
const stillUnmatched = after.filter(r => r.referred_by && !slugSet.has(r.referred_by))
const stillNull = after.find(r => r.referred_by === null)

console.log(`Remaining unmatched referred_by: ${stillUnmatched.length}`)
for (const r of stillUnmatched) console.log(`  '${r.referred_by}': ${r.cnt} donations, Rs ${r.total}`)
console.log(`Remaining NULL referred_by: ${stillNull ? `${stillNull.cnt} donations, Rs ${stillNull.total} (these are direct/anonymous donations)` : 'none'}`)

// === STEP 7: compare per-student totals (Neon vs student-stats) ===
console.log(`\n=== STUDENT TOTALS: NEON vs student-stats ===`)
const neonTotals = new Map()
for (const r of after) {
  if (!r.referred_by) continue
  neonTotals.set(r.referred_by, Number(r.total))
}

const statsRes = await fetch(`${STATS_URL}?t=${Date.now()}`).then(r => r.json()).catch(() => null)
const stats = (statsRes && statsRes.stats) || {}

const mismatches = []
for (const s of studentsData) {
  const neon = neonTotals.get(s.slug) || 0
  const dash = (stats[s.slug] && Number(stats[s.slug].totalAmountCollected)) || 0
  if (Math.abs(neon - dash) > 0.01) mismatches.push({ name: s.name, slug: s.slug, neon, dash, diff: neon - dash })
}
mismatches.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))

console.log(`Students where Neon-truth differs from student-stats API: ${mismatches.length}`)
for (const m of mismatches) {
  console.log(`  ${m.name} (${m.slug}): Neon=Rs ${m.neon}, student-stats=Rs ${m.dash}, diff=Rs ${m.diff.toFixed(2)}`)
}
console.log(`\nNOTE: student-stats is a Netlify function with its own cache; differences should resolve on its next refresh of Neon. The dashboard pulls fresh data each load via ?t=now.`)
console.log(`\nDONE.`)
