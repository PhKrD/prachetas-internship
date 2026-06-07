import { studentsData } from '../src/data/studentsData.js'

const coreStudentSlugs = new Set(studentsData.map(s => s.slug))

const SLUG_MAPPING = {
  'amruta-shriramjwar-m9ah': 'amruta-shriramjwar',
  'amruta-shriramjwar': 'amruta-shriramjwar',
  'aryan-khairkhar-b1': 'aryan-khairkhar',
  'mukul-manohar-bhosale]': 'mukul-manohar-bhosale',
  'aman-khandelwal-k3mz': 'aman-khandelwal-k3mz',
}

// OLD logic
const oldNormalize = (slug) => {
  if (!slug) return slug
  if (SLUG_MAPPING[slug]) return SLUG_MAPPING[slug]
  if (coreStudentSlugs.has(slug)) return slug
  const stripped = slug.replace(/-[a-z0-9]+$/i, '')
  if (stripped !== slug && coreStudentSlugs.has(stripped)) return stripped
  return slug
}

// NEW logic - resolves prefix (first-name) AND suffix (random token) variants when UNAMBIGUOUS
const newNormalize = (slug) => {
  if (!slug) return slug
  if (SLUG_MAPPING[slug]) return SLUG_MAPPING[slug]
  if (coreStudentSlugs.has(slug)) return slug
  const matches = []
  for (const core of coreStudentSlugs) {
    if (slug.startsWith(core + '-')) matches.push(core)        // donation slug = canonical + extra suffix
    else if (core.startsWith(slug + '-')) matches.push(core)   // donation slug = leading part of canonical
  }
  if (matches.length === 1) return matches[0]
  return slug
}

const STATS_URL = `https://prachetasfoundation.com/.netlify/functions/student-stats?t=${Date.now()}`
const res = await fetch(STATS_URL).then(r => r.json())
const donors = res.donors || {}

console.log('=== Slugs whose resolution CHANGES between old and new logic ===')
let changeCount = 0
for (const slug of Object.keys(donors)) {
  const o = oldNormalize(slug)
  const n = newNormalize(slug)
  if (o !== n) {
    changeCount++
    const total = donors[slug].reduce((s, d) => s + (d.amount || 0), 0)
    console.log(`  "${slug}" (${donors[slug].length} donors, Rs ${total}):  OLD-> "${o}"   NEW-> "${n}"  ${coreStudentSlugs.has(n) ? '[MERGES INTO STUDENT]' : ''}`)
  }
}
if (changeCount === 0) console.log('  (none)')

console.log('\n=== Ambiguous prefix slugs left UNCHANGED (safety check) ===')
for (const slug of Object.keys(donors)) {
  if (coreStudentSlugs.has(slug) || SLUG_MAPPING[slug]) continue
  const matches = [...coreStudentSlugs].filter(core => slug.startsWith(core + '-') || core.startsWith(slug + '-'))
  if (matches.length > 1) {
    console.log(`  "${slug}" is ambiguous -> [${matches.join(', ')}] -> left as-is (safe)`)
  }
}

// Full pipeline simulation mirroring fetchData: per-donor normalize + merge w/ dedup,
// then confirmed-duplicate collapse.
console.log('\n=== Full pipeline simulation (merge + collapse) ===')
const sigOf = (d) => `${String(d.name || '').trim().toLowerCase()}|${Number(d.amount)}|${d.date}|${d.type}`
const DUPLICATE_DONATION_SUPPRESSIONS = {
  'nidhi-vishwakarma': [{ name: 'Santosh vishwakarma', amount: 2500, date: '2026-06-06', type: 'One-time' }],
}

const merged = {}
for (const [slug, donorList] of Object.entries(donors)) {
  const bySlug = {}
  for (const d of donorList) {
    const ns = newNormalize(slug)
    ;(bySlug[ns] = bySlug[ns] || []).push(d)
  }
  for (const [ns, list] of Object.entries(bySlug)) {
    if (!merged[ns]) { merged[ns] = [...list]; continue }
    const existing = merged[ns]
    const existingSig = new Set(existing.map(sigOf))
    for (const d of list) {
      const sig = sigOf(d)
      if (existingSig.has(sig)) continue
      existing.push(d); existingSig.add(sig)
    }
  }
}
// collapse confirmed duplicates
for (const slug of Object.keys(DUPLICATE_DONATION_SUPPRESSIONS)) {
  const list = merged[slug]; if (!list) continue
  const collapseSigs = new Set(DUPLICATE_DONATION_SUPPRESSIONS[slug].map(sigOf))
  const kept = new Set()
  merged[slug] = list.filter(d => {
    const sig = sigOf(d)
    if (!collapseSigs.has(sig)) return true
    if (kept.has(sig)) return false
    kept.add(sig); return true
  })
}
const nidhi = merged['nidhi-vishwakarma'] || []
console.log(`  FINAL nidhi-vishwakarma: ${nidhi.length} donors, Rs ${nidhi.reduce((s,d)=>s+d.amount,0)}`)
for (const d of nidhi) console.log(`     ${d.name} | Rs ${d.amount} | ${d.date}`)
